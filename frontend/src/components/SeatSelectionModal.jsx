import React, { useState, useEffect } from 'react';
import { X, Plane, Check, Armchair, ArrowRight } from 'lucide-react';
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
    // Default initial auto-selected seats based on passengersCount
    setSelectedSeats([]);
  }, [flight, isOpen]);

  if (!isOpen || !flight) return null;

  const handleSeatClick = (seat) => {
    if (seat.isOccupied) return;

    const exists = selectedSeats.find((s) => s.code === seat.code);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.code !== seat.code));
    } else {
      if (selectedSeats.length >= passengersCount) {
        // Replace the oldest selected seat if exceeded
        const updated = [...selectedSeats.slice(1), seat];
        setSelectedSeats(updated);
      } else {
        setSelectedSeats([...selectedSeats, seat]);
      }
    }
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card seat-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="seat-modal-header">
          <div>
            <div className="seat-flight-badge">
              <span className="badge badge-primary">
                {flight.airline} • {flight.flightNumber} • {cabinClass ? cabinClass.replace('_', ' ').toUpperCase() : 'ECONOMY'}
              </span>
              <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                {flight.from} → {flight.to}
              </span>
            </div>

            <h3 style={{ marginTop: 6, fontSize: '1.35rem' }}>Select Aircraft Seats</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Select {passengersCount} seat{passengersCount > 1 ? 's' : ''} for your party.
              {selectedSeats.length < passengersCount &&
                ` (${passengersCount - selectedSeats.length} more needed)`}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
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
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p>Loading interactive 3D cabin layout...</p>
            </div>
          ) : (
            <div className="aircraft-tube">
              <div className="cockpit-indicator">
                <Plane size={16} /> Cockpit / Front of Aircraft
              </div>

              {seatData?.rows?.map((row, idx) => {
                const isFirstOfClass =
                  idx === 0 || seatData.rows[idx - 1]?.cabin !== row.cabin;

                return (
                  <React.Fragment key={row.rowNumber}>
                    {isFirstOfClass && (
                      <div className="cabin-divider-label">
                        {row.cabin.toUpperCase()} CLASS CABIN
                      </div>
                    )}

                    <div className="seat-row">
                      <span className="row-number-label">{row.rowNumber}</span>

                      {row.seats.map((seat, sIdx) => {
                        const isSelected = selectedSeats.some((s) => s.code === seat.code);
                        const isAisleGap =
                          (row.cabin === 'first' && sIdx === 1) ||
                          (row.cabin === 'business' && (sIdx === 1 || sIdx === 3)) ||
                          (row.cabin === 'economy' && (sIdx === 2 || sIdx === 5));

                        return (
                          <React.Fragment key={seat.code}>
                            <button
                              type="button"
                              disabled={seat.isOccupied}
                              className={`seat-btn ${
                                isSelected
                                  ? 'selected'
                                  : seat.isOccupied
                                  ? 'occupied'
                                  : seat.additionalCost > 20
                                  ? 'extra-legroom'
                                  : ''
                              }`}
                              onClick={() => handleSeatClick(seat)}
                              title={`Seat ${seat.code} (${seat.type}, ${
                                seat.additionalCost ? `+${formatPrice(seat.additionalCost)}` : 'Standard'
                              })`}
                            >
                              {isSelected ? <Check size={14} /> : seat.letter}
                            </button>
                            {isAisleGap && <div className="aisle-gap" />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="seat-modal-footer">
          <div className="selected-seats-summary">
            <Armchair size={20} color="#2563eb" />
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Seats Chosen:</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((s) => (
                    <span key={s.code} className="seat-chip">
                      {s.code}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    Auto-assignment will be used if none chosen
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {totalExtraCost > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Seat Extras</div>
                <div style={{ fontWeight: 700, color: '#2563eb' }}>
                  +{formatPrice(totalExtraCost)}
                </div>
              </div>
            )}
            <button type="button" className="btn-primary" onClick={handleContinue}>
              Continue to Passenger Info
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionModal;
