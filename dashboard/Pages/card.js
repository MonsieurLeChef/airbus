// Opportunity Card Manager UI
const cardPage = `
  <div class="header">Identification and Validation of Opportunities</div>
  <div class="card-page-container">
    <h2 style="margin-top:0; color:#232525;">Opportunity Cards</h2>
    <button id="add-opportunity" class="add-btn">Add +</button>
    <div id="opportunity-list"></div>
  </div>

  <template id="card-template">
    <div class="opportunity-card">
      <div class="card-attributes">
        <input type="text" class="opp-name" placeholder="Opportunity Name" />
        <h3 class="section-header">Attributes</h3>
        <div class="field-row"><label>Category:</label><input type="text" class="opp-category" /></div>
        <div class="field-row"><label>Type:</label><input type="text" class="opp-type" /></div>
        <div class="field-row"><label>Risk:</label><input type="text" class="opp-risk" /></div>
        <div class="field-row"><label>Scalability:</label><input type="text" class="opp-scalability" /></div>
      </div>
      <div class="card-scaling">
        <h3 class="section-header">Scaling</h3>
  <div class="slider-row"><label>Potential</label><input type="range" min="1" max="10" value="5" step="1" class="opp-potential" /><span class="slider-value">5</span></div>
  <div class="slider-row"><label>Impact</label><input type="range" min="1" max="10" value="5" step="1" class="opp-impact" /><span class="slider-value">5</span></div>
  <div class="slider-row"><label>Fit</label><input type="range" min="1" max="10" value="5" step="1" class="opp-fit" /><span class="slider-value">5</span></div>
      </div>
      <div class="card-actions">
        <button class="delete-btn">Delete</button>
      </div>
    </div>
  </template>
`;

document.body.innerHTML = cardPage;

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
      renderOpportunities();
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

renderOpportunities();

// Add basic styles
const style = document.createElement('style');
style.textContent = `
.card-page-container {
  max-width: 700px;
  margin: 40px auto;
  background: #f7f9fc;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 32px 24px 24px 24px;
}
.add-btn {
  float: right;
  background: #4e79a7;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 1.1em;
  margin-bottom: 18px;
  cursor: pointer;
}
.opportunity-card {
  display: flex;
  flex-direction: row;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  margin-bottom: 24px;
  padding: 18px 16px;
  gap: 32px;
  align-items: flex-start;
}
.card-attributes {
  flex: 1.2;
  display: flex;
  color: #232525;
  flex-direction: column;
  gap: 10px;
}
.card-attributes input[type="text"] {
  width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d0d7e2;
  font-size: 1em;
  margin-top: 2px;
}
.field-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.card-scaling {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  border-left: 1px solid #e0e4ea;
  padding-left: 24px;
}
.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.slider-row label {
  min-width: 70px;
}
.slider-row input[type="range"] {
  width: 120px;
}
.slider-value {
  font-weight: bold;
  color: #4e79a7;
  margin-left: 8px;
}
.card-actions {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  margin-left: 12px;
}
.delete-btn {
  background: #e15759;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 0.95em;
  cursor: pointer;
  margin-top: 8px;
}
.delete-btn:hover {
  background: #b0413e;
}
`;
document.head.appendChild(style);
