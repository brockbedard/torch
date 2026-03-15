/**
 * TORCH — Torch Cards Catalog
 * 25 cards: 7 Gold (40-50pts), 12 Silver (20-30pts), 6 Bronze (10-20pts).
 * Synchronized with docs/torch_sim.py.
 * Reactive cards: CHALLENGE FLAG, FLAG ON THE PLAY, ONSIDE KICK.
 */

export const TORCH_CARDS = [
  // === GOLD (7 cards, 40-50 cost) ===
  {
    id: 'SCOUT_TEAM',
    name: 'SCOUT TEAM',
    tier: 'GOLD',
    cost: 45,
    isReactive: false,
    effect: 'Defensive study increases stuff rate by 8% and reveals opponent play tendencies.'
  },
  {
    id: 'FILM_LEAK',
    name: 'FILM LEAK',
    tier: 'GOLD',
    cost: 45,
    isReactive: false,
    effect: 'Opponent play is revealed pre-snap. Offense suffers a -3 mean yard penalty.'
  },
  {
    id: 'SURE_HANDS',
    name: 'SURE HANDS',
    tier: 'GOLD',
    cost: 50,
    isReactive: false,
    effect: 'Guarantees 100% completion rate and prevents all interceptions or fumbles this snap.'
  },
  {
    id: 'MEDICAL_TENT',
    name: 'MEDICAL TENT',
    tier: 'GOLD',
    cost: 40,
    isReactive: false,
    effect: 'Instantly heal any injured player, making them available for the next snap.'
  },
  {
    id: 'TO_THE_HOUSE',
    name: 'TO THE HOUSE',
    tier: 'GOLD',
    cost: 50,
    isReactive: false,
    effect: 'Defensive card: Any turnover forced this snap is automatically returned for a touchdown.'
  },
  {
    id: 'DOUBLE_DOWN',
    name: 'DOUBLE DOWN',
    tier: 'GOLD',
    cost: 45,
    isReactive: false,
    effect: 'Select two offensive plays and resolve both; the better result is kept.'
  },
  {
    id: 'TRADE_DEADLINE',
    name: 'TRADE DEADLINE',
    tier: 'GOLD',
    cost: 50,
    isReactive: false,
    effect: 'Permanently steal one random offensive play from the opponent\'s playbook.'
  },

  // === SILVER (12 cards, 20-30 cost) ===
  {
    id: 'SIDELINE_PHONE',
    name: 'SIDELINE PHONE',
    tier: 'SILVER',
    cost: 25,
    isReactive: false,
    effect: 'Reveal opponent\'s defensive coverage, allowing for an optimal play-call counter.'
  },
  {
    id: 'PRIME_TIME',
    name: 'PRIME TIME',
    tier: 'SILVER',
    cost: 25,
    isReactive: false,
    effect: 'Boost featured player OVR to 99 for this snap, maximizing performance.'
  },
  {
    id: 'DOUBLE_MOVE',
    name: 'DOUBLE MOVE',
    tier: 'SILVER',
    cost: 30,
    isReactive: false,
    effect: 'Creates a mismatch providing +2 mean yards and +10 TORCH points on a success.'
  },
  {
    id: 'HARD_COUNT',
    name: 'HARD COUNT',
    tier: 'SILVER',
    cost: 25,
    isReactive: false,
    effect: 'Disrupts defensive timing. Forces a random defensive play or provides a yardage bonus.'
  },
  {
    id: 'SHIFT',
    name: 'SHIFT',
    tier: 'SILVER',
    cost: 20,
    isReactive: false,
    effect: 'Defensive adjustment that disrupts offensive alignment and execution.'
  },
  {
    id: 'CHALLENGE_FLAG',
    name: 'CHALLENGE FLAG',
    tier: 'SILVER',
    cost: 25,
    isReactive: true,
    effect: '75% chance to overturn a turnover or failed conversion on official review.'
  },
  {
    id: 'FLAG_ON_THE_PLAY',
    name: 'FLAG ON THE PLAY',
    tier: 'SILVER',
    cost: 25,
    isReactive: true,
    effect: 'Defensive penalty nullifies a big gain (10+ yards) by the offense.'
  },
  {
    id: 'TIMEOUT',
    name: 'TIMEOUT',
    tier: 'SILVER',
    cost: 20,
    isReactive: false,
    effect: 'Stops the clock in the 2-minute drill; 0 seconds elapse on this snap.'
  },
  {
    id: 'HOT_ROUTE',
    name: 'HOT ROUTE',
    tier: 'SILVER',
    cost: 25,
    isReactive: false,
    effect: 'Quickly change a receiver\'s route, improving yardage potential at the line.'
  },
  {
    id: 'FAKE_KNEEL',
    name: 'FAKE KNEEL',
    tier: 'SILVER',
    cost: 25,
    isReactive: false,
    effect: 'Surprise 2-minute drill play that provides a +6 mean yard bonus.'
  },
  {
    id: 'TRICK_PLAY',
    name: 'TRICK PLAY',
    tier: 'SILVER',
    cost: 20,
    isReactive: false,
    effect: 'High-risk play that doubles TORCH points earned if it gains 10 or more yards.'
  },
  {
    id: 'ONSIDE_KICK',
    name: 'ONSIDE KICK',
    tier: 'SILVER',
    cost: 20,
    isReactive: true,
    effect: '35% chance to recover the ball at midfield after scoring a touchdown.'
  },

  // === BRONZE (6 cards, 10-20 cost) ===
  {
    id: 'PERSONNEL_REPORT',
    name: 'PERSONNEL REPORT',
    tier: 'BRONZE',
    cost: 15,
    isReactive: false,
    effect: 'Scout the opponent\'s roster to identify and exploit specific defensive weaknesses.'
  },
  {
    id: '12TH_MAN',
    name: '12TH MAN',
    tier: 'BRONZE',
    cost: 15,
    isReactive: false,
    effect: 'Home field advantage: provides +4 mean yards and doubles TORCH points this snap.'
  },
  {
    id: 'HURRY_UP',
    name: 'HURRY UP',
    tier: 'BRONZE',
    cost: 15,
    isReactive: false,
    effect: '+2 mean yards when used during the 2-minute drill.'
  },
  {
    id: 'ICE',
    name: 'ICE',
    tier: 'BRONZE',
    cost: 15,
    isReactive: false,
    effect: 'Negates the opponent\'s featured player OVR bonus and badge combos this snap.'
  },
  {
    id: 'NEXT_MAN_UP',
    name: 'NEXT MAN UP',
    tier: 'BRONZE',
    cost: 10,
    isReactive: false,
    effect: 'Bench players step up with increased performance when starters are unavailable.'
  },
  {
    id: 'RUN_IT_BACK',
    name: 'RUN IT BACK',
    tier: 'BRONZE',
    cost: 15,
    isReactive: false,
    effect: 'Repeat the previous play with a small yardage bonus, catching the defense off guard.'
  }
];
