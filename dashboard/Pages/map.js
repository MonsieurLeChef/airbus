// Interactive Heat Map for Opportunities
// Uses localStorage data from card.js

// Heat map configuration
// Generic labels so any scaling metric (1-10) can be mapped
const xLabels = ['1-2', '3-4', '5-6', '7-8', '9-10'];
const yLabels = ['1-2', '3-4', '5-6', '7-8', '9-10'];

// Scaling options available on opportunity cards
const scaleOptions = [
  { key: 'impact', label: 'Impact' },
  { key: 'potential', label: 'Potential' },
  { key: 'fit', label: 'Fit' }
];

// Dropdowns for choosing axis metrics
const xSelect = document.getElementById('x-axis-select');
const ySelect = document.getElementById('y-axis-select');

const colorMap = {
  green: '#4fd1c5', // Acceptable Risk / Weak Opportunity
  yellow: '#f6c343', // Important Risk / Encouraged Opportunity
  red: '#f95d6a' // Critical Risk / Important Opportunity
};

// Score matrix for coloring (from image)
const scoreMatrix = [
  [5, 10, 15, 20, 25],
  [4, 8, 12, 16, 20],
  [3, 6, 9, 12, 15],
  [2, 4, 6, 8, 10],
  [1, 2, 3, 4, 5]
];

function getCellColor(score) {
  if (score >= 15) return colorMap.red;
  if (score >= 6) return colorMap.yellow;
  return colorMap.green;
}

// Map opportunity data to heatmap cells based on selected metrics
function getHeatmapData(xKey, yKey) {
  const saved = localStorage.getItem('opportunityCards');
  if (!saved) return [];
  const opps = JSON.parse(saved);
  return opps.map(opp => {
    // Map 1-10 range to 0-4 index
    const xVal = opp[xKey] || 1;
    const yVal = opp[yKey] || 1;
    const x = Math.min(4, Math.max(0, Math.floor((xVal - 1) / 2)));
    const y = 4 - Math.min(4, Math.max(0, Math.floor((yVal - 1) / 2)));
    return { x, y, name: opp.name, score: scoreMatrix[y][x], opp };
  });
}

function renderHeatmap() {
  const container = document.getElementById('chartdiv');
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 500;
  canvas.className = 'heatmap-canvas';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const xKey = xSelect.value || 'impact';
  const yKey = ySelect.value || 'potential';

  // Draw grid
  const cellW = 100, cellH = 80;
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const score = scoreMatrix[y][x];
      ctx.fillStyle = getCellColor(score);
      ctx.fillRect(60 + x*cellW, 40 + y*cellH, cellW, cellH);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(60 + x*cellW, 40 + y*cellH, cellW, cellH);
      ctx.fillStyle = '#232525';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(score, 60 + x*cellW + cellW/2, 40 + y*cellH + cellH/2);
    }
  }

  // Draw axis labels
  ctx.font = '16px Arial';
  ctx.fillStyle = '#232525';
  for (let y = 0; y < 5; y++) {
    ctx.save();
    ctx.translate(40, 40 + y*cellH + cellH/2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabels[y], 0, 0);
    ctx.restore();
  }
  for (let x = 0; x < 5; x++) {
    ctx.fillText(xLabels[x], 60 + x * cellW + cellW / 2, 40 + 5 * cellH + 24);
  }

  // Draw opportunity points
  const data = getHeatmapData(xKey, yKey);
  data.forEach(pt => {
    const cx = 60 + pt.x*cellW + cellW/2;
    const cy = 40 + pt.y*cellH + cellH/2;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, 2*Math.PI);
    ctx.fillStyle = '#232525';
    ctx.fill();
    ctx.font = '12px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(pt.name || '', cx, cy-18);
  });
}

// Initialize dropdowns and render when page is ready
window.addEventListener('DOMContentLoaded', () => {
  // Populate dropdowns
  scaleOptions.forEach(opt => {
    const xOpt = document.createElement('option');
    xOpt.value = opt.key;
    xOpt.textContent = opt.label;
    xSelect.appendChild(xOpt);

    const yOpt = document.createElement('option');
    yOpt.value = opt.key;
    yOpt.textContent = opt.label;
    ySelect.appendChild(yOpt);
  });
  // Default selections
  xSelect.value = 'impact';
  ySelect.value = 'potential';
  xSelect.addEventListener('change', renderHeatmap);
  ySelect.addEventListener('change', renderHeatmap);
  renderHeatmap();
});

window.addEventListener('storage', renderHeatmap);
