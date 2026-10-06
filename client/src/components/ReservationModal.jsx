import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Coffee, AlertCircle, Save, Phone, User, MessageSquare } from 'lucide-react';
import { TIME_SLOTS } from './FilterControls';

export default function ReservationModal({
  isOpen,
  onClose,
  onSubmit,
  editData,
  tables,
  initialTableId,
  initialDate,
  initialSlot
}) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    table_id: '',
    reservation_date: '',
    time_slot: TIME_SLOTS[1], // Default 12:00 - 14:00
    guest_count: 2,
    special_requests: '',
    status: 'Confirmed'
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Saat modal dibuka atau editData berubah
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      if (editData) {
        setFormData({
          customer_name: editData.customer_name || '',
          customer_phone: editData.customer_phone || '',
          table_id: editData.table_id || '',
          reservation_date: editData.reservation_date || '',
          time_slot: editData.time_slot || TIME_SLOTS[1],
          guest_count: editData.guest_count || 2,
          special_requests: editData.special_requests || '',
          status: editData.status || 'Confirmed'
        });
      } else {
        const todayStr = initialDate || new Date().toISOString().split('T')[0];
        setFormData({
          customer_name: '',
          customer_phone: '',
          table_id: initialTableId || (tables.length > 0 ? tables[0].id : ''),
          reservation_date: todayStr,
          time_slot: initialSlot || TIME_SLOTS[1],
          guest_count: 2,
          special_requests: '',
          status: 'Confirmed'
        });
      }
    }
  }, [isOpen, editData, initialTableId, initialDate, initialSlot, tables]);

  if (!isOpen) return null;

  const isEditing = !!editData;
  const selectedTable = tables.find(t => String(t.id) === String(formData.table_id));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuestCountChange = (delta) => {
    const maxCapacity = selectedTable ? selectedTable.capacity : 10;
    setFormData(prev => {
      const nextCount = Number(prev.guest_count) + delta;
      if (nextCount < 1) return prev;
      if (nextCount > maxCapacity) {
        setErrorMessage(`Kapasitas meja ${selectedTable?.name || ''} maksimal ${maxCapacity} orang.`);
        return prev;
      }
      setErrorMessage('');
      return { ...prev, guest_count: nextCount };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.customer_name.trim()) {
      setErrorMessage('Nama pemesan wajib diisi.');
      return;
    }
    if (!formData.customer_phone.trim()) {
      setErrorMessage('Nomor telepon / WhatsApp wajib diisi.');
      return;
    }
    if (!formData.table_id) {
      setErrorMessage('Silakan pilih meja kafe.');
      return;
    }
    if (!formData.reservation_date) {
      setErrorMessage('Pilih tanggal reservasi.');
      return;
    }
    if (!formData.time_slot) {
      setErrorMessage('Pilih sesi jam reservasi.');
      return;
    }

    if (selectedTable && formData.guest_count > selectedTable.capacity) {
      setErrorMessage(`Jumlah tamu (${formData.guest_count}) melebihi kapasitas ${selectedTable.name} (maks ${selectedTable.capacity} orang).`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, editData?.id);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Coffee size={20} color="var(--amber-400)" />
            <span>{isEditing ? 'Perbarui Reservasi Meja' : 'Buat Reservasi Meja Baru'}</span>
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMessage && (
              <div className="error-banner">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Nama Pemesan */}
            <div className="form-group">
              <label>Nama Pemesan / Tamu *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="customer_name"
                  id="modal-customer-name"
                  className="form-control"
                  placeholder="Contoh: Budi Santoso"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* No Telepon */}
            <div className="form-group">
              <label>Nomor Telepon / WhatsApp *</label>
              <input
                type="tel"
                name="customer_phone"
                id="modal-customer-phone"
                className="form-control"
                placeholder="Contoh: 081234567890"
                value={formData.customer_phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* Pilihan Meja */}
            <div className="form-group">
              <label>Pilih Meja Kafe *</label>
              <select
                name="table_id"
                id="modal-table-select"
                className="form-control"
                value={formData.table_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Pilih Meja --</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.table_number} - {t.name} ({t.area} &bull; Maks {t.capacity} Orang)
                  </option>
                ))}
              </select>
              {selectedTable && (
                <div className="form-hint">
                  {selectedTable.description} &bull; Kapasitas meja: <strong>{selectedTable.capacity} orang</strong>
                </div>
              )}
            </div>

            {/* Tanggal & Sesi Waktu */}
            <div className="form-row">
              <div className="form-group">
                <label>Tanggal Reservasi *</label>
                <input
                  type="date"
                  name="reservation_date"
                  id="modal-reservation-date"
                  className="form-control"
                  value={formData.reservation_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Sesi Waktu *</label>
                <select
                  name="time_slot"
                  id="modal-time-slot"
                  className="form-control"
                  value={formData.time_slot}
                  onChange={handleChange}
                  required
                >
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Jumlah Tamu */}
            <div className="form-group">
              <label>Jumlah Tamu *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: '40px', height: '40px', justifyContent: 'center', padding: 0 }}
                  onClick={() => handleGuestCountChange(-1)}
                  disabled={formData.guest_count <= 1}
                >
                  -
                </button>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, minWidth: '60px', textAlign: 'center' }}>
                  {formData.guest_count} Orang
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: '40px', height: '40px', justifyContent: 'center', padding: 0 }}
                  onClick={() => handleGuestCountChange(1)}
                  disabled={selectedTable && formData.guest_count >= selectedTable.capacity}
                >
                  +
                </button>
                <span className="form-hint" style={{ margin: 0 }}>
                  (Maksimal {selectedTable ? selectedTable.capacity : 10} orang untuk meja ini)
                </span>
              </div>
            </div>

            {/* Status (Hanya saat edit) */}
            {isEditing && (
              <div className="form-group">
                <label>Status Reservasi</label>
                <select
                  name="status"
                  id="modal-status-select"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Confirmed">Terkonfirmasi (Confirmed)</option>
                  <option value="Completed">Selesai / Sudah Hadir (Completed)</option>
                  <option value="Cancelled">Dibatalkan (Cancelled)</option>
                </select>
              </div>
            )}

            {/* Catatan Khusus */}
            <div className="form-group">
              <label>Catatan Khusus (Opsional)</label>
              <textarea
                name="special_requests"
                id="modal-special-requests"
                className="form-control"
                placeholder="Contoh: Butuh baby chair, stopkontak untuk laptop, dekorasi meja anniversary..."
                value={formData.special_requests}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Batal
            </button>
            <button type="submit" id="btn-submit-reservation" className="btn-primary" disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Konfirmasi Reservasi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
