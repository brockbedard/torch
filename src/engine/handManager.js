/**
 * TORCH — Hand Manager
 * Manages the 8-card hand (4 plays + 4 players), draw piles, carry-over, and discards.
 * Pure state logic — no UI, no DOM.
 */

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

/**
 * Create a new HandState for one side (offense or defense).
 * @param {Array} allPlays - Full playbook (10 plays)
 * @param {Array} allPlayers - Full roster (7 players)
 * @returns {object} HandState
 */
export function createHandState(allPlays, allPlayers) {
  var shuffledPlays = shuffle(allPlays);
  var shuffledPlayers = shuffle(allPlayers);

  return {
    // Current hand (4 each)
    playHand: shuffledPlays.slice(0, 4),
    playerHand: shuffledPlayers.slice(0, 4),

    // Draw piles (remaining after initial deal)
    playPile: shuffledPlays.slice(4),
    playerPile: shuffledPlayers.slice(4),

    // Discard piles (played + discarded cards go here)
    playDiscard: [],
    playerDiscard: [],

    // Discard usage tracking (1 of each per drive)
    playDiscardsUsed: 0,
    playerDiscardsUsed: 0,

    // Full source arrays for reshuffle
    _allPlays: allPlays,
    _allPlayers: allPlayers,
  };
}

/**
 * Draw a card from a pile. If pile is empty, reshuffle discard into pile first.
 * @param {Array} pile - Draw pile (mutated)
 * @param {Array} discard - Discard pile (mutated on reshuffle)
 * @returns {object|null} Drawn card, or null if both piles empty
 */
function drawFrom(pile, discard) {
  if (pile.length === 0) {
    if (discard.length === 0) return null;
    var reshuffled = shuffle(discard);
    pile.push.apply(pile, reshuffled);
    discard.length = 0;
  }
  return pile.shift();
}

/**
 * After a snap: remove the played cards from hand and draw replacements.
 * @param {object} hs - HandState
 * @param {object} playedPlay - The play card that was used (or null)
 * @param {object} playedPlayer - The player card that was used (or null)
 * @returns {{ newPlay: object|null, newPlayer: object|null }} The replacement cards dealt
 */
export function afterSnap(hs, playedPlay, playedPlayer) {
  var newPlay = null;
  var newPlayer = null;

  if (playedPlay) {
    var idx = hs.playHand.indexOf(playedPlay);
    if (idx >= 0) hs.playHand.splice(idx, 1);
    hs.playDiscard.push(playedPlay);
    newPlay = drawFrom(hs.playPile, hs.playDiscard);
    if (newPlay) hs.playHand.push(newPlay);
  }

  if (playedPlayer) {
    var pidx = hs.playerHand.indexOf(playedPlayer);
    if (pidx >= 0) hs.playerHand.splice(pidx, 1);
    hs.playerDiscard.push(playedPlayer);
    newPlayer = drawFrom(hs.playerPile, hs.playerDiscard);
    if (newPlayer) hs.playerHand.push(newPlayer);
  }

  return { newPlay: newPlay, newPlayer: newPlayer };
}

/**
 * Discard marked cards from hand and draw replacements.
 * @param {object} hs - HandState
 * @param {'play'|'player'} type - Which hand to discard from
 * @param {Array} markedCards - Cards to discard (max 3)
 * @returns {{ removed: Array, drawn: Array }} What was removed and what was drawn
 */
export function discard(hs, type, markedCards) {
  var hand = type === 'play' ? hs.playHand : hs.playerHand;
  var pile = type === 'play' ? hs.playPile : hs.playerPile;
  var disc = type === 'play' ? hs.playDiscard : hs.playerDiscard;

  var removed = [];
  var drawn = [];

  // Remove marked cards from hand → discard pile
  for (var i = 0; i < markedCards.length; i++) {
    var idx = hand.indexOf(markedCards[i]);
    if (idx >= 0) {
      hand.splice(idx, 1);
      disc.push(markedCards[i]);
      removed.push(markedCards[i]);
    }
  }

  // Draw replacements
  for (var j = 0; j < removed.length; j++) {
    var card = drawFrom(pile, disc);
    if (card) {
      hand.push(card);
      drawn.push(card);
    }
  }

  // Mark discard as used
  if (type === 'play') hs.playDiscardsUsed++;
  else hs.playerDiscardsUsed++;

  return { removed: removed, drawn: drawn };
}

/**
 * Check if a discard is available.
 */
export function canDiscard(hs, type) {
  if (type === 'play') return hs.playDiscardsUsed < 1;
  return hs.playerDiscardsUsed < 1;
}

/**
 * Reset discard usage for a new drive (possession change).
 */
export function resetDriveDiscards(hs) {
  hs.playDiscardsUsed = 0;
  hs.playerDiscardsUsed = 0;
}

/**
 * Re-deal a full new hand (e.g., at start of a new drive after possession change).
 * Puts current hand back into piles, reshuffles everything, and deals fresh 4+4.
 */
export function redeal(hs) {
  // Return hand and discard to source
  var allPlays = hs._allPlays;
  var allPlayers = hs._allPlayers;

  var shuffledPlays = shuffle(allPlays);
  var shuffledPlayers = shuffle(allPlayers);

  hs.playHand = shuffledPlays.slice(0, 4);
  hs.playerHand = shuffledPlayers.slice(0, 4);
  hs.playPile = shuffledPlays.slice(4);
  hs.playerPile = shuffledPlayers.slice(4);
  hs.playDiscard = [];
  hs.playerDiscard = [];
  hs.playDiscardsUsed = 0;
  hs.playerDiscardsUsed = 0;
}
