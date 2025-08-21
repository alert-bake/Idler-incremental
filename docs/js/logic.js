// ==========================
// Logic.js
// Game State + Save/Load
// ==========================

let game = {
    currency: 0,
    prestigeCurrency: 0,
    producers: [],
    upgrades: [],
    achievements: [],
    stats: {
        playtime: 0,
        bestCurrency: 0,
        bestPrestige: 0,
    }
};

// Initialize Game
function initGame() {
    loadGame();
    renderAll();
    setInterval(gameLoop, 1000 / 20); // 20 ticks per second
    setInterval(saveGame, 10000); // save every 10s
}

// Main loop
function gameLoop() {
    tickGame();
    renderAll();
    game.stats.playtime++;
}

// Save & Load
function saveGame() {
    localStorage.setItem("idlerSave", JSON.stringify(game));
}

function loadGame() {
    let save = localStorage.getItem("idlerSave");
    if (save) {
        game = JSON.parse(save);
    }
}
