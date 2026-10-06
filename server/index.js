import express from 'express';
import cors from 'cors';
import { db, initDatabase } from './db.js';

// Inisialisasi DB
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. GET /api/tables
// Mengambil daftar meja (opsional status reservasi berdasarkan date & time_slot)
// ==========================================
app.get('/api/tables', (req, { res } = {}) => {
  try {
    const { date, time_slot } = req.query;

    const tables = db.prepare('SELECT * FROM tables ORDER BY id ASC').all();

    if (date && time_slot) {
      // Cek reservasi aktif pada tanggal dan jam tersebut
      const reservations = db.prepare(`
        SELECT r.id, r.table_id, r.customer_name, r.customer_phone, r.guest_count, r.status
        FROM reservations r
        WHERE r.reservation_date = ? 
          AND r.time_slot = ? 
          AND r.status != 'Cancelled'
      `).all(date, time_slot);

      const resMap = new Map();
      for (const r of reservations) {
        resMap.set(r.table_id, r);
      }

      const tablesWithStatus = tables.map(t => {
        const activeRes = resMap.get(t.id);
        return {
          ...t,
          is_reserved: !!activeRes,
          reservation: activeRes || null
        };
      });

      return req.res.json({ success: true, data: tablesWithStatus });
    }

    req.res.json({ success: true, data: tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    req.res.status(500).json({ success: false, message: 'Gagal mengambil data meja', error: error.message });
  }
});

// ==========================================
// 2. GET /api/reservations
// Menampilkan semua reservasi dengan filter (date, status, search)
// ==========================================
app.get('/api/reservations', (req, res) => {
  try {
    const { date, status, search } = req.query;

    let query = `
      SELECT 
        r.*, 
        t.table_number, 
        t.name as table_name, 
        t.capacity as table_capacity, 
        t.area as table_area
      FROM reservations r
      JOIN tables t ON r.table_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ` AND r.reservation_date = ?`;
      params.push(date);
    }

    if (status && status !== 'All') {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (r.customer_name LIKE ? OR r.customer_phone LIKE ? OR t.table_number LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY r.reservation_date DESC, r.time_slot ASC, r.id DESC`;

    const reservations = db.prepare(query).all(...params);
    res.json({ success: true, data: reservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data reservasi', error: error.message });
  }
});

// ==========================================
// 3. GET /api/reservations/:id
// Menampilkan detail 1 reservasi
// ==========================================
app.get('/api/reservations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const reservation = db.prepare(`
      SELECT 
        r.*, 
        t.table_number, 
        t.name as table_name, 
        t.capacity as table_capacity, 
        t.area as table_area
      FROM reservations r
      JOIN tables t ON r.table_id = t.id
      WHERE r.id = ?
    `).get(id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });
    }

    res.json({ success: true, data: reservation });
  } catch (error) {
    console.error('Error fetching reservation detail:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail reservasi', error: error.message });
  }
});

// ==========================================
// 4. POST /api/reservations
// Menambah reservasi meja baru (Create) dengan validasi bentrok
// ==========================================
app.post('/api/reservations', (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      table_id,
      reservation_date,
      time_slot,
      guest_count,
      special_requests
    } = req.body;

    // Validasi input
    if (!customer_name || !customer_phone || !table_id || !reservation_date || !time_slot || !guest_count) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi semua kolom yang wajib diisi (Nama, No Telepon, Meja, Tanggal, Jam, Jumlah Tamu).'
      });
    }

    // Pastikan meja ada
    const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(table_id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Meja yang dipilih tidak ditemukan.' });
    }

    if (guest_count > table.capacity) {
      return res.status(400).json({
        success: false,
        message: `Kapasitas meja ${table.name} (${table.table_number}) maksimal ${table.capacity} orang, tamu yang dimasukkan ${guest_count} orang.`
      });
    }

    // Cek ketersediaan (bentrok jadwal)
    const conflict = db.prepare(`
      SELECT id, customer_name FROM reservations
      WHERE table_id = ? 
        AND reservation_date = ? 
        AND time_slot = ? 
        AND status != 'Cancelled'
    `).get(table_id, reservation_date, time_slot);

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Meja ${table.table_number} (${table.name}) sudah direservasi oleh ${conflict.customer_name} pada tanggal ${reservation_date} pukul ${time_slot}. Silakan pilih meja atau jam lain.`
      });
    }

    // Simpan reservasi
    const insertStmt = db.prepare(`
      INSERT INTO reservations (
        customer_name, customer_phone, table_id, reservation_date, time_slot, guest_count, special_requests, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed')
    `);

    const result = insertStmt.run(
      customer_name.trim(),
      customer_phone.trim(),
      Number(table_id),
      reservation_date,
      time_slot,
      Number(guest_count),
      special_requests ? special_requests.trim() : null
    );

    // Ambil data yang baru dibuat
    const newReservation = db.prepare(`
      SELECT 
        r.*, 
        t.table_number, 
        t.name as table_name, 
        t.capacity as table_capacity, 
        t.area as table_area
      FROM reservations r
      JOIN tables t ON r.table_id = t.id
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Reservasi meja berhasil dibuat!',
      data: newReservation
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat reservasi', error: error.message });
  }
});

// ==========================================
// 5. PUT /api/reservations/:id
// Memperbarui data reservasi (Update)
// ==========================================
app.put('/api/reservations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_name,
      customer_phone,
      table_id,
      reservation_date,
      time_slot,
      guest_count,
      special_requests,
      status
    } = req.body;

    const existing = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan.' });
    }

    const newTableId = table_id ? Number(table_id) : existing.table_id;
    const newDate = reservation_date || existing.reservation_date;
    const newSlot = time_slot || existing.time_slot;
    const newStatus = status || existing.status;
    const newGuestCount = guest_count ? Number(guest_count) : existing.guest_count;

    // Cek kapasitas meja jika meja atau kapasitas diubah
    const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(newTableId);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Meja tidak ditemukan.' });
    }
    if (newGuestCount > table.capacity) {
      return res.status(400).json({
        success: false,
        message: `Kapasitas meja ${table.name} maksimal ${table.capacity} orang.`
      });
    }

    // Jika status bukan 'Cancelled', periksa apakah ada bentrok dengan reservasi lain
    if (newStatus !== 'Cancelled') {
      const conflict = db.prepare(`
        SELECT id, customer_name FROM reservations
        WHERE table_id = ? 
          AND reservation_date = ? 
          AND time_slot = ? 
          AND status != 'Cancelled'
          AND id != ?
      `).get(newTableId, newDate, newSlot, id);

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Meja ${table.table_number} sudah dipesan oleh ${conflict.customer_name} pada waktu tersebut.`
        });
      }
    }

    const updateStmt = db.prepare(`
      UPDATE reservations
      SET customer_name = ?,
          customer_phone = ?,
          table_id = ?,
          reservation_date = ?,
          time_slot = ?,
          guest_count = ?,
          special_requests = ?,
          status = ?,
          updated_at = (datetime('now', 'localtime'))
      WHERE id = ?
    `);

    updateStmt.run(
      customer_name ? customer_name.trim() : existing.customer_name,
      customer_phone ? customer_phone.trim() : existing.customer_phone,
      newTableId,
      newDate,
      newSlot,
      newGuestCount,
      special_requests !== undefined ? special_requests.trim() : existing.special_requests,
      newStatus,
      id
    );

    const updatedRes = db.prepare(`
      SELECT 
        r.*, 
        t.table_number, 
        t.name as table_name, 
        t.capacity as table_capacity, 
        t.area as table_area
      FROM reservations r
      JOIN tables t ON r.table_id = t.id
      WHERE r.id = ?
    `).get(id);

    res.json({
      success: true,
      message: 'Reservasi berhasil diperbarui!',
      data: updatedRes
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui reservasi', error: error.message });
  }
});

