// Cobalt-Style Unified Controller for SnapMedia

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
  const resTitle = document.getElementById('resTitle');
  const resAudioTitle = document.getElementById('resAudioTitle');
  const resAudioText = document.getElementById('resAudioText');
  const resVideoPlayer = document.getElementById('resVideoPlayer');
  const resVideoSource = document.getElementById('resVideoSource');
  const resThumbnail = document.getElementById('resThumbnail');
  const resPrimaryDownloadBtn = document.getElementById('resPrimaryDownloadBtn');
  const resPrimaryBtnLabel = document.getElementById('resPrimaryBtnLabel');
  const resAudioDownloadBtn = document.getElementById('resAudioDownloadBtn');
  const resCopyLinkBtn = document.getElementById('resCopyLinkBtn');
  const resShareBtn = document.getElementById('resShareBtn');

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

  // 2. Auto-Detect Platform Icon on Input
  function detectPlatform(val) {
    const v = (val || '').toLowerCase().trim();
    if (v.includes('instagram.com') || v.includes('instagr.am')) return 'instagram';
    if (v.includes('tiktok.com') || v.includes('douyin.com')) return 'tiktok';
    return null;
  }

  urlInput.addEventListener('input', () => {
    const val = urlInput.value.trim();
    clearInputBtn.classList.toggle('hidden', val.length === 0);

    const platform = detectPlatform(val);
    if (platform === 'instagram') {
      platformIconIndicator.innerHTML = '<i class="bi bi-instagram text-pink-500 animate-pulse"></i>';
    } else if (platform === 'tiktok') {
      platformIconIndicator.innerHTML = '<i class="bi bi-tiktok text-cyan-400 animate-pulse"></i>';
    } else {
      platformIconIndicator.innerHTML = '<i class="bi bi-link-45deg text-slate-500"></i>';
    }
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
      } else if (!settingsPanel.classList.contains('hidden')) {
        settingsPanel.classList.add('hidden');
      } else {
        clearInputBtn.click();
        resultSection.classList.add('hidden');
      }
    }
  });

  // 5. Submit Form & Process
  downloadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    const detected = detectPlatform(url) || 'auto';
    const audioOnly = settingAudioOnly.checked;

    // Show Processing
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
        url: url
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
        background: '#11141a',
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
      procStatusText.textContent = 'tunneling media stream...';
      submitBtn.disabled = true;
      submitIcon.className = 'bi bi-arrow-repeat text-xl animate-spin';
    } else {
      processingSection.classList.add('hidden');
      submitBtn.disabled = false;
      submitIcon.className = 'bi bi-arrow-right text-xl font-bold';
    }
  }

  // 6. Render Result
  function renderResult(data) {
    currentResultData = data;
    const isIg = data.platform === 'instagram';

    // Platform Badge
    if (isIg) {
      resPlatformBadge.className = 'text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30';
      resPlatformBadge.innerHTML = '<i class="bi bi-instagram me-1"></i> instagram';
    } else {
      resPlatformBadge.className = 'text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
      resPlatformBadge.innerHTML = '<i class="bi bi-tiktok me-1"></i> tiktok';
    }

    // Title & Sound info
    resTitle.textContent = data.title || (isIg ? 'Instagram Media' : 'TikTok Media');
    if (data.audioUrl || data.title_audio) {
      resAudioTitle.classList.remove('hidden');
      resAudioText.textContent = data.title_audio || data.title || 'Original Audio';
    } else {
      resAudioTitle.classList.add('hidden');
    }

    // Preview
    if (data.videoUrl) {
      resVideoSource.src = data.videoUrl;
      resVideoPlayer.poster = data.thumbnail || '';
      resVideoPlayer.load();
      resVideoPlayer.classList.remove('hidden');
      resThumbnail.classList.add('hidden');
    } else if (data.thumbnail) {
      resThumbnail.src = data.thumbnail;
      resThumbnail.classList.remove('hidden');
      resVideoPlayer.classList.add('hidden');
    }

    // Download URLs
    const primaryDl = data.downloadUrl || data.downloadVideoUrl || data.videoUrl;
    resPrimaryDownloadBtn.href = primaryDl;
    resPrimaryBtnLabel.textContent = data.type === 'audio' ? 'save audio (.mp3)' : 'save video (.mp4)';

    // Audio download button (for TikTok)
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
    const link = currentResultData.videoUrl || currentResultData.downloadUrl;
    try {
      await navigator.clipboard.writeText(link);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Link berhasil disalin!',
        showConfirmButton: false,
        timer: 1500,
        background: '#11141a',
        color: '#fff'
      });
    } catch (e) {}
  });

  // Share
  resShareBtn.addEventListener('click', async () => {
    if (!currentResultData) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentResultData.title || 'SnapMedia',
          url: currentResultData.videoUrl || window.location.href
        });
      } catch (e) {}
    } else {
      resCopyLinkBtn.click();
    }
  });

  // History Drawer Toggle
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
