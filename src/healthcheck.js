const express = require('express');
const app = express();

// Health check endpoint for backend
app.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    service: 'creator-ai-backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production'
  };

  try {
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.message = error;
    res.status(503).json(healthCheck);
  }
});

// For standalone health check (used in Docker HEALTHCHECK)
if (require.main === module) {
  const http = require('http');
  
  const options = {
    hostname: 'localhost',
    port: process.env.PORT || 3001,
    path: '/health',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  });

  req.on('error', () => {
    process.exit(1);
  });

  req.on('timeout', () => {
    req.destroy();
    process.exit(1);
  });

  req.end();
}

module.exports = app;