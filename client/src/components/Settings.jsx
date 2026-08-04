import { useState } from 'react';

export default function Settings({ user, onLogout, settings, setSettings }) {
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  const toggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  const Toggle = ({ label, desc, value, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <p style={{ fontSize: '15px', fontWeight: '500', marginBottom: '2px' }}>{label}</p>
        {desc && <p style={{ fontSize: '12px', color: '#888' }}>{desc}</p>}
      </div>
      <button onClick={onChange} style={{ width: '44px', height: '24px', borderRadius: '12px', background: value ? '#2196f3' : '#666', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: value ? '22px' : '2px', transition: 'left 0.2s' }} />
      </button>
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '13px', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>{title}</h3>
      <div style={{ background: 'var(--card)', borderRadius: '8px', padding: '0 16px', border: '1px solid var(--border)' }}>
        {children}
      </div>
    </div>
  );

  const InfoPage = ({ title, content, onClose }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg)', zIndex: 10000, overflowY: 'auto' }}>
      <div style={{ position: 'sticky', top: 0, background: 'var(--card)', padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text)' }}>←</button>
        <h2 style={{ fontSize: '18px' }}>{title}</h2>
      </div>
      <div style={{ padding: '20px', fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>
        {content}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg)', zIndex: 9999, overflowY: 'auto' }}>
      <div style={{ position: 'sticky', top: 0, background: 'var(--card)', padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
        <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text)' }}>←</button>
        <h2 style={{ fontSize: '18px' }}>⚙️ Settings</h2>
      </div>

      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
        <Section title="App & Preferences">
          <Toggle label="🔔 Notifications" desc="Get notified about new uploads" value={settings.notifications} onChange={() => {
            toggle('notifications');
            if (!settings.notifications && 'Notification' in window) {
              Notification.requestPermission().then(p => {
                if (p === 'granted') new Notification('NaijaFlix', { body: '✅ Notifications enabled!' });
              });
            }
          }} />
          <Toggle label="🌍 Pidgin Mode" desc={settings.pidgin ? 'Currently: Pidgin English' : 'Currently: Standard English'} value={settings.pidgin} onChange={() => toggle('pidgin')} />
          <Toggle label="👨‍👩‍👧 Family Mode" desc="Hide mature content (Snapchat, Drama)" value={settings.familyMode} onChange={() => toggle('familyMode')} />
          <Toggle label="⬇️ Download in Background" desc="Browse while downloading" value={settings.bgDownload} onChange={() => toggle('bgDownload')} />
          <Toggle label="📱 Auto Miniplayer" desc="Keep video playing when you scroll" value={settings.miniplayer} onChange={() => toggle('miniplayer')} />
        </Section>

        <Section title="More Info & Support">
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setShowUpdate(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '15px', cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔄 Check for Update</span>
              <span style={{ fontSize: '12px', color: '#888' }}>v1.0.0</span>
            </button>
          </div>
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setShowAbout(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '15px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>ℹ️ About Us</button>
          </div>
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setShowPrivacy(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '15px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>🔒 Privacy Policy</button>
          </div>
          <div style={{ padding: '14px 0' }}>
            <button onClick={() => setShowTerms(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '15px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>📄 User Agreement</button>
          </div>
        </Section>

        {user && (
          <button onClick={onLogout} style={{ width: '100%', padding: '14px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
            🚪 Log Out @{user.username}
          </button>
        )}

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginTop: '20px' }}>NaijaFlix v1.0.0 © 2026</p>
      </div>

      {showAbout && <InfoPage title="About Us" onClose={() => setShowAbout(false)} content={
        <>
          <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>🎬 NaijaFlix</h3>
          <p style={{ marginBottom: '12px' }}>NaijaFlix is the home of Nollywood, Gospel, Comedy, and African entertainment. We bring you the best movies, church programs, music videos, and more — all in one place.</p>
          <p style={{ marginBottom: '12px' }}>Our mission is to make African content accessible to everyone, everywhere. Watch, download, and share your favorite videos for free.</p>
          <p style={{ marginBottom: '12px' }}>🎬 Nollywood • 🙏 Church Programs • 😂 Comedy • 🎤 Music Videos • 📱 Snapchat • 🎭 Drama</p>
          <p style={{ fontSize: '13px', color: '#888' }}>© 2026 NaijaFlix. All rights reserved.</p>
        </>
      } />}

      {showPrivacy && <InfoPage title="Privacy Policy" onClose={() => setShowPrivacy(false)} content={
        <>
          <p style={{ marginBottom: '12px' }}><b>1. Information We Collect</b><br />NaijaFlix stores your preferences (theme, language, watch history) locally in your browser. We do not collect personal data on our servers.</p>
          <p style={{ marginBottom: '12px' }}><b>2. How We Use Your Data</b><br />Your data stays in your browser. We use it to remember your settings and continue watching where you left off.</p>
          <p style={{ marginBottom: '12px' }}><b>3. Cookies & Storage</b><br />We use browser localStorage to save your preferences. No tracking cookies are used.</p>
          <p style={{ marginBottom: '12px' }}><b>4. Third-Party Services</b><br />Videos are stored on Cloudflare R2. Your viewing data is not shared with third parties.</p>
          <p style={{ marginBottom: '12px' }}><b>5. Your Rights</b><br />You can clear all your data by logging out or clearing your browser data.</p>
          <p style={{ fontSize: '13px', color: '#888' }}>Last updated: August 2026</p>
        </>
      } />}

      {showTerms && <InfoPage title="User Agreement" onClose={() => setShowTerms(false)} content={
        <>
          <p style={{ marginBottom: '12px' }}><b>1. Acceptance</b><br />By using NaijaFlix, you agree to these terms.</p>
          <p style={{ marginBottom: '12px' }}><b>2. Content</b><br />All videos on NaijaFlix are uploaded by the admin. Users can request movies and report inappropriate content.</p>
          <p style={{ marginBottom: '12px' }}><b>3. User Conduct</b><br />Do not spam, abuse, or upload inappropriate content. Reports are reviewed by the admin.</p>
          <p style={{ marginBottom: '12px' }}><b>4. Downloads</b><br />Downloaded videos are for personal use only. Do not redistribute.</p>
          <p style={{ marginBottom: '12px' }}><b>5. Liability</b><br />NaijaFlix is not responsible for content uploaded by users. We review all content before it goes public.</p>
          <p style={{ marginBottom: '12px' }}><b>6. Changes</b><br />We may update these terms at any time.</p>
          <p style={{ fontSize: '13px', color: '#888' }}>Last updated: August 2026</p>
        </>
      } />}

      {showUpdate && <InfoPage title="Check for Update" onClose={() => setShowUpdate(false)} content={
        <>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>✅</p>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>You're up to date!</h3>
            <p style={{ color: '#888' }}>NaijaFlix v1.0.0</p>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '8px' }}>Last checked: {new Date().toLocaleString()}</p>
          </div>
        </>
      } />}
    </div>
  );
}
