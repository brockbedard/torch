/**
 * TORCH — End Game Screen
 * Final score, TORCH points, key stats, return to hub.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOtherTeam } from '../../state.js';

export function buildEndGame() {
  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText =
    'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow-y:auto;';

  var styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }' +
    '@keyframes victoryPulse { 0%,100% { text-shadow:0 0 20px rgba(0,255,68,0.4); } 50% { text-shadow:0 0 40px rgba(0,255,68,0.8); } }';
  el.appendChild(styleEl);

  var gs = GS.finalEngine;
  var humanAbbr = GS.humanAbbr;
  var team = getTeam(GS.team);
  var opp = getOtherTeam(GS.team);

  var humanScore = humanAbbr === 'CT' ? gs.ctScore : gs.irScore;
  var cpuScore = humanAbbr === 'CT' ? gs.irScore : gs.ctScore;
  var humanWon = humanScore > cpuScore;
  var tied = humanScore === cpuScore;

  var humanTorch = humanAbbr === 'CT' ? gs.ctTorchPts : gs.irTorchPts;
  var cpuTorch = humanAbbr === 'CT' ? gs.irTorchPts : gs.ctTorchPts;

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText =
    'background:rgba(0,0,0,0.7);padding:12px 14px;text-align:center;flex-shrink:0;' +
    'border-bottom:2px solid var(--a-gold);';
  var hdrTitle = document.createElement('div');
  hdrTitle.style.cssText =
    "font-family:'Teko',sans-serif;font-weight:700;font-size:32px;letter-spacing:3px;" +
    "font-style:italic;transform:skewX(-8deg);" +
    (humanWon ? 'color:#00ff44;animation:victoryPulse 2s infinite;' :
     tied ? 'color:var(--a-gold);' : 'color:#ff4444;');
  hdrTitle.textContent = humanWon ? 'VICTORY' : tied ? 'TIE GAME' : 'DEFEAT';
  hdr.appendChild(hdrTitle);
  el.appendChild(hdr);

  // Content
  var content = document.createElement('div');
  content.style.cssText =
    'flex:1;padding:20px 16px 40px;display:flex;flex-direction:column;' +
    'align-items:center;gap:20px;animation:fadeSlideUp 0.5s ease-out;';

  // Score display
  var scoreBlock = document.createElement('div');
  scoreBlock.style.cssText =
    'display:flex;align-items:center;gap:20px;margin-bottom:8px;';

  var teamBlock = function(name, score, color, isLeft) {
    var b = document.createElement('div');
    b.style.cssText = 'text-align:center;';
    var n = document.createElement('div');
    n.style.cssText =
      "font-family:'Bebas Neue',sans-serif;font-size:24px;color:" + color + ";letter-spacing:2px;";
    n.textContent = name;
    var s = document.createElement('div');
    s.style.cssText =
      "font-family:'Press Start 2P',monospace;font-size:36px;color:#fff;" +
      "text-shadow:0 0 15px rgba(255,255,255,0.3);";
    s.textContent = score;
    b.append(n, s);
    return b;
  };

  var dash = document.createElement('div');
  dash.style.cssText = "font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--muted);";
  dash.textContent = '\u2014';

  scoreBlock.append(
    teamBlock(team.name, humanScore, team.accent),
    dash,
    teamBlock(opp.name, cpuScore, opp.accent)
  );
  content.appendChild(scoreBlock);

  // TORCH points
  var torchBlock = document.createElement('div');
  torchBlock.style.cssText =
    'background:var(--bg-surface);border:1px solid var(--a-gold);border-radius:8px;' +
    'padding:12px 20px;text-align:center;width:100%;max-width:300px;';

  var torchLabel = document.createElement('div');
  torchLabel.style.cssText =
    "font-family:'Press Start 2P',monospace;font-size:8px;color:var(--a-gold);letter-spacing:2px;margin-bottom:8px;";
  torchLabel.textContent = 'TORCH POINTS EARNED';

  var torchScore = document.createElement('div');
  torchScore.style.cssText =
    "font-family:'Press Start 2P',monospace;font-size:24px;color:var(--a-gold);" +
    "text-shadow:0 0 15px rgba(255,204,0,0.4);";
  torchScore.textContent = humanTorch;

  torchBlock.append(torchLabel, torchScore);
  content.appendChild(torchBlock);

  // Stats
  var statsBlock = document.createElement('div');
  statsBlock.style.cssText =
    'width:100%;max-width:300px;display:flex;flex-direction:column;gap:4px;';

  var statLabel = document.createElement('div');
  statLabel.style.cssText =
    "font-family:'Press Start 2P',monospace;font-size:8px;color:var(--muted);letter-spacing:1px;margin-bottom:4px;";
  statLabel.textContent = 'GAME STATS';
  statsBlock.appendChild(statLabel);

  var st = gs.stats;
  var stats = [
    ['Total Plays', gs.totalPlays],
    ['First Downs', (humanAbbr === 'CT' ? st.ctFirstDowns : st.irFirstDowns) +
      ' - ' + (humanAbbr === 'CT' ? st.irFirstDowns : st.ctFirstDowns)],
    ['Total Yards', (humanAbbr === 'CT' ? st.ctTotalYards : st.irTotalYards) +
      ' - ' + (humanAbbr === 'CT' ? st.irTotalYards : st.ctTotalYards)],
    ['Sacks', st.sackCount],
    ['Turnovers', (humanAbbr === 'CT' ? st.ctTurnovers : st.irTurnovers) +
      ' - ' + (humanAbbr === 'CT' ? st.irTurnovers : st.ctTurnovers)],
    ['Badge Combos', st.badgeCombos],
    ['Explosive Plays', st.explosivePlays],
    ['4th Down Conv', st.fourthDownConversions + '/' + st.fourthDownAttempts],
  ];

  stats.forEach(function(s) {
    var row = document.createElement('div');
    row.style.cssText =
      'display:flex;justify-content:space-between;padding:4px 0;' +
      'border-bottom:1px solid var(--bdr);';
    var label = document.createElement('div');
    label.style.cssText = "font-family:'Barlow Condensed',sans-serif;font-size:13px;color:var(--muted);";
    label.textContent = s[0];
    var val = document.createElement('div');
    val.style.cssText = "font-family:'Courier New',monospace;font-size:12px;color:#fff;font-weight:bold;";
    val.textContent = s[1];
    row.append(label, val);
    statsBlock.appendChild(row);
  });

  content.appendChild(statsBlock);

  // Game Recap Log
  var logLabel = document.createElement('div');
  logLabel.style.cssText = "font-family:'Press Start 2P',monospace;font-size:8px;color:var(--muted);letter-spacing:1px;margin-top:10px;align-self:flex-start;width:100%;max-width:300px;";
  logLabel.textContent = 'GAME RECAP';
  content.appendChild(logLabel);

  var logBox = document.createElement('div');
  logBox.style.cssText = 'width:100%;max-width:300px;height:120px;overflow-y:auto;background:rgba(0,0,0,0.3);border:1px solid #333;padding:8px;display:flex;flex-direction:column;gap:6px;';
  
  if (gs.snapLog && gs.snapLog.length > 0) {
    gs.snapLog.forEach((log, i) => {
      var item = document.createElement('div');
      item.style.cssText = "font-family:'Courier New',monospace;font-size:9px;color:#fff;line-height:1.2;border-bottom:1px solid #ffffff08;padding-bottom:4px;";
      var teamColor = getTeam(log.team === 'CT' ? 'canyon_tech' : 'iron_ridge').accent;
      item.innerHTML = `<span style="color:${teamColor};font-weight:bold;">${log.team}:</span> ${log.result}`;
      logBox.appendChild(item);
    });
  }
  content.appendChild(logBox);

  // Return button
  var returnBtn = document.createElement('button');
  returnBtn.className = 'btn-blitz';
  returnBtn.style.cssText =
    'width:100%;max-width:300px;font-size:14px;margin-top:12px;' +
    'background:var(--a-gold);border-color:var(--a-gold);color:#000;' +
    'box-shadow:0 0 20px rgba(255,204,0,0.3);';
  returnBtn.textContent = 'RETURN TO HUB';
  returnBtn.onclick = function() {
    SND.click();
    setGs(null);
  };
  content.appendChild(returnBtn);

  el.appendChild(content);
  return el;
}
