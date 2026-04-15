/**
 * TORCH — AI Opponent
 * Ported from torch_sim.py. Three difficulty tiers.
 */

import { isRunType, checkOffensiveBadgeCombo } from './badgeCombos.js';
import { traitSynergy, heatPenalty } from './personnelSystem.js';

// Team archetype play-type multipliers — applied to all difficulty levels.
// Mirrors the scheme lean of each Ember Eight playbook.
var TEAM_AI_BIAS = {
  sentinels:   { RUN: 2.8, SHORT: 1.5, DEEP: 0.8, QUICK: 0.8, SCREEN: 0.5 },  // Smashmouth
  wolves:      { RUN: 1.0, SHORT: 1.5, DEEP: 2.5, QUICK: 1.5, SCREEN: 1.0 },  // Vertical pass
  stags:       { RUN: 2.2, SHORT: 1.5, DEEP: 1.0, QUICK: 1.5, SCREEN: 0.8 },  // Spread option
  serpents:    { RUN: 3.5, SHORT: 0.8, DEEP: 0.8, QUICK: 0.5, SCREEN: 0.4 },  // Triple option
  pronghorns:  { RUN: 2.2, SHORT: 1.5, DEEP: 1.2, QUICK: 1.5, SCREEN: 0.8 },  // Power spread
  salamanders: { RUN: 0.4, SHORT: 1.8, DEEP: 2.0, QUICK: 2.8, SCREEN: 1.5 },  // Air raid
  maples:      { RUN: 1.5, SHORT: 2.2, DEEP: 1.3, QUICK: 1.8, SCREEN: 1.2 },  // Multiple
  raccoons:    { RUN: 1.5, SHORT: 1.5, DEEP: 1.8, QUICK: 2.2, SCREEN: 1.5 },  // Veer & Shoot
};

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
      // Weight by team archetype so each team feels distinct even on Easy
      const weights = filtered.map(p => {
        let w = 1.0;
        if (situation.teamId) {
          var bias = TEAM_AI_BIAS[situation.teamId];
          if (bias && bias[p.playType]) w *= bias[p.playType];
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
      // Team identity bias
      if (situation.teamId) {
        var bias = TEAM_AI_BIAS[situation.teamId];
        if (bias && bias[p.playType]) w *= bias[p.playType];
      }
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

export function aiSelectPlayer(roster, play, difficulty, isOffense, heatMap) {
  // Filter out OL/DL — linemen don't carry, catch, or cover
  let available = roster.slice(0, 4).filter(p => !p.injured && p.pos !== 'OL' && p.pos !== 'DL');
  if (available.length === 0) {
    available = roster.filter(p => !p.injured && p.pos !== 'OL' && p.pos !== 'DL');
  }
  if (available.length === 0) {
    // Last resort: use anyone available (shouldn't happen with 7-player rosters)
    available = roster.filter(p => !p.injured);
  }
  if (available.length === 0) return roster.find(p => !p.injured) || roster[0]; // prefer non-injured

  // Easy: random
  if (difficulty === 'EASY' || difficulty === 'RANDOM') {
    return available[Math.floor(Math.random() * available.length)];
  }

  // Score all available players by trait synergy + stars - heat penalty
  var scored = available.map(function(p) {
    var score = scorePlayer(p, play, isOffense);
    // On Hard, factor in heat to encourage rotation
    if (difficulty === 'HARD' && heatMap && p.id) {
      score += heatPenalty(heatMap[p.id] || 0); // -1 to -3 for hot players
    }
    return { player: p, score: score };
  });
  scored.sort(function(a, b) { return b.score - a.score; });

  // Medium: picks from top 2 (70% of the time), random otherwise
  if (difficulty === 'MEDIUM') {
    if (Math.random() < 0.7) {
      var top2 = scored.slice(0, Math.min(2, scored.length));
      return top2[Math.floor(Math.random() * top2.length)].player;
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  // Hard: optimal with heat awareness (naturally rotates players)
  return scored[0].player;
}

/**
 * AI decides which Torch Card to buy from a shop offer.
 * @param {object[]} offers - 3 card offers
 * @param {number} points - AI's current TORCH points
 * @param {string[]} inventory - Current AI inventory (IDs)
 * @param {'EASY'|'MEDIUM'|'HARD'} difficulty
 * @returns {object|null} The card to buy, or null to pass
 */
export function aiBuyTorchCard(offers, points, inventory, difficulty) {
  if (difficulty === 'EASY' || difficulty === 'RANDOM') return null;
  if (inventory.length >= 3) return null;

  // Filter affordable
  var affordable = offers.filter(function(c) { return c.cost <= points; });
  if (affordable.length === 0) return null;

  // Medium: 50% chance to buy the cheapest affordable card if it's Bronze/Silver
  if (difficulty === 'MEDIUM') {
    if (Math.random() < 0.5) {
      affordable.sort(function(a, b) { return a.cost - b.cost; });
      return affordable[0];
    }
    return null;
  }

  // Hard: 80% chance to buy the "best" card based on situational value
  if (difficulty === 'HARD') {
    if (Math.random() < 0.2) return null; // 20% pass to save points

    // Value mapping for AI priorities
    var tierValue = { GOLD: 100, SILVER: 50, BRONZE: 20 };
    // Base value mapping for AI priorities (ensures every card has a score)
    var specificValue = {
      'sure_hands': 150, 'house_call': 140, 'scout_team': 130,
      'deep_shot': 80, 'truck_stick': 80, 'prime_time': 70,
      'blocked_kick': 90, 'challenge_flag': 85,
      'timeout': 60, 'scout_report': 50, 'pre_snap_read': 45,
      'ice_the_kicker': 40, 'cannon_leg': 35, 'ringer': 30,
      'play_action': 25, 'scramble_drill': 20, 'twelfth_man': 40,
      'ice': 45, 'personnel_report': 30, 'fresh_legs': 15,
      'game_plan': 15, 'coffin_corner': 25, 'fair_catch_ghost': 20,
      'iron_man': 20
    };

    var scored = affordable.map(function(c) {
      var score = tierValue[c.tier] || 0;
      // Use mapped value or a default of 10 if missing
      score += (specificValue[c.id] || 10);
      // Randomize slightly so they don't always pick the same card
      score *= (0.8 + Math.random() * 0.4);
      return { card: c, score: score };
    });

    scored.sort(function(a, b) { return b.score - a.score; });
    return scored[0].card;
  }

  return null;
}
