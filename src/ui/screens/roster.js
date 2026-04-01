/**
 * TORCH — Meet The Squads (Pre-game Roster Preview)
 * Shows both teams' rosters (7 offense + 7 defense each) with stars, position, full name, trait.
 * Appears between pregame and gameplay.
 */

import { gsap } from 'gsap';
import { GS, setGs, getTeam } from '../../state.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { TEAMS } from '../../data/teams.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { renderFlamePips } from '../components/cards.js';
import { SND } from '../../engine/sound.js';

function buildPlayerRow(p, team, isStar) {
  var row = document.createElement('div');
  var ac = team.accent;
  row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;margin:2px 0;border-radius:6px;opacity:0;border-left:3px solid ' + (isStar ? ac : '#222') + ';background:' + (isStar ? 'linear-gradient(90deg,' + team.colors.primary + '12,transparent)' : 'transparent') + ';';

  // Number
  var numEl = document.createElement('div');
  numEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:18px;color:" + (isStar ? ac : '#555') + ";width:28px;flex-shrink:0;text-align:right;line-height:1;";
  numEl.textContent = p.num || '';

  // Position
  var posEl = document.createElement('div');
  posEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#666;width:20px;flex-shrink:0;text-align:center;";
  posEl.textContent = p.pos;

  // Stars
  var starsEl = document.createElement('div');
  starsEl.style.cssText = "display:flex;align-items:center;flex-shrink:0;";
  starsEl.innerHTML = renderFlamePips(p.stars || 3, 5, '#EBB010', 8);

  // Name
  var nameEl = document.createElement('div');
  nameEl.style.cssText = "flex:1;min-width:0;";
  var fullName = (p.firstName ? p.firstName + ' ' : '') + p.name;
  if (isStar && p.starTitle) {
    nameEl.innerHTML =
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:14px;color:" + ac + ";line-height:1.1;\">" + fullName + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:8px;color:" + ac + "77;font-style:italic;\">" + p.starTitle + "</div>";
  } else {
    nameEl.innerHTML = "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:14px;color:#ccc;line-height:1.1;\">" + fullName + "</div>";
  }

  // Trait
  var traitEl = document.createElement('div');
  traitEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:8px;color:" + (isStar ? ac : '#555') + ";letter-spacing:0.5px;white-space:nowrap;text-align:right;";
  traitEl.textContent = p.trait || '';

  row.appendChild(numEl);
  row.appendChild(posEl);
  row.appendChild(starsEl);
  row.appendChild(nameEl);
  row.appendChild(traitEl);
  return row;
}

var OFF_POS_ORDER = ['QB', 'RB', 'WR', 'TE', 'OL'];
var DEF_POS_ORDER = ['DL', 'LB', 'CB', 'S'];

function sortByPos(players, order) {
  return players.slice().sort(function(a, b) {
    var ai = order.indexOf(a.pos);
    var bi = order.indexOf(b.pos);
    if (ai === -1) ai = 99;
    if (bi === -1) bi = 99;
    return ai - bi;
  });
}

function buildTeamRoster(teamId, label) {
  var team = TEAMS[teamId];
  var offRoster = sortByPos(getOffenseRoster(teamId), OFF_POS_ORDER);
  var defRoster = sortByPos(getDefenseRoster(teamId), DEF_POS_ORDER);
  var rows = [];

  var wrap = document.createElement('div');
  wrap.style.cssText = 'margin-bottom:20px;';

  // Team header with badge — card-like
  var hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;margin:0 8px;border-bottom:2px solid ' + team.accent + '33;';
  hdr.innerHTML =
    renderTeamBadge(teamId, 40) +
    "<div style='flex:1;'>" +
      "<div style=\"font-family:'Rajdhani';font-size:9px;font-weight:700;color:#555;letter-spacing:3px;\">" + label + "</div>" +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:24px;color:" + team.accent + ";letter-spacing:3px;line-height:1;\">" + team.name.toUpperCase() + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:10px;color:#444;letter-spacing:1px;margin-top:2px;\">" + team.offScheme + "</div>" +
    "</div>";
  wrap.appendChild(hdr);

  // Offense section
  var offSection = document.createElement('div');
  offSection.style.cssText = 'padding:0 8px;margin-top:10px;';
  var offLabel = document.createElement('div');
  offLabel.style.cssText = "font-family:'Teko';font-weight:700;font-size:14px;color:#FF6B00;letter-spacing:3px;padding:0 6px 4px;";
  offLabel.textContent = 'OFFENSE';
  offSection.appendChild(offLabel);

  offRoster.forEach(function(p) {
    var row = buildPlayerRow(p, team, p.isStar);
    offSection.appendChild(row);
    rows.push(row);
  });
  wrap.appendChild(offSection);

  // Defense section
  var defSection = document.createElement('div');
  defSection.style.cssText = 'padding:0 8px;margin-top:12px;';
  var defLabel = document.createElement('div');
  defLabel.style.cssText = "font-family:'Teko';font-weight:700;font-size:14px;color:#4DA6FF;letter-spacing:3px;padding:0 6px 4px;";
  defLabel.textContent = 'DEFENSE';
  defSection.appendChild(defLabel);

  defRoster.forEach(function(p) {
    var row = buildPlayerRow(p, team, p.isStar);
    defSection.appendChild(row);
    rows.push(row);
  });
  wrap.appendChild(defSection);

  return { el: wrap, rows: rows };
}

export function buildRoster() {
  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow-y:auto;';

  // Title
  var title = document.createElement('div');
  title.style.cssText = "text-align:center;padding:24px 16px 12px;flex-shrink:0;";
  title.innerHTML =
    "<div style=\"font-family:'Teko';font-weight:700;font-size:30px;color:var(--a-gold);letter-spacing:6px;text-shadow:0 0 16px rgba(235,176,16,0.3);\">MEET THE SQUADS</div>";
  el.appendChild(title);

  var allRows = [];

  // Your team
  var yourRoster = buildTeamRoster(GS.team, 'YOUR TEAM');
  el.appendChild(yourRoster.el);
  allRows = allRows.concat(yourRoster.rows);

  // Divider
  var divider = document.createElement('div');
  divider.style.cssText = 'width:60px;height:2px;background:linear-gradient(90deg,transparent,#EBB01044,transparent);margin:8px auto;';
  el.appendChild(divider);

  // Opponent
  var oppRoster = buildTeamRoster(GS.opponent, 'OPPONENT');
  el.appendChild(oppRoster.el);
  allRows = allRows.concat(oppRoster.rows);

  // Continue button
  var btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'padding:16px 16px 28px;flex-shrink:0;';
  var continueBtn = document.createElement('button');
  continueBtn.className = 'btn-blitz';
  continueBtn.style.cssText = "width:100%;font-size:24px;padding:20px 24px;background:linear-gradient(180deg,#EBB010,#FF4511);border-color:#FF4511;color:#000;letter-spacing:5px;opacity:0;";
  continueBtn.textContent = 'START GAME';
  continueBtn.onclick = function() {
    SND.snap();
    setGs(function(s) { return Object.assign({}, s, { screen: 'gameplay' }); });
  };
  btnWrap.appendChild(continueBtn);
  el.appendChild(btnWrap);

  // GSAP entrance
  requestAnimationFrame(function() {
    gsap.to(allRows, {
      opacity: 1, duration: 0.2, stagger: 0.03, ease: 'power2.out',
      onComplete: function() {
        gsap.to(continueBtn, { opacity: 1, duration: 0.3, delay: 0.1 });
      }
    });
  });

  return el;
}
