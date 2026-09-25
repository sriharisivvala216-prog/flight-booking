# 🖥️ SkyWings Frontend

The client-side single page application for SkyWings Flight Booking System, built with **React 19** and **Vite 7**.

## 📁 Directory Structure

```text
frontend/
├── public/                 # Static assets served as-is (images, 3D models, favicon)
│   ├── aeroplane-hero.png
│   ├── airplane.glb        # 3D aircraft model for interactive Hero
│   ├── hero-flight.jpg
│   └── vite.svg
├── src/
│   ├── assets/             # Bundled static assets
│   │   ├── hero-flight.jpg
│   │   └── react.svg
│   ├── components/         # Modular React UI components
│   │   ├── AdminDashboard.jsx      # Admin management panel
│   │   ├── AuthModal.jsx           # Login / register modal
│   │   ├── BoardingPassModal.jsx   # Generated e-ticket modal
│   │   ├── BookingModal.jsx        # Multi-step checkout modal
│   │   ├── FlightCanvas3D.jsx      # Interactive 3D airplane visualizer (Three.js)
│   │   ├── FlightCard.jsx          # Individual flight search result card
│   │   ├── FlightFilters.jsx       # Price, stops, airline filter sidebar
│   │   ├── FlightStatus.jsx        # Live flight tracker modal
│   │   ├── Footer.jsx              # Application footer
│   │   ├── HeroSearch.jsx          # Interactive flight search engine bar
│   │   ├── HomePage.jsx            # Home page view with destinations & loyalty
│   │   ├── LandingPage.jsx         # Modern immersive landing showcase
│   │   ├── MyBookings.jsx          # Passenger bookings and ticket history
│   │   ├── Navbar.jsx              # Navigation header with currency & auth
│   │   ├── PopularDestinations.jsx # Curated destinations carousel
│   │   └── SeatSelectionModal.jsx  # Interactive airplane seat layout selector
│   ├── context/            # React Context state management
│   │   ├── AuthContext.jsx         # User authentication state & JWT persistence
│   │   └── CurrencyContext.jsx     # Currency switcher (USD, EUR, GBP, INR)
│   ├── services/           # Network & API abstraction
│   │   └── api.js                  # Centralized HTTP request helper & endpoint methods
│   ├── styles/             # Dedicated CSS stylesheets per component
│   │   ├── boardingpass.css
│   │   ├── booking.css
│   │   ├── dashboard.css
│   │   ├── flights.css
│   │   ├── footer.css
│   │   ├── hero.css
│   │   ├── HomePage.css
│   │   ├── index.css
│   │   ├── landingPage.css
│   │   ├── modal.css
│   │   ├── navbar.css
│   │   └── seatmap.css
│   ├── App.css             # Main layout & container styles
│   ├── App.jsx             # Top-level view routing & modal orchestration
│   ├── index.css           # Global CSS variables, resets, and typography
│   └── main.jsx            # Vite DOM mount point & context providers
├── .env.example            # Environment configuration template
├── index.html              # Single Page Application HTML entry point
├── package.json            # Frontend dependencies and scripts
└── vite.config.js          # Vite configuration with proxy to backend port 5000
```

## 🛠️ Key Scripts

Run from the `frontend/` directory or root workspace:
- `npm run dev`: Starts the Vite development server on `http://localhost:5173`
- `npm run build`: Bundles the application for production to `frontend/dist`
- `npm run preview`: Locally previews the production build
- `npm run lint`: Runs ESLint on JSX and JS files
