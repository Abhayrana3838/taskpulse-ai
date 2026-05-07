import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

export default function TimeTrackingModal({ isOpen, onClose, taskId, taskTitle }) {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    hours: 0,
    minutes: 0,
  });
  const [totalTime, setTotalTime] = useState({ minutes: 0, formatted: '0h 0m' });

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTimeEntries();
      fetchTimeSummary();
    }
  }, [isOpen, taskId]);

  const fetchTimeEntries = async () => {
    try {
      const res = await api.get(`/api/time/task/${taskId}`);
      setTimeEntries(res.data);
    } catch (err) {
      console.error('Failed to load time entries:', err);
    }
  };

  const fetchTimeSummary = async () => {
    try {
      const res = await api.get(`/api/time/summary/task/${taskId}`);
      setTotalTime({
        minutes: res.data.total_minutes,
        formatted: res.data.total_formatted,
      });
    } catch (err) {
      console.error('Failed to load time summary:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.hours === 0 && formData.minutes === 0) return;

    setLoading(true);
    try {
      const durationMinutes = (formData.hours * 60) + formData.minutes;
      await api.post('/api/time/track', {
        task_id: taskId,
        description: formData.description,
        duration_minutes: durationMinutes,
      });
      
      // Reset form
      setFormData({ description: '', hours: 0, minutes: 0 });
      
      // Refresh data
      await fetchTimeEntries();
      await fetchTimeSummary();
    } catch (err) {
      console.error('Failed to log time:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
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
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e5e2e1', margin: '0 0 4px' }}>
                Time Tracking
              </h2>
              <p style={{ fontSize: '14px', color: '#8b90a0', margin: 0 }}>{taskTitle}</p>
            </div>
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

          {/* Total Time Display */}
          <div style={{
            padding: '24px',
            background: 'rgba(0, 112, 243, 0.05)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center',
          }}>
            <motion.div
              key={totalTime.formatted}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#aec6ff',
                marginBottom: '4px',
              }}
            >
              {totalTime.formatted}
            </motion.div>
            <p style={{ fontSize: '13px', color: '#8b90a0', margin: 0 }}>Total time logged</p>
          </div>

          {/* Add Time Form */}
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#e5e2e1', margin: '0 0 16px' }}>
              Log Time
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#c1c6d7', marginBottom: '8px' }}>
                  Work Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What did you work on?"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#131313',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#e5e2e1',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#c1c6d7', marginBottom: '8px' }}>
                    Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#131313',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#e5e2e1',
                      fontSize: '14px',
                      outline: 'none',
                      textAlign: 'center',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#c1c6d7', marginBottom: '8px' }}>
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={formData.minutes}
                    onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#131313',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#e5e2e1',
                      fontSize: '14px',
                      outline: 'none',
                      textAlign: 'center',
                    }}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || (formData.hours === 0 && formData.minutes === 0)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #0070f3, #6807ba)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading || (formData.hours === 0 && formData.minutes === 0) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span className="material-symbols-outlined">play_arrow</span>
                {loading ? 'Logging...' : 'Log Time'}
              </motion.button>
            </form>
          </div>

          {/* Time Entries List */}
          <div style={{ padding: '24px', maxHeight: '300px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#e5e2e1', margin: '0 0 16px' }}>
              Recent Entries
            </h3>
            {timeEntries.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#8b90a0', padding: '20px' }}>
                No time logged yet
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <AnimatePresence>
                  {timeEntries.slice(0, 5).map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '14px', color: '#e5e2e1', margin: '0 0 2px' }}>
                          {entry.description || 'No description'}
                        </p>
                        <p style={{ fontSize: '12px', color: '#8b90a0', margin: 0 }}>
                          {entry.user_name} • {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        background: 'rgba(0, 112, 243, 0.1)',
                        borderRadius: '6px',
                        color: '#aec6ff',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}>
                        {formatDuration(entry.duration_minutes)}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
