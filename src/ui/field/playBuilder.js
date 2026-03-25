/**
 * TORCH — Play Animation Builder (Phase 1)
 * Composable animation system: route templates + defense modes + role assignment.
 * Replaces the monolithic buildPostSnapSequence with a pipeline of independent composers.
 *
 * 12 route templates × 6 defense modes × 7 formations = 504 unique-looking animations.
 */

// ── EASING ──
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }
function easeOutBack(t) { var c = 1.4; return 1 + (c+1)*Math.pow(t-1,3) + c*Math.pow(t-1,2); }
function lerp(a, b, t) { return a + (b - a) * t; }
function kf(time, x, y) { return { time: time, x: x, y: y }; }

// ── ROUTE TEMPLATES ──
// Each returns keyframes for the primary receiver given params:
//   startX, startY (canvas px), catchY (canvas px), settleY (canvas px),
//   fieldW (canvas width), ypx (pixels per yard), duration (ms)

var ROUTE_TEMPLATES = {
  // Deep routes
  go: function(p) {
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+6*p.ypx), kf(p.throwT,p.sx,p.catchY), kf(p.catchT,p.sx,p.catchY), kf(p.tackleT,p.sx,p.settleY), kf(p.dur,p.sx,p.settleY)];
  },
  post: function(p) {
    var breakX = lerp(p.sx, 0.50*p.fw, 0.5);
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+5*p.ypx), kf(p.throwT-100,breakX,p.catchY-3*p.ypx), kf(p.catchT,breakX,p.catchY), kf(p.tackleT,breakX,p.settleY), kf(p.dur,breakX,p.settleY)];
  },
  corner: function(p) {
    var side = p.sx < 0.5*p.fw ? -1 : 1;
    var breakX = p.sx + side * 0.15 * p.fw;
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+5*p.ypx), kf(p.throwT-100,breakX,p.catchY-2*p.ypx), kf(p.catchT,breakX,p.catchY), kf(p.tackleT,breakX,p.settleY), kf(p.dur,breakX,p.settleY)];
  },
  // Short/medium routes
  slant: function(p) {
    var breakX = lerp(p.sx, 0.50*p.fw, 0.6);
    return [kf(0,p.sx,p.sy), kf(150,p.sx,p.sy+2*p.ypx), kf(p.throwT,breakX,p.catchY), kf(p.catchT,breakX,p.catchY), kf(p.tackleT,breakX,p.settleY), kf(p.dur,breakX,p.settleY)];
  },
  curl: function(p) {
    var deepY = p.catchY + 2*p.ypx;
    return [kf(0,p.sx,p.sy), kf(250,p.sx,deepY), kf(p.throwT,p.sx,p.catchY-1*p.ypx), kf(p.catchT,p.sx,p.catchY), kf(p.tackleT,p.sx,p.settleY), kf(p.dur,p.sx,p.settleY)];
  },
  out: function(p) {
    var side = p.sx < 0.50*p.fw ? -0.12 : 0.12;
    var breakX = p.sx + side * p.fw;
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+4*p.ypx), kf(p.throwT,breakX,p.catchY), kf(p.catchT,breakX,p.catchY), kf(p.tackleT,breakX,p.settleY), kf(p.dur,breakX,p.settleY)];
  },
  dig: function(p) {
    var breakX = lerp(p.sx, 0.50*p.fw, 0.5);
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+4*p.ypx), kf(p.throwT,breakX,p.catchY), kf(p.catchT,breakX,p.catchY), kf(p.tackleT,breakX,p.settleY), kf(p.dur,breakX,p.settleY)];
  },
  // Quick routes
  hitch: function(p) {
    return [kf(0,p.sx,p.sy), kf(150,p.sx,p.sy+3*p.ypx), kf(250,p.sx,p.sy+2*p.ypx), kf(p.catchT,p.sx,p.catchY), kf(p.tackleT,p.sx,p.settleY), kf(p.dur,p.sx,p.settleY)];
  },
  flat: function(p) {
    var side = p.sx < 0.50*p.fw ? -0.15 : 0.15;
    var flatX = p.sx + side * p.fw;
    return [kf(0,p.sx,p.sy), kf(200,flatX,p.sy+1*p.ypx), kf(p.catchT,flatX,p.catchY), kf(p.tackleT,flatX,p.settleY), kf(p.dur,flatX,p.settleY)];
  },
  // Screen (catch behind/at LOS, then burst forward)
  screen: function(p) {
    var side = p.sx < 0.50*p.fw ? -0.08 : 0.08;
    var screenX = p.sx + side * p.fw;
    var losY = p.sy; // WR starts near LOS
    return [kf(0,p.sx,p.sy), kf(150,screenX,losY-1*p.ypx), kf(p.catchT-200,screenX,losY), kf(p.catchT,screenX,losY+1*p.ypx), kf(p.tackleT,screenX,p.settleY), kf(p.dur,screenX,p.settleY)];
  },
  // Run routes
  rb_inside: function(p) {
    var gapX = 0.50 * p.fw;
    return [kf(0,p.sx,p.sy), kf(150,gapX,p.sy+1*p.ypx), kf(300,gapX,p.sy+3*p.ypx), kf(500,gapX,p.catchY), kf(p.tackleT,gapX,p.settleY), kf(p.dur,gapX,p.settleY)];
  },
  rb_outside: function(p) {
    var side = p.sx < 0.50*p.fw ? -0.15 : 0.15;
    var edgeX = p.sx + side * p.fw;
    return [kf(0,p.sx,p.sy), kf(150,p.sx,p.sy), kf(300,edgeX,p.sy+1*p.ypx), kf(500,edgeX,p.catchY), kf(p.tackleT,edgeX,p.settleY), kf(p.dur,edgeX,p.settleY)];
  },
};

