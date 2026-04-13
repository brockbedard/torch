/**
 * TORCH — Personnel System (Phase B)
 * Four layers that modify snap resolution based on player stars, traits, and matchups.
 * Inserted into snapResolver pipeline after OVR, before red zone compression.
 *
 * Layer 1: Team baseline — average star contribution weighted by position relevance
 * Layer 2: Trait synergy — featured player's trait vs play type
 * Layer 3: Heat penalty — repeated featuring of same player
 * Layer 4: Direct matchup — when both featured players interact on the play
 */

// ── PLAY GROUP MAPPING ──
// Maps offensive playType to a group for relevance/synergy lookups
var PLAY_GROUPS = {
  DEEP: 'DEEP_PASS',
  SHORT: 'SHORT_PASS',
  QUICK: 'SHORT_PASS',
  SCREEN: 'SCREEN',
  RUN: 'POWER_RUN',
  OPTION: 'OUTSIDE_RUN',
  PLAY_ACTION: 'PLAY_ACTION',
};

// Maps defensive cardType to a coverage group
var COVERAGE_GROUPS = {
  BLITZ: 'BLITZ',
  PRESSURE: 'MAN',
  ZONE: 'ZONE',
  HYBRID: 'ZONE',
};

// ── LAYER 1: TEAM BASELINE ──
// Position relevance: how much each position matters for a given play group
var RELEVANCE = {
  DEEP_PASS:   { QB: 1.0, RB: 0, WR: 1.0, TE: 0.5, OL: 0.3, DL: 0.5, LB: 0.3, CB: 1.0, S: 1.0 },
  SHORT_PASS:  { QB: 0.7, RB: 0.3, WR: 1.0, TE: 1.0, OL: 0.2, DL: 0.3, LB: 0.7, CB: 1.0, S: 0.3 },
  SCREEN:      { QB: 0.2, RB: 1.0, WR: 0.5, TE: 0.5, OL: 1.0, DL: 0.3, LB: 1.0, CB: 0.5, S: 0.2 },
  POWER_RUN:   { QB: 0.1, RB: 1.0, WR: 0.1, TE: 0.5, OL: 1.0, DL: 0.8, LB: 1.0, CB: 0.1, S: 0.3 },
  OUTSIDE_RUN: { QB: 0.5, RB: 1.0, WR: 0.3, TE: 0.7, OL: 0.5, DL: 0.5, LB: 0.7, CB: 0.3, S: 0.3 },
  PLAY_ACTION: { QB: 1.0, RB: 0.7, WR: 1.0, TE: 0.5, OL: 0.7, DL: 0.3, LB: 1.0, CB: 0.7, S: 0.5 },
};

/**
 * Calculate team baseline modifier from average weighted star rating.
 * 3 stars = no modifier (baseline). Each star above/below = ±0.5 yards.
 */
export function teamBaseline(players, playGroup) {
  var weights = RELEVANCE[playGroup] || RELEVANCE.SHORT_PASS;
  var weightedSum = 0;
  var totalWeight = 0;

  for (var i = 0; i < players.length; i++) {
    var p = players[i];
    var w = weights[p.pos] || 0;
    if (w > 0) {
      weightedSum += (p.stars || 3) * w;
      totalWeight += w;
    }
  }

  if (totalWeight === 0) return 0;
  var avgStars = weightedSum / totalWeight;
  return (avgStars - 3) * 0.5;
}

