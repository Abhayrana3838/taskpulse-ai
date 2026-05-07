import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SideNav from '../components/layout/SideNav';
import TopHeader from '../components/layout/TopHeader';
import api from '../lib/api';

export default function ActivityPage() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await api.get('/api/dashboard/activity');
        setActivity(res.data || []);
      } catch (err) {
        console.error('Failed to load activity', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (colorName) => {
    const colors = {
      primary: '#0070f3',
      secondary: '#6807ba',
      tertiary: '#e60073',
      white: '#e5e2e1',
    };
    return colors[colorName] || '#e5e2e1';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#131313', color: '#c1c6d7' }}>
        <SideNav />
        <TopHeader />
        <div style={{ marginLeft: '256px', padding: '24px', textAlign: 'center' }}>
          Loading activity...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#131313' }}>
      <SideNav />
      <TopHeader />
      
      <main style={{ marginLeft: '256px', padding: '24px 40px 64px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '32px', borderRadius: '16px', marginBottom: '24px' }}
        >
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#e5e2e1', marginBottom: '8px' }}>Activity Feed</h2>
          <p style={{ color: '#c1c6d7', fontSize: '14px' }}>Real-time updates from your team</p>
        </motion.div>

        <div className="glass-card" style={{ borderRadius: '16px', padding: '24px' }}>
          {activity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#c1c6d7' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '16px' }}>inbox</span>
              <p>No recent activity</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activity.map((act, index) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '20px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {/* Status Indicator */}
                  <div style={{
                    width: '4px',
                    height: '50px',
                    borderRadius: '2px',
                    background: getColor(act.color),
                    flexShrink: 0,
                  }} />
                  
                  {/* Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `${getColor(act.color)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span 
                      className="material-symbols-outlined" 
                      style={{ fontSize: '20px', color: getColor(act.color) }}
                    >
                      {act.color === 'primary' ? 'rocket_launch' : 
                       act.color === 'secondary' ? 'palette' : 
                       act.color === 'tertiary' ? 'code' : 'emoji_events'}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#e5e2e1', margin: 0 }}>
                        {act.title}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#c1c6d7' }}>{act.time_ago}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#c1c6d7', margin: '0 0 4px' }}>
                      by <span style={{ color: getColor(act.color), fontWeight: 600 }}>{act.user_name}</span>
                    </p>
                    <p style={{ fontSize: '13px', color: '#8b90a0', margin: 0 }}>{act.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
