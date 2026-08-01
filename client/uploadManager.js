const SMALL_FILE_THRESHOLD = 100 * 1024 * 1024;
const CHUNK_SIZE = 8 * 1024 * 1024;
const MAX_PARALLEL = 3;
const MAX_RETRIES = 3;

function sanitizeFilename(name) {
  return name.replace(/[`''" #?\\]/g, "_");
}

export class UploadManager {
  constructor({ backendUrl } = {}) {
    this.backendUrl = backendUrl || "https://moviebox-backend.umoruanthony345.workers.dev";
    this.paused = false;
    this.aborted = false;
  }

  async upload(file, { onProgress, onComplete, onError } = {}) {
    this.aborted = false;
    this.paused = false;
    try {
      const publicUrl = file.size < SMALL_FILE_THRESHOLD
        ? await this._uploadSingle(file, onProgress)
        : await this._uploadMultipart(file, onProgress);
      if (onComplete) onComplete();
      return publicUrl;
    } catch (err) {
      if (onError) onError(err);
      else throw err;
    }
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; }
  abort() { this.aborted = true; }

  async _uploadSingle(file, onProgress) {
    const filename = sanitizeFilename(file.name);
    const contentType = file.type || "application/octet-stream";
    const uploadUrl = `${this.backendUrl}/api/upload/single?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(e.loaded, e.total);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          resolve(data.publicUrl);
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.onabort = () => reject(new Error("Upload aborted"));
      xhr.send(file);
    });
  }

  async _uploadMultipart(file, onProgress) {
    const initRes = await fetch(`${this.backendUrl}/api/upload/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: sanitizeFilename(file.name), contentType: file.type }),
    });
    const { key, uploadId, publicUrl } = await initRes.json();
    if (!uploadId) throw new Error("Failed to initiate multipart upload");

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const uploadedParts = [];
      let uploadedBytes = 0;

      for (let batchStart = 0; batchStart < totalChunks; batchStart += MAX_PARALLEL) {
        if (this.aborted) throw new Error("Upload aborted");
        while (this.paused) {
          await this._sleep(500);
          if (this.aborted) throw new Error("Upload aborted");
        }

        const batchEnd = Math.min(batchStart + MAX_PARALLEL, totalChunks);
        const batchPromises = [];
        for (let i = batchStart; i < batchEnd; i++) {
          batchPromises.push(this._uploadChunk(file, key, uploadId, i + 1));
        }

        const results = await Promise.all(batchPromises);
        for (const result of results) {
          uploadedParts.push(result.part);
          uploadedBytes += result.chunkSize;
          if (onProgress) onProgress(uploadedBytes, file.size);
        }
      }

      const completeRes = await fetch(`${this.backendUrl}/api/upload/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, uploadId, parts: uploadedParts }),
      });
      const completeData = await completeRes.json();
      if (!completeData.success) throw new Error("Failed to complete upload");
      return completeData.publicUrl || publicUrl;
    } catch (err) {
      await fetch(`${this.backendUrl}/api/upload/abort`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, uploadId }),
      }).catch(() => {});
      throw err;
    }
  }

  async _uploadChunk(file, key, uploadId, partNumber) {
    const start = (partNumber - 1) * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);
    const chunkSize = chunk.size;

    let lastErr;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (this.aborted) throw new Error("Upload aborted");
      try {
        const partUrl = `${this.backendUrl}/api/upload/part?key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${partNumber}`;

        const putRes = await fetch(partUrl, {
          method: "POST",
          body: chunk,
          headers: { "Content-Type": "application/octet-stream" },
        });

        if (!putRes.ok) throw new Error(`Part ${partNumber} failed: ${putRes.status}`);
        const data = await putRes.json();

        return { part: { partNumber, etag: data.etag }, chunkSize };
      } catch (err) {
        lastErr = err;
        await this._sleep(1000 * Math.pow(2, attempt));
      }
    }
    throw new Error(`Chunk ${partNumber} failed after ${MAX_RETRIES} retries: ${lastErr?.message}`);
  }

  _sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
}
