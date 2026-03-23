/**
 * TORCH v0.21 — Global State
 * New flow: Home -> Team Select -> (VS transition) -> Gameplay
 * Season system: 3 games per season, cards + points persist.
 */

import { TEAMS, getTeamById, getSeasonOpponents } from './data/teams.js';
import { SENTINELS_OFF_PLAYS, SENTINELS_DEF_PLAYS } from './data/sentinelsPlays.js';
import { WOLVES_OFF_PLAYS, WOLVES_DEF_PLAYS } from './data/wolvesPlays.js';
import { STAGS_OFF_PLAYS, STAGS_DEF_PLAYS } from './data/stagsPlays.js';
import { SERPENTS_OFF_PLAYS, SERPENTS_DEF_PLAYS } from './data/serpentsPlays.js';
import { getOffenseRoster, getDefenseRoster } from './data/players.js';

export var VERSION = '0.22.4';
export var VERSION_NAME = 'Gameday';

export var GS = null;

export function setGs(fn) {
  GS = typeof fn === 'function' ? fn(GS) : fn;
  render();
}

export var render = function() {};
export function setRender(fn) { render = fn; }

// ============================================================
// TEAM LOOKUPS — v0.21 (replaces CT/IR-specific helpers)
// ============================================================

export function getTeam(id) {
  var t = getTeamById(id);
  if (!t) {
    // Fallback for old-style array-based lookups
    var keys = Object.keys(TEAMS);
    t = TEAMS[keys[0]];
  }
  return t;
}

export function getOtherTeam(id) {
  var keys = Object.keys(TEAMS);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] !== id) return TEAMS[keys[i]];
  }
  return TEAMS[keys[0]];
}

var _playLookup = {
  sentinels: { offense: SENTINELS_OFF_PLAYS, defense: SENTINELS_DEF_PLAYS },
  wolves:    { offense: WOLVES_OFF_PLAYS, defense: WOLVES_DEF_PLAYS },
  stags:     { offense: STAGS_OFF_PLAYS, defense: STAGS_DEF_PLAYS },
  serpents:  { offense: SERPENTS_OFF_PLAYS, defense: SERPENTS_DEF_PLAYS },
};

export function getOffCards(teamId) {
  return _playLookup[teamId] ? _playLookup[teamId].offense : [];
}

export function getDefCards(teamId) {
  return _playLookup[teamId] ? _playLookup[teamId].defense : [];
}

// ============================================================
// HAND MANAGEMENT — Option D (draw 5, cycle through 10)
// ============================================================

export function initHand(playbook) {
  var shuffled = shuffle(playbook.slice());
  return { hand: shuffled.slice(0, 5), deck: shuffled.slice(5) };
}

export function cycleCard(hand, deck, playedIndex) {
  var played = hand.splice(playedIndex, 1)[0];
  deck.push(played);
  if (deck.length > 0) {
    hand.push(deck.shift());
  }
  return { hand: hand, deck: deck };
}

// Hot Route: reshuffle all 10, deal 5 fresh
export function hotRoute(hand, deck) {
  var combined = shuffle(hand.concat(deck));
  return { hand: combined.slice(0, 5), deck: combined.slice(5) };
}

// ============================================================
// UTILITIES
// ============================================================

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

// ============================================================
// INITIAL STATE — v0.21 shape
// ============================================================

export function createInitialState() {
  return {
    screen: 'home',
    team: null,           // 'sentinels' | 'wolves' | 'stags' | 'serpents'
    difficulty: null,     // 'EASY' | 'MEDIUM' | 'HARD' (null = auto-Easy on first game)
    isFirstSeason: true,  // Progressive disclosure flag — flips after first season

    // Season state
    season: {
      opponents: [],      // derived from team + counter-play matrix
      currentGame: 0,     // 0, 1, 2
      results: [],        // [{won: bool, score: number}, ...]
      totalScore: 0,
      torchCards: [],     // persisted cards (max 3, card objects)
      carryoverPoints: 0,
    },

    // Per-game state (reset each game)
    engine: null,         // GameState instance

    // Game Day Conditions (v2 — placeholder)
    gameConditions: {
      weather: 'clear',
      field: 'turf',
      crowd: 'home',
    },
  };
}
