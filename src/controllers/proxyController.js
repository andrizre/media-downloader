const { USER_AGENT } = require('../config/constants');

async function handleProxyDownload(req, res, next) {
  try {
    const { url, filename } = req.query;
    if (!url) {
      return res.status(400).send('Parameter URL diperlukan.');
    }

    const mediaRes = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': url.includes('tikwm') ? 'https://www.tiktok.com/' : 'https://www.instagram.com/'
      }
    });

    if (!mediaRes.ok) {
      return res.status(mediaRes.status).send('Gagal mengunduh file media (HTTP ' + mediaRes.status + ')');
    }

    const isMp3 = filename?.toLowerCase().endsWith('.mp3');
    const contentType = mediaRes.headers.get('content-type') || (isMp3 ? 'audio/mpeg' : 'video/mp4');
    const cleanFilename = (filename || 'download_' + Date.now() + (isMp3 ? '.mp3' : '.mp4')).replace(/[^a-zA-Z0-9_.-]/g, '_');

    res.setHeader('Content-Disposition', 'attachment; filename="' + cleanFilename + '"');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const contentLength = mediaRes.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const reader = mediaRes.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error) {
    console.error('[Proxy Error]:', error.message);
    if (!res.headersSent) {
      res.status(500).send('Terjadi kesalahan internal saat mengalirkan file unduhan.');
    }
  }
}

module.exports = { handleProxyDownload };
