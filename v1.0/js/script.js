// ====== GAME STATE ======
let game = {
  currency: 0,
  producers: [0, 0, 0], // Worker, Miner, Factory (expand later)
  upgrades: { doubler: 0, formulaBoost: false },
  prestige: { points: 0, bestGain: 0 },
  modifiers: { active: false, buffs: [], debuffs: [] },
  playtime: 0,
  darkMode: false
};

// ====== PRODUCER COSTS ======
function producerCost(i) {
  // Scales up 15% per purchase
  return Math.floor(10 * Math.pow(1.15, game.producers[i]));
}

// ====== UI RENDERING ======
function updateUI() {
  document.getElementById("app").innerHTML = `
    <h1>Idler Incremental v1.0</h1>
    <p>Currency: ${format(game.currency)}</p>
    <p>Producers: ${game.producers.map((p,i)=>`#${i+1}:${p}`).join(", ")}</p>
    <p>Prestige Points: ${format(game.prestige.points)}</p>
    <div>
      <button onclick="gainCurrency()">Click</button>
      <button onclick="buyProducer(0)">Buy Worker (${producerCost(0)})</button>
      <button onclick="buyDoubler()">Buy Doubler (${10 * (5 ** game.upgrades.doubler)})</button>
    </div>
    <div>
      <button onclick="prestige()">Prestige</button>
    </div>
    <hr>
    <div>
      <h3>Settings</h3>
      <button onclick="toggleDarkMode()">Toggle Dark Mode</button>
      <button onclick="hardReset()">Hard Reset</button><br>
      <button onclick="saveGame()">Manual Save</button>
      <button onclick="loadGame()">Load Save</button><br>
      <button onclick="exportSave()">Export</button>
      <button onclick="importSave()">Import</button>
    </div>
    <hr>
    <div>
      <h3>Debuggo</h3>
      <button onclick="debugTriple()">Triple Currency</button>
      <button onclick="toggleTickspeed()">Toggle 1ms Tick</button>
      <p>Tickspeed: ${tickRate}ms</p>
      <p>Playtime: ${formatTime(game.playtime)}</p>
    </div>
  `;
}

// ====== GAME LOGIC ======
function gainCurrency() {
  let gain = 1 * (2 ** game.upgrades.doubler);
  if (game.modifiers.buffs.includes("Stabilized")) gain *= 1.3;
  if (game.modifiers.debuffs.includes("Destabilizer")) gain = Math.pow(gain, 0.7);
  game.currency += gain;
  updateUI();
}

function buyProducer(i) {
  let cost = producerCost(i);
  if (game.currency >= cost) {
    game.currency -= cost;
    game.producers[i]++;
    updateUI();
  }
}

function buyDoubler() {
  let cost = 10 * (5 ** game.upgrades.doubler);
  if (game.currency >= cost && game.upgrades.doubler < 3) {
    game.currency -= cost;
    game.upgrades.doubler++;
    updateUI();
  }
}

function prestige() {
  if (game.currency >= 200000) {
    let base = Math.pow(game.currency / 4, 0.9);
    if (game.upgrades.formulaBoost) base = Math.pow(game.currency / 4, 0.9) / 1.5 / 1.5;
    let gain = Math.floor(base / 4);

    if (gain > 0) {
      game.currency = 0;
      game.producers = [0, 0, 0];
      game.upgrades.doubler = 0;
      game.prestige.points += gain;
      game.prestige.bestGain = Math.max(game.prestige.bestGain, gain);
    }
    updateUI();
  }
}

// ====== DEBUG ======
function debugTriple() { game.currency *= 3; updateUI(); }
let tickRate = 1000;
function toggleTickspeed() { tickRate = tickRate === 1000 ? 1 : 1000; }

// ====== SAVE/LOAD ======
function saveGame() { localStorage.setItem("idlerIncrementalSave", JSON.stringify(game)); }
function loadGame() {
  let save = localStorage.getItem("idlerIncrementalSave");
  if (save) { game = JSON.parse(save); updateUI(); }
}
function exportSave() {
  navigator.clipboard.writeText(btoa(JSON.stringify(game)));
  alert("Save copied!");
}
function importSave() {
  let data = prompt("Paste save:");
  try { game = JSON.parse(atob(data)); updateUI(); saveGame(); }
  catch { alert("Invalid save"); }
}
function hardReset() { if(confirm("Reset?")) { localStorage.clear(); location.reload(); } }

// ====== HELPERS ======
function format(n) {
  if (n >= 1e6) return n.toExponential(2);
  return n.toLocaleString("en-US");
}
function formatTime(sec) {
  let m = Math.floor(sec/60), s = sec%60;
  return `${m}m ${s}s`;
}

// ====== MAIN LOOP ======
function tick() {
  game.playtime++;
  for (let i=0;i<game.producers.length;i++) {
    game.currency += game.producers[i];
  }
  updateUI();
  setTimeout(tick, tickRate);
}

// ====== INIT ======
window.onload = () => { loadGame(); updateUI(); tick(); };
