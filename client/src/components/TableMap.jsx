import React from 'react';
import { Users, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function TableMap({ 
  tables, 
  selectedDate, 
  selectedSlot, 
  onSelectTableForBooking,
  onViewReservation
}) {
  // Kelompokkan meja berdasarkan area
  const areas = ['Indoor', 'Outdoor', 'VIP', 'Bar'];

  const areaTitles = {
    Indoor: 'Indoor Lounge & Coffee Counter',
    Outdoor: 'Garden Patio & Terrace Area',
    VIP: 'VIP Meeting & Lounge Room',
    Bar: 'Brewing Bar Stool'
  };

  return (
    <div className="floorplan-wrapper">
      <div className="section-header">
        <div>
          <h2>Denah Meja Interaktif</h2>
          <p>
            Status ketersediaan meja untuk tanggal <strong>{selectedDate}</strong> sesi <strong>{selectedSlot || 'Semua Sesi'}</strong>
          </p>
        </div>

        <div className="floorplan-legend">
          <div className="legend-item">
            <span className="legend-badge available"></span>
            <span>Tersedia ({tables.filter(t => !t.is_reserved).length})</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge reserved"></span>
            <span>Sudah Dipesan ({tables.filter(t => t.is_reserved).length})</span>
          </div>
        </div>
      </div>

      {areas.map(areaName => {
        const areaTables = tables.filter(t => t.area.toLowerCase() === areaName.toLowerCase());
        if (areaTables.length === 0) return null;

        return (
          <div key={areaName} className="area-section">
            <div className="area-header">
              <span className={`area-badge ${areaName.toLowerCase()}`}>{areaName}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {areaTitles[areaName]}
              </span>
            </div>

            <div className="table-grid">
              {areaTables.map(t => {
                const isReserved = !!t.is_reserved;

                return (
                  <div 
                    key={t.id} 
                    className={`table-card ${isReserved ? 'reserved' : 'available'}`}
                    onClick={() => {
                      if (!isReserved) {
                        onSelectTableForBooking(t.id);
                      } else if (t.reservation) {
                        onViewReservation(t.reservation);
                      }
                    }}
                  >
                    <div className="table-top">
                      <div className="table-number-pill">
                        <span>{t.table_number}</span>
                      </div>
                      <span className={`status-badge ${isReserved ? 'reserved' : 'available'}`}>
                        {isReserved ? (
                          <>
                            <XCircle size={12} />
                            <span>Terisi</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} />
                            <span>Tersedia</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="table-title">{t.name}</div>
                    <div className="table-desc">{t.description}</div>

                    <div className="table-details">
                      <div className="capacity-info">
                        <Users size={14} />
                        <span>Kapasitas: {t.capacity} Orang</span>
                      </div>

                      {isReserved && t.reservation && (
                        <span className="reserved-guest-info">
                          a.n. {t.reservation.customer_name}
                        </span>
                      )}
                    </div>

                    {!isReserved ? (
                      <button 
                        className="table-action-btn book"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTableForBooking(t.id);
                        }}
                      >
                        <span>Pesan Meja Ini</span>
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <button 
                        className="table-action-btn view"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (t.reservation) onViewReservation(t.reservation);
                        }}
                      >
                        <span>Lihat Detail Booking</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
