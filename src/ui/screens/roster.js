/**
 * TORCH — Meet The Squads (Pre-game Roster Preview)
 * Tabbed view: YOUR TEAM / OPPONENT. Compact player rows with position badges.
 * TORCH brand header, side-of-ball section headers, flame badge START GAME button.
 */

import { gsap } from 'gsap';
import { GS, setGs, getTeam } from '../../state.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { TEAMS } from '../../data/teams.js';
import { renderTeamBadge } from '../../assets/icons/teamLogos.js';
import { renderTeamWordmark } from '../teamWordmark.js';
import { TEAM_WORDMARKS } from '../../data/teamWordmarks.js';
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
      (yActive ? 'background:linear-gradient(180deg,' + teamColor + '18,' + teamColor + '08);border:1.5px solid ' + teamColor + '66;' : 'background:rgba(255,255,255,0.02);border:1.5px solid rgba(255,255,255,0.06);opacity:0.5;');
    yourTab.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:" + teamColor + ";letter-spacing:2px;\">" + team.name.toUpperCase() + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:8px;color:" + (yActive ? teamColor + '88' : '#555') + ";letter-spacing:1px;\">YOUR TEAM</div>";

    var oActive = activeTab === 'opp';
    oppTab.style.cssText = 'flex:1;padding:8px;border-radius:6px;text-align:center;cursor:pointer;' +
      (oActive ? 'background:linear-gradient(180deg,' + oppColor + '18,' + oppColor + '08);border:1.5px solid ' + oppColor + '66;' : 'background:rgba(255,255,255,0.02);border:1.5px solid rgba(255,255,255,0.06);opacity:0.5;');
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
  content.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:6px 10px 4px;';

  function renderContent() {
    content.innerHTML = '';
    var tid = activeTab === 'yours' ? GS.team : GS.opponent;
    var tm = TEAMS[tid];
    var ac = tm.accent || tm.colors.primary;
    var offRoster = sortByPos(getOffenseRoster(tid), OFF_POS_ORDER);
    var defRoster = sortByPos(getDefenseRoster(tid), DEF_POS_ORDER);

    // ── TEAM IDENTITY STRIP ──
    // Compact card: badge + school/name stack + OFF/DEF scheme tags + motto.
    // Gives the roster context without eating vertical space.
    var teamHdr = document.createElement('div');
    teamHdr.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 10px;margin-bottom:6px;border-radius:6px;background:linear-gradient(90deg,' + ac + '18,' + ac + '04 60%,transparent);border:1px solid ' + ac + '33;border-left:3px solid ' + ac + ';';
    teamHdr.innerHTML =
      '<div style="flex-shrink:0;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6));">' + renderTeamBadge(tid, 38) + '</div>' +
      '<div style="flex:1;min-width:0;">' +
        "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:8px;color:rgba(255,255,255,0.35);letter-spacing:1.5px;line-height:1;\">" + (tm.school || '').toUpperCase() + "</div>" +
        '<div id="rosterHdrName" style="margin-top:2px;"></div>' +
        '<div style="display:flex;gap:6px;margin-top:3px;align-items:center;">' +
          "<span style=\"font-family:'Oswald';font-weight:700;font-size:8px;color:#00ff44;letter-spacing:1px;\">OFF</span>" +
          "<span style=\"font-family:'Oswald';font-weight:700;font-size:9px;color:#fff;letter-spacing:0.5px;\">" + (tm.offScheme || '') + "</span>" +
          '<span style="width:1px;height:8px;background:rgba(255,255,255,0.15);"></span>' +
          "<span style=\"font-family:'Oswald';font-weight:700;font-size:8px;color:#4DA6FF;letter-spacing:1px;\">DEF</span>" +
          "<span style=\"font-family:'Oswald';font-weight:700;font-size:9px;color:#fff;letter-spacing:0.5px;\">" + (tm.defScheme || '') + "</span>" +
        '</div>' +
      '</div>';
    content.appendChild(teamHdr);
    // Inject per-team wordmark in place of the Teko team name
    var _rwmCfg = TEAM_WORDMARKS[tid] || {};
    var _rwmSize = Math.max(16, Math.round((_rwmCfg.heroSize || 40) * 0.40));
    var _rwm = renderTeamWordmark(tid, 't2', { mascot: true, fontSize: _rwmSize });
    var _rwmSlot = teamHdr.querySelector('#rosterHdrName');
    if (_rwmSlot && _rwm) _rwmSlot.appendChild(_rwm);

    // Motto micro-strip (if present)
    if (tm.motto) {
      var motto = document.createElement('div');
      motto.style.cssText = "font-family:'Rajdhani';font-style:italic;font-weight:500;font-size:9px;color:" + ac + "99;letter-spacing:0.5px;text-align:center;padding:2px 0 6px;";
      motto.textContent = '\u201C' + tm.motto + '\u201D';
      content.appendChild(motto);
    }

    // ── OFFENSE SECTION HEADER ──
    var offAvg = avgStars(offRoster);
    content.appendChild(buildSectionHeader('OFFENSE', '#00ff44', offAvg, offRoster.length));

    var rows = [];
    offRoster.forEach(function(p) {
      var row = buildRow(p, tm, ac, '#00ff44');
      content.appendChild(row);
      rows.push(row);
    });

    // ── DEFENSE SECTION HEADER ──
    var defAvg = avgStars(defRoster);
    var defHdr = buildSectionHeader('DEFENSE', '#4DA6FF', defAvg, defRoster.length);
    defHdr.style.marginTop = '8px';
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

  // Average star rating helper — used to show side-of-ball strength at a glance.
  function avgStars(roster) {
    if (!roster || !roster.length) return 0;
    var sum = 0;
    for (var i = 0; i < roster.length; i++) sum += (roster[i].stars || 3);
    return sum / roster.length;
  }

  // Symmetric section header with color accent, avg star pips, player count.
  function buildSectionHeader(label, color, avg, count) {
    var hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 2px;margin-top:4px;';
    var pipsHtml = renderFlamePips(Math.round(avg), 5, color, 8);
    hdr.innerHTML =
      '<div style="height:2px;flex:0 0 12px;background:' + color + ';border-radius:1px;"></div>' +
      "<div style=\"font-family:'Oswald';font-weight:700;font-size:11px;color:" + color + ";letter-spacing:3px;\">" + label + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:8px;color:" + color + "88;letter-spacing:0.5px;\">" + count + " PLAYERS</div>" +
      '<div style="height:1px;flex:1;background:linear-gradient(90deg,' + color + '22,transparent);"></div>' +
      '<div style="display:flex;flex-shrink:0;opacity:0.9;">' + pipsHtml + '</div>';
    return hdr;
  }

  renderContent();
  el.appendChild(content);

  // ── START GAME BUTTON ──
  var btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'flex-shrink:0;padding:8px 14px 14px;padding-bottom:max(14px,env(safe-area-inset-bottom,0px));position:relative;z-index:25;';

  var startBtn = buildFlameBadgeButton('START GAME', function() {
    if (SND.snap) SND.snap(); else if (SND.click) SND.click();
    // Now hands off to the pregame runway (matchup slam → coin toss →
    // kickoff) before entering gameplay.
    setGs(function(s) { return Object.assign({}, s, { screen: 'pregame' }); });
  });

  btnWrap.appendChild(startBtn);
  el.appendChild(btnWrap);

  return el;
}

