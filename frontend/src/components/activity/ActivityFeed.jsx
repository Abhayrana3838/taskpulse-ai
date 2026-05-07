import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

const getActionIcon = (actionType) => {
  const icons = {
    created: 'add_circle',
    updated: 'edit',
    deleted: 'delete',
    moved: 'sync_alt',
    assigned: 'person_add',
    commented: 'chat',
    completed: 'check_circle',
    started: 'play_circle',
  };
  return icons[actionType] || 'notifications';
};

const getActionColor = (actionType) => {
  const colors = {
    created: '#10b981',
    updated: '#0070f3',
    deleted: '#ef4444',
    moved: '#f59e0b',
    assigned: '#6807ba',
    commented: '#e60073',
    completed: '#10b981',
    started: '#0070f3',
  };
  return colors[actionType] || '#c1c6d7';
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getColorFromString = (str) => {
  const colors = ['#0070f3', '#6807ba', '#e60073', '#10b981', '#f59e0b'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function ActivityFeed({ projectId, limit = 20 }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const url = projectId 
          ? `/api/activity/project/${projectId}?limit=${limit}`
          : `/api/activity?limit=${limit}`;
        const res = await api.get(url);
        setActivities(res.data);
      } catch (err) {
        console.error('Failed to load activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    
    // Real-time updates
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, [projectId, limit]);

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.action_type === filter);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#c1c6d7' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '32px' }}
        >
          <span className="material-symbols-outlined">sync</span>
        </motion.div>
        <p style={{ marginTop: '16px' }}>Loading activity feed...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Filter Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        {['all', 'created', 'moved', 'assigned', 'commented'].map((type) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(type)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: filter === type ? 'rgba(0, 112, 243, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: filter === type ? '#aec6ff' : '#c1c6d7',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'capitalize',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {getActionIcon(type === 'all' ? 'notifications' : type)}
            </span>
            {type}
          </motion.button>
        ))}
      </div>

      {/* Activity List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence mode="popLayout">
          {filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
              layout
              whileHover={{ 
                scale: 1.02, 
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Glow Effect on Hover */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at 50% 50%, ${getActionColor(activity.action_type)}15, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />

              {/* User Avatar */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: getColorFromString(activity.user_name),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                  boxShadow: `0 0 20px ${getColorFromString(activity.user_name)}40`,
                }}
              >
                {getInitials(activity.user_name)}
              </motion.div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#e5e2e1' }}>
                    {activity.user_name}
                  </span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: `${getActionColor(activity.action_type)}20`,
                      color: getActionColor(activity.action_type),
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                      {getActionIcon(activity.action_type)}
                    </span>
                    {activity.action_type}
                  </motion.span>
                </div>

                <p style={{ fontSize: '14px', color: '#c1c6d7', margin: '0 0 8px', lineHeight: 1.5 }}>
                  {activity.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#8b90a0' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                    {activity.time_ago}
                  </span>
                  {activity.project_name && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>folder</span>
                      {activity.project_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.05 + 0.2, type: 'spring' }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${getActionColor(activity.action_type)}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: getActionColor(activity.action_type),
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {getActionIcon(activity.action_type)}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredActivities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#8b90a0',
            }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '64px', marginBottom: '16px' }}>
                notifications_off
              </span>
            </motion.div>
            <p style={{ fontSize: '16px' }}>No activities found</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Try a different filter or check back later</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
