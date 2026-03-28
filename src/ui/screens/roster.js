/**
 * TORCH — Meet Your Squad (Pre-game Roster Preview)
 * Shows all 14 players (7 offense + 7 defense) with stars, position, full name, trait.
 * Appears between team select and pregame.
 */

import { gsap } from 'gsap';
import { GS, setGs, getTeam } from '../../state.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { renderFlamePips } from '../components/cards.js';
import { SND } from '../../engine/sound.js';

function starString(count) {
  var s = '';
  for (var i = 0; i < 5; i++) s += i < count ? '\u2605' : '\u2606';
  return s;
}

function buildPlayerRow(p, team, isStar) {
  var row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 4px;border-bottom:1px solid #0E0A04;opacity:0;';

  if (isStar) {
    row.style.background = 'linear-gradient(90deg,rgba(235,176,16,0.08),transparent)';
    row.style.borderLeft = '3px solid #EBB010';
    row.style.paddingLeft = '8px';
  }

  // Stars (flame pips)
  var starsEl = document.createElement('div');
  starsEl.style.cssText = "display:flex;align-items:center;width:60px;flex-shrink:0;";
  starsEl.innerHTML = renderFlamePips(p.stars || 3, 5, '#EBB010', 11);

  // Position
  var posEl = document.createElement('div');
  posEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;width:22px;flex-shrink:0;text-align:center;";
  posEl.textContent = p.pos;

  // Full name
  var nameEl = document.createElement('div');
  nameEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:14px;color:" + (isStar ? '#EBB010' : '#e8e6ff') + ";flex:1;line-height:1.2;";
  var fullName = (p.firstName ? p.firstName + ' ' : '') + p.name;
  nameEl.textContent = fullName;
  if (isStar && p.starTitle) {
    nameEl.innerHTML = fullName + "<div style=\"font-size:9px;color:#EBB01099;font-style:italic;margin-top:1px;\">" + p.starTitle + "</div>";
  }

  // Trait
  var traitEl = document.createElement('div');
  traitEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:9px;color:" + team.accent + ";letter-spacing:1px;text-align:right;white-space:nowrap;";
  traitEl.textContent = p.trait || '';

  row.appendChild(starsEl);
  row.appendChild(posEl);
  row.appendChild(nameEl);
  row.appendChild(traitEl);
  return row;
}

export function buildRoster() {
  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow-y:auto;';

  var team = getTeam(GS.team);
  var offRoster = getOffenseRoster(GS.team);
  var defRoster = getDefenseRoster(GS.team);

  // Header — big logo
  var hdr = document.createElement('div');
  hdr.style.cssText = 'padding:24px 16px 8px;text-align:center;flex-shrink:0;';
  hdr.innerHTML =
    '<div style="display:flex;justify-content:center;margin-bottom:10px;">' + renderTeamBadge(GS.team, 80) + '</div>' +
    "<div style=\"font-family:'Teko';font-weight:700;font-size:32px;color:" + team.accent + ";letter-spacing:5px;\">" + team.name.toUpperCase() + "</div>" +
    "<div style=\"font-family:'Rajdhani';font-size:11px;color:#666;letter-spacing:3px;margin-top:2px;\">MEET YOUR SQUAD</div>";
  el.appendChild(hdr);

  var rows = [];

  // Offense section
  var offSection = document.createElement('div');
  offSection.style.cssText = 'padding:0 12px;';
  var offLabel = document.createElement('div');
  offLabel.style.cssText = "font-family:'Teko';font-weight:700;font-size:14px;color:#FF6B00;letter-spacing:3px;margin-bottom:4px;border-bottom:1px solid #1E1610;padding-bottom:3px;";
  offLabel.textContent = 'OFFENSE';
  offSection.appendChild(offLabel);

  offRoster.forEach(function(p) {
    var row = buildPlayerRow(p, team, p.isStar);
    offSection.appendChild(row);
    rows.push(row);
  });
  el.appendChild(offSection);

  // Defense section
  var defSection = document.createElement('div');
  defSection.style.cssText = 'padding:0 12px;margin-top:10px;';
  var defLabel = document.createElement('div');
  defLabel.style.cssText = "font-family:'Teko';font-weight:700;font-size:14px;color:#4DA6FF;letter-spacing:3px;margin-bottom:4px;border-bottom:1px solid #1E1610;padding-bottom:3px;";
  defLabel.textContent = 'DEFENSE';
  defSection.appendChild(defLabel);

  defRoster.forEach(function(p) {
    var row = buildPlayerRow(p, team, p.isStar);
    defSection.appendChild(row);
    rows.push(row);
  });
  el.appendChild(defSection);

  // Continue button
  var btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'padding:16px 16px 24px;flex-shrink:0;';
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

  // GSAP entrance
  requestAnimationFrame(function() {
    gsap.to(rows, {
      opacity: 1, duration: 0.25, stagger: 0.04, ease: 'power2.out',
      onComplete: function() {
        gsap.to(continueBtn, { opacity: 1, duration: 0.3, delay: 0.15 });
      }
    });
  });

  return el;
}
