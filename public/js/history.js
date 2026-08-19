// Cobalt-Style Minimal History Manager

const HISTORY_KEY = 'snapmedia_history_v2';
const MAX_HISTORY = 30;

const HistoryManager = {
  getAll() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  add(item) {
    try {
      let list = this.getAll();
      list = list.filter(i => i.downloadUrl !== item.downloadUrl && i.videoUrl !== item.videoUrl);
      list.unshift({
        id: Date.now().toString(),
        title: item.title || 'Media',
        platform: item.platform || 'unknown',
        thumbnail: item.thumbnail || '',
        downloadUrl: item.downloadUrl || '',
        downloadAudioUrl: item.downloadAudioUrl || '',
        timestamp: new Date().toISOString()
      });
      if (list.length > MAX_HISTORY) list = list.slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
      this.updateBadge();
    } catch (e) {}
  },

  clear() {
    localStorage.removeItem(HISTORY_KEY);
    this.updateBadge();
  },

  remove(id) {
    let list = this.getAll().filter(i => i.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    this.updateBadge();
  },

  updateBadge() {
    const list = this.getAll();
    const badge = document.getElementById('historyCountBadge');
    if (badge) {
      if (list.length > 0) {
        badge.textContent = list.length;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  },

  renderModal() {
    const container = document.getElementById('historyListContainer');
    if (!container) return;
    const list = this.getAll();

    if (list.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-slate-500 text-xs">
          <i class="bi bi-inbox text-3xl mb-2 block"></i>
          no download history yet.
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => {
      const isIg = item.platform === 'instagram';
      const badgeBg = isIg ? 'bg-pink-500/20 text-pink-400' : 'bg-cyan-500/20 text-cyan-400';
      const icon = isIg ? 'bi-instagram' : 'bi-tiktok';

      return `
        <div class="flex items-center gap-3 p-2.5 rounded-xl bg-surface-950/80 border border-surface-800 text-xs">
          <div class="w-10 h-10 rounded-lg bg-surface-850 overflow-hidden flex-shrink-0 flex items-center justify-center">
            ${item.thumbnail ? `<img src="${item.thumbnail}" class="w-full h-full object-cover">` : `<i class="bi ${icon} text-slate-500"></i>`}
          </div>
          <div class="flex-grow min-w-0">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="text-[9px] font-bold px-1.5 py-0.2 rounded ${badgeBg}">${item.platform}</span>
              <span class="text-[10px] text-slate-500 truncate">${new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <p class="text-white font-medium truncate text-[11px]">${item.title}</p>
          </div>
          <div class="flex items-center gap-1">
            ${item.downloadUrl ? `
              <a href="${item.downloadUrl}" target="_blank" class="p-1.5 rounded-lg bg-cobalt hover:bg-cobalt-hover text-white text-xs" title="save">
                <i class="bi bi-download"></i>
              </a>
            ` : ''}
            <button onclick="HistoryManager.remove('${item.id}'); HistoryManager.renderModal();" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 text-xs" title="delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  HistoryManager.updateBadge();
});
