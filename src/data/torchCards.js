/**
 * TORCH — Card Catalog v1
 * 12 cards: 2 Gold (40-50pts), 5 Silver (20-30pts), 5 Bronze (10-15pts).
 * Score = wallet. Buying cards spends your TORCH points.
 * Cards persist across 3-game season. Single-use — consumed when played.
 *
 * Categories (determine icon fill color):
 *   information (gold #EBB010) — reveal opponent's cards
 *   amplification (green #00FF44) — boost your play
 *   disruption (red #FF4511) — mess with opponent
 *   protection (blue #4488FF) — cancel bad outcomes
 */

export const TORCH_CARDS = [
  // ═══ GOLD (2) ═══
  {
    id: 'scout_team', name: 'SCOUT TEAM', iconKey: 'filmRoom',
    tier: 'GOLD', cost: 45, type: 'pre-snap', category: 'information',
    effect: 'See the opponent\'s play before you pick yours',
  },
  {
    id: 'sure_hands', name: 'SURE HANDS', iconKey: 'pickSix',
    tier: 'GOLD', cost: 50, type: 'reactive', category: 'protection',
    effect: 'Cancel a turnover (INT or fumble). Drive continues.',
  },

  // ═══ SILVER (5) ═══
  {
    id: 'hard_count', name: 'HARD COUNT', iconKey: 'hardCount',
    tier: 'SILVER', cost: 25, type: 'pre-snap', category: 'disruption',
    effect: 'Force opponent to discard their play and pick randomly',
  },
  {
    id: 'deep_shot', name: 'DEEP SHOT', iconKey: 'player',
    tier: 'SILVER', cost: 25, type: 'pre-snap', category: 'amplification',
    effect: 'Next pass play gets 2x yards',
  },
  {
    id: 'truck_stick', name: 'TRUCK STICK', iconKey: 'truckStick',
    tier: 'SILVER', cost: 25, type: 'pre-snap', category: 'amplification',
    effect: 'Next run gets 2x yards, can\'t fumble',
  },
  {
    id: 'challenge_flag', name: 'CHALLENGE FLAG', iconKey: 'tendencyBreak',
    tier: 'SILVER', cost: 30, type: 'reactive', category: 'protection',
    effect: 'After seeing result, reroll. 50% chance of better outcome.',
  },
  {
    id: 'prime_time', name: 'PRIME TIME', iconKey: 'onFire',
    tier: 'SILVER', cost: 20, type: 'pre-snap', category: 'amplification',
    effect: 'Featured player\'s OVR counts as 99 this snap',
  },

  // ═══ BRONZE (5) ═══
  {
    id: 'play_action', name: 'PLAY ACTION', iconKey: 'playAction',
    tier: 'BRONZE', cost: 10, type: 'pre-snap', category: 'amplification',
    effect: '+5 yards if opponent played run defense',
  },
  {
    id: 'scramble_drill', name: 'SCRAMBLE DRILL', iconKey: 'scrambleDrill',
    tier: 'BRONZE', cost: 10, type: 'pre-snap', category: 'protection',
    effect: 'Convert negative play to 0 yards',
  },
  {
    id: 'twelfth_man', name: '12TH MAN', iconKey: 'dominance',
    tier: 'BRONZE', cost: 15, type: 'pre-snap', category: 'amplification',
    effect: '+4 yards and double TORCH points this snap',
  },
  {
    id: 'ice', name: 'ICE', iconKey: 'noFlyZone',
    tier: 'BRONZE', cost: 15, type: 'pre-snap', category: 'disruption',
    effect: 'Opponent\'s featured player provides zero OVR bonus',
  },
  {
    id: 'personnel_report', name: 'PERSONNEL REPORT', iconKey: 'scout',
    tier: 'BRONZE', cost: 10, type: 'pre-snap', category: 'information',
    effect: 'Reveal opponent\'s featured player before you pick yours',
  },
];

// ── LOOKUPS ──

export function getCardById(id) {
  return TORCH_CARDS.find(function(c) { return c.id === id; });
}

export function getCardsByTier(tier) {
  return TORCH_CARDS.filter(function(c) { return c.tier === tier; });
}

// Get a random card weighted by tier
export function getRandomCard(weights) {
  var r = Math.random();
  var tier;
  if (r < (weights.BRONZE || 0)) tier = 'BRONZE';
  else if (r < (weights.BRONZE || 0) + (weights.SILVER || 0)) tier = 'SILVER';
  else tier = 'GOLD';
  var pool = getCardsByTier(tier);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Get N random unique cards from a tier
export function getRandomCardsFromTier(tier, count) {
  var pool = getCardsByTier(tier).slice();
  var result = [];
  for (var i = 0; i < count && pool.length > 0; i++) {
    var idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

// Get 3 random shop offers weighted by trigger type
export function getBoosterOffers(trigger) {
  var weights = SHOP_WEIGHTS[trigger] || SHOP_WEIGHTS.halftime;
  var offers = [];
  for (var i = 0; i < 3; i++) {
    var card = getRandomCard(weights);
    // Avoid duplicates in the same offer set
    var attempts = 0;
    while (offers.some(function(o) { return o.id === card.id; }) && attempts < 10) {
      card = getRandomCard(weights);
      attempts++;
    }
    offers.push(card);
  }
  return offers;
}

// Category → icon fill color
export var CATEGORY_COLORS = {
  information: '#EBB010',
  amplification: '#00FF44',
  disruption: '#FF4511',
  protection: '#4488FF',
};

// Tier → border color
export var TIER_COLORS = {
  BRONZE: '#CD7F32',
  SILVER: '#C0C0C0',
  GOLD: '#EBB010',
};

// Shop trigger → tier weights
export var SHOP_WEIGHTS = {
  touchdown:      { BRONZE: 0.40, SILVER: 0.40, GOLD: 0.20 },
  turnover:       { BRONZE: 0.40, SILVER: 0.40, GOLD: 0.20 },
  fourthDownStop: { BRONZE: 0.60, SILVER: 0.30, GOLD: 0.10 },
  starActivation: { BRONZE: 0.50, SILVER: 0.35, GOLD: 0.15 },
  halftime:       { BRONZE: 0.30, SILVER: 0.40, GOLD: 0.30 },
  betweenGame:    { BRONZE: 0.20, SILVER: 0.40, GOLD: 0.40 },
  coinToss:       { BRONZE: 1.00, SILVER: 0.00, GOLD: 0.00 },
};
