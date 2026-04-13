/**
 * TORCH — News Ticker
 * Scrolling news bar for out-of-town scores and league news.
 */

import { TEAMS } from '../../data/teams.js';

export function buildNewsTicker(leagueResults = []) {
  const wrap = document.createElement('div');
  wrap.style.cssText = "width:100%;height:24px;background:#000;border-top:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;overflow:hidden;white-space:nowrap;position:relative;z-index:10;";

  const inner = document.createElement('div');
  inner.style.cssText = "display:inline-block;padding-left:100%;animation:tickerScroll 30s linear infinite;";
  
  // Build the ticker content
  let tickerItems = [
    "TORCH FOOTBALL v0.37.0 LIVE",
    "DAILY DRIVE RESET IN 4 HOURS",
    "SIGN UP FOR PRO BOWL TICKETS"
  ];

  leagueResults.forEach(res => {
    const t1 = TEAMS[res.home];
    const t2 = TEAMS[res.away];
    tickerItems.push(`${t1.name.toUpperCase()} ${res.homeScore}, ${t2.name.toUpperCase()} ${res.awayScore}`);
    tickerItems.push(res.headline.toUpperCase());
  });

  inner.innerHTML = tickerItems.map(item => 
    `<span style="font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:2px;margin-right:60px;">${item}</span>`
  ).join('');

  wrap.appendChild(inner);

  // Inject animation if not exists
  if (!document.getElementById('ticker-style')) {
    const s = document.createElement('style');
    s.id = 'ticker-style';
    s.textContent = `
      @keyframes tickerScroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
      }
    `;
    document.head.appendChild(s);
  }

  return wrap;
}
