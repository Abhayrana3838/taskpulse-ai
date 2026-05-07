import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SideNav from '../components/layout/SideNav';
import TopHeader from '../components/layout/TopHeader';
import ActivityFeed from '../components/activity/ActivityFeed';
import api from '../lib/api';

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getColorFromString = (str) => {
  const colors = ['#0070f3', '#6807ba', '#e60073', '#10b981', '#f59e0b', '#ef4444'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Simulated online status - in production this would come from WebSocket
const useOnlineStatus = (userId) => {
  // Simulate 70% chance of being online
  return Math.random() > 0.3;
};

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get('/api/users/team');
        setTeamMembers(res.data || []);
        
        // Fetch stats for each user
        const stats = {};
        for (const member of res.data || []) {
          try {
            // Get user's recent activity
            const timeRes = await api.get(`/api/time/user/${member.id}?days=7`);
            stats[member.id] = {
              timeThisWeek: timeRes.data.total_minutes,
              entries: timeRes.data.entry_count,
            };
          } catch (err) {
            stats[member.id] = { timeThisWeek: 0, entries: 0 };
          }
        }
        setUserStats(stats);
      } catch (err) {
        console.error('Failed to load team members', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#131313', color: '#c1c6d7' }}>
        <SideNav />
        <TopHeader />
        <div style={{ marginLeft: '256px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#0070f3' }}>sync</span>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#131313' }}>
      <SideNav />
      <TopHeader />
      
      <main style={{ marginLeft: '256px', padding: '24px 40px 64px' }}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end',
            marginBottom: '32px' 
          }}
        >
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ 
                fontSize: '36px', 
                fontWeight: 800, 
                background: 'linear-gradient(135deg, #e5e2e1, #8b90a0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: '0 0 8px' 
              }}
            >
              Team Overview
            </motion.h1>
            <p style={{ color: '#c1c6d7', fontSize: '15px', margin: 0 }}>
              {teamMembers.length} members • {teamMembers.filter(m => useOnlineStatus(m.id)).length} online
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#c1c6d7',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="material-symbols-outlined">
                {viewMode === 'grid' ? 'view_list' : 'grid_view'}
              </span>
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '20px',
            marginBottom: '32px'
          }}
        >
          {[
            { 
              label: 'Total Members', 
              value: teamMembers.length,
              icon: 'group',
              color: '#0070f3'
            },
            { 
              label: 'Online Now', 
              value: teamMembers.filter(m => useOnlineStatus(m.id)).length,
              icon: 'online_prediction',
              color: '#10b981'
            },
            { 
              label: 'Admins', 
              value: teamMembers.filter(m => m.role === 'Admin').length,
              icon: 'admin_panel_settings',
              color: '#f59e0b'
            },
            { 
              label: 'New This Month', 
              value: teamMembers.filter(m => {
                const created = new Date(m.created_at);
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return created > monthAgo;
              }).length,
              icon: 'person_add',
              color: '#e60073'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              style={{
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: `${stat.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  {stat.icon}
                </span>
              </div>
              <div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ fontSize: '28px', fontWeight: 700, color: '#e5e2e1' }}
                >
                  {stat.value}
                </motion.div>
                <div style={{ fontSize: '13px', color: '#8b90a0' }}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Team Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          <AnimatePresence mode="popLayout">
            {teamMembers.map((member, index) => {
              const isOnline = useOnlineStatus(member.id);
              const stats = userStats[member.id] || { timeThisWeek: 0, entries: 0 };
              
              return (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -4,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
                  }}
                  onClick={() => setSelectedUser(member)}
                  style={{ 
                    padding: viewMode === 'grid' ? '24px' : '20px 24px', 
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: viewMode === 'grid' ? 'flex-start' : 'center',
                    gap: '16px',
                    flexDirection: viewMode === 'grid' ? 'column' : 'row',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Online Indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: isOnline ? '#10b981' : '#6b7280',
                    boxShadow: isOnline ? '0 0 10px #10b981' : 'none',
                    animation: isOnline ? 'pulse 2s infinite' : 'none',
                  }} />

                  {/* Avatar */}
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    style={{
                      width: viewMode === 'grid' ? '70px' : '50px',
                      height: viewMode === 'grid' ? '70px' : '50px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${getColorFromString(member.name)}, ${getColorFromString(member.name + '1')})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: viewMode === 'grid' ? '28px' : '20px',
                      fontWeight: 700,
                      color: '#fff',
                      boxShadow: `0 8px 30px ${getColorFromString(member.name)}40`,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(member.name)}
                  </motion.div>

                  {/* Info */}
                  <div style={{ flex: 1, width: viewMode === 'grid' ? '100%' : 'auto' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: viewMode === 'grid' ? '8px' : '4px',
                      flexWrap: 'wrap'
                    }}>
                      <h4 style={{ 
                        fontSize: viewMode === 'grid' ? '18px' : '16px', 
                        fontWeight: 600, 
                        color: '#e5e2e1', 
                        margin: 0 
                      }}>
                        {member.name}
                      </h4>
                      {member.role === 'Admin' && (
                        <span style={{
                          padding: '2px 8px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          borderRadius: '4px',
                          color: '#f59e0b',
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}>
                          Admin
                        </span>
                      )}
                    </div>
                    
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#8b90a0', 
                      margin: '0 0 8px',
                      wordBreak: 'break-all'
                    }}>
                      {member.email}
                    </p>

                    {viewMode === 'grid' && (
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          padding: '4px 10px',
                          background: 'rgba(0, 112, 243, 0.1)',
                          borderRadius: '12px',
                          color: '#aec6ff',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>schedule</span>
                          {formatTime(stats.timeThisWeek)} this week
                        </span>
                        <span style={{
                          padding: '4px 10px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: '12px',
                          color: '#10b981',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>task_alt</span>
                          {stats.entries} entries
                        </span>
                      </div>
                    )}
                  </div>

                  {viewMode === 'list' && (
                    <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                      <span style={{
                        padding: '6px 12px',
                        background: 'rgba(0, 112, 243, 0.1)',
                        borderRadius: '8px',
                        color: '#aec6ff',
                        fontSize: '12px',
                      }}>
                        {formatTime(stats.timeThisWeek)}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Activity Feed Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            padding: '32px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#e5e2e1', margin: '0 0 4px' }}>
                Team Activity
              </h2>
              <p style={{ color: '#8b90a0', fontSize: '14px', margin: 0 }}>
                See what your team is working on in real-time
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 10px #10b981',
              }}
            />
          </div>
          
          <ActivityFeed limit={15} />
        </motion.div>
      </main>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#1a1a1a',
                borderRadius: '20px',
                padding: '32px',
                width: '100%',
                maxWidth: '450px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: getColorFromString(selectedUser.name),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '36px',
                    fontWeight: 700,
                    color: '#fff',
                    boxShadow: `0 10px 40px ${getColorFromString(selectedUser.name)}50`,
                  }}
                >
                  {getInitials(selectedUser.name)}
                </motion.div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#e5e2e1', margin: '0 0 4px' }}>
                  {selectedUser.name}
                </h3>
                <p style={{ color: '#8b90a0', margin: 0 }}>{selectedUser.email}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#0070f3', margin: '0 0 4px' }}>
                    {userStats[selectedUser.id]?.entries || 0}
                  </p>
                  <p style={{ fontSize: '12px', color: '#8b90a0', margin: 0 }}>Time Entries</p>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', margin: '0 0 4px' }}>
                    {formatTime(userStats[selectedUser.id]?.timeThisWeek || 0)}
                  </p>
                  <p style={{ fontSize: '12px', color: '#8b90a0', margin: 0 }}>This Week</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedUser(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#e5e2e1',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #0070f3, #6807ba)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View Profile
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
