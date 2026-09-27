import React, { useState, useRef, useEffect } from 'react';
import FlightCanvas3D, { GLOBAL_HUBS } from './FlightCanvas3D';
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
  Award,
  Luggage,
  QrCode,
  Layers,
  Zap,
  Sliders,
  X,
  CreditCard,
  Ticket,
  LogIn
} from 'lucide-react';
import '../styles/landingPage.css';

/* ─── Route & Destination Data ─────────────────────────────────── */
const POPULAR_ROUTES = [
  { from: 'JFK', fromCity: 'New York', to: 'DXB', toCity: 'Dubai', price: '$510', airline: 'Emirates', tag: '⚡ Most Popular', duration: '12h 45m', flag: '🇦🇪' },
  { from: 'LHR', fromCity: 'London', to: 'SIN', toCity: 'Singapore', price: '$750', airline: 'Singapore Airlines', tag: '🌟 5-Star Luxury', duration: '13h 10m', flag: '🇸🇬' },
  { from: 'SFO', fromCity: 'San Francisco', to: 'HND', toCity: 'Tokyo', price: '$530', airline: 'ANA All Nippon', tag: '🔥 Best Deal', duration: '11h 20m', flag: '🇯🇵' },
  { from: 'CDG', fromCity: 'Paris', to: 'JFK', toCity: 'New York', price: '$420', airline: 'Air France', tag: '✨ Supersonic', duration: '08h 15m', flag: '🇺🇸' },
  { from: 'DEL', fromCity: 'New Delhi', to: 'BOM', toCity: 'Mumbai', price: '$85', airline: 'Air India', tag: '⚡ Express', duration: '02h 15m', flag: '🇮🇳' },
];

const FLEET_AIRCRAFT = [
  {
    name: 'AeroLux Mach-2 Suborbital',
    type: 'Supersonic Commercial Cruiser',
    speed: 'Mach 2.2 (2,350 km/h)',
    range: '12,500 km',
    capacity: '140 VIP Passengers',
    highlight: 'New York to London in under 3.5 hours. Zero-emission sustainable aviation fuel and active sonic boom dampening.',
    badge: '⚡ Supersonic Flagship',
    specs: ['Olympus-X Turbofans', 'Titanium Composite Wings', 'Satellite Wi-Fi 7 Gigabit'],
  },
  {
    name: 'Airbus A350-900 Quantum',
    type: 'Ultra Long Haul Flagship',
    speed: 'Mach 0.89 (945 km/h)',
    range: '15,000 km',
    capacity: '325 Passengers',
    highlight: 'Quietest cabin in the sky with 100% LED circadian ambient lighting and reduced cabin altitude pressure at 6,000 ft.',
    badge: '3D Simulation Model',
    specs: ['Rolls-Royce Trent XWB', 'Carbon Composite Wings', 'High-Speed Wi-Fi 6'],
  },
  {
    name: 'Boeing 787-9 Dreamliner X',
    type: 'Next-Gen Long Range',
    speed: 'Mach 0.85 (903 km/h)',
    range: '14,140 km',
    capacity: '290 Passengers',
    highlight: 'Electrochromic dimmable windows, cleaner cabin air HEPA filtration, and turbulence-dampening active sensors.',
    badge: 'Eco-Efficiency Champion',
    specs: ['GEnx Turbofans', 'Smoother Ride Sensors', 'Lower Fuel Burn -25%'],
  },
];

const CABIN_CLASSES = [
  {
    name: 'Orbital First Class Sky Suite',
    icon: '👑',
    priceMul: 'From $2,800',
    perks: ['Private enclosed suite with biometric sliding door', 'Fully flat 82-inch bed with memory mattress', 'Dom Pérignon & multi-course caviar service', 'Private airport chauffeur & VIP lounge access'],
    color: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    bgGlow: 'rgba(251, 191, 36, 0.15)',
  },
  {
    name: 'Cyber Business Lie-Flat Pod',
    icon: '💼',
    priceMul: 'From $1,450',
    perks: ['Direct aisle access in 1-2-1 privacy configuration', '180° lie-flat bed with plush duvet & noise cancellation', 'Chef-curated gourmet dining on demand', 'Priority fast-track biometric security & boarding'],
    color: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
    bgGlow: 'rgba(56, 189, 248, 0.15)',
  },
  {
    name: 'Supersonic Premium Economy',
    icon: '✈️',
    priceMul: 'From $680',
    perks: ['38-inch pitch with 8-inch deep recline', 'Noise-canceling headphones & 14" 4K OLED touch screen', 'Dedicated check-in & 2x 32kg smart luggage allowance', 'Premium amenity kit & welcome champagne'],
    color: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    bgGlow: 'rgba(167, 139, 250, 0.15)',
  },
];

