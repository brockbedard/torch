/**
 * TORCH v0.23.0 — Digital Glass Floor Portrait Field Renderer
 * Phase 1: Static formations + LOS/1st down markers + player glow dots
 *
 * Source of truth: TORCH-GLASS-PORTRAIT.html (landscape) — same CFG values,
 * rebuilt natively in portrait orientation (NOT rotated).
 *
 * Portrait layout: yard lines are HORIZONTAL, hash marks are VERTICAL ticks.
 * Canvas shows a ~38-55 yard window centered on ball position.
 */

// ── FIELD CONFIGURATION (exact values from landscape source) ──
const CFG = {
  bg: '#050a08',
  tile: { size: 40, color: 'rgba(0,255,100,0.05)' },
  yard: { color: 'rgba(255,255,255,0.15)', w10: 1.5, w5: 1 },
  goal: { color: 'rgba(255,160,20,0.30)', w: 3, glowColor: 'rgba(255,140,0,0.2)', glowBlur: 6 },
  border: { color: 'rgba(255,255,255,0.30)', w: 2.5 },
  hash: { color: 'rgba(255,255,255,0.08)', len: 5.25 },
  num: { color: 'rgba(255,245,220,0.10)', font: "700 34px 'Teko'", gap: 2, arrowOff: 22, arrowSz: 6, arrowColor: 'rgba(255,120,20,0.10)' },
  endZone: { fill: 'rgba(255,69,17,0.04)', stripe: '#FF4511', stripeAlpha: 0.012, textColor: 'rgba(255,69,17,0.12)', textStroke: 'rgba(255,69,17,0.08)', textHighlight: 'rgba(255,184,0,0.04)', innerBorder: 'rgba(255,69,17,0.10)' },
  los: { color: 'rgba(59,130,246,0.85)', w: 3, blur: 10 },
  firstDown: { color: 'rgba(251,191,36,0.85)', w: 3, blur: 10 },
  noise: { opacity: 0.04, count: 600 },
  flame: { path: 'M22 0C22 0 6 16 4 28C2 40 12 48 18 52C18 52 13 42 18 30C20 24 21 19 22 13C23 19 24 24 26 30C31 42 26 52 26 52C32 48 42 40 40 28C38 16 22 0 22 0Z', color: '#FF4511', alpha: 0.12 },
  football: {
    bodyPath: 'M247.5 25.4c-13.5 3.3-26.4 7.2-38.6 11.7C142.9 61.6 96.7 103.6 66 153.6C47.8 183.4 35.1 215.9 26.9 249L264.5 486.6c13.5-3.3 26.4-7.2 38.6-11.7c66-24.5 112.2-66.5 142.9-116.5c18.3-29.8 30.9-62.3 39.1-95.3L247.5 25.4zM495.2 205.3c6.1-56.8 1.4-112.2-7.7-156.4c-2.7-12.9-13-22.9-26.1-25.1c-58.2-9.7-109.9-12-155.6-7.9L495.2 205.3zM206.1 496L16.8 306.7c-6.1 56.8-1.4 112.2 7.7 156.4c2.7 12.9 13 22.9 26.1 25.1c58.2 9.7 109.9 12 155.6 7.9z',
    lacesPath: 'M260.7 164.7c6.2-6.2 16.4-6.2 22.6 0l64 64c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6zm-48 48c6.2-6.2 16.4-6.2 22.6 0l64 64c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6zm-48 48c6.2-6.2 16.4-6.2 22.6 0l64 64c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6z',
    alpha: 0.30, scale: 0.065
  },
  // Player dot glow colors
  offense: [242, 140, 40],  // Stags orange
  defense: [59, 165, 93],   // Wolves green
};

