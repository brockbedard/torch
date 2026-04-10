/**
 * TORCH — Football Icon Helper
 *
 * Central source for the new multi-layer football SVG (replaces the old
 * gold/cream football paths used in the TORCH title and field renderer).
 *
 * "Classic leather" colorway for TORCH's dark background:
 *   - Tip panels (#1a1208 / #140e06) — near-black leather corners
 *   - Body panels (#8B4513) — saddle brown primary surface
 *   - Shadow panels (#6B3410) — dark brown 3D depth
 *   - Laces (#E8DCC8) — warm cream stitching
 *
 * The SVG is oriented at ~45° diagonally (tips at top-left and bottom-right)
 * — this is the natural orientation from the source. In canvas use, apply
 * an additional rotation if you need a specific axis alignment.
 *
 * Use `footballIconSVG(size)` for inline SVG markup.
 * Use `FOOTBALL_PATHS` object for canvas Path2D construction.
 */

// ── Path data (extracted from src/assets/football.svg) ──

export var FOOTBALL_PATHS = {
  // Tip panels (near-black leather edges)
  tipOuter: 'M53.895,512C24.129,512,0,487.871,0,458.105v-94.316C0,162.875,162.874,0.003,363.789,0.001L458.105,0C487.871,0,512,24.127,512,53.895v94.316C512,349.125,349.126,512,148.211,512H53.895z',
  tipInner: 'M512,148.211V53.895c0-14.767-5.942-28.142-15.563-37.877L16.019,496.437C25.752,506.057,39.129,512,53.895,512h94.316C349.126,512,512,349.125,512,148.211z',
  // Body panels (saddle brown leather)
  body1: 'M512,140.432V53.895C512,24.127,487.871,0,458.105,0l-86.537,0.001L512,140.432z',
  body2: 'M317.344,2.94C153.572,23.811,23.809,153.572,2.94,317.342l191.718,191.72c163.771-20.871,293.534-150.633,314.403-314.406L317.344,2.94z',
  body3: 'M0,371.568v86.537C0,487.871,24.129,512,53.895,512h86.537L0,371.568z',
  // Shadow panels (dark brown depth)
  shadow1: 'M512,140.432V53.895c0-14.767-5.942-28.142-15.563-37.877L442.01,70.444L512,140.432z',
  shadow2: 'M70.443,442.011l-54.426,54.427C25.752,506.057,39.129,512,53.895,512h86.537L70.443,442.011z',
  shadow3: 'M413.429,99.025L99.026,413.429l95.632,95.634C358.43,488.192,488.192,358.43,509.061,194.657L413.429,99.025z',
  // Laces (cream stitching) — polygon points converted to a closed path
  laces: 'M336.984,251.236L365.565,222.654L341.748,198.834L375.093,165.489L346.508,136.907L313.163,170.252L289.347,146.436L260.766,175.016L284.582,198.834L256,227.417L232.181,203.599L203.599,232.181L227.418,256L198.834,284.583L175.016,260.766L146.435,289.347L170.252,313.165L136.907,346.509L165.489,375.091L198.835,341.745L222.655,365.564L251.237,336.984L227.418,313.163L256,284.582L279.819,308.401L308.401,279.819L284.582,256L313.163,227.416Z'
};

// Color palette for the football
export var FOOTBALL_COLORS = {
  tipOuter: '#1a1208',
  tipInner: '#140e06',
  body: '#8B4513',
  shadow: '#6B3410',
  laces: '#E8DCC8'
};

/**
 * Returns the full multi-layer football as an SVG markup string.
 * ViewBox is 0 0 512 512. Pass `size` as the rendered width/height in px.
 *
 * @param {number} [size=24] - Pixel dimensions (width = height)
 * @param {number} [opacity=1] - Style opacity (0-1)
 * @param {string} [extraStyle=''] - Additional inline style
 * @returns {string} SVG markup
 */
