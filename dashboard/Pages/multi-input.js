/**
 * A custom element for inputting multiple values as "pills" or "tags".
 *
 * @element multi-input
 *
 * @property {Function} getValues - Returns an array of the current string values.
 * @property {Function} setValues - Sets the input's values from an array of strings.
 */
class MultiInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._values = [];

    // --- Create the structure and styles for the component ---
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --multi-input-bg: #f8fafc;
          --multi-input-border-color: #e0e4ea;
          --pill-bg: #3b82f6;
          --pill-color: #fff;
          --pill-delete-bg: #2563eb;
        }
        .container {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background-color: var(--multi-input-bg);
          border: 1px solid var(--multi-input-border-color);
          border-radius: 8px;
          cursor: text;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          background-color: var(--pill-bg);
          color: var(--pill-color);
          border-radius: 6px;
          font-size: 0.9em;
          font-weight: 500;
        }
        .delete-btn {
          display: inline-block;
          margin-left: 8px;
          width: 16px;
          height: 16px;
          background-color: var(--pill-delete-bg);
          color: var(--pill-color);
          border-radius: 50%;
          text-align: center;
          line-height: 16px;
          cursor: pointer;
          font-family: monospace;
          font-weight: bold;
        }
        .delete-btn:hover {
          filter: brightness(1.2);
        }
        input {
          flex-grow: 1;
          border: none;
          outline: none;
          padding: 6px 0;
          background-color: transparent;
          font-family: inherit;
          font-size: 1rem;
          min-width: 150px;
        }
      </style>
      <div class="container" part="container">
        <input type="text" placeholder="Add an item and press Enter...">
      </div>
    `;

    this.container = this.shadowRoot.querySelector('.container');
    this.input = this.shadowRoot.querySelector('input');
  }

  connectedCallback() {
    // --- Add event listeners ---
    this.container.addEventListener('click', () => this.input.focus());
    this.input.addEventListener('keydown', this._handleKeyDown.bind(this));
    this.container.addEventListener('click', this._handleDelete.bind(this));
  }

  // --- Public Methods ---

  /**
   * @returns {string[]} An array of the current values.
   */
  getValues() {
    return this._values;
  }

  /**
   * Sets the component's values from an array.
   * @param {string[]} values - An array of strings to display as pills.
   */
  setValues(values) {
    this._values = values;
    this._render();
  }

  // --- Private Methods ---

  _handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const value = this.input.value.trim();
      if (value) {
        this._addValue(value);
        this.input.value = '';
      }
    } else if (event.key === 'Backspace' && this.input.value === '') {
      if (this._values.length > 0) {
        this._removeValue(this._values.length - 1);
      }
    }
  }
  
  _handleDelete(event) {
    if (event.target.classList.contains('delete-btn')) {
      const index = parseInt(event.target.dataset.index, 10);
      this._removeValue(index);
    }
  }

  _addValue(value) {
    if (!this._values.includes(value)) {
      this._values.push(value);
      this._render();
    }
  }

  _removeValue(index) {
    this._values.splice(index, 1);
    this._render();
  }

  _render() {
    // Clear existing pills
    this.container.querySelectorAll('.pill').forEach(pill => pill.remove());

    // Add new pills
    this._values.forEach((value, index) => {
      const pill = document.createElement('div');
      pill.className = 'pill';
      pill.textContent = value;
      
      const deleteBtn = document.createElement('span');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'x';
      deleteBtn.dataset.index = index;
      
      pill.appendChild(deleteBtn);
      this.container.insertBefore(pill, this.input);
    });
  }
}

// Define the custom element so the browser knows about <multi-input>
customElements.define('multi-input', MultiInput);
