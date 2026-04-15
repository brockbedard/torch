/**
 * TORCH — Global State
 * Flow: Home -> Team Select -> (VS transition) -> Gameplay
 * Season system: round-robin across the Ember Eight, cards + points persist.
 */

import { TEAMS, getTeamById, getSeasonOpponents } from './data/teams.js';
import { SENTINELS_OFF_PLAYS, SENTINELS_DEF_PLAYS } from './data/sentinelsPlays.js';
import { WOLVES_OFF_PLAYS, WOLVES_DEF_PLAYS } from './data/wolvesPlays.js';
import { STAGS_OFF_PLAYS, STAGS_DEF_PLAYS } from './data/stagsPlays.js';
import { SERPENTS_OFF_PLAYS, SERPENTS_DEF_PLAYS } from './data/serpentsPlays.js';
import { PRONGHORNS_OFF_PLAYS, PRONGHORNS_DEF_PLAYS } from './data/pronghornsPlays.js';
import { SALAMANDERS_OFF_PLAYS, SALAMANDERS_DEF_PLAYS } from './data/salamandersPlays.js';
import { MAPLES_OFF_PLAYS, MAPLES_DEF_PLAYS } from './data/maplesPlays.js';
import { RACCOONS_OFF_PLAYS, RACCOONS_DEF_PLAYS } from './data/raccoonsPlays.js';
import { getOffenseRoster, getDefenseRoster } from './data/players.js';

export var VERSION = '0.40.0';
export var VERSION_NAME = 'Ember Eight';

// Game speed is locked to normal — multiplier always 1.0.
// Stub export kept so call sites don't need refactoring.
export var GAME_SPEED = { current: 'normal' };
export function setGameSpeed() {}
export function getSpeedMultiplier() { return 1.0; }
// Clear any stale saved preference from before speed was locked
try { localStorage.removeItem('torch_speed'); } catch(e) {}

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
  // Post-snap result overlay uses a 5-beat cadence (result → context → story →
  // reward → settle) instead of a single crammed cluster. Set via localStorage
  // torch_features to A/B against the legacy 3-beat layout.
  cadenceBeats: true,
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
  sentinels:   { offense: SENTINELS_OFF_PLAYS,   defense: SENTINELS_DEF_PLAYS },
  wolves:      { offense: WOLVES_OFF_PLAYS,      defense: WOLVES_DEF_PLAYS },
  stags:       { offense: STAGS_OFF_PLAYS,       defense: STAGS_DEF_PLAYS },
  serpents:    { offense: SERPENTS_OFF_PLAYS,    defense: SERPENTS_DEF_PLAYS },
  pronghorns:  { offense: PRONGHORNS_OFF_PLAYS,  defense: PRONGHORNS_DEF_PLAYS },
  salamanders: { offense: SALAMANDERS_OFF_PLAYS, defense: SALAMANDERS_DEF_PLAYS },
  maples:      { offense: MAPLES_OFF_PLAYS,      defense: MAPLES_DEF_PLAYS },
  raccoons:    { offense: RACCOONS_OFF_PLAYS,    defense: RACCOONS_DEF_PLAYS },
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
  // Boars — Smashmouth Pro: 70/30 run. Two TEs, downhill RB.
  sentinels:   { RUN: 4, SHORT: 2, DEEP: 1, QUICK: 1, SCREEN: 0.5 },
  // Dolphins — Vertical Pass: 40/60. Take the top off.
  wolves:      { RUN: 1.5, SHORT: 2, DEEP: 4, QUICK: 2, SCREEN: 1.5 },
  // Spectres — Spread Option: 60/40. Dual-threat QB, balanced pass.
  stags:       { RUN: 3, SHORT: 2, DEEP: 1.5, QUICK: 2, SCREEN: 1 },
  // Serpents — Triple Option: 85/15. Options dominate, minimal PA pass.
  serpents:    { RUN: 5, SHORT: 1, DEEP: 1, QUICK: 0.5, SCREEN: 0.5 },
  // Pronghorns — Power Spread: 65/35. RPO conflict + pulling guards.
  pronghorns:  { RUN: 3, SHORT: 2, DEEP: 1.5, QUICK: 2, SCREEN: 1 },
  // Salamanders — Air Raid: 20/80. Mesh forever, Four Verts.
  salamanders: { RUN: 0.5, SHORT: 3, DEEP: 2.5, QUICK: 4, SCREEN: 2 },
  // Maples — Multiple: 45/55 balanced. Master of disguise.
  maples:      { RUN: 2, SHORT: 2.5, DEEP: 1.5, QUICK: 2, SCREEN: 1.5 },
  // Raccoons — Veer & Shoot: 50/50 RPO-driven. Sideline splits.
  raccoons:    { RUN: 2, SHORT: 2, DEEP: 2, QUICK: 3, SCREEN: 2 },
};

export function getDrawWeight(teamId, playType) {
  var tw = TEAM_DRAW_WEIGHTS[teamId];
  return (tw && tw[playType]) || 1;
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

// ============================================================
// INITIAL STATE — v0.21 shape
// ============================================================

export function createInitialState() {
  return {
    screen: 'home',
    team: null,           // one of the 8 Ember Eight team ids
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