// ── Build a compact player row ──
// Star players get a stronger left border, subtle gold-tinted background, and
// a visible star title. Non-stars stay muted but readable. Row height kept
// tight so all 14 players fit on a standard phone viewport alongside the
// team strip, two section headers, and the START GAME button.
function buildRow(p, tm, ac, sideColor) {
  var isStar = p.isStar;
  var row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:7px;padding:5px 8px;margin:1px 0;border-radius:6px;position:relative;' +
    (isStar
      ? 'background:linear-gradient(90deg,' + ac + '1c,' + ac + '06 40%,transparent);border-left:3px solid ' + ac + ';box-shadow:inset 0 0 0 1px ' + ac + '14;'
      : 'border-left:3px solid transparent;');

  // Number — star players get team accent, non-stars get muted gray
  row.innerHTML =
    "<div style=\"font-family:'Teko';font-weight:700;font-size:17px;color:" + (isStar ? ac : '#555') + ";width:24px;text-align:right;line-height:1;flex-shrink:0;\">" + (p.num || '') + "</div>" +
    // Position badge — filled for stars, outlined for non-stars
    "<div style=\"font-family:'Oswald';font-weight:700;font-size:8px;color:" + (isStar ? '#0A0804' : sideColor) + ";background:" + (isStar ? sideColor : sideColor + '14') + ";border:1px solid " + sideColor + (isStar ? 'cc' : '33') + ";border-radius:4px;padding:2px 5px;flex-shrink:0;letter-spacing:1px;min-width:18px;text-align:center;\">" + p.pos + "</div>" +
    // Name + star title
    '<div style="flex:1;min-width:0;">' +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:13px;color:" + (isStar ? '#fff' : '#bbb') + ";line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\">" + (p.firstName ? p.firstName + ' ' + p.name : p.name) + "</div>" +
      (isStar && p.starTitle
        ? "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:8px;color:" + ac + ";font-style:italic;letter-spacing:0.3px;line-height:1.2;margin-top:1px;\">" + p.starTitle + "</div>"
        : '') +
    '</div>' +
    // Trait — fixed width so text right-aligns consistently across rows
    "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:8px;color:" + (isStar ? ac : '#888') + ";letter-spacing:0.5px;flex-shrink:0;text-align:right;white-space:nowrap;width:86px;overflow:hidden;text-overflow:ellipsis;\">" + (p.trait || '\u2014') + "</div>" +
    // Flame star pips — LAST so they always sit flush against the right edge.
    // Previously trait was rightmost and its variable width pushed pips around.
    "<div style=\"display:flex;flex-shrink:0;gap:0;width:40px;justify-content:flex-end;margin-left:6px;\">" + renderFlamePips(p.stars || 3, 5, '#EBB010', 7) + "</div>";

  return row;
}
