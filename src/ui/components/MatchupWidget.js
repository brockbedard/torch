/**
 * TORCH — Matchup Widget
 * Premium glassmorphic panel showing current matchup.
 */

import { getTeam } from '../../state.js';

/**
 * Build the Matchup Widget.
 * @param {string} teamId
 * @param {string} opponentId
 * @returns {HTMLElement}
 */
export function buildMatchupWidget(teamId, opponentId) {
  const team = getTeam(teamId);
  const opp = getTeam(opponentId);

  const wrap = document.createElement('div');
  wrap.className = 'glass-panel matchup-widget';

  // Add shimmer
  const shimmer = document.createElement('div');
  shimmer.className = 'matchup-shimmer';
  wrap.appendChild(shimmer);

  function mkTeamSide(t, align) {
    const side = document.createElement('div');
    side.style.cssText = `display:flex;flex-direction:column;align-items:${align === 'left' ? 'flex-start' : 'flex-end'};gap:2px;`;
    
    const name = document.createElement('div');
    name.style.cssText = `font-family:'Teko';font-weight:700;font-size:20px;color:${t.accent};letter-spacing:2px;line-height:1;`;
    name.textContent = t.name.toUpperCase();
    
    const school = document.createElement('div');
    school.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;";
    school.textContent = t.school;

    side.appendChild(name);
    side.appendChild(school);
    return side;
  }

  const left = mkTeamSide(team, 'left');
  const right = mkTeamSide(opp, 'right');

  const vsWrap = document.createElement('div');
  vsWrap.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;';
  
  const vsBadge = document.createElement('div');
  vsBadge.style.cssText = "font-family:'Teko';font-weight:900;font-size:24px;color:#fff;font-style:italic;transform:skewX(-15deg);text-shadow:0 0 12px rgba(255,255,255,0.3);z-index:2;";
  vsBadge.textContent = 'VS';
  
  const vsGlow = document.createElement('div');
  vsGlow.style.cssText = `position:absolute;inset:0;background:radial-gradient(circle, ${team.accent}33 0%, ${opp.accent}33 100%);filter:blur(8px);z-index:1;`;

  vsWrap.appendChild(vsBadge);
  vsWrap.appendChild(vsGlow);

  wrap.appendChild(left);
  wrap.appendChild(vsWrap);
  wrap.appendChild(right);

  return wrap;
}
