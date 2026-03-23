/**
 * TORCH v0.22.4 — Player Rosters
 * 4 teams × (7 offense + 6 defense) = 52 players.
 * OL abstracted — only skill position players appear in gameplay hand.
 * Each team: 4 starters + 2-3 bench per side.
 * 1 offensive star + 1 defensive star per team at 84 OVR.
 */

// ============================================================
// RIDGEMONT SENTINELS — Run & Shoot + Press Man
// ============================================================
export const SENTINELS_OFFENSE = [
  { id: 'rdg_o1', name: 'Monroe', pos: 'WR', ovr: 84, badge: 'SPEED_LINES', isStar: true, starTitle: 'The Jet', num: 1, ability: 'Burns man coverage deep' },
  { id: 'rdg_o2', name: 'Calloway', pos: 'QB', ovr: 80, badge: 'CROSSHAIR', isStar: false, num: 7, ability: 'Pinpoint accuracy in rhythm' },
  { id: 'rdg_o3', name: 'Frazier', pos: 'WR', ovr: 78, badge: 'FOOTBALL', isStar: false, num: 4, ability: 'Reliable hands in traffic' },
  { id: 'rdg_o4', name: 'Vance', pos: 'WR', ovr: 76, badge: 'GLOVE', isStar: false, num: 82, ability: 'Sure hands on the sideline' },
  { id: 'rdg_o5', name: 'Price', pos: 'OL', ovr: 74, badge: 'BRICK', isStar: false, num: 65, ability: 'Anchors the pocket' },
  { id: 'rdg_o6', name: 'Tran', pos: 'QB', ovr: 74, badge: 'BOLT', isStar: false, num: 14, ability: 'Extends plays under pressure' },
  { id: 'rdg_o7', name: 'Langley', pos: 'WR', ovr: 72, badge: 'CROSSHAIR', isStar: false, num: 17, ability: 'Gets open on option routes' },
];

export const SENTINELS_DEFENSE = [
  { id: 'rdg_d1', name: 'Tillery', pos: 'CB', ovr: 84, badge: 'PADLOCK', isStar: true, starTitle: 'The Lockdown', num: 2, ability: 'Lockdown in press coverage' },
  { id: 'rdg_d2', name: 'Reeves', pos: 'S', ovr: 80, badge: 'EYE', isStar: false, num: 21, ability: 'Ball hawk — reads the QB' },
  { id: 'rdg_d3', name: 'Creed', pos: 'CB', ovr: 78, badge: 'PADLOCK', isStar: false, num: 5, ability: 'Blankets the slot receiver' },
  { id: 'rdg_d4', name: 'Obi', pos: 'S', ovr: 76, badge: 'SPEED_LINES', isStar: false, num: 33, ability: 'Closes fast on the ball' },
  { id: 'rdg_d5', name: 'Clay', pos: 'LB', ovr: 74, badge: 'HELMET', isStar: false, num: 44, ability: 'Plugs every gap' },
  { id: 'rdg_d6', name: 'Nakamura', pos: 'DL', ovr: 72, badge: 'SPEED_LINES', isStar: false, num: 90, ability: 'Quick off the snap' },
];

// ============================================================
// NORTHERN PINES TIMBER WOLVES — Triple Option + Cover 3 Zone
// ============================================================
export const WOLVES_OFFENSE = [
  { id: 'npa_o1', name: 'Thorne', pos: 'FB', ovr: 84, badge: 'HELMET', isStar: true, starTitle: 'The Hammer', num: 34, ability: 'Breaks arm tackles' },
  { id: 'npa_o2', name: 'Briggs', pos: 'QB', ovr: 78, badge: 'CLIPBOARD', isStar: false, num: 12, ability: 'Reads the option perfectly' },
  { id: 'npa_o3', name: 'Quick', pos: 'SB', ovr: 78, badge: 'CLEAT', isStar: false, num: 6, ability: 'Explosive on the pitch' },
  { id: 'npa_o4', name: 'Hargrove', pos: 'SB', ovr: 74, badge: 'SPEED_LINES', isStar: false, num: 22, ability: 'Gets to the edge fast' },
  { id: 'npa_o5', name: 'Maddox', pos: 'OL', ovr: 76, badge: 'BRICK', isStar: false, num: 72, ability: 'Pulls and leads the way' },
  { id: 'npa_o6', name: 'Okafor', pos: 'FB', ovr: 74, badge: 'BRICK', isStar: false, num: 45, ability: 'Blocks and bulldozes' },
  { id: 'npa_o7', name: 'Ballard', pos: 'SB', ovr: 72, badge: 'CLEAT', isStar: false, num: 8, ability: 'Shifty in the open field' },
];