// ── LAYER 2: TRAIT SYNERGY ──
var TRAIT_SYNERGY = {
  // Offensive traits → play group → bonus yards
  'DEEP BALL':       { DEEP_PASS: 3, SHORT_PASS: 1, PLAY_ACTION: 2 },
  'QUICK RELEASE':   { SHORT_PASS: 3, SCREEN: 2, PLAY_ACTION: 1 },
  'ESCAPE ARTIST':   { OUTSIDE_RUN: 3, DEEP_PASS: 1 },
  'PLAY ACTION PRO': { PLAY_ACTION: 5, DEEP_PASS: 2, SHORT_PASS: 1 },

  'TRUCK STICK':     { POWER_RUN: 4, OUTSIDE_RUN: 1 },
  'ELUSIVE':         { OUTSIDE_RUN: 4, SCREEN: 2 },
  'POWER BACK':      { POWER_RUN: 3, OUTSIDE_RUN: 1 },
  'PASS CATCHER':    { SCREEN: 3, SHORT_PASS: 2 },

  'BURNER':          { DEEP_PASS: 4, OUTSIDE_RUN: 1 },
  'ROUTE IQ':        { SHORT_PASS: 4, DEEP_PASS: 1 },
  'SURE HANDS':      { SHORT_PASS: 3, SCREEN: 2, DEEP_PASS: 1 },
  'CONTESTED CATCH': { DEEP_PASS: 3, SHORT_PASS: 1 },
  'YAC BEAST':       { SCREEN: 4, SHORT_PASS: 2 },

  'MISMATCH':        { SHORT_PASS: 3, DEEP_PASS: 2 },
  'ROAD GRADER':     { POWER_RUN: 3, OUTSIDE_RUN: 2, SCREEN: 2 },
  'BRICK WALL':      { DEEP_PASS: 2, SCREEN: 3 },
  'ANCHOR':          { POWER_RUN: 2, DEEP_PASS: 1 },

  // Defensive traits → coverage group → bonus (reduces opponent yards)
  'PASS RUSHER':     { BLITZ: 4, MAN: 1 },
  'RUN STUFFER':     { POWER_RUN: 4, OUTSIDE_RUN: 2 },
  'EDGE SPEED':      { BLITZ: 3, MAN: 1 },
  'INTERIOR BULL':   { BLITZ: 2, POWER_RUN: 3 },

  'TACKLER':         { POWER_RUN: 3, ZONE: 1, OUTSIDE_RUN: 2 },
  'BLITZ SPECIALIST':{ BLITZ: 4 },
  'COVERAGE LB':     { ZONE: 3, MAN: 2 },

  'SHUTDOWN':        { MAN: 4, ZONE: 1 },
  'BALL HAWK':       { ZONE: 3, MAN: 1 },
  'PRESS CORNER':    { MAN: 3, BLITZ: 1 },
  'ZONE READER':     { ZONE: 4, MAN: 1 },

  'ENFORCER':        { POWER_RUN: 3, MAN: 1 },
  'CENTERFIELDER':   { ZONE: 4 },
  'RUN SUPPORT':     { POWER_RUN: 3, OUTSIDE_RUN: 2 },
};

// Anti-synergy: negative values for clearly wrong position picks
var ANTI_SYNERGY = {
  QB:  { POWER_RUN: -2, OUTSIDE_RUN: -1 },
  WR:  { POWER_RUN: -1 },
  OL:  { DEEP_PASS: -1, SHORT_PASS: -1 },
  RB:  { DEEP_PASS: -1 },
};

/**
 * Calculate trait synergy bonus for featured player vs play type.
 * Positive = good match (offense) or good counter (defense).
 */
export function traitSynergy(player, playGroup, isDefense, coverageGroup) {
  if (!player || !player.trait) return 0;

  var group = isDefense ? coverageGroup : playGroup;
  var synergyTable = TRAIT_SYNERGY[player.trait];
  if (!synergyTable) return 0;

  var bonus = synergyTable[group] || 0;

  // Scale by position relevance — high relevance = full bonus, low = half
  var relWeights = RELEVANCE[playGroup];
  var relevance = relWeights ? (relWeights[player.pos] || 0) : 0;

  if (relevance === 0 && !isDefense) {
    // Anti-synergy: wrong position for this play type
    var anti = ANTI_SYNERGY[player.pos];
    return anti ? (anti[playGroup] || 0) : 0;
  }

  var scale = relevance >= 0.7 ? 1.0 : relevance >= 0.3 ? 0.5 : 0.25;
  return bonus * scale;
}

// ── LAYER 3: HEAT PENALTY ──
/**
 * Calculate heat penalty for a repeatedly featured player.
 * Heat accumulates per snap featured, decays when not featured.
 * @param {number} heat - Current heat level (0+)
 * @returns {number} Yard penalty (negative)
 */
export function heatPenalty(heat) {
  if (heat <= 2) return 0;
  if (heat === 3) return -1;
  if (heat === 4) return -2;
  return -3; // 5+
}

/**
 * Update heat map after a snap.
 * Featured player heats up, everyone else cools down.
 */
export function updateHeat(featuredId, allPlayerIds, heatMap) {
  for (var i = 0; i < allPlayerIds.length; i++) {
    var id = allPlayerIds[i];
    if (id === featuredId) {
      heatMap[id] = (heatMap[id] || 0) + 1;
    } else {
      heatMap[id] = Math.max(0, (heatMap[id] || 0) - 1);
    }
  }
}

// ── LAYER 4: DIRECT MATCHUP ──
// Trait-vs-trait interactions (offense trait → defense trait → modifier)
var TRAIT_MATCHUP = {
  'BURNER':       { 'SHUTDOWN': -2, 'PRESS CORNER': 2, 'ZONE READER': 1 },
  'ROUTE IQ':     { 'PRESS CORNER': 2, 'SHUTDOWN': -1, 'ZONE READER': -1 },
  'TRUCK STICK':  { 'TACKLER': -1, 'RUN STUFFER': -2, 'ENFORCER': 0 },
  'ELUSIVE':      { 'TACKLER': 2, 'ENFORCER': -1, 'RUN STUFFER': 1 },
  'ESCAPE ARTIST':{ 'PASS RUSHER': 1, 'EDGE SPEED': -1, 'INTERIOR BULL': 2 },
  'SURE HANDS':   { 'BALL HAWK': -1, 'PRESS CORNER': 1 },
  'CONTESTED CATCH':{ 'SHUTDOWN': 1, 'BALL HAWK': -1, 'PRESS CORNER': 0 },
  'YAC BEAST':    { 'TACKLER': -1, 'ENFORCER': -2, 'COVERAGE LB': 1 },
  'POWER BACK':   { 'RUN STUFFER': -2, 'TACKLER': -1, 'ENFORCER': 0 },
  'MISMATCH':     { 'COVERAGE LB': 2, 'SHUTDOWN': -1, 'ZONE READER': 1 },
};

