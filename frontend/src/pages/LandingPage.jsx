import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import HeroScene from '../components/three/HeroScene';
import DNATunnelBackground from '../components/three/DNATunnelBackground';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22,1,0.36,1] } } };

const features = [
  { icon: 'auto_mode', title: 'Automated Workflows', desc: 'Eliminate repetitive tasks with our proprietary AI logic engine.', tags: ['NO-CODE','AI SUGGESTIONS','INTEGRATIONS+'], span: 8 },
  { icon: 'monitoring', title: 'Deep Analytics', desc: 'Surface insights that matter with real-time data visualizers.', span: 4 },
  { icon: 'hub', title: 'Secure Architecture', desc: 'Enterprise-grade security baked into every layer.', span: 4 },
  { icon: 'groups', title: 'Seamless Collaboration', desc: 'Connect your team across timezones and platforms.', span: 8 },
];

const stats = [
  { value: '40%', label: 'INCREASE IN VELOCITY', color: 'var(--primary)' },
  { value: '250k+', label: 'TASKS AUTOMATED DAILY', color: 'var(--secondary)' },
  { value: '12h', label: 'SAVED PER TEAM/WEEK', color: 'var(--tertiary)' },
];

function Counter({ value }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
      className="display-xl"
    >{value}</motion.span>
  );
}

