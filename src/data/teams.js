/**
 * TORCH v0.21 — Team Definitions
 * 4 fictional college football teams with distinct identities.
 * Colors, helmets, ratings, schemes — visual + gameplay identity.
 */

export const TEAMS = {
  sentinels: {
    id: 'sentinels',
    name: 'SENTINELS',
    school: 'Ridgemont University',
    mascot: 'Sentinels',
    abbr: 'RDG',
    accent: '#C4A265', icon: '',
    colors: { primary: '#8B0000', secondary: '#C4A265' },
    helmet: { base: '#8B0000', facemask: '#C4A265', stripe: '#C4A265' },
    motto: 'Eyes Up, Hands Ready',
    offScheme: 'RUN & SHOOT',
    defScheme: 'PRESS MAN',
    ratings: { offense: 4, defense: 3 },
    vibe: 'Disciplined. Adaptive. The chess team that bench presses 315.',
  },
  wolves: {
    id: 'wolves',
    name: 'TIMBER WOLVES',
    school: 'Northern Pines A&M',
    mascot: 'Timber Wolves',
    abbr: 'NPA',
    accent: '#D4D4D4', icon: '',
    colors: { primary: '#1B3A2D', secondary: '#D4D4D4' },
    helmet: { base: '#1B3A2D', facemask: '#D4D4D4', stripe: '#D4D4D4' },
    motto: 'Run Through Them',
    offScheme: 'TRIPLE OPTION',
    defScheme: 'COVER 3 ZONE',
    ratings: { offense: 3, defense: 4 },
    vibe: 'Blue-collar. Relentless. Opponents leave sore.',
  },
  stags: {
    id: 'stags',
    name: 'STAGS',
    school: 'Crestview College',
    mascot: 'Stags',
    abbr: 'CRV',
    accent: '#F28C28', icon: '',
    colors: { primary: '#F28C28', secondary: '#1C1C1C' },
    helmet: { base: '#F28C28', facemask: '#1C1C1C', stripe: '#1C1C1C' },
    motto: 'Strike First, Strike Fast',
    offScheme: 'SPREAD RPO',
    defScheme: 'SWARM BLITZ',
    ratings: { offense: 5, defense: 2 },
    vibe: 'Explosive. Electric. Wins 52-48 or loses 52-48.',
  },
  serpents: {
    id: 'serpents',
    name: 'SERPENTS',
    school: 'Blackwater State',
    mascot: 'Serpents',
    abbr: 'BWS',
    accent: '#39FF14', icon: '',
    colors: { primary: '#2E0854', secondary: '#39FF14' },
    helmet: { base: '#2E0854', facemask: '#39FF14', stripe: '#39FF14' },
    motto: 'Death by a Thousand Cuts',
    offScheme: 'AIR RAID',
    defScheme: 'PATTERN MATCH',
    ratings: { offense: 3, defense: 4 },
    vibe: 'Cerebral. Methodical. Death by paper cuts.',
  },
};

// Backwards compat: array form for setup.js which calls TEAMS.forEach()
// Old code expects team objects with: id, name, accent, icon, style, defStyle, players, defPlayers
// Map new fields to old field names so setup.js doesn't crash.
export var TEAMS_LIST = Object.keys(TEAMS).map(function(k) {
  var t = TEAMS[k];
  return Object.assign({}, t, {
    color: t.colors.primary,
    accent: t.colors.secondary,
    icon: '',  // No emoji icons in v0.21
    style: t.offScheme,
    defStyle: t.defScheme,
    desc: t.motto,
    defDesc: t.defScheme,
    bg: '#0A0804',
    players: [],    // Empty — roster shown on team select in Phase 3
    defPlayers: [],
  });
});

// Helper: get team by id
export function getTeamById(id) {
  return TEAMS[id] || null;
}

// Helper: get all team ids
export function getTeamIds() {
  return Object.keys(TEAMS);
}

// Counter-play matrix: which offense is strong/weak vs which defense
// Circular: Sentinels > Serpents > Stags > Wolves > Sentinels
export const COUNTER_PLAY = {
  sentinels: { strong: 'wolves', weak: 'stags', neutral: 'serpents' },
  wolves:    { strong: 'sentinels', weak: 'serpents', neutral: 'stags' },
  stags:     { strong: 'serpents', weak: 'wolves', neutral: 'sentinels' },
  serpents:  { strong: 'stags', weak: 'sentinels', neutral: 'wolves' },
};

// Season opponent order: neutral -> prey (your OFF strong) -> predator (your OFF weak)
export function getSeasonOpponents(teamId) {
  var cp = COUNTER_PLAY[teamId];
  if (!cp) return [];
  // Game 1: neutral matchup, Game 2: favorable (your OFF is strong vs their DEF), Game 3: tough (your OFF is weak vs their DEF)
  return [cp.neutral, cp.strong, cp.weak];
}
