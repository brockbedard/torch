/**
 * TORCH v0.21 — Visual Test Harness
 * Static renders of every screen/component on one scrollable page.
 * Access via ?test URL param. No gameplay logic.
 */

import { TEAMS } from '../../data/teams.js';
import { SENTINELS_OFFENSE, SENTINELS_DEFENSE, SERPENTS_OFFENSE, SERPENTS_DEFENSE } from '../../data/players.js';
import { SENTINELS_OFF_PLAYS, SENTINELS_DEF_PLAYS } from '../../data/sentinelsPlays.js';
import { SERPENTS_OFF_PLAYS, SERPENTS_DEF_PLAYS } from '../../data/serpentsPlays.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { buildMaddenPlayer, buildPlayV1, buildTorchCard, buildHomeCard, teamHelmetSvg, renderFlamePips } from '../components/cards.js';

export function buildVisualTest() {
  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;background:#0A0804;padding:12px;overflow-y:auto;';

  var sentinels = TEAMS.sentinels;
  var serpents = TEAMS.serpents;

  function section(title) {
    var s = document.createElement('div');
    s.style.cssText = "font-family:'Teko';font-weight:700;font-size:20px;color:var(--a-gold,#FFB800);letter-spacing:3px;margin:28px 0 10px;padding:8px 0;border-bottom:2px solid #1E1610;";
    s.textContent = '=== ' + title + ' ===';
    el.appendChild(s);
  }

  function label(text) {
    var l = document.createElement('div');
    l.style.cssText = "font-family:'Rajdhani';font-size:9px;color:#666;letter-spacing:1px;margin:6px 0 4px;";
    l.textContent = text;
    el.appendChild(l);
  }

  function phone(child) {
    var p = document.createElement('div');
    p.style.cssText = 'width:375px;max-width:100%;border:1px solid #333;border-radius:8px;overflow:hidden;margin-bottom:12px;position:relative;background:#0A0804;';
    if (typeof child === 'string') p.innerHTML = child;
    else p.appendChild(child);
    el.appendChild(p);
  }

  // ============================================================
  // 1. HOME SCREEN
  // ============================================================
  section('HOME SCREEN');
  label('Full home layout in 375px frame');
  (function() {
    var frame = document.createElement('div');
    frame.style.cssText = 'width:375px;height:667px;background:#0A0804;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px 20px;position:relative;overflow:hidden;border:1px solid #333;border-radius:8px;margin-bottom:12px;';
    // Card fan
    var fan = document.createElement('div');
    fan.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;';
    ['offense','torch','defense'].forEach(function(t) {
      var c = buildHomeCard(t, 80, 112);
      fan.appendChild(c);
    });
    frame.appendChild(fan);
    // Title
    var title = document.createElement('div');
    title.style.cssText = "font-family:'Teko';font-weight:700;font-size:64px;color:#FFB800;text-shadow:2px 2px 0 rgba(0,0,0,0.9);letter-spacing:5px;text-align:center;transform:skewX(-8deg);";
    title.textContent = 'TORCH';
    frame.appendChild(title);
    var sub = document.createElement('div');
    sub.style.cssText = "font-family:'Teko';font-weight:700;font-size:28px;color:#FFF5E6;letter-spacing:5px;text-align:center;margin-top:-4px;";
    sub.textContent = 'FOOTBALL';
    frame.appendChild(sub);
    var tag = document.createElement('div');
    tag.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:14px;color:rgba(255,224,160,0.7);letter-spacing:4px;text-align:center;margin:8px 0 14px;";
    tag.textContent = 'DEAL THE PLAY';
    frame.appendChild(tag);
    var btn1 = document.createElement('div');
    btn1.style.cssText = "width:100%;padding:16px;background:linear-gradient(180deg,#FFB800,#FF4511);border-radius:4px;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:20px;color:#000;letter-spacing:4px;";
    btn1.textContent = 'KICK OFF';
    frame.appendChild(btn1);
    var btn2 = document.createElement('div');
    btn2.style.cssText = "width:100%;padding:8px;border:1px solid #555;border-radius:4px;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:10px;color:#aaa;letter-spacing:2px;margin-top:8px;";
    btn2.textContent = 'DAILY DRIVE';
    frame.appendChild(btn2);
    el.appendChild(frame);
  })();

  // ============================================================
  // 2. TEAM SELECT (game 2+ with difficulty)
  // ============================================================
  section('TEAM SELECT — Game 2+ (difficulty visible)');
  (function() {
    var frame = document.createElement('div');
    frame.style.cssText = 'width:375px;background:#0A0804;border:1px solid #333;border-radius:8px;overflow:hidden;margin-bottom:12px;';
    // Header
    frame.innerHTML = "<div style=\"background:rgba(0,0,0,0.5);padding:8px 12px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #FFB800;\"><div style=\"font-family:'Teko';font-weight:700;font-size:20px;color:#FFB800;letter-spacing:3px;font-style:italic;transform:skewX(-8deg);\">TORCH FOOTBALL</div><div style=\"font-family:'Rajdhani';font-size:10px;padding:6px 12px;background:#000;color:#fff;border:1px solid #333;border-radius:4px;\">← BACK</div></div>";
    // Title
    frame.innerHTML += "<div style=\"padding:8px 12px 4px;font-family:'Teko';font-weight:700;font-size:18px;color:#FFB800;letter-spacing:2px;text-align:center;\">CHOOSE YOUR TEAM</div>";
    // Grid
    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 12px;';
    var teamIds = ['sentinels','wolves','stags','serpents'];
    teamIds.forEach(function(tid, i) {
      var t = TEAMS[tid];
      var isSel = tid === 'sentinels';
      var card = document.createElement('div');
      card.style.cssText = 'background:radial-gradient(ellipse at 50% 30%,' + t.colors.primary + '15,#141008);border:2px solid ' + (isSel ? '#00ff44' : t.colors.primary + '44') + ';border-radius:8px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;opacity:' + (isSel ? '1' : '0.6') + ';' + (isSel ? 'transform:scale(1.02);box-shadow:0 0 12px rgba(0,255,68,0.2);' : '');
      card.innerHTML = teamHelmetSvg(tid, 40) +
        "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:#fff;letter-spacing:2px;\">" + t.name + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:7px;color:" + t.colors.primary + ";background:" + t.colors.primary + "33;padding:2px 6px;border-radius:8px;letter-spacing:1px;\">" + t.offScheme + "</div>" +
        "<div style=\"display:flex;justify-content:space-between;width:100%;font-family:'Rajdhani';font-size:7px;color:#aaa;\"><span>OFF</span><span>" + renderFlamePips(t.ratings.offense, 5, t.colors.primary, 7) + "</span></div>" +
        "<div style=\"display:flex;justify-content:space-between;width:100%;font-family:'Rajdhani';font-size:7px;color:#aaa;\"><span>DEF</span><span>" + renderFlamePips(t.ratings.defense, 5, t.colors.primary, 7) + "</span></div>" +
        "<div style=\"font-family:'Rajdhani';font-size:7px;color:#666;font-style:italic;\">" + t.motto + "</div>";
      grid.appendChild(card);
    });
    frame.appendChild(grid);
    // Difficulty row
    frame.innerHTML += "<div style='display:flex;gap:6px;padding:8px 12px;'><div style=\"flex:1;padding:6px;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:9px;color:#000;background:#00ff44;border-radius:4px;\">EASY</div><div style=\"flex:1;padding:6px;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:9px;color:#aaa;border:1px solid #333;border-radius:4px;\">MEDIUM</div><div style=\"flex:1;padding:6px;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:9px;color:#aaa;border:1px solid #333;border-radius:4px;\">HARD</div></div>";
    el.appendChild(frame);
  })();

  // ============================================================
  // 3. TEAM SELECT (first time — difficulty hidden)
  // ============================================================
  section('TEAM SELECT — First Time (difficulty hidden, tooltip)');
  label('Difficulty row hidden. Tooltip visible.');
  (function() {
    var tip = document.createElement('div');
    tip.style.cssText = "width:375px;padding:12px;background:#141008;border:1px solid rgba(255,184,0,0.3);border-radius:8px;text-align:center;font-family:'Rajdhani';font-weight:600;font-size:13px;color:rgba(255,255,255,0.9);margin-bottom:12px;";
    tip.textContent = 'Each team plays differently. Tap to choose.';
    el.appendChild(tip);
  })();

  // ============================================================
  // 4. GAMEPLAY — DEFENSE
  // ============================================================
  section('GAMEPLAY — DEFENSE');
  label('5 defensive play cards, field, scoreboard: SENTINELS 7 | FIRST HALF 5/20 | SERPENTS 3, 2ND & 7 BALL ON RDG 35');
  (function() {
    var frame = document.createElement('div');
    frame.style.cssText = 'width:375px;background:#0A0804;border:1px solid #333;border-radius:8px;overflow:hidden;margin-bottom:12px;';
    // Scoreboard
    frame.innerHTML += "<div style='background:#0E0A04;padding:6px 8px;'><div style='display:flex;justify-content:space-between;align-items:center;'><div style=\"text-align:center;\"><div style=\"font-family:'Teko';font-size:16px;color:" + sentinels.accent + ";letter-spacing:1px;\">SENTINELS</div><div style=\"font-family:'Rajdhani';font-size:24px;color:#fff;\">7</div></div><div style=\"text-align:center;\"><div style=\"font-family:'Teko';font-size:14px;color:#c8a030;\">FIRST HALF</div><div style=\"font-family:'Rajdhani';font-size:10px;color:#aaa;\">5/20</div></div><div style=\"text-align:center;\"><div style=\"font-family:'Teko';font-size:16px;color:" + serpents.accent + ";letter-spacing:1px;\">SERPENTS</div><div style=\"font-family:'Rajdhani';font-size:24px;color:#fff;\">3</div></div></div><div style=\"text-align:center;padding:3px;background:rgba(0,0,0,0.4);font-family:'Rajdhani';font-size:10px;color:#30c0e0;\">2ND & 7 · BALL ON RDG 35</div></div>";
    // Field
    frame.innerHTML += "<div style='height:140px;background:linear-gradient(180deg,#1a6a1a,#145014);position:relative;border-bottom:1px solid #1E1610;'><div style='position:absolute;left:35%;top:0;bottom:0;width:3px;background:#FFB800;'></div><div style='position:absolute;left:42%;top:0;bottom:0;width:2px;border-left:2px dashed #c8a030;opacity:0.6;'></div></div>";
    // Side label
    frame.innerHTML += "<div style=\"text-align:center;padding:3px 0;font-family:'Teko';font-size:14px;letter-spacing:3px;color:#30c0e0;background:linear-gradient(90deg,transparent,rgba(48,192,224,0.08),transparent);\">YOUR DEFENSE</div>";
    frame.innerHTML += "<div style=\"text-align:center;padding:4px 0;font-family:'Rajdhani';font-size:7px;color:#aaa;letter-spacing:1px;\">Drag a scheme onto the field</div>";
    // 5 defensive play cards
    var tray = document.createElement('div');
    tray.style.cssText = 'display:flex;gap:6px;padding:6px;';
    SENTINELS_DEF_PLAYS.slice(0, 5).forEach(function(play) {
      var c = buildPlayV1({
        name: play.name, cat: play.cat, catColor: '#4DA6FF',
        risk: play.risk, riskColor: '#4DA6FF',
        svg: '<svg viewBox="0 0 10 10" width="40" height="40"><circle cx="5" cy="5" r="3" fill="#4DA6FF" opacity="0.3"/></svg>',
        bg: '#0A1420'
      }, 64, 100);
      c.style.flex = '1';
      tray.appendChild(c);
    });
    frame.appendChild(tray);
    // Commentary
    frame.innerHTML += "<div style='background:#0C0804;border-top:1px solid #1E1610;padding:6px 10px;min-height:50px;'><div style=\"font-family:'Rajdhani';font-size:13px;color:#fff;font-weight:700;\">Calloway gains 4.</div><div style=\"font-family:'Rajdhani';font-size:11px;color:#aaa;margin-top:2px;\">Bubble Screen vs Man-Zone Blend</div></div>";
    el.appendChild(frame);
  })();

  // ============================================================
  // 5. GAMEPLAY — OFFENSE
  // ============================================================
  section('GAMEPLAY — OFFENSE');
  label('5 offensive play cards + 4 player cards');
  (function() {
    var frame = document.createElement('div');
    frame.style.cssText = 'width:375px;background:#0A0804;border:1px solid #333;border-radius:8px;overflow:hidden;margin-bottom:12px;';
    frame.innerHTML += "<div style=\"text-align:center;padding:3px 0;font-family:'Teko';font-size:14px;letter-spacing:3px;color:#c8a030;background:linear-gradient(90deg,transparent,rgba(200,160,48,0.08),transparent);\">YOUR OFFENSE</div>";
    frame.innerHTML += "<div style=\"text-align:center;padding:4px 0;font-family:'Rajdhani';font-size:7px;color:#aaa;letter-spacing:1px;\">Drag a play onto the field</div>";
    // 5 offensive play cards
    var tray = document.createElement('div');
    tray.style.cssText = 'display:flex;gap:6px;padding:6px;';
    SENTINELS_OFF_PLAYS.slice(0, 5).forEach(function(play) {
      var c = buildPlayV1({
        name: play.name, cat: play.cat, catColor: '#7ACC00',
        risk: play.risk, riskColor: '#7ACC00',
        svg: '<svg viewBox="0 0 10 10" width="40" height="40"><circle cx="5" cy="5" r="3" fill="#7ACC00" opacity="0.3"/></svg>',
        bg: '#0A1A06'
      }, 64, 100);
      c.style.flex = '1';
      tray.appendChild(c);
    });
    frame.appendChild(tray);
    // 4 player cards
    label('Player cards (4 starters)');
    var playerTray = document.createElement('div');
    playerTray.style.cssText = 'display:flex;gap:6px;padding:6px;';
    SENTINELS_OFFENSE.slice(0, 4).forEach(function(p) {
      var c = buildMaddenPlayer({
        name: p.name, pos: p.pos, ovr: p.ovr, num: p.num,
        badge: p.badge, isStar: p.isStar, teamColor: sentinels.colors.primary
      }, 80, 112);
      c.style.flex = '1';
      playerTray.appendChild(c);
    });
    frame.appendChild(playerTray);
    el.appendChild(frame);
  })();

  // ============================================================
  // 6. GAMEPLAY — SNAP RESULT
  // ============================================================
  section('GAMEPLAY — SNAP RESULT (3-Beat Aftermath)');
  (function() {
    var frame = document.createElement('div');
    frame.style.cssText = 'width:375px;height:300px;background:rgba(0,0,0,0.85);border:1px solid #333;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;margin-bottom:12px;position:relative;';
    frame.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:700;font-size:48px;color:#3df58a;text-shadow:0 0 20px rgba(61,245,138,0.5);\">+14 YDS</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:13px;color:#3df58a;opacity:0.8;letter-spacing:1px;\">Bubble Screen vs Man-Zone Blend</div>" +
      "<div style=\"margin-top:12px;background:#0C0804;border:1px solid #1E1610;border-radius:6px;padding:8px 14px;width:90%;\">" +
        "<div style=\"font-family:'Rajdhani';font-size:13px;color:#fff;font-weight:700;\">Monroe catches the screen and turns upfield for a big gain.</div>" +
        "<div style=\"font-family:'Rajdhani';font-size:11px;color:#aaa;margin-top:4px;\">First down Sentinels.</div>" +
      "</div>";
    el.appendChild(frame);
  })();

  // ============================================================
  // 7. GAMEPLAY — TORCH CARD PHASE
  // ============================================================
  section('GAMEPLAY — TORCH CARD PHASE');
  (function() {
    var frame = document.createElement('div');
    frame.style.cssText = 'width:375px;background:#0A0804;border:1px solid #333;border-radius:8px;overflow:hidden;margin-bottom:12px;';
    frame.innerHTML += "<div style=\"text-align:center;padding:4px 0;font-family:'Rajdhani';font-size:7px;color:#FFB800;letter-spacing:1px;\">TORCH CARD — Play one or skip</div>";
    var tray = document.createElement('div');
    tray.style.cssText = 'display:flex;gap:6px;padding:6px;';
    // 2 sample torch cards
    var tc1 = buildTorchCard(TORCH_CARDS[0], 90, 130); // Scout Team (Gold)
    tc1.style.flex = '1';
    var tc2 = buildTorchCard(TORCH_CARDS[6], 90, 130); // 12th Man (Bronze)
    tc2.style.flex = '1';
    tray.appendChild(tc1);
    tray.appendChild(tc2);
    // Skip button
    var skip = document.createElement('div');
    skip.style.cssText = "flex:1;border:2px dashed #554f8044;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani';font-size:7px;color:#554f80;text-align:center;min-height:130px;";
    skip.textContent = 'SKIP\nTORCH';
    tray.appendChild(skip);
    frame.appendChild(tray);
    el.appendChild(frame);
  })();

  // ============================================================
  // 8. TORCH SHOP
  // ============================================================
  section('TORCH SHOP — Bottom Sheet (3 cards)');
  (function() {
    var frame = document.createElement('div');
    frame.style.cssText = 'width:375px;background:#141008;border:1px solid #333;border-radius:12px 12px 0 0;border-top:2px solid #FFB800;padding:14px 12px 20px;margin-bottom:12px;';
    frame.innerHTML += "<div style=\"display:flex;justify-content:space-between;margin-bottom:8px;\"><div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#FFB800;letter-spacing:2px;\">TORCH CARDS</div><div style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:#00ff44;\">245 PTS</div></div>";
    frame.innerHTML += "<div style='display:flex;gap:4px;margin-bottom:10px;'><div style='flex:1;height:4px;border-radius:2px;background:#FFB800;'></div><div style='flex:1;height:4px;border-radius:2px;background:#FFB800;'></div><div style='flex:1;height:4px;border-radius:2px;background:#333;'></div></div>";
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;justify-content:center;';
    [TORCH_CARDS[0], TORCH_CARDS[2], TORCH_CARDS[6]].forEach(function(card) {
      var w = document.createElement('div');
      w.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;';
      var c = buildTorchCard(card, 80, 112);
      w.appendChild(c);
      w.innerHTML += "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:11px;color:#00ff44;\">" + card.cost + "P</div>";
      w.innerHTML += "<div style=\"font-family:'Rajdhani';font-size:8px;color:#aaa;text-align:center;line-height:1.2;\">" + card.effect + "</div>";
      w.innerHTML += "<div style=\"width:100%;padding:5px;background:#FFB800;border-radius:4px;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:9px;color:#000;margin-top:2px;\">BUY</div>";
      row.appendChild(w);
    });
    frame.appendChild(row);
    frame.innerHTML += "<div style=\"width:100%;margin-top:10px;padding:8px;border:1px solid #333;border-radius:4px;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:10px;color:#666;letter-spacing:1px;\">PASS</div>";
    el.appendChild(frame);
  })();

  // ============================================================
  // 9. HALFTIME
  // ============================================================
  section('HALFTIME');
  (function() {
    var frame = document.createElement('div');
    frame.style.cssText = 'width:375px;background:#0A0804;border:1px solid #333;border-radius:8px;overflow:hidden;margin-bottom:12px;';
    frame.innerHTML += "<div style=\"background:rgba(0,0,0,0.7);padding:10px;text-align:center;border-bottom:2px solid #FFB800;\"><div style=\"font-family:'Teko';font-weight:700;font-size:28px;color:#FFB800;letter-spacing:3px;font-style:italic;transform:skewX(-8deg);\">HALFTIME REPORT</div></div>";
    frame.innerHTML += "<div style='padding:12px;display:flex;flex-direction:column;align-items:center;gap:12px;'>" +
      "<div style='display:flex;gap:20px;align-items:center;'><div style='text-align:center;'><div style=\"font-family:'Teko';font-size:20px;color:" + sentinels.accent + ";\">SENTINELS</div><div style=\"font-family:'Rajdhani';font-size:28px;color:#fff;\">14</div></div><div style=\"font-family:'Teko';font-size:24px;color:#555;\">—</div><div style='text-align:center;'><div style=\"font-family:'Teko';font-size:20px;color:" + serpents.accent + ";\">SERPENTS</div><div style=\"font-family:'Rajdhani';font-size:28px;color:#fff;\">10</div></div></div>" +
      "<div style=\"width:100%;max-width:300px;background:#141008;border:1px solid #333;border-radius:8px;padding:12px;\"><div style=\"display:flex;justify-content:space-between;margin-bottom:8px;border-bottom:1px solid #222;padding-bottom:6px;\"><div style=\"font-family:'Rajdhani';font-size:10px;color:#FFB800;\">LOCKER ROOM SHOP</div><div style=\"font-family:'Rajdhani';font-size:9px;color:#00ff44;\">185 PTS</div></div><div style='display:flex;gap:6px;justify-content:center;'></div></div>" +
      "<div style=\"width:100%;max-width:300px;padding:12px;background:#00ff44;border-radius:4px;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:14px;color:#000;letter-spacing:2px;\">START SECOND HALF →</div>" +
      "</div>";
    el.appendChild(frame);
  })();

  // ============================================================
  // 10. END GAME
  // ============================================================
  section('END GAME — Victory + Season Progress + Film Room');
  (function() {
    var frame = document.createElement('div');
    frame.style.cssText = 'width:375px;background:#0A0804;border:1px solid #333;border-radius:8px;overflow:hidden;margin-bottom:12px;';
    frame.innerHTML += "<div style=\"background:rgba(0,0,0,0.7);padding:10px;text-align:center;border-bottom:2px solid #FFB800;\"><div style=\"font-family:'Teko';font-weight:700;font-size:28px;color:#00ff44;letter-spacing:3px;font-style:italic;transform:skewX(-8deg);\">VICTORY</div></div>";
    frame.innerHTML += "<div style='padding:10px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;'>" +
      // Score
      "<div style='display:flex;gap:20px;align-items:center;'><div style='text-align:center;'><div style=\"font-family:'Teko';font-size:20px;color:" + sentinels.accent + ";\">SENTINELS</div><div style=\"font-family:'Rajdhani';font-size:32px;color:#fff;\">28</div></div><div style=\"font-family:'Teko';font-size:24px;color:#555;\">—</div><div style='text-align:center;'><div style=\"font-family:'Teko';font-size:20px;color:" + serpents.accent + ";\">SERPENTS</div><div style=\"font-family:'Rajdhani';font-size:32px;color:#fff;\">17</div></div></div>" +
      // TORCH points
      "<div style='background:#141008;border:1px solid #FFB800;border-radius:8px;padding:8px 16px;text-align:center;width:100%;max-width:280px;'><div style=\"font-family:'Rajdhani';font-size:8px;color:#FFB800;letter-spacing:2px;\">TORCH POINTS</div><div style=\"font-family:'Rajdhani';font-size:22px;color:#FFB800;\">312</div><div style=\"font-family:'Rajdhani';font-size:10px;color:#00ff44;\">+100 WIN BONUS</div></div>" +
      // Season pips
      "<div style='background:#141008;border:1px solid #333;border-radius:8px;padding:10px 14px;width:100%;max-width:280px;'><div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#FFB800;letter-spacing:2px;margin-bottom:6px;\">GAME 2 OF 3 COMPLETE</div><div style='display:flex;gap:6px;'><div style='flex:1;padding:4px;border-radius:4px;text-align:center;border:1px solid #00ff44;background:rgba(0,255,68,0.1);'><div style=\"font-family:'Rajdhani';font-size:7px;color:#aaa;\">STAGS</div><div style=\"font-family:'Teko';font-size:12px;color:#00ff44;\">W</div></div><div style='flex:1;padding:4px;border-radius:4px;text-align:center;border:1px solid #ff0040;background:rgba(255,0,64,0.1);'><div style=\"font-family:'Rajdhani';font-size:7px;color:#aaa;\">SERPENTS</div><div style=\"font-family:'Teko';font-size:12px;color:#ff0040;\">L</div></div><div style='flex:1;padding:4px;border-radius:4px;text-align:center;border:1px solid #333;'><div style=\"font-family:'Rajdhani';font-size:7px;color:#aaa;\">WOLVES</div><div style=\"font-family:'Teko';font-size:12px;color:#555;\">—</div></div></div><div style=\"font-family:'Rajdhani';font-size:9px;color:#aaa;text-align:center;margin-top:6px;\">SEASON SCORE: 485</div></div>" +
      // Film Room
      "<div style='background:#141008;border:1px solid #333;border-radius:8px;padding:10px 14px;width:100%;max-width:280px;'><div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#FFB800;letter-spacing:2px;margin-bottom:6px;\">FILM ROOM</div><div style=\"font-family:'Rajdhani';font-size:9px;color:#ccc;padding:4px 0;border-bottom:1px solid #1E1610;line-height:1.3;\"><span style='color:#FFB800;'>Snap 8:</span> CT: SACK -6 (Go Seam vs Zero Blitz)<br><span style='color:#666;font-size:8px;'>Watch for the blitz look — screens eat blitzes alive.</span></div><div style=\"font-family:'Rajdhani';font-size:9px;color:#ccc;padding:4px 0;line-height:1.3;\"><span style='color:#FFB800;'>Snap 14:</span> CT: INT (Streak vs Hidden Bracket)<br><span style='color:#666;font-size:8px;'>Pattern match defenses bait deep throws.</span></div></div>" +
      // Buttons
      "<div style=\"width:100%;max-width:280px;padding:6px;background:#141008;border:1px solid #FFB800;border-radius:4px;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:10px;color:#FFB800;letter-spacing:1px;\">TORCH CARD SHOP (312 PTS)</div>" +
      "<div style=\"width:100%;max-width:280px;padding:10px;background:#FFB800;border-radius:4px;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:13px;color:#000;letter-spacing:2px;\">NEXT GAME →</div>" +
      "</div>";
    el.appendChild(frame);
  })();

  // ============================================================
  // 11. DAILY DRIVE
  // ============================================================
  section('DAILY DRIVE');
  (function() {
    var frame = document.createElement('div');
    frame.style.cssText = 'width:375px;background:#0A0804;border:1px solid #333;border-radius:8px;overflow:hidden;margin-bottom:12px;';
    frame.innerHTML += "<div style=\"background:rgba(0,0,0,0.5);padding:8px 12px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #FFB800;\"><div style=\"font-family:'Teko';font-weight:700;font-size:20px;color:#FFB800;letter-spacing:3px;font-style:italic;transform:skewX(-8deg);\">DAILY DRIVE</div><div style=\"font-family:'Rajdhani';font-size:10px;padding:6px 12px;background:#000;color:#fff;border:1px solid #333;border-radius:4px;\">← BACK</div></div>";
    frame.innerHTML += "<div style='padding:20px;display:flex;flex-direction:column;align-items:center;gap:12px;'>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:#aaa;letter-spacing:2px;\">Saturday, March 22</div>" +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:20px;color:#fff;letter-spacing:2px;\"><span style='color:" + sentinels.accent + "'>SENTINELS</span> vs <span style='color:" + serpents.accent + "'>SERPENTS</span></div>" +
      "<div style=\"font-family:'Rajdhani';font-size:11px;color:#aaa;text-align:center;line-height:1.4;max-width:260px;\">Score as many points as you can in one half. Same scenario for everyone today.</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:9px;color:#FFB800;\">CLEAR · TURF · NEUTRAL</div>" +
      "<div style=\"width:100%;max-width:260px;padding:12px;background:linear-gradient(180deg,#FFB800,#FF4511);border-radius:4px;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:16px;color:#000;letter-spacing:3px;\">START DRIVE</div>" +
      "</div>";
    el.appendChild(frame);
  })();

  // ============================================================
  // 12. COMMENTARY SAMPLES
  // ============================================================
  section('COMMENTARY SAMPLES');
  var commentaryData = [
    { result: 'Calloway gains 4.', sub: 'Choice Route vs Plug the Middle', color: '#fff', type: 'Routine gain' },
    { result: 'SACKED! Blackwell brings him down for a loss of 6.', sub: 'Go Seam vs Zero Blitz', color: '#e03050', type: 'Sack' },
    { result: 'TOUCHDOWN! Monroe streaks down the sideline untouched!', sub: 'Streak vs Two-Deep Sit · SETUP! +4', color: '#FFB800', type: 'Touchdown' },
    { result: 'Pass falls incomplete.', sub: 'Fade & Stop vs Match Right', color: '#aaa', type: 'Incomplete' },
    { result: 'FUMBLE! Ball is loose... Serpents recover!', sub: 'Inside Zone vs Stack the Box', color: '#e03050', type: 'Fumble' },
  ];
  commentaryData.forEach(function(c) {
    var block = document.createElement('div');
    block.style.cssText = 'width:375px;background:#0C0804;border:1px solid #1E1610;border-top:2px solid #FF6B00;border-radius:4px;padding:8px 12px;margin-bottom:8px;';
    block.innerHTML =
      "<div style=\"font-family:'Rajdhani';font-size:8px;color:#666;letter-spacing:1px;margin-bottom:4px;\">" + c.type.toUpperCase() + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:15px;color:" + c.color + ";font-weight:700;line-height:1.3;\">" + c.result + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:13px;color:" + sentinels.accent + ";margin-top:4px;\">" + c.sub.split(' · ')[0] + "</div>" +
      (c.sub.indexOf('·') >= 0 ? "<div style=\"font-family:'Rajdhani';font-size:12px;color:#FFB800;font-style:italic;margin-top:2px;\">" + c.sub.split(' · ')[1] + "</div>" : '');
    el.appendChild(block);
  });

  // Footer
  var foot = document.createElement('div');
  foot.style.cssText = "padding:30px 0;text-align:center;font-family:'Rajdhani';font-size:9px;color:#333;";
  foot.textContent = 'TORCH v0.21 Visual Test Harness';
  el.appendChild(foot);

  return el;
}
