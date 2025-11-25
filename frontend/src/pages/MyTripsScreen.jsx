import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { plannerService } from '../api';
import BucketListScreen from './BucketListScreen';

export default function MyTripsScreen() {
  const [trips, setTrips]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Trips');

  useEffect(() => {
    plannerService.getMyTrips()
      .then(data => setTrips(data.trips || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This trip will be deleted for everyone.')) return;
    try {
      await plannerService.deleteTrip(id);
      setTrips(trips.filter(t => t._id !== id));
    } catch { alert('Failed to delete'); }
  };

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '12vh' }}>
      <div className="loading-spinner" />
    </div>
  );

  return (
    <div className="container animate-fade-in">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 className="vibrant-gradient-text">My Adventures</h1>
          <p>Your journey from dream to reality, all in one place.</p>
        </div>
        <Link to="/planner" className="btn btn-premium-gold btn-pill">
          ✨ New Odyssey
        </Link>
      </div>

      {/* ── Pillar Sub-Navigation ── */}
      <div className="page-tabs glass-panel" style={{ marginBottom: '40px' }}>
         <div className={`page-tab ${activeTab === 'Trips' ? 'active' : ''}`} onClick={() => setActiveTab('Trips')}>Active Trips</div>
         <div className={`page-tab ${activeTab === 'Bucket' ? 'active' : ''}`} onClick={() => setActiveTab('Bucket')}>Bucket List</div>
         <div className="page-tab">Past Gallery</div>
      </div>

      {activeTab === 'Bucket' ? (
         <BucketListScreen />
      ) : (
         <>
      {trips.length === 0 ? (
        <div className="glass-panel empty-state">
          <div className="empty-state-icon">🗺️</div>
          <h2>No trips yet</h2>
          <p>Plan your first AI-powered trip and invite friends to join the adventure!</p>
          <Link to="/" className="btn btn-primary btn-lg">Create Your First Trip</Link>
        </div>
      ) : (
        <div className="grid-3">
          {trips.map((trip, i) => {
            const currency = trip.currency || '$';

            return (
              <div
                key={trip._id}
                className="glass-panel trip-card animate-fade-in"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Header */}
                <div className="trip-card-header">
                  <span className="tag">📍 {trip.city}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {trip.isPublic && <span className="badge badge-open">Public</span>}
                    {trip.isOpenToJoin && <span className="badge badge-open">Open</span>}
                  </div>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', letterSpacing: '-0.02em' }}>
                  {trip.title}
                </h3>

                {/* Meta */}
                <div className="trip-card-meta">
                  <span>📅 {trip.days} Days</span>
                  <span>💰 {currency}{trip.budget?.toLocaleString()}</span>
                </div>

                {/* Members */}
                <div className="member-stack">
                  {(trip.members || []).slice(0, 4).map((m, idx) => (
                    <div key={idx} className="member-chip" title={m.userId?.name}>
                      {m.userId?.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {trip.members?.length > 4 && (
                    <div className="member-chip" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      +{trip.members.length - 4}
                    </div>
                  )}
                  <span className="member-count">{trip.members?.length || 0} members</span>
                </div>

                {/* Actions */}
                <div className="trip-card-actions">
                  <Link to={`/trips/${trip._id}`} className="btn btn-primary" style={{ flex: 1 }}>
                    Open Trip
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(trip._id)}
                    title="Delete trip"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}
    </div>
  );
}

// Build verification patch on 11/21/2025, 11:24:00 AM

// Build verification patch on 11/25/2025, 4:20:00 PM
