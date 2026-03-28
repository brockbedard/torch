/**
 * TORCH — Career Stats
 * Tracks cumulative stats across all games. Persisted in localStorage.
 */

var STATS_KEY = 'torch_career_stats';

function getStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch(e) { return {}; }
}

function saveStats(stats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch(e) {}
}

/**
 * Record stats from a completed game.
 * @param {object} gs — GameState engine instance
 * @param {boolean} isHuman — true if stats are from human's perspective
 */
export function recordGameStats(gs) {
  var stats = getStats();

  // Initialize defaults
  if (!stats.gamesPlayed) stats.gamesPlayed = 0;
  if (!stats.totalTDs) stats.totalTDs = 0;
  if (!stats.totalYards) stats.totalYards = 0;
  if (!stats.totalTurnoversForced) stats.totalTurnoversForced = 0;
  if (!stats.totalTorchPts) stats.totalTorchPts = 0;
  if (!stats.totalSacks) stats.totalSacks = 0;
  if (!stats.totalFirstDowns) stats.totalFirstDowns = 0;
  if (!stats.biggestPlay) stats.biggestPlay = 0;
  if (!stats.totalCards) stats.totalCards = 0;
  if (!stats.highScore) stats.highScore = 0;

  stats.gamesPlayed++;

  var s = gs.stats || {};
  stats.totalTDs += (s.ctTouchdowns || 0);
  stats.totalYards += (s.ctTotalYards || 0);
  stats.totalTurnoversForced += (s.irTurnovers || 0);
  stats.totalSacks += (s.irSacks || 0);
  stats.totalFirstDowns += (s.ctFirstDowns || 0);
  stats.totalTorchPts += (gs.ctTorchPts || 0);

  // Track biggest play from snap log
  if (gs.snapLog) {
    gs.snapLog.forEach(function(snap) {
      if (snap && snap.team === 'CT' && snap.yards > stats.biggestPlay) {
        stats.biggestPlay = snap.yards;
      }
    });
  }

  // High score
  if (gs.ctScore > stats.highScore) stats.highScore = gs.ctScore;

  saveStats(stats);
  return stats;
}

/**
 * Get all career stats.
 */
export function getCareerStats() {
  return getStats();
}

/**
 * Get formatted stat lines for display.
 */
export function getCareerStatLines() {
  var s = getStats();
  var gp = s.gamesPlayed || 0;
  return [
    ['Games Played', gp],
    ['Total TDs', s.totalTDs || 0],
    ['Total Yards', s.totalYards || 0],
    ['Turnovers Forced', s.totalTurnoversForced || 0],
    ['First Downs', s.totalFirstDowns || 0],
    ['TORCH Points Earned', s.totalTorchPts || 0],
    ['Biggest Play', (s.biggestPlay || 0) + ' yards'],
    ['High Score', s.highScore || 0],
    ['Avg Points/Game', gp > 0 ? Math.round((s.totalTorchPts || 0) / gp) : 0],
  ];
}
