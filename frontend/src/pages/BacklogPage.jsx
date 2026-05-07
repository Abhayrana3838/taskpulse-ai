import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SideNav from '../components/layout/SideNav';
import TopHeader from '../components/layout/TopHeader';
import api from '../lib/api';
import DashboardBackground from '../components/three/DashboardBackground';

export default function BacklogPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [backlog, setBacklog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchBacklog(selectedProject.id);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedProject(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const fetchBacklog = async (projectId) => {
    try {
      setLoading(true);
      const [backlogRes, sprintsRes] = await Promise.all([
        api.get(`/api/backlog/${projectId}`).catch(() => ({ data: { items: [] } })),
        api.get('/api/sprints/active').catch(() => ({ data: [] })),
      ]);
      setBacklog(backlogRes.data?.items || []);
      setSprints(sprintsRes.data || []);
    } catch (err) {
      console.error('Failed to load backlog', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToSprint = async (taskId, sprintId) => {
    try {
      await api.post(`/api/sprints/${sprintId}/tasks`, { task_id: taskId });
      fetchBacklog(selectedProject.id);
    } catch (err) {
      console.error('Failed to move task', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#e5e2e1', margin: '0 0 8px' }}>
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '12px', color: '#0070f3' }}>view_kanban</span>
              Product Backlog
            </h1>
            <p style={{ color: '#8b90a0', fontSize: '16px', margin: 0 }}>
              Prioritized list of features, bugs, and tasks
            </p>
          </div>
          
          {/* Project Selector */}
          <select
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const project = projects.find(p => p.id === parseInt(e.target.value));
              setSelectedProject(project);
            }}
            style={{
              padding: '12px 16px',
              background: 'rgba(10, 10, 10, 0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#e5e2e1',
              fontSize: '14px',
            }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Items', value: backlog.length, icon: 'list', color: '#0070f3' },
            { label: 'Story Points', value: backlog.reduce((sum, item) => sum + (item.story_points || 0), 0), icon: 'score', color: '#6807ba' },
            { label: 'High Priority', value: backlog.filter(i => i.priority === 'high').length, icon: 'priority_high', color: '#ef4444' },
            { label: 'Ready for Sprint', value: backlog.filter(i => i.status === 'todo').length, icon: 'check_circle', color: '#10b981' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card"
              style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'rgba(10, 10, 10, 0.7)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined" style={{ color: stat.color, fontSize: '24px' }}>{stat.icon}</span>
                <div>
                  <p style={{ color: '#8b90a0', fontSize: '12px', margin: '0 0 4px' }}>{stat.label}</p>
                  <p style={{ color: '#e5e2e1', fontSize: '24px', fontWeight: 700, margin: 0 }}>{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Backlog List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#8b90a0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', animation: 'spin 1s linear infinite' }}>sync</span>
            <p>Loading backlog...</p>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(10, 10, 10, 0.7)' }}>
            {backlog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#8b90a0', marginBottom: '16px' }}>inbox</span>
                <p style={{ color: '#8b90a0' }}>No items in backlog</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {backlog.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    {/* Priority Indicator */}
                    <div style={{
                      width: '4px',
                      height: '40px',
                      borderRadius: '2px',
                      background: getPriorityColor(item.priority),
                    }} />
                    
                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: '#8b90a0', fontSize: '12px' }}>{item.task_key}</span>
                        <span style={{ 
                          padding: '2px 8px', 
                          background: `${getPriorityColor(item.priority)}20`,
                          color: getPriorityColor(item.priority),
                          borderRadius: '4px',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                        }}>
                          {item.priority}
                        </span>
                      </div>
                      <h4 style={{ color: '#e5e2e1', margin: '0 0 4px', fontSize: '14px' }}>{item.title}</h4>
                      <p style={{ color: '#8b90a0', margin: 0, fontSize: '12px' }}>{item.story_points || 0} story points</p>
                    </div>
                    
                    {/* Actions */}
                    {sprints.length > 0 && (
                      <select
                        onChange={(e) => handleMoveToSprint(item.id, e.target.value)}
                        style={{
                          padding: '8px 12px',
                          background: '#0a0a0a',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          color: '#e5e2e1',
                          fontSize: '12px',
                        }}
                      >
                        <option value="">Move to Sprint...</option>
                        {sprints.map(sprint => (
                          <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                        ))}
                      </select>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
