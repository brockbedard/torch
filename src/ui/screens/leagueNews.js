/**
 * TORCH — League News & Social Feed
 * Phase 6: Million Dollar Immersion.
 * Procedural headlines and social-style "posts" from around the league.
 */

import { getTeam } from '../../state.js';
import { simulateLeagueWeek } from '../../engine/leagueSimulator.js';

export function buildLeagueNews() {
  const el = document.createElement('div');
  el.className = 'T glass-panel';
  el.style.cssText = 'height:100%;padding:20px;display:flex;flex-direction:column;gap:20px;color:#fff;overflow-y:auto;';

  // Simulate some league history
  const weekResults = simulateLeagueWeek('sentinels', 'wolves'); // Sample
  
  const hdr = document.createElement('div');
  hdr.innerHTML = `
    <div style="font-family:'Teko';font-size:32px;letter-spacing:4px;color:#FF4511;">LEAGUE FEED</div>
    <div style="font-family:'Rajdhani';font-size:10px;color:#555;letter-spacing:2px;margin-bottom:10px;">TOP STORIES & SCUTTLEBUTT</div>
  `;
  el.appendChild(hdr);

  const feed = document.createElement('div');
  feed.style.cssText = 'display:flex;flex-direction:column;gap:16px;';

  // Story 1: League Leaderboard highlight
  const story1 = createNewsItem("BREAKING", "Draft prospects to watch in the upcoming Torch Combines.", "PROSCOUT");
  feed.appendChild(story1);

  // Week results
  weekResults.forEach(res => {
    const home = getTeam(res.home);
    const away = getTeam(res.away);
    const item = createNewsItem(
      "FINAL SCORE",
      `${res.headline} (${home.name} ${res.homeScore}, ${away.name} ${res.awayScore})`,
      "SCOREBUG"
    );
    feed.appendChild(item);
  });

  el.appendChild(feed);

  // Back button
  const back = document.createElement('button');
  back.className = 'btn-glass-light-demo active-scale';
  back.style.cssText = 'width:100%;padding:14px;font-family:\'Teko\';font-size:18px;letter-spacing:4px;margin-top:auto;';
  back.textContent = 'BACK TO HUB';
  back.onclick = () => window.location.reload(); // Simple exit
  el.appendChild(back);

  return el;
}

function createNewsItem(tag, text, source) {
  const item = document.createElement('div');
  item.style.cssText = 'padding:16px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.06);';
  item.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <span style="font-family:'Rajdhani';font-weight:700;font-size:9px;color:#FF4511;letter-spacing:1px;">${tag}</span>
      <span style="font-family:'Rajdhani';font-weight:700;font-size:9px;color:#444;">${source}</span>
    </div>
    <div style="font-family:'Teko';font-size:18px;line-height:1.2;color:#eee;">${text}</div>
  `;
  return item;
}
