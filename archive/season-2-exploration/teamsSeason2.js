/**
 * TORCH — Season 2 Team Definitions (not yet live)
 *
 * These four teams are designed and their logos are committed to
 * src/assets/icons/teamLogos.js, but they are NOT merged into the live
 * TEAMS object in src/data/teams.js — the dev game runs with the original
 * 4 teams only. When Season 2 mode is ready, merge SEASON_2_TEAMS into TEAMS.
 *
 * Palette system: every team owns a distinct thermal × saturation cell.
 *   - Pronghorns   Mixed · Mid   Forest + Amber
 *   - Salamanders  Hot · Max     Fauvist Triadic
 *   - Maples       Warm · LOW    Wine + Plum
 *   - Raccoons     COOL + focal  Silver + Amber Eye
 */

export const SEASON_2_TEAMS = {
  pronghorns: {
    id: 'pronghorns',
    name: 'PRONGHORNS',
    school: 'Cedar Creek Agricultural',
    mascot: 'Pronghorns',
    abbr: 'CED',
    accent: '#F59E0B', icon: '',
    colors: { primary: '#166534', secondary: '#F59E0B' },
    helmet: { base: '#166534', facemask: '#F59E0B', stripe: '#FCD34D' },
    motto: 'Outrun The Horizon',
    offScheme: 'ZONE READ SPREAD',
    defScheme: 'QUARTERS MATCH',
    ratings: { offense: 4, defense: 3 },
    vibe: 'Fast. Precise. Relentless.',
    season: 2,
    celebration: {
      colors: ['#F59E0B', '#166534', '#FEF3C7', '#FCD34D'],
      phrases: ['CEDAR RUNS!', 'SECOND LEVEL, GONE!', 'OUTRUN THE HORIZON!']
    }
  },
  salamanders: {
    id: 'salamanders',
    name: 'SALAMANDERS',
    school: 'Ashland Polytechnic',
    mascot: 'Salamanders',
    abbr: 'ASH',
    accent: '#F39C12', icon: '',
    colors: { primary: '#2ECC71', secondary: '#E84393' },
    helmet: { base: '#186A3B', facemask: '#E84393', stripe: '#F39C12' },
    motto: 'Loud On Purpose',
    offScheme: 'PISTOL RPO',
    defScheme: 'MULTIPLE FRONT',
    ratings: { offense: 4, defense: 3 },
    vibe: 'Saturated. Audacious. Unmistakable.',
    season: 2,
    celebration: {
      colors: ['#2ECC71', '#E84393', '#F39C12', '#F1C40F'],
      phrases: ['LOUD ON PURPOSE!', 'EVERY COLOR AT ONCE!', 'ASHLAND STRIKES!']
    }
  },
  maples: {
    id: 'maples',
    name: 'MAPLES',
    school: 'Autumnvale Northern',
    mascot: 'Maples',
    abbr: 'AVN',
    accent: '#D97706', icon: '',
    colors: { primary: '#7A1E2E', secondary: '#D97706' },
    helmet: { base: '#7A1E2E', facemask: '#FCD34D', stripe: '#2E0A14' },
    motto: 'Trust The Harvest',
    offScheme: 'PRO STYLE',
    defScheme: 'BEND-NOT-BREAK',
    ratings: { offense: 3, defense: 4 },
    vibe: 'Traditional. Disciplined. Timeless.',
    season: 2,
    celebration: {
      colors: ['#7A1E2E', '#D97706', '#FCD34D', '#FDF4D4'],
      phrases: ['TRUST THE HARVEST!', 'OLD BALL!', 'THE LEAVES KNOW!']
    }
  },
  raccoons: {
    id: 'raccoons',
    name: 'RACCOONS',
    school: 'Moonshine Creek State',
    mascot: 'Raccoons',
    abbr: 'MCR',
    accent: '#FF8C00', icon: '',
    colors: { primary: '#D4D4D8', secondary: '#FF8C00' },
    helmet: { base: '#27272A', facemask: '#D4D4D8', stripe: '#FF8C00' },
    motto: "What's Yours Is Ours",
    offScheme: 'WILDCAT HYBRID',
    defScheme: 'ZONE BLITZ',
    ratings: { offense: 3, defense: 4 },
    vibe: 'Sly. Opportunistic. Unbothered.',
    season: 2,
    celebration: {
      colors: ['#D4D4D8', '#FF8C00', '#F4F4F5', '#27272A'],
      phrases: ["WHAT'S YOURS IS OURS!", 'CHECK THE TAPE!', 'LIGHTS OUT!']
    }
  },
};
