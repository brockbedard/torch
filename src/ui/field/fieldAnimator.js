/**
 * TORCH — Field Animator
 * Wraps fieldRenderer with smooth transitions, post-snap animations,
 * screen shake, particle bursts, ball flight, and speed trails.
 * NFL Blitz-inspired visual language on Canvas 2D.
 */

import { createFieldRenderer } from './fieldRenderer.js';
import { buildPlayAnimation } from './playBuilder.js';

// ── EASING FUNCTIONS ──
function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }
function easeOutBack(t) { var c = 1.7; return 1 + (c+1)*Math.pow(t-1,3) + c*Math.pow(t-1,2); }
function easeOutCubic(t) { return 1 - Math.pow(1-t, 3); }
function lerp(a, b, t) { return a + (b-a) * t; }

// ── SCREEN SHAKE ──
function createScreenShake() {
  var trauma = 0, decay = 0;
  return {
    add: function(t, d) { trauma = Math.min(1, trauma + t); decay = d; },
    update: function(dt) { trauma = Math.max(0, trauma - decay * dt); },
    get: function() {
      if (trauma <= 0) return { dx: 0, dy: 0 };
      var s = trauma * trauma;
      return { dx: (Math.random()*2-1) * s * 6, dy: (Math.random()*2-1) * s * 6 };
    },
    active: function() { return trauma > 0.01; }
  };
}

// ── PARTICLE SYSTEM ──
function createParticleSystem() {
  var particles = [];

  function spawn(x, y, count, colors, opts) {
    opts = opts || {};
    var speed = opts.speed || 120;
    var gravity = opts.gravity || 0;
    var decayRate = opts.decay || 2.5;
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + (Math.random()-0.5) * 0.5;
      var spd = speed * (0.5 + Math.random());
      var c = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd + (opts.vyBias || 0),
        gravity: gravity,
        life: 1.0,
        decay: decayRate + Math.random() * 1.5,
        radius: 2 + Math.random() * 3,
        r: c[0], g: c[1], b: c[2]
      });
    }
  }

  function update(dt) {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.life -= p.decay * dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
    }
  }

  function draw(ctx) {
    if (particles.length === 0) return;
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var a = p.life * p.life;
      ctx.fillStyle = 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + a + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  return {
    spawn: spawn, update: update, draw: draw,
    active: function() { return particles.length > 0; },
    clear: function() { particles.length = 0; }
  };
}

