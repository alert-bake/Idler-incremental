// =============================
// tickspeed.js - Game Loop
// =============================

function gameTick(diff) {
    let production = 0;
    for (let p of game.producers) {
        production += p.amount * p.production;
    }

    game.currency += production * diff;
    game.stats.totalProduced += production * diff;

    // bests
    if (game.currency > game.stats.bestCurrency)
        game.stats.bestCurrency = game.currency;
    if (game.prestigeCurrency > game.stats.bestPrestige)
        game.stats.bestPrestige = game.prestigeCurrency;

    game.stats.playtime += diff;

    render();
}

function mainLoop() {
    let now = Date.now();
    let diff = (now - game.lastTick) / 1000 * game.settings.tickspeed;
    game.lastTick = now;
    gameTick(diff);
}

// Offline progress with 15% decay every 10h → 40% cap
function doOfflineProgress() {
    let now = Date.now();
    let diff = (now - game.lastTick) / 1000;
    if (diff < 10) return;

    let hours = diff / 3600;
    let decaySteps = Math.floor(hours / 10);
    let factor = Math.pow(0.85, decaySteps);
    if (factor < 0.4) factor = 0.4;

    let effective = diff * factor;
    gameTick(effective);
    game.lastTick = now;
}

setInterval(mainLoop, 100);
