# 🚀 SkyWings Backend

The RESTful API backend service for SkyWings Flight Booking System, built with **Node.js**, **Express 5**, and **MongoDB / Mongoose** (with automated dual-mode JSON file fallback).

## 📁 Directory Structure

```text
backend/
├── config/                 # Configuration modules
│   └── db.js               # MongoDB connection manager with health status check
├── data/                   # Fallback local JSON database store
│   ├── airports.json       # Airport locations & metadata
│   ├── bookings.json       # Passenger bookings and ticket reservations
│   ├── flights.json        # Flight schedules, pricing, and seat layouts
│   └── users.json          # Registered accounts and demo credentials
├── middleware/             # Express middlewares
│   └── auth.js             # JWT verification and Admin role-checking guards
├── models/                 # Mongoose database schemas & models
│   ├── Airport.js          # Airport schema
│   ├── Booking.js          # Booking record schema
│   ├── Flight.js           # Flight details & seat map schema
│   └── User.js             # User account schema with password hashing
├── routes/                 # API route handlers
│   ├── admin.js            # Admin stats & flight inventory management (/api/admin)
│   ├── auth.js             # Registration, login, and demo auth (/api/auth)
│   ├── bookings.js         # Booking creation, lookup, cancellation (/api/bookings)
│   └── flights.js          # Flight search, airports, details (/api/flights)
├── services/               # Core business logic layer
│   └── dbService.js        # Universal database service abstraction (MongoDB + JSON fallback)
├── utils/                  # Helper utilities
│   ├── db.js               # Low-level JSON file read/write helper
│   └── seed.js             # Database seeder utility to populate MongoDB from JSON
├── .env.example            # Backend environment variables template
├── app.js                  # Express application setup, middleware, and route mounting
├── package.json            # Backend dependencies and scripts
└── server.js               # Local development entry point & HTTP listener
```

## 🔌 API Endpoints Summary

- **Authentication** (`/api/auth`)
  - `POST /register`: Create a new passenger account
  - `POST /login`: Authenticate with email/password
  - `POST /demo-login`: Instant demo login for passenger or admin
  - `GET /me`: Fetch authenticated user profile

- **Flights** (`/api/flights`)
  - `GET /`: Search flights by query parameters (from, to, date, cabinClass, stops, etc.)
  - `GET /airports`: List all supported airports
  - `GET /featured`: Popular destination deals
  - `GET /:id`: Specific flight details
  - `GET /:id/seats`: Real-time seat layout & availability
  - `GET /status/:query`: Live flight tracker lookup

- **Bookings** (`/api/bookings`)
  - `POST /`: Create a new flight reservation & generate PNR
  - `GET /`: Retrieve bookings by `userId` or `email`
  - `GET /:pnr`: Look up booking by 6-character PNR code
  - `PUT /:pnr/cancel`: Cancel an existing booking

- **Admin** (`/api/admin`)
  - `GET /stats`: Revenue, booking, and operational metrics
  - `POST /flights`: Add a new flight route
  - `PATCH /flights/:id/status`: Update flight departure/arrival status
  - `DELETE /flights/:id`: Cancel/delete a flight

- **Health Check** (`/api/health`)
  - `GET /`: Health check showing backend version & MongoDB connection state

## 🛠️ Key Scripts

Run from the `backend/` directory or root workspace:
- `npm start`: Starts server using Node (`node server.js`)
- `npm run dev`: Starts server with watch mode (`node --watch server.js`)
- `npm run seed`: Seeds MongoDB with the default JSON records
