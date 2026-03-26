/**
 * TORCH v0.22 — Halftime Report (Broadcast Style)
 * Score + drive summary + top performer + coach pep talk + shop.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam } from '../../state.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { buildTorchCard } from '../components/cards.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import AudioStateManager from '../../engine/audioManager.js';

var PEP_TALKS_WINNING = [
  "We're in control. Keep the pressure on.",
  "Good half. Now finish it.",
  "They can't stop us. Second half is ours.",
  "Stay disciplined. Don't let up.",
];
var PEP_TALKS_LOSING = [
  "Down but not out. One stop and one score.",
  "We've been here before. Time to fight.",
  "Forget the first half. This is a new game.",
  "They think it's over. Prove them wrong.",
];
var PEP_TALKS_TIED = [
  "All square. Whoever wants it more wins.",
  "Everything to play for. Let's go get it.",
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

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

  // Header with torch orange underline
  var hdr = document.createElement('div');
  hdr.style.cssText = 'background:rgba(0,0,0,0.7);padding:10px 14px;text-align:center;flex-shrink:0;border-bottom:3px solid #FF6B00;';
  hdr.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:28px;color:#FF6B00;letter-spacing:4px;font-style:italic;transform:skewX(-8deg);text-shadow:2px 2px 0 rgba(0,0,0,0.9);\">HALFTIME</div>";
  el.appendChild(hdr);

  var content = document.createElement('div');
  content.style.cssText = 'padding:12px 16px 16px;display:flex;flex-direction:column;align-items:center;gap:12px;';

  // Score with team badges
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

  // Drive summary
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

  // Coach's pep talk
  var pepTalk = humanScore > cpuScore ? pick(PEP_TALKS_WINNING) : humanScore < cpuScore ? pick(PEP_TALKS_LOSING) : pick(PEP_TALKS_TIED);
  var coachBlock = document.createElement('div');
  coachBlock.style.cssText = "width:100%;max-width:320px;padding:10px 14px;background:rgba(255,107,0,0.06);border-left:3px solid #FF6B00;border-radius:0 6px 6px 0;font-family:'Rajdhani';font-size:12px;color:#ccc;font-style:italic;line-height:1.4;";
  coachBlock.textContent = '"' + pepTalk + '"';
  content.appendChild(coachBlock);

  // Locker Room Shop
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

  // Second half receive info
  var receiverIsHuman = !GS.humanReceives;
  var receiverTeam = receiverIsHuman ? team : opp;
  var receiveInfo = document.createElement('div');
  receiveInfo.style.cssText = "width:100%;max-width:320px;text-align:center;font-family:'Rajdhani';font-size:11px;color:#888;padding:4px 0;";
  receiveInfo.innerHTML = "<span style='color:" + receiverTeam.accent + ";font-weight:700;'>" + receiverTeam.name + "</span> receive to start the 2nd half";
  content.appendChild(receiveInfo);

  // Resume button
  var resumeBtn = document.createElement('button');
  resumeBtn.className = 'btn-blitz';
  resumeBtn.style.cssText = "width:100%;max-width:320px;font-size:14px;background:linear-gradient(180deg,#EBB010,#FF4511);border-color:#FF4511;color:#000;letter-spacing:2px;";
  resumeBtn.textContent = 'START SECOND HALF \u2192';
  resumeBtn.onclick = function() {
    SND.snap();
    gs.startSecondHalf();
    var humanReceives2nd = !GS.humanReceives;
    setGs(function(s) { return Object.assign({}, s, { screen: 'gameplay', humanReceives: humanReceives2nd, _halftimeCardDone: false }); });
  };
  content.appendChild(resumeBtn);

  el.appendChild(content);
  return el;
}
