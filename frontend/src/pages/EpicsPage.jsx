import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SideNav from '../components/layout/SideNav';
import TopHeader from '../components/layout/TopHeader';
import api from '../lib/api';
import DashboardBackground from '../components/three/DashboardBackground';

export default function EpicsPage() {
  const [epics, setEpics] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEpic, setNewEpic] = useState({ title: '', description: '', project_id: '', color: '#0070f3' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [epicsRes, projectsRes] = await Promise.all([
        api.get('/api/epics').catch(() => ({ data: [] })),
        api.get('/api/projects').catch(() => ({ data: [] })),
      ]);
      setEpics(epicsRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (err) {
      console.error('Failed to load epics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEpic = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/epics', newEpic);
      setShowCreateModal(false);
      setNewEpic({ title: '', description: '', project_id: '', color: '#0070f3' });
      fetchData();
    } catch (err) {
      console.error('Failed to create epic', err);
    }
  };

  const colors = ['#0070f3', '#6807ba', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

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
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '12px', color: '#0070f3' }}>account_tree</span>
              Epics
            </h1>
            <p style={{ color: '#8b90a0', fontSize: '16px', margin: 0 }}>
              Large bodies of work that can be broken down into stories and tasks
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '12px 24px',
              background: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <span className="material-symbols-outlined">add</span>
            Create Epic
          </button>
        </div>

        {/* Epics Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#8b90a0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', animation: 'spin 1s linear infinite' }}>sync</span>
            <p>Loading epics...</p>
          </div>
        ) : epics.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', background: 'rgba(10, 10, 10, 0.7)', borderRadius: '16px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#8b90a0', marginBottom: '16px' }}>account_tree</span>
            <h3 style={{ color: '#e5e2e1', margin: '0 0 8px' }}>No epics yet</h3>
            <p style={{ color: '#8b90a0', margin: '0 0 24px' }}>Create your first epic to organize large bodies of work</p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '12px 24px',
                background: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Create Epic
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            {epics.map((epic, index) => (
              <motion.div
                key={epic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'rgba(10, 10, 10, 0.7)',
                  borderLeft: `4px solid ${epic.color || '#0070f3'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    background: `${epic.color || '#0070f3'}20`, 
                    color: epic.color || '#0070f3',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}>
                    {epic.epic_key}
                  </span>
                  <span style={{ color: '#8b90a0', fontSize: '12px' }}>{epic.status}</span>
                </div>
                
                <h3 style={{ color: '#e5e2e1', margin: '0 0 8px', fontSize: '18px' }}>{epic.title}</h3>
                <p style={{ color: '#8b90a0', margin: '0 0 16px', fontSize: '14px' }}>{epic.description}</p>
                
                {/* Progress */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                    <span style={{ color: '#8b90a0' }}>Progress</span>
                    <span style={{ color: '#e5e2e1' }}>{epic.progress || 0}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${epic.progress || 0}%`, 
                      height: '100%', 
                      background: epic.color || '#0070f3',
                      borderRadius: '3px',
                    }} />
                  </div>
                </div>
                
                {/* Stats */}
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#8b90a0' }}>
                  <span>{epic.story_points || 0} story points</span>
                  <span>•</span>
                  <span>{epic.task_count || 0} tasks</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card"
              style={{
                padding: '32px',
                borderRadius: '16px',
                background: '#1a1a1a',
                width: '100%',
                maxWidth: '500px',
              }}
            >
              <h3 style={{ color: '#e5e2e1', margin: '0 0 24px' }}>Create New Epic</h3>
              <form onSubmit={handleCreateEpic}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#8b90a0', marginBottom: '8px', fontSize: '14px' }}>Title</label>
                  <input
                    type="text"
                    value={newEpic.title}
                    onChange={(e) => setNewEpic({ ...newEpic, title: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e5e2e1',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#8b90a0', marginBottom: '8px', fontSize: '14px' }}>Description</label>
                  <textarea
                    value={newEpic.description}
                    onChange={(e) => setNewEpic({ ...newEpic, description: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e5e2e1',
                      resize: 'none',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#8b90a0', marginBottom: '8px', fontSize: '14px' }}>Project</label>
                  <select
                    value={newEpic.project_id}
                    onChange={(e) => setNewEpic({ ...newEpic, project_id: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e5e2e1',
                    }}
                  >
                    <option value="">Select a project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', color: '#8b90a0', marginBottom: '8px', fontSize: '14px' }}>Color</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewEpic({ ...newEpic, color })}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: color,
                          border: newEpic.color === color ? '2px solid #fff' : 'none',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#e5e2e1',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#0070f3',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Create Epic
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
