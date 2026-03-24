/**
 * TORCH v0.21 — Badge Icon SVG Paths
 * Source: game-icons.net (CC BY 3.0)
 * Each badge is a single SVG path string rendered inside <svg viewBox="0 0 512 512">.
 * Color applied via fill attribute.
 *
 * These replace the inline 16x16 badge SVGs from badges.js.
 * The old badgeSvg() function in badges.js still works for backwards compat.
 */

// Placeholder paths — these are simplified geometric representations.
// Replace with actual game-icons.net paths when downloading from:
// https://github.com/game-icons/icons
export var BADGE_ICON_PATHS = {
  // SPEED_LINES — sprint/running figure with motion lines
  SPEED_LINES: 'M256 96a64 64 0 1 0 0-128 64 64 0 0 0 0 128zm-76 100l-72 192h48l48-128 40 96h-56l-32 128h48l24-96h64l24 96h48l-32-128h-56l40-96 48 128h48l-72-192h-60l-44-60h-88z',

  // HELMET — football helmet profile
  HELMET: 'M160 416l0-160q0-96 48-160t128-64q80 0 128 64t48 160l0 32 64 0 0 64-64 0 0 64zm192-192a32 32 0 1 0 0-64 32 32 0 0 0 0 64z',

  // PADLOCK — closed padlock
  PADLOCK: 'M160 224v-64q0-40 28-68t68-28 68 28 28 68v64h32q26 0 45 19t19 45v128q0 26-19 45t-45 19H160q-26 0-45-19t-19-45V288q0-26 19-45t45-19zm32 0h128v-64q0-26-19-45t-45-19-45 19-19 45v64z',

  // FLAME — fire/torch flame
  FLAME: 'M256 32s-128 128-128 256c0 70 58 128 128 128s128-58 128-128C384 160 256 32 256 32zm0 336c-35 0-64-29-64-64 0-64 64-128 64-128s64 64 64 128c0 35-29 64-64 64z',

  // BRICK — brick wall pattern
  BRICK: 'M32 128h192v96H32zm224 0h224v96H256zM32 256h128v96H32zm160 0h160v96H192zm192 0h96v96h-96zM32 384h192v96H32zm224 0h224v96H256z',

  // BOLT — lightning bolt
  BOLT: 'M288 32L128 256h96L192 480l192-256h-96z',

  // CLEAT — boot/shoe with cleats
  CLEAT: 'M128 352l32-192q8-32 32-48t56-16h96q24 0 40 16t24 40l16 96 32 16v64q0 16-16 24l-256 0q-16-8-16-24v-64l-16-16 32-16zm48 64v32h32v-32zm96 0v32h32v-32zm96 0v32h32v-32z',

  // GLOVE — catching hand/glove
  GLOVE: 'M192 448l0-224-32-96q0-24 16-40t40-16l16 64 16-80q0-24 16-40t40-16l8 80 16-64q0-24 16-40t40-16l0 96 16-48q16-16 40-8t24 32l-16 128 32-16q24 0 32 24t0 40l-64 96-48 128z',

  // CROSSHAIR — target crosshair
  CROSSHAIR: 'M256 128a128 128 0 1 0 0 256 128 128 0 0 0 0-256zm0 64a64 64 0 1 0 0 128 64 64 0 0 0 0-128zM240 32h32v96h-32zm0 352h32v96h-32zM32 240h96v32H32zm352 0h96v32h-96z',

  // EYE — observing eye
  EYE: 'M256 128c-106 0-197 64-240 128 43 64 134 128 240 128s197-64 240-128c-43-64-134-128-240-128zm0 208a80 80 0 1 1 0-160 80 80 0 0 1 0 160zm0-128a48 48 0 1 0 0 96 48 48 0 0 0 0-96z',

  // CLIPBOARD — playbook/clipboard
  CLIPBOARD: 'M352 64h-32V32q0-13-9-22t-23-10H224q-13 0-22 10t-10 22v32h-32q-26 0-45 19t-19 45v320q0 26 19 45t45 19h192q26 0 45-19t19-45V128q0-26-19-45t-45-19zm-96 0h0q0-13 10-22t22-10h0q13 0 23 10t9 22h0zm64 320H192v-32h128zm0-96H192v-32h128zm0-96H192v-32h128z',

  // FOOTBALL — american football
  FOOTBALL: 'M416 96c-32-32-160-48-224 16S80 304 96 416c16 16 48 16 80 0l48-48-80-80 32-32 80 80 48-48-80-80 32-32 80 80 48-48c16-32 16-64 0-80zM96 96C64 128 48 192 80 256l48-48z',
};

// Render a badge icon as full SVG markup at a given size
export function renderBadgeIcon(badge, color, size) {
  size = size || 16;
  var path = BADGE_ICON_PATHS[badge];
  if (!path) return '';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 512 512"><path d="' + path + '" fill="' + color + '"/></svg>';
}