// Play type → route pool (pick randomly from these)
var PLAY_TYPE_ROUTES = {
  DEEP:   ['go', 'post', 'corner'],
  SHORT:  ['slant', 'curl', 'dig', 'out'],
  QUICK:  ['hitch', 'flat', 'slant'],
  SCREEN: ['screen', 'flat'],
  RUN:    ['rb_inside', 'rb_outside'],
};

// ── DEFENSE RESPONSE MODES ──
// Each returns keyframes for a CB given the WR's keyframes and params

var DEF_MODES = {
  // Man coverage: mirror WR with delay and separation
  man_trail: function(wrKF, sep, lagMs) {
    var side = wrKF[0].x < wrKF[wrKF.length-1].x ? 1 : -1;
    return wrKF.map(function(k) {
      return kf(k.time + lagMs, k.x + sep * side * 0.3, k.y - sep * 0.7);
    });
  },
  // Man press: start tight, jam at stem, then trail
  man_press: function(wrKF, sep, lagMs) {
    var kfs = DEF_MODES.man_trail(wrKF, sep * 0.5, lagMs * 0.6);
    // Press: first keyframe close to WR
    if (kfs.length > 0) { kfs[0].x = wrKF[0].x + 3; kfs[0].y = wrKF[0].y + 2; }
    return kfs;
  },
  // Zone: go to zone spot, read, break on ball
  zone_spot: function(wrKF, sep, lagMs, zoneX, zoneY, throwT) {
    var start = wrKF[0];
    return [kf(0,start.x,start.y), kf(200,zoneX,start.y+2), kf(throwT,zoneX,zoneY), kf(throwT+lagMs,wrKF[wrKF.length-2].x+sep*0.5,wrKF[wrKF.length-2].y), kf(wrKF[wrKF.length-1].time+lagMs,wrKF[wrKF.length-1].x+sep*0.3,wrKF[wrKF.length-1].y)];
  },
  // Blitz: rush toward QB
  blitz: function(wrKF, sep, lagMs, qbX, qbY) {
    var start = wrKF[0];
    return [kf(0,start.x,start.y), kf(50,start.x,start.y-3), kf(400,lerp(start.x,qbX,0.8),lerp(start.y,qbY,0.8)), kf(800,qbX,qbY), kf(1500,qbX,qbY)];
  },
  // Spy: mirror QB lateral movement
  spy: function(wrKF, sep, lagMs, qbKF) {
    return qbKF.map(function(k) { return kf(k.time + 100, k.x, wrKF[0].y); });
  },
  // Zone robber: sit, then jump route
  zone_robber: function(wrKF, sep, lagMs, zoneX, zoneY, throwT) {
    var start = wrKF[0];
    var target = wrKF[Math.min(3, wrKF.length-1)];
    return [kf(0,start.x,start.y), kf(300,zoneX,zoneY), kf(throwT,zoneX,zoneY), kf(throwT+100,target.x,target.y), kf(wrKF[wrKF.length-1].time,target.x,target.y)];
  },
};

