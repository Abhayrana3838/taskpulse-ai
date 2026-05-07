import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const getNotificationIcon = (type) => {
  const icons = {
    mention: 'alternate_email',
    assignment: 'assignment_ind',
    update: 'update',
    comment: 'chat_bubble',
  };
  return icons[type] || 'notifications';
};

const getNotificationColor = (type) => {
  const colors = {
    mention: '#e60073',
    assignment: '#0070f3',
    update: '#f59e0b',
    comment: '#10b981',
  };
  return colors[type] || '#c1c6d7';
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Poll for new notifications
  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 10000);
    fetchUnreadCount();
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/notifications?limit=20');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/api/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    
    if (notification.entity_type === 'task' && notification.entity_id) {
      navigate(`/tasks/${notification.entity_id}`);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Notification Bell Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: isOpen ? 'rgba(0, 112, 243, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: isOpen ? '#aec6ff' : '#c1c6d7',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.span 
          className="material-symbols-outlined"
          animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 3 }}
          style={{ fontSize: '22px' }}
        >
          {unreadCount > 0 ? 'notifications_active' : 'notifications'}
        </motion.span>

        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#ef4444',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              width: '380px',
              maxHeight: '500px',
              background: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              zIndex: 1000,
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#e5e2e1' }}>
                  Notifications
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#8b90a0' }}>
                  {unreadCount} unread
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(0, 112, 243, 0.1)',
                  border: '1px solid rgba(0, 112, 243, 0.3)',
                  borderRadius: '8px',
                  color: '#aec6ff',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Mark all read
              </motion.button>
            </div>

            {/* Notification List */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#8b90a0' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>sync</span>
                  </motion.div>
                </div>
              ) : notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ padding: '40px', textAlign: 'center', color: '#8b90a0' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '12px' }}>
                    notifications_off
                  </span>
                  <p>No notifications yet</p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                      style={{
                        padding: '14px 20px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        background: notification.is_read ? 'transparent' : 'rgba(0, 112, 243, 0.05)',
                        position: 'relative',
                      }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      {/* Unread Indicator */}
                      {!notification.is_read && (
                        <motion.div
                          layoutId={`unread-${notification.id}`}
                          style={{
                            position: 'absolute',
                            left: '6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#0070f3',
                          }}
                        />
                      )}

                      {/* Icon */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: `${getNotificationColor(notification.type)}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: getNotificationColor(notification.type),
                        flexShrink: 0,
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: '0 0 4px',
                          fontSize: '14px',
                          color: notification.is_read ? '#c1c6d7' : '#e5e2e1',
                          fontWeight: notification.is_read ? 400 : 600,
                          lineHeight: 1.4,
                        }}>
                          {notification.title}
                        </p>
                        <p style={{
                          margin: '0 0 4px',
                          fontSize: '13px',
                          color: '#8b90a0',
                          lineHeight: 1.4,
                        }}>
                          {notification.message}
                        </p>
                        <span style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                            schedule
                          </span>
                          {notification.time_ago}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              textAlign: 'center',
            }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setIsOpen(false);
                  navigate('/activity');
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#c1c6d7',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                View all activity
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
