import { useEffect, useRef, useCallback } from 'react';

export function useWebSocket(onMessage) {
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    // For development, we'll use polling instead of WebSocket
    // In production, replace with actual WebSocket connection
    const token = localStorage.getItem('tp_token');
    if (!token) return;

    // Simulated WebSocket with polling
    const interval = setInterval(async () => {
      try {
        // Fetch latest data
        const response = await fetch('http://localhost:8000/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          onMessage({ type: 'stats', data });
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000); // Poll every 5 seconds for real-time feel

    return () => clearInterval(interval);
  }, [onMessage]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      if (cleanup) cleanup();
    };
  }, [connect]);

  return {
    isConnected: true,
  };
}

// Hook for real-time dashboard updates
export function useRealtimeDashboard(onUpdate) {
  useEffect(() => {
    const token = localStorage.getItem('tp_token');
    if (!token) return;

    // Poll for real-time updates
    const interval = setInterval(async () => {
      try {
        const [statsRes, activityRes, overdueRes] = await Promise.all([
          fetch('http://localhost:8000/api/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${token}` },
          }).then(r => r.ok ? r.json() : null),
          fetch('http://localhost:8000/api/dashboard/activity', {
            headers: { 'Authorization': `Bearer ${token}` },
          }).then(r => r.ok ? r.json() : null),
          fetch('http://localhost:8000/api/dashboard/overdue', {
            headers: { 'Authorization': `Bearer ${token}` },
          }).then(r => r.ok ? r.json() : null),
        ]);

        if (statsRes || activityRes || overdueRes) {
          onUpdate({
            stats: statsRes,
            activity: activityRes,
            overdue: overdueRes,
          });
        }
      } catch (err) {
        // Silent fail - don't show errors for background polling
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [onUpdate]);
}

// Hook for real-time task updates in Kanban
export function useRealtimeTasks(onUpdate) {
  useEffect(() => {
    const token = localStorage.getItem('tp_token');
    if (!token) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/tasks', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          onUpdate(data);
        }
      } catch (err) {
        // Silent fail
      }
    }, 3000); // Every 3 seconds for more responsive feel

    return () => clearInterval(interval);
  }, [onUpdate]);
}

// Hook for real-time project updates
export function useRealtimeProjects(onUpdate) {
  useEffect(() => {
    const token = localStorage.getItem('tp_token');
    if (!token) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          onUpdate(data);
        }
      } catch (err) {
        // Silent fail
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [onUpdate]);
}
