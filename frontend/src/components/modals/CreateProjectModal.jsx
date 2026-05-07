import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

const projectIcons = [
  { id: 'token', icon: 'token', label: 'Token' },
  { id: 'rocket', icon: 'rocket_launch', label: 'Rocket' },
  { id: 'code', icon: 'code', label: 'Code' },
  { id: 'design', icon: 'palette', label: 'Design' },
  { id: 'business', icon: 'business', label: 'Business' },
  { id: 'science', icon: 'science', label: 'Science' },
];

const projectColors = [
  { id: 'primary', color: '#0070f3', label: 'Blue' },
  { id: 'secondary', color: '#6807ba', label: 'Purple' },
  { id: 'tertiary', color: '#e60073', label: 'Pink' },
  { id: 'success', color: '#10b981', label: 'Green' },
  { id: 'warning', color: '#f59e0b', label: 'Orange' },
  { id: 'error', color: '#ef4444', label: 'Red' },
];

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'token',
    color: 'primary',
    status: 'active',
    due_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/projects', formData);
      onProjectCreated(response.data);
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        icon: 'token',
        color: 'primary',
        status: 'active',
        due_date: '',
      });
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err.response?.data?.detail || 'Failed to create project');
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
              Create New Project
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
            {/* Project Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#c1c6d7', marginBottom: '8px' }}>
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
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
                placeholder="Enter project description"
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

            {/* Icon Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#c1c6d7', marginBottom: '12px' }}>
                Project Icon
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {projectIcons.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: icon.id })}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      border: formData.icon === icon.id ? '2px solid #0070f3' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: formData.icon === icon.id ? 'rgba(0, 112, 243, 0.2)' : '#131313',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ color: '#e5e2e1' }}>
                      {icon.icon}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#c1c6d7', marginBottom: '12px' }}>
                Project Color
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {projectColors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.id })}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: formData.color === color.id ? '3px solid #fff' : '2px solid transparent',
                      background: color.color,
                      cursor: 'pointer',
                    }}
                  />
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
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
