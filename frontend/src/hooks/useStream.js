/**
 * useStream — React hook for consuming SSE streams from the Tripify orchestrator.
 *
 * Usage:
 *   const { events, isStreaming, startStream, agentLog } = useStream();
 *
 *   // 1. Start an SSE session
 *   const sessionId = await startStream();
 *
 *   // 2. Trigger orchestration with that sessionId
 *   await api.post('/orchestrate/plan', { prompt, sessionId });
 *
 *   // 3. Watch `events` for real-time updates
 */
import { useState, useRef, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:4000/api' : '/_/backend/api');

export function useStream() {
  const [events, setEvents]       = useState([]);
  const [isStreaming, setStreaming] = useState(false);
  const [agentLog, setAgentLog]   = useState([]);  // { agent, status, ts }
  const [sessionId, setSessionId] = useState(null);
  const esRef = useRef(null);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setAgentLog([]);
  }, []);

  /**
   * Open an SSE session and return the sessionId.
   * Automatically handles all incoming event types.
   */
  const startStream = useCallback((onEvent) => {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('accessToken');
      if (!token) return reject(new Error('Not authenticated'));

      clearEvents();
      setStreaming(true);

      // Open SSE connection
      // Note: EventSource doesn't support custom headers natively in all browsers.
      // We embed the token in the URL as a query param (acceptable for SSE).
      const url = `${API_BASE}/stream/session?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      esRef.current = es;

      let resolved = false;

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);

          // First event is always session_ready
          if (event.type === 'session_ready' && !resolved) {
            resolved = true;
            setSessionId(event.sessionId);
            resolve(event.sessionId);
          }

          // Track agent activity
          if (event.type === 'agent_start' || event.type === 'agent_done' || event.type === 'agent_error') {
            setAgentLog(prev => [...prev, {
              agent:  event.agent,
              status: event.type === 'agent_start' ? 'running' : event.type === 'agent_done' ? 'done' : 'error',
              ts:     Date.now(),
            }]);
          }

          // Stream end
          if (event.type === 'stream_end') {
            setStreaming(false);
            es.close();
          }

          // Accumulate all events for consumers
          setEvents(prev => [...prev, event]);
          if (onEvent) onEvent(event);
        } catch { /* ignore malformed events */ }
      };

      es.onerror = (err) => {
        setStreaming(false);
        es.close();
        if (!resolved) reject(new Error('SSE connection failed'));
      };
    });
  }, [clearEvents]);

  /** Manually close the stream */
  const stopStream = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setStreaming(false);
  }, []);

  return { events, isStreaming, agentLog, sessionId, startStream, stopStream, clearEvents };
}
