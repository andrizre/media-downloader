const { SIPUTZX_BASE, TIMEOUT_MS, USER_AGENT } = require('../config/constants');
const { executeWithFallback } = require('./fallbackRunner');

function sanitize(name, def = 'media') {
  return (name || def).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45);
}

// CapCut Service
async function fetchCapCut(url, options = {}) {
  const providers = [{
    name: 'CapCut Downloader',
    fn: async (u) => {
      const res = await fetch(`${SIPUTZX_BASE}/capcut?url=${encodeURIComponent(u)}`, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json || json.status === false) throw new Error(json?.error || 'Gagal CapCut');
      const d = json.data || json.result || {};
      const videoUrl = d.video_url || d.video || d.url || '';
      if (!videoUrl) throw new Error('Video CapCut kosong');

      const title = d.title || 'CapCut Template Video';
      const filename = `capcut_${Date.now()}.mp4`;
      return {
        platform: 'capcut',
        type: 'video',
        title,
        thumbnail: d.cover || d.thumbnail || '',
        videoUrl,
        downloadUrl: `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${filename}`,
        filename
      };
    }
  }];
  return executeWithFallback(providers, 'CapCut', url, options);
}

// SoundCloud Service
async function fetchSoundCloud(url, options = {}) {
  const providers = [{
    name: 'SoundCloud Downloader',
    fn: async (u) => {
      const res = await fetch(`${SIPUTZX_BASE}/soundcloud?url=${encodeURIComponent(u)}`, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json || json.status === false) throw new Error(json?.error || 'Gagal SoundCloud');
      const d = json.data || json.result || {};
      const audioUrl = d.download || d.url || d.link || '';
      if (!audioUrl) throw new Error('Audio SoundCloud kosong');

      const title = d.title || 'SoundCloud Track';
      const filename = `soundcloud_${Date.now()}.mp3`;
      return {
        platform: 'soundcloud',
        type: 'audio',
        title,
        thumbnail: d.thumbnail || d.cover || '',
        videoUrl: null,
        audioUrl,
        downloadUrl: `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${filename}`,
        downloadAudioUrl: `/api/proxy/download?url=${encodeURIComponent(audioUrl)}&filename=${filename}`,
        filename
      };
    }
  }];
  return executeWithFallback(providers, 'SoundCloud', url, options);
}

// GDrive Service
async function fetchGDrive(url, options = {}) {
  const providers = [{
    name: 'Google Drive Direct Downloader',
    fn: async (u) => {
      const res = await fetch(`${SIPUTZX_BASE}/gdrive?url=${encodeURIComponent(u)}`, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json || json.status === false || !json.data) throw new Error(json?.error || 'Gagal GDrive');
      const d = json.data;
      const downloadUrl = d.download || d.link || '';
      if (!downloadUrl) throw new Error('Link GDrive kosong');

      const filename = sanitize(d.name, 'gdrive_file');
      return {
        platform: 'gdrive',
        type: 'file',
        title: d.name || 'Google Drive File',
        thumbnail: '',
        videoUrl: null,
        downloadUrl,
        filename
      };
    }
  }];
  return executeWithFallback(providers, 'Google Drive', url, options);
}

// GitHub Service
async function fetchGitHub(url, options = {}) {
  const providers = [{
    name: 'GitHub Repository Downloader',
    fn: async (u) => {
      const res = await fetch(`${SIPUTZX_BASE}/github?url=${encodeURIComponent(u)}`, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json || json.status === false || !json.data) throw new Error('Gagal GitHub');
      const d = json.data;
      const downloadUrl = d.download_url || d.clone_url || '';
      if (!downloadUrl) throw new Error('Link unduhan GitHub repo tidak ditemukan');

      const title = `${d.owner}/${d.repo}`;
      const filename = `${sanitize(d.repo, 'repo')}.zip`;
      return {
        platform: 'github',
        type: 'file',
        title: `GitHub Repo: ${title}`,
        thumbnail: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        downloadUrl,
        filename
      };
    }
  }];
  return executeWithFallback(providers, 'GitHub', url, options);
}

// SnackVideo Service
async function fetchSnackVideo(url, options = {}) {
  const providers = [{
    name: 'SnackVideo Downloader',
    fn: async (u) => {
      const res = await fetch(`${SIPUTZX_BASE}/snackvideo?url=${encodeURIComponent(u)}`, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json || json.status === false) throw new Error(json?.error || 'Gagal SnackVideo');
      const d = json.data || json.result || {};
      const videoUrl = d.video || d.url || '';
      if (!videoUrl) throw new Error('Video SnackVideo kosong');

      const title = d.title || 'SnackVideo Media';
      const filename = `snackvideo_${Date.now()}.mp4`;
      return {
        platform: 'snackvideo',
        type: 'video',
        title,
        thumbnail: d.thumbnail || d.cover || '',
        videoUrl,
        downloadUrl: `/api/proxy/download?url=${encodeURIComponent(videoUrl)}&filename=${filename}`,
        filename
      };
    }
  }];
  return executeWithFallback(providers, 'SnackVideo', url, options);
}

// Universal Fallback Service (SaveFrom / Ummy)
async function fetchUniversal(url, options = {}) {
  const providers = [
    {
      name: 'SaveFrom Universal',
      fn: async (u) => {
        const res = await fetch(`${SIPUTZX_BASE}/savefrom?url=${encodeURIComponent(u)}`, {
          headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
          signal: AbortSignal.timeout(TIMEOUT_MS)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json || json.status === false || !json.data) throw new Error('SaveFrom universal gagal');
        const dataBlock = Array.isArray(json.data) ? json.data[0] : json.data;
        const videoItem = Array.isArray(dataBlock.data) ? dataBlock.data[0] : dataBlock;
        const urls = videoItem.url || [];
        const selected = urls.find(x => x.audio !== false && x.url) || urls[0];
        if (!selected || !selected.url) throw new Error('Link media tidak ditemukan');

        const title = videoItem.meta?.title || 'Universal Media';
        const filename = `media_${Date.now()}.${selected.ext || 'mp4'}`;
        return {
          platform: 'universal',
          type: 'video',
          title,
          thumbnail: videoItem.thumb || '',
          videoUrl: selected.url,
          downloadUrl: `/api/proxy/download?url=${encodeURIComponent(selected.url)}&filename=${filename}`,
          filename
        };
      }
    },
    {
      name: 'Ummy Universal',
      fn: async (u) => {
        const res = await fetch(`${SIPUTZX_BASE}/ummy?url=${encodeURIComponent(u)}`, {
          headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
          signal: AbortSignal.timeout(TIMEOUT_MS)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json || json.status === false || !json.data) throw new Error('Ummy universal gagal');
        const d = json.data;
        const urls = d.url || [];
        const selected = urls.find(x => x.url) || urls[0];
        if (!selected || !selected.url) throw new Error('Link media kosong');

        const title = d.meta?.title || 'Universal Media';
        const filename = `media_${Date.now()}.${selected.ext || 'mp4'}`;
        return {
          platform: 'universal',
          type: 'video',
          title,
          thumbnail: '',
          videoUrl: selected.url,
          downloadUrl: `/api/proxy/download?url=${encodeURIComponent(selected.url)}&filename=${filename}`,
          filename
        };
      }
    }
  ];
  return executeWithFallback(providers, 'Universal Media', url, options);
}

module.exports = {
  fetchCapCut,
  fetchSoundCloud,
  fetchGDrive,
  fetchGitHub,
  fetchSnackVideo,
  fetchUniversal
};
