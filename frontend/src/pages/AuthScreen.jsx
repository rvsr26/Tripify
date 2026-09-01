import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../api';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthScreen({ onAuth }) {
  const [isLogin, setIsLogin]   = useState(true);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = isLogin
        ? await authService.login(email, password)
        : await authService.register(name, email, password);
      onAuth(data.user, data.accessToken);
    } catch (err) {
      let msg = err.response?.data?.error || err.message || 'Authentication failed';
      if (typeof msg === 'object') msg = msg.message || JSON.stringify(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    const demoEmail = 'demo@tripify.app';
    const demoPass  = 'TripifyDemo2026!';
    try {
      try {
        const data = await authService.login(demoEmail, demoPass);
        onAuth(data.user, data.accessToken);
      } catch {
        const data = await authService.register('Demo Explorer', demoEmail, demoPass);
        onAuth(data.user, data.accessToken);
      }
    } catch (err) {
      setError('Demo login error: ' + (err.message || 'Could not auto-login'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.googleLogin(response.credential);
      onAuth(data.user, data.accessToken);
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quotes = [
    { text: "Traveling – it leaves you speechless, then turns you into a storyteller.", author: "Ibn Battuta" },
    { text: "The world is a book and those who do not travel read only one page.", author: "St. Augustine" }
  ];

  return (
    <div className="auth-page">
      <div className="ultra-mesh-bg" />

      {/* ── Left Panel: Cinematic Visuals ──────────────────────────────── */}
      <div className="auth-side-panel">
        <img src="/hero_showcase.png" alt="Travel Showcase" className="auth-side-bg" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&q=80&w=1200"; }} />
        <div className="auth-side-overlay" />
        
        <div className="auth-side-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ← Back to Tripify
            </Link>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>✨ Tripify</div>
          </div>

          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '99px', background: 'rgba(245,158,11,0.2)',
              color: '#fbbf24', fontSize: '0.75rem', fontWeight: 800, marginBottom: '14px',
              border: '1px solid rgba(245,158,11,0.4)',
            }}>
              MCP NATIVE AUTONOMOUS AI OS
            </div>
            <h1 className="auth-quote" style={{ fontSize: '2rem', fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: '12px' }}>
              "{quotes[isLogin ? 0 : 1].text}"
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 600 }}>
              — {quotes[isLogin ? 0 : 1].author}
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>⚡ 23 MCP Tools</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>🧠 Memory Graph</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>🏃 Digital Twin</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Auth Form ────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-glass-card">
          {/* Tab Group */}
          <div className="auth-tab-group">
            <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError(''); }}>
              Sign In
            </button>
            <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError(''); }}>
              Create Account
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', marginBottom: '6px' }}>
              {isLogin ? 'Welcome Back' : 'Start Your Journey'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              {isLogin ? 'Enter your credentials to access your trips.' : 'Create an account to start AI planning.'}
            </p>
          </div>

          {error && (
            <div className="auth-error-box">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-input-wrapper">
                <label>Full Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. Vishnu"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="auth-input-wrapper">
              <label>Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="hello@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-wrapper">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Password</label>
              </div>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-btn-submit"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <button type="button" className="auth-demo-btn" onClick={handleDemoLogin} disabled={loading}>
            ⚡ Demo Quick-Login (1-Click Instant Access)
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '350px', overflow: 'hidden', borderRadius: '14px' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed')}
                theme="filled_black"
                shape="pill"
                text={isLogin ? 'signin_with' : 'signup_with'}
                width="350"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
