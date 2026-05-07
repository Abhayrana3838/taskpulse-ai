import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import LoginOrb from '../components/three/LoginOrb';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const nav = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      nav('/dashboard');
    }
  }, [user, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    console.log('Login attempt:', { email, password });
    try { 
      console.log('Calling login function...');
      await login(email, password); 
      console.log('Login successful, navigating to dashboard');
      nav('/dashboard'); 
    }
    catch (error) { 
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      // Show specific error messages
      if (error.message === 'Network Error' || !error.response) {
        setError('Cannot connect to server. Please make sure the backend is running on http://localhost:8000');
      } else if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError(`Error: ${error.message}`);
      }
    }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', background: '#050505', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 16px 12px 44px', color: 'var(--on-surface)',
    fontSize: 14, transition: 'all 0.3s',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--background)' }}>
      {/* Left: Simple Background */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #0070f3 0%, #6807ba 100%)' }}>
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
          style={{ position: 'relative', zIndex: 10, padding: 64, maxWidth: 500 }}>
          <span className="label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.3em', display: 'block', marginBottom: 16 }}>TASKPULSE AI</span>
          <h1 className="display-xl" style={{ marginBottom: 20 }}>Architect your <span style={{ color: '#0070f3' }}>workflow.</span></h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 18, lineHeight: 1.7 }}>
            Experience the next generation of team collaboration. Precise, fast, and engineered for high-performance enterprise teams.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 48 }}>
            {[{ icon: 'bolt', title: 'Ultra-Fast', desc: 'Sub-100ms response times.' }, { icon: 'security', title: 'Enterprise Ready', desc: 'Military-grade encryption.' }].map(f => (
              <div key={f.title} className="glass-card" style={{ padding: 20, borderRadius: 14 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', marginBottom: 8, display: 'block' }}>{f.icon}</span>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right: Form */}
      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          style={{ width: '100%', maxWidth: 400 }}>
          <div className="glass-card" style={{ padding: 36, borderRadius: 16, boxShadow: '0 40px 60px -15px rgba(0,0,0,0.5)' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 className="headline-lg" style={{ marginBottom: 6 }}>Welcome back</h2>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>Enter your credentials to access TaskPulse AI</p>
            </div>

            {/* Social buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {['Google','GitHub'].map(s => (
                <motion.button key={s} whileHover={{ background: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.95 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 11, fontFamily: 'Space Grotesk', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{s === 'Google' ? 'g_translate' : 'code'}</span>{s}
                </motion.button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
              <span className="label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: 9 }}>OR CONTINUE WITH EMAIL</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: 9, display: 'block', marginBottom: 6, marginLeft: 2 }}>WORK EMAIL</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--outline-variant)' }}>mail</span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" style={inputStyle} required />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, marginLeft: 2 }}>
                  <label className="label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: 9 }}>PASSWORD</label>
                  <a href="#" style={{ fontSize: 9, fontFamily: 'Space Grotesk', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', letterSpacing: '0.1em' }}>FORGOT?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--outline-variant)' }}>lock</span>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} required />
                </div>
              </div>

              {error && (
                <div style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 8, 
                  padding: '12px 16px', 
                  marginBottom: 16,
                  color: '#ef4444',
                  fontSize: 13 
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Error:</div>
                  {error}
                  {error.includes('Cannot connect') && (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#9ca3af' }}>
                      <div>• Run: <code style={{background:'#333',padding:'2px 4px',borderRadius:'4px'}}>cd backend && uvicorn app.main:app --port 8000</code></div>
                    </div>
                  )}
                </div>
              )}

              <motion.button type="submit" whileHover={{ boxShadow: '0 0 30px rgba(0,112,243,0.5)' }} whileTap={{ scale: 0.97 }}
                disabled={loading}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#0070f3,#6807ba)', color: '#fff',
                  fontWeight: 700, fontSize: 15, boxShadow: '0 0 15px rgba(0,112,243,0.3)',
                  opacity: loading ? 0.7 : 1, marginTop: 4,
                }}>
                {loading ? 'Signing in...' : 'Sign In to TaskPulse AI'}
              </motion.button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--on-surface-variant)', fontSize: 13 }}>
              Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Create account</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
