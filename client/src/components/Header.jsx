import React, { useState, useEffect } from 'react';
import { Coffee, Plus, Clock } from 'lucide-react';

export default function Header({ onOpenNewReservation }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="header-container">
      <div className="brand-wrapper">
        <div className="brand-logo-icon">
          <Coffee size={28} />
        </div>
        <div className="brand-info">
          <h1>AROMA & CO.</h1>
          <p>Artisan Coffeehouse & Table Reservation System</p>
        </div>
      </div>

      <div className="header-actions">
        <div className="live-badge">
          <span className="pulse-dot"></span>
          <Clock size={14} />
          <span>{formattedDate} &bull; {formattedTime} WIB</span>
        </div>

        <button 
          id="btn-new-reservation"
          className="btn-primary" 
          onClick={() => onOpenNewReservation()}
        >
          <Plus size={18} />
          <span>Reservasi Baru</span>
        </button>
      </div>
    </header>
  );
}
