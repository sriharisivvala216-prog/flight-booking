import React, { useState } from 'react';
import { Plane, ShieldCheck, Award, HeartHandshake, Send } from 'lucide-react';
import '../styles/footer.css';

const Footer = ({ onSelectTab }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-brand">
            <h3>
              <Plane size={24} color="#00e5ff" />
              SkyWings Airways
            </h3>
            <p>
              Your trusted gateway to the world. We offer seamless global bookings,
              flexible travel protections, and luxury cabin comforts across 180+ global routes.
            </p>
            <div className="footer-trust-badges">
              <span className="trust-badge-item">
                <ShieldCheck size={14} style={{ display: 'inline', marginRight: 4 }} />
                IATA Certified
              </span>
              <span className="trust-badge-item">
                <Award size={14} style={{ display: 'inline', marginRight: 4 }} />
                5-Star Skytrax
              </span>
              <span className="trust-badge-item">
                <HeartHandshake size={14} style={{ display: 'inline', marginRight: 4 }} />
                24/7 Concierge
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); onSelectTab('search'); }}>Book Flight</a></li>
              <li><a href="#bookings" onClick={(e) => { e.preventDefault(); onSelectTab('bookings'); }}>Manage Trips</a></li>
              <li><a href="#status" onClick={(e) => { e.preventDefault(); onSelectTab('status'); }}>Flight Status</a></li>
              <li><a href="#admin" onClick={(e) => { e.preventDefault(); onSelectTab('admin'); }}>Admin Portal</a></li>
            </ul>
          </div>

          {/* Top Routes */}
          <div className="footer-col">
            <h4>Popular Routes</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>New York (JFK) → Dubai (DXB)</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>London (LHR) → Singapore (SIN)</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>New Delhi (DEL) → New York (JFK)</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>San Francisco (SFO) → Tokyo (HND)</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-col">
            <h4>Exclusive Deals</h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
              Subscribe to unlock flash fares, member discounts, and private flight sales.
            </p>
            {subscribed ? (
              <p style={{ color: '#10b981', marginTop: 12, fontWeight: 600 }}>
                ✓ Thank you for subscribing! Check your inbox soon.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-input-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2026 SkyWings Aviation Inc. All rights reserved. Built for seamless travel.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Carriage</a>
            <a href="#">Security Guarantee</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
