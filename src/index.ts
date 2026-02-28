import app from './app.js';
import { config } from './config/index.js';

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log(`[INFO] Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('[INFO] SIGTERM received: closing server');
  server.close(() => {
    console.log('[INFO] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[INFO] SIGINT received: closing server');
  server.close(() => {
    console.log('[INFO] Server closed');
    process.exit(0);
  });
});
