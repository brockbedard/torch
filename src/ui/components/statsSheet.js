/**
 * TORCH — Stats Sheet (scorebug-tap destination)
 *
 * Rebuilt in v0.35.x as the single canonical stats destination.
 * Triggered by tapping the scorebug at the top of the gameplay screen.
 *
 * Layout (top to bottom):
 *   1. Header  — title + half/plays meta
 *   2. Score cards — big team-colored panels with TD/FG/TO breakdown
 *   3. Key Metrics — 4 hero tiles (KPA, TO margin, 3rd down, explosives)
 *   4. Passing — comp/att, yards, TDs, INTs
 *   5. Rushing — attempts, yards, YPC, TDs
 *   6. Defense — sacks, PBUs, INTs forced, fumbles forced
 *   7. Drives  — compact scrollable list with KPA + result pills
 *   8. Economy — TORCH points, cards used
 *
 * Data shape expected in `stats`:
 *   {
 *     humanTeam, oppTeam            — team objects with name + accent
 *     humanScore, oppScore          — ints
 *     half, playsUsed, clockText    — meta
 *     hPassAtt, hPassComp, hPassYds, hRushAtt, hRushYds,
 *     hTdsPass, hTdsRush, hFgMade, hInts, hFumblesLost,
 *     hSacks, hPBUs, hInts forced (from defStats), hFumblesForced,
 *     hEpaSum, cEpaSum, hTurnovers, cTurnovers,
 *     h3rdAtt, h3rdConv, c3rdAtt, c3rdConv,
 *     hExplosive, cExplosive,
 *     hTorch, cTorch,
 *     hCardsUsed, cCardsUsed,
 *     driveHistory                  — array of { team, plays, yards, epa, result, points }
 *     (and the same for c* opponent stats)
 *   }
 */

import gsap from 'gsap';

function _epaColor(epa) {
  if (epa >= 2)  return '#00ff44';
  if (epa >= 0)  return '#c8a030';
  if (epa >= -2) return '#FF6B00';
  return '#ff0040';
}

function _sign(n) { return (n > 0 ? '+' : '') + n; }
function _fmt(n, digits) { if (typeof n !== 'number') return '—'; return n.toFixed(digits || 0); }

/**
 * Normalize a pair of values to 0-100 split for the stat bar.
 * When both are 0, returns 50/50.
 */
function _barSplit(a, b) {
  a = Math.max(0, a || 0);
  b = Math.max(0, b || 0);
  var sum = a + b;
  if (sum === 0) return { u: 50, o: 50 };
  return { u: Math.round((a / sum) * 100), o: Math.round((b / sum) * 100) };
}

function _hexToRgb(hex) {
  var h = (hex || '#EBB010').replace('#', '');
  if (h.length === 3) h = h.split('').map(function(c){return c+c;}).join('');
  var r = parseInt(h.substring(0,2), 16);
  var g = parseInt(h.substring(2,4), 16);
  var b = parseInt(h.substring(4,6), 16);
  return (isNaN(r) ? '235,176,16' : r + ',' + g + ',' + b);
}

/** Stat row helper — label | user val | bar | opp val */
function statRow(label, userVal, oppVal, userWins, userAccent, oppAccent) {
  var winClass = userWins === true ? 'win-u' : userWins === false ? 'win-o' : '';
  // Compute split for the bar
  var uNum = typeof userVal === 'number' ? userVal : parseFloat(String(userVal).replace(/[^\d.-]/g, '')) || 0;
  var oNum = typeof oppVal  === 'number' ? oppVal  : parseFloat(String(oppVal).replace(/[^\d.-]/g, '')) || 0;
  var split = _barSplit(uNum, oNum);
  return '<div class="T-ss-row">' +
    '<div class="T-ss-label">' + label + '</div>' +
    '<div class="T-ss-u ' + (winClass === 'win-u' ? 'is-win' : '') + '" style="--accent:' + userAccent + ';--accent-rgb:' + _hexToRgb(userAccent) + '">' + userVal + '</div>' +
    '<div class="T-ss-bar">' +
      '<div class="T-ss-bar-u" style="width:' + split.u + '%;--accent:' + userAccent + ';--accent-rgb:' + _hexToRgb(userAccent) + '"></div>' +
      '<div class="T-ss-bar-o" style="width:' + split.o + '%;--accent:' + oppAccent + ';--accent-rgb:' + _hexToRgb(oppAccent) + '"></div>' +
      '<div class="T-ss-bar-tick"></div>' +
    '</div>' +
    '<div class="T-ss-o ' + (winClass === 'win-o' ? 'is-win' : '') + '" style="--accent:' + oppAccent + ';--accent-rgb:' + _hexToRgb(oppAccent) + '">' + oppVal + '</div>' +
  '</div>';
}

