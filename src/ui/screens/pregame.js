/**
 * TORCH — Pregame Runway (3-beat cinematic pre-kickoff sequence)
 *
 * Replaces the old static matchup card screen with a cinematic runway:
 *   Beat 1 — Matchup Slam   (cards slam top/bottom, VS burns in middle)
 *   Beat 2 — Coin Toss      (coin flip, winner's choice, card pick)
 *   Beat 3 — Kickoff        (stadium flash, crowd swell, KICKOFF stamp)
 *
 * Flow: teamSelect → roster (Meet The Squads) → pregame (this file) → gameplay
 *
 * The runway owns the coin toss. When it finishes it writes:
 *   GS._coinTossDone = true
 *   GS.humanReceives = boolean
 *   GS.season.torchCards = [...existing, pickedCard] if user picked
 * then transitions to screen: 'gameplay'. Gameplay.js sees _coinTossDone
 * and skips its own showCoinToss, going straight to kickoff resolution.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { GS, setGs } from '../../state.js';
import { TEAMS } from '../../data/teams.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { renderTeamBadge } from '../../assets/icons/teamLogos.js';
import { renderTorchCardIcon } from '../../assets/icons/torchCardIcons.js';
import { FLAME_SILHOUETTE_PATH, flameLayersMarkup } from '../../utils/flameIcon.js';
import { buildHomeCard } from '../components/cards.js';
import AudioStateManager from '../../engine/audioManager.js';

var WEATHER_TEMP  = { clear: '72°', rain: '58°', wind: '64°', snow: '28°', heat: '88°' };
var WEATHER_LABEL = { clear: 'CLEAR', rain: 'RAIN', wind: 'WINDY', snow: 'SNOW', heat: 'HEAT' };
var FIELD_LABEL   = { turf: 'TURF', grass: 'GRASS', mud: 'MUD', dome: 'DOME' };

// ─── STYLE INJECTION ───
function injectRunwayStyles() {
  if (document.getElementById('runway-anims')) return;
  var s = document.createElement('style');
  s.id = 'runway-anims';
  s.textContent =
    '@keyframes runwayShimmer{0%,100%{background-position:-280px 0}50%{background-position:280px 0}}' +
    '@keyframes runwayCoinSpinUser{0%{transform:rotateY(0) translateY(0)}20%{transform:rotateY(720deg) translateY(-60px)}50%{transform:rotateY(1440deg) translateY(-90px)}80%{transform:rotateY(2160deg) translateY(-40px)}100%{transform:rotateY(2520deg) translateY(0)}}' +
    '@keyframes runwayCoinSpinAi{0%{transform:rotateY(0) translateY(0)}20%{transform:rotateY(720deg) translateY(-60px)}50%{transform:rotateY(1440deg) translateY(-90px)}80%{transform:rotateY(2340deg) translateY(-40px)}100%{transform:rotateY(2700deg) translateY(0)}}' +
    '@keyframes runwayTapPulse{0%,100%{opacity:0.55;transform:translateY(0)}50%{opacity:1;transform:translateY(-2px)}}' +
    // Keyframe must include translate(-50%) since CSS animations replace the
    // entire transform property — without it, the inline translateX(-50%)
    // centering gets wiped out during the hover loop and the coin drifts right.
    '@keyframes runwayCoinHover{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-3px)}}';
  document.head.appendChild(s);
}

// Roll 3 torch card offers with weighted distribution (55% Bronze, 35% Silver, 10% Gold)
function rollCardOffers() {
  var cards = [];
  for (var i = 0; i < 3; i++) {
    var r = Math.random();
    var tier = r < 0.55 ? 'BRONZE' : r < 0.90 ? 'SILVER' : 'GOLD';
    var pool = TORCH_CARDS.filter(function(c) { return c.tier === tier; });
    cards.push(pool[Math.floor(Math.random() * pool.length)] || TORCH_CARDS[0]);
  }
  return cards;
}

// Light screen shake for slam impacts
function shake(el) {
  gsap.timeline()
    .to(el, { x: -2, y: 1, duration: 0.03 })
    .to(el, { x: 2, y: -1, duration: 0.03 })
    .to(el, { x: -1, y: 2, duration: 0.03 })
    .to(el, { x: 1, y: -2, duration: 0.03 })
    .to(el, { x: 0, y: 0, duration: 0.03 });
}

// ═══════════════════════════════════════════════════════
// BEAT 1 — MATCHUP SLAM
// ═══════════════════════════════════════════════════════
function buildBeat1(ctx) {
  var beat = document.createElement('div');
  beat.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 20%,rgba(255,245,200,0.08) 0%,transparent 40%),radial-gradient(ellipse at 50% 50%,#0a0804 0%,#030201 80%);opacity:0;pointer-events:none;';

  // Stadium halogen lights along the top
  var lights = document.createElement('div');
  lights.style.cssText =
    'position:absolute;top:0;left:0;right:0;height:60%;' +
    'background:radial-gradient(circle at 15% 18%,rgba(255,245,200,0.35) 0%,transparent 6%),' +
      'radial-gradient(circle at 35% 14%,rgba(255,245,200,0.4) 0%,transparent 7%),' +
      'radial-gradient(circle at 65% 14%,rgba(255,245,200,0.4) 0%,transparent 7%),' +
      'radial-gradient(circle at 85% 18%,rgba(255,245,200,0.35) 0%,transparent 6%);' +
    'filter:blur(6px);opacity:0;';
  beat.appendChild(lights);
  beat._lights = lights;

  // Away card (user's team) — slams in from top
  var awayCard = buildMatchupCard(ctx.team, GS.team, 'AWAY');
  awayCard.style.top = '58px';
  awayCard.style.transform = 'translateY(-520px) rotate(-2deg)';
  beat.appendChild(awayCard);
  beat._awayCard = awayCard;

  // Home card (opponent) — slams in from bottom
  var homeCard = buildMatchupCard(ctx.opp, GS.opponent, 'HOME');
  homeCard.style.top = '336px';
  homeCard.style.transform = 'translateY(520px) rotate(2deg)';
  beat.appendChild(homeCard);
  beat._homeCard = homeCard;

  // VS burn
  var vs = document.createElement('div');
  vs.textContent = 'VS';
  vs.style.cssText =
    'position:absolute;top:285px;left:50%;transform:translate(-50%,-50%) scale(1.3);' +
    "font-family:'Teko';font-weight:900;font-size:84px;line-height:1;letter-spacing:4px;" +
    'background:linear-gradient(180deg,#FFE17A 0%,#FFD060 22%,#EBB010 45%,#8B4A1F 72%,#EBB010 90%,#FFD060 100%);' +
    '-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;' +
    'filter:drop-shadow(0 5px 12px rgba(0,0,0,0.95)) drop-shadow(0 0 24px rgba(235,176,16,0.55));' +
    'opacity:0;pointer-events:none;z-index:5;white-space:nowrap;';
  beat.appendChild(vs);
  beat._vs = vs;

  // Conditions strip
  var strip = buildConditionsStrip(ctx.conditions);
  beat.appendChild(strip);
  beat._strip = strip;

  return beat;
}

// ─── Matchup card (team identity + ratings) ───
function buildMatchupCard(team, teamId, sideLabel) {
  var accent = team.accent || team.colors.primary;
  var card = document.createElement('div');
  card.style.cssText =
    'position:absolute;left:14px;right:14px;height:176px;border-radius:14px;' +
    'border:2px solid ' + accent + '8c;overflow:hidden;display:flex;align-items:center;' +
    'padding:14px 18px 14px 22px;' +
    'background:linear-gradient(170deg,' + accent + '38,rgba(10,8,4,0.95) 55%,rgba(10,8,4,1) 100%);' +
    'box-shadow:0 24px 70px rgba(0,0,0,0.85),0 0 36px ' + accent + '22,0 0 0 1px ' + accent + '33,inset 0 1px 0 rgba(255,255,255,0.08);';

  // Accent edge
  var edge = document.createElement('div');
  edge.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:5px;background:linear-gradient(180deg,' + accent + ',' + accent + '66);box-shadow:0 0 12px ' + accent + 'aa;z-index:2;';
  card.appendChild(edge);

  // Depth gradient overlay
  var depth = document.createElement('div');
  depth.style.cssText = 'position:absolute;inset:0;background:linear-gradient(160deg,transparent 15%,rgba(0,0,0,0.35) 75%);pointer-events:none;';
  card.appendChild(depth);

  // Badge
  var badgeWrap = document.createElement('div');
  badgeWrap.style.cssText =
    'position:relative;flex-shrink:0;width:108px;height:108px;border-radius:50%;' +
    'display:flex;align-items:center;justify-content:center;' +
    'border:3px solid rgba(255,255,255,0.18);' +
    'background:radial-gradient(circle at 35% 30%,' + accent + ',' + accent + '99 45%,#050302 100%);' +
    'box-shadow:0 14px 32px rgba(0,0,0,0.78),0 0 30px ' + accent + '55,inset 0 0 28px rgba(0,0,0,0.55);' +
    'z-index:1;';
  badgeWrap.innerHTML = renderTeamBadge(teamId, 78);
  card.appendChild(badgeWrap);

  // Info column
  var info = document.createElement('div');
  info.style.cssText = 'flex:1;min-width:0;padding-left:18px;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:1;';

  var lbl = document.createElement('div');
  lbl.style.cssText = "font-family:'Oswald';font-weight:700;font-size:9px;color:" + accent + ";letter-spacing:3px;margin-bottom:2px;";
  lbl.textContent = sideLabel;
  info.appendChild(lbl);

  var name = document.createElement('div');
  name.style.cssText = "font-family:'Teko';font-weight:900;font-size:38px;color:#fff;letter-spacing:1px;line-height:0.88;text-shadow:0 3px 10px rgba(0,0,0,0.95);white-space:nowrap;overflow:hidden;text-overflow:clip;";
  name.textContent = team.name;
  info.appendChild(name);

  var school = document.createElement('div');
  school.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:2px;margin-top:4px;";
  school.textContent = (team.school || '').toUpperCase();
  info.appendChild(school);

  var divider = document.createElement('div');
  divider.style.cssText = 'height:1px;margin:8px 0 7px;width:80%;background:linear-gradient(90deg,transparent,' + accent + 'aa,transparent);';
  info.appendChild(divider);

  var scheme = document.createElement('div');
  scheme.style.cssText = "font-family:'Oswald';font-weight:700;font-size:11px;color:" + accent + ";letter-spacing:1.8px;";
  scheme.textContent = team.offScheme || '';
  info.appendChild(scheme);

  // OFF/DEF rating pips
  var ratings = document.createElement('div');
  ratings.style.cssText = 'display:flex;gap:14px;margin-top:7px;';
  ratings.appendChild(buildRatingRow('OFF', (team.ratings && team.ratings.offense) || 3, '#00ff44'));
  ratings.appendChild(buildRatingRow('DEF', (team.ratings && team.ratings.defense) || 3, '#4DA6FF'));
  info.appendChild(ratings);

  card.appendChild(info);
  return card;
}

function buildRatingRow(label, value, color) {
  var row = document.createElement('div');
  row.style.cssText = "display:flex;align-items:center;gap:5px;font-family:'Oswald';font-weight:700;font-size:8px;letter-spacing:1.5px;";
  var lbl = document.createElement('span');
  lbl.style.cssText = 'color:' + color + ';';
  lbl.textContent = label;
  row.appendChild(lbl);
  var pips = document.createElement('span');
  pips.style.cssText = 'display:flex;gap:3px;';
  for (var i = 0; i < 5; i++) {
    var pip = document.createElement('span');
    if (i < value) {
      pip.style.cssText = 'width:7px;height:7px;border-radius:50%;background:' + color + ';border:1px solid ' + color + ';box-shadow:0 0 6px ' + color + '80;';
    } else {
      pip.style.cssText = 'width:7px;height:7px;border-radius:50%;border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.06);';
    }
    pips.appendChild(pip);
  }
  row.appendChild(pips);
  return row;
}

// ─── Conditions strip (weather + field surface icons) ───
function buildConditionsStrip(conditions) {
  var strip = document.createElement('div');
  strip.style.cssText =
    'position:absolute;bottom:100px;left:14px;right:14px;padding:12px 14px;' +
    'background:rgba(10,8,4,0.65);backdrop-filter:blur(12px) saturate(140%);-webkit-backdrop-filter:blur(12px) saturate(140%);' +
    'border:1px solid rgba(255,255,255,0.06);border-radius:8px;' +
    'display:flex;align-items:center;justify-content:space-around;opacity:0;';

  var weather = (conditions && conditions.weather) || 'clear';
  var field = (conditions && conditions.field) || 'turf';
  var temp = WEATHER_TEMP[weather] || '72°';
  var wLabel = WEATHER_LABEL[weather] || 'CLEAR';
  var fLabel = FIELD_LABEL[field] || 'TURF';

  strip.appendChild(buildConditionItem(getWeatherIcon(weather), temp, wLabel));
  var divider = document.createElement('div');
  divider.style.cssText = 'width:1px;height:28px;background:rgba(255,255,255,0.08);flex-shrink:0;';
  strip.appendChild(divider);
  strip.appendChild(buildConditionItem(getFieldIcon(field), fLabel, 'SURFACE'));

  return strip;
}

function buildConditionItem(iconSvg, value, label) {
  var item = document.createElement('div');
  item.style.cssText = 'display:flex;align-items:center;gap:8px;flex:1;justify-content:center;';
  var iconBox = document.createElement('div');
  iconBox.style.cssText = 'width:22px;height:22px;color:#EBB010;flex-shrink:0;filter:drop-shadow(0 0 6px rgba(235,176,16,0.3));';
  iconBox.innerHTML = iconSvg;
  item.appendChild(iconBox);
  var text = document.createElement('div');
  text.style.cssText = 'display:flex;flex-direction:column;gap:2px;';
  var val = document.createElement('div');
  val.style.cssText = "font-family:'Teko';font-weight:700;font-size:17px;color:#fff;line-height:1;letter-spacing:0.5px;";
  val.textContent = value;
  text.appendChild(val);
  var lbl = document.createElement('div');
  lbl.style.cssText = "font-family:'Oswald';font-weight:700;font-size:7px;color:#888;letter-spacing:1.2px;";
  lbl.textContent = label;
  text.appendChild(lbl);
  item.appendChild(text);
  return item;
}

function getWeatherIcon(weather) {
  if (weather === 'rain') {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%">' +
      '<path d="M4 14c0-3 2-6 6-6 4 0 5 3 6 3s3-1 3 2c0 2-2 3-4 3H6c-2 0-2-1-2-2z" fill="currentColor" fill-opacity="0.3"/>' +
      '<line x1="8" y1="18" x2="8" y2="21"/><line x1="13" y1="18" x2="13" y2="21"/><line x1="16" y1="18" x2="16" y2="21"/></svg>';
  }
  if (weather === 'snow') {
    return '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">' +
      '<circle cx="6" cy="18" r="1.5"/><circle cx="12" cy="20" r="1.5"/><circle cx="18" cy="18" r="1.5"/>' +
      '<path d="M4 12c0-3 2-5 5-5 3 0 4 2 5 2s3-1 3 2c0 2-2 3-4 3H6c-2 0-2-1-2-2z" opacity="0.4"/></svg>';
  }
  if (weather === 'wind') {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%">' +
      '<path d="M3 8h13c1.5 0 3-1 3-3s-1.5-2-2.5-2-1.5 0.5-1.5 0.5"/>' +
      '<path d="M3 14h17c1 0 2 0.5 2 2s-1 2-2 2-1-0.5-1-0.5"/></svg>';
  }
  // clear / heat → sun
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%">' +
    '<circle cx="12" cy="12" r="4" fill="currentColor"/>' +
    '<line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>' +
    '<line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>' +
    '<line x1="4.5" y1="4.5" x2="6.7" y2="6.7"/><line x1="17.3" y1="17.3" x2="19.5" y2="19.5"/>' +
    '<line x1="4.5" y1="19.5" x2="6.7" y2="17.3"/><line x1="17.3" y1="6.7" x2="19.5" y2="4.5"/></svg>';
}

function getFieldIcon(field) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="100%" height="100%">' +
    '<path d="M3 20 Q 4 13, 5 20"/>' +
    '<path d="M7 20 Q 8 11, 9 20"/>' +
    '<path d="M11 20 Q 12 9, 13 20"/>' +
    '<path d="M15 20 Q 16 11, 17 20"/>' +
    '<path d="M19 20 Q 20 13, 21 20"/>' +
    '<line x1="2" y1="21" x2="22" y2="21"/></svg>';
}

function runBeat1(ctx, onDone) {
  var speed = ctx.speedMult;
  var beat = ctx.beat1;
  var tl = gsap.timeline({ onComplete: onDone });

  tl.set(beat, { opacity: 1 });
  tl.to(beat._lights, { opacity: 0.7, duration: 0.8 * speed, ease: 'power2.out' }, 0);

  // Cards slam in
  tl.to(beat._awayCard, { y: 0, rotation: 0, duration: 0.42 * speed, ease: 'power3.out' }, 0.35 * speed);
  tl.to(beat._homeCard, { y: 0, rotation: 0, duration: 0.42 * speed, ease: 'power3.out' }, 0.53 * speed);

  // Slam sound + shake
  tl.call(function() { SND.resultGood(); shake(ctx.el); }, null, 0.55 * speed);

  // Conditions strip fades in
  tl.to(beat._strip, { opacity: 1, duration: 0.4 * speed, ease: 'power2.out' }, 1.0 * speed);

  // VS burn — impact settle scale 1.3 → 1
  tl.to(beat._vs, { opacity: 1, scale: 1, duration: 0.75 * speed, ease: 'power3.out' }, 1.5 * speed);
  tl.call(function() { SND.ignite(); }, null, 1.5 * speed);

  // Hold until 3.8s (1.55s after VS settles)
  tl.to({}, { duration: (3.8 - 2.25) * speed }, 2.25 * speed);
}

// ═══════════════════════════════════════════════════════
// BEAT 2 — COIN TOSS
// ═══════════════════════════════════════════════════════
function buildBeat2(ctx) {
  var beat = document.createElement('div');
  beat.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,#1a1208 0%,#050302 70%);opacity:0;pointer-events:none;';

  // Spot pool
  var pool = document.createElement('div');
  pool.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:360px;height:360px;background:radial-gradient(circle,rgba(255,180,60,0.12) 0%,rgba(255,140,40,0.06) 25%,transparent 55%);filter:blur(8px);';
  beat.appendChild(pool);
  beat._pool = pool;

  // Midfield label
  var label = document.createElement('div');
  label.style.cssText = "position:absolute;top:76px;left:0;right:0;text-align:center;font-family:'Oswald';font-weight:700;font-size:9px;color:rgba(235,176,16,0.7);letter-spacing:4px;opacity:0;";
  label.textContent = '\u25C6 MIDFIELD \u00B7 COIN TOSS \u25C6';
  beat.appendChild(label);
  beat._label = label;

  // Coin — bigger (140px) and tappable. User taps to flip.
  // Positioned at top 130 so its final resting bottom (270) clears the
  // result stamp top (282) by 12px. The spin flies it UP into the label
  // area momentarily — we fade the label on tap to avoid the collision.
  var coinWrap = document.createElement('div');
  coinWrap.style.cssText = 'position:absolute;top:130px;left:50%;transform:translateX(-50%);width:140px;height:140px;perspective:1000px;opacity:0;cursor:pointer;filter:drop-shadow(0 16px 32px rgba(0,0,0,0.65)) drop-shadow(0 0 22px rgba(235,176,16,0.3));animation:runwayCoinHover 2.4s ease-in-out infinite;';
  var coin = document.createElement('div');
  coin.style.cssText = 'width:100%;height:100%;position:relative;transform-style:preserve-3d;transform:rotateY(0deg);';

  var teamAccent = ctx.team.accent || ctx.team.colors.primary;
  var oppAccent = ctx.opp.accent || ctx.opp.colors.primary;

  // Front face — user's team. Uses the real team badge SVG (same asset
  // shown everywhere else in the game) with a team-colored inner ring
  // overlay so the coin reads as THIS team's coin, not a generic gold disc.
  var front = document.createElement('div');
  front.style.cssText =
    'position:absolute;inset:0;border-radius:50%;display:flex;align-items:center;justify-content:center;' +
    'backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;' +
    'background:radial-gradient(circle at 35% 30%,#FFE17A 0%,#EBB010 40%,#8B4A1F 100%);' +
    'box-shadow:inset 0 0 0 3px #FFE17A,inset 0 0 0 4px rgba(139,74,31,0.6),inset 0 0 18px rgba(0,0,0,0.45),inset 0 -6px 12px rgba(0,0,0,0.35),inset 0 6px 12px rgba(255,255,255,0.22);';
  var frontBadge = document.createElement('div');
  frontBadge.style.cssText = 'position:relative;z-index:1;width:84px;height:84px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.5));';
  frontBadge.innerHTML = renderTeamBadge(GS.team, 84);
  front.appendChild(frontBadge);
  var frontRing = document.createElement('div');
  frontRing.style.cssText = 'position:absolute;inset:18px;border-radius:50%;border:2px solid ' + teamAccent + '8c;box-shadow:inset 0 0 14px ' + teamAccent + '40;pointer-events:none;z-index:2;';
  front.appendChild(frontRing);
  coin.appendChild(front);

  // Back face — opponent. Rotated 180° so backface-visibility shows it
  // only when the coin is flipped over.
  var back = document.createElement('div');
  back.style.cssText =
    'position:absolute;inset:0;border-radius:50%;display:flex;align-items:center;justify-content:center;' +
    'backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;' +
    'background:radial-gradient(circle at 35% 30%,#FFE17A 0%,#C4A265 40%,#6B3818 100%);' +
    'box-shadow:inset 0 0 0 3px #FFE17A,inset 0 0 0 4px rgba(139,74,31,0.6),inset 0 0 18px rgba(0,0,0,0.45),inset 0 -6px 12px rgba(0,0,0,0.35),inset 0 6px 12px rgba(255,255,255,0.22);' +
    'transform:rotateY(180deg);';
  var backBadge = document.createElement('div');
  backBadge.style.cssText = 'position:relative;z-index:1;width:84px;height:84px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.5));';
  backBadge.innerHTML = renderTeamBadge(GS.opponent, 84);
  back.appendChild(backBadge);
  var backRing = document.createElement('div');
  backRing.style.cssText = 'position:absolute;inset:18px;border-radius:50%;border:2px solid ' + oppAccent + '9a;box-shadow:inset 0 0 14px ' + oppAccent + '4d;pointer-events:none;z-index:2;';
  back.appendChild(backRing);
  coin.appendChild(back);

  coinWrap.appendChild(coin);
  beat.appendChild(coinWrap);
  beat._coinWrap = coinWrap;
  beat._coin = coin;

  // TAP TO FLIP hint — pulses to grab attention, hides on tap.
  // Sits 18px below the coin's resting bottom (270) at top 288. Hides
  // before the result stamp (top 282) would be visible.
  var tapHint = document.createElement('div');
  tapHint.style.cssText = "position:absolute;top:288px;left:0;right:0;text-align:center;font-family:'Teko';font-weight:700;font-size:20px;color:#EBB010;letter-spacing:5px;text-shadow:0 0 14px rgba(235,176,16,0.5);opacity:0;pointer-events:none;";
  tapHint.textContent = 'TAP TO FLIP';
  beat.appendChild(tapHint);
  beat._tapHint = tapHint;

  // Toss result stamp
  var result = document.createElement('div');
  result.style.cssText = 'position:absolute;top:282px;left:0;right:0;text-align:center;opacity:0;';
  var resEye = document.createElement('div');
  resEye.style.cssText = "font-family:'Oswald';font-weight:700;font-size:8px;color:rgba(255,255,255,0.4);letter-spacing:2.5px;";
  resEye.textContent = ' ';
  result.appendChild(resEye);
  var resWinner = document.createElement('div');
  resWinner.style.cssText = "font-family:'Teko';font-weight:900;font-size:30px;color:#EBB010;letter-spacing:3px;line-height:1;margin-top:3px;text-shadow:0 0 20px rgba(235,176,16,0.4);";
  resWinner.textContent = ' ';
  result.appendChild(resWinner);
  var resSub = document.createElement('div');
  resSub.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:1.5px;margin-top:4px;";
  resSub.textContent = ' ';
  result.appendChild(resSub);
  beat.appendChild(result);
  beat._result = result;
  beat._resEye = resEye;
  beat._resWinner = resWinner;
  beat._resSub = resSub;

  // Choice cards wrap
  var choiceWrap = document.createElement('div');
  choiceWrap.style.cssText = 'position:absolute;top:360px;left:16px;right:16px;display:flex;gap:14px;opacity:0;pointer-events:none;';
  var kickoffCard = buildChoiceCard('kickoff');
  var torchCardEl = buildChoiceCard('torch');
  choiceWrap.appendChild(kickoffCard);
  choiceWrap.appendChild(torchCardEl);
  beat.appendChild(choiceWrap);
  beat._choiceWrap = choiceWrap;
  beat._kickoffCard = kickoffCard;
  beat._torchCard = torchCardEl;

  // Face-down pick area (hidden by default)
  var facedownWrap = document.createElement('div');
  facedownWrap.style.cssText = 'position:absolute;inset:0;opacity:0;pointer-events:none;';
  var csTitle = document.createElement('div');
  csTitle.style.cssText = "position:absolute;top:76px;left:0;right:0;text-align:center;font-family:'Oswald';font-weight:700;font-size:9px;color:rgba(235,176,16,0.8);letter-spacing:4px;";
  csTitle.textContent = '\u25C6 3 FACE-DOWN \u00B7 FLIP ONE \u25C6';
  facedownWrap.appendChild(csTitle);
  var csSub = document.createElement('div');
  csSub.style.cssText = "position:absolute;top:94px;left:0;right:0;text-align:center;font-family:'Teko';font-weight:700;font-size:22px;color:#fff;letter-spacing:2px;line-height:1;";
  csSub.textContent = 'PICK YOUR CARD';
  facedownWrap.appendChild(csSub);

  var fdRow = document.createElement('div');
  fdRow.style.cssText = 'position:absolute;top:200px;left:0;right:0;display:flex;justify-content:center;align-items:flex-start;gap:18px;padding:0 20px;';
  var facedowns = [];
  for (var i = 0; i < 3; i++) {
    // Each face-down slot is a wrapper holding the real torch card back
    // (buildHomeCard('torch', ...) — the gold-framed card used elsewhere in
    // the game). The wrapper handles positioning + tilt + click.
    var fd = document.createElement('div');
    fd.dataset.slot = String(i);
    fd.style.cssText = 'position:relative;cursor:pointer;opacity:0;transform:translateY(40px) rotate(' + [-6, 0, 6][i] + 'deg);transform-origin:center bottom;';
    var cardBack = buildHomeCard('torch', 84, 118);
    fd.appendChild(cardBack);
    fdRow.appendChild(fd);
    facedowns.push(fd);
  }
  facedownWrap.appendChild(fdRow);

  // Reveal card (hidden until pick)
  var reveal = document.createElement('div');
  reveal.style.cssText = 'position:absolute;top:158px;left:50%;transform:translate(-50%,0) scale(0.6) rotateY(180deg);width:148px;height:208px;opacity:0;pointer-events:none;';
  facedownWrap.appendChild(reveal);

  // Reveal stamp
  var revealStamp = document.createElement('div');
  revealStamp.style.cssText = 'position:absolute;top:384px;left:0;right:0;text-align:center;opacity:0;';
  var revEye = document.createElement('div');
  revEye.style.cssText = "font-family:'Oswald';font-weight:700;font-size:8px;color:rgba(255,255,255,0.4);letter-spacing:2.5px;";
  revEye.textContent = ' ';
  revealStamp.appendChild(revEye);
  var revLine = document.createElement('div');
  revLine.style.cssText = "font-family:'Teko';font-weight:700;font-size:16px;color:#EBB010;letter-spacing:2px;line-height:1;margin-top:3px;";
  revLine.textContent = ' ';
  revealStamp.appendChild(revLine);
  facedownWrap.appendChild(revealStamp);

  beat.appendChild(facedownWrap);
  beat._facedownWrap = facedownWrap;
  beat._csSub = csSub;
  beat._facedowns = facedowns;
  beat._reveal = reveal;
  beat._revealStamp = revealStamp;
  beat._revEye = revEye;
  beat._revLine = revLine;

  return beat;
}

function buildChoiceCard(type) {
  var card = document.createElement('div');
  card.dataset.pick = type;
  var isKickoff = type === 'kickoff';
  var tint = isKickoff ? '0,255,68' : '235,176,16';
  var accent = isKickoff ? '#00ff44' : '#EBB010';

  card.style.cssText =
    'flex:1;height:240px;border-radius:14px;border:2px solid rgba(' + tint + ',0.55);' +
    'background:radial-gradient(ellipse at 50% 30%,rgba(' + tint + ',0.18) 0%,transparent 55%),' +
      (isKickoff ? 'linear-gradient(180deg,rgba(10,30,14,0.9) 0%,rgba(5,12,6,0.95) 100%)' : 'linear-gradient(180deg,rgba(40,20,8,0.9) 0%,rgba(15,8,4,0.95) 100%)') + ';' +
    'box-shadow:0 12px 32px rgba(0,0,0,0.7),0 0 24px rgba(' + tint + ',0.15),inset 0 1px 0 rgba(255,255,255,0.08);' +
    'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:22px 12px 20px;cursor:pointer;position:relative;overflow:hidden;' +
    'transform:rotateY(90deg);opacity:0;transform-origin:center;';

  var iconBox = document.createElement('div');
  iconBox.style.cssText = 'width:74px;height:74px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;color:' + accent + ';filter:drop-shadow(0 0 14px rgba(' + tint + ',0.5));';
  if (isKickoff) {
    // Football icon
    iconBox.innerHTML =
      '<svg viewBox="0 0 64 48" fill="currentColor" width="100%" height="100%">' +
      '<ellipse cx="32" cy="24" rx="28" ry="17"/>' +
      '<g fill="none" stroke="#0A1208" stroke-width="2" stroke-linecap="round">' +
      '<line x1="18" y1="24" x2="46" y2="24"/>' +
      '<line x1="24" y1="20" x2="24" y2="28"/>' +
      '<line x1="29" y1="20" x2="29" y2="28"/>' +
      '<line x1="35" y1="20" x2="35" y2="28"/>' +
      '<line x1="40" y1="20" x2="40" y2="28"/></g></svg>';
  } else {
    // Flame icon — full 4-layer for color depth
    iconBox.innerHTML =
      '<svg viewBox="0 0 34 34" width="100%" height="100%">' +
      flameLayersMarkup() + '</svg>';
  }
  card.appendChild(iconBox);

  var label = document.createElement('div');
  label.style.cssText = "font-family:'Teko';font-weight:900;font-size:22px;letter-spacing:2px;line-height:0.95;text-align:center;white-space:nowrap;text-shadow:0 2px 6px rgba(0,0,0,0.9);color:" + accent + ";";
  label.innerHTML = isKickoff ? 'RECEIVE<br/>KICKOFF' : 'TAKE A<br/>TORCH CARD';
  card.appendChild(label);

  var sub = document.createElement('div');
  sub.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:10px;color:rgba(255,255,255,0.55);letter-spacing:0.8px;margin-top:10px;text-align:center;line-height:1.3;padding:0 4px;";
  sub.innerHTML = isKickoff ? 'Your offense starts<br/>the game' : 'Free card,<br/>opponent kicks';
  card.appendChild(sub);

  return card;
}

// ─── Build the reveal card content based on the actual drawn card ───
function populateRevealCard(container, card) {
  container.innerHTML = '';
  var tierColors = {
    BRONZE: { border: '#CD7F32', accent: '#CD7F32' },
    SILVER: { border: '#C0C0C0', accent: '#C0C0C0' },
    GOLD: { border: '#EBB010', accent: '#FFD060' }
  };
  var tier = tierColors[card.tier] || tierColors.SILVER;

  var face = document.createElement('div');
  face.style.cssText =
    'position:absolute;inset:0;border-radius:14px;' +
    'background:radial-gradient(ellipse at 50% 20%,' + tier.accent + '38 0%,transparent 50%),' +
      'linear-gradient(165deg,' + tier.accent + '30 0%,#141008 40%,#0a0604 100%);' +
    'border:2px solid ' + tier.border + ';' +
    'box-shadow:0 20px 48px rgba(0,0,0,0.85),0 0 44px ' + tier.accent + '59,0 0 0 1px rgba(255,255,255,0.1),inset 0 1px 0 rgba(255,255,255,0.15),inset 0 0 0 1px ' + tier.accent + '33;' +
    'overflow:hidden;';

  var tierLabel = document.createElement('div');
  tierLabel.style.cssText = "position:absolute;top:12px;left:0;right:0;text-align:center;font-family:'Oswald';font-weight:700;font-size:9px;color:#fff;letter-spacing:3px;z-index:3;text-shadow:0 1px 2px rgba(0,0,0,0.8);";
  tierLabel.textContent = card.tier;
  face.appendChild(tierLabel);

  var cost = document.createElement('div');
  cost.style.cssText = "position:absolute;top:10px;right:12px;background:" + tier.accent + "38;border:1px solid " + tier.border + ";border-radius:10px;padding:2px 7px;font-family:'Teko';font-weight:700;font-size:11px;color:#fff;line-height:1;z-index:3;";
  cost.textContent = String(card.cost || 0);
  face.appendChild(cost);

  var iconWrap = document.createElement('div');
  iconWrap.style.cssText = "position:absolute;top:36px;left:50%;transform:translateX(-50%);width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,0.22) 0%," + tier.accent + "1a 40%,rgba(0,0,0,0) 100%);border:2px solid " + tier.accent + ";display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(0,0,0,0.6),inset 0 2px 4px rgba(255,255,255,0.15),inset 0 -2px 4px rgba(0,0,0,0.3);z-index:3;";
  // Use the real torch card icon from game-icons.net via renderTorchCardIcon.
  // Falls back to a simple diamond glyph if the iconKey doesn't resolve.
  var iconSvg = renderTorchCardIcon(card.iconKey, 36, tier.accent);
  if (iconSvg) {
    iconWrap.appendChild(iconSvg);
  } else {
    iconWrap.style.cssText += "font-family:'Teko';font-weight:900;font-size:34px;color:" + tier.accent + ";";
    iconWrap.textContent = '\u25C6';
  }
  face.appendChild(iconWrap);

  var name = document.createElement('div');
  name.style.cssText = "position:absolute;top:112px;left:0;right:0;text-align:center;font-family:'Teko';font-weight:900;font-size:20px;color:#fff;letter-spacing:2px;line-height:0.95;text-shadow:0 2px 8px rgba(0,0,0,0.95);z-index:3;";
  name.textContent = card.name;
  face.appendChild(name);

  var divider = document.createElement('div');
  divider.style.cssText = 'position:absolute;top:140px;left:18px;right:18px;height:1px;background:linear-gradient(90deg,transparent,' + tier.accent + '80,transparent);z-index:3;';
  face.appendChild(divider);

  var effect = document.createElement('div');
  effect.style.cssText = "position:absolute;top:148px;left:10px;right:10px;text-align:center;font-family:'Rajdhani';font-weight:600;font-size:10px;color:rgba(255,255,255,0.8);line-height:1.3;letter-spacing:0.3px;z-index:3;";
  effect.textContent = card.effect || '';
  face.appendChild(effect);

  var typeLabel = document.createElement('div');
  typeLabel.style.cssText = "position:absolute;bottom:10px;left:0;right:0;text-align:center;font-family:'Oswald';font-weight:700;font-size:8px;color:" + tier.accent + ";letter-spacing:2px;z-index:3;";
  typeLabel.textContent = (card.type || 'PRE-SNAP').toUpperCase().replace(/_/g, ' ');
  face.appendChild(typeLabel);

  container.appendChild(face);
}

function runBeat2(ctx, onDone) {
  var beat = ctx.beat2;
  var tl = gsap.timeline();
  var userWon = ctx.humanWins;

  // Hide Beat 1 (direct style for pointer-events since GSAP's CSS plugin
  // drops pointerEvents silently — same bug that broke card selection).
  tl.to(ctx.beat1, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 0);
  tl.call(function() { ctx.beat1.style.pointerEvents = 'none'; }, null, 0.35);

  // Show Beat 2
  tl.call(function() {
    beat.style.opacity = '1';
    beat.style.pointerEvents = 'auto';
  }, null, 0.3);

  // Label + coin fade in
  tl.to(beat._label, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.4);
  tl.to(beat._coinWrap, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.5);

  // Tap hint appears after coin settles — pulses to invite interaction
  tl.call(function() {
    beat._tapHint.style.animation = 'runwayTapPulse 1.3s ease-in-out infinite';
  }, null, 1.0);
  tl.to(beat._tapHint, { opacity: 1, duration: 0.3 }, 1.0);

  // Wire the coin tap handler. We don't auto-flip — the user drives it.
  // Coin click triggers spin → catch → result stamp → choice phase.
  tl.call(function() {
    beat._coinWrap.style.pointerEvents = 'auto';
    var tapped = false;
    beat._coinWrap.onclick = function() {
      if (tapped) return;
      tapped = true;

      // Stop the hover + tap hint animations, play flip sound.
      // Also fade the midfield label out immediately — the spin's
      // translateY(-90) peak flies the coin UP through the label's
      // y range (76-88), so if it's still visible the coin collides
      // with the text.
      beat._coinWrap.style.animation = 'none';
      beat._tapHint.style.animation = 'none';
      gsap.to(beat._tapHint, { opacity: 0, duration: 0.2 });
      gsap.to(beat._label, { opacity: 0, duration: 0.2 });
      SND.coinFlip();

      // Start the winner-specific spin keyframe
      beat._coin.style.animation = (userWon ? 'runwayCoinSpinUser' : 'runwayCoinSpinAi') + ' 1.8s cubic-bezier(0.25, 0.1, 0.25, 1) forwards';

      // Coin lands at ~1700ms — trigger catch + result stamp + transition
      setTimeout(function() {
        SND.coinCatch();
        shake(ctx.el);

        // Fade the coin out as the result stamp fades in. The coin's
        // bottom (270) is close to the result stamp top (282), and we
        // don't want to see both at once at the same y.
        gsap.to(beat._coinWrap, { opacity: 0, duration: 0.4, ease: 'power2.out' });

        // Result stamp content
        if (userWon) {
          beat._resEye.textContent = (ctx.team.name || '').toUpperCase() + ' WIN THE TOSS';
          beat._resWinner.textContent = 'YOUR CHOICE';
          beat._resSub.textContent = 'RECEIVE KICKOFF OR TAKE A CARD';
        } else {
          beat._resEye.textContent = (ctx.opp.name || '').toUpperCase() + ' WIN THE TOSS';
          beat._resWinner.textContent = 'OPPONENT CHOOSING...';
          beat._resSub.textContent = ' ';
        }
        gsap.to(beat._result, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
      }, 1700);

      // Transition to choice phase 900ms after coin lands
      setTimeout(function() {
        if (userWon) {
          runUserChoicePhase(ctx, onDone);
        } else {
          runAiChoicePhase(ctx, onDone);
        }
      }, 2600);
    };
  }, null, 1.1);
}

// ─── User won toss → show choice cards, let user pick ───
function runUserChoicePhase(ctx, onDone) {
  var beat = ctx.beat2;
  var tl = gsap.timeline();

  // Fade out coin
  tl.to([beat._label, beat._coinWrap, beat._pool], { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0);

  // Show choice wrap — direct inline style for pointer-events, GSAP's
  // CSS plugin drops pointerEvents silently and leaves clicks broken.
  beat._choiceWrap.style.opacity = '1';
  beat._choiceWrap.style.pointerEvents = 'auto';
  beat._kickoffCard.style.pointerEvents = 'auto';
  beat._torchCard.style.pointerEvents = 'auto';

  // Flip in choice cards
  tl.to(beat._kickoffCard, { rotationY: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.5)' }, 0.15);
  tl.to(beat._torchCard, { rotationY: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.5)' }, 0.27);
  tl.call(function() { SND.cardDeal(); }, null, 0.15);

  // User picks — no auto-pick timer. Let the player take their time.
  var picked = false;
  function lockChoice(pick) {
    if (picked) return;
    picked = true;
    var pickedEl = pick === 'kickoff' ? beat._kickoffCard : beat._torchCard;
    var otherEl = pick === 'kickoff' ? beat._torchCard : beat._kickoffCard;
    gsap.to(pickedEl, { scale: 1.04, duration: 0.2, ease: 'back.out(2)' });
    gsap.to(otherEl, { opacity: 0.28, scale: 0.95, duration: 0.25 });
    SND.select();

    setTimeout(function() {
      if (pick === 'kickoff') {
        // User receives, opponent gets free card
        ctx.humanReceives = true;
        runCardSelectPhase(ctx, 'ai', onDone);
      } else {
        // User picks a card, opponent receives
        ctx.humanReceives = false;
        runCardSelectPhase(ctx, 'user', onDone);
      }
    }, 700);
  }
  beat._kickoffCard.onclick = function() { lockChoice('kickoff'); };
  beat._torchCard.onclick = function() { lockChoice('card'); };
}

// ─── AI won toss → AI auto-picks (currently always receives for simplicity) ───
function runAiChoicePhase(ctx, onDone) {
  var beat = ctx.beat2;
  // AI always picks receive → human gets free card
  ctx.humanReceives = false; // AI receives
  setTimeout(function() {
    beat._resWinner.textContent = (ctx.opp.name || '').toUpperCase() + ' WILL RECEIVE';
    beat._resSub.textContent = 'YOU GET A FREE CARD';
  }, 100);
  // Fade out coin
  gsap.to([beat._label, beat._coinWrap, beat._pool], { opacity: 0, duration: 0.35, delay: 0.8, ease: 'power2.out' });
  setTimeout(function() {
    runCardSelectPhase(ctx, 'user', onDone);
  }, 1600);
}

// ─── Card selection phase (3 face-down cards, flip one to reveal) ───
function runCardSelectPhase(ctx, mode, onDone) {
  var beat = ctx.beat2;

  // Fade out choice cards, result stamp
  gsap.to([beat._choiceWrap, beat._result], { opacity: 0, duration: 0.35, ease: 'power2.out' });
  // And disable pointer events on the faded choice cards so they don't
  // intercept anything after fade.
  if (beat._choiceWrap) beat._choiceWrap.style.pointerEvents = 'none';

  // Show face-down wrap. Setting pointer-events via gsap.set was
  // unreliable (CSS plugin sometimes drops pointerEvents), so we set
  // inline styles directly. This is the actual bug that made users feel
  // like cards were being picked for them — clicks weren't reaching
  // the face-down elements at all.
  beat._facedownWrap.style.opacity = '1';
  beat._facedownWrap.style.pointerEvents = 'auto';

  // Update subtitle
  beat._csSub.textContent = mode === 'user' ? 'PICK YOUR CARD' : 'OPPONENT PICKING...';
  beat._csSub.style.color = mode === 'ai' ? '#FF7B00' : '#fff';
  beat._revEye.textContent = mode === 'user' ? 'YOU DREW' : 'OPPONENT DREW';

  // Deal face-down cards in
  var tl = gsap.timeline({ delay: 0.4 });
  beat._facedowns.forEach(function(fd, i) {
    // Ensure each card is clickable in its own right
    fd.style.pointerEvents = 'auto';
    tl.to(fd, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, i * 0.12);
  });
  setTimeout(function() { SND.cardDeal(); }, 500);

  // User path: interactive. AI path: auto-pick middle after beat.
  if (mode === 'user') {
    beat._facedowns.forEach(function(fd, i) {
      fd.onclick = function() {
        if (beat._revealed) return;
        var card = ctx.offers[i];
        doReveal(ctx, fd, card, mode, onDone);
      };
    });
    // No safety auto-pick for user mode — let the player take their time.
    // If they never tap, the runway just waits. This is a deliberate
    // decision: the player should get to read the cards and pick
    // intentionally, not race a timer.
  } else {
    // AI picks middle card after 1.5s
    setTimeout(function() {
      doReveal(ctx, beat._facedowns[1], ctx.offers[1], mode, onDone);
    }, 1500);
  }
}

function doReveal(ctx, fdEl, card, mode, onDone) {
  var beat = ctx.beat2;
  if (beat._revealed) return;
  beat._revealed = true;
  ctx.pickedCard = card;
  ctx.pickedBy = mode;

  // Hide the picked face-down + dim others
  gsap.to(fdEl, { opacity: 0, duration: 0.25 });
  beat._facedowns.forEach(function(f) {
    if (f !== fdEl) gsap.to(f, { opacity: 0.2, scale: 0.92, duration: 0.3 });
  });

  // Populate reveal card with real data
  populateRevealCard(beat._reveal, card);
  beat._revLine.textContent = (card.name || 'CARD') + ' \u00B7 ' + (card.tier || 'BRONZE');

  // Flip reveal in
  var tl = gsap.timeline({
    onComplete: function() {
      setTimeout(function() {
        onDone && onDone();
      }, 1200);
    }
  });
  tl.to(beat._reveal, { opacity: 1, rotationY: 0, scale: 1, duration: 0.55, ease: 'back.out(1.5)' }, 0.15);
  tl.to(beat._revealStamp, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.55);
  setTimeout(function() { SND.flipDramatic(); shake(ctx.el); }, 150);
}

// ═══════════════════════════════════════════════════════
// BEAT 3 — KICKOFF
// ═══════════════════════════════════════════════════════
function buildBeat3(ctx) {
  var beat = document.createElement('div');
  beat.style.cssText = 'position:absolute;inset:0;background:#050403;opacity:0;pointer-events:none;';

  var flash = document.createElement('div');
  flash.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(255,245,200,0.5) 0%,rgba(255,180,60,0.25) 20%,transparent 60%);opacity:0;';
  beat.appendChild(flash);
  beat._flash = flash;

  var stamp = document.createElement('div');
  stamp.textContent = 'KICKOFF';
  stamp.style.cssText =
    'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.3);' +
    "font-family:'Teko';font-weight:900;font-size:86px;letter-spacing:8px;line-height:1;white-space:nowrap;" +
    'background:linear-gradient(180deg,#FFE17A 0%,#FFD060 20%,#EBB010 45%,#8B4A1F 72%,#EBB010 90%,#FFD060 100%);' +
    '-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;' +
    'filter:drop-shadow(0 6px 0 rgba(0,0,0,0.9)) drop-shadow(0 0 36px rgba(235,176,16,0.65)) drop-shadow(0 0 72px rgba(255,69,17,0.45));' +
    'opacity:0;';
  beat.appendChild(stamp);
  beat._stamp = stamp;

  return beat;
}

function runBeat3(ctx, onDone) {
  var beat = ctx.beat3;
  var tl = gsap.timeline({ onComplete: onDone });

  // Hide Beat 2
  tl.to(ctx.beat2, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 0);
  tl.call(function() { ctx.beat2.style.pointerEvents = 'none'; }, null, 0.25);

  // Show Beat 3 (pointer-events not needed — it's non-interactive)
  tl.call(function() { beat.style.opacity = '1'; }, null, 0.2);

  // Flash in
  tl.to(beat._flash, { opacity: 1, duration: 0.2 }, 0.25);
  tl.call(function() { SND.bassDrop(); }, null, 0.25);

  // Flash settle + crowd cheer
  tl.to(beat._flash, { opacity: 0.6, duration: 0.8 }, 0.45);
  tl.call(function() { SND.bigPlay && SND.bigPlay(); }, null, 0.45);

  // Stamp burns in
  tl.to(beat._stamp, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }, 0.55);
  tl.call(function() { shake(ctx.el); }, null, 0.55);

  // Hold
  tl.to({}, { duration: 1.2 }, 0.95);
}

// ═══════════════════════════════════════════════════════
// MAIN ENTRY
// ═══════════════════════════════════════════════════════
export function buildPregame() {
  injectRunwayStyles();
  AudioStateManager.setState('pre_game');

  var team = TEAMS[GS.team];
  var opp = TEAMS[GS.opponent];
  if (!team || !opp) {
    setGs(function(s) { return Object.assign({}, s, { screen: 'home' }); });
    return document.createElement('div');
  }

  var conditions = GS.gameConditions || { weather: 'clear', field: 'turf', crowd: 'home' };
  var gamesPlayed = parseInt(localStorage.getItem('torch_games_played') || '0');
  var isFast = gamesPlayed >= 2;
  var speedMult = isFast ? 0.65 : 1;

  var ctx = {
    el: null,
    team: team,
    opp: opp,
    conditions: conditions,
    humanWins: Math.random() < 0.5,
    offers: rollCardOffers(),
    speedMult: speedMult,
    gamesPlayed: gamesPlayed,
    humanReceives: null,
    pickedCard: null,
    pickedBy: null,
  };

  // Stage container
  var el = document.createElement('div');
  el.style.cssText = 'height:100vh;height:100dvh;background:#050403;position:relative;overflow:hidden;padding-top:env(safe-area-inset-top,0px);';
  ctx.el = el;

  // Build all 3 beats (stacked, only one visible at a time)
  ctx.beat1 = buildBeat1(ctx);
  ctx.beat2 = buildBeat2(ctx);
  ctx.beat3 = buildBeat3(ctx);
  el.appendChild(ctx.beat1);
  el.appendChild(ctx.beat2);
  el.appendChild(ctx.beat3);

  // Kick off timeline after first paint so DOM is ready
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      runBeat1(ctx, function() {
        runBeat2(ctx, function() {
          runBeat3(ctx, function() {
            finishRunway(ctx);
          });
        });
      });
    });
  });

  return el;
}

// ─── Commit runway result to GS and transition to gameplay ───
function finishRunway(ctx) {
  // Bump games played counter (this used to happen on tap in old pregame)
  try { localStorage.setItem('torch_games_played', String(ctx.gamesPlayed + 1)); } catch(e) {}

  setGs(function(s) {
    var next = Object.assign({}, s || {}, {
      screen: 'gameplay',
      humanReceives: ctx.humanReceives === true,
      _coinTossDone: true,
    });
    // If user drew a free card, add to season.torchCards
    if (ctx.pickedCard && ctx.pickedBy === 'user') {
      var newSeason = Object.assign({}, (s && s.season) || {});
      newSeason.torchCards = ((s && s.season && s.season.torchCards) || []).slice();
      newSeason.torchCards.push(ctx.pickedCard);
      next.season = newSeason;
    }
    return next;
  });
}
