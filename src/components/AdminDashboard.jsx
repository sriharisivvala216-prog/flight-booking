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
  X
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

  // New flight form state
  const [newFlight, setNewFlight] = useState({
    flightNumber: 'SW-900',
    airline: 'SkyWings Express',
    from: 'JFK',
    fromCity: 'New York',
    to: 'CDG',
    toCity: 'Paris',
    departureTime: '18:30',
    arrivalTime: '07:45',
    duration: '7h 15m',
    aircraft: 'Airbus A350-900',
    basePrice: 590
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

  return (
    <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 30,
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge badge-primary">Operations Control</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Live SkyWings Fleet Portal</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', marginTop: 4 }}>Airline Administration & Analytics</h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
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
            Refresh Data
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowAddFlightModal(true)}
          >
            <Plus size={16} />
            Schedule New Flight
          </button>
        </div>
      </div>

      {loading || !stats ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p>Loading fleet operations data...</p>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="dashboard-grid">
            {/* Total Revenue */}
            <div className="stat-card">
              <div
                className="stat-icon-wrapper"
                style={{ background: '#dbeafe', color: '#2563eb' }}
              >
                <DollarSign size={26} />
              </div>
              <div>
                <div className="stat-val">{formatPrice(stats.metrics.totalRevenue)}</div>
                <div className="stat-title">Confirmed Revenue</div>
              </div>
            </div>

            {/* Total Bookings */}
            <div className="stat-card">
              <div
                className="stat-icon-wrapper"
                style={{ background: '#dcfce7', color: '#16a34a' }}
              >
                <Ticket size={26} />
              </div>
              <div>
                <div className="stat-val">{stats.metrics.totalBookings}</div>
                <div className="stat-title">
                  Total Reservations ({stats.metrics.confirmedBookings} Active)
                </div>
              </div>
            </div>

            {/* Active Flights */}
            <div className="stat-card">
              <div
                className="stat-icon-wrapper"
                style={{ background: '#e0e7ff', color: '#4f46e5' }}
              >
                <Plane size={26} />
              </div>
              <div>
                <div className="stat-val">{stats.metrics.totalFlights}</div>
                <div className="stat-title">Scheduled Flights</div>
              </div>
            </div>

            {/* Passengers Flown */}
            <div className="stat-card">
              <div
                className="stat-icon-wrapper"
                style={{ background: '#fef3c7', color: '#d97706' }}
              >
                <Users size={26} />
              </div>
              <div>
                <div className="stat-val">{stats.metrics.totalPassengers}</div>
                <div className="stat-title">Passengers Booked</div>
              </div>
            </div>
          </div>

          {/* Table: Flight Schedules Management */}
          <div className="dashboard-table-card">
            <div className="table-header-bar">
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Flight Route Fleet Schedules</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Live flight control: modify statuses, gate assignments, or cancellations.
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Flight / Airline</th>
                    <th>Route</th>
                    <th>Departure / Arrival</th>
                    <th>Aircraft Model</th>
                    <th>Fare Base</th>
                    <th>Seats Left</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.flights.map((flight) => (
                    <tr key={flight.id}>
                      <td>
                        <strong>{flight.flightNumber}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {flight.airline}
                        </div>
                      </td>
                      <td>
                        <strong>
                          {flight.from} ➔ {flight.to}
                        </strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {flight.fromCity} to {flight.toCity}
                        </div>
                      </td>
                      <td>
                        {flight.departureTime} - {flight.arrivalTime}
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {flight.duration}
                        </div>
                      </td>
                      <td>{flight.aircraft}</td>
                      <td>
                        <strong>{formatPrice(flight.basePrice)}</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: flight.availableSeats < 20 ? '#dc2626' : '#16a34a'
                          }}
                        >
                          {flight.availableSeats}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-input"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            width: 'auto'
                          }}
                          value={flight.status}
                          onChange={(e) => handleUpdateStatus(flight.id, e.target.value)}
                        >
                          <option value="On Time">On Time</option>
                          <option value="Boarding">Boarding</option>
                          <option value="Departed">Departed</option>
                          <option value="Delayed (25m)">Delayed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="logout-icon-btn"
                          title="Delete Flight"
                          onClick={() => handleDeleteFlight(flight.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table: Recent Customer Bookings */}
          <div className="dashboard-table-card">
            <div className="table-header-bar">
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Recent Passenger Reservations</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Live bookings feed with passenger manifests and payment details.
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PNR</th>
                    <th>Customer Name</th>
                    <th>Flight / Route</th>
                    <th>Travel Date</th>
                    <th>Class / Seat</th>
                    <th>Paid Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((b) => (
                    <tr key={b.pnr}>
                      <td>
                        <strong style={{ color: '#2563eb' }}>{b.pnr}</strong>
                      </td>
                      <td>
                        <div>
                          {b.passengers?.[0]?.firstName} {b.passengers?.[0]?.lastName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {b.contact?.email}
                        </div>
                      </td>
                      <td>
                        <strong>{b.flightNumber}</strong> ({b.from} ➔ {b.to})
                      </td>
                      <td>{b.departureDate}</td>
                      <td>
                        <span style={{ textTransform: 'capitalize' }}>{b.cabinClass}</span> •{' '}
                        {b.passengers?.[0]?.seat || '12A'}
                      </td>
                      <td>
                        <strong>{formatPrice(b.totalAmount)}</strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            b.status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'
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
        </>
      )}

      {/* Add New Flight Modal */}
      {showAddFlightModal && (
        <div className="modal-overlay" onClick={() => setShowAddFlightModal(false)}>
          <div
            className="modal-card"
            style={{ padding: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.35rem' }}>Schedule New Flight</h3>
              <button
                className="modal-close-btn"
                style={{ position: 'static' }}
                onClick={() => setShowAddFlightModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddFlightSubmit} className="passenger-form-grid">
              <div className="form-group">
                <label>Flight Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFlight.flightNumber}
                  onChange={(e) =>
                    setNewFlight({ ...newFlight, flightNumber: e.target.value.toUpperCase() })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Airline Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFlight.airline}
                  onChange={(e) => setNewFlight({ ...newFlight, airline: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Origin Airport (Code)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFlight.from}
                  onChange={(e) =>
                    setNewFlight({ ...newFlight, from: e.target.value.toUpperCase() })
                  }
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
                  required
                />
              </div>

              <div className="form-group">
                <label>Destination Airport (Code)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFlight.to}
                  onChange={(e) =>
                    setNewFlight({ ...newFlight, to: e.target.value.toUpperCase() })
                  }
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
                  required
                />
              </div>

              <div className="form-group">
                <label>Departure Time (HH:MM)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFlight.departureTime}
                  onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Arrival Time (HH:MM)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFlight.arrivalTime}
                  onChange={(e) => setNewFlight({ ...newFlight, arrivalTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Aircraft Model</label>
                <input
                  type="text"
                  className="form-input"
                  value={newFlight.aircraft}
                  onChange={(e) => setNewFlight({ ...newFlight, aircraft: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Base Price ($ USD)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newFlight.basePrice}
                  onChange={(e) =>
                    setNewFlight({ ...newFlight, basePrice: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddFlightModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Publish Flight Schedule
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
