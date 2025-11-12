import React, { useState, useEffect } from 'react';
import { friendsService, userService, featuresService } from '../api';
import { Link } from 'react-router-dom';
import CommunitiesScreen from './CommunitiesScreen';
import GamesScreen from './GamesScreen';

export default function FriendsScreen({ onPendingUpdate }) {
  const [activeTab, setActiveTab] = useState('Friends');
  const [friends, setFriends]     = useState([]);
  const [incoming, setIncoming]   = useState([]);
  const [outgoing, setOutgoing]   = useState([]);
  const [search, setSearch]       = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [f, inc, out] = await Promise.all([
        friendsService.getFriends(),
        friendsService.getIncoming(),
        friendsService.getOutgoing()
      ]);
      setFriends(f.friends || []);
      setIncoming(inc.requests || []);
      setOutgoing(out.requests || []);
      onPendingUpdate(inc.requests?.length || 0);
    } catch { console.error('Failed to load friends'); }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!search.trim()) return setSearchResults([]);
    try {
      const res = await userService.search(search);
      setSearchResults(res.users || []);
    } catch { console.error('Search failed'); }
  };

  const sendRequest = async (username) => {
    try {
      await friendsService.sendRequest(username);
      alert('Request sent!');
      loadData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to send request'); }
  };

  const acceptRequest = async (id) => {
    try { await friendsService.acceptRequest(id); loadData(); } catch { alert('Failed'); }
  };
  const declineRequest = async (id) => {
    try { await friendsService.declineRequest(id); loadData(); } catch { alert('Failed'); }
  };
  const removeFriend = async (friendshipId) => {
    if (!window.confirm('Remove friend?')) return;
    try { await friendsService.removeFriend(friendshipId); loadData(); } catch { alert('Failed'); }
  };

  const [matches, setMatches] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'Matchmaker' && matches.length === 0) {
      setMatchLoading(true);
      featuresService.getMatches()
        .then(res => setMatches(res.candidates || []))
        .catch(console.error)
        .finally(() => setMatchLoading(false));
    }
  }, [activeTab]);

  const handleSwipe = (userId, action) => {
    if (action === 'connect') {
      sendRequest(userId); // Use username or ID? sendRequest wants username
    }
    setMatches(prev => prev.slice(1));
  };

  if (loading && friends.length === 0) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '12vh' }}>
      <div className="loading-spinner" />
    </div>
  );

  const tabs = [
    { label: 'Friends Hub', count: null },
    { label: 'Requests', count: incoming.length > 0 ? incoming.length : null },
    { label: 'Find People', count: null },
    { label: 'Matchmaker', count: null },
    { label: 'Travel Tribes', count: null, path: '/communities' },
    { label: 'Social Games', count: null, path: '/games' },
  ];

  return (
    <div className="container animate-fade-in">
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <h1 className="vibrant-gradient-text">Social Hub</h1>
        <p>Connect with your community and discover your next travel buddy.</p>
      </div>

      {/* ── Pillar Sub-Navigation ── */}
      <div className="page-tabs glass-panel" style={{ marginBottom: '40px' }}>
        {tabs.map(tab => (
          <div
            key={tab.label}
            className={`page-tab ${activeTab === tab.label || (tab.label === 'Friends Hub' && activeTab === 'Friends') ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.label === 'Friends Hub' ? 'Friends' : tab.label);
            }}
          >
            {tab.label}
            {tab.count && (
              <span className="nav-badge" style={{ marginLeft: '8px', verticalAlign: 'middle' }}>
                {tab.count}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Friends Tab ──────────────────── */}
      {activeTab === 'Friends' && (
        <div className="animate-fade-in">
          {friends.length === 0 ? (
            <div className="glass-panel empty-state">
              <div className="empty-state-icon">👥</div>
              <h2>No friends yet</h2>
              <p>Find travelers and add them to build your community!</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('Find People')}>Find People</button>
            </div>
          ) : (
            <div className="grid-3">
              {friends.map((f, i) => (
                <div key={f.id} className="glass-panel animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '16px', animationDelay: `${i * 0.05}s` }}>
                  <div className="avatar-initials" style={{ width: '52px', height: '52px', fontSize: '1.1rem', borderRadius: '50%' }}>
                    {f.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{f.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>@{f.username}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Link to={`/u/${f.id}`} className="btn btn-outline btn-sm">Profile</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => removeFriend(f.friendshipId)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Requests Tab ─────────────────── */}
      {activeTab === 'Requests' && (
        <div className="animate-fade-in" style={{ maxWidth: '640px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Pending Requests ({incoming.length})</h3>
          {incoming.length === 0 && (
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>No incoming requests.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incoming.map(r => (
              <div key={r._id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="avatar-initials" style={{ borderRadius: '50%' }}>{r.requester?.name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.requester?.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>@{r.requester?.username}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => acceptRequest(r._id)}>Accept</button>
                  <button className="btn btn-outline btn-sm" onClick={() => declineRequest(r._id)}>Decline</button>
                </div>
              </div>
            ))}
          </div>

          {outgoing.length > 0 && (
            <>
              <h3 style={{ margin: '36px 0 20px', fontSize: '1.1rem' }}>Sent Requests ({outgoing.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {outgoing.map(r => (
                  <div key={r._id} className="card-flat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', opacity: 0.75 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>@{r.recipient?.username}</span>
                    <span className="badge badge-member">Pending</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Find People Tab ──────────────── */}
      {activeTab === 'Find People' && (
        <div className="animate-fade-in">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '36px', maxWidth: '560px' }}>
            <input
              className="input-field"
              placeholder="Search by username..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary">Search</button>
          </form>

          <div className="grid-3">
            {searchResults.map((user, i) => (
              <div key={user._id} className="glass-panel animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '16px', animationDelay: `${i * 0.05}s` }}>
                <div className="avatar-initials" style={{ borderRadius: '50%' }}>{user.name?.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{user.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>@{user.username}</div>
                </div>
                {user.friendship ? (
                  <span className="badge badge-member">{user.friendship.status}</span>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => sendRequest(user.username)}>Add</button>
                )}
              </div>
            ))}
          </div>
          {search && searchResults.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>No users found matching "{search}"</p>
          )}
        </div>
      )}

      {/* ── Matchmaker Tab ───────────────── */}
      {activeTab === 'Matchmaker' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Travel Buddy Matchmaker</h2>
            <p style={{ color: 'var(--text-muted)' }}>Find co-travelers with similar interests, budget, and dates.</p>
          </div>

          {matchLoading ? (
            <div className="loading-spinner" />
          ) : matches.length === 0 ? (
            <div className="glass-panel empty-state" style={{ maxWidth: '400px', width: '100%' }}>
              <div className="empty-state-icon">😢</div>
              <h2>No more matches!</h2>
              <p>You've seen everyone. Check back later for new travelers.</p>
            </div>
          ) : (
            <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', position: 'relative', overflow: 'hidden', padding: 0, border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-document)' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--gradient-brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', marginBottom: '24px', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
                  {matches[0].name?.charAt(0).toUpperCase()}
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{matches[0].name}</h3>
                <div style={{ color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '16px' }}>@{matches[0].username}</div>
                
                <div style={{ width: '100%', background: 'var(--bg-elevated)', padding: '16px', borderRadius: 'var(--border-radius-md)', marginBottom: '24px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Travel Style</span>
                    <span style={{ fontWeight: 600 }}>{matches[0].personality || 'Adventurer'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Top Destinations</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {(matches[0].topDestinations || ['Japan', 'Italy', 'Bali']).map((d, i) => (
                        <span key={i} className="tag" style={{ background: 'var(--bg-input)' }}>{d}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', width: '100%', justifyContent: 'center' }}>
                  <button 
                    onClick={() => handleSwipe(matches[0].username, 'pass')}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-input)', border: '2px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '1.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                  >
                    ✕
                  </button>
                  <button 
                    onClick={() => handleSwipe(matches[0].username, 'connect')}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-input)', border: '2px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: '1.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.borderColor = '#10b981'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; }}
                  >
                    💖
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tribes Tab ───────────────────── */}
      {activeTab === 'Travel Tribes' && (
        <CommunitiesScreen />
      )}

      {/* ── Games Tab ────────────────────── */}
      {activeTab === 'Social Games' && (
        <GamesScreen />
      )}
    </div>
  );
}
