import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      style={{
        position: 'sticky', top: 0, zIndex: 40, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(19,19,19,0.8)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {title && (
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
        )}
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span className="material-symbols-outlined" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 18, color: 'var(--on-surface-variant)',
          }}>search</span>
          <input
            placeholder="Search projects..."
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24, padding: '7px 16px 7px 38px',
              color: 'var(--on-surface)', fontSize: 14, width: 220,
              transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.width = '280px'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.width = '220px'; }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)', color: 'var(--on-surface-variant)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)', color: 'var(--on-surface-variant)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>help</span>
        </motion.button>

        {/* User avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/settings')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.2 }}>{user?.name || 'User'}</p>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{user?.role || 'Member'}</p>
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg,#0070f3,#6807ba)',
            border: '2px solid var(--primary)', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14, color: '#fff',
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
