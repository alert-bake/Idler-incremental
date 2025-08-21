// ==========================================
// Idler Incremental v1.2 - Liquidated Requiem
// Producers visible + new prestige + offline
// ==========================================

// --------- GAME STATE ---------
let game = {
  currency: 0,
  // 5 tiers: Worker, Miner, Factory, Lab, Robot
  producers: [0, 0, 0, 0, 0],
  prestige: { points: 0, bestGain: 0 },
  upgrades: { doubler: 0, formulaBoost: false }, // (FormulaBoost removes the 0.2 factor)
  modifiers: { buffs: [], debuffs: [] },
  playtime: 0,
  darkMode: false,
  lastUpdate: Date.now()
};

let tickRate = 1000;      // ms per tick
let loopHandle = null;

// --------- PRODUCER META ---------
const PRODUCERS = [
  { name: "Worker",  baseCost: 10,     rate: 1 },
  { name: "Miner",   baseCost: 100,    rate: 5 },
  { name: "Factory", baseCost: 1_000,  rate: 25 },
  { name: "Lab",     baseCost: 10_000, rate: 120 },
  { name: "Robot",   baseCost: 100_000,rate: 600 },
];
const COST_SCALE = 1.15;

// --------- HELPERS ---------
function format(n) {
  if (n >= 1e6) return n.toExponential(2);
  return Math.floor(n).toLocaleString("en-US");
}
function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${h}h ${m}m ${s}s`;
}

// --------- COST + PRODUCTION ---------
function producerCost(i) {
  const owned = game.producers[i] || 0;
  return Math.floor(PRODUCERS[i].baseCost * Math.pow(COST_SCALE, owned));
}
function perTickProduction() {
  // sum of (owned * rate)
  let sum = 0;
  for (let i = 0; i < game.producers.length; i++) {
    sum += game.producers[i] * PRODUCERS[i].rate;
  }
  return sum;
}

// --------- UI RENDER ---------
function renderProducers() {
  const el = document.getElementById("producers");
  if (!el) return;
  let html = "";
  for (let i = 0; i < PRODUCERS.length; i++) {
    const p = PRODUCERS[i];
    html += `
      <div class="producer">
        <div class="producer-row">
          <strong>${p.name}</strong>
          <span>Owned: ${format(game.producers[i])}</span>
        </div>
        <div class="producer-row">
          <small>+${format(p.rate)}/tick each</small>
          <button onclick="buyProducer(${i})">Buy (${format(producerCost(i))})</button>
        </div>
      </div>
    `;
  }
  el.innerHTML = html;
}

function updateUI() {
  const c = document.getElementById("currencyDisplay");
  const pc = document.getElementById("pcDisplay");
  const pm = document.getElementById("prestigeMultDisplay");
  const dbg = document.getElementById("debugInfo");

  if (c) c.textContent = `Currency: ${format(game.currency)}`;
  if (pc) pc.textContent = `Prestige Currency: ${format(game.prestige.points)}`;
  if (pm) pm.textContent = `Prestige Multiplier: ${format(prestigeMultiplier())}×`;

  renderProducers();

  if (dbg) {
    dbg.innerHTML = `
      <p>Tickspeed: ${tickRate}ms</p>
      <p>Playtime: ${formatTime(game.playtime)}</p>
      <p>Best Prestige Gain: ${format(game.prestige.bestGain)}</p>
    `;
  }
}

// --------- GAME LOGIC ---------
function gainCurrency() {
  let clickGain = 1 * (2 ** game.upgrades.doubler);
  if (game.modifiers.buffs.includes("Stabilized")) clickGain *= 1.3;
  if (game.modifiers.debuffs.includes("Destabilizer")) clickGain = Math.pow(clickGain, 0.7);
  game.currency += clickGain;
  updateUI();
}

function buyProducer(i) {
  const cost = producerCost(i);
  if (game.currency >= cost) {
    game.currency -= cost;
    game.producers[i] = (game.producers[i] || 0) + 1;
    updateUI();
  }
}

function buyDoubler() {
  const cost = 10 * (5 ** game.upgrades.doubler);
  if (game.currency >= cost && game.upgrades.doubler < 3) {
    game.currency -= cost;
    game.upgrades.doubler++;
    updateUI();
  }
}

// --------- PRESTIGE ---------
// M5: total PC -> /256 -> *3 -> round -> ^0.8
function prestigeMultiplier() {
  let multRaw = (game.prestige.points / 256) * 3;
  let rounded = Math.round(multRaw);
  if (rounded < 1) rounded = 1;
  return Math.pow(rounded, 0.8);
}

// New base formula:
// base = floor( ((currency * 0.2) ** 0.7) / 2 )
// if formulaBoost: base = floor( (currency ** 0.7) / 2 )
function prestige() {
  if (game.currency < 200000) return;

  let base = game.upgrades.formulaBoost
    ? Math.pow(game.currency, 0.7) / 2
    : Math.pow(game.currency * 0.2, 0.7) / 2;

  let baseGain = Math.floor(base);
  let totalGain = Math.floor(baseGain * prestigeMultiplier());
  if (totalGain <= 0) return;

  // Reset
  game.currency = 0;

  // (Optional future: keep 10% base workers if you add that upgrade)
  // For now: full reset
  game.producers = new Array(PRODUCERS.length).fill(0);

  game.upgrades.doubler = 0;
  game.prestige.points += totalGain;
  game.prestige.bestGain = Math.max(game.prestige.bestGain, totalGain);

  updateUI();
}

// --------- DEBUG ---------
function debugTriple() { game.currency *= 3; updateUI(); }

function toggleTickspeed() {
  tickRate = (tickRate === 1000) ? 1 : 1000;
  if (loopHandle) clearInterval(loopHandle);
  loopHandle = setInterval(tick, tickRate);
  updateUI();
}

// --------- TABS ---------
function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// --------- SAVE / LOAD / OFFLINE ---------
function saveGame() {
  game.lastUpdate = Date.now();
  localStorage.setItem("idlerIncrementalSave", JSON.stringify(game));
}

function loadGame() {
  let save = localStorage.getItem("idlerIncrementalSave");
  if (save) {
    try {
      const data = JSON.parse(save);

      // Pad / migrate
      if (!Array.isArray(data.producers)) data.producers = [0,0,0,0,0];
      if (data.producers.length < PRODUCERS.length) {
        while (data.producers.length < PRODUCERS.length) data.producers.push(0);
      }
      game = Object.assign(game, data);
    } catch(e) {
      console.warn("Save corrupted, using defaults.");
    }
  }
  applyOfflineProgress();
  updateUI();
}

function exportSave() {
  saveGame();
  navigator.clipboard.writeText(btoa(JSON.stringify(game)));
  alert("Save copied!");
}

function importSave() {
  let data = prompt("Paste save:");
  try {
    game = JSON.parse(atob(data));
    applyOfflineProgress();
    updateUI();
    saveGame();
  } catch {
    alert("Invalid save");
  }
}

function hardReset() {
  if (confirm("Reset all progress?")) {
    localStorage.removeItem("idlerIncrementalSave");
    game = {
      currency: 0,
      producers: [0,0,0,0,0],
      prestige: { points: 0, bestGain: 0 },
      upgrades: { doubler: 0, formulaBoost: false },
      modifiers: { buffs: [], debuffs: [] },
      playtime: 0,
      darkMode: false,
      lastUpdate: Date.now()
    };
    updateUI();
    saveGame();
  }
}

// Offline rewards with decay (every 10h: ×0.85, floor 0.4)
function applyOfflineProgress() {
  const now = Date.now();
  const last = game.lastUpdate || now;
  const elapsedMs = Math.max(0, now - last);
  if (elapsedMs <= 0) { game.lastUpdate = now; return; }

  const ticks = Math.floor(elapsedMs / tickRate);
  if (ticks > 0) {
    const hours = elapsedMs / 3_600_000;
    const steps = Math.floor(hours / 10);
    const decay = Math.pow(0.85, steps);
    const efficiency = Math.max(0.4, decay);

    const perTick = perTickProduction();
    game.currency += perTick * ticks * efficiency;
    game.playtime += ticks;
  }
  game.lastUpdate = now;
}

// --------- INFO TOGGLE (Mult tooltip) ---------
function toggleMultInfo() {
  const el = document.getElementById("multInfo");
  if (!el) return;
  el.style.display = (el.style.display === "block") ? "none" : "block";
}

// --------- TICK LOOP ---------
function tick() {
  // production
  game.currency += perTickProduction();
  game.playtime++;
  game.lastUpdate = Date.now();

  updateUI();

  // lightweight autosave
  if (game.playtime % 5 === 0) saveGame();
}

// --------- INIT ---------
window.onload = () => {
  loadGame();
  loopHandle = setInterval(tick, tickRate);
  updateUI();
};
