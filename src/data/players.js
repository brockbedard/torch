/**
 * TORCH v0.26.1 — Player Rosters
 * 4 teams × (7 offense + 7 defense) = 56 players.
 * New data model: stars (1-5), trait (keyword), st (special teams ratings).
 * Backward-compatible: retains ovr, badge, isStar, num, ability fields.
 */

// ============================================================
// RIDGEMONT BOARS — Power Spread: Strong OL, power RB, balanced WR
// ============================================================
export const SENTINELS_OFFENSE = [
  { id: 'rdg_o1', name: 'Henderson', firstName: 'Marcus', pos: 'RB', ovr: 84, badge: 'HELMET', isStar: true, starTitle: 'The Freight Train', num: 34, ability: 'Breaks arm tackles', stars: 5, trait: 'TRUCK STICK', side: 'offense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'rdg_o2', name: 'Calloway', firstName: 'Jordan', pos: 'QB', ovr: 80, badge: 'CROSSHAIR', isStar: false, num: 7, ability: 'Pinpoint accuracy in rhythm', stars: 4, trait: 'DEEP BALL', side: 'offense', team: 'sentinels', st: { kickPower: 2, kickAccuracy: 3, returnAbility: 1 } },
  { id: 'rdg_o3', name: 'Monroe', firstName: 'DeVante', pos: 'WR', ovr: 80, badge: 'SPEED_LINES', isStar: false, num: 1, ability: 'Burns man coverage deep', stars: 4, trait: 'BURNER', side: 'offense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 5 } },
  { id: 'rdg_o4', name: 'Frazier', firstName: 'Tyrell', pos: 'WR', ovr: 76, badge: 'FOOTBALL', isStar: false, num: 4, ability: 'Reliable hands in traffic', stars: 3, trait: 'ROUTE IQ', side: 'offense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'rdg_o5', name: 'Walsh', firstName: 'Connor', pos: 'TE', ovr: 76, badge: 'GLOVE', isStar: false, num: 82, ability: 'Mismatch in the seam', stars: 3, trait: 'MISMATCH', side: 'offense', team: 'sentinels', st: { kickPower: 2, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'rdg_o6', name: 'Davis', firstName: 'Terrence', pos: 'OL', ovr: 80, badge: 'BRICK', isStar: false, num: 65, ability: 'Clears the path for the run game', stars: 4, trait: 'ROAD GRADER', side: 'offense', team: 'sentinels', st: { kickPower: 5, kickAccuracy: 2, returnAbility: 1 } },
  { id: 'rdg_o7', name: 'Thompson', firstName: 'Bryce', pos: 'OL', ovr: 80, badge: 'BRICK', isStar: false, num: 72, ability: 'Anchors the pocket', stars: 4, trait: 'BRICK WALL', side: 'offense', team: 'sentinels', st: { kickPower: 3, kickAccuracy: 3, returnAbility: 1 } },
];

export const SENTINELS_DEFENSE = [
  { id: 'rdg_d1', name: 'Tillery', firstName: 'Jalen', pos: 'CB', ovr: 84, badge: 'PADLOCK', isStar: true, starTitle: 'The Lockdown', num: 2, ability: 'Lockdown in press coverage', stars: 5, trait: 'SHUTDOWN', side: 'defense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 4 } },
  { id: 'rdg_d2', name: 'Reeves', firstName: 'Darius', pos: 'S', ovr: 80, badge: 'EYE', isStar: false, num: 21, ability: 'Ball hawk — reads the QB', stars: 4, trait: 'BALL HAWK', side: 'defense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 2, returnAbility: 3 } },
  { id: 'rdg_d3', name: 'Creed', firstName: 'Nolan', pos: 'CB', ovr: 78, badge: 'PADLOCK', isStar: false, num: 5, ability: 'Physical at the line of scrimmage', stars: 4, trait: 'PRESS CORNER', side: 'defense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'rdg_d4', name: 'Obi', firstName: 'Chukwuma', pos: 'S', ovr: 76, badge: 'SPEED_LINES', isStar: false, num: 33, ability: 'Big hitter in the box', stars: 3, trait: 'ENFORCER', side: 'defense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'rdg_d5', name: 'Clay', firstName: 'Rashad', pos: 'LB', ovr: 76, badge: 'HELMET', isStar: false, num: 44, ability: 'Plugs every gap', stars: 3, trait: 'TACKLER', side: 'defense', team: 'sentinels', st: { kickPower: 2, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'rdg_d6', name: 'Torres', firstName: 'Miguel', pos: 'DL', ovr: 76, badge: 'BRICK', isStar: false, num: 95, ability: 'Plugs gaps and eats blocks', stars: 3, trait: 'RUN STUFFER', side: 'defense', team: 'sentinels', st: { kickPower: 4, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'rdg_d7', name: 'Nakamura', firstName: 'Kenji', pos: 'DL', ovr: 72, badge: 'SPEED_LINES', isStar: false, num: 90, ability: 'Quick off the snap', stars: 2, trait: 'PASS RUSHER', side: 'defense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 1 } },
];

// ============================================================
// CORAL BAY DOLPHINS — Spread Option: ESCAPE ARTIST QB, fast skill players, weaker OL
// ============================================================
export const WOLVES_OFFENSE = [
  { id: 'npa_o1', name: 'Briggs', firstName: 'Jayden', pos: 'QB', ovr: 84, badge: 'CLEAT', isStar: true, starTitle: 'The Magician', num: 12, ability: 'Escapes pressure and creates', stars: 5, trait: 'ESCAPE ARTIST', side: 'offense', team: 'wolves', st: { kickPower: 2, kickAccuracy: 2, returnAbility: 4 } },
  { id: 'npa_o2', name: 'Thorne', firstName: 'Malik', pos: 'RB', ovr: 80, badge: 'HELMET', isStar: false, num: 34, ability: 'Breaks arm tackles', stars: 4, trait: 'ELUSIVE', side: 'offense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 5 } },
  { id: 'npa_o3', name: 'Quick', firstName: 'Tavon', pos: 'WR', ovr: 78, badge: 'SPEED_LINES', isStar: false, num: 6, ability: 'Explosive after the catch', stars: 4, trait: 'YAC BEAST', side: 'offense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 4 } },
  { id: 'npa_o4', name: 'Hargrove', firstName: 'Dante', pos: 'WR', ovr: 76, badge: 'SPEED_LINES', isStar: false, num: 22, ability: 'Gets to the edge fast', stars: 3, trait: 'BURNER', side: 'offense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'npa_o5', name: 'Ballard', firstName: 'Corey', pos: 'RB', ovr: 74, badge: 'CLEAT', isStar: false, num: 8, ability: 'Catches out of the backfield', stars: 3, trait: 'PASS CATCHER', side: 'offense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'npa_o6', name: 'Okafor', firstName: 'Emeka', pos: 'TE', ovr: 74, badge: 'BRICK', isStar: false, num: 45, ability: 'Blocks and catches', stars: 3, trait: 'PASS CATCHER', side: 'offense', team: 'wolves', st: { kickPower: 3, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'npa_o7', name: 'Maddox', firstName: 'Elijah', pos: 'OL', ovr: 72, badge: 'BRICK', isStar: false, num: 72, ability: 'Does his best out there', stars: 2, trait: 'ANCHOR', side: 'offense', team: 'wolves', st: { kickPower: 4, kickAccuracy: 3, returnAbility: 1 } },
];

export const WOLVES_DEFENSE = [
  { id: 'npa_d1', name: 'Ledford', firstName: 'Trevon', pos: 'LB', ovr: 84, badge: 'HELMET', isStar: true, starTitle: 'The General', num: 55, ability: 'Reads and reacts instantly', stars: 5, trait: 'TACKLER', side: 'defense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'npa_d2', name: 'McBride', firstName: 'Patrick', pos: 'LB', ovr: 78, badge: 'EYE', isStar: false, num: 42, ability: 'Plugs every gap', stars: 4, trait: 'RUN STUFFER', side: 'defense', team: 'wolves', st: { kickPower: 2, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'npa_d3', name: 'Posey', firstName: 'Kamari', pos: 'S', ovr: 78, badge: 'EYE', isStar: false, num: 27, ability: 'Plays the deep half', stars: 4, trait: 'CENTERFIELDER', side: 'defense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 2, returnAbility: 3 } },
  { id: 'npa_d4', name: 'Baskins', firstName: 'Roderick', pos: 'DL', ovr: 76, badge: 'BRICK', isStar: false, num: 95, ability: 'Collapses the pocket', stars: 3, trait: 'INTERIOR BULL', side: 'defense', team: 'wolves', st: { kickPower: 3, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'npa_d5', name: 'Mercer', firstName: 'Quinton', pos: 'CB', ovr: 76, badge: 'PADLOCK', isStar: false, num: 3, ability: 'Sticky in zone coverage', stars: 3, trait: 'ZONE READER', side: 'defense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'npa_d6', name: 'Kline', firstName: 'Travis', pos: 'S', ovr: 72, badge: 'CLIPBOARD', isStar: false, num: 18, ability: 'Comes downhill to stop the run', stars: 2, trait: 'RUN SUPPORT', side: 'defense', team: 'wolves', st: { kickPower: 5, kickAccuracy: 4, returnAbility: 1 } },
  { id: 'npa_d7', name: 'Simms', firstName: 'Andre', pos: 'DL', ovr: 74, badge: 'SPEED_LINES', isStar: false, num: 91, ability: 'Speed rush from the outside', stars: 3, trait: 'EDGE SPEED', side: 'defense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 1 } },
];

// ============================================================
// HOLLOWRIDGE SPECTRES — Air Raid: DEEP BALL QB, BURNER + ROUTE IQ WRs, weak run game
// ============================================================
export const SPECTRES_OFFENSE = [
  { id: 'crv_o1', name: 'Strand', firstName: 'Colton', pos: 'QB', ovr: 84, badge: 'CROSSHAIR', isStar: true, starTitle: 'The Cannon', num: 1, ability: 'Throws the deep ball with accuracy', stars: 5, trait: 'DEEP BALL', side: 'offense', team: 'stags', st: { kickPower: 3, kickAccuracy: 4, returnAbility: 1 } },
  { id: 'crv_o2', name: 'DaCosta', firstName: 'Rafael', pos: 'WR', ovr: 84, badge: 'SPEED_LINES', isStar: false, num: 11, ability: 'Burns man coverage deep', stars: 5, trait: 'BURNER', side: 'offense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 5 } },
  { id: 'crv_o3', name: 'Booker', firstName: 'Kendrick', pos: 'WR', ovr: 80, badge: 'FOOTBALL', isStar: false, num: 9, ability: 'Crisp routes get him open', stars: 4, trait: 'ROUTE IQ', side: 'offense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'crv_o4', name: 'Cortland', firstName: 'Isaiah', pos: 'RB', ovr: 74, badge: 'CLEAT', isStar: false, num: 25, ability: 'Catches out of the backfield', stars: 3, trait: 'PASS CATCHER', side: 'offense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 4 } },
  { id: 'crv_o5', name: 'Vance', firstName: 'Deion', pos: 'WR', ovr: 76, badge: 'GLOVE', isStar: false, num: 82, ability: 'Wins the contested catch', stars: 3, trait: 'CONTESTED CATCH', side: 'offense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'crv_o6', name: 'Odom', firstName: 'Jamal', pos: 'OL', ovr: 72, badge: 'BRICK', isStar: false, num: 68, ability: 'Holds the point of attack', stars: 2, trait: 'ANCHOR', side: 'offense', team: 'stags', st: { kickPower: 4, kickAccuracy: 2, returnAbility: 1 } },
  { id: 'crv_o7', name: 'Reyes', firstName: 'Carlos', pos: 'TE', ovr: 72, badge: 'BRICK', isStar: false, num: 28, ability: 'Blocks when asked', stars: 2, trait: 'ROAD GRADER', side: 'offense', team: 'stags', st: { kickPower: 2, kickAccuracy: 1, returnAbility: 1 } },
];

export const SPECTRES_DEFENSE = [
  { id: 'crv_d1', name: 'Blackwell', firstName: 'Zion', pos: 'DL', ovr: 84, badge: 'SPEED_LINES', isStar: true, starTitle: 'Chaos', num: 99, ability: 'Unblockable off the edge', stars: 5, trait: 'EDGE SPEED', side: 'defense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'crv_d2', name: 'Tate', firstName: 'Lamar', pos: 'LB', ovr: 80, badge: 'SPEED_LINES', isStar: false, num: 52, ability: 'Dangerous on designed blitzes', stars: 4, trait: 'BLITZ SPECIALIST', side: 'defense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'crv_d3', name: 'Ross', firstName: 'Xavier', pos: 'CB', ovr: 78, badge: 'PADLOCK', isStar: false, num: 24, ability: 'Physical at the line', stars: 4, trait: 'PRESS CORNER', side: 'defense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'crv_d4', name: 'Shields', firstName: 'Devon', pos: 'LB', ovr: 76, badge: 'HELMET', isStar: false, num: 41, ability: 'Covers backs and tight ends', stars: 3, trait: 'COVERAGE LB', side: 'defense', team: 'stags', st: { kickPower: 2, kickAccuracy: 2, returnAbility: 1 } },
  { id: 'crv_d5', name: 'Holbrook', firstName: 'Nathan', pos: 'DL', ovr: 76, badge: 'BRICK', isStar: false, num: 93, ability: 'Two-gaps and eats blocks', stars: 3, trait: 'RUN STUFFER', side: 'defense', team: 'stags', st: { kickPower: 5, kickAccuracy: 3, returnAbility: 1 } },
  { id: 'crv_d6', name: 'Beckett', firstName: 'Tre', pos: 'S', ovr: 74, badge: 'EYE', isStar: false, num: 15, ability: 'Reads the QB pre-snap', stars: 3, trait: 'BALL HAWK', side: 'defense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'crv_d7', name: 'Kane', firstName: 'Desmond', pos: 'CB', ovr: 72, badge: 'EYE', isStar: false, num: 37, ability: 'Reads the QB eyes in zone', stars: 2, trait: 'ZONE READER', side: 'defense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 1 } },
];

// ============================================================
// BLACKWATER SERPENTS — Multiple/Pro: balanced 3-4 stars, versatile, no single star
// ============================================================
export const SERPENTS_OFFENSE = [
  { id: 'bws_o1', name: 'Ash', firstName: 'Caleb', pos: 'QB', ovr: 80, badge: 'CROSSHAIR', isStar: true, starTitle: 'The Conductor', num: 10, ability: 'Quick release, sharp reads', stars: 4, trait: 'QUICK RELEASE', side: 'offense', team: 'serpents', st: { kickPower: 2, kickAccuracy: 3, returnAbility: 2 } },
  { id: 'bws_o2', name: 'Hayward', firstName: 'Keenan', pos: 'WR', ovr: 80, badge: 'GLOVE', isStar: false, num: 3, ability: 'Sure hands in traffic', stars: 4, trait: 'SURE HANDS', side: 'offense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'bws_o3', name: 'Dupree', firstName: 'Marquise', pos: 'WR', ovr: 78, badge: 'SPEED_LINES', isStar: false, num: 88, ability: 'Stretches the field deep', stars: 4, trait: 'CONTESTED CATCH', side: 'offense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'bws_o4', name: 'Slade', firstName: 'Derrick', pos: 'RB', ovr: 76, badge: 'HELMET', isStar: false, num: 7, ability: 'Yards after contact', stars: 3, trait: 'POWER BACK', side: 'offense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 4 } },
  { id: 'bws_o5', name: 'Cortez', firstName: 'Alejandro', pos: 'OL', ovr: 76, badge: 'BRICK', isStar: false, num: 75, ability: 'Pass-pro specialist', stars: 3, trait: 'BRICK WALL', side: 'offense', team: 'serpents', st: { kickPower: 3, kickAccuracy: 4, returnAbility: 1 } },
  { id: 'bws_o6', name: 'Moreno', firstName: 'Gabriel', pos: 'TE', ovr: 76, badge: 'GLOVE', isStar: false, num: 19, ability: 'Reliable receiving target', stars: 3, trait: 'PASS CATCHER', side: 'offense', team: 'serpents', st: { kickPower: 2, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'bws_o7', name: 'Osei', firstName: 'Kwame', pos: 'QB', ovr: 74, badge: 'CROSSHAIR', isStar: false, num: 14, ability: 'Sells the fake, freezes linebackers', stars: 3, trait: 'PLAY ACTION PRO', side: 'offense', team: 'serpents', st: { kickPower: 2, kickAccuracy: 2, returnAbility: 2 } },
];

export const SERPENTS_DEFENSE = [
  { id: 'bws_d1', name: 'Vega', firstName: 'Mateo', pos: 'S', ovr: 80, badge: 'CLIPBOARD', isStar: true, starTitle: 'The Eraser', num: 6, ability: 'Ball hawk — reads the QB', stars: 4, trait: 'BALL HAWK', side: 'defense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 2, returnAbility: 4 } },
  { id: 'bws_d2', name: 'Whitaker', firstName: 'Jaylen', pos: 'CB', ovr: 80, badge: 'PADLOCK', isStar: false, num: 23, ability: 'Mirrors every route', stars: 4, trait: 'SHUTDOWN', side: 'defense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'bws_d3', name: 'Bishop', firstName: 'Deandre', pos: 'LB', ovr: 78, badge: 'HELMET', isStar: false, num: 50, ability: 'Covers backs and tight ends', stars: 4, trait: 'COVERAGE LB', side: 'defense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'bws_d4', name: 'Baptiste', firstName: 'Jean-Pierre', pos: 'CB', ovr: 76, badge: 'EYE', isStar: false, num: 31, ability: 'Reads the QB eyes in zone', stars: 3, trait: 'ZONE READER', side: 'defense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'bws_d5', name: 'Langford', firstName: 'Terrance', pos: 'S', ovr: 76, badge: 'CLIPBOARD', isStar: false, num: 20, ability: 'Comes downhill to stop the run', stars: 3, trait: 'RUN SUPPORT', side: 'defense', team: 'serpents', st: { kickPower: 3, kickAccuracy: 5, returnAbility: 1 } },
  { id: 'bws_d6', name: 'Collins', firstName: 'Jarvis', pos: 'DL', ovr: 76, badge: 'SPEED_LINES', isStar: false, num: 92, ability: 'Gets to the QB', stars: 3, trait: 'PASS RUSHER', side: 'defense', team: 'serpents', st: { kickPower: 2, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'bws_d7', name: 'Pruitt', firstName: 'Brandon', pos: 'LB', ovr: 74, badge: 'EYE', isStar: false, num: 48, ability: 'Fills gaps and stops the run', stars: 3, trait: 'RUN STUFFER', side: 'defense', team: 'serpents', st: { kickPower: 4, kickAccuracy: 2, returnAbility: 1 } },
];

// ============================================================
// LOOKUP HELPERS
// ============================================================
var _rosters = {
  sentinels: { offense: SENTINELS_OFFENSE, defense: SENTINELS_DEFENSE },
  wolves:    { offense: WOLVES_OFFENSE, defense: WOLVES_DEFENSE },
  stags:     { offense: SPECTRES_OFFENSE, defense: SPECTRES_DEFENSE },
  serpents:  { offense: SERPENTS_OFFENSE, defense: SERPENTS_DEFENSE },
};

export function getOffenseRoster(teamId) {
  return _rosters[teamId] ? _rosters[teamId].offense : [];
}

export function getDefenseRoster(teamId) {
  return _rosters[teamId] ? _rosters[teamId].defense : [];
}

export function getFullRoster(teamId) {
  return [...getOffenseRoster(teamId), ...getDefenseRoster(teamId)];
}

export function getStarters(roster) {
  return roster.slice(0, 4);
}

export function getBench(roster) {
  return roster.slice(4);
}
