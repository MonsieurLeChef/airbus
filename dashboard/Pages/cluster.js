(() => {
  // load data
  const inner_title = "Opportunity Areas"

  // load sunburst data out of file
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const res = await fetch("../data/clustering_questions.json");
      const json = await res.json();
      const { innerTitle, sunburstData } = json;
      renderSunburst("#sunburst", sunburstData);
    } catch (err) {
    console.error("Error loading sunburst-data.json:", err);
    }
  });

  // Add once, e.g. at the top of showPopup or after DOMContentLoaded
if (!document.getElementById("air-bullets-style")) {
  const style = document.createElement("style");
  style.id = "air-bullets-style";
  style.textContent = `
    .air-bullets { list-style: none; margin: 0; padding: 0; }
    .air-bullets li { position: relative; padding-left: 1.25rem; margin: 6px 0; }
    .air-bullets li::before {
      content: "✈️";
      position: absolute;
      left: 0;
      top: .1rem;
      font-size: .95rem;
      line-height: 1;
    }
  `;
  document.head.appendChild(style);
}
  
  // Convert an SVG point to viewport (screen) coordinates
function svgToViewport(svg, x, y) {
  const pt = svg.createSVGPoint();
  pt.x = x; pt.y = y;
  const spt = pt.matrixTransform(svg.getScreenCTM());
  return { x: spt.x, y: spt.y };
}

