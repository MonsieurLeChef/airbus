(() => {
  // === Data you can edit freely ===
  const inner_title = "Opportunity Areas"

//   const sunburstData = {
//     name: "root",
//     children: [
//       {
//         name: "Team",
//         info: "Questions about the people doing the work.",
//         children: [
//       {
//         name: "Skills optimization",
//         info: "Is there any individual improvement that leads to a strong team and organization?\n\n"
//       },
//       {
//         name: "Work-model optimization",
//         info: "Is there any possibility for improving hybrid models?\n\n"
//       }
//     ]
//   },
//   {
//     name: "Organisation",
//     info: "Questions about structures, processes and support within the organisation.",
//     children: [
//       {
//         name: "Excellence in Safety",
//         info:
//           "Where do we see opportunities to reduce safety incidents further than industry standards?\n\n"+
//           "What new technologies or processes can create safer operations with lower costs?\n\n" +
//           "How can predictive safety analytics open opportunities to avoid disruptions and build trust?\n\n"
//       },
//       {
//         name: "Academic & Research Partnerships",
//         info:
//           "Which universities or research centers could provide opportunities for breakthrough innovations?\n\n" +
//           "How can joint projects with academia open opportunities for cost-sharing and risk reduction in R&D?\n\n" +
//           "What opportunities exist to absorb young talents that bring fresh skills into our workforce?\n\n"
//       },
//       {
//         name: "New Market Segments",
//         info:
//           "What market segments offer the highest opportunity for RASK/cargo yield improvement? (Revenue per Available Seat Kilometer)\n\n" +
//           "Where are the opportunities to reduce CASK (e.g., through fuel efficiency, lean operations, automation)? (Cost per Available Seat Kilometer)\n\n" +
//           "Which underserved regions or customer groups offer opportunities for profitable expansion?\n\n" +
//           "How can innovative aircraft/IT/marketing investments create new revenue opportunities?\n\n" +
//           "What opportunities exist to reach break-even faster with strategic partnerships or alliances?\n\n"
//       },
//       {
//         name: "Innovation Culture Development (Incubation)",
//         info:
//           "What internal ideas or employee-driven projects could lead to breakthrough opportunities?\n\n" +
//           "How can adopting emerging technologies (AI, green aviation, digital twins) open competitive opportunities?\n\n" +
//           "Where are the opportunities to incubate startups or spin-offs that support our ecosystem?\n\n" +
//           "What cultural changes would create opportunities for faster innovation adoption across the company?\n\n"
//       }
//     ]
//   },
//   {
//     name: "Environment",
//     info: "Questions about the external context and constraints.",
//     children: [
//       {
//         name: "Sustainability",
//         info:
//           "How can CO₂ emissions per route be managed to ensure compliance with carbon offset programs?\n\n" +
//           "What impact does the route have on local communities in terms of noise and job creation?\n\n" +
//           "How well does the route align with Sustainable Aviation Fuel (SAF) goals?\n\n" +
//           "What role can hydrogen power (H₂) play in reducing environmental impact on this route?\n\n" +
//           "How can renewable sources of energy be used to support operations along this route?\n\n"
//       },
//       {
//         name: "Market Attractiveness",
//         info:
//           "What is the target market size in terms of passenger or cargo demand forecasts for the route/market?\n\n" +
//           "What is the expected growth rate of the market, considering CAGR, tourism, and business travel trends?\n\n" +
//           "Who are the main competitors operating in this market, and what is their market share?\n\n" +
//           "How much pricing power exists in this market for different business models?\n\n"
//       },
//       {
//         name: "Product",
//         info:
//           "How can the product be designed to reduce CO₂ emissions and align with future sustainability goals (SAF, hydrogen, renewables)?\n\n" +
//           "What opportunities exist for the product to tap into high-growth passenger and cargo markets?\n\n" +
//           "How can the product differentiate itself from competitors through unique features, technology, or service quality?\n\n" +
//           "What opportunities exist to optimize the product’s cost structure (production, operation, and lifecycle efficiency)?\n\n" +
//           "How adaptable is the product to evolving regulations, regional demands, and future market trends?\n\n" +
//           "How can innovation partnerships (universities, R&D, tech firms) create long-term opportunities for product improvement?\n\n"
//       },
//       {
//         name: "Industry attractiveness",
//         info:
//           "Differentiation Factors: Can you offer unique features (better service, lower price, superior network)?\n\n" +
//           "Barrier to Entry: High for competitors or easily replicable?\n\n" +
//           "Time-to-Market: How quickly can you launch?\n\n"
//       },
//       {
//         name: "Regional/Geographical",
//         info:
//           "What opportunities exist to set up manufacturing or operational bases in low-investment or cost-advantage regions?\n\n" +
//           "How can regional demand patterns (tourism hubs, cargo corridors, business travel routes) create opportunities for growth?\n\n" +
//           "Which geographic areas provide opportunities to access untapped passenger or cargo markets?\n\n" +
//           "What opportunities arise from leveraging regional trade agreements, government incentives, or subsidies?\n\n" +
//           "How can geographic positioning be used to strengthen connectivity and improve network efficiency?\n\n" +
//           "What opportunities exist to adapt the product or service to regional cultural, economic, or infrastructure needs?\n\n"
//       }
//     ]
//   }
// ]


//   };

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const res = await fetch("dashboard/data/clustering_questions.json");
      const json = await res.json();
      const { innerTitle, sunburstData } = json;
      renderSunburst("#sunburst", sunburstData);
    } catch (err) {
    console.error("Error loading sunburst-data.json:", err);
    }
  });
  
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
  bodyEl.innerHTML = (d.data.info || (d.parent && d.parent.data && d.parent.data.info) || "")
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>");
  
  // show first so we can measure it
  popup.classList.remove("hidden");
  popup.setAttribute("aria-hidden", "false");

  // convert SVG anchor to viewport coords
  const vp = svgToViewport(svgEl, anchor.svgX, anchor.svgY);

  // place popover to the left/right of the anchor, vertically centered on it
  // measure card
  content.style.left = "-9999px"; // move offscreen while measuring
  content.style.top = "0px";
  content.setAttribute("data-side", anchor.side);  // set arrow direction
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
