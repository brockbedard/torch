/**
 * TORCH — Rivalry System
 * Persistent, season-long AI memory of player tendencies.
 */

const STORAGE_KEY = 'torch_rivalry_memory';

/**
 * Get the persistent memory for a specific team.
 * @param {string} teamId 
 */
export function getRivalryMemory(teamId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data[teamId] || {
      gamesPlayed: 0,
      runs: 0,
      passes: 0,
      totalSnaps: 0,
      favoredPlays: {} // { playId: count }
    };
  } catch(e) { return null; }
}

/**
 * Record a game's worth of data into persistent memory.
 * @param {string} teamId - The CPU team ID
 * @param {object} gameTendencies - { runs, passes, total, playLog: [] }
 */
export function recordRivalryData(teamId, gameTendencies) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    
    const mem = data[teamId] || {
      gamesPlayed: 0,
      runs: 0,
      passes: 0,
      totalSnaps: 0,
      favoredPlays: {}
    };

    mem.gamesPlayed++;
    mem.runs += (gameTendencies.runs || 0);
    mem.passes += (gameTendencies.passes || 0);
    mem.totalSnaps += (gameTendencies.total || 0);

    // Track specific play counts
    if (gameTendencies.playLog) {
      gameTendencies.playLog.forEach(playId => {
        mem.favoredPlays[playId] = (mem.favoredPlays[playId] || 0) + 1;
      });
    }

    data[teamId] = mem;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch(e) {}
}

/**
 * Calculate weights for AI defensive selection based on rivalry memory.
 * @param {string} teamId 
 * @returns {object} { runWeight, passWeight }
 */
export function getRivalryWeights(teamId) {
  const mem = getRivalryMemory(teamId);
  if (!mem || mem.totalSnaps < 20) return { runWeight: 1.0, passWeight: 1.0 };

  const runRate = mem.runs / mem.totalSnaps;
  
  // If human runs > 60% of the time across games, CPU weights run defense heavier
  let runWeight = 1.0;
  let passWeight = 1.0;

  if (runRate > 0.6) runWeight = 1.3;
  else if (runRate < 0.3) passWeight = 1.3;

  return { runWeight, passWeight };
}
