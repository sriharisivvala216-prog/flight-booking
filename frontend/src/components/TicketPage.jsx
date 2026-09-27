import React, { useEffect, useState } from 'react';
import { Plane, Printer, QrCode, ArrowLeft, CheckCircle } from 'lucide-react';
import '../styles/boardingpass.css';

const TicketPage = () => {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('skywings_confirmed_booking');
      if (raw) {
        setBooking(JSON.parse(raw));
      } else {
        window.location.href = '/';
      }
    } catch {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    if (booking) {
      // Auto trigger print dialog shortly after ticket loads
      const t = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(t);
    }
  }, [booking]);

  if (!booking) return null;

  const passenger = booking.passengers?.[0] || {
    firstName: 'Valued',
    lastName: 'Passenger',
    seat: '4A'
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoHome = () => {
    localStorage.removeItem('skywings_confirmed_booking');
    window.location.href = '/';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Success Message (hidden in print) */}
      <div className="ticket-action-bar" style={{ marginBottom: '30px', textAlign: 'center', background: 'transparent', boxShadow: 'none' }}>
        <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 10px auto' }} />
        <h2 style={{ color: '#0f172a', marginBottom: '8px' }}>Payment Successful!</h2>
        <p style={{ color: '#64748b' }}>Here is your official E-Ticket. Please print or save it.</p>
      </div>

      {/* Ticket Container */}
      <div className="ticket-wrapper" style={{ maxWidth: '850px', width: '100%' }}>
        {/* Header */}
        <div className="ticket-header">
          <div className="ticket-airline-brand">
            <Plane size={24} color="#00e5ff" />
            <div>
              <h3>{booking.airline}</h3>
              <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>OFFICIAL BOARDING PASS</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="ticket-class-badge">
              {booking.cabinClass || 'Economy'}
            </span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="ticket-body">
          {/* Main Portion */}
          <div className="ticket-main-section">
            {/* Route */}
            <div className="ticket-route-display">
              <div>
                <div className="ticket-route-code">{booking.from}</div>
                <div className="ticket-route-city">{booking.fromCity}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <Plane size={20} color="#2563eb" style={{ marginBottom: 4 }} />
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{booking.duration}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="ticket-route-code">{booking.to}</div>
                <div className="ticket-route-city">{booking.toCity}</div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="ticket-grid-meta">
              <div>
                <div className="ticket-label">Passenger Name</div>
                <div className="ticket-val">
                  {passenger.firstName} {passenger.lastName}
                </div>
              </div>
              <div>
                <div className="ticket-label">Flight Number</div>
                <div className="ticket-val">{booking.flightNumber}</div>
              </div>
              <div>
                <div className="ticket-label">Date of Travel</div>
                <div className="ticket-val">{booking.departureDate}</div>
              </div>
              <div>
                <div className="ticket-label">Boarding Time</div>
                <div className="ticket-val" style={{ color: '#2563eb' }}>
                  {booking.departureTime}
                </div>
              </div>
              <div>
                <div className="ticket-label">Gate</div>
                <div className="ticket-val">{booking.gate || 'B22'}</div>
              </div>
              <div>
                <div className="ticket-label">Terminal</div>
                <div className="ticket-val">{booking.terminal || '3'}</div>
              </div>
            </div>

            {/* Barcode */}
            <div className="barcode-strip">
              <div>
                <div className="simulated-barcode" />
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                  PNR: {booking.pnr} • ETKT-94827103984
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="ticket-label">Seat Assigned</div>
                <div className="ticket-val" style={{ fontSize: '1.4rem', color: '#2563eb' }}>
                  {passenger.seat || '12A'}
                </div>
              </div>
            </div>
          </div>

          {/* Stub Portion */}
          <div className="ticket-stub-section">
            <div style={{ textAlign: 'center' }}>
              <div className="ticket-label">Electronic Gate Pass</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', margin: '4px 0 14px 0' }}>
                {booking.from} ➔ {booking.to}
              </div>
              <div className="qr-code-box">
                <QrCode size={64} color="#0f172a" />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 8 }}>
                Scan at Security & Gate
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="ticket-label">Seat:</span>
                <span style={{ fontWeight: 800 }}>{passenger.seat || '12A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="ticket-label">PNR:</span>
                <span style={{ fontWeight: 800, color: '#2563eb' }}>{booking.pnr}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (hidden in print) */}
      <div className="ticket-action-bar" style={{ marginTop: '30px', gap: '15px', background: 'transparent', boxShadow: 'none' }}>
        <button type="button" className="btn-secondary" onClick={handleGoHome} style={{ padding: '12px 24px' }}>
          <ArrowLeft size={16} />
          Back to Home
        </button>
        <button type="button" className="btn-primary" onClick={handlePrint} style={{ padding: '12px 24px' }}>
          <Printer size={16} />
          Print / Save PDF
        </button>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .ticket-action-bar { display: none !important; }
          .ticket-wrapper { margin-top: 0 !important; box-shadow: none !important; border: 2px solid #ccc !important; }
        }
      `}</style>
    </div>
  );
};

export default TicketPage;
