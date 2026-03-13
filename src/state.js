import { TEAMS } from './data/teams.js';
import { CT_OFF_CARDS, IR_OFF_CARDS, IR_DEF_CARDS, CT_DEF_CARDS } from './data/cards.js';
import { MT_CT_IR, MT_IR_CT, MT_CT_CT, MT_IR_IR } from './data/matchups.js';

export var VERSION = '0.10.0';
export var VERSION_NAME = 'Gameday Edition';

export var GS = null;

export function setGs(fn) {
  GS = typeof fn === 'function' ? fn(GS) : fn;
  render();
}

export var render = () => {};
export function setRender(fn) { render = fn; }

export function getInitialScenario() {
  return { down: 2, dist: 10, ballOn: 35, clock: 165, timeouts: 1, offScore: 14, defScore: 21 };
}

export function getTeam(id) {
  return TEAMS.find(function(t) { return t.id === id; }) || TEAMS[0];
}

export function getOtherTeam(id) {
  return TEAMS.find(function(t) { return t.id !== id; }) || TEAMS[1];
}

export function getOffCards(teamId) {
  return teamId === 'canyon_tech' ? CT_OFF_CARDS : IR_OFF_CARDS;
}

export function getDefCards(teamId) {
  return teamId === 'canyon_tech' ? CT_DEF_CARDS : IR_DEF_CARDS;
}

export function getMatchupTable(offTeamId, defTeamId) {
  if (offTeamId === 'canyon_tech' && defTeamId === 'iron_ridge') return MT_CT_IR;
  if (offTeamId === 'iron_ridge' && defTeamId === 'canyon_tech') return MT_IR_CT;
  if (offTeamId === 'canyon_tech' && defTeamId === 'canyon_tech') return MT_CT_CT;
  return MT_IR_IR;
}

export function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

export function fmtClock(sec) {
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}
