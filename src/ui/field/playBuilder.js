/**
 * TORCH — Play Animation Builder (Phase 1, v3)
 * All keyframes in YARD SPACE: kf(time, xPct, yYards)
 *   xPct: 0-1 across field width
 *   yYards: yards from LOS (positive = downfield, negative = backfield)
 * The animator converts to canvas pixels per-frame using current topYard.
 * This means field scrolling works perfectly — dots stay pinned to their yard positions.
 */

function lerp(a, b, t) { return a + (b - a) * t; }
function kf(time, xPct, yYards) { return { time: time, xPct: xPct, yYards: yYards }; }

export function buildPlayAnimation(resultType, yardsGained, formation, playType, defScheme, fieldW, ypx, losYard, topYard) {
  var form = formation;
  var allDots = form.offense.concat(form.defense);
  var numOff = form.offense.length;

  // ── TIMING ──
  var isTD = resultType === 'touchdown';
  var isRun = resultType === 'run' || (playType === 'RUN' && !['sack','interception','incomplete'].includes(resultType));

  var dur, throwT, catchT, tackleT;
  if (resultType === 'sack') {
    dur = 8000; throwT = dur*0.25; catchT = dur*0.5; tackleT = dur*0.65;
  } else if (isRun) {
    dur = 10000; throwT = dur*0.12; catchT = dur*0.30; tackleT = dur*0.70;
  } else if (isTD || resultType === 'interception') {
    dur = 12000; throwT = dur*0.22; catchT = dur*0.40; tackleT = dur*0.72;
  } else {
    dur = 11000; throwT = dur*0.25; catchT = dur*0.42; tackleT = dur*0.75;
  }

  var catchDepth = Math.min(yardsGained * 0.6, 20);
  var settleDepth = yardsGained;

  // ── INIT: every dot starts at its formation position, stays put ──
  var dotKF = allDots.map(function(p) {
    return [kf(0, p.x, p.y), kf(dur, p.x, p.y)];
  });

  var seq = { dotKeyframes: dotKF, ball: null, events: [], yardSpace: true };

  // ── FIND PLAYERS ──
  var qbIdx = -1, wrIdx = -1, decoyIdx = -1, rbIdx = -1;
  for (var i = 0; i < numOff; i++) {
    var pos = form.offense[i].pos;
    if (pos === 'QB' && qbIdx === -1) qbIdx = i;
    else if (['WR','SLOT','TE'].includes(pos) && wrIdx === -1) wrIdx = i;
    else if (['WR','SLOT','TE'].includes(pos) && decoyIdx === -1) decoyIdx = i;
    else if (['RB','FB'].includes(pos) && rbIdx === -1) rbIdx = i;
  }
  var cbIndices = [], lbIdx = -1, safetyIdx = -1;
  for (var j = 0; j < form.defense.length; j++) {
    var dp = form.defense[j].pos;
    if (dp === 'CB') cbIndices.push(numOff + j);
    else if (dp === 'LB' && lbIdx === -1) lbIdx = numOff + j;
    else if (dp === 'S' && safetyIdx === -1) safetyIdx = numOff + j;
  }

  var qb = qbIdx >= 0 ? form.offense[qbIdx] : { x: 0.50, y: -5 };

  // ===================================================================
  // OL: pass block (slide back, pocket) or run block (fire forward, spread)
  // ===================================================================
  for (var oi = 0; oi < numOff; oi++) {
    if (form.offense[oi].pos !== 'OL') continue;
    var ol = form.offense[oi];
    var spread = ol.x < 0.50 ? -0.02 : ol.x > 0.50 ? 0.02 : 0;
    if (isRun) {
      dotKF[oi] = [kf(0,ol.x,ol.y), kf(dur*0.08,ol.x,ol.y), kf(dur*0.20,ol.x+spread,ol.y+3), kf(dur*0.40,ol.x+spread,ol.y+3), kf(dur,ol.x+spread,ol.y+2.5)];
    } else {
      dotKF[oi] = [kf(0,ol.x,ol.y), kf(dur*0.05,ol.x,ol.y), kf(dur*0.18,ol.x+spread,ol.y-1), kf(dur,ol.x+spread,ol.y-1)];
    }
  }

  // ===================================================================
  // QB: dropback/throw, handoff, or sack scramble
  // ===================================================================
  if (qbIdx >= 0) {
    if (resultType === 'sack') {
      var sackDepth = -(Math.abs(yardsGained));
      dotKF[qbIdx] = [kf(0,qb.x,qb.y), kf(dur*0.15,qb.x,qb.y-3), kf(dur*0.35,qb.x,qb.y-2), kf(dur*0.50,qb.x+0.06,qb.y-3), kf(dur*0.65,qb.x+0.05,sackDepth), kf(dur,qb.x+0.05,sackDepth)];
      seq.events.push({ time: dur*0.65, type: 'sack', xPct: qb.x+0.05, yYards: sackDepth });
    } else if (isRun && rbIdx >= 0) {
      var rb = form.offense[rbIdx];
      var meshX = (qb.x + rb.x) / 2, meshY = (qb.y + rb.y) / 2 + 1;
      dotKF[qbIdx] = [kf(0,qb.x,qb.y), kf(throwT,meshX,meshY), kf(throwT+dur*0.08,qb.x+0.08,qb.y-2), kf(dur,qb.x+0.08,qb.y-2)];
      seq.events.push({ time: throwT, type: 'handoff', xPct: meshX, yYards: meshY });
    } else {
      dotKF[qbIdx] = [kf(0,qb.x,qb.y), kf(dur*0.12,qb.x,qb.y-3), kf(dur*0.18,qb.x,qb.y-2), kf(throwT,qb.x,qb.y-2), kf(dur,qb.x,qb.y-2)];
      seq.events.push({ time: throwT, type: 'throw', xPct: qb.x, yYards: qb.y-2 });
    }
  }

  // ===================================================================
  // PRIMARY TARGET (WR route or RB run)
  // ===================================================================
  var targetIdx = isRun ? rbIdx : wrIdx;
  if (targetIdx >= 0 && resultType !== 'sack') {
    var tp = form.offense[targetIdx];

    if (isRun) {
      var rb2 = form.offense[targetIdx];
      var meshX2 = (rb2.x + qb.x) / 2, meshY2 = (rb2.y + qb.y) / 2 + 1;
      var holeX = Math.random() > 0.5 ? 0.50 : (rb2.x < 0.50 ? 0.20 : 0.80);
      dotKF[targetIdx] = [kf(0,rb2.x,rb2.y), kf(throwT,meshX2,meshY2), kf(catchT*0.5,holeX,1), kf(catchT,holeX,catchDepth), kf(tackleT,holeX+0.02,settleDepth), kf(dur,holeX+0.02,settleDepth)];
      seq.events.push({ time: tackleT, type: isTD?'touchdown':'tackle', xPct: holeX+0.02, yYards: settleDepth });
    } else {
      // Pick route shape
      var stemDepth, catchX, settleX;
      var routeType;
      if (playType === 'DEEP') {
        stemDepth = 12; routeType = ['go','post','corner'][Math.floor(Math.random()*3)];
      } else if (playType === 'QUICK') {
        stemDepth = 3; routeType = Math.random()>0.5 ? 'hitch' : 'slant';
      } else if (playType === 'SCREEN') {
        stemDepth = 0; routeType = 'screen';
      } else {
        stemDepth = 7; routeType = ['slant','curl','out','dig'][Math.floor(Math.random()*4)];
      }

      var stemX = tp.x, stemY = stemDepth;
      switch (routeType) {
        case 'go': catchX = tp.x; break;
        case 'post': catchX = lerp(tp.x, 0.50, 0.5); break;
        case 'corner': catchX = tp.x + (tp.x < 0.50 ? -0.15 : 0.15); break;
        case 'slant': stemY = 3; catchX = lerp(tp.x, 0.50, 0.5); break;
        case 'curl': stemY = catchDepth + 3; catchX = tp.x; break;
        case 'out': catchX = tp.x + (tp.x < 0.50 ? -0.12 : 0.12); break;
        case 'dig': catchX = lerp(tp.x, 0.50, 0.5); break;
        case 'hitch': stemY = catchDepth + 1; catchX = tp.x; break;
        case 'screen': stemX = tp.x + (tp.x < 0.50 ? -0.08 : 0.08); stemY = -1; catchX = stemX; break;
        default: catchX = tp.x;
      }
      settleX = catchX + (Math.random() - 0.5) * 0.04;

      if (resultType === 'incomplete') {
        dotKF[targetIdx] = [kf(0,tp.x,tp.y), kf(dur*0.15,stemX,stemY), kf(throwT,catchX,catchDepth), kf(catchT,catchX,catchDepth), kf(dur,catchX,catchDepth)];
        var missX = catchX + 0.05;
        seq.ball = { startTime: throwT, endTime: catchT, p0xPct: qb.x, p0yYards: qb.y-2, p1xPct: (qb.x+missX)/2, p1yYards: (qb.y-2+catchDepth+2)/2, p2xPct: missX, p2yYards: catchDepth+2 };
        seq.events.push({ time: catchT, type: 'incomplete', xPct: missX, yYards: catchDepth+2 });
      } else if (resultType === 'interception') {
        var intDepth = 8;
        dotKF[targetIdx] = [kf(0,tp.x,tp.y), kf(dur*0.15,stemX,stemY), kf(catchT,catchX,intDepth), kf(dur,catchX,intDepth)];
        var cbP = cbIndices[0] >= 0 ? allDots[cbIndices[0]] : tp;
        seq.ball = { startTime: throwT, endTime: catchT, p0xPct: qb.x, p0yYards: qb.y-2, p1xPct: (qb.x+cbP.x)/2, p1yYards: (qb.y-2+intDepth)/2, p2xPct: cbP.x, p2yYards: intDepth };
        seq.events.push({ time: catchT, type: 'interception', xPct: cbP.x, yYards: intDepth });
      } else {
        dotKF[targetIdx] = [kf(0,tp.x,tp.y), kf(dur*0.10,tp.x,tp.y), kf(dur*0.18,stemX,stemY), kf(throwT,catchX,catchDepth-1), kf(catchT,catchX,catchDepth), kf(tackleT,settleX,settleDepth), kf(dur,settleX,settleDepth)];
        seq.ball = { startTime: throwT, endTime: catchT, p0xPct: qb.x, p0yYards: qb.y-2, p1xPct: (qb.x+catchX)/2, p1yYards: (qb.y-2+catchDepth)/2-2, p2xPct: catchX, p2yYards: catchDepth };
        seq.events.push({ time: catchT, type: 'catch', xPct: catchX, yYards: catchDepth });
        seq.events.push({ time: tackleT, type: isTD?'touchdown':'tackle', xPct: settleX, yYards: settleDepth });
      }
    }
  }

  // ===================================================================
  // DECOY WR
  // ===================================================================
  if (decoyIdx >= 0 && !isRun && resultType !== 'sack') {
    var dc = form.offense[decoyIdx];
    dotKF[decoyIdx] = [kf(0,dc.x,dc.y), kf(dur*0.10,dc.x,dc.y), kf(dur*0.25,dc.x,5), kf(dur*0.40,lerp(dc.x,0.50,0.3),7), kf(dur,lerp(dc.x,0.50,0.3),7)];
  }

  // ===================================================================
  // DL: rush / get blocked / sack
  // ===================================================================
  for (var di = numOff; di < allDots.length; di++) {
    if (allDots[di].pos !== 'DL') continue;
    var dl = allDots[di];
    if (resultType === 'sack' && di === numOff) {
      var sEvt = seq.events.find(function(e) { return e.type === 'sack'; });
      dotKF[di] = [kf(0,dl.x,dl.y), kf(dur*0.08,dl.x,dl.y), kf(dur*0.20,dl.x,dl.y-2), kf(dur*0.40,qb.x+0.03,qb.y-1), kf(dur*0.65,sEvt?sEvt.xPct:dl.x,sEvt?sEvt.yYards:dl.y), kf(dur,sEvt?sEvt.xPct:dl.x,sEvt?sEvt.yYards:dl.y)];
    } else if (isRun) {
      dotKF[di] = [kf(0,dl.x,dl.y), kf(dur*0.08,dl.x,dl.y), kf(dur*0.25,dl.x,dl.y+1), kf(dur,dl.x,dl.y+1)];
    } else {
      dotKF[di] = [kf(0,dl.x,dl.y), kf(dur*0.08,dl.x,dl.y), kf(dur*0.30,dl.x,dl.y-1.5), kf(dur,dl.x,dl.y-1.5)];
    }
  }

  // ===================================================================
  // CBs: shadow WR / zone / INT
  // ===================================================================
  var targetKF = targetIdx >= 0 ? dotKF[targetIdx] : null;
  for (var ci = 0; ci < cbIndices.length; ci++) {
    var cbDI = cbIndices[ci];
    var cb = allDots[cbDI];
    if (resultType === 'interception' && ci === 0) {
      var iEvt = seq.events.find(function(e) { return e.type === 'interception'; });
      dotKF[cbDI] = [kf(0,cb.x,cb.y), kf(dur*0.15,cb.x,cb.y+1), kf(catchT*0.8,iEvt?iEvt.xPct-0.02:cb.x,iEvt?iEvt.yYards-1:cb.y), kf(catchT,iEvt?iEvt.xPct:cb.x,iEvt?iEvt.yYards:cb.y), kf(catchT+dur*0.05,iEvt?iEvt.xPct:cb.x,iEvt?iEvt.yYards:cb.y), kf(dur*0.80,cb.x-0.05,-5), kf(dur,cb.x-0.05,-5)];
    } else if (targetKF && ci === 0) {
      var sep = Math.max(0.5, Math.min(3, yardsGained * 0.15));
      dotKF[cbDI] = targetKF.map(function(wk) {
        return kf(Math.min(wk.time + dur*0.03, dur), wk.xPct + (cb.x > wk.xPct ? sep*0.05 : -sep*0.05), wk.yYards - sep*0.3);
      });
    } else {
      dotKF[cbDI] = [kf(0,cb.x,cb.y), kf(dur*0.15,cb.x,cb.y+2), kf(dur*0.50,cb.x,cb.y+3), kf(dur*0.80,lerp(cb.x,0.50,0.15),cb.y+4), kf(dur,lerp(cb.x,0.50,0.15),cb.y+4)];
    }
  }

  // ===================================================================
  // LB: read then react
  // ===================================================================
  if (lbIdx >= 0) {
    var lb = allDots[lbIdx];
    if (isRun) {
      var tEvt = seq.events.find(function(e) { return e.type === 'tackle' || e.type === 'touchdown'; });
      dotKF[lbIdx] = [kf(0,lb.x,lb.y), kf(dur*0.12,lb.x,lb.y), kf(dur*0.20,lb.x,lb.y+0.5), kf(tackleT,tEvt?tEvt.xPct+0.02:0.50,tEvt?tEvt.yYards-1:settleDepth-1), kf(dur,tEvt?tEvt.xPct+0.02:0.50,tEvt?tEvt.yYards-1:settleDepth-1)];
    } else {
      dotKF[lbIdx] = [kf(0,lb.x,lb.y), kf(dur*0.12,lb.x,lb.y), kf(dur*0.30,lb.x,lb.y+2), kf(throwT,lb.x,lb.y+2), kf(dur*0.60,lerp(lb.x,0.50,0.2),lb.y+3), kf(dur,lerp(lb.x,0.50,0.2),lb.y+3)];
    }
  }

  // ===================================================================
  // Safety: deep read, late react
  // ===================================================================
  if (safetyIdx >= 0) {
    var sf = allDots[safetyIdx];
    var sfReact = yardsGained > 12 ? 0.5 : 0.15;
    dotKF[safetyIdx] = [kf(0,sf.x,sf.y), kf(dur*0.30,sf.x,sf.y), kf(dur*0.50,sf.x,sf.y+sfReact*2), kf(tackleT,lerp(sf.x,0.50,sfReact*0.3),sf.y+sfReact*8), kf(dur,lerp(sf.x,0.50,sfReact*0.3),sf.y+sfReact*8)];
  }

  // ===================================================================
  // METADATA
  // ===================================================================
  seq.dotColors = allDots.map(function(_, i) { return i < numOff ? 'off' : 'def'; });
  seq.dotNums = allDots.map(function(p) { return p.num; });
  seq.duration = dur;

  return seq;
}
