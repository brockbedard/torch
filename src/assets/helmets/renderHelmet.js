/**
 * TORCH — Broadcast-Quality Helmet Generator (Adobe Stock base)
 *
 * Built on Adobe Stock #186214272 by The Vector Doctor ("Football helmet"),
 * a clean side-profile white helmet with grey facemask. Standard license.
 *
 * The source SVG has 76 discrete paths in 8 semantic color families:
 *   Shell (white-to-grey, 51 paths) → recolored as a 4-shade team-color cascade
 *   Facemask (3 dark greys, 21 paths) → recolored to team facemask
 *   Outline (#231f20, 4 paths) → kept neutral (the line art holding the form)
 *
 * White base means recoloring is simpler than the IconScout helmet — we shade
 * the team base toward white for highlights and toward black for shadows
 * instead of substituting baked-in red gradients.
 */

import helmetTemplate from './sources/helmet-template.svg?raw';
import { TEAMS } from '../../data/teams.js';
import { renderTeamBadge } from '../icons/teamLogos.js';
import { renderTeamMonogram } from '../../data/teamIdentity.js';

// ── Parse the template once on module load ────────────────────────────────
var VIEWBOX = (helmetTemplate.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 5333 5333';
var BODY = (helmetTemplate.match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';

// Split the body into ordered shape elements so we can render the team decal
// IN BETWEEN them (decal-layer control). Matches both forms:
//   <elem .../>                (self-closing)
//   <elem ...>…</elem>         (with closing tag, content + nested allowed)
// for each of: path, circle, ellipse, polygon, rect, line.
// Backreference \1 ensures the closing tag matches its opening tag.
var PATH_SEGMENTS = (function() {
  var openG = (BODY.match(/^\s*<g[^>]*>/) || [''])[0];
  var inner = openG ? BODY.replace(/^\s*<g[^>]*>/, '').replace(/<\/g>\s*$/, '') : BODY;
  var elemRe = /<(path|circle|ellipse|polygon|rect|line)\b[^>]*?(?:\/>|>[\s\S]*?<\/\1>)/g;
  var paths = inner.match(elemRe) || [];
  return { open: openG, close: openG ? '</g>' : '', paths: paths };
})();
var TOTAL_PATHS = PATH_SEGMENTS.paths.length;

// Pre-scan the template for shell paths (any path whose source fill matches
// one of the 4 shell source colors). Used to scope finish filters (chrome,
// matte) to the shell only — facemask, decal, and outlines stay untouched.
// Computed after SOURCE is declared below.

// ── Source palette (exact hex values from Adobe Stock #186214272) ─────────
// 76-path white helmet with 8 semantic colors.
//   Shell  (4 shades, 51 paths) → team base, shaded toward white/black
//   Facemask (3 shades, 21 paths) → team facemask, shaded
//   Outline (1 shade, 4 paths)   → kept neutral
var SOURCE = {
  shellHi:       '#ffffff',  // 15 paths — brightest highlight
  shellLite:     '#d3d2d2',  //  4 paths — light shade
  shellMid:      '#c8c7c7',  // 21 paths — main shell color (BASE)
  shellShadow:   '#918f8f',  // 11 paths — shell shadow
  facemaskHi:    '#727070',  //  6 paths — facemask highlight
  facemaskMid:   '#6c696a',  //  8 paths — facemask main
  facemaskDeep:  '#393536',  //  7 paths — facemask deep shadow
  outline:       '#231f20',  //  4 paths — neutral line art (kept)
};

// Indices of paths whose source fill is one of the 4 shell colors.
// Used to scope the finish filter (chrome/matte) to the shell only.
var SHELL_INDICES = (function() {
  var shellColors = [SOURCE.shellHi, SOURCE.shellLite, SOURCE.shellMid, SOURCE.shellShadow]
    .map(function(c) { return c.toLowerCase(); });
  var out = [];
  PATH_SEGMENTS.paths.forEach(function(p, i) {
    var m = p.match(/fill="([^"]+)"/i);
    if (m && shellColors.indexOf(m[1].toLowerCase()) !== -1) out.push(i);
  });
  return out;
})();

// ── Color utils ────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  var h = (hex || '#888').replace('#', '');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  var n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(function(v) {
    var s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
    return s.length === 1 ? '0' + s : s;
  }).join('');
}
/** Lighten (amt>0) or darken (amt<0) a hex. amt in [-1,1]. */
function shade(hex, amt) {
  var c = hexToRgb(hex);
  var mix = amt >= 0 ? 255 : 0;
  var f = Math.abs(amt);
  return rgbToHex(c.r + (mix - c.r) * f, c.g + (mix - c.g) * f, c.b + (mix - c.b) * f);
}

