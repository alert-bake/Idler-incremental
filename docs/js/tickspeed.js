// =====================================
// tickspeed.js — Loop, Offline, Debuggo
// =====================================

// We’ll use a time-accurate loop so producers scale with real elapsed time.
let _lastFrame = performance.now();

// Fast mode multiplier for Debuggo (1000x feels chunky without exploding)
const DEBUG_FAST_MULT = 1000;

// Main RAF loop
function _frame(now) {
  const dtMs = now - _lastFrame;    // milliseconds since last frame
  _lastFrame = now;

  // Apply debug fast multiplier (acts like "more ticks in same real time")
  const speedMult = game.debugFast ? DEBUG_FAST_MULT : 1;
  const effectiveMs = dtMs * speedMult;

  // Drive the game
  gameLoop(effectiveMs);

  // save a lightweight timestamp periodically for offline progress
  if (!_saveTick) _saveTick = 0;
  _saveTick += dtMs;
  if (_saveTick >= 5000) { // every ~5s
    _saveTick = 0;
    localStorage.setItem("idler_last_seen", String(Date.now()));
    localStorage.setItem("idler_save", JSON.stringify(game));
  }

  requestAnimationFrame(_frame);
}
let _saveTick = 0;

// Offline progress: apply on load using a decayed factor.
// Spec: every 10 hours, *0.85, floor at 0.40 total factor.
function applyOfflineProgress() {
  const last = Number(localStorage.getItem("idler_last_seen")) || Date.now();
  const now = Date.now();
  let diffSec = (now - last) / 1000;

  if (diffSec < 5) {
    // too short to matter
    return;
  }

  // decay
  const hours = diffSec / 3600;
  const steps = Math.floor(hours / 10);
  let factor = Math.pow(0.85, steps);
  if (factor < 0.40) factor = 0.40;

  const effectiveSec = diffSec * factor;

  // Run a synthetic catch-up tick in one go
  gameLoop(effectiveSec * 1000);
}

// Debuggo: toggle 1000x
function toggleTickspeed() {
  game.debugFast = !game.debugFast;
  if (typeof showNotification === "function") {
    showNotification(`Fast ticks: ${game.debugFast ? "ON (x1000)" : "OFF"}`);
  }
  if (typeof renderDebuggo === "function") renderDebuggo();
}

// Simulate "offline" on demand (for testing)
function simulateOffline(sec) {
  if (!sec || sec <= 0) return;
  // mirror the decay logic quickly
  const hours = sec / 3600;
  const steps = Math.floor(hours / 10);
  let factor = Math.pow(0.85, steps);
  if (factor < 0.40) factor = 0.40;
  const effectiveSec = sec * factor;
  gameLoop(effectiveSec * 1000);
  if (typeof showNotification === "function") {
    showNotification(`Simulated offline: ${Math.floor(sec)}s (→ ${Math.floor(effectiveSec)}s effective)`);
  }
  if (typeof renderStats === "function") renderStats();
}

// Boot
window.addEventListener("load", () => {
  // try load
  const saved = localStorage.getItem("idler_save");
  if (saved) {
    try { Object.assign(game, JSON.parse(saved)); } catch {}
  }
  applyOfflineProgress();

  // Start loop
  _lastFrame = performance.now();
  requestAnimationFrame(_frame);
});