const STATS = [
  { value: '500+', label: 'Global Carriers' },
  { value: '1,200+', label: 'Destinations' },
  { value: '99.8%', label: 'Satellite Telemetry' },
  { value: '0 SEC', label: 'Biometric Baggage Drop' },
];

export default function LandingPage({ onEnter, onNavigate }) {
  // 3D Canvas Mode State
  const [active3DMode, setActive3DMode] = useState('jet'); // 'jet' | 'globe'
  
  // Search Form State
  const [tripType, setTripType] = useState('one-way');
  const [fromCode, setFromCode] = useState('JFK');
  const [toCode, setToCode] = useState('DXB');
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [cabinClass, setCabinClass] = useState('economy');
  const [passengers, setPassengers] = useState(1);
  const [checkedLuggageCount, setCheckedLuggageCount] = useState(1);

  // Holographic Ticket Modal State
  const [showHoloTicket, setShowHoloTicket] = useState(false);
  const [ticketTilt, setTicketTilt] = useState({ x: 0, y: 0 });

  // Interactive Smart Luggage Widget State (Addressing 🧳 🛫 theme)
  const [luggageWeight, setLuggageWeight] = useState(21.4); // kg
  const MAX_FREE_WEIGHT = 23.0; // kg

  const handleSwapAirports = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleQuickSearch = (e) => {
    if (e) e.preventDefault();
    onEnter({
      from: fromCode,
      to: toCode,
      date: departureDate,
      cabinClass: cabinClass,
      passengers: passengers,
    });
  };

  const handleRouteClick = (route) => {
    setFromCode(route.from);
    setToCode(route.to);
    onEnter({
      from: route.from,
      to: route.to,
      cabinClass: 'economy',
    });
  };

  // Holographic Ticket 3D Tilt Effect on Mouse Move
  const handleTicketMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const centerX = card.left + card.width / 2;
    const centerY = card.top + card.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    const rotateY = (mouseX / (card.width / 2)) * 12;
    const rotateX = -(mouseY / (card.height / 2)) * 12;
    setTicketTilt({ x: rotateX, y: rotateY });
  };

  const handleTicketMouseLeave = () => {
    setTicketTilt({ x: 0, y: 0 });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="lp-experience-root">
      {/* ── TOP FLOATING AEROSPATIAL HEADER ── */}
      <header className="lp-floating-header">
        <div className="lp-header-brand" onClick={() => scrollToSection('sec-hero')}>
          <div className="brand-logo-glow">
            <Plane className="brand-plane-icon" size={24} />
          </div>
          <div className="brand-text-block">
            <span className="brand-title">AERO<span className="brand-accent">LUX</span></span>
            <span className="brand-subtitle">FUTURE OF BOOKING 🧳 🛫</span>
          </div>
        </div>

        <nav className="lp-header-nav">
          <button className="nav-link-btn" onClick={() => scrollToSection('sec-hero')}>
            <Sparkles size={14} className="nav-icon" />
            <span>3D Flight Deck</span>
          </button>
          <button className="nav-link-btn" onClick={() => scrollToSection('sec-luggage')}>
            <Luggage size={14} className="nav-icon" />
            <span>Smart Luggage 🧳</span>
          </button>
          <button className="nav-link-btn" onClick={() => scrollToSection('sec-fleet')}>
            <Plane size={14} className="nav-icon" />
            <span>Supersonic Fleet 🛫</span>
          </button>
          <button className="nav-link-btn" onClick={() => scrollToSection('sec-cabins')}>
            <Award size={14} className="nav-icon" />
            <span>Cabin Suites</span>
          </button>
        </nav>

        <div className="lp-header-actions">
          <button 
            type="button" 
            className="lp-signin-header-btn"
            onClick={() => onNavigate ? onNavigate('/sign-in') : onEnter()}
          >
            <LogIn size={15} />
            <span className="signin-btn-text">Sign In</span>
          </button>

          <button 
            type="button"
            className="lp-holo-pass-btn"
            onClick={() => setShowHoloTicket(true)}
            title="Preview 3D Holographic Boarding Pass"
          >
            <Ticket size={16} />
            <span className="holo-btn-text">Holo Pass</span>
          </button>

          <button className="lp-header-cta" onClick={() => onEnter()}>
            <span className="cta-full">Launch Booking App</span>
            <span className="cta-short">Book Flights</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      {/* ── HERO SECTION: 3D INTERACTIVE FLIGHT & GLOBE STAGE ── */}
      <section id="sec-hero" className="lp-hero-3d-stage">
        {/* Full Interactive Three.js Supersonic Jet & 3D Globe Radar */}
        <FlightCanvas3D 
          mode={active3DMode}
          onModeChange={(m) => setActive3DMode(m)}
          activeCity={toCode}
          onSelectCity={(city) => setToCode(city)}
          onExplore={() => onEnter()}
        />

        {/* Floating Glassmorphic Future Booking Console */}
        <div className="lp-hero-overlay-content">
          <div className="hero-text-badge">
            <Sparkles size={14} className="sparkle-icon" />
            <span>WHAT THE FUTURE OF BOOKING LOOKS LIKE 🧳 🛫</span>
          </div>

          <h1 className="hero-main-heading">
            Fly Beyond Limits.<br />
            <span className="heading-gradient-lux">At Mach Speed.</span>
          </h1>

          <p className="hero-description">
            Experience next-generation suborbital commercial flight. Interactive 3D avionics telemetry,
            biometric luggage RFID tracking, zero booking fees, and instant holographic boarding passes.
          </p>

          {/* ── FLOATING GLASSMORPHIC BOOKING DOCK ── */}
          <div className="hero-booking-dock-glass">
            {/* Trip Type & 3D View Switcher Tabs */}
            <div className="dock-top-row">
              <div className="trip-type-pill-group">
                <button 
                  type="button"
                  className={`trip-pill ${tripType === 'one-way' ? 'active' : ''}`}
                  onClick={() => setTripType('one-way')}
                >
                  One-Way
                </button>
                <button 
                  type="button"
                  className={`trip-pill ${tripType === 'round-trip' ? 'active' : ''}`}
                  onClick={() => setTripType('round-trip')}
                >
                  Round-Trip
                </button>
                <button 
                  type="button"
                  className={`trip-pill ${tripType === 'suborbital' ? 'active' : ''}`}
                  onClick={() => setTripType('suborbital')}
                >
                  ⚡ Suborbital Express
                </button>
              </div>

              {/* Quick 3D Canvas Switcher */}
              <div className="canvas-mode-quick-switch">
                <button 
                  type="button" 
                  className={`canvas-mode-btn ${active3DMode === 'jet' ? 'active' : ''}`}
                  onClick={() => setActive3DMode('jet')}
                  title="3D Supersonic Jet Simulation"
                >
                  <Plane size={14} />
                  <span>3D Jet View</span>
                </button>
                <button 
                  type="button" 
                  className={`canvas-mode-btn ${active3DMode === 'globe' ? 'active' : ''}`}
                  onClick={() => setActive3DMode('globe')}
                  title="3D Global Radar & City Nodes"
                >
                  <Globe size={14} />
                  <span>3D Globe Radar</span>
                </button>
              </div>
            </div>

            {/* Quick Glassmorphic Search Form */}
            <form className="hero-quick-search-card" onSubmit={handleQuickSearch}>
              {/* DEPARTURE */}
              <div className="search-field-col">
                <label className="field-label">
                  <MapPin size={13} className="label-icon" />
                  <span>FROM</span>
                </label>
                <select 
                  value={fromCode} 
                  onChange={(e) => setFromCode(e.target.value)}
                  className="dock-select"
                >
                  {GLOBAL_HUBS.map((hub) => (
                    <option key={hub.code} value={hub.code}>
                      {hub.flag} {hub.city} ({hub.code})
                    </option>
                  ))}
                </select>
                <span className="field-hint">Origin Airport</span>
              </div>

              {/* SWAP BUTTON */}
              <button 
                type="button" 
                className="search-swap-btn"
                onClick={handleSwapAirports}
                title="Swap Origin & Destination"
              >
                <ArrowRightLeft size={16} />
              </button>

              {/* DESTINATION */}
              <div className="search-field-col">
                <label className="field-label">
                  <MapPin size={13} className="label-icon" />
                  <span>TO</span>
                </label>
                <select 
                  value={toCode} 
                  onChange={(e) => setToCode(e.target.value)}
                  className="dock-select"
                >
                  {GLOBAL_HUBS.map((hub) => (
                    <option key={hub.code} value={hub.code}>
                      {hub.flag} {hub.city} ({hub.code})
                    </option>
                  ))}
                </select>
                <span className="field-hint">Destination Hub</span>
              </div>

              {/* DATE */}
              <div className="search-field-col">
                <label className="field-label">
                  <Calendar size={13} className="label-icon" />
                  <span>DATE</span>
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="dock-input"
                />
                <span className="field-hint">Departure Day</span>
              </div>

              {/* CABIN & BAGGAGE */}
              <div className="search-field-col">
                <label className="field-label">
                  <Award size={13} className="label-icon" />
                  <span>CLASS & BAGGAGE</span>
                </label>
                <select 
                  value={cabinClass} 
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="dock-select"
                >
                  <option value="economy">Economy (1x 🧳 23kg)</option>
                  <option value="premium_economy">Premium Econ (2x 🧳 32kg)</option>
                  <option value="business">Business Pod (3x 🧳 VIP)</option>
                  <option value="first">Orbital First Suite (Unlimited 👑)</option>
                </select>
                <span className="field-hint">Smart RFID Tag included</span>
              </div>

              {/* SUBMIT BUTTON */}
              <button type="submit" className="hero-search-submit-btn">
                <Search size={18} />
                <span>Search Flights</span>
              </button>
            </form>

            {/* Dock Bottom Row: Quick Route Chips & Holo Ticket Launcher */}
            <div className="dock-bottom-meta-row">
              <div className="hero-route-chips">
                <span className="chips-label">Popular Live Routes:</span>
                {POPULAR_ROUTES.map((r) => (
                  <button
                    key={`${r.from}-${r.to}`}
                    type="button"
                    className="route-chip-btn"
                    onClick={() => handleRouteClick(r)}
                  >
                    <span className="chip-flag">{r.flag}</span>
                    <span className="chip-code">{r.from} ➔ {r.to}</span>
                    <span className="chip-price">{r.price}</span>
                  </button>
                ))}
              </div>

              <button 
                type="button" 
                className="dock-holo-pass-pill"
                onClick={() => setShowHoloTicket(true)}
              >
                <QrCode size={14} />
                <span>Instant 3D Boarding Pass</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
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

      {/* ── SECTION: SMART LUGGAGE & BIOMETRIC BAGGAGE (🧳 🛫) ── */}
      <section id="sec-luggage" className="lp-content-section">
        <div className="section-head-center">
          <div className="section-eyebrow">
            <Luggage size={14} />
            <span>NEXT-GEN TRAVEL ECOSYSTEM 🧳</span>
          </div>
          <h2 className="section-title">Smart Luggage & Biometric Telemetry</h2>
          <p className="section-subtitle">
            Say goodbye to lost baggage anxiety. AeroLux integrates real-time GPS RFID beacons,
            automatic weight balance sensors, and zero-wait carousel delivery.
          </p>
        </div>

        <div className="luggage-showcase-grid">
          {/* Interactive Smart Luggage Tag Card */}
          <div className="luggage-card-interactive">
            <div className="luggage-card-header">
              <div className="luggage-status-badge">
                <span className="status-blip" />
                <span>ACTIVE RFID BEACON • SATELLITE LOCKED</span>
              </div>
              <span className="luggage-tag-id">#AL-8829-DXB</span>
            </div>

            <div className="luggage-visual-display">
              <div className="luggage-3d-graphic">
                <div className="luggage-icon-wrapper">
                  <Luggage size={72} className="luggage-hero-icon" />
                  <div className="rfid-ping-ring r1" />
                  <div className="rfid-ping-ring r2" />
                </div>
                <div className="luggage-telemetry-pill">
                  <Wifi size={12} className="text-cyan" />
                  <span>GPS: 25.2532° N, 55.3657° E (Cargo Bay 2B)</span>
                </div>
              </div>

              {/* Real-time Weight Scale Slider */}
              <div className="luggage-scale-widget">
                <div className="scale-readout">
                  <span className="scale-title">SMART WEIGHT SENSOR</span>
                  <span className={`scale-number ${luggageWeight > MAX_FREE_WEIGHT ? 'overweight' : ''}`}>
                    {luggageWeight.toFixed(1)} <span className="unit">KG</span>
                  </span>
                </div>

                <input 
                  type="range"
                  min="5.0"
                  max="32.0"
                  step="0.5"
                  value={luggageWeight}
                  onChange={(e) => setLuggageWeight(parseFloat(e.target.value))}
                  className="luggage-weight-slider"
                />

                <div className="scale-allowance-bar">
                  <div 
                    className="allowance-fill"
                    style={{ width: `${Math.min(100, (luggageWeight / 32) * 100)}%` }}
                  />
                </div>

                <div className="scale-meta-row">
                  <span>Standard Allowance: 23.0 KG</span>
                  <span className={luggageWeight > MAX_FREE_WEIGHT ? 'tag-warn' : 'tag-ok'}>
                    {luggageWeight > MAX_FREE_WEIGHT 
                      ? `⚠️ +${(luggageWeight - MAX_FREE_WEIGHT).toFixed(1)}kg Overweight`
                      : '✅ Free Complimentary Baggage'}
                  </span>
                </div>
              </div>
            </div>

            <div className="luggage-specs-row">
              <div className="luggage-spec-box">
                <span className="spec-label">CAROUSEL DISPATCH</span>
                <span className="spec-val">Carousel 04 • Dubai DXB</span>
              </div>
              <div className="luggage-spec-box">
                <span className="spec-label">CARGO TEMPERATURE</span>
                <span className="spec-val">+18.5°C Pressurized</span>
              </div>
              <div className="luggage-spec-box">
                <span className="spec-label">BIOMETRIC DROP</span>
                <span className="spec-val">Zero-Wait Facial Scan</span>
              </div>
            </div>
          </div>

          {/* Luggage Benefits Grid */}
          <div className="luggage-features-col">
            <div className="luggage-feat-card">
              <div className="feat-icon-box">
                <Wifi size={22} className="text-cyan" />
              </div>
              <div className="feat-content">
                <h4>Continuous Global RFID Tracking</h4>
                <p>Every piece of luggage is synchronized to our space satellite network. Receive live notifications from check-in to luggage carousel pickup.</p>
              </div>
            </div>

            <div className="luggage-feat-card">
              <div className="feat-icon-box">
                <ShieldCheck size={22} className="text-emerald" />
              </div>
              <div className="feat-content">
                <h4>Biometric Auto-Drop Kiosks</h4>
                <p>No waiting in airline check-in queues. Simply place your bag on the smart belt, glance at the iris scanner, and walk directly to priority security.</p>
              </div>
            </div>

            <div className="luggage-feat-card">
              <div className="feat-icon-box">
                <Zap size={22} className="text-amber" />
              </div>
              <div className="feat-content">
                <h4>Smart Carousel Telemetry & Delivery</h4>
                <p>Your bag sends a proximity push alert to your smartphone the precise second it touches the arrival baggage carousel.</p>
              </div>
            </div>

            <button className="luggage-portal-btn" onClick={() => onEnter()}>
              <Luggage size={16} />
              <span>Book Flight With Smart Baggage Sync</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION: SUPERSONIC FLEET SHOWCASE (🛫) ── */}
      <section id="sec-fleet" className="lp-content-section dark-alt">
        <div className="section-head-center">
          <div className="section-eyebrow">
            <Plane size={14} />
            <span>MODERN AEROSPACE FLEET 🛫</span>
          </div>
          <h2 className="section-title">Engineered For Supersonic Comfort</h2>
          <p className="section-subtitle">
            Travel aboard the world's most advanced, eco-efficient widebody commercial aircraft and suborbital cruisers.
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
                  <span className="spec-val text-cyan">{plane.speed}</span>
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

      {/* ── SECTION: CABIN SANCTUARIES ── */}
      <section id="sec-cabins" className="lp-content-section">
        <div className="section-head-center">
          <div className="section-eyebrow">
            <Award size={14} />
            <span>EXQUISITE TRAVEL EXPERIENCES</span>
          </div>
          <h2 className="section-title">Choose Your Sky Sanctuary</h2>
          <p className="section-subtitle">
            Every ticket includes high-speed satellite Wi-Fi, fine dining, and smart luggage allowance.
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

      {/* ── FINAL LAUNCH BANNER ── */}
      <section className="lp-final-launch-banner">
        <div className="launch-glow-bg" />
        <div className="launch-inner-card">
          <div className="launch-badge">
            <Plane size={16} />
            <span>READY FOR DEPARTURE</span>
          </div>
          <h2 className="launch-title">The Future of Flight Awaits.</h2>
          <p className="launch-sub">
            Compare 500+ airlines, choose your exact seat on interactive 3D seatmaps, 
            and generate your instant digital boarding pass with zero booking fees.
          </p>
          <div className="launch-btn-row">
            <button className="launch-primary-btn" onClick={() => onEnter()}>
              <Plane size={20} />
              <span>Launch Booking App</span>
            </button>
            <button className="launch-secondary-btn" onClick={() => setShowHoloTicket(true)}>
              <QrCode size={18} />
              <span>Preview Holographic Ticket</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-mini-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-brand">AEROLUX GLOBAL AIRWAYS</span>
            <span className="footer-copy">© 2026 AeroLux Technologies Inc. The Future of Booking 🧳 🛫</span>
          </div>
          <div className="footer-right">
            <span>Satellite Telemetry</span>
            <span>Smart Luggage Network</span>
            <span>Aviation Security</span>
          </div>
        </div>
      </footer>

      {/* ── 3D HOLOGRAPHIC BOARDING PASS MODAL ── */}
      {showHoloTicket && (
        <div className="holo-modal-backdrop" onClick={() => setShowHoloTicket(false)}>
          <div 
            className="holo-ticket-container" 
            onClick={(e) => e.stopPropagation()}
            onMouseMove={handleTicketMouseMove}
            onMouseLeave={handleTicketMouseLeave}
            style={{
              transform: `perspective(1200px) rotateX(${ticketTilt.x}deg) rotateY(${ticketTilt.y}deg)`,
            }}
          >
            <button 
              className="holo-close-btn"
              onClick={() => setShowHoloTicket(false)}
            >
              <X size={18} />
            </button>

            {/* Shimmer holographic overlay */}
            <div className="holo-shimmer-layer" />

            <div className="ticket-header-band">
              <div className="ticket-brand">
                <Plane size={20} className="text-cyan" />
                <span>AEROLUX GLOBAL PASS</span>
              </div>
              <span className="ticket-class-tag">ORBITAL FIRST CLASS</span>
            </div>

            <div className="ticket-route-block">
              <div className="ticket-airport-node">
                <span className="code">{fromCode}</span>
                <span className="city">{GLOBAL_HUBS.find(h => h.code === fromCode)?.city || 'New York'}</span>
              </div>
              <div className="ticket-flight-icon">
                <span className="flight-number">AL-202</span>
                <div className="dashed-path">
                  <Plane size={16} className="path-plane" />
                </div>
                <span className="speed-badge">⚡ MACH 1.8</span>
              </div>
              <div className="ticket-airport-node right">
                <span className="code">{toCode}</span>
                <span className="city">{GLOBAL_HUBS.find(h => h.code === toCode)?.city || 'Dubai'}</span>
              </div>
            </div>

            <div className="ticket-details-grid">
              <div className="detail-item">
                <span className="label">PASSENGER</span>
                <span className="value">ALEXANDER VANCE</span>
              </div>
              <div className="detail-item">
                <span className="label">DATE</span>
                <span className="value">{departureDate}</span>
              </div>
              <div className="detail-item">
                <span className="label">SEAT</span>
                <span className="value seat-val">02A (WINDOW POD)</span>
              </div>
              <div className="detail-item">
                <span className="label">GATE</span>
                <span className="value">B-14 (PRIORITY)</span>
              </div>
              <div className="detail-item">
                <span className="label">SMART LUGGAGE 🧳</span>
                <span className="value text-cyan">TAG #AL-8829-DXB</span>
              </div>
              <div className="detail-item">
                <span className="label">BOARDING TIME</span>
                <span className="value">14:20 LOCAL</span>
              </div>
            </div>

            <div className="ticket-barcode-section">
              <div className="simulated-barcode" />
              <div className="ticket-qr-block">
                <QrCode size={56} className="ticket-qr" />
              </div>
            </div>

            <div className="ticket-cta-row">
              <button 
                type="button" 
                className="ticket-book-now-btn"
                onClick={() => {
                  setShowHoloTicket(false);
                  onEnter({ from: fromCode, to: toCode, date: departureDate });
                }}
              >
                <span>Book This Seat & Route</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
