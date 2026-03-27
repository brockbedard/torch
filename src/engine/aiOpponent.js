/**
 * TORCH — AI Opponent
 * Ported from torch_sim.py. Three difficulty tiers.
 */

import { isRunType, checkOffensiveBadgeCombo } from './badgeCombos.js';
import { traitSynergy } from './personnelSystem.js';

/**
 * Weighted random selection from an array using weights.
 * @param {any[]} items
 * @param {number[]} weights
 * @returns {any}
 */
function weightedChoice(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * AI selects a play card.
 * @param {object[]} hand - Available play cards
 * @param {'offense'|'defense'} playType
 * @param {'EASY'|'MEDIUM'|'HARD'} difficulty
 * @param {object} situation - { down, distance, ballPos, playHistory, scoreDiff }
 * @returns {object} Selected play card
 */
export function aiSelectPlay(hand, playType, difficulty, situation) {
  const { down, distance, ballPos, playHistory } = situation;
  const available = [...hand];

  if (difficulty === 'RANDOM') {
    return available[Math.floor(Math.random() * available.length)];
  }

  if (playType === 'offense') {
    // Filter by situation — ALL levels use basic football sense
    let filtered = available.filter(p => {
      if ((p.id === 'qb_sneak' || p.id === 'ir_qb_sneak') && distance > 2) return false;
      if (p.playType === 'DEEP' && distance <= 2 && down >= 3) return false;
      if (p.neverInsideOwn && ballPos <= p.neverInsideOwn) return false;
      return true;
    });

    if (filtered.length === 0) filtered = available;

    if (difficulty === 'EASY') {
      // v0.23: Not purely random anymore. Weight slightly towards team archetype
      // so 'Wolves' (run heavy) actually run the ball even on Easy.
      const weights = filtered.map(p => {
        let w = 1.0;
        // If team is Coral Bay (Wolves), favor OPTION and RUN
        if (situation.teamId === 'wolves') {
          if (p.cat === 'OPTION' || p.playType === 'RUN') w *= 2.0;
          if (p.playType === 'DEEP') w *= 0.5;
        }
        return w;
      });
      return weightedChoice(filtered, weights);
    }

    // Medium/Hard: weight by situation
    const weights = filtered.map(p => {
      let w = 1.0;
      if (isRunType(p.playType) && distance <= 3) w *= 2.0;
      if (p.playType === 'DEEP' && distance >= 8) w *= 1.5;
      if (p.id === 'pa_flat' || p.id === 'pa_post') {
        const recentRuns = (playHistory || []).slice(-3).filter(pt => isRunType(pt)).length;
        if (recentRuns >= 2) w *= 2.5;
      }
      if (p.playType === 'SCREEN' && down >= 3 && distance >= 8) w *= 0.5;
      return w;
    });

    return weightedChoice(filtered, weights);
  }

  // Defense
  if (difficulty === 'EASY') {
    return available[Math.floor(Math.random() * available.length)];
  }

  const weights = available.map(p => {
    let w = 1.0;
    if (distance <= 3 && p.runDefMod < -1) w *= 2.0;
    if (distance >= 8 && p.cardType === 'BLITZ') w *= 1.5;
    if (down >= 3 && distance >= 5) {
      w *= 1.0 + (p.sackRateBonus > 0.03 ? 0.5 : 0);
    }
    return w;
  });

  return weightedChoice(available, weights);
}

/**
 * AI selects a featured player.
 * @param {object[]} roster - Player roster (first 4 are starters)
 * @param {object} play - Selected play card
 * @param {'EASY'|'MEDIUM'|'HARD'} difficulty
 * @param {boolean} isOffense
 * @returns {object} Selected player
 */
// Play group mapping (same as personnelSystem.js)
var AI_PLAY_GROUPS = { DEEP: 'DEEP_PASS', SHORT: 'SHORT_PASS', QUICK: 'SHORT_PASS', SCREEN: 'SCREEN', RUN: 'POWER_RUN', OPTION: 'OUTSIDE_RUN', PLAY_ACTION: 'PLAY_ACTION' };
var AI_COV_GROUPS = { BLITZ: 'BLITZ', PRESSURE: 'MAN', ZONE: 'ZONE', HYBRID: 'ZONE' };

function scorePlayer(p, play, isOffense) {
  var playGroup = AI_PLAY_GROUPS[play.playType || (play.isRun ? 'RUN' : 'SHORT')] || 'SHORT_PASS';
  var covGroup = AI_COV_GROUPS[play.cardType] || 'ZONE';
  // Trait synergy score
  var syn = traitSynergy(p, playGroup, !isOffense, covGroup);
  // Star rating bonus (higher stars = better)
  var starScore = (p.stars || 3) * 0.5;
  return syn + starScore;
}

export function aiSelectPlayer(roster, play, difficulty, isOffense) {
  let available = roster.slice(0, 4).filter(p => !p.injured);
  if (available.length === 0) {
    available = roster.filter(p => !p.injured);
  }
  if (available.length === 0) return roster[0]; // fallback

  // Easy: random
  if (difficulty === 'EASY' || difficulty === 'RANDOM') {
    return available[Math.floor(Math.random() * available.length)];
  }

  // Score all available players by trait synergy + stars
  var scored = available.map(function(p) { return { player: p, score: scorePlayer(p, play, isOffense) }; });
  scored.sort(function(a, b) { return b.score - a.score; });

  // Medium: picks from top 2 (70% of the time), random otherwise
  if (difficulty === 'MEDIUM') {
    if (Math.random() < 0.7) {
      var top2 = scored.slice(0, Math.min(2, scored.length));
      return top2[Math.floor(Math.random() * top2.length)].player;
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  // Hard: always optimal
  return scored[0].player;
}
