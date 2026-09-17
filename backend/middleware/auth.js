function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu.' });
}

function requirePelanggan(req, res, next) {
  if (req.session && req.session.pelanggan) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu.' });
}

module.exports = { requireAdmin, requirePelanggan };
