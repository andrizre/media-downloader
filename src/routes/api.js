const express = require('express');
const router = express.Router();
const { 
  handleAutoDownload, 
  handleInstagramDownload, 
  handleTikTokDownload 
} = require('../controllers/downloadController');
const { handleProxyDownload } = require('../controllers/proxyController');

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SnapMedia (Cobalt-Style Downloader)',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    supported: ['instagram', 'tiktok']
  });
});

router.post('/download/auto', handleAutoDownload);
router.post('/download/instagram', handleInstagramDownload);
router.post('/download/tiktok', handleTikTokDownload);
router.get('/proxy/download', handleProxyDownload);

module.exports = router;
