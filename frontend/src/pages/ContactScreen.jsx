import React, { useState } from 'react';
import Footer from '../components/Footer';

export default function ContactScreen() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulate API call
    setTimeout(() => {
        setFormState({ name: '', email: '', message: '' });
        setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header className="section-header" style={{ textAlign: 'center', marginTop: '40px' }}>
          <h1 style={{ fontSize: '2.5rem' }}>Get in Touch</h1>
          <p>We're here to help you design the perfect journey. Send us a message and we'll get back to you within 24 hours.</p>
        </header>

        <div className="contact-grid">
           <div className="contact-info-card">
              <h3>Support Channels</h3>
              <p>Prefer a direct route? Connect with us here:</p>

              <div className="contact-method">
                 <div className="method-icon">📧</div>
                 <div className="method-details">
                    <h4>Email Support</h4>
                    <p>support@tripify.ai</p>
                 </div>
              </div>

              <div className="contact-method">
                 <div className="method-icon">💬</div>
                 <div className="method-details">
                    <h4>Live Chat</h4>
                    <p>Available 24/7 for Pro members</p>
                 </div>
              </div>

              <div className="contact-method">
                 <div className="method-icon">🏢</div>
                 <div className="method-details">
                    <h4>Headquarters</h4>
                    <p>123 AI Lane, San Francisco, CA</p>
                 </div>
              </div>
           </div>

           <div className="contact-form-container glass-panel" style={{ padding: '40px' }}>
              <form onSubmit={handleSubmit}>
                 <div className="input-group">
                    <label>Your Name</label>
                    <input 
                       type="text" 
                       className="input-field" 
                       placeholder="e.g. John Doe"
                       value={formState.name}
                       onChange={(e) => setFormState({...formState, name: e.target.value})}
                       required 
                    />
                 </div>
                 <div className="input-group">
                    <label>Email Address</label>
                    <input 
                       type="email" 
                       className="input-field" 
                       placeholder="john@example.com"
                       value={formState.email}
                       onChange={(e) => setFormState({...formState, email: e.target.value})}
                       required 
                    />
                 </div>
                 <div className="input-group">
                    <label>How can we help?</label>
                    <textarea 
                       className="input-field" 
                       placeholder="Tell us about your trip or your question..."
                       value={formState.message}
                       onChange={(e) => setFormState({...formState, message: e.target.value})}
                       required
                    />
                 </div>
                 <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitted}>
                    {submitted ? 'Sending...' : 'Send Message'}
                 </button>
              </form>
              {submitted && <div className="success-message" style={{ marginTop: '16px', color: 'var(--brand-emerald)', fontWeight: '600' }}>Message sent successfully!</div>}
           </div>
        </div>
      </div>
      <div style={{ marginTop: '60px' }}><Footer /></div>
    </div>
  );
}

// Build verification patch on 11/21/2025, 12:31:00 PM
