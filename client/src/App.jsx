import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import FilterControls, { TIME_SLOTS } from './components/FilterControls';
import TableMap from './components/TableMap';
import ReservationList from './components/ReservationList';
import ReservationModal from './components/ReservationModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ToastNotification from './components/ToastNotification';

export default function App() {
  const todayStr = new Date().toISOString().split('T')[0];

  // Filters & Views
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]); // Default siang: 12:00 - 14:00
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [preselectedTableId, setPreselectedTableId] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingReservation, setDeletingReservation] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch Tables with availability based on selected date & slot
  const fetchTables = useCallback(async () => {
    try {
      let url = '/api/tables';
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedSlot) params.append('time_slot', selectedSlot);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setTables(json.data);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
    }
  }, [selectedDate, selectedSlot]);

  // Fetch Reservations with filters
  const fetchReservations = useCallback(async () => {
    try {
      let url = '/api/reservations';
      const params = new URLSearchParams();
      // Bila di list view, kita filter sesuai kontrol
      if (selectedDate) params.append('date', selectedDate);
      if (selectedStatus && selectedStatus !== 'All') params.append('status', selectedStatus);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setReservations(json.data);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
    }
  }, [selectedDate, selectedStatus, searchQuery]);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // Reload all data
  const reloadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchTables(), fetchReservations(), fetchStats()]);
    setLoading(false);
  }, [fetchTables, fetchReservations, fetchStats]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Open modal to create new reservation
  const handleOpenNewReservation = (tableId = null) => {
    setEditData(null);
    setPreselectedTableId(tableId);
    setIsModalOpen(true);
  };

  // Open modal to edit existing reservation
  const handleEditReservation = (res) => {
    setEditData(res);
    setPreselectedTableId(res.table_id);
    setIsModalOpen(true);
  };

  // Open delete confirm dialog
  const handleOpenDelete = (res) => {
    setDeletingReservation(res);
    setIsDeleteModalOpen(true);
  };

  // Handle Form Submission (Create or Update)
  const handleSubmitReservation = async (formData, editId) => {
    const isEdit = !!editId;
    const url = isEdit ? `/api/reservations/${editId}` : '/api/reservations';
    const method = isEdit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Terjadi kesalahan pada server');
    }

    showToast(
      isEdit 
        ? `Reservasi ${formData.customer_name} berhasil diperbarui!` 
        : `Reservasi meja berhasil dibuat untuk ${formData.customer_name}!`,
      'success'
    );

    // Refresh data
    reloadData();
  };

  // Confirm Delete
  const handleConfirmDelete = async (id) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal menghapus reservasi.');
      }

      setIsDeleteModalOpen(false);
      setDeletingReservation(null);
      showToast(result.message || 'Reservasi berhasil dihapus.', 'success');
      reloadData();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus reservasi.', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header onOpenNewReservation={() => handleOpenNewReservation()} />

      {/* Stats Summary Bar */}
      <StatsOverview 
        stats={stats} 
        tablesCount={tables.length}
        activeReservationsCount={reservations.length}
      />

      {/* Filter & View Switcher */}
      <FilterControls 
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedSlot={selectedSlot}
        setSelectedSlot={setSelectedSlot}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        reservationsCount={reservations.length}
      />

      {/* Main View Area */}
      {viewMode === 'map' ? (
        <TableMap 
          tables={tables}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onSelectTableForBooking={(tableId) => handleOpenNewReservation(tableId)}
          onViewReservation={(res) => {
            // Find full reservation data and edit
            const found = reservations.find(r => r.id === res.id) || res;
            handleEditReservation(found);
          }}
        />
      ) : (
        <ReservationList 
          reservations={reservations}
          onEdit={handleEditReservation}
          onDelete={handleOpenDelete}
          onOpenNew={() => handleOpenNewReservation()}
        />
      )}

      {/* Modal Form: Create / Edit */}
      <ReservationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitReservation}
        editData={editData}
        tables={tables}
        initialTableId={preselectedTableId}
        initialDate={selectedDate}
        initialSlot={selectedSlot}
      />

      {/* Modal Confirm Delete */}
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        reservation={deletingReservation}
      />

      {/* Toast Feedback */}
      <ToastNotification 
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