export const WOLVES_DEFENSE = [
  { id: 'npa_d1', name: 'Ledford', pos: 'LB', ovr: 84, badge: 'HELMET', isStar: true, starTitle: 'The General', num: 55, ability: 'Reads and reacts instantly' },
  { id: 'npa_d2', name: 'McBride', pos: 'LB', ovr: 78, badge: 'EYE', isStar: false, num: 42, ability: 'Plugs every gap' },
  { id: 'npa_d3', name: 'Posey', pos: 'S', ovr: 78, badge: 'EYE', isStar: false, num: 27, ability: 'Plays the deep half' },
  { id: 'npa_d4', name: 'Baskins', pos: 'DL', ovr: 76, badge: 'BRICK', isStar: false, num: 95, ability: 'Collapses the pocket' },
  { id: 'npa_d5', name: 'Mercer', pos: 'CB', ovr: 74, badge: 'PADLOCK', isStar: false, num: 3, ability: 'Sticky in zone coverage' },
  { id: 'npa_d6', name: 'Kline', pos: 'S', ovr: 72, badge: 'CLIPBOARD', isStar: false, num: 18, ability: 'Fills the alley on runs' },
];

// ============================================================
// CRESTVIEW STAGS — Spread RPO + Swarm Blitz
// ============================================================
export const STAGS_OFFENSE = [
  { id: 'crv_o1', name: 'Strand', pos: 'QB', ovr: 84, badge: 'FLAME', isStar: true, starTitle: 'The Spark', num: 1, ability: 'Dual threat — runs and throws' },
  { id: 'crv_o2', name: 'Cortland', pos: 'RB', ovr: 80, badge: 'CLEAT', isStar: false, num: 25, ability: 'Hits the hole and goes' },
  { id: 'crv_o3', name: 'DaCosta', pos: 'WR', ovr: 78, badge: 'BOLT', isStar: false, num: 11, ability: 'Explosive after the catch' },
  { id: 'crv_o4', name: 'Booker', pos: 'WR', ovr: 76, badge: 'FOOTBALL', isStar: false, num: 9, ability: 'High-points the deep ball' },
  { id: 'crv_o5', name: 'Odom', pos: 'OL', ovr: 74, badge: 'BRICK', isStar: false, num: 68, ability: 'Creates running lanes' },
  { id: 'crv_o6', name: 'Watts', pos: 'QB', ovr: 76, badge: 'FLAME', isStar: false, num: 3, ability: 'Scrambles and improvises' },
  { id: 'crv_o7', name: 'Reyes', pos: 'RB', ovr: 72, badge: 'CLEAT', isStar: false, num: 28, ability: 'Catches out of the backfield' },
];

export const STAGS_DEFENSE = [
  { id: 'crv_d1', name: 'Blackwell', pos: 'EDGE', ovr: 84, badge: 'SPEED_LINES', isStar: true, starTitle: 'Chaos', num: 99, ability: 'Unblockable off the edge' },
  { id: 'crv_d2', name: 'Tate', pos: 'LB', ovr: 80, badge: 'SPEED_LINES', isStar: false, num: 52, ability: 'Sideline to sideline range' },
  { id: 'crv_d3', name: 'Ross', pos: 'CB', ovr: 78, badge: 'PADLOCK', isStar: false, num: 24, ability: 'Physical at the line' },
  { id: 'crv_d4', name: 'Shields', pos: 'LB', ovr: 76, badge: 'HELMET', isStar: false, num: 41, ability: 'Blitzes with perfect timing' },
  { id: 'crv_d5', name: 'Holbrook', pos: 'DL', ovr: 74, badge: 'BRICK', isStar: false, num: 93, ability: 'Two-gaps and eats blocks' },
  { id: 'crv_d6', name: 'Beckett', pos: 'S', ovr: 74, badge: 'EYE', isStar: false, num: 15, ability: 'Reads the QB pre-snap' },
];

