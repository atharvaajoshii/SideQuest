const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const app = express();

process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION:', err);
});

// Middleware
app.use(cors());
app.use(express.json());

// 🔥 REQUEST LOGGER
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Test route
app.get('/', (req, res) => {
  res.send('SideQuest API is running! 🚀');
});

// 🔥 GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// 🔥 KEEP PROCESS ALIVE (TEMP FIX)
setInterval(() => {}, 1000);