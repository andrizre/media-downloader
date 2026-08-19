module.exports = {
  PORT: process.env.PORT || 3000,
  API_BASE: 'https://api.saipulanuar.eu.org/api/download',
  IGDL_ENDPOINT: 'https://api.saipulanuar.eu.org/api/download/igdl',
  TTDL_ENDPOINT: 'https://api.saipulanuar.eu.org/api/download/ttdl',
  TIMEOUT_MS: 30000,
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  SUPPORTED_PLATFORMS: ['instagram', 'tiktok'],
  MAX_HISTORY_ITEMS: 30
};
