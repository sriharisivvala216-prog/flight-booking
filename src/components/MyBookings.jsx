import React, { useState, useEffect, useCallback } from 'react';
import {
  Ticket,
  Calendar,
  Plane,
  Search,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const MyBookings = ({ onOpenBoardingPass, onSearchNewFlight }) => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPnr, setSearchPnr] = useState('');
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getBookings(user?.id, user?.email);
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);


  const handlePnrLookup = async (e) => {
    e.preventDefault();
    if (!searchPnr.trim()) return;

    setLoading(true);
    try {
      const data = await api.getBookingByPNR(searchPnr.trim());
      setBookings([data.booking]);
    } catch (err) {
      alert(err.message || 'No booking found with this reference code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (booking) => {
    try {
      const data = await api.cancelBooking(booking.pnr);
      setCancelSuccessMsg(
        `Booking ${booking.pnr} has been cancelled. Refund of ${formatPrice(
          data.refundAmount
        )} has been processed.`
      );
      setCancellingBooking(null);
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>Manage Your Trips</h1>
        <p style={{ color: '#64748b' }}>
          Access your confirmed bookings, download official boarding passes, or manage cancellations.
        </p>
      </div>

      {/* PNR Quick Lookup Bar */}
      <div
        style={{
          background: 'white',
          padding: '20px 24px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--slate-200)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={20} color="#2563eb" />
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Find Booking by Reference (PNR):</span>
        </div>

        <form onSubmit={handlePnrLookup} style={{ display: 'flex', gap: 10, flex: 1, maxWidth: 440 }}>
          <input
            type="text"
            placeholder="e.g. SKW789"
            className="form-input"
            value={searchPnr}
            onChange={(e) => setSearchPnr(e.target.value.toUpperCase())}
            style={{ textTransform: 'uppercase' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>
            Lookup
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setSearchPnr('');
              fetchBookings();
            }}
          >
            Show All
          </button>
        </form>
      </div>

      {cancelSuccessMsg && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#15803d',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 24,
            fontWeight: 600
          }}
        >
          ✓ {cancelSuccessMsg}
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p>Loading your flight bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="no-flights-state">
          <Ticket size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
          <h3>No Flight Bookings Found</h3>
          <p style={{ maxWidth: 420, margin: '0 auto 20px auto' }}>
            You do not currently have any active or past reservations under this session.
          </p>
          <button type="button" className="btn-primary" onClick={onSearchNewFlight}>
            <Plane size={16} />
            Search & Book Flights Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'CANCELLED';

            return (
              <div
                key={booking.pnr}
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--slate-200)',
                  boxShadow: 'var(--shadow-md)',
                  padding: 24,
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 2fr 1fr',
                  gap: 24,
                  alignItems: 'center'
                }}
              >
                {/* Left: Airline & PNR */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span
                      className={`badge ${
                        isCancelled ? 'badge-danger' : 'badge-success'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      PNR: <strong style={{ color: '#0f172a' }}>{booking.pnr}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>
                    {booking.airline}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 2 }}>
                    Flight {booking.flightNumber} • {booking.cabinClass}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Middle: Route & Times */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                      {booking.departureTime}
                    </div>
                    <div style={{ fontWeight: 700 }}>{booking.from}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{booking.fromCity}</div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '0 16px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 4 }}>
                      {booking.departureDate}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb' }}>
                      <span style={{ height: 1, width: 28, background: '#cbd5e1' }} />
                      <Plane size={16} />
                      <span style={{ height: 1, width: 28, background: '#cbd5e1' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                      {booking.duration}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                      {booking.arrivalTime}
                    </div>
                    <div style={{ fontWeight: 700 }}>{booking.to}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{booking.toCity}</div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div
                  style={{
                    borderLeft: '1px solid #f1f5f9',
                    paddingLeft: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    textAlign: 'right'
                  }}
                >
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563eb' }}>
                    {formatPrice(booking.totalAmount)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {booking.passengers?.length || 1} Passenger(s) • Seat{' '}
                    {booking.passengers?.[0]?.seat || '12A'}
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '0.88rem' }}
                    onClick={() => onOpenBoardingPass(booking)}
                  >
                    <Ticket size={16} />
                    Boarding Pass
                  </button>

                  {!isCancelled && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.82rem', color: '#dc2626' }}
                      onClick={() => setCancellingBooking(booking)}
                    >
                      <XCircle size={14} />
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancellingBooking && (
        <div className="modal-overlay" onClick={() => setCancellingBooking(null)}>
          <div className="modal-card" style={{ padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626', marginBottom: 14 }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.3rem' }}>Cancel Flight Booking?</h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: 16 }}>
              Are you sure you want to cancel booking <strong>{cancellingBooking.pnr}</strong> (
              {cancellingBooking.from} ➔ {cancellingBooking.to})?
            </p>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: 14,
                borderRadius: 'var(--radius-md)',
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>Original Fare Paid:</span>
                <strong>{formatPrice(cancellingBooking.totalAmount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                <span>Refund Amount (90% Policy):</span>
                <strong>{formatPrice(Math.round(cancellingBooking.totalAmount * 0.9))}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCancellingBooking(null)}
              >
                Keep Booking
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                onClick={() => handleCancel(cancellingBooking)}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
