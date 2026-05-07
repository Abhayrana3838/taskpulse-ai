import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SideNav from '../components/layout/SideNav';
import TopHeader from '../components/layout/TopHeader';
import api from '../lib/api';
import { useRealtimeDashboard } from '../hooks/useWebSocket';
import ActivityFeed from '../components/activity/ActivityFeed';
import DashboardBackground from '../components/three/DashboardBackground';
import AIInsightsPanel from '../components/ai/AIInsightsPanel';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Helper function to generate color from string
const getColorFromString = (str) => {
  const colors = ['#0070f3', '#6807ba', '#e60073', '#10b981', '#f59e0b', '#ef4444'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [velocity, setVelocity] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [statsRes, actRes, velRes, overRes, teamRes, insightsRes, sprintsRes, epicsRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/dashboard/activity'),
          api.get('/api/dashboard/velocity'),
          api.get('/api/dashboard/overdue'),
          api.get('/api/users/team'),
          api.get('/api/ai/insights').catch(() => ({ data: [] })),
          api.get('/api/sprints/active').catch(() => ({ data: [] })),
          api.get('/api/epics').catch(() => ({ data: [] })),
        ]);
        
        setStats(statsRes.data);
        setActivity(actRes.data || []);
        setVelocity(velRes.data || []);
        setOverdue(overRes.data || []);
        setTeamMembers(teamRes.data || []);
        setAiInsights(insightsRes.data || []);
        setSprints(sprintsRes.data || []);
        setEpics(epicsRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Real-time updates via WebSocket/polling
  useRealtimeDashboard((updates) => {
    if (updates.stats) setStats(updates.stats);
    if (updates.activity) setActivity(updates.activity);
    if (updates.overdue) setOverdue(updates.overdue);
  });

  if (loading && !stats) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#131313',
        color: '#c1c6d7',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <SideNav />
        <TopHeader />
        <div style={{ 
          marginLeft: '256px', 
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#0070f3', animation: 'spin 1s linear infinite' }}>sync</span>
            <p style={{ marginTop: '16px', fontSize: '16px' }}>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#131313',
        color: '#c1c6d7',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <SideNav />
        <TopHeader />
        <div style={{ 
          marginLeft: '256px', 
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ffb4ab' }}>error_outline</span>
            <p style={{ marginTop: '16px', fontSize: '16px', color: '#e5e2e1' }}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                background: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Active Projects', 
      value: stats?.active_projects ?? 0, 
      icon: 'rocket_launch', 
      color: '#0070f3',
      trend: stats?.project_increase_pct ? `+${stats.project_increase_pct}%` : 'No change',
      trendUp: (stats?.project_increase_pct || 0) >= 0,
    },
    { 
      title: 'Total Tasks', 
      value: stats?.total_tasks ?? 0, 
      icon: 'checklist', 
      color: '#6807ba',
      trend: `${stats?.tasks_due_today || 0} due today`,
      trendUp: false,
    },
    { 
      title: 'Team Pulse Score', 
      value: stats?.team_pulse_score ?? 0, 
      icon: 'favorite', 
      color: 'linear-gradient(135deg, #aec6ff, #dbb8ff)',
      trend: (stats?.team_pulse_score || 0) > 80 ? 'Peak performance' : (stats?.team_pulse_score || 0) > 60 ? 'Good performance' : 'Needs attention',
      trendUp: (stats?.team_pulse_score || 0) > 60,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#131313', position: 'relative' }}>
      <DashboardBackground />
      <SideNav />
      <TopHeader />
      
      <main style={{ 
        marginLeft: '256px', 
        padding: '24px 40px 64px',
        maxWidth: '1440px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header Stats */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '80px' }}>
          {statCards.map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
              className="glass-card" 
              style={{ 
                padding: '40px', 
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(10, 10, 10, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, padding: '24px', opacity: 0.1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>{s.icon}</span>
              </div>
              <p style={{ 
                fontFamily: 'Space Grotesk', 
                fontSize: '12px', 
                color: '#c1c6d7', 
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '8px' 
              }}>{s.title}</p>
              <h3 style={{ 
                fontSize: '48px', 
                fontWeight: 700,
                color: i === 2 ? 'transparent' : s.color,
                background: i === 2 ? s.color : 'none',
                backgroundClip: i === 2 ? 'text' : 'none',
                WebkitBackgroundClip: i === 2 ? 'text' : 'none',
                lineHeight: 1,
              }}>{s.value}</h3>
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: s.trendUp ? '#10b981' : '#c1c6d7' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{s.trendUp ? 'trending_up' : 'schedule'}</span>
                <span>{s.trend}</span>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Bento Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', marginBottom: '80px' }}>
          {/* Project Velocity Widget */}
          <div className="glass-card" style={{ 
            gridColumn: 'span 8', 
            borderRadius: '16px', 
            padding: '24px',
            background: 'rgba(10, 10, 10, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h4 style={{ fontSize: '20px', fontWeight: 600, color: '#e5e2e1', margin: 0 }}>Project Velocity</h4>
                <p style={{ color: '#c1c6d7', fontSize: '14px', margin: '4px 0 0' }}>Development output over the last 30 days</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(0, 112, 243, 0.1)', color: '#aec6ff', fontSize: '12px', fontWeight: 700 }}>Velocity: 4.8x</span>
                <span className="material-symbols-outlined" style={{ color: '#c1c6d7', cursor: 'pointer' }}>more_horiz</span>
              </div>
            </div>
            
            {/* Chart Area */}
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocity}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0070f3" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0070f3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" stroke="#c1c6d7" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#c1c6d7" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(19,19,19,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#aec6ff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0070f3" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Overdue Alerts */}
            <div className="glass-card" style={{ 
              borderRadius: '16px', 
              padding: '24px',
              background: 'rgba(10, 10, 10, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 180, 171, 0.2)',
              boxShadow: '0 0 20px rgba(147, 0, 10, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#93000a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: '#ffb4ab' }}>warning</span>
                </div>
                <h4 style={{ fontSize: '20px', fontWeight: 600, color: '#ffb4ab', margin: 0 }}>Overdue Alerts</h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {overdue.map((task) => (
                  <div key={task.id} style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    background: 'rgba(147, 0, 10, 0.1)',
                    border: '1px solid rgba(255, 180, 171, 0.05)',
                    cursor: 'pointer',
                  }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#e5e2e1', margin: '0 0 4px' }}>{task.title}</p>
                    <p style={{ fontSize: '12px', color: '#ffb4ab', margin: 0 }}>{task.overdue_by} • {task.assignee_name}</p>
                  </div>
                ))}
              </div>
              
              <button style={{
                width: '100%',
                marginTop: '16px',
                padding: '8px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid rgba(255, 180, 171, 0.3)',
                color: '#ffdad6',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}>
                Resolve All
              </button>
            </div>

            {/* Completion Goal */}
            <div className="glass-card" style={{ 
              borderRadius: '16px', 
              padding: '24px',
              background: 'rgba(10, 10, 10, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}>
              <h4 style={{ fontFamily: 'Space Grotesk', fontSize: '12px', color: '#c1c6d7', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Completion Goal</h4>
              
              {/* Donut Chart */}
              <div style={{ position: 'relative', width: '128px', height: '128px', marginBottom: '16px' }}>
                <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="64" cy="64" r="54" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="54" 
                    fill="transparent" 
                    stroke="#6807ba" 
                    strokeWidth="12"
                    strokeDasharray="339.292"
                    strokeDashoffset="101.78"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(104, 7, 186, 0.4))' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '28px', fontWeight: 700, color: '#e5e2e1' }}>70%</span>
                </div>
              </div>
              
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#e5e2e1', margin: '0 0 4px' }}>Task Completion</p>
              <p style={{ fontSize: '12px', color: '#c1c6d7', margin: 0 }}>42 of 60 items finished</p>
            </div>
          </div>
        </div>

        {/* AI Insights & Active Sprints Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {/* AI Insights Panel */}
          <div style={{ gridColumn: 'span 6' }}>
            <AIInsightsPanel insights={aiInsights} />
          </div>
          
          {/* Active Sprints */}
          <motion.div 
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ 
              gridColumn: 'span 6',
              borderRadius: '16px', 
              padding: '24px',
              background: 'rgba(10, 10, 10, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#e5e2e1', margin: '0 0 4px' }}>
                  Active Sprints
                </h4>
                <p style={{ fontSize: '12px', color: '#8b90a0', margin: 0 }}>
                  {sprints.length} sprint{sprints.length !== 1 ? 's' : ''} in progress
                </p>
              </div>
              <span className="material-symbols-outlined" style={{ color: '#0070f3' }}>sprint</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sprints.slice(0, 3).map((sprint) => (
                <div key={sprint.id} style={{ 
                  padding: '16px', 
                  borderRadius: '12px', 
                  background: 'rgba(0, 112, 243, 0.1)',
                  border: '1px solid rgba(0, 112, 243, 0.2)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#e5e2e1' }}>{sprint.name}</span>
                    <span style={{ fontSize: '12px', color: '#10b981', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>{sprint.status}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#8b90a0' }}>
                    <span>{sprint.completed_tasks || 0}/{sprint.task_count || 0} tasks</span>
                    <span>•</span>
                    <span>{sprint.project_name}</span>
                  </div>
                  <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${sprint.task_count ? ((sprint.completed_tasks || 0) / sprint.task_count * 100) : 0}%`, 
                      height: '100%', 
                      background: '#0070f3',
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>
              ))}
              {sprints.length === 0 && (
                <p style={{ textAlign: 'center', color: '#8b90a0', fontSize: '14px', padding: '20px' }}>
                  No active sprints. Create one from the Sprints page.
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Real-time Activity Feed */}
        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ 
            borderRadius: '16px', 
            padding: '24px',
            background: 'rgba(10, 10, 10, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 600, color: '#e5e2e1', margin: '0 0 4px' }}>
                Live Activity Feed
              </h4>
              <p style={{ fontSize: '13px', color: '#8b90a0', margin: 0 }}>
                Real-time updates from your team
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
          
          <ActivityFeed limit={10} />
        </motion.div>
      </main>
    </div>
  );
}
