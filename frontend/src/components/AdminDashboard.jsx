import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Ticket,
  Plane,
  Users,
  Plus,
  Trash2,
  CheckCircle,
  Shield,
  RefreshCw,
  X,
  Clock,
  Search,
  Filter,
  Activity,
  Layers,
  BarChart3,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Compass
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/dashboard.css';

const AdminDashboard = () => {
  const { isAdmin, demoLogin } = useAuth();
  const { formatPrice } = useCurrency();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddFlightModal, setShowAddFlightModal] = useState(false);
  const [activeTab, setActiveTab] = useState('flights'); // 'flights' | 'manifest' | 'fleet'
  const [flightSearchQuery, setFlightSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [utcTime, setUtcTime] = useState('');

  // Live Zulu / UTC clock for realistic operations center
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC • ZULU'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // New flight form state
  const [newFlight, setNewFlight] = useState({
    flightNumber: 'SW-900',
    airline: 'SkyWings Global',
    from: 'JFK',
    fromCity: 'New York',
    to: 'CDG',
    toCity: 'Paris',
    departureTime: '18:30',
    arrivalTime: '07:45',
    duration: '7h 15m',
    aircraft: 'Airbus A350-900',
    terminal: '4',
    gate: 'B22',
    basePrice: 590,
    availableSeats: 50
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleUpdateStatus = async (flightId, newStatus) => {
    try {
      await api.updateFlightStatus(flightId, { status: newStatus });
      loadStats();
    } catch (_err) {
      alert('Failed to update flight status');
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (!window.confirm('Are you sure you want to remove this flight schedule?')) return;
    try {
      await api.deleteFlight(flightId);
      loadStats();
    } catch (_err) {
      alert('Failed to delete flight');
    }
  };

  const handleAddFlightSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addFlight(newFlight);
      setShowAddFlightModal(false);
      loadStats();
    } catch (err) {
      alert(err.message || 'Failed to add flight');
    }
  };

  // Filter flights by search & status
  const filteredFlights = (stats?.flights || []).filter((f) => {
    const matchesSearch =
      f.flightNumber.toLowerCase().includes(flightSearchQuery.toLowerCase()) ||
      f.airline.toLowerCase().includes(flightSearchQuery.toLowerCase()) ||
      f.from.toLowerCase().includes(flightSearchQuery.toLowerCase()) ||
      f.to.toLowerCase().includes(flightSearchQuery.toLowerCase()) ||
      f.fromCity?.toLowerCase().includes(flightSearchQuery.toLowerCase()) ||
      f.toCity?.toLowerCase().includes(flightSearchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      f.status.toLowerCase().includes(statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Calculate live load factor
  const totalCapacity = (stats?.flights?.length || 1) * 50;
  const bookedSeats = stats?.metrics?.totalPassengers || 0;
  const loadFactor = Math.min(100, Math.round((bookedSeats / Math.max(1, totalCapacity)) * 100));

  return (
    <div className="container dashboard-page-container">
      {/* Real-Time Flight Operations Control Center Top Bar */}
      <div className="aocc-live-strip">
        <div className="aocc-left-cluster">
          <span className="live-radar-dot" />
          <span className="aocc-badge-label">AOCC FLIGHT OPS • SECURE CONSOLE</span>
          <span className="aocc-utc-clock"><Clock size={13} /> {utcTime}</span>
        </div>
        <div className="aocc-right-cluster">
          <span className="aocc-metric-chip">
            <Activity size={13} color="#22c55e" />
            Airspace: <strong>ACTIVE</strong>
          </span>
          <span className="aocc-metric-chip">
            <TrendingUp size={13} color="#38bdf8" />
            Dispatch Reliability: <strong>98.6%</strong>
          </span>
          <span className="aocc-metric-chip">
            <Users size={13} color="#f59e0b" />
            Avg Load Factor: <strong>{loadFactor}%</strong>
          </span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="dashboard-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge badge-primary">Air Operations Control Center</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>SkyWings Airline Ops Portal</span>
          </div>
          <h1 className="dashboard-page-title">Commercial Airline Fleet & Revenue Ops</h1>
        </div>

        <div className="dashboard-header-actions">
          {!isAdmin && (
            <button
              type="button"
              className="btn-accent"
              onClick={() => demoLogin('admin')}
              title="Instantly authenticate as administrator"
            >
              <Shield size={16} />
              Switch to Admin Mode
            </button>
          )}

          <button type="button" className="btn-secondary" onClick={loadStats} title="Refresh live telemetry">
            <RefreshCw size={16} />
            Refresh Telemetry
          </button>

          <button
            type="button"
            className="btn-primary dispatch-flight-btn"
            onClick={() => setShowAddFlightModal(true)}
          >
            <Plus size={16} />
            Dispatch New Flight
          </button>
        </div>
      </div>

      {loading || !stats ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
          <Plane size={36} className="seat-plane-spinner" />
          <p style={{ marginTop: 12, fontWeight: 600 }}>Syncing Air Traffic Control & Carrier Operations Data...</p>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="dashboard-grid">
            {/* Total Revenue */}
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: '#dbeafe', color: '#0284c7' }}>
                <DollarSign size={26} />
              </div>
              <div>
                <div className="stat-val">{formatPrice(stats.metrics.totalRevenue)}</div>
                <div className="stat-title">Yield & Ticket Revenue</div>
                <div className="stat-subtitle-trend positive">
                  <ArrowUpRight size={13} /> +12.4% vs last period
                </div>
              </div>
            </div>

            {/* Total Bookings */}
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Ticket size={26} />
              </div>
              <div>
                <div className="stat-val">{stats.metrics.totalBookings}</div>
                <div className="stat-title">
                  Total Reservations ({stats.metrics.confirmedBookings} Active)
                </div>
                <div className="stat-subtitle-trend neutral">
                  98.1% Electronic PNR Confirmed
                </div>
              </div>
            </div>

            {/* Active Flights */}
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                <Plane size={26} />
              </div>
              <div>
                <div className="stat-val">{stats.metrics.totalFlights}</div>
                <div className="stat-title">Active Routes & Fleet Aircraft</div>
                <div className="stat-subtitle-trend positive">
                  500+ Worldwide Air Corridors
                </div>
              </div>
            </div>

            {/* Passengers Flown */}
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Users size={26} />
              </div>
              <div>
                <div className="stat-val">{stats.metrics.totalPassengers}</div>
                <div className="stat-title">Passengers Transported</div>
                <div className="stat-subtitle-trend neutral">
                  Load Factor: {loadFactor}% Capacity
                </div>
              </div>
            </div>
          </div>

          {/* Ops Navigation Tabs */}
          <div className="ops-tabs-bar">
            <button
              type="button"
              className={`ops-tab-btn ${activeTab === 'flights' ? 'active' : ''}`}
              onClick={() => setActiveTab('flights')}
            >
              <Plane size={15} />
              Flight Schedules & Dispatch ({stats.flights.length})
            </button>
            <button
              type="button"
              className={`ops-tab-btn ${activeTab === 'manifest' ? 'active' : ''}`}
              onClick={() => setActiveTab('manifest')}
            >
              <Users size={15} />
              Passenger Manifest Feed ({stats.recentBookings.length})
            </button>
            <button
              type="button"
              className={`ops-tab-btn ${activeTab === 'fleet' ? 'active' : ''}`}
              onClick={() => setActiveTab('fleet')}
            >
              <BarChart3 size={15} />
              Fleet Status & Terminal Operations
            </button>
          </div>

          {/* TAB 1: Flight Schedules & Dispatch */}
          {activeTab === 'flights' && (
            <div className="dashboard-table-card">
              <div className="table-header-bar">
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>Flight Route Fleet Schedules</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Real-time operational dispatch: alter statuses, gate assignments, or cancellations.
                  </p>
                </div>

                {/* Search & Quick Filters */}
                <div className="flight-ops-controls">
                  <div className="ops-search-box">
                    <Search size={15} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Search flight, airline, city..."
                      value={flightSearchQuery}
                      onChange={(e) => setFlightSearchQuery(e.target.value)}
                    />
                  </div>

                  <select
                    className="ops-status-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="on time">On Time</option>
                    <option value="boarding">Boarding</option>
                    <option value="departed">Departed</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Flight / Airline</th>
                      <th>Route Corridors</th>
                      <th>Schedule & Duration</th>
                      <th>Aircraft & Gate</th>
                      <th>Base Fare</th>
                      <th>Seat Occupancy</th>
                      <th>Operational Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFlights.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                          No flights matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredFlights.map((flight) => {
                        const occupied = Math.max(0, 50 - (flight.availableSeats || 50));
                        const occupancyPercent = Math.min(100, Math.round((occupied / 50) * 100));

                        return (
                          <tr key={flight.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="flight-code-badge">{flight.flightNumber}</span>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3 }}>
                                {flight.airline}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                {flight.from} ➔ {flight.to}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                {flight.fromCity} to {flight.toCity}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700 }}>
                                {flight.departureTime} – {flight.arrivalTime}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                ⏱ {flight.duration}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{flight.aircraft}</div>
                              <div style={{ fontSize: '0.76rem', color: '#0284c7' }}>
                                Term {flight.terminal || '1'} • Gate {flight.gate || 'A4'}
                              </div>
                            </td>
                            <td>
                              <strong>{formatPrice(flight.basePrice)}</strong>
                            </td>
                            <td>
                              <div className="seat-load-bar-wrap">
                                <div className="seat-load-bar-bg">
                                  <div
                                    className="seat-load-bar-fill"
                                    style={{
                                      width: `${occupancyPercent}%`,
                                      background: occupancyPercent > 80 ? '#ef4444' : occupancyPercent > 50 ? '#0284c7' : '#22c55e'
                                    }}
                                  />
                                </div>
                                <span className="seat-load-text">
                                  {flight.availableSeats} open ({occupancyPercent}%)
                                </span>
                              </div>
                            </td>
                            <td>
                              <select
                                className={`status-pill-select status-${(flight.status || 'On Time')
                                  .toLowerCase()
                                  .split(' ')[0]}`}
                                value={flight.status}
                                onChange={(e) => handleUpdateStatus(flight.id, e.target.value)}
                              >
                                <option value="On Time">🟢 On Time</option>
                                <option value="Boarding">🔵 Boarding</option>
                                <option value="Departed">🛫 Departed</option>
                                <option value="Delayed (25m)">🟡 Delayed (25m)</option>
                                <option value="Cancelled">🔴 Cancelled</option>
                              </select>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="logout-icon-btn"
                                title="Remove Flight Schedule"
                                onClick={() => handleDeleteFlight(flight.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Passenger Manifest & Reservations */}
          {activeTab === 'manifest' && (
            <div className="dashboard-table-card">
              <div className="table-header-bar">
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>Customer Reservations & Manifest</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Live electronic PNR registry, passenger names, seat assignments, and payment settlements.
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>PNR Reference</th>
                      <th>Customer Details</th>
                      <th>Flight & Corridors</th>
                      <th>Departure Date</th>
                      <th>Class & Seats</th>
                      <th>Fare Settled</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((b) => (
                      <tr key={b.pnr}>
                        <td>
                          <span className="pnr-badge-bold">{b.pnr}</span>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            {new Date(b.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <strong>{b.contactName || b.passengers?.[0]?.name || 'SkyWings Guest'}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {b.contactEmail || 'Verified Traveler'}
                          </div>
                        </td>
                        <td>
                          <strong>{b.flight?.flightNumber || 'SW-FLIGHT'}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {b.flight?.from} ➔ {b.flight?.to}
                          </div>
                        </td>
                        <td>{b.travelDate || 'Flexible Travel'}</td>
                        <td>
                          <span className="badge badge-primary">
                            {(b.cabinClass || 'Economy').toUpperCase()}
                          </span>
                          <div style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: 4, fontWeight: 700 }}>
                            Seats: {b.passengers?.map((p) => p.seat || 'Auto').join(', ') || 'Assigned'}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{formatPrice(b.totalPrice)}</strong>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              b.status === 'CONFIRMED'
                                ? 'badge-success'
                                : b.status === 'CANCELLED'
                                ? 'badge-danger'
                                : 'badge-warning'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Fleet Status & Terminal Hubs */}
          {activeTab === 'fleet' && (
            <div className="dashboard-table-card">
              <div className="table-header-bar">
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>Commercial Fleet Aircraft & Hub Operations</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Widebody commercial airframes, engine specifications, gate turns, and active corridor assignments.
                  </p>
                </div>
              </div>

              <div className="fleet-telemetry-grid">
                {[
                  {
                    name: 'Airbus A350-900 (N801SK)',
                    status: 'Airborne ➔ Cruising FL390',
                    route: 'JFK ➔ CDG',
                    speed: 'Mach 0.89 • 945 km/h',
                    seats: '325 Pax • 92% Load',
                    nextGate: 'Paris CDG Terminal 2E Gate K31'
                  },
                  {
                    name: 'Boeing 787-9 Dreamliner (A6-EPF)',
                    status: 'Boarding ➔ Gate B22',
                    route: 'DXB ➔ LHR',
                    speed: 'Ground Pre-Flight Checks',
                    seats: '290 Pax • 88% Load',
                    nextGate: 'Dubai DXB Terminal 3 Concourse B'
                  },
                  {
                    name: 'Airbus A380-800 Superjumbo (F-HPJA)',
                    status: 'Scheduled ➔ Turnaround Prep',
                    route: 'LHR ➔ SIN',
                    speed: 'Gate Servicing & Catering',
                    seats: '510 Pax • 95% Load',
                    nextGate: 'London LHR Terminal 5 Gate 36'
                  },
                  {
                    name: 'Boeing 777-300ER (G-STBB)',
                    status: 'En Route ➔ Upper Airway Pacific',
                    route: 'SFO ➔ HND',
                    speed: 'Mach 0.85 • 905 km/h',
                    seats: '360 Pax • 86% Load',
                    nextGate: 'Tokyo Haneda Terminal 3 Gate 112'
                  }
                ].map((plane, pIdx) => (
                  <div key={pIdx} className="fleet-aircraft-card">
                    <div className="fleet-card-header">
                      <span className="fleet-plane-icon">✈</span>
                      <div>
                        <h4 className="fleet-plane-title">{plane.name}</h4>
                        <span className="fleet-plane-route">{plane.route}</span>
                      </div>
                      <span className="badge badge-success">ACTIVE AIRFRAME</span>
                    </div>

                    <div className="fleet-card-specs">
                      <div className="fleet-spec-item">
                        <span className="f-spec-label">STATUS</span>
                        <span className="f-spec-val" style={{ color: '#0284c7' }}>{plane.status}</span>
                      </div>
                      <div className="fleet-spec-item">
                        <span className="f-spec-label">CRUISE / SPEED</span>
                        <span className="f-spec-val">{plane.speed}</span>
                      </div>
                      <div className="fleet-spec-item">
                        <span className="f-spec-label">PAYLOAD & SEATS</span>
                        <span className="f-spec-val">{plane.seats}</span>
                      </div>
                      <div className="fleet-spec-item">
                        <span className="f-spec-label">GATE & TERMINAL</span>
                        <span className="f-spec-val">{plane.nextGate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Realistic Add Flight Dispatch Modal */}
      {showAddFlightModal && (
        <div className="modal-overlay" onClick={() => setShowAddFlightModal(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: 640 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-bar">
              <div>
                <span className="badge badge-primary">Operations Dispatch</span>
                <h3 style={{ fontSize: '1.35rem', marginTop: 4 }}>Schedule Commercial Flight</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Add a new commercial air corridor to global booking radar networks.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddFlightModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddFlightSubmit} className="admin-flight-form">
              <div className="form-group">
                <label>Flight Number (IATA Code)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFlight.flightNumber}
                  onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. SW-900"
                  required
                />
              </div>

              <div className="form-group">
                <label>Operating Airline</label>
                <select
                  className="form-input"
                  value={newFlight.airline}
                  onChange={(e) => setNewFlight({ ...newFlight, airline: e.target.value })}
                >
                  <option value="SkyWings Global">SkyWings Global</option>
                  <option value="Emirates">Emirates</option>
                  <option value="Singapore Airlines">Singapore Airlines</option>
                  <option value="Qatar Airways">Qatar Airways</option>
                  <option value="British Airways">British Airways</option>
                  <option value="Air France">Air France</option>
                  <option value="ANA All Nippon">ANA All Nippon</option>
                </select>
              </div>

              <div className="form-group">
                <label>Origin Airport (IATA)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFlight.from}
                  onChange={(e) => setNewFlight({ ...newFlight, from: e.target.value.toUpperCase() })}
                  placeholder="e.g. JFK"
                  required
                />
              </div>

              <div className="form-group">
                <label>Origin City</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFlight.fromCity}
                  onChange={(e) => setNewFlight({ ...newFlight, fromCity: e.target.value })}
                  placeholder="e.g. New York"
                  required
                />
              </div>

              <div className="form-group">
                <label>Destination Airport (IATA)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFlight.to}
                  onChange={(e) => setNewFlight({ ...newFlight, to: e.target.value.toUpperCase() })}
                  placeholder="e.g. CDG"
                  required
                />
              </div>

              <div className="form-group">
                <label>Destination City</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFlight.toCity}
                  onChange={(e) => setNewFlight({ ...newFlight, toCity: e.target.value })}
                  placeholder="e.g. Paris"
                  required
                />
              </div>

              <div className="form-group">
                <label>Departure Time (24h)</label>
                <input
                  type="time"
                  className="form-input"
                  value={newFlight.departureTime}
                  onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Arrival Time (24h)</label>
                <input
                  type="time"
                  className="form-input"
                  value={newFlight.arrivalTime}
                  onChange={(e) => setNewFlight({ ...newFlight, arrivalTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Flight Duration</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFlight.duration}
                  onChange={(e) => setNewFlight({ ...newFlight, duration: e.target.value })}
                  placeholder="e.g. 7h 15m"
                  required
                />
              </div>

              <div className="form-group">
                <label>Aircraft Model</label>
                <select
                  className="form-input"
                  value={newFlight.aircraft}
                  onChange={(e) => setNewFlight({ ...newFlight, aircraft: e.target.value })}
                >
                  <option value="Airbus A350-900">Airbus A350-900 (Ultra Long Haul)</option>
                  <option value="Boeing 787-9 Dreamliner">Boeing 787-9 Dreamliner</option>
                  <option value="Airbus A380-800">Airbus A380-800 Superjumbo</option>
                  <option value="Boeing 777-300ER">Boeing 777-300ER</option>
                  <option value="Airbus A321neo">Airbus A321neo</option>
                </select>
              </div>

              <div className="form-group">
                <label>Departure Terminal & Gate</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Terminal (e.g. 4)"
                    value={newFlight.terminal}
                    onChange={(e) => setNewFlight({ ...newFlight, terminal: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Gate (e.g. B22)"
                    value={newFlight.gate}
                    onChange={(e) => setNewFlight({ ...newFlight, gate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Base Economy Fare (USD)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newFlight.basePrice}
                  onChange={(e) => setNewFlight({ ...newFlight, basePrice: Number(e.target.value) })}
                  min="50"
                  max="10000"
                  required
                />
              </div>

              <div className="admin-form-full" style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowAddFlightModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Confirm Flight Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
