/**
 * TORCH — Card Combo System
 * Playing specific torch cards in sequence during a drive triggers bonuses.
 * Combos are discovered by playing, never shown in advance.
 */

var COMBOS = [
  {
    id: 'double_threat',
    name: 'DOUBLE THREAT',
    cards: ['deep_shot', 'truck_stick'],
    bonus: { yards: 3 },
    description: 'Air + ground threat unlocked!'
  },
  {
    id: 'film_study',
    name: 'FILM STUDY',
    cards: ['scout_team', 'personnel_report'],
    bonus: { yards: 2, torchMultiplier: 1.5 },
    description: 'Full intel — maximum advantage!'
  },
  {
    id: 'ice_storm',
    name: 'ICE STORM',
    cards: ['ice', 'hard_count'],
    bonus: { yards: 4 },
    description: 'Opponent completely disrupted!'
  },
  {
    id: 'momentum_play',
    name: 'MOMENTUM PLAY',
    cards: ['twelfth_man', 'prime_time'],
    bonus: { yards: 3, torchMultiplier: 1.5 },
    description: 'The crowd is electric!'
  },
  {
    id: 'safe_hands',
    name: 'INSURANCE POLICY',
    cards: ['sure_hands', 'scramble_drill'],
    bonus: { yards: 2 },
    description: 'Nothing can go wrong!'
  },
];

/**
 * Check if a combo has been completed this drive.
 * @param {string[]} driveCards - Card IDs used this drive (NOT including latestCard)
 * @param {string} latestCard - Card just played
 * @param {string[]} [firedCombos] - Combo IDs already triggered this drive (to prevent re-fire)
 * @returns {object|null} Triggered combo or null
 */
export function checkCardCombo(driveCards, latestCard, firedCombos) {
  if (!driveCards || !latestCard) return null;
  var allCards = driveCards.concat([latestCard]);
  var fired = firedCombos || [];

  for (var i = 0; i < COMBOS.length; i++) {
    var combo = COMBOS[i];
    if (fired.indexOf(combo.id) >= 0) continue; // already fired this drive
    var hasAll = combo.cards.every(function(c) { return allCards.indexOf(c) >= 0; });
    if (hasAll) return combo;
  }
  return null;
}

/**
 * Get all possible combos for display in a future "combo book" UI.
 */
export function getAllCombos() {
  return COMBOS.slice();
}
