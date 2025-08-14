import { initModal, openModal } from "./components/Modal.js";
import { initFlowchart } from "./components/Flowchart.js";
import { framework } from "./data/framework.js";

const app = document.getElementById("app");

app.innerHTML = `
  <header class="app-header">
    <div class="brand">
      <div class="brand-logo" aria-hidden="true">◆</div>
      <div class="brand-text">
        <h1 class="brand-title">Opportunity Dashboard</h1>
        <p class="brand-subtitle">Explore • Evaluate • Act</p>
      </div>
    </div>
    <nav class="nav">
      <a href="#" class="nav-link is-active" aria-current="page">Home</a>
      <a href="#" class="nav-link">Insights</a>
      <a href="#" class="nav-link">Settings</a>
      <button id="theme-toggle" class="icon-btn theme-toggle" aria-label="Toggle dark mode"></button>
    </nav>
  </header>

  <main class="app-main">
    <section class="hero">
      <h2 class="hero-title">Framework Flow</h2>
      <p class="hero-subtitle">Click any step to see the key questions, inputs, and outputs.</p>
    </section>

    <section class="flow-wrapper">
      <div id="flowchart" class="flowchart"></div>
    </section>
  </main>

  <div id="modal-root"></div>
`;

initModal(document.getElementById("modal-root"));

// theme toggle behavior
const toggleBtn = document.getElementById("theme-toggle");
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem("theme", theme); } catch {}
  const isDark = theme === "dark";
  toggleBtn.textContent = isDark ? "☀️" : "🌙";
  toggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}
setTheme(document.documentElement.dataset.theme || "light");
toggleBtn.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next);
});

const flowEl = document.getElementById("flowchart");
initFlowchart(flowEl, {
  nodes: framework.nodes,
  links: framework.links,
  onNodeClick: (node) => {
    openModal({
      title: node.title,
      subtitle: node.subtitle,
      content: `
        <div class="detail-block">
          <h4>Purpose</h4>
          <p>${node.description}</p>
        </div>
        ${
          node.prompts?.length
            ? `<div class="detail-block"><h4>Guiding questions</h4><ul>${node.prompts
                .map((p) => `<li>${p}</li>`)
                .join("")}</ul></div>`
            : ""
        }
        ${
          node.outputs?.length
            ? `<div class="detail-block"><h4>Typical outputs</h4><ul>${node.outputs
                .map((o) => `<li>${o}</li>`)
                .join("")}</ul></div>`
            : ""
        }
      `,
      ctaLabel: "Open details",
      onCta: () => console.log("Open details for:", node.id),
    });
  },
});
