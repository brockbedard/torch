/**
 * TORCH — Card Catalog v2
 * 24 cards: 4 Gold, 10 Silver, 10 Bronze.
 * Score = wallet. Buying cards spends your TORCH points.
 * Single-use — consumed when played.
 *
 * Categories (determine icon fill color):
 *   information (gold #EBB010) — reveal opponent's cards
 *   amplification (green #00FF44) — boost your play
 *   disruption (red #FF4511) — mess with opponent
 *   protection (blue #4488FF) — cancel bad outcomes
 *   hand (green #00FF44) — hand management
 *   special_teams (orange #FF6B00) — special teams effects
 */

export const TORCH_CARDS = [
  // ═══ GOLD (2) ═══
  {
    id: 'scout_team', name: 'SCOUT TEAM', iconKey: 'filmRoom',
    tier: 'GOLD', cost: 180, type: 'pre-snap', category: 'information',
    effect: 'See the opponent\'s play before you pick yours',
  },
  {
    id: 'sure_hands', name: 'SURE HANDS', iconKey: 'pickSix',
    tier: 'GOLD', cost: 200, type: 'reactive', category: 'protection',
    effect: 'Cancel a turnover (INT or fumble). Drive continues.',
  },

  // ═══ SILVER (5) ═══
  {
    id: 'hard_count', name: 'HARD COUNT', iconKey: 'hardCount',
    tier: 'SILVER', cost: 90, type: 'pre-snap', category: 'amplification',
    effect: 'Force opponent to discard their play and pick randomly',
  },
  {
    id: 'deep_shot', name: 'DEEP SHOT', iconKey: 'player',
    tier: 'SILVER', cost: 120, type: 'pre-snap', category: 'amplification',
    effect: 'Next pass play gets 2x yards',
  },
  {
    id: 'truck_stick', name: 'TRUCK STICK', iconKey: 'truckStick',
    tier: 'SILVER', cost: 100, type: 'pre-snap', category: 'amplification',
    effect: 'Next run gets 2x yards, can\'t fumble',
  },
  {
    id: 'challenge_flag', name: 'CHALLENGE FLAG', iconKey: 'tendencyBreak',
    tier: 'SILVER', cost: 90, type: 'reactive', category: 'protection',
    effect: 'After seeing result, reroll. 50% chance of better outcome.',
  },
  {
    id: 'prime_time', name: 'PRIME TIME', iconKey: 'onFire',
    tier: 'SILVER', cost: 75, type: 'pre-snap', category: 'hand',
    effect: 'Featured player\'s OVR counts as 99 this snap',
  },

  // ═══ BRONZE (5) ═══
  {
    id: 'play_action', name: 'PLAY ACTION', iconKey: 'playAction',
    tier: 'BRONZE', cost: 35, type: 'pre-snap', category: 'amplification',
    effect: '+5 yards if opponent played run defense',
  },
  {
    id: 'scramble_drill', name: 'SCRAMBLE DRILL', iconKey: 'scrambleDrill',
    tier: 'BRONZE', cost: 40, type: 'pre-snap', category: 'amplification',
    effect: 'Convert negative play to 0 yards',
  },
  {
    id: 'twelfth_man', name: '12TH MAN', iconKey: 'dominance',
    tier: 'BRONZE', cost: 60, type: 'pre-snap', category: 'amplification',
    effect: '+4 yards and double TORCH points this snap',
  },
  {
    id: 'ice', name: 'ICE', iconKey: 'noFlyZone',
    tier: 'BRONZE', cost: 50, type: 'pre-snap', category: 'disruption',
    effect: 'Opponent\'s featured player provides zero OVR bonus',
  },
  {
    id: 'personnel_report', name: 'PERSONNEL REPORT', iconKey: 'scout',
    tier: 'BRONZE', cost: 30, type: 'pre-snap', category: 'information',
    effect: 'Reveal opponent\'s featured player before you pick yours',
  },

  {
    id: 'timeout', name: 'TIMEOUT', iconKey: 'noFlyZone',
    tier: 'BRONZE', cost: 40, type: 'pre-snap', category: 'hand',
    effect: 'Stop the clock. Adds 30 seconds to the 2-minute drill.',
  },

  // ═══ NEW — HAND MANAGEMENT ═══
  {
    id: 'fresh_legs', name: 'FRESH LEGS', iconKey: 'tempoKing',
    tier: 'BRONZE', cost: 15, type: 'pre-snap', category: 'hand',
    effect: 'Gain an extra discard this drive',  },
  {
    id: 'scout_report', name: 'SCOUT REPORT', iconKey: 'filmRoom',
    tier: 'SILVER', cost: 40, type: 'pre-snap', category: 'information',
    effect: 'See all 7 players instead of 4 this snap',  },
  {
    id: 'pre_snap_read', name: 'PRE-SNAP READ', iconKey: 'scout',
    tier: 'SILVER', cost: 35, type: 'pre-snap', category: 'information',
    effect: 'Reveals if opponent is in zone, man, or blitz before you pick your play',  },
  {
    id: 'game_plan', name: 'GAME PLAN', iconKey: 'tendencyBreak',
    tier: 'BRONZE', cost: 15, type: 'pre-snap', category: 'hand',
    effect: 'Reset one player\'s heat to zero. Defense forgets about him.',  },

  // ═══ NEW — SPECIAL TEAMS ═══
  {
    id: 'blocked_kick', name: 'BLOCKED KICK', iconKey: 'ironWall',
    tier: 'GOLD', cost: 150, type: 'reactive', category: 'disruption',
    effect: 'Chance to block the opponent\'s field goal or punt',  },
  {
    id: 'ice_the_kicker', name: 'ICE THE KICKER', iconKey: 'noFlyZone',
    tier: 'SILVER', cost: 20, type: 'pre-snap', category: 'special_teams',
    effect: 'Reduce the opponent\'s kicker accuracy by 1 star',  },
  {
    id: 'coffin_corner', name: 'COFFIN CORNER', iconKey: 'dominance',
    tier: 'BRONZE', cost: 15, type: 'pre-snap', category: 'special_teams',
    effect: 'Your punt is guaranteed to land inside the 10',  },
  {
    id: 'cannon_leg', name: 'CANNON LEG', iconKey: 'daBomb',
    tier: 'SILVER', cost: 25, type: 'pre-snap', category: 'special_teams',
    effect: 'Extend your FG range by 10 yards this attempt',  },
  {
    id: 'house_call', name: 'HOUSE CALL', iconKey: 'onFire',
    tier: 'GOLD', cost: 160, type: 'pre-snap', category: 'special_teams',
    effect: 'Your returner breaks free — guaranteed 50+ yard return',  },
  {
    id: 'fair_catch_ghost', name: 'FAIR CATCH GHOST', iconKey: 'mismatch',
    tier: 'BRONZE', cost: 15, type: 'pre-snap', category: 'special_teams',
    effect: 'Force the opponent to fair catch. No return yards.',  },
  {
    id: 'iron_man', name: 'IRON MAN', iconKey: 'helmet',
    tier: 'SILVER', cost: 20, type: 'pre-snap', category: 'special_teams',
    effect: 'Return a burned player to your special teams deck',  },
  {
    id: 'ringer', name: 'RINGER', iconKey: 'player',
    tier: 'SILVER', cost: 30, type: 'pre-snap', category: 'special_teams',
    effect: 'Your highest-star player kicks this FG regardless of your deck',  },
];

