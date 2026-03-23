/**
 * TORCH v0.22 — Team Badge Marks
 * Bold letter marks on team-color circles. Clean placeholder art.
 * School abbreviations: RS (Ridgemont), TW (Northern Pines), CV (Crestview), BS (Blackwater)
 * Supports 4 sizes: hero (140px), card (80px), icon (40px), micro (24px).
 */

var TEAM_MARKS = {
  sentinels: { letters: 'RS', bg: '#1B2838', fg: '#C4A265', border: '#C4A265' },
  wolves:    { letters: 'TW', bg: '#1B3A2D', fg: '#D4D4D4', border: '#D4D4D4' },
  stags:     { letters: 'CV', bg: '#F28C28', fg: '#1C1C1C', border: '#1C1C1C' },
  serpents:  { letters: 'BS', bg: '#2E0854', fg: '#39FF14', border: '#39FF14' },
};

/**
 * Render a team badge mark at a given size.
 * @param {string} teamId
 * @param {number} size — hero:140, card:80, icon:40, micro:24
 * @returns {string} SVG markup
 */
export function renderTeamBadge(teamId, size) {
  size = size || 80;
  var m = TEAM_MARKS[teamId];
  if (!m) return '';
  var r = size / 2;
  var bw = Math.max(1.5, Math.round(size * 0.035)); // ~3px at 80
  var fontSize = Math.round(size * 0.38);
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="' + r + '" cy="' + r + '" r="' + (r - bw) + '" fill="' + m.bg + '" stroke="' + m.border + '" stroke-width="' + bw + '"/>' +
    '<text x="' + r + '" y="' + (r + fontSize * 0.35) + '" text-anchor="middle" font-family="Teko,sans-serif" font-weight="700" font-size="' + fontSize + 'px" fill="' + m.fg + '" letter-spacing="1">' + m.letters + '</text>' +
    '</svg>';
}

// Legacy compat
export function renderTeamLogo(teamId, color, size) {
  return renderTeamBadge(teamId, size);
}
