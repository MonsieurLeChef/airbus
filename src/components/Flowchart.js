// removed: import "./Flowchart.css";

/**
 * options: { nodes: [...], links: [...], onNodeClick }
 */
export function initFlowchart(rootEl, options) {
  const { nodes, links, onNodeClick } = options;

  rootEl.innerHTML = `
    <div class="flow-grid">
      <svg class="flow-lines" width="100%" height="100%" preserveAspectRatio="none"></svg>
      <div class="flow-nodes"></div>
    </div>
  `;

  const nodesHost = rootEl.querySelector(".flow-nodes");
  const svg = rootEl.querySelector(".flow-lines");

  // Inject SVG gradient (used by link strokes)
  ensureGradient(svg);

  // Render nodes
  nodes.forEach((n) => {
    const el = document.createElement("button");
    el.className = "flow-node";
    el.dataset.id = n.id;
    el.style.setProperty("--col", n.col);
    el.style.setProperty("--row", n.row);
    el.innerHTML = `
      <div class="node-pill">${n.subtitle ?? "Step"}</div>
      <div class="node-title">${n.title}</div>
    `;
    el.setAttribute("aria-label", `${n.title} — open details`);
    el.addEventListener("click", () => onNodeClick(n));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNodeClick(n); }
    });
    nodesHost.appendChild(el);
  });

  requestAnimationFrame(drawLinks);
  window.addEventListener("resize", () => { svg.innerHTML = ""; ensureGradient(svg); drawLinks(); }, { passive: true });

  function drawLinks() {
    links.forEach((link) => {
      const fromEl = nodesHost.querySelector(`.flow-node[data-id="${link.from}"]`);
      const toEl = nodesHost.querySelector(`.flow-node[data-id="${link.to}"]`);
      if (!fromEl || !toEl) return;

      const a = getAnchor(fromEl, "right");
      const b = getAnchor(toEl, "left");

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const dx = Math.max(50, Math.abs(b.x - a.x) * 0.35);
      path.setAttribute("d", `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`);
      path.setAttribute("class", "flow-link");
      svg.appendChild(path);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", 4);
      circle.setAttribute("class", "flow-dot");
      svg.appendChild(circle);

      const pathLen = path.getTotalLength();
      let t = 0;
      (function tick() {
        t = (t + 2) % pathLen;
        const pt = path.getPointAtLength(t);
        circle.setAttribute("cx", pt.x);
        circle.setAttribute("cy", pt.y);
        requestAnimationFrame(tick);
      })();
    });
  }

  function getAnchor(el, side = "right") {
    const grid = rootEl.querySelector(".flow-grid");
    const gridRect = grid.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const y = r.top + r.height / 2 - gridRect.top;
    const x = side === "right" ? r.right - gridRect.left : r.left - gridRect.left;
    return { x, y };
  }
}

function ensureGradient(svg) {
  if (svg.querySelector("#flowGradient")) return;
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  grad.setAttribute("id", "flowGradient");
  grad.setAttribute("x1", "0%");
  grad.setAttribute("y1", "0%");
  grad.setAttribute("x2", "100%");
  grad.setAttribute("y2", "0%");

  const s1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  s1.setAttribute("offset", "0%");
  s1.setAttribute("stop-color", "#60a5fa");
  const s2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  s2.setAttribute("offset", "100%");
  s2.setAttribute("stop-color", "#a78bfa");

  grad.appendChild(s1); grad.appendChild(s2);
  defs.appendChild(grad);
  svg.appendChild(defs);
}
