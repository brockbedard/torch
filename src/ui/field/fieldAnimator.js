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
  var _cameraFollow = false; // true when play needs camera pan
  var _animTopYard = 0; // topYard at animation start (for camera offset math)
  var _camYShift = 0; // current pixel shift applied to dots for camera follow
  var _camTarget = 0; // target pixel shift (smoothed toward by _camYShift)
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

    // Scroll animation (uses pre-rendered padded buffer — no static redraws)
    var renderState = Object.assign({}, _lastState);
    if (_scrollAnim) {
      var elapsed = timestamp - _scrollAnim.start;
      var t = Math.min(elapsed / _scrollAnim.duration, 1);
      renderState.ballYard = lerp(_scrollAnim.from, _scrollAnim.to, easeInOutCubic(t));
      renderState.losYard = renderState.ballYard;
      var scrollRange = Math.abs(_scrollAnim.to - _scrollAnim.from);
      renderState.cameraPadding = Math.ceil(scrollRange) + 5;
      if (t >= 1) {
        _scrollAnim = null;
        // Force a clean render at final position (no padding)
        renderState.cameraPadding = 0;
      } else {
        animating = true;
      }
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
        _cameraFollow = false;
        _camTarget = 0;
        trail.clear();
      } else {
        animating = true;
      }
    }

    // Camera follow: stays locked until throw/handoff, then smoothly tracks the ball carrier
    if (_cameraFollow && _animSequence && _animSequence.dotKeyframes) {
      var animT = timestamp - _animStartTime;

      // Don't move camera until the ball is released (throw or handoff event)
      var ballReleased = false;
      var evts = _animSequence.events;
      for (var ei2 = 0; ei2 < evts.length; ei2++) {
        if ((evts[ei2].type === 'throw' || evts[ei2].type === 'handoff') && animT >= evts[ei2].time) {
          ballReleased = true; break;
        }
      }

      if (!ballReleased) {
        _camTarget = 0;  // hold still pre-throw
      } else {
        // Track only offensive dots (first numOff), not defense
        var dkf = _animSequence.dotKeyframes;
        var numOff = _animSequence.dotColors ? _animSequence.dotColors.filter(function(c) { return c === 'off'; }).length : 7;
        var maxPixY = 0;
        for (var ci2 = 0; ci2 < numOff; ci2++) {
          var cp = interpDot(dkf[ci2], animT);
          if (cp.y > maxPixY) maxPixY = cp.y;
        }
        // Compute target camera offset
        var maxAbsYard = _animTopYard + maxPixY / YPX;
        var desiredTopYard = maxAbsYard - VISIBLE_YARDS * 0.75;
        _camTarget = 0;
        if (desiredTopYard > _animTopYard) {
          var newCenter = Math.min(120 - VISIBLE_YARDS / 2, desiredTopYard + VISIBLE_YARDS / 2);
          var newTopYard = newCenter - VISIBLE_YARDS / 2;
          _camTarget = (newTopYard - _animTopYard) * YPX;
        }
      }
      // Smooth dt-based damping — framerate independent, broadcast feel
      // smoothTime ~0.5s means camera takes ~0.5s to reach the target
      var smoothTime = 0.5;
      var smoothFactor = 1 - Math.exp(-dt / smoothTime * 4);
      _camYShift += (_camTarget - _camYShift) * smoothFactor;
      if (Math.abs(_camYShift - _camTarget) < 0.3) _camYShift = _camTarget;
    } else if (_camYShift > 0 && !_scrollAnim) {
      // Smoothly return to zero when animation ends (before scroll starts)
      var returnFactor = 1 - Math.exp(-dt / 0.35 * 4);
      _camYShift += (0 - _camYShift) * returnFactor;
      if (_camYShift < 0.5) _camYShift = 0;
      animating = _camYShift > 0;  // keep ticking until fully settled
    } else if (_scrollAnim) {
      // During scroll, snap camera offset to zero so scroll controls the view
      _camYShift = 0;
    }

    // Apply camera offset to field viewport via pre-rendered buffer (no static redraws)
    if (_camYShift > 0 && !_scrollAnim) {
      var camYards = _camYShift / YPX;
      renderState.ballYard = Math.min(120 - VISIBLE_YARDS / 2, (_animTopYard + VISIBLE_YARDS / 2) + camYards);
      renderState.cameraPadding = Math.ceil(camYards) + 5;
    }

    // Render base field (skip static dots if animating sequence)
    if (_animSequence && _animSequence.dotKeyframes) {
      renderState.skipDots = true;
    }
    renderer.render(renderState);

    // Draw animated dots from keyframes
    if (_animSequence && _animSequence.dotKeyframes) {
      var animElapsed2 = timestamp - _animStartTime;
      var dkf = _animSequence.dotKeyframes;
      var dColors = _animSequence.dotColors;
      var dNums = _animSequence.dotNums;
      var CORE_R = 14, DOT_R = 24;

      // Team colors (dynamic)
      var TEAM_COLORS = { sentinels:[196,162,101], wolves:[232,84,143], stags:[93,173,226], serpents:[57,255,20] };
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
        drawAnimDot(pos.x, pos.y - _camYShift, rgb);
      }
      // Numbers on top
      ctx.font = "700 11px 'Teko'";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var ni = 0; ni < dkf.length; ni++) {
        var np = interpDot(dkf[ni], animElapsed2);
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 2.5;
        ctx.strokeText(dNums[ni], np.x, np.y - _camYShift);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fillText(dNums[ni], np.x, np.y - _camYShift);
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
      var bfx = _ballFlight.x, bfy = _ballFlight.y - _camYShift;
      ctx.fillStyle = 'rgba(255,220,140,0.9)';
      ctx.beginPath();
      ctx.arc(bfx, bfy, 5, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,200,100,0.3)';
      ctx.beginPath();
      ctx.arc(bfx, bfy, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      trail.push(bfx, bfy);
      trail.draw(ctx, [255, 220, 140]);
    }

    // Particles
    particles.draw(ctx);

    if (shake.active()) ctx.restore();

    if (animating || shake.active() || particles.active() || _cameraFollow) {
      _rafId = requestAnimationFrame(tick);
    }
  }

  function fireEvent(ev) {
    var ex = ev.x, ey = ev.y - _camYShift; // camera-adjusted position
    switch (ev.type) {
      case 'throw':
        particles.spawn(ex, ey, 6, OFF_COLORS, { speed: 60, decay: 4 });
        break;
      case 'catch':
        particles.spawn(ex, ey, 10, OFF_COLORS, { speed: 80 });
        _flashEffect = { startTime: performance.now(), duration: 200, x: ex, y: ey, type: 'white', rgb: [242,140,40] };
        shake.add(0.15, 5);
        break;
      case 'tackle':
        particles.spawn(ex, ey, 20, OFF_COLORS.concat(DEF_COLORS), { speed: 130 });
        _flashEffect = { startTime: performance.now(), duration: 200, x: ex, y: ey, type: 'white', rgb: [255,200,100] };
        shake.add(0.35, 3.5);
        trail.clear();
        break;
      case 'sack':
        particles.spawn(ex, ey, 24, SACK_COLORS, { speed: 150 });
        _flashEffect = { startTime: performance.now(), duration: 150, type: 'red' };
        shake.add(0.6, 3);
        break;
      case 'interception':
        particles.spawn(ex, ey, 18, INT_COLORS, { speed: 100 });
        _flashEffect = { startTime: performance.now(), duration: 400, type: 'red' };
        shake.add(0.5, 2.5);
        trail.clear();
        break;
      case 'incomplete':
        particles.spawn(ex, ey, 5, [[100,100,100]], { speed: 30, decay: 5 });
        break;
      case 'handoff':
        particles.spawn(ex, ey, 6, OFF_COLORS, { speed: 40, decay: 5 });
        break;
      case 'touchdown':
        particles.spawn(ex, ey, 40, TD_COLORS, { speed: 200, gravity: 150, decay: 0.8 });
        _flashEffect = { startTime: performance.now(), duration: 300, x: ex, y: ey, type: 'white', rgb: [255,220,50] };
        shake.add(0.7, 2);
        setTimeout(function() {
          particles.spawn(ex, ey - 10, 25, TD_COLORS, { speed: 160, gravity: 120, decay: 1.0 });
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
    var form = renderer.FORMATIONS[state.formation] || renderer.FORMATIONS['shotgun_deuce'];
    var playType = state.playType || 'SHORT';
    var defScheme = state.defScheme || 'ZONE';

    // Use the new composition-based builder
    _animSequence = buildPlayAnimation(type, yardsGained, form, playType, defScheme, width, YPX, state.losYard, topYard, state.offTeam);
    _animStartTime = performance.now();
    _animDuration = _animSequence.duration || 1500;
    _lastTickTime = performance.now();
    trail.clear();
    _ballFlight = null;

    // Save the initial viewport for camera offset math
    _animTopYard = topYard;
    _camYShift = 0;
    _camTarget = 0;

    // Camera follow: enable if the settle point would be off the bottom of the screen
    var settlePixelY = (state.losYard + yardsGained - topYard) * YPX;
    _cameraFollow = settlePixelY > height * 0.80;

    // Pre-render padded field buffer for smooth camera panning (no redraws during pan)
    if (_cameraFollow) {
      var extraYards = Math.ceil((settlePixelY - height * 0.75) / YPX) + 5;
      var initState = Object.assign({}, state, { cameraPadding: extraYards });
      renderer.render(initState);
    }

    requestTick();
  }

  function scrollTo(fromYard, toYard, duration) {
    _scrollAnim = { from: fromYard, to: toYard, start: performance.now(), duration: duration || 600 };
    // Pre-render padded buffer covering both endpoints for smooth scroll (no redraws)
    var lo = Math.min(fromYard, toYard);
    var hi = Math.max(fromYard, toYard);
    var scrollPadding = Math.ceil(hi - lo) + 5;
    var initState = Object.assign({}, _lastState, { ballYard: lo, cameraPadding: scrollPadding });
    renderer.render(initState);
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
    TEAM_FORMATION_POOLS: renderer.TEAM_FORMATION_POOLS,
    DEF_FORMATION_MAP: renderer.DEF_FORMATION_MAP,
    pickFormation: renderer.pickFormation
  };
}
