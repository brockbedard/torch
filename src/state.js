/**
 * TORCH v0.26.1 — Global State
 * New flow: Home -> Team Select -> (VS transition) -> Gameplay
 * Season system: 3 games per season, cards + points persist.
 */

import { TEAMS, getTeamById, getSeasonOpponents } from './data/teams.js';
import { SENTINELS_OFF_PLAYS, SENTINELS_DEF_PLAYS } from './data/sentinelsPlays.js';
import { WOLVES_OFF_PLAYS, WOLVES_DEF_PLAYS } from './data/wolvesPlays.js';
import { STAGS_OFF_PLAYS, STAGS_DEF_PLAYS } from './data/stagsPlays.js';
import { SERPENTS_OFF_PLAYS, SERPENTS_DEF_PLAYS } from './data/serpentsPlays.js';
import { getOffenseRoster, getDefenseRoster } from './data/players.js';

export var VERSION = '0.33.0';
export var VERSION_NAME = 'Broadcast Polish';

export var GAME_SPEED = { current: 'normal' }; // 'normal', 'fast', 'turbo'
export function setGameSpeed(speed) { GAME_SPEED.current = speed; localStorage.setItem('torch_speed', speed); }
export function getSpeedMultiplier() {
  if (GAME_SPEED.current === 'fast') return 0.6;
  if (GAME_SPEED.current === 'turbo') return 0.3;
  return 1.0;
}
// Load saved preference (guard for Node/test environments)
try { var _savedSpeed = localStorage.getItem('torch_speed'); if (_savedSpeed) GAME_SPEED.current = _savedSpeed; } catch(e) {}

// Feature flags — toggle individual features for testing
export var FEATURES = {
  momentumSystem: true,
  cardCombos: true,
  driveHeat: true,
  narrativeCommentary: true,
  halftimeAdjustment: true,
  achievements: true,
  streaks: true,
  seasonMode: true,
  dailyDrive: true,
  audible: true,
  winProbability: true,
  playByPlayTicker: true,
  weatherAudio: true,
  smartHighlights: true,
  tutorialSystem: true,
};

// Load overrides from localStorage
try {
  var _flagOverrides = JSON.parse(localStorage.getItem('torch_features') || '{}');
  for (var k in _flagOverrides) { if (k in FEATURES) FEATURES[k] = _flagOverrides[k]; }
} catch(e) {}

export function setFeatureFlag(key, value) {
  FEATURES[key] = value;
  try {
    var overrides = JSON.parse(localStorage.getItem('torch_features') || '{}');
    overrides[key] = value;
    localStorage.setItem('torch_features', JSON.stringify(overrides));
  } catch(e) {}
}

export var GS = null;

export function setGs(fn) {
  GS = typeof fn === 'function' ? fn(GS) : fn;
  render();
  // Auto-save whenever we're in gameplay with an active engine
  if (GS && GS.screen === 'gameplay' && GS.engine) {
    saveGameState();
  }
}

export function saveGameState() {
  if (!GS || !GS.engine) return;
  var save = {
    screen: GS.screen,
    team: GS.team,
    opponent: GS.opponent,
    difficulty: GS.difficulty,
    isFirstSeason: GS.isFirstSeason,
    isDailyDrive: GS.isDailyDrive,
    humanReceives: GS.humanReceives,
    gameConditions: GS.gameConditions,
    season: GS.season,
    engineSnapshot: {
      ctScore: GS.engine.ctScore,
      irScore: GS.engine.irScore,
      possession: GS.engine.possession,
      ballPosition: GS.engine.ballPosition,
      down: GS.engine.down,
      distance: GS.engine.distance,
      half: GS.engine.half,
      playsUsed: GS.engine.playsUsed,
      totalPlays: GS.engine.totalPlays,
      twoMinActive: GS.engine.twoMinActive,
      clockSeconds: GS.engine.clockSeconds,
      gameOver: GS.engine.gameOver,
      ctTorchPts: GS.engine.ctTorchPts,
      irTorchPts: GS.engine.irTorchPts,
      humanTorchCards: GS.engine.humanTorchCards,
      cpuTorchCards: GS.engine.cpuTorchCards,
      weather: GS.engine.weather,
      momentum: GS.engine.momentum,
      offHeatMap: GS.engine.offHeatMap,
      defHeatMap: GS.engine.defHeatMap,
    }
  };
  try {
    localStorage.setItem('torch_save', JSON.stringify(save));
  } catch(e) {}
}

export function loadGameState() {
  try {
    var raw = localStorage.getItem('torch_save');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch(e) { return null; }
}

export function clearGameSave() {
  localStorage.removeItem('torch_save');
}

export let render = function() {};
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
// TEAM SCHEME DRAW WEIGHTS — (Source: TORCH-TEAM-SCHEME-IDENTITY.md)
// Weights bias which card you draw next from the available pool.
// Higher weight = more likely to appear in your hand.
// Maps playType → draw weight multiplier per team.
// ============================================================

export var TEAM_DRAW_WEIGHTS = {
  // Boars — Power Spread: 55% run / 45% pass. Run cards dominate.
  sentinels: { RUN: 4, SHORT: 1.5, DEEP: 1, QUICK: 1, SCREEN: 0.5 },
  // Dolphins — Spread Option: 50/50 but QB-run heavy. Zone read + QB draw + balanced pass.
  wolves:    { RUN: 3, SHORT: 2, DEEP: 1, QUICK: 2, SCREEN: 2 },
  // Spectres — Air Raid: 30% run / 70% pass. Quick + deep pass dominate.
  stags:     { RUN: 0.5, SHORT: 3, DEEP: 3, QUICK: 4, SCREEN: 2 },
  // Serpents — Multiple/Pro Style: 45/55 balanced. No bias — master of none.
  serpents:  { RUN: 2, SHORT: 2, DEEP: 2, QUICK: 2, SCREEN: 2 },
};

export function getDrawWeight(teamId, playType) {
  var tw = TEAM_DRAW_WEIGHTS[teamId];
  return (tw && tw[playType]) || 1;
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
