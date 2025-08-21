// =============================
// formula.js - Math & Balancing
// =============================

// Prestige gain formula
function getPrestigeGain() {
    let base = Math.pow(game.currency % 20, 0.7) / 2; // formula from v1.2
    if (isNaN(base) || base < 1) return 0;

    // prestige multiplier from milestones
    let multi = getPrestigeMulti();
    return Math.floor(base * multi);
}

// Prestige multiplier
function getPrestigeMulti() {
    let pc = game.totalPrestige;
    if (pc <= 0) return 1;

    // your requested formula:
    // totalPC → halve 8 times → ×3 → round → ^0.8
    let calc = pc;
    for (let i = 0; i < 8; i++) calc /= 2;
    calc *= 3;
    calc = Math.round(calc);
    if (calc < 1) return 1;
    return Math.pow(calc, 0.8);
}
