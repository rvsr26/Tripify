import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userService, plannerService } from '../api';
import EliteMemberCard from '../components/EliteMemberCard';
import { Globe, Leaf, Landmark } from 'lucide-react';

export default function ProfileScreen({ currentUser }) {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await userService.getProfile(id);
      setProfile(data.user);
    } catch { console.error('Failed to load profile'); }
    setLoading(false);
  };

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '12vh' }}>
      <div className="loading-spinner" />
    </div>
  );

  if (!profile) return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '12vh' }}>
      <h1>User not found</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>This profile doesn't exist or has been removed.</p>
    </div>
  );

  const isSelf = currentUser?.id === id;

  return (
    <div className="container animate-fade-in">
      {/* Profile Hero */}
      <div className="glass-panel profile-hero" style={{ marginBottom: '36px' }}>
        {/* Gradient banner */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '140px',
          background: 'var(--gradient-brand-subtle)',
          pointerEvents: 'none'
        }} />

        {/* Avatar */}
        <div className="avatar-initials profile-avatar" style={{ borderRadius: '50%' }}>
          {profile.name?.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <h1 style={{ fontSize: '1.6rem', position: 'relative', zIndex: 1 }}>{profile.name}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
          @{profile.username}
        </p>

        {profile.bio && (
          <p style={{ maxWidth: '500px', margin: '0 auto 20px', fontSize: '1rem', color: 'var(--text-secondary)', position: 'relative', zIndex: 1, lineHeight: 1.6 }}>
            {profile.bio}
          </p>
        )}

        {/* Elite Membership Card */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
           <EliteMemberCard user={profile} />
        </div>

        {/* Stats */}
        <div className="profile-stats" style={{ position: 'relative', zIndex: 1, gap: '60px' }}>
          <div className="profile-stat">
            <div className="profile-stat-value">{profile.tripCount || 0}</div>
            <div className="profile-stat-label">Trips</div>
          </div>
          <div className="profile-stat">
             <div className="profile-stat-value"><Landmark size={20} color="var(--brand-gold)" /></div>
             <div className="profile-stat-value">{profile.travelROI?.culturalDepth || 0}</div>
             <div className="profile-stat-label">Culture Score</div>
          </div>
          <div className="profile-stat">
             <div className="profile-stat-value"><Leaf size={20} color="var(--brand-emerald)" /></div>
             <div className="profile-stat-value">{profile.travelROI?.sustainabilityScore || 0}</div>
             <div className="profile-stat-label">Eco-Score</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{profile.friendCount || 0}</div>
            <div className="profile-stat-label">Friends</div>
          </div>
        </div>

        {isSelf && (
          <div style={{ marginTop: '28px', position: 'relative', zIndex: 1 }}>
            <button className="btn btn-outline">Edit Profile</button>
          </div>
        )}
      </div>

      {/* Adventures Section */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>Adventures</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Recent trips by @{profile.username}.
        </p>
      </div>

      <div className="glass-panel empty-state" style={{ borderStyle: 'dashed', border: '2px dashed var(--border-default)' }}>
        <div className="empty-state-icon">✈️</div>
        <h2>Coming soon</h2>
        <p>@{profile.username}'s shared itineraries will appear here.</p>
      </div>
    </div>
  );
}
