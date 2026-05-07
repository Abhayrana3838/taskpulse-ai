import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// Main navigation items
const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'folder_shared', label: 'Projects', path: '/projects' },
  { icon: 'assignment_turned_in', label: 'Tasks', path: '/kanban' },
  { icon: 'sprint', label: 'Sprints', path: '/sprints' },
  { icon: 'auto_awesome', label: 'AI Insights', path: '/ai-insights' },
];

// Planning & Management
const planningItems = [
  { icon: 'view_kanban', label: 'Backlog', path: '/backlog' },
  { icon: 'account_tree', label: 'Epics', path: '/epics' },
  { icon: 'work', label: 'Workflows', path: '/workflows' },
];

// Tracking & Activity
const trackingItems = [
  { icon: 'schedule', label: 'Time Tracking', path: '/time-tracking' },
  { icon: 'notifications', label: 'Notifications', path: '/notifications', badge: true },
  { icon: 'history', label: 'Activity Log', path: '/activity' },
];

// Team & Integrations
const teamItems = [
  { icon: 'group', label: 'Team', path: '/team' },
  { icon: 'integration_instructions', label: 'Integrations', path: '/integrations' },
  { icon: 'insights', label: 'Reports', path: '/reports' },
  { icon: 'settings', label: 'Settings', path: '/settings' },
];

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '256px',
      zIndex: 50,
      background: 'rgba(14, 14, 14, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '40px 0 60px -15px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#0070f3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '20px' }}>bolt</span>
          </div>
          <span style={{
            fontFamily: 'Space Grotesk',
            fontSize: '20px',
            fontWeight: 700,
            color: '#aec6ff',
            letterSpacing: '0.02em',
          }}>TaskPulse AI</span>
        </div>
        
        {/* Organization */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '16px',
          padding: '8px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #0070f3, #6807ba)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '14px' }}>business</span>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: '#c1c6d7', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Organization</p>
            <p style={{ fontSize: '12px', color: '#aec6ff', margin: 0 }}>{user?.name || 'My Workspace'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {/* Main */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#aec6ff' : '#c1c6d7',
                background: isActive ? 'rgba(0, 112, 243, 0.2)' : 'transparent',
                borderRight: isActive ? '4px solid #0070f3' : '4px solid transparent',
                boxShadow: isActive ? '0 0 15px rgba(0, 112, 243, 0.2)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px' }}>{item.label}</span>
            </Link>
          );
        })}

        {/* Planning Section */}
        <div style={{ marginTop: '16px', padding: '0 16px' }}>
          <p style={{ fontSize: '10px', color: '#8b90a0', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Planning</p>
        </div>
        {planningItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#aec6ff' : '#c1c6d7',
                background: isActive ? 'rgba(0, 112, 243, 0.2)' : 'transparent',
                borderRight: isActive ? '4px solid #0070f3' : '4px solid transparent',
                boxShadow: isActive ? '0 0 15px rgba(0, 112, 243, 0.2)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px' }}>{item.label}</span>
            </Link>
          );
        })}

        {/* Tracking Section */}
        <div style={{ marginTop: '16px', padding: '0 16px' }}>
          <p style={{ fontSize: '10px', color: '#8b90a0', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Tracking</p>
        </div>
        {trackingItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#aec6ff' : '#c1c6d7',
                background: isActive ? 'rgba(0, 112, 243, 0.2)' : 'transparent',
                borderRight: isActive ? '4px solid #0070f3' : '4px solid transparent',
                boxShadow: isActive ? '0 0 15px rgba(0, 112, 243, 0.2)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px' }}>{item.label}</span>
              {item.badge && <span style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />}
            </Link>
          );
        })}

        {/* Team Section */}
        <div style={{ marginTop: '16px', padding: '0 16px' }}>
          <p style={{ fontSize: '10px', color: '#8b90a0', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Team & More</p>
        </div>
        {teamItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#aec6ff' : '#c1c6d7',
                background: isActive ? 'rgba(0, 112, 243, 0.2)' : 'transparent',
                borderRight: isActive ? '4px solid #0070f3' : '4px solid transparent',
                boxShadow: isActive ? '0 0 15px rgba(0, 112, 243, 0.2)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* New Project Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/projects')}
        style={{
          width: '100%',
          padding: '14px',
          marginBottom: '16px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0070f3, #6807ba)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Space Grotesk',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          boxShadow: '0 0 20px rgba(0, 112, 243, 0.3)',
        }}
      >
        + New Project
      </motion.button>

      {/* Bottom Links */}
      <div style={{
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <Link to="/help" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          borderRadius: '8px',
          textDecoration: 'none',
          color: '#c1c6d7',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>help</span>
          <span style={{ fontSize: '14px' }}>Help Center</span>
        </Link>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#c1c6d7',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
          <span style={{ fontSize: '14px' }}>Logout</span>
        </button>
      </div>
    </aside>
  );
}
