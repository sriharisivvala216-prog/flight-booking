import React, { useEffect } from 'react';
import {
  Plane,
  CheckCircle,
  Ticket,
  Printer,
  ArrowLeft,
  Shield,
  Luggage,
  Sparkles,
  MapPin,
  Clock,
  Calendar,
  User,
  CreditCard,
  Home
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/reservationPage.css';

/**
 * FlightReservationPage
 * Full-page confirmation screen shown after a seat booking is confirmed.
 *
 * Props:
 *   booking       – the confirmed booking object from the API
 *   onViewBoardingPass(booking) – open the boarding pass modal
 *   onGoHome()    – navigate back to /flights or /
 *   onMyBookings()– navigate to /my-bookings
 */
const FlightReservationPage = ({ booking, onViewBoardingPass, onGoHome, onMyBookings }) => {
  const { formatPrice } = useCurrency();

  // Scroll to top on mount; auto-open ticket; clear localStorage booking key on unmount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Auto-open boarding pass for immediate printing
    const t = setTimeout(() => {
      onViewBoardingPass(booking);
      // Give the modal a tiny bit of time to render, then auto-trigger browser print
      setTimeout(() => window.print(), 250);
    }, 400);

    return () => {
      clearTimeout(t);
      localStorage.removeItem('skywings_confirmed_booking');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!booking) return null;

  const passengers = booking.passengers || [];
  const addons = booking.addons || {};

  const activeAddons = [];
  if (addons.travelInsurance) activeAddons.push({ icon: <Shield size={16} />, label: 'Comprehensive Travel & Medical Insurance' });
  if (addons.priorityBoarding) activeAddons.push({ icon: <Sparkles size={16} />, label: 'Priority Boarding & Fast-Track Security' });
  if (addons.extraBaggage > 0)
    activeAddons.push({ icon: <Luggage size={16} />, label: `Extra Checked Baggage × ${addons.extraBaggage} (23 kg each)` });

  const taxesAndFees = Math.round((booking.totalAmount || 0) * 0.1);
  const baseFare = (booking.totalAmount || 0) - taxesAndFees;

  return (
    <div className="reservation-page">
      {/* ── Navbar ── */}
      <nav className="res-navbar">
        <div className="res-brand">
          <div className="res-brand-dot" />
          <Plane size={20} strokeWidth={2.5} />
          SkyWings
        </div>
        <div className="res-nav-actions">
          <button className="res-nav-btn ghost" onClick={onGoHome}>
            <Home size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Search Flights
          </button>
          <button className="res-nav-btn primary" onClick={onMyBookings}>
            My Bookings
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="res-hero">
        <div className="res-success-pulse">
          <CheckCircle size={44} color="#fff" strokeWidth={2.5} />
        </div>
        <h1 className="res-hero-title">Flight Reserved & Confirmed!</h1>
        <p className="res-hero-sub">
          Your booking with <strong style={{ color: '#fff' }}>{booking.airline}</strong> is fully ticketed.
          A confirmation e-ticket has been sent to {booking.contact?.email}.
        </p>
        <div className="res-pnr-pill">
          Booking Reference / PNR: &nbsp;<strong>{booking.pnr}</strong>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="res-content">

        {/* ─── LEFT COLUMN ─── */}
        <div>

          {/* Flight Details Card */}
          <div className="res-card">
            <div className="res-card-title">Flight Details</div>

            {/* Route */}
            <div className="res-route-display">
              <div className="res-city-block">
                <div className="res-iata">{booking.from}</div>
                <div className="res-city-name">{booking.fromCity}</div>
              </div>

              <div className="res-flight-path">
                <div className="res-duration-line">
                  <div className="res-line" />
                  <Plane size={18} color="#3b82f6" />
                  <div className="res-line" />
                </div>
                <div className="res-duration-text">{booking.duration}</div>
                <div className="res-flight-no">{booking.flightNumber}</div>
              </div>

              <div className="res-city-block right">
                <div className="res-iata">{booking.to}</div>
                <div className="res-city-name">{booking.toCity}</div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="res-info-grid">
              <div className="res-info-item">
                <div className="res-info-label"><Calendar size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Date</div>
                <div className="res-info-value">{booking.departureDate || '—'}</div>
              </div>
              <div className="res-info-item">
                <div className="res-info-label"><Clock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Departure</div>
                <div className="res-info-value highlight">{booking.departureTime}</div>
              </div>
              <div className="res-info-item">
                <div className="res-info-label"><Clock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Arrival</div>
                <div className="res-info-value">{booking.arrivalTime}</div>
              </div>
              <div className="res-info-item">
                <div className="res-info-label"><MapPin size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Terminal</div>
                <div className="res-info-value">{booking.terminal || 'T3'}</div>
              </div>
              <div className="res-info-item">
                <div className="res-info-label"><MapPin size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Gate</div>
                <div className="res-info-value highlight">{booking.gate || 'B22'}</div>
              </div>
              <div className="res-info-item">
                <div className="res-info-label">Cabin Class</div>
                <div className="res-info-value" style={{ textTransform: 'capitalize' }}>
                  {(booking.cabinClass || 'economy').replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>

          {/* Passengers Card */}
          <div className="res-card">
            <div className="res-card-title">
              <User size={13} style={{ verticalAlign: 'middle' }} />
              Passengers ({passengers.length})
            </div>
            {passengers.map((p, idx) => {
              const initials = `${(p.firstName || 'P')[0]}${(p.lastName || '')[0] || ''}`.toUpperCase();
              return (
                <div className="res-passenger-row" key={idx}>
                  <div className="res-passenger-avatar">{initials}</div>
                  <div className="res-passenger-info">
                    <div className="res-passenger-name">
                      {p.firstName} {p.lastName}
                    </div>
                    <div className="res-passenger-meta">
                      {p.gender} · Age {p.age} · {p.meal}
                      {p.passport ? ` · ${p.passport}` : ''}
                    </div>
                  </div>
                  <div className="res-seat-badge">Seat {p.seat}</div>
                </div>
              );
            })}
          </div>

          {/* Add-ons Card (only if any) */}
          {activeAddons.length > 0 && (
            <div className="res-card">
              <div className="res-card-title">Travel Add-ons</div>
              {activeAddons.map((a, i) => (
                <div className="res-addon-row" key={i}>
                  <div className="res-addon-icon">{a.icon}</div>
                  {a.label}
                </div>
              ))}
            </div>
          )}

          {/* Journey Timeline */}
          <div className="res-card">
            <div className="res-card-title">Your Journey Steps</div>
            <div className="res-timeline">
              <div className="res-timeline-item">
                <div className="res-tl-icon done">✓</div>
                <div className="res-tl-text">
                  <div className="res-tl-label">Booking Confirmed</div>
                  <div className="res-tl-meta">E-ticket sent to {booking.contact?.email}</div>
                </div>
              </div>
              <div className="res-timeline-item">
                <div className="res-tl-icon done">✓</div>
                <div className="res-tl-text">
                  <div className="res-tl-label">Seat Assigned</div>
                  <div className="res-tl-meta">
                    {passengers.map(p => p.seat).join(', ')} · {(booking.cabinClass || 'Economy').replace('_', ' ')} Class
                  </div>
                </div>
              </div>
              <div className="res-timeline-item">
                <div className="res-tl-icon upcoming">3</div>
                <div className="res-tl-text">
                  <div className="res-tl-label">Online Check-in</div>
                  <div className="res-tl-meta">Opens 48 hours before departure</div>
                </div>
              </div>
              <div className="res-timeline-item">
                <div className="res-tl-icon upcoming">4</div>
                <div className="res-tl-text">
                  <div className="res-tl-label">Airport Departure</div>
                  <div className="res-tl-meta">
                    {booking.fromCity} · Terminal {booking.terminal || 'T3'} · Gate {booking.gate || 'B22'}
                  </div>
                </div>
              </div>
              <div className="res-timeline-item">
                <div className="res-tl-icon upcoming">5</div>
                <div className="res-tl-text">
                  <div className="res-tl-label">Arrive at {booking.toCity}</div>
                  <div className="res-tl-meta">Expected arrival: {booking.arrivalTime}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <div className="res-sidebar">

          {/* Booking Status */}
          <div className="res-card" style={{ textAlign: 'center', padding: '28px 24px' }}>
            <div className="res-status-inline">
              <div className="res-status-dot" />
              <span className="res-status-text">CONFIRMED</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 700, marginBottom: 6 }}>
              {booking.airline}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#3b82f6', letterSpacing: '0.1em', marginBottom: 6 }}>
              {booking.pnr}
            </div>
            <div className="res-conf-note">
              E-ticket confirmation sent to<br />
              <span style={{ color: '#93c5fd' }}>{booking.contact?.email}</span>
            </div>
          </div>

          {/* Price Summary */}
          <div className="res-card">
            <div className="res-card-title">
              <CreditCard size={13} style={{ verticalAlign: 'middle' }} />
              Payment Summary
            </div>
            <div className="res-price-row">
              <span>Base Fare</span>
              <span className="res-price-val">{formatPrice(baseFare)}</span>
            </div>
            {addons.travelInsurance && (
              <div className="res-price-row">
                <span>Travel Insurance</span>
                <span className="res-price-val">{formatPrice(29 * passengers.length)}</span>
              </div>
            )}
            {addons.priorityBoarding && (
              <div className="res-price-row">
                <span>Priority Boarding</span>
                <span className="res-price-val">{formatPrice(19 * passengers.length)}</span>
              </div>
            )}
            {addons.extraBaggage > 0 && (
              <div className="res-price-row">
                <span>Extra Baggage</span>
                <span className="res-price-val">{formatPrice(addons.extraBaggage * 45)}</span>
              </div>
            )}
            <div className="res-price-row">
              <span>Taxes & Fees</span>
              <span className="res-price-val">{formatPrice(taxesAndFees)}</span>
            </div>
            <div className="res-price-row total">
              <span>Total Paid</span>
              <span className="res-price-val total-val">{formatPrice(booking.totalAmount || 0)}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 10, textAlign: 'center' }}>
              Paid via {booking.paymentMethod || 'Credit Card (ending 4242)'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="res-actions">
            <button
              type="button"
              className="res-btn primary"
              onClick={() => onViewBoardingPass(booking)}
            >
              <Ticket size={18} />
              View Boarding Pass / E-Ticket
            </button>
            <button
              type="button"
              className="res-btn secondary"
              onClick={() => window.print()}
            >
              <Printer size={16} />
              Print / Save as PDF
            </button>
            <button
              type="button"
              className="res-btn secondary"
              onClick={onMyBookings}
            >
              <ArrowLeft size={15} />
              View All My Bookings
            </button>
            <button
              type="button"
              className="res-btn ghost"
              onClick={onGoHome}
            >
              Book Another Flight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightReservationPage;
