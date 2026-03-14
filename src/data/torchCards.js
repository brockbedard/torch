/**
 * TORCH — Torch Cards Catalog
 * 21 cards: 7 Gold (40-50pts), 12 Silver (20-30pts), 5 Bronze (10-20pts).
 * From TORCH-CARDS-CATALOG-v0.1.md and TORCH-GAMEPLAY-SPEC-v0.13.md.
 * Reactive cards: SURE HANDS, CHALLENGE FLAG, FLAG ON THE PLAY, MEDICAL TENT.
 */

export const TORCH_CARDS = [
  // === GOLD (7 cards, 40-50 cost) ===
  { id: 'hot_route', name: 'HOT ROUTE', tier: 'GOLD', cost: 50, isReactive: false,
    effect: 'Change your play after seeing the defense. Redraw 1 play card and play it immediately.' },
  { id: 'film_study', name: 'FILM STUDY', tier: 'GOLD', cost: 45, isReactive: false,
    effect: 'See the opponent\'s play card before snapping. Choose your play with full information.' },
  { id: 'to_the_house', name: 'TO THE HOUSE', tier: 'GOLD', cost: 50, isReactive: false,
    effect: 'On a turnover, automatic touchdown return. No yardage roll.' },
  { id: 'momentum_shift', name: 'MOMENTUM SHIFT', tier: 'GOLD', cost: 45, isReactive: false,
    effect: '+5 mean yards and +20% completion for the next 3 snaps.' },
  { id: 'timeout', name: 'TIMEOUT', tier: 'GOLD', cost: 40, isReactive: false,
    effect: 'Stop the clock during 2-minute drill. 0 seconds elapse on the next snap.' },
  { id: 'double_or_nothing', name: 'DOUBLE OR NOTHING', tier: 'GOLD', cost: 50, isReactive: false,
    effect: 'Double TORCH points earned on this snap (both positive and negative).' },
  { id: 'qb_sneak_boost', name: 'QB DRAW', tier: 'GOLD', cost: 40, isReactive: false,
    effect: 'QB scrambles for guaranteed 4-8 yards. Ignores sack check.' },

  // === SILVER (12 cards, 20-30 cost) ===
  { id: 'play_action_fake', name: 'PLAY-ACTION FAKE', tier: 'SILVER', cost: 30, isReactive: false,
    effect: '+4 mean yards on the next pass play. No effect on runs.' },
  { id: 'hard_count', name: 'HARD COUNT', tier: 'SILVER', cost: 25, isReactive: false,
    effect: 'Opponent\'s defensive card is random (overrides AI selection) this snap.' },
  { id: 'blitz_pickup', name: 'BLITZ PICKUP', tier: 'SILVER', cost: 25, isReactive: false,
    effect: 'Negate sack check entirely this snap. Can still be incomplete.' },
  { id: 'hurry_up', name: 'HURRY UP', tier: 'SILVER', cost: 20, isReactive: false,
    effect: 'Only 10 seconds elapse on the next snap (2-minute drill only).' },
  { id: 'read_option', name: 'READ THE FIELD', tier: 'SILVER', cost: 25, isReactive: false,
    effect: '+10% completion rate this snap.' },
  { id: 'stiff_arm', name: 'STIFF ARM', tier: 'SILVER', cost: 20, isReactive: false,
    effect: '+3 yards after contact on run plays. No fumble check this snap.' },
  { id: 'crowd_noise', name: 'CROWD NOISE', tier: 'SILVER', cost: 25, isReactive: false,
    effect: 'Opponent gets -2 mean yards on their next offensive snap.' },
  { id: 'scout_report', name: 'SCOUT REPORT', tier: 'SILVER', cost: 30, isReactive: false,
    effect: 'See which 5 plays the opponent drafted into their hand.' },
  { id: 'sure_hands', name: 'SURE HANDS', tier: 'SILVER', cost: 25, isReactive: true,
    effect: 'After a drop/incompletion, retry the catch. 70% success rate.' },
  { id: 'challenge_flag', name: 'CHALLENGE FLAG', tier: 'SILVER', cost: 30, isReactive: true,
    effect: 'Challenge a specific play element. Overturn rates vary by type (45-60%).' },
  { id: 'flag_on_the_play', name: 'FLAG ON THE PLAY', tier: 'SILVER', cost: 25, isReactive: true,
    effect: 'Call a penalty on the defense. Replay the down with +5 yards.' },
  { id: 'medical_tent', name: 'MEDICAL TENT', tier: 'SILVER', cost: 20, isReactive: true,
    effect: 'Instantly heal any injured player, regardless of severity.' },

  // === BRONZE (5 cards, 10-20 cost) ===
  { id: 'extra_effort', name: 'EXTRA EFFORT', tier: 'BRONZE', cost: 15, isReactive: false,
    effect: '+2 mean yards this snap.' },
  { id: 'quick_snap', name: 'QUICK SNAP', tier: 'BRONZE', cost: 10, isReactive: false,
    effect: 'Catch the defense off guard. -2% sack rate, +5% completion this snap.' },
  { id: 'film_room', name: 'FILM ROOM', tier: 'BRONZE', cost: 15, isReactive: false,
    effect: '+1 mean yard for the rest of the drive.' },
  { id: 'ice_the_kicker', name: 'ICE THE KICKER', tier: 'BRONZE', cost: 10, isReactive: false,
    effect: 'Opponent\'s next conversion attempt has -15% success rate.' },
  { id: 'home_field', name: 'HOME FIELD', tier: 'BRONZE', cost: 20, isReactive: false,
    effect: '+1 mean yards and -1% INT rate for the rest of the half.' },
];
