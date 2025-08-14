let modalRoot;
export function initModal(rootEl) { modalRoot = rootEl; }

export function openModal({ title, subtitle, content, ctaLabel, onCta }) {
  if (!modalRoot) throw new Error("Modal root not initialized");
  modalRoot.innerHTML = `
    <div class="modal-backdrop" role="presentation"></div>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <header class="modal-header">
        <div>
          <h3 id="modal-title">${title}</h3>
          ${subtitle ? `<p class="modal-subtitle">${subtitle}</p>` : ""}
        </div>
        <button class="icon-btn" aria-label="Close dialog" data-close>✕</button>
      </header>
      <div class="modal-content">${content || ""}</div>
      <footer class="modal-footer">
        ${
          ctaLabel
            ? `<button class="btn btn-primary" data-cta>${ctaLabel}</button>`
            : ""
        }
        <button class="btn" data-close>Close</button>
      </footer>
    </div>
  `;

  // Close handlers
  modalRoot.querySelectorAll("[data-close]").forEach((btn) =>
    btn.addEventListener("click", closeModal)
  );
  modalRoot.querySelector(".modal-backdrop").addEventListener("click", closeModal);

  // CTA
  const cta = modalRoot.querySelector("[data-cta]");
  if (cta) cta.addEventListener("click", () => { onCta?.(); closeModal(); });

  // Esc to close
  document.addEventListener("keydown", onEsc);
  // Focus trap (basic)
  const firstBtn = modalRoot.querySelector(".btn, .icon-btn");
  firstBtn?.focus();
}

function closeModal() {
  modalRoot.innerHTML = "";
  document.removeEventListener("keydown", onEsc);
}
function onEsc(e) { if (e.key === "Escape") closeModal(); }
