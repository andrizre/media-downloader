# ⚡ SnapMedia — Modern Social Media Downloader

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.21.2-indigo.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-purple.svg)
![SEO](https://img.shields.io/badge/SEO-Optimized-success.svg)
![WPO](https://img.shields.io/badge/WPO-Gzip%20Compressed-cyan.svg)

**A minimalist, ultra-fast, and ad-free media downloader inspired by [cobalt.tools](https://cobalt.tools).**  
Instantly extract HD videos & Reels from **Instagram** and no-watermark HD videos & MP3 audio from **TikTok**.

[Fitur Utama](#-fitur-utama) • [Arsitektur Proyek](#-arsitektur-proyek) • [Instalasi & Menjalankan](#-instalasi--menjalankan) • [Dokumentasi API](#-dokumentasi-api) • [SEO & WPO](#-optimasi-seo--wpo) • [Pintasan Keyboard](#-pintasan-keyboard)

</div>

---

## ✨ Fitur Utama

- 🔄 **Smart Auto-Detection**: Masukkan URL apa saja tanpa perlu memilih tab terpisah. Sistem otomatis mengenali platform Instagram atau TikTok.
- 🚫 **Tanpa Watermark TikTok**: Unduh video TikTok berkualitas HD asli tanpa watermark logo bawaan.
- 🎵 **Ekstraktor Musik MP3**: Konversi dan simpan sound / lagu latar TikTok langsung ke format file MP3 berkualitas tinggi.
- 📷 **Instagram Reels & Post Downloader**: Simpan video Reels dan post Instagram dalam satu klik.
- 📥 **Stream & Download Proxy Engine**: Mengalirkan file langsung dengan header `Content-Disposition: attachment` sehingga file langsung tersimpan fisik ke folder Downloads galeri/komputer tanpa terhalang CORS.
- 🎨 **Desain Minimalis Modern (Cobalt.tools Aesthetic)**: Antarmuka bernuansa Obsidian / Cyber Dark dengan ambient glowing effect dan tipografi *Plus Jakarta Sans* + *JetBrains Mono*.
- ⚙️ **Quick Settings & Audio Mode**: Pilihan mode `auto` atau `audio only (mp3)` serta opsi *auto-download immediately*.
- 📋 **1-Click Clipboard Paste**: Tombol tempel otomatis dari clipboard mempermudah pengunduhan dalam sekali sentuh.
- 🕒 **Riwayat Unduhan Lokal**: Riwayat unduhan tersimpan aman di `localStorage` peramban tanpa memerlukan database eksternal.
- 📱 **PWA & Mobile Ready**: Tampilan responsif di semua perangkat dan dapat di-install sebagai Progressive Web App.

---

## 🏗️ Arsitektur Proyek

Struktur kode modular (*enterprise-grade*) yang memisahkan konfigurasi, service, controller, middleware, dan routing:

```
media-downloader/
├── package.json                   # Konfigurasi dependensi (express, cors, compression)
├── server.js                      # Entrypoint utama server & konfigurasi middleware
├── src/
│   ├── config/
│   │   └── constants.js           # Konfigurasi konstanta API, timeout, user-agent
│   ├── services/
│   │   ├── instagramService.js   # Logic ekstraksi & normalisasi data Instagram
│   │   └── tiktokService.js      # Logic ekstraksi data TikTok (Video & MP3)
│   ├── controllers/
│   │   ├── downloadController.js # Controller Auto-Detect, Instagram & TikTok
│   │   └── proxyController.js    # Controller streaming & attachment proxy
│   ├── middlewares/
│   │   ├── cacheHeaders.js       # Security headers & WPO asset caching
│   │   └── errorHandler.js       # Centralized error handler standar JSON
│   └── routes/
│       ├── api.js                # Routing endpoint API (/api/*)
│       └── seo.js                # Routing SEO (/sitemap.xml, /robots.txt)
└── public/
    ├── index.html                 # Semantic HTML5 + SEO JSON-LD + OpenGraph
    ├── manifest.json              # PWA Web App Manifest
    ├── robots.txt                 # Search Engine Crawler Directives
    ├── sitemap.xml                # Dynamic XML Sitemap
    ├── css/
    │   └── style.css              # Custom styling, animations & glowing effects
    └── js/
        ├── app.js                 # Frontend application controller
        └── history.js             # LocalStorage history manager service
```

---

## 🚀 Instalasi & Menjalankan

### Prasyarat
- **Node.js**: Versi `18.0.0` atau yang lebih baru.
- **NPM**: Bawaan Node.js.

### Langkah-Langkah

1. **Clone atau Buka Direktori Project**:
   ```bash
   cd media-downloader
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Server**:
   ```bash
   npm start
   ```
   *Atau mode pengembangan dengan hot-reload:*
   ```bash
   npm run dev
   ```

4. **Buka di Browser**:
   Buka peramban Anda dan akses:
   ```
   http://localhost:3000
   ```

---

## 📡 Dokumentasi API

### 1. Auto-Detect & Download Media
Mendeteksi format link secara otomatis dan mengekstrak media (Instagram / TikTok).

- **Endpoint**: `POST /api/download/auto`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "url": "https://vt.tiktok.com/ZSrYfB8tJ/",
    "audioOnly": false
  }
  ```
- **Response Sukses (TikTok)**:
  ```json
  {
    "success": true,
    "data": {
      "platform": "tiktok",
      "type": "video",
      "title": "original sound - user",
      "thumbnail": "https://...",
      "videoUrl": "https://...",
      "audioUrl": "https://...",
      "downloadUrl": "/api/proxy/download?url=...&filename=tiktok_123.mp4",
      "downloadVideoUrl": "/api/proxy/download?url=...&filename=tiktok_123.mp4",
      "downloadAudioUrl": "/api/proxy/download?url=...&filename=tiktok_audio_123.mp3"
    }
  }
  ```

---

### 2. Instagram Downloader
- **Endpoint**: `POST /api/download/instagram`
- **Request Body**:
  ```json
  {
    "url": "https://www.instagram.com/reel/DQrg6e6kpkU/?hl=id"
  }
  ```

---

### 3. TikTok Downloader
- **Endpoint**: `POST /api/download/tiktok`
- **Request Body**:
  ```json
  {
    "url": "https://vt.tiktok.com/ZSrYfB8tJ/",
    "audioOnly": true
  }
  ```

---

### 4. Direct Stream Proxy (Force Download)
- **Endpoint**: `GET /api/proxy/download?url={ENCODED_URL}&filename={FILENAME}`
- **Output**: Binary media stream dengan header `Content-Disposition: attachment; filename="filename.ext"`.

---

### 5. Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "app": "SnapMedia (Cobalt-Style Downloader)",
    "version": "2.0.0",
    "supported": ["instagram", "tiktok"]
  }
  ```

---

## 🔍 Optimasi SEO & WPO

### SEO (Search Engine Optimization)
- **Structured Data**: Schema.org (`WebApplication`, `SoftwareApplication`, dan `FAQPage`) disematkan dalam format JSON-LD.
- **Social Sharing Ready**: Lengkap dengan Open Graph tags (`og:title`, `og:description`, `og:image`, dll.) & Twitter Summary Card.
- **Sitemap & Robots**: Tersedia di `/sitemap.xml` dan `/robots.txt` untuk memudahkan web crawler mengindeks halaman.
- **Canonical URL**: Mencegah isu konten duplikat pada search engine.

### WPO (Web Performance Optimization)
- **Gzip/Deflate Compression**: Menggunakan `compression` middleware yang mengurangi ukuran transfer payload hingga **70%+**.
- **Resource Hints**: `preconnect` & `dns-prefetch` untuk font Google dan CDN eksternal.
- **Cache-Control Heuristics**: Aset statis (CSS/JS/SVG) dicache jangka panjang (`max-age=31536000, immutable`).
- **Zero Blocking**: Skrip dimuat dengan `defer`, serta gambar/video menggunakan `loading="lazy"` dan `decoding="async"`.
- **Security Headers**: Dilengkapi `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, dan `X-XSS-Protection`.

---

## ⌨️ Pintasan Keyboard

| Tombol | Aksi |
| :--- | :--- |
| <kbd>Enter</kbd> | Memproses link & mengunduh media |
| <kbd>Ctrl</kbd> + <kbd>V</kbd> | Menempel tautan dari clipboard |
| <kbd>Esc</kbd> | Membersihkan input / menutup modal riwayat & pengaturan |

---

## 📜 Lisensi & Kredit

- **Lisensi**: [MIT License](LICENSE)
- **API Provider**: Didukung oleh [saipulanuar API](https://api.saipulanuar.eu.org)
- **Desain Inspirasi**: [cobalt.tools](https://cobalt.tools)
