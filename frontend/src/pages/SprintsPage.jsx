import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SideNav from '../components/layout/SideNav';
import TopHeader from '../components/layout/TopHeader';
import api from '../lib/api';

export default function SprintsPage() {
  const [sprints, setSprints] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [sprintTasks, setSprintTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [burndownData, setBurndownData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    project_id: '',
    goal: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchSprints();
    fetchProjects();
  }, []);

  const fetchSprints = async () => {
    try {
      const res = await api.get('/api/sprints');
      setSprints(res.data);
      // Set first active sprint as selected
      const active = res.data.find(s => s.status === 'active');
      if (active) {
        setActiveSprint(active);
        fetchSprintDetails(active.id);
      }
    } catch (err) {
      console.error('Failed to load sprints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const fetchSprintDetails = async (sprintId) => {
    try {
      const [sprintRes, burndownRes] = await Promise.all([
        api.get(`/api/sprints/${sprintId}`),
        api.get(`/api/sprints/${sprintId}/burndown`)
      ]);
      setActiveSprint(sprintRes.data);
      setBurndownData(burndownRes.data);
    } catch (err) {
      console.error('Failed to load sprint details:', err);
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/sprints', formData);
      setShowCreateModal(false);
      setFormData({ name: '', project_id: '', goal: '', start_date: '', end_date: '' });
      fetchSprints();
    } catch (err) {
      console.error('Failed to create sprint:', err);
      alert('Failed to create sprint');
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      await api.put(`/api/sprints/${sprintId}`, { status: 'active' });
      fetchSprints();
    } catch (err) {
      console.error('Failed to start sprint:', err);
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    try {
      await api.put(`/api/sprints/${sprintId}`, { status: 'completed' });
      fetchSprints();
    } catch (err) {
      console.error('Failed to complete sprint:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: '#f59e0b',
      active: '#10b981',
      completed: '#0070f3'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#131313' }}>
        <SideNav />
        <TopHeader />
        <div style={{ marginLeft: '256px', padding: '40px', display: 'flex', justifyContent: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#0070f3' }}>sync</span>
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}
        >
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#e5e2e1', margin: '0 0 8px' }}>
              Sprints
            </h1>
            <p style={{ color: '#c1c6d7', fontSize: '15px', margin: 0 }}>
              Agile sprint planning and management
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #0070f3, #6807ba)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span className="material-symbols-outlined">add</span>
            Create Sprint
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}
        >
          {[
            { label: 'Total Sprints', value: sprints.length, icon: 'sprint', color: '#0070f3' },
            { label: 'Active', value: sprints.filter(s => s.status === 'active').length, icon: 'play_circle', color: '#10b981' },
            { label: 'Planning', value: sprints.filter(s => s.status === 'planning').length, icon: 'edit', color: '#f59e0b' },
            { label: 'Completed', value: sprints.filter(s => s.status === 'completed').length, icon: 'check_circle', color: '#6807ba' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              style={{
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
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
                color: stat.color
              }}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#e5e2e1' }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: '#8b90a0' }}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Sprints List */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Sprints Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e5e2e1', margin: '0 0 20px' }}>
              All Sprints
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <AnimatePresence>
                {sprints.map((sprint, index) => (
                  <motion.div
                    key={sprint.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    onClick={() => fetchSprintDetails(sprint.id)}
                    style={{
                      padding: '16px',
                      background: activeSprint?.id === sprint.id ? 'rgba(0, 112, 243, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      border: `1px solid ${activeSprint?.id === sprint.id ? '#0070f3' : 'rgba(255, 255, 255, 0.05)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#e5e2e1', margin: 0 }}>
                          {sprint.name}
                        </h4>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: `${getStatusColor(sprint.status)}15`,
                          color: getStatusColor(sprint.status),
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {sprint.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#8b90a0', margin: '0 0 4px' }}>
                        {sprint.project_name}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#c1c6d7' }}>
                        <span>{sprint.task_count} tasks</span>
                        <span>{sprint.completed_tasks} done</span>
                      </div>
                    </div>
                    
                    {sprint.status === 'planning' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); handleStartSprint(sprint.id); }}
                        style={{
                          padding: '8px 16px',
                          background: '#10b981',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Start
                      </motion.button>
                    )}
                    
                    {sprint.status === 'active' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); handleCompleteSprint(sprint.id); }}
                        style={{
                          padding: '8px 16px',
                          background: '#0070f3',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Complete
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {sprints.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8b90a0' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 16 }}>sprint</span>
                  <p>No sprints yet. Create your first sprint!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sprint Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            {activeSprint ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e5e2e1', margin: '0 0 4px' }}>
                      {activeSprint.name}
                    </h2>
                    <p style={{ color: '#8b90a0', fontSize: '14px', margin: 0 }}>
                      {activeSprint.goal}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    background: `${getStatusColor(activeSprint.status)}15`,
                    color: getStatusColor(activeSprint.status),
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {activeSprint.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#c1c6d7' }}>Progress</span>
                    <span style={{ fontSize: '13px', color: '#e5e2e1', fontWeight: 600 }}>
                      {burndownData ? `${Math.round(burndownData.progress_percentage)}%` : '0%'}
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${burndownData?.progress_percentage || 0}%` }}
                      transition={{ duration: 1 }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #0070f3, #10b981)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#e5e2e1' }}>
                      {burndownData?.total_tasks || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8b90a0' }}>Total Tasks</div>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                      {burndownData?.completed_tasks || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8b90a0' }}>Completed</div>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>
                      {burndownData?.remaining_tasks || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8b90a0' }}>Remaining</div>
                  </div>
                </div>

                {/* Dates */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ flex: 1, padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#8b90a0', marginBottom: '4px' }}>START DATE</div>
                    <div style={{ fontSize: '14px', color: '#e5e2e1' }}>
                      {new Date(activeSprint.start_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#8b90a0', marginBottom: '4px' }}>END DATE</div>
                    <div style={{ fontSize: '14px', color: '#e5e2e1' }}>
                      {new Date(activeSprint.end_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8b90a0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 16 }}>sprint</span>
                <p>Select a sprint to view details</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Create Sprint Modal */}
      <AnimatePresence>
        {showCreateModal && (
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
              padding: '24px'
            }}
            onClick={() => setShowCreateModal(false)}
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
                maxWidth: '500px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#e5e2e1', margin: '0 0 24px' }}>
                Create Sprint
              </h2>
              
              <form onSubmit={handleCreateSprint}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#c1c6d7', marginBottom: '8px' }}>
                    Sprint Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Sprint 3 - Performance Optimization"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#131313',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#e5e2e1',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#c1c6d7', marginBottom: '8px' }}>
                    Project *
                  </label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#131313',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#e5e2e1',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select a project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#c1c6d7', marginBottom: '8px' }}>
                    Sprint Goal
                  </label>
                  <textarea
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    placeholder="What do you want to achieve in this sprint?"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#131313',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#e5e2e1',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#c1c6d7', marginBottom: '8px' }}>
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#131313',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#e5e2e1',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#c1c6d7', marginBottom: '8px' }}>
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#131313',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#e5e2e1',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#e5e2e1',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
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
                      cursor: 'pointer'
                    }}
                  >
                    Create Sprint
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
