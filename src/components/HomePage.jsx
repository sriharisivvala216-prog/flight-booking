import React from "react";
import "../styles/HomePage.css";

const HomePage = () => {
  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">Flight App</h2>

        <nav className="menu">
          <a href="#">Home</a>
          <a href="#">Profile</a>
          <a href="#">Recent Flights</a>
          <a href="#">Booked Flights</a>
        </nav>

        <button className="logout">Logout</button>
      </aside>

      {/* Main Content */}
      <main className="content">
        {/* Hero Section */}
        <section className="hero">
          <div className="top-buttons">
            <button>Help</button>
            <button>Login</button>
            <button className="signup">Signup</button>
          </div>

          <div className="hero-text">
            <h1>Flight Booking System Website</h1>
            <p>Fast • Secure • Reliable</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-grid">
            <div>
              <h4>Flight Booking System</h4>
              <p>Book flights with confidence and comfort.</p>
            </div>

            <div>
              <h4>Company</h4>
              <p>About</p>
              <p>Careers</p>
              <p>Blog</p>
            </div>

            <div>
              <h4>Support</h4>
              <p>Help Center</p>
              <p>Contact</p>
              <p>FAQs</p>
            </div>
          </div>

          <p className="copyright">
            © 2026 Flight Booking System. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;
