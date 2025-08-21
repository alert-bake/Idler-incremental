// =============================
// logic.js - Game State & Core
// =============================

// Global game object
let game = {
    currency: 0,
    prestigeCurrency: 0,
    totalPrestige: 0,
    producers: [
        { name: "Worker", baseCost: 10, costMult: 1.15, amount: 0, production: 1 },
        { name: "Factory", baseCost: 1e3, costMult: 1.18, amount: 0, production: 50 },
        { name: "Robot", baseCost: 1e5, costMult: 1.2, amount: 0, production: 5000 },
        { name: "Lab", baseCost: 1e7, costMult: 1.25, amount: 0, production: 1e5 },
        { name: "AI Core", baseCost: 1e9, costMult: 1.3, amount: 0, production: 5e6 }
    ],
    upgrades: [],
    achievements: [],
    milestones: [],
    stats: {
        playtime: 0,
        bestCurrency: 0,
        bestPrestige: 0,
        totalProduced: 0
    },
    settings: {
        tickspeed: 1,
        offlineProgress: true
    },
    lastTick: Date.now()
};

// Buy producer
function buyProducer(i) {
    let p = game.producers[i];
    let cost = p.baseCost * Math.pow(p.costMult, p.amount);
    if (game.currency >= cost) {
        game.currency -= cost;
        p.amount++;
        render();
    }
}

// Prestige reset
function doPrestige() {
    let gain = getPrestigeGain();
    if (gain > 0) {
        game.prestigeCurrency += gain;
        game.totalPrestige += gain;
        // reset everything but prestige
        game.currency = 0;
        for (let p of game.producers) p.amount = 0;
        render();
    }
}
