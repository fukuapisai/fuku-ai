// This file is optional for Vercel deployment
// Vercel will automatically serve files from /public and /api directories

// If you want to run this locally, you can use a simple server
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Handle root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server (only for local development)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;