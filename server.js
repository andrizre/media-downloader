const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');

const { PORT } = require('./src/config/constants');
const { applySecurityAndWpoHeaders } = require('./src/middlewares/cacheHeaders');
const { errorHandler } = require('./src/middlewares/errorHandler');
const apiRoutes = require('./src/routes/api');
const seoRoutes = require('./src/routes/seo');

const app = express();

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  threshold: 1024
}));

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(applySecurityAndWpoHeaders);

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  etag: true
}));

app.use(seoRoutes);
app.use('/api', apiRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log('🚀 SnapMedia Downloader berjalan di http://localhost:' + PORT);
});
