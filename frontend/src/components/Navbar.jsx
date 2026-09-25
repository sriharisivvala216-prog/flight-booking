import React, { useState } from 'react';
import { 
  Plane, 
  Calendar, 
  User, 
  LogOut, 
  Radio, 
  Compass, 
  BarChart3, 
  Globe, 
  ChevronDown, 
  Sparkles, 
  LogIn, 
  Menu, 
  X,
  Shield,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/navbar.css';

const Navbar = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { currency, setCurrency, currencies } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const handleAuthClick = (mode = 'login') => {
    if (typeof onOpenAuth === 'function') {
      onOpenAuth(mode);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo Button */}
        <div 
          className="nav-brand" 
          onClick={() => handleNavClick('search')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') handleNavClick('search'); }}
        >
          <div className="brand-icon-wrapper">
            <Plane size={24} className="brand-plane-icon" strokeWidth={2.4} />
            <span className="brand-beacon-dot" />
          </div>
          <div className="brand-text-group">
            <span className="brand-name">SkyWings</span>
            <span className="brand-tag">AERO LUXURY</span>
          </div>
        </div>

        {/* Desktop Navigation Links Capsule */}
        <nav className="nav-links-capsule">
          <button
            type="button"
            className={`nav-item-btn ${currentTab === 'search' ? 'active' : ''}`}
            onClick={() => handleNavClick('search')}
          >
            <Compass size={17} className="nav-icon" />
            <span>Find Flights</span>
            {currentTab === 'search' && <span className="active-glow-indicator" />}
          </button>

          <button
            type="button"
            className={`nav-item-btn ${currentTab === 'bookings' ? 'active' : ''}`}
            onClick={() => handleNavClick('bookings')}
          >
            <Calendar size={17} className="nav-icon" />
            <span>My Bookings</span>
            {currentTab === 'bookings' && <span className="active-glow-indicator" />}
          </button>

          <button
            type="button"
            className={`nav-item-btn ${currentTab === 'status' ? 'active' : ''}`}
            onClick={() => handleNavClick('status')}
          >
            <Radio size={17} className="nav-icon" />
            <span>Flight Radar</span>
            <span className="live-status-pill">
              <span className="live-ping-dot" />
              LIVE
            </span>
            {currentTab === 'status' && <span className="active-glow-indicator" />}
          </button>

          <button
            type="button"
            className={`nav-item-btn ${currentTab === 'admin' ? 'active' : ''}`}
            onClick={() => handleNavClick('admin')}
          >
            <BarChart3 size={17} className="nav-icon" />
            <span>Admin Portal</span>
            {isAdmin && <Shield size={13} className="admin-shield-icon" />}
            {currentTab === 'admin' && <span className="active-glow-indicator" />}
          </button>
        </nav>

        {/* Right Actions: Currency Selector & Auth Buttons */}
        <div className="nav-actions">
          {/* Currency Pill Switcher */}
          <div className="currency-pill-container">
            <Globe size={15} className="currency-globe-icon" />
            <select
              className="currency-select"
              value={currency}
              aria-label="Select Currency"
              onChange={(e) => setCurrency(e.target.value)}
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c} {c === 'USD' ? '($)' : c === 'EUR' ? '(€)' : c === 'GBP' ? '(£)' : '(₹)'}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="currency-chevron-icon" />
          </div>

          {/* User Auth Buttons */}
          {isAuthenticated ? (
            <div className="user-profile-pill">
              <div className="user-avatar-ring">
                <div className="user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <div className="user-info-text">
                <span className="user-display-name">
                  {user?.name?.split(' ')[0] || 'Passenger'}
                </span>
                <span className={`user-role-badge ${isAdmin ? 'admin-role' : 'passenger-role'}`}>
                  {isAdmin ? 'ADMIN' : 'VIP FLYER'}
                </span>
              </div>
              <button
                type="button"
                id="navbar-signout-btn"
                className="logout-nav-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  logout();
                }}
                title="Sign Out of SkyWings"
                aria-label="Sign Out"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons-group">
              <button 
                type="button" 
                id="navbar-signin-btn"
                className="signin-nav-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAuthClick('login');
                }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>

              <button 
                type="button" 
                id="navbar-join-btn"
                className="join-nav-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAuthClick('register');
                }}
              >
                <span className="join-btn-shine" />
                <Sparkles size={15} className="join-icon" />
                <span>Join SkyWings</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'drawer-open' : 'drawer-closed'}`}>
          <div className="mobile-nav-items">
            <button
              type="button"
              className={`mobile-nav-btn ${currentTab === 'search' ? 'active' : ''}`}
              onClick={() => handleNavClick('search')}
            >
              <Compass size={18} />
              <span>Find Flights</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-btn ${currentTab === 'bookings' ? 'active' : ''}`}
              onClick={() => handleNavClick('bookings')}
            >
              <Calendar size={18} />
              <span>My Bookings</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-btn ${currentTab === 'status' ? 'active' : ''}`}
              onClick={() => handleNavClick('status')}
            >
              <Radio size={18} />
              <span>Flight Radar (Live)</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-btn ${currentTab === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin')}
            >
              <BarChart3 size={18} />
              <span>Admin Portal</span>
            </button>
          </div>

          {!isAuthenticated ? (
            <div className="mobile-auth-actions">
              <button 
                type="button" 
                id="mobile-signin-btn"
                className="signin-nav-btn w-full" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAuthClick('login');
                }}
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
              <button 
                type="button" 
                id="mobile-join-btn"
                className="join-nav-btn w-full" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAuthClick('register');
                }}
              >
                <Sparkles size={16} />
                <span>Join SkyWings</span>
              </button>
            </div>
          ) : (
            <div className="mobile-auth-actions">
              <button 
                type="button" 
                id="mobile-signout-btn"
                className="logout-nav-btn w-full" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
    </header>
  );
};

export default Navbar;
