/**
 * TORCH v0.29 — Halftime: Strategic Adjustment Gate
 * Score + drive summary + coaching decision + shop + start 2nd half.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam } from '../../state.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { buildTorchCard } from '../components/cards.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import AudioStateManager from '../../engine/audioManager.js';
import { setHalftimeScore } from '../../engine/commentary.js';

var ADJUSTMENTS = [
  {
    id: 'aggressive',
    label: 'AGGRESSIVE',
    desc: 'Push the pace. Higher risk, higher reward.',
    effect: '+2 yds per play  /  +5% turnover risk',
    border: '#FF4511',
    bg: 'rgba(255,69,17,0.08)',
    glow: 'rgba(255,69,17,0.25)',
  },
  {
    id: 'balanced',
    label: 'BALANCED',
    desc: 'Stay the course. Trust the process.',
    effect: 'No modifier — default game plan.',
    border: '#EBB010',
    bg: 'rgba(235,176,16,0.07)',
    glow: 'rgba(235,176,16,0.20)',
  },
  {
    id: 'conservative',
    label: 'CONSERVATIVE',
    desc: 'Protect the ball. Grind it out.',
    effect: '−1 yd per play  /  −50% turnover chance',
    border: '#4488FF',
    bg: 'rgba(68,136,255,0.08)',
    glow: 'rgba(68,136,255,0.22)',
  },
];

export function buildHalftime() {
  AudioStateManager.setState('halftime');
  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow-y:auto;';

  var gs = GS.engine;
  var team = getTeam(GS.team);
  var opp = getTeam(GS.opponent || 'wolves');
  var humanScore = gs.ctScore;
  var cpuScore = gs.irScore;
  var humanPts = gs.ctTorchPts;

  // Record halftime score differential for comeback narrative tracking
  setHalftimeScore(humanScore - cpuScore);

  // Seed the adjustment to balanced if not set yet
  if (!GS.halftimeAdjustment) {
    setGs(function(s) { return Object.assign({}, s, { halftimeAdjustment: 'balanced' }); });
  }
  var selectedAdj = GS.halftimeAdjustment || 'balanced';

  // ── Header ────────────────────────────────────────────────────────────────
  var hdr = document.createElement('div');
  hdr.style.cssText = 'background:rgba(0,0,0,0.7);padding:10px 14px;text-align:center;flex-shrink:0;border-bottom:3px solid #FF6B00;';
  hdr.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:28px;color:#FF6B00;letter-spacing:4px;font-style:italic;transform:skewX(-8deg);text-shadow:2px 2px 0 rgba(0,0,0,0.9);\">HALFTIME</div>";
  el.appendChild(hdr);

  var content = document.createElement('div');
  content.style.cssText = 'padding:12px 16px 16px;display:flex;flex-direction:column;align-items:center;gap:12px;';

  // ── Score ─────────────────────────────────────────────────────────────────
  var scoreBlock = document.createElement('div');
  scoreBlock.style.cssText = 'display:flex;align-items:center;gap:12px;width:100%;max-width:320px;justify-content:center;';
  scoreBlock.innerHTML =
    '<div style="display:flex;align-items:center;gap:6px;">' + renderTeamBadge(GS.team, 32) +
      "<div style='text-align:center;'><div style=\"font-family:'Teko';font-size:14px;color:" + team.accent + ";letter-spacing:1px;\">" + team.name + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:32px;color:#fff;\">" + humanScore + "</div></div></div>" +
    "<div style=\"font-family:'Teko';font-size:20px;color:#555;\">—</div>" +
    '<div style="display:flex;align-items:center;gap:6px;flex-direction:row-reverse;">' + renderTeamBadge(GS.opponent, 32) +
      "<div style='text-align:center;'><div style=\"font-family:'Teko';font-size:14px;color:" + opp.accent + ";letter-spacing:1px;\">" + opp.name + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:32px;color:#fff;\">" + cpuScore + "</div></div></div>";
  content.appendChild(scoreBlock);

  // ── Drive summary ─────────────────────────────────────────────────────────
  var st = gs.stats || {};
  var summaryBlock = document.createElement('div');
  summaryBlock.style.cssText = 'width:100%;max-width:320px;background:var(--bg-surface);border:1px solid #1E1610;border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:4px;';
  var statRows = [
    ['Total Yards', (st.ctTotalYards || 0) + ' — ' + (st.irTotalYards || 0)],
    ['First Downs', (st.ctFirstDowns || 0) + ' — ' + (st.irFirstDowns || 0)],
    ['Turnovers', (st.ctTurnovers || 0) + ' — ' + (st.irTurnovers || 0)],
  ];
  statRows.forEach(function(row) {
    var r = document.createElement('div');
    r.style.cssText = "display:flex;justify-content:space-between;font-family:'Rajdhani';font-size:11px;color:#aaa;padding:2px 0;border-bottom:1px solid #0E0A04;";
    r.innerHTML = '<span>' + row[0] + '</span><span style="color:#fff;">' + row[1] + '</span>';
    summaryBlock.appendChild(r);
  });
  content.appendChild(summaryBlock);

  // ── Strategic Adjustment ──────────────────────────────────────────────────
  var adjSection = document.createElement('div');
  adjSection.style.cssText = 'width:100%;max-width:320px;display:flex;flex-direction:column;gap:8px;';

  var adjHeader = document.createElement('div');
  adjHeader.style.cssText = 'text-align:center;padding-bottom:2px;';
  adjHeader.innerHTML =
    "<div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#FF6B00;letter-spacing:3px;\">HALFTIME ADJUSTMENT</div>" +
    "<div style=\"font-family:'Rajdhani';font-size:11px;color:#888;letter-spacing:1px;margin-top:2px;\">Choose your 2nd half approach</div>";
  adjSection.appendChild(adjHeader);

  var btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

  ADJUSTMENTS.forEach(function(adj) {
    var btn = document.createElement('button');
    var isSelected = selectedAdj === adj.id;
    btn.style.cssText =
      'width:100%;background:' + (isSelected ? adj.bg : 'rgba(255,255,255,0.02)') + ';' +
      'border:2px solid ' + (isSelected ? adj.border : '#2A2420') + ';' +
      'border-radius:8px;padding:10px 14px;cursor:pointer;text-align:left;' +
      'display:flex;flex-direction:column;gap:2px;' +
      'box-shadow:' + (isSelected ? '0 0 12px ' + adj.glow : 'none') + ';' +
      'transition:border-color 0.15s,box-shadow 0.15s;';

    btn.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:" + (isSelected ? adj.border : '#ccc') + ";letter-spacing:2px;\">" + adj.label + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:12px;color:" + (isSelected ? '#ddd' : '#888') + ";line-height:1.3;\">" + adj.desc + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:10px;color:" + (isSelected ? adj.border : '#555') + ";letter-spacing:0.5px;margin-top:2px;\">" + adj.effect + "</div>";

    btn.ontouchstart = function() {};  // enable :active on iOS
    btn.onclick = function() {
      SND.snap();
      selectedAdj = adj.id;
      setGs(function(s) { return Object.assign({}, s, { halftimeAdjustment: adj.id }); });
      // Re-render all buttons to reflect new selection
      Array.from(btnWrap.children).forEach(function(child, i) {
        var a = ADJUSTMENTS[i];
        var sel = a.id === adj.id;
        child.style.background = sel ? a.bg : 'rgba(255,255,255,0.02)';
        child.style.border = '2px solid ' + (sel ? a.border : '#2A2420');
        child.style.boxShadow = sel ? '0 0 12px ' + a.glow : 'none';
        var label = child.children[0];
        var desc = child.children[1];
        var effect = child.children[2];
        label.style.color = sel ? a.border : '#ccc';
        desc.style.color = sel ? '#ddd' : '#888';
        effect.style.color = sel ? a.border : '#555';
      });
    };

    btnWrap.appendChild(btn);
  });

  adjSection.appendChild(btnWrap);
  content.appendChild(adjSection);

  // ── Locker Room Shop ──────────────────────────────────────────────────────
  var shopBox = document.createElement('div');
  shopBox.style.cssText = 'width:100%;max-width:320px;background:var(--bg-surface);border:1px solid #333;border-radius:8px;padding:10px 12px;';
  shopBox.innerHTML = "<div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;border-bottom:1px solid #1E1610;padding-bottom:6px;\"><div style=\"font-family:'Rajdhani';font-weight:700;font-size:11px;color:#FF6B00;letter-spacing:1px;\">TORCH STORE</div><div style=\"font-family:'Rajdhani';font-weight:700;font-size:10px;color:#00ff44;\">" + humanPts + " PTS</div></div>";

  var offersRow = document.createElement('div');
  offersRow.style.cssText = 'display:flex;gap:6px;';
  var getOffer = function() {
    var r = Math.random();
    var tier = r < 0.3 ? 'BRONZE' : r < 0.7 ? 'SILVER' : 'GOLD';
    var pool = TORCH_CARDS.filter(function(c) { return c.tier === tier; });
    return pool[Math.floor(Math.random() * pool.length)];
  };
  [getOffer(), getOffer(), getOffer()].forEach(function(card) {
    var canAfford = humanPts >= card.cost;
    var cardEl = buildTorchCard(card, 80, 112);
    cardEl.style.flex = '1';
    cardEl.style.cursor = canAfford ? 'pointer' : 'not-allowed';
    cardEl.style.opacity = canAfford ? '1' : '0.4';
    if (canAfford) {
      cardEl.onclick = function() {
        SND.snap();
        gs.humanTorchCards.push(card.id);
        gs.ctTorchPts -= card.cost;
        setGs(function(s) { return Object.assign({}, s, { screen: 'halftime' }); });
      };
    }
    offersRow.appendChild(cardEl);
  });
  shopBox.appendChild(offersRow);
  content.appendChild(shopBox);

  // ── Second half receive info ───────────────────────────────────────────────
  var receiverIsHuman = !GS.humanReceives;
  var receiverTeam = receiverIsHuman ? team : opp;
  var receiveInfo = document.createElement('div');
  receiveInfo.style.cssText = "width:100%;max-width:320px;text-align:center;font-family:'Rajdhani';font-size:11px;color:#888;padding:4px 0;";
  receiveInfo.innerHTML = "<span style='color:" + receiverTeam.accent + ";font-weight:700;'>" + receiverTeam.name + "</span> receive to start the 2nd half";
  content.appendChild(receiveInfo);

  // ── Resume button ─────────────────────────────────────────────────────────
  var resumeBtn = document.createElement('button');
  resumeBtn.className = 'btn-blitz';
  resumeBtn.style.cssText = "width:100%;max-width:320px;font-size:14px;background:linear-gradient(180deg,#EBB010,#FF4511);border-color:#FF4511;color:#000;letter-spacing:2px;";
  resumeBtn.textContent = 'START SECOND HALF \u2192';
  resumeBtn.onclick = function() {
    SND.snap();
    gs.startSecondHalf();
    // Apply halftime adjustment to game engine
    gs.halftimeAdjustment = GS.halftimeAdjustment || 'balanced';
    var humanReceives2nd = !GS.humanReceives;
    setGs(function(s) { return Object.assign({}, s, { screen: 'gameplay', humanReceives: humanReceives2nd, _halftimeCardDone: false }); });
  };
  content.appendChild(resumeBtn);

  el.appendChild(content);
  return el;
}
