const { fetchTikTok } = require('../services/tiktokService');
const { fetchInstagram } = require('../services/instagramService');
const { fetchYouTube } = require('../services/youtubeService');
const { fetchFacebook } = require('../services/facebookService');
const { fetchTwitter } = require('../services/twitterService');
const { fetchSpotify } = require('../services/spotifyService');
const { 
  fetchCapCut, 
  fetchSoundCloud, 
  fetchGDrive, 
  fetchGitHub, 
  fetchSnackVideo, 
  fetchUniversal 
} = require('../services/otherServices');

function detectPlatform(url) {
  if (!url || typeof url !== 'string') return null;
  const u = url.trim().toLowerCase();

  if (u.includes('tiktok.com') || u.includes('douyin.com')) return 'tiktok';
  if (u.includes('instagram.com') || u.includes('instagr.am')) return 'instagram';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('facebook.com') || u.includes('fb.watch') || u.includes('fb.com')) return 'facebook';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
  if (u.includes('spotify.com') || u.includes('spotify.link')) return 'spotify';
  if (u.includes('soundcloud.com')) return 'soundcloud';
  if (u.includes('capcut.com')) return 'capcut';
  if (u.includes('snackvideo.com')) return 'snackvideo';
  if (u.includes('drive.google.com')) return 'gdrive';
  if (u.includes('github.com')) return 'github';
  if (u.includes('lahelu.com')) return 'lahelu';
  if (u.includes('xiaohongshu.com') || u.includes('xhslink.com')) return 'rednote';

  return 'universal';
}

async function handleAutoDownload(req, res, next) {
  try {
    const { url, audioOnly } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Harap masukkan tautan media terlebih dahulu.' 
      });
    }

    const cleanUrl = url.trim();
    const platform = detectPlatform(cleanUrl);
    let data = null;

    switch (platform) {
      case 'tiktok':
        data = await fetchTikTok(cleanUrl, { audioOnly });
        break;
      case 'instagram':
        data = await fetchInstagram(cleanUrl, { audioOnly });
        break;
      case 'youtube':
        data = await fetchYouTube(cleanUrl, { audioOnly });
        break;
      case 'facebook':
        data = await fetchFacebook(cleanUrl, { audioOnly });
        break;
      case 'twitter':
        data = await fetchTwitter(cleanUrl, { audioOnly });
        break;
      case 'spotify':
        data = await fetchSpotify(cleanUrl, { audioOnly });
        break;
      case 'soundcloud':
        data = await fetchSoundCloud(cleanUrl, { audioOnly });
        break;
      case 'capcut':
        data = await fetchCapCut(cleanUrl, { audioOnly });
        break;
      case 'snackvideo':
        data = await fetchSnackVideo(cleanUrl, { audioOnly });
        break;
      case 'gdrive':
        data = await fetchGDrive(cleanUrl, { audioOnly });
        break;
      case 'github':
        data = await fetchGitHub(cleanUrl, { audioOnly });
        break;
      default:
        // Try Universal downloader (SaveFrom / Ummy)
        data = await fetchUniversal(cleanUrl, { audioOnly });
        break;
    }

    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

// Specific Route Handlers
async function handleTikTokDownload(req, res, next) {
  try {
    const { url, audioOnly } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL TikTok diperlukan.' });
    const data = await fetchTikTok(url.trim(), { audioOnly });
    return res.json({ success: true, data });
  } catch (e) { next(e); }
}

async function handleInstagramDownload(req, res, next) {
  try {
    const { url, audioOnly } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL Instagram diperlukan.' });
    const data = await fetchInstagram(url.trim(), { audioOnly });
    return res.json({ success: true, data });
  } catch (e) { next(e); }
}

async function handleYouTubeDownload(req, res, next) {
  try {
    const { url, audioOnly } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL YouTube diperlukan.' });
    const data = await fetchYouTube(url.trim(), { audioOnly });
    return res.json({ success: true, data });
  } catch (e) { next(e); }
}

async function handleFacebookDownload(req, res, next) {
  try {
    const { url, audioOnly } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL Facebook diperlukan.' });
    const data = await fetchFacebook(url.trim(), { audioOnly });
    return res.json({ success: true, data });
  } catch (e) { next(e); }
}

async function handleTwitterDownload(req, res, next) {
  try {
    const { url, audioOnly } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL Twitter diperlukan.' });
    const data = await fetchTwitter(url.trim(), { audioOnly });
    return res.json({ success: true, data });
  } catch (e) { next(e); }
}

async function handleSpotifyDownload(req, res, next) {
  try {
    const { url, audioOnly } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL Spotify diperlukan.' });
    const data = await fetchSpotify(url.trim(), { audioOnly });
    return res.json({ success: true, data });
  } catch (e) { next(e); }
}

module.exports = {
  detectPlatform,
  handleAutoDownload,
  handleTikTokDownload,
  handleInstagramDownload,
  handleYouTubeDownload,
  handleFacebookDownload,
  handleTwitterDownload,
  handleSpotifyDownload
};
