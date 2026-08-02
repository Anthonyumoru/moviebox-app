import { useEffect, useRef, useState } from "react";

export default function CastButton({ videoUrl, title }) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let interval;

    const initCast = () => {
      if (window.cast && window.cast.framework) {
        const context = window.cast.framework.CastContext.getInstance();
        context.setOptions({
          receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
          autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });

        context.addEventListener(
          window.cast.framework.CastContextEventType.CAST_STATE_CHANGED,
          (event) => {
            setIsConnected(event.castState === "CONNECTED");
          }
        );

        setIsAvailable(true);
        clearInterval(interval);
      }
    };

    interval = setInterval(initCast, 500);
    return () => clearInterval(interval);
  }, []);

  const handleCast = () => {
    if (!isAvailable) return;

    const context = window.cast.framework.CastContext.getInstance();
    context.requestSession().then(() => {
      const session = context.getCurrentSession();
      if (!session || !videoUrl) return;

      const mediaInfo = new window.chrome.cast.media.MediaInfo(videoUrl);
      mediaInfo.contentType = "video/mp4";
      mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
      mediaInfo.metadata.title = title || "MovieBox";

      const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
      session.loadMedia(request).catch((err) => console.error("Cast error:", err));
    }).catch((err) => console.error("Session error:", err));
  };

  if (!isAvailable) return null;

  return (
    <button
      onClick={handleCast}
      style={{
        padding: "8px 12px",
        background: isConnected ? "#4285F4" : "var(--card)",
        color: isConnected ? "white" : "var(--text)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
      }}
      title="Cast to TV"
    >
      {isConnected ? "📡 Casting" : "📺 Cast"}
    </button>
  );
}
