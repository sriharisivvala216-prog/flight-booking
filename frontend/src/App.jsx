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
import LandingPage from './components/LandingPage';
import SignInPage from './components/SignInPage';
import FlightReservationPage from './components/FlightReservationPage';
import SeatBookingPage from './components/SeatBookingPage';
import BookingPage from './components/BookingPage';
import TicketPage from './components/TicketPage';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { api } from './services/api';
import { Plane, AlertCircle } from 'lucide-react';
import './styles/flights.css';
import './App.css';

// Mirrors the fallback in SeatBookingPage so BookingModal always has a valid flight
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

function MainApp() {
  // Browser History & Route State (/sign-in, /seat-booking, /flights, /my-bookings, /status, /admin, /)
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || '/';
  });

  const [showLanding, setShowLanding] = useState(() => {
    const p = window.location.pathname;
    return p === '/' || p === '/home' || p === '';
  });

  const [currentTab, setCurrentTab] = useState(() => {
    const p = window.location.pathname;
    if (p === '/my-bookings') return 'bookings';
    if (p === '/status' || p === '/radar') return 'status';
    if (p === '/admin') return 'admin';
    return 'search';
  });

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

  // Confirmed booking – set after successful payment, triggers /reservation route
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  // History API Navigation function
  const navigate = useCallback((path, state = {}) => {
    try {
      window.history.pushState(state, '', path);
    } catch (e) {
      console.warn('History pushState error:', e);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sync tabs if applicable
    if (path === '/my-bookings') setCurrentTab('bookings');
    else if (path === '/status' || path === '/radar') setCurrentTab('status');
    else if (path === '/admin') setCurrentTab('admin');
    else if (path === '/flights' || path === '/search') {
      setCurrentTab('search');
      setShowLanding(false);
    }
  }, []);

  // Listen to browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname || '/';
      setCurrentPath(p);
      if (p === '/my-bookings') setCurrentTab('bookings');
      else if (p === '/status' || p === '/radar') setCurrentTab('status');
      else if (p === '/admin') setCurrentTab('admin');
      else if (p === '/flights' || p === '/search') {
        setCurrentTab('search');
        setShowLanding(false);
      } else if (p === '/' || p === '/home') {
        setShowLanding(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    if (currentTab === 'search' && !showLanding) {
      fetchFlights();
    }
  }, [fetchFlights, currentTab, showLanding]);

  const handleSearchSubmit = (newParams) => {
    setSearchParams(newParams);
    const resultsElement = document.getElementById('flight-results-anchor');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Navigates to dedicated /seat-booking route
  const handleSelectFlight = (flight) => {
    setActiveFlightForBooking(flight);
    navigate('/seat-booking');
  };

  const handleConfirmSeats = (seats, extraCost, flightFromSeatPage) => {
    setSelectedSeats(seats);
    setSeatExtrasCost(extraCost);
    // If SeatBookingPage passes its activeFlight back, store it so BookingModal gets the right flight
    if (flightFromSeatPage && !activeFlightForBooking) {
      setActiveFlightForBooking(flightFromSeatPage);
    }
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (newBooking) => {
    // The reservation page opens in a new tab via window.open in BookingModal.
    // Here we just close the modal and store the booking in case it's needed.
    setConfirmedReservation(newBooking);
    setActiveBoardingPass(null);
    setShowBookingModal(false);
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
    navigate(mode === 'register' ? '/register' : '/sign-in');
  };

  // ── ROUTE 1: DEDICATED FULL-PAGE SIGN-IN & REGISTER (/sign-in, /register) ──
  if (currentPath === '/sign-in' || currentPath === '/login') {
    return (
      <SignInPage 
        initialMode="login" 
        onNavigate={navigate}
        onAuthSuccess={() => navigate('/flights')}
      />
    );
  }

  if (currentPath === '/register' || currentPath === '/join') {
    return (
      <SignInPage 
        initialMode="register" 
        onNavigate={navigate}
        onAuthSuccess={() => navigate('/flights')}
      />
    );
  }

  // ── ROUTE 2: DEDICATED FULL-PAGE SEAT BOOKING (/seat-booking) ──
  if (currentPath === '/seat-booking') {
    // Resolve the active flight — priority: user-selected > first search result > DEFAULT_FLIGHT
    const seatPageFlight = activeFlightForBooking || (flights.length > 0 ? flights[0] : null) || DEFAULT_FLIGHT;
    return (
      <SeatBookingPage
        flight={seatPageFlight}
        cabinClass={searchParams.cabinClass}
        passengersCount={searchParams.passengers}
        onConfirmSeats={handleConfirmSeats}
        onNavigate={navigate}
      />
    );
  }

  // ── ROUTE 2a: FULL-PAGE BOOKING CHECKOUT (/booking) ──
  if (currentPath === '/booking') {
    return <BookingPage />;
  }

  // ── ROUTE 2b: FLIGHT RESERVATION CONFIRMATION PAGE (/reservation) ──
  // Works both when navigated to in-app AND when opened fresh in a new tab
  // (new tab has no React state, so we fall back to localStorage).
  if (currentPath === '/reservation') {
    const booking =
      confirmedReservation ||
      (() => {
        try {
          const raw = localStorage.getItem('skywings_confirmed_booking');
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();

    if (booking) {
      return (
        <>
          <FlightReservationPage
            booking={booking}
            onViewBoardingPass={(b) => setActiveBoardingPass(b)}
            onGoHome={() => navigate('/flights')}
            onMyBookings={() => navigate('/my-bookings')}
          />
          <BoardingPassModal
            isOpen={!!activeBoardingPass}
            booking={activeBoardingPass}
            onClose={() => setActiveBoardingPass(null)}
          />
        </>
      );
    }
  }

  // ── ROUTE 2c: FULL PAGE TICKET (/ticket) ──
  if (currentPath === '/ticket') {
    return <TicketPage />;
  }

  // ── ROUTE 3: 3D LANDING PAGE (/) ──
  if (showLanding && (currentPath === '/' || currentPath === '/home')) {
    return (
      <LandingPage
        onNavigate={navigate}
        onEnter={(customParams) => {
          if (customParams) {
            setSearchParams((prev) => ({
              ...prev,
              ...customParams,
            }));
          }
          setShowLanding(false);
          navigate('/flights');
        }}
      />
    );
  }

  // ── ROUTE 4: MAIN APPLICATION DECK (/flights, /my-bookings, /status, /admin) ──
  return (
    <div className="app-root">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'search') navigate('/flights');
          else if (tab === 'bookings') navigate('/my-bookings');
          else if (tab === 'status') navigate('/status');
          else if (tab === 'admin') navigate('/admin');
        }}
        onOpenAuth={handleOpenAuth}
        onNavigate={navigate}
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
            onSearchNewFlight={() => navigate('/flights')}
          />
        )}

        {/* Live Flight Status Tracker View */}
        {currentTab === 'status' && <FlightStatus />}

        {/* Admin Dashboard View */}
        {currentTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer onSelectTab={(tab) => {
        if (tab === 'search') navigate('/flights');
        else if (tab === 'bookings') navigate('/my-bookings');
        else if (tab === 'status') navigate('/status');
        else if (tab === 'admin') navigate('/admin');
      }} />

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
