/**
 * TORCH — League Standings Component
 */

import { getLeagueStandings } from '../../engine/leagueSimulator.js';
import { getTeam } from '../../state.js';

export function buildLeagueStandings() {
  const standings = getLeagueStandings();
  const sortedIds = Object.keys(standings).sort((a, b) => {
    const sA = standings[a];
    const sB = standings[b];
    if (sB.wins !== sA.wins) return sB.wins - sA.wins;
    return (sB.pointsFor - sB.pointsAgainst) - (sA.pointsFor - sA.pointsAgainst);
  });

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:10px 0;';

  sortedIds.forEach((id, idx) => {
    const t = getTeam(id);
    const s = standings[id];
    const isUser = id === GS.team;

    const row = document.createElement('div');
    row.style.cssText = `display:flex;align-items:center;padding:8px 12px;background:${isUser ? t.accent + '15' : 'rgba(255,255,255,0.02)'};border-radius:6px;border:1px solid ${isUser ? t.accent + '44' : 'rgba(255,255,255,0.05)'};`;
    
    row.innerHTML = `
      <div style="width:20px;font-family:'Teko';font-weight:700;font-size:14px;color:#555;">${idx + 1}</div>
      <div style="flex:1;font-family:'Teko';font-weight:700;font-size:18px;color:${isUser ? '#fff' : '#aaa'};margin-left:8px;">${t.name.toUpperCase()}</div>
      <div style="font-family:'Rajdhani';font-weight:700;font-size:14px;color:#fff;letter-spacing:1px;">${s.wins}-${s.losses}${s.ties > 0 ? '-' + s.ties : ''}</div>
    `;
    wrap.appendChild(row);
  });

  return wrap;
}
