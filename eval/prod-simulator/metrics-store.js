/**
 * Metrics Store
 * Simulates a time-series store of eval results.
 * In production this would be a real DB (Postgres, InfluxDB, etc.)
 * For the pilot we use a local JSON file.
 */

const fs   = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'metrics-history.json');

function loadHistory() {
  if (!fs.existsSync(STORE_PATH)) return [];
  return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
}

function saveHistory(history) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(history, null, 2));
}

function recordRun(run) {
  const history = loadHistory();
  history.push({
    ...run,
    timestamp: new Date().toISOString()
  });
  // Keep last 30 runs
  if (history.length > 30) history.shift();
  saveHistory(history);
  return history;
}

function getHistory() {
  return loadHistory();
}

function getLatest() {
  const h = loadHistory();
  return h.length > 0 ? h[h.length - 1] : null;
}

function getTrend() {
  const h = loadHistory();
  if (h.length < 2) return 'insufficient_data';
  const last  = h[h.length - 1].passRate;
  const prev  = h[h.length - 2].passRate;
  if (last > prev) return 'improving';
  if (last < prev) return 'degrading';
  return 'stable';
}

module.exports = { recordRun, getHistory, getLatest, getTrend };