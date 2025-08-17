// Interactive Heat Map for Opportunities
// Uses localStorage data from card.js

// Axis label sets
const severityLabels = ['Trivial', 'Minor', 'Moderate', 'Major', 'Critical'];
const probabilityLabels = [
  'Very Likely (>75%)',
  'Probable (50-75%)',
  'Possible (25-50%)',
  'Not to be Ruled Out (5-25%)',
  'Very Unlikely (<5%)'
];

// Current axis orientation
let axes = { x: 'severity', y: 'probability' };

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

function transpose(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]));
}

function getCellColor(score) {
  if (score >= 15) return colorMap.red;
  if (score >= 6) return colorMap.yellow;
  return colorMap.green;
}

// Map opportunity data to heatmap cells
function getHeatmapData(matrix) {
  const saved = localStorage.getItem('opportunityCards');
  if (!saved) return [];
  const opps = JSON.parse(saved);
  return opps.map(opp => {
    const impactIndex = Math.min(4, Math.max(0, Math.floor((opp.impact - 1) / 2)));
    const probIndex = Math.min(4, Math.max(0, Math.floor((opp.potential - 1) / 2)));
    let x, y;
    if (axes.x === 'severity') {
      x = impactIndex;
      y = 4 - probIndex;
    } else {
      x = probIndex;
      y = 4 - impactIndex;
    }
    const score = matrix[y][x];
    return { x, y, name: opp.name, score, opp };
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

  const matrix = axes.x === 'severity'
    ? scoreMatrix
    : transpose(scoreMatrix).reverse().map(row => row.slice().reverse());
  const xLabels = axes.x === 'severity'
    ? severityLabels
    : probabilityLabels.slice().reverse();
  const yLabels = axes.y === 'probability'
    ? probabilityLabels
    : severityLabels.slice().reverse();

  // Draw grid
  const cellW = 100, cellH = 80;
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const score = matrix[y][x];
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
    ctx.rotate(-Math.PI/2);
    ctx.fillText(yLabels[y], 0, 0);
    ctx.restore();
  }
  for (let x = 0; x < 5; x++) {
    ctx.fillText(xLabels[x], 60 + x*cellW + cellW/2, 40 + 5*cellH + 24);
  }

  const xName = axes.x === 'severity' ? 'Severity of Impact' : 'Probability of Occurrence';
  const yName = axes.y === 'probability' ? 'Probability of Occurrence' : 'Severity of Impact';
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#1976ff';
  ctx.fillText(xName, 320, 40 + 5*cellH + 60);
  ctx.save();
  ctx.translate(20, 290);
  ctx.rotate(-Math.PI/2);
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#1976ff';
  ctx.fillText(yName, 0, 0);
  ctx.restore();

  // Draw opportunity points
  const data = getHeatmapData(matrix);
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

window.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('axisSelect');
  if (select) {
    select.addEventListener('change', () => {
      axes = select.value === 'impact-x'
        ? { x: 'severity', y: 'probability' }
        : { x: 'probability', y: 'severity' };
      renderHeatmap();
    });
  }
  renderHeatmap();
});

window.addEventListener('storage', () => renderHeatmap());
