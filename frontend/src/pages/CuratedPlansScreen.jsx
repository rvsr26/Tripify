import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { curatedPlans } from '../data/curatedPlans';
import { Search, MapPin, Clock, CreditCard, ChevronRight } from 'lucide-react';

export default function CuratedPlansScreen() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredPlans = curatedPlans.filter(p => 
    p.city.toLowerCase().includes(search.toLowerCase()) || 
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
      {/* Header Section */}
      <header style={{ marginBottom: '60px', textAlign: 'center' }}>
        <h1 className="vibrant-gradient-text" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>Curated Journeys</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 40px' }}>
          Hand-picked by our travel experts. These elite itineraries are ready for your next adventure.
        </p>

        {/* Search Bar */}
        <div className="glass-panel" style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '12px 24px',
          borderRadius: '99px',
          border: '1px solid var(--brand-gold-light)',
          background: 'var(--bg-white)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <Search size={20} style={{ color: 'var(--brand-gold)', marginRight: '16px' }} />
          <input 
            type="text" 
            placeholder="Search by city or experience..." 
            className="magic-input" 
            style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Grid Section */}
      <div className="grid-3" style={{ gap: '32px' }}>
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan, i) => (
            <div 
              key={plan.id} 
              className="glass-panel animate-fade-up" 
              style={{ 
                padding: 0, 
                overflow: 'hidden', 
                cursor: 'pointer',
                transition: 'all 0.5s var(--ease-soft)',
                animationDelay: `${i * 0.05}s`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-white)',
                boxShadow: 'var(--shadow-md)'
              }}
              onClick={() => navigate(`/discover/${plan.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                e.currentTarget.style.borderColor = 'var(--brand-gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
            >
              <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
                <img 
                  src={plan.image} 
                  alt={plan.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s var(--ease-soft)' }} 
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />
                <div style={{ 
                  position: 'absolute', 
                  top: '20px', 
                  right: '20px', 
                  background: 'rgba(255,255,255,0.9)', 
                  padding: '6px 14px', 
                  borderRadius: '99px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--brand-gold)',
                  backdropFilter: 'blur(10px)'
                }}>
                  {plan.budget} {plan.currency}
                </div>
              </div>

              <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                   <span className="badge badge-admin" style={{ background: 'rgba(217, 119, 6, 0.1)', color: 'var(--brand-gold)', border: 'none' }}>Elite Choice</span>
                   <span className="badge badge-member" style={{ border: 'none', background: 'var(--bg-body)' }}>{plan.days} Days</span>
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '12px', color: 'var(--text-primary)' }}>{plan.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
                  {plan.description}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <MapPin size={16} /> <span>{plan.city}</span>
                  </div>
                  <div style={{ color: 'var(--brand-gold)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View Details <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
            <h2 style={{ color: 'var(--text-muted)' }}>No curated journeys found matching your search.</h2>
          </div>
        )}
      </div>
    </div>
  );
}
