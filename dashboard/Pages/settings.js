document.addEventListener('DOMContentLoaded', () => {
  // --- Element Selectors ---
  // MODIFIED: Select the new <multi-input> custom elements
  const attributesInput = document.getElementById('attributes');
  const scalingInput = document.getElementById('scaling');
  const gridNumInput = document.getElementById('gridNum');
  const saveBtn = document.querySelector('.save-btn');

  // --- Load existing values ---
  /**
   * Populates the settings form using saved values or defaults.
   */
  function loadSettings() {
    const savedAttributes = JSON.parse(localStorage.getItem('attributesOptions')) || [
      { label: 'Category', key: 'category' },
      { label: 'Date', key: 'date' },
      { label: 'Opportunity Source', key: 'opportunitysource' },
      { label: 'Opportunity Owner', key: 'opportunityowner' },
      { label: 'Action Plan', key: 'actionplan' },
      { label: 'Detailed Opportunity Description', key: 'detailedopportunitydescription' }
    ];
    const savedScaling = JSON.parse(localStorage.getItem('scalingOptions')) || [
            { label: 'Likelihood', key: 'likelihood' },
            { label: 'Impact', key: 'impact' },
            { label: 'Potential Value', key: 'potentialvalue' },
            { label: 'Feasibility', key: 'feasibility' },
            { label: 'Strategic Benefit', key: 'strategicbenefit' },
            { label: 'Fit', key: 'fit' },
            { label: 'Risk Level', key: 'risklevel' }
    ];
    const savedGridNum = parseInt(localStorage.getItem('maxnum')) || 10;

    // MODIFIED: Use the setValues method to populate the multi-input fields
    attributesInput.setValues(savedAttributes.map(a => a.label));
    scalingInput.setValues(savedScaling.map(s => s.label));
    gridNumInput.value = savedGridNum;
  }

  // --- Save settings ---
  /**
   * Persists the current settings to localStorage and provides feedback.
   */
  function saveSettings() {
    // MODIFIED: Use the getValues method to get an array directly
    const attrLabels = attributesInput.getValues();
    const scalingLabels = scalingInput.getValues();

    // Generate keys from labels (e.g., "Potential Value" -> "potentialvalue")
    const attrOptions = attrLabels.map(l => ({ label: l, key: l.replace(/\s+/g, '').toLowerCase() }));
    const scalingOptions = scalingLabels.map(l => ({ label: l, key: l.replace(/\s+/g, '').toLowerCase() }));

    // Save to localStorage
    localStorage.setItem('attributesOptions', JSON.stringify(attrOptions));
    localStorage.setItem('scalingOptions', JSON.stringify(scalingOptions));
    localStorage.setItem('maxnum', gridNumInput.value);

    // --- Visual Feedback ---
    // MODIFIED: Replaced alert with a better user experience
    saveBtn.textContent = 'Saved!';
    saveBtn.style.background = '#059669'; // A darker green for success
    setTimeout(() => {
      saveBtn.textContent = 'Save Settings';
      saveBtn.style.background = '#10b981'; // Revert to original color
    }, 2000);
  }

  // --- Event Listeners ---
  saveBtn.addEventListener('click', saveSettings);

  // --- Initial Load ---
  loadSettings();
});