// ── Substitution helpers ──────────────────────────────────────────────────
// The IconScout template uses `fill="#xxx"` attributes. Older templates
// used `fill:#xxx;` style declarations. Two helpers cover both forms.
function substFillAttr(svg, src, dst) {
  return svg.replace(new RegExp('fill="' + src + '"', 'gi'), 'fill="' + dst + '"');
}
function substFill(svg, src, dst) {
  return svg.replace(new RegExp('fill:' + src.replace('#', '#?'), 'gi'), 'fill:' + dst);
}

// ── Path-index map for targeted overrides ────────────────────────────────
// Mapped in /mockups/helmets.html with the PATH LABELER. These indices are
// tied to helmet-template.svg — if the template is ever swapped, rerun the
// labeler and update this map.
var PATH_ROLES = {
  lip:           [7],
  crownStripes:  [18, 19],
  rivets:        [20, 21, 22, 23, 24, 25, 31, 32, 56, 57, 58],
  // Negative space — earhole / vent openings. Always rendered near-black so
  // they read as voids regardless of team shell color. (Without this, the
  // shell-shade cascade tints them the team color, which looks wrong.)
  voids:         [9, 12, 13],
  // Helmet interior padding / inner shell visible through openings. Kept at
  // the original source greys (just off-palette so recolor doesn't touch
  // them) so the inside of the helmet stays neutral regardless of team color.
  interior:      [26, 27, 28, 38, 39, 50],
};

// Fill-preservation map for interior paths: each source palette color →
// a perceptually identical off-by-one hex that recolor won't substitute.
var INTERIOR_PRESERVE = {
  '#ffffff': '#fefefe',
  '#d3d2d2': '#d4d3d3',
  '#c8c7c7': '#c9c8c8',
  '#918f8f': '#928f8f',
  '#727070': '#737070',
  '#6c696a': '#6d6a6a',
  '#393536': '#3a3636',
  '#231f20': '#241f20',
};

// Perceived luminance 0..1 (ITU-R BT.601). Used to pick a cascade direction
// that preserves contrast at extreme base colors.
function luminance(hex) {
  var c = hexToRgb(hex);
  return (c.r * 0.299 + c.g * 0.587 + c.b * 0.114) / 255;
}

