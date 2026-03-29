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
  yard: { color: 'rgba(255,255,255,0.25)', w10: 2, w5: 1.2 },
  goal: { color: 'rgba(255,160,20,0.45)', w: 4, glowColor: 'rgba(255,140,0,0.3)', glowBlur: 8 },
  border: { color: 'rgba(255,255,255,0.30)', w: 2.5 },
  hash: { color: 'rgba(255,255,255,0.12)', len: 5.25 },
  num: { color: 'rgba(255,245,220,0.20)', font: "700 36px 'Teko'", gap: 2, arrowOff: 22, arrowSz: 6, arrowColor: 'rgba(255,120,20,0.15)' },
  endZone: { fill: 'rgba(255,69,17,0.06)', stripe: '#FF4511', stripeAlpha: 0.018, textColor: 'rgba(255,69,17,0.18)', textStroke: 'rgba(255,69,17,0.12)', textHighlight: 'rgba(235,176,16,0.06)', innerBorder: 'rgba(255,69,17,0.15)' },
  los: { color: 'rgba(59,130,246,0.85)', w: 3, blur: 10 },
  firstDown: { color: 'rgba(251,191,36,0.85)', w: 3, blur: 10 },
  noise: { opacity: 0.04, count: 600 },
  flame: { path: 'M22 0C22 0 6 16 4 28C2 40 12 48 18 52C18 52 13 42 18 30C20 24 21 19 22 13C23 19 24 24 26 30C31 42 26 52 26 52C32 48 42 40 40 28C38 16 22 0 22 0Z', color: '#FF4511', alpha: 0.12 },
  // Team dot color map (accent colors — visible on dark field)
  teamDotColors: {
    sentinels: [196, 162, 101],  // Boars gold
    wolves:    [232, 84, 143],  // Dolphins pink
    stags:     [93, 173, 226],   // Spectres ice blue
    serpents:  [57, 255, 20],    // Serpents green
  },
  football: {
    bodyPath: 'M247.5 25.4c-13.5 3.3-26.4 7.2-38.6 11.7C142.9 61.6 96.7 103.6 66 153.6C47.8 183.4 35.1 215.9 26.9 249L264.5 486.6c13.5-3.3 26.4-7.2 38.6-11.7c66-24.5 112.2-66.5 142.9-116.5c18.3-29.8 30.9-62.3 39.1-95.3L247.5 25.4zM495.2 205.3c6.1-56.8 1.4-112.2-7.7-156.4c-2.7-12.9-13-22.9-26.1-25.1c-58.2-9.7-109.9-12-155.6-7.9L495.2 205.3zM206.1 496L16.8 306.7c-6.1 56.8-1.4 112.2 7.7 156.4c2.7 12.9 13 22.9 26.1 25.1c58.2 9.7 109.9 12 155.6 7.9z',
    lacesPath: 'M260.7 164.7c6.2-6.2 16.4-6.2 22.6 0l64 64c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6zm-48 48c6.2-6.2 16.4-6.2 22.6 0l64 64c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6zm-48 48c6.2-6.2 16.4-6.2 22.6 0l64 64c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6z',
    alpha: 0.13, scale: 0.065
  },
  // Player dot glow colors
  offense: [242, 140, 40],  // Spectres orange
  defense: [59, 165, 93],   // Wolves green
};

// ── 7v7 FORMATIONS ── (Source: TORCH-7v7-FOOTBALL-RESEARCH.md)
// Offense: 1 QB + 3 OL (LG, C, RG at LOS) + 3 skill (WR/RB/TE/SLOT)
// Defense: 3 DL (DE, DT, DE) + 4 coverage (LB/CB/S)
// y = yards from LOS. Negative = behind LOS (offense), positive = past LOS (defense).

// OL cluster: ALWAYS 0.42, 0.50, 0.58 — tight ≤1yd splits per USA Football rules
var OL = [
  { pos: 'OL', x: 0.42, y: 0, num: 65 },  // LG
  { pos: 'OL', x: 0.50, y: 0, num: 72 },  // C
  { pos: 'OL', x: 0.58, y: 0, num: 68 },  // RG
];
// DL: outside shade on guards + head-up on center, 1 yard off LOS
var DL = [
  { pos: 'DL', x: 0.35, y: 1, num: 91 },  // DE (weak)
  { pos: 'DL', x: 0.50, y: 1, num: 97 },  // DT/NT
  { pos: 'DL', x: 0.65, y: 1, num: 93 },  // DE (strong)
];

