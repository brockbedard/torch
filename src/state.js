import { TEAMS } from './data/teams.js';
import { IR_OFF_PLAYS } from './data/irOffensePlays.js';
import { IR_DEF_PLAYS } from './data/irDefensePlays.js';
import { CT_OFF_PLAYS } from './data/ctOffensePlays.js';
import { CT_DEF_PLAYS } from './data/ctDefensePlays.js';

export var VERSION = '0.17.6';
export var VERSION_NAME = 'Torch Popup + Field Polish';

export var GS = null;

export function setGs(fn) {
  GS = typeof fn === 'function' ? fn(GS) : fn;
  render();
}

export var render = () => {};
export function setRender(fn) { render = fn; }

export function getTeam(id) {
  return TEAMS.find(function(t) { return t.id === id; }) || TEAMS[0];
}

export function getOtherTeam(id) {
  return TEAMS.find(function(t) { return t.id !== id; }) || TEAMS[1];
}

export function getOffCards(teamId) {
  return teamId === 'canyon_tech' ? CT_OFF_PLAYS : IR_OFF_PLAYS;
}

export function getDefCards(teamId) {
  return teamId === 'canyon_tech' ? CT_DEF_PLAYS : IR_DEF_PLAYS;
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
