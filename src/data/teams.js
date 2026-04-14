/**
 * TORCH — Team Definitions (Ember Eight)
 *
 * 8 teams in a single conference. School names + tiers per the Ember Eight Bible
 * (`docs/TORCH-EMBER-EIGHT-BIBLE.md`). Schemes per the design proposal
 * (`docs/TORCH-EMBER-EIGHT-DESIGN-PROPOSAL.md`).
 *
 * Internal team IDs (sentinels/wolves/stags/serpents/pronghorns/salamanders/
 * maples/raccoons) are LEGACY KEYS used in 30+ files. Display names per bible.
 *
 * Tier flip from prior versions: Boars dropped to bottom, Spectres rose to top.
 */

export const TEAMS = {
  // ── TOP TIER ────────────────────────────────────────────────────────────
  pronghorns: {
    id: 'pronghorns',
    name: 'PRONGHORNS',
    school: 'Larkspur State University',
    mascot: 'Pronghorns',
    abbr: 'LAR',
    accent: '#F5DEB3', icon: '',
    colors: { primary: '#166534', secondary: '#F59E0B' },
    helmet: { base: '#166534', facemask: '#F59E0B', stripe: '#FCD34D' },
    motto: 'Outrun The Horizon',
    offScheme: 'POWER SPREAD',
    defScheme: 'PATTERN MATCH',
    ratings: { offense: 4, defense: 4 },
    tier: 'top',
    vibe: 'Reinhardt dynasty. RPO conflict + pulling guards. Senior class.',
    celebration: {
      colors: ['#F5DEB3', '#166534', '#F59E0B', '#FCD34D'],
      phrases: ['LARKSPUR RUNS!', 'OUTRUN THE HORIZON!', 'PLAINS POWER!']
    }
  },

  stags: {
    id: 'stags',
    name: 'SPECTRES',
    school: 'Hollowridge State University',
    mascot: 'Spectres',
    abbr: 'HSU',
    accent: '#FFFFFF', icon: '',
    colors: { primary: '#5DADE2', secondary: '#1B4F72' },
    helmet: { base: '#5DADE2', facemask: '#1B4F72', stripe: '#FFFFFF' },
    motto: 'Strike From The Shadows',
    offScheme: 'SPREAD OPTION',
    defScheme: 'ROBBER',
    ratings: { offense: 4, defense: 5 },
    tier: 'top',
    vibe: 'Carry the town. Dual-threat QB + lockdown press secondary.',
    celebration: {
      colors: ['#FFFFFF', '#5DADE2', '#85C1E9', '#1B4F72'],
      phrases: ['FROM THE SHADOWS!', 'SPECTRES ATTACK!', 'CARRY THE TOWN!']
    }
  },

  // ── MIDDLE TIER ─────────────────────────────────────────────────────────
  maples: {
    id: 'maples',
    name: 'MAPLES',
    school: 'University of Vermont, St. Marlowe',
    mascot: 'Maples',
    abbr: 'VMT',
    accent: '#D97706', icon: '',
    colors: { primary: '#7A1E2E', secondary: '#D97706' },
    helmet: { base: '#7A1E2E', facemask: '#FCD34D', stripe: '#2E0A14' },
    motto: 'Honor The Lineage',
    offScheme: 'MULTIPLE',
    defScheme: 'DISGUISE',
    ratings: { offense: 3, defense: 4 },
    tier: 'middle',
    vibe: 'Win with preparation, not athletes. Mesh, Drive, Spider 2 Y Banana.',
    celebration: {
      colors: ['#D97706', '#7A1E2E', '#FCD34D', '#FDF4D4'],
      phrases: ['HONOR THE LINEAGE!', 'TRUST THE FILM!', 'NOTEBOOK FOOTBALL!']
    }
  },

  salamanders: {
    id: 'salamanders',
    name: 'SALAMANDERS',
    school: 'Helix University',
    mascot: 'Salamanders',
    abbr: 'HEL',
    accent: '#F39C12', icon: '',
    colors: { primary: '#2ECC71', secondary: '#E84393' },
    helmet: { base: '#186A3B', facemask: '#E84393', stripe: '#F39C12' },
    motto: 'Numbers Don\'t Lie',
    offScheme: 'AIR RAID',
    defScheme: 'BEND DON\'T BREAK',
    ratings: { offense: 3, defense: 3 },
    tier: 'middle',
    vibe: 'Mesh forever. Throw 50 times. Never punt. Game-theory defense.',
    celebration: {
      colors: ['#E84393', '#2ECC71', '#F39C12', '#F1C40F'],
      phrases: ['MESH FOREVER!', 'EVERY COLOR AT ONCE!', 'NEVER PUNT!']
    }
  },

  wolves: {
    id: 'wolves',
    name: 'DOLPHINS',
    school: 'Coral Bay University',
    mascot: 'Dolphins',
    abbr: 'CBU',
    accent: '#FF7EB3', icon: '',
    colors: { primary: '#D13A7A', secondary: '#6B1E7F' },
    helmet: { base: '#D13A7A', facemask: '#FFCFD8', stripe: '#6B1E7F' },
    motto: 'Ride The Current',
    offScheme: 'VERTICAL PASS',
    defScheme: 'PRESS MAN',
    ratings: { offense: 4, defense: 3 },
    tier: 'middle',
    vibe: 'Strong-arm QB + alpha X. Take the top off. Transfer-portal misfits.',
    celebration: {
      colors: ['#FF7EB3', '#D13A7A', '#FFF6E4', '#6B1E7F'],
      phrases: ['RIDE THE CURRENT!', 'DOLPHINS STRIKE!', 'TAKE THE TOP OFF!']
    }
  },

  serpents: {
    id: 'serpents',
    name: 'SERPENTS',
    school: 'Blackwater University',
    mascot: 'Serpents',
    abbr: 'BWU',
    accent: '#F5C542', icon: '',
    colors: { primary: '#14B8A6', secondary: '#F5C542' },
    helmet: { base: '#0F766E', facemask: '#5EEAD4', stripe: '#F5C542' },
    motto: 'Death by a Thousand Cuts',
    offScheme: 'TRIPLE OPTION',
    defScheme: 'GAP CONTROL',
    ratings: { offense: 3, defense: 4 },
    tier: 'middle',
    vibe: 'Inside Veer, Midline, Rocket Toss. Eight-minute drives.',
    celebration: {
      colors: ['#5EEAD4', '#14B8A6', '#F5C542', '#0A1F1E'],
      phrases: ['DEATH BY A THOUSAND CUTS!', 'CALCULATED!', 'EIGHT-MINUTE DRIVE!']
    }
  },

  // ── BOTTOM TIER ─────────────────────────────────────────────────────────
  sentinels: {
    id: 'sentinels',
    name: 'BOARS',
    school: 'Ridgemont University',
    mascot: 'Boars',
    abbr: 'RID',
    accent: '#EBB010', icon: '',
    colors: { primary: '#8B0000', secondary: '#C4A265' },
    helmet: { base: '#8B0000', facemask: '#C4A265', stripe: '#C4A265' },
    motto: 'Eyes Up, Hands Ready',
    offScheme: 'SMASHMOUTH',
    defScheme: 'COVER 3',
    ratings: { offense: 2, defense: 3 },
    tier: 'bottom',
    vibe: 'Ozark factory. Two TEs, downhill RB. Win the line of scrimmage.',
    celebration: {
      colors: ['#C4A265', '#8B0000', '#fff', '#EBB010'],
      phrases: ['BOARS FOOTBALL!', "THAT'S RIDGEMONT!", 'POWER!']
    }
  },

  raccoons: {
    id: 'raccoons',
    name: 'RACCOONS',
    school: 'Sacramento Polytechnic',
    mascot: 'Raccoons',
    abbr: 'SAC',
    accent: '#84CC16', icon: '',
    colors: { primary: '#52525B', secondary: '#FF8C00' },
    helmet: { base: '#27272A', facemask: '#D4D4D8', stripe: '#FF8C00' },
    motto: "What's Yours Is Ours",
    offScheme: 'VEER & SHOOT',
    defScheme: 'FLYOVER',
    ratings: { offense: 3, defense: 2 },
    tier: 'bottom',
    vibe: 'Newest program. RPO-driven. Sideline splits break pattern match.',
    celebration: {
      colors: ['#84CC16', '#FF8C00', '#D4D4D8', '#27272A'],
      phrases: ["WHAT'S YOURS IS OURS!", 'CHECK THE TAPE!', 'LIGHTS OUT!']
    }
  },
};


