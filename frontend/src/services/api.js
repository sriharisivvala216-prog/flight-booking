// Configure API_BASE dynamically for localhost and cloud deployment
const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL.trim();
    if (url.endsWith('/')) url = url.slice(0, -1);
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  // When running in production (e.g. on Vercel), default to the live Render backend
  if (import.meta.env.PROD) {
    return 'https://flight-booking-pkkf.onrender.com/api';
  }
  return '/api';
};

const API_BASE = getApiBase();

export const api = {
  // Helper for requests
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('skywings_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const contentType = response.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || `HTTP Error ${response.status}` };
      }

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong with the request');
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  },


  // Auth
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async demoLogin(role = 'passenger') {
    return this.request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  },

  async getMe() {
    return this.request('/auth/me');
  },

  // Flights
  async getAirports() {
    return this.request('/flights/airports');
  },

  async getFeaturedDestinations() {
    return this.request('/flights/featured');
  },

  async searchFlights(params = {}) {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    return this.request(`/flights?${query.toString()}`);
  },

  async getFlight(id) {
    return this.request(`/flights/${id}`);
  },

  async getFlightSeats(id) {
    return this.request(`/flights/${id}/seats`);
  },

  async trackFlightStatus(query) {
    return this.request(`/flights/status/${encodeURIComponent(query)}`);
  },

  // Bookings
  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  async getBookings(userId, email) {
    const query = new URLSearchParams();
    if (userId) query.append('userId', userId);
    if (email) query.append('email', email);
    return this.request(`/bookings?${query.toString()}`);
  },

  async getBookingByPNR(pnr) {
    return this.request(`/bookings/${pnr}`);
  },

  async cancelBooking(pnr) {
    return this.request(`/bookings/${pnr}/cancel`, {
      method: 'PUT'
    });
  },

  // Admin
  async getAdminStats() {
    return this.request('/admin/stats');
  },

  async addFlight(flightData) {
    return this.request('/admin/flights', {
      method: 'POST',
      body: JSON.stringify(flightData)
    });
  },

  async updateFlightStatus(id, updateData) {
    return this.request(`/admin/flights/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  },

  async deleteFlight(id) {
    return this.request(`/admin/flights/${id}`, {
      method: 'DELETE'
    });
  }
};
