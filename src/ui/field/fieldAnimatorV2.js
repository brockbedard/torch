/**
 * TORCH — Field Animator V2 (Phase 1: Static Field + Formations)
 *
 * GSAP-driven Canvas 2D animation engine.
 * - Pre-rendered field via fieldRenderer (blit via drawImage)
 * - Pre-rendered glow sprites (no shadowBlur in render loop)
 * - Object pools (no GC during animation)
 * - DPR capped at 2x
 * - GSAP ticker for render loop (only active during play animation)
 *
 * Phase 1: Static formations + glow dots + jersey numbers.
 * Phase 2+: Play animation, particles, trails, juice (future).
 */

import { gsap } from 'gsap';
import { createFieldRenderer } from './fieldRenderer.js';

// ══════════════════════════════════════════════════════════════
// TEAM COLORS (corrected per supplement)
// ══════════════════════════════════════════════════════════════
const TEAM_COLORS = {
  sentinels:   { name: 'Ridgemont Boars',          pri: '#8B1E1E', accent: '#FFB800', rgb: [196, 162, 101] },
  wolves:      { name: 'Coral Bay Dolphins',       pri: '#D13A7A', accent: '#FFCFD8', rgb: [209, 58, 122] },
  stags:       { name: 'Hollowridge Spectres',     pri: '#5DADE2', accent: '#D4ECFA', rgb: [93, 173, 226] },
  serpents:    { name: 'Blackwater Serpents',      pri: '#14B8A6', accent: '#F5C542', rgb: [20, 184, 166] },
  // Season 2
  pronghorns:  { name: 'Cedar Creek Pronghorns',   pri: '#166534', accent: '#F59E0B', rgb: [22, 101, 52] },
  salamanders: { name: 'Ashland Salamanders',      pri: '#2ECC71', accent: '#E84393', rgb: [46, 204, 113] },
  maples:      { name: 'Autumnvale Maples',        pri: '#7A1E2E', accent: '#D97706', rgb: [122, 30, 46] },
  raccoons:    { name: 'Moonshine Creek Raccoons', pri: '#D4D4D8', accent: '#FF8C00', rgb: [212, 212, 216] },
};

