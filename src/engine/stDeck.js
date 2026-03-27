/**
 * TORCH — Special Teams Burn Deck
 * All 14 players start in the ST deck. When used for a ST role, they're burned
 * (removed from deck for the rest of the game). They still appear in normal hands.
 */

/**
 * Create a new ST deck from a full 14-player roster.
 * @param {Array} fullRoster - All 14 players (7 OFF + 7 DEF)
 * @returns {object} ST deck state
 */
export function createSTDeck(fullRoster) {
  return {
    available: fullRoster.slice(),
    burned: [], // { player, role, context } — what they were used for
  };
}

/**
 * Burn a player from the deck (used for a ST role).
 * @param {object} deck - ST deck state
 * @param {object} player - Player to burn
 * @param {string} role - 'kicker'|'punter'|'returner'
 * @param {string} context - e.g. 'FG Q1', 'Kickoff Q2'
 */
export function burnPlayer(deck, player, role, context) {
  var idx = deck.available.indexOf(player);
  if (idx >= 0) deck.available.splice(idx, 1);
  deck.burned.push({ player: player, role: role, context: context });
}

/**
 * Restore a burned player (IRON MAN torch card).
 * @param {object} deck - ST deck state
 * @param {object} player - Player to restore
 */
export function restorePlayer(deck, player) {
  var idx = -1;
  for (var i = 0; i < deck.burned.length; i++) {
    if (deck.burned[i].player === player || deck.burned[i].player.id === player.id) {
      idx = i; break;
    }
  }
  if (idx >= 0) {
    var entry = deck.burned.splice(idx, 1)[0];
    deck.available.push(entry.player);
  }
}

/**
 * Get available players sorted by a specific ST rating (highest first).
 * @param {object} deck - ST deck state
 * @param {string} ratingKey - 'kickPower'|'kickAccuracy'|'returnAbility'
 * @returns {Array} Sorted available players
 */
export function getAvailableSorted(deck, ratingKey) {
  return deck.available.slice().sort(function(a, b) {
    var aVal = (a.st && a.st[ratingKey]) || 0;
    var bVal = (b.st && b.st[ratingKey]) || 0;
    return bVal - aVal;
  });
}

/**
 * AI picks a player for a ST role based on difficulty.
 * @param {object} deck - ST deck state
 * @param {string} ratingKey - Primary rating to optimize for
 * @param {string} difficulty - 'EASY'|'MEDIUM'|'HARD'
 * @returns {object|null} Selected player
 */
export function aiPickST(deck, ratingKey, difficulty) {
  if (deck.available.length === 0) return null;
  var sorted = getAvailableSorted(deck, ratingKey);

  if (difficulty === 'EASY') {
    return sorted[Math.floor(Math.random() * sorted.length)];
  }
  if (difficulty === 'MEDIUM') {
    var top3 = sorted.slice(0, Math.min(3, sorted.length));
    return top3[Math.floor(Math.random() * top3.length)];
  }
  // HARD — always optimal
  return sorted[0];
}

/**
 * Auto-fill when deck is depleted — random from full roster.
 * @param {Array} fullRoster - All 14 players
 * @returns {object} Random player
 */
export function autoFill(fullRoster) {
  return fullRoster[Math.floor(Math.random() * fullRoster.length)];
}
