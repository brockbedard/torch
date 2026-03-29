/**
 * TORCH — Custom Team Creator
 * Create and manage custom teams. Stored in localStorage.
 */

var CUSTOM_TEAMS_KEY = 'torch_custom_teams';

// Position pools for random generation
var FIRST_NAMES = {
  QB: ['Marcus', 'Jayden', 'Caleb', 'Darius', 'Trey', 'Jalen', 'Cole', 'Bryce'],
  RB: ['DeShawn', 'Malik', 'Terrence', 'Andre', 'Keyon', 'Isaiah', 'Dante', 'Rashad'],
  WR: ['DaCosta', 'Tyler', 'Amari', 'Jaelen', 'Kendrick', 'Devante', 'Elijah', 'Xavier'],
  TE: ['Mason', 'Jackson', 'Cooper', 'Tanner', 'Blake', 'Austin', 'Luke', 'Nolan'],
  DL: ['Tyrone', 'Jabari', 'Cortland', 'Demetrius', 'Kwame', 'Rasheem', 'Bruno', 'Knox'],
  LB: ['Landon', 'Trent', 'Micah', 'Derrick', 'Chase', 'Stone', 'Garrett', 'Koa'],
  CB: ['Jaylen', 'Tariq', 'Aiden', 'Sincere', 'Keenan', 'Malachi', 'Zion', 'Quentin'],
  S: ['Jordan', 'Daxton', 'Ezra', 'Kingston', 'Roman', 'Phoenix', 'Atlas', 'Sterling'],
};

var LAST_NAMES = ['Williams', 'Johnson', 'Davis', 'Brown', 'Wilson', 'Thomas', 'Jackson', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Torres', 'Hill', 'Green', 'Adams', 'Nelson', 'Baker', 'Gonzalez', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell'];

var TRAITS_BY_POS = {
  QB: ['DEEP BALL', 'QUICK RELEASE', 'ESCAPE ARTIST', 'PLAY ACTION PRO'],
  RB: ['TRUCK STICK', 'ELUSIVE', 'YAC BEAST', 'PASS CATCHER'],
  WR: ['BURNER', 'ROUTE IQ', 'CONTESTED CATCH', 'MISMATCH'],
  TE: ['PASS CATCHER', 'ROAD GRADER', 'MISMATCH', 'YAC BEAST'],
  DL: ['PASS RUSHER', 'INTERIOR BULL', 'RUN STUFFER', 'EDGE SPEED'],
  LB: ['BLITZ SPECIALIST', 'COVERAGE LB', 'TACKLER', 'RUN SUPPORT'],
  CB: ['SHUTDOWN', 'BALL HAWK', 'PRESS CORNER', 'ZONE READER'],
  S: ['CENTERFIELDER', 'ENFORCER', 'BALL HAWK', 'RUN SUPPORT'],
};

