import React, { useState, useEffect } from 'react';
import { socialService, plannerService, featuresService } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import StoriesReel from '../components/StoriesReel';
import MapExplorerScreen from './MapExplorerScreen';
import ExperiencesScreen from './ExperiencesScreen';

export default function FeedScreen() {
  const navigate = useNavigate();
  const [trips, setTrips]   = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [requestingId, setRequestingId] = useState(null);
  const [view, setView] = useState('feed'); // 'feed' | 'templates'

  useEffect(() => { 
    if (view === 'feed') loadFeed(); 
    else loadTemplates();
  }, [view]);

  const loadFeed = async (q = '') => {
    setLoading(true);
    try {
      const data = await socialService.getFeed(q);
      setTrips(data.trips || []);
    } catch { console.error('Failed to load feed'); }
    setLoading(false);
  };

  const loadTemplates = async (q = '') => {
    setLoading(true);
    try {
      const data = await featuresService.getTemplates({ search: q });
      setTemplates(data.templates || []);
    } catch { console.error('Failed to load templates'); }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (view === 'feed') loadFeed(search);
    else loadTemplates(search);
  };

  const handleCloneTemplate = async (id) => {
    try {
      const res = await featuresService.cloneTemplate(id);
      navigate(`/trips/${res.plan._id}`);
    } catch { alert('Failed to clone template'); }
  };

  const handleLike = async (id) => {
    try {
      await socialService.likeTrip(id);
      loadFeed(search);
    } catch { alert('Action failed'); }
  };

  const handleRequestJoin = async (id) => {
    setRequestingId(id);
    const msg = window.prompt("Why do you want to join this trip?", "Hey! I'm interested in this itinerary.");
    if (msg === null) { setRequestingId(null); return; }
    try {
      await plannerService.requestJoin(id, msg);
      alert('Request sent to the trip admin!');
      loadFeed(search);
    } catch (err) {
      alert(err.response?.data?.error || 'Request failed');
    } finally {
      setRequestingId(null);
    }
  };

  if (loading && trips.length === 0) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '12vh' }}>
      <div className="loading-spinner" />
    </div>
  );

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
      <StoriesReel />

      {/* ── Pillar Sub-Navigation ── */}
      <div className="page-tabs glass-panel" style={{ marginBottom: '40px' }}>
         <div className={`page-tab ${view === 'feed' ? 'active' : ''}`} onClick={() => setView('feed')}>Community Feed</div>
         <div className={`page-tab ${view === 'templates' ? 'active' : ''}`} onClick={() => setView('templates')}>Trip Templates</div>
         <div className={`page-tab ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>Live Map</div>
         <div className={`page-tab ${view === 'experts' ? 'active' : ''}`} onClick={() => setView('experts')}>Local Experts</div>
      </div>

      {view === 'map' ? (
        <MapExplorerScreen />
      ) : view === 'experts' ? (
        <ExperiencesScreen />
      ) : (
        <>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '36px', maxWidth: '560px' }}>
        <input
          className="input-field"
          placeholder="Search by city, theme or interest..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary">Search</button>
      </form>

      {view === 'feed' && trips.length === 0 ? (
        <div className="glass-panel empty-state">
          <div className="empty-state-icon">🌎</div>
          <h2>No trips found</h2>
          <p>No public trips match your search. Try a different keyword!</p>
        </div>
      ) : view === 'templates' && templates.length === 0 ? (
        <div className="glass-panel empty-state">
          <div className="empty-state-icon">📋</div>
          <h2>No templates found</h2>
          <p>No trip templates match your search.</p>
        </div>
      ) : view === 'feed' ? (
        <div className="grid-3">
          {trips.map((trip, i) => (
            <div key={trip._id} className="glass-panel animate-fade-in" style={{ animationDelay: `${i * 0.06}s`, display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'flex-start' }}>
                <span className="tag">📍 {trip.city}</span>
                {trip.isOpenToJoin && <span className="badge badge-open">Open</span>}
              </div>

              {/* Title & Author */}
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', letterSpacing: '-0.01em' }}>{trip.title}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                By <Link to={`/u/${trip.userId?._id}`} style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>@{trip.userId?.username}</Link>
              </p>

              {/* Meta */}
              <div className="trip-card-meta">
                <span>📅 {trip.days} Days</span>
                <span>💰 {trip.currency || '$'}{trip.budget?.toLocaleString()}</span>
              </div>

              {/* Members */}
              <div className="member-stack" style={{ marginBottom: '20px' }}>
                {(trip.members || []).slice(0, 3).map((m, idx) => (
                  <div key={idx} className="member-chip">{m.userId?.name?.charAt(0).toUpperCase()}</div>
                ))}
                <span className="member-count">{trip.members?.length || 0} joined</span>
              </div>

              {/* Actions */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', borderTop: '1px solid var(--border-default)', paddingTop: '18px' }}>
                <button
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => handleLike(trip._id)}
                >
                  ❤️ {trip.likes?.length || 0}
                </button>

                {trip.isOpenToJoin ? (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    onClick={() => handleRequestJoin(trip._id)}
                    disabled={requestingId === trip._id}
                  >
                    {requestingId === trip._id ? 'Sending...' : 'Request to Join'}
                  </button>
                ) : (
                  <Link
                    to={`/trips/${trip._id}`}
                    className="btn btn-outline"
                    style={{ flex: 2, textAlign: 'center' }}
                  >
                    View Plan
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid-3">
          {templates.map((tpl, i) => (
            <div key={tpl._id} className="glass-panel animate-fade-in" style={{ animationDelay: `${i * 0.05}s`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span className="tag">📍 {tpl.city}</span>
                <span className="badge badge-primary">Template</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{tpl.title}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Curated by @{tpl.admin?.username || 'system'}
              </p>
              <div className="trip-card-meta" style={{ marginBottom: '20px' }}>
                <span>📅 {tpl.days} Days</span>
                <span>💰 {tpl.currency || '$'}{tpl.budget?.toLocaleString()}</span>
              </div>
              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-default)', paddingTop: '16px' }}>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleCloneTemplate(tpl._id)}>
                  Clone Itinerary
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}

// Build verification patch on 11/25/2025, 9:35:00 AM
