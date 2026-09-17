const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|webp/;
  const isValidExt = allowed.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = allowed.test(file.mimetype);
  if (isValidExt && isValidMime) {
    return cb(null, true);
  }
  cb(new Error('Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan.'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

module.exports = upload;
