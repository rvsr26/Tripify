/**
 * EmergencyPanel
 * Triggered from TripDetailScreen when a disruption occurs.
 * Shows the emergency orchestrator output: severity, immediate actions, recovery plan.
 */
import React, { useState } from 'react';
import AgentActivityPanel from './AgentActivityPanel';
import { useStream } from '../hooks/useStream';

const API_BASE = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:4000/api' : '/_/backend/api');

const DISRUPTION_PRESETS = [
  { label: '✈️ Flight Cancelled', value: 'My flight has been cancelled and I need an alternative' },
  { label: '🌧️ Heavy Rain', value: 'Severe weather is disrupting outdoor activities for 2 days' },
  { label: '🏨 Hotel Cancelled', value: 'My hotel booking was cancelled at the last minute' },
  { label: '🚑 Medical Emergency', value: 'A travel companion needs medical attention' },
  { label: '🛂 Lost Passport', value: 'I have lost my passport and need to contact the embassy' },
];

const SEVERITY_CONFIG = {
  low:      { color: '#4ade80', label: 'Low',      icon: '🟢' },
  medium:   { color: '#fbbf24', label: 'Medium',   icon: '🟡' },
  high:     { color: '#f97316', label: 'High',     icon: '🟠' },
  critical: { color: '#ef4444', label: 'Critical', icon: '🔴' },
};

export default function EmergencyPanel({ tripId, onClose }) {
  const [disruption, setDisruption] = useState('');
  const [location, setLocation]     = useState('');
  const [result, setResult]         = useState(null);
  const [running, setRunning]       = useState(false);
  const { events, isStreaming, agentLog, startStream } = useStream();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!disruption.trim()) return;
    setRunning(true);
    setResult(null);

    let sessionId = null;
    try {
      sessionId = await startStream((event) => {
        if (event.type === 'done') {
          const emergency = event.summary?.results?.emergency_plan;
          if (emergency) setResult(emergency);
          setRunning(false);
        }
      });
    } catch { /* SSE failed — will try sync */ }

    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_BASE}/orchestrate/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tripId, disruption, location, sessionId }),
      });
      if (!sessionId) {
        // Sync fallback
        const data = await res.json();
        setResult(data);
        setRunning(false);
      }
    } catch (err) {
      setRunning(false);
    }
  };

  const sev = SEVERITY_CONFIG[result?.severity] || SEVERITY_CONFIG.medium;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--surface, #1e1e2e)',
        border: '1px solid #ef444444',
        borderRadius: '20px',
        maxWidth: '680px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(239,68,68,0.3)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #450a0a, #7f1d1d)',
          borderRadius: '20px 20px 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ color: '#fef2f2', margin: 0, fontSize: '1.2rem' }}>🆘 Emergency Replanner</h2>
            <p style={{ color: '#fca5a5', margin: '4px 0 0', fontSize: '0.8rem' }}>
              AI will instantly generate a recovery plan
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#fca5a5',
            fontSize: '1.5rem', cursor: 'pointer',
          }}>✕</button>
        </div>

        <div style={{ padding: '24px' }}>
          {!result && !running && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Preset buttons */}
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Quick select:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {DISRUPTION_PRESETS.map(p => (
                    <button key={p.value} type="button"
                      onClick={() => setDisruption(p.value)}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem',
                        border: `1px solid ${disruption === p.value ? '#ef4444' : '#333'}`,
                        background: disruption === p.value ? '#ef444422' : 'transparent',
                        color: disruption === p.value ? '#ef4444' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >{p.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  What happened? *
                </label>
                <textarea
                  value={disruption}
                  onChange={e => setDisruption(e.target.value)}
                  placeholder="Describe the disruption..."
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                    background: '#0f0f1a', border: '1px solid #333',
                    color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Your current location (optional)
                </label>
                <input
                  type="text" value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Tokyo Station, Japan"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                    background: '#0f0f1a', border: '1px solid #333',
                    color: 'var(--text-primary)', fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button type="submit" style={{
                padding: '14px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              }}>
                🆘 Activate Emergency Agent
              </button>
            </form>
          )}

          {running && (
            <div>
              <AgentActivityPanel events={events} agentLog={agentLog} isStreaming={isStreaming} />
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Severity badge */}
              <div style={{
                padding: '12px 16px', borderRadius: '12px',
                background: `${sev.color}15`, border: `1px solid ${sev.color}44`,
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ fontSize: '1.5rem' }}>{sev.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: sev.color }}>{sev.label} Severity</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{result.message}</div>
                </div>
              </div>

              {/* Immediate Actions */}
              {result.immediateActions?.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#ef4444' }}>⚡ Immediate Actions</h4>
                  {result.immediateActions.map((a, i) => (
                    <div key={i} style={{
                      padding: '10px 14px', marginBottom: '8px',
                      background: '#0f0f1a', borderRadius: '10px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '0.85rem' }}>{a.action}</span>
                      {a.link && (
                        <a href={a.link} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none' }}>
                          Open →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Recovery Plan */}
              {result.recoveryPlan?.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem' }}>📋 Recovery Plan</h4>
                  {result.recoveryPlan.map((step, i) => (
                    <div key={i} style={{
                      padding: '10px 14px', marginBottom: '8px',
                      background: '#0f0f1a', borderRadius: '10px',
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                    }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                        background: step.priority === 'immediate' ? '#ef444422' : '#22222e',
                        color: step.priority === 'immediate' ? '#ef4444' : '#94a3b8',
                        flexShrink: 0, marginTop: '2px',
                      }}>
                        {step.priority?.toUpperCase()}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.85rem' }}>{step.action}</div>
                        {step.estimatedCost > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '2px' }}>
                            ~${step.estimatedCost} additional cost
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.totalExtraCost > 0 && (
                <div style={{
                  padding: '12px 16px', background: '#fbbf2415', borderRadius: '10px',
                  border: '1px solid #fbbf2444', fontSize: '0.9rem',
                }}>
                  💸 Estimated extra cost: <strong style={{ color: '#fbbf24' }}>${result.totalExtraCost}</strong>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setResult(null); setDisruption(''); }} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #333',
                  background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                }}>
                  ← New Emergency
                </button>
                <button onClick={onClose} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: '#22c55e', color: 'white', fontWeight: 700, cursor: 'pointer',
                }}>
                  ✓ Close Panel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
