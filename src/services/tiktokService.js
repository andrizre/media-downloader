const { SAIPULANUAR_BASE, SIPUTZX_BASE, TIMEOUT_MS, USER_AGENT } = require('../config/constants');
const { executeWithFallback } = require('./fallbackRunner');

function sanitize(name) {
  return (name || 'tiktok').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45);
}

// Provider 1: Saipulanuar TTDL
async function providerSaipulanuar(url, options) {
  const res = await fetch(`${SAIPULANUAR_BASE}/ttdl?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false) throw new Error(json?.message || 'Video tidak ditemukan');

  const r = json.result || {};
  const videoUrl = Array.isArray(r.video) ? r.video[0] : (r.video || '');
  const audioUrl = Array.isArray(r.audio) ? r.audio[0] : (r.audio || '');
  const title = r.title_audio || r.title || 'TikTok Video';
  const thumbnail = r.thumbnail || r.cover || '';

  if (!videoUrl && !audioUrl) throw new Error('Tidak ada link media');

  const safeTitle = sanitize(title);
  const isAudioOnly = options.audioOnly === true;
  const videoFile = `${safeTitle}_${Date.now()}.mp4`;
  const audioFile = `${safeTitle}_audio_${Date.now()}.mp3`;

  return {
    platform: 'tiktok',
    type: isAudioOnly ? 'audio' : 'video',
    title,
    thumbnail,
    videoUrl,
    audioUrl,
    downloadUrl: isAudioOnly && audioUrl 
      ? `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${audioFile}`
      : (videoUrl ? `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${videoFile}` : null),
    downloadVideoUrl: videoUrl ? `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${videoFile}` : null,
    downloadAudioUrl: audioUrl ? `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${audioFile}` : null,
    filename: isAudioOnly ? audioFile : videoFile
  };
}

// Provider 2: Siputzx TikTok v2
async function providerSiputzxV2(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/tiktok/v2?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false || !json.data) throw new Error(json?.error || 'Video tidak ditemukan');

  const d = json.data || {};
  const videoUrl = d.no_watermark_link || d.watermark_link || d.original || '';
  const audioUrl = d.music_link || '';
  const title = d.desc || d.author_name || 'TikTok Video';
  const thumbnail = d.cover || '';

  if (!videoUrl && !audioUrl) throw new Error('Tidak ada link media');

  const safeTitle = sanitize(title);
  const isAudioOnly = options.audioOnly === true;
  const videoFile = `${safeTitle}_${Date.now()}.mp4`;
  const audioFile = `${safeTitle}_audio_${Date.now()}.mp3`;

  return {
    platform: 'tiktok',
    type: isAudioOnly ? 'audio' : 'video',
    title,
    thumbnail,
    videoUrl,
    audioUrl,
    downloadUrl: isAudioOnly && audioUrl 
      ? `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${audioFile}`
      : (videoUrl ? `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${videoFile}` : null),
    downloadVideoUrl: videoUrl ? `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${videoFile}` : null,
    downloadAudioUrl: audioUrl ? `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${audioFile}` : null,
    filename: isAudioOnly ? audioFile : videoFile
  };
}

// Provider 3: Siputzx TikTok v1
async function providerSiputzxV1(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/tiktok?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false) throw new Error(json?.error || 'Gagal ekstrak tiktok v1');
  const d = json.data || json.result || {};
  const videoUrl = d.video || d.no_watermark || d.url || '';
  const audioUrl = d.audio || d.music || '';
  const title = d.title || 'TikTok Video';
  if (!videoUrl && !audioUrl) throw new Error('Link kosong');

  const safeTitle = sanitize(title);
  const isAudioOnly = options.audioOnly === true;
  return {
    platform: 'tiktok',
    type: isAudioOnly ? 'audio' : 'video',
    title,
    thumbnail: d.cover || d.thumbnail || '',
    videoUrl,
    audioUrl,
    downloadUrl: isAudioOnly && audioUrl 
      ? `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${safeTitle}_audio.mp3`
      : `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${safeTitle}.mp4`,
    downloadVideoUrl: videoUrl ? `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${safeTitle}.mp4` : null,
    downloadAudioUrl: audioUrl ? `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${safeTitle}_audio.mp3` : null,
    filename: isAudioOnly ? `${safeTitle}_audio.mp3` : `${safeTitle}.mp4`
  };
}

// Provider 4: Douyin
async function providerDouyin(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/douyin?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false) throw new Error(json?.error || 'Gagal douyin');
  const d = json.data || json.result || {};
  const videoUrl = d.video || d.url || '';
  if (!videoUrl) throw new Error('Link video douyin kosong');
  return {
    platform: 'tiktok',
    type: 'video',
    title: d.title || 'Douyin Video',
    thumbnail: d.cover || '',
    videoUrl,
    audioUrl: d.audio || null,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=douyin_${Date.now()}.mp4`,
    filename: `douyin_${Date.now()}.mp4`
  };
}

async function fetchTikTok(url, options = {}) {
  const providers = [
    { name: 'Saipulanuar TTDL', fn: providerSaipulanuar },
    { name: 'Siputzx TikTok v2', fn: providerSiputzxV2 },
    { name: 'Siputzx TikTok v1', fn: providerSiputzxV1 },
    { name: 'Siputzx Douyin', fn: providerDouyin }
  ];
  return executeWithFallback(providers, 'TikTok', url, options);
}

module.exports = { fetchTikTok };
