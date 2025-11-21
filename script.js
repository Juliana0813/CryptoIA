
const markets = [
  { id: 'BTC', name: 'Bitcoin', price: 64800 },
  { id: 'ETH', name: 'Ethereum', price: 3350 },
  { id: 'SOL', name: 'Solana', price: 122 },
  { id: 'ADA', name: 'Cardano', price: 0.56 },
  { id: 'DOGE', name: 'Dogecoin', price: 0.12 }
];

let holdings = [
  { id: 1, coin: 'BTC', name: 'Bitcoin', amount: 0.5 },
  { id: 2, coin: 'ETH', name: 'Ethereum', amount: 2.3 },
  { id: 3, coin: 'SOL', name: 'Solana', amount: 10 }
];

let transactions = [
  { id: 'T-1001', datetime: '2025-03-11 12:43', type: 'Compra', coin: 'BTC', amount: 0.5, price: 64800 },
  { id: 'T-1002', datetime: '2025-03-12 09:21', type: 'Compra', coin: 'ETH', amount: 2.3, price: 3350 },
  { id: 'T-1003', datetime: '2025-03-20 16:10', type: 'Venta', coin: 'SOL', amount: 5, price: 120 }
];

// Portfolio history for bar chart (BTC, ETH, SOL, ADA, DOGE)
const portfolioBars = [
  { label: 'BTC', value: 64800 * 0.5 },
  { label: 'ETH', value: 3350 * 2.3 },
  { label: 'SOL', value: 122 * 10 },
  { label: 'ADA', value: 0.56 * 300 },
  { label: 'DOGE', value: 0.12 * 1000 }
];

// ----------- Helpers -----------
const $ = id => document.getElementById(id);
const fmt = v => '$' + Number(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

// ----------- Navigation -----------
document.querySelectorAll('.nav-link').forEach(link=>{
  link.addEventListener('click', (e)=>{
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(x=>x.classList.remove('active'));
    link.classList.add('active');
    const view = link.getAttribute('data-view');
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById(view).classList.add('active');
    // clear global search when switching views (optional)
    // $('globalSearch') && ($('globalSearch').value = '');
    // rerender any view-specific UI if needed
    renderAllUI();
  });
});

// ----------- Theme toggle + persist -----------
const themeToggle = $('themeToggle');
const savedTheme = localStorage.getItem('cryptoia-theme');
if (savedTheme === 'light') document.body.classList.add('light');
themeToggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
themeToggle.addEventListener('click', ()=>{
  document.body.classList.toggle('light');
  const mode = document.body.classList.contains('light') ? 'light' : 'dark';
  localStorage.setItem('cryptoia-theme', mode);
  themeToggle.textContent = mode === 'light' ? '☀️' : '🌙';
});

// ----------- Chart (bar) -----------
let portfolioChart = null;
function renderChart(){
  const ctx = document.getElementById('portfolioChart').getContext('2d');
  const labels = portfolioBars.map(b=>b.label);
  const data = portfolioBars.map(b=>Math.round(b.value));
  if (portfolioChart) portfolioChart.destroy();
  portfolioChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Valor (USD)',
        data,
        backgroundColor: ['#7c3aed','#60a5fa','#06b6d4','#00f58b','#f59e0b'],
        borderColor: ['#6b21a8','#1e3a8a','#0f766e','#059669','#b45309'],
        borderWidth: 1
      }]
    },
    options: {
      plugins:{legend:{display:false}},
      scales:{ y:{ticks:{color:'#cbd5e1'}, grid:{color:'rgba(255,255,255,0.03)'}}, x:{ticks:{color:'#cbd5e1'}, grid:{display:false}} }
    }
  });
}

// ----------- Render UI pieces -----------
function renderHoldings(){
  const list = $('holdingsList');
  list.innerHTML = '';
  holdings.forEach(h=>{
    const marketPrice = markets.find(m=>m.id===h.coin)?.price ?? 0;
    const total = marketPrice * h.amount;
    const div = document.createElement('div');
    div.className = 'hold-card';
    div.innerHTML = `
      <div class="hold-left">
        <div class="hold-icon">${h.coin}</div>
        <div class="hold-meta">
          <div>${h.name} <span class="small">(${h.coin})</span></div>
          <div class="small">Cantidad: ${h.amount}</div>
        </div>
      </div>
      <div class="hold-right">
        <div class="price">${fmt(total)}</div>
        <div class="small">(${fmt(marketPrice)})</div>
      </div>
    `;
    list.appendChild(div);
  });
}

