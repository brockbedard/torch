/**
 * TORCH — Meet The Squads (Pre-game Roster Preview)
 * Tabbed view: YOUR TEAM / OPPONENT. Compact player rows with position badges.
 * TORCH brand header, side-of-ball section headers, flame badge START GAME button.
 */

import { gsap } from 'gsap';
import { GS, setGs, getTeam } from '../../state.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { TEAMS } from '../../data/teams.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { renderFlamePips } from '../components/cards.js';
import { FLAME_PATH, buildTorchHeader, buildFlameBadgeButton, buildAccentBar } from '../components/brand.js';
import { SND } from '../../engine/sound.js';

var OFF_POS_ORDER = ['QB', 'RB', 'WR', 'TE', 'OL'];
var DEF_POS_ORDER = ['DL', 'LB', 'CB', 'S'];

function sortByPos(players, order) {
  return players.slice().sort(function(a, b) {
    var ai = order.indexOf(a.pos); if (ai === -1) ai = 99;
    var bi = order.indexOf(b.pos); if (bi === -1) bi = 99;
    return ai - bi;
  });
}

// Keyframes borderFlow, emblemPulse, breatheGlow now in style.css

export function buildRoster() {
  var el = document.createElement('div');
  el.style.cssText = 'height:100vh;height:100dvh;display:flex;flex-direction:column;background:#0A0804;overflow:hidden;padding-top:env(safe-area-inset-top,0px);';

  var team = TEAMS[GS.team];
  var opp = TEAMS[GS.opponent];
  if (!team || !opp) { setGs(function(s) { return Object.assign({}, s, { screen: 'gameplay' }); }); return el; }

  var teamColor = team.accent || team.colors.primary;
  var oppColor = opp.accent || opp.colors.primary;

  // ── HEADER ──
  var header = buildTorchHeader('MEET THE SQUADS');
  el.appendChild(header);

  // ── TABS ──
  var activeTab = 'yours';
  var tabs = document.createElement('div');
  tabs.style.cssText = 'flex-shrink:0;display:flex;padding:0 14px;gap:4px;margin-top:6px;';

  var yourTab = document.createElement('div');
  var oppTab = document.createElement('div');

  function renderTabs() {
    var yActive = activeTab === 'yours';
    yourTab.style.cssText = 'flex:1;padding:8px;border-radius:6px;text-align:center;cursor:pointer;' +
      (yActive ? 'background:linear-gradient(180deg,' + teamColor + '18,' + teamColor + '08);border:1.5px solid ' + teamColor + '66;' : 'background:rgba(255,255,255,0.02);border:1.5px solid #1a1a1a;opacity:0.5;');
    yourTab.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:" + teamColor + ";letter-spacing:2px;\">" + team.name.toUpperCase() + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:8px;color:" + (yActive ? teamColor + '88' : '#555') + ";letter-spacing:1px;\">YOUR TEAM</div>";

    var oActive = activeTab === 'opp';
    oppTab.style.cssText = 'flex:1;padding:8px;border-radius:6px;text-align:center;cursor:pointer;' +
      (oActive ? 'background:linear-gradient(180deg,' + oppColor + '18,' + oppColor + '08);border:1.5px solid ' + oppColor + '66;' : 'background:rgba(255,255,255,0.02);border:1.5px solid #1a1a1a;opacity:0.5;');
    oppTab.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:" + oppColor + ";letter-spacing:2px;\">" + opp.name.toUpperCase() + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:8px;color:" + (oActive ? oppColor + '88' : '#555') + ";letter-spacing:1px;\">OPPONENT</div>";
  }

  yourTab.onclick = function() { if (activeTab === 'yours') return; SND.click(); activeTab = 'yours'; renderTabs(); renderContent(); };
  oppTab.onclick = function() { if (activeTab === 'opp') return; SND.click(); activeTab = 'opp'; renderTabs(); renderContent(); };
  tabs.appendChild(yourTab);
  tabs.appendChild(oppTab);
  renderTabs();
  el.appendChild(tabs);

  // ── CONTENT (scrollable) ──
  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 10px;';

  function renderContent() {
    content.innerHTML = '';
    var tid = activeTab === 'yours' ? GS.team : GS.opponent;
    var tm = TEAMS[tid];
    var ac = tm.accent || tm.colors.primary;
    var offRoster = sortByPos(getOffenseRoster(tid), OFF_POS_ORDER);
    var defRoster = sortByPos(getDefenseRoster(tid), DEF_POS_ORDER);

    // Team header card
    var teamHdr = document.createElement('div');
    teamHdr.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:8px;border-radius:6px;background:linear-gradient(90deg,' + ac + '12,transparent);border-left:3px solid ' + ac + ';';
    teamHdr.innerHTML =
      renderTeamBadge(tid, 40) +
      '<div style="flex:1;">' +
        "<div style=\"font-family:'Teko';font-weight:700;font-size:22px;color:#fff;letter-spacing:2px;line-height:0.9;\">" + (tm.school ? tm.school.toUpperCase() + ' ' : '') + tm.name.toUpperCase() + "</div>" +
        "<div style=\"font-family:'Oswald';font-weight:700;font-size:9px;color:" + ac + ";letter-spacing:1.5px;margin-top:2px;\">" + tm.offScheme + "</div>" +
      '</div>';
    content.appendChild(teamHdr);

    // OFFENSE
    var offHdr = document.createElement('div');
    offHdr.style.cssText = 'display:flex;align-items:center;gap:6px;padding:6px 4px;margin-top:4px;';
    offHdr.innerHTML =
      '<div style="height:2px;flex:0 0 12px;background:#00ff44;border-radius:1px;"></div>' +
      "<div style=\"font-family:'Oswald';font-weight:700;font-size:11px;color:#00ff44;letter-spacing:3px;\">OFFENSE</div>" +
      '<div style="height:1px;flex:1;background:linear-gradient(90deg,#00ff4422,transparent);"></div>';
    content.appendChild(offHdr);

    var rows = [];
    offRoster.forEach(function(p) {
      var row = buildRow(p, tm, ac, '#00ff44');
      content.appendChild(row);
      rows.push(row);
    });

    // DEFENSE
    var defHdr = document.createElement('div');
    defHdr.style.cssText = 'display:flex;align-items:center;gap:6px;padding:6px 4px;margin-top:10px;';
    defHdr.innerHTML =
      '<div style="height:2px;flex:0 0 12px;background:#4DA6FF;border-radius:1px;"></div>' +
      "<div style=\"font-family:'Oswald';font-weight:700;font-size:11px;color:#4DA6FF;letter-spacing:3px;\">DEFENSE</div>" +
      '<div style="height:1px;flex:1;background:linear-gradient(90deg,#4DA6FF22,transparent);"></div>';
    content.appendChild(defHdr);

    defRoster.forEach(function(p) {
      var row = buildRow(p, tm, ac, '#4DA6FF');
      content.appendChild(row);
      rows.push(row);
    });

    // Animate rows in
    try {
      gsap.from(rows, { opacity: 0, x: -10, duration: 0.15, stagger: 0.02, ease: 'power2.out' });
    } catch(e) {}
  }

  renderContent();
  el.appendChild(content);

  // ── START GAME BUTTON ──
  var btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'flex-shrink:0;padding:8px 14px 14px;padding-bottom:max(14px,env(safe-area-inset-bottom,0px));';

  var startBtn = buildFlameBadgeButton('START GAME', function() {
    SND.snap();
    setGs(function(s) { return Object.assign({}, s, { screen: 'gameplay' }); });
  });

  btnWrap.appendChild(startBtn);
  el.appendChild(btnWrap);

  // Bottom accent
  el.appendChild(buildAccentBar(teamColor, teamColor));

  return el;
}

