const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // Si c'est une route API, laisser les autres handlers s'en occuper
  if (req.url && req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Sinon, servir la page HTML
  const htmlPath = path.join(__dirname, '../public/index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};
