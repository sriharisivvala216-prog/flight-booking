import React, { useState, useEffect, useCallback } from 'react';
import { Plane, Radio, Clock, Compass, Search, MapPin, Gauge, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

const FlightStatus = () => {
  const [query, setQuery] = useState('EK-202');
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = useCallback(async (flightNum) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.trackFlightStatus(flightNum);
      setStatusData(data);
    } catch (err) {
      setError(err.message || 'Flight not found in live tracking radar.');
      setStatusData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus('EK-202');
  }, [fetchStatus]);


  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchStatus(query.trim());
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>Live Flight Tracker & Status</h1>
        <p style={{ color: '#64748b' }}>
          Real-time aircraft radar positions, departure/arrival schedules, gates, and luggage baggage claim.
        </p>
      </div>

      {/* Search Input Bar */}
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--slate-200)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: 32
        }}
      >
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter flight number (e.g. EK-202, QR-704, BA-178, SQ-25)"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              style={{ fontSize: '1.05rem', textTransform: 'uppercase' }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            <Search size={18} />
            Track Flight
          </button>
        </form>

        <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Try Live Flights:</span>
          {['EK-202', 'QR-704', 'BA-178', 'SQ-25', 'DL-450', 'AI-102'].map((f) => (
            <button
              key={f}
              type="button"
              className="quick-route-chip"
              style={{ background: '#f1f5f9', color: '#334155', borderColor: '#cbd5e1' }}
              onClick={() => {
                setQuery(f);
                fetchStatus(f);
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="auth-error-msg" style={{ marginBottom: 24 }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p>Contacting air traffic radar networks...</p>
        </div>
      )}

      {statusData && !loading && (
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--slate-200)',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden'
          }}
        >
          {/* Header banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #070d1e 0%, #0d1b2a 100%)',
              color: 'white',
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="badge badge-success">● LIVE RADAR</span>
                <span style={{ color: '#00e5ff', fontWeight: 700 }}>
                  {statusData.flight.airline}
                </span>
              </div>
              <h2 style={{ fontSize: '1.8rem', color: 'white', marginTop: 4 }}>
                {statusData.flight.flightNumber} • {statusData.flight.aircraft}
              </h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>STATUS</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8' }}>
                {statusData.liveStatus.status}
              </div>
            </div>
          </div>

          {/* Progress Tracker Bar */}
          <div style={{ padding: '32px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16
              }}
            >
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{statusData.flight.from}</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  {statusData.flight.fromCity}
                </div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>
                  Dept: {statusData.flight.departureTime}
                </div>
              </div>

              <div style={{ flex: 1, margin: '0 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 8 }}>
                  Duration: {statusData.flight.duration}
                </div>
                <div
                  style={{
                    height: 8,
                    background: '#e2e8f0',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${statusData.liveStatus.progressPercent}%`,
                      background: 'linear-gradient(90deg, #3b82f6, #00e5ff)',
                      borderRadius: 4
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: -10,
                      left: `calc(${statusData.liveStatus.progressPercent}% - 14px)`,
                      background: '#2563eb',
                      color: 'white',
                      padding: 4,
                      borderRadius: '50%',
                      boxShadow: '0 0 10px rgba(37,99,235,0.6)'
                    }}
                  >
                    <Plane size={16} />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: '#2563eb',
                    fontWeight: 700,
                    marginTop: 10
                  }}
                >
                  {statusData.liveStatus.progressPercent}% Journey Completed
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{statusData.flight.to}</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  {statusData.flight.toCity}
                </div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>
                  Arr: {statusData.flight.arrivalTime}
                </div>
              </div>
            </div>

            {/* Telemetry Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                marginTop: 32,
                padding: '20px',
                background: '#f8fafc',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div>
                <div className="ticket-label">Cruising Altitude</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {statusData.liveStatus.altitude}
                </div>
              </div>
              <div>
                <div className="ticket-label">Ground Speed</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {statusData.liveStatus.groundSpeed}
                </div>
              </div>
              <div>
                <div className="ticket-label">Terminal / Gate</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  Term {statusData.flight.terminal} • Gate {statusData.flight.gate}
                </div>
              </div>
              <div>
                <div className="ticket-label">Baggage Claim</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#16a34a' }}>
                  {statusData.liveStatus.baggageBelt}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightStatus;
