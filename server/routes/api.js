const express = require('express');
const router = express.Router();
const { getData, getLastLoaded } = require('../utils/csvParser');

// ─── Helper ───────────────────────────────────────────────────────────────────
function extractFilters(query) {
  const { segment, churnRisk, processedAt } = query;
  return { segment, churnRisk, processedAt };
}

// ─── GET /api/customers ───────────────────────────────────────────────────────
// Returns all customer records (with optional filters + pagination)
router.get('/customers', async (req, res) => {
  try {
    const filters = extractFilters(req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'customerID';
    const sortDir = req.query.sortDir === 'desc' ? -1 : 1;

    let data = await getData(filters);

    // Search by CustomerID
    if (search) {
      data = data.filter((r) =>
        r.customerID.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    data = [...data].sort((a, b) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
      if (typeof valA === 'number') return sortDir * (valA - valB);
      return sortDir * String(valA).localeCompare(String(valB));
    });

    const total = data.length;
    const paginated = data.slice((page - 1) * limit, page * limit);

    res.json({ total, page, limit, lastLoaded: getLastLoaded(), data: paginated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/segments ────────────────────────────────────────────────────────
// Count per segment label
router.get('/segments', async (req, res) => {
  try {
    const data = await getData(extractFilters(req.query));
    const counts = {};
    data.forEach((r) => {
      const label = r.segmentLabel;
      counts[label] = (counts[label] || 0) + 1;
    });
    const result = Object.entries(counts).map(([name, count]) => ({ name, count }));
    res.json({ lastLoaded: getLastLoaded(), data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/churn ───────────────────────────────────────────────────────────
// Count per ChurnRisk
router.get('/churn', async (req, res) => {
  try {
    const data = await getData(extractFilters(req.query));
    const counts = { Low: 0, Medium: 0, High: 0 };
    data.forEach((r) => {
      if (counts[r.churnRisk] !== undefined) counts[r.churnRisk]++;
    });
    const result = Object.entries(counts).map(([name, count]) => ({ name, count }));
    res.json({ lastLoaded: getLastLoaded(), data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/clv-distribution ────────────────────────────────────────────────
// CLV histogram in 6 equal buckets
router.get('/clv-distribution', async (req, res) => {
  try {
    const data = await getData(extractFilters(req.query));
    if (!data.length) return res.json({ lastLoaded: getLastLoaded(), data: [] });

    const clvValues = data.map((r) => r.clv);
    const min = Math.min(...clvValues);
    const max = Math.max(...clvValues);
    const bucketCount = 6;
    const bucketSize = Math.ceil((max - min) / bucketCount);

    const buckets = Array.from({ length: bucketCount }, (_, i) => ({
      range: `${Math.round(min + i * bucketSize / 1000)}k–${Math.round(min + (i + 1) * bucketSize / 1000)}k`,
      count: 0,
    }));

    clvValues.forEach((v) => {
      const idx = Math.min(Math.floor((v - min) / bucketSize), bucketCount - 1);
      buckets[idx].count++;
    });

    res.json({ lastLoaded: getLastLoaded(), data: buckets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/actions ─────────────────────────────────────────────────────────
// Group by RecommendedAction
router.get('/actions', async (req, res) => {
  try {
    const data = await getData(extractFilters(req.query));
    const counts = {};
    data.forEach((r) => {
      const action = r.recommendedAction || 'None';
      counts[action] = (counts[action] || 0) + 1;
    });

    // Also build segment × churnRisk × action matrix for heatmap
    const matrix = {};
    data.forEach((r) => {
      const key = `${r.segmentLabel}__${r.churnRisk}`;
      if (!matrix[key]) {
        matrix[key] = { segment: r.segmentLabel, churnRisk: r.churnRisk, actions: {}, count: 0 };
      }
      matrix[key].count++;
      const action = r.recommendedAction || 'None';
      matrix[key].actions[action] = (matrix[key].actions[action] || 0) + 1;
    });

    // Derive dominant action per cell
    const matrixArr = Object.values(matrix).map((cell) => {
      const dominant = Object.entries(cell.actions).sort((a, b) => b[1] - a[1])[0];
      return {
        segment: cell.segment,
        churnRisk: cell.churnRisk,
        count: cell.count,
        dominantAction: dominant ? dominant[0] : 'None',
      };
    });

    const summary = Object.entries(counts).map(([action, count]) => ({ action, count }));
    res.json({ lastLoaded: getLastLoaded(), data: summary, matrix: matrixArr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/kpis ────────────────────────────────────────────────────────────
// Aggregated KPI metrics
router.get('/kpis', async (req, res) => {
  try {
    const data = await getData(extractFilters(req.query));
    if (!data.length) return res.json({ lastLoaded: getLastLoaded(), data: {} });

    const totalCustomers = data.length;
    const avgCLV = Math.round(data.reduce((s, r) => s + r.clv, 0) / totalCustomers);
    const highChurn = data.filter((r) => r.churnRisk === 'High').length;
    const churnPercent = parseFloat(((highChurn / totalCustomers) * 100).toFixed(1));
    const totalRevenue = Math.round(data.reduce((s, r) => s + r.totalSpend, 0));
    const avgEngagement = parseFloat((data.reduce((s, r) => s + r.engagementScore, 0) / totalCustomers).toFixed(2));
    const highValueCount = data.filter((r) => r.segmentLabel === 'Platinum' || r.segmentLabel === 'Gold').length;
    const avgOrderValue = parseFloat((data.reduce((s, r) => s + r.avgOrderValue, 0) / totalCustomers).toFixed(2));

    res.json({
      lastLoaded: getLastLoaded(),
      data: {
        totalCustomers,
        avgCLV,
        highChurn,
        churnPercent,
        totalRevenue,
        avgEngagement,
        highValueCount,
        avgOrderValue,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/scatter ─────────────────────────────────────────────────────────
// Scatter plot data: frequency, monetary, CLV, segment
router.get('/scatter', async (req, res) => {
  try {
    const data = await getData(extractFilters(req.query));
    const result = data.map((r) => ({
      x: r.frequency,
      y: r.monetary,
      z: Math.round(r.clv / 50000),  // Bubble size scaling
      clv: r.clv,
      segment: r.segmentLabel,
      churnRisk: r.churnRisk,
      customerID: r.customerID,
    }));
    res.json({ lastLoaded: getLastLoaded(), data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/trend ───────────────────────────────────────────────────────────
// Trend data: engagement & spend grouped by processedAt date
router.get('/trend', async (req, res) => {
  try {
    const data = await getData();
    const grouped = {};
    data.forEach((r) => {
      const date = r.processedAt ? r.processedAt.split(' ')[0] : 'Unknown';
      if (!grouped[date]) grouped[date] = { date, totalSpend: 0, avgEngagement: 0, count: 0, clv: 0 };
      grouped[date].totalSpend += r.totalSpend;
      grouped[date].avgEngagement += r.engagementScore;
      grouped[date].clv += r.clv;
      grouped[date].count++;
    });
    const result = Object.values(grouped)
      .map((g) => ({
        date: g.date,
        totalSpend: Math.round(g.totalSpend),
        avgEngagement: parseFloat((g.avgEngagement / g.count).toFixed(2)),
        avgCLV: Math.round(g.clv / g.count),
        customers: g.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    res.json({ lastLoaded: getLastLoaded(), data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
