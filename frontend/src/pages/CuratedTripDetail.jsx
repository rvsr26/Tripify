import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { curatedPlans } from '../data/curatedPlans';
import { plannerService } from '../api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Calendar, Map as MapIcon, Package, Star, 
  ChevronRight, ArrowLeft, Download, Share2, 
  Sparkles, ExternalLink, ShieldCheck
} from 'lucide-react';

// ── REUSABLE SUB-COMPONENTS (Adapted from TripDetailScreen) ──────────────────

function ItineraryTab({ itinerary }) {
  const days = itinerary.days || [];
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {days.map((day, i) => (
        <div key={i} className="glass-panel" style={{ padding: '32px', borderRadius: '32px', border: '1px solid var(--border-default)', background: 'var(--bg-white)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>Day {day.day}: {day.theme}</h3>
            <span className="badge badge-admin" style={{ padding: '6px 16px', background: 'rgba(217, 119, 6, 0.1)', color: 'var(--brand-gold)', border: 'none' }}>Curated Stop</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {day.activities.map((act, idx) => (
              <div key={idx} style={{ 
                display: 'flex', gap: '20px', padding: '20px', 
                background: 'var(--bg-body)', borderRadius: '20px',
                borderLeft: '4px solid var(--brand-gold)',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <div style={{ minWidth: '85px', fontWeight: 800, color: 'var(--brand-gold)', fontSize: '0.9rem' }}>{act.time}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>{act.activity}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapIcon size={14} /> {act.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MapTab({ plan }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([plan.location.lat, plan.location.lng], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      const goldIcon = L.divIcon({
        html: `<div style="background: var(--brand-gold); width: 12px; height: 12px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(217, 119, 6, 0.5);"></div>`,
        className: 'custom-gold-marker'
      });

      // Destination Marker
      L.marker([plan.location.lat, plan.location.lng], { icon: goldIcon }).addTo(mapInstance.current).bindPopup(`<b>${plan.city}</b>`).openPopup();

      // Activity Markers
      const bounds = L.latLngBounds([plan.location.lat, plan.location.lng]);
      plan.itinerary.days.forEach(day => {
        day.activities.forEach(act => {
          if (act.coordinates) {
            L.marker([act.coordinates.lat, act.coordinates.lng], { icon: goldIcon })
              .addTo(mapInstance.current)
              .bindPopup(`<b>${act.activity}</b><br/>${act.time}`);
            bounds.extend([act.coordinates.lat, act.coordinates.lng]);
          }
        });
      });
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, [plan]);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: 0, overflow: 'hidden', height: '600px', borderRadius: '32px', border: '1px solid var(--border-default)' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

function PackingTab({ packingList }) {
  if (!packingList || !packingList.categories) return (
    <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
      <Package size={48} style={{ color: 'var(--brand-gold)', opacity: 0.3, marginBottom: '16px' }} />
      <p style={{ color: 'var(--text-muted)' }}>Packing list is being finalized for this journey.</p>
    </div>
  );
  return (
    <div className="animate-fade-in grid-2" style={{ gap: '24px' }}>
      {packingList.categories.map((cat, i) => (
        <div key={i} className="glass-panel" style={{ padding: '32px', borderRadius: '24px', border: '1px solid var(--border-default)', background: 'var(--bg-white)' }}>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span> {cat.name}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cat.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-gold)' }}></div>
                {item}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewsTab({ reviews: initialReviews, planTitle }) {
  const [reviews, setReviews] = useState(initialReviews || []);
  const [newText, setNewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const newReview = {
        user: 'You',
        rating: newRating,
        text: newText,
        avatar: 'Y',
        isNew: true
      };
      setReviews([newReview, ...reviews]);
      setNewText('');
      setNewRating(5);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* hardcoded Verified Stats */}
      <div className="glass-panel" style={{ display: 'flex', gap: '40px', padding: '32px', background: 'var(--bg-white)', borderRadius: '24px' }}>
         <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--brand-gold)' }}>4.9</div>
            <div style={{ color: '#fbbf24', fontSize: '1.2rem', marginBottom: '4px' }}>★★★★★</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>CURATED RATING</div>
         </div>
         <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Traveler Community</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              These reviews are from our Elite members who have completed this specific curated itinerary. 
              Join the 1,200+ travelers who loved {planTitle}.
            </p>
         </div>
      </div>

      <div className="grid-2" style={{ gap: '24px', alignItems: 'flex-start' }}>
        {/* Review List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviews.map((r, i) => (
            <div key={i} className="glass-panel animate-fade-in" style={{ 
              padding: '24px', 
              background: r.isNew ? 'rgba(217, 119, 6, 0.05)' : 'var(--bg-white)',
              border: r.isNew ? '1px solid var(--brand-gold)' : '1px solid var(--border-default)',
              borderRadius: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="avatar-initials" style={{ width: '36px', height: '36px', background: 'var(--brand-gold)', color: 'white' }}>{r.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{r.user}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Traveler</div>
                  </div>
                </div>
                <div style={{ color: '#fbbf24', fontSize: '0.9rem' }}>{'★'.repeat(r.rating)}</div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>"{r.text}"</p>
            </div>
          ))}
        </div>

        {/* Write Review Form */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', position: 'sticky', top: '40px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Share Your Experience</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>YOUR RATING</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                   {[1,2,3,4,5].map(s => (
                     <Star 
                      key={s} 
                      size={24} 
                      style={{ cursor: 'pointer', fill: s <= newRating ? '#fbbf24' : 'none', color: s <= newRating ? '#fbbf24' : 'var(--border-default)' }} 
                      onClick={() => setNewRating(s)}
                     />
                   ))}
                </div>
             </div>
             <textarea 
              className="input-field" 
              placeholder="What did you love about this curated journey?" 
              style={{ minHeight: '120px' }}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              required
             />
             <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post Community Review'}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function CuratedTripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('itinerary');
  const [loading, setLoading] = useState(false);
  const plan = curatedPlans.find(p => p.id === id);

  if (!plan) return <div style={{ textAlign: 'center', paddingTop: '100px' }}><h1>Journey Not Found</h1><Link to="/discover">Back to Discovery</Link></div>;

  const handleAdopt = async () => {
    setLoading(true);
    try {
      const tripData = {
        title: plan.title,
        city: plan.city,
        budget: plan.budget,
        days: plan.days,
        itinerary: plan.itinerary,
        packingList: plan.packingList,
        location: plan.location,
        currency: plan.currency,
        interests: ['Curated', 'Luxury']
      };
      const res = await plannerService.createTrip(tripData);
      navigate(`/trip/${res.trip._id}`);
    } catch (err) {
      alert('Failed to adopt trip. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '160px' }}>
      {/* Dynamic Background Blur */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '400px', background: `linear-gradient(to bottom, rgba(246, 241, 227, 0.9), transparent), url(${plan.image})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -1, filter: 'blur(60px)', opacity: 0.3 }}></div>

      {/* Hero Header */}
      <header style={{ marginBottom: '48px', position: 'relative' }}>
         <button onClick={() => navigate('/discover')} className="btn btn-outline btn-sm" style={{ marginBottom: '32px', borderRadius: '99px', padding: '10px 20px', gap: '8px' }}>
            <ArrowLeft size={18} /> Back to Discovery
         </button>
         
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '32px' }}>
           <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span className="badge badge-admin" style={{ background: 'var(--brand-gold)', color: 'white', border: 'none', padding: '6px 16px' }}>Expert Pick</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <MapIcon size={16} /> {plan.city}, {plan.location.address.split(',').pop().trim()}
                </span>
              </div>
              <h1 style={{ fontSize: '4.2rem', fontWeight: 900, marginBottom: '20px', color: 'var(--text-primary)', letterSpacing: '-2px', lineHeight: 1 }}>{plan.title}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: 1.6, maxWidth: '850px' }}>{plan.description}</p>
           </div>
           
           <div className="glass-panel" style={{ padding: '24px 40px', borderRadius: '32px', border: '1px solid var(--brand-gold-light)', background: 'var(--bg-white)', boxShadow: 'var(--shadow-lg)', display: 'flex', gap: '32px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 700 }}>Estimated</div>
                 <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--brand-gold)' }}>{plan.currency}{plan.budget}</div>
              </div>
              <div style={{ height: '40px', width: '1px', background: 'var(--border-subtle)' }}></div>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 700 }}>Duration</div>
                 <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>{plan.days} Days</div>
              </div>
           </div>
         </div>
      </header>

      {/* Tabs Layout */}
      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
         {/* Navigation Sidebar */}
         <div className="glass-panel" style={{ width: '280px', padding: '12px', borderRadius: '32px', sticky: 'top', top: '40px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-default)', background: 'var(--bg-white)' }}>
            <button className={`btn ${activeTab === 'itinerary' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('itinerary')} style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 20px', borderRadius: '20px' }}>
               <Calendar size={20} /> Itinerary
            </button>
            <button className={`btn ${activeTab === 'map' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('map')} style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 20px', borderRadius: '20px' }}>
               <MapIcon size={20} /> Smart Map
            </button>
            <button className={`btn ${activeTab === 'packing' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('packing')} style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 20px', borderRadius: '20px' }}>
               <Package size={20} /> Packing List
            </button>
            <button className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('reviews')} style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 20px', borderRadius: '20px' }}>
               <Star size={20} /> Traveler Reviews
            </button>
            
            <div style={{ marginTop: '24px', padding: '24px', background: 'var(--bg-body)', borderRadius: '24px', textAlign: 'center' }}>
               <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Start your journey</div>
               <button 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', padding: '16px', borderRadius: '16px' }}
                onClick={handleAdopt}
                disabled={loading}
               >
                  {loading ? 'Processing...' : 'Adopt This Plan'}
               </button>
            </div>
         </div>

         {/* Content Area */}
         <div style={{ flex: 1 }}>
            {activeTab === 'itinerary' && <ItineraryTab itinerary={plan.itinerary} />}
            {activeTab === 'map' && <MapTab plan={plan} />}
            {activeTab === 'packing' && <PackingTab packingList={plan.packingList} />}
            {activeTab === 'reviews' && <ReviewsTab reviews={plan.reviews} planTitle={plan.title} />}
         </div>
      </div>
    </div>
  );
}