export function footballIconSVG(size, opacity, extraStyle) {
  size = size || 24;
  opacity = opacity != null ? opacity : 1;
  extraStyle = extraStyle || '';
  var style = 'display:block;opacity:' + opacity + (extraStyle ? ';' + extraStyle : '');
  var p = FOOTBALL_PATHS;
  var c = FOOTBALL_COLORS;
  return '<svg viewBox="0 0 512 512" width="' + size + '" height="' + size + '" style="' + style + '">' +
    '<path fill="' + c.tipOuter + '" d="' + p.tipOuter + '"/>' +
    '<path fill="' + c.tipInner + '" d="' + p.tipInner + '"/>' +
    '<path fill="' + c.body + '" d="' + p.body1 + '"/>' +
    '<path fill="' + c.body + '" d="' + p.body2 + '"/>' +
    '<path fill="' + c.body + '" d="' + p.body3 + '"/>' +
    '<path fill="' + c.shadow + '" d="' + p.shadow1 + '"/>' +
    '<path fill="' + c.shadow + '" d="' + p.shadow2 + '"/>' +
    '<path fill="' + c.shadow + '" d="' + p.shadow3 + '"/>' +
    '<path fill="' + c.laces + '" d="' + p.laces + '"/>' +
    '</svg>';
}

/**
 * Returns an inline <span> with a vertical football SVG to replace the "O"
 * in "TORCH". Uses em-based sizing so it auto-scales with the parent's
 * font-size — no manual capHeight needed.
 *
 * Sizing: 0.5em wide × 0.93em tall (matches Teko Bold cap height and "O"
 * character width). vertical-align:middle + top:-0.08em compensates for
 * the CSS middle line sitting at x-height/2, which is lower than cap-height/2.
 *
 * viewBox "17 -25 66 150" tightly frames the rotated football (computed
 * bounding box: x 20..80, y -22..122).
 *
 * @param {string} [filter=''] - Optional CSS filter (e.g. drop-shadow)
 * @returns {string} HTML markup for the inline span
 */
export function footballInlineO(filter) {
  var f = filter ? 'filter:' + filter + ';' : '';
  return '<span style="display:inline-block;width:0.5em;height:0.93em;vertical-align:middle;position:relative;top:-0.08em;">' +
    '<svg viewBox="17 -25 66 150" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;width:100%;height:100%;' + f + '">' +
    '<g transform="translate(50,50) scale(0.22) rotate(-45) translate(-256,-256)">' +
    footballLayersMarkup() +
    '</g></svg></span>';
}

/**
 * Returns just the inner path markup (no wrapping <svg>). Use when you
 * need to embed the football inside an existing SVG with its own viewBox,
 * <defs>, or wrapping <g> (e.g., the TORCH title "O" with a gradient).
 */
export function footballLayersMarkup() {
  var p = FOOTBALL_PATHS;
  var c = FOOTBALL_COLORS;
  return '<path fill="' + c.tipOuter + '" d="' + p.tipOuter + '"/>' +
    '<path fill="' + c.tipInner + '" d="' + p.tipInner + '"/>' +
    '<path fill="' + c.body + '" d="' + p.body1 + '"/>' +
    '<path fill="' + c.body + '" d="' + p.body2 + '"/>' +
    '<path fill="' + c.body + '" d="' + p.body3 + '"/>' +
    '<path fill="' + c.shadow + '" d="' + p.shadow1 + '"/>' +
    '<path fill="' + c.shadow + '" d="' + p.shadow2 + '"/>' +
    '<path fill="' + c.shadow + '" d="' + p.shadow3 + '"/>' +
    '<path fill="' + c.laces + '" d="' + p.laces + '"/>';
}

/**
 * Draws the multi-layer football on a 2D canvas context at (cx, cy).
 * Uses Path2D for each layer. Preserves the existing ctx state — save/restore
 * is the caller's responsibility if they need to apply rotation/opacity.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - Center x coordinate
 * @param {number} cy - Center y coordinate
 * @param {number} [size=28] - Rendered height in pixels
 */
export function drawFootballCanvas(ctx, cx, cy, size) {
  size = size || 28;
  var scale = size / 512;
  var p = FOOTBALL_PATHS;
  var c = FOOTBALL_COLORS;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-256, -256);

  ctx.fillStyle = c.tipOuter;
  ctx.fill(new Path2D(p.tipOuter));
  ctx.fillStyle = c.tipInner;
  ctx.fill(new Path2D(p.tipInner));

  ctx.fillStyle = c.body;
  ctx.fill(new Path2D(p.body1));
  ctx.fill(new Path2D(p.body2));
  ctx.fill(new Path2D(p.body3));

  ctx.fillStyle = c.shadow;
  ctx.fill(new Path2D(p.shadow1));
  ctx.fill(new Path2D(p.shadow2));
  ctx.fill(new Path2D(p.shadow3));

  ctx.fillStyle = c.laces;
  ctx.fill(new Path2D(p.laces));

  ctx.restore();
}
