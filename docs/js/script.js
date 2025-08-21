// ===== GAME STATE =====
let game = {
  currency: 0,
  producers: [0, 0, 0], // Worker, Miner, Factory
  upgrades: { doubler: 0, formulaBoost: false },
  prestige: { points: 0, bestGain: 0 },
  modifiers: { active: false, buffs: [], debuffs: [] },
  playtime: 0,
  darkMode: false
};

// ===== COSTS =====
function producerCost(i){
  return Math.floor(10 * Math.pow(1.15, game.producers[i]));
}

// ===== RENDER =====
function updateUI(){
  // currency + prestige
  const c = document.getElementById("currencyDisplay");
  const p = document.getElementById("pcDisplay");
  if(c) c.textContent = "Currency: " + format(game.currency);
  if(p) p.textContent = "Prestige Points: " + format(game.prestige.points);

  // producers
  const prodRoot = document.getElementById("producers");
  if(prodRoot){
    let html = "";
    game.producers.forEach((count,i)=>{
      html += `<div class="producer">
        Producer #${i+1}: ${count}
        <button onclick="buyProducer(${i})">Buy (${producerCost(i)})</button>
      </div>`;
    });
    prodRoot.innerHTML = html;
  }

  // upgrades
  const upgRoot = document.getElementById("upgradesList");
  if(upgRoot){
    upgRoot.innerHTML = `
      <div class="upgrade">
        <button onclick="buyDoubler()" ${game.upgrades.doubler >= 3 ? "disabled" : ""}>
          Buy Doubler (${10 * (5 ** game.upgrades.doubler)})
        </button>
        <p>Owned: ${game.upgrades.doubler}</p>
      </div>
    `;
  }

  // prestige info
  const pi = document.getElementById("prestigeInfo");
  if(pi) pi.textContent = `Best Gain: ${format(game.prestige.bestGain)}`;

  // stats
  const pt = document.getElementById("playtimeDisplay");
  const bp = document.getElementById("bestPrestige");
  if(pt) pt.textContent = "Playtime: " + formatTime(game.playtime);
  if(bp) bp.textContent = "Best Prestige Gain: " + format(game.prestige.bestGain);

  // debug
  const td = document.getElementById("tickDisplay");
  if(td) td.textContent = "Tickspeed: " + tickRate + "ms";
}

// ===== TABS =====
function showTab(id){
  // switch content
  document.querySelectorAll('.tab').forEach(el=>el.classList.remove('active'));
  const tab = document.getElementById(id);
  if(tab) tab.classList.add('active');

  // highlight tab button
  document.querySelectorAll('#tabs button').forEach(btn=>{
    const on = btn.getAttribute('onclick') || "";
    btn.classList.toggle('active', on.includes(`'${id}'`));
  });

  // if the tab has subtabs, ensure the first is active
  if(id === "settingsTab"){
    const firstBtn = document.querySelector('#settingsSubtabs .subtab-btn');
    if(firstBtn && !firstBtn.classList.contains('active')){
      firstBtn.click();
    }
  }
}

function showSubtab(subtabId, btn){
  const container = document.getElementById("settingsTab");
  if(!container) return;

  container.querySelectorAll('.subtab').forEach(s=>s.classList.remove('active'));
  const target = document.getElementById(subtabId);
  if(target) target.classList.add('active');

  const bar = document.getElementById('settingsSubtabs');
  if(bar){
    bar.querySelectorAll('.subtab-btn').forEach(b=>b.classList.remove('active'));
    if(btn) btn.classList.add('active');
  }
}

// ===== GAME LOGIC =====
function gainCurrency(){
  let gain = 1 * (2 ** game.upgrades.doubler);
  if (game.modifiers.buffs.includes("Stabilized")) gain *= 1.3;
  if (game.modifiers.debuffs.includes("Destabilizer")) gain = Math.pow(gain, 0.7);
  game.currency += gain;
  updateUI();
}

function buyProducer(i){
  const cost = producerCost(i);
  if (game.currency >= cost){
    game.currency -= cost;
    game.producers[i]++;
    updateUI();
  }
}

function buyDoubler(){
  const cost = 10 * (5 ** game.upgrades.doubler);
  if (game.currency >= cost && game.upgrades.doubler < 3){
    game.currency -= cost;
    game.upgrades.doubler++;
    updateUI();
  }
}

function prestige(){
  if (game.currency >= 200000){
    let base = Math.pow(game.currency / 4, 0.9);
    if (game.upgrades.formulaBoost) base = Math.pow(game.currency / 4, 0.9) / 1.5 / 1.5;
    const gain = Math.floor(base / 4);
    if (gain > 0){
      game.currency = 0;
      game.producers = [0,0,0];
      game.upgrades.doubler = 0;
      game.prestige.points += gain;
      game.prestige.bestGain = Math.max(game.prestige.bestGain, gain);
    }
    updateUI();
  }
}

// ===== DEBUG =====
function debugTriple(){ game.currency *= 3; updateUI(); }
let tickRate = 1000;
function toggleTickspeed(){ tickRate = (tickRate === 1000 ? 1 : 1000); }

// ===== SAVE/LOAD =====
function saveGame(){ localStorage.setItem("idlerIncrementalSave", JSON.stringify(game)); }
function loadGame(){
  let save = localStorage.getItem("idlerIncrementalSave");
  if (save){
    try{
      const data = JSON.parse(save);
      if (data && typeof data === "object") game = {...game, ...data};
    }catch{}
  }
  updateUI();
}
function exportSave(){
  navigator.clipboard.writeText(btoa(JSON.stringify(game)));
  alert("Save copied!");
}
function importSave(){
  let data = prompt("Paste save:");
  try{
    game = JSON.parse(atob(data));
    updateUI(); saveGame();
  }catch{ alert("Invalid save"); }
}
function hardReset(){
  if(confirm("Reset?")){
    localStorage.clear();
    location.reload();
  }
}

// ===== HELPERS =====
function format(n){ return (n >= 1e6) ? n.toExponential(2) : n.toLocaleString("en-US"); }
function formatTime(sec){
  sec = Math.floor(sec);
  const m = Math.floor(sec/60), s = sec%60;
  return `${m}m ${s}s`;
}

// ===== LOOP =====
function tick(){
  game.playtime++;
  for (let i=0;i<game.producers.length;i++){
    game.currency += game.producers[i];
  }
  updateUI();
  setTimeout(tick, tickRate);
}

// ===== INIT =====
window.onload = () => { loadGame(); updateUI(); tick(); };

// ===== GLOBAL EXPORTS (for inline onclick) =====
window.showTab = showTab;
window.showSubtab = showSubtab;
window.gainCurrency = gainCurrency;
window.buyProducer = buyProducer;
window.buyDoubler = buyDoubler;
window.prestige = prestige;
window.debugTriple = debugTriple;
window.toggleTickspeed = toggleTickspeed;
window.toggleDarkMode = toggleDarkMode;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.exportSave = exportSave;
window.importSave = importSave;
window.hardReset = hardReset;

// ===== THEME TOGGLE =====
function toggleDarkMode(){
  game.darkMode = !game.darkMode;
  document.body.classList.toggle("darkmode", game.darkMode);
}
