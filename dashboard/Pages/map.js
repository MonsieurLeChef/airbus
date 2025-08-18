// Interactive Heat Map for Opportunities
// Uses localStorage data from card.js

// Available scaling options from opportunity cards
const scalingOptions = ['Potential', 'Impact', 'Fit'];

// Current axis configuration
let currentXAxis = 'Impact';
let currentYAxis = 'Potential';

// Dynamic labels based on selected axes
function getXLabels(axis) {
  const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  return labels;
}

function getYLabels(axis) {
  const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  return labels;
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
    // Get values for current axes (convert to lowercase for property access)
    const xValue = opp[currentXAxis.toLowerCase()] || 5;
    const yValue = opp[currentYAxis.toLowerCase()] || 5;
    
    // Map 1-10 values to 0-4 grid indices
    // const x = Math.min(4, Math.max(0, Math.floor((xValue-1)/2)));
    // const y = 4 - Math.min(4, Math.max(0, Math.floor((yValue-1)/2)));
    const x= xValue - 1; // 0-9 for 1-10 scale
    const y= maxnum-yValue; // 0-9 for 1-10 scale
    // Calculate score based on the two selected axes
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
const maxnum = 10;

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
      const xValue = x +1 //* 2 + 1; // 1, 3, 5, 7, 9
      const yValue = maxnum-y//) * 2 + 1; // 9, 7, 5, 3, 1
      const score = xValue * yValue;
      
      const cellX = gridStartX + x*cellW;
      const cellY = 40 + y*cellH;
      
      // Create enhanced cell gradient with multiple color stops
      const cellGradient = ctx.createLinearGradient(cellX, cellY, cellX + cellW, cellY + cellH);
      const baseColor = getCellColor(score);
      cellGradient.addColorStop(0, baseColor);
      cellGradient.addColorStop(0.3, adjustBrightness(baseColor, -5));
      cellGradient.addColorStop(0.7, adjustBrightness(baseColor, -15));
      cellGradient.addColorStop(1, adjustBrightness(baseColor, -25));
      
      ctx.fillStyle = cellGradient;
      ctx.fillRect(cellX, cellY, cellW, cellH);
      
      // Add enhanced shadow effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      // Draw cell border with enhanced styling
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cellX + 1, cellY + 1, cellW - 2, cellH - 2);
      
      // Add inner highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cellX + 3, cellY + 3, cellW - 6, cellH - 6);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw score with enhanced styling
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 26px Inter, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add text shadow for better readability
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(score, cellX + cellW/2, cellY + cellH/2);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  }

  // Draw axis labels with enhanced styling
  ctx.font = '13px Inter, Arial';
  ctx.fillStyle = '#1f2937';
  
  const currentXLabels = getXLabels(currentXAxis);
  const currentYLabels = getYLabels(currentYAxis);
  
  // Y axis labels
  for (let y = 0; y < maxnum; y++) {
    ctx.save();
    ctx.translate(70, 40 + y*cellH + cellH/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(currentYLabels[y], 0, 0);
    ctx.restore();
  }
  // X axis labels
  for (let x = 0; x < maxnum; x++) {
    ctx.fillText(currentXLabels[x], gridStartX + x*cellW + cellW/2, 40 + maxnum*cellH + 24);
  }
  // X axis name with enhanced styling
  ctx.font = 'bold 24px Inter, Arial';
  ctx.fillStyle = '#0a6cff';
  
  // Add text shadow for axis names
  ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.fillText(currentXAxis, (maxnum+2)/2*120, 40 + maxnum*cellH + 80);
  
  // Y axis name
  ctx.save();
  ctx.translate(30, maxnum/2*100+40);
  ctx.rotate(-Math.PI/2);
  ctx.font = 'bold 20px Inter, Arial';
  ctx.fillStyle = '#0a6cff';
  ctx.fillText(currentYAxis, 0, 0);
  ctx.restore();
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Draw opportunity points
  const data = getHeatmapData();
  data.forEach(pt => {
    const cx = gridStartX + pt.x*cellW + cellW/2;
    const cy = 40 + pt.y*cellH + cellH/2;
    
    // Create enhanced opportunity point with modern gradient
    const pointGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
    pointGradient.addColorStop(0, '#ffffff');
    pointGradient.addColorStop(0.4, '#f1f5f9');
    pointGradient.addColorStop(0.7, '#64748b');
    pointGradient.addColorStop(1, '#334155');
    
    // Add enhanced glow effect
    ctx.shadowColor = '#0a6cff';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, 2*Math.PI);
    ctx.fillStyle = pointGradient;
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Add outer ring
    ctx.strokeStyle = 'rgba(10, 108, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add inner highlight with multiple layers
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 4, 5, 0, 2*Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(cx - 2, cy - 2, 2, 0, 2*Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fill();
    
    // Store opportunity data for hover functionality
    pt.canvasX = cx;
    pt.canvasY = cy;
  });
  
  // Add hover functionality
  addHoverFunctionality(canvas, data);
  
  // Add axis dropdown functionality
  addAxisDropdownFunctionality();
}

