// Jalankan sekali setelah import schema.sql: node database/seed.js
// Membuat akun admin default -> username: admin | password: admin123
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  try {
    const [rows] = await pool.query('SELECT id FROM admin WHERE username = ?', ['admin']);
    if (rows.length > 0) {
      console.log('Akun admin sudah ada, tidak perlu seeding ulang.');
      process.exit(0);
    }
    const hashed = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO admin (username, password, nama_lengkap) VALUES (?, ?, ?)',
      ['admin', hashed, 'Administrator Toko Batik']
    );
    console.log('Akun admin berhasil dibuat.');
    console.log('   Username : admin');
    console.log('   Password : admin123');
    process.exit(0);
  } catch (err) {
    console.error('Gagal seeding admin:', err.message);
    process.exit(1);
  }
}

seed();
