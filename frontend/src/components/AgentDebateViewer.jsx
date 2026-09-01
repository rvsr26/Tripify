/**
 * AgentDebateViewer
 * Visualizer for multi-agent disagreement and reasoning debate streams.
 * Rendered during the planning phase to visually demonstrate agent-to-agent collaboration.
 */
import React from 'react';

export default function AgentDebateViewer({ debateTurns = [], isDebating = false }) {
  if (!isDebating && debateTurns.length === 0) return null;

  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '16px',
      padding: '16px',
      marginTop: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>💬</span>
          <div>
            <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '0.9rem', fontWeight: 700 }}>
              Multi-Agent Debate & Disagreement Resolution
            </h4>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Hierarchical negotiation (CEO → Managers → Domain Experts)
            </div>
          </div>
        </div>
        {isDebating && (
          <div style={{
            padding: '4px 10px', borderRadius: '12px', background: '#3b82f622',
            border: '1px solid #3b82f644', color: '#60a5fa', fontSize: '0.72rem',
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', animation: 'pulse 1s infinite' }} />
            Debating...
          </div>
        )}
      </div>

      {/* Debate Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }} className="custom-scrollbar">
        {debateTurns.map((turn, i) => (
          <div
            key={i}
            style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              padding: '10px 14px', borderRadius: '10px',
              background: `${turn.color || '#6366f1'}10`,
              border: `1px solid ${turn.color || '#6366f1'}33`,
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{turn.avatar || '🤖'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: turn.color || '#e2e8f0' }}>
                  {turn.agent} <span style={{ color: '#64748b', fontWeight: 400 }}>({turn.role})</span>
                </span>
                <span style={{
                  fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700,
                  padding: '2px 6px', borderRadius: '4px',
                  background: turn.status === 'approved' ? '#22c55e22' : turn.status === 'critiqued' ? '#ef444422' : '#3b82f622',
                  color: turn.status === 'approved' ? '#4ade80' : turn.status === 'critiqued' ? '#f87171' : '#60a5fa',
                }}>
                  {turn.status}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                {turn.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
