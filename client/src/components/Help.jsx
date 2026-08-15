import { useState } from 'react';

const CONTACT_API = "https://naijaflix-contact.umoruanthony345.workers.dev";

export default function Help() {
  const [showHelp, setShowHelp] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const submitContact = async () => {
    if (!contactName.trim() || !contactMessage.trim()) {
      return alert("⚠️ Please enter your name and message");
    }
    setContactSending(true);
    try {
      const res = await fetch(`${CONTACT_API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
          type: "chat",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setContactSent(true);
        setContactName("");
        setContactEmail("");
        setContactMessage("");
        setTimeout(() => { setShowChat(false); setContactSent(false); }, 2500);
      } else {
        alert("❌ " + (data.error || "Failed to send message"));
      }
    } catch (err) {
      alert("❌ Failed to send message. Please try again.");
    }
    setContactSending(false);
  };

  return (
    <>
      <button className="theme-toggle" onClick={() => setShowHelp(true)} style={{ fontSize: "16px" }}>❓</button>

      {showHelp && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "var(--bg)", zIndex: 10000, overflowY: "auto" }}>
          <div style={{ position: "sticky", top: 0, background: "var(--card)", padding: "16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setShowHelp(false)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--text)" }}>←</button>
            <h2 style={{ fontSize: "18px" }}>❓ Help</h2>
          </div>
          <div style={{ padding: "24px 20px", maxWidth: "500px", margin: "0 auto" }}>
            <p style={{ fontSize: "15px", color: "#888", marginBottom: "28px", textAlign: "center" }}>Need help with NaijaFlix? Choose how you'd like to contact us below.</p>
            <button onClick={() => setShowCall(true)} style={{ width: "100%", padding: "20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", cursor: "pointer", marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px", textAlign: "left" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: "24px" }}>📞</span></div>
              <div><p style={{ fontSize: "17px", fontWeight: "600", color: "var(--text)", marginBottom: "2px" }}>Call Us</p><p style={{ fontSize: "13px", color: "#888" }}>Speak with our support team</p></div>
              <span style={{ marginLeft: "auto", fontSize: "20px", color: "#888" }}>›</span>
            </button>
            <button onClick={() => setShowChat(true)} style={{ width: "100%", padding: "20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", cursor: "pointer", marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px", textAlign: "left" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: "24px" }}>💬</span></div>
              <div><p style={{ fontSize: "17px", fontWeight: "600", color: "var(--text)", marginBottom: "2px" }}>Chat</p><p style={{ fontSize: "13px", color: "#888" }}>Send us a message</p></div>
              <span style={{ marginLeft: "auto", fontSize: "20px", color: "#888" }}>›</span>
            </button>
            <div style={{ marginTop: "24px", padding: "16px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>📧 Or reach us directly:</p>
              <p style={{ fontSize: "14px", color: "var(--text)" }}>✉️ umoruanthony345@gmail.com</p>
            </div>
          </div>
        </div>
      )}

      {showCall && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "var(--bg)", zIndex: 10001, overflowY: "auto" }}>
          <div style={{ position: "sticky", top: 0, background: "var(--card)", padding: "16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setShowCall(false)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--text)" }}>←</button>
            <h2 style={{ fontSize: "18px" }}>📞 Call Us</h2>
          </div>
          <div style={{ padding: "40px 20px", maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#4CAF50", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "40px" }}>📞</span></div>
            <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Call NaijaFlix Support</h3>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "28px" }}>Available Mon–Sat, 9am–6pm (WAT)</p>
            <a href="tel:+234 9122274678" style={{ display: "block", width: "100%", padding: "16px", background: "#4CAF50", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "600", fontSize: "17px", textDecoration: "none", marginBottom: "12px", boxSizing: "border-box" }}>📞 Call Now</a>
            <p style={{ fontSize: "15px", color: "var(--text)", marginTop: "12px", fontWeight: "600" }}>+234 9122274678</p>
            <p style={{ fontSize: "12px", color: "#888", marginTop: "16px" }}>Calling outside Nigeria? Use WhatsApp: +234 9122274678</p>
          </div>
        </div>
      )}

      {showChat && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "var(--bg)", zIndex: 10001, overflowY: "auto" }}>
          <div style={{ position: "sticky", top: 0, background: "var(--card)", padding: "16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setShowChat(false)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--text)" }}>←</button>
            <h2 style={{ fontSize: "18px" }}>💬 Chat with Us</h2>
          </div>
          <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
            {contactSent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontSize: "48px", marginBottom: "16px" }}>✅</p>
                <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Message Sent!</h3>
                <p style={{ color: "#888", fontSize: "14px" }}>We'll get back to you soon. Thank you for reaching out.</p>
              </div>
            ) : (
              <>
                <p style={{ marginBottom: "20px", fontSize: "14px", color: "#888" }}>Send us a message and we'll respond as soon as possible.</p>
                <div style={{ background: "var(--card)", borderRadius: "8px", padding: "20px", border: "1px solid var(--border)" }}>
                  <label style={{ fontSize: "13px", color: "#888", marginBottom: "6px", display: "block" }}>Your Name *</label>
                  <input type="text" placeholder="Enter your name" value={contactName} onChange={(e) => setContactName(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "16px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", boxSizing: "border-box", fontSize: "15px" }} />
                  <label style={{ fontSize: "13px", color: "#888", marginBottom: "6px", display: "block" }}>Email (optional)</label>
                  <input type="email" placeholder="your@email.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "16px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", boxSizing: "border-box", fontSize: "15px" }} />
                  <label style={{ fontSize: "13px", color: "#888", marginBottom: "6px", display: "block" }}>Message *</label>
                  <textarea placeholder="Type your message here..." value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} rows="5" style={{ width: "100%", padding: "12px", marginBottom: "20px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", boxSizing: "border-box", fontSize: "15px", resize: "vertical", fontFamily: "inherit" }} />
                  <button onClick={submitContact} disabled={contactSending} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "none", cursor: contactSending ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "15px", background: contactSending ? "#666" : "var(--red)", color: "white" }}>{contactSending ? "⏳ Sending..." : "📤 Send Message"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