// ── Per-team recolor ───────────────────────────────────────────────────────
function recolor(body, helmet) {
  var base = helmet.base;
  var fm = helmet.facemask;

  // Shell: 4-shade cascade. The cascade flips direction based on base
  // luminance so shading stays visible at extreme colors.
  //   Light base (≥0.75 lum, e.g. pure white): hi stays at base, other
  //     shades step DOWN into greys — preserves the original painted
  //     contours that would otherwise collapse to a flat white.
  //   Normal/dark base: hi steps UP toward white, shadow steps DOWN.
  //
  // helmet.solidity (0..1, default 0) collapses the cascade toward base.
  //   0 = full painted cascade (Adobe Stock look)
  //   1 = near-flat color, but with a SHEEN floor preserved so the helmet
  //       still reads as a glossy 3D shell (not a flat decal). Even at max
  //       solidity, the crown catches a bit of highlight and the underside
  //       stays slightly darker — that's the difference between "painted
  //       helmet" and "sticker."
  var lum = luminance(base);
  var solidity = Math.max(0, Math.min(1, helmet.solidity || 0));
  var s = 1 - solidity;
  // Sheen floor amounts — minimum contrast retained at max solidity.
  var SHEEN_HI     = 0.18;  // crown highlight on dark bases
  var SHEEN_SHADOW = 0.12;  // underside shadow on light bases
  var SHEEN_LITE   = 0.04;  // mid-band contrast to keep detail paths visible
  var shellHi, shellLite, shellMid, shellShadow;
  if (lum >= 0.75) {
    shellHi     = base;
    shellLite   = shade(base, -0.08 * s - SHEEN_LITE   * solidity);
    shellMid    = shade(base, -0.18 * s - SHEEN_LITE   * solidity);
    shellShadow = shade(base, -0.38 * s - SHEEN_SHADOW * solidity);
  } else {
    shellHi     = shade(base,  0.55 * s + SHEEN_HI     * solidity);
    shellLite   = shade(base,  0.20 * s + SHEEN_LITE   * solidity);
    shellMid    = base;
    shellShadow = shade(base, -0.30 * s - SHEEN_SHADOW * solidity);
  }

  // Facemask: 3-shade dark grey family → tint to team facemask color.
  //   #727070 (hi)   → shade(fm, +0.20)
  //   #6c696a (mid)  → fm
  //   #393536 (deep) → shade(fm, -0.45)
  var fmHi   = shade(fm,  0.20);
  var fmMid  = fm;
  var fmDeep = shade(fm, -0.45);

  var out = body;
  out = substFillAttr(out, SOURCE.shellHi,      shellHi);
  out = substFillAttr(out, SOURCE.shellLite,    shellLite);
  out = substFillAttr(out, SOURCE.shellMid,     shellMid);
  out = substFillAttr(out, SOURCE.shellShadow,  shellShadow);
  out = substFillAttr(out, SOURCE.facemaskHi,   fmHi);
  out = substFillAttr(out, SOURCE.facemaskMid,  fmMid);
  out = substFillAttr(out, SOURCE.facemaskDeep, fmDeep);
  // Outline (#231f20) intentionally NOT substituted — kept as neutral line art.
  return out;
}

// ── Stripe geometry (traced for Adobe Stock #186214272 crown) ─────────────
// All stripe paths are positioned in source viewBox coords (5000×3000).
// Crown runs roughly from x=1950 (back) to x=3300 (front) at y=140-450.
// The dark outline path (#0) renders early so stripes will overpaint it
// cleanly. Stripes inject AFTER shell paths but BEFORE chinstrap/outline
// detail paths (controlled by the stripe-layer index, default = TOTAL_PATHS-2).
var STRIPES = {
  none: function() { return ''; },

  single: function(color) {
    return '<path d="M 1980 245 C 2400 175, 2900 150, 3290 245 L 3290 410 C 2900 320, 2400 345, 1980 405 Z" fill="' + color + '"/>';
  },

  // Two thinner stripes with shell color showing between
  double: function(color) {
    return '<path d="M 1980 220 C 2400 165, 2900 142, 3290 215 L 3290 265 C 2900 195, 2400 200, 1980 260 Z" fill="' + color + '"/>' +
      '<path d="M 1990 360 C 2400 295, 2900 280, 3290 350 L 3290 405 C 2900 330, 2400 335, 1990 415 Z" fill="' + color + '"/>';
  },

  // Three stripes — accent / main / accent (USC, Auburn style)
  runway: function(color, accent) {
    return '<path d="M 1980 215 C 2400 160, 2900 138, 3290 210 L 3290 245 C 2900 180, 2400 195, 1980 250 Z" fill="' + (accent || '#fff') + '"/>' +
      '<path d="M 1985 250 C 2400 195, 2900 175, 3290 250 L 3290 360 C 2900 280, 2400 305, 1985 360 Z" fill="' + color + '"/>' +
      '<path d="M 1990 365 C 2400 300, 2900 285, 3290 355 L 3290 410 C 2900 335, 2400 340, 1990 420 Z" fill="' + (accent || '#fff') + '"/>';
  },

  // Thick center + 2 thin pinstripes flanking with shell-color gaps (Ohio State)
  pinstripe: function(color, accent) {
    var pin = accent || '#000';
    return '<path d="M 1985 215 C 2400 160, 2900 138, 3290 210 L 3290 232 C 2900 165, 2400 188, 1985 235 Z" fill="' + pin + '"/>' +
      '<path d="M 1990 250 C 2400 195, 2900 175, 3290 250 L 3290 360 C 2900 280, 2400 305, 1990 360 Z" fill="' + color + '"/>' +
      '<path d="M 1995 380 C 2400 315, 2900 300, 3290 370 L 3290 395 C 2900 325, 2400 335, 1995 405 Z" fill="' + pin + '"/>';
  },

  // Single wide stripe with contrasting outline (looks like a banded stripe)
  outlined: function(color, accent) {
    var border = accent || '#000';
    return '<path d="M 1980 235 C 2400 170, 2900 145, 3290 235 L 3290 415 C 2900 325, 2400 350, 1980 415 Z" fill="' + border + '"/>' +
      '<path d="M 2010 260 C 2410 200, 2890 180, 3270 255 L 3270 395 C 2890 310, 2410 335, 2010 395 Z" fill="' + color + '"/>';
  },
};

