import React, { useState, useEffect } from 'react';
import { featuresService } from '../api';

export default function TravelStatsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    featuresService.getStats()
      .then(res => setStats(res.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '12vh' }}>
      <div className="loading-spinner" />
    </div>
  );

  if (!stats) return <div className="container">Failed to load stats</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
      <div className="section-header">
        <h1><span className="gradient-text">Travel Dashboard</span></h1>
        <p>Your journey so far in numbers and badges.</p>
      </div>

      {/* Top Level Stats */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, var(--bg-elevated), rgba(99, 102, 241, 0.05))' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✈️</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalTrips}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trips Planned</div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, var(--bg-elevated), rgba(236, 72, 153, 0.05))' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🗺️</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalCities}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cities Explored</div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, var(--bg-elevated), rgba(16, 185, 129, 0.05))' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📅</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalDays}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Days Traveled</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Money Insights */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>Financial Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Planned Budget</span>
              <span style={{ fontWeight: 600 }}>${stats.totalBudget.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Actually Spent</span>
              <span style={{ fontWeight: 600 }}>${stats.totalSpent.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>✨ Money Saved</span>
              <span style={{ color: '#10b981', fontWeight: 800 }}>${stats.moneySaved.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Avg Budget per Trip</span>
              <span style={{ fontWeight: 600 }}>${stats.avgBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Top Destinations */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>Most Visited Cities</h3>
          {stats.topDestinations?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stats.topDestinations.map((dest, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {i + 1}
                  </div>
                  <span style={{ flex: 1, fontWeight: 500 }}>{dest.city}</span>
                  <span className="badge">{dest.count} trips</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Complete some trips to see your top destinations.</p>
          )}
        </div>
      </div>

      {/* Recent Achievements */}
      {stats.badges?.length > 0 && (
        <div className="glass-panel" style={{ marginBottom: '32px', border: '1px solid rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.03)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--brand-amber)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✨ Recent Achievement
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '3.5rem', animation: 'bounce 2s infinite' }}>{stats.badges[stats.badges.length - 1].icon}</div>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{stats.badges[stats.badges.length - 1].name}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{stats.badges[stats.badges.length - 1].desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Badges Section */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Achievement Badges</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {stats.badges?.length > 0 ? (
          stats.badges.map(b => (
            <div key={b.id} className="glass-panel animate-fade-in" style={{ padding: '20px', width: '160px', textAlign: 'center', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))', marginBottom: '12px' }}>{b.icon}</div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{b.name}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.desc}</p>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ width: '100%', padding: '32px', textAlign: 'center' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px', opacity: 0.5 }}>🏆</span>
            <p style={{ color: 'var(--text-muted)' }}>Plan your first trip to start earning badges!</p>
          </div>
        )}
      </div>

    </div>
  );
}
