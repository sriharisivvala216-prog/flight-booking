import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Globe, 
  Shield, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  Luggage, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/authPage.css';

export default function SignInPage({ initialMode = 'login', onNavigate, onAuthSuccess }) {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('Mr');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('United States');
  const [passportNumber, setPassportNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  useEffect(() => {
    setIsRegister(initialMode === 'register');
    setError('');
  }, [initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister && !agreeTerms) {
      setError('Please agree to AeroLux Carriage Terms and IATA Passenger Guidelines to create an account.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const fullName = `${title} ${name}`.trim();
        await register({
          name: fullName,
          email,
          password,
          phone,
          nationality,
          passportNumber
        });
      } else {
        await login(email, password);
      }
      if (onAuthSuccess) {
        onAuthSuccess();
      } else if (onNavigate) {
        onNavigate('/flights');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (role) => {
    setLoading(true);
    setError('');
    try {
      await demoLogin(role);
      if (onAuthSuccess) {
        onAuthSuccess();
      } else if (onNavigate) {
        onNavigate('/flights');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      {/* Background Ambient Aerospace Atmosphere */}
      <div className="auth-page-backdrop" />
      <div className="auth-page-glow-mesh" />

      {/* Top Header Bar */}
      <header className="auth-page-header">
        <button 
          type="button" 
          className="auth-back-link"
          onClick={() => onNavigate ? onNavigate('/flights') : window.history.back()}
        >
          <ArrowLeft size={16} />
          <span>Back to Flights</span>
        </button>

        <div className="auth-brand" onClick={() => onNavigate && onNavigate('/')}>
          <div className="auth-brand-logo">
            <Plane size={20} className="brand-plane" />
          </div>
          <div className="auth-brand-text">
            <span className="brand-title">AERO<span className="accent">LUX</span></span>
            <span className="brand-sub">GLOBAL AIRWAYS</span>
          </div>
        </div>

        <button 
          type="button" 
          className="auth-top-switch-btn"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? 'Already have an account? Sign In' : 'New flyer? Join SkyWings'}
        </button>
      </header>

      {/* Main Container */}
      <main className="auth-page-container">
        <div className="auth-card-glass">
          {/* Card Tabs: Sign In / Register */}
          <div className="auth-mode-tabs">
            <button 
              type="button"
              className={`mode-tab ${!isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(false); setError(''); }}
            >
              <Lock size={15} />
              <span>Sign In</span>
            </button>
            <button 
              type="button"
              className={`mode-tab ${isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(true); setError(''); }}
            >
              <Sparkles size={15} />
              <span>Create Account</span>
            </button>
          </div>

          <div className="auth-header-text">
            <h1 className="auth-title">
              {isRegister ? 'Join AeroLux Executive Club' : 'Welcome Aboard'}
            </h1>
            <p className="auth-sub">
              {isRegister 
                ? 'Create your account to unlock 3D seat booking, smart luggage RFID telemetry, and priority boarding.'
                : 'Sign in to access your flight bookings, manage seats, and download boarding passes.'}
            </p>
          </div>

          {/* Quick 1-Click Demo Login Bar */}
          {!isRegister && (
            <div className="demo-accounts-strip">
              <span className="demo-strip-label">QUICK 1-CLICK ACCESS:</span>
              <div className="demo-btn-group">
                <button 
                  type="button" 
                  className="demo-pill-btn"
                  onClick={() => handleDemoSignIn('passenger')}
                  disabled={loading}
                >
                  <Plane size={13} className="text-cyan" />
                  <span>Passenger Demo</span>
                </button>
                <button 
                  type="button" 
                  className="demo-pill-btn admin"
                  onClick={() => handleDemoSignIn('admin')}
                  disabled={loading}
                >
                  <Shield size={13} className="text-amber" />
                  <span>Admin Demo</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="form-row-split">
                  <div className="form-group flex-shrink-0" style={{ width: '90px' }}>
                    <label className="form-label">TITLE</label>
                    <select 
                      className="form-select"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    >
                      <option value="Mr">Mr.</option>
                      <option value="Ms">Ms.</option>
                      <option value="Mrs">Mrs.</option>
                      <option value="Dr">Dr.</option>
                      <option value="Capt">Capt.</option>
                    </select>
                  </div>

                  <div className="form-group flex-1">
                    <label className="form-label">FULL LEGAL NAME</label>
                    <div className="input-wrapper">
                      <User size={16} className="input-icon" />
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="As shown on passport / ID"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row-split">
                  <div className="form-group flex-1">
                    <label className="form-label">PHONE NUMBER</label>
                    <div className="input-wrapper">
                      <Phone size={16} className="input-icon" />
                      <input 
                        type="tel"
                        className="form-input"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group flex-1">
                    <label className="form-label">NATIONALITY</label>
                    <div className="input-wrapper">
                      <Globe size={16} className="input-icon" />
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="Country of Citizenship"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">PASSPORT / GOV ID NUMBER (OPTIONAL)</label>
                  <div className="input-wrapper">
                    <Shield size={16} className="input-icon" />
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. A92831092 (For auto-biometric check-in)"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">EMAIL ADDRESS</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input 
                  type="email"
                  className="form-input"
                  placeholder="flyer@aerolux.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">PASSWORD</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <label className="terms-checkbox-label">
                <input 
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>I agree to the AeroLux General Conditions of Carriage and Smart Baggage RFID Guidelines.</span>
              </label>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span>Authenticating with Flight Satellite...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Complete Registration & Fly' : 'Sign In to SkyWings'}</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Perks Bar */}
          <div className="auth-benefits-strip">
            <div className="benefit-item">
              <CheckCircle2 size={14} className="text-cyan" />
              <span>Zero Booking Fees</span>
            </div>
            <div className="benefit-item">
              <Luggage size={14} className="text-cyan" />
              <span>Smart Baggage Sync 🧳</span>
            </div>
            <div className="benefit-item">
              <Sparkles size={14} className="text-cyan" />
              <span>3D Interactive Seatmap</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
