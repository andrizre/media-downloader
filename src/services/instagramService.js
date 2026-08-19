const { IGDL_ENDPOINT, TIMEOUT_MS, USER_AGENT } = require('../config/constants');

async function fetchInstagram(url, options = {}) {
  const targetUrl = IGDL_ENDPOINT + '?url=' + encodeURIComponent(url);
  
  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json'
    },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error('Gagal menghubungi server penyedia API Instagram (HTTP ' + response.status + ')');
  }

  const json = await response.json();
  if (!json || json.status === false) {
    const errorMsg = json?.message || json?.error || 'Video Instagram tidak ditemukan. Pastikan akun bersifat publik dan link masih aktif.';
    throw new Error(errorMsg);
  }

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

  if (!mediaUrl) {
    throw new Error('Link unduhan video tidak dapat diekstrak dari respon API Instagram.');
  }

  const timestamp = Date.now();
  const filename = 'instagram_' + timestamp + '.mp4';

  return {
    platform: 'instagram',
    type: 'video',
    title: 'Instagram Post / Reel',
    thumbnail: thumbnail,
    videoUrl: mediaUrl,
    audioUrl: null,
    downloadUrl: '/api/proxy/download?url=' + encodeURIComponent(mediaUrl) + '&filename=' + filename,
    downloadVideoUrl: '/api/proxy/download?url=' + encodeURIComponent(mediaUrl) + '&filename=' + filename,
    downloadAudioUrl: null,
    filename: filename,
    raw: json.result
  };
}

module.exports = { fetchInstagram };
