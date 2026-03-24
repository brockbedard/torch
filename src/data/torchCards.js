/**
 * TORCH v0.21 — TORCH Card Catalog
 * 8 cards: 2 Gold (40-50pts), 4 Silver (20-30pts), 2 Bronze (10-20pts).
 * Score = wallet. Buying cards spends your score.
 * Cards persist across 3-game season. Single-use.
 */

export const TORCH_CARDS = [
  // === GOLD (2 cards) ===
  {
    id: 'scout_team',
    name: 'SCOUT TEAM',
    tier: 'GOLD',
    cost: 45,
    type: 'pre-snap',
    effect: 'See the opponent\'s play before you pick yours',
  },
  {
    id: 'sure_hands',
    name: 'SURE HANDS',
    tier: 'GOLD',
    cost: 50,
    type: 'reactive',
    effect: 'Cancel a turnover (INT or fumble) on this snap',
  },

  // === SILVER (4 cards) ===
  {
    id: 'hard_count',
    name: 'HARD COUNT',
    tier: 'SILVER',
    cost: 25,
    type: 'pre-snap',
    effect: 'Force opponent to discard their play and pick a random replacement',
  },
  {
    id: 'hot_route',
    name: 'HOT ROUTE',
    tier: 'SILVER',
    cost: 25,
    type: 'pre-snap',
    effect: 'Discard your full 5-card hand, draw 5 fresh',
  },
  {
    id: 'flag_on_the_play',
    name: 'FLAG ON THE PLAY',
    tier: 'SILVER',
    cost: 25,
    type: 'reactive',
    effect: 'After opponent gains 10+ yards, 75% chance play is called back',
  },
  {
    id: 'onside_kick',
    name: 'ONSIDE KICK',
    tier: 'SILVER',
    cost: 20,
    type: 'post-td',
    effect: 'After scoring a TD, 35% chance you recover at 50',
  },

  // === BRONZE (2 cards) ===
  {
    id: 'twelfth_man',
    name: '12TH MAN',
    tier: 'BRONZE',
    cost: 15,
    type: 'pre-snap',
    effect: '+4 yards and double TORCH points this snap',
  },
  {
    id: 'ice',
    name: 'ICE',
    tier: 'BRONZE',
    cost: 15,
    type: 'pre-snap',
    effect: 'Freeze opponent\'s player — zero OVR bonus, no badge combo',
  },
];

// Get cards by tier
export function getCardsByTier(tier) {
  return TORCH_CARDS.filter(function(c) { return c.tier === tier; });
}

// Get a random card weighted by tier
export function getRandomCard(weights) {
  // weights: { BRONZE: 0.4, SILVER: 0.4, GOLD: 0.2 }
  var r = Math.random();
  var tier;
  if (r < (weights.BRONZE || 0)) tier = 'BRONZE';
  else if (r < (weights.BRONZE || 0) + (weights.SILVER || 0)) tier = 'SILVER';
  else tier = 'GOLD';
  var pool = getCardsByTier(tier);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Shop trigger tier weights
export var SHOP_WEIGHTS = {
  touchdown:      { BRONZE: 0.40, SILVER: 0.40, GOLD: 0.20 },
  turnover:       { BRONZE: 0.40, SILVER: 0.40, GOLD: 0.20 },
  fourthDownStop: { BRONZE: 0.60, SILVER: 0.30, GOLD: 0.10 },
  starActivation: { BRONZE: 0.50, SILVER: 0.35, GOLD: 0.15 },
  halftime:       { BRONZE: 0.30, SILVER: 0.40, GOLD: 0.30 },
  betweenGame:    { BRONZE: 0.20, SILVER: 0.40, GOLD: 0.40 },
};
