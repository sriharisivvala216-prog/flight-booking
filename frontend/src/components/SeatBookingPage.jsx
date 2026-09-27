import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plane, 
  Armchair, 
  Check, 
  Tv, 
  Zap, 
  Coffee, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  Luggage, 
  ChevronRight,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/seatBookingPage.css';
import '../styles/seatmap.css';

// Fallback Default Featured Flight if user navigates directly to /seat-booking
const DEFAULT_FLIGHT = {
  id: 'flight_default_787',
  flightNumber: 'AL-202',
  airline: 'AeroLux Global',
  aircraft: 'Boeing 787-9 Dreamliner',
  from: 'JFK',
  fromCity: 'New York',
  to: 'DXB',
  toCity: 'Dubai',
  departureTime: '18:45',
  arrivalTime: '11:30',
  duration: '12h 45m',
  basePrice: 510,
  cabinClass: 'economy'
};

export default function SeatBookingPage({ 
  flight = null, 
  cabinClass = 'economy', 
  passengersCount = 1, 
  onConfirmSeats, 
  onNavigate 
}) {
  const activeFlight = flight || DEFAULT_FLIGHT;
  const { formatPrice } = useCurrency();

  const [seatData, setSeatData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [activeCabinFilter, setActiveCabinFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeats = async () => {
      setLoading(true);
      try {
        const data = await api.getFlightSeats(activeFlight.id || 'demo');
        setSeatData(data);
      } catch (err) {
        console.warn('Using client procedural seat layout:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
    setSelectedSeats([]);
  }, [activeFlight.id]);

  const handleSeatClick = (seat) => {
    if (seat.isOccupied) return;

    const exists = selectedSeats.find((s) => s.code === seat.code);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.code !== seat.code));
    } else {
      if (selectedSeats.length >= passengersCount) {
        // Replace oldest if quota reached
        const updated = [...selectedSeats.slice(1), seat];
        setSelectedSeats(updated);
      } else {
        setSelectedSeats([...selectedSeats, seat]);
      }
    }
    setHoveredSeat(seat);
  };

  const totalExtraCost = selectedSeats.reduce((sum, s) => sum + (s.additionalCost || 0), 0);
  const flightBasePrice = activeFlight.basePrice || 510;
  const totalPrice = flightBasePrice * passengersCount + totalExtraCost;

  const handleProceed = () => {
    let finalSeats = [...selectedSeats];
    if (finalSeats.length < passengersCount) {
      // Auto-assign random available seats for remaining passengers if any
      if (seatData?.rows) {
        for (const row of seatData.rows) {
          for (const s of row.seats) {
            if (finalSeats.length >= passengersCount) break;
            if (!s.isOccupied && !finalSeats.some((as) => as.code === s.code)) {
              finalSeats.push(s);
            }
          }
        }
      }
    }

    const sessionData = {
      flight: activeFlight,
      selectedSeats: finalSeats,
      seatExtrasCost: totalExtraCost,
      cabinClass,
      passengersCount
    };
    
    localStorage.setItem('skywings_checkout_session', JSON.stringify(sessionData));
    window.open('/booking', '_blank');
  };

  // Filter rows by cabin if a tab is active
  const filteredRows = seatData?.rows?.filter((row) => {
    if (activeCabinFilter === 'all') return true;
    return row.cabin === activeCabinFilter;
  }) || [];

  return (
    <div className="seat-booking-page-root">
      {/* Ambient Aerospace Background */}
      <div className="seat-page-backdrop" />

      {/* Top Navigation Bar */}
      <header className="seat-page-header">
        <button 
          type="button" 
          className="seat-page-back-btn"
          onClick={() => onNavigate ? onNavigate('/flights') : window.history.back()}
        >
          <ArrowLeft size={16} />
          <span>Back to Flight Results</span>
        </button>

        <div className="seat-page-flight-banner">
          <div className="flight-route-pill">
            <span className="route-code">{activeFlight.from}</span>
            <div className="flight-divider">
              <Plane size={14} className="route-plane" />
            </div>
            <span className="route-code">{activeFlight.to}</span>
          </div>

          <div className="flight-meta-info">
            <span className="airline-text">{activeFlight.airline} • {activeFlight.flightNumber}</span>
            <span className="aircraft-text">{activeFlight.aircraft}</span>
          </div>
        </div>

        <div className="seat-page-user-action">
          <span className="status-indicator">
            <span className="ping-dot" />
            <span>INTERACTIVE CABIN 3D</span>
          </span>
        </div>
      </header>

      {/* Main Seat Selection Stage */}
      <main className="seat-booking-stage">
        {/* Left Column: Interactive Fuselage Seatmap */}
        <section className="seatmap-fuselage-container">
          {/* Cabin Filter Tabs */}
          <div className="cabin-filter-bar">
            <button 
              type="button" 
              className={`cabin-tab-btn ${activeCabinFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCabinFilter('all')}
            >
              <span>Full Aircraft</span>
            </button>
            <button 
              type="button" 
              className={`cabin-tab-btn ${activeCabinFilter === 'first' ? 'active' : ''}`}
              onClick={() => setActiveCabinFilter('first')}
            >
              <span>👑 First Suite</span>
            </button>
            <button 
              type="button" 
              className={`cabin-tab-btn ${activeCabinFilter === 'business' ? 'active' : ''}`}
              onClick={() => setActiveCabinFilter('business')}
            >
              <span>💼 Business Pod</span>
            </button>
            <button 
              type="button" 
              className={`cabin-tab-btn ${activeCabinFilter === 'premium_economy' ? 'active' : ''}`}
              onClick={() => setActiveCabinFilter('premium_economy')}
            >
              <span>⚡ Premium</span>
            </button>
            <button 
              type="button" 
              className={`cabin-tab-btn ${activeCabinFilter === 'economy' ? 'active' : ''}`}
              onClick={() => setActiveCabinFilter('economy')}
            >
              <span>✈️ Economy</span>
            </button>
          </div>

          {/* Seat Color Legend */}
          <div className="seatmap-legend-row">
            <div className="legend-item">
              <span className="legend-box available" />
              <span>Available</span>
            </div>
            <div className="legend-item">
              <span className="legend-box selected" />
              <span>Your Selection</span>
            </div>
            <div className="legend-item">
              <span className="legend-box occupied" />
              <span>Occupied</span>
            </div>
            <div className="legend-item">
              <span className="legend-box first" />
              <span>First Class (+$$$)</span>
            </div>
            <div className="legend-item">
              <span className="legend-box extra" />
              <span>Extra Legroom</span>
            </div>
          </div>

          {/* Fuselage Frame */}
          <div className="airplane-fuselage-wrapper">
            <div className="airplane-nose-cone">
              <div className="nose-cockpit-windows">
                <span />
                <span />
              </div>
              <div className="cockpit-label">FLIGHT DECK / COCKPIT</div>
            </div>

            {loading ? (
              <div className="seatmap-loading-box">
                <Plane size={32} className="spinning-plane text-cyan" />
                <span>Loading 3D aircraft cabin layout...</span>
              </div>
            ) : (
              <div className="fuselage-cabin-scroll">
                <div className="fuselage-rows-list">
                  {filteredRows.map((row) => (
                    <div key={row.rowNumber} className={`seatmap-row-card cabin-${row.cabin}`}>
                      {row.isExitRow && (
                        <div className="exit-row-banner">
                          <span>🚪 EMERGENCY EXIT ROW • EXTRA LEGROOM</span>
                        </div>
                      )}

                      <div className="row-seats-line">
                        <span className="row-number-badge">{row.rowNumber}</span>

                        <div className="seats-block-group">
                          {row.seats.map((seat) => {
                            const isSelected = selectedSeats.some((s) => s.code === seat.code);
                            const isOccupied = seat.isOccupied;

                            let seatClass = 'seat-node';
                            if (isOccupied) seatClass += ' occupied';
                            else if (isSelected) seatClass += ' selected';
                            else if (seat.cabin === 'first') seatClass += ' cabin-first';
                            else if (seat.cabin === 'business') seatClass += ' cabin-business';
                            else if (seat.cabin === 'premium_economy') seatClass += ' cabin-premium';
                            else if (seat.isExtraLegroom) seatClass += ' extra-legroom';
                            else seatClass += ' standard';

                            return (
                              <button
                                key={seat.code}
                                type="button"
                                className={seatClass}
                                disabled={isOccupied}
                                onClick={() => handleSeatClick(seat)}
                                onMouseEnter={() => setHoveredSeat(seat)}
                                title={`${seat.code} • ${seat.cabin.toUpperCase()} • ${isOccupied ? 'Occupied' : seat.additionalCost ? `+$${seat.additionalCost}` : 'Included'}`}
                              >
                                {isSelected ? (
                                  <Check size={14} className="seat-check-icon" />
                                ) : (
                                  <span className="seat-code-text">{seat.code}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <span className="row-number-badge">{row.rowNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Seat Details & Booking Checkout Summary */}
        <aside className="seat-booking-summary-sidebar">
          {/* Passenger Quota Pill */}
          <div className="quota-card-box">
            <div className="quota-header">
              <span className="quota-title">PASSENGER SEATS</span>
              <span className={`quota-badge ${selectedSeats.length >= passengersCount ? 'complete' : 'pending'}`}>
                {selectedSeats.length} OF {passengersCount} SELECTED
              </span>
            </div>
            <p className="quota-desc">
              {selectedSeats.length >= passengersCount 
                ? 'All passenger seats selected! Review your fare breakdown below.'
                : `Please select ${passengersCount - selectedSeats.length} more seat(s) on the cabin layout.`}
            </p>
          </div>

          {/* Hovered Seat Spec Tooltip Card */}
          {hoveredSeat && (
            <div className="hovered-seat-card">
              <div className="hover-card-header">
                <div className="hover-code-group">
                  <Armchair size={18} className="text-cyan" />
                  <span className="hover-seat-code">{hoveredSeat.code}</span>
                </div>
                <span className="hover-cabin-badge">
                  {hoveredSeat.cabin?.toUpperCase().replace('_', ' ')}
                </span>
              </div>

              <div className="hover-perks-grid">
                <div className="perk-pill">
                  <span className="key">Legroom:</span>
                  <span className="val">{hoveredSeat.legroom || '32 inches'}</span>
                </div>
                <div className="perk-pill">
                  <span className="key">Recline:</span>
                  <span className="val">{hoveredSeat.recline || 'Standard 4"'}</span>
                </div>
                <div className="perk-pill">
                  <Tv size={13} className="text-cyan" />
                  <span>4K OLED In-Flight Screen</span>
                </div>
                <div className="perk-pill">
                  <Zap size={13} className="text-amber" />
                  <span>AC + USB-C 65W Power</span>
                </div>
              </div>

              <div className="hover-price-row">
                <span>Seat Selection Upgrade:</span>
                <span className="upgrade-price">
                  {hoveredSeat.additionalCost ? `+${formatPrice(hoveredSeat.additionalCost)}` : 'FREE / Included'}
                </span>
              </div>
            </div>
          )}

          {/* Selected Seats Tag List */}
          <div className="selected-seats-list-box">
            <span className="box-title">YOUR SELECTED SEATS:</span>
            {selectedSeats.length === 0 ? (
              <div className="empty-selection-placeholder">
                <Info size={16} />
                <span>Click any seat on the fuselage map to reserve</span>
              </div>
            ) : (
              <div className="seat-tag-pills">
                {selectedSeats.map((s) => (
                  <div key={s.code} className="selected-seat-pill">
                    <div className="seat-pill-left">
                      <span className="pill-code">{s.code}</span>
                      <span className="pill-cabin">{s.cabin}</span>
                    </div>
                    <span className="pill-extra">
                      {s.additionalCost ? `+${formatPrice(s.additionalCost)}` : 'FREE'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart Baggage Status (Addressing 🧳) */}
          <div className="seat-luggage-status-card">
            <div className="luggage-card-top">
              <Luggage size={16} className="text-cyan" />
              <span className="luggage-status-title">SMART LUGGAGE ALLOCATION</span>
            </div>
            <p className="luggage-status-desc">
              Every seat includes 1x 23kg checked bag + 1x 8kg cabin trolley with real-time satellite RFID tracking.
            </p>
          </div>

          {/* Price Calculation Card */}
          <div className="seat-pricing-summary-card">
            <div className="price-line">
              <span className="price-label">Base Flight Fare ({passengersCount}x)</span>
              <span className="price-value">{formatPrice(flightBasePrice * passengersCount)}</span>
            </div>

            <div className="price-line">
              <span className="price-label">Seat Upgrade Extras</span>
              <span className="price-value text-cyan">
                {totalExtraCost > 0 ? `+${formatPrice(totalExtraCost)}` : 'Included ($0)'}
              </span>
            </div>

            <div className="price-line total-line">
              <span className="total-label">Total Amount</span>
              <span className="total-value">{formatPrice(totalPrice)}</span>
            </div>

            <button 
              type="button" 
              className="confirm-seats-btn"
              onClick={handleProceed}
            >
              <span>Confirm Seats & Proceed to Checkout</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
