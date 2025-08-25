document.addEventListener('DOMContentLoaded', () => {
    // Load attributes and scalers from localStorage
    function getAttributes() {
        const saved = localStorage.getItem('attributesOptions');
        if (!saved) return [
            { label: 'Category', key: 'category' },
            { label: 'Date', key: 'date' },
            { label: 'Opportunity Source', key: 'opportunitysource' },
            { label: 'Opportunity Owner', key: 'opportunityowner' },
            { label: 'Action Plan', key: 'actionplan' },
            { label: 'Detailed Opportunity Description', key: 'detailedopportunitydescription' }
        ];
        return JSON.parse(saved);
    }
    function getScalers() {
        const saved = localStorage.getItem('scalingOptions');
        if (!saved) return [
            { label: 'Likelihood', key: 'likelihood' },
            { label: 'Impact', key: 'impact' },
            { label: 'Potential Value', key: 'potentialvalue' },
            { label: 'Feasibility', key: 'feasibility' },
            { label: 'Strategic Benefit', key: 'strategicbenefit' },
            { label: 'Fit', key: 'fit' },
            { label: 'Risk Level', key: 'risklevel' }
        ];
        return JSON.parse(saved);
    }

    let ATTRIBUTES = getAttributes();
    let SCALERS = getScalers();

    window.addEventListener('storage', () => {
        ATTRIBUTES = getAttributes();
        SCALERS = getScalers();
        renderOpportunities();
    });


    const opportunityList = document.getElementById('opportunity-list');
    const addBtn = document.getElementById('add-opportunity');
    const cardTemplate = document.getElementById('card-template');

    let opportunities = [];

    // --- Core Functions ---

    /**
     * Renders the entire list of opportunity cards.
     */
    function renderOpportunities() {
        opportunityList.innerHTML = '';
        opportunities.forEach((opp, index) => {
            const cardElement = createCardElement(opp, index);
            opportunityList.appendChild(cardElement);
        });
    }

    /**
     * Creates a single card element from an opportunity object.
     * @param {object} opp - The opportunity data.
     * @param {number} index - The index of the opportunity in the array.
     * @returns {HTMLElement} The fully constructed card element.
     */
    function createCardElement(opp, index) {
        const card = cardTemplate.content.cloneNode(true);
        const cardDiv = card.querySelector('.opportunity-card');
        cardDiv.dataset.index = index;

        // Set the opportunity name value
        card.querySelector('.opp-name').value = opp.name;

        // Generate and append dynamic fields
        const attributesContainer = card.querySelector('.card-attributes-container');
        const scalingContainer = card.querySelector('.card-scaling-container');

        attributesContainer.innerHTML = ATTRIBUTES.map(attr => generateAttributeHTML(attr, opp[attr.key])).join('');
        scalingContainer.innerHTML = SCALERS.map(scaler => generateScalerHTML(scaler, opp[scaler.key])).join('');
        
        return cardDiv;
    }

    /**
     * Handles all input events within the opportunity list for real-time data updates.
     * @param {Event} e - The input or click event.
     */
    function handleCardInput(e) {
        const target = e.target;
        const card = target.closest('.opportunity-card');
        if (!card) return;

        const index = parseInt(card.dataset.index, 10);
        const key = target.dataset.key;

        if (target.matches('input[type="text"], textarea.description-textarea')) {
            opportunities[index][key] = target.value;
        } else if (target.matches('input[type="range"]')) {
            const value = Number(target.value);
            opportunities[index][key] = value;
            // Update the slider's numeric display
            const sliderValueSpan = target.nextElementSibling;
            if (sliderValueSpan && sliderValueSpan.classList.contains('slider-value')) {
                sliderValueSpan.textContent = value;
            }
        }
    }

    /**
     * Handles all click events within the opportunity list (e.g., Save, Delete).
     * @param {Event} e - The click event.
     */
    function handleCardClick(e) {
        const target = e.target;
        const card = target.closest('.opportunity-card');
        if (!card) return;
        
        const index = parseInt(card.dataset.index, 10);

        if (target.matches('.delete-btn')) {
            opportunities.splice(index, 1);
            saveOpportunities();
            renderOpportunities();
        } else if (target.matches('.save-btn')) {
            saveOpportunities();
            target.textContent = 'Saved!';
            setTimeout(() => {
                target.textContent = 'Save';
            }, 1200);
        }
    }

    // --- Helper & Utility Functions ---

    /**
     * Generates HTML for a single text attribute field.
     */
    function generateAttributeHTML(attribute, value) {
        if (attribute.key === 'detailedopportunitydescription') {
            return `
                <div class="field-row">
                    <label>${attribute.label}:</label>
                    <textarea data-key="${attribute.key}" class="description-textarea">${value || ''}</textarea>
                </div>`;
        }
        return `
            <div class="field-row">
                <label>${attribute.label}:</label>
                <input type="text" data-key="${attribute.key}" value="${value || ''}" />
            </div>`;
    }

    /**
     * Generates HTML for a single scaling slider.
     */
    function generateScalerHTML(scaler, value) {
        const val = value || 5;
        const maxnum = parseInt(localStorage.getItem('maxnum')) || 10;
        return `
            <div class="slider-row">
                <label>${scaler.label}</label>
                <input type="range" min="1" max="${maxnum}" value="${val > maxnum ? maxnum : val}" step="1" data-key="${scaler.key}" />
                <span class="slider-value">${val > maxnum ? maxnum : val}</span>
            </div>`;
    }

    /**
     * Adds a new, empty opportunity card to the list.
     */
    function addOpportunity() {
        const newOpp = { name: '' };
        ATTRIBUTES.forEach(attr => newOpp[attr.key] = '');
        SCALERS.forEach(scaler => newOpp[scaler.key] = 5);
        opportunities.push(newOpp);
        renderOpportunities();
    }
    
    /**
     * Saves the current opportunities array to localStorage.
     */
    function saveOpportunities() {
        localStorage.setItem('opportunityCards', JSON.stringify(opportunities));
    }

    /**
     * Loads opportunities from localStorage.
     */
    function loadOpportunities() {
        const saved = localStorage.getItem('opportunityCards');
        if (saved) {
            opportunities = JSON.parse(saved);
        }
        renderOpportunities();
    }

    // --- Initial Setup ---

    addBtn.addEventListener('click', addOpportunity);
    opportunityList.addEventListener('input', handleCardInput);
    opportunityList.addEventListener('click', handleCardClick);
    
    loadOpportunities(); // Load and render initial data
});
