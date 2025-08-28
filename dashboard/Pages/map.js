// Interactive Heat Map for Opportunities
// Uses localStorage data from card.js

// Available scaling options from opportunity cards
// Dynamically get scaling options from localStorage
function getScalingOptions() {
  const saved = localStorage.getItem('scalingOptions');
  if (!saved) return [];
  return JSON.parse(saved);
}

// Current axis configuration
// Use keys for axis config
let scalingOptionsArr = getScalingOptions();
let currentXAxis = scalingOptionsArr[1]?.key || 'impact';
let currentYAxis = scalingOptionsArr[0]?.key || 'potential';

function getMaxNum() {
  return parseInt(localStorage.getItem('maxnum')) || 10;
}
let maxnum = getMaxNum();

// Dynamic labels based on selected axes
function getXLabels(axis) {
  // RESTORED: Axis labels for clarity
  return ['Maximum', 'Extremely High', 'Very High', 'High', 'Moderately High', 'Medium', 'Moderately Low', 'Low', 'Very Low', 'Extremely Low'];
}

function getYLabels(axis) {
  // RESTORED: Axis labels for clarity
  return ['Extremely Low', 'Very Low', 'Low', 'Moderately Low', 'Medium', 'Moderately High', 'High', 'Very High', 'Extremely High', 'Maximum'];
}

const colorMap = {
  green: '#10b981', // Acceptable Risk / Weak Opportunity - Modern green
  yellow: '#f59e0b', // Important Risk / Encouraged Opportunity - Modern amber
  red: '#ef4444' // Critical Risk / Important Opportunity - Modern red
};



function getCellColor(score) {
  // Dynamic color based on score (max score is 100 for 10x10)
  if (score > (maxnum**2)*50/100) return colorMap.green;
  if (score > (maxnum**2)*20/100) return colorMap.yellow;
  return colorMap.red;
}

function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Map opportunity data to heatmap cells based on current axis selection
function getHeatmapData() {
  const saved = localStorage.getItem('opportunityCards');
  if (!saved) return [];
  const opps = JSON.parse(saved);
  return opps.map(opp => {
    // Convert percent (1-100) to value (1-maxnum)
    const percentX = parseInt(opp[currentXAxis] || 1, 10);
    const percentY = parseInt(opp[currentYAxis] || 1, 10);
    const xValue = Math.round((percentX / 100) * (maxnum - 1) + 1);
    const yValue = Math.round((percentY / 100) * (maxnum - 1) + 1);
    const x = xValue - 1;
    const y = maxnum - yValue;
    const score = xValue * yValue;
    return {
      x,
      y,
      name: opp.name,
      score: score,
      xValue: xValue,
      yValue: yValue,
      opp
    };
  });
}

