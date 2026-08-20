const { SIPUTZX_BASE, TIMEOUT_MS, USER_AGENT } = require('../config/constants');
const { executeWithFallback } = require('./fallbackRunner');

function sanitize(name) {
  return (name || 'facebook_video').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45);
}

// Provider 1: Siputzx Facebook
async function providerFacebook(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/facebook?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false || !json.data) throw new Error(json?.error || 'Video Facebook tidak ditemukan');

  const d = json.data;
  const title = d.title || 'Facebook Video';
  const downloads = d.downloads || [];
  const hd = downloads.find(x => x.quality?.includes('HD')) || downloads[0];
  const videoUrl = hd?.url || '';
  if (!videoUrl) throw new Error('Link download video Facebook tidak ditemukan');

  const safeTitle = sanitize(title);
  const filename = `${safeTitle}_${Date.now()}.mp4`;

  return {
    platform: 'facebook',
    type: 'video',
    title,
    thumbnail: d.thumbnail || '',
    videoUrl,
    audioUrl: null,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${filename}`,
    downloadVideoUrl: `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${filename}`,
    filename
  };
}

// Provider 2: SaveFrom Facebook Fallback
async function providerSaveFromFB(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/savefrom?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false || !json.data) throw new Error('SaveFrom FB gagal');

  const dataBlock = Array.isArray(json.data) ? json.data[0] : json.data;
  const videoItem = Array.isArray(dataBlock.data) ? dataBlock.data[0] : dataBlock;
  const urls = videoItem.url || [];
  const selected = urls[0];
  if (!selected || !selected.url) throw new Error('Stream SaveFrom FB kosong');

  const title = videoItem.meta?.title || 'Facebook Video';
  const safeTitle = sanitize(title);
  const filename = `${safeTitle}_${Date.now()}.mp4`;

  return {
    platform: 'facebook',
    type: 'video',
    title,
    thumbnail: videoItem.thumb || '',
    videoUrl: selected.url,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(selected.url)}&filename=${filename}`,
    filename
  };
}

async function fetchFacebook(url, options = {}) {
  const providers = [
    { name: 'Siputzx Facebook', fn: providerFacebook },
    { name: 'SaveFrom Facebook', fn: providerSaveFromFB }
  ];
  return executeWithFallback(providers, 'Facebook', url, options);
}

module.exports = { fetchFacebook };
