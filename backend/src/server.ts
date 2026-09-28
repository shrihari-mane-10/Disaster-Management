import 'dotenv/config';
import http from 'http';
import { createApp } from './app.js';
import { initSocketIO } from './sockets/socketHandler.js';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = '0.0.0.0';

const app = createApp();
const server = http.createServer(app);

// Initialize Socket.IO namespace /live
initSocketIO(server);


server.listen(PORT, HOST, () => {
  console.log('====================================================');
  console.log(`🚨 Disaster Response Coordination Backend running!`);
  console.log(`📡 Local Address:   http://localhost:${PORT}/api/v1`);
  console.log(`🌐 Network Address: http://${HOST}:${PORT}/api/v1`);
  console.log(`📂 Uploads URL:     http://${HOST}:${PORT}/uploads`);
  console.log(`❤️  Health Check:    http://${HOST}:${PORT}/api/v1/health`);
  console.log('====================================================');
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
