const { SAIPULANUAR_BASE, SIPUTZX_BASE, TIMEOUT_MS, USER_AGENT } = require('../config/constants');
const { executeWithFallback } = require('./fallbackRunner');

function sanitize(name) {
  return (name || 'instagram').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45);
}

// Provider 1: Saipulanuar IGDL
async function providerSaipulanuar(url, options) {
  const res = await fetch(`${SAIPULANUAR_BASE}/igdl?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false) throw new Error(json?.message || 'Video Instagram tidak ditemukan');

  let mediaUrl = '';
  let thumbnail = '';

  if (typeof json.result === 'string') {
    mediaUrl = json.result;
  } else if (Array.isArray(json.result) && json.result.length > 0) {
    mediaUrl = json.result[0].url || json.result[0];
    thumbnail = json.result[0].thumbnail || json.result[0].thumb || '';
  } else if (json.result && typeof json.result === 'object') {
    mediaUrl = json.result.url || json.result.video || json.result.download_url || '';
    thumbnail = json.result.thumbnail || json.result.thumb || json.result.cover || '';
  }

  if (!mediaUrl) throw new Error('Link media kosong');
  const filename = `instagram_${Date.now()}.mp4`;

  return {
    platform: 'instagram',
    type: 'video',
    title: 'Instagram Post / Reel',
    thumbnail,
    videoUrl: mediaUrl,
    audioUrl: null,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(mediaUrl)}&filename=${filename}`,
    downloadVideoUrl: `/api/proxy/download?url=${encodeURIComponent(mediaUrl)}&filename=${filename}`,
    downloadAudioUrl: null,
    filename
  };
}

// Provider 2: Siputzx FastDL
async function providerFastDL(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/fastdl?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false) throw new Error(json?.error || 'FastDL gagal');
  const d = json.data || json.result;
  const mediaUrl = Array.isArray(d) ? (d[0]?.url || d[0]) : (d?.url || d);
  if (!mediaUrl) throw new Error('Link FastDL kosong');

  const filename = `instagram_fastdl_${Date.now()}.mp4`;
  return {
    platform: 'instagram',
    type: 'video',
    title: 'Instagram Reel (FastDL)',
    thumbnail: Array.isArray(d) ? d[0]?.thumbnail : (d?.thumbnail || ''),
    videoUrl: mediaUrl,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(mediaUrl)}&filename=${filename}`,
    filename
  };
}

// Provider 3: Siputzx iGram
async function providerIGram(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/igram?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false) throw new Error(json?.error || 'iGram gagal');
  const d = json.data || json.result;
  const mediaUrl = Array.isArray(d) ? (d[0]?.url || d[0]) : (d?.url || d);
  if (!mediaUrl) throw new Error('Link iGram kosong');

  const filename = `instagram_igram_${Date.now()}.mp4`;
  return {
    platform: 'instagram',
    type: 'video',
    title: 'Instagram Reel (iGram)',
    thumbnail: Array.isArray(d) ? d[0]?.thumbnail : (d?.thumbnail || ''),
    videoUrl: mediaUrl,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(mediaUrl)}&filename=${filename}`,
    filename
  };
}

// Provider 4: Siputzx SSSInstagram
async function providerSSSInstagram(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/sssinstagram?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false) throw new Error(json?.error || 'SSSInstagram gagal');
  const d = json.data || json.result;
  const mediaUrl = Array.isArray(d) ? (d[0]?.url || d[0]) : (d?.url || d);
  if (!mediaUrl) throw new Error('Link SSSInstagram kosong');

  const filename = `instagram_sss_${Date.now()}.mp4`;
  return {
    platform: 'instagram',
    type: 'video',
    title: 'Instagram Reel (SSSInstagram)',
    thumbnail: Array.isArray(d) ? d[0]?.thumbnail : (d?.thumbnail || ''),
    videoUrl: mediaUrl,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(mediaUrl)}&filename=${filename}`,
    filename
  };
}

async function fetchInstagram(url, options = {}) {
  const providers = [
    { name: 'Saipulanuar IGDL', fn: providerSaipulanuar },
    { name: 'Siputzx FastDL', fn: providerFastDL },
    { name: 'Siputzx iGram', fn: providerIGram },
    { name: 'Siputzx SSSInstagram', fn: providerSSSInstagram }
  ];
  return executeWithFallback(providers, 'Instagram', url, options);
}

module.exports = { fetchInstagram };
