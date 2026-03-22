/**
 * TORCH v0.21 — Team Select Screen
 * 2x2 grid of 4 teams. Tap to select → fighting-game confirmation → VS → gameplay.
 * Replaces: setup.js, draft.js, cardDraft.js, coinToss.js
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOffCards, getDefCards, shuffle } from '../../state.js';
import { TEAMS, getSeasonOpponents } from '../../data/teams.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { buildMaddenPlayer, teamHelmetSvg, renderFlamePips } from '../components/cards.js';

// ============================================================
// TEAM-SPECIFIC AUDIO STINGS (jsfxr presets)
// ============================================================
var TEAM_STINGS = {
  sentinels: 'powerUp',    // Regal, warm
  wolves:    'explosion',  // Heavy, ominous
  stags:     'hitHurt',    // Electric crack
  serpents:  'tone',       // Eerie
};

// ============================================================
// INJECT KEYFRAMES
// ============================================================
function injectAnimations() {
  if (document.getElementById('ts-anims')) return;
  var s = document.createElement('style');
  s.id = 'ts-anims';
  s.textContent =
    '@keyframes tsCardIn { 0%{opacity:0;transform:translateY(30px) scale(0.9)} 100%{opacity:1;transform:none} }' +
    '@keyframes tsFlash { 0%{opacity:0.7} 100%{opacity:0} }' +
    '@keyframes tsHelmetZoom { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }' +
    '@keyframes tsPlayerFan { 0%{opacity:0;transform:translateY(20px) scale(0.7)} 100%{opacity:1;transform:none} }' +
    '@keyframes tsVsSlam { 0%{transform:scale(2.5);opacity:0} 60%{transform:scale(0.9);opacity:1} 100%{transform:scale(1)} }' +
    '@keyframes tsShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-3px)} 40%{transform:translateX(3px)} 60%{transform:translateX(-2px)} 80%{transform:translateX(2px)} }' +
    '@keyframes tsWipe { 0%{clip-path:inset(0 100% 0 0)} 100%{clip-path:inset(0 0 0 0)} }' +
    '@keyframes tsTooltipIn { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:none} }';
  document.head.appendChild(s);
}

// ============================================================
// BUILD
// ============================================================
export function buildTeamSelect() {
  injectAnimations();
  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);position:relative;overflow:hidden;';

  var isFirst = GS && GS.isFirstSeason;

  // ── HEADER ──
  var hdr = document.createElement('div');
  hdr.style.cssText = 'background:rgba(0,0,0,0.5);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;border-bottom:2px solid var(--a-gold);z-index:10;';
  var hdrTitle = document.createElement('div');
  hdrTitle.style.cssText = "font-family:'Teko',sans-serif;font-weight:700;font-size:24px;color:var(--a-gold);letter-spacing:3px;font-style:italic;transform:skewX(-8deg);text-shadow:2px 2px 0 rgba(0,0,0,0.9);";
  hdrTitle.textContent = 'TORCH FOOTBALL';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = "font-family:'Rajdhani';font-size:10px;padding:8px 14px;cursor:pointer;background:#000;color:#fff;border:2px solid #333;border-radius:4px;";
  backBtn.textContent = '\u2190 BACK';
  backBtn.onclick = function() { SND.click(); setGs(null); };
  hdr.appendChild(hdrTitle);
  hdr.appendChild(backBtn);
  el.appendChild(hdr);

  // ── CONTENT ──
  var content = document.createElement('div');
  content.style.cssText = 'flex:1;display:flex;flex-direction:column;padding:12px 12px 20px;gap:10px;justify-content:center;';

  // Title
  var title = document.createElement('div');
  title.style.cssText = "font-family:'Teko';font-weight:700;font-size:20px;color:var(--a-gold);letter-spacing:2px;text-align:center;text-shadow:1px 1px 0 rgba(0,0,0,0.8);";
  title.textContent = 'CHOOSE YOUR TEAM';
  content.appendChild(title);

  // First-time tooltip
  if (isFirst && !localStorage.getItem('ts_tip_shown')) {
    var tip = document.createElement('div');
    tip.style.cssText = "text-align:center;font-family:'Rajdhani';font-weight:600;font-size:13px;color:rgba(255,255,255,0.8);padding:6px 12px;background:rgba(0,0,0,0.6);border-radius:8px;animation:tsTooltipIn 0.3s ease-out;";
    tip.textContent = 'Each team plays differently. Tap to choose.';
    content.appendChild(tip);
    // Dismiss on any tap after a short delay
    setTimeout(function() {
      el.addEventListener('click', function dismissTip() {
        if (tip.parentNode) tip.remove();
        localStorage.setItem('ts_tip_shown', '1');
        el.removeEventListener('click', dismissTip);
      }, { once: true });
    }, 500);
  }

  // ── 2x2 TEAM GRID ──
  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;';

  var teamIds = Object.keys(TEAMS);
  teamIds.forEach(function(tid, idx) {
    var team = TEAMS[tid];
    var card = document.createElement('div');
    card.style.cssText =
      'background:radial-gradient(ellipse at 50% 30%,' + team.colors.primary + '15,#141008);' +
      'border:2px solid ' + team.colors.primary + '44;border-radius:8px;padding:10px 8px;' +
      'cursor:pointer;transition:all 0.15s ease;display:flex;flex-direction:column;align-items:center;gap:4px;' +
      'opacity:0;animation:tsCardIn 0.35s ease-out ' + (idx * 0.1) + 's both;position:relative;overflow:hidden;';

    // Helmet (48px)
    var helmWrap = document.createElement('div');
    helmWrap.style.cssText = 'filter:drop-shadow(0 0 12px ' + team.colors.primary + '60);';
    helmWrap.innerHTML = teamHelmetSvg(tid, 48);
    card.appendChild(helmWrap);

    // Team name
    var nameEl = document.createElement('div');
    nameEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:18px;color:#fff;letter-spacing:2px;line-height:1;text-shadow:1px 1px 0 rgba(0,0,0,0.8);";
    nameEl.textContent = team.name;
    card.appendChild(nameEl);

    // Playstyle pill
    var pill = document.createElement('div');
    pill.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:8px;color:" + team.colors.secondary + ";letter-spacing:1px;background:" + team.colors.primary + "33;padding:2px 8px;border-radius:10px;";
    pill.textContent = team.offScheme;
    card.appendChild(pill);

    // Flame pip ratings
    var ratingsWrap = document.createElement('div');
    ratingsWrap.style.cssText = 'display:flex;flex-direction:column;gap:1px;width:100%;margin-top:2px;';
    var offRow = document.createElement('div');
    offRow.style.cssText = "display:flex;align-items:center;justify-content:space-between;font-family:'Rajdhani';font-size:8px;color:#aaa;";
    offRow.innerHTML = '<span>OFF</span><span>' + renderFlamePips(team.ratings.offense, 5, team.colors.secondary, 8) + '</span>';
    var defRow = document.createElement('div');
    defRow.style.cssText = "display:flex;align-items:center;justify-content:space-between;font-family:'Rajdhani';font-size:8px;color:#aaa;";
    defRow.innerHTML = '<span>DEF</span><span>' + renderFlamePips(team.ratings.defense, 5, team.colors.secondary, 8) + '</span>';
    ratingsWrap.appendChild(offRow);
    ratingsWrap.appendChild(defRow);
    card.appendChild(ratingsWrap);

    // Star player callout
    var offRoster = getOffenseRoster(tid);
    var star = offRoster.find(function(p) { return p.isStar; });
    if (star) {
      var starEl = document.createElement('div');
      starEl.style.cssText = "display:flex;align-items:center;gap:4px;margin-top:2px;font-family:'Rajdhani';font-size:8px;color:#FFB800;";
      starEl.innerHTML = '<svg viewBox="0 0 24 24" width="10" height="10"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z" fill="#FFB800"/></svg>' +
        star.starTitle + ' / ' + star.pos;
      card.appendChild(starEl);
    }

    // Motto
    var motto = document.createElement('div');
    motto.style.cssText = "font-family:'Rajdhani';font-size:7px;color:#666;font-style:italic;margin-top:1px;";
    motto.textContent = team.motto;
    card.appendChild(motto);

    // ── TAP HANDLER: starts the fighting-game animation ──
    card.onclick = function() {
      SND.click();
      startSelectionAnimation(el, tid, team, isFirst);
    };

    grid.appendChild(card);
  });
  content.appendChild(grid);

  // ── DIFFICULTY ROW (hidden on first game) ──
  if (!isFirst) {
    var diffRow = document.createElement('div');
    diffRow.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:4px;';
    var diffs = [
      { id: 'EASY', label: 'EASY', color: 'var(--l-green)' },
      { id: 'MEDIUM', label: 'MEDIUM', color: 'var(--a-gold)' },
      { id: 'HARD', label: 'HARD', color: 'var(--p-red)' },
    ];
    var selDiff = GS && GS.difficulty ? GS.difficulty : 'MEDIUM';
    diffs.forEach(function(d) {
      var btn = document.createElement('button');
      btn.className = 'btn-blitz';
      var isSel = selDiff === d.id;
      btn.style.cssText = 'font-size:10px;padding:8px 16px;flex:1;' +
        (isSel ? 'background:' + d.color + ';color:#000;border-color:' + d.color + ';' : 'background:transparent;color:#aaa;border-color:#333;');
      btn.textContent = d.label;
      btn.onclick = function(e) {
        e.stopPropagation();
        SND.click();
        selDiff = d.id;
        setGs(function(s) { return Object.assign({}, s, { difficulty: d.id }); });
      };
      diffRow.appendChild(btn);
    });
    content.appendChild(diffRow);
  }

  el.appendChild(content);
  return el;
}

// ============================================================
// FIGHTING-GAME SELECTION ANIMATION
// ============================================================
function startSelectionAnimation(container, teamId, team, isFirst) {
  // Determine opponent (first in season order)
  var opponents = getSeasonOpponents(teamId);
  var opponentId = opponents[0];
  var opponent = TEAMS[opponentId];

  // Resolve coin toss silently (50/50)
  var humanReceives = Math.random() < 0.5;

  // Set game state
  var difficulty = GS && GS.difficulty ? GS.difficulty : 'EASY';
  var offRoster = getOffenseRoster(teamId);
  var defRoster = getDefenseRoster(teamId);

  // ── OVERLAY for animation ──
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:1000;pointer-events:none;';

  // ── PHASE 1: Team Hype (0.8-1.2s) ──

  // Color flash
  var flash = document.createElement('div');
  flash.style.cssText = 'position:absolute;inset:0;background:' + team.colors.primary + ';opacity:0;animation:tsFlash 0.4s ease-out forwards;z-index:1;';
  ov.appendChild(flash);

  // Helmet zooms to center
  var helmCenter = document.createElement('div');
  helmCenter.style.cssText = 'position:absolute;top:35%;left:50%;transform:translate(-50%,-50%) scale(0.5);z-index:3;animation:tsHelmetZoom 0.5s cubic-bezier(0.22,1.3,0.36,1) 0.15s both;';
  helmCenter.innerHTML = teamHelmetSvg(teamId, 96);
  ov.appendChild(helmCenter);

  // Player cards fan out behind helmet (2-3 star/top players)
  var topPlayers = offRoster.slice(0, 3);
  topPlayers.forEach(function(p, i) {
    var pc = document.createElement('div');
    var angle = (i - 1) * 15;
    var xOff = (i - 1) * 50;
    pc.style.cssText = 'position:absolute;top:38%;left:50%;z-index:2;opacity:0;' +
      'transform:translate(calc(-50% + ' + xOff + 'px),-50%) rotate(' + angle + 'deg);' +
      'animation:tsPlayerFan 0.35s ease-out ' + (0.3 + i * 0.08) + 's both;';
    var card = buildMaddenPlayer({
      name: p.name, pos: p.pos, ovr: p.ovr, num: p.num,
      badge: p.badge, isStar: p.isStar, teamColor: team.colors.primary
    }, 60, 84);
    card.style.opacity = '0.7';
    pc.appendChild(card);
    ov.appendChild(pc);
  });

  // Team name text
  var teamText = document.createElement('div');
  teamText.style.cssText = "position:absolute;top:58%;left:50%;transform:translateX(-50%);z-index:4;font-family:'Teko';font-weight:700;font-size:32px;color:#fff;letter-spacing:4px;text-shadow:2px 2px 0 rgba(0,0,0,0.9),0 0 20px " + team.colors.primary + ";opacity:0;animation:tsPlayerFan 0.3s ease-out 0.4s both;white-space:nowrap;";
  teamText.textContent = team.name;
  ov.appendChild(teamText);

  // Screen shake on the container
  container.style.animation = 'tsShake 0.3s ease-out 0.2s';

  // Team audio sting
  var sting = TEAM_STINGS[teamId] || 'powerUp';
  try { SND.snap(); } catch(e) {}

  // Haptic
  if (navigator.vibrate) try { navigator.vibrate(50); } catch(e) {}

  document.body.appendChild(ov);

  // ── PHASE 2: VS Matchup (after 0.9s) ──
  setTimeout(function() {
    // Clear phase 1 elements
    ov.innerHTML = '';

    // Diagonal split background
    var split = document.createElement('div');
    split.style.cssText = 'position:absolute;inset:0;z-index:1;' +
      'background:linear-gradient(135deg,' + team.colors.primary + '88 0%,' + team.colors.primary + '88 48%,transparent 48%,transparent 52%,' + opponent.colors.primary + '88 52%,' + opponent.colors.primary + '88 100%);';
    ov.appendChild(split);

    // Your helmet (left)
    var yourHelm = document.createElement('div');
    yourHelm.style.cssText = 'position:absolute;top:40%;left:20%;transform:translate(-50%,-50%);z-index:2;';
    yourHelm.innerHTML = teamHelmetSvg(teamId, 64);
    ov.appendChild(yourHelm);

    // Your team name
    var yourName = document.createElement('div');
    yourName.style.cssText = "position:absolute;top:55%;left:20%;transform:translateX(-50%);z-index:2;font-family:'Teko';font-weight:700;font-size:16px;color:#fff;letter-spacing:2px;text-shadow:1px 1px 0 #000;";
    yourName.textContent = team.name;
    ov.appendChild(yourName);

    // Opponent helmet (right)
    var oppHelm = document.createElement('div');
    oppHelm.style.cssText = 'position:absolute;top:40%;right:20%;transform:translate(50%,-50%);z-index:2;';
    oppHelm.innerHTML = teamHelmetSvg(opponentId, 64);
    ov.appendChild(oppHelm);

    // Opponent name
    var oppName = document.createElement('div');
    oppName.style.cssText = "position:absolute;top:55%;right:20%;transform:translateX(50%);z-index:2;font-family:'Teko';font-weight:700;font-size:16px;color:#fff;letter-spacing:2px;text-shadow:1px 1px 0 #000;";
    oppName.textContent = opponent.name;
    ov.appendChild(oppName);

    // VS slam
    var vs = document.createElement('div');
    vs.style.cssText = "position:absolute;top:40%;left:50%;transform:translate(-50%,-50%) scale(2.5);z-index:3;font-family:'Teko';font-weight:700;font-size:36px;color:#fff;text-shadow:0 0 20px var(--torch),2px 2px 0 rgba(0,0,0,0.9);animation:tsVsSlam 0.3s cubic-bezier(0.22,1.3,0.36,1) both;";
    vs.textContent = 'VS';
    ov.appendChild(vs);

    SND.hit();
  }, 900);

  // ── PHASE 3: Transition to gameplay (after 1.6s) ──
  setTimeout(function() {
    // Clean up overlay
    if (ov.parentNode) ov.remove();
    container.style.animation = '';

    // Set state and navigate to gameplay
    setGs(function(s) {
      return Object.assign({}, s || {}, {
        screen: 'gameplay',
        team: teamId,
        difficulty: difficulty,
        opponent: opponentId,
        humanReceives: humanReceives,
        _coinTossDone: true,
        // Pre-populate roster/hand data for gameplay
        offRoster: offRoster.slice(0, 4).map(function(p) { return p.id; }),
        defRoster: defRoster.slice(0, 4).map(function(p) { return p.id; }),
        offHand: getOffCards(teamId).slice(0, 4),
        defHand: getDefCards(teamId).slice(0, 4),
        // Season
        isFirstSeason: s ? s.isFirstSeason : true,
        season: s && s.season ? s.season : {
          opponents: opponents,
          currentGame: 0,
          results: [],
          totalScore: 0,
          torchCards: [],
          carryoverPoints: 0,
        },
      });
    });
  }, isFirst ? 2200 : 1700);
}
