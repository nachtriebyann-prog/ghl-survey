const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const htmlPath = path.join(__dirname, '../public/index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};
