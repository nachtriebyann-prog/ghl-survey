const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // For API routes, let Vercel routing handle them
  // This catch-all only serves HTML for non-API routes
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }

  // Serve the HTML for all other routes
  const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};
