function errorHandler(err, req, res, next) {
  console.error('[App Error]:', err.message || err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.',
    timestamp: new Date().toISOString()
  });
}

module.exports = { errorHandler };