// ============================================================
// BLACKWATER STATE SERPENTS — Air Raid + Pattern Match
// ============================================================
export const SERPENTS_OFFENSE = [
  { id: 'bws_o1', name: 'Hayward', pos: 'SLOT', ovr: 84, badge: 'GLOVE', isStar: true, starTitle: 'Silk', num: 3, ability: 'Sure hands in traffic' },
  { id: 'bws_o2', name: 'Ash', pos: 'QB', ovr: 80, badge: 'CROSSHAIR', isStar: false, num: 10, ability: 'Quick release, sharp reads' },
  { id: 'bws_o3', name: 'Dupree', pos: 'WR', ovr: 78, badge: 'SPEED_LINES', isStar: false, num: 88, ability: 'Stretches the field deep' },
  { id: 'bws_o4', name: 'Slade', pos: 'WR', ovr: 76, badge: 'FOOTBALL', isStar: false, num: 7, ability: 'Wins contested catches' },
  { id: 'bws_o5', name: 'Cortez', pos: 'OL', ovr: 76, badge: 'BRICK', isStar: false, num: 75, ability: 'Pass-pro specialist' },
  { id: 'bws_o6', name: 'Osei', pos: 'QB', ovr: 74, badge: 'CROSSHAIR', isStar: false, num: 14, ability: 'Delivers under pressure' },
  { id: 'bws_o7', name: 'Moreno', pos: 'SLOT', ovr: 72, badge: 'GLOVE', isStar: false, num: 19, ability: 'Finds the soft spot in zone' },
];

export const SERPENTS_DEFENSE = [
  { id: 'bws_d1', name: 'Vega', pos: 'S', ovr: 84, badge: 'CLIPBOARD', isStar: true, starTitle: 'The Eraser', num: 6, ability: 'Ball hawk — reads the QB' },
  { id: 'bws_d2', name: 'Whitaker', pos: 'CB', ovr: 80, badge: 'PADLOCK', isStar: false, num: 23, ability: 'Mirrors every route' },
  { id: 'bws_d3', name: 'Bishop', pos: 'LB', ovr: 78, badge: 'HELMET', isStar: false, num: 50, ability: 'Covers and tackles equally' },
  { id: 'bws_d4', name: 'Baptiste', pos: 'CB', ovr: 76, badge: 'EYE', isStar: false, num: 31, ability: 'Disguises coverage pre-snap' },
  { id: 'bws_d5', name: 'Langford', pos: 'S', ovr: 74, badge: 'CLIPBOARD', isStar: false, num: 20, ability: 'Pattern match specialist' },
  { id: 'bws_d6', name: 'Pruitt', pos: 'LB', ovr: 72, badge: 'EYE', isStar: false, num: 48, ability: 'Reads the play before the snap' },
];

// ============================================================
// LOOKUP HELPERS
// ============================================================
var _rosters = {
  sentinels: { offense: SENTINELS_OFFENSE, defense: SENTINELS_DEFENSE },
  wolves:    { offense: WOLVES_OFFENSE, defense: WOLVES_DEFENSE },
  stags:     { offense: STAGS_OFFENSE, defense: STAGS_DEFENSE },
  serpents:  { offense: SERPENTS_OFFENSE, defense: SERPENTS_DEFENSE },
};

export function getOffenseRoster(teamId) {
  return _rosters[teamId] ? _rosters[teamId].offense : [];
}

export function getDefenseRoster(teamId) {
  return _rosters[teamId] ? _rosters[teamId].defense : [];
}

export function getStarters(roster) {
  return roster.slice(0, 4);
}

export function getBench(roster) {
  return roster.slice(4);
}
