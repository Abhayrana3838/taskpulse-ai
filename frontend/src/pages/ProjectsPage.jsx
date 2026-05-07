import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import CreateProjectModal from '../components/modals/CreateProjectModal';
import { useRealtimeProjects } from '../hooks/useWebSocket';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200 } } };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/api/projects');
        setProjects(data);
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Real-time project updates
  useRealtimeProjects((newProjects) => {
    setProjects(newProjects);
  });

  if (loading) return <div style={{ color: 'var(--on-surface-variant)' }}>Loading projects...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 className="headline-lg" style={{ marginBottom: 8 }}>Projects</h1>
          <p style={{ color: 'var(--on-surface-variant)' }}>Manage and track your active initiatives.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4 }}>
            <button style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Active</button>
            <button style={{ padding: '6px 16px', background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', fontSize: 13, cursor: 'pointer' }}>Archived</button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', background: 'linear-gradient(135deg,#0070f3,#6807ba)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(0,112,243,0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span> New Project
          </button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
        {/* Create New Card */}
        <motion.div 
          variants={fadeUp} 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={() => setIsModalOpen(true)}
          style={{
            minHeight: 240, borderRadius: 16, border: '2px dashed rgba(255,255,255,0.15)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'all 0.3s',
          }} 
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(0,112,243,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--on-surface-variant)' }}>add</span>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface)' }}>Create Project</h3>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>Start a new initiative</p>
        </motion.div>

        {/* Project Cards */}
        {projects.map(p => (
          <motion.div key={p.id} variants={fadeUp} className="glass-card glass-card-hover"
            onClick={() => nav('/kanban')}
            style={{ padding: 24, borderRadius: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `var(--${p.color}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: `var(--${p.color})`, fontSize: 24 }}>{p.icon}</span>
              </div>
              <span className="label-caps" style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--on-surface-variant)' }}>{p.status.toUpperCase()}</span>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 8 }}>{p.name}</h3>
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.5, flex: 1, marginBottom: 24, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {p.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex' }}>
                {[...Array(Math.min(p.member_count || 1, 4))].map((_, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-container-high)', border: '2px solid var(--surface-container-lowest)', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                    {i === 3 ? '+' : 'U'}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)' }}>{p.due_date}</span>
            </div>

            {/* Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>Progress</span>
                <span style={{ color: 'var(--on-surface)', fontWeight: 700 }}>{Math.round(p.progress)}%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 1, ease: "easeOut" }}
                  style={{ height: '100%', background: `var(--${p.color})`, borderRadius: 3 }} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={(newProject) => setProjects([...projects, newProject])}
      />
    </div>
  );
}
