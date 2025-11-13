import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { plannerService, reviewService, friendsService, featuresService, uploadService } from '../api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import html2canvas from 'html2canvas';
import { io } from 'socket.io-client';

// ── Sub-components ───────────────────────────────────────────────────────────
function MembersTab({ trip, currentUserId, onUpdate }) {
  const [showInvite, setShowInvite] = useState(false);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (showInvite) {
      friendsService.getFriends().then(res => setFriends(res.friends || [])).catch(() => {});
    }
  }, [showInvite]);

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this person?')) return;
    try {
      const res = await plannerService.removeMember(trip._id, userId);
      onUpdate(res.trip);
    } catch { alert('Failed'); }
  };

  const handleJoinRequest = async (userId, status) => {
    try {
      const res = await plannerService.handleJoinRequest(trip._id, userId, status);
      onUpdate(res.trip);
    } catch { alert('Failed'); }
  };

  const copyInvite = () => {
    const url = `${window.location.origin}/join/${trip.inviteToken}`;
    navigator.clipboard.writeText(url);
    alert('Invite link copied!');
  };

  const isAdmin = trip.admin?._id === currentUserId || trip.admin === currentUserId;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.3rem' }}>Trip Members</h2>
        {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setShowInvite(!showInvite)}>+ Invite</button>}
      </div>

      {showInvite && (
        <div className="glass-panel" style={{ marginBottom: '24px', border: '1px solid rgba(99,102,241,0.2)' }}>
          <h4 style={{ marginBottom: '10px', fontSize: '1rem' }}>Invite Friends</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>Share this link or pick from your friends</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input className="input-field" readOnly value={`${window.location.origin}/join/${trip.inviteToken}`} style={{ fontSize: '0.82rem' }} />
            <button className="btn btn-outline btn-sm" onClick={copyInvite}>Copy</button>
          </div>

          {friends.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No friends found. Add some in the Friends tab!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {friends.map(f => (
                <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--border-radius-sm)' }}>
                  <span style={{ fontSize: '0.88rem' }}>{f.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>@{f.username}</span></span>
                  <button className="btn btn-outline btn-sm" onClick={copyInvite}>Invite</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Join Requests */}
      {isAdmin && trip.joinRequests?.filter(r => r.status === 'pending').length > 0 && (
        <div className="glass-panel" style={{ marginBottom: '24px', border: '1.5px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.03)' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--brand-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="notification-dot" /> New Join Requests
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {trip.joinRequests.filter(r => r.status === 'pending').map(r => (
              <div key={r.userId?._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{r.userId?.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{r.userId?.username}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleJoinRequest(r.userId?._id, 'accepted')}>Accept</button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleJoinRequest(r.userId?._id, 'declined')}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {trip.members.map((m, i) => (
          <div key={m.userId._id} className="glass-panel animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', animationDelay: `${i * 0.04}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="avatar-initials" style={{ width: '42px', height: '42px', borderRadius: '50%' }}>{m.userId.name?.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.userId.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{m.userId.username}</div>
              </div>
              <span className={`badge ${m.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>{m.role}</span>
            </div>

            {isAdmin && m.userId._id !== currentUserId && (
              <button className="btn btn-danger btn-sm" onClick={() => handleRemove(m.userId._id)}>Remove</button>
            )}
            {!isAdmin && m.userId._id === currentUserId && (
              <button className="btn btn-outline btn-sm" onClick={() => handleRemove(currentUserId)}>Leave</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ trip, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ title: trip.title, isOpenToJoin: trip.isPublic || trip.isOpenToJoin, maxMembers: trip.maxMembers || 20 });
  const [success, setSuccess] = useState(false);

  const save = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const res = await plannerService.updateSettings(trip._id, settings);
      onUpdate(res.trip);
      setSuccess(true);
    } catch { alert('Update failed'); }
    setLoading(false);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '1.3rem' }}>Trip Settings</h2>
      <div className="input-group">
        <label>Trip Name</label>
        <input className="input-field" value={settings.title} onChange={e => setSettings({ ...settings, title: e.target.value })} />
      </div>

      <div style={{ margin: '24px 0', padding: '20px', background: 'var(--bg-input)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Open for Requests?</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Allow others to request joining</div>
          </div>
          <button
            className={`badge ${settings.isOpenToJoin ? 'badge-open' : 'badge-member'}`}
            style={{ padding: '8px 16px', cursor: 'pointer', border: 'none', fontSize: '0.78rem' }}
            onClick={() => setSettings({ ...settings, isOpenToJoin: !settings.isOpenToJoin })}
          >
            {settings.isOpenToJoin ? '🔓 Open' : '🔒 Private'}
          </button>
        </div>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label>Max Members</label>
          <input type="number" className="input-field" value={settings.maxMembers} onChange={e => setSettings({ ...settings, maxMembers: parseInt(e.target.value) })} style={{ width: '100px' }} />
        </div>
      </div>

      {success && <p style={{ color: 'var(--brand-emerald)', marginBottom: '16px', fontSize: '0.88rem', fontWeight: 600 }}>✓ Changes saved</p>}

      <button className="btn btn-primary" onClick={save} disabled={loading} style={{ width: '100%', marginBottom: '32px' }}>
        {loading ? 'Saving...' : 'Save Settings'}
      </button>

      <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Trip Actions</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            className="btn btn-outline" 
            onClick={async () => {
              if (window.confirm('Publish this trip as a template for others to use?')) {
                try {
                  await featuresService.publishTemplate(trip._id);
                  alert('Trip published to Templates Marketplace!');
                } catch { alert('Failed to publish'); }
              }
            }}
          >
            📋 Publish as Template
          </button>
          
          <button 
            className="btn btn-outline"
            onClick={async () => {
              try {
                // Get activities
                const days = Array.isArray(trip.itinerary?.days) ? trip.itinerary.days : (Array.isArray(trip.itinerary) ? trip.itinerary : []);
                const highlights = [];
                days.forEach(d => {
                  if (d.activities && d.activities.length > 0) {
                    highlights.push(d.activities[0].activity); // First activity of each day
                  }
                });
                
                if (highlights.length === 0) { alert('No activities found to create story'); return; }
                
                alert('Generating story with AI... This might take a moment.');
                const res = await featuresService.generateCaptions({ tripTitle: trip.title, city: trip.city, highlights });
                
                const slides = res.captions.map((caption, i) => ({
                  imageUrl: '', // Blank, to be customized later (ideally)
                  caption: caption,
                  location: trip.city,
                  bgColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'][i % 5]
                }));
                
                await featuresService.createStory({ tripId: trip._id, title: `${trip.city} Adventure`, slides });
                alert('Story created successfully! View it in the Community Feed.');
              } catch (e) {
                console.error(e);
                alert('Failed to generate story');
              }
            }}
          >
            📸 Generate AI Trip Story
          </button>
        </div>
      </div>
    </div>
  );
}

function MapTab({ trip }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    const days = Array.isArray(trip.itinerary?.days) ? trip.itinerary.days : (Array.isArray(trip.itinerary) ? trip.itinerary : []);

    let centerLat = trip.location?.lat;
    let centerLng = trip.location?.lng;

    if (!centerLat) {
      for (const day of days) {
        for (const act of (day.activities || [])) {
          if (act.coordinates?.lat && act.coordinates?.lng) {
            centerLat = act.coordinates.lat;
            centerLng = act.coordinates.lng;
            break;
          }
        }
        if (centerLat) break;
      }
    }

    if (mapRef.current && !mapInstance.current && centerLat) {
      mapInstance.current = L.map(mapRef.current).setView([centerLat, centerLng], 12);

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      L.tileLayer(
        isDark
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }
      ).addTo(mapInstance.current);

      const defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
      });

      if (trip.location?.lat) {
        L.marker([trip.location.lat, trip.location.lng], { icon: defaultIcon })
          .addTo(mapInstance.current).bindPopup(`<b>${trip.city}</b><br>Destination`);
      }

      const bounds = L.latLngBounds();
      if (trip.location?.lat) bounds.extend([trip.location.lat, trip.location.lng]);
      let addedPins = 0;

      days.forEach((day, i) => {
        (day.activities || []).forEach(act => {
          if (act.coordinates?.lat && act.coordinates?.lng) {
            L.marker([act.coordinates.lat, act.coordinates.lng], { icon: defaultIcon })
              .addTo(mapInstance.current)
              .bindPopup(`<div style="font-family:'Inter',sans-serif">
                <div style="font-weight:700;color:#6366f1;font-size:0.78rem">Day ${day.day || i + 1} · ${act.time}</div>
                <div style="font-weight:600;margin:4px 0">${act.activity}</div>
                <div style="font-size:0.82rem;color:#888">${act.location}</div>
              </div>`);
            bounds.extend([act.coordinates.lat, act.coordinates.lng]);
            addedPins++;
          }
        });
      });

      if (addedPins > 0) mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      else mapInstance.current.setView([centerLat, centerLng], 12);
    }

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, [trip]);

  if (!trip.location?.lat && (!trip.itinerary?.days || trip.itinerary.days.length === 0)) return (
    <div className="glass-panel empty-state animate-fade-in">
      <div className="empty-state-icon">📍</div>
      <h2>Map unavailable</h2>
      <p>We couldn't find coordinates for "{trip.city}".</p>
    </div>
  );

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: 0, overflow: 'hidden', height: '500px' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

function PackingTab({ trip, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const generatePackingList = async () => {
    setLoading(true);
    try {
      const res = await plannerService.generatePacking(trip._id);
      onUpdate({ ...trip, packingList: res.packingList });
    } catch (e) {
      alert('Failed to generate packing list.');
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel animate-fade-in">
      <h2 style={{ marginBottom: '28px', fontSize: '1.3rem' }}>🎒 Packing List</h2>

      {trip.packingList?.categories ? (
        <div className="packing-grid">
          {trip.packingList.categories.map((cat, i) => (
            <div key={i} className="packing-category">
              <h4>{cat.icon || '📦'} {cat.name}</h4>
              {cat.items.map((item, ii) => (
                <div key={ii} className="packing-item">
                  <input type="checkbox" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-input)', borderRadius: 'var(--border-radius-md)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No packing list yet. Let AI analyze your destination and itinerary to generate a smart checklist!</p>
          <button 
            className="btn btn-primary" 
            onClick={generatePackingList} 
            disabled={loading}
          >
            {loading ? 'Generating...' : '🎒 Generate Smart Packing List'}
          </button>
        </div>
      )}
    </div>
  );
}

function ReviewsTab({ trip }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeReviews, setPlaceReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    plannerService.getDestinationReviews(trip._id)
      .then(res => setReviews(res.reviews || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [trip._id]);

  const openPlace = async (place) => {
    setSelectedPlace(place);
    setReviewsLoading(true);
    try {
      // Use the place title as the a unique ID for user reviews
      // Provide place.data_id for actual scraping of external Google bounds
      const data = await reviewService.getReviews(encodeURIComponent(place.title), place.data_id);
      setPlaceReviews(data || []);
    } catch(e) { console.error(e); }
    setReviewsLoading(false);
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setSubmitLoading(true);
    try {
      const res = await reviewService.addReview(selectedPlace.title, newRating, newText);
      // Backend returns { message, review }
      // We must append the current user details to it so it matches populated structure
      const newReviewOptimistic = {
        ...res.review,
        userId: { name: 'You' } // Or pass current user name if available
      };
      setPlaceReviews([newReviewOptimistic, ...placeReviews]);
      setNewText('');
      setNewRating(5);
    } catch(e) {
      alert('Failed to add review');
    }
    setSubmitLoading(false);
  };

  if (loading) return <div className="glass-panel animate-fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="loading-spinner" /></div>;

  // ── INLINE PLACE REVIEWS PAGE ──────────────────────────────────────────────
  if (selectedPlace) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button 
          className="btn btn-ghost" 
          onClick={() => setSelectedPlace(null)}
          style={{ alignSelf: 'flex-start', padding: 0, fontWeight: 600, color: 'var(--brand-primary)' }}
        >
          &larr; Back to Top Attractions
        </button>
        
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ height: '240px', width: '100%', position: 'relative', overflow: 'hidden' }}>
            <img 
              src={selectedPlace.thumbnail || `https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80`} 
              alt={selectedPlace.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'; }}
            />
          </div>
          
          <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 800 }}>{selectedPlace.title}</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>★ {selectedPlace.rating}</span>
                  <span>({selectedPlace.reviews} Google Reviews)</span>
                  <span className="badge" style={{ background: 'var(--bg-elevated)' }}>{selectedPlace.type}</span>
                </div>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '800px' }}>
                  {selectedPlace.description}
                </p>
                {selectedPlace.address && (
                  <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    📍 {selectedPlace.address}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Write Review Section */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Write a Review</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Been to {selectedPlace.title}? Share your experience with the Triplify community!
            </p>
            <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Rating</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1,2,3,4,5].map(star => (
                    <button 
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        fontSize: '1.8rem', 
                        cursor: 'pointer',
                        color: star <= newRating ? '#fbbf24' : 'var(--border-default)',
                        transition: 'transform 0.1s'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea 
                className="input-field" 
                placeholder="What did you think of this place?" 
                rows="3"
                value={newText}
                onChange={e => setNewText(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={submitLoading || !newText.trim()}>
                {submitLoading ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>

          {/* Reviews List Section */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>User & Google Reviews</span>
              <span className="badge">{placeReviews.length} total</span>
            </h3>
            
            {reviewsLoading ? (
              <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}><div className="loading-spinner" /></div>
            ) : placeReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No reviews found for {selectedPlace.title}.
              </div>
            ) : (
              <div className="grid-2" style={{ maxHeight: '700px', overflowY: 'auto', paddingRight: '8px', gap: '20px' }}>
                {placeReviews.map((r, i) => {
                  // Fallback to searching the place if no direct review link exists
                  const link = r.link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.title)}`;
                  return (
                    <a 
                      key={i} 
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'flex',
                        flexDirection: 'column', 
                        background: 'var(--bg-input)', 
                        padding: '20px', 
                        borderRadius: 'var(--border-radius-md)', 
                        border: '1px solid var(--border-default)',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        height: '320px'
                      }}
                      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--brand-primary)'; }}
                      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="avatar-initials" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                            {r.userId?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{r.userId?.name || 'Unknown User'}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {isNaN(Date.parse(r.createdAt)) ? r.createdAt : new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <div style={{ color: '#fbbf24', fontSize: '0.95rem', letterSpacing: '2px' }}>
                          {'★'.repeat(Math.round(r.rating || 5))}
                        </div>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }} className="custom-scrollbar">
                        <p style={{ fontSize: '0.95rem', margin: 0, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                          "{r.review}"
                        </p>
                        
                        {/* Review Images Reel */}
                        {r.images && r.images.length > 0 && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', overflowX: 'auto', paddingBottom: '8px' }} className="custom-scrollbar">
                            {r.images.map((img, idx) => (
                              <img 
                                key={idx} 
                                src={img} 
                                alt="Review" 
                                style={{ height: '80px', borderRadius: '8px', objectFit: 'cover', cursor: 'zoom-in' }} 
                                onClick={(e) => { e.preventDefault(); window.open(img, '_blank'); }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {r.isExternal && (
                        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                          Read on Google Maps ↗
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── GRID VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="glass-panel animate-fade-in">
      <h2 style={{ marginBottom: '24px', fontSize: '1.3rem' }}>⭐ Top Attractions</h2>
      {reviews.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No top places found for this destination.</p>
      ) : (
        <div className="grid-3">
          {reviews.map((place, i) => (
            <div 
              key={i} 
              className="glass-panel animate-fade-up" 
              style={{ 
                padding: 0, 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                transition: 'all 0.3s var(--ease-out)',
                cursor: 'pointer'
              }}
              onClick={() => openPlace(place)}
            >
              {/* Image Hero */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '65%', overflow: 'hidden', background: 'var(--bg-input)' }}>
                <img 
                  src={place.thumbnail || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80`} 
                  alt={place.title}
                  style={{ 
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'; }}
                />
              </div>

              {/* Content Body */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>{place.title}</h4>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', padding: '2px 8px', borderRadius: 'var(--border-radius-sm)', fontSize: '0.78rem', fontWeight: 700 }}>
                    ★ {place.rating}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({place.reviews})</span>
                  <span className="tag" style={{ border: 'none', background: 'var(--bg-elevated)', fontSize: '0.7rem', padding: '2px 8px' }}>{place.type}</span>
                </div>

                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-secondary)', 
                  lineHeight: 1.5, 
                  margin: 0,
                  flex: 1,
                  display: '-webkit-box', 
                  WebkitLineClamp: 3, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden' 
                }}>
                  {place.description}
                </p>

                <div style={{ 
                  marginTop: '12px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid var(--border-subtle)',
                  color: 'var(--brand-primary)', 
                  fontSize: '0.88rem', 
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px' 
                }}>
                  Explore Experience &rarr;
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExpensesTab({ trip }) {
  const [expenses, setExpenses] = useState(trip.expenses || []);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    featuresService.getSettlements(trip._id)
      .then(res => setSettlements(res.settlements || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [trip._id, expenses]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!desc || !amount) return;
    try {
      const res = await plannerService.addExpense(trip._id, { description: desc, amount: Number(amount) });
      setExpenses(res.trip.expenses);
      setDesc(''); setAmount('');
    } catch (err) {
      alert('Failed to add expense');
    }
  };

  if (loading) return <div className="glass-panel loading-spinner" />;

  return (
    <div className="glass-panel animate-fade-in">
      <h2 style={{ marginBottom: '24px', fontSize: '1.3rem' }}>💸 Split Expenses</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px' }}>Add Expense</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input className="input-field" placeholder="Description (e.g. Dinner)" value={desc} onChange={e => setDesc(e.target.value)} required />
            <input type="number" className="input-field" placeholder={`Amount (${trip.currency})`} value={amount} onChange={e => setAmount(e.target.value)} required min="1" step="0.01" />
            <button type="submit" className="btn btn-primary" style={{ marginTop: '4px' }}>Submit Expense</button>
          </form>

          <h3 style={{ fontSize: '1.05rem', marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px' }}>Recent Expenses</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {expenses.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No expenses yet.</p> : null}
            {expenses.slice().reverse().map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--border-radius-sm)', borderLeft: '3px solid var(--brand-primary)' }}>
                <span style={{ fontSize: '0.9rem' }}>{e.description}</span>
                <span style={{ fontWeight: 700 }}>{trip.currency}{e.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px' }}>Who owes whom?</h3>
          {settlements.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-md)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚖️</div>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Everybody is settled up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {settlements.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: 'var(--border-radius-md)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.95rem' }}><span style={{ fontWeight: 600 }}>{s.from}</span> owes <span style={{ fontWeight: 600 }}>{s.to}</span></div>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {trip.currency}{s.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JournalTab({ trip }) {
  const [entries,   setEntries]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [content,   setContent]   = useState('');
  const [mood,      setMood]      = useState('happy');
  // Photo state
  const [pendingPhotos,  setPendingPhotos]  = useState([]);  // { file, previewUrl }
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  // Lightbox
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    featuresService.getJournal(trip._id)
      .then(res => setEntries(res.journal?.entries || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [trip._id]);

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }));
    setPendingPhotos(prev => [...prev, ...previews].slice(0, 6)); // max 6 per entry
    e.target.value = '';
  };

  const removePending = (idx) => {
    setPendingPhotos(prev => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!content) return;

    // Upload any pending photos first
    let uploadedUrls = [];
    if (pendingPhotos.length > 0) {
      setUploadingPhoto(true);
      try {
        uploadedUrls = await Promise.all(
          pendingPhotos.map(p =>
            uploadService.uploadImage(p.file, (pct) => setUploadProgress(pct))
              .then(r => r.url)
          )
        );
      } catch (err) {
        alert('Photo upload failed: ' + err.message);
        setUploadingPhoto(false);
        return;
      }
      setUploadingPhoto(false);
      setUploadProgress(0);
      pendingPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl));
      setPendingPhotos([]);
    }

    try {
      const res = await featuresService.addJournalEntry(trip._id, {
        content,
        mood,
        photos: uploadedUrls,
      });
      setEntries(res.journal.entries);
      setContent('');
      setMood('happy');
    } catch (err) { alert('Failed to save journal entry'); }
  };

  if (loading) return <div className="glass-panel loading-spinner" />;

  const MOODS = [
    { id: 'amazing', emoji: '🤩', label: 'Amazing' },
    { id: 'happy',   emoji: '😊', label: 'Happy' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'tired',   emoji: '🥱', label: 'Tired' },
    { id: 'sad',     emoji: '😔', label: 'Sad' },
  ];

  return (
    <div className="glass-panel animate-fade-in">
      {/* Lightbox */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, cursor: 'zoom-out', padding: '20px',
          }}
        >
          <img src={lightboxSrc} alt="Memory" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }} />
        </div>
      )}

      <h2 style={{ marginBottom: '24px', fontSize: '1.3rem' }}>📖 Travel Journal</h2>

      {/* ── Write Entry Form ── */}
      <div style={{ marginBottom: '32px', background: 'var(--bg-input)', padding: '20px', borderRadius: 'var(--border-radius-md)' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Write an entry</h3>
        <form onSubmit={handleAdd}>
          <textarea
            className="input-field"
            placeholder="How was your day? What did you discover?"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows="4"
            required
            style={{ resize: 'vertical', marginBottom: '16px' }}
          />

          {/* Pending photo previews */}
          {pendingPhotos.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {pendingPhotos.map((p, idx) => (
                <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                  <img
                    src={p.previewUrl}
                    alt="preview"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '2px solid var(--brand-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={() => removePending(idx)}
                    style={{
                      position: 'absolute', top: '-6px', right: '-6px',
                      background: 'var(--brand-danger)', color: 'white',
                      border: 'none', borderRadius: '50%',
                      width: '20px', height: '20px',
                      fontSize: '0.7rem', cursor: 'pointer', lineHeight: '20px',
                    }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Upload progress bar */}
          {uploadingPhoto && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', marginBottom: '6px' }}>Uploading photos… {uploadProgress}%</div>
              <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #ec4899)', transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Mood picker */}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mood:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {MOODS.map(m => (
                  <button
                    key={m.id} type="button"
                    className={`btn btn-sm ${mood === m.id ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setMood(m.id)}
                    title={m.label}
                    style={{ padding: '6px', fontSize: '1.1rem', borderRadius: '50%' }}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
              {/* Photo button */}
              <button
                type="button"
                id="journal-photo-btn"
                className="btn btn-outline btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto || pendingPhotos.length >= 6}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                📸 {pendingPhotos.length > 0 ? `${pendingPhotos.length} photo${pendingPhotos.length > 1 ? 's' : ''}` : 'Add Photos'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={uploadingPhoto || !content.trim()}>
              {uploadingPhoto ? 'Uploading…' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Entries List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📓</div>
            <p>Your journal is empty. Start documenting your journey!</p>
          </div>
        ) : (
          entries.slice().reverse().map((entry, i) => (
            <div
              key={i}
              style={{
                borderLeft: '4px solid var(--brand-primary)',
                padding: '20px',
                background: 'var(--bg-elevated)',
                borderRadius: '0 var(--border-radius-md) var(--border-radius-md) 0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: '1.2rem' }}>
                  {MOODS.find(m => m.id === entry.mood)?.emoji || '😊'}
                </span>
              </div>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{entry.content}</p>

              {/* Attached photos strip */}
              {entry.photos && entry.photos.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {entry.photos.map((url, pi) => (
                    <img
                      key={pi}
                      src={url}
                      alt={`Memory ${pi + 1}`}
                      onClick={() => setLightboxSrc(url)}
                      style={{
                        width: '90px', height: '90px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        cursor: 'zoom-in',
                        border: '2px solid var(--border-default)',
                        transition: 'transform 0.2s, border-color 0.2s',
                      }}
                      onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.borderColor = 'var(--brand-primary)'; }}
                      onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Memories Gallery Tab ──────────────────────────────────────────────────────
function MemoriesTab({ trip }) {
  const [allPhotos, setAllPhotos] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [lightbox,  setLightbox]  = useState(null); // { src, caption }
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const loadPhotos = () => {
    setLoading(true);
    featuresService.getJournal(trip._id)
      .then(res => {
        const entries = res.journal?.entries || [];
        const photos = entries.flatMap(e =>
          (e.photos || []).map(url => ({
            url,
            caption: e.content?.slice(0, 80) || '',
            date: e.createdAt,
            mood: e.mood,
          }))
        ).reverse();
        setAllPhotos(photos);
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPhotos(); }, [trip._id]);

  const handleQuickUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';

    setUploading(true);
    setUploadProgress(0);
    try {
      const urls = await Promise.all(
        files.map(f => uploadService.uploadImage(f, pct => setUploadProgress(pct)).then(r => r.url))
      );
      // Save as a quick memories-only journal entry
      await featuresService.addJournalEntry(trip._id, {
        content: '📸 Quick memory upload',
        mood: 'happy',
        photos: urls,
      });
      loadPhotos();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const MOOD_EMOJI = { amazing: '🤩', happy: '😊', neutral: '😐', tired: '🥱', sad: '😔' };

  return (
    <div className="animate-fade-in">
      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, cursor: 'zoom-out', padding: '20px',
          }}
        >
          <img
            src={lightbox.src}
            alt="Memory"
            style={{ maxWidth: '92vw', maxHeight: '80vh', borderRadius: '16px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}
          />
          {lightbox.caption && (
            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '16px', maxWidth: '600px', textAlign: 'center', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {lightbox.caption}
            </p>
          )}
          {lightbox.date && (
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '6px', fontSize: '0.8rem' }}>
              {new Date(lightbox.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {lightbox.mood ? '  ' + (MOOD_EMOJI[lightbox.mood] || '') : ''}
            </p>
          )}
          <button
            onClick={e => { e.stopPropagation(); setLightbox(null); }}
            style={{
              marginTop: '20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            ✕ Close
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>🖼️ Trip Memories</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px', marginBottom: 0 }}>
            {allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''} from your {trip.city} adventure
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {uploading && (
            <div style={{ fontSize: '0.82rem', color: 'var(--brand-primary)' }}>Uploading… {uploadProgress}%</div>
          )}
          <button
            id="memories-upload-btn"
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            📸 {uploading ? 'Uploading…' : 'Add Memories'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleQuickUpload}
          />
        </div>
      </div>

      {/* Progress bar while uploading */}
      {uploading && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ height: '5px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #ec4899)', transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="loading-spinner" />
        </div>
      ) : allPhotos.length === 0 ? (
        <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📷</div>
          <h3 style={{ marginBottom: '8px' }}>No memories yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
            Add photos to your journal entries or upload directly here to build your trip photo album.
          </p>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
            📸 Upload Your First Memory
          </button>
        </div>
      ) : (
        /* Masonry-style grid */
        <div
          style={{
            columns: 'var(--memories-cols, 3)',
            columnGap: '16px',
            '--memories-cols': '3',
          }}
        >
          <style>{`
            @media (max-width: 900px) { [data-memories-grid] { column-count: 2 !important; } }
            @media (max-width: 540px) { [data-memories-grid] { column-count: 1 !important; } }
          `}</style>
          <div data-memories-grid style={{ columnCount: 3 }}>
            {allPhotos.map((photo, i) => (
              <div
                key={i}
                onClick={() => setLightbox(photo)}
                style={{
                  breakInside: 'avoid',
                  marginBottom: '16px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'zoom-in',
                  position: 'relative',
                  border: '1px solid var(--border-default)',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(99,102,241,0.3)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <img
                  src={photo.url}
                  alt={`Memory ${i + 1}`}
                  loading="lazy"
                  style={{ width: '100%', display: 'block', borderRadius: '16px' }}
                />
                {/* Hover overlay */}
                <div
                  className="memories-overlay"
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)',
                    borderRadius: '16px',
                    opacity: 0,
                    transition: 'opacity 0.25s',
                    display: 'flex', alignItems: 'flex-end', padding: '14px',
                  }}
                  onMouseOver={e => { e.currentTarget.style.opacity = '1'; }}
                  onMouseOut={e => { e.currentTarget.style.opacity = '0'; }}
                >
                  <div style={{ color: 'white' }}>
                    {photo.mood && <span style={{ fontSize: '1rem', marginRight: '6px' }}>{MOOD_EMOJI[photo.mood]}</span>}
                    {photo.date && (
                      <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                        {new Date(photo.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── INR → Trip Currency Converter ────────────────────────────────────────────
function InrConverter({ tripCurrency }) {
  const [inrAmount, setInr]   = useState(10000);
  const [rate, setRate]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(false);

  // Normalize currency code — strip symbols, keep just letters
  const toCurrency = (tripCurrency || 'USD').replace(/[^A-Z]/gi, '').toUpperCase() || 'USD';
  const isSame = toCurrency === 'INR';

  useEffect(() => {
    if (isSame) return;
    setLoading(true);
    setError(false);
    fetch('https://api.exchangerate-api.com/v4/latest/INR')
      .then(r => r.json())
      .then(data => {
        const r = data.rates?.[toCurrency];
        setRate(r ?? null);
        if (!r) setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [toCurrency, isSame]);

  const converted = rate != null ? (inrAmount * rate).toFixed(2) : null;

  // Quick-reference common amounts
  const quickAmounts = [1000, 5000, 10000, 50000, 100000];

  if (isSame) return null; // no point converting INR → INR

  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(236,72,153,0.06))',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: 'var(--border-radius-md)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '1.2rem' }}>💱</span>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
            INR → {toCurrency} Converter
          </h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Live mid-market rates · For trip budgeting only
          </p>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
          Fetching live rates…
        </div>
      )}

      {error && !loading && (
        <p style={{ color: 'var(--brand-danger)', fontSize: '0.85rem' }}>
          ⚠️ Could not fetch live rates. Check your connection.
        </p>
      )}

      {!loading && !error && rate != null && (
        <>
          {/* Input row */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 160px' }}>
              <span style={{
                background: 'var(--bg-input)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--border-radius-sm)', padding: '10px 14px',
                fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap',
              }}>
                ₹ INR
              </span>
              <input
                type="number"
                className="input-field"
                value={inrAmount}
                onChange={e => setInr(Number(e.target.value) || 0)}
                min={0}
                style={{ flex: 1, fontSize: '1rem', fontWeight: 600 }}
              />
            </div>

            <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', flexShrink: 0 }}>→</span>

            <div style={{
              flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--bg-card)', border: '1px solid var(--brand-primary)',
              borderRadius: 'var(--border-radius-sm)', padding: '10px 16px',
            }}>
              <span style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                {toCurrency}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {Number(converted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Rate badge */}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            1 INR = {rate.toFixed(6)} {toCurrency}
          </p>

          {/* Quick reference chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {quickAmounts.map(amt => (
              <button
                key={amt}
                onClick={() => setInr(amt)}
                style={{
                  background: inrAmount === amt ? 'rgba(99,102,241,0.15)' : 'var(--bg-input)',
                  border: `1px solid ${inrAmount === amt ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                  color: inrAmount === amt ? 'var(--brand-primary)' : 'var(--text-muted)',
                  borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem',
                  cursor: 'pointer', fontWeight: inrAmount === amt ? 700 : 400,
                  transition: 'all 0.15s',
                }}
              >
                ₹{amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}K`}
                <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>
                  = {(amt * rate).toFixed(0)} {toCurrency}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function WeatherWidget({ city }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!city) return;
    featuresService.getWeather(city)
      .then(res => setWeather(res.weather))
      .catch(() => {});
  }, [city]);

  if (!weather) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-document)', padding: '8px 16px', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--border-default)', fontSize: '0.85rem' }}>
      <span style={{ fontSize: '1.2rem' }}>
        {weather.condition?.toLowerCase().includes('rain') ? '🌧️' : 
         weather.condition?.toLowerCase().includes('cloud') ? '☁️' : '☀️'}
      </span>
      <div>
        <div style={{ fontWeight: 600 }}>{weather.temp}°C · {weather.condition || 'Clear'}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Humidity: {weather.humidity}%</div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
const TABS = ['Plan', 'Map', 'Budget', 'Expenses', 'Safety', 'Packing', 'Journal', 'Memories', 'Members', 'Reviews', 'Settings'];

function SafetyTab({ trip }) {
  const [safety, setSafety] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    plannerService.getSafetyInfo(trip._id)
      .then(res => setSafety(res))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [trip._id]);

  if (loading) return <div className="glass-panel loading-spinner" />;
  if (!safety) return <div className="glass-panel animate-fade-in"><p>Safety info not available.</p></div>;

  return (
    <div className="glass-panel animate-fade-in">
      <h2 style={{ marginBottom: '24px', fontSize: '1.3rem' }}>🚨 Safety & Emergency Info</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px' }}>Emergency Numbers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(safety.emergencyNumbers || {}).map(([type, number]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--border-radius-sm)', borderLeft: '3px solid var(--brand-danger)' }}>
                <span style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>{type}</span>
                <span style={{ fontWeight: 700 }}>{number}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>Embassy Information</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{safety.embassyInfo}</p>
          </div>
        </div>

        <div>
           <div style={{ marginBottom: '24px', padding: '24px', background: 'rgba(99,102,241,0.05)', borderRadius: 'var(--border-radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: safety.safetyScore > 7 ? 'var(--brand-emerald)' : 'var(--brand-amber)' }}>
              {safety.safetyScore}/10
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>General Safety Score</div>
          </div>

          <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px' }}>Travel Advisories</h3>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>
            {(safety.advisories || []).map((adv, i) => (
              <li key={i} style={{ marginBottom: '8px', fontSize: '0.85rem', lineHeight: '1.5' }}>{adv}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TripRecapModal({ trip, onClose }) {
  const slideRef  = useRef(null);
  const timerRef  = useRef(null);
  const [photos,   setPhotos]   = useState([]);
  const [loadingPhotos, setLP]  = useState(true);
  const [slideIdx, setSlide]    = useState(0);
  const [paused,   setPaused]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloading, setDL]    = useState(false);
  const [transitioning, setTr]  = useState(false);

  const days = Array.isArray(trip.itinerary?.days)
    ? trip.itinerary.days
    : Array.isArray(trip.itinerary) ? trip.itinerary : [];

  const topActs = days.slice(0, 5).flatMap(d => (d.activities || []).map(a => ({
    day: d.day || 1,
    time: a.time,
    activity: a.activity,
    location: a.location,
  }))).slice(0, 8);

  const budget      = trip.budget || trip.estimatedCost || 0;
  const packingCats = trip.packingList?.categories || [];
  const packingCount = packingCats.reduce((t, c) => t + (c.items?.length || 0), 0);

  // Fetch journal photos
  useEffect(() => {
    featuresService.getJournal(trip._id)
      .then(res => {
        const entries = res.journal?.entries || [];
        const pics = entries.flatMap(e =>
          (e.photos || []).map(url => ({
            url,
            caption: e.content?.slice(0, 100) || '',
            mood: e.mood,
            date: e.createdAt,
          }))
        );
        setPhotos(pics);
      })
      .catch(() => {})
      .finally(() => setLP(false));
  }, [trip._id]);

  // Build slides: cover → photos → schedule → stats → outro
  const SLIDE_DURATION = 5000; // ms
  const MOOD_EMOJI = { amazing: '🤩', happy: '😊', neutral: '😐', tired: '🥱', sad: '😔' };

  const slides = [
    { type: 'cover' },
    ...photos.map(p => ({ type: 'photo', ...p })),
    ...(days.length > 0 ? [{ type: 'schedule' }] : []),
    { type: 'stats' },
    { type: 'outro' },
  ];
  const total = slides.length;

  const goTo = useCallback((idx, dir = 1) => {
    clearInterval(timerRef.current);
    setTr(true);
    setTimeout(() => {
      setSlide(idx < 0 ? total - 1 : idx >= total ? 0 : idx);
      setProgress(0);
      setTr(false);
    }, 280);
  }, [total]);

  const next = useCallback(() => goTo(slideIdx + 1), [goTo, slideIdx]);
  const prev = useCallback(() => goTo(slideIdx - 1), [goTo, slideIdx]);

  // Auto-advance
  useEffect(() => {
    if (paused || loadingPhotos) return;
    setProgress(0);
    const step = 50;
    const steps = SLIDE_DURATION / step;
    let tick = 0;
    timerRef.current = setInterval(() => {
      tick++;
      setProgress(Math.min(100, (tick / steps) * 100));
      if (tick >= steps) { clearInterval(timerRef.current); next(); }
    }, step);
    return () => clearInterval(timerRef.current);
  }, [slideIdx, paused, loadingPhotos, next]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'Escape')     onClose();
      if (e.key === ' ') { e.preventDefault(); setPaused(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, onClose]);

  // Download current slide
  const downloadSlide = async () => {
    if (!slideRef.current) return;
    setDL(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(slideRef.current, { scale: 2, useCORS: true, backgroundColor: '#130f2a' });
      const link = document.createElement('a');
      link.download = `Tripify_${trip.city}_Recap_${slideIdx + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch { alert('Download failed'); }
    setDL(false);
  };

  const s = slides[slideIdx] || slides[0];
  const GRADIENT = 'linear-gradient(135deg, #6366f1, #ec4899)';
  const GRADIENT2 = 'linear-gradient(135deg, #10b981, #3b82f6)';

  // ─── Slide content ────────────────────────────────────────────
  const renderSlide = () => {
    if (s.type === 'cover') return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '36px 28px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '3px', opacity: 0.6, marginBottom: '20px' }}>TRIPIFY RECAP</div>
        <div style={{ fontSize: '4.5rem', marginBottom: '16px', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }}>✈️</div>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 900, margin: '0 0 8px', lineHeight: 1.1, textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>{trip.city}</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.85, margin: '0 0 32px' }}>{trip.days} Days · {trip.month}</p>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
          {[
            { label: 'Members', value: trip.members?.length || 1, icon: '👥' },
            { label: 'Activities', value: topActs.length, icon: '📍' },
            { label: 'Photos', value: photos.length, icon: '📸' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '14px', padding: '16px 20px', minWidth: '72px' }}>
              <div style={{ fontSize: '1.6rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stat.value}</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
        {trip.optionName && (
          <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '6px 16px', fontSize: '0.82rem', opacity: 0.85, fontStyle: 'italic' }}>
            "{trip.optionName}" vibe
          </div>
        )}
      </div>
    );

    if (s.type === 'photo') return (
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Full-bleed image */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <img
            src={s.url}
            alt="Memory"
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
          {/* Photo counter badge */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
            📸 {photos.indexOf(s) + 1} / {photos.length}
          </div>
          {/* Caption overlay */}
          {(s.caption || s.date) && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px 16px' }}>
              {s.caption && (
                <p style={{ margin: '0 0 6px', fontSize: '0.88rem', lineHeight: 1.4, color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
                  {MOOD_EMOJI[s.mood] || '📖'} {s.caption}{s.caption.length === 100 ? '…' : ''}
                </p>
              )}
              {s.date && (
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>
                  {new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );

    if (s.type === 'schedule') return (
      <div style={{ height: '100%', overflowY: 'auto', padding: '28px 24px' }} className="custom-scrollbar">
        <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '3px', opacity: 0.6, marginBottom: '12px' }}>TRIPIFY RECAP</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 20px' }}>📅 Day-by-Day</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {days.slice(0, 6).map((day, di) => (
            <div key={di} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.7, marginBottom: '8px' }}>
                Day {day.day || di + 1}{day.title ? ` · ${day.title}` : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(day.activities || []).slice(0, 3).map((act, ai) => (
                  <div key={ai} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.82rem' }}>
                    <span style={{ opacity: 0.55, minWidth: '44px', fontSize: '0.75rem', paddingTop: '1px' }}>{act.time}</span>
                    <span style={{ lineHeight: 1.4 }}>{act.activity}</span>
                  </div>
                ))}
                {(day.activities || []).length > 3 && (
                  <div style={{ fontSize: '0.72rem', opacity: 0.5, paddingLeft: '52px' }}>+{day.activities.length - 3} more</div>
                )}
              </div>
            </div>
          ))}
          {days.length > 6 && (
            <div style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.5 }}>+{days.length - 6} more days</div>
          )}
        </div>
      </div>
    );

    if (s.type === 'stats') return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '28px 24px', gap: '16px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '3px', opacity: 0.6, marginBottom: '4px' }}>TRIPIFY RECAP</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>📊 Trip Stats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { icon: '💰', label: 'Budget', value: `${trip.currency || ''}${budget.toLocaleString()}` },
            { icon: '🗓️', label: 'Duration', value: `${trip.days || 0} Days` },
            { icon: '📍', label: 'Destination', value: trip.city },
            { icon: '👥', label: 'Crew Size', value: `${trip.members?.length || 1} People` },
            { icon: '🎒', label: 'Packing Items', value: packingCount > 0 ? `${packingCount} Items` : '—' },
            { icon: '📸', label: 'Memories', value: `${photos.length} Photos` },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.2 }}>{stat.value}</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
        {/* Member avatars */}
        {(trip.members || []).length > 0 && (
          <div style={{ marginTop: '4px' }}>
            <div style={{ fontSize: '0.72rem', opacity: 0.55, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Crew</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {trip.members.slice(0, 8).map((m, i) => (
                <div key={i} style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: `hsl(${(i * 47) % 360}, 60%, 50%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.88rem', color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                }}>
                  {(m.userId?.name || '?').charAt(0).toUpperCase()}
                </div>
              ))}
              {trip.members.length > 8 && (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
                  +{trip.members.length - 8}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );

    if (s.type === 'outro') return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '36px 24px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🌍</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 8px' }}>What a Trip!</h2>
        <p style={{ fontSize: '1rem', opacity: 0.8, margin: '0 0 32px', lineHeight: 1.5 }}>
          {trip.city} will always hold a special place in your hearts. Until the next adventure! ✈️
        </p>
        <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '16px 24px', fontSize: '1.1rem', fontWeight: 700 }}>
          Planned with Tripify
        </div>
        {topActs.length > 0 && (
          <div style={{ marginTop: '24px', fontSize: '0.82rem', opacity: 0.65, lineHeight: 1.8, maxWidth: '260px' }}>
            {topActs.slice(0, 3).map((a, i) => <div key={i}>📍 {a.activity}</div>)}
          </div>
        )}
      </div>
    );

    return null;
  };

  const bgGrad = s.type === 'photo' ? 'transparent' : s.type === 'schedule' ? 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' : s.type === 'stats' ? 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' : 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)';

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
        @keyframes slideOut { from { opacity:1; transform:scale(1) } to { opacity:0; transform:scale(0.96) } }
        .recap-slide { animation: slideIn 0.28s ease forwards; }
        .recap-slide.out { animation: slideOut 0.28s ease forwards; }
        .recap-hint { font-size: 0.68rem; color: rgba(255,255,255,0.35); text-align:center; margin-top: 6px; }
      `}</style>

      <div style={{ background: 'var(--bg-document)', borderRadius: '24px', maxWidth: '420px', width: '100%', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>

        {/* Loading gate */}
        {loadingPhotos ? (
          <div style={{ height: '520px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: GRADIENT, gap: '16px' }}>
            <div className="loading-spinner" />
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Loading your memories…</p>
          </div>
        ) : (
          <>
            {/* Slide area */}
            <div
              ref={slideRef}
              className={`recap-slide${transitioning ? ' out' : ''}`}
              style={{ height: '480px', background: bgGrad, color: 'white', position: 'relative', flexShrink: 0, overflow: 'hidden' }}
            >
              {renderSlide()}

              {/* Tripify watermark on photo slides */}
              {s.type === 'photo' && (
                <div style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '2px', color: 'rgba(255,255,255,0.6)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  TRIPIFY
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #ec4899)', transition: 'width 0.05s linear' }} />
            </div>

            {/* Slide dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', padding: '12px 20px 8px', flexShrink: 0, flexWrap: 'wrap' }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === slideIdx ? '20px' : '6px', height: '6px',
                    borderRadius: '3px', border: 'none', cursor: 'pointer',
                    background: i === slideIdx ? 'var(--brand-primary)' : 'var(--border-default)',
                    transition: 'all 0.3s', padding: 0,
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '8px', padding: '8px 16px 16px', flexShrink: 0 }}>
              <button className="btn btn-ghost btn-sm" onClick={prev} style={{ width: '40px', padding: 0 }}>‹</button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPaused(p => !p)}
                style={{ width: '40px', padding: 0, fontSize: '1rem' }}
              >
                {paused ? '▶' : '⏸'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={next} style={{ width: '40px', padding: 0 }}>›</button>
              <div style={{ flex: 1 }} />
              <button
                className="btn btn-outline btn-sm"
                onClick={downloadSlide}
                disabled={downloading}
                style={{ fontSize: '0.78rem' }}
              >
                {downloading ? '…' : '📸 Save Slide'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: '0.78rem' }}>✕</button>
            </div>
            <p className="recap-hint" style={{ paddingBottom: '10px' }}>← → arrows · Space to pause · Esc to close</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function TripDetailScreen({ currentUserId }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('Plan');
  const [activeDay, setActiveDay] = useState(0);
  const [showRecap, setShowRecap] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    plannerService.getTripById(id)
      .then(data => setTrip(data.trip))
      .catch(err => {
        const offlineTrips = JSON.parse(localStorage.getItem('offlineTrips') || '{}');
        if (offlineTrips[id]) {
          setTrip(offlineTrips[id]);
          alert('Loaded from Offline Vault! You are viewing this trip without an active connection.');
        } else {
          navigate('/trips');
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!trip || !trip._id) return;
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4000' : '/_/backend');
    socketRef.current = io(socketUrl);
    socketRef.current.emit('join', trip._id);

    socketRef.current.on('tripUpdated', (updatedTrip) => {
      if (data.senderId !== currentUserId) {
        setTrip(updatedTrip);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [trip?._id, currentUserId]);

  const saveOffline = () => {
    if (!trip) return;
    try {
      const offlineTrips = JSON.parse(localStorage.getItem('offlineTrips') || '{}');
      offlineTrips[trip._id] = trip;
      localStorage.setItem('offlineTrips', JSON.stringify(offlineTrips));
      alert('Trip saved to Offline Vault! You can now access this trip without an internet connection.');
    } catch (e) {
      alert('Failed to save offline (Storage full?)');
    }
  };

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '12vh' }}>
      <div className="loading-spinner" />
    </div>
  );
  if (!trip) return null;

  const isAdmin = trip.admin?._id === currentUserId || trip.admin === currentUserId;
  const filteredTabs = isAdmin ? TABS : TABS.filter(t => t !== 'Settings');
  const days = Array.isArray(trip.itinerary?.days) ? trip.itinerary.days : (Array.isArray(trip.itinerary) ? trip.itinerary : []);
  const currentDay = days[activeDay] || {};

  return (
    <div className="container animate-fade-in">
      {/* ── Hero Header ──────────────────── */}
      <div className="glass-panel trip-hero" style={{ marginBottom: '28px' }}>
        <div className="trip-hero-content">
          <div className="trip-hero-badge">
            ✈️ Collaborative Adventure
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 className="trip-hero-title">{trip.title}</h1>
              <div className="trip-hero-meta" style={{ marginBottom: '12px' }}>
                <span>📍 {trip.city}</span>
                <span>👥 {trip.members?.length} Members</span>
                <span>🗓️ {trip.days} Days · {trip.month}</span>
              </div>
              <WeatherWidget city={trip.city} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <span className="badge badge-admin" style={{ padding: '8px 18px', fontSize: '0.78rem' }}>
                Plan {trip.selectedOption} · {trip.optionName}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={saveOffline}
                  style={{ borderColor: 'var(--brand-emerald)', color: 'var(--brand-emerald)' }}
                >
                  📥 Save Offline
                </button>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', border: 'none', boxShadow: '0 0 15px rgba(251, 191, 36, 0.4)' }}
                  onClick={() => navigate(`/atlas/${trip._id}`)}
                >
                  🗺️ War Room
                </button>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', border: 'none' }}
                  onClick={() => setShowRecap(true)}
                >
                  🎬 Recap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRecap && <TripRecapModal trip={trip} onClose={() => setShowRecap(false)} />}

      {/* ── Tabs ─────────────────────────── */}
      <div className="page-tabs">
        {filteredTabs.map(tab => (
          <div key={tab} className={`page-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
            {tab === 'Members' && isAdmin && trip.joinRequests?.filter(r => r.status === 'pending').length > 0 && (
              <span className="notification-dot" style={{ display: 'inline-block', marginLeft: '6px', verticalAlign: 'middle' }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Tab Content ──────────────────── */}
      <div style={{ minHeight: '400px' }}>

        {/* ==== PLAN TAB ==== */}
        {activeTab === 'Plan' && (
          <div className="animate-fade-in">
            {/* Booking Options */}
            {trip.itinerary?.bookingOptions && trip.itinerary.bookingOptions.length > 0 && (
              <div className="glass-panel" style={{ marginBottom: '28px', border: '1px solid rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.03)' }}>
                <h3 style={{ marginBottom: '14px', color: 'var(--brand-primary)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎫 Suggested Bookings
                </h3>
                <div className="booking-grid">
                  {trip.itinerary.bookingOptions.map((opt, i) => (
                    <div key={i} className="booking-card">
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '0.92rem' }}>{opt.type}</span>
                          <span style={{ color: 'var(--brand-amber)', fontWeight: 600, fontSize: '0.85rem' }}>{opt.priceHint}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>via {opt.provider}</div>
                        <p style={{ fontSize: '0.85rem', marginTop: '8px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{opt.description}</p>
                      </div>
                      <a href={opt.link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', marginTop: 'auto' }}>
                        Check Options
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day Pills */}
            <div className="day-pills">
              {days.map((day, i) => (
                <button key={i} className={`day-pill ${activeDay === i ? 'active' : ''}`} onClick={() => setActiveDay(i)}>
                  Day {day.day || (i + 1)}
                </button>
              ))}
            </div>

            {/* Day Content with Timeline */}
            <div className="glass-panel animate-fade-in" key={activeDay}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.3rem', margin: 0 }}>
                  {currentDay.title || `Day ${activeDay + 1}`}
                </h2>
                {socketRef.current && (
                  <span className="badge badge-open" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--brand-emerald)', padding: '6px 12px', fontSize: '0.75rem' }}>
                    🟢 Live Sync
                  </span>
                )}
              </div>
              <div className="timeline">
                {(currentDay.activities || []).map((act, i) => (
                  <div key={i} className="timeline-item group">
                    <div className="timeline-time">{act.time}</div>
                    <div className="timeline-line">
                      <div className="timeline-dot" />
                      {i < (currentDay.activities || []).length - 1 && <div className="timeline-connector" />}
                    </div>
                    <div className="timeline-content" style={{ position: 'relative' }}>
                      <h4>{act.activity}</h4>
                      <p>{act.description}</p>
                      {act.location && <div className="timeline-location">📍 {act.location}</div>}
                      
                      {/* Simple Delete logic to trigger socket sync */}
                      <button 
                        className="btn btn-outline btn-sm delete-btn" 
                        style={{ position: 'absolute', top: 0, right: 0, padding: '4px 8px', fontSize: '0.7rem', opacity: 0.5 }}
                        title="Delete Activity"
                        onClick={async () => {
                          if (!window.confirm(`Delete ${act.activity}?`)) return;
                          
                          // Clone and update the itinerary locally
                          const newItinerary = JSON.parse(JSON.stringify(trip.itinerary));
                          newItinerary.days[activeDay].activities.splice(i, 1);
                          
                          // Optimistic UI Update
                          setTrip(prev => ({ ...prev, itinerary: newItinerary }));
                          
                          // Sync via WebSockets
                          if (socketRef.current) {
                            socketRef.current.emit('updateItinerary', { room: trip._id, itinerary: newItinerary, senderId: currentUserId });
                          }
                          
                          // Save to DB
                          plannerService.updateTrip(trip._id, { itinerary: newItinerary }).catch(e => console.error(e));
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==== MAP TAB ==== */}
        {activeTab === 'Map' && <MapTab trip={trip} />}

        {/* ==== BUDGET TAB ==== */}
        {activeTab === 'Budget' && (() => {
          const finalBudget = trip.budget || trip.estimatedCost || 0;
          return (
            <div className="glass-panel animate-fade-in">
              <h2 style={{ marginBottom: '6px', fontSize: '1.3rem' }}>💰 Budget Tracker</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.92rem' }}>Track shared expenses and manage the balance.</p>

              <div className="budget-grid" style={{ marginBottom: '28px' }}>
                <div className="budget-stat">
                  <div className="budget-stat-label">Allocated</div>
                  <div className="budget-stat-value" style={{ color: 'var(--text-primary)' }}>{trip.currency}{finalBudget.toLocaleString()}</div>
                </div>
                <div className="budget-stat">
                  <div className="budget-stat-label">Spent</div>
                  <div className="budget-stat-value" style={{ color: 'var(--brand-emerald)' }}>{trip.currency}{(trip.budgetSpent || 0).toLocaleString()}</div>
                </div>
                <div className="budget-stat">
                  <div className="budget-stat-label">Remaining</div>
                  <div className="budget-stat-value" style={{ color: 'var(--brand-primary)' }}>{trip.currency}{Math.max(0, finalBudget - (trip.budgetSpent || 0)).toLocaleString()}</div>
                </div>
                <div className="budget-stat">
                  <div className="budget-stat-label">Daily</div>
                  <div className="budget-stat-value" style={{ color: 'var(--brand-amber)' }}>{trip.currency}{Math.round(finalBudget / (trip.days || 1)).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: 'var(--border-radius-md)' }}>
                <h4 style={{ color: 'var(--brand-amber)', marginBottom: '6px', fontSize: '0.95rem' }}>
                  AI Estimated Cost: {trip.currency}{(trip.estimatedCost || 0).toLocaleString()}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Daily average: <strong>{trip.currency}{Math.round((trip.estimatedCost || 0) / (trip.days || 1)).toLocaleString()}</strong>
                </p>

                {trip.itinerary?.budgetBreakdown && (
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(245, 158, 11, 0.1)' }}>
                    <h5 style={{ color: 'var(--brand-amber)', marginBottom: '14px', fontSize: '0.88rem' }}>Category Breakdown</h5>
                    <div className="grid-4">
                      {Object.entries(trip.itinerary.budgetBreakdown).map(([cat, amount]) => (
                        <div key={cat} style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{cat}</span>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{trip.currency}{amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── INR → Trip Currency Converter ───────────────────── */}
              <InrConverter tripCurrency={trip.currency} />
            </div>
          );
        })()}

        {/* ==== OTHER TABS ==== */}
        {activeTab === 'Packing' && <PackingTab trip={trip} onUpdate={setTrip} />}
        {activeTab === 'Safety' && <SafetyTab trip={trip} />}
        {activeTab === 'Expenses' && <ExpensesTab trip={trip} />}
        {activeTab === 'Journal' && <JournalTab trip={trip} />}
        {activeTab === 'Memories' && <MemoriesTab trip={trip} />}
        {activeTab === 'Members' && <MembersTab trip={trip} currentUserId={currentUserId} onUpdate={setTrip} />}
        {activeTab === 'Reviews' && <ReviewsTab trip={trip} />}
        {activeTab === 'Settings' && isAdmin && <SettingsTab trip={trip} onUpdate={setTrip} />}
      </div>
    </div>
  );
}
