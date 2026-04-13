/**
 * TORCH — Player Sub-Attributes
 * Each player has 3 position-specific sub-attributes on a 0-99 scale.
 * Source of truth for the keys and labels. Actual values live on each
 * player's `subs` object in players.js.
 *
 * Targets by star rating (avg of 3 subs):
 *   5-star ~82  |  4-star ~65  |  3-star ~50  |  2-star ~35
 */

// Map position code → the 3 sub-attribute keys for that position group.
export var SUB_KEYS_BY_POS = {
  QB: ['ARM', 'POISE', 'MOBILITY'],
  RB: ['POWER', 'SPEED', 'VISION'],
  FB: ['POWER', 'SPEED', 'VISION'],
  WR: ['HANDS', 'ROUTES', 'SPEED'],
  TE: ['HANDS', 'ROUTES', 'SPEED'],
  OL: ['STRENGTH', 'PASS_PRO', 'AWARENESS'],
  DL: ['PASS_RUSH', 'RUN_STOP', 'AWARENESS'],
  LB: ['TACKLING', 'COVERAGE', 'RUN_FIT'],
  CB: ['COVERAGE', 'BALL_SKILLS', 'AWARENESS'],
  S:  ['COVERAGE', 'BALL_SKILLS', 'AWARENESS'],
};

// Display labels (capitalized for UI).
export var SUB_LABELS = {
  ARM: 'Arm',
  POISE: 'Poise',
  MOBILITY: 'Mobility',
  POWER: 'Power',
  SPEED: 'Speed',
  VISION: 'Vision',
  HANDS: 'Hands',
  ROUTES: 'Routes',
  STRENGTH: 'Strength',
  PASS_PRO: 'Pass Pro',
  AWARENESS: 'Awareness',
  PASS_RUSH: 'Pass Rush',
  RUN_STOP: 'Run Stop',
  TACKLING: 'Tackling',
  COVERAGE: 'Coverage',
  RUN_FIT: 'Run Fit',
  BALL_SKILLS: 'Ball Skills',
};

export function getSubKeysForPos(pos) {
  return SUB_KEYS_BY_POS[pos] || [];
}

/**
 * Piecewise-linear mapping from average sub-attribute value to a
 * fractional star rating. Anchors:
 *   avg 35 → 2.0   avg 50 → 3.0   avg 65 → 4.0   avg 82 → 5.0
 */
export function deriveStarsFromSubs(subs) {
  if (!subs) return 0;
  var keys = Object.keys(subs);
  if (keys.length === 0) return 0;
  var sum = 0;
  for (var i = 0; i < keys.length; i++) sum += subs[keys[i]];
  var avg = sum / keys.length;
  if (avg >= 82) return 5;
  if (avg >= 65) return 4 + (avg - 65) / 17;
  if (avg >= 50) return 3 + (avg - 50) / 15;
  if (avg >= 35) return 2 + (avg - 35) / 15;
  if (avg >= 20) return 1 + (avg - 20) / 15;
  return Math.max(0, avg / 20);
}

export function getSubAverage(subs) {
  if (!subs) return 0;
  var keys = Object.keys(subs);
  if (keys.length === 0) return 0;
  var sum = 0;
  for (var i = 0; i < keys.length; i++) sum += subs[keys[i]];
  return sum / keys.length;
}
