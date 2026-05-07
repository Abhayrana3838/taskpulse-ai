import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SideNav from '../components/layout/SideNav';
import TopHeader from '../components/layout/TopHeader';
import api from '../lib/api';
import DashboardBackground from '../components/three/DashboardBackground';

export default function WorkflowsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [newStatus, setNewStatus] = useState({ name: '', color: '#0070f3', category: 'in_progress' });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchWorkflow(selectedProject.id);
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

  const fetchWorkflow = async (projectId) => {
    try {
      setLoading(true);
      const [statusesRes, transitionsRes] = await Promise.all([
        api.get(`/api/workflows/statuses/${projectId}`).catch(() => ({ data: [] })),
        api.get(`/api/workflows/transitions/${projectId}`).catch(() => ({ data: [] })),
      ]);
      setStatuses(statusesRes.data || []);
      setTransitions(transitionsRes.data || []);
    } catch (err) {
      console.error('Failed to load workflow', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStatus = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/workflows/statuses/${selectedProject.id}`, newStatus);
      setShowAddStatus(false);
      setNewStatus({ name: '', color: '#0070f3', category: 'in_progress' });
      fetchWorkflow(selectedProject.id);
    } catch (err) {
      console.error('Failed to add status', err);
    }
  };

  const defaultStatuses = [
    { id: 1, name: 'To Do', color: '#6b7280', category: 'todo', is_default: true },
    { id: 2, name: 'In Progress', color: '#0070f3', category: 'in_progress', is_default: true },
    { id: 3, name: 'Review', color: '#f59e0b', category: 'in_progress', is_default: true },
    { id: 4, name: 'Done', color: '#10b981', category: 'done', is_default: true },
  ];

  const displayStatuses = statuses.length > 0 ? statuses : defaultStatuses;

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
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '12px', color: '#0070f3' }}>work</span>
              Workflows
            </h1>
            <p style={{ color: '#8b90a0', fontSize: '16px', margin: 0 }}>
              Customize task statuses and transitions
            </p>
          </div>
          
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

        {/* Workflow Visualization */}
        <div className="glass-card" style={{ padding: '32px', borderRadius: '16px', background: 'rgba(10, 10, 10, 0.7)', marginBottom: '32px' }}>
          <h3 style={{ color: '#e5e2e1', margin: '0 0 24px' }}>Workflow Board</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflowX: 'auto', padding: '16px' }}>
            {displayStatuses.map((status, index) => (
              <div key={status.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  minWidth: '200px',
                  padding: '20px',
                  borderRadius: '12px',
                  background: `${status.color}20`,
                  border: `2px solid ${status.color}`,
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: status.color,
                    margin: '0 auto 12px',
                  }} />
                  <h4 style={{ color: '#e5e2e1', margin: '0 0 4px', fontSize: '16px' }}>{status.name}</h4>
                  <p style={{ color: '#8b90a0', margin: 0, fontSize: '12px', textTransform: 'uppercase' }}>{status.category}</p>
                </div>
                {index < displayStatuses.length - 1 && (
                  <span className="material-symbols-outlined" style={{ color: '#6b7280', fontSize: '32px' }}>arrow_forward</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Statuses List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(10, 10, 10, 0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#e5e2e1', margin: 0 }}>Statuses</h3>
              <button
                onClick={() => setShowAddStatus(true)}
                style={{
                  padding: '8px 16px',
                  background: '#0070f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                + Add Status
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayStatuses.map((status) => (
                <div key={status.id} style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: status.color,
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#e5e2e1', margin: '0 0 2px', fontSize: '14px' }}>{status.name}</p>
                    <p style={{ color: '#8b90a0', margin: 0, fontSize: '12px' }}>{status.category}</p>
                  </div>
                  {status.is_default && (
                    <span style={{ padding: '4px 8px', background: 'rgba(0, 112, 243, 0.2)', color: '#aec6ff', borderRadius: '4px', fontSize: '11px' }}>Default</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(10, 10, 10, 0.7)' }}>
            <h3 style={{ color: '#e5e2e1', margin: '0 0 20px' }}>Transitions</h3>
            <p style={{ color: '#8b90a0', fontSize: '14px', lineHeight: 1.6 }}>
              Tasks can move from any status to any other status. 
              Drag and drop on the board to change status.
            </p>
            
            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(0, 112, 243, 0.1)', borderRadius: '8px' }}>
              <p style={{ color: '#aec6ff', fontSize: '13px', margin: 0 }}>
                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>info</span>
                Workflow rules can be configured to require approvals or trigger automations.
              </p>
            </div>
          </div>
        </div>

        {/* Add Status Modal */}
        {showAddStatus && (
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
              style={{
                padding: '32px',
                borderRadius: '16px',
                background: '#1a1a1a',
                width: '100%',
                maxWidth: '400px',
              }}
            >
              <h3 style={{ color: '#e5e2e1', margin: '0 0 24px' }}>Add New Status</h3>
              <form onSubmit={handleAddStatus}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#8b90a0', marginBottom: '8px', fontSize: '14px' }}>Status Name</label>
                  <input
                    type="text"
                    value={newStatus.name}
                    onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                    required
                    placeholder="e.g., In Review"
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
                  <label style={{ display: 'block', color: '#8b90a0', marginBottom: '8px', fontSize: '14px' }}>Category</label>
                  <select
                    value={newStatus.category}
                    onChange={(e) => setNewStatus({ ...newStatus, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0a0a0a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e5e2e1',
                    }}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', color: '#8b90a0', marginBottom: '8px', fontSize: '14px' }}>Color</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['#0070f3', '#6807ba', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6b7280'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewStatus({ ...newStatus, color })}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: color,
                          border: newStatus.color === color ? '2px solid #fff' : 'none',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddStatus(false)}
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
                    Add Status
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