function sectionHeader(text) {
  return '<div class="T-ss-section">' + text + '</div>';
}

function injectStyle() {
  if (document.getElementById('T-ss-style')) return;
  var style = document.createElement('style');
  style.id = 'T-ss-style';
  style.textContent = [
    '.T-ss-sheet{background:#141008;padding:16px 14px 32px;max-height:85vh;overflow-y:auto;border-top:2px solid;border-image:linear-gradient(90deg,var(--u-accent),#FF4511,var(--o-accent)) 1;border-radius:12px 12px 0 0;}',
    '.T-ss-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.06);}',
    ".T-ss-title{font-family:'Teko',sans-serif;font-weight:700;font-size:20px;color:#fff;letter-spacing:3px;display:flex;align-items:center;gap:8px;}",
    '.T-ss-title::before{content:"";width:3px;height:18px;background:#EBB010;border-radius:1px;}',
    ".T-ss-meta{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:9px;color:#888;letter-spacing:2px;text-align:right;line-height:1.3;}",
    '.T-ss-score-row{display:grid;grid-template-columns:1fr 40px 1fr;gap:6px;margin-bottom:16px;}',
    '.T-ss-score-card{background:linear-gradient(180deg,rgba(var(--u-rgb),0.08),transparent 70%);border:1px solid rgba(var(--u-rgb),0.25);border-left:3px solid var(--u-accent);border-radius:4px;padding:10px 12px;display:flex;flex-direction:column;align-items:flex-start;}',
    '.T-ss-score-card.opp{background:linear-gradient(180deg,rgba(var(--o-rgb),0.06),transparent 70%);border-color:rgba(var(--o-rgb),0.2);border-left:3px solid var(--o-accent);align-items:flex-end;}',
    ".T-ss-score-label{font-family:'Oswald',sans-serif;font-weight:700;font-size:10px;letter-spacing:2.5px;color:var(--u-accent);}",
    '.T-ss-score-card.opp .T-ss-score-label{color:var(--o-accent);opacity:0.8;}',
    ".T-ss-score-val{font-family:'Teko',sans-serif;font-weight:900;font-size:48px;line-height:0.9;color:#fff;margin-top:2px;}",
    '.T-ss-score-card.opp .T-ss-score-val{color:rgba(255,255,255,0.7);font-weight:700;font-size:42px;}',
    ".T-ss-score-sub{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:8px;color:#555;letter-spacing:1.5px;margin-top:2px;}",
    ".T-ss-score-divider{display:flex;align-items:center;justify-content:center;font-family:'Teko',sans-serif;font-weight:700;font-size:14px;color:#555;}",
    ".T-ss-section{font-family:'Oswald',sans-serif;font-weight:700;font-size:9px;color:#EBB010;letter-spacing:3px;margin:18px 0 6px;display:flex;align-items:center;gap:8px;}",
    '.T-ss-section::before,.T-ss-section::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(235,176,16,0.3),transparent);}',
    '.T-ss-hero-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:4px;}',
    '.T-ss-hero-tile{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:4px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;}',
    '.T-ss-hero-hdr{display:flex;justify-content:space-between;align-items:baseline;}',
    ".T-ss-hero-label{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:9px;color:#555;letter-spacing:1.5px;}",
    ".T-ss-hero-val{font-family:'Teko',sans-serif;font-weight:700;font-size:22px;line-height:0.9;}",
    '.T-ss-hero-bar{position:relative;height:6px;background:rgba(255,255,255,0.04);border-radius:3px;overflow:hidden;display:flex;}',
    '.T-ss-hero-bar-u{height:100%;background:linear-gradient(90deg,rgba(var(--u-rgb),0.5),var(--u-accent));border-radius:3px 0 0 3px;}',
    '.T-ss-hero-bar-o{height:100%;background:linear-gradient(270deg,rgba(var(--o-rgb),0.5),var(--o-accent));border-radius:0 3px 3px 0;}',
    ".T-ss-hero-sub{display:flex;justify-content:space-between;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:9px;color:#555;letter-spacing:0.5px;}",
    '.T-ss-hero-sub .u{color:var(--u-accent);}',
    '.T-ss-hero-sub .o{color:var(--o-accent);}',
    '.T-ss-row{display:grid;grid-template-columns:90px 48px 1fr 48px;align-items:center;gap:8px;padding:7px 0;border-bottom:1px dashed rgba(255,255,255,0.04);}',
    '.T-ss-row:last-child{border-bottom:none;}',
    ".T-ss-label{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:9px;color:#555;letter-spacing:1.5px;}",
    ".T-ss-u,.T-ss-o{font-family:'Teko',sans-serif;font-weight:700;font-size:15px;line-height:1;}",
    '.T-ss-u{color:#fff;text-align:right;}',
    '.T-ss-o{color:rgba(255,255,255,0.6);text-align:left;}',
    '.T-ss-u.is-win{color:var(--accent);text-shadow:0 0 6px rgba(var(--accent-rgb),0.4);}',
    '.T-ss-o.is-win{color:var(--accent);text-shadow:0 0 6px rgba(var(--accent-rgb),0.4);}',
    '.T-ss-bar{position:relative;height:4px;background:rgba(255,255,255,0.03);border-radius:2px;display:flex;}',
    '.T-ss-bar-u{height:100%;background:linear-gradient(90deg,rgba(var(--accent-rgb),0.4),var(--accent));border-radius:2px 0 0 2px;}',
    '.T-ss-bar-o{height:100%;background:linear-gradient(270deg,rgba(var(--accent-rgb),0.4),var(--accent));border-radius:0 2px 2px 0;}',
    '.T-ss-bar-tick{position:absolute;top:-1px;bottom:-1px;left:50%;width:1px;background:rgba(255,255,255,0.2);}',
    '.T-ss-drives{display:flex;flex-direction:column;gap:3px;}',
    '.T-ss-drive{display:grid;grid-template-columns:24px 1fr auto auto;gap:8px;align-items:center;padding:5px 8px;background:rgba(255,255,255,0.015);border-radius:3px;border-left:2px solid rgba(255,255,255,0.1);}',
    '.T-ss-drive.u{border-left-color:rgba(var(--u-rgb),0.6);}',
    '.T-ss-drive.o{border-left-color:rgba(var(--o-rgb),0.6);}',
    ".T-ss-drive-num{font-family:'Teko',sans-serif;font-weight:700;font-size:11px;color:#555;}",
    ".T-ss-drive-info{font-family:'Rajdhani',sans-serif;font-weight:600;font-size:10px;color:#bbb;}",
    ".T-ss-drive-epa{font-family:'Teko',sans-serif;font-weight:700;font-size:11px;color:#888;}",
    ".T-ss-drive-result{font-family:'Teko',sans-serif;font-weight:700;font-size:10px;padding:1px 5px;border-radius:2px;letter-spacing:1px;}",
    '.T-ss-drive-result.td{color:#00ff44;background:rgba(0,255,68,0.12);border:1px solid rgba(0,255,68,0.3);}',
    '.T-ss-drive-result.fg{color:#EBB010;background:rgba(235,176,16,0.12);border:1px solid rgba(235,176,16,0.3);}',
    '.T-ss-drive-result.to{color:#ff0040;background:rgba(255,0,64,0.1);border:1px solid rgba(255,0,64,0.3);}',
    '.T-ss-drive-result.pt{color:#888;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);}',
    ".T-ss-empty{font-family:'Rajdhani',sans-serif;font-size:11px;color:#555;text-align:center;padding:8px 0;font-style:italic;}",
  ].join('\n');
  document.head.appendChild(style);
}

