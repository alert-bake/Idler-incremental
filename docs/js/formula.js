// =============================
// formula.js — Prestige & Math
// =============================

// --- Prestige Gain ---
// Spec: gain = (currency % 20) ^ 0.7 / 2
// If a "formulaBoost" prestige upgrade exists, remove the %20 part
// (i.e., gain = currency ^ 0.7 / 2).
function calculatePrestigeGain() {
  const c = Number(game.currency) || 0;
  if (c <= 0) return 0;

  const hasBoost = hasPrestigeUpgrade("formulaBoost");
  const base = hasBoost ? Math.pow(c, 0.7) / 2 : Math.pow(c % 20, 0.7) / 2;

  // Multiply by the prestige-count multiplier (rounded behaviour baked in there)
  const multi = calculatePrestigeMultiplier();

  // Floor to whole points
  const gain = Math.floor(base * multi);
  return isFinite(gain) && gain > 0 ? gain : 0;
}

// --- Prestige Multiplier (a.k.a. "prestiges per prestige") ---
// Spec: totalPC -> half 8 times -> *3 -> round -> ^0.8 ; min 1x
function calculatePrestigeMultiplier() {
  let pc = Number(game.prestigePoints) || 0;
  if (pc <= 0) return 1;

  // halve 8 times
  for (let i = 0; i < 8; i++) pc /= 2;

  pc *= 3;
  pc = Math.round(pc);

  if (pc < 1) return 1;
  const mult = Math.pow(pc, 0.8);
  return isFinite(mult) && mult > 0 ? mult : 1;
}

// --- Helper: prestige upgrade check ---
// You can store prestige upgrades either as strings ["formulaBoost"] or objects [{key:"formulaBoost", bought:true}]
function hasPrestigeUpgrade(key) {
  if (!game.prestigeUpgrades) return false;
  // string style
  if (game.prestigeUpgrades.includes && game.prestigeUpgrades.includes(key)) return true;
  // object style
  if (Array.isArray(game.prestigeUpgrades)) {
    return game.prestigeUpgrades.some(u => (u && (u.key === key && (u.bought ?? true))));
  }
  return false;
      }
