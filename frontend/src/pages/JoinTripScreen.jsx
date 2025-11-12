import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { plannerService } from '../api';

export default function JoinTripScreen() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [tripInfo, setTripInfo] = useState(null);

  useEffect(() => {
    const tokenStored = localStorage.getItem('accessToken');
    if (!tokenStored) {
      setError('Please log in first to join this trip.');
      setLoading(false);
      return;
    }
    handleJoin();
  }, [token]);

  const handleJoin = async () => {
    try {
      const res = await plannerService.joinByToken(token);
      setTripInfo(res.trip);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired invite link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-flow">
      <div className="glass-panel auth-card animate-fade-in" style={{ textAlign: 'center' }}>
        <div className="logo" style={{ marginBottom: '28px', padding: 0, display: 'inline-block' }}>Tripify</div>

        {loading ? (
          <div style={{ padding: '40px 0' }}>
            <div className="loading-spinner" />
            <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Joining trip...</p>
          </div>
        ) : error ? (
          <>
            <div className="empty-state-icon" style={{ animation: 'none' }}>⚠️</div>
            <h2 style={{ color: 'var(--brand-rose)', marginBottom: '10px' }}>Oops!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>{error}</p>
            <Link to="/auth" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Go to Login</Link>
          </>
        ) : success ? (
          <>
            <div className="empty-state-icon" style={{ marginBottom: '16px' }}>🎉</div>
            <h2 style={{ marginBottom: '8px' }}>You're in!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
              You've joined <strong>{tripInfo?.title}</strong> in {tripInfo?.city}.
            </p>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={() => navigate(`/trips/${tripInfo?._id}`)}
            >
              Open Trip
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
