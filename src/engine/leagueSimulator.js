/**
 * TORCH — League Simulator
 * Generates scores and stats for non-active teams in the league.
 */

import { TEAMS } from '../data/teams.js';

const STORAGE_KEY = 'torch_league_standings';

export function getLeagueStandings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initStandings();
  } catch(e) { return initStandings(); }
}

function initStandings() {
  const standings = {};
  Object.keys(TEAMS).forEach(id => {
    standings[id] = { wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0 };
  });
  return standings;
}

/**
 * Simulate a week of games for teams not currently being played by the human.
 * @param {string} humanTeamId 
 * @param {string} currentOpponentId 
 * @returns {object[]} Array of game results { home, away, homeScore, awayScore, headline }
 */
export function simulateLeagueWeek(humanTeamId, currentOpponentId) {
  const allTeamIds = Object.keys(TEAMS);
  const inactiveTeams = allTeamIds.filter(id => id !== humanTeamId && id !== currentOpponentId);
  
  if (inactiveTeams.length < 2) return [];

  const results = [];
  const standings = getLeagueStandings();

  for (let i = 0; i < inactiveTeams.length; i += 2) {
    if (i + 1 >= inactiveTeams.length) break;
    
    const t1Id = inactiveTeams[i];
    const t2Id = inactiveTeams[i+1];
    const t1 = TEAMS[t1Id];
    const t2 = TEAMS[t2Id];
    
    const t1Ovr = (t1.ratings.offense + t1.ratings.defense) / 2;
    const t2Ovr = (t2.ratings.offense + t2.ratings.defense) / 2;
    
    const t1Score = Math.floor(Math.random() * 21) + Math.floor((t1Ovr - 70) * 0.5);
    const t2Score = Math.floor(Math.random() * 21) + Math.floor((t2Ovr - 70) * 0.5);
    
    // Update standings
    standings[t1Id].pointsFor += t1Score;
    standings[t1Id].pointsAgainst += t2Score;
    standings[t2Id].pointsFor += t2Score;
    standings[t2Id].pointsAgainst += t1Score;

    if (t1Score > t2Score) { standings[t1Id].wins++; standings[t2Id].losses++; }
    else if (t2Score > t1Score) { standings[t2Id].wins++; standings[t1Id].losses++; }
    else { standings[t1Id].ties++; standings[t2Id].ties++; }

    results.push({
      home: t1Id,
      away: t2Id,
      homeScore: Math.max(0, t1Score),
      awayScore: Math.max(0, t2Score),
      headline: generateHeadline(t1, t2, t1Score, t2Score)
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(standings));
  return results;
}

function generateHeadline(t1, t2, s1, s2) {
  const winner = s1 > s2 ? t1 : t2;
  const loser = s1 > s2 ? t2 : t1;
  const diff = Math.abs(s1 - s2);

  if (diff >= 14) return `${winner.name} dominate ${loser.name} in blowout!`;
  if (diff <= 3) return `${winner.name} edge out ${loser.name} in thriller!`;
  return `${winner.name} take down ${loser.name}.`;
}
