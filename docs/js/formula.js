// ==========================
// Formula.js
// Game Math + Balancing
// ==========================

function format(num) {
    return Math.floor(num).toLocaleString();
}

// Prestige formula
function calculatePrestigeGain() {
    // Placeholder for v1.2 formula
    if (game.currency < 1e6) return 0;
    return Math.floor(Math.pow(game.currency, 0.7) / 2);
}
