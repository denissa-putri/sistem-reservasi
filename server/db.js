import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'cafe_reservations.db');

export const db = new DatabaseSync(dbPath);

export function initDatabase() {
  // Aktifkan foreign key
  db.exec('PRAGMA foreign_keys = ON;');

  // Tabel Master Meja
  db.exec(`
    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      area TEXT NOT NULL,
      description TEXT
    );
  `);

  // Tabel Reservasi
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      table_id INTEGER NOT NULL,
      reservation_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      special_requests TEXT,
      status TEXT NOT NULL DEFAULT 'Confirmed',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
    );
  `);

  // Seed data meja jika masih kosong
  const countRow = db.prepare('SELECT COUNT(*) as count FROM tables').get();
  if (countRow.count === 0) {
    const seedTables = [
      { table_number: 'IN-01', name: 'Meja Jendela 1', capacity: 2, area: 'Indoor', description: 'Dekat kaca besar dengan pemandangan jalan' },
      { table_number: 'IN-02', name: 'Meja Jendela 2', capacity: 2, area: 'Indoor', description: 'Suasana tenang cocok untuk pasangan/laptop' },
      { table_number: 'IN-03', name: 'Meja Utama 1', capacity: 4, area: 'Indoor', description: 'Meja kayu jati tengah ruangan nyaman' },
      { table_number: 'IN-04', name: 'Meja Utama 2', capacity: 4, area: 'Indoor', description: 'Dekat bar kopi dengan aroma biji espresso' },
      { table_number: 'IN-05', name: 'Meja Keluarga Besar', capacity: 6, area: 'Indoor', description: 'Meja bundar luas untuk pertemuan keluarga' },
      { table_number: 'OUT-01', name: 'Terrace Garden 1', capacity: 4, area: 'Outdoor', description: 'Area taman terbuka yang sejuk dan asri' },
      { table_number: 'OUT-02', name: 'Terrace Garden 2', capacity: 4, area: 'Outdoor', description: 'Smoking area santai di samping tanaman hias' },
      { table_number: 'OUT-03', name: 'Gazebo Santai', capacity: 6, area: 'Outdoor', description: 'Pojok gazebo beratap dengan lampu gantung hangat' },
      { table_number: 'VIP-01', name: 'Private Lounge VIP', capacity: 8, area: 'VIP', description: 'Ruang tertutup dengan sofa empuk, AC dan Smart TV' },
      { table_number: 'BAR-01', name: 'Bar Counter Coffee', capacity: 2, area: 'Bar', description: 'High-stool tepat di depan barista brewing' }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO tables (table_number, name, capacity, area, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const t of seedTables) {
      insertStmt.run(t.table_number, t.name, t.capacity, t.area, t.description);
    }

    // Seed sample reservasi hari ini untuk demo awal
    const today = new Date().toISOString().split('T')[0];
    const insertResStmt = db.prepare(`
      INSERT INTO reservations (customer_name, customer_phone, table_id, reservation_date, time_slot, guest_count, special_requests, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertResStmt.run(
      'Budi Santoso',
      '081234567890',
      1,
      today,
      '14:00 - 16:00',
      2,
      'Minta dekat colokan listrik untuk laptop',
      'Confirmed'
    );

    insertResStmt.run(
      'Siti Nurhaliza',
      '082198765432',
      9,
      today,
      '18:00 - 20:00',
      6,
      'Ulang tahun kecil, mohon disiapkan lilin di dessert',
      'Confirmed'
    );
  }
}
