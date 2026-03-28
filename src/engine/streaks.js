/**
 * TORCH — Rival Streak System
 * Tracks win streaks per team and head-to-head records vs each opponent.
 */

// Update streak after a game
export function updateStreak(teamId, won, opponentId) {
  if (!teamId || !opponentId) return { currentWin: 0, longestWin: 0, h2h: {} };
  var streaks;
  try {
    streaks = JSON.parse(localStorage.getItem('torch_streaks') || '{}');
  } catch (e) {
    streaks = {};
  }
  if (!streaks[teamId]) streaks[teamId] = { currentWin: 0, longestWin: 0, h2h: {} };
  var ts = streaks[teamId];

  // Win streak
  if (won) {
    ts.currentWin++;
    if (ts.currentWin > ts.longestWin) ts.longestWin = ts.currentWin;
  } else {
    ts.currentWin = 0;
  }

  // Head-to-head
  if (!ts.h2h[opponentId]) ts.h2h[opponentId] = { wins: 0, losses: 0 };
  if (won) ts.h2h[opponentId].wins++;
  else ts.h2h[opponentId].losses++;

  try {
    localStorage.setItem('torch_streaks', JSON.stringify(streaks));
  } catch (e) {
    // localStorage write failed (private browsing quota, etc.) — non-fatal
  }
  return ts;
}

// Get streak info for a team
export function getStreak(teamId) {
  if (!teamId) return { currentWin: 0, longestWin: 0, h2h: {} };
  var streaks;
  try {
    streaks = JSON.parse(localStorage.getItem('torch_streaks') || '{}');
  } catch (e) {
    streaks = {};
  }
  return streaks[teamId] || { currentWin: 0, longestWin: 0, h2h: {} };
}

// Get head-to-head record
export function getH2H(teamId, opponentId) {
  var s = getStreak(teamId);
  return s.h2h[opponentId] || { wins: 0, losses: 0 };
}
