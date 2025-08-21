// =============================
// render.js - UI Rendering
// =============================

function render() {
    // Header
    document.getElementById("currency").innerText =
        "Currency: " + format(game.currency);
    document.getElementById("prestigeCurrency").innerText =
        "Prestigious Currency: " + format(game.prestigeCurrency);

    // Producers
    let prodDiv = document.getElementById("producers");
    prodDiv.innerHTML = "";
    game.producers.forEach((p, i) => {
        let cost = p.baseCost * Math.pow(p.costMult, p.amount);
        let btn = document.createElement("button");
        btn.innerText = `${p.name} (${p.amount}) - Cost: ${format(cost)}`;
        btn.onclick = () => buyProducer(i);
        prodDiv.appendChild(btn);
    });

    // Stats
    let statsDiv = document.getElementById("stats");
    statsDiv.innerHTML =
        `Playtime: ${formatTime(game.stats.playtime)}<br>` +
        `Best Currency: ${format(game.stats.bestCurrency)}<br>` +
        `Best Prestige: ${format(game.stats.bestPrestige)}<br>` +
        `Total Produced: ${format(game.stats.totalProduced)}`;

    // Prestige Visualizer
    let pv = document.getElementById("prestigeVisualizer");
    let multi = getPrestigeMulti();
    pv.innerText = `Prestige Multi: x${format(multi)} (tap for info)`;
    pv.onclick = () => {
        alert("Prestige Multi boosts prestige count per reset.");
    };
}

// Helpers
function format(num) {
    if (num < 1e6) return num.toFixed(2);
    return num.toExponential(2);
}

function formatTime(seconds) {
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
    }