function buildStripe(stripe) {
  if (!stripe || !stripe.type || stripe.type === 'none') return '';
  var fn = STRIPES[stripe.type];
  if (!fn) return '';
  return fn(stripe.color || '#fff', stripe.accent);
}

// ── Decal — team badge / monogram / text composited on the side panel ─────
function extractBadgeInner(teamId) {
  var svg = renderTeamBadge(teamId, 512);
  var m = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>\s*$/);
  return m ? m[1] : '';
}

function extractMonogramInner(teamId) {
  // teamIdentity exports inner SVG markup wrapped in 40×40 viewBox.
  // We rebuild as 0..512 viewBox by scaling so the same decal slot works.
  try {
    var svg = renderTeamMonogram(teamId, 512);
    var m = svg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>\s*$/);
    if (!m) return '';
    var viewBox = m[1];
    var inner = m[2];
    // Wrap so the inner content scales into our 0..512 decal space
    return '<svg width="512" height="512" viewBox="' + viewBox + '">' + inner + '</svg>';
  } catch (e) {
    return '';
  }
}

function buildTextDecal(text, color, font, weight) {
  // Text decal in 0..512 space, centered. Handles numbers, monogram letters,
  // and script wordmarks ("Florida", "UCLA", etc.). Font size scales down
  // as text length grows so the word fills the decal box without overflow.
  font = font || 'Teko, sans-serif';
  weight = weight || '900';
  var n = Math.max(text.length, 1);
  var size;
  if (n === 1)      size = 380;
  else if (n === 2) size = 290;
  else if (n === 3) size = 230;
  else if (n <= 5)  size = 180;
  else if (n <= 7)  size = 140;
  else              size = Math.max(90, Math.floor(960 / n));
  // Wrap font name in quotes so names with spaces (e.g. "Kaushan Script") work
  var fontStack = '"' + font + '", sans-serif';
  return '<svg width="512" height="512" viewBox="0 0 512 512">' +
    '<text x="256" y="256" text-anchor="middle" dominant-baseline="central" ' +
    'font-family=\'' + fontStack + '\' font-weight="' + weight + '" font-size="' + size + '" ' +
    'fill="' + (color || '#fff') + '">' + text + '</text></svg>';
}

// Decal default position (source viewBox coords 0..5000 × 0..3000).
// Side panel of the Adobe Stock helmet is roughly the upper-left of the
// shell (the wide flat ear-hole panel). These are eyeball estimates — sweep
// in the live tuner at /mockups/helmets.html and bake final values here.
// blend: 'auto' picks multiply on light shells, screen on dark shells.
var DECAL_DEFAULT = { x: 1700, y: 1100, size: 1100, tilt: -4, opacity: 0.95, blend: 'auto' };

// Teams whose badge art faces left (wrong direction for a helmet whose front
// is on the right). Flipped horizontally for helmet decal use only — the
// badge renders unchanged everywhere else (team select, scoreboard, etc.).
var FLIP_DECAL = { salamanders: true, wolves: true };