// ── LOOKUPS ──

export function getCardById(id) {
  return TORCH_CARDS.find(function(c) { return c.id === id; });
}

export function getCardsByTier(tier) {
  return TORCH_CARDS.filter(function(c) { return c.tier === tier && c.implemented !== false; });
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
  hand: '#00FF44',
  special_teams: '#FF6B00',
};

// Tier → border color
export var TIER_COLORS = {
  BRONZE: '#CD7F32',
  SILVER: '#C0C0C0',
  GOLD: '#EBB010',
};

// Shop trigger → tier weights
export var SHOP_WEIGHTS = {
  touchdown:      { BRONZE: 0.20, SILVER: 0.50, GOLD: 0.30 },
  turnover:       { BRONZE: 0.20, SILVER: 0.50, GOLD: 0.30 },
  fourthDownStop: { BRONZE: 0.40, SILVER: 0.40, GOLD: 0.20 },
  starActivation: { BRONZE: 0.30, SILVER: 0.50, GOLD: 0.20 },
  halftime:       { BRONZE: 0.20, SILVER: 0.40, GOLD: 0.40 },
  betweenGame:    { BRONZE: 0.10, SILVER: 0.40, GOLD: 0.50 },
  coinToss:       { BRONZE: 1.00, SILVER: 0.00, GOLD: 0.00 },
};