function renderHeatmap() {
  const container = document.getElementById('chartdiv');
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = (maxnum+2) * 120;
  canvas.height = (maxnum+2) * 100;
  canvas.className = 'heatmap-canvas';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Create gradient background with modern styling
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(248, 250, 252, 0.95)');
  gradient.addColorStop(0.5, 'rgba(241, 245, 249, 0.9)');
  gradient.addColorStop(1, 'rgba(226, 232, 240, 0.85)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add subtle pattern overlay
  ctx.save();
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < canvas.width; i += 20) {
    for (let j = 0; j < canvas.height; j += 20) {
      ctx.fillStyle = '#0a6cff';
      ctx.fillRect(i, j, 1, 1);
    }
  }
  ctx.restore();

  // Draw grid
  const cellW = 120, cellH = 100;
  const gridStartX = 120; // Increased to provide more space for Y-axis labels
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  for (let y = 0; y < maxnum; y++) {
    for (let x = 0; x < maxnum; x++) {
      // Calculate score based on grid position (1-10 scale)
      const xValue = x + 1;
      const yValue = maxnum - y;
      const score = xValue * yValue;
      
      const cellX = gridStartX + x*cellW;
      const cellY = 40 + y*cellH;
      
      const cellGradient = ctx.createLinearGradient(cellX, cellY, cellX + cellW, cellY + cellH);
      const baseColor = getCellColor(score);
      cellGradient.addColorStop(0, baseColor);
      cellGradient.addColorStop(1, adjustBrightness(baseColor, -25));
      
      ctx.fillStyle = cellGradient;
      ctx.fillRect(cellX, cellY, cellW, cellH);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cellX, cellY, cellW, cellH);
      
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 26px Inter, Arial';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(score, cellX + cellW/2, cellY + cellH/2);
      ctx.shadowColor = 'transparent';
    }
  }


  // Draw axis arrows and names (no labels)
  // Y axis arrow (vertical, straight arrowhead)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(60, 40 + maxnum*cellH); // bottom
  ctx.lineTo(60, 40); // top
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 4;
  ctx.stroke();
  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(60, 40); // tip
  ctx.lineTo(54, 50); // left wing
  ctx.moveTo(60, 40);
  ctx.lineTo(66, 50); // right wing
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  // X axis arrow (horizontal, straight arrowhead)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(gridStartX, 40 + maxnum*cellH + 40); // left
  ctx.lineTo(gridStartX + maxnum*cellW, 40 + maxnum*cellH + 40); // right
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 4;
  ctx.stroke();
  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(gridStartX + maxnum*cellW, 40 + maxnum*cellH + 40); // tip
  ctx.lineTo(gridStartX + maxnum*cellW - 10, 40 + maxnum*cellH + 34); // top wing
  ctx.moveTo(gridStartX + maxnum*cellW, 40 + maxnum*cellH + 40);
  ctx.lineTo(gridStartX + maxnum*cellW - 10, 40 + maxnum*cellH + 46); // bottom wing
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  // Axis names
  function capitalizeWords(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }
  // Y axis name
  ctx.save();
  ctx.translate(30, (maxnum/2*100)+40);
  ctx.rotate(-Math.PI/2);
  ctx.font = 'bold 24px Inter, Arial';
  ctx.fillStyle = '#222';
  ctx.textAlign = 'center';
  ctx.fillText(capitalizeWords(currentYAxis), 0, 0);
  ctx.restore();

  // X axis name
  ctx.font = 'bold 24px Inter, Arial';
  ctx.fillStyle = '#222';
  ctx.textAlign = 'center';
  ctx.fillText(capitalizeWords(currentXAxis), gridStartX + (maxnum*cellW)/2, 40 + maxnum*cellH + 80);

  // Draw opportunity points
  const data = getHeatmapData();
  data.forEach(pt => {
    const cx = gridStartX + pt.x*cellW + cellW/2;
    const cy = 40 + pt.y*cellH + cellH/2;
    
    const pointGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
    pointGradient.addColorStop(0, '#ffffff');
    pointGradient.addColorStop(1, '#334155');
    
    ctx.shadowColor = '#0a6cff';
    ctx.shadowBlur = 20;
    
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, 2*Math.PI);
    ctx.fillStyle = pointGradient;
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    
    ctx.strokeStyle = 'rgba(10, 108, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    pt.canvasX = cx;
    pt.canvasY = cy;
  });
  
  addHoverFunctionality(canvas, data);
}