export function showStatsSheet(parentEl, stats) {
  injectStyle();

  var humanTeam = stats.humanTeam || { name: 'YOU', accent: '#EBB010' };
  var oppTeam   = stats.oppTeam   || { name: 'OPP', accent: '#888888' };
  var uAccent   = humanTeam.accent || '#EBB010';
  var oAccent   = oppTeam.accent || '#888888';
  var uRgb      = _hexToRgb(uAccent);
  var oRgb      = _hexToRgb(oAccent);

  // ── Derivations ──
  var hPA = stats.hPassAtt || 0, hPC = stats.hPassComp || 0, hPY = stats.hPassYds || 0;
  var cPA = stats.cPassAtt || 0, cPC = stats.cPassComp || 0, cPY = stats.cPassYds || 0;
  var hRA = stats.hRushAtt || 0, hRY = stats.hRushYds || 0;
  var cRA = stats.cRushAtt || 0, cRY = stats.cRushYds || 0;
  var hYpc = hRA > 0 ? (hRY / hRA) : 0;
  var cYpc = cRA > 0 ? (cRY / cRA) : 0;

  var hTds = (stats.hTdsPass || 0) + (stats.hTdsRush || 0);
  var cTds = (stats.cTdsPass || 0) + (stats.cTdsRush || 0);
  var hTOs = stats.hTurnovers || 0;
  var cTOs = stats.cTurnovers || 0;

  var toMargin = cTOs - hTOs; // positive = user winning
  var epaDiff = (stats.hEpaSum || 0) - (stats.cEpaSum || 0);
  var h3Pct = stats.h3rdAtt > 0 ? Math.round(100 * stats.h3rdConv / stats.h3rdAtt) : 0;
  var c3Pct = stats.c3rdAtt > 0 ? Math.round(100 * stats.c3rdConv / stats.c3rdAtt) : 0;

  // ── Build overlay ──
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:auto;';

  var bd = document.createElement('div');
  bd.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.6);opacity:0;transition:opacity 0.25s;';
  function dismiss() {
    bd.style.opacity = '0';
    try {
      gsap.to(sheet, { y: '100%', duration: 0.25, ease: 'power2.in', onComplete: function() { ov.remove(); } });
    } catch (e) { ov.remove(); }
  }
  bd.onclick = dismiss;
  ov.appendChild(bd);

  var sheet = document.createElement('div');
  sheet.className = 'T-ss-sheet';
  sheet.style.cssText = 'position:relative;z-index:1;';
  sheet.style.setProperty('--u-accent', uAccent);
  sheet.style.setProperty('--u-rgb', uRgb);
  sheet.style.setProperty('--o-accent', oAccent);
  sheet.style.setProperty('--o-rgb', oRgb);

  var halfLabel = stats.half === 1 ? '1ST HALF' : stats.half === 2 ? '2ND HALF' : '2-MIN DRILL';
  var playsLabel = stats.playsUsed !== undefined ? stats.playsUsed + ' PLAYS' : '';
  var clockLabel = stats.clockText || '';

  // ── Score cards ──
  var hTdsPass = stats.hTdsPass || 0, hTdsRush = stats.hTdsRush || 0;
  var cTdsPass = stats.cTdsPass || 0, cTdsRush = stats.cTdsRush || 0;
  var hFgs = stats.hFgMade || 0, cFgs = stats.cFgMade || 0;
  var uBreakdown = (hTds || 0) + ' TD · ' + hFgs + ' FG · ' + hTOs + ' TO';
  var oBreakdown = (cTds || 0) + ' TD · ' + cFgs + ' FG · ' + cTOs + ' TO';

  // ── Hero tiles ──
  var epaSplit = _barSplit(Math.max(0, stats.hEpaSum || 0), Math.max(0, stats.cEpaSum || 0));
  if ((stats.hEpaSum || 0) < 0 && (stats.cEpaSum || 0) < 0) {
    // Both negative — normalize by absolute
    epaSplit = _barSplit(Math.abs(stats.cEpaSum || 0), Math.abs(stats.hEpaSum || 0)); // flip: bigger loss = smaller bar share
  }
  var toSplit   = _barSplit(cTOs, hTOs); // opponent's TOs fill USER side (user benefits)
  var expSplit  = _barSplit(stats.hExplosive || 0, stats.cExplosive || 0);
  var _3dNum    = h3Pct, _3dOpp = c3Pct;
  var tdSplit   = _barSplit(_3dNum, _3dOpp);

  var epaText = _sign(Math.round(epaDiff * 10) / 10);
  var epaC = _epaColor(epaDiff);
  var toText = _sign(toMargin);
  var toC = toMargin > 0 ? '#00ff44' : toMargin < 0 ? '#ff0040' : '#888';
  var exText = (stats.hExplosive || 0) + '-' + (stats.cExplosive || 0);
  var exDiff = (stats.hExplosive || 0) - (stats.cExplosive || 0);
  var exC = exDiff > 0 ? '#00ff44' : exDiff < 0 ? '#FF6B00' : '#888';
  var dC  = h3Pct >= 50 ? '#00ff44' : h3Pct >= 33 ? '#c8a030' : '#FF6B00';

  var heroHtml =
    '<div class="T-ss-hero-stats">' +
      // EPA
      '<div class="T-ss-hero-tile">' +
        '<div class="T-ss-hero-hdr">' +
          '<div class="T-ss-hero-label" title="Kindle Points Added — TORCH\'s version of Expected Points Added">NET KPA</div>' +
          '<div class="T-ss-hero-val" style="color:' + epaC + '">' + epaText + '</div>' +
        '</div>' +
        '<div class="T-ss-hero-bar">' +
          '<div class="T-ss-hero-bar-u" style="width:' + epaSplit.u + '%;"></div>' +
          '<div class="T-ss-hero-bar-o" style="width:' + epaSplit.o + '%;"></div>' +
        '</div>' +
        '<div class="T-ss-hero-sub">' +
          '<span class="u">' + _sign(Math.round((stats.hEpaSum || 0) * 10) / 10) + ' YOU</span>' +
          '<span class="o">' + _sign(Math.round((stats.cEpaSum || 0) * 10) / 10) + ' OPP</span>' +
        '</div>' +
      '</div>' +
      // TO margin
      '<div class="T-ss-hero-tile">' +
        '<div class="T-ss-hero-hdr">' +
          '<div class="T-ss-hero-label">TO MARGIN</div>' +
          '<div class="T-ss-hero-val" style="color:' + toC + '">' + toText + '</div>' +
        '</div>' +
        '<div class="T-ss-hero-bar">' +
          '<div class="T-ss-hero-bar-u" style="width:' + toSplit.u + '%;"></div>' +
          '<div class="T-ss-hero-bar-o" style="width:' + toSplit.o + '%;"></div>' +
        '</div>' +
        '<div class="T-ss-hero-sub">' +
          '<span class="u">' + hTOs + ' YOURS</span>' +
          '<span class="o">' + cTOs + ' THEIRS</span>' +
        '</div>' +
      '</div>' +
      // 3rd down
      '<div class="T-ss-hero-tile">' +
        '<div class="T-ss-hero-hdr">' +
          '<div class="T-ss-hero-label">3RD DOWN</div>' +
          '<div class="T-ss-hero-val" style="color:' + dC + '">' + (stats.h3rdAtt > 0 ? (h3Pct + '%') : '—') + '</div>' +
        '</div>' +
        '<div class="T-ss-hero-bar">' +
          '<div class="T-ss-hero-bar-u" style="width:' + tdSplit.u + '%;"></div>' +
          '<div class="T-ss-hero-bar-o" style="width:' + tdSplit.o + '%;"></div>' +
        '</div>' +
        '<div class="T-ss-hero-sub">' +
          '<span class="u">' + (stats.h3rdConv || 0) + '/' + (stats.h3rdAtt || 0) + ' YOU</span>' +
          '<span class="o">' + (stats.c3rdConv || 0) + '/' + (stats.c3rdAtt || 0) + ' OPP</span>' +
        '</div>' +
      '</div>' +
      // Explosives
      '<div class="T-ss-hero-tile">' +
        '<div class="T-ss-hero-hdr">' +
          '<div class="T-ss-hero-label">EXPLOSIVES (15+)</div>' +
          '<div class="T-ss-hero-val" style="color:' + exC + '">' + exText + '</div>' +
        '</div>' +
        '<div class="T-ss-hero-bar">' +
          '<div class="T-ss-hero-bar-u" style="width:' + expSplit.u + '%;"></div>' +
          '<div class="T-ss-hero-bar-o" style="width:' + expSplit.o + '%;"></div>' +
        '</div>' +
        '<div class="T-ss-hero-sub">' +
          '<span class="u">' + (stats.hExplosive || 0) + ' YOURS</span>' +
          '<span class="o">' + (stats.cExplosive || 0) + ' THEIRS</span>' +
        '</div>' +
      '</div>' +
    '</div>';

  // ── Passing section ──
  var passHtml = sectionHeader('PASSING') +
    statRow('COMP / ATT',  hPC + '/' + hPA, cPC + '/' + cPA, hPC > cPC, uAccent, oAccent) +
    statRow('YARDS',       hPY, cPY, hPY > cPY, uAccent, oAccent) +
    statRow('TDs',         hTdsPass, cTdsPass, hTdsPass > cTdsPass, uAccent, oAccent) +
    statRow('INTs',        hTOs, cTOs, hTOs < cTOs, uAccent, oAccent);  // fewer INTs = win

  // ── Rushing section ──
  var rushHtml = sectionHeader('RUSHING') +
    statRow('ATTEMPTS', hRA, cRA, hRA > cRA, uAccent, oAccent) +
    statRow('YARDS',    hRY, cRY, hRY > cRY, uAccent, oAccent) +
    statRow('YDS / CARRY', _fmt(hYpc, 1), _fmt(cYpc, 1), hYpc > cYpc, uAccent, oAccent) +
    statRow('TDs',      hTdsRush, cTdsRush, hTdsRush > cTdsRush, uAccent, oAccent);

  // ── Defense section ──
  var hSacks = stats.hSacks || 0, cSacks = stats.cSacks || 0;
  var hPBUs  = stats.hPBUs  || 0, cPBUs  = stats.cPBUs  || 0;
  var hDefHtml = sectionHeader('DEFENSE') +
    statRow('SACKS',       hSacks, cSacks, hSacks > cSacks, uAccent, oAccent) +
    statRow('PBUs',        hPBUs,  cPBUs,  hPBUs  > cPBUs,  uAccent, oAccent) +
    statRow('FORCED TOs',  cTOs,   hTOs,   cTOs   > hTOs,   uAccent, oAccent); // forced TOs == opponent's turnovers

  // ── Drives list ──
  var driveHistory = stats.driveHistory || [];
  var drivesHtml = sectionHeader('DRIVES');
  if (driveHistory.length === 0) {
    drivesHtml += '<div class="T-ss-empty">No drives yet.</div>';
  } else {
    drivesHtml += '<div class="T-ss-drives">';
    driveHistory.forEach(function(d, i) {
      var isUser = (d.team === stats.humanAbbr);
      var resTag = d.result || 'DOWNS';
      var resClass = 'pt';
      if (resTag === 'TD')            resClass = 'td';
      else if (resTag === 'FG')       resClass = 'fg';
      else if (resTag === 'INT' || resTag === 'FUM' || resTag === 'NO GOOD') resClass = 'to';
      var epaStr = (d.epa !== undefined) ? _sign(Math.round(d.epa * 10) / 10) + ' KPA' : '';
      drivesHtml += '<div class="T-ss-drive ' + (isUser ? 'u' : 'o') + '">' +
        '<div class="T-ss-drive-num">' + (i + 1) + '</div>' +
        '<div class="T-ss-drive-info">' + (d.plays || 0) + ' plays · ' + (d.yards || 0) + ' yds</div>' +
        '<div class="T-ss-drive-epa">' + epaStr + '</div>' +
        '<div class="T-ss-drive-result ' + resClass + '">' + resTag + '</div>' +
      '</div>';
    });
    drivesHtml += '</div>';
  }

  // ── Economy section ──
  var econHtml = sectionHeader('TORCH ECONOMY') +
    statRow('POINTS', stats.hTorch || 0, stats.cTorch || 0, (stats.hTorch || 0) > (stats.cTorch || 0), uAccent, oAccent) +
    statRow('CARDS USED', stats.hCardsUsed || 0, stats.cCardsUsed || 0, null, uAccent, oAccent);

  sheet.innerHTML =
    '<div class="T-ss-hdr">' +
      '<div class="T-ss-title">GAME STATS</div>' +
      '<div class="T-ss-meta">' +
        halfLabel + (playsLabel ? ' · ' + playsLabel : '') +
        (clockLabel ? '<br><span style="color:#666;">' + clockLabel + '</span>' : '') +
      '</div>' +
    '</div>' +
    // Score cards
    '<div class="T-ss-score-row">' +
      '<div class="T-ss-score-card">' +
        '<div class="T-ss-score-label">' + humanTeam.name.toUpperCase() + '</div>' +
        '<div class="T-ss-score-val">' + (stats.humanScore || 0) + '</div>' +
        '<div class="T-ss-score-sub">' + uBreakdown + '</div>' +
      '</div>' +
      '<div class="T-ss-score-divider">—</div>' +
      '<div class="T-ss-score-card opp">' +
        '<div class="T-ss-score-label">' + oppTeam.name.toUpperCase() + '</div>' +
        '<div class="T-ss-score-val">' + (stats.oppScore || 0) + '</div>' +
        '<div class="T-ss-score-sub">' + oBreakdown + '</div>' +
      '</div>' +
    '</div>' +
    sectionHeader('KEY METRICS') +
    heroHtml +
    passHtml +
    rushHtml +
    hDefHtml +
    drivesHtml +
    econHtml;

  ov.appendChild(sheet);
  parentEl.appendChild(ov);

  // Animate in
  try {
    gsap.to(bd, { opacity: 1, duration: 0.25 });
    gsap.fromTo(sheet, { y: '100%' }, { y: '0%', duration: 0.35, ease: 'power2.out' });
  } catch (e) {
    bd.style.opacity = '1';
  }
}