// ── Helpers ────────────────────────────────────────────────────────────────

export function getTeamById(id) {
  return TEAMS[id] || null;
}

export function getTeamIds() {
  return Object.keys(TEAMS);
}

/** Get all teams in a given tier ('top' | 'middle' | 'bottom'). */
export function getTeamsByTier(tier) {
  return Object.values(TEAMS).filter(t => t.tier === tier);
}


// ── Counter Matrix ─────────────────────────────────────────────────────────
// New 8-team rock-paper-scissors. Each team has 2 strong / 2 weak / 3 neutral.
// Verified balanced + internally consistent (every "A strong vs B" has a
// matching "B weak vs A").

export const COUNTER_MATRIX = {
  pronghorns:  { strong: ['maples', 'stags'],          weak: ['salamanders', 'raccoons'], neutral: ['wolves', 'serpents', 'sentinels'] },
  stags:       { strong: ['sentinels', 'wolves'],      weak: ['pronghorns', 'serpents'],  neutral: ['maples', 'salamanders', 'raccoons'] },
  maples:      { strong: ['wolves', 'salamanders'],    weak: ['pronghorns', 'sentinels'], neutral: ['stags', 'serpents', 'raccoons'] },
  salamanders: { strong: ['serpents', 'pronghorns'],   weak: ['maples', 'raccoons'],      neutral: ['stags', 'wolves', 'sentinels'] },
  wolves:      { strong: ['serpents', 'raccoons'],     weak: ['maples', 'stags'],         neutral: ['pronghorns', 'salamanders', 'sentinels'] },
  serpents:    { strong: ['sentinels', 'stags'],       weak: ['wolves', 'salamanders'],   neutral: ['pronghorns', 'maples', 'raccoons'] },
  sentinels:   { strong: ['maples', 'raccoons'],       weak: ['stags', 'serpents'],       neutral: ['pronghorns', 'salamanders', 'wolves'] },
  raccoons:    { strong: ['salamanders', 'pronghorns'],weak: ['sentinels', 'wolves'],     neutral: ['stags', 'maples', 'serpents'] },
};