// ── DEFENSIVE ALIGNMENTS ── (Section 4)
var DEF_BASE = [        // 3-1-2-1: Cover 1/3 base
  { pos: 'LB', x: 0.50, y: 5, num: 55 },
  { pos: 'CB', x: 0.10, y: 7, num: 24 },
  { pos: 'CB', x: 0.90, y: 7, num: 2 },
  { pos: 'S',  x: 0.50, y: 12, num: 21 },
];
var DEF_TWO_HIGH = [    // 3-1-1-2: Cover 2 shell — CBs play flat, S split deep halves
  { pos: 'LB', x: 0.50, y: 5, num: 55 },
  { pos: 'CB', x: 0.15, y: 5, num: 24 },
  { pos: 'S',  x: 0.30, y: 12, num: 21 },
  { pos: 'S',  x: 0.70, y: 12, num: 2 },
];
var DEF_COVER3 = [      // 3-0-3-1: three-under, one deep — no true LB
  { pos: 'CB', x: 0.12, y: 6, num: 24 },
  { pos: 'LB', x: 0.50, y: 5, num: 55 },
  { pos: 'CB', x: 0.88, y: 6, num: 2 },
  { pos: 'S',  x: 0.50, y: 12, num: 21 },
];
var DEF_PRESS = [       // 3-1-3-0: Cover 0 press man — no deep safety, max aggression
  { pos: 'LB', x: 0.50, y: 3, num: 55 },
  { pos: 'CB', x: 0.09, y: 0.5, num: 24 },
  { pos: 'CB', x: 0.91, y: 0.5, num: 2 },
  { pos: 'S',  x: 0.50, y: 5, num: 5 },
];
var DEF_NICKEL = [      // 3-2-1-1: extra LB for run support
  { pos: 'LB', x: 0.38, y: 5, num: 55 },
  { pos: 'LB', x: 0.62, y: 5, num: 42 },
  { pos: 'CB', x: 0.50, y: 7, num: 24 },
  { pos: 'S',  x: 0.50, y: 10, num: 21 },
];

const FORMATIONS = {
  // ── Shotgun Deuce (2×2) ── Section 3A
  // Balanced spread: 2 receivers each side, RB offset behind QB.
  // Good for slant-arrow, smash, hitch concepts. Zone reads + draws.
  'shotgun_deuce': {
    offense: OL.concat([
      { pos: 'WR',  x: 0.08, y: 0, num: 1 },     // wide left
      { pos: 'WR',  x: 0.92, y: 0, num: 11 },     // wide right
      { pos: 'QB',  x: 0.50, y: -4, num: 7 },     // shotgun
      { pos: 'RB',  x: 0.55, y: -6, num: 25 },    // offset right behind QB
    ]),
    defense: DL.concat(DEF_BASE),
  },
  // ── Trips (3×1) ── Section 3B
  // 3 receivers strong side, iso WR backside. Flood & mesh concepts.
  // Trips to screen-right (QB's right). WR1 isolated backside.
  'trips': {
    offense: OL.concat([
      { pos: 'WR',   x: 0.08, y: 0, num: 1 },     // iso backside (wide left)
      { pos: 'WR',   x: 0.80, y: 0, num: 11 },    // trips outside
      { pos: 'SLOT', x: 0.72, y: -1, num: 82 },   // trips middle (off LOS)
      { pos: 'QB',   x: 0.50, y: -4, num: 7 },
    ]),
    defense: DL.concat([  // Cover 3 look — 3 under trips side, S deep
      { pos: 'CB', x: 0.08, y: 7, num: 24 },      // on iso WR
      { pos: 'CB', x: 0.80, y: 6, num: 2 },       // on trips outside
      { pos: 'LB', x: 0.72, y: 5, num: 55 },      // robber under trips
      { pos: 'S',  x: 0.55, y: 12, num: 21 },     // deep, cheated strong
    ]),
  },
  // ── Twins (2×1 Open) ── Section 3C
  // 2 receivers strong side (WR + SLOT), iso WR backside. RB in backfield.
  // Strong side screen-right. Good for slant-wheel, comeback-vertical.
  'twins': {
    offense: OL.concat([
      { pos: 'WR',   x: 0.08, y: 0, num: 1 },     // wide left (iso backside)
      { pos: 'WR',   x: 0.92, y: 0, num: 11 },    // wide right (twins outside)
      { pos: 'SLOT', x: 0.78, y: -1, num: 82 },   // slot right (twins inside, off LOS)
      { pos: 'QB',   x: 0.50, y: -4, num: 7 },
    ]),
    defense: DL.concat(DEF_BASE),
  },
  // ── Tight Bunch ── Section 3D
  // 3 skill players stacked/bunched within ~3 yards. Man-coverage killer.
  // Bunch to screen-right. WR1 iso backside.
  'bunch': {
    offense: OL.concat([
      { pos: 'WR',   x: 0.08, y: 0, num: 1 },     // iso backside
      { pos: 'TE',   x: 0.65, y: 0, num: 82 },    // bunch point (on LOS, tight to RG)
      { pos: 'WR',   x: 0.70, y: -1, num: 11 },   // stacked behind TE
      { pos: 'QB',   x: 0.50, y: -4, num: 7 },
    ]),
    defense: DL.concat([  // Press/bracket on bunch, CB on iso
      { pos: 'CB', x: 0.08, y: 7, num: 24 },      // on iso WR
      { pos: 'CB', x: 0.67, y: 5, num: 2 },       // on bunch
      { pos: 'LB', x: 0.50, y: 5, num: 55 },      // spy / hook zone
      { pos: 'S',  x: 0.50, y: 12, num: 21 },     // deep middle
    ]),
  },
  // ── I-Form / Pistol ── Section 3E
  // Power run formation. QB at pistol depth, RB directly behind. 2 WRs wide.
  // Play-action devastating. OL fires forward in run blocking.
  'iform_pistol': {
    offense: OL.concat([
      { pos: 'WR', x: 0.08, y: 0, num: 1 },       // wide left
      { pos: 'WR', x: 0.92, y: 0, num: 11 },      // wide right
      { pos: 'QB', x: 0.50, y: -2, num: 7 },      // pistol depth
      { pos: 'RB', x: 0.50, y: -5, num: 25 },     // directly behind QB
    ]),
    defense: DL.concat(DEF_NICKEL),  // Nickel: 2 LBs in box for run support
  },
  // ── Empty ── Section 3F
  // No RB. All 3 skill out as receivers. Maximum passing threat.
  // QB alone in backfield. QB draw is the only run option.
  'empty': {
    offense: OL.concat([
      { pos: 'WR',   x: 0.05, y: 0, num: 1 },     // wide left
      { pos: 'SLOT', x: 0.25, y: -1, num: 82 },   // left slot
      { pos: 'WR',   x: 0.95, y: 0, num: 11 },    // wide right
      { pos: 'QB',   x: 0.50, y: -5, num: 7 },    // alone, deep shotgun
    ]),
    defense: DL.concat(DEF_COVER3),  // Cover 3: three-under zone, S deep
  },
};

