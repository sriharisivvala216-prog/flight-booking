import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  UserCheck,
  Shield,
  Eye,
  EyeOff,
  Check,
  Award,
  Globe,
  Lock,
  Plane,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/modal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [title, setTitle] = useState('Mr');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('United States');
  const [passportNumber, setPassportNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsRegister(initialMode === 'register');
      setError('');
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Required', color: '#94a3b8' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, text: 'Weak', color: '#ef4444' };
      case 2:
        return { score: 2, text: 'Moderate', color: '#f59e0b' };
      case 3:
        return { score: 3, text: 'Good', color: '#0284c7' };
      case 4:
        return { score: 4, text: 'Strong (Recommended)', color: '#16a34a' };
      default:
        return { score: 0, text: 'Too short', color: '#ef4444' };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister && !agreeTerms) {
      setError('Please agree to SkyWings Carriage Terms and IATA Passenger Guidelines to create an account.');
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
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(role);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Club Emblem Brand Header */}
        <div className="auth-header">
          <div className="auth-club-emblem">
            <Plane size={24} className="club-emblem-plane" />
          </div>
          <div className="auth-club-badge">
            <Sparkles size={13} />
            <span>SKYWINGS PRIVILEGE CLUB</span>
          </div>
          <h2>{isRegister ? 'Join Frequent Flyer Club' : 'Sign In to Your Account'}</h2>
          <p>
            {isRegister
              ? 'Unlock 5,000 welcome miles, fast-track boarding, and special member airfares.'
              : 'Access your electronic tickets, live flight status, and saved travel profiles.'}
          </p>
        </div>

        {/* Quick Demo 1-Click Login Box */}
        <div className="demo-login-box">
          <div className="demo-login-title">
            <Sparkles size={14} />
            Instant 1-Click Verification Access
          </div>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemo('passenger')}
              disabled={loading}
              title="Sign in as verified passenger with active bookings"
            >
              <UserCheck size={14} style={{ display: 'inline', marginRight: 4 }} />
              Demo Traveler (Gold Tier)
            </button>
            <button
              type="button"
              className="demo-btn admin-demo"
              onClick={() => handleDemo('admin')}
              disabled={loading}
              title="Sign in as Operations Controller with fleet access"
            >
              <Shield size={14} style={{ display: 'inline', marginRight: 4 }} />
              Demo Flight Commander
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
          >
            Sign In to SkyWings
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
          >
            Create New Account
          </button>
        </div>

        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <>
              {/* Title & Name in responsive flex row */}
              <div className="form-row-duo">
                <div className="form-group" style={{ flex: '0 0 90px' }}>
                  <label>Title</label>
                  <select
                    className="form-input"
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

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Full Legal Name (as on Passport)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Alex Harrison Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. alex.morgan@aviation.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password</label>
              {!isRegister && (
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset instructions will be sent to your verified email.');
                  }}
                  className="forgot-password-link"
                >
                  Forgot Password?
                </a>
              )}
            </div>

            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input password-field"
                placeholder={isRegister ? 'Create secure password' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Real-time Password Strength Meter */}
            {isRegister && password && (
              <div className="password-strength-box">
                <div className="strength-bar-track">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className="strength-step"
                      style={{
                        background: step <= strength.score ? strength.color : '#e2e8f0'
                      }}
                    />
                  ))}
                </div>
                <div className="strength-label-text">
                  Security Level: <strong style={{ color: strength.color }}>{strength.text}</strong>
                </div>
              </div>
            )}
          </div>

          {isRegister && (
            <>
              <div className="form-row-duo">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Nationality / Citizenship</label>
                  <select
                    className="form-input"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Japan">Japan</option>
                    <option value="India">India</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Passport / ID (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. A98234512"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mobile Number (For Flight SMS Gate Alerts)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <label className="terms-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>
                  I accept the <strong>SkyWings Conditions of Carriage</strong>, IATA Aviation Security protocols, and consent to earn 5,000 welcome frequent flyer miles.
                </span>
              </label>
            </>
          )}

          {!isRegister && (
            <label className="terms-checkbox-label" style={{ marginTop: -4 }}>
              <input type="checkbox" defaultChecked />
              <span>Remember this browser for 30 days</span>
            </label>
          )}

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              'Authenticating with Global Radar...'
            ) : isRegister ? (
              <>
                <span>Complete Registration & Claim Miles</span>
                <ChevronRight size={17} />
              </>
            ) : (
              <>
                <span>Sign In to Flight Portal</span>
                <ChevronRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Security & Aviation Compliance Strip */}
        <div className="auth-security-footer">
          <div className="security-item">
            <Lock size={12} color="#16a34a" />
            <span>256-Bit TLS Bank Encryption</span>
          </div>
          <div className="security-item">
            <Shield size={12} color="#0284c7" />
            <span>IATA Airline Partner</span>
          </div>
          <div className="security-item">
            <Globe size={12} color="#f59e0b" />
            <span>Zero Booking Fees</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
