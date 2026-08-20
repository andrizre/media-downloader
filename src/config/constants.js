module.exports = {
  PORT: process.env.PORT || 3000,
  SAIPULANUAR_BASE: 'https://api.saipulanuar.eu.org/api/download',
  SIPUTZX_BASE: 'https://api.siputzx.my.id/api/d',
  TIMEOUT_MS: 25000,
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  SUPPORTED_PLATFORMS: [
    'tiktok',
    'instagram',
    'youtube',
    'facebook',
    'twitter',
    'spotify',
    'soundcloud',
    'capcut',
    'snackvideo',
    'gdrive',
    'github',
    'lahelu',
    'rednote',
    'universal'
  ]
};
