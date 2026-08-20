const express = require('express');
const router = express.Router();
const { 
  handleAutoDownload,
  handleTikTokDownload,
  handleInstagramDownload,
  handleYouTubeDownload,
  handleFacebookDownload,
  handleTwitterDownload,
  handleSpotifyDownload
} = require('../controllers/downloadController');
const { handleProxyDownload } = require('../controllers/proxyController');
const { SUPPORTED_PLATFORMS } = require('../config/constants');

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SnapMedia (Cobalt-Style Multi-Platform Downloader)',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    supported: SUPPORTED_PLATFORMS
  });
});

// Download Endpoints
router.post('/download/auto', handleAutoDownload);
router.post('/download/tiktok', handleTikTokDownload);
router.post('/download/instagram', handleInstagramDownload);
router.post('/download/youtube', handleYouTubeDownload);
router.post('/download/facebook', handleFacebookDownload);
router.post('/download/twitter', handleTwitterDownload);
router.post('/download/spotify', handleSpotifyDownload);

// Proxy Stream Download
router.get('/proxy/download', handleProxyDownload);

module.exports = router;
