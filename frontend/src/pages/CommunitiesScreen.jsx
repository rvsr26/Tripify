import React, { useState, useEffect } from 'react';
import { communityService } from '../api';

const CATEGORIES = ['All', 'Travel', 'Movies', 'Sports', 'Music', 'Food', 'Tech', 'Art', 'Nature', 'Photography', 'Gaming', 'General'];
const ICONS = ['🌍', '🎬', '⚽', '🎵', '🍕', '💻', '🎨', '🌿', '📷', '🎮', '✈️', '🏔️', '🎭', '📚', '🏄', '🧘', '⛷️', '🏕️'];

function CreateModal({ onClose, onCreated }) {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]       = useState('General');
  const [icon, setIcon]               = useState('🌍');
  const [tags, setTags]               = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required');
    setLoading(true);
    try {
      const result = await communityService.create({
        name: name.trim(),
        description: description.trim(),
        category,
        icon,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      onCreated(result.community);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-card animate-fade-in" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.3rem' }}>Create Community</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {error && <div className="auth-error"><span>⚠️</span>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Icon picker */}
          <div className="input-group">
            <label>Icon</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {ICONS.map(ic => (
                <button
                  key={ic} type="button"
                  className={`icon-pick ${icon === ic ? 'active' : ''}`}
                  onClick={() => setIcon(ic)}
                >{ic}</button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Community Name *</label>
            <input className="input-field" placeholder="e.g. Solo Backpackers" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea className="input-field" rows={3} placeholder="What's this community about?" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Category</label>
            <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span></label>
            <input className="input-field" placeholder="e.g. budget, asia, hiking" value={tags} onChange={e => setTags(e.target.value)} />
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? <><span className="loading-spinner-sm" /> Creating...</> : '🚀 Create Community'}
          </button>
        </form>
      </div>
    </div>
  );
}

function CommunityDetail({ community: initial, userId, onBack, onUpdate }) {
  const [community, setCommunity] = useState(initial);
  const [postText, setPostText]   = useState('');
  const [posting, setPosting]     = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    communityService.get(initial._id)
      .then(res => setCommunity(res.community))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [initial._id]);

  const isMember = community?.members?.some(m => (m.userId?._id || m.userId) === userId);
  const isCreator = (community?.creator?._id || community?.creator) === userId;

  const handleJoin = async () => {
    try {
      await communityService.join(community._id);
      const res = await communityService.get(community._id);
      setCommunity(res.community);
      onUpdate();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleLeave = async () => {
    if (!window.confirm('Leave this community?')) return;
    try {
      await communityService.leave(community._id);
      onBack();
      onUpdate();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    setPosting(true);
    try {
      const res = await communityService.createPost(community._id, postText.trim());
      setCommunity(prev => ({ ...prev, posts: res.posts }));
      setPostText('');
    } catch (err) { alert('Failed to post'); }
    setPosting(false);
  };

  const handleLike = async (postId) => {
    try {
      await communityService.likePost(community._id, postId);
      const res = await communityService.get(community._id);
      setCommunity(res.community);
    } catch { console.error('Like failed'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div className="loading-spinner" />
    </div>
  );

  const posts = [...(community.posts || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: '20px' }}>
        ← Back to Communities
      </button>

      {/* Hero */}
      <div className="glass-panel community-hero" style={{ '--cover-color': community.coverColor || '#6366f1' }}>
        <div className="community-hero-bg" />
        <div className="community-hero-content">
          <div className="community-hero-icon">{community.icon}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.6rem', position: 'relative', zIndex: 1 }}>{community.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', position: 'relative', zIndex: 1 }}>
              {community.description || 'No description'}
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.82rem', color: 'var(--text-muted)', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
              <span>👥 {community.members?.length || 0} members</span>
              <span>📝 {community.posts?.length || 0} posts</span>
              <span className="tag" style={{ textTransform: 'capitalize' }}>{community.category}</span>
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '8px', flexShrink: 0 }}>
            {!isMember ? (
              <button className="btn btn-primary" onClick={handleJoin}>Join Community</button>
            ) : isCreator ? (
              <span className="badge badge-admin" style={{ padding: '8px 16px' }}>Creator</span>
            ) : (
              <button className="btn btn-outline" onClick={handleLeave}>Leave</button>
            )}
          </div>
        </div>

        {/* Tags */}
        {community.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '16px', position: 'relative', zIndex: 1 }}>
            {community.tags.map((t, i) => (
              <span key={i} className="tag">#{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Members strip */}
      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '14px' }}>Members ({community.members?.length})</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(community.members || []).slice(0, 12).map((m, i) => (
            <div key={i} className="avatar-initials" style={{ width: '36px', height: '36px', fontSize: '0.82rem', borderRadius: '50%' }} title={m.userId?.name}>
              {m.userId?.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {community.members?.length > 12 && (
            <div className="avatar-initials" style={{ width: '36px', height: '36px', fontSize: '0.72rem', borderRadius: '50%', background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
              +{community.members.length - 12}
            </div>
          )}
        </div>
      </div>

      {/* Post composer */}
      {isMember && (
        <form onSubmit={handlePost} className="glass-panel" style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div className="avatar-initials" style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, fontSize: '0.82rem' }}>You</div>
          <div style={{ flex: 1 }}>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Share something with the community..."
              value={postText}
              onChange={e => setPostText(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <button className="btn btn-primary btn-sm" disabled={posting || !postText.trim()}>
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}

      {/* Posts feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {posts.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
            <h3>No posts yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {isMember ? 'Be the first to share something!' : 'Join this community to start posting!'}
            </p>
          </div>
        ) : posts.map((post, i) => (
          <div key={post._id} className="glass-panel community-post animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div className="avatar-initials" style={{ width: '36px', height: '36px', borderRadius: '50%', fontSize: '0.82rem', flexShrink: 0 }}>
                {post.userId?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{post.userId?.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '10px', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                  onClick={() => handleLike(post._id)}
                >
                  {post.likes?.includes(userId) ? '❤️' : '🤍'} {post.likes?.length || 0}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommunitiesScreen({ currentUserId }) {
  const [activeTab, setActiveTab]       = useState('Discover');
  const [communities, setCommunities]   = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [category, setCategory]         = useState('All');
  const [showCreate, setShowCreate]     = useState(false);
  const [selectedCommunity, setSelected] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        communityService.list(),
        communityService.mine(),
      ]);
      setCommunities(allRes.communities || []);
      setMyCommunities(myRes.communities || []);
    } catch (err) { console.error('Failed to load communities'); }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    communityService.list(search, category)
      .then(res => setCommunities(res.communities || []))
      .catch(console.error);
  };

  useEffect(() => { if (!loading) handleSearch(); }, [category]);

  const handleCreated = (community) => {
    setShowCreate(false);
    setMyCommunities(prev => [community, ...prev]);
    setSelected(community);
  };

  if (selectedCommunity) {
    return (
      <div className="container">
        <CommunityDetail
          community={selectedCommunity}
          userId={currentUserId}
          onBack={() => { setSelected(null); loadAll(); }}
          onUpdate={loadAll}
        />
      </div>
    );
  }

  const isMember = (community) => myCommunities.some(c => c._id === community._id);

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '12vh' }}>
      <div className="loading-spinner" />
    </div>
  );

  return (
    <div className="container animate-fade-in">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1><span className="gradient-text">Communities</span></h1>
          <p>Find your tribe — join groups of like-minded travelers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Create Community
        </button>
      </div>

      {/* Tabs */}
      <div className="page-tabs" style={{ marginBottom: '24px' }}>
        {['Discover', 'My Communities'].map(tab => (
          <div key={tab} className={`page-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
            {tab === 'My Communities' && myCommunities.length > 0 && (
              <span className="nav-badge" style={{ marginLeft: '8px' }}>{myCommunities.length}</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Discover Tab ──────────────── */}
      {activeTab === 'Discover' && (
        <div className="animate-fade-in">
          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px', maxWidth: '560px' }}>
            <input
              className="input-field"
              placeholder="Search communities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary">Search</button>
          </form>

          {/* Category pills */}
          <div className="category-pills">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`category-pill ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          {communities.length === 0 ? (
            <div className="glass-panel empty-state">
              <div className="empty-state-icon">🌍</div>
              <h2>No communities found</h2>
              <p>Be the first to create one!</p>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Community</button>
            </div>
          ) : (
            <div className="grid-3">
              {communities.map((c, i) => (
                <div key={c._id} className="glass-panel community-card animate-fade-in" style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer' }} onClick={() => setSelected(c)}>
                  {/* Cover */}
                  <div className="community-card-cover" style={{ background: `linear-gradient(135deg, ${c.coverColor}, ${c.coverColor}88)` }}>
                    <span className="community-card-icon">{c.icon}</span>
                  </div>

                  {/* Body */}
                  <div className="community-card-body">
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '4px', letterSpacing: '-0.01em' }}>{c.name}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                      {c.description || 'A community for like-minded travelers'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span>👥 {c.memberCount || c.members?.length || 0}</span>
                        <span className="tag" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>{c.category}</span>
                      </div>
                      {isMember(c) ? (
                        <span className="badge badge-member" style={{ fontSize: '0.68rem' }}>Joined</span>
                      ) : (
                        <button className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '5px 14px' }} onClick={(e) => {
                          e.stopPropagation();
                          communityService.join(c._id).then(() => loadAll()).catch(err => alert(err.response?.data?.error || 'Failed'));
                        }}>Join</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── My Communities Tab ─────────── */}
      {activeTab === 'My Communities' && (
        <div className="animate-fade-in">
          {myCommunities.length === 0 ? (
            <div className="glass-panel empty-state">
              <div className="empty-state-icon">🏘️</div>
              <h2>You haven't joined any communities</h2>
              <p>Discover and join communities, or create your own!</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('Discover')}>Explore Communities</button>
            </div>
          ) : (
            <div className="grid-3">
              {myCommunities.map((c, i) => (
                <div key={c._id} className="glass-panel community-card animate-fade-in" style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer' }} onClick={() => setSelected(c)}>
                  <div className="community-card-cover" style={{ background: `linear-gradient(135deg, ${c.coverColor}, ${c.coverColor}88)` }}>
                    <span className="community-card-icon">{c.icon}</span>
                  </div>
                  <div className="community-card-body">
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>{c.name}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.description || 'A community for like-minded travelers'}
                    </p>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>👥 {c.memberCount || c.members?.length || 0}</span>
                      <span>📝 {c.posts?.length || 0} posts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
    </div>
  );
}

// Build verification patch on 11/28/2025, 2:32:00 PM
