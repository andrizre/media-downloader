async function executeWithFallback(providers, platformName, inputUrl, options = {}) {
  let lastError = null;
  const errors = [];

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    try {
      // console.log(`[Fallback Engine] Trying provider "${provider.name}" for ${platformName}...`);
      const result = await provider.fn(inputUrl, options);
      if (result && (result.videoUrl || result.audioUrl || result.downloadUrl)) {
        return {
          ...result,
          provider: provider.name,
          attempt: i + 1,
          totalProviders: providers.length
        };
      }
      throw new Error('Hasil media kosong dari provider ' + provider.name);
    } catch (err) {
      lastError = err;
      errors.push(`[${provider.name}]: ${err.message}`);
      console.warn(`[Fallback Engine] Provider "${provider.name}" gagal untuk ${platformName}: ${err.message}`);
    }
  }

  const detailedMsg = errors.length > 1 ? ` (Gagal setelah mencoba ${providers.length} metode: ${errors.join('; ')})` : '';
  throw new Error(`Gagal memproses tautan ${platformName}${detailedMsg}. Pastikan link valid dan dapat diakses publik.`);
}

module.exports = { executeWithFallback };
