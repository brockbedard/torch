/**
 * TORCH — Broadcast-Quality Helmet Generator (Vecteezy base)
 *
 * Built on a layered EPS vector from Vecteezy ("red-helmet-football-design"
 * by LIA, asset 15547674, free license with attribution).
 *
 * The source SVG has 122 discrete paths with a semantic color palette:
 *   - Red family (5 shades) = shell + stripe shadows = team.helmet.base
 *   - White               = interior highlights / stripe = team.helmet.stripe
 *   - Grey family (2)     = facemask cage             = team.helmet.facemask
 *   - Black family (2)    = bold outlines             = kept neutral
 *
 * We recolor by hex substitution at render time — no gradients to preserve,
 * so find-and-replace works cleanly and preserves the baked-in shading.
 *
 * Attribution required: "Vecteezy.com" credit must appear somewhere in the
 * shipped app (settings screen credits, about page, or footer).
 */

import helmetTemplate from './sources/helmet-template.svg?raw';
import { TEAMS } from '../../data/teams.js';
import { renderTeamBadge } from '../icons/teamLogos.js';

// ── Parse the template once on module load ────────────────────────────────
var VIEWBOX = (helmetTemplate.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 5333 5333';
var BODY = (helmetTemplate.match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';

// Split the body into ordered path segments so we can render the team decal
// IN BETWEEN them. Real helmets have decals painted on the shell before the
// chinstrap is attached, so the strap visually crosses over the logo. Paths
// later in the SVG render on top — matching that real-world depth order.
var PATH_SEGMENTS = (function() {
  // Match "<g transform=…>" opener, each <path .../>, and "</g>" closer
  var openG = (BODY.match(/^<g[^>]*>/) || [''])[0];
  var inner = BODY.replace(/^<g[^>]*>/, '').replace(/<\/g>\s*$/, '');
  var paths = inner.match(/<path[^/]*\/>/g) || [];
  return { open: openG, close: '</g>', paths: paths };
})();
var TOTAL_PATHS = PATH_SEGMENTS.paths.length;

// ── Source palette (exact hex values from the Vecteezy SVG) ───────────────
// These constants identify each semantic role so we can substitute per team.
var SOURCE = {
  shellLite:    '#ed1d24',  // 52 paths — main red shell fill
  shellDark:    '#a21b21',  // 20 paths — shadow side of shell
  shellMid:     '#7c161a',  //  2 paths — mid-shadow transition
  shellDeep:    '#5b1219',  //  4 paths — deepest shadow tone
  shellOutline: '#2e1416',  //  1 path  — shell outline tint
  stripe:       '#ffffff',  // 23 paths — white interior / stripe
  facemask:     '#a6a5a4',  // 11 paths — silver cage
  facemaskDark: '#413f40',  //  7 paths — cage shadow / chin strap
  outlineBlack: '#100f0d',  //  1 path  — main bold outline
  outlineDeep:  '#282626',  //  1 path  — outline detail
};

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

// ── Substitution helper: replace every `fill:{src}` occurrence ────────────
// We target the `fill:` style declarations, not `fill="…"` attrs, because
// the converted template uses style attributes exclusively.
function substFill(svg, src, dst) {
  // Case-insensitive hex matching, handles both 6- and 3-char forms
  return svg.replace(new RegExp('fill:' + src.replace('#', '#?'), 'gi'), 'fill:' + dst);
}

// ── Per-team recolor ───────────────────────────────────────────────────────
function recolor(body, helmet) {
  var base = helmet.base;
  var fm = helmet.facemask;
  var stripeCol = helmet.stripe;

  // Derive the 5-stop base family (match the source's shading gradient).
  // Tuned so darker team colors still show depth — ratios calibrated against
  // the original red palette: main=ed1d24, dark=-25%, mid=-35%, deep=-55%, outline=-72%
  var shellLite = base;
  var shellDark = shade(base, -0.25);
  var shellMid  = shade(base, -0.35);
  var shellDeep = shade(base, -0.55);
  var shellOl   = shade(base, -0.72);

  // Facemask — 2 shades
  var fmLite = fm;
  var fmDark = shade(fm, -0.35);

  var out = body;
  out = substFill(out, SOURCE.shellLite,    shellLite);
  out = substFill(out, SOURCE.shellDark,    shellDark);
  out = substFill(out, SOURCE.shellMid,     shellMid);
  out = substFill(out, SOURCE.shellDeep,    shellDeep);
  out = substFill(out, SOURCE.shellOutline, shellOl);
  out = substFill(out, SOURCE.stripe,       stripeCol);
  out = substFill(out, SOURCE.facemask,     fmLite);
  out = substFill(out, SOURCE.facemaskDark, fmDark);
  // outlineBlack + outlineDeep stay as-is — they're the bold outline strokes
  return out;
}

// ── Decal — team badge composited on the side panel ───────────────────────
function extractBadgeInner(teamId) {
  var svg = renderTeamBadge(teamId, 512);
  var m = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>\s*$/);
  return m ? m[1] : '';
}

// Decal default position (source viewBox coords 0..5333). Side panel,
// above the chin strap, tilted a touch to follow the helmet curve.
var DECAL_DEFAULT = { x: 1700, y: 2000, size: 1200, tilt: -5, opacity: 0.92, blend: 'multiply' };

function decalLayer(teamId, decalOpts) {
  var inner = extractBadgeInner(teamId);
  if (!inner) return '';
  var d = Object.assign({}, DECAL_DEFAULT, decalOpts || {});
  var half = d.size / 2;
  // mix-blend-mode:multiply makes the decal integrate into the painted shell
  // (light areas stay transparent, colored/dark areas darken into the helmet).
  // Reads as "painted on" rather than "floating sticker".
  var style = 'mix-blend-mode:' + (d.blend || 'multiply') + ';';
  return '<g transform="translate(' + d.x + ' ' + d.y + ') rotate(' + d.tilt + ' ' + half + ' ' + half + ')" ' +
    'style="' + style + '" opacity="' + d.opacity + '">' +
    '<svg width="' + d.size + '" height="' + d.size + '" viewBox="0 0 512 512">' +
      inner +
    '</svg>' +
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
 * @param {number}  [opts.decalLayer=85]     # of bottom paths drawn before the decal.
 *                                           The remaining top paths (chinstrap, outlines,
 *                                           rivets) render OVER the decal. 0..122.
 * @param {number}  [opts.topLayerOpacity=1] Opacity of paths drawn AFTER the decal
 *                                           (chinstrap, outlines). 0..1. Lower values
 *                                           fade the chinstrap away from the logo.
 * @returns {string} SVG string
 */
export function renderHelmet(teamId, opts) {
  opts = opts || {};
  var size = opts.size || 200;
  var showDecal = opts.showDecal !== false;
  var decalLayerIdx = opts.decalLayer !== undefined ? opts.decalLayer : 85;
  var topOpacity = opts.topLayerOpacity !== undefined ? opts.topLayerOpacity : 1;

  var team = TEAMS[teamId];
  if (!team) return '';
  var helmet = team.helmet || { base: '#888', facemask: '#ccc', stripe: '#fff' };

  var decal = showDecal ? decalLayer(teamId, opts.decal) : '';

  // Render pipeline: [first N paths: shell body] → [decal] → [remaining paths:
  // chinstrap/outlines/rivets]. When decalLayerIdx === TOTAL_PATHS, all paths
  // render before the decal (original behavior). When === 0, decal underneath
  // everything. Sweet spot lets the chinstrap+final outlines cross the decal.
  var n = Math.max(0, Math.min(decalLayerIdx, TOTAL_PATHS));
  var bottomPaths = PATH_SEGMENTS.paths.slice(0, n).join('');
  var topPaths = PATH_SEGMENTS.paths.slice(n).join('');

  // The top group gets an optional opacity wrapper. When topLayerOpacity=1
  // (default), no visual change. When <1, the chinstrap/outlines fade so the
  // decal reads more clearly.
  var topOpen = topOpacity < 1
    ? PATH_SEGMENTS.open.replace('<g ', '<g opacity="' + topOpacity + '" ')
    : PATH_SEGMENTS.open;

  var body = recolor(
    PATH_SEGMENTS.open + bottomPaths + PATH_SEGMENTS.close +
    decal +
    topOpen + topPaths + PATH_SEGMENTS.close,
    helmet
  );
  // `decal` var is consumed above as part of the body; we emit empty here so
  // the final <svg> template doesn't duplicate it.
  decal = '';

  // Build final SVG. Decal is appended AFTER the body so it renders on top.
  return '<svg xmlns="http://www.w3.org/2000/svg" role="img" ' +
    'viewBox="' + VIEWBOX + '" width="' + size + '" height="' + size + '">' +
    '<title>' + (team.school || '') + ' ' + (team.name || '') + ' helmet</title>' +
    body +
    decal +
  '</svg>';
}

/** Legacy-compatible alias for existing call sites. */
export function teamHelmetSvg(teamId, size) {
  return renderHelmet(teamId, { size: size || 48 });
}
