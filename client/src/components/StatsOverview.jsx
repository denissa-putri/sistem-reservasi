import React from 'react';
import { CalendarCheck, Users, CheckCircle2, LayoutGrid } from 'lucide-react';

export default function StatsOverview({ stats, tablesCount, activeReservationsCount }) {
  const totalTables = stats?.totalTables || tablesCount || 10;
  const todayReservations = stats?.todayReservations || 0;
  const totalGuests = stats?.totalGuestsToday || 0;
  const totalConfirmed = stats?.confirmedCount || 0;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon amber">
          <CalendarCheck size={24} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Reservasi Hari Ini</span>
          <span className="stat-value">{todayReservations}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon emerald">
          <CheckCircle2 size={24} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Status Terkonfirmasi</span>
          <span className="stat-value">{totalConfirmed}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon sky">
          <Users size={24} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Estimasi Tamu Hari Ini</span>
          <span className="stat-value">{totalGuests} Tamu</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon rose">
          <LayoutGrid size={24} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Kapasitas Meja Kafe</span>
          <span className="stat-value">{totalTables} Meja</span>
        </div>
      </div>
    </div>
  );
}