var SCHEME_OPTIONS = [
  { id: 'power_spread', name: 'POWER SPREAD', desc: 'Run-first. Physical. Patient football.' },
  { id: 'spread_option', name: 'SPREAD OPTION', desc: 'Speed kills. Ride the current.' },
  { id: 'air_raid', name: 'AIR RAID', desc: 'Explosive. Outscore everyone.' },
  { id: 'multiple', name: 'MULTIPLE', desc: 'Cerebral. Death by paper cuts.' },
  { id: 'run_and_shoot', name: 'RUN AND SHOOT', desc: 'All gas. No brakes.' },
  { id: 'pro_style', name: 'PRO STYLE', desc: 'Balanced. Disciplined. Smart football.' },
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/**
 * Generate a random player for a given position.
 */
function generatePlayer(pos, side, teamId, idx) {
  var posGroup = pos === 'DE' ? 'DL' : pos;
  var firstName = pick(FIRST_NAMES[posGroup] || FIRST_NAMES.WR);
  var lastName = pick(LAST_NAMES);
  var stars = Math.max(1, Math.min(5, Math.round(2.5 + (Math.random() - 0.5) * 3)));
  var trait = pick(TRAITS_BY_POS[posGroup] || TRAITS_BY_POS.WR);
  var num = 1 + Math.floor(Math.random() * 99);

  return {
    id: teamId + '_' + side[0] + (idx + 1),
    firstName: firstName,
    name: firstName + ' ' + lastName,
    num: num,
    pos: pos,
    ovr: 60 + stars * 5 + Math.floor(Math.random() * 10),
    badge: '',
    stars: stars,
    trait: trait,
    isStar: stars >= 5,
    starTitle: stars >= 5 ? 'The ' + trait.split(' ')[0] : undefined,
    side: side,
    team: teamId,
    ability: trait,
    st: {
      kickPower: 1 + Math.floor(Math.random() * 5),
      kickAccuracy: 1 + Math.floor(Math.random() * 5),
      returnAbility: 1 + Math.floor(Math.random() * 5),
    },
  };
}

/**
 * Generate a full 14-player roster for a custom team.
 */
export function generateRoster(teamId) {
  var offPositions = ['QB', 'RB', 'WR', 'WR', 'WR', 'TE', 'WR'];
  var defPositions = ['DL', 'DL', 'DL', 'LB', 'CB', 'CB', 'S'];

  var offense = offPositions.map(function(pos, i) { return generatePlayer(pos, 'offense', teamId, i); });
  var defense = defPositions.map(function(pos, i) { return generatePlayer(pos, 'defense', teamId, i); });

  // Ensure at least one 5-star player per side
  if (!offense.some(function(p) { return p.stars >= 5; })) { offense[0].stars = 5; offense[0].isStar = true; }
  if (!defense.some(function(p) { return p.stars >= 5; })) { defense[0].stars = 5; defense[0].isStar = true; }

  return { offense: offense, defense: defense };
}

/**
 * Create a custom team definition.
 */
export function createCustomTeam(opts) {
  var teamId = 'custom_' + Date.now();
  var roster = generateRoster(teamId);

  var schemeObj = opts.scheme ? SCHEME_OPTIONS.find(function(s) { return s.id === opts.scheme; }) : null;

  var team = {
    id: teamId,
    name: (opts.name || 'CUSTOM').toUpperCase(),
    school: opts.school || 'Custom University',
    mascot: opts.mascot || opts.name || 'Custom',
    abbr: (opts.name || 'CUS').substring(0, 3).toUpperCase(),
    accent: opts.accent || '#EBB010',
    colors: {
      primary: opts.primaryColor || '#333333',
      secondary: opts.accent || '#EBB010',
    },
    helmet: {
      base: opts.primaryColor || '#333333',
      facemask: opts.accent || '#EBB010',
      stripe: opts.accent || '#EBB010',
    },
    motto: opts.motto || 'Built different.',
    offScheme: schemeObj ? schemeObj.name : 'POWER SPREAD',
    defScheme: 'PRESS MAN',
    ratings: { offense: 3, defense: 3 },
    vibe: opts.vibe || 'Custom-built. Ready to compete.',
    isCustom: true,
    roster: roster,
    created: Date.now(),
  };

  return team;
}

/**
 * Save a custom team to localStorage.
 */
export function saveCustomTeam(team) {
  var teams = getCustomTeams();
  // Replace if exists, otherwise add
  var idx = teams.findIndex(function(t) { return t.id === team.id; });
  if (idx >= 0) teams[idx] = team;
  else teams.push(team);
  try { localStorage.setItem(CUSTOM_TEAMS_KEY, JSON.stringify(teams)); } catch(e) {}
}

/**
 * Get all saved custom teams.
 */
export function getCustomTeams() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_TEAMS_KEY) || '[]'); } catch(e) { return []; }
}

/**
 * Delete a custom team.
 */
export function deleteCustomTeam(teamId) {
  var teams = getCustomTeams().filter(function(t) { return t.id !== teamId; });
  try { localStorage.setItem(CUSTOM_TEAMS_KEY, JSON.stringify(teams)); } catch(e) {}
}

/**
 * Get available color presets.
 */
export function getColorPresets() {
  return [
    { name: 'Crimson & Gold', primary: '#8B0000', accent: '#C4A265' },
    { name: 'Navy & Silver', primary: '#1B2838', accent: '#C0C0C0' },
    { name: 'Purple & Neon', primary: '#2E0854', accent: '#39FF14' },
    { name: 'Black & Orange', primary: '#1A1A1A', accent: '#FF6B00' },
    { name: 'Forest & White', primary: '#1A4D2E', accent: '#FFFFFF' },
    { name: 'Royal & Gold', primary: '#1A237E', accent: '#FFD700' },
    { name: 'Maroon & Teal', primary: '#6B0000', accent: '#00CED1' },
    { name: 'Slate & Fire', primary: '#2F4F4F', accent: '#FF4511' },
  ];
}

export { SCHEME_OPTIONS };
