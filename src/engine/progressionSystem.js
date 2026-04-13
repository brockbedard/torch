/**
 * TORCH — Progression System
 * Handles player XP, leveling, and trait unlocks.
 */

const STORAGE_KEY = 'torch_player_progression';

/**
 * Level curve: 100 XP per level (linear for now).
 */
export const XP_PER_LEVEL = 100;

/**
 * Get progression data for all players.
 */
export function getProgressionData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e) { return {}; }
}

/**
 * Calculate XP earned based on snap results.
 * @param {object} res - snap result
 */
export function calculateSnapXP(res) {
  const r = res.result;
  const xp = {
    offense: 0,
    defense: 0
  };

  // Offensive XP
  if (r.yards > 0) xp.offense += Math.floor(r.yards / 2);
  if (r.isTouchdown) xp.offense += 50;
  if (res.gotFirstDown) xp.offense += 10;

  // Defensive XP
  if (r.isSack) xp.defense += 40;
  if (r.isInterception || r.isFumbleLost) xp.defense += 60;
  if (r.yards <= 0 && !r.isIncomplete) xp.defense += 15; // TFL/Stuff
  if (r.isIncomplete) xp.defense += 10; // PBU

  return xp;
}

import { hasUpgrade } from '../data/stadiumUpgrades.js';

/**
 * Apply XP to players and check for level ups.
 * @param {string} featuredOffId 
 * @param {string} featuredDefId 
 * @param {object} result 
 */
export function processGameXP(featuredOffId, featuredDefId, result) {
  const data = getProgressionData();
  const xpMap = calculateSnapXP(result);
  const xpBonus = hasUpgrade('training_facility') ? 1.2 : 1.0;

  function apply(pid, amount) {
    if (!pid) return;
    if (!data[pid]) {
      data[pid] = { xp: 0, level: 1, traits: [] };
    }
    const p = data[pid];
    const oldLevel = p.level;
    p.xp += Math.round(amount * xpBonus);
    p.level = Math.floor(p.xp / XP_PER_LEVEL) + 1;
    
    if (p.level > oldLevel) {
      console.log(`[Progression] PLAYER ${pid} LEVELED UP to ${p.level}!`);
    }
  }

  apply(featuredOffId, xpMap.offense);
  apply(featuredDefId, xpMap.defense);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Decorate a player object with their progression data.
 */
export function decoratePlayer(player) {
  const data = getProgressionData();
  const pData = data[player.id] || { xp: 0, level: 1, traits: [] };
  return {
    ...player,
    level: pData.level,
    xp: pData.xp,
    unlockedTraits: pData.traits
  };
}
