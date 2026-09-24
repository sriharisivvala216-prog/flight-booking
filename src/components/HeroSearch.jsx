import React, { useState, useEffect, useRef } from 'react';
import { 
  Plane, 
  Calendar, 
  Users, 
  ArrowRightLeft, 
  Search, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Wifi, 
  Coffee, 
  Tv, 
  CheckCircle2, 
  TrendingUp, 
  Navigation,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/hero.css';

const HERO_FEATURED_FLIGHTS = [
  {
    from: 'JFK',
    fromCity: 'New York',
    to: 'DXB',
    toCity: 'Dubai',
    airline: 'Emirates',
    flightNumber: 'EK-202',
    aircraft: 'Airbus A380',
    duration: '12h 45m',
    stops: 'Nonstop',
    basePrice: 510,
    tag: '⚡ Popular Route',
    tagColor: '#00e5ff'
  },
  {
    from: 'LHR',
    fromCity: 'London',
    to: 'SIN',
    toCity: 'Singapore',
    airline: 'Singapore Airlines',
    flightNumber: 'SQ-317',
    aircraft: 'Airbus A350',
    duration: '13h 05m',
    stops: 'Nonstop',
    basePrice: 750,
    tag: '🌟 5-Star Rated',
    tagColor: '#f59e0b'
  },
  {
    from: 'SFO',
    fromCity: 'San Francisco',
    to: 'HND',
    toCity: 'Tokyo',
    airline: 'All Nippon Airways',
    flightNumber: 'NH-107',
    aircraft: 'Boeing 787-9',
    duration: '11h 20m',
    stops: 'Nonstop',
    basePrice: 530,
    tag: '🔥 Best Deal',
    tagColor: '#10b981'
  },
  {
    from: 'DEL',
    fromCity: 'New Delhi',
    to: 'BOM',
    toCity: 'Mumbai',
    airline: 'Air India',
    flightNumber: 'AI-865',
    aircraft: 'Airbus A321neo',
    duration: '2h 15m',
    stops: 'Nonstop',
    basePrice: 85,
    tag: '⚡ Express Flight',
    tagColor: '#6366f1'
  }
];

const HeroSearch = ({ onSearch, initialParams }) => {
  const { formatPrice } = useCurrency();
  const [tripType, setTripType] = useState('one-way');
  const [airports, setAirports] = useState([]);
  
  // Search parameters
  const [fromCode, setFromCode] = useState(initialParams?.from || 'JFK');
  const [toCode, setToCode] = useState(initialParams?.to || 'DXB');
  const [departureDate, setDepartureDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 14);
    return nextWeek.toISOString().split('T')[0];
  });
  const [cabinClass, setCabinClass] = useState(initialParams?.cabinClass || 'economy');
  const [passengers, setPassengers] = useState(1);
  const [directOnly, setDirectOnly] = useState(false);

  // Dropdown UI states
  const [fromSearchQuery, setFromSearchQuery] = useState('');
  const [toSearchQuery, setToSearchQuery] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromRef = useRef(null);
  const toRef = useRef(null);

  useEffect(() => {
    const loadAirports = async () => {
      try {
        const data = await api.getAirports();
        setAirports(data.airports || []);
      } catch (err) {
        console.error('Failed to load airports', err);
      }
    };
    loadAirports();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(e.target)) {
        setShowToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAirport = (code) => airports.find((a) => a.code === code);

  const handleSwapAirports = (e) => {
    e.stopPropagation();
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    onSearch({
      from: fromCode,
      to: toCode,
      date: departureDate,
      returnDate: tripType === 'round-trip' ? returnDate : null,
      cabinClass,
      passengers,
      stops: directOnly ? '0' : ''
    });
  };

  const handleSelectFeaturedDeal = (deal) => {
    setFromCode(deal.from);
    setToCode(deal.to);
    onSearch({
      from: deal.from,
      to: deal.to,
      date: departureDate,
      returnDate: tripType === 'round-trip' ? returnDate : null,
      cabinClass,
      passengers,
      stops: ''
    });
  };

  const handleQuickRoute = (from, to) => {
    setFromCode(from);
    setToCode(to);
    onSearch({
      from,
      to,
      date: departureDate,
      returnDate: tripType === 'round-trip' ? returnDate : null,
      cabinClass,
      passengers,
      stops: ''
    });
  };

  const filteredFromAirports = airports.filter((a) =>
    a.city.toLowerCase().includes(fromSearchQuery.toLowerCase()) ||
    a.code.toLowerCase().includes(fromSearchQuery.toLowerCase()) ||
    a.name.toLowerCase().includes(fromSearchQuery.toLowerCase())
  );

  const filteredToAirports = airports.filter((a) =>
    a.city.toLowerCase().includes(toSearchQuery.toLowerCase()) ||
    a.code.toLowerCase().includes(toSearchQuery.toLowerCase()) ||
    a.name.toLowerCase().includes(toSearchQuery.toLowerCase())
  );

  const currentFrom = getAirport(fromCode) || { code: fromCode, city: 'New York', country: 'United States' };
  const currentTo = getAirport(toCode) || { code: toCode, city: 'Dubai', country: 'United Arab Emirates' };

  return (
    <section className="hero-wrapper">
      {/* Background Image & Visual Layers */}
      <div className="hero-bg-layer" />
      <div className="hero-overlay-gradient" />
      <div className="hero-ambient-glow" />

      {/* Animated Flight Path Route in the Sky */}
      <div className="hero-flight-animation-track" aria-hidden="true">
        <svg className="flight-path-svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            d="M -100,240 C 350,20 800,280 1540,60"
            fill="none"
            stroke="rgba(0, 229, 255, 0.28)"
            strokeWidth="2.5"
            strokeDasharray="8 8"
          />
        </svg>
        <div className="flying-airplane-marker">
          <div className="airplane-beacon-pulse" />
          <Plane size={24} className="flight-icon-jet" />
          <div className="flight-jet-contrail" />
        </div>
      </div>

      <div className="container hero-content-relative">
        {/* Top Live Ticker & Trust Bar */}
        <div className="hero-live-ticker">
          <div className="ticker-badge">
            <span className="live-radar-dot" />
            <span className="ticker-badge-text">LIVE FLIGHT RADAR</span>
          </div>
          <span className="ticker-divider">•</span>
          <span className="ticker-item">
            <strong>1,850+</strong> Active Global Flights Today
          </span>
          <span className="ticker-divider hidden-mobile">•</span>
          <span className="ticker-item hidden-mobile">
            <ShieldCheck size={14} className="inline-icon" /> 100% Verified Airline Partners
          </span>
          <span className="ticker-divider hidden-mobile">•</span>
          <span className="ticker-item hidden-mobile">
            <CheckCircle2 size={14} className="inline-icon" /> Zero Booking Surcharges
          </span>
        </div>

        {/* Main Hero Header Area: Headline & Live Aircraft Showcase */}
        <div className="hero-header-grid">
          <div className="hero-text-column">
            <div className="hero-badge-tag">
              <Sparkles size={14} />
              <span>PREMIER AIRLINE RESERVATIONS</span>
            </div>

            <h1 className="hero-title">
              Experience The Skies in <span className="gradient-text">Unrivaled Luxury</span>
            </h1>
            
            <p className="hero-subtitle">
              Book real-time commercial flights, select your personal cabin seats on interactive 3D maps,
              and receive instant digital boarding passes across 180+ global destinations.
            </p>

            <div className="hero-perks-pills">
              <div className="perk-pill">
                <CheckCircle2 size={15} color="#00e5ff" />
                <span>Live Interactive Seat Selection</span>
              </div>
              <div className="perk-pill">
                <CheckCircle2 size={15} color="#00e5ff" />
                <span>Instant Wallet Boarding Pass</span>
              </div>
              <div className="perk-pill">
                <CheckCircle2 size={15} color="#00e5ff" />
                <span>Free 24h Cancellation</span>
              </div>
            </div>
          </div>

          {/* Right Floating Live Flight Radar Card */}
          <div className="hero-live-radar-card">
            <div className="radar-card-glass">
              <div className="radar-header">
                <div className="radar-status-indicator">
                  <span className="radar-ping" />
                  <span className="radar-status-label">EN ROUTE FLIGHT STATUS</span>
                </div>
                <span className="radar-flight-no">SK-784</span>
              </div>

              <div className="radar-aircraft-preview">
                <div className="radar-route-display">
                  <div className="radar-city">
                    <span className="radar-code">JFK</span>
                    <span className="radar-city-name">New York</span>
                    <span className="radar-time">10:45 AM</span>
                  </div>

                  <div className="radar-flight-arc">
                    <div className="arc-line">
                      <div className="arc-progress-bar" />
                      <Plane size={18} className="plane-on-route" />
                    </div>
                    <span className="arc-duration">12h 45m Nonstop</span>
                  </div>

                  <div className="radar-city text-right">
                    <span className="radar-code">DXB</span>
                    <span className="radar-city-name">Dubai</span>
                    <span className="radar-time">07:30 AM +1</span>
                  </div>
                </div>
              </div>

              <div className="radar-meta-row">
                <div className="radar-meta-item">
                  <span className="meta-label">Aircraft</span>
                  <span className="meta-val">Boeing 787-9 Dreamliner</span>
                </div>
                <div className="radar-meta-item">
                  <span className="meta-label">Altitude</span>
                  <span className="meta-val">38,000 FT</span>
                </div>
                <div className="radar-meta-item">
                  <span className="meta-label">Speed</span>
                  <span className="meta-val">560 MPH</span>
                </div>
              </div>

              <div className="radar-amenities">
                <span className="amenity-tag"><Wifi size={12} /> High-Speed WiFi</span>
                <span className="amenity-tag"><Tv size={12} /> 4K In-Flight Media</span>
                <span className="amenity-tag"><Coffee size={12} /> Chef Dining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Search Engine Card */}
        <div className="search-card">
          {/* Top Options Bar */}
          <div className="search-top-bar">
            {/* Trip Type */}
            <div className="trip-type-selector">
              <button
                type="button"
                className={`trip-type-btn ${tripType === 'one-way' ? 'active' : ''}`}
                onClick={() => setTripType('one-way')}
              >
                <Navigation size={14} className="btn-icon" />
                One Way
              </button>
              <button
                type="button"
                className={`trip-type-btn ${tripType === 'round-trip' ? 'active' : ''}`}
                onClick={() => setTripType('round-trip')}
              >
                <ArrowRightLeft size={14} className="btn-icon" />
                Round Trip
              </button>
            </div>

            {/* Direct Only Checkbox & Cabin & Passenger pickers */}
            <div className="search-options-group">
              <label className="direct-flight-toggle">
                <input
                  type="checkbox"
                  checked={directOnly}
                  onChange={(e) => setDirectOnly(e.target.checked)}
                />
                <span>Direct Flights Only</span>
              </label>

              <div className="select-wrapper">
                <select
                  className="select-pill"
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  aria-label="Cabin Class"
                >
                  <option value="economy">Economy Class</option>
                  <option value="premium_economy">Premium Economy</option>
                  <option value="business">Business Class</option>
                  <option value="first">First Class Suite</option>
                </select>
                <ChevronDown size={14} className="select-chevron" />
              </div>

              <div className="select-wrapper">
                <select
                  className="select-pill"
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value, 10))}
                  aria-label="Number of Passengers"
                >
                  <option value={1}>1 Adult Passenger</option>
                  <option value={2}>2 Adult Passengers</option>
                  <option value={3}>3 Passengers</option>
                  <option value={4}>4 Passengers</option>
                  <option value={5}>5 Passengers</option>
                </select>
                <ChevronDown size={14} className="select-chevron" />
              </div>
            </div>
          </div>

          {/* Search Inputs Form */}
          <form onSubmit={handleSearchSubmit} className="search-inputs-grid">
            {/* Origin Airport */}
            <div
              className="search-input-box"
              ref={fromRef}
              onClick={() => setShowFromDropdown(true)}
            >
              <div className="input-label-mini">
                <MapPin size={13} className="label-icon" />
                <span>FROM / ORIGIN</span>
              </div>
              <div className="input-airport-display">
                <span className="airport-iata-badge">{currentFrom.code}</span>
                <span className="airport-city-text">{currentFrom.city}</span>
              </div>
              <div className="input-sub-val">{currentFrom.name || currentFrom.country}</div>

              {showFromDropdown && (
                <div className="airport-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown-search-header">
                    <input
                      type="text"
                      placeholder="Search city, code or airport..."
                      value={fromSearchQuery}
                      onChange={(e) => setFromSearchQuery(e.target.value)}
                      className="form-input dropdown-input"
                      autoFocus
                    />
                  </div>
                  <div className="dropdown-items-scroll">
                    {filteredFromAirports.map((airport) => (
                      <div
                        key={airport.code}
                        className="airport-dropdown-item"
                        onClick={() => {
                          setFromCode(airport.code);
                          setShowFromDropdown(false);
                          setFromSearchQuery('');
                        }}
                      >
                        <div className="item-city-name">
                          <strong>{airport.city}</strong>
                          <div className="item-airport-name">{airport.name}</div>
                        </div>
                        <span className="airport-code-tag">{airport.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Swap Button */}
            <button
              type="button"
              className="swap-btn"
              onClick={handleSwapAirports}
              title="Swap origin & destination"
              aria-label="Swap origin & destination"
            >
              <ArrowRightLeft size={16} />
            </button>

            {/* Destination Airport */}
            <div
              className="search-input-box"
              ref={toRef}
              onClick={() => setShowToDropdown(true)}
            >
              <div className="input-label-mini">
                <MapPin size={13} className="label-icon" />
                <span>TO / DESTINATION</span>
              </div>
              <div className="input-airport-display">
                <span className="airport-iata-badge destination-badge">{currentTo.code}</span>
                <span className="airport-city-text">{currentTo.city}</span>
              </div>
              <div className="input-sub-val">{currentTo.name || currentTo.country}</div>

              {showToDropdown && (
                <div className="airport-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown-search-header">
                    <input
                      type="text"
                      placeholder="Search city, code or airport..."
                      value={toSearchQuery}
                      onChange={(e) => setToSearchQuery(e.target.value)}
                      className="form-input dropdown-input"
                      autoFocus
                    />
                  </div>
                  <div className="dropdown-items-scroll">
                    {filteredToAirports.map((airport) => (
                      <div
                        key={airport.code}
                        className="airport-dropdown-item"
                        onClick={() => {
                          setToCode(airport.code);
                          setShowToDropdown(false);
                          setToSearchQuery('');
                        }}
                      >
                        <div className="item-city-name">
                          <strong>{airport.city}</strong>
                          <div className="item-airport-name">{airport.name}</div>
                        </div>
                        <span className="airport-code-tag">{airport.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Departure Date */}
            <div className="search-input-box date-box">
              <label htmlFor="departure-date" className="input-label-mini">
                <Calendar size={13} className="label-icon" />
                <span>DEPARTURE DATE</span>
              </label>
              <input
                id="departure-date"
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="input-date-val"
                required
              />
              <div className="input-sub-val">Scheduled flight date</div>
            </div>

            {/* Return Date (if round-trip) */}
            {tripType === 'round-trip' ? (
              <div className="search-input-box date-box">
                <label htmlFor="return-date" className="input-label-mini">
                  <Calendar size={13} className="label-icon" />
                  <span>RETURN DATE</span>
                </label>
                <input
                  id="return-date"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="input-date-val"
                  required
                />
                <div className="input-sub-val">Round-trip return</div>
              </div>
            ) : null}

            {/* Search Submit Button */}
            <button type="submit" className="search-submit-btn">
              <span className="btn-shine" />
              <Search size={20} />
              <span>Search Flights</span>
            </button>
          </form>

          {/* Quick Route Shortcuts */}
          <div className="quick-routes">
            <span className="quick-route-label">
              <TrendingUp size={14} className="inline-icon" /> Popular Direct Routes:
            </span>
            <button
              type="button"
              className="quick-route-chip"
              onClick={() => handleQuickRoute('JFK', 'DXB')}
            >
              <Plane size={12} className="chip-plane" />
              New York ⇄ Dubai
            </button>
            <button
              type="button"
              className="quick-route-chip"
              onClick={() => handleQuickRoute('LHR', 'SIN')}
            >
              <Plane size={12} className="chip-plane" />
              London ⇄ Singapore
            </button>
            <button
              type="button"
              className="quick-route-chip"
              onClick={() => handleQuickRoute('DEL', 'BOM')}
            >
              <Plane size={12} className="chip-plane" />
              New Delhi ⇄ Mumbai
            </button>
            <button
              type="button"
              className="quick-route-chip"
              onClick={() => handleQuickRoute('SFO', 'HND')}
            >
              <Plane size={12} className="chip-plane" />
              San Francisco ⇄ Tokyo
            </button>
          </div>
        </div>

        {/* Live Featured Flights Showcase Section */}
        <div className="hero-featured-flights-section">
          <div className="featured-flights-header">
            <div>
              <h3 className="featured-section-title">
                <Sparkles size={16} color="#00e5ff" />
                Featured Non-Stop Flight Deals
              </h3>
              <p className="featured-section-subtitle">
                Exclusive rates on premier wide-body international aircraft. Click to compare real-time seats.
              </p>
            </div>
            <div className="verified-badge-row">
              <span className="verified-dot" />
              <span>Real-Time Pricing & Live Inventory</span>
            </div>
          </div>

          <div className="featured-flights-grid">
            {HERO_FEATURED_FLIGHTS.map((flight) => (
              <div 
                key={flight.flightNumber}
                className="featured-flight-card"
                onClick={() => handleSelectFeaturedDeal(flight)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSelectFeaturedDeal(flight); }}
              >
                <div className="featured-card-top">
                  <div className="airline-info">
                    <span className="flight-airline-name">{flight.airline}</span>
                    <span className="flight-no-tag">{flight.flightNumber} • {flight.aircraft}</span>
                  </div>
                  <span className="featured-tag" style={{ color: flight.tagColor, borderColor: `${flight.tagColor}40`, background: `${flight.tagColor}15` }}>
                    {flight.tag}
                  </span>
                </div>

                <div className="featured-route-row">
                  <div className="route-endpoint">
                    <span className="route-code">{flight.from}</span>
                    <span className="route-city">{flight.fromCity}</span>
                  </div>

                  <div className="route-path-visual">
                    <span className="route-time">{flight.duration}</span>
                    <div className="route-line">
                      <div className="route-line-bar" />
                      <Plane size={14} className="route-line-plane" />
                    </div>
                    <span className="route-stops">{flight.stops}</span>
                  </div>

                  <div className="route-endpoint text-right">
                    <span className="route-code">{flight.to}</span>
                    <span className="route-city">{flight.toCity}</span>
                  </div>
                </div>

                <div className="featured-card-footer">
                  <div className="featured-price-group">
                    <span className="price-label">Starting from</span>
                    <span className="price-amount">{formatPrice(flight.basePrice)}</span>
                  </div>
                  <button type="button" className="featured-book-btn">
                    Select Flight ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Features Guarantee Ribbon */}
        <div className="hero-features-ribbon">
          <div className="feature-ribbon-item">
            <div className="feature-icon-wrapper">
              <Users size={22} color="#00e5ff" />
            </div>
            <div>
              <h4 className="feature-item-title">Interactive 3D Seat Map</h4>
              <p className="feature-item-desc">Select exact window, aisle, or extra legroom seats in real-time.</p>
            </div>
          </div>

          <div className="feature-ribbon-item">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={22} color="#60a5fa" />
            </div>
            <div>
              <h4 className="feature-item-title">Digital Boarding Passes</h4>
              <p className="feature-item-desc">Instant scannable QR e-tickets compatible with Apple and Google Wallet.</p>
            </div>
          </div>

          <div className="feature-ribbon-item">
            <div className="feature-icon-wrapper">
              <Clock size={22} color="#34d399" />
            </div>
            <div>
              <h4 className="feature-item-title">Live Gate & Flight Radar</h4>
              <p className="feature-item-desc">Track real-time flight telemetry, terminal gates, and weather conditions.</p>
            </div>
          </div>

          <div className="feature-ribbon-item">
            <div className="feature-icon-wrapper">
              <CheckCircle2 size={22} color="#f59e0b" />
            </div>
            <div>
              <h4 className="feature-item-title">Zero Hidden Surcharges</h4>
              <p className="feature-item-desc">Transparent pricing with all airport taxes and baggage rules included upfront.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
