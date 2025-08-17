// Opportunity Card Manager UI

const opportunityList = document.getElementById('opportunity-list');
const addBtn = document.getElementById('add-opportunity');
const cardTemplate = document.getElementById('card-template');

let opportunities = [];

function renderOpportunities() {
  opportunityList.innerHTML = '';
  opportunities.forEach((opp, idx) => {
    const card = cardTemplate.content.cloneNode(true);
    card.querySelector('.opp-name').value = opp.name;
    card.querySelector('.opp-category').value = opp.category;
    card.querySelector('.opp-type').value = opp.type;
    card.querySelector('.opp-risk').value = opp.risk;
    card.querySelector('.opp-scalability').value = opp.scalability;
    card.querySelector('.opp-potential').value = opp.potential;
    card.querySelector('.opp-impact').value = opp.impact;
    card.querySelector('.opp-fit').value = opp.fit;
    card.querySelectorAll('.slider-value')[0].textContent = opp.potential;
    card.querySelectorAll('.slider-value')[1].textContent = opp.impact;
    card.querySelectorAll('.slider-value')[2].textContent = opp.fit;

    // Update opportunity on input
    card.querySelector('.opp-name').addEventListener('input', e => { opportunities[idx].name = e.target.value; });
    card.querySelector('.opp-category').addEventListener('input', e => { opportunities[idx].category = e.target.value; });
    card.querySelector('.opp-type').addEventListener('input', e => { opportunities[idx].type = e.target.value; });
    card.querySelector('.opp-risk').addEventListener('input', e => { opportunities[idx].risk = e.target.value; });
    card.querySelector('.opp-scalability').addEventListener('input', e => { opportunities[idx].scalability = e.target.value; });
    const potentialSlider = card.querySelector('.opp-potential');
    const impactSlider = card.querySelector('.opp-impact');
    const fitSlider = card.querySelector('.opp-fit');
    const potentialValue = card.querySelectorAll('.slider-value')[0];
    const impactValue = card.querySelectorAll('.slider-value')[1];
    const fitValue = card.querySelectorAll('.slider-value')[2];

    potentialSlider.addEventListener('input', e => {
      opportunities[idx].potential = Number(e.target.value);
      potentialValue.textContent = e.target.value;
    });
    impactSlider.addEventListener('input', e => {
      opportunities[idx].impact = Number(e.target.value);
      impactValue.textContent = e.target.value;
    });
    fitSlider.addEventListener('input', e => {
      opportunities[idx].fit = Number(e.target.value);
      fitValue.textContent = e.target.value;
    });
    card.querySelector('.delete-btn').addEventListener('click', () => {
      opportunities.splice(idx, 1);
      localStorage.setItem('opportunityCards', JSON.stringify(opportunities));
      renderOpportunities();
    });
    // Save button functionality
    card.querySelector('.save-btn').addEventListener('click', () => {
      // Save all opportunities to localStorage
      localStorage.setItem('opportunityCards', JSON.stringify(opportunities));
      card.querySelector('.save-btn').textContent = 'Saved!';
      setTimeout(() => {
        card.querySelector('.save-btn').textContent = 'Save';
      }, 1200);
    });
    opportunityList.appendChild(card);
  });
}

addBtn.addEventListener('click', () => {
  opportunities.push({
    name: '',
    category: '',
    type: '',
    risk: '',
    scalability: '',
    potential: 5,
    impact: 5,
    fit: 5
  });
  renderOpportunities();
});

// Load saved opportunities from localStorage on page load
const saved = localStorage.getItem('opportunityCards');
if (saved) {
  opportunities = JSON.parse(saved);
  renderOpportunities();
}

renderOpportunities();
