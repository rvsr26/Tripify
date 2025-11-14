import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { authService, friendsService } from './api';

// Pages
import AuthScreen from './pages/AuthScreen';
import PlannerScreen from './pages/PlannerScreen';
import MyTripsScreen from './pages/MyTripsScreen';
import TripDetailScreen from './pages/TripDetailScreen';
import FeedScreen from './pages/FeedScreen';
import FriendsScreen from './pages/FriendsScreen';
import JoinTripScreen from './pages/JoinTripScreen';
import ProfileScreen from './pages/ProfileScreen';
import MapExplorerScreen from './pages/MapExplorerScreen';
import CommunitiesScreen from './pages/CommunitiesScreen';
import GamesScreen from './pages/GamesScreen';
import TravelStatsScreen from './pages/TravelStatsScreen';
import BucketListScreen from './pages/BucketListScreen';
import DealsScreen from './pages/DealsScreen';
import ExperiencesScreen from './pages/ExperiencesScreen';
import LandingPage from './pages/LandingPage';
import HomeScreen from './pages/HomeScreen';
import FAQScreen from './pages/FAQScreen';
import ContactScreen from './pages/ContactScreen';
import PrivacyPolicyScreen from './pages/PrivacyPolicyScreen';
import TermsOfServiceScreen from './pages/TermsOfServiceScreen';
import CuratedPlansScreen from './pages/CuratedPlansScreen';
import CuratedTripDetail from './pages/CuratedTripDetail';
import CollaborativeAtlas from './pages/CollaborativeAtlas';
import TravelChatbot from './components/TravelChatbot';

// ── Theme Hook ──
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('tripify-theme');
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tripify-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggleTheme };
}

// ── Sidebar ──
function Sidebar({ user, onLogout, pendingCount, showLaunchpad, setShowLaunchpad }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCollapsed = windowWidth > 768 && windowWidth <= 1024;

  const navPillars = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/planner', label: 'AI Planner', icon: '✨' },
    { path: '/trips', label: 'My Adventures', icon: '✈️', sub: ['Bucket List'] },
    { path: '/feed', label: 'Explorer', icon: '🌍', sub: ['Curated'] },
    { path: '/friends', label: 'Social Hub', icon: '👥', badge: pendingCount > 0 ? pendingCount : null },
  ];

  return (
    <>
      <button className="mobile-only mobile-menu-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && <div className="sidebar-overlay mobile-only" onClick={() => setIsOpen(false)} />}

      <div className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="logo">Tripify</div>

        <nav className="nav-links custom-scrollbar">
          {navPillars.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item pillar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="pillar-text">
                <span className="pillar-label">{item.label}</span>
                {item.sub && <span className="pillar-subtext">{item.sub.join(' • ')}</span>}
              </div>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </Link>
          ))}

          <div 
             className={`nav-item pillar-item toolkit-trigger ${showLaunchpad ? 'active' : ''}`}
             onClick={() => setShowLaunchpad(!showLaunchpad)}
             style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', cursor: 'pointer' }}
          >
             <span className="nav-icon">🎒</span>
             <span className="pillar-label">Toolkit Hub</span>
             <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.5 }}>{showLaunchpad ? '✕' : '→'}</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

