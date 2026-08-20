const { SIPUTZX_BASE, TIMEOUT_MS, USER_AGENT } = require('../config/constants');
const { executeWithFallback } = require('./fallbackRunner');

function sanitize(name) {
  return (name || 'youtube_video').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45);
}

// Provider 1: SaveFrom
async function providerSaveFrom(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/savefrom?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false || !json.data) throw new Error(json?.error || 'Gagal memproses YouTube via SaveFrom');

  const dataBlock = Array.isArray(json.data) ? json.data[0] : json.data;
  const videoItem = Array.isArray(dataBlock.data) ? dataBlock.data[0] : dataBlock;
  const meta = videoItem.meta || {};
  const title = meta.title || 'YouTube Video';
  const urls = videoItem.url || [];

  // Find direct stream or progressive mp4 with audio
  const withAudio = urls.filter(u => u.audio !== false && u.no_audio !== true && u.url);
  const audioTracks = urls.filter(u => u.audio === true || u.ext === 'm4a' || u.ext === 'mp3');

  const selectedVideo = withAudio[0] || urls[0];
  const selectedAudio = audioTracks[0] || withAudio[0];

  if (!selectedVideo || !selectedVideo.url) throw new Error('Tidak ada stream video yang valid');

  const videoUrl = selectedVideo.url;
  const audioUrl = selectedAudio?.url || null;
  const safeTitle = sanitize(title);
  const isAudioOnly = options.audioOnly === true;
  const videoFile = `${safeTitle}_${Date.now()}.mp4`;
  const audioFile = `${safeTitle}_audio_${Date.now()}.mp3`;

  return {
    platform: 'youtube',
    type: isAudioOnly ? 'audio' : 'video',
    title,
    thumbnail: `https://i.ytimg.com/vi/${videoItem.id || 'default'}/hqdefault.jpg`,
    videoUrl,
    audioUrl,
    downloadUrl: isAudioOnly && audioUrl 
      ? `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${audioFile}`
      : `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${videoFile}`,
    downloadVideoUrl: `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${videoFile}`,
    downloadAudioUrl: audioUrl ? `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${audioFile}` : null,
    filename: isAudioOnly ? audioFile : videoFile
  };
}

// Provider 2: Ummy
async function providerUmmy(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/ummy?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false || !json.data) throw new Error(json?.error || 'Gagal Ummy');

  const d = json.data;
  const meta = d.meta || {};
  const title = meta.title || 'YouTube Video';
  const urls = d.url || [];
  const selected = urls.find(u => u.audio !== false && u.url) || urls[0];
  if (!selected || !selected.url) throw new Error('Stream Ummy kosong');

  const safeTitle = sanitize(title);
  const videoFile = `${safeTitle}_${Date.now()}.mp4`;

  return {
    platform: 'youtube',
    type: 'video',
    title,
    thumbnail: `https://i.ytimg.com/vi/${d.id || 'default'}/hqdefault.jpg`,
    videoUrl: selected.url,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(selected.url)}&filename=${videoFile}`,
    filename: videoFile
  };
}

// Provider 3: YTPost (for YouTube Community/Posts)
async function providerYtPost(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/ytpost?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false || !json.data) throw new Error('Gagal scrape YTPost');
  const d = json.data;
  const mediaUrl = d.images?.[0] || d.url || '';
  if (!mediaUrl) throw new Error('Media post YouTube tidak ditemukan');

  return {
    platform: 'youtube',
    type: 'image',
    title: d.text || 'YouTube Community Post',
    thumbnail: mediaUrl,
    videoUrl: mediaUrl,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(mediaUrl)}&filename=ytpost_${Date.now()}.jpg`,
    filename: `ytpost_${Date.now()}.jpg`
  };
}

async function fetchYouTube(url, options = {}) {
  const providers = [
    { name: 'SaveFrom YouTube', fn: providerSaveFrom },
    { name: 'Ummy Universal', fn: providerUmmy },
    { name: 'YTPost Scraper', fn: providerYtPost }
  ];
  return executeWithFallback(providers, 'YouTube', url, options);
}

module.exports = { fetchYouTube };
