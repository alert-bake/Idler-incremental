// ==========================
// Tickspeed.js
// Tick system + debug speed
// ==========================

let tickSpeed = 1; // multiplier for debug/testing

function tickGame() {
    // Currency gain from producers
    let totalGain = 0;
    for (let p of game.producers) {
        totalGain += p.amount * p.power;
    }
    game.currency += totalGain * tickSpeed;
}

// Debug toggle
function setTickSpeed(mult) {
    tickSpeed = mult;
    notify("Tick speed set to x" + mult);
}