// Backward compat aliases (old names → new)
FORMATIONS['shotgun_spread'] = FORMATIONS['shotgun_deuce'];
FORMATIONS['shotgun_2x2'] = FORMATIONS['shotgun_deuce'];
FORMATIONS['trips_right'] = FORMATIONS['trips'];
FORMATIONS['iform_tight'] = FORMATIONS['iform_pistol'];
FORMATIONS['iform_under_center'] = FORMATIONS['iform_pistol'];
FORMATIONS['singleback_wing'] = FORMATIONS['twins'];
FORMATIONS['bunch_left'] = FORMATIONS['bunch'];
FORMATIONS['pistol_twins'] = FORMATIONS['twins'];
FORMATIONS['empty_3_wide'] = FORMATIONS['empty'];

// ── PLAY TYPE → FORMATION MAPPING ──
var PLAY_FORMATION_MAP = {
  DEEP:   'empty',           // max receivers, vertical threats
  SHORT:  'shotgun_deuce',   // balanced, 2-level reads
  QUICK:  'bunch',           // pick/rub routes, quick release
  SCREEN: 'trips',           // flood the trips side, screen to flat
  RUN:    'iform_pistol',    // power run, play-action
};

// Per-team overrides (Source: TORCH-TEAM-SCHEME-IDENTITY.md)
// Each team favors formations that match their offensive philosophy.
var TEAM_FORMATION_MAP = {
  // Boars — Power Spread: I-Form 40%, Twins 30%, Deuce 20%, Trips 10%
  sentinels: { DEEP: 'twins', SHORT: 'twins', QUICK: 'shotgun_deuce', SCREEN: 'twins', RUN: 'iform_pistol' },
  // Dolphins — Spread Option: Deuce 35%, Pistol 25%, Trips 25%, Empty 10%
  wolves:    { DEEP: 'trips', SHORT: 'shotgun_deuce', QUICK: 'shotgun_deuce', SCREEN: 'trips', RUN: 'shotgun_deuce' },
  // Spectres — Air Raid: Trips 35%, Deuce 30%, Empty 20%, Bunch 10%
  stags:     { DEEP: 'empty', SHORT: 'trips', QUICK: 'trips', SCREEN: 'shotgun_deuce', RUN: 'shotgun_deuce' },
  // Serpents — Multiple/Pro Style: Twins 25%, Bunch 20%, Deuce 20%, I-Form 15%, Trips 15%
  serpents:  { DEEP: 'twins', SHORT: 'bunch', QUICK: 'bunch', SCREEN: 'twins', RUN: 'twins' },
};

// Weighted formation pools for variety (team → playType → [[formation, weight], ...])
// When rendering, pick from this pool randomly (weighted) instead of always the same formation.
var TEAM_FORMATION_POOLS = {
  sentinels: {
    RUN:    [['iform_pistol',55],['twins',30],['shotgun_deuce',15]],
    SHORT:  [['twins',35],['iform_pistol',35],['shotgun_deuce',25],['trips',5]],
    DEEP:   [['twins',35],['iform_pistol',25],['shotgun_deuce',25],['trips',15]],
    QUICK:  [['shotgun_deuce',40],['twins',35],['iform_pistol',15],['trips',10]],
    SCREEN: [['twins',40],['shotgun_deuce',30],['iform_pistol',20],['trips',10]],
  },
  wolves: {
    RUN:    [['shotgun_deuce',40],['iform_pistol',30],['trips',20],['twins',10]],
    SHORT:  [['shotgun_deuce',35],['trips',30],['twins',20],['iform_pistol',15]],
    DEEP:   [['trips',35],['shotgun_deuce',30],['empty',20],['twins',15]],
    QUICK:  [['shotgun_deuce',35],['trips',30],['twins',25],['empty',10]],
    SCREEN: [['trips',35],['shotgun_deuce',35],['twins',20],['empty',10]],
  },
  stags: {
    RUN:    [['shotgun_deuce',40],['trips',30],['twins',20],['iform_pistol',10]],
    SHORT:  [['trips',35],['shotgun_deuce',30],['empty',20],['bunch',15]],
    DEEP:   [['empty',30],['trips',30],['shotgun_deuce',25],['bunch',15]],
    QUICK:  [['trips',35],['shotgun_deuce',30],['empty',20],['bunch',15]],
    SCREEN: [['shotgun_deuce',35],['trips',35],['empty',20],['bunch',10]],
  },
  serpents: {
    RUN:    [['twins',30],['iform_pistol',25],['shotgun_deuce',25],['bunch',20]],
    SHORT:  [['bunch',25],['twins',25],['shotgun_deuce',20],['trips',20],['iform_pistol',10]],
    DEEP:   [['twins',25],['trips',25],['empty',20],['shotgun_deuce',20],['bunch',10]],
    QUICK:  [['bunch',30],['twins',25],['shotgun_deuce',25],['trips',20]],
    SCREEN: [['twins',30],['bunch',25],['shotgun_deuce',25],['trips',20]],
  },
};

