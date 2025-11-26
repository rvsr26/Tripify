import React from 'react';
import Footer from '../components/Footer';

export default function PrivacyPolicyScreen() {
  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '40px' }}>
        <header className="section-header" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem' }}>Privacy Policy</h1>
          <p>Last updated: October 2026</p>
        </header>

        <div className="legal-content">
          <p>Last Updated: April 1, 2026</p>
          
          <h2>1. Information we collect</h2>
          <p>We collect information you provide directly to us when you create an account, plan a trip, or communicate with us. This includes your name, email address, profile picture, and any trip details you enter.</p>
          
          <h2>2. How we use your information</h2>
          <p>We use your information to provide, maintain, and improve our services, including to:</p>
          <ul>
            <li>Personalize your travel itineraries using AI.</li>
            <li>Connect you with other travelers in our community.</li>
            <li>Process payments and subscriptions.</li>
            <li>Send you technical notices, updates, and security alerts.</li>
          </ul>

          <h2>3. Sharing of information</h2>
          <p>We do not share your private trip data or personal information with third parties except as required by law or to provide our service (e.g., with payment processors or geocoding services).</p>

          <h2>4. Data Security</h2>
          <p>We use advanced encryption and security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>

          <h2>5. Your Choices</h2>
          <p>You can update, correct, or delete your account information at any time by logging into your profile settings.</p>
        </div>
      </div>
      <div style={{ marginTop: '60px' }}><Footer /></div>
    </div>
  );
}

// Build verification patch on 11/25/2025, 9:00:00 AM

// Build verification patch on 11/26/2025, 3:57:00 PM
