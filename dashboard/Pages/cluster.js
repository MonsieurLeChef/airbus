(() => {
  // === Data you can edit freely ===
  const inner_title = "Opportunity Areas"

  const sunburstData = {
    name: "root",
    children: [
      {
        name: "Team",
        info: "Questions about the people doing the work.",
        children: [
          {
            name: "Roles & Responsibilities",
            info:
              "Are roles clear and complementary? Who owns decisions and deliverables?",
          },
          {
            name: "Skills & Training",
            info:
              "Do we have the right skills and learning pathways to deliver this successfully?",
          },
        ],
      },
      {
        name: "Organisation",
        info:
          "Questions about structures, processes and support within the organisation.",
        children: [
          {
            name: "Strategy Alignment",
            info:
              "How does this initiative link to company strategy and OKRs? What outcomes matter most?",
          },
          {
            name: "Processes",
            info:
              "Are processes lean and documented? Any handoff or approval bottlenecks?",
          },
          {
            name: "Resources",
            info:
              "Do we have budget, tools, and capacity? What trade-offs are required?",
          },
          {
            name: "Leadership Support",
            info:
              "Is sponsorship active and visible? Are we removing blockers fast enough?",
          },
        ],
      },
      {
        name: "Environment",
        info: "Questions about the external context and constraints.",
        children: [
          {
            name: "Regulation",
            info:
              "What compliance and legal constraints apply? What reviews are needed and when?",
          },
          {
            name: "Market Trends",
            info:
              "What customer, competitor, and macro trends could impact the opportunity?",
          },
          {
            name: "Technology",
            info:
              "Which technologies enable or constrain us? Build vs buy? Interop and data needs?",
          },
          {
            name: "Stakeholders",
            info:
              "Who is affected (internal/external)? What are their goals and concerns?",
          },
          {
            name: "Risks",
            info:
              "What are the top uncertainties? What signals would change our plan?",
          },
        ],
      },
    ],
  };

    // ---- helpers (leader line math) ----
  function polar(r, a) {
    return [Math.cos(a) * r, Math.sin(a) * r];
  }

  function renderSunburst(containerSelector, data) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2;

    const innerHole = 10;
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
        showPopup(d);
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

  function showPopup(d) {
    const popup = document.getElementById("entry-popup");
    const titleEl = document.getElementById("popup-title");
    const bodyEl = document.getElementById("popup-body");

    const path = d.ancestors().map((a) => a.data.name).reverse().slice(1);
    titleEl.textContent = path.join(" → ");

    const text =
      d.data.info || (d.parent && d.parent.data && d.parent.data.info) || "";
    bodyEl.textContent = text;

    popup.classList.remove("hidden");
    popup.setAttribute("aria-hidden", "false");

    function close() {
      popup.classList.add("hidden");
      popup.setAttribute("aria-hidden", "true");
      popup.removeEventListener("click", overlayHandler);
      document.querySelector(".popup-close").removeEventListener("click", close);
      document.removeEventListener("keydown", escHandler);
      
      // tell the chart to clear the connector + active slice
      document.dispatchEvent(new CustomEvent("popup:closed"));
    }
    function overlayHandler(e) {
      if (e.target === popup) close();
    }
    function escHandler(e) {
      if (e.key === "Escape") close();
    }
    document.querySelector(".popup-close").addEventListener("click", close);
    popup.addEventListener("click", overlayHandler);
    document.addEventListener("keydown", escHandler);
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderSunburst("#sunburst", sunburstData);
  });
})();
