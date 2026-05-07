import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import NotificationDropdown from '../notifications/NotificationDropdown';

export default function TopHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Search projects
      const projectsRes = await api.get(`/api/projects`);
      const tasksRes = await api.get(`/api/tasks`);
      
      const filteredProjects = projectsRes.data.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      );
      
      const filteredTasks = tasksRes.data.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description?.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults([
        ...filteredProjects.map(p => ({ ...p, type: 'project' })),
        ...filteredTasks.map(t => ({ ...t, type: 'task' }))
      ]);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const handleResultClick = (result) => {
    setShowResults(false);
    setSearchQuery('');
    if (result.type === 'project') {
      navigate('/kanban');
    } else {
      navigate(`/tasks/${result.id}`);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'rgba(19, 19, 19, 0.7)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 40px 60px -15px rgba(0, 0, 0, 0.3)',
      height: '64px',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginLeft: '256px', // Account for side nav
    }}>
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span 
            className="material-symbols-outlined" 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#c1c6d7',
              fontSize: '18px',
              zIndex: 1,
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search projects and tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
            style={{
              background: '#201f1f',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              padding: '6px 16px 6px 40px',
              color: '#e5e2e1',
              fontSize: '14px',
              width: '300px',
              outline: 'none',
              transition: 'all 0.3s',
            }}
          />
          
          {/* Search Results Dropdown */}
          {showResults && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                background: '#1a1a1a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                maxHeight: '400px',
                overflow: 'auto',
                zIndex: 100,
              }}
              onMouseLeave={() => setShowResults(false)}
            >
              {isSearching ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#c1c6d7' }}>
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#c1c6d7' }}>
                  No results found
                </div>
              ) : (
                <div>
                  {searchResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span className="material-symbols-outlined" style={{ color: '#c1c6d7' }}>
                        {result.type === 'project' ? 'folder' : 'task_alt'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', color: '#e5e2e1', fontWeight: 500 }}>
                          {result.name || result.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#8b90a0' }}>
                          {result.type === 'project' ? 'Project' : `Task • ${result.task_key}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '24px' }}>
          <Link to="/projects" style={{ 
            color: location.pathname === '/projects' ? '#aec6ff' : '#c1c6d7', 
            textDecoration: 'none', 
            fontSize: '14px',
            borderBottom: location.pathname === '/projects' ? '2px solid #0070f3' : '2px solid transparent',
            paddingBottom: '4px',
            transition: 'all 0.3s',
          }}>
            Projects
          </Link>
          <Link to="/activity" style={{ 
            color: location.pathname === '/activity' ? '#aec6ff' : '#c1c6d7', 
            textDecoration: 'none', 
            fontSize: '14px',
            borderBottom: location.pathname === '/activity' ? '2px solid #0070f3' : '2px solid transparent',
            paddingBottom: '4px',
            transition: 'all 0.3s',
          }}>
            Activity
          </Link>
          <Link to="/team" style={{ 
            color: location.pathname === '/team' ? '#aec6ff' : '#c1c6d7', 
            textDecoration: 'none', 
            fontSize: '14px',
            borderBottom: location.pathname === '/team' ? '2px solid #0070f3' : '2px solid transparent',
            paddingBottom: '4px',
            transition: 'all 0.3s',
          }}>
            Team
          </Link>
        </nav>
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Support */}
        <motion.button 
          whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            color: '#c1c6d7',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>support_agent</span>
          Support
        </motion.button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Profile */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          cursor: 'pointer',
        }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ 
              fontSize: '14px', 
              fontWeight: 700, 
              color: '#e5e2e1',
              margin: 0,
              lineHeight: 1.2,
            }}>
              {user?.name || 'User'}
            </p>
            <p style={{ 
              fontSize: '11px', 
              color: '#c1c6d7',
              margin: 0,
            }}>
              {user?.role || 'Member'}
            </p>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '2px solid #0070f3',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0070f3, #6807ba)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ 
              fontSize: '16px', 
              fontWeight: 700, 
              color: '#fff',
            }}>
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
