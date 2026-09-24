import React, { useState } from 'react';
import { Plane, Wifi, Utensils, Luggage, ChevronDown, ChevronUp, Armchair, Clock } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const FlightCard = ({ flight, cabinClass, onSelectFlight }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { formatPrice } = useCurrency();

  const price = flight.pricing?.[cabinClass] || flight.basePrice || 500;

  return (
    <article className="flight-card">
      <div className="flight-card-body">
        {/* Airline Info */}
        <div className="airline-info">
          <img
            src={flight.airlineLogo}
            alt={flight.airline}
            className="airline-logo-img"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&auto=format&fit=crop&q=80';
            }}
          />
          <div>
            <div className="airline-name">{flight.airline}</div>
            <div className="flight-no">{flight.flightNumber}</div>
            <div style={{ marginTop: 4 }}>
              <span className={`badge ${flight.status === 'On Time' ? 'badge-success' : 'badge-warning'}`}>
                {flight.status || 'On Time'}
              </span>
            </div>
          </div>
        </div>

        {/* Route Timeline */}
        <div className="route-timeline">
          <div className="route-point">
            <div className="route-time">{flight.departureTime}</div>
            <div className="route-airport-code">{flight.from}</div>
            <div className="route-city">{flight.fromCity}</div>
          </div>

          <div className="route-path-visual">
            <div className="duration-tag">{flight.duration}</div>
            <div className="flight-path-line">
              <Plane size={16} className="flight-path-plane-icon" />
            </div>
            <div className={`stops-tag ${flight.stops > 0 ? 'with-stops' : ''}`}>
              {flight.stopDetails || (flight.stops === 0 ? 'Non-stop Direct' : `${flight.stops} Stop`)}
            </div>
          </div>

          <div className="route-point right">
            <div className="route-time">{flight.arrivalTime}</div>
            <div className="route-airport-code">{flight.to}</div>
            <div className="route-city">{flight.toCity}</div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flight-price-action">
          <div className="flight-price-amount">{formatPrice(price)}</div>
          <div className="price-subtext">per passenger, taxes incl.</div>
          <button
            type="button"
            className="btn-primary select-flight-btn"
            onClick={() => onSelectFlight(flight)}
          >
            <Armchair size={16} />
            Select Seats
          </button>
        </div>
      </div>

      {/* Card Footer: Amenities & Toggle */}
      <div className="flight-card-footer">
        <div className="amenities-list">
          {flight.baggage && (
            <span className="amenity-item" title={flight.baggage}>
              <Luggage size={15} color="#2563eb" />
              <span>{flight.baggage}</span>
            </span>
          )}
          {flight.mealsIncluded && (
            <span className="amenity-item" title="Complimentary meal">
              <Utensils size={15} color="#10b981" />
              <span>Complimentary Meal</span>
            </span>
          )}
          {flight.wifiAvailable && (
            <span className="amenity-item" title="High-speed Wi-Fi available">
              <Wifi size={15} color="#06b6d4" />
              <span>Onboard Wi-Fi</span>
            </span>
          )}
        </div>

        <button
          type="button"
          className="toggle-details-btn"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Flight Details'}
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expandable Flight Details */}
      {showDetails && (
        <div className="flight-expanded-details">
          <div className="details-grid">
            <div>
              <div className="detail-box-title">Aircraft Model</div>
              <div className="detail-box-value">{flight.aircraft || 'Boeing 787-9'}</div>
            </div>
            <div>
              <div className="detail-box-title">Departure Terminal / Gate</div>
              <div className="detail-box-value">
                Terminal {flight.terminal || '1'} • Gate {flight.gate || 'TBD'}
              </div>
            </div>
            <div>
              <div className="detail-box-title">Available Seats</div>
              <div className="detail-box-value" style={{ color: '#16a34a' }}>
                {flight.availableSeats || 24} seats left
              </div>
            </div>
            <div>
              <div className="detail-box-title">Selected Cabin Class</div>
              <div className="detail-box-value" style={{ textTransform: 'capitalize' }}>
                {cabinClass.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default FlightCard;
