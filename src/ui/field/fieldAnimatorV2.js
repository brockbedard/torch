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
  sentinels: { name: 'Ridgemont Boars',      pri: '#8B1E1E', accent: '#FFB800', rgb: [196, 162, 101] },
  wolves:    { name: 'Coral Bay Dolphins',    pri: '#E8548F', accent: '#FFB8D4', rgb: [232, 84, 143] },
  stags:     { name: 'Hollowridge Spectres',  pri: '#5DADE2', accent: '#A8E6FF', rgb: [93, 173, 226] },
  serpents:  { name: 'Blackwater Serpents',    pri: '#2E0854', accent: '#39FF14', rgb: [57, 255, 20] },
};

// ══════════════════════════════════════════════════════════════
// INIT — Create the animation system
// ══════════════════════════════════════════════════════════════
export function createFieldAnimatorV2(logicalWidth, logicalHeight) {
  // ── DPR cap at 2x ──
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // ── Renderer (static field — pre-rendered, blit via drawImage) ──
  const renderer = createFieldRenderer(logicalWidth, logicalHeight);

  // ── Player canvas (animation layer, sits on top of field) ──
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

    // 1. Blit the pre-rendered field
    renderer.render(_state);
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

    // Blit pre-rendered field
    renderer.render(_state);
    ctx.drawImage(renderer.canvas, 0, 0, width, height);

    // Draw dots (during animation, these will be driven by GSAP tweens)
    // For now in Phase 1: draw static formation
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
    gsap.ticker.add(renderField);
  }

  function stopAnimation() {
    if (!_isAnimating) return;
    _isAnimating = false;
    gsap.ticker.remove(renderField);
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

  /**
   * Animate a play (Phase 2 — stub for now).
   */
  function animatePlay(snapResult) {
    // Phase 2: GSAP timelines, routes, ball flight, juice
    console.log('[fieldAnimatorV2] animatePlay stub — Phase 2');
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
