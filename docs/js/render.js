// ==========================
// Render.js
// UI + Tabs + Notifications
// ==========================

function renderAll() {
    document.getElementById("currency-display").innerText = "Currency: " + format(game.currency);
    document.getElementById("pc-display").innerText = "Prestigious Currency: " + format(game.prestigeCurrency);
}

// Tabs
function showTab(id) {
    let tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => tab.style.display = "none");
    document.getElementById(id).style.display = "block";
}

// Notifications
function notify(msg) {
    let notif = document.getElementById("notification");
    notif.innerText = msg;
    notif.style.display = "block";
    setTimeout(() => { notif.style.display = "none"; }, 3000);
}
