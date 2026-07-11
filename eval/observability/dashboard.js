#!/usr/bin/env node
/**
 * GovMurshid Observability Dashboard
 * Generates an HTML report showing quality trends over time.
 */

const fs   = require('fs');
const path = require('path');
const { getHistory, getTrend } = require('./metrics-store');

function generateDashboard() {
  const history = getHistory();
  const trend   = getTrend();

  if (history.length === 0) {
    console.log('No metrics history yet. Run prod-eval first.');
    process.exit(0);
  }

  const latest    = history[history.length - 1];
  const passRates = history.map(h => (h.passRate * 100).toFixed(1));
  const labels    = history.map((h, i) => `Run ${i + 1}`);
  const trendIcon = trend === 'improving' ? '📈' : trend === 'degrading' ? '📉' : '➡️';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>GovMurshid Quality Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f4f8; color: #1a1a1a; }
    header { background: #006241; color: white; padding: 20px 32px; }
    header h1 { font-size: 1.5rem; }
    header p  { font-size: 0.85rem; opacity: 0.8; margin-top: 4px; }
    .container { max-width: 1100px; margin: 32px auto; padding: 0 16px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card .label { font-size: 0.8rem; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
    .card .value { font-size: 2rem; font-weight: 700; margin-top: 8px; }
    .card .value.green  { color: #16a34a; }
    .card .value.yellow { color: #d97706; }
    .card .value.red    { color: #dc2626; }
    .chart-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; }
    .chart-card h2 { font-size: 1rem; font-weight: 600; margin-bottom: 16px; color: #333; }
    .history-table { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .history-table table { width: 100%; border-collapse: collapse; }
    .history-table th { background: #006241; color: white; padding: 12px 16px; text-align: left; font-size: 0.85rem; }
    .history-table td { padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 0.9rem; }
    .history-table tr:last-child td { border-bottom: none; }
    .pass  { color: #16a34a; font-weight: 600; }
    .warn  { color: #d97706; font-weight: 600; }
    .fail  { color: #dc2626; font-weight: 600; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .badge.green  { background: #dcfce7; color: #16a34a; }
    .badge.yellow { background: #fef9c3; color: #d97706; }
    .badge.red    { background: #fee2e2; color: #dc2626; }
  </style>
</head>
<body>

<header>
  <h1>🇦🇪 GovMurshid Quality Dashboard</h1>
  <p>UAE Government Services AI — Quality Observability</p>
</header>

<div class="container">

  <!-- KPI Cards -->
  <div class="cards">
    <div class="card">
      <div class="label">Latest Pass Rate</div>
      <div class="value ${latest.passRate >= 0.85 ? 'green' : latest.passRate >= 0.70 ? 'yellow' : 'red'}">
        ${(latest.passRate * 100).toFixed(1)}%
      </div>
    </div>
    <div class="card">
      <div class="label">Trend</div>
      <div class="value">${trendIcon} ${trend.replace('_', ' ')}</div>
    </div>
    <div class="card">
      <div class="label">Total Eval Runs</div>
      <div class="value" style="color:#006241">${history.length}</div>
    </div>
    <div class="card">
      <div class="label">Last Run</div>
      <div class="value" style="font-size:1rem; margin-top:12px;">
        ${new Date(latest.timestamp).toLocaleString('en-AE', { timeZone: 'Asia/Dubai' })}
      </div>
    </div>
  </div>

  <!-- Pass Rate Trend Chart -->
  <div class="chart-card">
    <h2>Pass Rate Trend</h2>
    <canvas id="trendChart" height="80"></canvas>
  </div>

  <!-- History Table -->
  <div class="history-table">
    <table>
      <thead>
        <tr>
          <th>Run</th>
          <th>Timestamp (UAE)</th>
          <th>Type</th>
          <th>Pass Rate</th>
          <th>Passed</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${history.slice().reverse().map((h, i) => {
          const status = h.passRate >= 0.85 ? 'pass' : h.passRate >= 0.70 ? 'warn' : 'fail';
          const badge  = h.passRate >= 0.85 ? 'green' : h.passRate >= 0.70 ? 'yellow' : 'red';
          const label  = h.passRate >= 0.85 ? 'Healthy' : h.passRate >= 0.70 ? 'Warning' : 'Critical';
          return `
        <tr>
          <td>#${history.length - i}</td>
          <td>${new Date(h.timestamp).toLocaleString('en-AE', { timeZone: 'Asia/Dubai' })}</td>
          <td>${h.type || 'eval'}</td>
          <td class="${status}">${(h.passRate * 100).toFixed(1)}%</td>
          <td>${h.passed}</td>
          <td>${h.total}</td>
          <td><span class="badge ${badge}">${label}</span></td>
        </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>

</div>

<script>
  const ctx = document.getElementById('trendChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [{
        label: 'Pass Rate (%)',
        data: ${JSON.stringify(passRates)},
        borderColor: '#006241',
        backgroundColor: 'rgba(0,98,65,0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#006241'
      }, {
        label: 'Minimum (80%)',
        data: Array(${history.length}).fill(80),
        borderColor: '#dc2626',
        borderDash: [5, 5],
        borderWidth: 1,
        fill: false,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { min: 0, max: 100, ticks: { callback: v => v + '%' } }
      }
    }
  });
</script>

</body>
</html>`;

  const outputPath = path.join(__dirname, 'dashboard.html');
  fs.writeFileSync(outputPath, html);
  console.log(`✅ Dashboard generated: ${outputPath}`);
  return outputPath;
}

generateDashboard();