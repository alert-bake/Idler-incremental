// render.js
// Handles all DOM rendering for Idler Incremental v1.3

// Utility: clear + render
function clearElement(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

// Currency + Prestige row
function renderCurrency() {
  document.getElementById("currencyDisplay").textContent =
    "Currency: " + format(game.currency);
  document.getElementById("pc-display").textContent =
    "Prestige Points: " + format(game.prestigePoints);
}

// Producers
function renderProducers() {
  const container = document.getElementById("producers");
  clearElement(container);

  game.producers.forEach((prod, i) => {
    const div = document.createElement("div");
    div.className = "producer";

    const btn = document.createElement("button");
    btn.className = "button";
    btn.textContent =
      `${prod.name} (Owned: ${prod.count}) — Cost: ${format(prod.cost)}`;
    btn.onclick = () => buyProducer(i);

    div.appendChild(btn);
    container.appendChild(div);
  });
}

// Upgrades
function renderUpgrades() {
  const container = document.getElementById("upgrades-list");
  clearElement(container);

  game.upgrades.forEach((upg, i) => {
    const btn = document.createElement("button");
    btn.className = "button";
    btn.textContent = upg.name + " — Cost: " + format(upg.cost);
    btn.disabled = upg.bought || game.currency < upg.cost;
    btn.onclick = () => buyUpgrade(i);

    container.appendChild(btn);
  });
}

// Prestige info + milestones
function renderPrestige() {
  const info = document.getElementById("prestige-info");
  const gain = calculatePrestigeGain();
  const multi = calculatePrestigeMultiplier();

  info.innerHTML =
    `Prestige gain on reset: <b>${format(gain)}</b> PC<br>` +
    `Multiplier: <b>x${multi.toFixed(2)}</b>`;
}

// Achievements
function renderAchievements() {
  const container = document.getElementById("achievements-list");
  clearElement(container);

  game.achievements.forEach((ach, i) => {
    const span = document.createElement("span");
    span.className = "achievement " + (ach.unlocked ? "unlocked" : "locked");
    span.textContent = ach.name;
    container.appendChild(span);
  });
}

// Stats
function renderStats() {
  document.getElementById("playtimeDisplay").textContent =
    "Playtime: " + formatTime(game.playtime);
  document.getElementById("bestPrestige").textContent =
    "Best Prestige Gain: " + format(game.bestPrestigeGain);
}

// Debuggo
function renderDebuggo() {
  document.getElementById("tickDisplay").textContent =
    "Tickspeed: " + game.tickspeed + "ms";
}

// Notifications
function showNotification(text) {
  const n = document.getElementById("notification");
  n.textContent = text;
  n.style.display = "block";
  setTimeout(() => {
    n.style.display = "none";
  }, 2000);
}

// Master render
function renderAll() {
  renderCurrency();
  renderProducers();
  renderUpgrades();
  renderPrestige();
  renderAchievements();
  renderStats();
  renderDebuggo();
}