// ==========================================
// 6. DELETE /api/reservations/:id
// Menghapus data reservasi (Delete)
// ==========================================
app.delete('/api/reservations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id, customer_name FROM reservations WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan.' });
    }

    db.prepare('DELETE FROM reservations WHERE id = ?').run(id);

    res.json({
      success: true,
      message: `Reservasi atas nama ${existing.customer_name} berhasil dihapus!`,
      data: { id: Number(id) }
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus reservasi', error: error.message });
  }
});

// ==========================================
// 7. GET /api/stats
// Statistik ringkasan untuk dashboard
// ==========================================
app.get('/api/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalTables = db.prepare('SELECT COUNT(*) as count FROM tables').get().count;
    const totalReservations = db.prepare('SELECT COUNT(*) as count FROM reservations').get().count;
    const todayReservations = db.prepare('SELECT COUNT(*) as count FROM reservations WHERE reservation_date = ?').get(today).count;
    const confirmedCount = db.prepare("SELECT COUNT(*) as count FROM reservations WHERE status = 'Confirmed'").get().count;
    const totalGuestsToday = db.prepare("SELECT SUM(guest_count) as total FROM reservations WHERE reservation_date = ? AND status != 'Cancelled'").get(today).total || 0;

    res.json({
      success: true,
      data: {
        totalTables,
        totalReservations,
        todayReservations,
        confirmedCount,
        totalGuestsToday,
        todayDate: today
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server reservasi kafe berjalan di http://localhost:${PORT}`);
});
