/**
 * TORCH — Achievement System
 * Persistent achievements tracked across all games.
 * Unlocked achievements stored in localStorage.
 */

var ACHIEVEMENTS = [
  // Game results
  { id: 'first_win', name: 'FIRST BLOOD', desc: 'Win your first game', icon: '🏆' },
  { id: 'shutout', name: 'SHUTOUT', desc: 'Win without opponent scoring', icon: '🛡️' },
  { id: 'comeback', name: 'COMEBACK KID', desc: 'Win after trailing at halftime', icon: '🔥' },
  { id: 'blowout', name: 'BLOWOUT', desc: 'Win by 21+ points', icon: '💪' },
  { id: 'perfect_season', name: 'PERFECT SEASON', desc: 'Go undefeated in a season (3-0)', icon: '⭐' },
  { id: 'champion', name: 'NATIONAL CHAMPION', desc: 'Win the championship game', icon: '👑' },

  // Play milestones
  { id: 'first_td', name: 'PAYDIRT', desc: 'Score your first touchdown', icon: '🏈' },
  { id: 'hat_trick', name: 'HAT TRICK', desc: 'Score 3+ TDs in one game', icon: '🎩' },
  { id: 'pick_master', name: 'BALL HAWK', desc: 'Force 3+ turnovers in one game', icon: '🦅' },
  { id: 'explosive', name: 'EXPLOSIVE', desc: 'Get a 30+ yard play', icon: '💥' },
  { id: 'clutch', name: 'CLUTCH', desc: 'Score a go-ahead TD in the 2-minute drill', icon: '⏱️' },

  // Torch cards
  { id: 'card_collector', name: 'COLLECTOR', desc: 'Buy 10 torch cards total', icon: '🃏' },
  { id: 'gold_user', name: 'GOLDEN', desc: 'Use a Gold tier torch card', icon: '✨' },
  { id: 'combo_finder', name: 'SYNERGY', desc: 'Trigger a card combo', icon: '⚡' },

  // Team mastery
  { id: 'all_teams', name: 'TOUR OF DUTY', desc: 'Win with all 4 teams', icon: '🗺️' },
  { id: 'streak_5', name: 'ON FIRE', desc: 'Win 5 games in a row with one team', icon: '🔥' },
  { id: 'daily_streak_7', name: 'DEDICATED', desc: 'Play Daily Drive 7 days in a row', icon: '📅' },

  // Difficulty
  { id: 'hard_win', name: 'IRON WILL', desc: 'Win a game on Hard difficulty', icon: '💎' },
  { id: 'hard_champion', name: 'LEGENDARY', desc: 'Win championship on Hard', icon: '🏅' },
];

function getUnlocked() {
  try { return JSON.parse(localStorage.getItem('torch_achievements') || '[]'); } catch(e) { return []; }
}

function saveUnlocked(arr) {
  try { localStorage.setItem('torch_achievements', JSON.stringify(arr)); } catch(e) {}
}

/**
 * Check and unlock achievements based on game state.
 * @param {object} context — { won, tied, humanScore, cpuScore, difficulty, teamId, opponentId,
 *   tds, turnoversForced, biggestPlay, isClutchTD, torchCardsBought, goldCardUsed,
 *   comboTriggered, seasonRecord, isChampionship, championshipWon,
 *   trailingAtHalf, dailyStreak }
 * @returns {object[]} Newly unlocked achievements (empty if none)
 */
export function checkAchievements(context) {
  var unlocked = getUnlocked();
  var newlyUnlocked = [];

  function tryUnlock(id) {
    if (unlocked.indexOf(id) >= 0) return;
    unlocked.push(id);
    var ach = ACHIEVEMENTS.find(function(a) { return a.id === id; });
    if (ach) newlyUnlocked.push(ach);
  }

  // Game results
  if (context.won) tryUnlock('first_win');
  if (context.won && context.cpuScore === 0) tryUnlock('shutout');
  if (context.won && context.trailingAtHalf) tryUnlock('comeback');
  if (context.won && (context.humanScore - context.cpuScore) >= 21) tryUnlock('blowout');
  if (context.seasonRecord && context.seasonRecord.wins >= 3 && context.seasonRecord.losses === 0) tryUnlock('perfect_season');
  if (context.isChampionship && context.championshipWon) tryUnlock('champion');

  // Play milestones
  if (context.tds >= 1) tryUnlock('first_td');
  if (context.tds >= 3) tryUnlock('hat_trick');
  if (context.turnoversForced >= 3) tryUnlock('pick_master');
  if (context.biggestPlay >= 30) tryUnlock('explosive');
  if (context.isClutchTD) tryUnlock('clutch');

  // Torch cards
  if (context.torchCardsBought >= 10) tryUnlock('card_collector');
  if (context.goldCardUsed) tryUnlock('gold_user');
  if (context.comboTriggered) tryUnlock('combo_finder');

  // Team mastery
  var records = {};
  try { records = JSON.parse(localStorage.getItem('torch_team_records') || '{}'); } catch(e) {}
  var teamsWon = ['sentinels','wolves','stags','serpents'].filter(function(t) { return records[t] && records[t].wins > 0; });
  if (teamsWon.length >= 4) tryUnlock('all_teams');

  var streaks = {};
  try { streaks = JSON.parse(localStorage.getItem('torch_streaks') || '{}'); } catch(e) {}
  for (var tid in streaks) { if (streaks[tid].currentWin >= 5) tryUnlock('streak_5'); }

  if (context.dailyStreak >= 7) tryUnlock('daily_streak_7');

  // Difficulty
  if (context.won && context.difficulty === 'HARD') tryUnlock('hard_win');
  if (context.isChampionship && context.championshipWon && context.difficulty === 'HARD') tryUnlock('hard_champion');

  if (newlyUnlocked.length > 0) saveUnlocked(unlocked);
  return newlyUnlocked;
}

export function getAllAchievements() { return ACHIEVEMENTS.slice(); }
export function getUnlockedIds() { return getUnlocked(); }
export function getProgress() {
  var u = getUnlocked();
  return { unlocked: u.length, total: ACHIEVEMENTS.length };
}
