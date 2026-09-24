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

The app will be available at `http://localhost:5173`.

### Other Scripts

```bash
npm run client     # Start only the Vite frontend
npm run server     # Start only the Express backend
npm run build      # Build the frontend for production
npm run seed       # Seed MongoDB with sample data from JSON files
```

## ⚙️ Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/
JWT_SECRET=your_jwt_secret_key_here
```

> **Note:** The server runs in **dual-mode** — if MongoDB is unavailable, it automatically falls back to JSON file storage in `server/data/`.

## 📁 Project Structure

```
flightbooking/
├── src/                    # React frontend
│   ├── components/         # UI components (Navbar, HeroSearch, BookingModal, …)
│   ├── context/            # AuthContext, CurrencyContext
│   ├── services/           # API client (api.js)
│   └── styles/             # CSS stylesheets
├── server/                 # Express backend
│   ├── config/             # MongoDB connection
│   ├── data/               # JSON file fallback data store
│   ├── middleware/         # JWT auth middleware
│   ├── models/             # Mongoose models (User, Flight, Booking, Airport)
│   ├── routes/             # API route handlers
│   ├── services/           # DB abstraction service
│   └── utils/              # File DB helpers, seed script
├── .env.example            # Environment variable template
└── vite.config.js          # Vite + API proxy config
```

## 🔐 Demo Login

Use the **Demo Login** button in the app to log in as a demo passenger or admin without registration.

## 📄 License

MIT
