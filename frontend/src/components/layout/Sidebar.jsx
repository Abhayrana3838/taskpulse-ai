import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { icon: 'folder_shared', label: 'Projects', to: '/projects' },
  { icon: 'assignment_turned_in', label: 'Tasks', to: '/tasks' },
  { icon: 'group', label: 'Team', to: '/team' },
  { icon: 'insights', label: 'Reports', to: '/reports' },
  { icon: 'settings', label: 'Settings', to: '/settings' },
];

const sidebarVariants = {
  hidden: { x: -280 },
  visible: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, type: 'spring', stiffness: 200 } }),
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      style={{
        position: 'fixed', left: 0, top: 0, height: '100vh', width: 256,
        zIndex: 50, display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
        background: 'rgba(14,14,14,0.85)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '40px 0 60px -15px rgba(0,0,0,0.5)',
      }}
    >
      {/* Brand */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#0070f3,#6807ba)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,112,243,0.4)',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 20, fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, color: '#aec6ff', letterSpacing: '-0.03em' }}>TaskPulse AI</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
          borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg,#0070f3,#6807ba)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>AC</span>
          </div>
          <div>
            <p className="label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: 9 }}>ACME CORP</p>
            <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>Enterprise Plan</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item, i) => (
          <motion.div key={item.to} custom={i} variants={itemVariants} initial="hidden" animate="visible">
            <NavLink
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '10px 14px', borderRadius: 10,
                textDecoration: 'none', fontWeight: 500, fontSize: 15,
                transition: 'all 0.2s ease',
                color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                background: isActive ? 'rgba(0,112,243,0.12)' : 'transparent',
                borderRight: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                boxShadow: isActive ? '0 0 15px rgba(0,112,243,0.15)' : 'none',
              })}
            >
              {({ isActive }) => (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 21, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* New Project Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/projects')}
        style={{
          width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#0070f3,#6807ba)',
          color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em',
          fontFamily: 'Space Grotesk', textTransform: 'uppercase',
          boxShadow: '0 0 24px rgba(0,112,243,0.35)', marginBottom: 8,
        }}
      >
        + New Project
      </motion.button>

      {/* Bottom Links */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[
          { icon: 'person', label: user?.name || 'Profile', to: '/settings' },
          { icon: 'logout', label: 'Logout', action: logout },
        ].map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ x: 4 }}
            onClick={item.action ? item.action : () => navigate(item.to)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px',
              borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent',
              color: item.label === 'Logout' ? 'var(--error)' : 'var(--on-surface-variant)',
              fontSize: 14, textAlign: 'left', width: '100%',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.aside>
  );
}
