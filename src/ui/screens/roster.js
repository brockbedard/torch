/**
 * TORCH — Meet Your Squad (Pre-game Roster Preview)
 * Shows all 7 offensive players with stars, position, name, and trait.
 * Appears between team select and pregame. Defense roster shown later.
 */

import { gsap } from 'gsap';
import { GS, setGs, getTeam } from '../../state.js';
import { getOffenseRoster } from '../../data/players.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { SND } from '../../engine/sound.js';

function starString(count) {
  var s = '';
  for (var i = 0; i < 5; i++) s += i < count ? '\u2605' : '\u2606';
  return s;
}

export function buildRoster() {
  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow-y:auto;';

  var team = getTeam(GS.team);
  var roster = getOffenseRoster(GS.team);

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText = 'padding:20px 16px 12px;text-align:center;flex-shrink:0;';
  hdr.innerHTML =
    '<div style="display:flex;justify-content:center;margin-bottom:8px;">' + renderTeamBadge(GS.team, 48) + '</div>' +
    "<div style=\"font-family:'Teko';font-weight:700;font-size:28px;color:" + team.accent + ";letter-spacing:4px;\">" + team.name.toUpperCase() + "</div>" +
    "<div style=\"font-family:'Rajdhani';font-size:12px;color:#666;letter-spacing:2px;margin-top:2px;\">MEET YOUR SQUAD</div>";
  el.appendChild(hdr);

  // Offense section
  var section = document.createElement('div');
  section.style.cssText = 'padding:0 16px;';

  var label = document.createElement('div');
  label.style.cssText = "font-family:'Teko';font-weight:700;font-size:16px;color:#FF6B00;letter-spacing:3px;margin-bottom:6px;border-bottom:1px solid #1E1610;padding-bottom:4px;";
  label.textContent = 'OFFENSE';
  section.appendChild(label);

  var rows = [];
  roster.forEach(function(p) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #0E0A04;opacity:0;';

    // Stars
    var starsEl = document.createElement('div');
    starsEl.style.cssText = "font-size:12px;color:#EBB010;width:68px;flex-shrink:0;letter-spacing:1px;";
    starsEl.textContent = starString(p.stars || 3);

    // Position
    var posEl = document.createElement('div');
    posEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:11px;color:#888;width:24px;flex-shrink:0;text-align:center;";
    posEl.textContent = p.pos;

    // Name
    var nameEl = document.createElement('div');
    nameEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:14px;color:#e8e6ff;flex:1;";
    nameEl.textContent = p.name;

    // Trait
    var traitEl = document.createElement('div');
    traitEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:" + team.accent + ";letter-spacing:1px;text-align:right;";
    traitEl.textContent = p.trait || '';

    // Star player badge
    if (p.isStar) {
      nameEl.style.color = '#EBB010';
      row.style.background = 'rgba(235,176,16,0.04)';
    }

    row.appendChild(starsEl);
    row.appendChild(posEl);
    row.appendChild(nameEl);
    row.appendChild(traitEl);
    section.appendChild(row);
    rows.push(row);
  });

  el.appendChild(section);

  // Continue button
  var btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'padding:20px 16px;flex-shrink:0;';
  var continueBtn = document.createElement('button');
  continueBtn.className = 'btn-blitz';
  continueBtn.style.cssText = "width:100%;font-size:14px;background:linear-gradient(180deg,#EBB010,#FF4511);border-color:#FF4511;color:#000;letter-spacing:2px;opacity:0;";
  continueBtn.textContent = 'CONTINUE \u2192';
  continueBtn.onclick = function() {
    SND.snap();
    setGs(function(s) { return Object.assign({}, s, { screen: 'pregame' }); });
  };
  btnWrap.appendChild(continueBtn);
  el.appendChild(btnWrap);

  // GSAP entrance — stagger rows in, then show button
  requestAnimationFrame(function() {
    gsap.to(rows, {
      opacity: 1, duration: 0.3, stagger: 0.06, ease: 'power2.out',
      onComplete: function() {
        gsap.to(continueBtn, { opacity: 1, duration: 0.3, delay: 0.2 });
      }
    });
  });

  return el;
}
