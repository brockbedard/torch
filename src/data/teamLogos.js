/**
 * TORCH v0.22 — Team Badge Emblem SVGs
 * Flat vector construction, bold outlines, pass silhouette test at 24px.
 * Each uses maximally contrasting geometric vocabularies.
 * 4 responsive sizes: hero (140px), card (80px), icon (40px), micro (24px).
 */

// ============================================================
// SENTINELS — Rectangular/angular: Heraldic shield with visor slit
// ============================================================
function sentinelsBadge(size) {
  var s = size || 80;
  var showDetail = s >= 40;
  var showFull = s >= 80;
  return '<svg viewBox="0 0 100 120" width="' + s + '" height="' + Math.round(s * 1.2) + '" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    // Shield body
    '<path d="M50 4L10 24V68C10 90 28 108 50 116C72 108 90 90 90 68V24L50 4Z" fill="#1B2838" stroke="#C4A265" stroke-width="3"/>' +
    // Inner shield line
    (showDetail ? '<path d="M50 14L18 30V66C18 84 34 100 50 106C66 100 82 84 82 66V30L50 14Z" fill="none" stroke="#C4A265" stroke-width="1.5" opacity="0.4"/>' : '') +
    // Visor slit (the sentinel's gaze)
    (showDetail ? '<path d="M30 52H70" stroke="#C4A265" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M34 44H66" stroke="#C4A265" stroke-width="2" stroke-linecap="round" opacity="0.5"/>' +
      '<path d="M34 60H66" stroke="#C4A265" stroke-width="2" stroke-linecap="round" opacity="0.5"/>' : '') +
    // Tower battlements at top
    (showFull ? '<rect x="22" y="20" width="8" height="6" fill="#C4A265" opacity="0.6"/>' +
      '<rect x="36" y="16" width="8" height="6" fill="#C4A265" opacity="0.6"/>' +
      '<rect x="56" y="16" width="8" height="6" fill="#C4A265" opacity="0.6"/>' +
      '<rect x="70" y="20" width="8" height="6" fill="#C4A265" opacity="0.6"/>' : '') +
    '</svg>';
}

// ============================================================
// TIMBER WOLVES — Diagonal/triangular: Wolf head profile
// ============================================================
function wolvesBadge(size) {
  var s = size || 80;
  var showDetail = s >= 40;
  var showFull = s >= 80;
  return '<svg viewBox="0 0 100 100" width="' + s + '" height="' + s + '" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    // Wolf head profile, tilted 10° forward — angular snout, pointed ears
    '<path d="M25 85L15 55L20 45L30 25L38 15L42 25L50 10L58 25L62 15L70 25L80 45L85 55L75 85Z" fill="#1B3A2D" stroke="#D4D4D4" stroke-width="2.5"/>' +
    // Ear fills
    (showDetail ? '<path d="M38 15L42 25L34 28Z" fill="#D4D4D4" opacity="0.3"/>' +
      '<path d="M62 15L58 25L66 28Z" fill="#D4D4D4" opacity="0.3"/>' : '') +
    // Eye
    '<circle cx="45" cy="45" r="' + (showDetail ? '4' : '3') + '" fill="#D4D4D4"/>' +
    // Snout line
    (showDetail ? '<path d="M30 65L15 55" stroke="#D4D4D4" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M30 65L40 58" stroke="#D4D4D4" stroke-width="1.5" opacity="0.5"/>' : '') +
    // Jaw line
    (showFull ? '<path d="M25 85L35 72L55 70L75 85" stroke="#D4D4D4" stroke-width="1" opacity="0.3"/>' : '') +
    // Claw marks (diagonal slashes)
    (showFull ? '<path d="M68 35L78 55" stroke="#C4A265" stroke-width="1.5" opacity="0.4"/>' +
      '<path d="M72 33L82 53" stroke="#C4A265" stroke-width="1.5" opacity="0.4"/>' +
      '<path d="M76 31L86 51" stroke="#C4A265" stroke-width="1.5" opacity="0.4"/>' : '') +
    '</svg>';
}

