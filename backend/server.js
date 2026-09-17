require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const pelangganRoutes = require('./routes/pelanggan');

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'rahasia-batik-nusantara',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 4, // 4 jam
      sameSite: 'lax',
      secure: false // set true jika sudah pakai HTTPS
    }
  })
);

// Info jumlah keranjang tersedia di semua request lewat req.session.cart

app.use('/api/admin', adminRoutes);
app.use('/api/pelanggan', pelangganRoutes);
app.use('/api', indexRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Toko Batik Nusantara API aktif.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
});

// Error handler umum (misalnya error dari multer)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Terjadi kesalahan pada server.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Toko Batik Nusantara berjalan di http://localhost:${PORT}`);
});
