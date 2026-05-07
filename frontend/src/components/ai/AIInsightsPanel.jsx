import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';

const getInsightIcon = (type) => {
  switch (type) {
    case 'time_estimate':
      return 'schedule';
    case 'assignment_recommendation':
      return 'person_add';
    case 'duplicate_detection':
      return 'content_copy';
    case 'sentiment_analysis':
      return 'sentiment_satisfied';
    case 'risk_assessment':
      return 'warning';
    case 'urgency_alert':
      return 'notifications_active';
    default:
      return 'psychology';
  }
};

const getInsightColor = (type) => {
  switch (type) {
    case 'time_estimate':
      return '#0070f3';
    case 'assignment_recommendation':
      return '#6807ba';
    case 'duplicate_detection':
      return '#f59e0b';
    case 'risk_assessment':
    case 'urgency_alert':
      return '#ef4444';
    case 'sentiment_analysis':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

const getConfidenceBadge = (score) => {
  if (score >= 0.8) return { text: 'High', color: '#10b981' };
  if (score >= 0.6) return { text: 'Medium', color: '#f59e0b' };
  return { text: 'Low', color: '#ef4444' };
};

export default function AIInsightsPanel({ insights }) {
  const [dismissing, setDismissing] = useState(null);
  const unreadCount = insights.filter(i => !i.is_read).length;

  const handleDismiss = async (insightId) => {
    setDismissing(insightId);
    try {
      await api.post(`/api/ai/insights/${insightId}/mark-read`);
    } catch (err) {
      console.error('Failed to dismiss insight:', err);
    } finally {
      setDismissing(null);
    }
  };

  return (
    <motion.div 
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      style={{ 
        borderRadius: '16px', 
        padding: '24px',
        background: 'rgba(10, 10, 10, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #0070f3, #6807ba)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '24px' }}>auto_awesome</span>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#e5e2e1', margin: '0 0 2px' }}>
              AI Insights
            </h4>
            <p style={{ fontSize: '12px', color: '#8b90a0', margin: 0 }}>
              {unreadCount > 0 ? `${unreadCount} new recommendation${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <span className="material-symbols-outlined" style={{ color: '#0070f3', fontSize: '24px' }}>sync</span>
        </motion.div>
      </div>

      {/* Insights List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
        {insights.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#8b90a0',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>psychology</span>
            <p style={{ fontSize: '14px', margin: 0 }}>AI is analyzing your projects...</p>
            <p style={{ fontSize: '12px', margin: '8px 0 0', opacity: 0.7 }}>Insights will appear here as they are generated</p>
          </div>
        )}

        {insights.slice(0, 5).map((insight, index) => {
          const icon = getInsightIcon(insight.insight_type);
          const color = getInsightColor(insight.insight_type);
          const confidence = getConfidenceBadge(insight.confidence_score);
          const isUnread = !insight.is_read;

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ 
                padding: '16px',
                borderRadius: '12px',
                background: isUnread ? 'rgba(0, 112, 243, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isUnread ? 'rgba(0, 112, 243, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => handleDismiss(insight.id)}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                {/* Icon */}
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px',
                  background: `${color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span className="material-symbols-outlined" style={{ color, fontSize: '20px' }}>{icon}</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#e5e2e1',
                      flex: 1,
                    }}>
                      {insight.title}
                    </span>
                    {isUnread && (
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: '#0070f3',
                        flexShrink: 0,
                      }} />
                    )}
                  </div>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#8b90a0', 
                    margin: '0 0 8px',
                    lineHeight: 1.4,
                  }}>
                    {insight.description}
                  </p>
                  
                  {/* Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '10px', 
                      background: `${confidence.color}20`,
                      color: confidence.color,
                      fontWeight: 500,
                    }}>
                      {confidence.text} confidence
                    </span>
                    <span style={{ color: '#6b7280' }}>•</span>
                    <span style={{ color: '#6b7280' }}>
                      {new Date(insight.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Dismiss button */}
                {isUnread && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(insight.id);
                    }}
                    disabled={dismissing === insight.id}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {dismissing === insight.id ? 'hourglass_empty' : 'close'}
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        {insights.length > 5 && (
          <button style={{
            padding: '12px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#0070f3',
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '8px',
          }}>
            View all {insights.length} insights
          </button>
        )}
      </div>

      {/* AI Status */}
      <div style={{ 
        marginTop: '20px', 
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'rgba(0, 112, 243, 0.05)',
        border: '1px solid rgba(0, 112, 243, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span className="material-symbols-outlined" style={{ color: '#0070f3', fontSize: '16px' }}>info</span>
        <span style={{ fontSize: '12px', color: '#8b90a0' }}>
          AI analyzes tasks, predicts risks, and suggests optimizations
        </span>
      </div>
    </motion.div>
  );
}
