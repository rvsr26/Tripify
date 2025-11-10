import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

// Custom Social Icon Components (Resolving Lucide brand icon removal)
const Github = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const Twitter = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const Instagram = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const Linkedin = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-section">
            <Link to="/" className="footer-logo-text vibrant-gradient-text" style={{ fontSize: '2.4rem', letterSpacing: '-1px' }}>Tripify</Link>
            <p className="footer-tagline" style={{ marginTop: '12px', fontSize: '1.05rem', opacity: 0.8 }}>
              The universe's most advanced AI travel planner. <br/>
              Built for the bold, designed for the curious.
            </p>
            <div className="footer-social-links">
              <a href="#" className="social-pill" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#" className="social-pill" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#" className="social-pill" aria-label="Linkedin"><Linkedin size={18} /></a>
              <a href="#" className="social-pill" aria-label="Github"><Github size={18} /></a>
            </div>
          </div>

          <div className="footer-nav-group">
            <h6 className="footer-heading">Product</h6>
            <ul className="footer-list">
              <li><Link to="/planner">AI Planner</Link></li>
              <li><Link to="/map">Map Explorer</Link></li>
              <li><Link to="/communities">Communities</Link></li>
              <li><Link to="/deals">Exclusive Deals</Link></li>
            </ul>
          </div>

          <div className="footer-nav-group">
            <h6 className="footer-heading">Support</h6>
            <ul className="footer-list">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/status">Server Status</Link></li>
            </ul>
          </div>

          <div className="footer-nav-group">
            <h6 className="footer-heading">Legal</h6>
            <ul className="footer-list">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/cookies">Cookie Policy</Link></li>
              <li><Link to="/licenses">Open Source</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar premium-border">
          <div className="copyright-text">
            © 2026 Tripify AI. All rights reserved. Crafted with <Heart size={14} className="heart-icon" /> by explorers.
          </div>
        </div>
      </div>
    </footer>
  );
}