function addHoverFunctionality(canvas, data) {
  const tooltip = document.getElementById('tooltip');
  if (!tooltip) return;

  function toCanvasXY(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) * (canvas.width / rect.width),
      y: (evt.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function showTooltip(html, clientX, clientY) {
    tooltip.innerHTML = html;
    tooltip.classList.add('show');

    const tw = tooltip.offsetWidth;
    const vw = window.innerWidth;
    
    let left = clientX + 14;
    if (left + tw + 12 > vw) {
        left = clientX - tw - 14;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top  = (clientY - 24) + 'px';
  }

  function hideTooltip() {
    tooltip.classList.remove('show');
  }

  canvas.addEventListener('pointermove', (e) => {
    const { x, y } = toCanvasXY(e);
    const R2 = 26 * 26;
    const hoveredPoints = data.filter(pt => {
        const dx = x - pt.canvasX;
        const dy = y - pt.canvasY;
        return (dx*dx + dy*dy) <= R2;
    });

    if (hoveredPoints.length > 0) {
      const score = hoveredPoints[0].score;
      const namesHtml = hoveredPoints.map(pt => `<strong>${pt.name || 'Unnamed Opportunity'}</strong>`).join('<hr style="margin:6px 0;border:none;border-top:1px solid #e5e7eb;">');
      const html = `Score: ${score}<hr style="margin:6px 0;border:none;border-top:1px solid #e5e7eb;">${namesHtml}`;
      
      showTooltip(html, e.clientX, e.clientY);
      canvas.style.cursor = 'pointer';
    } else {
      hideTooltip();
      canvas.style.cursor = 'default';
    }
  });

  canvas.addEventListener('pointerleave', hideTooltip);
}

function addAxisDropdownFunctionality() {
  const xAxisContent = document.getElementById('x-axis-content');
  const yAxisContent = document.getElementById('y-axis-content');
  const xAxisTitle = document.getElementById('x-axis-title');
  const yAxisTitle = document.getElementById('y-axis-title');
  
  function populateDropdowns() {
    const scalingOptions = getScalingOptions();
    xAxisContent.innerHTML = '';
    yAxisContent.innerHTML = '';
    scalingOptions.forEach(opt => {
      const xLink = `<a href="#" data-axis="${opt.key}">${opt.label}</a>`;
      const yLink = `<a href="#" data-axis="${opt.key}">${opt.label}</a>`;
      xAxisContent.insertAdjacentHTML('beforeend', xLink);
      yAxisContent.insertAdjacentHTML('beforeend', yLink);
    });
  }

  function updateActiveStates() {
    const scalingOptions = getScalingOptions();
    const xLabel = scalingOptions.find(opt => opt.key === currentXAxis)?.label || currentXAxis;
    const yLabel = scalingOptions.find(opt => opt.key === currentYAxis)?.label || currentYAxis;
    xAxisTitle.textContent = xLabel;
    yAxisTitle.textContent = yLabel;

    document.querySelectorAll('#x-axis-content a, #y-axis-content a').forEach(link => link.classList.remove('active'));
    document.querySelector(`#x-axis-content a[data-axis="${currentXAxis}"]`)?.classList.add('active');
    document.querySelector(`#y-axis-content a[data-axis="${currentYAxis}"]`)?.classList.add('active');
  }
  
  function toggleDropdown(content, title) {
    const isVisible = content.classList.contains('show');
    document.querySelectorAll('.axis-dropdown-content').forEach(c => c.classList.remove('show'));
    document.querySelectorAll('.axis-title').forEach(t => t.classList.remove('active'));
    if (!isVisible) {
      content.classList.add('show');
      title.classList.add('active');
    }
  }
  
  xAxisTitle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(xAxisContent, xAxisTitle);
  });
  
  yAxisTitle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(yAxisContent, yAxisTitle);
  });
  
  function handleAxisSelection(e, isXAxis) {
    if (e.target.tagName !== 'A') return;
    e.preventDefault();
    const selectedAxis = e.target.getAttribute('data-axis');
    
    if (isXAxis) {
      if (selectedAxis === currentYAxis) currentYAxis = currentXAxis;
      currentXAxis = selectedAxis;
    } else {
      if (selectedAxis === currentXAxis) currentXAxis = currentYAxis;
      currentYAxis = selectedAxis;
    }
    
    // Just update the UI and re-render. No need to repopulate.
    updateActiveStates();
    renderHeatmap();
  }
  
  xAxisContent.addEventListener('click', (e) => handleAxisSelection(e, true));
  yAxisContent.addEventListener('click', (e) => handleAxisSelection(e, false));
  
  document.addEventListener('click', () => {
    xAxisContent.classList.remove('show');
    yAxisContent.classList.remove('show');
    xAxisTitle.classList.remove('active');
    yAxisTitle.classList.remove('active');
  });
  
  populateDropdowns();
  updateActiveStates();
}

// --- MODIFIED: New initialization flow ---
function initializeApp() {
    addAxisDropdownFunctionality(); // Sets up dropdown controls and listeners ONCE.
    renderHeatmap(); // Renders the initial heatmap.
}

window.addEventListener('DOMContentLoaded', initializeApp);

window.addEventListener('storage', () => {
  // When settings are changed on another page...
  scalingOptionsArr = getScalingOptions();
  maxnum = getMaxNum();
  
  // Repopulate dropdowns in case the options changed
  const xAxisContent = document.getElementById('x-axis-content');
  const yAxisContent = document.getElementById('y-axis-content');
  const scalingOptions = getScalingOptions();
  xAxisContent.innerHTML = '';
  yAxisContent.innerHTML = '';
  scalingOptions.forEach(opt => {
      const xLink = `<a href="#" data-axis="${opt.key}">${opt.label}</a>`;
      const yLink = `<a href="#" data-axis="${opt.key}">${opt.label}</a>`;
      xAxisContent.insertAdjacentHTML('beforeend', xLink);
      yAxisContent.insertAdjacentHTML('beforeend', yLink);
  });
  
  renderHeatmap(); // Re-render the chart with new data/settings.
});
