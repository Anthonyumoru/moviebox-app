import { useState } from 'react';
import { languages } from '../translations';

export default function Settings({ user, onLogout, settings, setSettings }) {
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [agreed, setAgreed] = useState(localStorage.getItem('creatorAgreed') === 'true');

  const toggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  const changeLanguage = (lang) => {
    const newSettings = { ...settings, lang };
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    setShowLanguages(false);
  };

  const acceptAgreement = () => {
    localStorage.setItem('creatorAgreed', 'true');
    localStorage.setItem('creatorAgreedDate', new Date().toISOString());
    setAgreed(true);
    alert('✅ Agreement accepted! You can now upload content to NaijaFlix.');
    setShowCreator(false);
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

  const currentLang = languages[settings.lang || 'en'] || languages.en;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg)', zIndex: 9999, overflowY: 'auto' }}>
      <div style={{ position: 'sticky', top: 0, background: 'var(--card)', padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
        <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text)' }}>←</button>
        <h2 style={{ fontSize: '18px' }}>⚙️ Settings</h2>
      </div>

      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
        <Section title="App & Preferences">
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setShowLanguages(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '15px', cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🌍 Language</span>
              <span style={{ fontSize: '13px', color: '#888' }}>{currentLang.flag} {currentLang.name}</span>
            </button>
          </div>
          <Toggle label="🔔 Notifications" desc="Get notified about new uploads" value={settings.notifications} onChange={() => {
            toggle('notifications');
            if (!settings.notifications && 'Notification' in window) {
              Notification.requestPermission().then(p => {
                if (p === 'granted') new Notification('NaijaFlix', { body: '✅ Notifications enabled!' });
              });
            }
          }} />
          <Toggle label="👨‍👩‍👧 Family Mode" desc="Hide mature content (Snapchat, Drama)" value={settings.familyMode} onChange={() => toggle('familyMode')} />
          <Toggle label="⬇️ Download in Background" desc="Browse while downloading" value={settings.bgDownload} onChange={() => toggle('bgDownload')} />
          <Toggle label="📱 Auto Miniplayer" desc="Keep video playing when you scroll" value={settings.miniplayer} onChange={() => toggle('miniplayer')} />
        </Section>

        <Section title="Creator & Legal">
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setShowCreator(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '15px', cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📋 Creator Agreement</span>
              {agreed ? <span style={{ fontSize: '12px', color: '#4caf50' }}>✓ Accepted</span> : <span style={{ fontSize: '12px', color: '#ff9800' }}>Required</span>}
            </button>
          </div>
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

      {showLanguages && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg)', zIndex: 10000, overflowY: 'auto' }}>
          <div style={{ position: 'sticky', top: 0, background: 'var(--card)', padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setShowLanguages(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text)' }}>←</button>
            <h2 style={{ fontSize: '18px' }}>🌍 Select Language</h2>
          </div>
          <div style={{ padding: '8px 0' }}>
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => changeLanguage(code)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                  padding: '16px 20px', background: 'transparent', border: 'none',
                  borderBottom: '1px solid var(--border)', cursor: 'pointer',
                  color: 'var(--text)', fontSize: '15px', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '24px' }}>{lang.flag}</span>
                <span>{lang.name}</span>
                {settings.lang === code && <span style={{ marginLeft: 'auto', color: 'var(--red)' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCreator && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg)', zIndex: 10000, overflowY: 'auto' }}>
          <div style={{ position: 'sticky', top: 0, background: 'var(--card)', padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setShowCreator(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text)' }}>←</button>
            <h2 style={{ fontSize: '18px' }}>📋 Creator Agreement</h2>
          </div>
          <div style={{ padding: '20px', fontSize: '14px', lineHeight: '1.6', color: 'var(--text)', maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', textAlign: 'center' }}>ANTHONY UMORU TECH SERVICES</h3>
            <p style={{ marginBottom: '16px', textAlign: 'center', color: '#888', fontSize: '13px' }}>DIGITAL CREATOR DISTRIBUTION AGREEMENT</p>

            <p style={{ marginBottom: '16px' }}>Welcome to NaijaFlix. By checking the "I Agree" box and uploading your content to our platform, you are entering into a legally binding non-exclusive agreement with ANTHONY UMORU TECH SERVICES (CAC BN: 9644551), located at 100, Gwagwalada, Kwali, Federal Capital Territory, Nigeria.</p>

            <p style={{ marginBottom: '12px' }}><b>1. NON-EXCLUSIVE DISTRIBUTION</b><br />You grant NaijaFlix the non-exclusive right to host, stream, and distribute your uploaded video content. You retain 100% ownership of your intellectual property. You have the absolute right to keep posting and monetizing the exact same videos on YouTube, TikTok, Facebook, and Instagram without restriction.</p>

            <p style={{ marginBottom: '12px' }}><b>2. REVENUE SHARING & ZERO-REVENUE CONDITION</b><br />We agree to split the Net Ad Revenue generated on NaijaFlix from your specific videos on a 50/50 basis. If your content does not generate any advertising revenue during a billing month due to low traffic, ad restrictions, or ad-blockers, Anthony Umoru Tech Services is under no financial obligation to pay you out of pocket. Your payout for that period will be ₦0.00.</p>

            <p style={{ marginBottom: '12px' }}><b>3. COPYRIGHT INDEMNITY & WARRANTIES</b><br />By submitting content, you warrant that you are the original owner or licensed distributor of the video, audio, and background music. Downloading other people's videos and re-uploading them to NaijaFlix is strictly prohibited under the Nigerian Copyright Act. You agree to hold Anthony Umoru Tech Services completely harmless from any copyright claims, lawsuits, or legal fees resulting from your uploads.</p>

            <p style={{ marginBottom: '12px' }}><b>4. TERMINATION</b><br />You can delete your content or cancel this agreement at any time by giving 30 days written notice via our support email. Your videos will be removed from our active servers within 7 business days. This agreement is governed by the laws of the Federal Republic of Nigeria.</p>

            {agreed ? (
              <div style={{ marginTop: '24px', padding: '16px', background: 'var(--card)', borderRadius: '8px', border: '1px solid #4caf50', textAlign: 'center' }}>
                <p style={{ color: '#4caf50', fontSize: '15px', fontWeight: '600' }}>✅ Agreement Accepted</p>
                <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Accepted on {new Date(localStorage.getItem('creatorAgreedDate')).toLocaleDateString()}</p>
              </div>
            ) : (
              <div style={{ marginTop: '24px', padding: '16px', background: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '16px' }}>
                  <input type="checkbox" onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: '3px', width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '14px' }}>I have read and agree to the Anthony Umoru Tech Services Non-Exclusive Distribution Agreement.</span>
                </label>
                <button
                  onClick={acceptAgreement}
                  disabled={!agreed}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                    cursor: agreed ? 'pointer' : 'not-allowed', fontWeight: '600', fontSize: '15px',
                    background: agreed ? 'var(--red)' : '#666', color: 'white',
                  }}
                >
                  {agreed ? '✅ I Agree - Sign Digitally' : 'Check the box to continue'}
                </button>
                <p style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '8px' }}>
                  By clicking "I Agree", your acceptance is timestamped and stored as a digital signature under Nigerian digital commerce laws.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
          <p style={{ marginBottom: '12px' }}><b>Last updated: August 4, 2026</b></p>
          <p style={{ marginBottom: '12px' }}>This Privacy Policy describes how NaijaFlix ("we", "us", or "our") collects, uses, and protects information when you use our platform. We are committed to protecting your privacy and complying with the Nigeria Data Protection Act (NDPA) and applicable international data protection laws.</p>
          <p style={{ marginBottom: '12px' }}><b>1. Information We Collect</b><br />We collect and store the following types of information:<br />• <b>Account Information:</b> Your username and password when you create an account. Passwords are stored locally in your browser.<br />• <b>Content Data:</b> Movie requests, comments, likes, and reports you submit.<br />• <b>Usage Data:</b> Your IP address, device type, browser type, and approximate location.<br />• <b>Preferences:</b> Theme settings, language preference, family mode, and watch history stored in your browser's localStorage.</p>
          <p style={{ marginBottom: '12px' }}><b>2. How We Use Your Information</b><br />We use your information to provide and maintain our service, display your username on comments and likes, remember your watch progress, respond to requests, prevent abuse, and improve user experience.</p>
          <p style={{ marginBottom: '12px' }}><b>3. Cookies and Local Storage</b><br />NaijaFlix uses browser localStorage to store preferences, watch history, login state, and settings. This data remains on your device. You can clear it anytime.</p>
          <p style={{ marginBottom: '12px' }}><b>4. Third-Party Advertising</b><br />We may use third-party advertising networks. These may use cookies to serve ads. You can opt out of personalized advertising via Google Ads Settings or AboutAds.info.</p>
          <p style={{ marginBottom: '12px' }}><b>5. Video Content and Hosting</b><br />All video content is stored on Cloudflare R2. Your viewing data is stored locally and not transmitted to our servers.</p>
          <p style={{ marginBottom: '12px' }}><b>6. Data Sharing</b><br />We do not sell or rent your personal information. We may share aggregated data with advertising partners.</p>
          <p style={{ marginBottom: '12px' }}><b>7. Children's Privacy</b><br />NaijaFlix is not directed to children under 13. Parents can enable Family Mode in Settings.</p>
          <p style={{ marginBottom: '12px' }}><b>8. Data Security</b><br />We use Cloudflare's security infrastructure including DDoS protection, SSL/TLS encryption, and secure API endpoints.</p>
          <p style={{ marginBottom: '12px' }}><b>9. Your Rights</b><br />You can access your data, clear it, request deletion, disable notifications, and enable Family Mode.</p>
          <p style={{ marginBottom: '12px' }}><b>10. Changes to This Policy</b><br />We may update this Privacy Policy at any time.</p>
          <p style={{ marginBottom: '12px' }}><b>11. Contact Us</b><br />Questions? Contact: umoruanthony345@gmail.com</p>
          <p style={{ fontSize: '13px', color: '#888' }}>Last updated: August 4, 2026</p>
        </>
      } />}

      {showTerms && <InfoPage title="User Agreement" onClose={() => setShowTerms(false)} content={
        <>
          <p style={{ marginBottom: '12px' }}><b>1. Acceptance</b><br />By using NaijaFlix, you agree to these terms.</p>
          <p style={{ marginBottom: '12px' }}><b>2. Content</b><br />All videos are uploaded by the admin. Users can request movies and report inappropriate content.</p>
          <p style={{ marginBottom: '12px' }}><b>3. User Conduct</b><br />Do not spam, abuse, or upload inappropriate content. Reports are reviewed by the admin.</p>
          <p style={{ marginBottom: '12px' }}><b>4. Downloads</b><br />Downloaded videos are for personal use only. Do not redistribute.</p>
          <p style={{ marginBottom: '12px' }}><b>5. Liability</b><br />NaijaFlix is not responsible for user-uploaded content. All content is reviewed before going public.</p>
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