/** Lookup helper. Returns { strong: [], weak: [], neutral: [] } or null. */
export function getCounters(teamId) {
  return COUNTER_MATRIX[teamId] || null;
}


// ── DEPRECATED: legacy 4-team COUNTER_PLAY ─────────────────────────────────
// Kept temporarily for backward compat with snapResolver/aiOpponent during
// migration. Will be removed once all consumers read from COUNTER_MATRIX.
// Maps the old single-string {strong, weak, neutral} shape to the first entry
// from COUNTER_MATRIX so existing call sites don't crash.
export const COUNTER_PLAY = {
  sentinels: { strong: COUNTER_MATRIX.sentinels.strong[0], weak: COUNTER_MATRIX.sentinels.weak[0], neutral: COUNTER_MATRIX.sentinels.neutral[0] },
  wolves:    { strong: COUNTER_MATRIX.wolves.strong[0],    weak: COUNTER_MATRIX.wolves.weak[0],    neutral: COUNTER_MATRIX.wolves.neutral[0] },
  stags:     { strong: COUNTER_MATRIX.stags.strong[0],     weak: COUNTER_MATRIX.stags.weak[0],     neutral: COUNTER_MATRIX.stags.neutral[0] },
  serpents:  { strong: COUNTER_MATRIX.serpents.strong[0],  weak: COUNTER_MATRIX.serpents.weak[0],  neutral: COUNTER_MATRIX.serpents.neutral[0] },
};

/**
 * @deprecated Season opponent helper from the 4-team era. Ember Eight runs a
 * full 7-game round-robin when season mode ships; this stub keeps existing
 * callers from breaking until that lands.
 */
export function getSeasonOpponents(teamId) {
  var cp = COUNTER_MATRIX[teamId];
  if (!cp) return [];
  return [cp.neutral[0], cp.strong[0], cp.weak[0]];
}
