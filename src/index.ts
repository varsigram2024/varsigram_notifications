import express from 'express';
import dotenv from 'dotenv';
import { startChatListener, isListenerActive } from './listeners/chatListener';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Dynamic Health Check
app.get('/health', (req, res) => {
  if (isListenerActive) {
    res.status(200).json({ status: 'healthy', message: 'Worker is watching Firebase. ' });
  } else {
    res.status(503).json({ status: 'unhealthy', message: 'Listener is down.' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Worker running on port ${PORT}`);
});

// 1. Start the listener and save the kill switch
const unsubscribe = startChatListener();

// 2. Global Safety Net for random crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error(' Unhandled Rejection at:', promise, 'reason:', reason);
});

// 3. Graceful Shutdown (The Anti-Memory Leak)
const shutdown = () => {
  console.log(' Shutting down gracefully...');
  unsubscribe(); // Kill the Firebase connection
  server.close(() => {
    console.log(' Express server closed.');
    process.exit(0);
  });
};

// Listen for restart commands from your hosting provider
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown); // For when you press Ctrl+C locally