// Create (or reuse) a tooltip and give it baseline styles
function ensureTooltip() {
  let t = document.getElementById('tooltip');
  if (!t) {
    t = document.createElement('div');
    t.id = 'tooltip';
    document.body.appendChild(t);
  }
  Object.assign(t.style, {
    position: 'fixed',
    zIndex: '9999',
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.98)',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '10px',
    boxShadow: '0 8px 22px rgba(0,0,0,0.15)',
    fontFamily: 'Inter, Arial, sans-serif',
    fontSize: '12px',
    color: '#111827',
    pointerEvents: 'none',   // tooltip won't block clicks
    display: 'none'          // toggled by JS below
  });
  return t;
}

function addHoverFunctionality(canvas, data) {
  const tooltip = document.getElementById('tooltip');
  let currentHoveredPoint = null;

  // Keep CSS hover transform; just make origin predictable
  canvas.style.transformOrigin = 'top left';

  function toCanvasXY(evt) {
    const rect = canvas.getBoundingClientRect();
    const cs = getComputedStyle(canvas);

    const pl = parseFloat(cs.paddingLeft)   || 0;
    const pr = parseFloat(cs.paddingRight)  || 0;
    const pt = parseFloat(cs.paddingTop)    || 0;
    const pb = parseFloat(cs.paddingBottom) || 0;

    const bl = parseFloat(cs.borderLeftWidth)   || 0;
    const br = parseFloat(cs.borderRightWidth)  || 0;
    const bt = parseFloat(cs.borderTopWidth)    || 0;
    const bb = parseFloat(cs.borderBottomWidth) || 0;

    const contentW = rect.width  - pl - pr - bl - br;
    const contentH = rect.height - pt - pb - bt - bb;

    const scaleX = canvas.width  / contentW;
    const scaleY = canvas.height / contentH;

    return {
      x: (evt.clientX - rect.left - pl - bl) * scaleX,
      y: (evt.clientY - rect.top  - pt - bt) * scaleY
    };
  }

  function showTooltip(html, clientX, clientY) {
    tooltip.innerHTML = html;
    tooltip.classList.add('show');

    // position in viewport space (since #tooltip is absolute on body)
    const pad = 12;
    const tw = tooltip.offsetWidth  || 180;
    const th = tooltip.offsetHeight || 60;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = clientX + 14;
    let top  = clientY - 24;

    if (left + tw + pad > vw) left = clientX - tw - 14;
    if (top  + th + pad > vh) top  = vh - th - pad;
    if (top < pad) top = pad;

    tooltip.style.left = left + 'px';
    tooltip.style.top  = top  + 'px';
  }

  function hideTooltip() {
    tooltip.classList.remove('show');
  }

  function handleMove(e) {
    const { x, y } = toCanvasXY(e);

    // hit-test against the drawn circles (radius ~16). Use a generous radius.
    const R2 = 26 * 26;
    let hoveredPoint = null;

    for (let i = 0; i < data.length; i++) {
      const dx = x - data[i].canvasX;
      const dy = y - data[i].canvasY;
      if (dx*dx + dy*dy <= R2) { hoveredPoint = data[i]; break; }
    }

    if (hoveredPoint && hoveredPoint !== currentHoveredPoint) {
      currentHoveredPoint = hoveredPoint;
      showTooltip(`
        <strong>${hoveredPoint.name || 'Opportunity'}</strong><br>
        ${currentXAxis}: ${hoveredPoint.xValue}/10<br>
        ${currentYAxis}: ${hoveredPoint.yValue}/10<br>
        Score: ${hoveredPoint.score}
      `, e.clientX, e.clientY);
      canvas.style.cursor = 'pointer';
    } else if (!hoveredPoint && currentHoveredPoint) {
      currentHoveredPoint = null;
      hideTooltip();
      canvas.style.cursor = 'default';
    } else if (hoveredPoint) {
      // keep tooltip following while staying on the same point
      showTooltip(tooltip.innerHTML, e.clientX, e.clientY);
    }
  }

  canvas.addEventListener('pointermove', handleMove);
  canvas.addEventListener('pointerleave', () => {
    currentHoveredPoint = null;
    hideTooltip();
    canvas.style.cursor = 'default';
  });

  // don't let tooltip block clicks elsewhere
  tooltip.addEventListener('click', (e) => e.stopPropagation());
}



