import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SideNav from '../components/layout/SideNav';
import TopHeader from '../components/layout/TopHeader';
import api from '../lib/api';

const COLORS = ['#0070f3', '#6807ba', '#e60073', '#10b981', '#f59e0b'];

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [velocity, setVelocity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, velRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/dashboard/velocity'),
        ]);
        setStats(statsRes.data);
        setVelocity(velRes.data || []);
      } catch (err) {
        console.error('Failed to load reports data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sample project data
  const projectData = [
    { name: 'Completed', value: 60 },
    { name: 'In Progress', value: 25 },
    { name: 'Not Started', value: 15 },
  ];

  const taskData = [
    { name: 'Mon', completed: 12, pending: 8 },
    { name: 'Tue', completed: 18, pending: 6 },
    { name: 'Wed', completed: 15, pending: 10 },
    { name: 'Thu', completed: 22, pending: 5 },
    { name: 'Fri', completed: 20, pending: 7 },
    { name: 'Sat', completed: 8, pending: 3 },
    { name: 'Sun', completed: 5, pending: 2 },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#131313', color: '#c1c6d7' }}>
        <SideNav />
        <TopHeader />
        <div style={{ marginLeft: '256px', padding: '24px', textAlign: 'center' }}>
          Loading reports...
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
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#e5e2e1', marginBottom: '8px' }}>Reports</h2>
          <p style={{ color: '#c1c6d7', fontSize: '14px' }}>Analytics and insights about your projects</p>
        </motion.div>

        {/* Stats Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          {[
            { title: 'Active Projects', value: stats?.active_projects || 0, icon: 'folder' },
            { title: 'Total Tasks', value: stats?.total_tasks || 0, icon: 'task' },
            { title: 'Completion Rate', value: '70%', icon: 'check_circle' },
            { title: 'Team Velocity', value: '4.8x', icon: 'speed' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card"
              style={{ padding: '24px', borderRadius: '16px', textAlign: 'center' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#0070f3', marginBottom: '12px' }}>
                {stat.icon}
              </span>
              <h4 style={{ fontSize: '32px', fontWeight: 700, color: '#e5e2e1', margin: '0 0 4px' }}>{stat.value}</h4>
              <p style={{ fontSize: '14px', color: '#c1c6d7' }}>{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          {/* Task Completion Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card"
            style={{ padding: '24px', borderRadius: '16px' }}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#e5e2e1', marginBottom: '20px' }}>Task Completion (Weekly)</h4>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#c1c6d7" fontSize={12} />
                  <YAxis stroke="#c1c6d7" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(19,19,19,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  />
                  <Bar dataKey="completed" fill="#0070f3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="#6807ba" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Project Status Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card"
            style={{ padding: '24px', borderRadius: '16px' }}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#e5e2e1', marginBottom: '20px' }}>Project Status Distribution</h4>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'rgba(19,19,19,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
