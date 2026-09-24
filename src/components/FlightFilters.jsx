import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const FlightFilters = ({
  stops,
  setStops,
  selectedAirlines,
  setSelectedAirlines,
  maxPrice,
  setMaxPrice,
  onResetFilters
}) => {
  const { formatPrice } = useCurrency();

  const airlinesList = [
    'Emirates',
    'Qatar Airways',
    'Singapore Airlines',
    'British Airways',
    'Virgin Atlantic',
    'Delta Air Lines',
    'American Airlines',
    'Air India',
    'Lufthansa',
    'IndiGo',
    'Qantas',
    'United Airlines'
  ];

  const handleAirlineToggle = (airline) => {
    if (selectedAirlines.includes(airline)) {
      setSelectedAirlines(selectedAirlines.filter((a) => a !== airline));
    } else {
      setSelectedAirlines([...selectedAirlines, airline]);
    }
  };

  return (
    <aside className="filters-sidebar">
      <div className="filters-header">
        <h3 className="filters-title">
          <SlidersHorizontal size={18} />
          Filters
        </h3>
        <button type="button" className="reset-filters-btn" onClick={onResetFilters}>
          <RotateCcw size={12} style={{ display: 'inline', marginRight: 4 }} />
          Reset All
        </button>
      </div>

      {/* Flight Stops */}
      <div className="filter-group">
        <h4 className="filter-group-title">Stops</h4>
        <label className="filter-option-row">
          <div className="filter-checkbox">
            <input
              type="radio"
              name="stops"
              checked={stops === 'all'}
              onChange={() => setStops('all')}
            />
            <span>All Flights</span>
          </div>
        </label>
        <label className="filter-option-row">
          <div className="filter-checkbox">
            <input
              type="radio"
              name="stops"
              checked={stops === '0'}
              onChange={() => setStops('0')}
            />
            <span>Non-stop Direct only</span>
          </div>
        </label>
        <label className="filter-option-row">
          <div className="filter-checkbox">
            <input
              type="radio"
              name="stops"
              checked={stops === '1'}
              onChange={() => setStops('1')}
            />
            <span>1 Stop</span>
          </div>
        </label>
      </div>

      {/* Price Slider */}
      <div className="filter-group">
        <h4 className="filter-group-title">Max Price per Passenger</h4>
        <input
          type="range"
          min="100"
          max="3500"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="price-range-slider"
        />
        <div className="price-slider-meta">
          <span>{formatPrice(100)}</span>
          <span style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
            Up to {formatPrice(maxPrice)}
          </span>
          <span>{formatPrice(3500)}</span>
        </div>
      </div>

      {/* Airlines Checklist */}
      <div className="filter-group">
        <h4 className="filter-group-title">Airlines</h4>
        <div style={{ maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
          {airlinesList.map((airline) => (
            <label key={airline} className="filter-option-row">
              <div className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedAirlines.length === 0 || selectedAirlines.includes(airline)}
                  onChange={() => handleAirlineToggle(airline)}
                />
                <span>{airline}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FlightFilters;
