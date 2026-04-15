/**
 * TORCH — Ember Eight Wordmark System
 *
 * Typographic identity per team. Spec: docs/TORCH-WORDMARK-SYSTEM.md.
 * Keyed by the legacy internal team ids (sentinels, wolves, stags, …) so
 * this maps cleanly into existing TEAMS lookups across the codebase.
 *
 * Fields:
 *   name        Full wordmark ("Ridgemont Boars") — used in T2 label contexts
 *   mascot      Mascot only ("Boars") — used in T1 hero on team select
 *   abbr        3-letter code — used in T3 scorebug
 *   font        CSS font-family string
 *   weight      CSS font-weight number
 *   transform   CSS text-transform
 *   letterSpacing  CSS letter-spacing
 *   fill        CSS color (primary text color)
 *   textShadow  CSS text-shadow (T1 only; T2 auto-scales, T3 drops it)
 *   heroSize    T1 pixel size tuned per typeface for the carousel context
 */

export var TEAM_WORDMARKS = {
  // Ridgemont Boars — heavy slab serif, mill-town industrial
  sentinels: {
    name: 'Ridgemont Boars',
    mascot: 'Boars',
    abbr: 'RDG',
    font: "'Zilla Slab', serif",
    weight: 700,
    transform: 'uppercase',
    letterSpacing: '0.03em',
    fill: '#EBB010',
    textShadow: '3px 3px 0px #8B0000, 0 0 24px rgba(235,176,16,0.3)',
    heroSize: 64,
    scorebugSize: 12,
  },
  // Vermont Maples — high-contrast serif, ivy-adjacent prestige
  maples: {
    name: 'Vermont Maples',
    mascot: 'Maples',
    abbr: 'VRM',
    font: "'Playfair Display', serif",
    weight: 900,
    transform: 'none',
    letterSpacing: '0.02em',
    fill: '#FDF4D4',
    textShadow: '2px 2px 0px #7A1E2E, 0 0 18px rgba(122,30,46,0.3)',
    heroSize: 60,
    scorebugSize: 12,
  },
  // Hollowridge Spectres — thin sans with extreme tracking, memorial ghostly
  stags: {
    name: 'Hollowridge Spectres',
    mascot: 'Spectres',
    abbr: 'HLW',
    font: "'Josefin Sans', sans-serif",
    weight: 100,
    transform: 'uppercase',
    letterSpacing: '0.15em',
    fill: '#FFFFFF',
    textShadow: '0 0 8px rgba(255,244,212,0.6), 0 0 28px rgba(93,173,226,0.6), 0 0 56px rgba(27,79,114,0.4)',
    heroSize: 48,      // thin weight + wide tracking — keep size up for readability
    scorebugSize: 13,  // Josefin 100 hairline — bump for scorebug legibility
    scorebugWeight: 400,  // T1 hero stays weight 100 (ghostly); scorebug uses
                          // weight 400 since weight-100 is invisible at 13px
                          // on #07060A dark background (per audit item a)
  },
  // Coral Bay Dolphins — high-fashion Didone, South Florida luxury
  wolves: {
    name: 'Coral Bay Dolphins',
    mascot: 'Dolphins',
    abbr: 'CRL',
    font: "'Italiana', serif",
    weight: 400,
    transform: 'uppercase',
    letterSpacing: '0.05em',
    fill: '#FF7EB3',
    textShadow: '3px 3px 0px #2E0854, 0 0 20px rgba(255,126,179,0.35)',
    heroSize: 54,      // thin didone — bump to hold readability
    scorebugSize: 14,  // Italiana thin strokes — bump per audit concern
  },
  // Blackwater Serpents — authoritative serif, ancient mythic
  serpents: {
    name: 'Blackwater Serpents',
    mascot: 'Serpents',
    abbr: 'BLK',
    font: "'DM Serif Display', serif",
    weight: 400,
    transform: 'uppercase',
    letterSpacing: '0.04em',
    fill: '#F5C542',
    textShadow: '3px 3px 0px #14B8A6, -1px -1px 0px #14B8A6, 0 0 16px rgba(245,197,66,0.3)',
    heroSize: 54,
    scorebugSize: 12,
  },
  // Helix Salamanders — technical sport, angular science
  salamanders: {
    name: 'Helix Salamanders',
    mascot: 'Salamanders',
    abbr: 'HLX',
    font: "'Chakra Petch', sans-serif",
    weight: 600,
    transform: 'uppercase',
    letterSpacing: '0.06em',
    fill: '#F39C12',
    textShadow: '3px 3px 0px #8E44AD, 0 0 18px rgba(243,156,18,0.3)',
    heroSize: 38,      // 11 chars — visually matched to other teams
    scorebugSize: 10,  // "SALAMANDERS" is the longest mascot (11 chars) — pull down
  },
  // Larkspur Pronghorns — rounded display, dynasty scoreboard
  pronghorns: {
    name: 'Larkspur Pronghorns',
    mascot: 'Pronghorns',
    abbr: 'LRK',
    font: "'Righteous', sans-serif",
    weight: 400,
    transform: 'uppercase',
    letterSpacing: '0.06em',
    fill: '#F59E0B',
    textShadow: '3px 3px 0px #062014, 0 0 20px rgba(245,158,11,0.3)',
    heroSize: 40,      // 10 chars — Righteous reads large, pull down
    scorebugSize: 11,  // 10-char "PRONGHORNS"
  },
  // Sacramento Raccoons — art-center monospace, intentionally weird
  raccoons: {
    name: 'Sacramento Raccoons',
    mascot: 'Raccoons',
    abbr: 'SAC',
    font: "'Major Mono Display', monospace",
    weight: 400,
    transform: 'none',       // mono renders lowercase as small caps — leave mixed-case
    letterSpacing: '0.04em',
    fill: '#F4F4F5',
    textShadow: '0 0 18px rgba(255,140,0,0.45), 0 0 42px rgba(255,140,0,0.15)',
    heroSize: 42,      // monospace chars are wide — pull down
    scorebugSize: 10,  // Major Mono is wide — "Raccoons" at 10px
  },
};

export function getWordmark(teamId) {
  return TEAM_WORDMARKS[teamId] || null;
}
