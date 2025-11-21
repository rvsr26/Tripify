import React, { useState, useEffect } from 'react';
import { experienceService } from '../api';

export default function ExperiencesScreen() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');

  const loadExperiences = async (city = '') => {
    setLoading(true);
    try {
      const res = await experienceService.getExperiences(city);
      setExperiences(res.experiences);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadExperiences(searchCity);
  };

  return (
    <div className="container animate-fade-in">
      <div className="glass-panel" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', color: 'white' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 800 }}>Local Experts Marketplace</h1>
        <p style={{ opacity: 0.9, fontSize: '1.05rem', marginBottom: '24px' }}>Discover and book unique experiences hosted by locals around the world.</p>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by city (e.g., Paris, Tokyo)" 
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            style={{ background: 'white', color: 'black' }}
          />
          <button type="submit" className="btn btn-primary" style={{ background: '#0f172a', border: 'none' }}>
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="loading-spinner" /></div>
      ) : experiences.length === 0 ? (
        <div className="glass-panel empty-state">
          <div className="empty-state-icon">🌍</div>
          <h2>No experiences found</h2>
          <p>Be the first to host an experience in this city!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {experiences.map(exp => (
            <div key={exp._id} className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '200px', backgroundImage: `url(${exp.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <span className="badge" style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                  {exp.category}
                </span>
              </div>
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  📍 {exp.city}  •  ⏱️ {exp.duration}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', lineHeight: 1.4 }}>{exp.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {exp.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-default)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="avatar-initials" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                      {exp.hostId?.name?.charAt(0) || '?'}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{exp.hostId?.name}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-emerald)' }}>
                    {exp.currency}{exp.price}
                  </div>
                </div>
                <button className="btn btn-outline" style={{ marginTop: '16px', width: '100%', borderColor: 'var(--brand-emerald)', color: 'var(--brand-emerald)' }}>
                  Book Experience
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Build verification patch on 11/21/2025, 1:57:00 PM