function decalLayer(teamId, decalOpts, ctx) {
  ctx = ctx || {};
  var d = Object.assign({}, DECAL_DEFAULT, decalOpts || {});
  var type = d.type || 'logo';
  if (type === 'blank' || type === 'none') return '';

  var inner = '';
  if (type === 'logo') {
    inner = extractBadgeInner(teamId);
  } else if (type === 'monogram') {
    inner = extractMonogramInner(teamId);
  } else if (type === 'text' || type === 'number') {
    var nestedSvg = buildTextDecal(d.text || '?', d.color || '#fff', d.font, d.weight);
    var m = nestedSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>\s*$/);
    inner = m ? m[1] : '';
  }
  if (!inner) return '';

  var half = d.size / 2;

  // Auto blend mode — multiply sinks dark logos into light shells; screen
  // lifts light logos off dark shells. Explicit blend values are respected.
  var blend = d.blend;
  if (!blend || blend === 'auto') {
    blend = (ctx.shellLum != null ? ctx.shellLum : 0.5) > 0.5 ? 'multiply' : 'screen';
  }

  // Drop shadow — rendered via an SVG <filter> on SourceAlpha (referenced
  // below by shadowFilterId). Operating on the raw path alpha produces a
  // silhouette shadow that follows the logo outline. CSS drop-shadow()
  // on a mix-blend-mode child collapsed to a rectangle — SVG filters avoid
  // that because SourceAlpha ignores compositing layers.

  // Pre-flip the decal content. Odd number of flip sources → flip once.
  //   1. FLIP_DECAL — logo art naturally faces the wrong direction
  //   2. facing='left' — the whole helmet body is being mirrored
  //   3. d.flip — explicit user override (manual logo flip toggle)
  var flipCount = 0;
  if (type === 'logo' && FLIP_DECAL[teamId]) flipCount++;
  if (ctx.facing === 'left')                  flipCount++;
  if (d.flip)                                 flipCount++;
  var flipInner = (flipCount % 2 === 1)
    ? '<g transform="scale(-1 1) translate(-512 0)">' + inner + '</g>'
    : inner;

  // Highlight sweep — faint diagonal shine overlaid on the decal, blended
  // with screen so it brightens only the decal footprint, not the helmet.
  var sweep = ctx.sweepId
    ? '<rect x="0" y="0" width="' + d.size + '" height="' + d.size + '" ' +
      'fill="url(#' + ctx.sweepId + ')" style="mix-blend-mode:screen;pointer-events:none"/>'
    : '';

  // DEBUG: stripped to the minimum — just the scaled paths. No shadow,
  // no sweep, no blend mode. Want to confirm the rectangle isn't coming
  // from the raw decal rendering itself before layering effects back on.
  var scale = d.size / 512;
  var pathsGroup = '<g transform="scale(' + scale + ')">' + flipInner + '</g>';

  return '<g transform="translate(' + d.x + ' ' + d.y + ') rotate(' + d.tilt + ' ' + half + ' ' + half + ')" ' +
    'opacity="' + d.opacity + '">' +
    pathsGroup +
  '</g>';
}

// ── Per-render unique prefix (for future filter/gradient IDs) ─────────────
var _idCounter = 0;
function nextIdPrefix() {
  _idCounter = (_idCounter + 1) % 1000000;
  return 'h' + _idCounter;
}

// ── Main renderer ──────────────────────────────────────────────────────────
/**
 * Build a broadcast-quality helmet SVG string.
 *
 * @param {string}  teamId
 * @param {object}  [opts]
 * @param {number}  [opts.size=200]       Display width in px
 * @param {boolean} [opts.showDecal=true]   Composite team badge on side panel
 * @param {object}  [opts.decal]             Override decal position {x,y,size,tilt,opacity,blend}
 * @param {number}  [opts.decalLayer=76]     # of bottom paths drawn before the decal.
 *                                           When = total path count, decal is on top.
 *                                           Lower values let some paths (outlines)
 *                                           render OVER the decal for an inked look.
 * @param {number}  [opts.topLayerOpacity=1] Opacity of paths drawn AFTER the decal
 *                                           (chinstrap, outlines). 0..1. Lower values
 *                                           fade the chinstrap away from the logo.
 * @param {string}  [opts.stripeColor]       Recolor crown-stripe paths (18, 19) only.
 * @param {string}  [opts.lipColor]          Recolor lower-rear lip path (7) only.
 * @param {boolean} [opts.hideRivets]        Skip the small rivet/vent paths
 *                                           (20, 21, 24, 31, 32, 56, 57).
 * @returns {string} SVG string
 */
