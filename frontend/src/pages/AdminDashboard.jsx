import React, { useState, useEffect } from 'react';
import { adminService } from '../api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService.getAnalytics()
      .then(data => setAnalytics(data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '12vh', gap: '16px' }}>
        <div className="loading-spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container animate-fade-in">
        <div className="glass-panel empty-state">
          <div className="empty-state-icon" style={{ animation: 'none' }}>🔒</div>
          <h2 style={{ color: 'var(--brand-rose)' }}>Access Denied</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: analytics?.totalUsers || 0, icon: '👥', color: '#7c3aed' },
    { label: 'Total Trips', value: analytics?.totalTrips || 0, icon: '✈️', color: '#06b6d4' },
    { label: 'Revenue', value: `$${(analytics?.revenue || 0).toLocaleString()}`, icon: '💰', color: '#10b981' },
    { label: 'Avg. Trips/User', value: analytics?.totalUsers ? (analytics.totalTrips / analytics.totalUsers).toFixed(1) : '0', icon: '📊', color: '#f59e0b' },
  ];

  const destinations = analytics?.popularDestinations || [];

  return (
    <div className="container animate-fade-in">
      <div className="section-header">
        <h1><span className="gradient-text">Admin Dashboard</span></h1>
        <p>Platform analytics and management.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel stat-card animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Popular Destinations */}
      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>🔥 Top Destinations</h3>
        {destinations.length > 0 ? (
          <div className="destinations-chart">
            {destinations.map((dest, i) => {
              const maxCount = destinations[0]?.count || 1;
              const widthPercent = (dest.count / maxCount) * 100;
              return (
                <div key={i} className="dest-bar-row">
                  <div className="dest-bar-label">
                    <span className="dest-rank">#{i + 1}</span>
                    <span>{dest._id}</span>
                  </div>
                  <div className="dest-bar-track">
                    <div className="dest-bar-fill" style={{ width: `${widthPercent}%`, animationDelay: `${i * 0.12}s` }} />
                  </div>
                  <span className="dest-bar-count">{dest.count} trips</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No destination data yet.</p>
        )}
      </div>

      {/* Quick Info */}
      <div className="glass-panel">
        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>⚡ Platform Info</h3>
        <div className="quick-info-grid">
          <div className="quick-info-item">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Platform</span>
            <strong style={{ fontSize: '0.92rem' }}>Tripify Web + Mobile</strong>
          </div>
          <div className="quick-info-item">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>API Status</span>
            <strong style={{ color: 'var(--brand-emerald)', fontSize: '0.92rem' }}>● Online</strong>
          </div>
          <div className="quick-info-item">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>AI Engine</span>
            <strong style={{ fontSize: '0.92rem' }}>Google Gemini 2.0</strong>
          </div>
          <div className="quick-info-item">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Payments</span>
            <strong style={{ fontSize: '0.92rem' }}>Stripe Checkout</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// Build verification patch on 11/26/2025, 9:00:00 AM