// Defense scheme → mode mapping
var SCHEME_TO_MODE = {
  ZONE: 'zone_spot',
  BLITZ: 'blitz',
  PRESSURE: 'man_press',
  HYBRID: 'zone_robber',
};

// ── ROLE ASSIGNMENT ──
function assignRoles(formation) {
  var off = formation.offense;
  var def = formation.defense;
  var roles = {};

  roles.qbIdx = -1; roles.wrIdx = -1; roles.rbIdx = -1; roles.decoyIdx = -1;
  roles.cbIdx = -1; roles.lbIdx = -1; roles.safetyIdx = -1;

  for (var i = 0; i < off.length; i++) {
    if (off[i].pos === 'QB' && roles.qbIdx === -1) roles.qbIdx = i;
    else if (['WR','SLOT','TE'].indexOf(off[i].pos) >= 0 && roles.wrIdx === -1) roles.wrIdx = i;
    else if (['WR','SLOT','TE'].indexOf(off[i].pos) >= 0 && roles.decoyIdx === -1) roles.decoyIdx = i;
    else if (['RB','FB'].indexOf(off[i].pos) >= 0 && roles.rbIdx === -1) roles.rbIdx = i;
  }

  var defOff = off.length; // defense indices start after offense
  for (var j = 0; j < def.length; j++) {
    if (def[j].pos === 'CB' && roles.cbIdx === -1) roles.cbIdx = defOff + j;
    else if (def[j].pos === 'LB' && roles.lbIdx === -1) roles.lbIdx = defOff + j;
    else if (def[j].pos === 'S' && roles.safetyIdx === -1) roles.safetyIdx = defOff + j;
  }

  return roles;
}

// ── MAIN BUILDER ──

/**
 * Build a complete play animation from game state.
 * @param {string} resultType - 'complete','run','sack','interception','incomplete','touchdown'
 * @param {number} yardsGained - yards gained/lost
 * @param {object} formation - { offense: [...], defense: [...] }
 * @param {string} playType - 'DEEP','SHORT','QUICK','SCREEN','RUN'
 * @param {string} defScheme - 'ZONE','BLITZ','PRESSURE','HYBRID'
 * @param {number} fieldW - canvas width
 * @param {number} ypx - pixels per yard
 * @param {number} losYard - line of scrimmage yard
 * @param {number} topYard - top visible yard
 * @returns {object} { dotKeyframes, dotColors, dotNums, ball, events }
 */
