import gsap from 'gsap';

export function showStatsSheet(parentEl, stats) {
  var humanTeam = stats.humanTeam || {};
  var oppTeam = stats.oppTeam || {};
  var humanAccent = humanTeam.accent || '#FF6B00';
  var oppAccent = oppTeam.accent || '#888';

  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:auto;';

  var bd = document.createElement('div');
  bd.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.55);';
  bd.onclick = function() {
    gsap.to(ov, { opacity: 0, duration: 0.2, onComplete: function() { ov.remove(); } });
  };
  ov.appendChild(bd);

  var sheet = document.createElement('div');
  sheet.style.cssText = "position:relative;z-index:1;background:#141008;border-top:2px solid #FF4511;border-radius:12px 12px 0 0;padding:14px 12px 28px;max-height:70vh;overflow-y:auto;";

  var compPct = stats.offPassAtt > 0 ? Math.round((stats.offPassComp / stats.offPassAtt) * 100) : 0;

  var rows = [
    { label: 'Score',    human: stats.humanScore,   opp: stats.oppScore },
    { label: 'Passing',  human: stats.offPassComp + '/' + stats.offPassAtt + ' · ' + stats.offPassYds + ' yds', opp: '—' },
    { label: 'Rushing',  human: stats.offRushAtt + ' att · ' + stats.offRushYds + ' yds', opp: '—' },
    { label: 'TDs',      human: stats.offTDs,        opp: '—' },
    { label: 'Sacks',    human: stats.defSacks,      opp: '—' },
    { label: 'INTs',     human: stats.defInts,       opp: '—' },
    { label: 'TORCH',    human: stats.torchPts + ' pts', opp: '—' },
  ];

  var rowsHtml = rows.map(function(r, i) {
    var border = i < rows.length - 1 ? 'border-bottom:1px solid #1a1a1a;' : '';
    return "<div style=\"display:flex;align-items:center;" + border + "padding:8px 0;\">" +
      "<div style=\"font-family:'Rajdhani';font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;width:70px;flex-shrink:0;\">" + r.label + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:13px;font-weight:700;color:#eee;flex:1;text-align:center;\">" + r.human + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:13px;font-weight:700;color:#888;flex:1;text-align:center;\">" + r.opp + "</div>" +
    "</div>";
  }).join('');

  var halfLabel = stats.half === 1 ? '1ST HALF' : stats.half === 2 ? '2ND HALF' : '2-MIN DRILL';
  var playsLabel = stats.playsUsed !== undefined ? stats.playsUsed + ' PLAYS' : '';

  sheet.innerHTML =
    "<div style=\"display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;\">" +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:20px;color:#FF4511;letter-spacing:2px;\">GAME STATS</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:10px;color:#444;letter-spacing:1px;\">" + halfLabel + (playsLabel ? " · " + playsLabel : "") + "</div>" +
    "</div>" +
    "<div style=\"display:flex;margin-bottom:6px;\">" +
      "<div style=\"width:70px;flex-shrink:0;\"></div>" +
      "<div style=\"font-family:'Teko';font-size:13px;font-weight:700;color:" + humanAccent + ";letter-spacing:1px;flex:1;text-align:center;text-transform:uppercase;\">" + (humanTeam.name || 'YOU') + "</div>" +
      "<div style=\"font-family:'Teko';font-size:13px;font-weight:700;color:" + oppAccent + ";letter-spacing:1px;flex:1;text-align:center;text-transform:uppercase;\">" + (oppTeam.name || 'OPP') + "</div>" +
    "</div>" +
    rowsHtml;

  ov.appendChild(sheet);
  parentEl.appendChild(ov);
  gsap.from(sheet, { y: 320, duration: 0.3, ease: 'power2.out' });
}