// ── FORMATIONS ──
// Positions as [widthPct (0-1, left-right), yardsFromLOS (positive = defense side)]
// 7v7 formations — exactly 7 offense + 7 defense = 14 players
// y = yards from LOS. Negative = behind LOS (offense), positive = past LOS (defense).
// Dots have dark backing circles so they eclipse lines cleanly.
const FORMATIONS = {
  'shotgun_2x2': {
    offense: [
      { pos: 'OL', x: 0.50, y: 0, num: 72 },
      { pos: 'QB', x: 0.50, y: -5, num: 7 },
      { pos: 'RB', x: 0.42, y: -4, num: 25 },
      { pos: 'WR', x: 0.12, y: 0, num: 1 },
      { pos: 'WR', x: 0.28, y: -1, num: 82 },
      { pos: 'WR', x: 0.72, y: -1, num: 4 },
      { pos: 'WR', x: 0.88, y: 0, num: 11 },
    ],
    defense: [
      { pos: 'DL', x: 0.40, y: 1, num: 90 },
      { pos: 'DL', x: 0.60, y: 1, num: 93 },
      { pos: 'LB', x: 0.35, y: 5, num: 55 },
      { pos: 'LB', x: 0.65, y: 5, num: 42 },
      { pos: 'CB', x: 0.12, y: 3, num: 24 },
      { pos: 'CB', x: 0.88, y: 3, num: 2 },
      { pos: 'S', x: 0.50, y: 11, num: 21 },
    ],
  },
  'iform_under_center': {
    offense: [
      { pos: 'OL', x: 0.50, y: 0, num: 72 },
      { pos: 'QB', x: 0.50, y: -1, num: 7 },
      { pos: 'FB', x: 0.50, y: -4, num: 34 },
      { pos: 'RB', x: 0.50, y: -6, num: 25 },
      { pos: 'WR', x: 0.12, y: 0, num: 1 },
      { pos: 'WR', x: 0.88, y: 0, num: 11 },
      { pos: 'TE', x: 0.65, y: 0, num: 82 },
    ],
    defense: [
      { pos: 'DL', x: 0.40, y: 1, num: 90 },
      { pos: 'DL', x: 0.60, y: 1, num: 93 },
      { pos: 'LB', x: 0.30, y: 4, num: 55 },
      { pos: 'LB', x: 0.50, y: 5, num: 42 },
      { pos: 'LB', x: 0.70, y: 4, num: 52 },
      { pos: 'CB', x: 0.12, y: 3, num: 24 },
      { pos: 'S', x: 0.50, y: 11, num: 21 },
    ],
  },
  'trips_right': {
    offense: [
      { pos: 'OL', x: 0.50, y: 0, num: 72 },
      { pos: 'QB', x: 0.50, y: -5, num: 7 },
      { pos: 'RB', x: 0.42, y: -4, num: 25 },
      { pos: 'WR', x: 0.12, y: 0, num: 1 },
      { pos: 'WR', x: 0.72, y: 0, num: 4 },
      { pos: 'WR', x: 0.80, y: -1, num: 82 },
      { pos: 'WR', x: 0.92, y: 0, num: 11 },
    ],
    defense: [
      { pos: 'DL', x: 0.40, y: 1, num: 90 },
      { pos: 'DL', x: 0.60, y: 1, num: 93 },
      { pos: 'LB', x: 0.45, y: 5, num: 55 },
      { pos: 'CB', x: 0.12, y: 3, num: 24 },
      { pos: 'CB', x: 0.72, y: 2, num: 2 },
      { pos: 'CB', x: 0.92, y: 3, num: 5 },
      { pos: 'S', x: 0.50, y: 11, num: 21 },
    ],
  },
  'empty_5_wide': {
    offense: [
      { pos: 'OL', x: 0.50, y: 0, num: 72 },
      { pos: 'QB', x: 0.50, y: -5, num: 7 },
      { pos: 'WR', x: 0.08, y: 0, num: 1 },
      { pos: 'WR', x: 0.25, y: -1, num: 82 },
      { pos: 'WR', x: 0.50, y: -3, num: 3 },
      { pos: 'WR', x: 0.75, y: -1, num: 4 },
      { pos: 'WR', x: 0.92, y: 0, num: 11 },
    ],
    defense: [
      { pos: 'DL', x: 0.40, y: 1, num: 90 },
      { pos: 'DL', x: 0.60, y: 1, num: 93 },
      { pos: 'LB', x: 0.50, y: 5, num: 42 },
      { pos: 'CB', x: 0.08, y: 3, num: 24 },
      { pos: 'CB', x: 0.25, y: 4, num: 2 },
      { pos: 'CB', x: 0.75, y: 4, num: 5 },
      { pos: 'S', x: 0.50, y: 11, num: 21 },
    ],
  },
};

