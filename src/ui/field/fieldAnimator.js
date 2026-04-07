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
  return {
    push: function(x, y, velocity) {
      positions.push({ x: x, y: y });
      // Dynamic trail length based on speed
      var maxLen = Math.min(16, 4 + Math.floor(velocity / 3));
      while (positions.length > maxLen) positions.shift();
    },
    clear: function() { positions.length = 0; },
    draw: function(ctx, rgb, teamRGB) {
      if (positions.length < 2) return;

      // Team-colored secondary trail (behind the white trail)
      if (teamRGB) {
        for (var j = 0; j < positions.length; j++) {
          var t2 = j / positions.length;
          var alpha2 = t2 * t2 * 0.15;
          var radius2 = 5 + t2 * 8;
          ctx.fillStyle = 'rgba(' + teamRGB[0] + ',' + teamRGB[1] + ',' + teamRGB[2] + ',' + alpha2 + ')';
          ctx.beginPath();
          ctx.arc(positions[j].x, positions[j].y, radius2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw trail with smooth gradient fade
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < positions.length; i++) {
        var t = i / positions.length; // 0 = oldest, 1 = newest
        var alpha = t * t * 0.35; // Quadratic fade: newest is brightest
        var radius = 3 + t * 5; // Smaller oldest, larger newest
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
        ctx.beginPath();
        ctx.arc(positions[i].x, positions[i].y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  };
}

// ── IMPACT FLASH (replaced by inline multi-layer bloom in tick) ──

// ── BALL FLIGHT ──
function quadBezier(p0, p1, p2, t) {
  var u = 1-t;
  return { x: u*u*p0.x + 2*u*t*p1.x + t*t*p2.x, y: u*u*p0.y + 2*u*t*p1.y + t*t*p2.y };
}

// Interpolate a dot position from keyframes at a given time
function interpDot(keyframes, t, easeFn) {
  if (t <= keyframes[0].time) return keyframes[0];
  if (t >= keyframes[keyframes.length-1].time) return keyframes[keyframes.length-1];
  for (var i = 0; i < keyframes.length - 1; i++) {
    if (t >= keyframes[i].time && t <= keyframes[i+1].time) {
      var raw = (t - keyframes[i].time) / (keyframes[i+1].time - keyframes[i].time);
      var e = easeFn ? easeFn(raw) : easeInOutCubic(raw);
      return { x: lerp(keyframes[i].x, keyframes[i+1].x, e), y: lerp(keyframes[i].y, keyframes[i+1].y, e) };
    }
  }
  return keyframes[keyframes.length-1];
}

// ── GLOW SPRITE (for animated dots) ──
var _animGlowCache = {};
function getGlowSprite(rgb, radius, intensity) {
  var quantized = Math.round(intensity * 100) / 100;
  var key = rgb.join(',')+':'+radius+':'+quantized;
  if (_animGlowCache[key]) return _animGlowCache[key];
  var size = radius * 4;
  var cv = document.createElement('canvas');
  cv.width = size; cv.height = size;
  var c = cv.getContext('2d');
  var cx = size/2, cy = size/2;
  var r = rgb[0], g = rgb[1], b = rgb[2];
  var grad = c.createRadialGradient(cx,cy,0,cx,cy,radius);
  grad.addColorStop(0, 'rgba('+r+','+g+','+b+','+(0.95*intensity)+')');
  grad.addColorStop(0.2, 'rgba('+r+','+g+','+b+','+(0.7*intensity)+')');
  grad.addColorStop(0.5, 'rgba('+r+','+g+','+b+','+(0.3*intensity)+')');
  grad.addColorStop(0.8, 'rgba('+r+','+g+','+b+','+(0.08*intensity)+')');
  grad.addColorStop(1, 'rgba('+r+','+g+','+b+',0)');
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
  var _lastYardsGained = 8;
  var _rafId = null;
  var _animStartTime = 0;
  var _animSequence = null;
  var _animDuration = 0;
  var _scrollAnim = null; // { from, to, start, duration }
  var _cameraFollow = false; // true when play needs camera pan
  var _animTopYard = 0; // topYard at animation start (for camera offset math)
  var _camYShift = 0; // current pixel shift applied to dots for camera follow
  var _camTarget = 0; // target pixel shift (smoothed toward by _camYShift)
  var _hitstopEnd = 0; // performance.now() timestamp when hitstop expires
  var _flashEffect = null; // { startTime, duration, rgb, type }
  var _ballFlight = null;
  var _ballFlightProgress = 0; // 0→1 through the flight arc
  var _ballFlightElapsed = 0;  // ms since ball was thrown
  var _ballPrevPos = null;     // previous frame ball position for velocity calculation
  var _ballVelocity = 0;       // pixels/frame speed for dynamic trail length

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
    // Disabled as per user request
    return;
  }

  function fireEvent(ev) {
    // Disabled as per user request
    return;
  }

  // ── PUBLIC API ──

  function render(state) {
    _lastState = state;
    renderer.render(state);
  }

  function playSequence(type, yardsGained, state) {
    _lastState = state;
    _lastYardsGained = yardsGained;
    var center = Math.max(VISIBLE_YARDS/2, Math.min(120-VISIBLE_YARDS/2, state.ballYard));
    var topYard = center - VISIBLE_YARDS / 2;

    _animSequence = null;
    _animTopYard = topYard;
    _camYShift = 0;
    _camTarget = 0;
    _cameraFollow = false;

    renderer.render(state);
  }

  function scrollTo(fromYard, toYard, duration) {
    // Immediate snap, no animation
    render(Object.assign({}, _lastState, { ballYard: toYard, losYard: toYard }));
  }

  function triggerShake(trauma, decay) {
    // Disabled
  }

  function burst(x, y, count, colors) {
    // Disabled
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
    TEAM_FORMATION_POOLS: renderer.TEAM_FORMATION_POOLS,
    DEF_FORMATION_MAP: renderer.DEF_FORMATION_MAP,
    pickFormation: renderer.pickFormation
  };
}
