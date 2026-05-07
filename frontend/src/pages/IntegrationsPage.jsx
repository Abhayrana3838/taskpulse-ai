import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SideNav from '../components/layout/SideNav';
import TopHeader from '../components/layout/TopHeader';
import api from '../lib/api';
import DashboardBackground from '../components/three/DashboardBackground';

const integrationsList = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Link commits, pull requests, and issues to tasks',
    icon: 'code',
    color: '#333',
    features: ['Auto-link commits', 'PR status tracking', 'Issue sync'],
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Connect merge requests and repositories',
    icon: 'code',
    color: '#fc6d26',
    features: ['MR tracking', 'CI/CD pipeline status', 'Repository sync'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications and updates in your channels',
    icon: 'chat',
    color: '#4a154b',
    features: ['Task notifications', 'Slash commands', 'Channel alerts'],
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Receive project updates in Discord servers',
    icon: 'chat_bubble',
    color: '#5865f2',
    features: ['Bot notifications', 'Server alerts', 'Role mentions'],
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Import and sync issues from Jira',
    icon: 'assignment',
    color: '#0052cc',
    features: ['Issue import', 'Two-way sync', 'Field mapping'],
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Import boards and cards from Trello',
    icon: 'view_kanban',
    color: '#0079bf',
    features: ['Board import', 'Card sync', 'List mapping'],
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [integrationsRes, projectsRes] = await Promise.all([
        api.get('/api/integrations').catch(() => ({ data: [] })),
        api.get('/api/projects').catch(() => ({ data: [] })),
      ]);
      setIntegrations(integrationsRes.data || []);
      setProjects(projectsRes.data || []);
      if (projectsRes.data && projectsRes.data.length > 0) {
        setSelectedProject(projectsRes.data[0]);
      }
    } catch (err) {
      console.error('Failed to load integrations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (integrationId) => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }
    
    setConnecting(integrationId);
    
    // Simulate connection process
    setTimeout(() => {
      setConnecting(null);
      alert(`${integrationId} integration configured! In a real app, this would open OAuth flow.`);
    }, 1500);
  };

  const isConnected = (integrationId) => {
    return integrations.some(i => i.provider === integrationId && i.status === 'active');
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
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '12px', color: '#0070f3' }}>integration_instructions</span>
              Integrations
            </h1>
            <p style={{ color: '#8b90a0', fontSize: '16px', margin: 0 }}>
              Connect TaskPulse AI with your favorite tools
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

        {/* Connected Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Connected', value: integrations.filter(i => i.status === 'active').length, icon: 'link', color: '#10b981' },
            { label: 'Available', value: integrationsList.length, icon: 'apps', color: '#0070f3' },
            { label: 'Webhooks', value: integrations.filter(i => i.webhook_url).length, icon: 'webhook', color: '#6807ba' },
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

        {/* Integrations Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {integrationsList.map((integration, index) => {
            const connected = isConnected(integration.id);
            
            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'rgba(10, 10, 10, 0.7)',
                  border: connected ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: integration.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '24px' }}>{integration.icon}</span>
                  </div>
                  <div>
                    <h3 style={{ color: '#e5e2e1', margin: '0 0 4px', fontSize: '18px' }}>{integration.name}</h3>
                    {connected && (
                      <span style={{ 
                        padding: '4px 8px', 
                        background: 'rgba(16, 185, 129, 0.2)', 
                        color: '#10b981',
                        borderRadius: '4px',
                        fontSize: '11px',
                      }}>
                        Connected
                      </span>
                    )}
                  </div>
                </div>
                
                <p style={{ color: '#8b90a0', fontSize: '14px', margin: '0 0 16px', lineHeight: 1.5 }}>
                  {integration.description}
                </p>
                
                <div style={{ marginBottom: '20px' }}>
                  {integration.features.map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="material-symbols-outlined" style={{ color: '#0070f3', fontSize: '14px' }}>check_circle</span>
                      <span style={{ color: '#c1c6d7', fontSize: '13px' }}>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => handleConnect(integration.id)}
                  disabled={connecting === integration.id}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: connected ? 'transparent' : '#0070f3',
                    border: connected ? '1px solid #10b981' : 'none',
                    borderRadius: '8px',
                    color: connected ? '#10b981' : '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {connecting === integration.id ? (
                    <>
                      <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
                      Connecting...
                    </>
                  ) : connected ? (
                    <>
                      <span className="material-symbols-outlined">settings</span>
                      Configure
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">add_link</span>
                      Connect
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Webhook URL Info */}
        {selectedProject && (
          <div className="glass-card" style={{ marginTop: '32px', padding: '24px', borderRadius: '16px', background: 'rgba(10, 10, 10, 0.7)' }}>
            <h3 style={{ color: '#e5e2e1', margin: '0 0 16px' }}>Webhook URLs</h3>
            <p style={{ color: '#8b90a0', fontSize: '14px', margin: '0 0 16px' }}>
              Use these URLs to send events from external tools:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['github', 'gitlab', 'slack'].map(provider => (
                <div key={provider} style={{ 
                  padding: '12px 16px', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span style={{ color: '#8b90a0', textTransform: 'uppercase', fontSize: '12px', fontWeight: 600, minWidth: '80px' }}>
                    {provider}
                  </span>
                  <code style={{ 
                    flex: 1,
                    color: '#aec6ff', 
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    http://localhost:8000/webhook/{provider}/{selectedProject.id}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`http://localhost:8000/webhook/${provider}/${selectedProject.id}`);
                      alert('Copied to clipboard!');
                    }}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(0, 112, 243, 0.2)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#aec6ff',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
