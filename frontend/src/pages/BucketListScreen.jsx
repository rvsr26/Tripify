import React, { useState, useEffect, useRef } from 'react';
import { featuresService } from '../api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Navigation, Trash2, CheckCircle, Globe } from 'lucide-react';

const EMOJIS = ['📍', '🗼', '🏔️', '🏖️', '🏰', '🗽', '🌋', '🏕️', '🍜', '⛷️', '🌴', '🏛️'];

export default function BucketListScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newDest, setNewDest] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newEmoji, setNewEmoji] = useState('📍');
  const [newLocation, setNewLocation] = useState(null);
  
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    loadBucket();
  }, []);

  // 🌍 Map Logic
  useEffect(() => {
    if (viewMode === 'map' && !loading && mapRef.current && !mapInstance.current) {
      initMap();
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [viewMode, loading]);

  const initMap = () => {
    mapInstance.current = L.map(mapRef.current).setView([20, 0], 2);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    
    L.tileLayer(
      isDark 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenStreetMap contributors' }
    ).addTo(mapInstance.current);

    // Add existing markers
    items.filter(i => i.location).forEach(item => {
      const marker = L.marker([item.location.lat, item.location.lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="font-size: 24px; filter: ${item.visited ? 'grayscale(1)' : 'none'}">${item.emoji}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(mapInstance.current);
      
      marker.bindPopup(`<b>${item.destination}</b><br/>${item.priority} priority`);
    });

    // Click to add
    mapInstance.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      
      // Temporary pin
      const tempMarker = L.marker([lat, lng]).addTo(mapInstance.current);
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        
        const city = data.address.city || data.address.town || data.address.village || data.address.state || 'Unknown Place';
        const country = data.address.country || '';
        
        setNewDest(city);
        setNewCountry(country);
        setNewLocation({ lat, lng });
        setIsAdding(true);
      } catch (err) {
        console.error('Geocoding failed', err);
        setNewDest(`${lat.toFixed(2)}, ${lng.toFixed(2)}`);
        setNewLocation({ lat, lng });
        setIsAdding(true);
      } finally {
        tempMarker.remove();
      }
    });
  };

  const loadBucket = async () => {
    try {
      const res = await featuresService.getBucketList();
      setItems(res.bucketList?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newDest.trim()) return;
    try {
      const res = await featuresService.addBucketItem({
        destination: newDest,
        country: newCountry,
        priority: newPriority,
        emoji: newEmoji,
        location: newLocation
      });
      setItems(res.bucketList.items);
      setIsAdding(false);
      setNewDest('');
      setNewCountry('');
      setNewPriority('medium');
      setNewEmoji('📍');
      setNewLocation(null);
    } catch (e) {
      console.error(e);
    }
  };

  const traverseStatus = async (itemId, visited) => {
    try {
      setItems(prev => prev.map(i => i._id === itemId ? { ...i, visited: !visited } : i));
      await featuresService.updateBucketItem(itemId, { visited: !visited });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      setItems(prev => prev.filter(i => i._id !== itemId));
      await featuresService.removeBucketItem(itemId);
    } catch (e) {
      console.error(e);
    }
  };

  const visitedCount = items.filter(i => i.visited).length;
  const progress = items.length ? Math.round((visitedCount / items.length) * 100) : 0;

  if (loading) return <div className="loading-spinner" style={{ margin: '100px auto' }} />;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1><span className="gradient-text">Travel Bucket List</span></h1>
          <p>Where to next? Track your dream destinations.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="glass-panel" style={{ display: 'flex', padding: '4px', borderRadius: '12px' }}>
             <button 
               className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
               onClick={() => setViewMode('list')}
               style={{ borderRadius: '8px' }}
             >
               List
             </button>
             <button 
               className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-ghost'}`}
               onClick={() => setViewMode('map')}
               style={{ borderRadius: '8px' }}
             >
               Map
             </button>
          </div>
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>+ Add Destination</button>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <span>{visitedCount} of {items.length} visited</span>
            <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{progress}% Completd</span>
          </div>
          <div style={{ height: '10px', background: 'var(--bg-document)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--gradient-brand)', width: `${progress}%`, transition: 'width 0.5s var(--ease-out)' }} />
          </div>
        </div>
        <div style={{ fontSize: '2rem' }}>
          {progress === 100 && items.length > 0 ? '🎉' : progress > 50 ? '🔥' : '🌍'}
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="glass-panel animate-fade-in" style={{ height: '600px', padding: '0', overflow: 'hidden', position: 'relative' }}>
          <div ref={mapRef} style={{ height: '100%', width: '100%', zIndex: 1 }} />
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', pointerEvents: 'none' }}>
             📍 Click anywhere on the map to pin a new destination!
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {items.map(item => (
            <div key={item._id} className="glass-panel animate-slide-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              {item.visited && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-hover)', zIndex: 0, opacity: 0.5, pointerEvents: 'none' }} />
              )}
              
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ fontSize: '2.5rem', filter: item.visited ? 'grayscale(100%)' : 'none' }}>
                  {item.emoji}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className={`badge ${
                    item.priority === 'dream' ? 'danger' :
                    item.priority === 'high' ? 'primary' :
                    item.priority === 'medium' ? 'warning' : 'default'
                  }`}>
                    {item.priority}
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(item._id)} aria-label="Delete" style={{ padding: '4px' }}>✕</button>
                </div>
              </div>

              <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', textDecoration: item.visited ? 'line-through' : 'none', color: item.visited ? 'var(--text-muted)' : 'inherit' }}>
                  {item.destination}
                </h3>
                {item.country && (
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={12} /> {item.country}
                  </p>
                )}
                {item.location && (
                  <p style={{ margin: '4px 0 0 0', color: 'var(--brand-primary)', fontSize: '0.7rem', fontWeight: 600 }}>
                    📍 Pinned on Map
                  </p>
                )}
              </div>

              <div style={{ position: 'relative', zIndex: 1, marginTop: '20px' }}>
                <button 
                  className={`btn ${item.visited ? 'btn-outline' : 'btn-primary'}`} 
                  style={{ width: '100%' }}
                  onClick={() => traverseStatus(item._id, item.visited)}
                >
                  {item.visited ? 'Mark Unvisited' : 'Mark as Visited ✓'}
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && !loading && (
            <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🗺️</span>
              <p>Your bucket list is empty. Add your dream destinations!</p>
            </div>
          )}
        </div>
      )}

      {isAdding && (
        <div className="modal-overlay" onClick={() => setIsAdding(false)}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Add Destination</h2>
            <form onSubmit={handleAdd}>
              <div className="input-group">
                <label>Emoji</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {EMOJIS.map(e => (
                    <button type="button" key={e} className={`icon-pick ${newEmoji === e ? 'active' : ''}`} onClick={() => setNewEmoji(e)}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>Destination (City, Region, Landmark)</label>
                <input className="input-field" value={newDest} onChange={e => setNewDest(e.target.value)} placeholder="e.g. Kyoto, Machu Picchu" autoFocus required />
              </div>
              <div className="input-group">
                <label>Country (Optional)</label>
                <input className="input-field" value={newCountry} onChange={e => setNewCountry(e.target.value)} placeholder="e.g. Japan" />
              </div>
              <div className="input-group">
                <label>Priority</label>
                <select className="input-field" value={newPriority} onChange={e => setNewPriority(e.target.value)}>
                  <option value="low">Someday (Low)</option>
                  <option value="medium">Would be nice (Medium)</option>
                  <option value="high">Actively planning (High)</option>
                  <option value="dream">Ultimate Dream (Highest)</option>
                </select>
              </div>
              {newLocation && (
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--brand-primary)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  📍 Pinned at {newLocation.lat.toFixed(4)}, {newLocation.lng.toFixed(4)}
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                <button type="button" className="btn btn-outline" onClick={() => setIsAdding(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
