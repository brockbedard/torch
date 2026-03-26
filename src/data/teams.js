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
    offScheme: 'POWER SPREAD',
    defScheme: 'PRESS MAN',
    ratings: { offense: 4, defense: 3 },
    vibe: 'Run-first. Physical. Patient football.',
  },
  wolves: {
    id: 'wolves',
    name: 'DOLPHINS',
    school: 'Coral Bay',
    mascot: 'Dolphins',
    abbr: 'CB',
    accent: '#FF7EB3', icon: '',
    colors: { primary: '#E8548F', secondary: '#FF7EB3' },
    helmet: { base: '#E8548F', facemask: '#FF7EB3', stripe: '#8B2252' },
    motto: 'Ride The Current',
    offScheme: 'SPREAD OPTION',
    defScheme: 'COVER 1 + SPY',
    ratings: { offense: 3, defense: 4 },
    vibe: 'Relentless. Speed kills. Ride the current.',
  },
  stags: {
    id: 'stags',
    name: 'SPECTRES',
    school: 'Hollowridge',
    mascot: 'Spectres',
    abbr: 'HLR',
    accent: '#85C1E9', icon: '',
    colors: { primary: '#5DADE2', secondary: '#1B4F72' },
    helmet: { base: '#5DADE2', facemask: '#1B4F72', stripe: '#85C1E9' },
    motto: 'Strike From The Shadows',
    offScheme: 'SPREAD RPO',
    defScheme: 'COVER 0 BLITZ',
    ratings: { offense: 5, defense: 2 },
    vibe: 'Explosive. Electric. Outscore everyone.',
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
// Circular: Sentinels > Serpents > Spectres > Wolves > Sentinels
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
