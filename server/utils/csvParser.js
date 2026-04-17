const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const chokidar = require('chokidar');

// ─── State ───────────────────────────────────────────────────────────────────
let cachedData = [];
let lastLoaded = null;
let isLoading = false;
let fileWatcher = null;

// Resolve CSV path relative to server root
const CSV_PATH = path.resolve(__dirname, '..', process.env.CSV_PATH || '../data/processed/customer_processed.csv');

// ─── Segment label mapping ────────────────────────────────────────────────────
const SEGMENT_LABELS = { '0': 'Bronze', '1': 'Silver', '2': 'Gold', '3': 'Platinum' };

/**
 * Parse the CSV file and store records in memory cache.
 * Handles malformed / empty CSV gracefully.
 */
function loadCSV() {
  return new Promise((resolve, reject) => {
    if (isLoading) {
      // Avoid concurrent loads — return current cache
      return resolve(cachedData);
    }

    if (!fs.existsSync(CSV_PATH)) {
      console.warn(`[CSV] File not found at: ${CSV_PATH}`);
      cachedData = [];
      return resolve(cachedData);
    }

    isLoading = true;
    const results = [];

    fs.createReadStream(CSV_PATH)
      .on('error', (err) => {
        isLoading = false;
        console.error('[CSV] Stream error:', err.message);
        resolve(cachedData); // Return last good cache
      })
      .pipe(csv())
      .on('data', (row) => {
        try {
          results.push(normalizeRow(row));
        } catch (e) {
          // Skip malformed rows silently
        }
      })
      .on('end', () => {
        isLoading = false;
        if (results.length > 0) {
          cachedData = results;
          lastLoaded = new Date();
          console.log(`[CSV] Loaded ${results.length} records at ${lastLoaded.toISOString()}`);
        }
        resolve(cachedData);
      })
      .on('error', (err) => {
        isLoading = false;
        console.error('[CSV] Parse error:', err.message);
        resolve(cachedData);
      });
  });
}

/**
 * Normalise raw CSV row — cast numeric fields, add segment label.
 */
function normalizeRow(row) {
  return {
    customerID: row.CustomerID || '',
    accountAgeMonths: parseFloat(row.AccountAgeMonths) || 0,
    lastPurchaseDays: parseFloat(row.LastPurchaseDays) || 0,
    totalOrders: parseFloat(row.TotalOrders) || 0,
    totalSpend: parseFloat(row.TotalSpend) || 0,
    avgOrderValue: parseFloat(row.AvgOrderValue) || 0,
    appLogins30d: parseFloat(row.AppLogins30d) || 0,
    wishlistItems: parseFloat(row.WishlistItems) || 0,
    cartAbandonments: parseFloat(row.CartAbandonments) || 0,
    discountUsage: row.DiscountUsage || '',
    generatedAt: row.GeneratedAt || '',
    recency: parseFloat(row.Recency) || 0,
    frequency: parseFloat(row.Frequency) || 0,
    monetary: parseFloat(row.Monetary) || 0,
    engagementScore: parseFloat(row.EngagementScore) || 0,
    segment: row.Segment || '0',
    segmentLabel: SEGMENT_LABELS[row.Segment] || `Segment ${row.Segment}`,
    churnRisk: row.ChurnRisk || '',
    clv: parseFloat(row.CLV) || 0,
    recommendedAction: row.RecommendedAction || '',
    processedAt: row.ProcessedAt || '',
  };
}

/**
 * Start watching CSV file for changes and auto-reload.
 */
function watchCSV() {
  if (fileWatcher) return;

  fileWatcher = chokidar.watch(CSV_PATH, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 200 },
  });

  fileWatcher.on('change', () => {
    console.log('[CSV] File changed — reloading...');
    loadCSV();
  });

  console.log(`[CSV] Watching for changes: ${CSV_PATH}`);
}

/**
 * Return current in-memory cache (load if empty).
 */
async function getData(filters = {}) {
  if (cachedData.length === 0) {
    await loadCSV();
  }

  let data = cachedData;

  // Apply optional filters
  if (filters.segment) {
    data = data.filter((r) => r.segment === filters.segment || r.segmentLabel.toLowerCase() === filters.segment.toLowerCase());
  }
  if (filters.churnRisk) {
    data = data.filter((r) => r.churnRisk.toLowerCase() === filters.churnRisk.toLowerCase());
  }
  if (filters.processedAt) {
    data = data.filter((r) => r.processedAt.startsWith(filters.processedAt));
  }

  return data;
}

/**
 * Get last loaded timestamp.
 */
function getLastLoaded() {
  return lastLoaded ? lastLoaded.toISOString() : null;
}

module.exports = { loadCSV, watchCSV, getData, getLastLoaded };