/**
 * Calculate direct matchup modifier when both featured positions interact.
 * Only fires when both positions have relevance to the play.
 */
export function directMatchup(offPlayer, defPlayer, playGroup) {
  if (!offPlayer || !defPlayer) return { total: 0, starMod: 0, traitMod: 0 };

  var relWeights = RELEVANCE[playGroup];
  if (!relWeights) return { total: 0, starMod: 0, traitMod: 0 };

  var offRel = relWeights[offPlayer.pos] || 0;
  var defRel = relWeights[defPlayer.pos] || 0;

  // Only clash when both are relevant
  if (offRel < 0.3 || defRel < 0.3) return { total: 0, starMod: 0, traitMod: 0 };

  // Star difference
  var starDiff = (offPlayer.stars || 3) - (defPlayer.stars || 3);
  var starMod = starDiff * 0.4;

  // Trait-vs-trait
  var traitMod = 0;
  if (offPlayer.trait && defPlayer.trait) {
    var matchups = TRAIT_MATCHUP[offPlayer.trait];
    if (matchups) traitMod = matchups[defPlayer.trait] || 0;
  }

  return {
    total: starMod + traitMod,
    starMod: starMod,
    traitMod: traitMod
  };
}

// ── COMBINED: Apply all 4 layers ──
/**
 * Calculate the total personnel modifier for a snap.
 * @param {object} opts
 * @param {object} opts.featuredOff - Featured offensive player
 * @param {object} opts.featuredDef - Featured defensive player
 * @param {Array} opts.offPlayers - Full offensive roster (7)
 * @param {Array} opts.defPlayers - Full defensive roster (7)
 * @param {string} opts.offPlayType - Offensive play type (DEEP, SHORT, RUN, etc.)
 * @param {string} opts.defCardType - Defensive card type (BLITZ, ZONE, etc.)
 * @param {object} opts.offHeatMap - { playerId: heatLevel }
 * @param {object} opts.defHeatMap - { playerId: heatLevel }
 * @returns {{ totalMod: number, breakdown: object }}
 */
export function calculatePersonnelMod(opts) {
  var playGroup = PLAY_GROUPS[opts.offPlayType] || 'SHORT_PASS';
  var covGroup = COVERAGE_GROUPS[opts.defCardType] || 'ZONE';

  // Layer 1: Team baseline (offense - defense)
  var offBaseline = teamBaseline(opts.offPlayers || [], playGroup);
  var defBaseline = teamBaseline(opts.defPlayers || [], playGroup);
  var baselineMod = offBaseline - defBaseline;

  // Layer 2: Trait synergy (offense bonus - defense bonus)
  var offSynergy = traitSynergy(opts.featuredOff, playGroup, false, covGroup);
  var defSynergy = traitSynergy(opts.featuredDef, playGroup, true, covGroup);
  var synergyMod = offSynergy - defSynergy;

  // Layer 3: Heat penalty
  var offHeat = heatPenalty((opts.offHeatMap && opts.featuredOff) ? (opts.offHeatMap[opts.featuredOff.id] || 0) : 0);
  var defHeat = heatPenalty((opts.defHeatMap && opts.featuredDef) ? (opts.defHeatMap[opts.featuredDef.id] || 0) : 0);
  var heatMod = offHeat - defHeat;

  // Layer 4: Direct matchup
  var matchup = directMatchup(opts.featuredOff, opts.featuredDef, playGroup);
  var matchupMod = matchup.total;

  var total = baselineMod + synergyMod + heatMod + matchupMod;

  // Soft cap: personnel shouldn't swing more than ±6 yards
  total = Math.max(-6, Math.min(6, total));

  return {
    totalMod: total,
    breakdown: {
      baseline: Math.round(baselineMod * 10) / 10,
      synergy: Math.round(synergyMod * 10) / 10,
      heat: Math.round(heatMod * 10) / 10,
      matchup: Math.round(matchupMod * 10) / 10,
    },
    details: {
      offTrait: opts.featuredOff ? opts.featuredOff.trait : null,
      defTrait: opts.featuredDef ? opts.featuredDef.trait : null,
      traitMatchupMod: matchup.traitMod
    }
  };
}
