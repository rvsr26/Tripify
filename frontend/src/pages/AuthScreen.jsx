import React, { useState } from 'react';
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
    { text: "The world is a book and those who do not travel read only one page.", author: "St. Augustine" },
    { text: "Adventure is worthwhile.", author: "Aesop" }
  ];

  return (
    <div className="auth-page">
      {/* ── Left Panel: Cinematic Visuals ──────────────────────────────── */}
      <div className="auth-side-panel">
        <img src="/images/auth_bg.png" alt="Travel Background" className="auth-side-bg" />
        <div className="hero-overlay" style={{ background: 'linear-gradient(to right, rgba(6,6,14,0.7) 0%, rgba(6,6,14,0.1) 100%)' }} />
        
        <div className="auth-side-content">
          <div className="auth-side-logo">Tripify</div>
          <div className="animate-slide-up">
            <h1 className="auth-quote">"{quotes[isLogin ? 0 : 1].text}"</h1>
            <p style={{ opacity: 0.6, fontSize: '1rem', letterSpacing: '1px' }}>
              — {quotes[isLogin ? 0 : 1].author}
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Auth Form ────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-glass-card animate-fade-in">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
              {isLogin ? 'Welcome back' : 'Start your journey'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {isLogin ? 'Enter your details to access your trips.' : 'Create an account to start planning.'}
            </p>
          </div>

          {error && (
            <div className="auth-error-box">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-input-wrapper">
                <label>Full Name</label>
                <input
                  className="input-field"
                  placeholder="Your Name"
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

            <div className="auth-input-wrapper" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                 <label style={{ marginBottom: 0 }}>Password</label>
                 {isLogin && <button type="button" className="auth-toggle-btn" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Forgot?</button>}
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
              className="btn btn-primary btn-lg"
              style={{ width: '100%', padding: '14px' }}
              disabled={loading}
            >
              {loading ? (
                <><span className="loading-spinner-sm" /> Loading...</>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
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

          <div className="auth-footer">
            {isLogin ? "New to Tripify? " : "Already have an account? "}
            <button className="auth-toggle-btn" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? 'Create one now' : 'Sign in here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