// ── PRE-RENDERED GLOW SPRITE CACHE ──
var _glowCache = {};

function getGlowSprite(rgb, radius, intensity) {
  var key = rgb.join(',') + ':' + radius + ':' + intensity;
  if (_glowCache[key]) return _glowCache[key];

  var size = radius * 4;
  var cv = document.createElement('canvas');
  cv.width = size; cv.height = size;
  var c = cv.getContext('2d');
  var cx = size / 2, cy = size / 2;
  var grad = c.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.95 * intensity) + ')');
  grad.addColorStop(0.2, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.7 * intensity) + ')');
  grad.addColorStop(0.5, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.3 * intensity) + ')');
  grad.addColorStop(0.8, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.08 * intensity) + ')');
  grad.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
  c.fillStyle = grad;
  c.fillRect(0, 0, size, size);
  _glowCache[key] = cv;
  return cv;
}

// ── PORTRAIT FIELD RENDERER ──

/**
 * Create the field renderer. Returns an object with { canvas, render(state) }.
 * @param {number} width - canvas CSS width (e.g. 375 for mobile)
 * @param {number} height - canvas CSS height (e.g. 260 for field strip area)
 */
export function createFieldRenderer(width, height) {
  var canvas = document.createElement('canvas');
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * DPR;
  canvas.height = height * DPR;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  var ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  // Portrait: width = sideline-to-sideline, height = yard axis
  // Show ~30 yards for more spread — yards feel bigger, more room for action
  var VISIBLE_YARDS = 30;
  var YPX = height / VISIBLE_YARDS; // pixels per yard in portrait
  var fieldW = width; // sideline to sideline

  // Hash mark positions (as fraction of width) — NFL standard
  // In landscape: topY=185.7 out of H=420.2 → 0.442 from top
  var hashLeft = 0.442;
  var hashRight = 1 - 0.442;

  // Pre-create Path2D objects
  var bodyPath = new Path2D(CFG.football.bodyPath);
  var lacesPath = new Path2D(CFG.football.lacesPath);
  var flamePath = new Path2D(CFG.flame.path);

  // ── STATIC LAYER (pre-rendered once per ball position) ──
  var staticCv = document.createElement('canvas');
  staticCv.width = width * DPR;
  staticCv.height = height * DPR;
  var sCtx = staticCv.getContext('2d');
  sCtx.scale(DPR, DPR);

  function drawStaticField(centerYard) {
    var c = sCtx;
    var topYard = centerYard - VISIBLE_YARDS / 2;

    // Convert absolute yard to canvas Y
    function yardToY(absYard) {
      return (absYard - topYard) * YPX;
    }

    // 1. Background
    c.fillStyle = CFG.bg;
    c.fillRect(0, 0, fieldW, height);

    // (LED tile grid removed — too distracting at portrait scale)

    // 3. End zones (yards 0-10 and 110-120)
    drawEndZonePortrait(c, 0, 10, true, topYard);
    drawEndZonePortrait(c, 110, 120, false, topYard);

    // 4. Yard lines (horizontal in portrait)
    for (var yd = 10; yd <= 110; yd++) {
      var py = yardToY(yd);
      if (py < -5 || py > height + 5) continue;

      if (yd === 10 || yd === 110) {
        // Goal lines — orange/gold with glow
        c.save();
        c.shadowColor = CFG.goal.glowColor;
        c.shadowBlur = CFG.goal.glowBlur;
        c.strokeStyle = CFG.goal.color;
        c.lineWidth = CFG.goal.w;
        c.beginPath(); c.moveTo(0, py); c.lineTo(fieldW, py); c.stroke();
        c.restore();
      } else if (yd % 10 === 0) {
        c.strokeStyle = CFG.yard.color;
        c.lineWidth = CFG.yard.w10;
        c.beginPath(); c.moveTo(0, py); c.lineTo(fieldW, py); c.stroke();
      } else if (yd % 5 === 0) {
        c.strokeStyle = CFG.yard.color;
        c.lineWidth = CFG.yard.w5;
        c.beginPath(); c.moveTo(0, py); c.lineTo(fieldW, py); c.stroke();
      }
    }

    // 5. Hash marks (vertical ticks in portrait)
    c.strokeStyle = CFG.hash.color;
    c.lineWidth = 1;
    var hLen = CFG.hash.len * (YPX / 7.88);
    var hxL = fieldW * hashLeft;
    var hxR = fieldW * hashRight;
    for (var hyd = 11; hyd < 110; hyd++) {
      if (hyd % 5 === 0) continue;
      var hy = yardToY(hyd);
      if (hy < -5 || hy > height + 5) continue;
      c.beginPath(); c.moveTo(hxL - hLen / 2, hy); c.lineTo(hxL + hLen / 2, hy); c.stroke();
      c.beginPath(); c.moveTo(hxR - hLen / 2, hy); c.lineTo(hxR + hLen / 2, hy); c.stroke();
    }

    // 6. Numbers (straddle yard lines vertically)
    for (var nyd = 20; nyd <= 100; nyd += 10) {
      var ny = yardToY(nyd);
      if (ny < -30 || ny > height + 30) continue;
      var val = nyd > 60 ? 110 - nyd : nyd - 10;
      drawNumPortrait(c, val, fieldW * 0.20, ny, nyd, topYard, false);
      drawNumPortrait(c, val, fieldW * 0.80, ny, nyd, topYard, true);
    }

    // 7. Football icons at 35-yard lines (yards 45 and 75)
    [45, 75].forEach(function(fyd) {
      var fy = yardToY(fyd);
      if (fy < -20 || fy > height + 20) return;
      drawFootballPortrait(c, fieldW / 2, fy);
    });

    // 8. Midfield flame (yard 60, static at 12% opacity)
    var midY = yardToY(60);
    if (midY > -40 && midY < height + 40) {
      c.save();
      c.translate(fieldW / 2, midY);
      c.rotate(-Math.PI / 2); // rotate 90° for portrait
      c.globalAlpha = CFG.flame.alpha;
      var fsc = 1.5;
      c.scale(fsc, fsc);
      c.translate(-22, -26);
      c.fillStyle = CFG.flame.color;
      c.fill(flamePath);
      c.restore();
    }

    // 9. Noise overlay
    c.globalAlpha = CFG.noise.opacity;
    for (var ni = 0; ni < CFG.noise.count; ni++) {
      c.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      c.fillRect(Math.random() * fieldW, Math.random() * height, 1, 1);
    }
    c.globalAlpha = 1;

    // 10. Border
    c.strokeStyle = CFG.border.color;
    c.lineWidth = CFG.border.w;
    c.strokeRect(1, 1, fieldW - 2, height - 2);
  }

  function drawEndZonePortrait(c, ydStart, ydEnd, isTop, topYard) {
    var y1 = (ydStart - topYard) * YPX;
    var y2 = (ydEnd - topYard) * YPX;
    if (y2 < 0 || y1 > height) return;
    var ezH = y2 - y1;

    c.fillStyle = CFG.endZone.fill;
    c.fillRect(0, y1, fieldW, ezH);

    // Diagonal stripes
    c.save();
    c.globalAlpha = CFG.endZone.stripeAlpha;
    c.strokeStyle = CFG.endZone.stripe;
    c.lineWidth = 2;
    for (var sy = -fieldW; sy < ezH + fieldW; sy += 14) {
      c.beginPath();
      c.moveTo(0, y1 + sy);
      c.lineTo(fieldW, y1 + sy + fieldW);
      c.stroke();
    }
    c.restore();

    // "TORCH" text — horizontal in portrait, centered in end zone
    c.save();
    var textY = (ydStart + ydEnd) / 2; // true center of end zone
    var ty = (textY - topYard) * YPX;
    if (ty > -50 && ty < height + 50) {
      c.translate(fieldW / 2, ty);
      if (!isTop) c.rotate(Math.PI);
      var letterW = fieldW * 0.12;
      c.font = "700 " + Math.min(40, fieldW * 0.10) + "px 'Teko'";
      c.fillStyle = CFG.endZone.textColor;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      var letters = 'TORCH'.split('');
      var totalSpan = fieldW * 0.50;
      var spacing = totalSpan / (letters.length - 1);
      var startX = -totalSpan / 2;
      letters.forEach(function(ch, i) { c.fillText(ch, startX + i * spacing, 0); });
      c.strokeStyle = CFG.endZone.textStroke;
      c.lineWidth = 2;
      letters.forEach(function(ch, i) { c.strokeText(ch, startX + i * spacing, 0); });
      c.fillStyle = CFG.endZone.textHighlight;
      letters.forEach(function(ch, i) { c.fillText(ch, startX + i * spacing, -1); });
    }
    c.restore();

    // Inner border along goal line
    var borderY = isTop ? y2 : y1;
    c.strokeStyle = CFG.endZone.innerBorder;
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(2, borderY); c.lineTo(fieldW - 2, borderY); c.stroke();
  }

  function drawNumPortrait(c, num, cx, cy, absYard, topYard, mirrored) {
    c.save();
    c.translate(cx, cy);
    // In portrait, numbers are rotated 90° to read along sidelines
    c.rotate(mirrored ? Math.PI / 2 : -Math.PI / 2);

    c.fillStyle = CFG.num.color;
    c.font = CFG.num.font;
    c.textBaseline = 'middle';
    var s = num.toString();
    c.textAlign = 'right'; c.fillText(s[0], -CFG.num.gap, 0);
    c.textAlign = 'left'; c.fillText(s[1] || '0', CFG.num.gap, 0);

    // Directional arrows
    if (num !== 50) {
      // In portrait, "points toward own goal" = points UP the screen (toward yard 0)
      var ptsUp = absYard < 60;
      var ax = ptsUp ? -CFG.num.arrowOff : CFG.num.arrowOff;
      var adir = ptsUp ? -1 : 1;
      if (mirrored) { ax *= -1; adir *= -1; }
      c.fillStyle = CFG.num.arrowColor;
      c.beginPath();
      c.moveTo(ax, -CFG.num.arrowSz);
      c.lineTo(ax + adir * CFG.num.arrowSz * 1.2, 0);
      c.lineTo(ax, CFG.num.arrowSz);
      c.fill();
    }
    c.restore();
  }

  function drawFootballPortrait(c, cx, cy) {
    c.save();
    c.translate(cx, cy);
    c.globalAlpha = CFG.football.alpha;
    var sc = CFG.football.scale;
    // Rotate for portrait: football points up/down instead of left/right
    c.rotate(Math.PI / 4); // 45° adjustment for portrait
    c.scale(sc, sc);
    c.translate(-256, -256);
    var grad = c.createLinearGradient(50, 50, 480, 480);
    grad.addColorStop(0, '#D4893B');
    grad.addColorStop(0.45, '#B5652B');
    grad.addColorStop(1, '#8B4A1F');
    c.fillStyle = grad;
    c.fill(bodyPath);
    c.fillStyle = '#FFFBE6';
    c.fill(lacesPath);
    c.restore();
  }

  // ── DYNAMIC LAYER (LOS, first down, player dots) ──

  function drawLOS(c, losYard, topYard) {
    var y = (losYard - topYard) * YPX;
    c.save();
    c.shadowColor = 'rgba(59,130,246,0.3)';
    c.shadowBlur = 6;
    c.strokeStyle = 'rgba(59,130,246,0.45)';
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, y); c.lineTo(fieldW, y); c.stroke();
    c.restore();
    // Badge label — inset from edge
    c.fillStyle = 'rgba(59,130,246,0.7)';
    c.font = "700 8px 'Teko'";
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillRect(8, y - 6, 20, 12);
    c.fillStyle = '#fff';
    c.fillText('LOS', 18, y);
  }

  function drawFirstDownMarker(c, fdYard, topYard) {
    var y = (fdYard - topYard) * YPX;
    c.save();
    c.shadowColor = 'rgba(251,191,36,0.3)';
    c.shadowBlur = 6;
    c.strokeStyle = 'rgba(251,191,36,0.45)';
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, y); c.lineTo(fieldW, y); c.stroke();
    c.restore();
    // Badge label — inset from edge
    c.fillStyle = 'rgba(251,191,36,0.7)';
    c.fillRect(fieldW - 28, y - 6, 20, 12);
    c.fillStyle = '#000';
    c.font = "700 8px 'Teko'";
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('1ST', fieldW - 18, y);
  }

  function drawPlayerDots(c, formation, losYard, topYard) {
    var form = FORMATIONS[formation] || FORMATIONS['shotgun_2x2'];
    var DOT_R = 20;
    var CORE_R = 12; // solid opaque inner circle

    // Helper: draw one player dot with dark backing so it eclipses lines
    function drawDot(px, py, rgb) {
      // 1. Dark backing circle — blocks whatever is underneath
      c.fillStyle = 'rgba(5,10,8,0.9)';
      c.beginPath();
      c.arc(px, py, CORE_R + 2, 0, Math.PI * 2);
      c.fill();

      // 2. Outer glow ring (additive)
      var prevComp = c.globalCompositeOperation;
      c.globalCompositeOperation = 'lighter';
      var sprite = getGlowSprite(rgb, DOT_R, 0.6);
      c.drawImage(sprite, px - DOT_R * 2, py - DOT_R * 2, DOT_R * 4, DOT_R * 4);
      c.globalCompositeOperation = prevComp;

      // 3. Solid bright core (normal blending)
      var grad = c.createRadialGradient(px, py, 0, px, py, CORE_R);
      grad.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.95)');
      grad.addColorStop(0.6, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.7)');
      grad.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.3)');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(px, py, CORE_R, 0, Math.PI * 2);
      c.fill();
    }

    // Draw all players
    form.offense.forEach(function(p) {
      var px = p.x * fieldW;
      var py = (losYard + p.y - topYard) * YPX;
      drawDot(px, py, CFG.offense);
    });

    form.defense.forEach(function(p) {
      var px = p.x * fieldW;
      var py = (losYard + p.y - topYard) * YPX;
      drawDot(px, py, CFG.defense);
    });

    // Ball glow at QB position
    var qb = form.offense.find(function(p) { return p.pos === 'QB'; });
    if (qb) {
      var bx = qb.x * fieldW;
      var by = (losYard + qb.y - topYard) * YPX;
      c.fillStyle = 'rgba(255,220,140,0.4)';
      c.beginPath();
      c.arc(bx, by, 6, 0, Math.PI * 2);
      c.fill();
    }

    // Jersey numbers on top (not additive)
    var allPlayers = form.offense.map(function(p) { return { p: p, side: 'off', losY: losYard }; })
      .concat(form.defense.map(function(p) { return { p: p, side: 'def', losY: losYard }; }));

    allPlayers.forEach(function(d) {
      var p = d.p;
      var px = p.x * fieldW;
      var py = (d.losY + p.y - topYard) * YPX;
      c.font = "700 11px 'Teko'";
      c.fillStyle = 'rgba(0,0,0,0.8)';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(p.num, px, py);
    });
  }

  // ── PUBLIC RENDER ──
  var _lastCenter = -1;

  /**
   * Render the field.
   * @param {object} state
   * @param {number} state.ballYard - absolute yard position of the ball (10-110)
   * @param {number} state.losYard - LOS absolute yard
   * @param {number} state.firstDownYard - first down marker yard
   * @param {string} state.formation - formation key
   */
  function render(state) {
    var ballYard = state.ballYard || 50;
    var losYard = state.losYard || ballYard;
    var fdYard = state.firstDownYard || losYard + 10;
    var formation = state.formation || 'shotgun_2x2';

    // Clamp center so we don't show beyond the field
    var center = Math.max(VISIBLE_YARDS / 2, Math.min(120 - VISIBLE_YARDS / 2, ballYard));
    var topYard = center - VISIBLE_YARDS / 2;

    // Re-render static layer if center changed
    if (Math.abs(center - _lastCenter) > 0.5) {
      drawStaticField(center);
      _lastCenter = center;
    }

    // Composite: static + dynamic
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(staticCv, 0, 0, width * DPR, height * DPR, 0, 0, width, height);

    // Dynamic overlays
    drawLOS(ctx, losYard, topYard);
    if (fdYard > losYard && fdYard <= 110) {
      drawFirstDownMarker(ctx, fdYard, topYard);
    }
    drawPlayerDots(ctx, formation, losYard, topYard);
  }

  return { canvas: canvas, render: render, FORMATIONS: FORMATIONS };
}
