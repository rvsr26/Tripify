/**
 * DigitalTwinSimulator Component
 * Interactive traveler simulation dashboard for stress-testing trip itineraries.
 */
import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:4000/api' : '/_/backend/api');

export default function DigitalTwinSimulatorModal({ itinerary, city, onClose }) {
  const [loading, setLoading]       = useState(false);
  const [simulation, setSimulation] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/orchestrate/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itinerary, city }),
      });
      const data = await res.json();
      if (data.success) setSimulation(data.simulation);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#0f172a', border: '1px solid #334155', borderRadius: '20px',
        maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)', color: '#f8fafc',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🏃 Digital Twin Traveler Simulation</h3>
            <div style={{ fontSize: '0.78rem', color: '#a5b4fc', marginTop: '2px' }}>
              Simulate fatigue curves, queue times, and weather vulnerability for {city || 'Destination'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a5b4fc', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '24px' }}>
          {!simulation && !loading && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
                Run multi-dimensional stress testing to evaluate traveler fatigue, queue delays, and weather impact before embarking.
              </p>
              <button
                onClick={runSimulation}
                style={{
                  padding: '12px 28px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                }}
              >
                ⚡ Execute Digital Twin Simulation
              </button>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} />
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Simulating traveler energy levels & queue delays...</p>
            </div>
          )}

          {simulation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#1e293b', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>RESILIENCE SCORE</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: simulation.metrics.resilienceScore >= 80 ? '#4ade80' : '#fbbf24' }}>
                    {simulation.metrics.resilienceScore}%
                  </div>
                </div>
                <div style={{ background: '#1e293b', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>AVG FATIGUE INDEX</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: simulation.metrics.avgFatigueIndex > 70 ? '#f87171' : '#38bdf8' }}>
                    {simulation.metrics.avgFatigueIndex}/100
                  </div>
                </div>
                <div style={{ background: '#1e293b', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>SIMULATED QUEUES</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc' }}>
                    {Math.round(simulation.metrics.totalSimulatedQueueTimeMins / 60 * 10) / 10} hrs
                  </div>
                </div>
              </div>

              {/* Day Breakdown */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#a5b4fc' }}>Daily Pacing & Fatigue Curve</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {simulation.daySimulations.map(day => (
                    <div key={day.day} style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Day {day.day}: {day.title || `Day ${day.day}`}</span>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                          🚶 {day.estimatedWalkingKm} km walking · ⏱️ {day.simulatedQueueDelayMins} mins queue
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                        background: day.status === 'Optimal' ? '#22c55e22' : day.status === 'Overloaded' ? '#ef444422' : '#3b82f622',
                        color: day.status === 'Optimal' ? '#4ade80' : day.status === 'Overloaded' ? '#f87171' : '#60a5fa',
                      }}>
                        {day.status} (Fatigue: {day.fatigueIndex})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {simulation.recommendations?.length > 0 && (
                <div style={{ background: '#6366f115', border: '1px solid #6366f144', padding: '14px', borderRadius: '10px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#818cf8' }}>💡 Digital Twin Optimizer Advice</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    {simulation.recommendations.map((rec, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={onClose} style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#334155', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                Close Simulation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
