const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5174;

// Serve static files from dist directory
const distPath = path.join(__dirname, 'dist');

// Check if dist exists
if (!fs.existsSync(distPath)) {
  console.error('ERROR: dist directory not found! Run npm run build first.');
  process.exit(1);
}

// Serve static files
app.use(express.static(distPath));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 CMS Server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${distPath}`);
});