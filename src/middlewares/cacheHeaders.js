function applySecurityAndWpoHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.path.startsWith('/css/') || req.path.startsWith('/js/') || req.path.startsWith('/assets/') || req.path.endsWith('.svg') || req.path.endsWith('.png') || req.path.endsWith('.ico')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

  next();
}

module.exports = { applySecurityAndWpoHeaders };