// ══════════════════════════════════════════════════════════════
// INIT — Create the animation system
// ══════════════════════════════════════════════════════════════
export function createFieldAnimatorV2(logicalWidth, logicalHeight) {
  // ── DPR cap at 2x ──
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // ── Renderer (static field — pre-rendered, blit via drawImage) ──
  const renderer = createFieldRenderer(logicalWidth, logicalHeight);

  // ── Single canvas (field blit + animation on same surface) ──
  // Using alpha:false since we redraw the full field each frame
  const canvas = document.createElement('canvas');
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  canvas.style.width = logicalWidth + 'px';
  canvas.style.height = logicalHeight + 'px';
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.scale(dpr, dpr);

  const width = logicalWidth;
  const height = logicalHeight;
  const VISIBLE_YARDS = 25;
  const YPX = height / VISIBLE_YARDS;

  // ══════════════════════════════════════════════════════════════
  // PRE-RENDERED GLOW SPRITES
  // ══════════════════════════════════════════════════════════════
  const _glowCache = {};

  function createGlowSprite(colorStr, coreRadius) {
    var key = colorStr + ':' + coreRadius;
    if (_glowCache[key]) return _glowCache[key];

    var size = Math.ceil(coreRadius * 6);
    var c = document.createElement('canvas');
    c.width = c.height = size * dpr;
    var gctx = c.getContext('2d');
    gctx.scale(dpr, dpr);
    var cx = size / 2;

    // Radial gradient — never use shadowBlur
    var grad = gctx.createRadialGradient(cx, cx, 0, cx, cx, coreRadius * 2.5);
    grad.addColorStop(0, colorStr);
    grad.addColorStop(0.15, colorStr.replace(/[\d.]+\)$/, '0.8)'));
    grad.addColorStop(0.4, colorStr.replace(/[\d.]+\)$/, '0.3)'));
    grad.addColorStop(0.7, colorStr.replace(/[\d.]+\)$/, '0.08)'));
    grad.addColorStop(1, 'transparent');
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, size, size);

    _glowCache[key] = { canvas: c, size: size };
    return _glowCache[key];
  }

  // Pre-render glow sprites for each team + defaults
  function rgbaStr(rgb, a) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')'; }

  var _teamGlowSprites = {};
  var _defaultOffGlow = null;
  var _defaultDefGlow = null;

  function initGlowSprites() {
    var dotR = 12; // core radius for dots
    // Default
    _defaultOffGlow = createGlowSprite(rgbaStr([242, 140, 40], 1), dotR);
    _defaultDefGlow = createGlowSprite(rgbaStr([59, 165, 93], 1), dotR);

    // Per-team
    for (var tid in TEAM_COLORS) {
      var tc = TEAM_COLORS[tid];
      _teamGlowSprites[tid] = createGlowSprite(rgbaStr(tc.rgb, 1), dotR);
    }
  }
  initGlowSprites();

  // ══════════════════════════════════════════════════════════════
  // OBJECT POOLS (pre-allocated, never create during animation)
  // ══════════════════════════════════════════════════════════════

  // Player dot pool (14 offense + 14 defense max)
  var _dots = [];
  for (var i = 0; i < 28; i++) {
    _dots.push({
      x: 0, y: 0, num: 0, pos: '', isOffense: true,
      scaleX: 1, scaleY: 1, alpha: 1, active: false,
      trail: [], maxTrail: 6
    });
  }

  // Particle pool (200 objects)
  var _particles = [];
  for (var pi = 0; pi < 200; pi++) {
    _particles.push({
      x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0,
      radius: 0, alpha: 1, r: 0, g: 0, b: 0, active: false
    });
  }

  // ══════════════════════════════════════════════════════════════
  // STATE
  // ══════════════════════════════════════════════════════════════
  var _state = null;       // Current render state
  var _offTeam = null;     // Team ID string
  var _defTeam = null;
  var _offGlow = null;     // Cached glow sprite for current teams
  var _defGlow = null;
  var _isAnimating = false;

  // Shake state
  var _shakeIntensity = 0;
  var _shakeTimer = 0;
  var _shakeMaxFrames = 0;

  // Zoom state
  var _zoomLevel = 1.0;
  var _zoomCenterX = width / 2;
  var _zoomCenterY = height / 2;

  // ══════════════════════════════════════════════════════════════
  // COORDINATE HELPERS
  // ══════════════════════════════════════════════════════════════
  function yardToY(yard, topYard) {
    return (yard - topYard) * YPX;
  }

  function fieldXToCanvas(xPct) {
    return xPct * width;
  }

  // ══════════════════════════════════════════════════════════════
  // DRAW: Render a single static frame (formation + field)
  // ══════════════════════════════════════════════════════════════
  function renderStaticFrame() {
    if (!_state) return;

    // 1. Blit the pre-rendered field (skip dots — V2 draws its own)
    var renderState = Object.assign({}, _state, { skipDots: true });
    renderer.render(renderState);
    ctx.drawImage(renderer.canvas, 0, 0, width, height);

    // 2. Calculate viewport
    var ballYard = _state.ballYard || 50;
    var center = Math.max(VISIBLE_YARDS / 2, Math.min(120 - VISIBLE_YARDS / 2, ballYard));
    var topYard = center - VISIBLE_YARDS / 2;

    // 3. Draw player dots
    var formation = renderer.FORMATIONS[_state.formation] || renderer.FORMATIONS['shotgun_deuce'];
    if (!formation) return;

    var offPlayers = formation.offense || [];
    var defPlayers = formation.defense || [];

    // Get team glow sprites
    var offGlow = _offGlow || _defaultOffGlow;
    var defGlow = _defGlow || _defaultDefGlow;
    var offRGB = (_offTeam && TEAM_COLORS[_offTeam]) ? TEAM_COLORS[_offTeam].rgb : [242, 140, 40];
    var defRGB = (_defTeam && TEAM_COLORS[_defTeam]) ? TEAM_COLORS[_defTeam].rgb : [59, 165, 93];

    // Draw offense dots
    for (var oi = 0; oi < offPlayers.length; oi++) {
      var op = offPlayers[oi];
      var ox = fieldXToCanvas(op.x);
      var oy = yardToY((_state.losYard || ballYard) - op.y, topYard);
      drawDot(ctx, ox, oy, op.num, offGlow, offRGB, true);
    }

    // Draw defense dots
    for (var di = 0; di < defPlayers.length; di++) {
      var dp = defPlayers[di];
      var dx = fieldXToCanvas(dp.x);
      var dy = yardToY((_state.losYard || ballYard) + dp.y, topYard);
      drawDot(ctx, dx, dy, dp.num, defGlow, defRGB, false);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // DRAW DOT — Single player dot with glow sprite + shadow + number
  // ══════════════════════════════════════════════════════════════
  var DOT_CORE_R = 10;
  var DOT_GLOW_R = 12;

  function drawDot(c, x, y, num, glowSprite, rgb, isOffense) {
    // Ground shadow (depth grounding)
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.beginPath();
    c.ellipse(Math.round(x), Math.round(y) + 8, DOT_CORE_R * 0.75, DOT_CORE_R * 0.3, 0, 0, Math.PI * 2);
    c.fill();

    // Glow sprite (pre-rendered, additive blending)
    var prevComp = c.globalCompositeOperation;
    c.globalCompositeOperation = 'lighter';
    var sprSize = glowSprite.size;
    c.drawImage(glowSprite.canvas, 0, 0, sprSize * dpr, sprSize * dpr,
      Math.round(x) - sprSize / 2, Math.round(y) - sprSize / 2, sprSize, sprSize);
    c.globalCompositeOperation = prevComp;

    // Dark backing (eclipses field lines)
    c.fillStyle = 'rgba(5,10,8,0.92)';
    c.beginPath();
    c.arc(Math.round(x), Math.round(y), DOT_CORE_R + 3, 0, Math.PI * 2);
    c.fill();

    // Core gradient
    var coreGrad = c.createRadialGradient(x, y, 0, x, y, DOT_CORE_R);
    coreGrad.addColorStop(0, 'rgba(' + Math.min(255, rgb[0] + 60) + ',' + Math.min(255, rgb[1] + 60) + ',' + Math.min(255, rgb[2] + 60) + ',1)');
    coreGrad.addColorStop(0.5, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.9)');
    coreGrad.addColorStop(0.8, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.6)');
    coreGrad.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
    c.fillStyle = coreGrad;
    c.beginPath();
    c.arc(Math.round(x), Math.round(y), DOT_CORE_R, 0, Math.PI * 2);
    c.fill();

    // Jersey number
    if (num) {
      c.save();
      c.font = "700 9px 'Teko'";
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      // Dark backing circle
      c.fillStyle = 'rgba(0,0,0,0.5)';
      c.beginPath();
      c.arc(Math.round(x), Math.round(y), 6, 0, Math.PI * 2);
      c.fill();
      // Stroke
      c.strokeStyle = 'rgba(0,0,0,0.9)';
      c.lineWidth = 2.5;
      c.lineJoin = 'round';
      c.strokeText(String(num), Math.round(x), Math.round(y));
      // Fill (warm offense, cool defense)
      c.fillStyle = isOffense ? 'rgba(255,250,240,0.95)' : 'rgba(240,245,255,0.95)';
      c.fillText(String(num), Math.round(x), Math.round(y));
      c.restore();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER LOOP (GSAP ticker — only active during play animation)
  // ══════════════════════════════════════════════════════════════
  function renderField() {
    ctx.clearRect(0, 0, width, height);

    // Apply camera transforms
    ctx.save();
    if (_shakeTimer > 0) {
      var intensity = _shakeIntensity * Math.pow(0.88, _shakeMaxFrames - _shakeTimer);
      ctx.translate(
        (Math.random() - 0.5) * intensity * 2,
        (Math.random() - 0.5) * intensity * 2
      );
      _shakeTimer--;
    }
    if (_zoomLevel !== 1.0) {
      ctx.translate(_zoomCenterX, _zoomCenterY);
      ctx.scale(_zoomLevel, _zoomLevel);
      ctx.translate(-_zoomCenterX, -_zoomCenterY);
    }

    // Blit pre-rendered field (skip dots — V2 draws its own)
    var rs = Object.assign({}, _state, { skipDots: true });
    renderer.render(rs);
    ctx.drawImage(renderer.canvas, 0, 0, width, height);

    // Draw dots
    renderFormationDots();

    ctx.restore();
  }

  function renderFormationDots() {
    if (!_state) return;
    var ballYard = _state.ballYard || 50;
    var center = Math.max(VISIBLE_YARDS / 2, Math.min(120 - VISIBLE_YARDS / 2, ballYard));
    var topYard = center - VISIBLE_YARDS / 2;
    var formation = renderer.FORMATIONS[_state.formation] || renderer.FORMATIONS['shotgun_deuce'];
    if (!formation) return;

    var offGlow = _offGlow || _defaultOffGlow;
    var defGlow = _defGlow || _defaultDefGlow;
    var offRGB = (_offTeam && TEAM_COLORS[_offTeam]) ? TEAM_COLORS[_offTeam].rgb : [242, 140, 40];
    var defRGB = (_defTeam && TEAM_COLORS[_defTeam]) ? TEAM_COLORS[_defTeam].rgb : [59, 165, 93];

    var offPlayers = formation.offense || [];
    var defPlayers = formation.defense || [];

    for (var oi = 0; oi < offPlayers.length; oi++) {
      var op = offPlayers[oi];
      var ox = fieldXToCanvas(op.x);
      var oy = yardToY((_state.losYard || ballYard) - op.y, topYard);
      drawDot(ctx, ox, oy, op.num, offGlow, offRGB, true);
    }
    for (var di = 0; di < defPlayers.length; di++) {
      var dp = defPlayers[di];
      var dx = fieldXToCanvas(dp.x);
      var dy = yardToY((_state.losYard || ballYard) + dp.y, topYard);
      drawDot(ctx, dx, dy, dp.num, defGlow, defRGB, false);
    }
  }

  function startAnimation() {
    if (_isAnimating) return;
    _isAnimating = true;
    _lastTickTime = performance.now();
    gsap.ticker.add(renderFieldV2);
  }

  function stopAnimation() {
    if (!_isAnimating) return;
    _isAnimating = false;
    gsap.ticker.remove(renderField);
    gsap.ticker.remove(renderFieldV2);
    if (_playTl) { _playTl.kill(); _playTl = null; }
    _activeDots = [];
    _ball.visible = false;
    _flashAlpha = 0;
    renderStaticFrame(); // Final static frame
  }

  // ══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════

  /**
   * Show a formation (pre-snap static view).
   * Call this when play/player cards are selected.
   */
  function showFormation(offTeam, defTeam, playType, defScheme) {
    _offTeam = offTeam;
    _defTeam = defTeam;
    _offGlow = (offTeam && _teamGlowSprites[offTeam]) ? _teamGlowSprites[offTeam] : _defaultOffGlow;
    _defGlow = (defTeam && _teamGlowSprites[defTeam]) ? _teamGlowSprites[defTeam] : _defaultDefGlow;

    // Pick formation
    var formation = renderer.pickFormation(playType || 'SHORT', offTeam || 'sentinels');

    _state = {
      ballYard: _state ? _state.ballYard : 50,
      losYard: _state ? _state.losYard : 50,
      firstDownYard: _state ? _state.firstDownYard : 60,
      formation: formation,
      offTeam: offTeam,
      defTeam: defTeam,
    };

    renderStaticFrame();
  }

  /**
   * Update field position (ball moved, new down & distance).
   */
  function updateFieldPosition(ballYard, losYard, firstDownYard) {
    if (!_state) _state = {};
    _state.ballYard = ballYard;
    _state.losYard = losYard;
    _state.firstDownYard = firstDownYard;
    renderStaticFrame();
  }

  // ══════════════════════════════════════════════════════════════
  // PHASE 2: PLAY ANIMATION ENGINE
  // ══════════════════════════════════════════════════════════════

  // ── Route shape library (from supplement spec) ──
  var ROUTE_SHAPES = {
    slant:      [{ x: 0.15, y: 0 }, { x: 0.18, y: 3 }, { x: 0.32, y: 7 }],
    flat:       [{ x: 0.20, y: 0 }, { x: 0.15, y: 1 }, { x: 0.08, y: 2 }, { x: 0.05, y: 4 }],
    drag:       [{ x: 0.15, y: 0 }, { x: 0.17, y: 2 }, { x: 0.45, y: 3 }, { x: 0.65, y: 4 }],
    shallow_x:  [{ x: 0.85, y: 0 }, { x: 0.82, y: 2 }, { x: 0.55, y: 3 }, { x: 0.35, y: 4 }],
    out_route:  [{ x: 0.82, y: 0 }, { x: 0.82, y: 6 }, { x: 0.95, y: 8 }],
    cross:      [{ x: 0.15, y: 0 }, { x: 0.18, y: 3 }, { x: 0.22, y: 7 }, { x: 0.50, y: 11 }, { x: 0.65, y: 13 }],
    mesh:       [{ x: 0.30, y: 0 }, { x: 0.32, y: 2 }, { x: 0.50, y: 5 }, { x: 0.70, y: 7 }],
    seam:       [{ x: 0.65, y: 0 }, { x: 0.63, y: 5 }, { x: 0.61, y: 10 }, { x: 0.60, y: 15 }],
    corner_rte: [{ x: 0.20, y: 0 }, { x: 0.22, y: 8 }, { x: 0.08, y: 16 }],
    post:       [{ x: 0.15, y: 0 }, { x: 0.18, y: 8 }, { x: 0.35, y: 15 }, { x: 0.45, y: 20 }],
    go_route:   [{ x: 0.12, y: 0 }, { x: 0.13, y: 5 }, { x: 0.14, y: 12 }, { x: 0.15, y: 20 }, { x: 0.15, y: 30 }],
    hitch:      [{ x: 0.15, y: 0 }, { x: 0.16, y: 4 }, { x: 0.15, y: 3.5 }],
  };

  var RUN_SHAPES = {
    qb_sneak:  [{ x: 0.50, y: 0 }, { x: 0.50, y: 1 }, { x: 0.50, y: 2 }],
    draw:      [{ x: 0.50, y: 0 }, { x: 0.48, y: -1 }, { x: 0.48, y: 0 }, { x: 0.50, y: 2 }, { x: 0.52, y: 5 }],
    power:     [{ x: 0.50, y: 0 }, { x: 0.52, y: 1 }, { x: 0.55, y: 2 }, { x: 0.54, y: 5 }],
    zone_read: [{ x: 0.50, y: 0 }, { x: 0.55, y: 1 }, { x: 0.58, y: 3 }, { x: 0.56, y: 6 }],
    toss:      [{ x: 0.50, y: 0 }, { x: 0.60, y: -1 }, { x: 0.72, y: 0 }, { x: 0.82, y: 3 }, { x: 0.85, y: 6 }],
    inside_zone: [{ x: 0.50, y: 0 }, { x: 0.52, y: 1 }, { x: 0.53, y: 3 }, { x: 0.52, y: 5 }],
  };

  // ── Easing map per spec ──
  var EASE = {
    run:       'power2.out',
    sprint:    'power4.in',
    routeIn:   'power3.in',
    routeOut:  'power2.out',
    lob:       'sine.inOut',
    bullet:    'power1.out',
    recoil:    'back.out(1.7)',
    celebrate: 'elastic.out(1, 0.3)',
    zoom:      'power3.inOut',
    ring:      'power2.out',
    olPush:    'power1.inOut',
    squash:    'elastic.out(1, 0.5)',
  };

  // ── Play timeline state ──
  var _playTl = null;        // Master GSAP timeline for current play
  var _activeDots = [];      // Dot objects being animated {x, y, num, isOffense, scaleX, scaleY, trail}
  var _ball = { x: 0, y: 0, progress: 0, maxArc: 30, visible: false, scaleX: 1, scaleY: 1 };
  var _impactRings = [];     // {x, y, radius, maxRadius, opacity, lineWidth, color, active}
  var _flashAlpha = 0;
  var _hitstopEnd = 0;

  // Pre-allocate impact ring pool
  for (var ri = 0; ri < 5; ri++) {
    _impactRings.push({ x: 0, y: 0, radius: 0, maxRadius: 0, opacity: 0, lineWidth: 0, color: '#fff', active: false });
  }

  // ── Particle helpers ──
  function acquireParticle() {
    for (var i = 0; i < _particles.length; i++) {
      if (!_particles[i].active) return _particles[i];
    }
    return null;
  }

  function spawnParticleBurst(x, y, count, rgb, speed, gravity) {
    speed = speed || 80;
    gravity = gravity || 50;
    for (var i = 0; i < count; i++) {
      var p = acquireParticle();
      if (!p) break;
      var angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      var spd = speed * (0.5 + Math.random());
      p.x = x; p.y = y;
      p.vx = Math.cos(angle) * spd;
      p.vy = Math.sin(angle) * spd - 30; // slight upward bias
      p.life = 1; p.maxLife = 1;
      p.radius = 2 + Math.random() * 3;
      p.r = rgb[0]; p.g = rgb[1]; p.b = rgb[2];
      p.active = true;
      p._gravity = gravity;
    }
  }

  function updateParticles(dt) {
    for (var i = 0; i < _particles.length; i++) {
      var p = _particles[i];
      if (!p.active) continue;
      p.life -= 2.5 * dt;
      if (p.life <= 0) { p.active = false; continue; }
      p.vy += (p._gravity || 50) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
    }
  }

  function drawParticles(c) {
    var prevComp = c.globalCompositeOperation;
    c.globalCompositeOperation = 'lighter';
    for (var i = 0; i < _particles.length; i++) {
      var p = _particles[i];
      if (!p.active) continue;
      var a = p.life * p.life;
      c.globalAlpha = a;
      c.fillStyle = 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + a + ')';
      c.beginPath();
      c.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = prevComp;
  }

  // ── Impact ring helpers ──
  function triggerImpactRing(x, y, color, maxRadius) {
    for (var i = 0; i < _impactRings.length; i++) {
      if (!_impactRings[i].active) {
        var r = _impactRings[i];
        r.x = x; r.y = y; r.radius = 5; r.maxRadius = maxRadius || 40;
        r.opacity = 0.8; r.lineWidth = 3; r.color = color || '#ffffff';
        r.active = true;
        gsap.to(r, { radius: r.maxRadius, opacity: 0, lineWidth: 0.5, duration: 0.4, ease: EASE.ring,
          onComplete: function() { r.active = false; } });
        return;
      }
    }
  }

  function drawRings(c) {
    for (var i = 0; i < _impactRings.length; i++) {
      var r = _impactRings[i];
      if (!r.active) continue;
      c.strokeStyle = r.color;
      c.lineWidth = r.lineWidth;
      c.globalAlpha = r.opacity;
      c.beginPath();
      c.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      c.stroke();
    }
    c.globalAlpha = 1;
  }

  // ── Shake trigger ──
  function triggerScreenShake(intensity, durationMs) {
    _shakeIntensity = intensity;
    _shakeMaxFrames = Math.round(durationMs / 16.67);
    _shakeTimer = _shakeMaxFrames;
  }

  // ── Ball drawing ──
  function drawBall(c) {
    if (!_ball.visible) return;
    var arcHeight = Math.sin(_ball.progress * Math.PI) * _ball.maxArc;
    var bx = _ball.x;
    var by = _ball.y;

    // Ground shadow
    c.globalAlpha = 0.3;
    c.fillStyle = '#000';
    c.beginPath();
    c.ellipse(bx, by, 4, 2, 0, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;

    // Ball (offset upward by arc height)
    var scale = 1 + (arcHeight / Math.max(1, _ball.maxArc)) * 0.25;
    var ballR = 4 * scale;
    c.save();
    c.translate(bx, by - arcHeight);
    c.rotate((_ball.progress * 8) % (Math.PI * 2)); // spiral
    c.beginPath();
    c.ellipse(0, 0, ballR, ballR * 0.6, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,220,140,0.9)';
    c.fill();
    // Lace
    c.strokeStyle = 'rgba(255,255,255,0.4)';
    c.lineWidth = 0.5;
    c.beginPath();
    c.moveTo(-ballR * 0.6, 0);
    c.lineTo(ballR * 0.6, 0);
    c.stroke();
    c.restore();
  }

  // ── Trail drawing ──
  function drawTrails(c) {
    c.globalCompositeOperation = 'lighter';
    for (var i = 0; i < _activeDots.length; i++) {
      var d = _activeDots[i];
      if (!d.trail || d.trail.length < 2) continue;
      var rgb = d.isOffense
        ? ((_offTeam && TEAM_COLORS[_offTeam]) ? TEAM_COLORS[_offTeam].rgb : [242, 140, 40])
        : ((_defTeam && TEAM_COLORS[_defTeam]) ? TEAM_COLORS[_defTeam].rgb : [59, 165, 93]);
      for (var j = 1; j < d.trail.length; j++) {
        var t = j / d.trail.length;
        c.globalAlpha = t * t * 0.4;
        c.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',1)';
        c.lineWidth = 1.5 + t;
        c.beginPath();
        c.moveTo(d.trail[j - 1].x, d.trail[j - 1].y);
        c.lineTo(d.trail[j].x, d.trail[j].y);
        c.stroke();
      }
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
  }

  // ══════════════════════════════════════════════════════════════
  // UPDATED RENDER LOOP — Phase 2 (replaces Phase 1 renderField)
  // ══════════════════════════════════════════════════════════════
  var _lastTickTime = 0;

  function renderFieldV2() {
    var now = performance.now();
    var dt = Math.min((now - _lastTickTime) / 1000, 0.05);
    _lastTickTime = now;

    // Hitstop: freeze dot positions but continue effects
    var dotsAreFrozen = now < _hitstopEnd;

    ctx.clearRect(0, 0, width, height);

    // Camera transforms
    ctx.save();
    if (_shakeTimer > 0) {
      var si = _shakeIntensity * Math.pow(0.88, _shakeMaxFrames - _shakeTimer);
      ctx.translate((Math.random() - 0.5) * si * 2, (Math.random() - 0.5) * si * 2);
      _shakeTimer--;
    }
    if (_zoomLevel !== 1.0) {
      ctx.translate(_zoomCenterX, _zoomCenterY);
      ctx.scale(_zoomLevel, _zoomLevel);
      ctx.translate(-_zoomCenterX, -_zoomCenterY);
    }

    // Blit field (skip dots — V2 draws animated dots)
    var rsV2 = Object.assign({}, _state, { skipDots: true });
    renderer.render(rsV2);
    ctx.drawImage(renderer.canvas, 0, 0, width, height);

    // White flash
    if (_flashAlpha > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = _flashAlpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // Trails (additive)
    drawTrails(ctx);

    // Animated dots
    var offGlow = _offGlow || _defaultOffGlow;
    var defGlow = _defGlow || _defaultDefGlow;
    var offRGB = (_offTeam && TEAM_COLORS[_offTeam]) ? TEAM_COLORS[_offTeam].rgb : [242, 140, 40];
    var defRGB = (_defTeam && TEAM_COLORS[_defTeam]) ? TEAM_COLORS[_defTeam].rgb : [59, 165, 93];

    for (var i = 0; i < _activeDots.length; i++) {
      var d = _activeDots[i];
      // Update trail
      if (!dotsAreFrozen) {
        d.trail.push({ x: d.x, y: d.y });
        if (d.trail.length > d.maxTrail) d.trail.shift();
      }
      var glow = d.isOffense ? offGlow : defGlow;
      var rgb = d.isOffense ? offRGB : defRGB;
      // Squash/stretch via save/restore
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.scale(d.scaleX || 1, d.scaleY || 1);
      ctx.translate(-d.x, -d.y);
      drawDot(ctx, d.x, d.y, d.num, glow, rgb, d.isOffense);
      ctx.restore();
    }

    // Ball
    drawBall(ctx);

    // Particles
    drawParticles(ctx);
    if (!dotsAreFrozen) updateParticles(dt);

    // Impact rings
    drawRings(ctx);

    ctx.restore();
  }

  // ══════════════════════════════════════════════════════════════
  // PLAY BUILDER — Create GSAP timeline from snap result
  // ══════════════════════════════════════════════════════════════

  function buildPlayTimeline(snapResult) {
    if (!_state) return null;

    var ballYard = _state.ballYard || 50;
    var center = Math.max(VISIBLE_YARDS / 2, Math.min(120 - VISIBLE_YARDS / 2, ballYard));
    var topYard = center - VISIBLE_YARDS / 2;
    var losY = yardToY(ballYard, topYard);

    var formation = renderer.FORMATIONS[_state.formation] || renderer.FORMATIONS['shotgun_deuce'];
    if (!formation) return null;

    var offPlayers = formation.offense || [];
    var defPlayers = formation.defense || [];

    // Setup animated dots from formation positions
    _activeDots = [];
    for (var oi = 0; oi < offPlayers.length; oi++) {
      var op = offPlayers[oi];
      _activeDots.push({
        x: fieldXToCanvas(op.x),
        y: yardToY(ballYard - op.y, topYard),
        num: op.num, pos: op.pos, isOffense: true,
        scaleX: 1, scaleY: 1, trail: [], maxTrail: op.pos === 'OL' ? 3 : 6,
        _startX: fieldXToCanvas(op.x),
        _startY: yardToY(ballYard - op.y, topYard),
      });
    }
    for (var di = 0; di < defPlayers.length; di++) {
      var dp = defPlayers[di];
      _activeDots.push({
        x: fieldXToCanvas(dp.x),
        y: yardToY(ballYard + dp.y, topYard),
        num: dp.num, pos: dp.pos, isOffense: false,
        scaleX: 1, scaleY: 1, trail: [], maxTrail: 3,
        _startX: fieldXToCanvas(dp.x),
        _startY: yardToY(ballYard + dp.y, topYard),
      });
    }

    // Determine play type and result
    var yards = snapResult.yards || 0;
    var isPass = !snapResult.isRun;
    var isTD = snapResult.isTouchdown;
    var isSack = snapResult.isSack;
    var isInt = snapResult.isInterception;
    var isInc = snapResult.isIncomplete;
    var isFumble = snapResult.isFumbleLost;

    // Determine tier for juice scaling
    var tier = 1;
    if (isTD || isInt || isFumble) tier = 3;
    else if (isSack || Math.abs(yards) >= 15) tier = 2;

    // Timing per spec
    var totalDur = tier === 1 ? 1.8 : tier === 2 ? 2.2 : 2.8;
    var throwT = isPass ? (tier === 1 ? 0.4 : 0.6) : 0.15; // handoff is quick
    var catchT = isPass ? throwT + 0.3 + (Math.abs(yards) / 30) * 0.4 : throwT + 0.1;
    var tackleT = catchT + 0.3;

    // Find key dots
    var qbDot = _activeDots.find(function(d) { return d.pos === 'QB'; });
    var rbDot = _activeDots.find(function(d) { return d.pos === 'RB'; });
    var wrDots = _activeDots.filter(function(d) { return d.pos === 'WR' || d.pos === 'SLOT' || d.pos === 'TE'; });
    var olDots = _activeDots.filter(function(d) { return d.pos === 'OL'; });
    var dlDots = _activeDots.filter(function(d) { return d.pos === 'DL'; });
    var dbDots = _activeDots.filter(function(d) { return d.pos === 'CB' || d.pos === 'S' || d.pos === 'LB'; });

    // Target dot (who gets the ball)
    var targetDot = isPass ? (wrDots[0] || rbDot || qbDot) : (rbDot || qbDot);
    var yardsPx = yards * YPX;
    var settleY = losY - yardsPx; // negative yards = ball moves up (toward offense endzone)

    // Build master timeline
    var tl = gsap.timeline({ paused: true });

    // ── OL behavior ──
    olDots.forEach(function(ol) {
      if (isPass) {
        // Pass: kick-step backward
        tl.to(ol, { y: ol._startY + 8, duration: 0.3, ease: EASE.olPush }, 0);
      } else {
        // Run: fire forward
        tl.to(ol, { y: ol._startY - 12, duration: 0.4, ease: EASE.olPush }, 0);
      }
    });

    // ── DL behavior ──
    dlDots.forEach(function(dl) {
      if (isPass) {
        tl.to(dl, { y: dl._startY - 10, duration: 0.6, ease: 'power2.in' }, 0.1);
      } else {
        tl.to(dl, { y: dl._startY + 5, duration: 0.4, ease: 'power1.out' }, 0.1);
      }
    });

    // ── QB behavior ──
    if (qbDot) {
      if (isPass && !isSack) {
        // Dropback
        tl.to(qbDot, { y: qbDot._startY + 15, duration: 0.35, ease: 'power2.out' }, 0);
      } else if (isSack) {
        // Dropback then get caught
        tl.to(qbDot, { y: qbDot._startY + 15, duration: 0.25, ease: 'power2.out' }, 0);
        tl.to(qbDot, { x: qbDot._startX + (Math.random() > 0.5 ? 12 : -12), y: qbDot._startY + 25, duration: 0.3, ease: 'power3.in' }, 0.3);
      } else {
        // Run: hand off
        tl.to(qbDot, { y: qbDot._startY + 5, duration: 0.15, ease: 'power1.out' }, 0);
      }
    }

    // ── Route / run path for ball carrier ──
    if (targetDot && !isSack) {
      if (isPass) {
        // WR runs a route
        var catchX = targetDot._startX + (Math.random() - 0.5) * 30;
        var catchY = losY - Math.abs(yards) * YPX * 0.6;
        tl.to(targetDot, { x: catchX, y: catchY, duration: catchT - 0.1, ease: EASE.routeOut }, 0.1);
        // After catch: run to settle
        tl.to(targetDot, { y: settleY, duration: tackleT - catchT, ease: EASE.run }, catchT);
      } else {
        // RB runs to settle
        var runPath = { x: targetDot._startX + (Math.random() - 0.5) * 20, y: settleY };
        tl.to(targetDot, { x: runPath.x, y: runPath.y, duration: tackleT, ease: EASE.run }, throwT);
      }
    }

    // ── DB coverage (simple follow) ──
    dbDots.forEach(function(db, idx) {
      var followTarget = wrDots[idx] || targetDot;
      if (followTarget) {
        tl.to(db, {
          x: followTarget._startX + (Math.random() - 0.5) * 10,
          y: followTarget._startY - 5 - Math.random() * 10,
          duration: catchT + 0.2,
          ease: 'power1.inOut'
        }, 0.15);
      }
    });

    // ── Ball flight (pass only) ──
    if (isPass && !isSack && targetDot) {
      var ballStartX = qbDot ? qbDot._startX : width / 2;
      var ballStartY = qbDot ? qbDot._startY + 15 : losY;
      var ballEndX = targetDot._startX + (Math.random() - 0.5) * 30;
      var ballEndY = isInc ? settleY + 20 : settleY;

      _ball.x = ballStartX;
      _ball.y = ballStartY;
      _ball.progress = 0;
      _ball.maxArc = Math.min(50, Math.abs(yards) * 1.5 + 10);
      _ball.visible = false;

      tl.call(function() { _ball.visible = true; }, null, throwT);
      tl.to(_ball, { x: ballEndX, y: ballEndY, progress: 1, duration: catchT - throwT,
        ease: Math.abs(yards) > 12 ? EASE.lob : EASE.bullet }, throwT);
      tl.call(function() {
        if (!isInc) _ball.visible = false;
      }, null, catchT);

      // Incomplete: ball fades out
      if (isInc) {
        tl.to(_ball, { progress: 1.2, y: ballEndY + 15, duration: 0.3, ease: 'power1.in' }, catchT);
        tl.call(function() { _ball.visible = false; }, null, catchT + 0.3);
      }
    }

    // ── COLLISION JUICE at tackle/catch point ──
    var juiceTime = isPass ? catchT : tackleT;
    var juiceX = targetDot ? targetDot._startX : width / 2;
    var juiceY = settleY;
    var offRGB = (_offTeam && TEAM_COLORS[_offTeam]) ? TEAM_COLORS[_offTeam].rgb : [242, 140, 40];
    var defRGB = (_defTeam && TEAM_COLORS[_defTeam]) ? TEAM_COLORS[_defTeam].rgb : [59, 165, 93];

    tl.call(function() {
      var particleCount = tier === 1 ? 8 : tier === 2 ? 18 : 30;
      var particleColor = (isInt || isFumble) ? defRGB : offRGB;
      var shakeIntensity = tier === 1 ? 2 : tier === 2 ? 5 : 8;
      var shakeDur = tier === 1 ? 100 : tier === 2 ? 200 : 300;
      var ringColor = isTD ? '#FFB800' : isInt ? '#39FF14' : isSack ? '#ff4040' : '#ffffff';

      // A) Hitstop
      if (tier >= 2) {
        var hitstopMs = tier === 2 ? 60 : 100;
        _hitstopEnd = performance.now() + hitstopMs;
        tl.pause();
        setTimeout(function() { tl.resume(); }, hitstopMs);
      }

      // B) Screen shake
      triggerScreenShake(shakeIntensity, shakeDur);

      // C) Particles
      spawnParticleBurst(juiceX, juiceY, particleCount, particleColor, tier === 3 ? 120 : 80, tier === 3 ? 80 : 50);

      // D) Impact ring
      triggerImpactRing(juiceX, juiceY, ringColor, tier === 3 ? 50 : 35);

      // E) White flash (tier 3 only)
      if (tier >= 3) {
        _flashAlpha = 0.35;
        gsap.to({ val: _flashAlpha }, { val: 0, duration: 0.15, onUpdate: function() { _flashAlpha = this.targets()[0].val; } });
      }

      // F) Squash/stretch on target dot
      if (targetDot) {
        gsap.to(targetDot, { scaleX: 1.2, scaleY: 0.8, duration: 0.05, yoyo: true, repeat: 1, ease: EASE.squash });
      }
    }, null, juiceTime);

    // ── Settle ──
    tl.call(function() {
      stopAnimation();
    }, null, totalDur);

    return tl;
  }

  /**
   * Animate a play result.
   * @param {object} snapResult — { yards, isRun, isTouchdown, isSack, isInterception, isIncomplete, isFumbleLost }
   */
  function animatePlay(snapResult) {
    // Kill any existing play
    if (_playTl) { _playTl.kill(); _playTl = null; }
    _activeDots = [];
    _ball.visible = false;
    _flashAlpha = 0;
    _hitstopEnd = 0;
    // Reset particles
    for (var i = 0; i < _particles.length; i++) _particles[i].active = false;
    for (var j = 0; j < _impactRings.length; j++) _impactRings[j].active = false;

    // Switch render loop to V2 (animated)
    gsap.ticker.remove(renderField); // Remove Phase 1 loop if active
    _lastTickTime = performance.now();

    // Build and play timeline
    _playTl = buildPlayTimeline(snapResult);
    if (_playTl) {
      _isAnimating = true;
      gsap.ticker.add(renderFieldV2);
      _playTl.play();
    }
  }

  /**
   * Show a torch card effect (Phase 4 — stub).
   */
  function showTorchEffect(torchCard, timing) {
    console.log('[fieldAnimatorV2] showTorchEffect stub — Phase 4');
  }

  /**
   * Reset to clean state.
   */
  function reset() {
    stopAnimation();
    _state = null;
    _offTeam = null;
    _defTeam = null;
    _shakeIntensity = 0;
    _shakeTimer = 0;
    _zoomLevel = 1.0;
    ctx.clearRect(0, 0, width, height);
  }

  // ── Return public API ──
  return {
    // Canvas element (mount in DOM)
    canvas: canvas,
    fieldCanvas: renderer.canvas,

    // Phase 1 API
    showFormation: showFormation,
    updateFieldPosition: updateFieldPosition,
    reset: reset,

    // Phase 2+ stubs
    animatePlay: animatePlay,
    showTorchEffect: showTorchEffect,

    // Animation control
    startAnimation: startAnimation,
    stopAnimation: stopAnimation,

    // Expose formation data for external use
    FORMATIONS: renderer.FORMATIONS,
    PLAY_FORMATION_MAP: renderer.PLAY_FORMATION_MAP,
    TEAM_FORMATION_MAP: renderer.TEAM_FORMATION_MAP,
    TEAM_FORMATION_POOLS: renderer.TEAM_FORMATION_POOLS,
    pickFormation: renderer.pickFormation,

    // For test harness
    _renderStaticFrame: renderStaticFrame,
    _ctx: ctx,
    _dpr: dpr,
  };
}
