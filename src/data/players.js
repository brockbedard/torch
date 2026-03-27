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
  { id: 'rdg_o1', name: 'Henderson', pos: 'RB', ovr: 84, badge: 'HELMET', isStar: true, starTitle: 'The Freight Train', num: 34, ability: 'Breaks arm tackles', stars: 5, trait: 'TRUCK STICK', side: 'offense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'rdg_o2', name: 'Calloway', pos: 'QB', ovr: 80, badge: 'CROSSHAIR', isStar: false, num: 7, ability: 'Pinpoint accuracy in rhythm', stars: 4, trait: 'DEEP BALL', side: 'offense', team: 'sentinels', st: { kickPower: 2, kickAccuracy: 3, returnAbility: 1 } },
  { id: 'rdg_o3', name: 'Monroe', pos: 'WR', ovr: 80, badge: 'SPEED_LINES', isStar: false, num: 1, ability: 'Burns man coverage deep', stars: 4, trait: 'BURNER', side: 'offense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 5 } },
  { id: 'rdg_o4', name: 'Frazier', pos: 'WR', ovr: 76, badge: 'FOOTBALL', isStar: false, num: 4, ability: 'Reliable hands in traffic', stars: 3, trait: 'ROUTE IQ', side: 'offense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'rdg_o5', name: 'Walsh', pos: 'TE', ovr: 76, badge: 'GLOVE', isStar: false, num: 82, ability: 'Mismatch in the seam', stars: 3, trait: 'MISMATCH', side: 'offense', team: 'sentinels', st: { kickPower: 2, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'rdg_o6', name: 'Davis', pos: 'OL', ovr: 80, badge: 'BRICK', isStar: false, num: 65, ability: 'Clears the path for the run game', stars: 4, trait: 'ROAD GRADER', side: 'offense', team: 'sentinels', st: { kickPower: 5, kickAccuracy: 2, returnAbility: 1 } },
  { id: 'rdg_o7', name: 'Thompson', pos: 'OL', ovr: 80, badge: 'BRICK', isStar: false, num: 72, ability: 'Anchors the pocket', stars: 4, trait: 'BRICK WALL', side: 'offense', team: 'sentinels', st: { kickPower: 3, kickAccuracy: 3, returnAbility: 1 } },
];

export const SENTINELS_DEFENSE = [
  { id: 'rdg_d1', name: 'Tillery', pos: 'CB', ovr: 84, badge: 'PADLOCK', isStar: true, starTitle: 'The Lockdown', num: 2, ability: 'Lockdown in press coverage', stars: 5, trait: 'SHUTDOWN', side: 'defense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 4 } },
  { id: 'rdg_d2', name: 'Reeves', pos: 'S', ovr: 80, badge: 'EYE', isStar: false, num: 21, ability: 'Ball hawk — reads the QB', stars: 4, trait: 'BALL HAWK', side: 'defense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 2, returnAbility: 3 } },
  { id: 'rdg_d3', name: 'Creed', pos: 'CB', ovr: 78, badge: 'PADLOCK', isStar: false, num: 5, ability: 'Physical at the line of scrimmage', stars: 4, trait: 'PRESS CORNER', side: 'defense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'rdg_d4', name: 'Obi', pos: 'S', ovr: 76, badge: 'SPEED_LINES', isStar: false, num: 33, ability: 'Big hitter in the box', stars: 3, trait: 'ENFORCER', side: 'defense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'rdg_d5', name: 'Clay', pos: 'LB', ovr: 76, badge: 'HELMET', isStar: false, num: 44, ability: 'Plugs every gap', stars: 3, trait: 'TACKLER', side: 'defense', team: 'sentinels', st: { kickPower: 2, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'rdg_d6', name: 'Torres', pos: 'DL', ovr: 76, badge: 'BRICK', isStar: false, num: 95, ability: 'Plugs gaps and eats blocks', stars: 3, trait: 'RUN STUFFER', side: 'defense', team: 'sentinels', st: { kickPower: 4, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'rdg_d7', name: 'Nakamura', pos: 'DL', ovr: 72, badge: 'SPEED_LINES', isStar: false, num: 90, ability: 'Quick off the snap', stars: 2, trait: 'PASS RUSHER', side: 'defense', team: 'sentinels', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 1 } },
];

// ============================================================
// CORAL BAY DOLPHINS — Spread Option: ESCAPE ARTIST QB, fast skill players, weaker OL
// ============================================================
export const WOLVES_OFFENSE = [
  { id: 'npa_o1', name: 'Briggs', pos: 'QB', ovr: 84, badge: 'CLEAT', isStar: true, starTitle: 'The Magician', num: 12, ability: 'Escapes pressure and creates', stars: 5, trait: 'ESCAPE ARTIST', side: 'offense', team: 'wolves', st: { kickPower: 2, kickAccuracy: 2, returnAbility: 4 } },
  { id: 'npa_o2', name: 'Thorne', pos: 'RB', ovr: 80, badge: 'HELMET', isStar: false, num: 34, ability: 'Breaks arm tackles', stars: 4, trait: 'ELUSIVE', side: 'offense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 5 } },
  { id: 'npa_o3', name: 'Quick', pos: 'WR', ovr: 78, badge: 'SPEED_LINES', isStar: false, num: 6, ability: 'Explosive after the catch', stars: 4, trait: 'YAC BEAST', side: 'offense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 4 } },
  { id: 'npa_o4', name: 'Hargrove', pos: 'WR', ovr: 76, badge: 'SPEED_LINES', isStar: false, num: 22, ability: 'Gets to the edge fast', stars: 3, trait: 'BURNER', side: 'offense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'npa_o5', name: 'Ballard', pos: 'RB', ovr: 74, badge: 'CLEAT', isStar: false, num: 8, ability: 'Catches out of the backfield', stars: 3, trait: 'PASS CATCHER', side: 'offense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'npa_o6', name: 'Okafor', pos: 'TE', ovr: 74, badge: 'BRICK', isStar: false, num: 45, ability: 'Blocks and catches', stars: 3, trait: 'PASS CATCHER', side: 'offense', team: 'wolves', st: { kickPower: 3, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'npa_o7', name: 'Maddox', pos: 'OL', ovr: 72, badge: 'BRICK', isStar: false, num: 72, ability: 'Does his best out there', stars: 2, trait: 'ANCHOR', side: 'offense', team: 'wolves', st: { kickPower: 4, kickAccuracy: 3, returnAbility: 1 } },
];

export const WOLVES_DEFENSE = [
  { id: 'npa_d1', name: 'Ledford', pos: 'LB', ovr: 84, badge: 'HELMET', isStar: true, starTitle: 'The General', num: 55, ability: 'Reads and reacts instantly', stars: 5, trait: 'TACKLER', side: 'defense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'npa_d2', name: 'McBride', pos: 'LB', ovr: 78, badge: 'EYE', isStar: false, num: 42, ability: 'Plugs every gap', stars: 4, trait: 'RUN STUFFER', side: 'defense', team: 'wolves', st: { kickPower: 2, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'npa_d3', name: 'Posey', pos: 'S', ovr: 78, badge: 'EYE', isStar: false, num: 27, ability: 'Plays the deep half', stars: 4, trait: 'CENTERFIELDER', side: 'defense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 2, returnAbility: 3 } },
  { id: 'npa_d4', name: 'Baskins', pos: 'DL', ovr: 76, badge: 'BRICK', isStar: false, num: 95, ability: 'Collapses the pocket', stars: 3, trait: 'INTERIOR BULL', side: 'defense', team: 'wolves', st: { kickPower: 3, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'npa_d5', name: 'Mercer', pos: 'CB', ovr: 76, badge: 'PADLOCK', isStar: false, num: 3, ability: 'Sticky in zone coverage', stars: 3, trait: 'ZONE READER', side: 'defense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'npa_d6', name: 'Kline', pos: 'S', ovr: 72, badge: 'CLIPBOARD', isStar: false, num: 18, ability: 'Comes downhill to stop the run', stars: 2, trait: 'RUN SUPPORT', side: 'defense', team: 'wolves', st: { kickPower: 5, kickAccuracy: 4, returnAbility: 1 } },
  { id: 'npa_d7', name: 'Simms', pos: 'DL', ovr: 74, badge: 'SPEED_LINES', isStar: false, num: 91, ability: 'Speed rush from the outside', stars: 3, trait: 'EDGE SPEED', side: 'defense', team: 'wolves', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 1 } },
];

// ============================================================
// HOLLOWRIDGE SPECTRES — Air Raid: DEEP BALL QB, BURNER + ROUTE IQ WRs, weak run game
// ============================================================
export const SPECTRES_OFFENSE = [
  { id: 'crv_o1', name: 'Strand', pos: 'QB', ovr: 84, badge: 'CROSSHAIR', isStar: true, starTitle: 'The Cannon', num: 1, ability: 'Throws the deep ball with accuracy', stars: 5, trait: 'DEEP BALL', side: 'offense', team: 'stags', st: { kickPower: 3, kickAccuracy: 4, returnAbility: 1 } },
  { id: 'crv_o2', name: 'DaCosta', pos: 'WR', ovr: 84, badge: 'SPEED_LINES', isStar: false, num: 11, ability: 'Burns man coverage deep', stars: 5, trait: 'BURNER', side: 'offense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 5 } },
  { id: 'crv_o3', name: 'Booker', pos: 'WR', ovr: 80, badge: 'FOOTBALL', isStar: false, num: 9, ability: 'Crisp routes get him open', stars: 4, trait: 'ROUTE IQ', side: 'offense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'crv_o4', name: 'Cortland', pos: 'RB', ovr: 74, badge: 'CLEAT', isStar: false, num: 25, ability: 'Catches out of the backfield', stars: 3, trait: 'PASS CATCHER', side: 'offense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 4 } },
  { id: 'crv_o5', name: 'Vance', pos: 'WR', ovr: 76, badge: 'GLOVE', isStar: false, num: 82, ability: 'Wins the contested catch', stars: 3, trait: 'CONTESTED CATCH', side: 'offense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'crv_o6', name: 'Odom', pos: 'OL', ovr: 72, badge: 'BRICK', isStar: false, num: 68, ability: 'Holds the point of attack', stars: 2, trait: 'ANCHOR', side: 'offense', team: 'stags', st: { kickPower: 4, kickAccuracy: 2, returnAbility: 1 } },
  { id: 'crv_o7', name: 'Reyes', pos: 'TE', ovr: 72, badge: 'BRICK', isStar: false, num: 28, ability: 'Blocks when asked', stars: 2, trait: 'ROAD GRADER', side: 'offense', team: 'stags', st: { kickPower: 2, kickAccuracy: 1, returnAbility: 1 } },
];

export const SPECTRES_DEFENSE = [
  { id: 'crv_d1', name: 'Blackwell', pos: 'DL', ovr: 84, badge: 'SPEED_LINES', isStar: true, starTitle: 'Chaos', num: 99, ability: 'Unblockable off the edge', stars: 5, trait: 'EDGE SPEED', side: 'defense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'crv_d2', name: 'Tate', pos: 'LB', ovr: 80, badge: 'SPEED_LINES', isStar: false, num: 52, ability: 'Dangerous on designed blitzes', stars: 4, trait: 'BLITZ SPECIALIST', side: 'defense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'crv_d3', name: 'Ross', pos: 'CB', ovr: 78, badge: 'PADLOCK', isStar: false, num: 24, ability: 'Physical at the line', stars: 4, trait: 'PRESS CORNER', side: 'defense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'crv_d4', name: 'Shields', pos: 'LB', ovr: 76, badge: 'HELMET', isStar: false, num: 41, ability: 'Covers backs and tight ends', stars: 3, trait: 'COVERAGE LB', side: 'defense', team: 'stags', st: { kickPower: 2, kickAccuracy: 2, returnAbility: 1 } },
  { id: 'crv_d5', name: 'Holbrook', pos: 'DL', ovr: 76, badge: 'BRICK', isStar: false, num: 93, ability: 'Two-gaps and eats blocks', stars: 3, trait: 'RUN STUFFER', side: 'defense', team: 'stags', st: { kickPower: 5, kickAccuracy: 3, returnAbility: 1 } },
  { id: 'crv_d6', name: 'Beckett', pos: 'S', ovr: 74, badge: 'EYE', isStar: false, num: 15, ability: 'Reads the QB pre-snap', stars: 3, trait: 'BALL HAWK', side: 'defense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'crv_d7', name: 'Kane', pos: 'CB', ovr: 72, badge: 'EYE', isStar: false, num: 37, ability: 'Reads the QB eyes in zone', stars: 2, trait: 'ZONE READER', side: 'defense', team: 'stags', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 1 } },
];

// ============================================================
// BLACKWATER SERPENTS — Multiple/Pro: balanced 3-4 stars, versatile, no single star
// ============================================================
export const SERPENTS_OFFENSE = [
  { id: 'bws_o1', name: 'Ash', pos: 'QB', ovr: 80, badge: 'CROSSHAIR', isStar: true, starTitle: 'The Conductor', num: 10, ability: 'Quick release, sharp reads', stars: 4, trait: 'QUICK RELEASE', side: 'offense', team: 'serpents', st: { kickPower: 2, kickAccuracy: 3, returnAbility: 2 } },
  { id: 'bws_o2', name: 'Hayward', pos: 'WR', ovr: 80, badge: 'GLOVE', isStar: false, num: 3, ability: 'Sure hands in traffic', stars: 4, trait: 'SURE HANDS', side: 'offense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 } },
  { id: 'bws_o3', name: 'Dupree', pos: 'WR', ovr: 78, badge: 'SPEED_LINES', isStar: false, num: 88, ability: 'Stretches the field deep', stars: 4, trait: 'CONTESTED CATCH', side: 'offense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'bws_o4', name: 'Slade', pos: 'RB', ovr: 76, badge: 'HELMET', isStar: false, num: 7, ability: 'Yards after contact', stars: 3, trait: 'POWER BACK', side: 'offense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 4 } },
  { id: 'bws_o5', name: 'Cortez', pos: 'OL', ovr: 76, badge: 'BRICK', isStar: false, num: 75, ability: 'Pass-pro specialist', stars: 3, trait: 'BRICK WALL', side: 'offense', team: 'serpents', st: { kickPower: 3, kickAccuracy: 4, returnAbility: 1 } },
  { id: 'bws_o6', name: 'Moreno', pos: 'TE', ovr: 76, badge: 'GLOVE', isStar: false, num: 19, ability: 'Reliable receiving target', stars: 3, trait: 'PASS CATCHER', side: 'offense', team: 'serpents', st: { kickPower: 2, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'bws_o7', name: 'Osei', pos: 'QB', ovr: 74, badge: 'CROSSHAIR', isStar: false, num: 14, ability: 'Sells the fake, freezes linebackers', stars: 3, trait: 'PLAY ACTION PRO', side: 'offense', team: 'serpents', st: { kickPower: 2, kickAccuracy: 2, returnAbility: 2 } },
];

export const SERPENTS_DEFENSE = [
  { id: 'bws_d1', name: 'Vega', pos: 'S', ovr: 80, badge: 'CLIPBOARD', isStar: true, starTitle: 'The Eraser', num: 6, ability: 'Ball hawk — reads the QB', stars: 4, trait: 'BALL HAWK', side: 'defense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 2, returnAbility: 4 } },
  { id: 'bws_d2', name: 'Whitaker', pos: 'CB', ovr: 80, badge: 'PADLOCK', isStar: false, num: 23, ability: 'Mirrors every route', stars: 4, trait: 'SHUTDOWN', side: 'defense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'bws_d3', name: 'Bishop', pos: 'LB', ovr: 78, badge: 'HELMET', isStar: false, num: 50, ability: 'Covers backs and tight ends', stars: 4, trait: 'COVERAGE LB', side: 'defense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'bws_d4', name: 'Baptiste', pos: 'CB', ovr: 76, badge: 'EYE', isStar: false, num: 31, ability: 'Reads the QB eyes in zone', stars: 3, trait: 'ZONE READER', side: 'defense', team: 'serpents', st: { kickPower: 1, kickAccuracy: 1, returnAbility: 2 } },
  { id: 'bws_d5', name: 'Langford', pos: 'S', ovr: 76, badge: 'CLIPBOARD', isStar: false, num: 20, ability: 'Comes downhill to stop the run', stars: 3, trait: 'RUN SUPPORT', side: 'defense', team: 'serpents', st: { kickPower: 3, kickAccuracy: 5, returnAbility: 1 } },
  { id: 'bws_d6', name: 'Collins', pos: 'DL', ovr: 76, badge: 'SPEED_LINES', isStar: false, num: 92, ability: 'Gets to the QB', stars: 3, trait: 'PASS RUSHER', side: 'defense', team: 'serpents', st: { kickPower: 2, kickAccuracy: 1, returnAbility: 1 } },
  { id: 'bws_d7', name: 'Pruitt', pos: 'LB', ovr: 74, badge: 'EYE', isStar: false, num: 48, ability: 'Fills gaps and stops the run', stars: 3, trait: 'RUN STUFFER', side: 'defense', team: 'serpents', st: { kickPower: 4, kickAccuracy: 2, returnAbility: 1 } },
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
