/**
 * TORCH — Play Animation Builder (Phase 1, v4)
 * Keyframes in PIXEL SPACE — computed once at play start.
 * Field scroll handled separately in the animator (only the background moves).
 */

function lerp(a, b, t) { return a + (b - a) * t; }
function kf(time, x, y) { return { time: time, x: x, y: y }; }

export function buildPlayAnimation(resultType, yardsGained, formation, playType, defScheme, fieldW, ypx, losYard, topYard) {
  var form = formation;
  var allDots = form.offense.concat(form.defense);
  var numOff = form.offense.length;

  // Convert (xPct, yardsFromLOS) to canvas pixels
  function px(xPct, yYards) {
    return { x: xPct * fieldW, y: (losYard + yYards - topYard) * ypx };
  }
  function pkf(time, xPct, yYards) {
    var p = px(xPct, yYards);
    return kf(time, p.x, p.y);
  }

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

  // ── INIT ──
  var dotKF = allDots.map(function(p) {
    var s = px(p.x, p.y);
    return [kf(0, s.x, s.y), kf(dur, s.x, s.y)];
  });

  var seq = { dotKeyframes: dotKF, ball: null, events: [], duration: dur, yardsGained: yardsGained };

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
  // OL
  // ===================================================================
  for (var oi = 0; oi < numOff; oi++) {
    if (form.offense[oi].pos !== 'OL') continue;
    var ol = form.offense[oi];
    var spr = ol.x < 0.50 ? -0.02 : ol.x > 0.50 ? 0.02 : 0;
    if (isRun) {
      dotKF[oi] = [pkf(0,ol.x,ol.y), pkf(dur*0.08,ol.x,ol.y), pkf(dur*0.20,ol.x+spr,ol.y+3), pkf(dur*0.40,ol.x+spr,ol.y+3), pkf(dur,ol.x+spr,ol.y+2.5)];
    } else {
      dotKF[oi] = [pkf(0,ol.x,ol.y), pkf(dur*0.05,ol.x,ol.y), pkf(dur*0.18,ol.x+spr,ol.y-1), pkf(dur,ol.x+spr,ol.y-1)];
    }
  }

  // ===================================================================
  // QB
  // ===================================================================
  if (qbIdx >= 0) {
    if (resultType === 'sack') {
      var sd = -(Math.abs(yardsGained));
      dotKF[qbIdx] = [pkf(0,qb.x,qb.y), pkf(dur*0.15,qb.x,qb.y-3), pkf(dur*0.35,qb.x,qb.y-2), pkf(dur*0.50,qb.x+0.06,qb.y-3), pkf(dur*0.65,qb.x+0.05,sd), pkf(dur,qb.x+0.05,sd)];
      var sackPx = px(qb.x+0.05, sd);
      seq.events.push({ time: dur*0.65, type: 'sack', x: sackPx.x, y: sackPx.y });
    } else if (isRun && rbIdx >= 0) {
      var rb = form.offense[rbIdx];
      var mx = (qb.x+rb.x)/2, my = (qb.y+rb.y)/2+1;
      dotKF[qbIdx] = [pkf(0,qb.x,qb.y), pkf(throwT,mx,my), pkf(throwT+dur*0.08,qb.x+0.08,qb.y-2), pkf(dur,qb.x+0.08,qb.y-2)];
      var meshPx = px(mx, my);
      seq.events.push({ time: throwT, type: 'handoff', x: meshPx.x, y: meshPx.y });
    } else {
      dotKF[qbIdx] = [pkf(0,qb.x,qb.y), pkf(dur*0.12,qb.x,qb.y-3), pkf(dur*0.18,qb.x,qb.y-2), pkf(throwT,qb.x,qb.y-2), pkf(dur,qb.x,qb.y-2)];
      var throwPx = px(qb.x, qb.y-2);
      seq.events.push({ time: throwT, type: 'throw', x: throwPx.x, y: throwPx.y });
    }
  }

  // ===================================================================
  // PRIMARY TARGET
  // ===================================================================
  var targetIdx = isRun ? rbIdx : wrIdx;
  if (targetIdx >= 0 && resultType !== 'sack') {
    var tp = form.offense[targetIdx];

    if (isRun) {
      var mx2 = (tp.x+qb.x)/2, my2 = (tp.y+qb.y)/2+1;
      var holeX = Math.random() > 0.5 ? 0.50 : (tp.x < 0.50 ? 0.20 : 0.80);
      dotKF[targetIdx] = [pkf(0,tp.x,tp.y), pkf(throwT,mx2,my2), pkf(catchT*0.5,holeX,1), pkf(catchT,holeX,catchDepth), pkf(tackleT,holeX+0.02,settleDepth), pkf(dur,holeX+0.02,settleDepth)];
      var tacklePx = px(holeX+0.02, settleDepth);
      seq.events.push({ time: tackleT, type: isTD?'touchdown':'tackle', x: tacklePx.x, y: tacklePx.y });
    } else {
      // Route selection
      var stemDepth, routeName;
      if (playType === 'DEEP') { stemDepth = 12; routeName = ['go','post','corner'][Math.floor(Math.random()*3)]; }
      else if (playType === 'QUICK') { stemDepth = 3; routeName = Math.random()>0.5?'hitch':'slant'; }
      else if (playType === 'SCREEN') { stemDepth = 0; routeName = 'screen'; }
      else { stemDepth = 7; routeName = ['slant','curl','out','dig'][Math.floor(Math.random()*4)]; }

      var stemX = tp.x, catchX, settleX;
      var stemY = stemDepth;

      switch (routeName) {
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
      settleX = catchX + (Math.random()-0.5) * 0.04;

      if (resultType === 'incomplete') {
        dotKF[targetIdx] = [pkf(0,tp.x,tp.y), pkf(dur*0.15,stemX,stemY), pkf(throwT,catchX,catchDepth), pkf(catchT,catchX,catchDepth), pkf(dur,catchX,catchDepth)];
        var missP = px(catchX+0.05, catchDepth+2);
        var throwP = px(qb.x, qb.y-2);
        seq.ball = { startTime: throwT, endTime: catchT, p0: throwP, p1: {x:(throwP.x+missP.x)/2,y:(throwP.y+missP.y)/2-15}, p2: missP };
        seq.events.push({ time: catchT, type: 'incomplete', x: missP.x, y: missP.y });
      } else if (resultType === 'interception') {
        var intDepth = 8;
        dotKF[targetIdx] = [pkf(0,tp.x,tp.y), pkf(dur*0.15,stemX,stemY), pkf(catchT,catchX,intDepth), pkf(dur,catchX,intDepth)];
        var cbP = cbIndices[0] >= 0 ? allDots[cbIndices[0]] : tp;
        var intP = px(cbP.x, intDepth);
        var throwP2 = px(qb.x, qb.y-2);
        seq.ball = { startTime: throwT, endTime: catchT, p0: throwP2, p1: {x:(throwP2.x+intP.x)/2,y:(throwP2.y+intP.y)/2}, p2: intP };
        seq.events.push({ time: catchT, type: 'interception', x: intP.x, y: intP.y });
      } else {
        dotKF[targetIdx] = [pkf(0,tp.x,tp.y), pkf(dur*0.10,tp.x,tp.y), pkf(dur*0.18,stemX,stemY), pkf(throwT,catchX,catchDepth-1), pkf(catchT,catchX,catchDepth), pkf(tackleT,settleX,settleDepth), pkf(dur,settleX,settleDepth)];
        var catchPx = px(catchX, catchDepth);
        var throwP3 = px(qb.x, qb.y-2);
        seq.ball = { startTime: throwT, endTime: catchT, p0: throwP3, p1: {x:(throwP3.x+catchPx.x)/2,y:(throwP3.y+catchPx.y)/2-20}, p2: catchPx };
        seq.events.push({ time: catchT, type: 'catch', x: catchPx.x, y: catchPx.y });
        var tacklePx2 = px(settleX, settleDepth);
        seq.events.push({ time: tackleT, type: isTD?'touchdown':'tackle', x: tacklePx2.x, y: tacklePx2.y });
      }
    }
  }

  // ===================================================================
  // DECOY WR
  // ===================================================================
  if (decoyIdx >= 0 && !isRun && resultType !== 'sack') {
    var dc = form.offense[decoyIdx];
    dotKF[decoyIdx] = [pkf(0,dc.x,dc.y), pkf(dur*0.10,dc.x,dc.y), pkf(dur*0.25,dc.x,5), pkf(dur*0.40,lerp(dc.x,0.50,0.3),7), pkf(dur,lerp(dc.x,0.50,0.3),7)];
  }

  // ===================================================================
  // DL
  // ===================================================================
  for (var di = numOff; di < allDots.length; di++) {
    if (allDots[di].pos !== 'DL') continue;
    var dl = allDots[di];
    if (resultType === 'sack' && di === numOff) {
      var sEvt = seq.events.find(function(e) { return e.type === 'sack'; });
      dotKF[di] = [pkf(0,dl.x,dl.y), pkf(dur*0.08,dl.x,dl.y), pkf(dur*0.20,dl.x,dl.y-2), pkf(dur*0.40,qb.x+0.03,qb.y-1), pkf(dur*0.65,sEvt?sEvt.x/fieldW:dl.x,sEvt?(topYard+sEvt.y/ypx-losYard):dl.y), pkf(dur,sEvt?sEvt.x/fieldW:dl.x,sEvt?(topYard+sEvt.y/ypx-losYard):dl.y)];
    } else if (isRun) {
      dotKF[di] = [pkf(0,dl.x,dl.y), pkf(dur*0.08,dl.x,dl.y), pkf(dur*0.25,dl.x,dl.y+1), pkf(dur,dl.x,dl.y+1)];
    } else {
      dotKF[di] = [pkf(0,dl.x,dl.y), pkf(dur*0.08,dl.x,dl.y), pkf(dur*0.30,dl.x,dl.y-1.5), pkf(dur,dl.x,dl.y-1.5)];
    }
  }

  // ===================================================================
  // CBs
  // ===================================================================
  var targetKF = targetIdx >= 0 ? dotKF[targetIdx] : null;
  for (var ci = 0; ci < cbIndices.length; ci++) {
    var cbDI = cbIndices[ci];
    var cb = allDots[cbDI];
    if (resultType === 'interception' && ci === 0) {
      var iEvt = seq.events.find(function(e) { return e.type === 'interception'; });
      var retPx = px(cb.x-0.05, -5);
      dotKF[cbDI] = [pkf(0,cb.x,cb.y), pkf(dur*0.15,cb.x,cb.y+1), kf(catchT*0.8,iEvt?iEvt.x-5:px(cb.x,cb.y).x,iEvt?iEvt.y-5:px(cb.x,cb.y).y), kf(catchT,iEvt?iEvt.x:px(cb.x,cb.y).x,iEvt?iEvt.y:px(cb.x,cb.y).y), kf(catchT+dur*0.05,iEvt?iEvt.x:px(cb.x,cb.y).x,iEvt?iEvt.y:px(cb.x,cb.y).y), kf(dur*0.80,retPx.x,retPx.y), kf(dur,retPx.x,retPx.y)];
    } else if (targetKF && ci === 0) {
      // Shadow primary receiver with lag and separation
      var sep = Math.max(3, Math.min(15, yardsGained * 0.8));
      dotKF[cbDI] = targetKF.map(function(wk) {
        return kf(Math.min(wk.time + dur*0.03, dur), wk.x + (cb.x > 0.50 ? sep : -sep), wk.y - sep * 0.5);
      });
    } else {
      dotKF[cbDI] = [pkf(0,cb.x,cb.y), pkf(dur*0.15,cb.x,cb.y+2), pkf(dur*0.50,cb.x,cb.y+3), pkf(dur*0.80,lerp(cb.x,0.50,0.15),cb.y+4), pkf(dur,lerp(cb.x,0.50,0.15),cb.y+4)];
    }
  }

  // ===================================================================
  // LB
  // ===================================================================
  if (lbIdx >= 0) {
    var lb = allDots[lbIdx];
    if (isRun) {
      var tEvt = seq.events.find(function(e) { return e.type === 'tackle' || e.type === 'touchdown'; });
      dotKF[lbIdx] = [pkf(0,lb.x,lb.y), pkf(dur*0.12,lb.x,lb.y), pkf(dur*0.20,lb.x,lb.y+0.5), kf(tackleT,tEvt?tEvt.x+5:px(0.50,settleDepth-1).x,tEvt?tEvt.y-10:px(0.50,settleDepth-1).y), kf(dur,tEvt?tEvt.x+5:px(0.50,settleDepth-1).x,tEvt?tEvt.y-10:px(0.50,settleDepth-1).y)];
    } else {
      dotKF[lbIdx] = [pkf(0,lb.x,lb.y), pkf(dur*0.12,lb.x,lb.y), pkf(dur*0.30,lb.x,lb.y+2), pkf(throwT,lb.x,lb.y+2), pkf(dur*0.60,lerp(lb.x,0.50,0.2),lb.y+3), pkf(dur,lerp(lb.x,0.50,0.2),lb.y+3)];
    }
  }

  // ===================================================================
  // Safety
  // ===================================================================
  if (safetyIdx >= 0) {
    var sf = allDots[safetyIdx];
    var sfR = yardsGained > 12 ? 0.5 : 0.15;
    dotKF[safetyIdx] = [pkf(0,sf.x,sf.y), pkf(dur*0.30,sf.x,sf.y), pkf(dur*0.50,sf.x,sf.y+sfR*2), pkf(tackleT,lerp(sf.x,0.50,sfR*0.3),sf.y+sfR*8), pkf(dur,lerp(sf.x,0.50,sfR*0.3),sf.y+sfR*8)];
  }

  // ===================================================================
  // METADATA
  // ===================================================================
  seq.dotColors = allDots.map(function(_, i) { return i < numOff ? 'off' : 'def'; });
  seq.dotNums = allDots.map(function(p) { return p.num; });

  return seq;
}