// ── App Inner Components ──
function AppInner() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toolkitItems = [
    { path: '/stats', label: 'Dashboard', icon: '📊' },
    { path: '/communities', label: 'Tribes', icon: '🏘️' },
    { path: '/map', label: 'Live Map', icon: '📍' },
    { path: '/games', label: 'Social Games', icon: '🎮' },
    { path: '/experiences', label: 'Local Experts', icon: '👤' },
    { path: '/deals', label: 'Member Deals', icon: '🎁' },
    { path: '/faq', label: 'Support center', icon: '❓' },
    { path: '/contact', label: 'Contact', icon: '📧' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authService.me()
        .then(data => {
          setUser(data.user);
          friendsService.getPendingCount().then(res => setPendingCount(res.count || 0)).catch(() => {});
        })
        .catch(() => localStorage.removeItem('accessToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuth = (u, token) => {
    localStorage.setItem('accessToken', token);
    setUser(u);
    friendsService.getPendingCount().then(res => setPendingCount(res.count || 0)).catch(() => {});
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  if (loading) return (
    <div className="auth-flow">
      <div className="loading-spinner" />
    </div>
  );

  return (
    <>
      {user ? (
        <div className="app-shell animate-fade-in shadow-modern" key="app-shell-v1">
          <Sidebar 
            user={user} 
            onLogout={handleLogout} 
            pendingCount={pendingCount}
            showLaunchpad={showLaunchpad}
            setShowLaunchpad={setShowLaunchpad}
          />
          
          <main className="main-content custom-scrollbar">
            <header className="app-header">
               <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                  {location.pathname !== '/' && (
                    <button className="back-btn-luxury" onClick={() => navigate(-1)} title="Go Back">
                       <span>←</span>
                    </button>
                  )}
                  <div className="search-bar-luxury">
                     <span className="search-icon">🔍</span>
                     <input type="text" placeholder="Jump to AI Oracle, Maps..." />
                     <span className="search-shortcut">⌘K</span>
                  </div>
               </div>
               <div className="header-actions">
                  <button className="header-btn" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'dark' ? '☀️' : '🌙'}
                  </button>
                  <div className="header-divider" />
                  <Link to={`/u/${user.id}`} className="avatar-initials-sm" title="My Profile">
                     {user.name?.charAt(0).toUpperCase()}
                  </Link>
               </div>
            </header>

            {showLaunchpad && (
              <div className="launchpad-overlay animate-fade-in" onClick={() => setShowLaunchpad(false)}>
                <div className="launchpad-content glass-panel" onClick={e => e.stopPropagation()}>
                    <div className="launchpad-header">
                       <h3>Toolkit Hub</h3>
                       <button className="btn btn-sm btn-outline" onClick={() => setShowLaunchpad(false)}>✕ Close</button>
                    </div>
                    <div className="launchpad-grid">
                       {toolkitItems.map(item => (
                         <Link key={item.path} to={item.path} className="launch-item" onClick={() => setShowLaunchpad(false)}>
                            <span className="launch-icon">{item.icon}</span>
                            <span className="launch-label">{item.label}</span>
                         </Link>
                       ))}
                    </div>
                </div>
              </div>
            )}

            <Routes>
              <Route path="/" element={<HomeScreen user={user} />} />
              <Route path="/planner" element={<PlannerScreen user={user} />} />
              <Route path="/games" element={<GamesScreen />} />
              <Route path="/stats" element={<TravelStatsScreen />} />
              <Route path="/bucket-list" element={<BucketListScreen />} />
              <Route path="/trips" element={<MyTripsScreen />} />
              <Route path="/trips/:id" element={<TripDetailScreen currentUserId={user.id} />} />
              <Route path="/atlas/:id" element={<CollaborativeAtlas user={user} />} />
              <Route path="/map" element={<MapExplorerScreen />} />
              <Route path="/communities" element={<CommunitiesScreen currentUserId={user.id} />} />
              <Route path="/feed" element={<FeedScreen />} />
              <Route path="/experiences" element={<ExperiencesScreen />} />
              <Route path="/deals" element={<DealsScreen />} />
              <Route path="/discover" element={<CuratedPlansScreen />} />
              <Route path="/discover/:id" element={<CuratedTripDetail />} />
              <Route path="/friends" element={<FriendsScreen onPendingUpdate={setPendingCount} />} />
              <Route path="/u/:id" element={<ProfileScreen currentUser={user} />} />
              <Route path="/faq" element={<FAQScreen />} />
              <Route path="/contact" element={<ContactScreen />} />
              <Route path="/privacy" element={<PrivacyPolicyScreen />} />
              <Route path="/terms" element={<TermsOfServiceScreen />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            <TravelChatbot user={user} />
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/auth" element={<AuthScreen onAuth={handleAuth} theme={theme} />} />
          <Route path="/discover" element={<CuratedPlansScreen />} />
          <Route path="/discover/:id" element={<CuratedTripDetail />} />
          <Route path="/join/:token" element={<JoinTripScreen />} />
          <Route path="/faq" element={<FAQScreen />} />
          <Route path="/contact" element={<ContactScreen />} />
          <Route path="/privacy" element={<PrivacyPolicyScreen />} />
          <Route path="/terms" element={<TermsOfServiceScreen />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </>
  );
}

// ── Root Export ──
export default function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}
// Build Signature: 2026-04-02-Refinement-F
