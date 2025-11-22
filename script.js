document.addEventListener("DOMContentLoaded", () => {

  //MIDDLEWARE — comprobar sesión
    function checkAuth() {
    const stored = localStorage.getItem("loggedUser");
    if (!stored) {
      window.location.href = "login/login.html";
      return null;
    }
    return JSON.parse(stored);
  }

  const userSession = checkAuth();
  if (!userSession) return;


  //SISTEMA DE NAVEGACIÓN (ARREGLADO)
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-view");

      // activar link
      document.querySelectorAll(".nav-link").forEach(n => n.classList.remove("active"));
      link.classList.add("active");

      // ocultar vistas
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));

      // mostrar vista seleccionada
      const section = document.getElementById(target);
      if (section) section.classList.add("active");
    });
  });


  //Mostrar datos del usuario

  const displayUserEl = document.getElementById("displayUser");
  const avatarLogoEl = document.getElementById("avatarLogo");
  const displayBalanceEl = document.getElementById("displayBalance");
  const portfolioValueEl = document.getElementById("portfolioValue");

  const username =
    userSession.nombre || userSession.usuario || "Usuario";

  if (displayUserEl) displayUserEl.textContent = username;
  if (avatarLogoEl) avatarLogoEl.textContent = username.charAt(0).toUpperCase();

  const saldo = Number(userSession.saldo || 0);
  if (displayBalanceEl) displayBalanceEl.textContent = `Saldo: $${saldo.toLocaleString()}`;
  if (portfolioValueEl) portfolioValueEl.textContent = `$${saldo.toLocaleString()}`;


  //Logout
   
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedUser");
      window.location.href = "login/login.html";
    });
  }


  //Permisos por rol (ARREGLADO)
    function applyRolePermissions() {
    const role = (userSession.rol ?? "usuario").toLowerCase();

    const navTransacciones = document.querySelector('[data-view="transacciones"]');
    const sectionTransacciones = document.getElementById("transacciones");

    // usuario normal: no ve transacciones
    if (role === "usuario") {
      if (navTransacciones) navTransacciones.style.display = "none";
      if (sectionTransacciones) sectionTransacciones.remove();
    }
  }

  applyRolePermissions();


  //HOLDINGS — PERSISTENCIA
   
  const holdingsKey = `holdings_${username.toLowerCase()}`;

  const defaultHoldings = [
    { coin: "BTC", name: "Bitcoin", amount: 0.5 },
    { coin: "ETH", name: "Ethereum", amount: 2.3 },
    { coin: "SOL", name: "Solana", amount: 10 }
  ];

  function getHoldings() {
    const raw = localStorage.getItem(holdingsKey);
    if (!raw) {
      localStorage.setItem(holdingsKey, JSON.stringify(defaultHoldings));
      return [...defaultHoldings];
    }
    return JSON.parse(raw);
  }

  function saveHoldings(hs) {
    localStorage.setItem(holdingsKey, JSON.stringify(hs));
  }

  let holdings = getHoldings();


  //HOLDINGS RENDER (CORREGIDO)
  function renderHoldingsList() {
    const lists = [
      document.getElementById("holdingsList"),
      document.getElementById("sellPortfolioList")
    ];

    lists.forEach(list => {
      if (!list) return;

      list.innerHTML = "";
      holdings.forEach(h => {
        list.insertAdjacentHTML("beforeend", `
          <div class="hold-card">
            <div class="hold-left">
              <div class="hold-icon">${h.coin}</div>
              <div class="hold-meta">
                <div>${h.name} <span class="small">(${h.coin})</span></div>
                <div class="small">Cantidad: ${h.amount}</div>
              </div>
            </div>
            <div class="hold-right">
              <div class="price small">—</div>
            </div>
          </div>
        `);
      });
    });
  }

  renderHoldingsList();


  //Lista de criptos
   
  const cryptos = ["BTC", "ETH", "ADA", "SOL", "BNB", "XRP"];

  function fillSelects() {
    const selects = [
      document.getElementById("buyCoin"),
      document.getElementById("transCoin"),
      document.getElementById("sellCoin")
    ];
    selects.forEach(sel => {
      if (!sel) return;
      cryptos.forEach(c => {
        sel.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`);
      });
    });
  }
  fillSelects();


  //PRECIOS SIMULADOS
   const marketPrices = {
    BTC: 64800,
    ETH: 3350,
    SOL: 122,
    ADA: 0.56,
    BNB: 300,
    XRP: 0.8
  };

  const getPrice = coin => marketPrices[coin] || 0;


  //Compra
  const buyAmountEl = document.getElementById("buyAmount");
  const buyPriceEl = document.getElementById("buyPrice");
  const buyCoinEl = document.getElementById("buyCoin");
  const buyTotalEl = document.getElementById("buyTotal");
  const buyConfirmBtn = document.getElementById("buyConfirm");
  const buyTableBody = document.querySelector("#buyTable tbody");

  function updateBuyTotal() {
    const amount = Number(buyAmountEl?.value || 0);
    const price = Number(buyPriceEl?.value || 0);
    if (buyTotalEl) buyTotalEl.textContent =
      `$${(amount * price).toLocaleString()}`;
  }

  if (buyCoinEl)
    buyCoinEl.addEventListener("change", () => {
      buyPriceEl.value = getPrice(buyCoinEl.value);
      updateBuyTotal();
    });

  if (buyAmountEl) buyAmountEl.addEventListener("input", updateBuyTotal);
  if (buyPriceEl) buyPriceEl.addEventListener("input", updateBuyTotal);

  function addToBuyTable(row) {
    if (!buyTableBody) return;
    buyTableBody.insertAdjacentHTML("afterbegin", `
      <tr>
        <td>${row.id}</td>
        <td>${row.coin}</td>
        <td>${row.amount}</td>
        <td>$${row.price.toLocaleString()}</td>
        <td>$${(row.amount * row.price).toLocaleString()}</td>
      </tr>
    `);
  }


  //Transacciones
  const transTypeEl = document.getElementById("transType");
  const transCoinEl = document.getElementById("transCoin");
  const transAmountEl = document.getElementById("transAmount");
  const transPriceEl = document.getElementById("transPrice");
  const transDatetimeEl = document.getElementById("transDatetime");
  const transTotalEl = document.getElementById("transTotal");
  const transConfirmBtn = document.getElementById("transConfirm");
  const transTableBody = document.querySelector("#transTable tbody");

  function updateTransTotal() {
    const amount = Number(transAmountEl?.value || 0);
    const price = Number(transPriceEl?.value || 0);
    if (transTotalEl) transTotalEl.textContent =
      `$${(amount * price).toLocaleString()}`;
  }

  if (transAmountEl) transAmountEl.addEventListener("input", updateTransTotal);
  if (transPriceEl) transPriceEl.addEventListener("input", updateTransTotal);

  if (transCoinEl)
    transCoinEl.addEventListener("change", () => {
      transPriceEl.value = getPrice(transCoinEl.value);
      updateTransTotal();
    });

  function addTransaction(tx) {
    const key = `txs_${username.toLowerCase()}`;
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    arr.unshift(tx);
    localStorage.setItem(key, JSON.stringify(arr));

    if (transTableBody) {
      transTableBody.insertAdjacentHTML("afterbegin", `
        <tr>
          <td>${tx.id}</td>
          <td>${tx.datetime}</td>
          <td>${tx.type}</td>
          <td>${tx.coin}</td>
          <td>${tx.amount}</td>
          <td>$${tx.price.toLocaleString()}</td>
          <td>$${(tx.amount * tx.price).toLocaleString()}</td>
        </tr>
      `);
    }
  }


  /************************************
   * 💸 Venta
   ************************************/
  const sellCoinEl = document.getElementById("sellCoin");
  const sellAmountEl = document.getElementById("sellAmount");
  const sellTotalEl = document.getElementById("sellTotal");
  const sellConfirmBtn = document.getElementById("sellConfirm");
  const sellTableBody = document.querySelector("#sellTable tbody");

  function ejecutarVenta(coin, amount, price) {
    const h = holdings.find(x => x.coin === coin);
    if (h) h.amount = Math.max(0, h.amount - amount);

    saveHoldings(holdings);
    renderHoldingsList();

    userSession.saldo += amount * price;
    localStorage.setItem("loggedUser", JSON.stringify(userSession));

    if (displayBalanceEl) displayBalanceEl.textContent =
      `Saldo: $${userSession.saldo.toLocaleString()}`;

    const tx = {
      id: "S-" + (Math.floor(Math.random() * 9000) + 1000),
      datetime: new Date().toLocaleString(),
      type: "Venta",
      coin,
      amount,
      price
    };

    addTransaction(tx);

    if (sellTableBody) {
      sellTableBody.insertAdjacentHTML("afterbegin", `
        <tr>
          <td>${tx.id}</td>
          <td>${tx.coin}</td>
          <td>${tx.amount}</td>
          <td>$${tx.price.toLocaleString()}</td>
          <td>$${(tx.amount * tx.price).toLocaleString()}</td>
        </tr>
      `);
    }
  }

  if (sellAmountEl)
    sellAmountEl.addEventListener("input", () => {
      const price = getPrice(sellCoinEl?.value);
      sellTotalEl.textContent = `$${(Number(sellAmountEl.value) * price).toLocaleString()}`;
    });

  if (sellConfirmBtn)
    sellConfirmBtn.addEventListener("click", () => {
      const coin = sellCoinEl.value;
      const amount = Number(sellAmountEl.value || 0);
      const price = getPrice(coin);

      const h = holdings.find(x => x.coin === coin);

      if (!h || h.amount < amount) {
        alert("No tienes esa cantidad para vender.");
        return;
      }

      ejecutarVenta(coin, amount, price);
      alert("Venta realizada");

      sellAmountEl.value = "";
      sellTotalEl.textContent = "$0";
    });


  //Buscador global
  const globalSearch = document.getElementById("globalSearch");
  if (globalSearch) {
    globalSearch.addEventListener("input", e => {
      const q = e.target.value.toLowerCase();

      document.querySelectorAll(".hold-card").forEach(card => {
        card.style.display =
          card.textContent.toLowerCase().includes(q) ? "" : "none";
      });

      document.querySelectorAll("tbody tr").forEach(tr => {
        tr.style.display =
          tr.textContent.toLowerCase().includes(q) ? "" : "none";
      });
    });
  }


//Exportar CSV

  const exportBtn = document.getElementById("exportCsv");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const key = `txs_${username.toLowerCase()}`;
      const arr = JSON.parse(localStorage.getItem(key) || "[]");

      const rows = [
        ["ID", "FechaHora", "Tipo", "Cripto", "Cantidad", "Precio", "Total"],
        ...arr.map(t => [
          t.id,
          t.datetime,
          t.type,
          t.coin,
          t.amount,
          t.price,
          (t.amount * t.price).toFixed(2)
        ])
      ];

      const csv = rows
        .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${username}.csv`;
      a.click();

      URL.revokeObjectURL(url);
    });
  }


  //Chart
  const ctx = document.getElementById("portfolioChart");
  if (ctx && window.Chart) {
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: cryptos,
        datasets: [{
          label: 'Valor (USD)',
          data: cryptos.map(c =>
            Math.round(getPrice(c) * (holdings.find(h => h.coin === c)?.amount || 0))
          ),
          backgroundColor: ['#7c3aed','#60a5fa','#06b6d4','#00f58b','#f59e0b','#ff7eb6']
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { color: '#cbd5e1' }},
          x: { ticks: { color: '#cbd5e1' }}
        }
      }
    });
  }


  //Inicializar renderings visibles
  function initRender() {
    renderHoldingsList();

    const key = `txs_${username.toLowerCase()}`;
    const arr = JSON.parse(localStorage.getItem(key) || "[]");

    const transTbody = document.querySelector("#transTable tbody");
    if (transTbody) {
      transTbody.innerHTML = "";
      arr.forEach(t => {
        transTbody.insertAdjacentHTML("beforeend", `
          <tr>
            <td>${t.id}</td>
            <td>${t.datetime}</td>
            <td>${t.type}</td>
            <td>${t.coin}</td>
            <td>${t.amount}</td>
            <td>$${t.price.toLocaleString()}</td>
            <td>$${(t.amount * t.price).toLocaleString()}</td>
          </tr>
        `);
      });
    }

    const sellTbody = document.querySelector("#sellTable tbody");
    if (sellTbody) {
      sellTbody.innerHTML = "";
      arr.filter(t => t.type === "Venta").forEach(t => {
        sellTbody.insertAdjacentHTML("beforeend", `
          <tr>
            <td>${t.id}</td>
            <td>${t.coin}</td>
            <td>${t.amount}</td>
            <td>$${t.price.toLocaleString()}</td>
            <td>$${(t.amount * t.price).toLocaleString()}</td>
          </tr>
        `);
      });
    }
  }

  initRender();

});
