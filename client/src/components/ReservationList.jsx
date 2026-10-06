import React from 'react';
import { Edit2, Trash2, Calendar, Clock, Users, FileText, AlertCircle } from 'lucide-react';

export default function ReservationList({
  reservations,
  onEdit,
  onDelete,
  onOpenNew
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="status-badge available">Terkonfirmasi</span>;
      case 'Completed':
        return <span className="status-badge completed">Selesai</span>;
      case 'Cancelled':
        return <span className="status-badge cancelled">Dibatalkan</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  if (!reservations || reservations.length === 0) {
    return (
      <div className="table-responsive">
        <div className="empty-state">
          <AlertCircle className="empty-icon" />
          <h3>Tidak Ada Data Reservasi</h3>
          <p>Belum ada pemesanan meja yang sesuai dengan filter atau kata kunci pencarian Anda.</p>
          <button className="btn-primary" onClick={onOpenNew}>
            Buat Reservasi Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Pemesan</th>
            <th>Meja & Lokasi</th>
            <th>Jadwal Sesi</th>
            <th>Tamu</th>
            <th>Catatan Khusus</th>
            <th>Status</th>
            <th style={{ textAlign: 'center' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((res, index) => (
            <tr key={res.id}>
              <td style={{ color: 'var(--text-dim)', fontWeight: 600 }}>
                #{index + 1}
              </td>
              <td>
                <div className="customer-cell">
                  <span className="customer-name">{res.customer_name}</span>
                  <span className="customer-phone">{res.customer_phone}</span>
                </div>
              </td>
              <td>
                <div>
                  <span className="table-tag">
                    {res.table_number} - {res.table_name}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                    Area: {res.table_area} (Maks {res.table_capacity} Kursi)
                  </div>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                    <Calendar size={13} color="var(--amber-400)" />
                    <span>{res.reservation_date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Clock size={13} />
                    <span>{res.time_slot}</span>
                  </div>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={14} color="var(--sky-400)" />
                  <span style={{ fontWeight: 600 }}>{res.guest_count} Orang</span>
                </div>
              </td>
              <td>
                {res.special_requests ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', fontSize: '0.8rem', maxWidth: '220px' }}>
                    <FileText size={13} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ color: 'var(--text-muted)' }}>{res.special_requests}</span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>-</span>
                )}
              </td>
              <td>
                {getStatusBadge(res.status)}
              </td>
              <td>
                <div className="actions-cell" style={{ justifyContent: 'center' }}>
                  <button 
                    className="btn-icon-action edit" 
                    title="Edit Reservasi"
                    onClick={() => onEdit(res)}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button 
                    className="btn-icon-action delete" 
                    title="Hapus Reservasi"
                    onClick={() => onDelete(res)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