// ── Build a compact player row ──
function buildRow(p, tm, ac, sideColor) {
  var isStar = p.isStar;
  var row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:7px 8px;margin:2px 0;border-radius:5px;' +
    (isStar ? 'background:linear-gradient(90deg,' + ac + '10,transparent);border-left:2px solid ' + ac + ';' : 'border-left:2px solid transparent;');

  // Number
  row.innerHTML =
    "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:" + (isStar ? ac : '#444') + ";width:24px;text-align:right;line-height:1;flex-shrink:0;\">" + (p.num || '') + "</div>" +
    // Position badge
    "<div style=\"font-family:'Oswald';font-weight:700;font-size:8px;color:" + sideColor + ";background:" + sideColor + "12;border:1px solid " + sideColor + "22;border-radius:3px;padding:1px 4px;flex-shrink:0;letter-spacing:0.5px;\">" + p.pos + "</div>" +
    // Name
    '<div style="flex:1;min-width:0;">' +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:13px;color:" + (isStar ? '#fff' : '#bbb') + ";line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\">" + p.name + "</div>" +
      (isStar && p.starTitle ? "<div style=\"font-family:'Rajdhani';font-size:8px;color:" + ac + "88;font-style:italic;\">" + p.starTitle + "</div>" : '') +
    '</div>' +
    // Stars
    '<div style="display:flex;flex-shrink:0;">' + renderFlamePips(p.stars || 3, 5, '#EBB010', 7) + '</div>' +
    // Trait
    "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:7px;color:" + (isStar ? ac : '#444') + ";letter-spacing:0.5px;flex-shrink:0;text-align:right;width:50px;white-space:nowrap;\">" + (p.trait || '') + "</div>";

  return row;
}