// ── SPEED TRAIL ──
function createSpeedTrail() {
  var positions = [];
  var maxLen = 8;
  return {
    push: function(x, y) {
      positions.push({ x: x, y: y });
      if (positions.length > maxLen) positions.shift();
    },
    clear: function() { positions.length = 0; },
    draw: function(ctx, rgb) {
      if (positions.length < 2) return;
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < positions.length - 1; i++) {
        var norm = i / (positions.length - 1);
        var alpha = 0.05 + norm * 0.25;
        var r = 8 + norm * 10;
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
        ctx.beginPath();
        ctx.arc(positions[i].x, positions[i].y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  };
}

// ── IMPACT FLASH ──
function drawImpactFlash(ctx, x, y, progress, rgb) {
  if (progress >= 1) return;
  var radius = 12 + progress * 35;
  var alpha = 1.0 - progress * progress;
  ctx.globalCompositeOperation = 'lighter';
  var grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, 'rgba(255,255,220,' + alpha + ')');
  grad.addColorStop(0.4, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (alpha*0.6) + ')');
  grad.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

// ── BALL FLIGHT ──
function quadBezier(p0, p1, p2, t) {
  var u = 1-t;
  return { x: u*u*p0.x + 2*u*t*p1.x + t*t*p2.x, y: u*u*p0.y + 2*u*t*p1.y + t*t*p2.y };
}

// ── POST-SNAP ANIMATION SEQUENCES ──
// Builds per-dot keyframe arrays + events for each play result type.
// Each dot gets: [{time, x, y}, ...] interpolated via easing during playback.

function buildPostSnapSequence(type, yardsGained, formation, fieldW, YPX, losYard, topYard) {
  function toC(p, extraY) {
    return { x: p.x * fieldW, y: (losYard + p.y + (extraY || 0) - topYard) * YPX };
  }
  function kf(time, x, y) { return { time: time, x: x, y: y }; }

  var form = formation;
  var seq = { dotKeyframes: [], ball: null, events: [] };
  var sy = yardsGained; // settle yards
  // In portrait: offense moves DOWN the canvas (increasing Y) for positive yards.
  // 1 yard gained = +YPX pixels on canvas.
  var ydPx = YPX; // pixels per yard in the gain direction (down)

  // Start positions for all dots
  var allDots = form.offense.concat(form.defense);
  var starts = allDots.map(function(p) { return toC(p); });

  // Find key players by position
  function findOff(pos) {
    for (var i = 0; i < form.offense.length; i++) {
      if (form.offense[i].pos === pos) return { idx: i, p: form.offense[i], c: toC(form.offense[i]) };
    }
    return null;
  }
  function findDef(pos) {
    for (var i = 0; i < form.defense.length; i++) {
      var di = form.offense.length + i;
      if (form.defense[i].pos === pos) return { idx: di, p: form.defense[i], c: toC(form.defense[i]) };
    }
    return null;
  }

  var qb = findOff('QB');
  var wr = findOff('WR') || findOff('SLOT') || findOff('TE');
  var rb = findOff('RB') || findOff('FB');
  var cb = findDef('CB');
  var lb = findDef('LB');
  var dl0 = findDef('DL') || { idx: form.offense.length, c: starts[form.offense.length] };
  var safety = findDef('S');

  // Default: everyone stays put
  var dotKF = allDots.map(function(p, i) {
    var s = starts[i];
    return [kf(0, s.x, s.y), kf(2000, s.x, s.y)];
  });

  var catchY, settleY, tackleX;

  if (type === 'complete' || type === 'touchdown') {
    var isTD = type === 'touchdown';
    // Downfield = +Y on canvas. Catch point is 60% of the way, settle is full yards.
    catchY = (losYard + sy * 0.6 - topYard) * YPX;
    settleY = (losYard + sy - topYard) * YPX;
    tackleX = wr ? wr.c.x : 0.50 * fieldW;

    // QB: dropback (moves UP/backward = -Y), set, hold
    if (qb) dotKF[qb.idx] = [kf(0,qb.c.x,qb.c.y), kf(200,qb.c.x,qb.c.y-18), kf(400,qb.c.x,qb.c.y-12), kf(1500,qb.c.x,qb.c.y-12)];
    // WR: route downfield (+Y), catch, YAC, tackle
    if (wr) {
      var wrMid = { x: lerp(wr.c.x, 0.45*fieldW, 0.5), y: lerp(wr.c.y, catchY, 0.5) };
      dotKF[wr.idx] = [kf(0,wr.c.x,wr.c.y), kf(200,wr.c.x,wr.c.y+15), kf(400,wrMid.x,wrMid.y), kf(700,tackleX,catchY), kf(750,tackleX,catchY), kf(isTD?1000:1300,tackleX,settleY), kf(2000,tackleX,settleY)];
    }
    // OL: push forward (downfield = +Y)
    for (var oi = 0; oi < form.offense.length; oi++) {
      if (form.offense[oi].pos === 'OL') dotKF[oi] = [kf(0,starts[oi].x,starts[oi].y), kf(250,starts[oi].x,starts[oi].y+12), kf(1500,starts[oi].x,starts[oi].y+8)];
    }
    // CB: trails WR downfield
    if (cb && wr) dotKF[cb.idx] = [kf(0,cb.c.x,cb.c.y), kf(200,cb.c.x,cb.c.y+8), kf(400,lerp(cb.c.x,tackleX,0.3),lerp(cb.c.y,catchY,0.4)), kf(700,lerp(cb.c.x,tackleX,0.6),catchY-8), kf(1300,tackleX+5,settleY-4), kf(2000,tackleX+5,settleY-4)];
    // DL: rush toward QB (backward = -Y, toward offense backfield)
    for (var di = form.offense.length; di < allDots.length; di++) {
      if (allDots[di].pos === 'DL') dotKF[di] = [kf(0,starts[di].x,starts[di].y), kf(300,starts[di].x,starts[di].y-8), kf(1500,starts[di].x,starts[di].y-4)];
    }
    // Safety closes downfield toward tackle
    if (safety) dotKF[safety.idx] = [kf(0,safety.c.x,safety.c.y), kf(400,safety.c.x,safety.c.y+6), kf(1300,lerp(safety.c.x,tackleX,0.5),settleY-12), kf(2000,lerp(safety.c.x,tackleX,0.5),settleY-12)];

    // Ball flight: QB position → arc → catch point
    var qbPos = qb ? qb.c : starts[1];
    var midX = (qbPos.x + tackleX) / 2;
    seq.ball = { startTime: 400, endTime: 700, p0: { x: qbPos.x, y: qbPos.y - 12 }, p1: { x: midX, y: (qbPos.y-12+catchY)/2-20 }, p2: { x: tackleX, y: catchY } };
    seq.events.push({ time: 400, type: 'throw', x: qbPos.x, y: qbPos.y-12 });
    seq.events.push({ time: 700, type: 'catch', x: tackleX, y: catchY });
    seq.events.push({ time: isTD?1000:1300, type: isTD?'touchdown':'tackle', x: tackleX, y: settleY });

  } else if (type === 'run') {
    var runner = rb || qb;
    // Downfield = +Y
    settleY = (losYard + sy - topYard) * YPX;
    var runX = runner ? runner.c.x : 0.50 * fieldW;
    var losY = (losYard - topYard) * YPX;

    // Runner: mesh → hole → burst downfield → tackle
    if (runner) dotKF[runner.idx] = [kf(0,runner.c.x,runner.c.y), kf(150,0.50*fieldW,runner.c.y), kf(300,0.50*fieldW,losY), kf(500,runX,losY+15), kf(1000,runX,settleY), kf(1400,runX,settleY)];
    // QB hands off, drifts backward (-Y)
    if (qb && runner && runner.idx !== qb.idx) dotKF[qb.idx] = [kf(0,qb.c.x,qb.c.y), kf(150,qb.c.x-5,qb.c.y+3), kf(300,qb.c.x+10,qb.c.y-8), kf(1400,qb.c.x+15,qb.c.y-12)];
    // OL: fire forward downfield (+Y)
    for (var oi2 = 0; oi2 < form.offense.length; oi2++) {
      if (form.offense[oi2].pos === 'OL') dotKF[oi2] = [kf(0,starts[oi2].x,starts[oi2].y), kf(200,starts[oi2].x,starts[oi2].y+18), kf(500,starts[oi2].x,starts[oi2].y+22), kf(1400,starts[oi2].x,starts[oi2].y+18)];
    }
    // DL: get pushed backward by OL (-Y, toward their own backfield)
    for (var di2 = form.offense.length; di2 < allDots.length; di2++) {
      if (allDots[di2].pos === 'DL') dotKF[di2] = [kf(0,starts[di2].x,starts[di2].y), kf(200,starts[di2].x,starts[di2].y+4), kf(500,starts[di2].x,starts[di2].y+8), kf(1400,starts[di2].x,starts[di2].y+6)];
    }
    // LB fills downfield toward runner, tackles
    if (lb) dotKF[lb.idx] = [kf(0,lb.c.x,lb.c.y), kf(300,lb.c.x,lb.c.y-6), kf(700,lerp(lb.c.x,runX,0.7),settleY-8), kf(1000,runX+4,settleY-2), kf(1400,runX+4,settleY-2)];

    seq.events.push({ time: 150, type: 'handoff', x: 0.50*fieldW, y: runner?runner.c.y:losY });
    seq.events.push({ time: 1000, type: 'tackle', x: runX, y: settleY });

  } else if (type === 'sack') {
    // Sack: QB goes backward (-Y), DE rushes toward QB (-Y toward backfield)
    var sackY = (losYard - Math.abs(yardsGained) - topYard) * YPX;
    var sackDE = dl0;

    // QB: dropback (-Y), scramble, caught behind LOS
    if (qb) dotKF[qb.idx] = [kf(0,qb.c.x,qb.c.y), kf(200,qb.c.x,qb.c.y-16), kf(500,qb.c.x+10,qb.c.y-22), kf(800,qb.c.x+8,sackY), kf(1200,qb.c.x+8,sackY)];
    // DE: speed rush toward QB backfield (-Y)
    if (sackDE) dotKF[sackDE.idx] = [kf(0,sackDE.c.x,sackDE.c.y), kf(150,sackDE.c.x,sackDE.c.y-6), kf(350,sackDE.c.x+4,sackDE.c.y-16), kf(600,qb?qb.c.x+12:sackDE.c.x,sackDE.c.y-28), kf(800,qb?qb.c.x+8:sackDE.c.x,sackY), kf(1200,qb?qb.c.x+8:sackDE.c.x,sackY)];
    // OL: tries to block, gets pushed back (-Y)
    for (var oi3 = 0; oi3 < form.offense.length; oi3++) {
      if (form.offense[oi3].pos === 'OL') dotKF[oi3] = [kf(0,starts[oi3].x,starts[oi3].y), kf(200,starts[oi3].x,starts[oi3].y-6), kf(800,starts[oi3].x,starts[oi3].y-10), kf(1200,starts[oi3].x,starts[oi3].y-10)];
    }

    seq.events.push({ time: 800, type: 'sack', x: qb?qb.c.x+8:fieldW*0.5, y: sackY });

  } else if (type === 'interception') {
    // Ball goes downfield (+Y) to where CB intercepts
    var intY = (losYard + 8 - topYard) * YPX;
    // QB dropback (-Y)
    if (qb) dotKF[qb.idx] = [kf(0,qb.c.x,qb.c.y), kf(200,qb.c.x,qb.c.y-16), kf(400,qb.c.x,qb.c.y-10), kf(1800,qb.c.x,qb.c.y-10)];
    // WR runs downfield (+Y)
    if (wr) dotKF[wr.idx] = [kf(0,wr.c.x,wr.c.y), kf(200,wr.c.x,wr.c.y+10), kf(400,lerp(wr.c.x,0.40*fieldW,0.5),lerp(wr.c.y,intY,0.5)), kf(700,0.42*fieldW,intY), kf(1800,0.42*fieldW,intY)];
    // CB jumps route, catches ball
    if (cb) dotKF[cb.idx] = [kf(0,cb.c.x,cb.c.y), kf(300,cb.c.x,cb.c.y+10), kf(600,lerp(cb.c.x,0.41*fieldW,0.7),intY+5), kf(700,0.41*fieldW,intY), kf(900,0.41*fieldW,intY), kf(1400,0.38*fieldW,intY-25), kf(1800,0.38*fieldW,intY-25)];

    var qbPos2 = qb ? qb.c : starts[1];
    seq.ball = { startTime: 400, endTime: 700, p0: { x: qbPos2.x, y: qbPos2.y-10 }, p1: { x: (qbPos2.x+0.41*fieldW)/2, y: (qbPos2.y-10+intY)/2 }, p2: { x: 0.41*fieldW, y: intY } };
    seq.events.push({ time: 400, type: 'throw', x: qbPos2.x, y: qbPos2.y-10 });
    seq.events.push({ time: 700, type: 'interception', x: 0.41*fieldW, y: intY });

  } else if (type === 'incomplete') {
    // Ball goes downfield (+Y) but misses
    var missY = (losYard + 10 - topYard) * YPX;
    // QB dropback (-Y)
    if (qb) dotKF[qb.idx] = [kf(0,qb.c.x,qb.c.y), kf(200,qb.c.x,qb.c.y-16), kf(400,qb.c.x,qb.c.y-10), kf(1200,qb.c.x,qb.c.y-10)];
    // WR runs downfield (+Y)
    if (wr) dotKF[wr.idx] = [kf(0,wr.c.x,wr.c.y), kf(200,wr.c.x,wr.c.y+12), kf(500,lerp(wr.c.x,0.38*fieldW,0.5),lerp(wr.c.y,missY,0.6)), kf(700,0.42*fieldW,missY), kf(1200,0.42*fieldW,missY)];
    // CB in coverage (+Y)
    if (cb) dotKF[cb.idx] = [kf(0,cb.c.x,cb.c.y), kf(200,cb.c.x,cb.c.y+8), kf(700,0.41*fieldW,missY), kf(1200,0.41*fieldW,missY)];

    var qbPos3 = qb ? qb.c : starts[1];
    seq.ball = { startTime: 400, endTime: 700, p0: { x: qbPos3.x, y: qbPos3.y-10 }, p1: { x: 0.35*fieldW, y: (qbPos3.y-10+missY)/2 }, p2: { x: 0.38*fieldW, y: missY } };
    seq.events.push({ time: 400, type: 'throw', x: qbPos3.x, y: qbPos3.y-10 });
    seq.events.push({ time: 750, type: 'incomplete', x: 0.38*fieldW, y: missY });
  }

  seq.dotKeyframes = dotKF;
  seq.dotColors = allDots.map(function(p, i) { return i < form.offense.length ? 'off' : 'def'; });
  seq.dotNums = allDots.map(function(p) { return p.num; });
  return seq;
}

// Interpolate a dot position from keyframes at a given time
function interpDot(keyframes, t, easeFn) {
  if (t <= keyframes[0].time) return keyframes[0];
  if (t >= keyframes[keyframes.length-1].time) return keyframes[keyframes.length-1];
  for (var i = 0; i < keyframes.length - 1; i++) {
    if (t >= keyframes[i].time && t <= keyframes[i+1].time) {
      var raw = (t - keyframes[i].time) / (keyframes[i+1].time - keyframes[i].time);
      var e = easeFn ? easeFn(raw) : easeOutCubic(raw);
      return { x: lerp(keyframes[i].x, keyframes[i+1].x, e), y: lerp(keyframes[i].y, keyframes[i+1].y, e) };
    }
  }
  return keyframes[keyframes.length-1];
}

// ── GLOW SPRITE (for animated dots) ──
var _animGlowCache = {};
function getGlowSprite(rgb, radius, intensity) {
  var key = rgb.join(',')+':'+radius+':'+intensity;
  if (_animGlowCache[key]) return _animGlowCache[key];
  var size = radius * 4;
  var cv = document.createElement('canvas');
  cv.width = size; cv.height = size;
  var c = cv.getContext('2d');
  var cx = size/2, cy = size/2;
  var grad = c.createRadialGradient(cx,cy,0,cx,cy,radius);
  grad.addColorStop(0, 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+(0.7*intensity)+')');
  grad.addColorStop(0.3, 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+(0.3*intensity)+')');
  grad.addColorStop(0.7, 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+(0.08*intensity)+')');
  grad.addColorStop(1, 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0)');
  c.fillStyle = grad;
  c.fillRect(0,0,size,size);
  _animGlowCache[key] = cv;
  return cv;
}

// ── MAIN ANIMATOR ──

export function createFieldAnimator(width, height) {
  var renderer = createFieldRenderer(width, height);
  var canvas = renderer.canvas;
  var ctx = canvas.getContext('2d');

  var shake = createScreenShake();
  var particles = createParticleSystem();
  var trail = createSpeedTrail();

  var _lastState = null;
  var _rafId = null;
  var _animStartTime = 0;
  var _animSequence = null;
  var _animDuration = 0;
  var _scrollAnim = null; // { from, to, start, duration }
  var _cameraFollow = null; // { targetYPx, startTime, duration } — pans everything to follow action
  var _flashEffect = null; // { startTime, duration, rgb, type }
  var _ballFlight = null;

  var VISIBLE_YARDS = 25;
  var YPX = height / VISIBLE_YARDS;

  // Offense/defense colors for particles
  var OFF_COLORS = [[242,140,40], [255,180,80], [255,255,220]];
  var DEF_COLORS = [[59,165,93], [100,220,140], [255,255,220]];
  var SACK_COLORS = [[255,60,30], [255,140,40], [255,255,200]];
  var TD_COLORS = [[255,220,50], [255,180,40], [255,255,200]];
  var INT_COLORS = [[59,165,93], [40,255,120], [255,255,220]];

  function requestTick() {
    if (_rafId) return;
    _rafId = requestAnimationFrame(tick);
  }

  var _lastTickTime = 0;
  function tick(timestamp) {
    _rafId = null;
    var dt = Math.min((timestamp - _lastTickTime) / 1000, 0.05);
    _lastTickTime = timestamp;
    var animating = false;

    // Update systems
    shake.update(dt);
    particles.update(dt);

    // Scroll animation
    var renderState = Object.assign({}, _lastState);
    if (_scrollAnim) {
      var elapsed = timestamp - _scrollAnim.start;
      var t = Math.min(elapsed / _scrollAnim.duration, 1);
      renderState.ballYard = lerp(_scrollAnim.from, _scrollAnim.to, easeInOutCubic(t));
      renderState.losYard = renderState.ballYard;
      if (t >= 1) _scrollAnim = null;
      else animating = true;
    }

    // Process animation sequence events
    if (_animSequence) {
      var animElapsed = timestamp - _animStartTime;
      var events = _animSequence.events;
      for (var ei = events.length - 1; ei >= 0; ei--) {
        var ev = events[ei];
        if (ev.time <= animElapsed && !ev.fired) {
          ev.fired = true;
          fireEvent(ev);
        }
      }

      // Ball flight
      if (_animSequence.ball) {
        var bf = _animSequence.ball;
        if (animElapsed >= bf.startTime && animElapsed <= bf.endTime) {
          var bt = (animElapsed - bf.startTime) / (bf.endTime - bf.startTime);
          _ballFlight = quadBezier(bf.p0, bf.p1, bf.p2, easeOutCubic(bt));
        } else if (animElapsed > bf.endTime) {
          _ballFlight = null;
        }
      }

      if (animElapsed >= _animDuration) {
        _animSequence = null;
        _ballFlight = null;
        trail.clear();
      } else {
        animating = true;
      }
    }

    // Render base field (skip static dots if animating sequence)
    if (_animSequence && _animSequence.dotKeyframes) {
      renderState.skipDots = true;
    }
    renderer.render(renderState);

    // Camera follow: pan canvas to keep action visible during animation
    var _camOffset = 0;
    if (_cameraFollow && _animSequence) {
      var camElapsed = timestamp - _cameraFollow.startTime;
      var camT = Math.min(camElapsed / _cameraFollow.duration, 1);
      _camOffset = easeInOutCubic(camT) * _cameraFollow.targetYPx;
      ctx.save();
      ctx.translate(0, -_camOffset);
    }

    // Draw animated dots from keyframes
    if (_animSequence && _animSequence.dotKeyframes) {
      var animElapsed2 = timestamp - _animStartTime;
      var dkf = _animSequence.dotKeyframes;
      var dColors = _animSequence.dotColors;
      var dNums = _animSequence.dotNums;
      var CORE_R = 14, DOT_R = 24;

      // Team colors (dynamic)
      var TEAM_COLORS = { sentinels:[196,162,101], wolves:[192,192,192], stags:[242,140,40], serpents:[57,255,20] };
      var offRGB = (renderState.offTeam && TEAM_COLORS[renderState.offTeam]) || [242,140,40];
      var defRGB = (renderState.defTeam && TEAM_COLORS[renderState.defTeam]) || [59,165,93];

      function drawAnimDot(cx2, cy2, rgb) {
        // Dark backing (large enough to eclipse lines)
        ctx.fillStyle = 'rgba(5,10,8,0.92)';
        ctx.beginPath(); ctx.arc(cx2, cy2, CORE_R+4, 0, Math.PI*2); ctx.fill();
        // Two-layer glow (additive)
        var prev = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'lighter';
        var outerSpr = getGlowSprite(rgb, Math.round(DOT_R*1.5), 0.35);
        var outerSz = DOT_R * 6;
        ctx.drawImage(outerSpr, cx2-outerSz/2, cy2-outerSz/2, outerSz, outerSz);
        var spr = getGlowSprite(rgb, DOT_R, 0.8);
        ctx.drawImage(spr, cx2-DOT_R*2, cy2-DOT_R*2, DOT_R*4, DOT_R*4);
        ctx.globalCompositeOperation = prev;
        // Core
        ctx.save(); ctx.translate(cx2, cy2);
        var cg = ctx.createRadialGradient(0,0,0,0,0,CORE_R);
        cg.addColorStop(0, 'rgba('+Math.min(255,rgb[0]+60)+','+Math.min(255,rgb[1]+60)+','+Math.min(255,rgb[2]+60)+',1)');
        cg.addColorStop(0.5, 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.9)');
        cg.addColorStop(1, 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0)');
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.arc(0,0,CORE_R,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }

      for (var di = 0; di < dkf.length; di++) {
        var pos = interpDot(dkf[di], animElapsed2);
        var rgb = dColors[di] === 'off' ? offRGB : defRGB;
        drawAnimDot(pos.x, pos.y, rgb);
      }
      // Numbers on top
      ctx.font = "700 11px 'Teko'";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var ni = 0; ni < dkf.length; ni++) {
        var np = interpDot(dkf[ni], animElapsed2);
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 2.5;
        ctx.strokeText(dNums[ni], np.x, np.y);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fillText(dNums[ni], np.x, np.y);
      }
    }

    // Apply screen shake
    if (shake.active()) {
      var s = shake.get();
      ctx.save();
      ctx.translate(s.dx, s.dy);
      animating = true;
    }

    // Flash effects
    if (_flashEffect) {
      var fe = _flashEffect;
      var fp = (timestamp - fe.startTime) / fe.duration;
      if (fp < 1) {
        if (fe.type === 'red') {
          ctx.fillStyle = 'rgba(255,40,20,' + (0.2 * (1-fp)) + ')';
          ctx.fillRect(0, 0, width, height);
        } else if (fe.type === 'white') {
          drawImpactFlash(ctx, fe.x, fe.y, fp, fe.rgb || [255,200,100]);
        }
        animating = true;
      } else {
        _flashEffect = null;
      }
    }

    // Ball flight dot
    if (_ballFlight) {
      ctx.fillStyle = 'rgba(255,220,140,0.9)';
      ctx.beginPath();
      ctx.arc(_ballFlight.x, _ballFlight.y, 5, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,200,100,0.3)';
      ctx.beginPath();
      ctx.arc(_ballFlight.x, _ballFlight.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      trail.push(_ballFlight.x, _ballFlight.y);
      trail.draw(ctx, [255, 220, 140]);
    }

    // Particles
    particles.draw(ctx);

    // Close camera follow translate
    if (_cameraFollow && _animSequence) {
      ctx.restore();
    }

    if (shake.active()) ctx.restore();

    if (animating || shake.active() || particles.active() || _cameraFollow) {
      _rafId = requestAnimationFrame(tick);
    }
  }

  function fireEvent(ev) {
    switch (ev.type) {
      case 'throw':
        particles.spawn(ev.x, ev.y, 6, OFF_COLORS, { speed: 60, decay: 4 });
        break;
      case 'catch':
        particles.spawn(ev.x, ev.y, 10, OFF_COLORS, { speed: 80 });
        _flashEffect = { startTime: performance.now(), duration: 200, x: ev.x, y: ev.y, type: 'white', rgb: [242,140,40] };
        shake.add(0.15, 5);
        break;
      case 'tackle':
        particles.spawn(ev.x, ev.y, 20, OFF_COLORS.concat(DEF_COLORS), { speed: 130 });
        _flashEffect = { startTime: performance.now(), duration: 200, x: ev.x, y: ev.y, type: 'white', rgb: [255,200,100] };
        shake.add(0.35, 3.5);
        trail.clear();
        break;
      case 'sack':
        particles.spawn(ev.x, ev.y, 24, SACK_COLORS, { speed: 150 });
        _flashEffect = { startTime: performance.now(), duration: 150, type: 'red' };
        shake.add(0.6, 3);
        break;
      case 'interception':
        particles.spawn(ev.x, ev.y, 18, INT_COLORS, { speed: 100 });
        _flashEffect = { startTime: performance.now(), duration: 400, type: 'red' };
        shake.add(0.5, 2.5);
        trail.clear();
        break;
      case 'incomplete':
        // Subtle — just a small puff
        particles.spawn(ev.x, ev.y, 5, [[100,100,100]], { speed: 30, decay: 5 });
        break;
      case 'handoff':
        particles.spawn(ev.x, ev.y, 6, OFF_COLORS, { speed: 40, decay: 5 });
        break;
      case 'touchdown':
        // Big celebration
        particles.spawn(ev.x, ev.y, 40, TD_COLORS, { speed: 200, gravity: 150, decay: 0.8 });
        _flashEffect = { startTime: performance.now(), duration: 300, x: ev.x, y: ev.y, type: 'white', rgb: [255,220,50] };
        shake.add(0.7, 2);
        // Second burst delayed
        setTimeout(function() {
          particles.spawn(ev.x, ev.y - 10, 25, TD_COLORS, { speed: 160, gravity: 120, decay: 1.0 });
        }, 200);
        break;
    }
  }

  // ── PUBLIC API ──

  function render(state) {
    _lastState = state;
    renderer.render(state);
  }

  function playSequence(type, yardsGained, state) {
    _lastState = state;
    var center = Math.max(VISIBLE_YARDS/2, Math.min(120-VISIBLE_YARDS/2, state.ballYard));
    var topYard = center - VISIBLE_YARDS / 2;
    var form = renderer.FORMATIONS[state.formation] || renderer.FORMATIONS['shotgun_spread'];
    var playType = state.playType || 'SHORT';
    var defScheme = state.defScheme || 'ZONE';

    // Use the new composition-based builder
    _animSequence = buildPlayAnimation(type, yardsGained, form, playType, defScheme, width, YPX, state.losYard, topYard);
    _animStartTime = performance.now();
    _animDuration = _animSequence.duration || 1500;
    _lastTickTime = performance.now();
    trail.clear();
    _ballFlight = null;

    // Camera follow: if the settle point is off the bottom of the screen, pan down
    var settlePixelY = (state.losYard + yardsGained - topYard) * YPX;
    var margin = height * 0.15; // keep 15% margin from bottom
    _cameraFollow = null;
    if (settlePixelY > height - margin) {
      var panAmount = settlePixelY - (height - margin);
      var catchPct = type === 'sack' ? 0.5 : (playType === 'RUN' ? 0.25 : 0.35);
      _cameraFollow = {
        targetYPx: panAmount,
        startTime: performance.now() + _animDuration * catchPct,
        duration: _animDuration * 0.35
      };
    }

    requestTick();
  }

  function scrollTo(fromYard, toYard, duration) {
    _scrollAnim = { from: fromYard, to: toYard, start: performance.now(), duration: duration || 400 };
    _lastTickTime = performance.now();
    requestTick();
  }

  function triggerShake(trauma, decay) {
    shake.add(trauma, decay);
    _lastTickTime = performance.now();
    requestTick();
  }

  function burst(x, y, count, colors) {
    particles.spawn(x, y, count, colors);
    _lastTickTime = performance.now();
    requestTick();
  }

  return {
    canvas: canvas,
    render: render,
    playSequence: playSequence,
    scrollTo: scrollTo,
    triggerShake: triggerShake,
    burst: burst,
    FORMATIONS: renderer.FORMATIONS,
    PLAY_FORMATION_MAP: renderer.PLAY_FORMATION_MAP,
    TEAM_FORMATION_MAP: renderer.TEAM_FORMATION_MAP,
    DEF_FORMATION_MAP: renderer.DEF_FORMATION_MAP
  };
}
