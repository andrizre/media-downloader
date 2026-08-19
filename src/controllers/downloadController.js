const { fetchInstagram } = require('../services/instagramService');
const { fetchTikTok } = require('../services/tiktokService');

function detectPlatform(url) {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim().toLowerCase();
  
  if (cleanUrl.includes('instagram.com') || cleanUrl.includes('instagr.am')) {
    return 'instagram';
  }
  if (cleanUrl.includes('tiktok.com') || cleanUrl.includes('douyin.com')) {
    return 'tiktok';
  }
  return null;
}

async function handleAutoDownload(req, res, next) {
  try {
    const { url, audioOnly } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Harap masukkan tautan video Instagram atau TikTok.' 
      });
    }

    const cleanUrl = url.trim();
    const platform = detectPlatform(cleanUrl);

    if (platform === 'instagram') {
      const data = await fetchInstagram(cleanUrl, { audioOnly });
      return res.json({ success: true, data });
    } else if (platform === 'tiktok') {
      const data = await fetchTikTok(cleanUrl, { audioOnly });
      return res.json({ success: true, data });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tautan tidak dikenali. Masukkan tautan Instagram atau TikTok yang valid (contoh: instagram.com/reel/... atau vt.tiktok.com/...).'
      });
    }
  } catch (error) {
    next(error);
  }
}

async function handleInstagramDownload(req, res, next) {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL Instagram diperlukan.' });
    const data = await fetchInstagram(url.trim());
    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function handleTikTokDownload(req, res, next) {
  try {
    const { url, audioOnly } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL TikTok diperlukan.' });
    const data = await fetchTikTok(url.trim(), { audioOnly });
    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  detectPlatform,
  handleAutoDownload,
  handleInstagramDownload,
  handleTikTokDownload
};
