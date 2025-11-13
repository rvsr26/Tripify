import React from 'react';
import Footer from '../components/Footer';

export default function TermsOfServiceScreen() {
  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '40px' }}>
        <header className="section-header" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem' }}>Terms of Service</h1>
          <p>The rules of the road for using Tripify AI.</p>
        </header>

        <div className="legal-content">
          <p>Effective Date: April 1, 2026</p>

          <h2>1. Use of our Services</h2>
          <p>By accessing or using Tripify, you agree to be bound by these Terms of Service. You must be at least 13 years old to use our platform.</p>

          <h2>2. Your Content</h2>
          <p>You retain ownership of the photos, itineraries, and other content you post on Tripify. By posting, you grant us a license to use, display, and distribute your content as part of the platform's features.</p>

          <h2>3. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any illegal purpose.</li>
            <li>Post content that is offensive or violates our community guidelines.</li>
            <li>Interfere with or disrupt the service or its servers.</li>
            <li>Use automated systems to plan trips at scale without permission.</li>
          </ul>

          <h2>4. AI Accuracy</h2>
          <p>While our AI uses Gemini 1.5 Pro to provide the best travel advice, we do not guarantee the absolute accuracy of opening hours, pricing, or locations. Always verify critical information from local sources.</p>

          <h2>5. Limitation of Liability</h2>
          <p>Tripify AI shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the service or any travel decisions based on our AI recommendations.</p>

          <h2>6. Changes to Terms</h2>
          <p>We may update these terms from time to time. Your continued use of Tripify after changes are posted constitutes your acceptance of the new terms.</p>
        </div>
      </div>
      <div style={{ marginTop: '60px' }}><Footer /></div>
    </div>
  );
}
