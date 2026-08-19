const express = require('express');
const router = express.Router();

router.get('/sitemap.xml', (req, res) => {
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
'  <url>\n' +
'    <loc>http://localhost:3000/</loc>\n' +
'    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n' +
'    <changefreq>daily</changefreq>\n' +
'    <priority>1.0</priority>\n' +
'  </url>\n' +
'</urlset>';
  res.setHeader('Content-Type', 'application/xml');
  res.send(sitemap);
});

router.get('/robots.txt', (req, res) => {
  const robots = 'User-agent: *\nAllow: /\nDisallow: /api/proxy/\n\nSitemap: http://localhost:3000/sitemap.xml';
  res.setHeader('Content-Type', 'text/plain');
  res.send(robots);
});

module.exports = router;