export function renderHelmet(teamId, opts) {
  opts = opts || {};
  var size = opts.size || 200;
  var showDecal = opts.showDecal !== false;
  var decalLayerIdx = opts.decalLayer !== undefined ? opts.decalLayer : 76;
  var topOpacity = opts.topLayerOpacity !== undefined ? opts.topLayerOpacity : 1;

  var team = TEAMS[teamId];
  if (!team) return '';
  // Variant overrides — opts.shell/opts.facemask take precedence over team
  // defaults. Targeted path overrides (stripeColor, lipColor, hideRivets)
  // are applied AFTER the team cascade and hit specific path indices only.
  var teamHelmet = team.helmet || { base: '#888', facemask: '#ccc', stripe: '#fff' };
  var helmet = {
    base: opts.shell || teamHelmet.base,
    facemask: opts.facemask || teamHelmet.facemask,
    solidity: opts.shellSolidity,
  };

  var stripeMarkup = buildStripe(opts.stripe);
  var idPrefix = nextIdPrefix();
  var sweepId = idPrefix + '-sweep';
  var shadowFilterId = idPrefix + '-dshadow';
  var decalCtx = {
    shellLum: luminance(helmet.base),
    facing: opts.facing === 'left' ? 'left' : 'right',
    sweepId: sweepId,
    shadowFilterId: shadowFilterId,
  };
  var decal = showDecal ? decalLayer(teamId, opts.decal, decalCtx) : '';

  // Apply per-index path overrides before slicing into bottom/top layers.
  // A path can be recolored (stripe/lip) or removed entirely (rivets).
  var paths = PATH_SEGMENTS.paths.slice();
  function overrideFill(idx, color) {
    if (!color || !paths[idx]) return;
    paths[idx] = /fill="[^"]*"/i.test(paths[idx])
      ? paths[idx].replace(/fill="[^"]*"/i, 'fill="' + color + '"')
      : paths[idx].replace(/<(\w+)/, '<$1 fill="' + color + '"');
  }
  if (opts.stripeColor) PATH_ROLES.crownStripes.forEach(function(i) { overrideFill(i, opts.stripeColor); });
  if (opts.lipColor)    PATH_ROLES.lip.forEach(function(i) { overrideFill(i, opts.lipColor); });
  if (opts.hideRivets)  PATH_ROLES.rivets.forEach(function(i) { paths[i] = ''; });
  // Voids always render as near-black so the earhole/vent reads as empty space.
  PATH_ROLES.voids.forEach(function(i) { overrideFill(i, '#0a0a0a'); });
  // Interior paths: preserve the original source grey (off-by-one so recolor
  // doesn't touch them), regardless of team color.
  PATH_ROLES.interior.forEach(function(i) {
    var p = PATH_SEGMENTS.paths[i];
    if (!p) return;
    var m = p.match(/fill="([^"]+)"/i);
    var orig = m ? m[1].toLowerCase() : null;
    var preserved = orig && INTERIOR_PRESERVE[orig];
    if (preserved) overrideFill(i, preserved);
  });

  // Finish filter — applied to shell paths only so facemask, decal, stripes,
  // and outlines are unaffected. Lip and crownStripes are also in SHELL_INDICES
  // (they share shell source colors) so they inherit the finish correctly.
  if (opts.finish && opts.finish !== 'standard') {
    var filterRef = 'url(#hf-' + opts.finish + ')';
    SHELL_INDICES.forEach(function(i) {
      if (paths[i]) paths[i] = paths[i].replace(/<(\w+)/, '<$1 filter="' + filterRef + '"');
    });
  }

  var n = Math.max(0, Math.min(decalLayerIdx, TOTAL_PATHS));
  var bottomPaths = paths.slice(0, n).join('');
  var topPaths = paths.slice(n).join('');

  var topOpen = topOpacity < 1
    ? PATH_SEGMENTS.open.replace('<g ', '<g opacity="' + topOpacity + '" ')
    : PATH_SEGMENTS.open;

  // Render pipeline: [shell paths] → [stripe] → [decal] → [chinstrap/outline].
  // Stripe injects after shell (so it overlays the painted shell) but before
  // the dark outline/chinstrap details (so they crisp the edges).
  var body = recolor(
    PATH_SEGMENTS.open + bottomPaths + PATH_SEGMENTS.close +
    stripeMarkup +
    decal +
    topOpen + topPaths + PATH_SEGMENTS.close,
    helmet
  );

  // Finish filter defs — referenced per-path on shell paths only (applied
  // above in the path-array stage). Kept in <defs> regardless of the finish
  // in use so switching live doesn't need to re-emit them.
  var finishDefs = '';
  if (opts.finish === 'chrome') {
    finishDefs = '<filter id="hf-chrome"><feColorMatrix type="matrix" values="1.1 0 0 0 0  0 1.1 0 0 0  0 0 1.2 0 0  0 0 0 1 0"/></filter>';
  } else if (opts.finish === 'matte') {
    finishDefs = '<filter id="hf-matte"><feColorMatrix type="matrix" values="0.85 0 0 0 0.05  0 0.85 0 0 0.05  0 0 0.85 0 0.05  0 0 0 1 0"/></filter>';
  }

  // Highlight sweep gradient — faint diagonal shine across the decal
  // footprint. Unique ID per render so multiple helmets on a page don't
  // collide. Tuned low-opacity so it hints at gloss without drawing focus.
  var sweepDef = '<linearGradient id="' + sweepId + '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0"    stop-color="#fff" stop-opacity="0"/>' +
    '<stop offset="0.35" stop-color="#fff" stop-opacity="0.22"/>' +
    '<stop offset="0.55" stop-color="#fff" stop-opacity="0"/>' +
  '</linearGradient>';

  // Decal drop-shadow — outputs the SHADOW ONLY (no source graphic). The
  // decal itself is rendered separately as a sibling group. Keeping shadow
  // and blend-mode on different groups avoids the isolation-buffer
  // rectangle that appears when filter + mix-blend-mode share a parent.
  // Blur/offset are in objectBoundingBox units so the shadow scales with
  // the decal at any size.
  var shadowDef = '<filter id="' + shadowFilterId + '" x="-20%" y="-20%" width="140%" height="140%" primitiveUnits="objectBoundingBox">' +
    '<feGaussianBlur in="SourceAlpha" stdDeviation="0.02"/>' +
    '<feOffset dy="0.015"/>' +
    '<feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer>' +
  '</filter>';

  // Parse viewBox width so facing='left' can flip the whole body horizontally.
  var vbW = parseFloat((VIEWBOX.split(/\s+/)[2]) || '5000');
  var bodyWrap = opts.facing === 'left'
    ? '<g transform="scale(-1 1) translate(-' + vbW + ' 0)">' + body + '</g>'
    : body;

  return '<svg xmlns="http://www.w3.org/2000/svg" role="img" ' +
    'viewBox="' + VIEWBOX + '" width="' + size + '" height="' + size + '">' +
    '<title>' + (team.school || '') + ' ' + (team.name || '') + ' helmet</title>' +
    '<defs>' + finishDefs + sweepDef + shadowDef + '</defs>' +
    bodyWrap +
  '</svg>';
}