function renderHistory(){
  const tbody = $('historyTable');
  tbody.innerHTML = '';
  transactions.forEach(t=>{
    const total = (t.price * t.amount).toFixed(2);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t.id}</td><td>${t.datetime}</td><td>${t.type}</td><td>${t.coin}</td><td>${t.amount}</td><td>${fmt(t.price)}</td><td>${fmt(total)}</td>`;
    tbody.appendChild(tr);
  });
  // also render transTable and buyTable
  const transTbody = document.querySelector('#transTable tbody');
  if(transTbody){
    transTbody.innerHTML = '';
    transactions.forEach(t=>{
      const total = (t.price * t.amount).toFixed(2);
      transTbody.insertAdjacentHTML('beforeend', `<tr><td>${t.id}</td><td>${t.datetime}</td><td>${t.type}</td><td>${t.coin}</td><td>${t.amount}</td><td>${fmt(t.price)}</td><td>${fmt(total)}</td></tr>`);
    });
  }
  const buyTbody = document.querySelector('#buyTable tbody');
  if(buyTbody){
    buyTbody.innerHTML = '';
    transactions.filter(t=>t.type==='Compra').forEach((t,i)=>{
      buyTbody.insertAdjacentHTML('beforeend', `<tr><td>${t.id}</td><td>${t.coin}</td><td>${t.amount}</td><td>${fmt(t.price)}</td><td>${fmt(t.amount * t.price)}</td></tr>`);
    });
  }
}

function updatePortfolioSummary(){
  const val = holdings.reduce((s,h)=>{
    const p = markets.find(m=>m.id===h.coin)?.price ?? 0;
    return s + (p * h.amount);
  },0);
  $('portfolioValue').textContent = fmt(val);
  // compute simple pct change using portfolioBars sample last two values if available
  let changeText = '+0%';
  if (portfolioBars.length >= 2){
    const sum = portfolioBars.reduce((s,b)=>s+b.value,0);
    const prev = sum * 0.92; // simulated previous
    const pct = (((sum - prev)/prev) * 100).toFixed(2);
    changeText = (pct>0?'+':'')+pct+'%';
  }
  $('portfolioChange').textContent = changeText;
}

// ----------- Populate selects & initial UI -----------
function populateSelects(){
  const buy = $('buyCoin');
  const trans = $('transCoin');
  buy.innerHTML = ''; trans.innerHTML = '';
  markets.forEach(m=>{
    const o = document.createElement('option'); o.value = m.id; o.textContent = `${m.name} (${m.id})`; buy.appendChild(o);
    const o2 = o.cloneNode(true); trans.appendChild(o2);
  });
}

// ----------- Calculate totals on inputs -----------
function calcBuyTotal(){
  const amount = parseFloat($('buyAmount').value) || 0;
  const price = parseFloat($('buyPrice').value) || 0;
  $('buyTotal').textContent = fmt(amount * price);
}
function calcTransTotal(){
  const amount = parseFloat($('transAmount').value) || 0;
  const price = parseFloat($('transPrice').value) || 0;
  $('transTotal').textContent = fmt(amount * price);
}

// ----------- Actions: buy & trans -----------
function registerBuy(){
  const coin = $('buyCoin').value;
  const amount = parseFloat($('buyAmount').value) || 0;
  const price = parseFloat($('buyPrice').value) || 0;
  if(!coin || amount <= 0 || price <= 0){ alert('Complete moneda, cantidad y precio válidos.'); return; }
  const id = 'T-' + (Math.floor(Math.random()*9000)+1000);
  const datetime = new Date().toLocaleString();
  const tx = { id, datetime, type: 'Compra', coin, amount, price };
  transactions.unshift(tx);
  const h = holdings.find(x=>x.coin===coin);
  if(h) h.amount = Number((h.amount + amount).toFixed(8));
  else holdings.push({ id: holdings.length+1, coin, name: markets.find(m=>m.id===coin).name, amount });
  // update portfolioBars value for that coin
  const bar = portfolioBars.find(b=>b.label===coin);
  if(bar) bar.value = (markets.find(m=>m.id===coin).price) * holdings.find(h=>h.coin===coin).amount;
  renderAllUI();
  alert('Compra registrada.');
}

function registerTrans(){
  const type = $('transType').value;
  const coin = $('transCoin').value;
  const amount = parseFloat($('transAmount').value) || 0;
  const price = parseFloat($('transPrice').value) || 0;
  const dtInput = $('transDatetime').value;
  const datetime = dtInput ? new Date(dtInput).toLocaleString() : new Date().toLocaleString();
  if(!coin || amount <= 0 || price <= 0){ alert('Complete los campos correctamente.'); return; }
  const id = 'T-' + (Math.floor(Math.random()*9000)+1000);
  const tx = { id, datetime, type, coin, amount, price };
  transactions.unshift(tx);
  const h = holdings.find(x=>x.coin===coin);
  if(type === 'Compra'){
    if(h) h.amount = Number((h.amount + amount).toFixed(8));
    else holdings.push({ id: holdings.length+1, coin, name: markets.find(m=>m.id===coin).name, amount });
  } else if(type === 'Venta'){
    if(h) h.amount = Number(Math.max(0, (h.amount - amount)).toFixed(8));
  }
  // update portfolioBars value
  const bar = portfolioBars.find(b=>b.label===coin);
  if(bar){
    const hObj = holdings.find(hh=>hh.coin===coin);
    bar.value = (markets.find(m=>m.id===coin).price) * (hObj? hObj.amount : 0);
  }
  renderAllUI();
  alert('Transacción registrada.');
}

// ----------- Search (global) - filters holdings and history ----------
function globalSearch(q){
  q = (q || '').toLowerCase().trim();
  // filter holdings
  document.querySelectorAll('#holdingsList .hold-card').forEach(card=>{
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(q) ? '' : 'none';
  });
  // filter history rows
  document.querySelectorAll('#historyTable tr').forEach(tr=>{
    const text = tr.textContent.toLowerCase();
    tr.style.display = text.includes(q) ? '' : 'none';
  });
  // filter transactions table
  document.querySelectorAll('#transTable tbody tr').forEach(tr=>{
    const text = tr.textContent.toLowerCase();
    tr.style.display = text.includes(q) ? '' : 'none';
  });
}

// ----------- Export CSV (simple) -----------
function exportHistoryCsv(){
  const rows = [['ID','FechaHora','Tipo','Cripto','Cantidad','Precio','Total']];
  transactions.forEach(t=> rows.push([t.id, t.datetime, t.type, t.coin, t.amount, t.price, (t.amount * t.price).toFixed(2)]));
  const csv = rows.map(r=> r.map(c=> `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// ----------- Render everything helper -----------
function renderAllUI(){
  renderHoldings();
  renderHistory();
  updatePortfolioSummary();
  renderChart();
  populateBuyAndTransTables(); // updates buyTable and transTables counts if needed
}

// keep buyTable and transTable in sync (helper)
function populateBuyAndTransTables(){ /* handled in renderHistory(); kept for future extensions */ }

// ----------- Event bindings -----------
document.addEventListener('DOMContentLoaded', ()=>{
  populateSelects();
  // initial fill of buy price default
  $('buyCoin').addEventListener('change', ()=> {
    const m = markets.find(x=>x.id === $('buyCoin').value);
    if(m) $('buyPrice').value = m.price;
    calcBuyTotal();
  });
  $('buyPrice').addEventListener('input', calcBuyTotal);
  $('buyAmount').addEventListener('input', calcBuyTotal);
  $('buyConfirm').addEventListener('click', registerBuy);

  $('transCoin').addEventListener('change', ()=> {
    const m = markets.find(x=>x.id === $('transCoin').value);
    if(m) $('transPrice').value = m.price;
    calcTransTotal();
  });
  $('transPrice').addEventListener('input', calcTransTotal);
  $('transAmount').addEventListener('input', calcTransTotal);
  $('transConfirm').addEventListener('click', registerTrans);

  $('globalSearch').addEventListener('input', (e)=> globalSearch(e.target.value));
  $('exportCsv').addEventListener('click', exportHistoryCsv);

  // initialize values
  if(markets.length){
    $('buyPrice').value = markets[0].price;
    $('transPrice').value = markets[0].price;
  }
  renderAllUI();
});