// ============================================================
// STAGS — Vertical/branching: Symmetrical antler crown (no face)
// ============================================================
function stagsBadge(size) {
  var s = size || 80;
  var h = Math.round(s * 1.3); // Tall vertical orientation
  var showDetail = s >= 40;
  var showFull = s >= 80;
  return '<svg viewBox="0 0 100 130" width="' + s + '" height="' + h + '" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    // Central trunk
    '<path d="M50 130V60" stroke="#F28C28" stroke-width="4" stroke-linecap="round"/>' +
    // Main antler branches (left)
    '<path d="M50 60L25 30L15 10" stroke="#F28C28" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M35 42L20 45" stroke="#F28C28" stroke-width="3" stroke-linecap="round"/>' +
    (showDetail ? '<path d="M25 30L10 25" stroke="#F28C28" stroke-width="2.5" stroke-linecap="round"/>' : '') +
    (showFull ? '<path d="M30 36L18 32" stroke="#F28C28" stroke-width="2" stroke-linecap="round" opacity="0.7"/>' : '') +
    // Main antler branches (right — mirrored)
    '<path d="M50 60L75 30L85 10" stroke="#F28C28" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M65 42L80 45" stroke="#F28C28" stroke-width="3" stroke-linecap="round"/>' +
    (showDetail ? '<path d="M75 30L90 25" stroke="#F28C28" stroke-width="2.5" stroke-linecap="round"/>' : '') +
    (showFull ? '<path d="M70 36L82 32" stroke="#F28C28" stroke-width="2" stroke-linecap="round" opacity="0.7"/>' : '') +
    // Antler tips (smaller tines)
    (showFull ? '<path d="M15 10L8 2" stroke="#F28C28" stroke-width="2" stroke-linecap="round" opacity="0.8"/>' +
      '<path d="M85 10L92 2" stroke="#F28C28" stroke-width="2" stroke-linecap="round" opacity="0.8"/>' : '') +
    // Base/crown circle
    (showDetail ? '<circle cx="50" cy="65" r="5" fill="#F28C28" opacity="0.3"/>' : '') +
    '</svg>';
}

// ============================================================
// SERPENTS — Curved/sinuous: Coiled snake forming S-shape
// ============================================================
function serpentsBadge(size) {
  var s = size || 80;
  var showDetail = s >= 40;
  var showFull = s >= 80;
  return '<svg viewBox="0 0 100 100" width="' + s + '" height="' + s + '" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    // Circular badge outline
    '<circle cx="50" cy="50" r="46" fill="#2E0854" stroke="#39FF14" stroke-width="2.5"/>' +
    // S-shaped snake body
    '<path d="M35 20C35 20 65 20 65 40C65 55 35 50 35 65C35 80 65 80 65 80" stroke="#39FF14" stroke-width="5" stroke-linecap="round" fill="none"/>' +
    // Snake head (top of S)
    (showDetail ? '<circle cx="35" cy="18" r="5" fill="#39FF14"/>' +
      // Fangs
      '<path d="M32 22L30 28" stroke="#39FF14" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M38 22L40 28" stroke="#39FF14" stroke-width="2" stroke-linecap="round"/>' : '') +
    // Eye
    (showDetail ? '<circle cx="34" cy="16" r="1.5" fill="#2E0854"/>' : '') +
    // Tail (bottom of S)
    (showDetail ? '<path d="M65 80L72 85L68 90" stroke="#39FF14" stroke-width="2.5" stroke-linecap="round"/>' : '') +
    // Scale pattern on body
    (showFull ? '<path d="M55 35C58 37 58 43 55 45" stroke="#39FF14" stroke-width="1" opacity="0.3"/>' +
      '<path d="M45 55C42 57 42 63 45 65" stroke="#39FF14" stroke-width="1" opacity="0.3"/>' +
      '<path d="M50 45C53 47 53 53 50 55" stroke="#39FF14" stroke-width="1" opacity="0.3"/>' : '') +
    '</svg>';
}

// ============================================================
// EXPORTS
// ============================================================

export var TEAM_BADGES = {
  sentinels: sentinelsBadge,
  wolves: wolvesBadge,
  stags: stagsBadge,
  serpents: serpentsBadge,
};

/**
 * Render a team badge emblem at a given size.
 * @param {string} teamId
 * @param {number} size — hero:140, card:80, icon:40, micro:24
 * @returns {string} SVG markup
 */
export function renderTeamBadge(teamId, size) {
  var fn = TEAM_BADGES[teamId];
  if (!fn) return '';
  return fn(size || 80);
}

// Legacy compat — old renderTeamLogo still works
export function renderTeamLogo(teamId, color, size) {
  return renderTeamBadge(teamId, size);
}
