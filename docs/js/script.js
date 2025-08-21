// ===============================
// Idler Incremental v1.2 - Liquidated Requiem
// ===============================
let game = {
    currency: 0,
    producers: [0, 0, 0, 0, 0],
    prestige: {
        points: 0,
        bestGain: 0,
    },
    upgrades: {
        formulaBoost: false,
        doubler: 0,
    },
    playtime: 0,
};

let tickRate = 1000;
let gameLoop;

// ===============================
// Utility
// ===============================
function format(x) {
    if (x >= 1e6) return x.toExponential(2);
    return Math.floor(x);
}

function formatTime(sec) {
    let h = Math.floor(sec / 3600);
    let m = Math.floor((sec % 3600) / 60);
    let s = Math.floor(sec % 60);
    return `${h}h ${m}m ${s}s`;
}

// ===============================
// Core
// ===============================
function gainCurrency() {
    let gain = 1 + game.upgrades.doubler;
    game.currency += gain;
    updateUI();
}

function buyProducer(id) {
    let cost = Math.pow(10, id + 1) * (game.producers[id] + 1);
    if (game.currency >= cost) {
        game.currency -= cost;
        game.producers[id]++;
        updateUI();
    }
}

function producerGain() {
    for (let i = 0; i < game.producers.length; i++) {
        game.currency += game.producers[i] * (i + 1);
    }
}

// ===============================
// Prestige
// ===============================
function prestigeMultiplier() {
    let multRaw = (game.prestige.points / 256) * 3;
    let mult = Math.round(multRaw);
    if (mult < 1) mult = 1;
    return Math.pow(mult, 0.8);
}

function prestige() {
    if (game.currency >= 200000) {
        let base = Math.pow(game.currency / 4, 0.9);
        if (game.upgrades.formulaBoost) base /= (1.5 * 1.5);

        let gain = Math.floor(base * prestigeMultiplier());

        if (gain > 0) {
            game.currency = 0;
            game.producers = [0, 0, 0, 0, 0];
            game.upgrades.doubler = 0;
            game.prestige.points += gain;
            game.prestige.bestGain = Math.max(game.prestige.bestGain, gain);
        }
        updateUI();
    }
}

// ===============================
// Dark Mode
// ===============================
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

// ===============================
// Debuggo
// ===============================
function debugTriple() {
    game.currency *= 3;
    updateUI();
}

function toggleTickspeed() {
    if (tickRate === 1000) tickRate = 1;
    else tickRate = 1000;
    clearInterval(gameLoop);
    gameLoop = setInterval(tick, tickRate);
    updateUI();
}

// ===============================
// Tabs
// ===============================
function showTab(tab) {
    let tabs = document.querySelectorAll(".tab");
    tabs.forEach(t => t.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
}

// ===============================
// Save / Load
// ===============================
function saveGame() {
    localStorage.setItem("idlerSave", JSON.stringify(game));
}

function loadGame() {
    let save = localStorage.getItem("idlerSave");
    if (save) {
        game = JSON.parse(save);
    }
    updateUI();
}

function hardReset() {
    if (confirm("Are you sure? This will delete all progress.")) {
        game = {
            currency: 0,
            producers: [0, 0, 0, 0, 0],
            prestige: {
                points: 0,
                bestGain: 0,
            },
            upgrades: {
                formulaBoost: false,
                doubler: 0,
            },
            playtime: 0,
        };
        updateUI();
        saveGame();
    }
}

function exportSave() {
    let data = btoa(JSON.stringify(game));
    prompt("Copy your save:", data);
}

function importSave() {
    let data = prompt("Paste your save:");
    if (data) {
        try {
            game = JSON.parse(atob(data));
            updateUI();
            saveGame();
        } catch (e) {
            alert("Invalid save!");
        }
    }
}

// ===============================
// Tick
// ===============================
function tick() {
    producerGain();
    game.playtime++;
    updateUI();
}

// ===============================
// UI
// ===============================
function updateUI() {
    document.getElementById("currencyDisplay").textContent = `Currency: ${format(game.currency)}`;
    document.getElementById("pcDisplay").textContent = `Prestige Currency: ${format(game.prestige.points)}`;
    document.getElementById("prestigeMultDisplay").textContent =
        `Prestige Multiplier: ${format(prestigeMultiplier())}×`;
    document.getElementById("debugInfo").innerHTML = `
        <p>Tickspeed: ${tickRate}ms</p>
        <p>Playtime: ${formatTime(game.playtime)}</p>
        <p>Best Prestige Gain: ${format(game.prestige.bestGain)}</p>
    `;
}

// ===============================
// Info Toggle
// ===============================
function toggleMultInfo() {
    let el = document.getElementById("multInfo");
    el.style.display = (el.style.display === "block") ? "none" : "block";
}

// ===============================
// Init
// ===============================
window.onload = () => {
    loadGame();
    gameLoop = setInterval(tick, tickRate);
};
