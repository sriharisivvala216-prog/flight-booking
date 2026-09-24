import React, { useState, useEffect, useCallback } from 'react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSearch from './components/HeroSearch';
import PopularDestinations from './components/PopularDestinations';
import FlightFilters from './components/FlightFilters';
import FlightCard from './components/FlightCard';
import SeatSelectionModal from './components/SeatSelectionModal';
import BookingModal from './components/BookingModal';
import BoardingPassModal from './components/BoardingPassModal';
import MyBookings from './components/MyBookings';
import FlightStatus from './components/FlightStatus';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { api } from './services/api';
import { Plane, AlertCircle } from 'lucide-react';
import './styles/flights.css';

function MainApp() {
  const [currentTab, setCurrentTab] = useState('search');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Search parameters
  const [searchParams, setSearchParams] = useState({
    from: 'JFK',
    to: 'DXB',
    date: '',
    cabinClass: 'economy',
    passengers: 1
  });

  // Filter & Sort states
  const [stops, setStops] = useState('all');
  const [maxPrice, setMaxPrice] = useState(3500);
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [sortOption, setSortOption] = useState('cheapest');

  // Flight search results
  const [flights, setFlights] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(false);

  // Booking Flow State
  const [activeFlightForBooking, setActiveFlightForBooking] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatExtrasCost, setSeatExtrasCost] = useState(0);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Boarding Pass Modal State
  const [activeBoardingPass, setActiveBoardingPass] = useState(null);

  // Fetch flights when search or filters change
  const fetchFlights = useCallback(async () => {
    setLoadingFlights(true);
    try {
      const params = {
        from: searchParams.from,
        to: searchParams.to,
        cabinClass: searchParams.cabinClass,
        stops: stops === 'all' ? '' : stops,
        maxPrice: maxPrice,
        sort: sortOption
      };

      const data = await api.searchFlights(params);
      let list = data.flights || [];

      // Filter airlines client-side if specific list selected
      if (selectedAirlines.length > 0) {
        list = list.filter((f) => selectedAirlines.includes(f.airline));
      }

      setFlights(list);
    } catch (err) {
      console.error('Error fetching flights:', err);
    } finally {
      setLoadingFlights(false);
    }
  }, [searchParams, stops, maxPrice, sortOption, selectedAirlines]);

  useEffect(() => {
    if (currentTab === 'search') {
      fetchFlights();
    }
  }, [fetchFlights, currentTab]);


  const handleSearchSubmit = (newParams) => {
    setSearchParams(newParams);
    const resultsElement = document.getElementById('flight-results-anchor');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectFlight = (flight) => {
    setActiveFlightForBooking(flight);
    setShowSeatModal(true);
  };

  const handleConfirmSeats = (seats, extraCost) => {
    setSelectedSeats(seats);
    setSeatExtrasCost(extraCost);
    setShowSeatModal(false);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (newBooking) => {
    // Optionally pre-open boarding pass
    setActiveBoardingPass(newBooking);
  };

  const handleViewBoardingPass = (booking) => {
    setActiveBoardingPass(booking);
  };

  const handleResetFilters = () => {
    setStops('all');
    setMaxPrice(3500);
    setSelectedAirlines([]);
    setSortOption('cheapest');
  };

  const handleSelectPopularDestination = (destCode) => {
    setSearchParams((prev) => ({
      ...prev,
      from: 'JFK',
      to: destCode
    }));
    const resultsElement = document.getElementById('flight-results-anchor');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAuth = (mode = 'login') => {
    const safeMode = typeof mode === 'string' && mode === 'register' ? 'register' : 'login';
    setAuthMode(safeMode);
    setShowAuthModal(true);
  };

  return (
    <div className="app-root">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Views */}
      <main>
        {currentTab === 'search' && (
          <div>
            {/* Hero Search Section */}
            <HeroSearch
              onSearch={handleSearchSubmit}
              initialParams={searchParams}
            />

            {/* Popular Destinations Cards */}
            <PopularDestinations onSelectDestination={handleSelectPopularDestination} />

            {/* Flight Results Anchor */}
            <div id="flight-results-anchor" className="container flights-section">
              <div className="flights-layout">
                {/* Left: Filters Sidebar */}
                <FlightFilters
                  stops={stops}
                  setStops={setStops}
                  selectedAirlines={selectedAirlines}
                  setSelectedAirlines={setSelectedAirlines}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  onResetFilters={handleResetFilters}
                />

                {/* Right: Results Header & Cards */}
                <div>
                  <div className="results-header">
                    <div>
                      <h2 className="results-count-title">
                        {loadingFlights
                          ? 'Searching available flights...'
                          : `${flights.length} Flight${flights.length === 1 ? '' : 's'} Found`}
                      </h2>
                      <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                        {searchParams.from} ➔ {searchParams.to} • {searchParams.cabinClass.replace('_', ' ')}
                      </p>
                    </div>

                    {/* Sorting Tabs */}
                    <div className="sort-tabs-container">
                      <button
                        type="button"
                        className={`sort-tab-btn ${sortOption === 'cheapest' ? 'active' : ''}`}
                        onClick={() => setSortOption('cheapest')}
                      >
                        Cheapest
                      </button>
                      <button
                        type="button"
                        className={`sort-tab-btn ${sortOption === 'fastest' ? 'active' : ''}`}
                        onClick={() => setSortOption('fastest')}
                      >
                        Fastest
                      </button>
                      <button
                        type="button"
                        className={`sort-tab-btn ${sortOption === 'departure' ? 'active' : ''}`}
                        onClick={() => setSortOption('departure')}
                      >
                        Earliest
                      </button>
                    </div>
                  </div>

                  {/* Flight List */}
                  {loadingFlights ? (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                      <Plane size={36} color="#2563eb" style={{ animation: 'floatSlow 2s infinite ease-in-out' }} />
                      <p style={{ marginTop: 12, fontWeight: 600 }}>Comparing live global airlines...</p>
                    </div>
                  ) : flights.length === 0 ? (
                    <div className="no-flights-state">
                      <AlertCircle size={44} color="#94a3b8" style={{ marginBottom: 12 }} />
                      <h3>No Matching Flights Found</h3>
                      <p style={{ color: '#64748b', marginBottom: 20 }}>
                        We couldn't find flights matching your specific filters. Try expanding your price cap or clearing stops.
                      </p>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleResetFilters}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div>
                      {flights.map((flight) => (
                        <FlightCard
                          key={flight.id}
                          flight={flight}
                          cabinClass={searchParams.cabinClass}
                          onSelectFlight={handleSelectFlight}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Bookings View */}
        {currentTab === 'bookings' && (
          <MyBookings
            onOpenBoardingPass={handleViewBoardingPass}
            onSearchNewFlight={() => setCurrentTab('search')}
          />
        )}

        {/* Live Flight Status Tracker View */}
        {currentTab === 'status' && <FlightStatus />}

        {/* Admin Dashboard View */}
        {currentTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer onSelectTab={(tab) => setCurrentTab(tab)} />

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authMode}
        onClose={() => setShowAuthModal(false)}
      />

      <SeatSelectionModal
        isOpen={showSeatModal}
        flight={activeFlightForBooking}
        cabinClass={searchParams.cabinClass}
        passengersCount={searchParams.passengers}
        onConfirmSeats={handleConfirmSeats}
        onClose={() => setShowSeatModal(false)}
      />

      <BookingModal
        isOpen={showBookingModal}
        flight={activeFlightForBooking}
        cabinClass={searchParams.cabinClass}
        selectedSeats={selectedSeats}
        seatExtrasCost={seatExtrasCost}
        departureDate={searchParams.date}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={handleBookingSuccess}
        onViewBoardingPass={handleViewBoardingPass}
      />

      <BoardingPassModal
        isOpen={!!activeBoardingPass}
        booking={activeBoardingPass}
        onClose={() => setActiveBoardingPass(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <MainApp />
      </CurrencyProvider>
    </AuthProvider>
  );
}
