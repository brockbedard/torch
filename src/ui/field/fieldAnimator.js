/**
 * TORCH — Field Animator
 * Wraps fieldRenderer with smooth transitions, post-snap animations,
 * screen shake, particle bursts, ball flight, and speed trails.
 * NFL Blitz-inspired visual language on Canvas 2D.
 */

import { createFieldRenderer } from './fieldRenderer.js';

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
// Returns keyframe arrays for each dot given the play result
function buildPostSnapSequence(type, yardsGained, formation, fieldW, YPX, losYard, topYard) {
  // Convert formation position to canvas coords
  function toCanvas(p, timeOffsetYards) {
    return {
      x: p.x * fieldW,
      y: (losYard + p.y + (timeOffsetYards || 0) - topYard) * YPX
    };
  }

  var form = formation;
  var sequence = { offense: [], defense: [], ball: null, events: [] };
  var settleYards = yardsGained;

  if (type === 'complete' || type === 'touchdown') {
    // QB drops back, throws; WR runs route, catches, gets tackled
    var qb = form.offense.find(function(p) { return p.pos === 'QB'; }) || form.offense[1];
    var wr = form.offense.find(function(p) { return p.pos === 'WR' || p.pos === 'SLOT'; }) || form.offense[3];
    var cb = form.defense.find(function(p) { return p.pos === 'CB'; }) || form.defense[3];
    var qbStart = toCanvas(qb);
    var wrStart = toCanvas(wr);
    var catchY = (losYard - settleYards * 0.6 - topYard) * YPX;
    var settleY = (losYard - settleYards - topYard) * YPX;
    var cbStart = toCanvas(cb);

    // Ball flight: QB → arc → WR catch point
    var midX = (qbStart.x + wrStart.x) / 2;
    var midY = (qbStart.y + catchY) / 2 - 20; // arc apex
    sequence.ball = {
      startTime: 400, endTime: 700,
      p0: qbStart,
      p1: { x: midX, y: midY },
      p2: { x: wr.x * fieldW, y: catchY }
    };

    // Events
    sequence.events.push({ time: 400, type: 'throw', x: qbStart.x, y: qbStart.y });
    sequence.events.push({ time: 700, type: 'catch', x: wr.x * fieldW, y: catchY });
    if (type !== 'touchdown') {
      sequence.events.push({ time: 1300, type: 'tackle', x: wr.x * fieldW, y: settleY });
    } else {
      sequence.events.push({ time: 1000, type: 'touchdown', x: wr.x * fieldW, y: settleY });
    }
  } else if (type === 'run') {
    var rb = form.offense.find(function(p) { return p.pos === 'RB' || p.pos === 'FB'; }) || form.offense[2];
    var lb = form.defense.find(function(p) { return p.pos === 'LB'; }) || form.defense[3];
    var rbStart = toCanvas(rb);
    var settleY2 = (losYard - settleYards - topYard) * YPX;

    sequence.events.push({ time: 150, type: 'handoff', x: 0.50 * fieldW, y: (losYard - 1 - topYard) * YPX });
    sequence.events.push({ time: 1000, type: 'tackle', x: rbStart.x, y: settleY2 });
  } else if (type === 'sack') {
    var qbS = form.offense.find(function(p) { return p.pos === 'QB'; }) || form.offense[1];
    var de = form.defense.find(function(p) { return p.pos === 'DE' || p.pos === 'DL'; }) || form.defense[0];
    var qbSStart = toCanvas(qbS);
    var sackY = (losYard + Math.abs(yardsGained) - topYard) * YPX;

    sequence.events.push({ time: 800, type: 'sack', x: qbSStart.x + 10, y: sackY });
  } else if (type === 'interception') {
    var qbI = form.offense.find(function(p) { return p.pos === 'QB'; }) || form.offense[1];
    var wrI = form.offense.find(function(p) { return p.pos === 'WR'; }) || form.offense[3];
    var cbI = form.defense.find(function(p) { return p.pos === 'CB'; }) || form.defense[3];
    var qbIStart = toCanvas(qbI);
    var intY = (losYard - 8 - topYard) * YPX;

    sequence.ball = {
      startTime: 400, endTime: 700,
      p0: qbIStart,
      p1: { x: (qbIStart.x + cbI.x * fieldW) / 2, y: (qbIStart.y + intY) / 2 - 20 },
      p2: { x: cbI.x * fieldW, y: intY }
    };

    sequence.events.push({ time: 400, type: 'throw', x: qbIStart.x, y: qbIStart.y });
    sequence.events.push({ time: 700, type: 'interception', x: cbI.x * fieldW, y: intY });
  } else if (type === 'incomplete') {
    var qbInc = form.offense.find(function(p) { return p.pos === 'QB'; }) || form.offense[1];
    var qbIncStart = toCanvas(qbInc);
    var missY = (losYard - 10 - topYard) * YPX;

    sequence.ball = {
      startTime: 400, endTime: 700,
      p0: qbIncStart,
      p1: { x: 0.35 * fieldW, y: (qbIncStart.y + missY) / 2 - 15 },
      p2: { x: 0.38 * fieldW, y: missY }
    };
    sequence.events.push({ time: 400, type: 'throw', x: qbIncStart.x, y: qbIncStart.y });
    sequence.events.push({ time: 750, type: 'incomplete', x: 0.38 * fieldW, y: missY });
  }

  return sequence;
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
  var _flashEffect = null; // { startTime, duration, rgb, type }
  var _ballFlight = null;

  var VISIBLE_YARDS = 30;
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

    // Render base field
    renderer.render(renderState);

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

    if (shake.active()) ctx.restore();

    if (animating || shake.active() || particles.active()) {
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
    var form = renderer.FORMATIONS[state.formation] || renderer.FORMATIONS['shotgun_2x2'];

    _animSequence = buildPostSnapSequence(type, yardsGained, form, width, YPX, state.losYard, topYard);
    _animStartTime = performance.now();
    _animDuration = type === 'touchdown' || type === 'interception' ? 1800 : type === 'run' ? 1400 : type === 'sack' ? 1200 : 1500;
    _lastTickTime = performance.now();
    trail.clear();
    _ballFlight = null;
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