/** Legacy-compatible alias for existing call sites. */
export function teamHelmetSvg(teamId, size) {
  return renderHelmet(teamId, { size: size || 48 });
}

/**
 * Debug labeler — renders the helmet with each path assigned a unique HSL
 * color and a data-debug-index="N" attribute so the mockup page can overlay
 * numbers and let the user click to identify specific paths.
 * Used only by /mockups/helmets.html to map path indices to semantic roles
 * (stripes, lip, rivets). Not shipped to gameplay.
 */
export function renderHelmetDebug(opts) {
  opts = opts || {};
  var size = opts.size || 600;
  var labeled = PATH_SEGMENTS.paths.map(function(p, i) {
    var hue = Math.round(i * 360 / TOTAL_PATHS);
    var color = 'hsl(' + hue + ', 75%, 55%)';
    // Replace existing fill= attribute, or inject one if missing
    var out = /fill="[^"]*"/i.test(p)
      ? p.replace(/fill="[^"]*"/i, 'fill="' + color + '"')
      : p.replace(/<(\w+)/, '<$1 fill="' + color + '"');
    // Tag the element with its index for getBBox-based labeling
    return out.replace(/<(\w+)/, '<$1 data-debug-index="' + i + '" style="cursor:pointer"');
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + VIEWBOX + '" ' +
    'width="' + size + '" height="' + Math.round(size * 0.6) + '">' +
    PATH_SEGMENTS.open + labeled.join('') + PATH_SEGMENTS.close +
  '</svg>';
}

/** Total path count — exposed so the mockup can label/iterate them. */
export var HELMET_PATH_COUNT = TOTAL_PATHS;
