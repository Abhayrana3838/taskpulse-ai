import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

const priorities = [
  { id: 'low', label: 'Low', color: '#10b981' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'high', label: 'High', color: '#ef4444' },
];

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated, projectId }) {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: projectId || '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch projects for dropdown
    const fetchProjects = async () => {
      try {
        const res = await api.get('/api/projects');
        setProjects(res.data);
        if (!projectId && res.data.length > 0) {
          setFormData(prev => ({ ...prev, project_id: res.data[0].id }));
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };
    if (isOpen) fetchProjects();
  }, [isOpen, projectId]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/tasks', formData);
      onTaskCreated(response.data);
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        project_id: projectId || '',
        priority: 'medium',
        status: 'todo',
        due_date: '',
        tags: [],
      });
    } catch (err) {
      console.error('Failed to create task:', err);
      setError(err.response?.data?.detail || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#e5e2e1', margin: 0 }}>
              Create New Task
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#c1c6d7',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#ffb4ab',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Task Title */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#c1c6d7', marginBottom: '8px' }}>
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#131313',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#e5e2e1',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#c1c6d7', marginBottom: '8px' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#131313',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#e5e2e1',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Project Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#c1c6d7', marginBottom: '8px' }}>
                Project *
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: Number(e.target.value) })}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#131313',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#e5e2e1',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id} style={{ background: '#1a1a1a' }}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#c1c6d7', marginBottom: '12px' }}>
                Priority
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {priorities.map((priority) => (
                  <button
                    key={priority.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: priority.id })}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: formData.priority === priority.id ? `2px solid ${priority.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                      background: formData.priority === priority.id ? `${priority.color}20` : '#131313',
                      color: formData.priority === priority.id ? priority.color : '#c1c6d7',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#c1c6d7', marginBottom: '8px' }}>
                Tags (Press Enter to add)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#131313',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#e5e2e1',
                  fontSize: '14px',
                  outline: 'none',
                  marginBottom: '8px',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '4px 12px',
                      background: 'rgba(0, 112, 243, 0.1)',
                      border: '1px solid rgba(0, 112, 243, 0.3)',
                      borderRadius: '16px',
                      color: '#aec6ff',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#aec6ff',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#c1c6d7', marginBottom: '8px' }}>
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#131313',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#e5e2e1',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: '#c1c6d7',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #0070f3, #6807ba)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
