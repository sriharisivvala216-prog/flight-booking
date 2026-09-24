import React, { useState, useEffect } from 'react';
import { X, Sparkles, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/modal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRegister(initialMode === 'register');
      setError('');
    }
  }, [initialMode, isOpen]);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({ name, email, password, phone });
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

        <div className="auth-header">
          <h2>{isRegister ? 'Create Your Account' : 'Welcome to SkyWings'}</h2>
          <p>
            {isRegister
              ? 'Join millions of travelers booking seamless global flights'
              : 'Sign in to access your flight bookings, boarding passes, and rewards'}
          </p>
        </div>

        {/* Demo Fast Login Bar */}
        <div className="demo-login-box">
          <div className="demo-login-title">
            <Sparkles size={14} />
            Quick Demo 1-Click Login
          </div>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemo('passenger')}
              disabled={loading}
            >
              <UserCheck size={14} style={{ display: 'inline', marginRight: 4 }} />
              Demo Passenger
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemo('admin')}
              disabled={loading}
            >
              <Shield size={14} style={{ display: 'inline', marginRight: 4 }} />
              Demo Admin
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
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label>Full Legal Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter password (e.g. password123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Phone Number (Optional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In to SkyWings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
