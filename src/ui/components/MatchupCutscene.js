/**
 * TORCH — Matchup Transition Screen
 * Phase 7: Million Dollar Immersion.
 * High-impact "VS" cutscene between pregame and gameplay.
 */

import { gsap } from 'gsap';
import { getTeam } from '../../state.js';
import { renderTeamBadge } from '../../assets/icons/teamLogos.js';

export function buildMatchupCutscene(teamId, opponentId, onComplete) {
  const team = getTeam(teamId);
  const opp = getTeam(opponentId);

  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;z-index:2000;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden;';

  const centerLine = document.createElement('div');
  centerLine.style.cssText = 'position:absolute;width:2px;height:0%;background:#fff;opacity:0.2;';
  el.appendChild(centerLine);

  function mkSide(t, side) {
    const wrap = document.createElement('div');
    wrap.style.cssText = `position:absolute;top:0;bottom:0;width:50%;${side}:0;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;`;
    
    const bg = document.createElement('div');
    bg.style.cssText = `position:absolute;inset:0;background:${t.accent}15;transform:translateX(${side === 'left' ? '-100%' : '100%'});`;
    wrap.appendChild(bg);

    const badge = document.createElement('div');
    badge.style.cssText = 'transform:scale(0);opacity:0;z-index:2;';
    badge.innerHTML = renderTeamBadge(t.id, 120);
    wrap.appendChild(badge);

    const name = document.createElement('div');
    name.style.cssText = `font-family:'Teko';font-weight:900;font-size:60px;color:${t.accent};letter-spacing:10px;margin-top:20px;opacity:0;transform:translateY(20px);z-index:2;`;
    name.textContent = t.name.toUpperCase();
    wrap.appendChild(name);

    return { wrap, bg, badge, name };
  }

  const left = mkSide(team, 'left');
  const right = mkSide(opp, 'right');

  el.appendChild(left.wrap);
  el.appendChild(right.wrap);

  const vs = document.createElement('div');
  vs.style.cssText = "position:absolute;font-family:'Teko';font-weight:900;font-size:120px;color:#fff;font-style:italic;transform:scale(4) skewX(-15deg);opacity:0;z-index:10;text-shadow:0 0 40px rgba(255,255,255,0.5);";
  vs.textContent = 'VS';
  el.appendChild(vs);

  let _dismissed = false;
  function dismiss() {
    if (_dismissed) return;
    _dismissed = true;
    gsap.killTweensOf(el);
    gsap.to(el, { opacity: 0, duration: 0.3, onComplete: () => {
      if (el.parentNode) el.remove();
      if (onComplete) onComplete();
    }});
  }

  // Tap anywhere to skip — makes it feel responsive, not frozen
  el.addEventListener('click', dismiss);
  el.addEventListener('touchend', function(e) { e.preventDefault(); dismiss(); }, { passive: false });

  requestAnimationFrame(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(dismiss, 300);
      }
    });

    tl.to(centerLine, { height: '100%', duration: 0.4, ease: 'power2.inOut' });
    tl.to([left.bg, right.bg], { x: '0%', duration: 0.6, ease: 'expo.out' }, '-=0.2');
    tl.to(vs, { opacity: 0.1, scale: 1, duration: 0.4, ease: 'power4.out' }, '-=0.4');
    tl.to([left.badge, right.badge], { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' });
    tl.to([left.name, right.name], { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, '-=0.3');
    tl.to(vs, { opacity: 1, scale: 1.2, duration: 0.2, ease: 'elastic.out(1, 0.3)' }, '-=0.1');

    // Safety net: force dismiss after 6s no matter what
    setTimeout(dismiss, 6000);
  });

  return el;
}