// Compute where to put the popover (near the end of the leader line)
function computeAnchor(d, innerHole, radius) {
  const midA = (d.x0 + d.x1) / 2;
  const r1 = innerHole + d.y1;
  const pJustOutside = d3.pointRadial(midA, r1 + 16);
  const rightSide = pJustOutside[0] >= 0;
  const edgeX = rightSide ? radius - 8 : -radius + 8;
  const pEdge = [edgeX, pJustOutside[1]];
  return { svgX: pEdge[0], svgY: pEdge[1], side: rightSide ? "right" : "left" };
}

  function renderSunburst(containerSelector, data) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      return;
    }

    const width = 800;
    const height = 800;
    const radius = Math.min(width, height) / 2;

    const innerHole = -75;
    const ringThickness = radius - innerHole;

    const root = d3.hierarchy(data).sum((d) => (d.children ? 0 : 1));
    d3.partition().size([2 * Math.PI, ringThickness])(root);

    const catColors = d3
      .scaleOrdinal()
      .domain(["Team", "Organisation", "Environment"])
      .range(["#ef4444", "#f59e0b", "#22c55e"]); // red, amber, green

    const arc = d3
      .arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle(1 / radius)
      .padRadius(radius)
      .innerRadius((d) => innerHole + d.y0)
      .outerRadius((d) => innerHole + d.y1);

    const svg = d3
      .select(container)
      .append("svg")
      // Center chart precisely: no asymmetric +100 padding which pushed it left
      .attr("viewBox", [-radius, -radius, width, height].join(" "))
      .attr("aria-labelledby", "sunburstTitle")
      .attr("role", "img");

    svg.append("title").attr("id", "sunburstTitle").text("Opportunity Questions");

    const g = svg.append("g");

    const nodes = root.descendants().filter((d) => d.depth > 0);

    let activeSlice = null;
    const calloutLayer = g.append("g").attr("class", "callout-layer"); // for connector line

    const path = g
      .selectAll("path")
      .data(nodes)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("class","sunburst-slice")
      .attr("fill", (d) => {
        const top = d.ancestors().find((a) => a.depth === 1) || d;
        const base = d3.color(catColors(top.data.name));
        if (d.depth === 1) return base.formatHex();
        const siblings = d.parent.children || [];
        const idx = Math.max(0, siblings.indexOf(d));
        return d3
          .color(base)
          .brighter(0.6 + (idx / Math.max(1, siblings.length - 1)) * 0.8)
          .formatHex();
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        // 1) clear previous callout + active state
        clearCallout();

        // 2) mark this slice
        activeSlice = d3.select(this).classed("slice-active", true);

        // 3) draw connector line
        if (d.depth === 2) drawCallout(d);

        // 4) open popup
        const anchor = computeAnchor(d, innerHole, radius);
        showPopup(d, anchor, svg.node());
        
      });

    g.selectAll(".sunburst-label")
      .data(nodes.filter((d) => d.depth === 1))
      .enter()
      .append("text")
      .attr("class", "sunburst-label")
      .attr("transform", (d) => {
        const [x, y] = arc.centroid(d);
        return `translate(${x},${y})`;
      })
      .attr("dy", "0.35em")
      .text((d) => d.data.name);

    g.selectAll(".sunburst-slice-label")
      .data(nodes.filter((d) => d.depth === 2))
      .enter()
      .append("text")
      .attr("class", "sunburst-slice-label")
      .attr("transform", (d) => {
        const [x, y] = arc.centroid(d);
        return `translate(${x},${y})`;
      })
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .each(function(d) {
        // Limit label to max 12 chars per line, max 2 lines
        const maxLineLen = 12;
        const maxLines = 2;
        const lineHeight = 28; // Fine-tuned line height for better spacing
        let words = d.data.name.split(' ');
        let lines = [];
        let currentLine = '';
        words.forEach(word => {
          if ((currentLine + ' ' + word).trim().length <= maxLineLen) {
            currentLine = (currentLine + ' ' + word).trim();
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) lines.push(currentLine);
        if (lines.length > maxLines) {
          lines = lines.slice(0, maxLines);
          lines[maxLines-1] += '…';
        }
        // Clear text and add tspans for each line
        d3.select(this).text(null);
        lines.forEach((line, i) => {
          d3.select(this).append('tspan')
            .attr('x', 0)
            .attr('y', i * lineHeight - ((lines.length-1)*lineHeight/2)) // improved vertical centering
            .text(line);
        });
      });

    g.append("circle").attr("r", innerHole - 8).attr("fill", "#fff");

    g.append("text").attr("class", "sunburst-label").attr("text-anchor", "middle").attr("dy", "0.35em").text(inner_title);

    path.append("title").text((d) => {
      const trail = d.ancestors().map((a) => a.data.name).reverse().slice(1);
      return trail.join(" → ");
    });

  
    // draw a polyline from the slice to the chart edge
    function drawCallout(d) {
      const midA = (d.x0 + d.x1) / 2;
      const r0 = innerHole + d.y0;
      const r1 = innerHole + d.y1;
      const rm = (r0 + r1) / 2;

        // points along that angle
      const p0 = d3.pointRadial(midA, rm);       // inside the slice
      const p1 = d3.pointRadial(midA, r1 + 16);  // just outside the arc
    //   const horizX = a > -Math.PI/2 && a < Math.PI/2 ? radius - 8 : -radius + 8; // right if on right half
      const rightSide = p1[0] >= 0;
      const horizX = rightSide ? radius - 8 : -radius + 8;
      const p2 = [horizX, p1[1]];

      const dStr = `M${p0[0]},${p0[1]} L${p1[0]},${p1[1]} L${p2[0]},${p2[1]}`;

      const line = calloutLayer
        .append("path")
        .attr("class", "callout-line")
        .attr("d", dStr);

      // simple draw animation
      const len = line.node().getTotalLength();
      line
        .attr("stroke-dasharray", `${len} ${len}`)
        .attr("stroke-dashoffset", len)
        .transition()
        .duration(300)
        .attr("stroke-dashoffset", 0);
    }

    function clearCallout() {
      calloutLayer.selectAll("*").remove();
      if (activeSlice) {
        activeSlice.classed("slice-active", false);
        activeSlice = null;
      }
    }

    // expose clearing when the popup is closed
    document.addEventListener("popup:closed", clearCallout);
  }

function showPopup(d, anchor, svgEl) {
  const popup = document.getElementById("entry-popup");
  const content = popup.querySelector(".popup-content");
  const titleEl = document.getElementById("popup-title");
  const bodyEl = document.getElementById("popup-body");

  // set content
  const path = d.ancestors().map((a) => a.data.name).reverse().slice(1);
  titleEl.textContent = path.join(" → ");
  // bodyEl.innerHTML = (d.data.info || (d.parent && d.parent.data && d.parent.data.info) || "")
  //   .replace(/\n\n/g, "<br><br>")
  //   .replace(/\n/g, "<br>");
  // prefer leaf info, else inherit from parent
  const info = d.data.info ?? d.parent?.data?.info ?? "";

  bodyEl.innerHTML = Array.isArray(info)
    // render arrays as a clean bullet list
    ? `<ul class="air-bullets">${info.map(q => `<li>${String(q).trim()}</li>`).join("")}</ul>`
    // keep supporting strings with \n line breaks
    : String(info).replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>");
  
  // show first so we can measure it
  popup.classList.remove("hidden");
  popup.setAttribute("aria-hidden", "false");

  // convert SVG anchor to viewport coords
  const vp = svgToViewport(svgEl, anchor.svgX, anchor.svgY);

  // place popover to the left/right of the anchor, vertically centered on it
  // measure card
  content.style.left = "-9999px"; // move offscreen while measuring
  content.style.top = "0px";
  // content.setAttribute("data-side", anchor.side);  // set arrow direction
  const rect = content.getBoundingClientRect();

  const gap = 12; // space between leader end and card
  let left = anchor.side === "right" ? vp.x + gap : vp.x - rect.width - gap;
  let top  = vp.y - rect.height / 2;

  // clamp to viewport (8px margin)
  left = Math.max(8, Math.min(left, window.innerWidth  - rect.width  - 8));
  top  = Math.max(8, Math.min(top,  window.innerHeight - rect.height - 8));

  content.style.left = `${left}px`;
  content.style.top = `${top}px`;

  // close mechanics
  function close() {
    popup.classList.add("hidden");
    popup.setAttribute("aria-hidden", "true");
    popup.removeEventListener("click", overlayHandler);
    document.querySelector(".popup-close").removeEventListener("click", close);
    document.removeEventListener("keydown", escHandler);
    window.removeEventListener("resize", reposition);
    window.removeEventListener("scroll", reposition, true);
    document.dispatchEvent(new CustomEvent("popup:closed"));
  }
  function overlayHandler(e) {
    if (e.target === popup) close();
  }
  function escHandler(e) {
    if (e.key === "Escape") close();
  }

  // keep it stuck to the anchor on resize/scroll
  function reposition() {
    const rect = content.getBoundingClientRect();
    const vp = svgToViewport(svgEl, anchor.svgX, anchor.svgY);
    let left = anchor.side === "right" ? vp.x + gap : vp.x - rect.width - gap;
    let top  = vp.y - rect.height / 2;
    left = Math.max(8, Math.min(left, window.innerWidth  - rect.width  - 8));
    top  = Math.max(8, Math.min(top,  window.innerHeight - rect.height - 8));
    content.style.left = `${left}px`;
    content.style.top = `${top}px`;
  }

  document.querySelector(".popup-close").addEventListener("click", close);
  popup.addEventListener("click", overlayHandler);
  document.addEventListener("keydown", escHandler);
  window.addEventListener("resize", reposition);
  window.addEventListener("scroll", reposition, true);
}
})();
