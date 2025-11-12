import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { plannerService, featuresService, socialService, communityService } from '../api';
import { curatedPlans } from '../data/curatedPlans';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import TravelStatsScreen from './TravelStatsScreen';
import BucketListScreen from './BucketListScreen';

export default function HomeScreen({ user }) {
  const navigate = useNavigate();
  const [stats, setStats]           = useState(null);
  const [allTrips, setAllTrips]     = useState([]);
  const [currentTripIndex, setCurrentTripIndex] = useState(0);
  const [feedTrips, setFeedTrips]   = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('Dashboard');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [statsRes, tripsRes, feedRes, commRes] = await Promise.all([
          featuresService.getStats(),
          plannerService.getMyTrips(),
          socialService.getFeed(),
          communityService.mine()
        ]);
        
        setStats(statsRes.stats);
        setAllTrips(tripsRes.trips || []);
        setFeedTrips(feedRes.trips?.slice(0, 3) || []);
        setCommunities(commRes.communities?.slice(0, 4) || []);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Auto-scroll logic for Trip Carousel
  useEffect(() => {
    if (allTrips.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentTripIndex((prev) => (prev + 1) % allTrips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [allTrips.length]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '12vh' }}>
      <div className="loading-spinner" />
    </div>
  );

  const activeTrip = allTrips[currentTripIndex];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="section-header animate-slide-up dashboard-greeting">
         <h1>
           {getGreeting()}, <span className="vibrant-gradient-text">{user.name.split(' ')[0]}!</span>
         </h1>
         <p>
           Your global command center is ready. Where to next?
         </p>
      </div>

      <div className="page-tabs glass-panel home-tabs">
         <div className={`page-tab ${activeTab === 'Dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('Dashboard')}>Dashboard</div>
         <div className={`page-tab ${activeTab === 'Stats' ? 'active' : ''}`} onClick={() => setActiveTab('Stats')}>My Stats</div>
         <div className={`page-tab ${activeTab === 'Bucket' ? 'active' : ''}`} onClick={() => setActiveTab('Bucket')}>Bucket List</div>
      </div>

      {activeTab === 'Stats' ? (
         <TravelStatsScreen />
      ) : activeTab === 'Bucket' ? (
         <BucketListScreen />
      ) : (
         <div className="bento-grid">
        {/* ── Main Hero Widget: Trip Carousel ── */}
        <div className="bento-item bento-item-large gradient-border-hover carousel-container" style={{ position: 'relative', overflow: 'hidden' }}>
           {allTrips.length > 0 ? (
             <div className="hero-widget-content animate-fade-in" key={activeTrip._id}>
                <div className="badge-row">
                  <span className="badge badge-admin">
                    {currentTripIndex === 0 ? 'Upcoming Adventure' : `Planned Trip ${currentTripIndex + 1}`}
                  </span>
                  <span className="tag hero-loc-tag">📍 {activeTrip.city}</span>
                </div>
                
                <h2 className="hero-trip-title">{activeTrip.title}</h2>
                <p className="hero-trip-desc">
                  Your {activeTrip.days}-day masterplan is synchronized and ready for takeoff. Finalize your bookings or invite friends to join the odyssey.
                </p>
                
                <div className="hero-action-row">
                  <button className="btn btn-primary btn-pill" onClick={() => navigate(`/trips/${activeTrip._id}`)}>
                     Continue Planning
                  </button>
                  <div className="hero-members-info">
                     <Users size={16} /> {activeTrip.members?.length || 1} members joined
                  </div>
                </div>

                {/* Carousel Indicators */}
                {allTrips.length > 1 && (
                  <div className="carousel-indicators">
                    {allTrips.map((_, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setCurrentTripIndex(idx)}
                        className={`indicator-dot ${idx === currentTripIndex ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                )}
             </div>
           ) : (
             <div style={{ textAlign: 'center', padding: '60px 0' }}>
               <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🌍</div>
               <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>World Awaits</h2>
               <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Start your first AI-powered odyssey in seconds.</p>
               <button className="btn btn-premium-gold btn-lg btn-pill" onClick={() => navigate('/planner')}>
                 Initialize AI Planner
               </button>
             </div>
           )}
        </div>

        {/* ── Side Widget: Quick Stats ── */}
        <div className="bento-item bento-item-medium luxury-glass">
           <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px' }}>Global Footprint</h3>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="stat-card-mini">
                 <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats?.totalTrips || 0}</div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Trips</div>
              </div>
              <div className="stat-card-mini">
                 <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats?.totalCities || 0}</div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cities</div>
              </div>
              <div className="stat-card-mini">
                 <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats?.totalDays || 0}</div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Days Away</div>
              </div>
              <div className="stat-card-mini">
                 <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{stats?.unlockedBadges || 0}</div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Badges</div>
              </div>
           </div>
           <Link to="/stats" className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '32px', border: '1px solid var(--border-subtle)' }}>
              Full Analytics →
           </Link>
        </div>

        {/* ── Feature Hub: Discovery ── */}
        <div className="bento-item bento-item-full">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Explore Your Toolkit</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Everything you need for the perfect journey.</p>
              </div>
           </div>
           <div className="feature-hub-grid" style={{ marginTop: 0 }}>
              {[
                { title: 'AI Planner', desc: 'Personalized itineraries in seconds.', icon: '✨', path: '/planner' },
                { title: 'Social Games', desc: 'Travel trivia with your tribes.', icon: '🎮', path: '/games' },
                { title: 'Map Explorer', desc: 'Real-time gem discovery.', icon: '📍', path: '/map' },
                { title: 'Travel Tribes', desc: 'Connect with explorers.', icon: '🏘️', path: '/communities' },
                { title: 'Bucket List', desc: 'Track dream escapes.', icon: '🗺️', path: '/bucket-list' }
              ].map((f, i) => (
                <div key={i} className="feature-hub-card-minimal" onClick={() => navigate(f.path)}>
                   <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{f.icon}</div>
                   <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>{f.title}</h4>
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
              ))}
           </div>
        </div>

        {/* ── Curated Spotlight ── */}
        <div className="bento-item bento-item-large">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Elite Curated Journeys</h3>
              <Link to="/discover" className="btn btn-link btn-sm">Explore All</Link>
           </div>
           <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }} className="custom-scrollbar">
              {curatedPlans.slice(0, 4).map(plan => (
                <div key={plan.id} className="curated-mini-card" onClick={() => navigate(`/discover/${plan.id}`)}>
                   <img src={plan.image} alt={plan.city} />
                   <div className="curated-mini-meta">
                      <h5>{plan.city}</h5>
                      <span>{plan.days} Days • Elite</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* ── Tribes Pulse ── */}
        <div className="bento-item bento-item-medium">
           <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Your Pulse</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {communities.slice(0, 3).map(c => (
                <div key={c._id} className="tribe-pulse-item">
                   <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(28,100,242,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
                   <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.members?.length} active members</div>
                   </div>
                </div>
              ))}
           </div>
           <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '24px' }} onClick={() => navigate('/communities')}>
              Manage Tribes
           </button>
        </div>
      </div>
      )}
    </div>
  );
}
