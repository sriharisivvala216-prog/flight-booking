import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const PopularDestinations = ({ onSelectDestination }) => {
  const [destinations, setDestinations] = useState([]);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await api.getFeaturedDestinations();
        setDestinations(data.featured || []);
      } catch (err) {
        console.error('Failed to load featured destinations', err);
      }
    };
    fetchFeatured();
  }, []);

  if (destinations.length === 0) return null;

  return (
    <section className="container" style={{ padding: '60px 24px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: 8 }}>
            <Sparkles size={12} />
            Trending Deals
          </div>
          <h2 style={{ fontSize: '2rem' }}>Explore Iconic Global Destinations</h2>
          <p style={{ color: '#64748b' }}>
            Handpicked international hotspots with special seasonal airfare reductions.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24
        }}
      >
        {destinations.map((dest) => (
          <div
            key={dest.code}
            style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--slate-200)',
              transition: 'all var(--transition-normal)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={() => onSelectDestination(dest.code)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <div style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
              <img
                src={dest.image}
                alt={dest.city}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(7, 13, 30, 0.75)',
                  backdropFilter: 'blur(6px)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                From {formatPrice(dest.fromPrice)}
              </div>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <MapPin size={15} color="#2563eb" />
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{dest.country}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>{dest.city}</h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', flex: 1, marginBottom: 16 }}>
                {dest.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#2563eb',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                <span>Find Flights</span>
                <ArrowRight size={15} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularDestinations;
