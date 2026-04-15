/**
 * TORCH — Game History
 * Persistent log of all games played. Persisted via the storage facade.
 */

import { getJSON, setJSON } from './storage.js';

var HISTORY_KEY = 'torch_game_history';
var MAX_HISTORY = 50; // Keep last 50 games

export function recordGame(data) {
  var history = getHistory();
  history.unshift({
    date: new Date().toISOString(),
    team: data.team,
    opponent: data.opponent,
    difficulty: data.difficulty,
    humanScore: data.humanScore,
    cpuScore: data.cpuScore,
    won: data.won,
    tied: data.tied,
    torchPts: data.torchPts,
    mvp: data.mvp || null,
    isDaily: data.isDaily || false,
    isChampionship: data.isChampionship || false,
  });
  // Trim to max
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  setJSON(HISTORY_KEY, history);
}

export function getHistory() { return getJSON(HISTORY_KEY, []); }

export function getRecentGames(count) {
  return getHistory().slice(0, count || 10);
}

export function getWinStreak() {
  var h = getHistory();
  var streak = 0;
  for (var i = 0; i < h.length; i++) {
    if (h[i].won) streak++;
    else break;
  }
  return streak;
}

export function getFormString(count) {
  // Returns "WWLWW" style form string
  return getHistory().slice(0, count || 5).map(function(g) {
    return g.won ? 'W' : g.tied ? 'D' : 'L';
  }).join('');
}
