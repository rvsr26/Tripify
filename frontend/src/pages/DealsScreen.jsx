import React, { useState, useEffect } from 'react';
import { featuresService } from '../api';

export default function DealsScreen() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    featuresService.getDeals()
      .then(res => setDeals(res.deals || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const filteredDeals = filter === 'all' ? deals : deals.filter(d => d.type === filter);

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '12vh' }}>
      <div className="loading-spinner" />
    </div>
  );

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>🎁 Exclusive Travel Deals</h1>
          <p>Personalized discounts based on your bucket list and upcoming trips.</p>
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-default)' }}>
          <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('all')}>All</button>
          <button className={`btn btn-sm ${filter === 'flight' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('flight')}>Flights</button>
          <button className={`btn btn-sm ${filter === 'hotel' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('hotel')}>Hotels</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {filteredDeals.map((deal, i) => (
          <div key={deal.id} className="glass-panel animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: 'var(--gradient-brand)', height: '8px' }} />
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>{deal.icon}</span>
                <span className="badge" style={{ background: 'var(--brand-emerald)', color: 'white' }}>{deal.discount}</span>
              </div>
              
              <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{deal.title}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📍 {deal.destination}</span>
                <span>•</span>
                <span>via {deal.provider}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', marginTop: 'auto' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                  ${deal.dealPrice}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ${deal.originalPrice}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--brand-amber)', fontWeight: 600 }}>Expires in: {deal.expiresIn}</span>
                <a href={deal.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Get Deal</a>
              </div>
            </div>
          </div>
        ))}

        {filteredDeals.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '100px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>💸</span>
            <h2>No deals found</h2>
            <p>Check back later or add items to your bucket list to get notified first!</p>
          </div>
        )}
      </div>
    </div>
  );
}
