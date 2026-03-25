/**
 * TORCH v0.21 — Team Definitions
 * 4 fictional college football teams with distinct identities.
 * Colors, helmets, ratings, schemes — visual + gameplay identity.
 */

export const TEAMS = {
  sentinels: {
    id: 'sentinels',
    name: 'BOARS',
    school: 'Ridgemont',
    mascot: 'Boars',
    abbr: 'RB',
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
    name: 'WOLVES',
    school: 'Northern Pines',
    mascot: 'Wolves',
    abbr: 'NP',
    accent: '#C0C0C0', icon: '',
    colors: { primary: '#1A1A2E', secondary: '#C0C0C0' },
    helmet: { base: '#1A1A2E', facemask: '#C0C0C0', stripe: '#8B0000' },
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
