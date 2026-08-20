const { SIPUTZX_BASE, TIMEOUT_MS, USER_AGENT } = require('../config/constants');
const { executeWithFallback } = require('./fallbackRunner');

function sanitize(name) {
  return (name || 'twitter_video').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45);
}

// Provider 1: Twitter v1
async function providerTwitterV1(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/twitter?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false) throw new Error(json?.error || 'Gagal Twitter v1');
  const d = json.data || json.result || {};
  const videoUrl = d.HD || d.video || d.url || (Array.isArray(d.videos) ? d.videos[0]?.url : '');
  if (!videoUrl) throw new Error('Video Twitter kosong');

  const filename = `twitter_${Date.now()}.mp4`;
  return {
    platform: 'twitter',
    type: 'video',
    title: d.desc || d.text || 'Twitter / X Video',
    thumbnail: d.thumb || d.thumbnail || '',
    videoUrl,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${filename}`,
    filename
  };
}

// Provider 2: SSSTwitter
async function providerSSSTwitter(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/ssstwiter?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false) throw new Error(json?.error || 'Gagal SSSTwitter');
  const d = json.data || json.result || {};
  const videoUrl = d.url || d.video || (Array.isArray(d.downloads) ? d.downloads[0]?.url : '');
  if (!videoUrl) throw new Error('Link SSSTwitter kosong');

  const filename = `twitter_sss_${Date.now()}.mp4`;
  return {
    platform: 'twitter',
    type: 'video',
    title: d.title || 'Twitter / X Video',
    thumbnail: d.thumbnail || '',
    videoUrl,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${filename}`,
    filename
  };
}

// Provider 3: SaveFrom Twitter
async function providerSaveFromTwitter(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/savefrom?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false || !json.data) throw new Error('SaveFrom Twitter gagal');
  const dataBlock = Array.isArray(json.data) ? json.data[0] : json.data;
  const urls = dataBlock.data?.[0]?.url || dataBlock.url || [];
  const selected = urls[0];
  if (!selected || !selected.url) throw new Error('Link SaveFrom Twitter kosong');

  const filename = `twitter_sf_${Date.now()}.mp4`;
  return {
    platform: 'twitter',
    type: 'video',
    title: dataBlock.meta?.title || 'Twitter / X Video',
    thumbnail: '',
    videoUrl: selected.url,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(selected.url)}&filename=${filename}`,
    filename
  };
}

async function fetchTwitter(url, options = {}) {
  const providers = [
    { name: 'Twitter v1', fn: providerTwitterV1 },
    { name: 'SSSTwitter', fn: providerSSSTwitter },
    { name: 'SaveFrom Twitter', fn: providerSaveFromTwitter }
  ];
  return executeWithFallback(providers, 'Twitter/X', url, options);
}

module.exports = { fetchTwitter };
