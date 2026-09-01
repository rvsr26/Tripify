/**
 * AgentActivityPanel
 * Real-time visualization of the AI orchestrator's agent activity.
 * Shows which agents are running, done, or failed — and progress messages.
 * This is the "WOW" panel that judges see during the demo.
 */
import React, { useEffect, useRef } from 'react';
import AgentDebateViewer from './AgentDebateViewer';

const AGENT_META = {
  planner:        { icon: '✨', label: 'Planning Agent',         color: '#a78bfa' },
  itinerary:      { icon: '📋', label: 'Itinerary Agent',        color: '#60a5fa' },
  weather:        { icon: '⛅', label: 'Weather Agent',          color: '#34d399' },
  safety:         { icon: '🛡️', label: 'Safety Agent',           color: '#f87171' },
  packing:        { icon: '🧳', label: 'Packing Agent',          color: '#fbbf24' },
  budget:         { icon: '💰', label: 'Budget Agent',           color: '#4ade80' },
  events:         { icon: '🎭', label: 'Events Agent',           color: '#f472b6' },
  emergency_plan: { icon: '🆘', label: 'Emergency Agent',        color: '#ef4444' },
  alt_flights:    { icon: '✈️', label: 'Flight Search Agent',    color: '#38bdf8' },
  alt_hotels:     { icon: '🏨', label: 'Hotel Search Agent',     color: '#a3e635' },
};

function AgentChip({ agent, status }) {
  const meta = AGENT_META[agent] || { icon: '🤖', label: agent, color: '#94a3b8' };
  const statusStyles = {
    running: { animation: 'pulse 1.2s infinite', opacity: 1 },
    done:    { opacity: 1 },
    error:   { opacity: 0.7 },
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 12px', borderRadius: '10px',
      background: status === 'running' ? `${meta.color}22` : status === 'done' ? `${meta.color}15` : '#ff444422',
      border: `1px solid ${status === 'error' ? '#ef4444' : meta.color}44`,
      transition: 'all 0.3s ease',
      ...statusStyles[status],
    }}>
      <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: meta.color }}>{meta.label}</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', marginTop: '1px' }}>
          {status === 'running' ? '⚡ Active...' : status === 'done' ? '✓ Complete' : '⚠ Error'}
        </div>
      </div>
      {status === 'running' && (
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: meta.color, marginLeft: 'auto',
          animation: 'pulse 1s infinite',
        }} />
      )}
      {status === 'done' && (
        <span style={{ marginLeft: 'auto', color: meta.color, fontSize: '0.9rem' }}>✓</span>
      )}
    </div>
  );
}

export default function AgentActivityPanel({ events = [], agentLog = [], isStreaming = false, style = {} }) {
  const logRef = useRef(null);

  // Auto-scroll the log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  // Extract progress messages
  const progressMessages = events
    .filter(e => e.type === 'progress' || e.type === 'start' || e.type === 'done' || e.type === 'error')
    .slice(-10); // last 10 messages

  // Build agent status map
  const agentStatus = {};
  agentLog.forEach(({ agent, status }) => {
    agentStatus[agent] = status;
  });

  const activeAgents  = agentLog.filter(a => a.status === 'running');
  const doneAgents    = agentLog.filter(a => a.status === 'done');
  const errorAgents   = agentLog.filter(a => a.status === 'error');

  if (!isStreaming && events.length === 0) return null;

  return (
    <div style={{
      background: 'var(--surface, #1e1e2e)',
      border: '1px solid var(--border-subtle, #333)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      ...style,
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: isStreaming ? '#4ade80' : '#94a3b8',
          animation: isStreaming ? 'pulse 1s infinite' : 'none',
        }} />
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0' }}>
          🤖 Tripify AI Orchestrator
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#94a3b8' }}>
          {isStreaming ? 'LIVE' : `${doneAgents.length} agents completed`}
        </span>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Agent Status Grid */}
        {agentLog.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '8px',
          }}>
            {[...new Map(agentLog.map(a => [a.agent, a])).values()].map(({ agent, status }) => (
              <AgentChip key={agent} agent={agent} status={status} />
            ))}
          </div>
        )}

        {/* Progress Log */}
        <div
          ref={logRef}
          style={{
            maxHeight: '180px', overflowY: 'auto',
            background: '#0f0f1a',
            borderRadius: '10px',
            padding: '10px 14px',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}
          className="custom-scrollbar"
        >
          {progressMessages.length === 0 ? (
            <span style={{ color: '#4b5563' }}>Waiting for orchestrator...</span>
          ) : (
            progressMessages.map((ev, i) => (
              <div key={i} style={{
                color: ev.type === 'error' ? '#f87171'
                     : ev.type === 'done'  ? '#4ade80'
                     : '#94a3b8',
                display: 'flex', gap: '8px',
              }}>
                <span style={{ color: '#4b5563', flexShrink: 0 }}>
                  {new Date().toLocaleTimeString('en', { hour12: false })}
                </span>
                <span>{ev.message || ev.type}</span>
              </div>
            ))
          )}
          {isStreaming && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#4ade80',
                  animation: `bounce 1s ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Summary bar */}
        {!isStreaming && (doneAgents.length + errorAgents.length) > 0 && (
          <div style={{
            display: 'flex', gap: '16px',
            padding: '8px 12px',
            background: '#0f172a',
            borderRadius: '8px',
            fontSize: '0.75rem',
          }}>
            <span style={{ color: '#4ade80' }}>✓ {doneAgents.length} agents succeeded</span>
            {errorAgents.length > 0 && (
              <span style={{ color: '#f87171' }}>⚠ {errorAgents.length} failed (fallback used)</span>
            )}
          </div>
        )}

        {/* Multi-Agent Debate Viewer */}
        {events.some(e => e.type === 'debate_turn') && (
          <AgentDebateViewer
            debateTurns={events.filter(e => e.type === 'debate_turn').map(e => e.turn)}
            isDebating={isStreaming && !events.some(e => e.type === 'debate_done')}
          />
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </div>
  );
}
