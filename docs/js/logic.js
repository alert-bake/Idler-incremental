// =========================
// GAME STATE
// =========================
let game = {
    currency: 0,
    prestigePoints: 0,
    bestPrestigeGain: 0,
    playtime: 0,
    producers: [
        { name: "Worker", amount: 0, baseCost: 10, cost: 10, cps: 0.1 },
        { name: "Factory", amount: 0, baseCost: 100, cost: 100, cps: 2 },
        { name: "Robot", amount: 0, baseCost: 1000, cost: 1000, cps: 15 }
    ],
    achievements: [],
    prestigeUpgrades: [],
    tickspeed: 1000,
    debugFast: false,
};

// =========================
// MAIN GAME LOOP
// =========================
function gameLoop(diff) {
    // Currency gain
    let gain = 0;
    game.producers.forEach(p => {
        gain += p.amount * p.cps * (diff / 1000);
    });
    game.currency += gain;

    // Playtime
    game.playtime += diff / 1000;

    // Update rendering
    renderCurrency();
    renderProducers();
    renderStats();
    renderAchievements();
    renderPrestige();
}

// =========================
// BUTTON ACTIONS
// =========================
function gainCurrency() {
    game.currency++;
    renderCurrency();
}

function buyProducer(i) {
    let p = game.producers[i];
    if (game.currency >= p.cost) {
        game.currency -= p.cost;
        p.amount++;
        p.cost = Math.floor(p.baseCost * Math.pow(1.15, p.amount));
        renderProducers();
        renderCurrency();
    }
}

function prestige() {
    let gain = calculatePrestigeGain();
    if (gain > 0) {
        game.currency = 0;
        game.producers.forEach(p => { p.amount = 0; p.cost = p.baseCost; });
        game.prestigePoints += gain;
        if (gain > game.bestPrestigeGain) game.bestPrestigeGain = gain;
    }
    renderPrestige();
    renderCurrency();
    renderProducers();
}