// Pick a weighted-random formation for a team + play type
function pickFormation(teamId, playType) {
  var pools = TEAM_FORMATION_POOLS[teamId];
  if (!pools) return null;
  var pool = pools[playType];
  if (!pool) return null;
  var total = 0;
  for (var i = 0; i < pool.length; i++) total += pool[i][1];
  var r = Math.random() * total;
  for (var j = 0; j < pool.length; j++) {
    r -= pool[j][1];
    if (r <= 0) return pool[j][0];
  }
  return pool[pool.length - 1][0];
}

// ── DEFENSE SCHEME → ALIGNMENT MAPPING ──
// Maps TORCH's engine coverage names (defScheme) to the 5 defensive alignment variants.
// Values correspond to DEF_* alignment arrays defined above (Section 4).
// NOTE: Not yet wired into the rendering pipeline — ready for when defScheme is passed
// in state. When integrated, resolve the alignment string to the matching DEF_* array
// and override formation.defense before rendering.
var DEF_FORMATION_MAP = {
  ZONE:     'DEF_COVER3',  // 3-0-3-1: three-under zone, deep S — Boars Cover 3 shell
  BLITZ:    'DEF_PRESS',   // 3-1-3-0: Cover 0 press man, max aggression — Spectres blitz
  PRESSURE: 'DEF_PRESS',   // 3-1-3-0: same press look, interior pass rush emphasis
  HYBRID:   'DEF_COVER3',  // 3-0-3-1: disguised zone shell — Serpents multiple look
  MAN:      'DEF_BASE',    // 3-1-2-1: Cover 1/3 base man — Dolphins spy shell
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

// ── PRE-RENDERED NEON LINE SPRITE CACHE ──
var _neonCache = {};

function getNeonLineSprite(lineW, rgb, alpha) {
  var key = lineW + ':' + rgb.join(',') + ':' + alpha;
  if (_neonCache[key]) return _neonCache[key];

  var stripH = 20; // total height including glow
  var cv = document.createElement('canvas');
  cv.width = Math.ceil(lineW);
  cv.height = stripH;
  var c = cv.getContext('2d');
  var cy = stripH / 2;
  var r = rgb[0], g = rgb[1], b = rgb[2];

  // Layer 1: Wide soft bloom
  c.globalCompositeOperation = 'lighter';
  var g1 = c.createLinearGradient(0, 0, 0, stripH);
  g1.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0)');
  g1.addColorStop(0.3, 'rgba(' + r + ',' + g + ',' + b + ',' + (0.06 * alpha) + ')');
  g1.addColorStop(0.5, 'rgba(' + r + ',' + g + ',' + b + ',' + (0.15 * alpha) + ')');
  g1.addColorStop(0.7, 'rgba(' + r + ',' + g + ',' + b + ',' + (0.06 * alpha) + ')');
  g1.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
  c.fillStyle = g1;
  c.fillRect(0, 0, lineW, stripH);

  // Layer 2: Medium colored glow
  c.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.35 * alpha) + ')';
  c.lineWidth = 5;
  c.beginPath(); c.moveTo(0, cy); c.lineTo(lineW, cy); c.stroke();

  // Layer 3: Bright core line
  c.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.6 * alpha) + ')';
  c.lineWidth = 2;
  c.beginPath(); c.moveTo(0, cy); c.lineTo(lineW, cy); c.stroke();

  // Layer 4: White-hot center
  var wr = Math.min(255, r + 100), wg = Math.min(255, g + 100), wb = Math.min(255, b + 100);
  c.strokeStyle = 'rgba(' + wr + ',' + wg + ',' + wb + ',' + (0.8 * alpha) + ')';
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(0, cy); c.lineTo(lineW, cy); c.stroke();

  c.globalCompositeOperation = 'source-over';
  _neonCache[key] = { cv: cv, h: stripH };
  return _neonCache[key];
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
  // Show ~25 yards — big dots, zoomed in, plenty of spacing
  var VISIBLE_YARDS = 25;
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

  // Pre-render noise texture once (avoids 600 fillRect calls per redraw)
  var noiseCv = document.createElement('canvas');
  noiseCv.width = width * DPR; noiseCv.height = height * DPR;
  var nCtx = noiseCv.getContext('2d');
  nCtx.scale(DPR, DPR);
  for (var _ni = 0; _ni < CFG.noise.count; _ni++) {
    nCtx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
    nCtx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
  }

  function drawStaticField(centerYard, extraYards) {
    var c = sCtx;
    var topYard = centerYard - VISIBLE_YARDS / 2;
    var renderHeight = height + (extraYards || 0) * YPX;

    // Convert absolute yard to canvas Y
    function yardToY(absYard) {
      return (absYard - topYard) * YPX;
    }

    // 1. Background
    c.fillStyle = CFG.bg;
    c.fillRect(0, 0, fieldW, renderHeight);

    // 2a. Mowing stripes (alternating 5-yard bands — broadcast look)
    var centerY = height / 2;
    for (var myd = 0; myd < 120; myd += 5) {
      var my1 = (myd - topYard) * YPX;
      var my2 = ((myd + 5) - topYard) * YPX;
      if (my2 < 0 || my1 > renderHeight) continue;
      var stripeIdx = (myd / 5) % 2;

      // Light direction — stripes closer to center are slightly brighter
      var stripeMidY = my1 + YPX * 2.5;
      var distFromCenter = Math.abs(stripeMidY - centerY) / (height / 2);
      var lightMod = 1 - distFromCenter * 0.3; // 0.7 at edges, 1.0 at center

      if (stripeIdx === 0) {
        // Even bands: slightly greener tint (the "mowed toward camera" look)
        var baseAlpha = 0.025 * lightMod;

        // Soft top edge — 2px gradient transition into stripe
        var edgeGrad = c.createLinearGradient(0, my1, 0, Math.min(my1 + 2, my2));
        edgeGrad.addColorStop(0, 'rgba(0,255,100,0)');
        edgeGrad.addColorStop(1, 'rgba(0,255,100,' + baseAlpha + ')');
        c.fillStyle = edgeGrad;
        c.fillRect(0, my1, fieldW, Math.min(2, my2 - my1));

        // Stripe body fill
        if (my2 - my1 > 2) {
          c.fillStyle = 'rgba(0,255,100,' + baseAlpha + ')';
          c.fillRect(0, my1 + 2, fieldW, my2 - my1 - 2);
        }
      } else {
        // Odd bands: very slight darkening (the "mowed away from camera" look)
        var darkAlpha = 0.012 * lightMod;
        c.fillStyle = 'rgba(0,0,0,' + darkAlpha + ')';
        c.fillRect(0, my1, fieldW, my2 - my1);
      }
    }

    // 2b. Stadium ambient light (center bright, edges dark)
    var lightGrad = c.createRadialGradient(fieldW / 2, height / 2, 0, fieldW / 2, height / 2, fieldW * 0.7);
    lightGrad.addColorStop(0, 'rgba(180,220,180,0.03)');
    lightGrad.addColorStop(0.4, 'rgba(140,180,140,0.015)');
    lightGrad.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = lightGrad;
    c.fillRect(0, 0, fieldW, renderHeight);

    // 2c. Vignette (edge darkening) — always based on visible height, not buffer
    var vigGrad = c.createRadialGradient(fieldW / 2, height / 2, Math.min(fieldW, height) * 0.35, fieldW / 2, height / 2, Math.max(fieldW, height) * 0.75);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(0.5, 'rgba(0,0,0,0.08)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.25)');
    c.fillStyle = vigGrad;
    c.fillRect(0, 0, fieldW, renderHeight);

    // 2d. Atmospheric depth (top = far = slightly darker)
    var depthGrad = c.createLinearGradient(0, 0, 0, renderHeight);
    depthGrad.addColorStop(0, 'rgba(0,0,0,0.10)');
    depthGrad.addColorStop(0.35, 'rgba(0,0,0,0.03)');
    depthGrad.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = depthGrad;
    c.fillRect(0, 0, fieldW, renderHeight);

    // 3. End zones (yards 0-10 and 110-120)
    var offRGB = (_renderState.offTeam && CFG.teamDotColors[_renderState.offTeam]) || [255, 69, 17];
    var defRGB = (_renderState.defTeam && CFG.teamDotColors[_renderState.defTeam]) || [255, 69, 17];
    drawEndZonePortrait(c, 0, 10, true, topYard, defRGB);
    drawEndZonePortrait(c, 110, 120, false, topYard, offRGB);

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

    // 9. Noise overlay (pre-rendered)
    c.globalAlpha = CFG.noise.opacity;
    c.drawImage(noiseCv, 0, 0, fieldW, renderHeight);
    c.globalAlpha = 1;

    // 10. Double-line sideline border
    c.strokeStyle = 'rgba(255,255,255,0.25)';
    c.lineWidth = 2;
    c.strokeRect(1, 1, fieldW - 2, height - 2);
    c.strokeStyle = 'rgba(255,255,255,0.08)';
    c.lineWidth = 1;
    c.strokeRect(5, 5, fieldW - 10, height - 10);
    // Edge fade (out-of-bounds darkening)
    var sideGradL = c.createLinearGradient(0, 0, 10, 0);
    sideGradL.addColorStop(0, 'rgba(0,0,0,0.20)');
    sideGradL.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = sideGradL;
    c.fillRect(0, 0, 10, height);
    var sideGradR = c.createLinearGradient(fieldW, 0, fieldW - 10, 0);
    sideGradR.addColorStop(0, 'rgba(0,0,0,0.20)');
    sideGradR.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = sideGradR;
    c.fillRect(fieldW - 10, 0, 10, height);
  }

  function drawEndZonePortrait(c, ydStart, ydEnd, isTop, topYard, teamRGB) {
    var y1 = (ydStart - topYard) * YPX;
    var y2 = (ydEnd - topYard) * YPX;
    if (y2 < 0 || y1 > height) return;
    var ezH = y2 - y1;

    var r = teamRGB[0], g = teamRGB[1], b = teamRGB[2];
    var ezFill = 'rgba(' + r + ',' + g + ',' + b + ',0.06)';
    var ezStripe = 'rgb(' + r + ',' + g + ',' + b + ')';
    var ezTextColor = 'rgba(' + r + ',' + g + ',' + b + ',0.18)';
    var ezTextStroke = 'rgba(' + r + ',' + g + ',' + b + ',0.12)';
    var ezTextHighlight = 'rgba(' + r + ',' + g + ',' + b + ',0.06)';
    var ezInnerBorder = 'rgba(' + r + ',' + g + ',' + b + ',0.15)';

    c.fillStyle = ezFill;
    c.fillRect(0, y1, fieldW, ezH);

    // Diagonal stripes
    c.save();
    c.globalAlpha = CFG.endZone.stripeAlpha;
    c.strokeStyle = ezStripe;
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
      c.fillStyle = ezTextColor;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      var letters = 'TORCH'.split('');
      var totalSpan = fieldW * 0.50;
      var spacing = totalSpan / (letters.length - 1);
      var startX = -totalSpan / 2;
      letters.forEach(function(ch, i) { c.fillText(ch, startX + i * spacing, 0); });
      c.strokeStyle = ezTextStroke;
      c.lineWidth = 2;
      letters.forEach(function(ch, i) { c.strokeText(ch, startX + i * spacing, 0); });
      c.fillStyle = ezTextHighlight;
      letters.forEach(function(ch, i) { c.fillText(ch, startX + i * spacing, -1); });
    }
    c.restore();

    // Inner border along goal line
    var borderY = isTop ? y2 : y1;
    c.strokeStyle = ezInnerBorder;
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(2, borderY); c.lineTo(fieldW - 2, borderY); c.stroke();
  }

  function drawNumPortrait(c, num, cx, cy, absYard, topYard, mirrored) {
    c.save();
    c.translate(cx, cy);
    c.rotate(mirrored ? Math.PI / 2 : -Math.PI / 2);

    c.font = CFG.num.font;
    c.textBaseline = 'middle';
    var s = num.toString();
    var d0 = s[0], d1 = s[1] || '0';

    // Shadow (recessed/embossed — pressed into turf)
    c.fillStyle = 'rgba(0,0,0,0.18)';
    c.textAlign = 'right'; c.fillText(d0, -CFG.num.gap + 1.5, 1.5);
    c.textAlign = 'left'; c.fillText(d1, CFG.num.gap + 1.5, 1.5);

    // Main paint
    c.fillStyle = CFG.num.color;
    c.textAlign = 'right'; c.fillText(d0, -CFG.num.gap, 0);
    c.textAlign = 'left'; c.fillText(d1, CFG.num.gap, 0);

    // Highlight (catch light)
    c.fillStyle = 'rgba(255,255,255,0.03)';
    c.textAlign = 'right'; c.fillText(d0, -CFG.num.gap - 0.5, -0.5);
    c.textAlign = 'left'; c.fillText(d1, CFG.num.gap - 0.5, -0.5);

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
    // Neon line sprite (no shadowBlur — pure additive, fast)
    var neon = getNeonLineSprite(fieldW, [59, 130, 246], 0.75);
    var prevComp = c.globalCompositeOperation;
    c.globalCompositeOperation = 'lighter';
    c.drawImage(neon.cv, 0, y - neon.h / 2);
    c.globalCompositeOperation = prevComp;
    // Badge label
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
    // Neon line sprite (no shadowBlur — pure additive, fast)
    var neon = getNeonLineSprite(fieldW, [251, 191, 36], 0.75);
    var prevComp = c.globalCompositeOperation;
    c.globalCompositeOperation = 'lighter';
    c.drawImage(neon.cv, 0, y - neon.h / 2);
    c.globalCompositeOperation = prevComp;
    // Badge label
    c.fillStyle = 'rgba(251,191,36,0.7)';
    c.fillRect(fieldW - 28, y - 6, 20, 12);
    c.fillStyle = '#000';
    c.font = "700 8px 'Teko'";
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('1ST', fieldW - 18, y);
  }

  function drawPlayerDots(c, formation, losYard, topYard, offTeamId, defTeamId) {
    var form = FORMATIONS[formation] || FORMATIONS['shotgun_deuce'];
    var DOT_R = 24;
    var CORE_R = 14;

    // Team colors (dynamic per team, fallback to defaults)
    var offRGB = (offTeamId && CFG.teamDotColors[offTeamId]) || CFG.offense;
    var defRGB = (defTeamId && CFG.teamDotColors[defTeamId]) || CFG.defense;

    // Pre-create core gradients
    function makeCoreGrad(rgb) {
      var g = c.createRadialGradient(0, 0, 0, 0, 0, CORE_R);
      g.addColorStop(0, 'rgba(' + Math.min(255, rgb[0]+60) + ',' + Math.min(255, rgb[1]+60) + ',' + Math.min(255, rgb[2]+60) + ',1)');
      g.addColorStop(0.5, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.9)');
      g.addColorStop(0.8, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.6)');
      g.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
      return g;
    }
    var offGrad = makeCoreGrad(offRGB);
    var defGrad = makeCoreGrad(defRGB);

    function drawDot(px, py, rgb, coreGrad) {
      // 0. Ground shadow (draws BEFORE glow, creates depth)
      c.fillStyle = 'rgba(0,0,0,0.35)';
      c.beginPath();
      c.ellipse(px, py + 10, CORE_R * 0.8, CORE_R * 0.35, 0, 0, Math.PI * 2);
      c.fill();

      // 1. Dark backing circle — eclipses LOS/1st-down lines underneath
      c.fillStyle = 'rgba(5,10,8,0.92)';
      c.beginPath();
      c.arc(px, py, CORE_R + 4, 0, Math.PI * 2);
      c.fill();

      // 2. Two-layer glow (additive)
      var prevComp = c.globalCompositeOperation;
      c.globalCompositeOperation = 'lighter';
      // Outer soft glow
      var outerSprite = getGlowSprite(rgb, Math.round(DOT_R * 1.5), 0.35);
      var outerSz = DOT_R * 6;
      c.drawImage(outerSprite, px - outerSz / 2, py - outerSz / 2, outerSz, outerSz);
      // Main glow
      var sprite = getGlowSprite(rgb, DOT_R, 0.8);
      c.drawImage(sprite, px - DOT_R * 2, py - DOT_R * 2, DOT_R * 4, DOT_R * 4);
      c.globalCompositeOperation = prevComp;

      // 3. Solid bright core
      c.save();
      c.translate(px, py);
      c.fillStyle = coreGrad;
      c.beginPath();
      c.arc(0, 0, CORE_R, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // Subtle idle breathing — time-based vertical oscillation, staggered per player
    var now = performance.now();

    // Draw all players
    form.offense.forEach(function(p, i) {
      var px = p.x * fieldW;
      var py = (losYard + p.y - topYard) * YPX;
      var breathOffset = Math.sin(now / 800 + i * 1.2) * 1.5; // ±1.5px
      var idlePy = py + breathOffset;

      // QB (index 0) gets a subtle glow pulse for pre-snap anticipation
      if (i === 0) {
        var pulseIntensity = 0.6 + Math.sin(now / 600) * 0.15; // 0.45–0.75
        var qbGlowSprite = getGlowSprite(offRGB, Math.round(DOT_R * 1.5), 0.35);
        var qbGlowSz = DOT_R * 7;
        var prevComp2 = c.globalCompositeOperation;
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = pulseIntensity;
        c.drawImage(qbGlowSprite, px - qbGlowSz / 2, idlePy - qbGlowSz / 2, qbGlowSz, qbGlowSz);
        c.globalAlpha = 1;
        c.globalCompositeOperation = prevComp2;
      }

      drawDot(px, idlePy, offRGB, offGrad);
    });

    form.defense.forEach(function(p, i) {
      var px = p.x * fieldW;
      var py = (losYard + p.y - topYard) * YPX;
      var breathOffset = Math.sin(now / 800 + (form.offense.length + i) * 1.2) * 1.5;
      var idlePy = py + breathOffset;
      drawDot(px, idlePy, defRGB, defGrad);
    });

    // Ball glow at QB position (follows QB's breath offset — index 0)
    var qb = form.offense.find(function(p) { return p.pos === 'QB'; });
    if (qb) {
      var bx = qb.x * fieldW;
      var qbBreathOffset = Math.sin(now / 800) * 1.5; // index 0 offset
      var by = (losYard + qb.y - topYard) * YPX + qbBreathOffset;
      c.fillStyle = 'rgba(255,220,140,0.4)';
      c.beginPath();
      c.arc(bx, by, 6, 0, Math.PI * 2);
      c.fill();
    }

    // Jersey numbers on top (not additive)
    var allPlayers = form.offense.map(function(p, i) { return { p: p, side: 'off', losY: losYard, idx: i }; })
      .concat(form.defense.map(function(p, i) { return { p: p, side: 'def', losY: losYard, idx: form.offense.length + i }; }));

    allPlayers.forEach(function(d) {
      var p = d.p;
      var px = p.x * fieldW;
      var py = (d.losY + p.y - topYard) * YPX;
      var breathOffset = Math.sin(now / 800 + d.idx * 1.2) * 1.5;
      var idlePy = py + breathOffset;
      var isOffense = d.side === 'off';

      c.save();
      c.font = "700 11px 'Teko'";
      c.textAlign = 'center';
      c.textBaseline = 'middle';

      // Dark backing circle — ensures readability on any colored core
      c.fillStyle = 'rgba(0,0,0,0.5)';
      c.beginPath();
      c.arc(px, idlePy, 7, 0, Math.PI * 2);
      c.fill();

      // Number stroke (thicker for better contrast)
      c.strokeStyle = 'rgba(0,0,0,0.9)';
      c.lineWidth = 3;
      c.lineJoin = 'round';
      c.strokeText(p.num, px, idlePy + 0.5);

      // Number fill — warm tint for offense, cool tint for defense
      c.fillStyle = isOffense ? 'rgba(255,250,240,0.95)' : 'rgba(240,245,255,0.95)';
      c.fillText(p.num, px, idlePy + 0.5);

      c.restore();
    });
  }

  // ── PUBLIC RENDER ──
  var _lastCenter = -1;
  var _staticPadding = 0;  // extra yards rendered below the visible window
  var _staticTopYard = 0;  // topYard used when static was last rendered

  /**
   * Render the field.
   * @param {object} state
   * @param {number} state.ballYard - absolute yard position of the ball (10-110)
   * @param {number} state.losYard - LOS absolute yard
   * @param {number} state.firstDownYard - first down marker yard
   * @param {string} state.formation - formation key
   * @param {number} [state.cameraPadding] - extra yards to pre-render below for smooth panning
   */
  var _renderState = {}; // Cached for drawStaticField access

  function render(state) {
    _renderState = state;
    var ballYard = state.ballYard || 50;
    var losYard = state.losYard || ballYard;
    var fdYard = state.firstDownYard || losYard + 10;
    var formation = state.formation || 'shotgun_2x2';
    var cameraPadding = state.cameraPadding || 0;

    // Clamp center so we don't show beyond the field
    var center = Math.max(VISIBLE_YARDS / 2, Math.min(120 - VISIBLE_YARDS / 2, ballYard));
    var topYard = center - VISIBLE_YARDS / 2;

    // Re-render static layer if center changed significantly OR padding changed
    var needsRedraw = Math.abs(center - _lastCenter) > 0.5 || cameraPadding !== _staticPadding;
    // During camera follow (cameraPadding > 0), use the padded static and pan via drawImage offset
    if (cameraPadding > 0 && _staticPadding === cameraPadding && _lastCenter !== -1) {
      // Check if the current view is still within the pre-rendered buffer
      var bufferTopYard = _staticTopYard;
      var bufferBottomYard = _staticTopYard + VISIBLE_YARDS + _staticPadding;
      if (topYard >= bufferTopYard && topYard + VISIBLE_YARDS <= bufferBottomYard + 0.5) {
        needsRedraw = false;  // pan within existing buffer, no redraw needed
      }
    }

    if (needsRedraw) {
      _staticPadding = cameraPadding;
      if (cameraPadding > 0) {
        // Render oversized static field (visible + padding) for smooth camera panning
        var padPx = Math.round(cameraPadding * YPX * DPR);
        staticCv.height = height * DPR + padPx;
        sCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
        drawStaticField(center, cameraPadding);
        _staticTopYard = topYard;
      } else {
        // Normal size
        if (staticCv.height !== height * DPR) {
          staticCv.height = height * DPR;
          sCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
        }
        drawStaticField(center, 0);
        _staticTopYard = topYard;
      }
      _lastCenter = center;
    }

    // Composite: static → main canvas (pan by shifting source Y for camera follow)
    ctx.clearRect(0, 0, width, height);
    var srcOffY = 0;
    if (_staticPadding > 0 && _staticTopYard !== topYard) {
      srcOffY = Math.round((topYard - _staticTopYard) * YPX * DPR);
      srcOffY = Math.max(0, Math.min(srcOffY, staticCv.height - height * DPR));
    }
    ctx.drawImage(staticCv, 0, srcOffY, width * DPR, height * DPR, 0, 0, width, height);

    // Down & distance zone shading (between LOS and 1st down)
    if (state.losYard && state.firstDownYard) {
      var losY = (state.losYard - topYard) * YPX;
      var fdY = (state.firstDownYard - topYard) * YPX;
      var zoneTop = Math.min(losY, fdY);
      var zoneBot = Math.max(losY, fdY);
      var zoneH = zoneBot - zoneTop;

      if (zoneH > 2 && zoneH < height) {
        ctx.save();
        var zoneGrad = ctx.createLinearGradient(0, zoneTop, 0, zoneBot);
        zoneGrad.addColorStop(0, 'rgba(251,191,36,0.04)');
        zoneGrad.addColorStop(0.5, 'rgba(251,191,36,0.06)');
        zoneGrad.addColorStop(1, 'rgba(251,191,36,0.03)');
        ctx.fillStyle = zoneGrad;
        ctx.fillRect(0, zoneTop, width, zoneH);

        // Thin side markers
        ctx.fillStyle = 'rgba(251,191,36,0.08)';
        ctx.fillRect(0, zoneTop, 3, zoneH);
        ctx.fillRect(width - 3, zoneTop, 3, zoneH);
        ctx.restore();
      }
    }

    // Atmosphere layer — subtle vignette + brightness based on game state
    // Currently static, but designed to respond to state.driveHeat in future

    // Edge vignette (always present, darkens edges for cinematic feel)
    var vigGrad = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.35,
      width / 2, height / 2, Math.max(width, height) * 0.7
    );
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

    // TODO: When state.driveHeat is available, modulate vignette:
    // var heatMod = (state.driveHeat || 0) / 120; // 0-1
    // vigIntensity = 0.25 - heatMod * 0.15; // Less vignette = brighter on hot drives

    // Dynamic overlays
    drawLOS(ctx, losYard, topYard);
    if (fdYard > losYard && fdYard <= 110) {
      drawFirstDownMarker(ctx, fdYard, topYard);
    }
    if (!state.skipDots) {
      drawPlayerDots(ctx, formation, losYard, topYard, state.offTeam, state.defTeam);
    }

    // Formation name label (small, unobtrusive)
    if (state.formation) {
      var formName = state.formation.replace(/_/g, ' ').toUpperCase();
      // Map to readable names
      var FORM_LABELS = {
        'SHOTGUN DEUCE': 'SHOTGUN 2×2',
        'TRIPS': 'TRIPS',
        'TWINS': 'TWINS',
        'BUNCH': 'BUNCH',
        'IFORM PISTOL': 'PISTOL',
        'EMPTY': 'EMPTY',
      };
      var label = FORM_LABELS[formName] || formName;

      ctx.save();
      ctx.font = "700 10px 'Teko'";
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.textAlign = 'left';
      ctx.fillText(label, 8, height - 8);
      ctx.restore();
    }
  }

  return {
    canvas: canvas, render: render, FORMATIONS: FORMATIONS,
    PLAY_FORMATION_MAP: PLAY_FORMATION_MAP,
    TEAM_FORMATION_MAP: TEAM_FORMATION_MAP,
    TEAM_FORMATION_POOLS: TEAM_FORMATION_POOLS,
    DEF_FORMATION_MAP: DEF_FORMATION_MAP,
    pickFormation: pickFormation
  };
}
