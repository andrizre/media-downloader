const { TTDL_ENDPOINT, TIMEOUT_MS, USER_AGENT } = require('../config/constants');

function sanitizeFilename(name) {
  return (name || 'tiktok')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 45);
}

async function fetchTikTok(url, options = {}) {
  const targetUrl = TTDL_ENDPOINT + '?url=' + encodeURIComponent(url);
  
  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json'
    },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error('Gagal menghubungi server penyedia API TikTok (HTTP ' + response.status + ')');
  }

  const json = await response.json();
  if (!json || json.status === false) {
    const errorMsg = json?.message || json?.error || 'Video TikTok tidak ditemukan. Pastikan link aktif dan video tidak bersifat privat.';
    throw new Error(errorMsg);
  }

  const result = json.result || {};
  let videoUrl = '';
  if (Array.isArray(result.video) && result.video.length > 0) {
    videoUrl = result.video[0];
  } else if (typeof result.video === 'string') {
    videoUrl = result.video;
  }

  let audioUrl = '';
  if (Array.isArray(result.audio) && result.audio.length > 0) {
    audioUrl = result.audio[0];
  } else if (typeof result.audio === 'string') {
    audioUrl = result.audio;
  }

  const thumbnail = result.thumbnail || result.cover || '';
  const title = result.title_audio || result.title || 'TikTok Video';

  if (!videoUrl && !audioUrl) {
    throw new Error('Tidak ada media video maupun audio yang dapat diunduh untuk link TikTok ini.');
  }

  const safeTitle = sanitizeFilename(title);
  const timestamp = Date.now();
  const videoFilename = safeTitle + '_' + timestamp + '.mp4';
  const audioFilename = safeTitle + '_audio_' + timestamp + '.mp3';

  const isAudioOnly = options.audioOnly === true;

  return {
    platform: 'tiktok',
    type: isAudioOnly ? 'audio' : 'video',
    title: title,
    thumbnail: thumbnail,
    videoUrl: videoUrl,
    audioUrl: audioUrl,
    downloadUrl: isAudioOnly && audioUrl 
      ? '/api/proxy/download?url=' + encodeURIComponent(audioUrl) + '&filename=' + audioFilename
      : (videoUrl ? '/api/proxy/download?url=' + encodeURIComponent(videoUrl) + '&filename=' + videoFilename : null),
    downloadVideoUrl: videoUrl ? '/api/proxy/download?url=' + encodeURIComponent(videoUrl) + '&filename=' + videoFilename : null,
    downloadAudioUrl: audioUrl ? '/api/proxy/download?url=' + encodeURIComponent(audioUrl) + '&filename=' + audioFilename : null,
    filename: isAudioOnly ? audioFilename : videoFilename,
    raw: result
  };
}

module.exports = { fetchTikTok, sanitizeFilename };
