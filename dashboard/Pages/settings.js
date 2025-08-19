document.addEventListener('DOMContentLoaded', () => {
  // Load current settings from localStorage
  const attributesInput = document.getElementById('attributes');
  const scalingInput = document.getElementById('scaling');
  const gridNumInput = document.getElementById('gridNum');
  const saveBtn = document.querySelector('.save-btn');

  // Load existing values
  const savedAttributes = JSON.parse(localStorage.getItem('attributesOptions')) || [
    { label: 'Category', key: 'category' },
    { label: 'Type', key: 'type' },
    { label: 'Risk', key: 'risk' },
    { label: 'Scalability', key: 'scalability' }
  ];
  const savedScaling = JSON.parse(localStorage.getItem('scalingOptions')) || [
    { label: 'Potential', key: 'potential' },
    { label: 'Impact', key: 'impact' },
    { label: 'Fit', key: 'fit' }
  ];
  const savedGridNum = parseInt(localStorage.getItem('maxnum')) || 10;

  attributesInput.value = savedAttributes.map(a => a.label).join(', ');
  scalingInput.value = savedScaling.map(s => s.label).join(', ');
  gridNumInput.value = savedGridNum;

  saveBtn.addEventListener('click', () => {
    // Parse attributes and scaling
    const attrLabels = attributesInput.value.split(',').map(a => a.trim()).filter(Boolean);
    const scalingLabels = scalingInput.value.split(',').map(s => s.trim()).filter(Boolean);
    // Generate keys from labels
    const attrOptions = attrLabels.map(l => ({ label: l, key: l.replace(/\s+/g, '').toLowerCase() }));
    const scalingOptions = scalingLabels.map(l => ({ label: l, key: l.replace(/\s+/g, '').toLowerCase() }));
    // Save to localStorage
    localStorage.setItem('attributesOptions', JSON.stringify(attrOptions));
    localStorage.setItem('scalingOptions', JSON.stringify(scalingOptions));
    localStorage.setItem('maxnum', gridNumInput.value);
    alert('Settings saved! Changes will be reflected on the cards and heatmap.');
  });
});
