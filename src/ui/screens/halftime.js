/**
 * TORCH — Halftime Screen
 * Jumbotron score, stat strip, strategic adjustment, torch store, flame badge CTA.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam } from '../../state.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { buildTorchCard, buildHomeCard } from '../components/cards.js';
import { renderTeamBadge } from '../../assets/icons/teamLogos.js';
import { FLAME_PATH, buildTorchHeader, buildFlameBadgeButton, buildAccentBar } from '../components/brand.js';
import { flameIconSVG } from '../../utils/flameIcon.js';
import AudioStateManager from '../../engine/audioManager.js';
import { setHalftimeScore } from '../../engine/commentary.js';
import { formatKPA } from '../../engine/epa.js';

var ADJUSTMENTS = [
  { id: 'aggressive', label: 'AGGRESSIVE', desc: 'Push the pace. Higher risk, higher reward.', effect: '+2 yds / +5% turnover risk', color: '#FF4511' },
  { id: 'balanced', label: 'BALANCED', desc: 'Stay the course. Trust the process.', effect: 'No modifier', color: '#EBB010' },
  { id: 'conservative', label: 'CONSERVATIVE', desc: 'Protect the ball. Grind it out.', effect: '\u22121 yd / \u221250% turnover chance', color: '#4DA6FF' },
];

// Keyframes borderFlow, emblemPulse, breatheGlow now in style.css

export function buildHalftime() {
  AudioStateManager.setState('halftime');
  // Locker room ambience loop — cleats on tile, distant crowd
  try { SND.lockerRoomStart(); } catch(e) {}

  var el = document.createElement('div');
  el.style.cssText = 'height:100vh;height:100dvh;display:flex;flex-direction:column;background:#0A0804;overflow:hidden;position:relative;padding-top:env(safe-area-inset-top,0px);';

  var gs = GS.engine;
  var team = getTeam(GS.team);
  var opp = getTeam(GS.opponent || 'wolves');
  var teamColor = team.accent || team.colors.primary;
  var oppColor = opp.accent || opp.colors.primary;
  var humanScore = gs.ctScore;
  var cpuScore = gs.irScore;
  var humanPts = gs.ctTorchPts;

  setHalftimeScore(humanScore - cpuScore);

  if (!GS.halftimeAdjustment) {
    setGs(function(s) { return Object.assign({}, s, { halftimeAdjustment: 'balanced' }); });
  }
  var selectedAdj = GS.halftimeAdjustment || 'balanced';

  // ── HEADER ──
  el.appendChild(buildTorchHeader('HALFTIME'));

  // ── CONTENT (scrollable) ──
  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px;display:flex;flex-direction:column;gap:10px;align-items:center;';

  // ── SCORE PANEL — jumbotron ──
  var scorePanel = document.createElement('div');
  scorePanel.style.cssText = 'display:flex;align-items:center;width:100%;max-width:340px;border-radius:8px;background:linear-gradient(180deg,#0e0a06,#080604);border:1px solid rgba(255,255,255,0.08);overflow:hidden;';

  // Home team side
  scorePanel.innerHTML =
    '<div style="flex:1;padding:10px 8px;text-align:center;background:linear-gradient(180deg,' + teamColor + '08,transparent);">' +
      '<div style="display:flex;justify-content:center;">' + renderTeamBadge(GS.team, 32) + '</div>' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:12px;color:" + teamColor + ";letter-spacing:1px;margin-top:4px;\">" + team.name + '</div>' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:36px;color:#fff;line-height:0.9;\">" + humanScore + '</div>' +
    '</div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:0 6px;">' +
      '<div style="width:1px;height:20px;background:rgba(255,255,255,0.08);"></div>' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#333;letter-spacing:2px;\">HALF</div>" +
      '<div style="width:1px;height:20px;background:rgba(255,255,255,0.08);"></div>' +
    '</div>' +
    '<div style="flex:1;padding:10px 8px;text-align:center;background:linear-gradient(180deg,' + oppColor + '08,transparent);">' +
      '<div style="display:flex;justify-content:center;">' + renderTeamBadge(GS.opponent, 32) + '</div>' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:12px;color:" + oppColor + ";letter-spacing:1px;margin-top:4px;\">" + opp.name + '</div>' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:36px;color:#fff;line-height:0.9;\">" + cpuScore + '</div>' +
    '</div>';
  content.appendChild(scorePanel);

  // ── MOMENTUM SWING (KPA tug-of-war) ──
  // Hero stat — net Kindle Points Added differential visualized as a
  // horizontal tug-of-war bar. The team that "controlled" the half often
  // differs from who's ahead on the scoreboard; this surfaces that.
  // KPA = Kindle Points Added (TORCH's branded name for standard EPA).
  var halfStats = GS._gameplayStats || {};
  var hEpaSum = halfStats._hEpaSum || 0;
  var cEpaSum = halfStats._cEpaSum || 0;
  var hEpaPlays = halfStats._hEpaPlays || 0;
  var cEpaPlays = halfStats._cEpaPlays || 0;
  var hTurnovers = halfStats._hTurnovers || 0;
  var cTurnovers = halfStats._cTurnovers || 0;
  var hExplosive = halfStats._hExplosive || 0;
  var cExplosive = halfStats._cExplosive || 0;
  var h3Att = halfStats._h3rdAtt || 0, h3Conv = halfStats._h3rdConv || 0;
  var c3Att = halfStats._c3rdAtt || 0, c3Conv = halfStats._c3rdConv || 0;

  // Net KPA differential — positive = user winning the "real" game
  var epaDiff = hEpaSum - cEpaSum;
  // Normalize for the bar: clamp to ±15 (very lopsided half) then map to -1..+1
  var epaShare = Math.max(-1, Math.min(1, epaDiff / 15));
  // Percent split for the bar: 50 + 50*share on the user side
  var userPct = Math.max(5, Math.min(95, 50 + 50 * epaShare));

  var momentumBox = document.createElement('div');
  momentumBox.style.cssText = 'width:100%;max-width:340px;';

  var momLabel = document.createElement('div');
  momLabel.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:6px;';
  momLabel.innerHTML =
    '<div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(235,176,16,0.3));"></div>' +
    "<div style=\"font-family:'Oswald';font-weight:700;font-size:10px;color:#EBB010;letter-spacing:3px;\">MOMENTUM SWING</div>" +
    '<div style="flex:1;height:1px;background:linear-gradient(270deg,transparent,rgba(235,176,16,0.3));"></div>';
  momentumBox.appendChild(momLabel);

  var barWrap = document.createElement('div');
  barWrap.style.cssText = 'position:relative;width:100%;height:28px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;';
  // User side (fills from left by userPct)
  var userBar = document.createElement('div');
  userBar.style.cssText = 'position:absolute;top:0;left:0;bottom:0;width:0%;background:linear-gradient(90deg,' + teamColor + '88,' + teamColor + '44);transition:width 0.9s cubic-bezier(0.22,1,0.36,1);';
  barWrap.appendChild(userBar);
  // Opponent side (fills from right by 100 - userPct)
  var oppBar = document.createElement('div');
  oppBar.style.cssText = 'position:absolute;top:0;right:0;bottom:0;width:0%;background:linear-gradient(270deg,' + oppColor + '88,' + oppColor + '44);transition:width 0.9s cubic-bezier(0.22,1,0.36,1);';
  barWrap.appendChild(oppBar);
  // Center tick mark
  var centerTick = document.createElement('div');
  centerTick.style.cssText = 'position:absolute;top:0;bottom:0;left:50%;width:1px;background:rgba(255,255,255,0.2);';
  barWrap.appendChild(centerTick);
  // KPA values on each side
  var userVal = document.createElement('div');
  userVal.style.cssText = "position:absolute;top:50%;left:8px;transform:translateY(-50%);font-family:'Teko';font-weight:700;font-size:14px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.7);letter-spacing:0.5px;";
  userVal.textContent = formatKPA(hEpaSum) + ' KPA';
  barWrap.appendChild(userVal);
  var oppVal = document.createElement('div');
  oppVal.style.cssText = "position:absolute;top:50%;right:8px;transform:translateY(-50%);font-family:'Teko';font-weight:700;font-size:14px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.7);letter-spacing:0.5px;";
  oppVal.textContent = formatKPA(cEpaSum);
  barWrap.appendChild(oppVal);
  momentumBox.appendChild(barWrap);

  // Caption beneath the bar — tells the story
  var capTxt;
  if (Math.abs(epaDiff) < 1.5) {
    capTxt = 'Dead even so far. The 2nd half decides it.';
  } else if (epaDiff >= 1.5) {
    capTxt = 'You controlled the 1st half ' + formatKPA(epaDiff) + ' in your favor.';
  } else {
    capTxt = 'They controlled the 1st half ' + formatKPA(-epaDiff) + ' in their favor.';
  }
  var momCap = document.createElement('div');
  momCap.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:10px;color:#888;text-align:center;margin-top:6px;letter-spacing:0.5px;";
  momCap.textContent = capTxt;
  momentumBox.appendChild(momCap);
  content.appendChild(momentumBox);

  // Animate the bars filling in after insertion
  requestAnimationFrame(function() {
    userBar.style.width = userPct + '%';
    oppBar.style.width = (100 - userPct) + '%';
  });

  // ── STORY OF THE HALF — 3 dynamic bullets ──
  var storyBox = document.createElement('div');
  storyBox.style.cssText = 'width:100%;max-width:340px;display:flex;flex-direction:column;gap:4px;';
  var bullets = [];
  // Bullet 1: turnover battle
  if (hTurnovers === 0 && cTurnovers === 0) {
    bullets.push({ color: '#888', text: 'Zero turnovers so far. Ball security holding up.' });
  } else if (cTurnovers > hTurnovers) {
    bullets.push({ color: '#00ff44', text: 'Turnover battle +' + (cTurnovers - hTurnovers) + ' in your favor.' });
  } else if (hTurnovers > cTurnovers) {
    bullets.push({ color: '#ff0040', text: 'You\'re -' + (hTurnovers - cTurnovers) + ' in turnovers. Protect the ball.' });
  } else {
    bullets.push({ color: '#EBB010', text: hTurnovers + ' turnovers each. Even trade.' });
  }
  // Bullet 2: explosive plays
  if (hExplosive > cExplosive) {
    bullets.push({ color: '#00ff44', text: hExplosive + ' explosive plays ' + (cExplosive > 0 ? 'to their ' + cExplosive : '(none for them)') + '.' });
  } else if (cExplosive > hExplosive) {
    bullets.push({ color: '#ff0040', text: 'They\'ve hit ' + cExplosive + ' chunk plays. You have ' + hExplosive + '.' });
  } else if (hExplosive > 0) {
    bullets.push({ color: '#EBB010', text: 'Both teams at ' + hExplosive + ' explosive plays.' });
  } else {
    bullets.push({ color: '#888', text: 'No explosive plays yet. Grinding it out.' });
  }
  // Bullet 3: 3rd down efficiency
  var h3Pct = h3Att > 0 ? Math.round(100 * h3Conv / h3Att) : null;
  var c3Pct = c3Att > 0 ? Math.round(100 * c3Conv / c3Att) : null;
  if (h3Att > 0 || c3Att > 0) {
    var h3Text = h3Att > 0 ? (h3Conv + '/' + h3Att + ' (' + h3Pct + '%)') : '—';
    var c3Text = c3Att > 0 ? (c3Conv + '/' + c3Att + ' (' + c3Pct + '%)') : '—';
    var better = (h3Pct || 0) >= (c3Pct || 0);
    bullets.push({ color: better ? '#00ff44' : '#ff0040', text: '3rd down: ' + h3Text + ' vs their ' + c3Text + '.' });
  } else {
    bullets.push({ color: '#888', text: 'No 3rd downs faced yet. Stay ahead of the chains.' });
  }

  bullets.forEach(function(b) {
    var row = document.createElement('div');
    row.style.cssText = "display:flex;align-items:center;gap:8px;padding:7px 10px;background:rgba(255,255,255,0.02);border-left:2px solid " + b.color + "66;border-radius:3px;";
    row.innerHTML =
      '<div style="width:4px;height:4px;border-radius:50%;background:' + b.color + ';flex-shrink:0;"></div>' +
      "<div style=\"font-family:'Rajdhani';font-weight:500;font-size:11px;color:#ccc;line-height:1.3;\">" + b.text + '</div>';
    storyBox.appendChild(row);
  });
  content.appendChild(storyBox);

  // ── STAT STRIP ──
  var st = gs.stats || {};
  var stats = [
    { label: 'YARDS', yours: st.ctTotalYards || 0, theirs: st.irTotalYards || 0 },
    { label: '1ST DOWNS', yours: st.ctFirstDowns || 0, theirs: st.irFirstDowns || 0 },
    { label: 'TURNOVERS', yours: st.ctTurnovers || 0, theirs: st.irTurnovers || 0 },
  ];
  var statStrip = document.createElement('div');
  statStrip.style.cssText = 'display:flex;width:100%;max-width:340px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;';
  stats.forEach(function(s, i) {
    var cell = document.createElement('div');
    cell.style.cssText = 'flex:1;padding:6px 4px;text-align:center;' + (i < stats.length - 1 ? 'border-right:1px solid rgba(255,255,255,0.08);' : '');
    cell.innerHTML =
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:7px;color:#555;letter-spacing:1px;\">" + s.label + '</div>' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;line-height:1;margin-top:2px;\">" +
        "<span style='color:" + teamColor + ";'>" + s.yours + "</span>" +
        "<span style='color:#333;'> \u2013 </span>" +
        "<span style='color:" + oppColor + ";'>" + s.theirs + "</span>" +
      '</div>';
    statStrip.appendChild(cell);
  });
  content.appendChild(statStrip);

  // ── 2ND HALF GAME PLAN ──
  var adjSection = document.createElement('div');
  adjSection.style.cssText = 'width:100%;max-width:340px;';

  // Section header
  var adjHdr = document.createElement('div');
  adjHdr.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
  adjHdr.innerHTML =
    '<div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,#FF451133);"></div>' +
    "<div style=\"font-family:'Oswald';font-weight:700;font-size:10px;color:#FF4511;letter-spacing:3px;\">2ND HALF GAME PLAN</div>" +
    '<div style="flex:1;height:1px;background:linear-gradient(270deg,transparent,#FF451133);"></div>';
  adjSection.appendChild(adjHdr);

  var adjBtns = document.createElement('div');
  adjBtns.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

  ADJUSTMENTS.forEach(function(adj, idx) {
    var btn = document.createElement('div');
    var isSel = selectedAdj === adj.id;
    btn.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:6px;cursor:pointer;transition:all 0.15s;' +
      (isSel ? 'border:1.5px solid ' + adj.color + '66;background:' + adj.color + '08;box-shadow:0 0 12px ' + adj.color + '22,inset 0 0 16px ' + adj.color + '15;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);' : 'border:1.5px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.01);');

    btn.innerHTML =
      '<div style="width:3px;height:32px;border-radius:2px;background:' + adj.color + ';opacity:' + (isSel ? '1' : '0.3') + ';flex-shrink:0;"></div>' +
      '<div style="flex:1;">' +
        "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:" + (isSel ? adj.color : '#888') + ";letter-spacing:2px;\">" + adj.label + '</div>' +
        "<div style=\"font-family:'Rajdhani';font-size:10px;color:" + (isSel ? '#bbb' : '#555') + ";line-height:1.3;\">" + adj.desc + '</div>' +
      '</div>' +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:" + (isSel ? adj.color : '#444') + ";max-width:80px;text-align:right;letter-spacing:0.3px;\">" + adj.effect + '</div>';

    btn.addEventListener('touchstart', function() { try { gsap.to(btn, { scale: 0.96, duration: 0.08 }); } catch(e) {} }, { passive: true });
    btn.addEventListener('touchend', function() { try { gsap.to(btn, { scale: 1, duration: 0.15, ease: 'back.out(2)' }); } catch(e) {} }, { passive: true });
    btn.onclick = function() {
      if (SND.snap) SND.snap(); else if (SND.click) SND.click();
      selectedAdj = adj.id;
      // Persist without re-render — button states updated inline below
      GS.halftimeAdjustment = adj.id;
      // Re-render button states
      Array.from(adjBtns.children).forEach(function(child, i) {
        var a = ADJUSTMENTS[i];
        var sel = a.id === adj.id;
        child.style.border = '1.5px solid ' + (sel ? a.color + '66' : 'rgba(255,255,255,0.06)');
        child.style.background = sel ? a.color + '08' : 'rgba(255,255,255,0.01)';
        child.style.boxShadow = sel ? '0 0 12px ' + a.color + '22,inset 0 0 16px ' + a.color + '15' : 'none';
        child.style.backdropFilter = sel ? 'blur(4px)' : 'none';
        child.style.webkitBackdropFilter = sel ? 'blur(4px)' : 'none';
        var indicator = child.children[0];
        var infoDiv = child.children[1];
        var effectDiv = child.children[2];
        if (indicator) indicator.style.opacity = sel ? '1' : '0.3';
        if (infoDiv && infoDiv.children[0]) infoDiv.children[0].style.color = sel ? a.color : '#888';
        if (infoDiv && infoDiv.children[1]) infoDiv.children[1].style.color = sel ? '#bbb' : '#555';
        if (effectDiv) effectDiv.style.color = sel ? a.color : '#444';
      });
    };
    adjBtns.appendChild(btn);
  });
  adjSection.appendChild(adjBtns);
  content.appendChild(adjSection);

  // ── TORCH STORE ──
  var shopBox = document.createElement('div');
  shopBox.style.cssText = 'width:100%;max-width:340px;';

  var shopHdr = document.createElement('div');
  shopHdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;';
  shopHdr.innerHTML =
    '<div style="display:flex;align-items:center;gap:6px;">' +
      '<div style="width:12px;height:2px;background:#EBB010;border-radius:1px;"></div>' +
      "<div style=\"font-family:'Oswald';font-weight:700;font-size:10px;color:#EBB010;letter-spacing:3px;\">TORCH STORE</div>" +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:4px;">' +
      "<svg viewBox='0 0 34 34' width='11' height='11' fill='#EBB010'><path d='" + FLAME_PATH + "'/></svg>" +
      "<span style=\"font-family:'Teko';font-weight:700;font-size:16px;color:#EBB010;\">" + humanPts + "</span>" +
      "<span style=\"font-family:'Rajdhani';font-weight:600;font-size:8px;color:#EBB01066;letter-spacing:1px;\">PTS</span>" +
    '</div>';
  shopBox.appendChild(shopHdr);

  var offersRow = document.createElement('div');
  offersRow.style.cssText = 'display:flex;gap:6px;';

  var getOffer = function() {
    var r = Math.random();
    var tier = r < 0.3 ? 'BRONZE' : r < 0.7 ? 'SILVER' : 'GOLD';
    var pool = TORCH_CARDS.filter(function(c) { return c.tier === tier; });
    return pool[Math.floor(Math.random() * pool.length)];
  };

  var TIER_COLORS = { GOLD: '#EBB010', SILVER: '#C0C0C0', BRONZE: '#B87333' };
  [getOffer(), getOffer(), getOffer()].forEach(function(card) {
    var canAfford = humanPts >= card.cost;
    var tc = TIER_COLORS[card.tier] || '#EBB010';

    var cardSlot = document.createElement('div');
    cardSlot.style.cssText = 'flex:1;border-radius:6px;border:1.5px solid ' + tc + '33;background:linear-gradient(170deg,' + tc + '10,#0a0804 55%);padding:8px 6px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:' + (canAfford ? 'pointer' : 'not-allowed') + ';opacity:' + (canAfford ? '1' : '0.4') + ';';

    cardSlot.innerHTML =
      "<div style=\"font-family:'Oswald';font-weight:700;font-size:7px;color:" + tc + ";opacity:0.5;letter-spacing:1px;\">" + card.tier + '</div>' +
      flameIconSVG(21, 0.5, 'filter:drop-shadow(0 0 4px ' + tc + '55)') +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:10px;color:#fff;text-align:center;line-height:1;letter-spacing:0.5px;\">" + card.name + '</div>' +
      '<div style="display:flex;align-items:center;gap:4px;margin-top:2px;">' +
        "<svg viewBox='0 0 34 34' width='11' height='11' fill='#EBB010'><path d='" + FLAME_PATH + "'/></svg>" +
        "<span style=\"font-family:'Teko';font-weight:700;font-size:12px;color:#EBB010;\">" + card.cost + '</span>' +
      '</div>';

    if (canAfford) {
      cardSlot.onclick = function() {
        SND.click();
        var confirmOv = document.createElement('div');
        confirmOv.style.cssText = 'position:fixed;inset:0;z-index:800;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(10,8,4,0.85);backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%);pointer-events:auto;';
        confirmOv.innerHTML =
          "<div style=\"font-family:'Teko';font-weight:700;font-size:22px;color:" + tc + ";letter-spacing:3px;\">" + card.name + '</div>' +
          "<div style=\"font-family:'Rajdhani';font-size:13px;color:#999;text-align:center;max-width:260px;line-height:1.3;\">" + card.effect + '</div>' +
          "<div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#EBB010;letter-spacing:2px;margin-top:8px;\">BUY FOR " + card.cost + ' PTS?</div>';
        var confirmBtn = document.createElement('button');
        confirmBtn.style.cssText = "padding:12px 32px;border:none;border-radius:6px;background:linear-gradient(180deg,#00ff44,#00aa22);font-family:'Teko';font-weight:700;font-size:16px;color:#000;letter-spacing:2px;cursor:pointer;";
        confirmBtn.textContent = 'CONFIRM';
        confirmBtn.onclick = function() {
          SND.shimmer();
          confirmOv.remove();
          gs.humanTorchCards.push(card.id);
          gs.ctTorchPts -= card.cost;
          humanPts = gs.ctTorchPts;
          // Update points display in header without full rebuild
          var ptsSpan = shopHdr.querySelector('span');
          if (ptsSpan) ptsSpan.textContent = humanPts;
          // Grey out this card slot (already bought)
          cardSlot.style.opacity = '0.2';
          cardSlot.style.pointerEvents = 'none';
          cardSlot.style.cursor = 'default';
          // Disable other cards player can no longer afford
          Array.from(offersRow.children).forEach(function(slot) {
            var costEl = slot.querySelector("[style*='font-size:12px']");
            if (costEl) {
              var cost = parseInt(costEl.textContent, 10);
              if (cost > humanPts) {
                slot.style.opacity = '0.4';
                slot.style.cursor = 'not-allowed';
                slot.onclick = null;
              }
            }
          });
        };
        var cancelBtn = document.createElement('button');
        cancelBtn.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:12px;color:#666;background:transparent;border:none;padding:10px 20px;cursor:pointer;letter-spacing:1px;";
        cancelBtn.textContent = 'CANCEL';
        cancelBtn.onclick = function() { confirmOv.remove(); };
        confirmOv.appendChild(confirmBtn);
        confirmOv.appendChild(cancelBtn);
        el.appendChild(confirmOv);
      };
    }
    offersRow.appendChild(cardSlot);
  });
  shopBox.appendChild(offersRow);
  content.appendChild(shopBox);

  // Onboarding: halftime store
  if (!localStorage.getItem('torch_onboarding_complete') && !localStorage.getItem('torch_hint_halftime_store')) {
    setTimeout(function() {
      if (!localStorage.getItem('torch_hint_halftime_store')) {
        var htOv = document.createElement('div');
        htOv.style.cssText = 'position:fixed;inset:0;z-index:800;background:rgba(0,0,0,0.5);';
        var htBub = document.createElement('div');
        htBub.style.cssText = "position:fixed;z-index:802;max-width:260px;background:rgba(10,8,4,0.95);border:1px solid rgba(255,255,255,0.08);border-left:3px solid #FF4511;border-radius:8px;padding:10px 14px;box-shadow:0 8px 24px rgba(0,0,0,0.6);font-family:'Rajdhani';font-weight:600;font-size:13px;color:#fff;line-height:1.3;";
        htBub.textContent = 'Spend your TORCH points on new cards. These last the rest of the game.';
        // Position near the shop
        requestAnimationFrame(function() {
          var shopRect = shopBox.getBoundingClientRect();
          htBub.style.top = (shopRect.top - 50) + 'px';
          htBub.style.left = Math.max(12, shopRect.left) + 'px';
        });
        function dismissHt() { localStorage.setItem('torch_hint_halftime_store', '1'); htOv.remove(); htBub.remove(); }
        htOv.onclick = dismissHt;
        setTimeout(dismissHt, 3000); // auto-dismiss
        el.appendChild(htOv);
        el.appendChild(htBub);
        try { gsap.from(htBub, { opacity: 0, y: 8, scale: 0.95, duration: 0.25, ease: 'back.out(1.5)' }); } catch(e) {}
      }
    }, 1000);
  }

  // ── 2ND HALF RECEIVE INFO ──
  var receiverIsHuman = !GS.humanReceives;
  var receiverTeam = receiverIsHuman ? team : opp;
  var receiveInfo = document.createElement('div');
  receiveInfo.style.cssText = "text-align:center;font-family:'Rajdhani';font-weight:600;font-size:10px;color:#555;";
  receiveInfo.innerHTML = "<span style='color:" + receiverTeam.accent + ";font-weight:700;'>" + receiverTeam.name + "</span> receive to start the 2nd half";
  content.appendChild(receiveInfo);

  el.appendChild(content);

  // ── CTA BUTTON ──
  var ctaWrap = document.createElement('div');
  ctaWrap.style.cssText = 'flex-shrink:0;padding:6px 14px 14px;padding-bottom:max(14px,env(safe-area-inset-bottom,0px));';

  var ctaBtn = buildFlameBadgeButton('2ND HALF', function() {
    if (SND.snap) SND.snap(); else if (SND.click) SND.click();
    try { SND.lockerRoomStop(); } catch(e) {}
    gs.startSecondHalf();
    gs.halftimeAdjustment = GS.halftimeAdjustment || 'balanced';
    var humanReceives2nd = !GS.humanReceives;
    setGs(function(s) { return Object.assign({}, s, { screen: 'gameplay', humanReceives: humanReceives2nd, _halftimeCardDone: false }); });
  });

  ctaWrap.appendChild(ctaBtn);
  el.appendChild(ctaWrap);

  // ── BOTTOM ACCENT BAR ──
  el.appendChild(buildAccentBar(teamColor, oppColor));

  return el;
}
