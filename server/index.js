require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { loadCSV, watchCSV } = require('./utils/csvParser');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Startup ─────────────────────────────────────────────────────────────────
async function start() {
  console.log('📊 Customer Analytics Backend starting...');
  await loadCSV();  // Initial load
  watchCSV();       // Watch for file updates (cron writes every 3 min)

  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📁 CSV: ${process.env.CSV_PATH || '../data/processed/customer_processed.csv'}`);
  });
}

start();
