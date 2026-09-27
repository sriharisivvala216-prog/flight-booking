import React, { useState, useEffect } from 'react';
import {
  X,
  Plane,
  Check,
  Armchair,
  ArrowRight,
  Tv,
  Zap,
  Coffee,
  ShieldCheck,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/seatmap.css';

const SeatSelectionModal = ({
  isOpen,
  flight,
  cabinClass,
  passengersCount = 1,
  onConfirmSeats,
  onClose
}) => {
  const [seatData, setSeatData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [activeCabinFilter, setActiveCabinFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!flight || !isOpen) return;

    const fetchSeats = async () => {
      setLoading(true);
      try {
        const data = await api.getFlightSeats(flight.id);
        setSeatData(data);
      } catch (err) {
        console.error('Failed to load seat layout', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
    setSelectedSeats([]);
    setHoveredSeat(null);
  }, [flight, isOpen]);

  if (!isOpen || !flight) return null;

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

  const handleContinue = () => {
    if (selectedSeats.length < passengersCount) {
      // Auto-assign random available seats for remaining passengers if any
      const assigned = [...selectedSeats];
      if (seatData?.rows) {
        for (const row of seatData.rows) {
          for (const s of row.seats) {
            if (assigned.length >= passengersCount) break;
            if (!s.isOccupied && !assigned.some((as) => as.code === s.code)) {
              assigned.push(s);
            }
          }
        }
      }
      onConfirmSeats(assigned, totalExtraCost);
    } else {
      onConfirmSeats(selectedSeats, totalExtraCost);
    }
  };

  // Filter rows by cabin if a tab is active
  const filteredRows = seatData?.rows?.filter((row) => {
    if (activeCabinFilter === 'all') return true;
    return row.cabin === activeCabinFilter;
  }) || [];

  // Active inspector seat is hoveredSeat or the latest selected seat
  const activeInspectorSeat = hoveredSeat || selectedSeats[selectedSeats.length - 1] || null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card seat-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="seat-modal-header">
          <div className="seat-header-info">
            <div className="seat-flight-badge">
              <span className="badge badge-primary">
                {flight.airline} • {flight.flightNumber}
              </span>
              <span className="seat-aircraft-tag">
                <Plane size={13} style={{ transform: 'rotate(-45deg)' }} />
                {flight.aircraft || 'Airbus A350-900 Ultra Long Haul'}
              </span>
              <span className="seat-route-tag">
                {flight.from} ➔ {flight.to}
              </span>
            </div>

            <h3 className="seat-modal-title">Interactive Aircraft Cabin Seat Selection</h3>
            <p className="seat-modal-subtitle">
              Select {passengersCount} seat{passengersCount > 1 ? 's' : ''} for your journey.
              {selectedSeats.length < passengersCount ? (
                <span className="seats-needed-tag">
                  ({passengersCount - selectedSeats.length} more required)
                </span>
              ) : (
                <span className="seats-complete-tag">✓ All passenger seats selected</span>
              )}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Quick Cabin Filter Nav */}
        <div className="cabin-nav-toolbar">
          <div className="cabin-nav-pills">
            <button
              type="button"
              className={`cabin-pill-btn ${activeCabinFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCabinFilter('all')}
            >
              Full Aircraft View
            </button>
            <button
              type="button"
              className={`cabin-pill-btn ${activeCabinFilter === 'first' ? 'active' : ''}`}
              onClick={() => setActiveCabinFilter('first')}
            >
              👑 First Class Suites (1-3)
            </button>
            <button
              type="button"
              className={`cabin-pill-btn ${activeCabinFilter === 'business' ? 'active' : ''}`}
              onClick={() => setActiveCabinFilter('business')}
            >
              💼 Business Lie-Flat (4-8)
            </button>
            <button
              type="button"
              className={`cabin-pill-btn ${activeCabinFilter === 'economy' ? 'active' : ''}`}
              onClick={() => setActiveCabinFilter('economy')}
            >
              ✈️ Economy & Extra Legroom (9-24)
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="seat-modal-body">
          {/* Legend */}
          <div className="seat-legend">
            <div className="legend-item">
              <div className="legend-swatch available" />
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-swatch selected" />
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="legend-swatch occupied" />
              <span>Occupied</span>
            </div>
            <div className="legend-item">
              <div className="legend-swatch extra-legroom" />
              <span>Extra Legroom</span>
            </div>
            <div className="legend-item">
              <div className="legend-swatch first-suite" />
              <span>Sky Suite</span>
            </div>
          </div>

          {/* Seat Inspector Card (Realistic Telemetry) */}
          <div className="seat-inspector-banner">
            <div className="inspector-icon-box">
              <Armchair size={22} className="inspector-armchair" />
            </div>
            <div className="inspector-details">
              {activeInspectorSeat ? (
                <div className="inspector-seat-specs">
                  <div className="inspector-top-row">
                    <span className="inspector-code">Seat {activeInspectorSeat.code}</span>
                    <span className="inspector-cabin-badge">
                      {activeInspectorSeat.cabin?.toUpperCase()} CLASS
                    </span>
                    <span className="inspector-type-badge">
                      {activeInspectorSeat.type === 'window' ? '🪟 Window' : activeInspectorSeat.type === 'aisle' ? '🚶 Direct Aisle' : '💺 Middle'}
                    </span>
                    {activeInspectorSeat.isOccupied ? (
                      <span className="badge badge-danger">Occupied / Unavailable</span>
                    ) : selectedSeats.some((s) => s.code === activeInspectorSeat.code) ? (
                      <span className="badge badge-success">✓ Selected For You</span>
                    ) : (
                      <span className="badge badge-primary">Available for Reservation</span>
                    )}
                  </div>
                  <div className="inspector-perks-row">
                    <span className="perk-chip"><Maximize2 size={12} /> {activeInspectorSeat.legroom || '32" Pitch'}</span>
                    <span className="perk-chip"><Tv size={12} /> 13.3" 4K Screen</span>
                    <span className="perk-chip"><Zap size={12} /> 110V AC & USB-C Power</span>
                    <span className="perk-chip fee">
                      {activeInspectorSeat.additionalCost > 0 ? `+${formatPrice(activeInspectorSeat.additionalCost)} Choice Fee` : 'Standard Included'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="inspector-placeholder">
                  <Info size={16} />
                  <span>Click or hover on any aircraft seat to view real-time dimensions, amenities, window angle, and power outlets.</span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="seat-loader-container">
              <Plane size={36} className="seat-plane-spinner" />
              <p>Calibrating live Boeing 787 / Airbus A350 passenger deck layout...</p>
            </div>
          ) : (
            <div className="aircraft-exterior-wrap">
              {/* Overwing Silhouettes & Jet Engines (Realistic Airline Aesthetics) */}
              <div className="aircraft-left-wing">
                <div className="wing-body" />
                <div className="engine-pod">
                  <div className="engine-fan-spinner" />
                  <span className="engine-label">ENG 1 • TRENT XWB</span>
                </div>
                <div className="wing-beacon-light port" />
              </div>

              <div className="aircraft-right-wing">
                <div className="wing-body" />
                <div className="engine-pod">
                  <div className="engine-fan-spinner" />
                  <span className="engine-label">ENG 2 • TRENT XWB</span>
                </div>
                <div className="wing-beacon-light stbd" />
              </div>

              {/* Aircraft Fuselage Tube Container */}
              <div className="aircraft-tube">
                {/* Nose Dome & Cockpit */}
                <div className="fuselage-nose-cone">
                  <div className="cockpit-windshield">
                    <span className="windshield-pane left" />
                    <span className="windshield-pane center-left" />
                    <span className="windshield-pane center-right" />
                    <span className="windshield-pane right" />
                  </div>
                  <div className="flight-deck-label">
                    <Plane size={15} /> FLIGHT DECK • BOEING 787 / A350
                  </div>
                </div>

                {/* Forward Galley & Lavatories */}
                <div className="cabin-facility-bar">
                  <span className="facility-item"><Coffee size={14} /> FORWARD GALLEY</span>
                  <span className="facility-item">LAVATORY A / B</span>
                </div>

                {/* Overwing Exit Door Indicators */}
                <div className="exit-door-row">
                  <div className="exit-door-marker left">◀ EXIT</div>
                  <span className="exit-sign-center">PRIMARY OVERWING ESCAPE DOORS</span>
                  <div className="exit-door-marker right">EXIT ▶</div>
                </div>

                {filteredRows.map((row, idx) => {
                  const isFirstOfClass =
                    idx === 0 || filteredRows[idx - 1]?.cabin !== row.cabin;

                  return (
                    <React.Fragment key={row.rowNumber}>
                      {isFirstOfClass && (
                        <div className={`cabin-divider-label ${row.cabin}`}>
                          <span className="divider-icon">
                            {row.cabin === 'first' ? '👑' : row.cabin === 'business' ? '💼' : '✈️'}
                          </span>
                          <span className="divider-title">
                            {row.cabin.toUpperCase()} CLASS CABIN
                          </span>
                          <span className="divider-subtitle">
                            {row.cabin === 'first'
                              ? '1-2-1 Enclosed Suites • 82" Full Flat Bed'
                              : row.cabin === 'business'
                              ? '1-2-1 Direct Aisle Access • Chef Dining'
                              : 'Ergonomic Contoured Seating • High-Speed Wi-Fi'}
                          </span>
                        </div>
                      )}

                      {/* Mid-Cabin Emergency Exit Marker for Rows 12 and 20 */}
                      {row.isExitRow && (
                        <div className="emergency-exit-divider">
                          <span className="exit-badge-green">EMERGENCY EXIT ROW • EXTRA LEGROOM (+38")</span>
                        </div>
                      )}

                      <div className={`seat-row cabin-${row.cabin} ${row.isExitRow ? 'is-exit-row' : ''}`}>
                        <span className="row-number-label">{row.rowNumber}</span>

                        {row.seats.map((seat, sIdx) => {
                          const isSelected = selectedSeats.some((s) => s.code === seat.code);
                          const isAisleGap =
                            (row.cabin === 'first' && sIdx === 1) ||
                            (row.cabin === 'business' && (sIdx === 1 || sIdx === 3)) ||
                            (row.cabin === 'economy' && (sIdx === 2 || sIdx === 5));

                          const seatClassType =
                            row.cabin === 'first'
                              ? 'first-suite'
                              : row.cabin === 'business'
                              ? 'business-pod'
                              : seat.additionalCost > 20
                              ? 'extra-legroom'
                              : 'standard-econ';

                          return (
                            <React.Fragment key={seat.code}>
                              <button
                                type="button"
                                disabled={seat.isOccupied}
                                className={`seat-btn ${seatClassType} ${
                                  isSelected
                                    ? 'selected'
                                    : seat.isOccupied
                                    ? 'occupied'
                                    : ''
                                }`}
                                onClick={() => handleSeatClick(seat)}
                                onMouseEnter={() => setHoveredSeat(seat)}
                                title={`Seat ${seat.code} (${seat.cabin.toUpperCase()}, ${seat.type}, ${
                                  seat.additionalCost ? `+${formatPrice(seat.additionalCost)}` : 'Standard'
                                })`}
                              >
                                <span className="seat-headrest" />
                                <span className="seat-label-text">
                                  {isSelected ? <Check size={14} strokeWidth={3} /> : seat.letter}
                                </span>
                              </button>
                              {isAisleGap && (
                                <div className="aisle-gap">
                                  <span className="aisle-carpet-runner" />
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Aft Galley & Tail Cone */}
                <div className="cabin-facility-bar aft">
                  <span className="facility-item"><Coffee size={14} /> AFT GALLEY</span>
                  <span className="facility-item">LAVATORY C / D / E</span>
                </div>

                <div className="fuselage-tail-cone">
                  <div className="apu-exhaust-marker">
                    <span>APU AIR EXHAUST</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="seat-modal-footer">
          <div className="selected-seats-summary">
            <div className="summary-icon-shield">
              <Armchair size={22} color="#0284c7" />
            </div>
            <div>
              <div className="summary-title-label">Passenger Seat Assignments:</div>
              <div className="selected-chips-wrap">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((s, idx) => (
                    <span key={s.code} className="seat-chip" onClick={() => handleSeatClick(s)} title="Click to remove">
                      <span className="pax-tag">PAX {idx + 1}:</span>
                      <strong>{s.code}</strong>
                      <span className="seat-chip-cabin">({s.cabin})</span>
                      <X size={12} className="remove-seat-x" />
                    </span>
                  ))
                ) : (
                  <span className="no-seats-hint">
                    No seats selected yet. Automated allocation will be assigned at check-in if none chosen.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="seat-footer-cta-col">
            {totalExtraCost > 0 && (
              <div className="seat-extras-price-box">
                <span className="extras-label">Premium Seat Upgrades</span>
                <span className="extras-amount">+{formatPrice(totalExtraCost)}</span>
              </div>
            )}
            <button type="button" className="btn-primary seat-confirm-btn" onClick={handleContinue}>
              <span>Confirm & Continue</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionModal;
