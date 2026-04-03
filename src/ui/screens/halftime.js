/**
 * TORCH — Halftime Screen
 * Jumbotron score, stat strip, strategic adjustment, torch store, flame badge CTA.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam } from '../../state.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { buildTorchCard, buildHomeCard } from '../components/cards.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { FLAME_PATH, buildTorchHeader, buildFlameBadgeButton, buildAccentBar } from '../components/brand.js';
import AudioStateManager from '../../engine/audioManager.js';
import { setHalftimeScore } from '../../engine/commentary.js';

var ADJUSTMENTS = [
  { id: 'aggressive', label: 'AGGRESSIVE', desc: 'Push the pace. Higher risk, higher reward.', effect: '+2 yds / +5% turnover risk', color: '#FF4511' },
  { id: 'balanced', label: 'BALANCED', desc: 'Stay the course. Trust the process.', effect: 'No modifier', color: '#EBB010' },
  { id: 'conservative', label: 'CONSERVATIVE', desc: 'Protect the ball. Grind it out.', effect: '\u22121 yd / \u221250% turnover chance', color: '#4DA6FF' },
];

// Keyframes borderFlow, emblemPulse, breatheGlow now in style.css

export function buildHalftime() {
  AudioStateManager.setState('halftime');

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
  scorePanel.style.cssText = 'display:flex;align-items:center;width:100%;max-width:340px;border-radius:8px;background:linear-gradient(180deg,#0e0a06,#080604);border:1px solid #1a1a1a;overflow:hidden;';

  // Home team side
  scorePanel.innerHTML =
    '<div style="flex:1;padding:10px 8px;text-align:center;background:linear-gradient(180deg,' + teamColor + '08,transparent);">' +
      '<div style="display:flex;justify-content:center;">' + renderTeamBadge(GS.team, 32) + '</div>' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:12px;color:" + teamColor + ";letter-spacing:1px;margin-top:4px;\">" + team.name + '</div>' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:36px;color:#fff;line-height:0.9;\">" + humanScore + '</div>' +
    '</div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:0 6px;">' +
      '<div style="width:1px;height:20px;background:#1a1a1a;"></div>' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#333;letter-spacing:2px;\">HALF</div>" +
      '<div style="width:1px;height:20px;background:#1a1a1a;"></div>' +
    '</div>' +
    '<div style="flex:1;padding:10px 8px;text-align:center;background:linear-gradient(180deg,' + oppColor + '08,transparent);">' +
      '<div style="display:flex;justify-content:center;">' + renderTeamBadge(GS.opponent, 32) + '</div>' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:12px;color:" + oppColor + ";letter-spacing:1px;margin-top:4px;\">" + opp.name + '</div>' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:36px;color:#fff;line-height:0.9;\">" + cpuScore + '</div>' +
    '</div>';
  content.appendChild(scorePanel);

  // ── STAT STRIP ──
  var st = gs.stats || {};
  var stats = [
    { label: 'YARDS', yours: st.ctTotalYards || 0, theirs: st.irTotalYards || 0 },
    { label: '1ST DOWNS', yours: st.ctFirstDowns || 0, theirs: st.irFirstDowns || 0 },
    { label: 'TURNOVERS', yours: st.ctTurnovers || 0, theirs: st.irTurnovers || 0 },
  ];
  var statStrip = document.createElement('div');
  statStrip.style.cssText = 'display:flex;width:100%;max-width:340px;border-radius:6px;border:1px solid #1a1a1a;overflow:hidden;';
  stats.forEach(function(s, i) {
    var cell = document.createElement('div');
    cell.style.cssText = 'flex:1;padding:6px 4px;text-align:center;' + (i < stats.length - 1 ? 'border-right:1px solid #1a1a1a;' : '');
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
      (isSel ? 'border:1.5px solid ' + adj.color + '66;background:' + adj.color + '08;box-shadow:0 0 12px ' + adj.color + '22;' : 'border:1.5px solid #1a1a1a;background:rgba(255,255,255,0.01);');

    btn.innerHTML =
      '<div style="width:3px;height:32px;border-radius:2px;background:' + adj.color + ';opacity:' + (isSel ? '1' : '0.3') + ';flex-shrink:0;"></div>' +
      '<div style="flex:1;">' +
        "<div style=\"font-family:'Teko';font-weight:700;font-size:15px;color:" + (isSel ? adj.color : '#888') + ";letter-spacing:2px;\">" + adj.label + '</div>' +
        "<div style=\"font-family:'Rajdhani';font-size:10px;color:" + (isSel ? '#bbb' : '#555') + ";line-height:1.3;\">" + adj.desc + '</div>' +
      '</div>' +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:8px;color:" + (isSel ? adj.color : '#444') + ";max-width:80px;text-align:right;letter-spacing:0.3px;\">" + adj.effect + '</div>';

    btn.onclick = function() {
      SND.snap();
      selectedAdj = adj.id;
      setGs(function(s) { return Object.assign({}, s, { halftimeAdjustment: adj.id }); });
      // Re-render button states
      Array.from(adjBtns.children).forEach(function(child, i) {
        var a = ADJUSTMENTS[i];
        var sel = a.id === adj.id;
        child.style.border = '1.5px solid ' + (sel ? a.color + '66' : '#1a1a1a');
        child.style.background = sel ? a.color + '08' : 'rgba(255,255,255,0.01)';
        child.style.boxShadow = sel ? '0 0 12px ' + a.color + '22' : 'none';
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
      "<svg viewBox='0 0 44 56' width='10' height='13' fill='#EBB010'><path d='" + FLAME_PATH + "'/></svg>" +
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
      "<svg viewBox='0 0 44 56' width='16' height='21' fill='" + tc + "' style='opacity:0.5;'><path d='" + FLAME_PATH + "'/></svg>" +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:10px;color:#fff;text-align:center;line-height:1;letter-spacing:0.5px;\">" + card.name + '</div>' +
      '<div style="display:flex;align-items:center;gap:2px;margin-top:2px;">' +
        "<svg viewBox='0 0 44 56' width='8' height='10' fill='#EBB010'><path d='" + FLAME_PATH + "'/></svg>" +
        "<span style=\"font-family:'Teko';font-weight:700;font-size:12px;color:#EBB010;\">" + card.cost + '</span>' +
      '</div>';

    if (canAfford) {
      cardSlot.onclick = function() {
        SND.click();
        var confirmOv = document.createElement('div');
        confirmOv.style.cssText = 'position:fixed;inset:0;z-index:800;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(10,8,4,0.92);pointer-events:auto;';
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
          setGs(function(s) { return Object.assign({}, s, { screen: 'halftime' }); });
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
        htBub.style.cssText = "position:fixed;z-index:802;max-width:260px;background:rgba(10,8,4,0.95);border:1px solid #1a1a1a;border-left:3px solid #FF4511;border-radius:8px;padding:10px 14px;box-shadow:0 8px 24px rgba(0,0,0,0.6);font-family:'Rajdhani';font-weight:600;font-size:13px;color:#fff;line-height:1.3;";
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
    SND.snap();
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
