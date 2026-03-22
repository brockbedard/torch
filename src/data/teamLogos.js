/**
 * TORCH v0.21 — Team Logo SVG Paths
 * Placeholder geometric logos. Each is a single SVG path for viewBox="0 0 512 512".
 * Replace with custom-drawn paths or game-icons.net sourced paths.
 */

export var TEAM_LOGO_PATHS = {
  // Sentinels — shield/guardian silhouette
  sentinels: 'M256 32l-160 80v128c0 106 68 205 160 240 92-35 160-134 160-240V112zm0 64l112 56v96c0 74-47 143-112 168-65-25-112-94-112-168v-96z',

  // Timber Wolves — wolf head profile
  wolves: 'M128 384l32-64 32 32 32-64 32 32V192l-32-64h64l32-64 32 64 32-32 32 64-32 64 64 32v64l-32 32-64-32-32 64-64-32-32 64-64-32z',

  // Stags — antler/stag silhouette
  stags: 'M256 480l-32-96-64 32-32-96-64 32V256l64-64-32-64 64 32 32-64 32 64 32-128 32 128 32-64 32 64 64-32-32 64 64 64v96l-64-32-32 96-64-32z',

  // Serpents — cobra/snake coil
  serpents: 'M256 64c-70 0-128 58-128 128v64c0 35 29 64 64 64h16v-32c0-44 36-80 80-80s80 36 80 80v96c0 26-22 48-48 48h-32v48h32c53 0 96-43 96-96v-96c0-18-6-34-16-48 38-26 64-70 64-118 0-70-58-128-128-128zm-32 128a32 32 0 1 1 64 0 32 32 0 0 1-64 0z',
};

// Render a team logo as SVG markup
export function renderTeamLogo(teamId, color, size) {
  size = size || 48;
  var path = TEAM_LOGO_PATHS[teamId];
  if (!path) return '';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 512 512"><path d="' + path + '" fill="' + color + '"/></svg>';
}
