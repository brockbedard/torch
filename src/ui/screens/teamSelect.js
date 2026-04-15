/**
 * TORCH — Team Select Screen (Ember Eight V1 "Pure Identity" Carousel)
 *
 * Vertical hero carousel — one team at a time, full-bleed with team color wash.
 * Tier filter (UNDERDOG / CONTENDER / POWERHOUSE) narrows the carousel.
 * EASY / MEDIUM / HARD AI difficulty is a separate dimension, kept from prior version.
 * Hold-to-coach (1.4s) commits the pick — prevents misfires on swipe-heavy flow.
 *
 * Source-of-truth mockup: public/mockups/team-select.html (variant V1).
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import AudioStateManager from '../../engine/audioManager.js';
import { GS, setGs, getOffCards, getDefCards } from '../../state.js';
import { TEAMS, getSeasonOpponents } from '../../data/teams.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { renderTeamBadge } from '../../assets/icons/teamLogos.js';
import { generateConditions } from '../../data/gameConditions.js';
import { renderTeamWordmark } from '../teamWordmark.js';
import { TEAM_WORDMARKS } from '../../data/teamWordmarks.js';

// Carousel ordering — locked by the mockup. Top tier first, then middle, then bottom.
var CAROUSEL_ORDER = [
  'pronghorns',   // POWERHOUSE
  'stags',        // POWERHOUSE
  'maples',       // CONTENDER
  'salamanders',  // CONTENDER
  'wolves',       // CONTENDER
  'serpents',     // CONTENDER
  'sentinels',    // UNDERDOG
  'raccoons',     // UNDERDOG
];

// Per-team palette — `structure` is the high-contrast stripe/divider color that pops
// against `primary`. These aren't in teams.js so they live here.
var PALETTE = {
  pronghorns:  { structure: '#F5DEB3', bg: '#062014' },
  stags:       { structure: '#FFFFFF', bg: '#020510' },
  maples:      { structure: '#D97706', bg: '#2E0A14' },
  salamanders: { structure: '#E84393', bg: '#186A3B' },
  wolves:      { structure: '#6B1E7F', bg: '#080118' },
  serpents:    { structure: '#F5C542', bg: '#0A1F1E' },
  sentinels:   { structure: '#EBB010', bg: '#4A0000' },
  raccoons:    { structure: '#84CC16', bg: '#09090B' },
};

var TIER_CLASS = { top: 'pwr', middle: 'cnt', bottom: 'und' };
var TIER_LABEL = { top: 'POWERHOUSE', middle: 'CONTENDER', bottom: 'UNDERDOG' };

// ── Color math helpers (used for team-colored CTA) ──
function _hexToRgb(hex) {
  var h = (hex || '#888').replace('#', '');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  var n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function _rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(function(v) {
    var s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
    return s.length === 1 ? '0' + s : s;
  }).join('');
}
/** Lighten (amt>0) or darken (amt<0) a hex color. amt in [-1, 1]. */
function shade(hex, amt) {
  var c = _hexToRgb(hex);
  var mix = amt >= 0 ? 255 : 0;
  var f = Math.abs(amt);
  return _rgbToHex(c.r + (mix - c.r) * f, c.g + (mix - c.g) * f, c.b + (mix - c.b) * f);
}
function hexWithAlpha(hex, alpha) {
  var c = _hexToRgb(hex);
  return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')';
}
/** Relative luminance (0..1). */
function luminance(hex) {
  var c = _hexToRgb(hex);
  return (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
}

function injectStyles() {
  if (document.getElementById('ts-v1-anims')) return;
  var s = document.createElement('style');
  s.id = 'ts-v1-anims';
  s.textContent = [
    // Stage now overlays the entire viewport (including CTA area) so team
    // color + helmet stripes stretch edge-to-edge with no black seam.
    '.ts-stage{position:absolute;inset:0;overflow:hidden;background:#0A0804;padding-top:env(safe-area-inset-top,0px);}',
    // Card is absolute-inset and NO LONGER a flex container — children use
    // absolute % positioning for deterministic composition across viewports.
    '.ts-card{position:absolute;inset:0;opacity:0;pointer-events:none;}',
    '.ts-card.active{opacity:1;pointer-events:auto;}',
    // Nav zones — anchored to the upper/lower edges but sized so they don't
    // intercept CTA taps (which sit in the bottom 18-22% of viewport).
    '.ts-nav-up{position:absolute;left:0;right:0;top:0;height:14%;z-index:8;}',
    '.ts-nav-down{position:absolute;left:0;right:0;top:72%;height:8%;z-index:8;}',
    '.ts-bg-wash{position:absolute;inset:0;}',
    '.ts-bg-wash::before{content:"";position:absolute;inset:0;background:radial-gradient(90% 50% at 50% 18%, rgba(255,255,255,0.22), transparent 65%);}',
    // Subtle bottom darken — enough to seat the CTA on a shaded edge without
    // fading the team color out. Team color stays saturated to the bottom.
    '.ts-bg-wash::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.22) 100%);}',
    // Info-block backdrop — a soft dark radial behind the text improves
    // contrast against light team washes (Salamanders green, Spectres ice).
    '.ts-info-backdrop{position:absolute;inset:auto 0 0 0;height:54%;background:radial-gradient(ellipse 80% 90% at 50% 70%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.22) 45%, transparent 80%);z-index:2;pointer-events:none;}',
    '.ts-helmet-stripe{position:absolute;top:0;bottom:0;width:6px;z-index:2;}',
    '.ts-helmet-stripe.l{left:0;} .ts-helmet-stripe.r{right:0;}',
    '.ts-helmet-stripe::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg, transparent 0%, currentColor 18%, currentColor 82%, transparent 100%);opacity:0.85;}',
    '.ts-helmet-stripe::after{content:"";position:absolute;inset:0;background:currentColor;filter:blur(8px);opacity:0.4;}',
    '.ts-seam{position:absolute;top:0;left:0;right:0;height:50px;z-index:2;background:linear-gradient(180deg, currentColor, transparent);opacity:0.55;pointer-events:none;}',
    '.ts-top-bar{position:absolute;top:calc(env(safe-area-inset-top,0px) + 18px);left:0;right:0;padding:0 22px;display:flex;justify-content:space-between;align-items:flex-start;z-index:5;}',
    '.ts-pos-dots{display:flex;flex-direction:column;gap:6px;}',
    // Position dots — inherit the card's `color` (set to structure color on
    // .ts-logo-stage / stripes), so they match the helmet-stripe hue per team.
    '.ts-pos-dots .ts-dot{width:3px;height:12px;border-radius:2px;background:currentColor;opacity:0.35;transition:height .25s ease, opacity .25s ease;}',
    '.ts-pos-dots .ts-dot.on{height:22px;opacity:1;}',
    '.ts-tier-badge{font-family:"Rajdhani",sans-serif;font-weight:700;font-size:10px;letter-spacing:3px;padding:7px 13px;border:1px solid;border-radius:2px;backdrop-filter:blur(8px);background:rgba(0,0,0,0.3);text-transform:uppercase;position:relative;}',
    '.ts-tier-badge.pwr{border-color:rgba(235,176,16,0.7);color:#EBB010;}',
    '.ts-tier-badge.cnt{border-color:rgba(255,255,255,0.55);color:#fff;}',
    '.ts-tier-badge.und{border-color:rgba(255,107,58,0.8);color:#FF6B3A;}',
    // Logo-wrap absolute at upper third of card — deterministic position
    // regardless of viewport height; no flex juggling with info/spacer.
    '.ts-logo-wrap{position:absolute;left:0;right:0;top:11%;height:36%;display:flex;align-items:center;justify-content:center;z-index:3;pointer-events:none;}',
    '.ts-logo-stage{width:260px;height:260px;position:relative;display:flex;align-items:center;justify-content:center;}',
    '.ts-logo-stage::before{content:"";position:absolute;inset:-26px;border-radius:50%;background:radial-gradient(circle, currentColor 0%, transparent 60%);opacity:0.32;filter:blur(20px);z-index:0;}',
    '.ts-logo-stage svg{display:block;width:220px;height:220px;position:relative;z-index:1;filter:drop-shadow(0 0 22px rgba(0,0,0,0.55)) drop-shadow(0 14px 28px rgba(0,0,0,0.5));}',
    // Info block absolute at ~52% down — just below the logo area.
    '.ts-info{position:absolute;left:0;right:0;top:52%;padding:0 24px;text-align:center;z-index:3;pointer-events:none;}',
    '.ts-name{font-family:"Teko",sans-serif;font-weight:600;line-height:0.85;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;color:#fff;text-shadow:0 4px 18px rgba(0,0,0,0.6);}',
    '.ts-name.len-s{font-size:68px;}',
    '.ts-name.len-m{font-size:56px;letter-spacing:0.5px;}',
    '.ts-name.len-l{font-size:44px;letter-spacing:0px;}',
    '.ts-school{font-family:"Rajdhani",sans-serif;font-weight:700;font-size:13px;letter-spacing:2.5px;text-transform:uppercase;color:currentColor;margin-top:10px;opacity:0.95;text-shadow:0 2px 8px rgba(0,0,0,0.5);}',
    '.ts-divider{width:60px;height:2px;margin:12px auto;background:linear-gradient(90deg,transparent,currentColor,transparent);box-shadow:0 0 10px currentColor;}',
    '.ts-tagline{font-family:"Teko",sans-serif;font-weight:500;font-size:17px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.95);}',
    '.ts-tagline .sep{margin:0 10px;color:currentColor;opacity:0.95;font-weight:700;}',
    // CTA wrap — absolute at lower portion of the stage. Positioned so
    // the HOLD TO COACH button sits around 86% down the viewport, with
    // the SWIPE hint just above it. pointer-events:none on the wrap;
    // the button re-enables interaction.
    '.ts-cta-wrap{position:absolute;left:0;right:0;bottom:calc(36px + env(safe-area-inset-bottom,0px));padding:0 22px;z-index:10;background:transparent;pointer-events:none;}',
    '.ts-cta-wrap > *{pointer-events:auto;}',
    '.ts-diff-row{display:flex;gap:6px;justify-content:center;margin-bottom:10px;}',
    '.ts-diff-row .ts-diff{flex:1;font-family:"Teko",sans-serif;font-weight:700;font-size:12px;letter-spacing:2px;padding:6px 0;border-radius:3px;cursor:pointer;border:1.5px solid;background:transparent;transition:all .2s;}',
    // CTA — team-colored via CSS vars, updated per carousel change. Uses the
    // `structure` (high-contrast accent) color rather than the primary so
    // the button pops OFF the team-washed background instead of blending.
    '.ts-btn-coach{width:100%;height:58px;border:none;border-radius:6px;background:linear-gradient(180deg, var(--cta-hi, #EBB010) 0%, var(--cta-lo, #FF4511) 100%);color:var(--cta-text, #1A0A00);font-family:"Rajdhani",sans-serif;font-weight:700;font-size:13px;letter-spacing:4px;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.4), 0 0 22px var(--cta-glow, rgba(255,255,255,0.25));animation:ts-breathe 2.4s ease-in-out infinite;will-change:transform,box-shadow;transition:background 0.35s ease, box-shadow 0.35s ease, color 0.35s ease;}',
    '@keyframes ts-breathe{0%,100%{transform:scale(1);}50%{transform:scale(1.025);}}',
    '.ts-btn-coach::before{content:"";position:absolute;left:0;right:0;top:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.32),transparent);pointer-events:none;border-radius:6px 6px 0 0;}',
    '.ts-btn-coach .ts-fill{position:absolute;left:0;top:0;bottom:0;width:0%;background:rgba(255,255,255,0.3);pointer-events:none;transition:width .08s linear;}',
    '.ts-btn-coach.holding{animation-play-state:paused;transform:scale(0.97);}',
    // Swipe hint — sits inside the CTA wrap above the button, between
    // the tagline block and the CTA. Pill-style with arrows that bob.
    '.ts-swipe-hint{display:flex;align-items:center;justify-content:center;gap:6px;margin:0 auto 14px;font-family:"Rajdhani",sans-serif;font-weight:700;font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.85);text-shadow:0 1px 4px rgba(0,0,0,0.7);pointer-events:none;padding:6px 14px;border:1px solid rgba(255,255,255,0.25);border-radius:3px;background:rgba(0,0,0,0.3);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);width:max-content;text-transform:uppercase;}',
    '.ts-swipe-hint .ts-arrow{display:inline-block;animation:ts-bob 1.6s ease-in-out infinite;font-size:13px;line-height:1;}',
    '.ts-swipe-hint .ts-arrow.down{animation-delay:0.8s;}',
    '@keyframes ts-bob{0%,100%{transform:translateY(0);opacity:0.5;}50%{transform:translateY(-3px);opacity:1;}}',
  ].join('');
  document.head.appendChild(s);
}

function nameLenClass(name) {
  var n = (name || '').length;
  if (n <= 6) return 'len-s';
  if (n <= 8) return 'len-m';
  return 'len-l';
}

function buildTeamCard(tid) {
  var team = TEAMS[tid];
  if (!team) return null;
  var palette = PALETTE[tid] || { structure: team.accent || '#fff', bg: '#000' };
  var primary = team.colors.primary;
  var structure = palette.structure;

  var card = document.createElement('div');
  card.className = 'ts-card';
  card.dataset.team = tid;
  card.style.background = primary;

  // Vignette bg wash
  var wash = document.createElement('div');
  wash.className = 'ts-bg-wash';
  card.appendChild(wash);

  // Helmet stripes (left + right), colored by structure
  ['l', 'r'].forEach(function(side) {
    var stripe = document.createElement('div');
    stripe.className = 'ts-helmet-stripe ' + side;
    stripe.style.color = structure;
    card.appendChild(stripe);
  });

  // Top color seam
  var seam = document.createElement('div');
  seam.className = 'ts-seam';
  seam.style.color = structure;
  card.appendChild(seam);

  // Dark backdrop behind info block — improves text contrast on light
  // team washes (Salamanders green, Spectres ice) without tinting the
  // whole card.
  var backdrop = document.createElement('div');
  backdrop.className = 'ts-info-backdrop';
  card.appendChild(backdrop);

  // Top bar: position dots only (tier badge removed per product decision).
  var topBar = document.createElement('div');
  topBar.className = 'ts-top-bar';

  var dotCol = document.createElement('div');
  dotCol.className = 'ts-pos-dots';
  dotCol.dataset.role = 'dots';
  dotCol.style.color = structure;   // dots inherit via currentColor
  topBar.appendChild(dotCol);
  card.appendChild(topBar);

  // Logo with halo
  var logoWrap = document.createElement('div');
  logoWrap.className = 'ts-logo-wrap';
  var stage = document.createElement('div');
  stage.className = 'ts-logo-stage';
  stage.style.color = structure;
  stage.innerHTML = renderTeamBadge(tid, 220);
  logoWrap.appendChild(stage);
  card.appendChild(logoWrap);

  // Info block
  var info = document.createElement('div');
  info.className = 'ts-info';
  info.style.color = structure;

  // Team name — MASCOT ONLY at T1 hero. Uses per-team heroSize from
  // TEAM_WORDMARKS so each typeface is tuned independently (condensed fonts
  // can go bigger, wide display serifs need to shrink).
  var wmConfig = TEAM_WORDMARKS[tid] || {};
  var wordmark = renderTeamWordmark(tid, 't1', {
    fontSize: wmConfig.heroSize || 44,
    mascot: true,
  });
  if (wordmark) {
    wordmark.classList.add('ts-name');
    info.appendChild(wordmark);
  } else {
    var nameEl = document.createElement('div');
    nameEl.className = 'ts-name ' + nameLenClass(team.name);
    nameEl.textContent = team.name;
    info.appendChild(nameEl);
  }

  var schoolEl = document.createElement('div');
  schoolEl.className = 'ts-school';
  schoolEl.textContent = (team.school || '').toUpperCase();
  info.appendChild(schoolEl);

  var divider = document.createElement('div');
  divider.className = 'ts-divider';
  info.appendChild(divider);

  var tagline = document.createElement('div');
  tagline.className = 'ts-tagline';
  tagline.innerHTML = (team.offScheme || '') +
    '<span class="sep" style="color:' + structure + ';">·</span>' +
    (team.defScheme || '');
  info.appendChild(tagline);
  card.appendChild(info);

  // No spacer — child elements are absolute-positioned, layout is
  // deterministic via percentages on .ts-logo-wrap and .ts-info.
  return card;
}

export function buildTeamSelect() {
  injectStyles();
  AudioStateManager.setState('pre_game');

  // Outer el is a simple relative container; stage covers it absolutely so
  // cards can stretch the entire viewport. CTA overlays on top at the bottom.
  var el = document.createElement('div');
  el.style.cssText = 'height:100vh;height:100dvh;max-height:100dvh;background:#0A0804;position:relative;overflow:hidden;';

  var stage = document.createElement('div');
  stage.className = 'ts-stage';
  el.appendChild(stage);

  // ── CARDS ─────────────────────────────────────────────────────────────────
  var cards = {};
  CAROUSEL_ORDER.forEach(function(tid) {
    var c = buildTeamCard(tid);
    if (c) { stage.appendChild(c); cards[tid] = c; }
  });

  // Nav zones (shared across all cards, overlay on top of stage)
  var navUp = document.createElement('div');
  navUp.className = 'ts-nav-up';
  stage.appendChild(navUp);
  var navDown = document.createElement('div');
  navDown.className = 'ts-nav-down';
  stage.appendChild(navDown);

  // ── BOTTOM STACK (diff row + CTA) ────────────────────────────────────────
  var ctaWrap = document.createElement('div');
  ctaWrap.className = 'ts-cta-wrap';

  var isFirst = !GS || GS.isFirstSeason !== false;
  var selDiff = GS && GS.difficulty ? GS.difficulty : (isFirst ? 'EASY' : 'MEDIUM');
  var diffs = [
    { id: 'EASY',   color: '#00ff44' },
    { id: 'MEDIUM', color: '#EBB010' },
    { id: 'HARD',   color: '#ff0040' },
  ];
  var diffRow = null;
  if (!isFirst) {
    diffRow = document.createElement('div');
    diffRow.className = 'ts-diff-row';
    diffs.forEach(function(d) {
      var btn = document.createElement('button');
      btn.className = 'ts-diff';
      btn.textContent = d.id;
      btn.dataset.diff = d.id;
      var sel = selDiff === d.id;
      btn.style.borderColor = sel ? d.color : '#222';
      btn.style.color = sel ? d.color : '#555';
      btn.style.background = sel ? d.color + '22' : 'transparent';
      btn.onclick = function(e) {
        e.stopPropagation();
        SND.click();
        selDiff = d.id;
        diffRow.querySelectorAll('.ts-diff').forEach(function(b) {
          var dd = diffs.find(function(x) { return x.id === b.dataset.diff; });
          var s = b.dataset.diff === d.id;
          b.style.borderColor = s ? dd.color : '#222';
          b.style.color = s ? dd.color : '#555';
          b.style.background = s ? dd.color + '22' : 'transparent';
        });
        setGs(function(s) { return Object.assign({}, s, { difficulty: d.id }); });
      };
      diffRow.appendChild(btn);
    });
    ctaWrap.appendChild(diffRow);
  }

  // Swipe hint — sits between the tagline and the CTA button, inside the
  // CTA wrap so it anchors above HOLD TO COACH.
  var swipeHint = document.createElement('div');
  swipeHint.className = 'ts-swipe-hint';
  swipeHint.innerHTML = '<span class="ts-arrow up">↑</span><span>SWIPE</span><span class="ts-arrow down">↓</span>';
  ctaWrap.appendChild(swipeHint);

  var ctaBtn = document.createElement('button');
  ctaBtn.className = 'ts-btn-coach';
  ctaBtn.innerHTML = '<span>HOLD TO COACH</span><span class="ts-fill"></span>';
  ctaWrap.appendChild(ctaBtn);
  // CTA overlays the stage; appending to el so pointer events aren't eaten
  // by the stage (which contains the swipe handler).
  el.appendChild(ctaWrap);

  // ── CAROUSEL STATE ───────────────────────────────────────────────────────
  var visibleOrder = CAROUSEL_ORDER.slice();
  var idx = 0;

  // Compute CTA colors from a team's high-contrast structure color (the same
  // color used for the helmet stripes on the sides). This reads as "branded
  // in team colors" while contrasting off the primary-colored background
  // wash. Fallback to accent/secondary if structure isn't in PALETTE.
  function ctaPalette(tid, team) {
    var structure = (PALETTE[tid] && PALETTE[tid].structure) ||
                    team.accent || team.colors.secondary || '#EBB010';
    var hi = shade(structure, 0.2);   // top — slightly brighter
    var lo = shade(structure, -0.15); // bottom — slightly darker
    var glow = hexWithAlpha(structure, 0.5);
    // Dark text on light structure colors, light text on dark ones.
    var text = luminance(structure) > 0.55 ? '#0A0804' : '#FFF6E0';
    return { hi: hi, lo: lo, glow: glow, text: text };
  }

  function applyCtaColors(tid, team) {
    if (!team) return;
    var p = ctaPalette(tid, team);
    ctaBtn.style.setProperty('--cta-hi', p.hi);
    ctaBtn.style.setProperty('--cta-lo', p.lo);
    ctaBtn.style.setProperty('--cta-glow', p.glow);
    ctaBtn.style.setProperty('--cta-text', p.text);
  }

  function buildDotsFor(card, count, activeI) {
    var col = card.querySelector('[data-role="dots"]');
    if (!col) return;
    col.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var d = document.createElement('div');
      d.className = 'ts-dot' + (i === activeI ? ' on' : '');
      col.appendChild(d);
    }
  }

  function renderActive(immediate) {
    var activeTid = visibleOrder[idx];
    Object.keys(cards).forEach(function(tid) {
      var c = cards[tid];
      var on = tid === activeTid;
      if (immediate) {
        c.classList.toggle('active', on);
        c.style.transform = '';
        gsap.set(c, { y: 0, opacity: on ? 1 : 0 });
      } else if (on) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
    // Refresh dot column on the active card
    if (cards[activeTid]) {
      buildDotsFor(cards[activeTid], visibleOrder.length, idx);
    }
    // Sync CTA to active team's colors
    if (activeTid && TEAMS[activeTid]) applyCtaColors(activeTid, TEAMS[activeTid]);
  }

  function slideTo(newIdx, direction) {
    if (newIdx === idx) return;
    // Wrap around
    if (newIdx < 0) newIdx = visibleOrder.length - 1;
    if (newIdx >= visibleOrder.length) newIdx = 0;
    var fromTid = visibleOrder[idx];
    var toTid = visibleOrder[newIdx];
    var fromCard = cards[fromTid];
    var toCard = cards[toTid];
    if (!fromCard || !toCard) return;

    var dir = direction || (newIdx > idx ? 1 : -1);
    toCard.classList.add('active');
    buildDotsFor(toCard, visibleOrder.length, newIdx);
    if (TEAMS[toTid]) applyCtaColors(toTid, TEAMS[toTid]);

    gsap.fromTo(toCard, { y: dir * 100 + '%', opacity: 1 }, { y: '0%', opacity: 1, duration: 0.38, ease: 'power2.out' });
    gsap.to(fromCard, { y: -dir * 100 + '%', opacity: 0, duration: 0.32, ease: 'power2.in', onComplete: function() {
      fromCard.classList.remove('active');
      gsap.set(fromCard, { y: 0 });
    }});

    idx = newIdx;
    SND.click();
  }

  function next() { slideTo(idx + 1, 1); }
  function prev() { slideTo(idx - 1, -1); }

  // Tap nav zones
  navUp.addEventListener('click', prev);
  navDown.addEventListener('click', next);

  // Swipe
  var touchStartY = 0;
  var touching = false;
  stage.addEventListener('touchstart', function(e) {
    if (e.target.closest('.ts-pill, .ts-diff, .ts-btn-coach')) return;
    touchStartY = e.touches[0].clientY;
    touching = true;
  }, { passive: true });
  stage.addEventListener('touchend', function(e) {
    if (!touching) return;
    touching = false;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dy) < 55) return;
    if (dy < 0) next(); else prev();
  }, { passive: true });

  // ── HOLD-TO-COACH commit ─────────────────────────────────────────────────
  var holdTimer = null;
  var holdStart = 0;
  var HOLD_MS = 1400;
  var fillEl = ctaBtn.querySelector('.ts-fill');

  function commit() {
    var selectedTeamId = visibleOrder[idx];
    if (!selectedTeamId) return;
    SND.click();

    var existingSeason = GS && GS.season && GS.season.opponents && GS.season.opponents.length > 0;
    var opponents = existingSeason ? GS.season.opponents : getSeasonOpponents(selectedTeamId);
    var currentGame = existingSeason ? (GS.season.currentGame || 0) : 0;
    var opponentId = opponents[Math.min(currentGame, opponents.length - 1)];
    var humanReceives = Math.random() < 0.5;
    var difficulty = selDiff || (GS && GS.difficulty) || 'EASY';
    var gamesPlayed = parseInt(localStorage.getItem('torch_games_played') || '0');
    var conditions = generateConditions(gamesPlayed === 0);

    setGs(function(s) {
      return Object.assign({}, s || {}, {
        screen: 'roster',
        team: selectedTeamId,
        difficulty: difficulty,
        opponent: opponentId,
        humanReceives: humanReceives,
        _coinTossDone: false,
        offRoster: getOffenseRoster(selectedTeamId).slice(0, 4).map(function(p) { return p.id; }),
        defRoster: getDefenseRoster(selectedTeamId).slice(0, 4).map(function(p) { return p.id; }),
        offHand: getOffCards(selectedTeamId).slice(0, 4),
        defHand: getDefCards(selectedTeamId).slice(0, 4),
        gameConditions: conditions,
        isFirstSeason: s ? s.isFirstSeason : true,
        season: s && s.season ? s.season : {
          opponents: opponents,
          currentGame: 0,
          results: [],
          totalScore: 0,
          torchCards: [],
          carryoverPoints: 0,
        },
      });
    });
  }

  function cancelHold() {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    ctaBtn.classList.remove('holding');
    if (fillEl) fillEl.style.width = '0%';
  }
  function startHold() {
    cancelHold();
    holdStart = Date.now();
    ctaBtn.classList.add('holding');
    if (fillEl) {
      fillEl.style.transition = 'none';
      fillEl.style.width = '0%';
      requestAnimationFrame(function() {
        fillEl.style.transition = 'width ' + HOLD_MS + 'ms linear';
        fillEl.style.width = '100%';
      });
    }
    holdTimer = setTimeout(function() {
      holdTimer = null;
      commit();
    }, HOLD_MS);
  }

  ctaBtn.addEventListener('pointerdown', function(e) { e.preventDefault(); startHold(); });
  ctaBtn.addEventListener('pointerup', cancelHold);
  ctaBtn.addEventListener('pointerleave', cancelHold);
  ctaBtn.addEventListener('pointercancel', cancelHold);

  // ── INITIAL RENDER ───────────────────────────────────────────────────────
  // Pre-highlight last team played if still in visibleOrder
  var lastTeam = GS && GS._lastTeam;
  if (lastTeam && CAROUSEL_ORDER.indexOf(lastTeam) !== -1) {
    idx = Math.max(0, visibleOrder.indexOf(lastTeam));
  }
  renderActive(true);

  // Entrance animation — slide first card up from below
  requestAnimationFrame(function() { requestAnimationFrame(function() {
    try {
      var activeTid = visibleOrder[idx];
      if (activeTid && cards[activeTid]) {
        gsap.fromTo(cards[activeTid], { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
      }
      gsap.from(ctaWrap, { y: 30, opacity: 0, duration: 0.3, delay: 0.15, ease: 'power2.out' });
    } catch(e) {}
  }); });

  return el;
}
