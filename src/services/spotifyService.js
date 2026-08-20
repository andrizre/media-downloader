const { SIPUTZX_BASE, TIMEOUT_MS, USER_AGENT } = require('../config/constants');
const { executeWithFallback } = require('./fallbackRunner');

function sanitize(name) {
  return (name || 'spotify_track').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45);
}

// Provider 1: Spotify v1
async function providerSpotifyV1(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/spotify?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false) throw new Error(json?.error || 'Gagal Spotify v1');
  const d = json.data || json.result || {};
  const audioUrl = d.download || d.url || d.link || d.audio || '';
  if (!audioUrl) throw new Error('Link Spotify v1 kosong');

  const title = d.title || d.name || 'Spotify Track';
  const artist = d.artist || d.artists || '';
  const fullTitle = artist ? `${artist} - ${title}` : title;
  const safeTitle = sanitize(fullTitle);
  const filename = `${safeTitle}_${Date.now()}.mp3`;

  return {
    platform: 'spotify',
    type: 'audio',
    title: fullTitle,
    thumbnail: d.thumbnail || d.cover || d.image || '',
    videoUrl: null,
    audioUrl,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${filename}`,
    downloadAudioUrl: `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${filename}`,
    filename
  };
}

// Provider 2: Spotify v2
async function providerSpotifyV2(url, options) {
  const res = await fetch(`${SIPUTZX_BASE}/spotifyv2?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.status === false) throw new Error(json?.error || 'Gagal Spotify v2');
  const d = json.data || json.result || {};
  const audioUrl = d.download || d.url || d.link || d.audio || '';
  if (!audioUrl) throw new Error('Link Spotify v2 kosong');

  const title = d.title || d.name || 'Spotify Track';
  const artist = d.artist || d.artists || '';
  const fullTitle = artist ? `${artist} - ${title}` : title;
  const safeTitle = sanitize(fullTitle);
  const filename = `${safeTitle}_${Date.now()}.mp3`;

  return {
    platform: 'spotify',
    type: 'audio',
    title: fullTitle,
    thumbnail: d.thumbnail || d.cover || d.image || '',
    videoUrl: null,
    audioUrl,
    downloadUrl: `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${filename}`,
    downloadAudioUrl: `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${filename}`,
    filename
  };
}

async function fetchSpotify(url, options = {}) {
  const providers = [
    { name: 'Spotify v1', fn: providerSpotifyV1 },
    { name: 'Spotify v2', fn: providerSpotifyV2 }
  ];
  return executeWithFallback(providers, 'Spotify', url, options);
}

module.exports = { fetchSpotify };
