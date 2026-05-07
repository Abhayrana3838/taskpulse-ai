import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SideNav from '../components/layout/SideNav';
import TopHeader from '../components/layout/TopHeader';
import api from '../lib/api';
import DashboardBackground from '../components/three/DashboardBackground';

export default function TimeTrackingPage() {
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState('');
  const [description, setDescription] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (isRunning) {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, tasksRes] = await Promise.all([
        api.get('/api/time').catch(() => ({ data: [] })),
        api.get('/api/tasks').catch(() => ({ data: [] })),
      ]);
      setTimeEntries(entriesRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (err) {
      console.error('Failed to load time data', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    if (!selectedTask) {
      alert('Please select a task first');
      return;
    }
    setIsRunning(true);
    setActiveTimer({
      task_id: selectedTask,
      description,
      start_time: new Date().toISOString(),
    });
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;
    
    setIsRunning(false);
    const hours = elapsedTime / 3600;
    
    try {
      await api.post('/api/time', {
        task_id: activeTimer.task_id,
        hours: parseFloat(hours.toFixed(2)),
        description: activeTimer.description,
      });
      
      setActiveTimer(null);
      setElapsedTime(0);
      setDescription('');
      fetchData();
    } catch (err) {
      console.error('Failed to save time entry', err);
    }
  };

  const getTotalHours = () => {
    return timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0).toFixed(1);
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
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '12px', color: '#0070f3' }}>schedule</span>
              Time Tracking
            </h1>
            <p style={{ color: '#8b90a0', fontSize: '16px', margin: 0 }}>
              Track time spent on tasks and projects
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Today', value: '4.5h', icon: 'today', color: '#0070f3' },
            { label: 'This Week', value: '28.5h', icon: 'calendar_view_week', color: '#6807ba' },
            { label: 'This Month', value: '124h', icon: 'calendar_month', color: '#10b981' },
            { label: 'Total Logged', value: `${getTotalHours()}h`, icon: 'timer', color: '#f59e0b' },
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
                <span className="material-symbols-outlined" style={{ color: stat.color, fontSize: '28px' }}>{stat.icon}</span>
                <div>
                  <p style={{ color: '#8b90a0', fontSize: '12px', margin: '0 0 4px' }}>{stat.label}</p>
                  <p style={{ color: '#e5e2e1', fontSize: '24px', fontWeight: 700, margin: 0 }}>{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timer */}
        <div className="glass-card" style={{ padding: '32px', borderRadius: '16px', background: 'rgba(10, 10, 10, 0.7)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {/* Task Selector */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', color: '#8b90a0', marginBottom: '8px', fontSize: '12px' }}>Select Task</label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                disabled={isRunning}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e5e2e1',
                  fontSize: '14px',
                }}
              >
                <option value="">Choose a task...</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>{task.task_key} - {task.title}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div style={{ flex: 2, minWidth: '200px' }}>
              <label style={{ display: 'block', color: '#8b90a0', marginBottom: '8px', fontSize: '12px' }}>What are you working on?</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isRunning}
                placeholder="Describe your work..."
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e5e2e1',
                  fontSize: '14px',
                }}
              />
            </div>

            {/* Timer Display */}
            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <div style={{ fontSize: '48px', fontWeight: 700, color: isRunning ? '#10b981' : '#e5e2e1', fontFamily: 'monospace' }}>
                {formatTime(elapsedTime)}
              </div>
            </div>

            {/* Start/Stop Button */}
            <button
              onClick={isRunning ? handleStopTimer : handleStartTimer}
              style={{
                padding: '16px 32px',
                background: isRunning ? '#ef4444' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="material-symbols-outlined">{isRunning ? 'stop' : 'play_arrow'}</span>
              {isRunning ? 'Stop Timer' : 'Start Timer'}
            </button>
          </div>
        </div>

        {/* Time Entries */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(10, 10, 10, 0.7)' }}>
          <h3 style={{ color: '#e5e2e1', margin: '0 0 20px' }}>Recent Time Entries</h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8b90a0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>sync</span>
            </div>
          ) : timeEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8b90a0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '16px' }}>schedule</span>
              <p>No time entries yet. Start the timer to track your work.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {timeEntries.slice(0, 10).map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    background: 'rgba(0, 112, 243, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ color: '#0070f3' }}>timer</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#e5e2e1', margin: '0 0 4px', fontSize: '14px' }}>
                      {entry.task?.title || 'Unknown Task'}
                    </h4>
                    <p style={{ color: '#8b90a0', margin: 0, fontSize: '12px' }}>
                      {entry.description || 'No description'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#e5e2e1', margin: '0 0 4px', fontSize: '18px', fontWeight: 600 }}>
                      {entry.hours}h
                    </p>
                    <p style={{ color: '#8b90a0', margin: 0, fontSize: '11px' }}>
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
