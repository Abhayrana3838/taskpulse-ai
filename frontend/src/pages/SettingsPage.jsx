import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative',
        background: checked ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
        transition: 'background 0.3s ease',
      }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2, left: checked ? 22 : 2,
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', bio: '', email: '' });
  const [settings, setSettings] = useState({ email_digest: true, push_alerts: true, team_activity: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setProfile({ name: user.name, bio: user.bio || '', email: user.email });
    api.get('/api/users/settings').then(res => setSettings({
      email_digest: res.data.email_digest,
      push_alerts: res.data.push_alerts,
      team_activity: res.data.team_activity
    })).catch(console.error);
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.put('/api/users/profile', profile),
        api.put('/api/users/settings', settings)
      ]);
      // Small delay to show "Saved" state
      setTimeout(() => setSaving(false), 800);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 className="headline-lg" style={{ marginBottom: 8 }}>Settings</h1>
          <p style={{ color: 'var(--on-surface-variant)' }}>Manage your account, notifications, and preferences.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleSave} disabled={saving}
          style={{
            padding: '10px 24px', background: 'linear-gradient(135deg,#0070f3,#6807ba)', border: 'none',
            borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer',
            opacity: saving ? 0.7 : 1, boxShadow: '0 0 20px rgba(0,112,243,0.3)',
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Profile Card */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass-card" style={{ padding: 32, borderRadius: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Profile Information</h3>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg,#0070f3,#6807ba)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: '#fff',
                marginBottom: 16, border: '4px solid var(--surface-container)'
              }}>
                {profile.name.charAt(0) || 'U'}
              </div>
              <button style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12, cursor: 'pointer' }}>Change Avatar</button>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 8, fontWeight: 600 }}>FULL NAME</label>
                <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: 8, color: '#fff', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 8, fontWeight: 600 }}>EMAIL ADDRESS (READ-ONLY)</label>
                <input value={profile.email} disabled style={{ width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: 8, color: 'var(--on-surface-variant)', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 8, fontWeight: 600 }}>BIO</label>
                <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} rows={3} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: 8, color: '#fff', fontSize: 14, resize: 'vertical' }} />
              </div>
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Notifications Card */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 32, borderRadius: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Notifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { id: 'email_digest', title: 'Email Digest', desc: 'Receive a daily summary of team activity and project updates.' },
                { id: 'push_alerts', title: 'Push Alerts', desc: 'Instant notifications for @mentions and high-priority tasks.' },
                { id: 'team_activity', title: 'Team Activity', desc: 'Get notified when members join or leave your projects.' }
              ].map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ maxWidth: 280 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 4 }}>{item.title}</h4>
                    <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{item.desc}</p>
                  </div>
                  <Toggle checked={settings[item.id]} onChange={(val) => setSettings({...settings, [item.id]: val})} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Connected Apps Card */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 32, borderRadius: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Connected Apps</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { name: 'GitHub', desc: 'Sync commits and PRs with tasks.', connected: true, icon: 'code' },
                { name: 'Slack', desc: 'Send channel notifications.', connected: false, icon: 'tag' },
                { name: 'Figma', desc: 'Link designs to projects.', connected: true, icon: 'draw' }
              ].map(app => (
                <div key={app.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{app.icon}</span>
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 600 }}>{app.name}</h4>
                      <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{app.desc}</p>
                    </div>
                  </div>
                  <button style={{ padding: '6px 12px', background: app.connected ? 'rgba(255,255,255,0.05)' : 'var(--primary)', border: 'none', borderRadius: 6, color: app.connected ? 'var(--on-surface-variant)' : '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    {app.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
