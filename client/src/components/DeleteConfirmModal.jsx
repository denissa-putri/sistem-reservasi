import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  reservation
}) {
  if (!isOpen || !reservation) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ color: 'var(--rose-400)' }}>
            <AlertTriangle size={20} />
            <span>Hapus Reservasi</span>
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-main)', marginBottom: '1rem', lineHeight: '1.6' }}>
            Apakah Anda yakin ingin menghapus reservasi untuk <strong>{reservation.customer_name}</strong>?
          </p>

          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Meja:</span>
              <span style={{ fontWeight: 600 }}>{reservation.table_number} ({reservation.table_name})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Jadwal:</span>
              <span>{reservation.reservation_date} ({reservation.time_slot})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Jumlah Tamu:</span>
              <span>{reservation.guest_count} Orang</span>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--rose-400)', marginTop: '0.85rem' }}>
            Tindakan ini tidak dapat dibatalkan dan data akan dihapus permanen dari database.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button 
            type="button" 
            id="btn-confirm-delete"
            className="btn-danger" 
            onClick={() => onConfirm(reservation.id)}
          >
            <Trash2 size={16} />
            <span>Ya, Hapus Reservasi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