export function buildPlayAnimation(resultType, yardsGained, formation, playType, defScheme, fieldW, ypx, losYard, topYard) {
  var form = formation;
  var allDots = form.offense.concat(form.defense);
  var numOff = form.offense.length;

  // Convert formation position to canvas coords
  function toC(p) { return { x: p.x * fieldW, y: (losYard + p.y - topYard) * ypx }; }

  // Start positions
  var starts = allDots.map(toC);

  // Default: everyone stays put
  var dotKF = allDots.map(function(_, i) {
    return [kf(0, starts[i].x, starts[i].y), kf(2000, starts[i].x, starts[i].y)];
  });

  var roles = assignRoles(form);
  var seq = { dotKeyframes: dotKF, ball: null, events: [] };

  // Timing
  var isTD = resultType === 'touchdown';
  var isRun = resultType === 'run' || (playType === 'RUN' && resultType !== 'sack' && resultType !== 'interception' && resultType !== 'incomplete');
  var throwT = isRun ? 150 : 400;
  var catchT = isRun ? 400 : 700;
  var tackleT = isTD ? 1000 : (isRun ? 1000 : 1300);
  var dur = isTD || resultType === 'interception' ? 1800 : isRun ? 1400 : resultType === 'sack' ? 1200 : 1500;

  // Catch/settle positions (downfield = +Y)
  var catchY = (losYard + yardsGained * 0.6 - topYard) * ypx;
  var settleY = (losYard + yardsGained - topYard) * ypx;

  // Pick a route randomly from the play type pool
  var routePool = PLAY_TYPE_ROUTES[playType] || PLAY_TYPE_ROUTES['SHORT'];
  var routeKey = routePool[Math.floor(Math.random() * routePool.length)];
  var routeTemplate = ROUTE_TEMPLATES[routeKey] || ROUTE_TEMPLATES['slant'];

  // ── COMPOSE OL ──
  for (var oi = 0; oi < numOff; oi++) {
    if (form.offense[oi].pos === 'OL') {
      var os = starts[oi];
      if (isRun) {
        // Run block: fire forward, spread gaps
        var spread = (form.offense[oi].x - 0.50) * 0.03 * fieldW;
        dotKF[oi] = [kf(0,os.x,os.y), kf(200,os.x+spread,os.y+18), kf(500,os.x+spread,os.y+22), kf(dur,os.x+spread,os.y+18)];
      } else {
        // Pass block: slide back, form pocket
        dotKF[oi] = [kf(0,os.x,os.y), kf(250,os.x,os.y-10), kf(dur,os.x,os.y-8)];
      }
    }
  }

  // ── COMPOSE QB ──
  if (roles.qbIdx >= 0) {
    var qs = starts[roles.qbIdx];
    if (resultType === 'sack') {
      var sackY = (losYard - Math.abs(yardsGained) - topYard) * ypx;
      dotKF[roles.qbIdx] = [kf(0,qs.x,qs.y), kf(200,qs.x,qs.y-16), kf(500,qs.x+10,qs.y-22), kf(800,qs.x+8,sackY), kf(dur,qs.x+8,sackY)];
      seq.events.push({ time: 800, type: 'sack', x: qs.x+8, y: sackY });
    } else if (isRun && roles.rbIdx >= 0) {
      // Handoff: converge with RB then drift away
      var rbs = starts[roles.rbIdx];
      dotKF[roles.qbIdx] = [kf(0,qs.x,qs.y), kf(150,lerp(qs.x,rbs.x,0.3),qs.y+3), kf(300,qs.x+12,qs.y-8), kf(dur,qs.x+15,qs.y-12)];
      seq.events.push({ time: 150, type: 'handoff', x: lerp(qs.x,rbs.x,0.5), y: qs.y+3 });
    } else {
      // Pass: dropback, set, throw
      dotKF[roles.qbIdx] = [kf(0,qs.x,qs.y), kf(200,qs.x,qs.y-18), kf(throwT,qs.x,qs.y-12), kf(dur,qs.x,qs.y-12)];
      seq.events.push({ time: throwT, type: 'throw', x: qs.x, y: qs.y-12 });
    }
  }

  // ── COMPOSE PRIMARY RECEIVER / BALL CARRIER ──
  var receiverIdx = isRun ? roles.rbIdx : roles.wrIdx;
  if (receiverIdx >= 0 && resultType !== 'sack') {
    var rs = starts[receiverIdx];
    var routeParams = {
      sx: rs.x, sy: rs.y, catchY: catchY, settleY: settleY,
      fw: fieldW, ypx: ypx, throwT: throwT, catchT: catchT, tackleT: tackleT, dur: dur
    };

    if (resultType === 'incomplete') {
      // Route runs but ball misses
      var missY = (losYard + 10 - topYard) * ypx;
      routeParams.catchY = missY;
      routeParams.settleY = missY;
      var routeKF = routeTemplate(routeParams);
      dotKF[receiverIdx] = routeKF;
      // Ball overshoots
      var qbPos = roles.qbIdx >= 0 ? starts[roles.qbIdx] : rs;
      seq.ball = { startTime: throwT, endTime: catchT,
        p0: { x: qbPos.x, y: qbPos.y - 12 },
        p1: { x: (qbPos.x + rs.x) / 2, y: (qbPos.y - 12 + missY) / 2 - 15 },
        p2: { x: rs.x + 10, y: missY + 10 } };
      seq.events.push({ time: catchT + 50, type: 'incomplete', x: rs.x + 10, y: missY + 10 });

    } else if (resultType === 'interception') {
      // WR runs route, CB catches instead
      var intY = (losYard + 8 - topYard) * ypx;
      routeParams.catchY = intY; routeParams.settleY = intY;
      dotKF[receiverIdx] = routeTemplate(routeParams);
      // CB jumps the route (handled below in defense section)
      var qbPos2 = roles.qbIdx >= 0 ? starts[roles.qbIdx] : rs;
      seq.ball = { startTime: throwT, endTime: catchT,
        p0: { x: qbPos2.x, y: qbPos2.y - 12 },
        p1: { x: (qbPos2.x + rs.x) / 2, y: (qbPos2.y - 12 + intY) / 2 },
        p2: { x: roles.cbIdx >= 0 ? starts[roles.cbIdx].x : rs.x, y: intY } };
      seq.events.push({ time: catchT, type: 'interception', x: seq.ball.p2.x, y: intY });

    } else {
      // Normal route / run
      var routeKF2 = routeTemplate(routeParams);
      dotKF[receiverIdx] = routeKF2;

      // Ball flight for passes
      if (!isRun) {
        var qbPos3 = roles.qbIdx >= 0 ? starts[roles.qbIdx] : rs;
        var lastRouteKF = routeKF2[Math.min(3, routeKF2.length - 1)];
        seq.ball = { startTime: throwT, endTime: catchT,
          p0: { x: qbPos3.x, y: qbPos3.y - 12 },
          p1: { x: (qbPos3.x + lastRouteKF.x) / 2, y: (qbPos3.y - 12 + catchY) / 2 - 15 },
          p2: { x: lastRouteKF.x, y: catchY } };
        seq.events.push({ time: catchT, type: 'catch', x: lastRouteKF.x, y: catchY });
      }

      seq.events.push({ time: tackleT, type: isTD ? 'touchdown' : 'tackle',
        x: routeKF2[routeKF2.length - 2].x, y: settleY });
    }
  }

  // ── COMPOSE DECOY RECEIVER ──
  if (roles.decoyIdx >= 0 && !isRun && resultType !== 'sack') {
    var ds = starts[roles.decoyIdx];
    // Run a different route as a decoy (shorter, no catch)
    var decoyRoute = ROUTE_TEMPLATES['curl'] || ROUTE_TEMPLATES['hitch'];
    var decoyY = (losYard + 6 - topYard) * ypx;
    dotKF[roles.decoyIdx] = decoyRoute({ sx: ds.x, sy: ds.y, catchY: decoyY, settleY: decoyY, fw: fieldW, ypx: ypx, throwT: throwT, catchT: dur, tackleT: dur, dur: dur });
  }

  // ── COMPOSE DL ──
  for (var di = numOff; di < allDots.length; di++) {
    if (allDots[di].pos === 'DL') {
      var dls = starts[di];
      if (resultType === 'sack') {
        // One DL gets through (the first one)
        if (di === numOff) {
          var qbTarget = roles.qbIdx >= 0 ? starts[roles.qbIdx] : { x: 0.50 * fieldW, y: (losYard - 5 - topYard) * ypx };
          var sackPt = seq.events.find(function(e) { return e.type === 'sack'; });
          dotKF[di] = [kf(0,dls.x,dls.y), kf(150,dls.x,dls.y-6), kf(350,dls.x+4,dls.y-16), kf(600,qbTarget.x+5,qbTarget.y-10), kf(800,sackPt?sackPt.x:dls.x,sackPt?sackPt.y:dls.y), kf(dur,sackPt?sackPt.x:dls.x,sackPt?sackPt.y:dls.y)];
        } else {
          // Other DL rush but get blocked
          dotKF[di] = [kf(0,dls.x,dls.y), kf(300,dls.x,dls.y-8), kf(dur,dls.x,dls.y-4)];
        }
      } else {
        // Normal rush toward QB area
        dotKF[di] = [kf(0,dls.x,dls.y), kf(300,dls.x,dls.y-10), kf(dur,dls.x,dls.y-6)];
      }
    }
  }

  // ── COMPOSE COVERAGE (CB, LB, S) ──
  var defMode = SCHEME_TO_MODE[defScheme] || 'man_trail';
  var receiverKF = receiverIdx >= 0 ? dotKF[receiverIdx] : null;

  for (var ci = numOff; ci < allDots.length; ci++) {
    if (allDots[ci].pos === 'DL') continue; // already handled
    var cbs = starts[ci];

    if (allDots[ci].pos === 'CB' && receiverKF) {
      // Separation based on yards (good play = more separation)
      var separation = Math.max(5, Math.min(25, yardsGained * 1.2));

      if (resultType === 'interception' && ci === roles.cbIdx) {
        // CB jumps route and catches
        var intPt = seq.events.find(function(e) { return e.type === 'interception'; });
        dotKF[ci] = [kf(0,cbs.x,cbs.y), kf(300,cbs.x,cbs.y+8), kf(600,intPt?intPt.x-5:cbs.x,intPt?(intPt.y-5):cbs.y), kf(catchT,intPt?intPt.x:cbs.x,intPt?intPt.y:cbs.y), kf(900,intPt?intPt.x:cbs.x,intPt?intPt.y:cbs.y), kf(1400,intPt?intPt.x-10:cbs.x,(intPt?intPt.y:cbs.y)-25), kf(dur,(intPt?intPt.x-10:cbs.x),(intPt?intPt.y:cbs.y)-25)];
      } else if (defMode === 'blitz') {
        var qbTgt = roles.qbIdx >= 0 ? starts[roles.qbIdx] : cbs;
        dotKF[ci] = DEF_MODES.blitz(receiverKF, separation, 100, qbTgt.x, qbTgt.y - 12);
      } else if (defMode === 'man_press') {
        dotKF[ci] = DEF_MODES.man_press(receiverKF, separation, 100);
      } else if (defMode === 'zone_spot' || defMode === 'zone_robber') {
        var zoneX = cbs.x;
        var zoneY = cbs.y + 3 * ypx;
        dotKF[ci] = DEF_MODES[defMode](receiverKF, separation, 120, zoneX, zoneY, throwT);
      } else {
        dotKF[ci] = DEF_MODES.man_trail(receiverKF, separation, 120);
      }
    } else if (allDots[ci].pos === 'LB') {
      // LB: 200ms read pause, then react
      var lbTarget = isRun ? settleY : catchY;
      dotKF[ci] = [kf(0,cbs.x,cbs.y), kf(200,cbs.x,cbs.y), kf(500,cbs.x,cbs.y+4), kf(tackleT,lerp(cbs.x,0.50*fieldW,0.3),lbTarget-8), kf(dur,lerp(cbs.x,0.50*fieldW,0.3),lbTarget-8)];
    } else if (allDots[ci].pos === 'S') {
      // Safety: deep, barely moves on short plays, breaks hard on deep
      var safetyMove = yardsGained > 12 ? 0.6 : 0.2;
      dotKF[ci] = [kf(0,cbs.x,cbs.y), kf(400,cbs.x,cbs.y+safetyMove*3*ypx), kf(tackleT,lerp(cbs.x,0.50*fieldW,safetyMove*0.3),lerp(cbs.y,settleY,safetyMove*0.5)), kf(dur,lerp(cbs.x,0.50*fieldW,safetyMove*0.3),lerp(cbs.y,settleY,safetyMove*0.5))];
    }
  }

  // Metadata
  seq.dotColors = allDots.map(function(_, i) { return i < numOff ? 'off' : 'def'; });
  seq.dotNums = allDots.map(function(p) { return p.num; });
  seq.duration = dur;

  return seq;
}
