import React from 'react';
import { Search, MapPin, ListFilter, Calendar, Clock } from 'lucide-react';

export const TIME_SLOTS = [
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
  '20:00 - 22:00'
];

export default function FilterControls({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  reservationsCount
}) {
  return (
    <div>
      <div className="view-tabs-container">
        <div className="tabs-group">
          <button 
            id="tab-map-view"
            className={`tab-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <MapPin size={16} />
            <span>Denah Meja Kafe</span>
          </button>
          <button 
            id="tab-list-view"
            className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <ListFilter size={16} />
            <span>Daftar Reservasi ({reservationsCount})</span>
          </button>
        </div>
      </div>

      <div className="filter-bar">
        {/* Search */}
        <div className="filter-item search-box">
          <Search size={16} className="input-icon" />
          <input 
            type="text"
            id="search-input"
            className="filter-input"
            placeholder="Cari nama pemesan, no. telepon, atau nomor meja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tanggal */}
        <div className="filter-item">
          <input 
            type="date"
            id="filter-date-input"
            className="filter-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Filter Jam / Sesi */}
        <div className="filter-item">
          <select 
            id="filter-slot-select"
            className="filter-select"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
          >
            <option value="">Semua Sesi Waktu</option>
            {TIME_SLOTS.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        {/* Filter Status (Hanya aktif untuk list view) */}
        {viewMode === 'list' && (
          <div className="filter-item" style={{ maxWidth: '170px' }}>
            <select 
              id="filter-status-select"
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">Semua Status</option>
              <option value="Confirmed">Terkonfirmasi</option>
              <option value="Completed">Selesai</option>
              <option value="Cancelled">Dibatalkan</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