function addAxisDropdownFunctionality() {
  const xAxisDropdown = document.getElementById('x-axis-dropdown');
  const yAxisDropdown = document.getElementById('y-axis-dropdown');
  const xAxisContent = document.getElementById('x-axis-content');
  const yAxisContent = document.getElementById('y-axis-content');
  const xAxisTitle = document.getElementById('x-axis-title');
  const yAxisTitle = document.getElementById('y-axis-title');
  
  // Update active states
  function updateActiveStates() {
    // Update X axis active state
    xAxisContent.querySelectorAll('a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-axis') === currentXAxis) {
        link.classList.add('active');
      }
    });
    
    // Update Y axis active state
    yAxisContent.querySelectorAll('a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-axis') === currentYAxis) {
        link.classList.add('active');
      }
    });
    
    // Update titles
    xAxisTitle.textContent = currentXAxis;
    yAxisTitle.textContent = currentYAxis;
  }
  
  // Toggle dropdowns with improved event handling
  function toggleDropdown(dropdownContent, dropdownTitle, otherContent, otherTitle) {
    const isVisible = dropdownContent.classList.contains('show');
    
    // Close all dropdowns first and reset states
    xAxisContent.classList.remove('show');
    yAxisContent.classList.remove('show');
    xAxisTitle.classList.remove('active');
    yAxisTitle.classList.remove('active');
    
    // Force a small delay to ensure proper cleanup
    setTimeout(() => {
      // Toggle the clicked dropdown
      if (!isVisible) {
        dropdownContent.classList.add('show');
        dropdownTitle.classList.add('active');
      }
      updateActiveStates();
    }, 10);
  }
  
  xAxisTitle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleDropdown(xAxisContent, xAxisTitle, yAxisContent, yAxisTitle);
  });
  
  yAxisTitle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleDropdown(yAxisContent, yAxisTitle, xAxisContent, xAxisTitle);
  });
  
  // Handle axis selection with improved event handling
  function handleAxisSelection(selectedAxis, isXAxis) {
    if (isXAxis) {
      if (selectedAxis === currentYAxis) {
        currentYAxis = currentXAxis;
        currentXAxis = selectedAxis;
      } else {
        currentXAxis = selectedAxis;
      }
    } else {
      if (selectedAxis === currentXAxis) {
        currentXAxis = currentYAxis;
        currentYAxis = selectedAxis;
      } else {
        currentYAxis = selectedAxis;
      }
    }
    
    // Update UI
    updateActiveStates();
    
    // Close dropdowns with proper cleanup
    xAxisContent.classList.remove('show');
    yAxisContent.classList.remove('show');
    xAxisTitle.classList.remove('active');
    yAxisTitle.classList.remove('active');
    
    // Force a small delay to ensure proper state cleanup
    setTimeout(() => {
      // Re-render heatmap
      renderHeatmap();
    }, 50);
  }
  
  xAxisContent.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const selectedAxis = link.getAttribute('data-axis');
      handleAxisSelection(selectedAxis, true);
    });
  });
  
  yAxisContent.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const selectedAxis = link.getAttribute('data-axis');
      handleAxisSelection(selectedAxis, false);
    });
  });
  
  // Close dropdowns when clicking outside with improved handling
  document.addEventListener('click', (e) => {
    const isClickInsideDropdown = e.target.closest('.axis-dropdown');
    if (!isClickInsideDropdown) {
      xAxisContent.classList.remove('show');
      yAxisContent.classList.remove('show');
      xAxisTitle.classList.remove('active');
      yAxisTitle.classList.remove('active');
    }
  });
  
  // Prevent dropdown from closing when clicking inside it
  xAxisContent.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  yAxisContent.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Initialize active states
  updateActiveStates();
}

window.addEventListener('DOMContentLoaded', renderHeatmap);
window.addEventListener('storage', renderHeatmap);