export default function LandingPage() {
  const nav = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', overflow: 'hidden' }}>
      {/* DNA Tunnel Shader Background */}
      <DNATunnelBackground />
      
      {/* Grid BG */}
      <div className="bg-grid" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.3 }} />
      
      {/* Ambient blobs */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: 500, height: 500, background: 'rgba(0,112,243,0.08)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: 400, height: 400, background: 'rgba(104,7,186,0.05)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none', zIndex: 1 }} />

      {/* NAV */}
      <motion.header initial={{ y: -80 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 25 }} style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px',
        background: 'rgba(19,19,19,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, color: '#aec6ff', letterSpacing: '-0.03em' }}>TaskPulse AI</span>
          <nav style={{ display: 'flex', gap: 24 }}>
            {['Features','Pricing','Team'].map(l => (
              <a key={l} href="#" style={{ color: 'var(--on-surface-variant)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--on-surface-variant)'}>{l}</a>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => nav('/login')}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 20px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Sign In</motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => nav('/signup')}
            style={{ background: 'linear-gradient(135deg,#0070f3,#6807ba)', border: 'none', borderRadius: 10, padding: '8px 20px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 0 20px rgba(0,112,243,0.3)' }}>Get Started</motion.button>
        </div>
      </motion.header>

      {/* HERO */}
      <motion.section ref={heroRef} style={{ y: heroY, opacity: heroOpacity, position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 80 }}>
        <HeroScene />
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 900, padding: '0 24px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
            style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: 'rgba(0,112,243,0.1)', border: '1px solid rgba(0,112,243,0.2)', marginBottom: 24 }}>
            <span className="label-caps" style={{ color: 'var(--primary)', fontSize: 10 }}>VERSION 4.0 IS NOW LIVE</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: [0.22,1,0.36,1] }}
            className="display-xl" style={{ marginBottom: 24, lineHeight: 1.05 }}>
            The operating system for{' '}<span className="neon-gradient-text">high-performance</span>{' '}teams
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }}
            style={{ fontSize: 18, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
            TaskPulse AI orchestrates your entire workflow with precision-engineered automation and deep intelligence.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(0,112,243,0.5)' }} whileTap={{ scale: 0.96 }}
              onClick={() => nav('/signup')}
              style={{ padding: '14px 36px', borderRadius: 14, background: 'linear-gradient(135deg,#0070f3,#6807ba)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 0 25px rgba(0,112,243,0.35)' }}>
              Get Started
            </motion.button>
            <motion.button whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.96 }}
              style={{ padding: '14px 36px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
              Book Demo
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* TRUSTED BY */}
      <section style={{ padding: '48px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(14,14,14,0.5)' }}>
        <p className="label-caps" style={{ textAlign: 'center', color: 'var(--on-surface-variant)', opacity: 0.5, marginBottom: 32, fontSize: 10 }}>TRUSTED BY THE WORLD'S MOST INNOVATIVE COMPANIES</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 64, flexWrap: 'wrap', opacity: 0.3, filter: 'grayscale(1)' }}>
          {['TECHTONIC','VALLEY AI','COREFLOW','QUANTUM','NEXUS DRIV'].map(n => (
            <span key={n} style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{n}</span>
          ))}
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 10 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.h2 variants={fadeUp} className="headline-lg" style={{ marginBottom: 12 }}>Precision-Engineered Features</motion.h2>
          <motion.p variants={fadeUp} style={{ color: 'var(--on-surface-variant)', maxWidth: 550, margin: '0 auto' }}>
            Built for teams that demand excellence. Every tool you need, unified in a single high-performance interface.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gap: 20 }}>
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeUp}
              className="glass-card glass-card-hover"
              style={{ gridColumn: `span ${f.span}`, padding: 32, borderRadius: 16, cursor: 'default' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: i % 2 === 0 ? 'var(--primary)' : i === 1 ? 'var(--secondary)' : 'var(--tertiary)', marginBottom: 16, display: 'block' }}>{f.icon}</span>
              <h3 className="headline-md" style={{ marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{f.desc}</p>
              {f.tags && (
                <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
                  {f.tags.map(t => (
                    <span key={t} className="label-caps" style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(0,112,243,0.1)', color: 'var(--primary)', fontSize: 9 }}>{t}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* STATS */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div className="glass-card" style={{ borderRadius: 20, padding: 64, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0070f3,#6807ba)', opacity: 0.04 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <Counter value={s.value} />
                <p style={{ color: s.color, marginTop: 4, fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</p>
                <p className="label-caps" style={{ color: 'var(--on-surface-variant)', marginTop: 8 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '80px 24px' }}>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="headline-lg" style={{ marginBottom: 16 }}>
          Ready to pulse with high performance?
        </motion.h2>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: 32, fontSize: 18 }}>Join over 10,000+ teams scaling their operations.</p>
        <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(0,112,243,0.5)' }} whileTap={{ scale: 0.96 }}
          onClick={() => nav('/signup')}
          style={{ padding: '16px 48px', borderRadius: 14, background: 'linear-gradient(135deg,#0070f3,#6807ba)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 17, cursor: 'pointer', boxShadow: '0 0 25px rgba(0,112,243,0.35)' }}>
          Get Started for Free
        </motion.button>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: 12, fontSize: 13 }}>No credit card required. 14-day free trial.</p>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'var(--surface-container-lowest)', padding: '64px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
          <div>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color: 'var(--on-surface)' }}>TaskPulse AI</span>
            <p style={{ color: 'var(--on-surface-variant)', marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>The operating system for teams that refuse to compromise.</p>
          </div>
          {[
            { title: 'PRODUCT', items: ['Features','Integrations','Enterprise','Pricing'] },
            { title: 'RESOURCES', items: ['Docs','API Reference','Community','Guides'] },
            { title: 'COMPANY', items: ['About Us','Security','Privacy','Careers'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="label-caps" style={{ color: 'var(--primary)', marginBottom: 12 }}>{col.title}</h4>
              {col.items.map(it => <a key={it} href="#" style={{ display: 'block', color: 'var(--on-surface-variant)', textDecoration: 'none', fontSize: 14, marginBottom: 8, transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='var(--primary)'} onMouseLeave={e=>e.target.style.color='var(--on-surface-variant)'}>{it}</a>)}
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1200, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 13, opacity: 0.7 }}>© 2024 TaskPulse AI. Built for high-performance teams.</p>
        </div>
      </footer>
    </div>
  );
}
