// Cobalt Multi-Platform Controller with Fallback Awareness & QR Handoff

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const downloadForm = document.getElementById('downloadForm');
  const urlInput = document.getElementById('urlInput');
  const submitBtn = document.getElementById('submitBtn');
  const submitIcon = document.getElementById('submitIcon');
  const pasteBtn = document.getElementById('pasteBtn');
  const clearInputBtn = document.getElementById('clearInputBtn');
  const platformIconIndicator = document.getElementById('platformIconIndicator');
  const sampleLinkButtons = document.querySelectorAll('.sample-link-btn');

  // Quick Mode Pills
  const modeAutoBtn = document.getElementById('modeAutoBtn');
  const modeAudioBtn = document.getElementById('modeAudioBtn');

  // Settings
  const settingsToggleBtn = document.getElementById('settingsToggleBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const settingAudioOnly = document.getElementById('settingAudioOnly');
  const settingAutoSave = document.getElementById('settingAutoSave');

  // Processing & Result Elements
  const processingSection = document.getElementById('processingSection');
  const procPlatformTag = document.getElementById('procPlatformTag');
  const procStatusText = document.getElementById('procStatusText');

  const resultSection = document.getElementById('resultSection');
  const resDismissBtn = document.getElementById('resDismissBtn');
  const resPlatformBadge = document.getElementById('resPlatformBadge');
  const resProviderBadge = document.getElementById('resProviderBadge');
  const resTitle = document.getElementById('resTitle');
  const resAudioTitle = document.getElementById('resAudioTitle');
  const resAudioText = document.getElementById('resAudioText');
  const resVideoPlayer = document.getElementById('resVideoPlayer');
  const resVideoSource = document.getElementById('resVideoSource');
  const resThumbnail = document.getElementById('resThumbnail');
  const resAudioPlayerContainer = document.getElementById('resAudioPlayerContainer');
  const resAudioPlayer = document.getElementById('resAudioPlayer');
  const resAudioSource = document.getElementById('resAudioSource');
  const resPrimaryDownloadBtn = document.getElementById('resPrimaryDownloadBtn');
  const resPrimaryBtnLabel = document.getElementById('resPrimaryBtnLabel');
  const resAudioDownloadBtn = document.getElementById('resAudioDownloadBtn');
  const resCopyLinkBtn = document.getElementById('resCopyLinkBtn');
  const resQrBtn = document.getElementById('resQrBtn');
  const resShareBtn = document.getElementById('resShareBtn');

  // QR Modal Elements
  const qrModal = document.getElementById('qrModal');
  const qrImage = document.getElementById('qrImage');
  const closeQrBtn = document.getElementById('closeQrBtn');
  const dismissQrBtn = document.getElementById('dismissQrBtn');

  // History Elements
  const historyBtn = document.getElementById('historyBtn');
  const historyDrawer = document.getElementById('historyDrawer');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  let currentResultData = null;

  // 1. Settings Init & Sync
  function loadSettings() {
    const isAudio = localStorage.getItem('snapmedia_audio_only') === 'true';
    const isAutoSave = localStorage.getItem('snapmedia_autosave') === 'true';

    settingAudioOnly.checked = isAudio;
    settingAutoSave.checked = isAutoSave;
    syncModePills(isAudio);
  }

  function syncModePills(isAudioOnly) {
    if (isAudioOnly) {
      modeAudioBtn?.classList.add('active');
      modeAutoBtn?.classList.remove('active');
    } else {
      modeAutoBtn?.classList.add('active');
      modeAudioBtn?.classList.remove('active');
    }
  }

  settingAudioOnly.addEventListener('change', () => {
    localStorage.setItem('snapmedia_audio_only', settingAudioOnly.checked);
    syncModePills(settingAudioOnly.checked);
  });

  settingAutoSave.addEventListener('change', () => {
    localStorage.setItem('snapmedia_autosave', settingAutoSave.checked);
  });

  modeAutoBtn?.addEventListener('click', () => {
    settingAudioOnly.checked = false;
    localStorage.setItem('snapmedia_audio_only', false);
    syncModePills(false);
  });

  modeAudioBtn?.addEventListener('click', () => {
    settingAudioOnly.checked = true;
    localStorage.setItem('snapmedia_audio_only', true);
    syncModePills(true);
  });

  settingsToggleBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
  });

  loadSettings();

  // 2. Multi-Platform Detection
  function detectPlatform(val) {
    const u = (val || '').toLowerCase().trim();
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
    if (u.includes('tiktok.com') || u.includes('douyin.com')) return 'tiktok';
    if (u.includes('instagram.com') || u.includes('instagr.am')) return 'instagram';
    if (u.includes('facebook.com') || u.includes('fb.watch') || u.includes('fb.com')) return 'facebook';
    if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
    if (u.includes('spotify.com') || u.includes('spotify.link')) return 'spotify';
    if (u.includes('soundcloud.com')) return 'soundcloud';
    if (u.includes('capcut.com')) return 'capcut';
    if (u.includes('snackvideo.com')) return 'snackvideo';
    if (u.includes('drive.google.com')) return 'gdrive';
    if (u.includes('github.com')) return 'github';
    return null;
  }

  function getPlatformIconHtml(platform) {
    switch (platform) {
      case 'youtube': return '<i class="bi bi-youtube text-red-500 animate-pulse"></i>';
      case 'tiktok': return '<i class="bi bi-tiktok text-cyan-400 animate-pulse"></i>';
      case 'instagram': return '<i class="bi bi-instagram text-pink-500 animate-pulse"></i>';
      case 'facebook': return '<i class="bi bi-facebook text-blue-500 animate-pulse"></i>';
      case 'twitter': return '<i class="bi bi-twitter-x text-slate-300 animate-pulse"></i>';
      case 'spotify': return '<i class="bi bi-spotify text-emerald-500 animate-pulse"></i>';
      case 'soundcloud': return '<i class="bi bi-soundwave text-amber-500 animate-pulse"></i>';
      case 'capcut': return '<i class="bi bi-scissors text-indigo-400 animate-pulse"></i>';
      case 'snackvideo': return '<i class="bi bi-play-circle text-yellow-500 animate-pulse"></i>';
      case 'gdrive': return '<i class="bi bi-google-play text-yellow-400 animate-pulse"></i>';
      case 'github': return '<i class="bi bi-github text-slate-300 animate-pulse"></i>';
      default: return '<i class="bi bi-link-45deg text-slate-500"></i>';
    }
  }

  urlInput.addEventListener('input', () => {
    const val = urlInput.value.trim();
    clearInputBtn.classList.toggle('hidden', val.length === 0);
    const platform = detectPlatform(val);
    platformIconIndicator.innerHTML = getPlatformIconHtml(platform);
  });

  clearInputBtn.addEventListener('click', () => {
    urlInput.value = '';
    clearInputBtn.classList.add('hidden');
    platformIconIndicator.innerHTML = '<i class="bi bi-link-45deg text-slate-500"></i>';
    urlInput.focus();
  });

  // 3. Paste Button & Clipboard
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        urlInput.value = text.trim();
        urlInput.dispatchEvent(new Event('input'));
        downloadForm.dispatchEvent(new Event('submit'));
      }
    } catch (e) {
      urlInput.focus();
    }
  });

  // Sample Links Click
  sampleLinkButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      urlInput.value = btn.getAttribute('data-sample');
      urlInput.dispatchEvent(new Event('input'));
      downloadForm.dispatchEvent(new Event('submit'));
    });
  });

  // 4. Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!historyDrawer.classList.contains('hidden')) {
        historyDrawer.classList.add('hidden');
      } else if (!qrModal.classList.contains('hidden')) {
        qrModal.classList.add('hidden');
      } else if (!settingsPanel.classList.contains('hidden')) {
        settingsPanel.classList.add('hidden');
      } else {
        clearInputBtn.click();
        resultSection.classList.add('hidden');
      }
    }
  });

  // 5. Submit Form & Process with Fallback
  downloadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    const detected = detectPlatform(url) || 'auto';
    const audioOnly = settingAudioOnly.checked;

    setProcessing(true, detected);

    try {
      const res = await fetch('/api/download/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, audioOnly })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal memproses media.');
      }

      // Success
      renderResult(json.data, url);

      // Save to History
      HistoryManager.add({
        ...json.data,
        url
      });

      // Auto-save if enabled
      if (settingAutoSave.checked && json.data.downloadUrl) {
        const a = document.createElement('a');
        a.href = json.data.downloadUrl;
        a.download = json.data.filename || 'media';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengunduh',
        text: err.message,
        background: '#0f1219',
        color: '#ffffff',
        confirmButtonColor: '#5865F2'
      });
    } finally {
      setProcessing(false);
    }
  });

  function setProcessing(isProc, platform = 'auto') {
    if (isProc) {
      processingSection.classList.remove('hidden');
      resultSection.classList.add('hidden');
      procPlatformTag.textContent = platform.toUpperCase();
      procStatusText.textContent = 'tunneling media with fallback engine...';
      submitBtn.disabled = true;
      submitIcon.className = 'bi bi-arrow-repeat text-xl animate-spin';
    } else {
      processingSection.classList.add('hidden');
      submitBtn.disabled = false;
      submitIcon.className = 'bi bi-arrow-right text-xl font-bold';
    }
  }

  // 6. Render Result Card
  function renderResult(data) {
    currentResultData = data;
    const platform = (data.platform || 'media').toLowerCase();

    // Badge styling per platform
    let badgeClass = 'bg-surface-800 text-slate-300';
    let iconClass = 'bi-link-45deg';

    switch (platform) {
      case 'youtube':
        badgeClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
        iconClass = 'bi-youtube';
        break;
      case 'tiktok':
        badgeClass = 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
        iconClass = 'bi-tiktok';
        break;
      case 'instagram':
        badgeClass = 'bg-pink-500/20 text-pink-400 border border-pink-500/30';
        iconClass = 'bi-instagram';
        break;
      case 'facebook':
        badgeClass = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
        iconClass = 'bi-facebook';
        break;
      case 'twitter':
        badgeClass = 'bg-slate-700/40 text-slate-300 border border-slate-600/40';
        iconClass = 'bi-twitter-x';
        break;
      case 'spotify':
        badgeClass = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
        iconClass = 'bi-spotify';
        break;
      case 'soundcloud':
        badgeClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
        iconClass = 'bi-soundwave';
        break;
      case 'capcut':
        badgeClass = 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
        iconClass = 'bi-scissors';
        break;
      case 'gdrive':
        badgeClass = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
        iconClass = 'bi-google-play';
        break;
      case 'github':
        badgeClass = 'bg-slate-800 text-slate-300 border border-slate-700';
        iconClass = 'bi-github';
        break;
    }

    resPlatformBadge.className = `text-[11px] font-mono font-bold px-2.5 py-0.5 rounded ${badgeClass}`;
    resPlatformBadge.innerHTML = `<i class="bi ${iconClass} me-1"></i> ${platform}`;

    // Provider Badge
    if (data.provider) {
      resProviderBadge.textContent = `provider: ${data.provider}`;
      resProviderBadge.classList.remove('hidden');
    } else {
      resProviderBadge.classList.add('hidden');
    }

    // Title
    resTitle.textContent = data.title || `${platform.toUpperCase()} Media`;

    // Audio text info
    if (data.audioUrl || data.title_audio) {
      resAudioTitle.classList.remove('hidden');
      resAudioText.textContent = data.title_audio || data.title || 'Original Soundtrack';
    } else {
      resAudioTitle.classList.add('hidden');
    }

    // Preview: Video vs Audio vs Image
    if (data.videoUrl && data.type !== 'audio') {
      resVideoSource.src = data.videoUrl;
      resVideoPlayer.poster = data.thumbnail || '';
      resVideoPlayer.load();
      resVideoPlayer.classList.remove('hidden');
      resThumbnail.classList.add('hidden');
      resAudioPlayerContainer.classList.add('hidden');
    } else if (data.thumbnail) {
      resThumbnail.src = data.thumbnail;
      resThumbnail.classList.remove('hidden');
      resVideoPlayer.classList.add('hidden');
    } else {
      resVideoPlayer.classList.add('hidden');
      resThumbnail.classList.add('hidden');
    }

    // In-app Audio Preview
    if (data.audioUrl) {
      resAudioSource.src = data.audioUrl;
      resAudioPlayer.load();
      resAudioPlayerContainer.classList.remove('hidden');
    } else {
      resAudioPlayerContainer.classList.add('hidden');
    }

    // Primary Download Button
    const primaryDl = data.downloadUrl || data.downloadVideoUrl || data.videoUrl || data.audioUrl;
    resPrimaryDownloadBtn.href = primaryDl;
    
    if (data.type === 'audio') {
      resPrimaryBtnLabel.textContent = 'save audio (.mp3)';
    } else if (data.type === 'file') {
      resPrimaryBtnLabel.textContent = 'save file / zip';
    } else {
      resPrimaryBtnLabel.textContent = 'save video (.mp4)';
    }

    // Secondary Audio Button (if video has separate audio download)
    if (data.downloadAudioUrl && data.type !== 'audio') {
      resAudioDownloadBtn.classList.remove('hidden');
      resAudioDownloadBtn.href = data.downloadAudioUrl;
    } else {
      resAudioDownloadBtn.classList.add('hidden');
    }

    // Show Result Card
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  resDismissBtn.addEventListener('click', () => {
    resultSection.classList.add('hidden');
  });

  // Copy Link
  resCopyLinkBtn.addEventListener('click', async () => {
    if (!currentResultData) return;
    const link = currentResultData.downloadUrl || currentResultData.videoUrl || currentResultData.audioUrl;
    try {
      await navigator.clipboard.writeText(link);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Link berhasil disalin!',
        showConfirmButton: false,
        timer: 1500,
        background: '#0f1219',
        color: '#fff'
      });
    } catch (e) {}
  });

  // QR Code Modal
  resQrBtn.addEventListener('click', () => {
    if (!currentResultData) return;
    const link = currentResultData.downloadUrl || currentResultData.videoUrl || currentResultData.audioUrl;
    // Generate QR using public QR server or SVG
    const absoluteLink = link.startsWith('http') ? link : window.location.origin + link;
    qrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(absoluteLink);
    qrModal.classList.remove('hidden');
  });

  closeQrBtn.addEventListener('click', () => qrModal.classList.add('hidden'));
  dismissQrBtn.addEventListener('click', () => qrModal.classList.add('hidden'));
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) qrModal.classList.add('hidden');
  });

  // Share
  resShareBtn.addEventListener('click', async () => {
    if (!currentResultData) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentResultData.title || 'SnapMedia',
          url: currentResultData.downloadUrl || window.location.href
        });
      } catch (e) {}
    } else {
      resCopyLinkBtn.click();
    }
  });

  // History Drawer
  historyBtn.addEventListener('click', () => {
    HistoryManager.renderModal();
    historyDrawer.classList.remove('hidden');
  });

  closeHistoryBtn.addEventListener('click', () => {
    historyDrawer.classList.add('hidden');
  });

  clearHistoryBtn.addEventListener('click', () => {
    HistoryManager.clear();
    HistoryManager.renderModal();
  });

  historyDrawer.addEventListener('click', (e) => {
    if (e.target === historyDrawer) historyDrawer.classList.add('hidden');
  });

});
