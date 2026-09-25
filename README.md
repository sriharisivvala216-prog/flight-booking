# ✈️ SkyWings Flight Booking System

A full-stack flight booking web application built with **React + Vite** (frontend) and **Express + MongoDB** (backend).

## 🚀 Features

- **Flight Search** — Search flights by route, cabin class, stops, price, and airline
- **Seat Selection** — Interactive seat map with first, business, and economy cabins
- **Booking Flow** — Multi-step booking: passengers → add-ons → payment → confirmation
- **Boarding Pass** — Digital boarding pass / e-ticket generation
- **My Bookings** — View, manage, and cancel bookings via PNR
- **Flight Status Tracker** — Live flight status lookup
- **Admin Dashboard** — Add/update/delete flights and view booking statistics
- **Authentication** — JWT-based register/login with demo login support
- **Multi-Currency** — USD, EUR, GBP, INR support
- **SkyWings Loyalty Club** — Miles tracking and rewards catalog

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, CSS Modules |
| Backend | Express 5, Node.js |
| Database | MongoDB (Mongoose) with JSON file fallback |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Icons | Lucide React |
| Animations | canvas-confetti |

## 📦 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB) — optional, JSON fallback is built-in

### Installation

```bash
# Clone the repository
git clone https://github.com/sriharisivvala216-prog/flightbooking.git
cd flightbooking

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Then edit .env and fill in your MONGODB_URI and JWT_SECRET
```

### Running Locally

```bash
# Start both frontend (port 5173) and backend (port 5000) concurrently
npm run dev
```

The app will be available at `http://localhost:5173` and the API at `http://localhost:5000/api`.

### Individual Services & Commands

```bash
npm run frontend   # Start only the Vite frontend (port 5173)
npm run backend    # Start only the Express backend (port 5000)
npm run build      # Build frontend for production
npm run seed       # Seed MongoDB with sample records
npm run preview    # Preview production frontend build
```

## ⚙️ Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/skywings_flightbooking
JWT_SECRET=your_jwt_secret_key_here
```

> **Note:** The server runs in **dual-mode** — if MongoDB is unavailable, it automatically falls back to JSON file storage in `backend/data/`.

## 📁 Project Structure

```text
flightbooking/
├── frontend/               # React 19 + Vite 7 Single Page Application
│   ├── public/             # Static files (images, 3D glb models)
│   ├── src/
│   │   ├── assets/         # App assets
│   │   ├── components/     # UI components (Navbar, HeroSearch, BookingModal, ...)
│   │   ├── context/        # AuthContext, CurrencyContext
│   │   ├── services/       # Client API abstraction (api.js)
│   │   ├── styles/         # CSS stylesheets per component
│   │   ├── App.jsx         # App view manager & modal controller
│   │   ├── index.css       # Design tokens, typography & CSS variables
│   │   └── main.jsx        # App entry point
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite config with API proxy
│   └── package.json        # Frontend dependencies
├── backend/                # Express 5 + Node.js REST API
│   ├── config/             # MongoDB connection configuration
│   ├── data/               # JSON file fallback data store
│   ├── middleware/         # JWT auth & admin guards
│   ├── models/             # Mongoose schemas (User, Flight, Booking, Airport)
│   ├── routes/             # Express route modules (auth, flights, bookings, admin)
│   ├── services/           # Database service abstraction (MongoDB + JSON fallback)
│   ├── utils/              # Seed utility & filesystem DB helpers
│   ├── app.js              # Express app setup & route mounting
│   ├── server.js           # Server listen entrypoint
│   └── package.json        # Backend dependencies
├── api/                    # Vercel serverless function entrypoint
│   └── index.js            # Serverless bridge to backend/app.js
├── .env.example            # Environment variable template
├── package.json            # Root workspace orchestrator
├── STRUCTURE.md            # Detailed structural documentation
└── vercel.json             # Vercel deployment configuration
```

## 🔐 Demo Login

Use the **Demo Login** button in the app to log in as a demo passenger or admin without registration.

## 📄 License

MIT
