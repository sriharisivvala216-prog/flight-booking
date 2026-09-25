import React, { useEffect, useRef, useState } from 'react';
import FlightCanvas3D from './FlightCanvas3D';
import { 
  Plane, 
  Search, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  ArrowRightLeft, 
  Wifi, 
  Tv, 
  Coffee, 
  Compass, 
  CheckCircle2, 
  Globe, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import '../styles/landingPage.css';

/* ─── Route & Destination Data ─────────────────────────────────── */
const POPULAR_ROUTES = [
  { from: 'JFK', fromCity: 'New York', to: 'DXB', toCity: 'Dubai', price: '$510', airline: 'Emirates', tag: '⚡ Most Popular' },
  { from: 'LHR', fromCity: 'London', to: 'SIN', toCity: 'Singapore', price: '$750', airline: 'Singapore Airlines', tag: '🌟 5-Star' },
  { from: 'SFO', fromCity: 'San Francisco', to: 'HND', toCity: 'Tokyo', price: '$530', airline: 'ANA All Nippon', tag: '🔥 Best Value' },
  { from: 'CDG', fromCity: 'Paris', to: 'JFK', toCity: 'New York', price: '$420', airline: 'Air France', tag: '✨ Express' },
  { from: 'DEL', fromCity: 'New Delhi', to: 'BOM', toCity: 'Mumbai', price: '$85', airline: 'Air India', tag: '⚡ Nonstop' },
];

const FLEET_AIRCRAFT = [
  {
    name: 'Airbus A350-900',
    type: 'Ultra Long Haul Flagship',
    speed: 'Mach 0.89 (945 km/h)',
    range: '15,000 km',
    capacity: '325 Passengers',
    highlight: 'Quietest cabin in the sky with 100% LED ambient lighting and reduced cabin altitude pressure.',
    badge: '3D Simulation Model',
    specs: ['Rolls-Royce Trent XWB', 'Carbon Composite Wings', 'High-Speed Wi-Fi 6'],
  },
  {
    name: 'Boeing 787-9 Dreamliner',
    type: 'Next-Gen Long Range',
    speed: 'Mach 0.85 (903 km/h)',
    range: '14,140 km',
    capacity: '290 Passengers',
    highlight: 'Electrochromic dimmable windows, cleaner cabin air filtration, and turbulence-dampening sensors.',
    badge: 'Eco-Efficiency Champion',
    specs: ['GEnx Turbofans', 'Smoother Ride Tech', 'Lower Fuel Burn -25%'],
  },
  {
    name: 'Airbus A380-800 Superjumbo',
    type: 'Double-Decker Luxury Liner',
    speed: 'Mach 0.85 (903 km/h)',
    range: '15,200 km',
    capacity: '510 Passengers',
    highlight: 'Onboard cocktail bar, private first-class shower spas, and unmatched spaciousness.',
    badge: 'Maximum Luxury',
    specs: ['Quad Engine Power', 'Private Suite Cabins', 'Onboard Lounge Bar'],
  },
];

const CABIN_CLASSES = [
  {
    name: 'First Class Sky Suite',
    icon: '👑',
    priceMul: 'From $2,800',
    perks: ['Private enclosed suite with sliding door', 'Fully flat 82-inch bed with memory mattress', 'Dom Pérignon & multi-course caviar service', 'Private airport chauffeur & VIP lounge access'],
    color: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    bgGlow: 'rgba(251, 191, 36, 0.15)',
  },
  {
    name: 'Business Class Lie-Flat',
    icon: '💼',
    priceMul: 'From $1,450',
    perks: ['Direct aisle access in 1-2-1 configuration', '180° lie-flat bed with plush duvet', 'Chef-curated gourmet dining on demand', 'Priority check-in, fast-track security & boarding'],
    color: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
    bgGlow: 'rgba(56, 189, 248, 0.15)',
  },
  {
    name: 'Premium Economy',
    icon: '✈️',
    priceMul: 'From $680',
    perks: ['38-inch pitch with 8-inch deep recline', 'Noise-canceling headphones & 13.3" 4K screen', 'Dedicated check-in & generous baggage allowance', 'Premium amenity kit & welcome champagne'],
    color: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    bgGlow: 'rgba(167, 139, 250, 0.15)',
  },
];

const STATS = [
  { value: '500+', label: 'Global Airlines' },
  { value: '1,200+', label: 'Destinations' },
  { value: '99.8%', label: 'On-Time Accuracy' },
  { value: '5M+', label: 'Happy Flyers' },
];

/* ─── 3D Wireframe Radar Globe ─────────────────────────────────── */
function MiniRadarGlobe() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const R = 150;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let angle = 0;
    let animId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Glow behind globe
      const glow = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.15);
      glow.addColorStop(0, 'rgba(14, 165, 233, 0.18)');
      glow.addColorStop(0.7, 'rgba(56, 189, 248, 0.04)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const meridians = 16;
      const parallels = 8;
      ctx.lineWidth = 0.8;

      // Draw Meridians
      for (let m = 0; m < meridians; m++) {
        const lon = (m / meridians) * Math.PI * 2 + angle;
        ctx.beginPath();
        let first = true;
        for (let s = 0; s <= 50; s++) {
          const lat = (s / 50) * Math.PI - Math.PI / 2;
          const cosLat = Math.cos(lat);
          const x3 = cosLat * Math.cos(lon) * R;
          const y3 = Math.sin(lat) * R;
          const z3 = cosLat * Math.sin(lon) * R;
          if (z3 < 0) { first = true; continue; }
          const alpha = 0.15 + (z3 / R) * 0.65;
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          if (first) { ctx.moveTo(cx + x3, cy - y3); first = false; }
          else { ctx.lineTo(cx + x3, cy - y3); }
        }
        ctx.stroke();
      }

      // Draw Parallels
      for (let p = 1; p < parallels; p++) {
        const lat = (p / parallels) * Math.PI - Math.PI / 2;
        const cosLat = Math.cos(lat);
        ctx.beginPath();
        let first = true;
        for (let s = 0; s <= 70; s++) {
          const lon = (s / 70) * Math.PI * 2 + angle;
          const x3 = cosLat * Math.cos(lon) * R;
          const y3 = Math.sin(lat) * R;
          const z3 = cosLat * Math.sin(lon) * R;
          if (z3 < 0) { first = true; continue; }
          const alpha = 0.12 + (z3 / R) * 0.55;
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          if (first) { ctx.moveTo(cx + x3, cy - y3); first = false; }
          else { ctx.lineTo(cx + x3, cy - y3); }
        }
        ctx.stroke();
      }

      // Outer rim
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Radar sweep effect
      const sweepAngle = (angle * 2.5) % (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, sweepAngle, sweepAngle + 0.35);
      ctx.closePath();
      const sweepGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      sweepGrd.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      sweepGrd.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = sweepGrd;
      ctx.fill();

      // City Hub nodes
      const HUBS = [
        { lat: 40.7, lon: -74.0, name: 'JFK' },
        { lat: 51.5, lon: -0.1,  name: 'LHR' },
        { lat: 25.2, lon: 55.3,  name: 'DXB' },
        { lat: 35.6, lon: 139.7, name: 'HND' },
        { lat: 1.3,  lon: 103.8, name: 'SIN' },
        { lat: 28.6, lon: 77.2,  name: 'DEL' },
        { lat: -33.8,lon: 151.2, name: 'SYD' },
      ];

      HUBS.forEach((hub) => {
        const radLat = (hub.lat * Math.PI) / 180;
        const radLon = (hub.lon * Math.PI) / 180 + angle;
        const cosL = Math.cos(radLat);
        const x3 = cosL * Math.cos(radLon) * R;
        const y3 = Math.sin(radLat) * R;
        const z3 = cosL * Math.sin(radLon) * R;
        if (z3 < 0) return;

        const alpha = 0.3 + (z3 / R) * 0.7;
        // Dot
        ctx.beginPath();
        ctx.arc(cx + x3, cy - y3, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
        ctx.fill();

        // Pulsing radar ring
        ctx.beginPath();
        ctx.arc(cx + x3, cy - y3, 7 + Math.sin(angle * 4) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 158, 11, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      angle += 0.005;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas ref={canvasRef} width={380} height={380} className="radar-globe-canvas" />
  );
}

/* ─── Main Landing Page Component ──────────────────────────────── */
export default function LandingPage({ onEnter }) {
  // Quick search form state inside landing page
  const [fromCode, setFromCode] = useState('JFK');
  const [toCode, setToCode] = useState('DXB');
  const [cabinClass, setCabinClass] = useState('economy');
  const [departureDate, setDepartureDate] = useState('2026-10-15');

  const handleQuickSearch = (e) => {
    e.preventDefault();
    onEnter({
      from: fromCode,
      to: toCode,
      cabinClass: cabinClass,
      date: departureDate,
    });
  };

  const handleRouteClick = (route) => {
    onEnter({
      from: route.from,
      to: route.to,
      cabinClass: 'economy',
    });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="lp-experience-root">
      {/* ── TOP FLOATING HEADER ── */}
      <header className="lp-floating-header">
        <div className="lp-header-brand">
          <div className="brand-logo-glow">
            <Plane className="brand-plane-icon" size={24} />
          </div>
          <div className="brand-text-block">
            <span className="brand-title">AERO<span className="brand-accent">LUX</span></span>
            <span className="brand-subtitle">GLOBAL AIRWAYS</span>
          </div>
        </div>

        <nav className="lp-header-nav">
          <button className="nav-link-btn" onClick={() => scrollToSection('sec-radar')}>Radar & Routes</button>
          <button className="nav-link-btn" onClick={() => scrollToSection('sec-fleet')}>Aircraft Fleet</button>
          <button className="nav-link-btn" onClick={() => scrollToSection('sec-cabins')}>Cabin Classes</button>
        </nav>

        <button className="lp-header-cta" onClick={() => onEnter()}>
          <span>Enter Booking Portal</span>
          <ChevronRight size={16} />
        </button>
      </header>

      {/* ── HERO SECTION WITH 3D REALISTIC AIRPLANE SCENE ── */}
      <section className="lp-hero-3d-stage">
        {/* Full Interactive Three.js Flight Simulation */}
        <FlightCanvas3D onExplore={() => onEnter()} />

        {/* Floating Glassmorphic Search & Brand Card */}
        <div className="lp-hero-overlay-content">
          <div className="hero-text-badge">
            <Sparkles size={14} className="sparkle-icon" />
            <span>REAL-TIME 3D FLIGHT SIMULATOR & GLOBAL RADAR</span>
          </div>

          <h1 className="hero-main-heading">
            Experience Flight<br />
            <span className="heading-gradient-lux">At 38,000 Feet.</span>
          </h1>

          <p className="hero-description">
            Immerse yourself in precision aerospace engineering. Compare live routes across 500+ global carriers,
            select your dream seat, and take off with zero booking fees.
          </p>

          {/* Quick Glassmorphic Search Form */}
          <form className="hero-quick-search-card" onSubmit={handleQuickSearch}>
            <div className="search-field-col">
              <label><MapPin size={14} /> DEPARTURE</label>
              <select value={fromCode} onChange={(e) => setFromCode(e.target.value)}>
                <option value="JFK">New York (JFK)</option>
                <option value="LHR">London (LHR)</option>
                <option value="SFO">San Francisco (SFO)</option>
                <option value="DXB">Dubai (DXB)</option>
                <option value="DEL">New Delhi (DEL)</option>
                <option value="SIN">Singapore (SIN)</option>
                <option value="HND">Tokyo (HND)</option>
                <option value="CDG">Paris (CDG)</option>
              </select>
            </div>

            <div className="search-swap-icon">
              <ArrowRightLeft size={16} />
            </div>

            <div className="search-field-col">
              <label><MapPin size={14} /> DESTINATION</label>
              <select value={toCode} onChange={(e) => setToCode(e.target.value)}>
                <option value="DXB">Dubai (DXB)</option>
                <option value="HND">Tokyo (HND)</option>
                <option value="SIN">Singapore (SIN)</option>
                <option value="LHR">London (LHR)</option>
                <option value="JFK">New York (JFK)</option>
                <option value="CDG">Paris (CDG)</option>
                <option value="BOM">Mumbai (BOM)</option>
                <option value="SYD">Sydney (SYD)</option>
              </select>
            </div>

            <div className="search-field-col">
              <label><Calendar size={14} /> DATE</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </div>

            <div className="search-field-col">
              <label><Award size={14} /> CABIN</label>
              <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)}>
                <option value="economy">Economy</option>
                <option value="premium_economy">Premium Econ</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>

            <button type="submit" className="hero-search-submit-btn">
              <Search size={18} />
              <span>Search Flights</span>
            </button>
          </form>

          {/* Quick Route Shortcut Chips */}
          <div className="hero-route-chips">
            <span className="chips-label">Popular Routes:</span>
            {POPULAR_ROUTES.slice(0, 4).map((r) => (
              <button
                key={`${r.from}-${r.to}`}
                type="button"
                className="route-chip-btn"
                onClick={() => handleRouteClick(r)}
              >
                <span className="chip-code">{r.from} ➔ {r.to}</span>
                <span className="chip-price">{r.price}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="lp-stats-strip">
        <div className="stats-inner-container">
          {STATS.map((s, idx) => (
            <div key={idx} className="stat-pill-item">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION: GLOBAL RADAR & LIVE ROUTES ── */}
      <section id="sec-radar" className="lp-content-section">
        <div className="section-head-center">
          <div className="section-eyebrow">
            <Globe size={14} />
            <span>GLOBAL AIR TRAFFIC SURVEILLANCE</span>
          </div>
          <h2 className="section-title">Worldwide Flight Network</h2>
          <p className="section-subtitle">
            Track and book non-stop long haul routes across our intercontinental flight radar.
          </p>
        </div>

        <div className="radar-showcase-grid">
          {/* Left: 3D Wireframe Radar Globe */}
          <div className="radar-globe-card">
            <div className="globe-card-header">
              <span className="radar-indicator" />
              <span>LIVE SATELLITE TELEMETRY • ACTIVE AIRSPACE</span>
            </div>
            <div className="globe-canvas-holder">
              <MiniRadarGlobe />
            </div>
            <div className="globe-card-footer">
              <span>ACTIVE CORRIDORS: 14,290 FLIGHTS</span>
              <span className="radar-ping">⚡ ALL SYSTEMS NOMINAL</span>
            </div>
          </div>

          {/* Right: Featured Route Flight Boards */}
          <div className="radar-routes-list">
            <h3 className="routes-board-title">Top Daily Long-Haul Departures</h3>
            {POPULAR_ROUTES.map((route, i) => (
              <div 
                key={i} 
                className="route-flight-row"
                onClick={() => handleRouteClick(route)}
              >
                <div className="route-origin-dest">
                  <div className="airport-block">
                    <span className="apt-code">{route.from}</span>
                    <span className="apt-city">{route.fromCity}</span>
                  </div>
                  <div className="flight-path-divider">
                    <span className="divider-line" />
                    <Plane size={16} className="path-plane" />
                    <span className="divider-line" />
                  </div>
                  <div className="airport-block right">
                    <span className="apt-code">{route.to}</span>
                    <span className="apt-city">{route.toCity}</span>
                  </div>
                </div>

                <div className="route-meta-col">
                  <span className="airline-name">{route.airline}</span>
                  <span className="route-tag">{route.tag}</span>
                </div>

                <div className="route-price-col">
                  <span className="price-from">From</span>
                  <span className="price-amount">{route.price}</span>
                  <button className="book-row-btn">
                    <span>Book</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: AIRCRAFT FLEET SHOWCASE ── */}
      <section id="sec-fleet" className="lp-content-section dark-alt">
        <div className="section-head-center">
          <div className="section-eyebrow">
            <Plane size={14} />
            <span>MODERN AEROSPACE FLEET</span>
          </div>
          <h2 className="section-title">Engineered For Supreme Comfort</h2>
          <p className="section-subtitle">
            Travel aboard the world's most advanced, eco-efficient widebody commercial aircraft.
          </p>
        </div>

        <div className="fleet-cards-grid">
          {FLEET_AIRCRAFT.map((plane, index) => (
            <div key={index} className="fleet-spec-card">
              <div className="fleet-card-top">
                <span className="fleet-badge">{plane.badge}</span>
                <span className="fleet-type">{plane.type}</span>
              </div>
              <h3 className="fleet-aircraft-name">{plane.name}</h3>
              <p className="fleet-aircraft-desc">{plane.highlight}</p>

              <div className="fleet-specs-box">
                <div className="spec-row">
                  <span className="spec-key">Cruising Speed</span>
                  <span className="spec-val">{plane.speed}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-key">Max Range</span>
                  <span className="spec-val">{plane.range}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-key">Seating Capacity</span>
                  <span className="spec-val">{plane.capacity}</span>
                </div>
              </div>

              <div className="fleet-specs-pills">
                {plane.specs.map((sp, sIdx) => (
                  <span key={sIdx} className="spec-pill">{sp}</span>
                ))}
              </div>

              <button className="fleet-explore-btn" onClick={() => onEnter()}>
                <span>Fly This Aircraft</span>
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION: CABIN CLASSES ── */}
      <section id="sec-cabins" className="lp-content-section">
        <div className="section-head-center">
          <div className="section-eyebrow">
            <Award size={14} />
            <span>EXQUISITE TRAVEL EXPERIENCES</span>
          </div>
          <h2 className="section-title">Choose Your Sky Sanctuary</h2>
          <p className="section-subtitle">
            Every ticket includes high-speed satellite Wi-Fi, fine dining, and personalized care.
          </p>
        </div>

        <div className="cabin-classes-grid">
          {CABIN_CLASSES.map((cabin, idx) => (
            <div 
              key={idx} 
              className="cabin-experience-card"
              style={{ '--cabin-glow': cabin.bgGlow }}
            >
              <div className="cabin-top-row">
                <span className="cabin-icon">{cabin.icon}</span>
                <span className="cabin-price-badge">{cabin.priceMul}</span>
              </div>

              <h3 className="cabin-title" style={{ background: cabin.color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {cabin.name}
              </h3>

              <ul className="cabin-perks-list">
                {cabin.perks.map((perk, pIdx) => (
                  <li key={pIdx}>
                    <CheckCircle2 size={16} className="perk-check" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button className="cabin-select-btn" onClick={() => onEnter()}>
                <span>Select Experience</span>
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL LAUNCH CTA BANNER ── */}
      <section className="lp-final-launch-banner">
        <div className="launch-glow-bg" />
        <div className="launch-inner-card">
          <div className="launch-badge">
            <Plane size={16} />
            <span>READY FOR DEPARTURE</span>
          </div>
          <h2 className="launch-title">Your Next Horizon Awaits.</h2>
          <p className="launch-sub">
            Compare 500+ airlines, choose your exact seat on interactive 3D seatmaps, 
            and generate your instant digital boarding pass.
          </p>
          <div className="launch-btn-row">
            <button className="launch-primary-btn" onClick={() => onEnter()}>
              <Plane size={20} />
              <span>Launch Booking App</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-mini-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-brand">AEROLUX GLOBAL</span>
            <span className="footer-copy">© 2026 AeroLux Technologies Inc. All rights reserved.</span>
          </div>
          <div className="footer-right">
            <span>Terms of Carriage</span>
            <span>Privacy Policy</span>
            <span>Aviation Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
