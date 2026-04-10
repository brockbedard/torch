/**
 * TORCH — Home Screen ("The Card Table")
 * Dark surface, flame above wordmark, three premium card backs fanned out,
 * warm light pool, embers. Brand → cards → action.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { setGs, getOffCards, getDefCards, VERSION } from '../../state.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { buildHomeCard } from '../components/cards.js';
import { FLAME_PATH, buildFlameBadgeButton } from '../components/brand.js';
import { flameIconSVG } from '../../utils/flameIcon.js';
import { footballInlineO } from '../../utils/footballIcon.js';
import AudioStateManager from '../../engine/audioManager.js';

function injectHomeStyles() {
  if (document.getElementById('home-anims')) return;
  var s = document.createElement('style');
  s.id = 'home-anims';
  s.textContent =
    '@keyframes warmPulse{0%,100%{opacity:0.06}50%{opacity:0.12}}' +
    '@keyframes flameBreath{0%,100%{transform:scaleY(1) scaleX(1);filter:drop-shadow(0 0 16px rgba(255,69,17,0.4))}50%{transform:scaleY(1.04) scaleX(0.97);filter:drop-shadow(0 0 28px rgba(255,69,17,0.6)) drop-shadow(0 0 48px rgba(235,176,16,0.2))}}' +
    '@keyframes titleGlow{0%,100%{text-shadow:2px 2px 0 rgba(0,0,0,0.9),0 0 16px rgba(235,176,16,0.2)}50%{text-shadow:2px 2px 0 rgba(0,0,0,0.9),0 0 28px rgba(235,176,16,0.4),0 0 48px rgba(255,69,17,0.15)}}' +
    '@keyframes fanFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}' +
    '@keyframes emberRise{0%{opacity:0;transform:translateY(0) translateX(0) scale(1)}15%{opacity:0.8}70%{opacity:0.2}100%{opacity:0;transform:translateY(-220px) translateX(var(--drift,0px)) scale(0.3)}}' +
    '@keyframes cardDealIn{0%{opacity:0;transform:translateY(60px) rotate(0deg) scale(0.5)}100%{opacity:1}}';
  document.head.appendChild(s);
}

export function buildHome() {
  injectHomeStyles();
  var el = document.createElement('div');
  el.style.cssText = 'height:100vh;height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:20px 20px 0;';

  // ── BACKGROUND LAYERS ──
  var bgBase = document.createElement('div');
  bgBase.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 55%,#1a1208 0%,#0a0804 50%,#050403 100%);z-index:0;';
  el.appendChild(bgBase);

  // Warm light pool
  var warmPool = document.createElement('div');
  warmPool.style.cssText = 'position:absolute;top:35%;left:50%;transform:translate(-50%,-50%);width:320px;height:280px;background:radial-gradient(ellipse,rgba(255,120,20,0.07) 0%,rgba(255,80,0,0.03) 40%,transparent 65%);z-index:0;pointer-events:none;animation:warmPulse 4s ease-in-out infinite;';
  el.appendChild(warmPool);

  // Noise
  var noise = document.createElement('div');
  noise.style.cssText = 'position:absolute;inset:0;z-index:0;opacity:0.025;pointer-events:none;background:repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(255,255,255,0.5) 2px,rgba(255,255,255,0.5) 3px);';
  el.appendChild(noise);

  // Top accent
  var topAccent = document.createElement('div');
  topAccent.style.cssText = 'position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#EBB01066,transparent);z-index:1;';
  el.appendChild(topAccent);

  // ── EMBER PARTICLES ──
  var emberWrap = document.createElement('div');
  emberWrap.style.cssText = 'position:absolute;top:32%;left:50%;transform:translateX(-50%);width:300px;height:200px;z-index:1;pointer-events:none;';
  var drifts = [-30, -18, 12, 25, -10, 18, -24, 8, 15, -22, 10, -15, 22, -8, 28, -28, 14, -20];
  for (var e = 0; e < 18; e++) {
    var ember = document.createElement('div');
    var sz = 1.5 + Math.random() * 3;
    var dur = 2.5 + Math.random() * 3;
    var delay = Math.random() * 5;
    var left = 20 + Math.random() * 60;
    ember.style.cssText = 'position:absolute;bottom:0;left:' + left + '%;width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:radial-gradient(circle,#FF8C00,rgba(255,94,26,0.6),transparent);opacity:0;animation:emberRise ' + dur + 's ' + delay + 's ease-out infinite;--drift:' + drifts[e % drifts.length] + 'px;';
    emberWrap.appendChild(ember);
  }
  el.appendChild(emberWrap);

  // ── DEV BANNER ──
  var isDev = !!localStorage.getItem('torch_dev');
  if (isDev) {
    var devBanner = document.createElement('div');
    devBanner.style.cssText = 'position:absolute;top:0;left:0;right:0;z-index:100;background:rgba(0,0,0,0.85);border-left:4px solid #4DA6FF;padding:6px 12px;font-family:"Courier New",monospace;font-size:9px;color:#666;cursor:pointer;';
    devBanner.innerHTML = "<span style='color:#4DA6FF;'>DEV</span> v" + VERSION;
    devBanner.onclick = function() { devBanner.remove(); };
    el.appendChild(devBanner);
  }

  // ── CONTENT ──
  var content = document.createElement('div');
  content.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;gap:0;min-height:0;';

  // Flame icon
  var flameEl = document.createElement('div');
  flameEl.style.cssText = 'margin-bottom:6px;animation:flameBreath 3s ease-in-out infinite;opacity:0;filter:drop-shadow(0 0 12px rgba(255,69,17,0.5));';
  // Hero flame on the title screen — use the full 4-layer flame.
  // 37×37 (square) replaces the old 28×37 rectangular flame.
  flameEl.innerHTML = flameIconSVG(37, 1);
  content.appendChild(flameEl);

  // TORCH wordmark with football-O
  var title = document.createElement('h1');
  title.style.cssText = "font-family:'Teko';font-weight:900;font-size:64px;line-height:0.8;color:#EBB010;letter-spacing:8px;text-align:center;z-index:2;animation:titleGlow 4s ease-in-out infinite;position:relative;opacity:0;margin:0;";
  // Football-O replaces the "O" in TORCH — em-based sizing auto-matches font.
  title.innerHTML = 'T' + footballInlineO('drop-shadow(0 0 6px rgba(255,140,0,0.5)) drop-shadow(0 2px 3px rgba(0,0,0,0.6))') + 'RCH';
  content.appendChild(title);

  // FOOTBALL subtitle
  var sub = document.createElement('div');
  sub.style.cssText = "font-family:'Teko';font-weight:700;font-size:24px;color:rgba(255,245,230,0.5);letter-spacing:12px;margin-top:4px;opacity:0;";
  sub.textContent = 'FOOTBALL';
  content.appendChild(sub);

  // Card fan
  var cardFan = document.createElement('div');
  cardFan.style.cssText = 'position:relative;width:320px;height:200px;margin-top:28px;animation:fanFloat 6s ease-in-out infinite;flex-shrink:0;opacity:0;';

  var fanTypes = ['offense', 'torch', 'defense'];
  var fanAngles = [-14, 0, 14];
  var fanX = [-76, 0, 76];
  var fanY = [10, 0, 10];
  var fanZ = [1, 3, 1];
  var fanScale = [1, 1.12, 1];

  for (var c = 0; c < 3; c++) {
    var cardEl = buildHomeCard(fanTypes[c], 100, 140);
    cardEl.style.cssText += ';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(' + fanAngles[c] + 'deg) translateX(' + fanX[c] + 'px) translateY(' + fanY[c] + 'px) scale(' + fanScale[c] + ');z-index:' + fanZ[c] + ';';

    // Warm light cast from torch onto neighbors
    var innerCard = cardEl.querySelector('.torch-card-inner');
    if (fanTypes[c] === 'offense' && innerCard) {
      var warmR = document.createElement('div');
      warmR.style.cssText = 'position:absolute;top:0;right:0;width:40%;height:100%;background:linear-gradient(to left,rgba(255,120,40,0.06),transparent);border-radius:0 8px 8px 0;z-index:1;pointer-events:none;';
      innerCard.appendChild(warmR);
    }
    if (fanTypes[c] === 'defense' && innerCard) {
      var warmL = document.createElement('div');
      warmL.style.cssText = 'position:absolute;top:0;left:0;width:40%;height:100%;background:linear-gradient(to right,rgba(255,120,40,0.06),transparent);border-radius:8px 0 0 8px;z-index:1;pointer-events:none;';
      innerCard.appendChild(warmL);
    }

    cardFan.appendChild(cardEl);
  }
  content.appendChild(cardFan);

  // Tagline
  var tagline = document.createElement('div');
  tagline.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:12px;letter-spacing:4px;color:#EBB01066;text-align:center;margin-top:24px;opacity:0;";
  tagline.textContent = 'YOUR CARDS. YOUR CALLS. YOUR GAME.';
  content.appendChild(tagline);

  el.appendChild(content);

  // ── CTA SECTION ──
  var ctaWrap = document.createElement('div');
  ctaWrap.style.cssText = 'width:100%;z-index:2;flex-shrink:0;padding:0 20px 20px;padding-bottom:max(20px,env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:8px;';

  // PLAY button (flame badge)
  var playBtn = buildFlameBadgeButton('PLAY', function() {
    SND.click();
    AudioStateManager.init();
    AudioStateManager.setState('menu');
    var firstDone = localStorage.getItem('torch_first_season_done');
    setGs(function(s) { return Object.assign({}, s || {}, { screen: 'teamSelect', team: null, isFirstSeason: !firstDone }); });
  });
  playBtn.style.opacity = '0';
  playBtn.style.borderRadius = '8px';

  ctaWrap.appendChild(playBtn);
  el.appendChild(ctaWrap);

  // ── DEV QUICK PLAY ──
  if (isDev) {
    var qpBtn = document.createElement('button');
    qpBtn.style.cssText = 'position:absolute;bottom:24px;right:12px;z-index:9999;background:rgba(0,0,0,0.85);border:1px solid #4DA6FF;border-radius:20px;padding:5px 10px;cursor:pointer;font-family:"Courier New",monospace;font-size:9px;color:#4DA6FF;opacity:0.6;';
    qpBtn.textContent = 'QP';
    qpBtn.onclick = function() {
      SND.click();
      var qpTeam = 'stags';
      setGs(function() {
        return {
          screen: 'gameplay', team: qpTeam, opponent: 'wolves', difficulty: 'EASY',
          offRoster: getOffenseRoster(qpTeam).slice(0, 4).map(function(p) { return p.id; }),
          defRoster: getDefenseRoster(qpTeam).slice(0, 4).map(function(p) { return p.id; }),
          offHand: getOffCards(qpTeam).slice(0, 4), defHand: getDefCards(qpTeam).slice(0, 4),
          humanReceives: true, _coinTossDone: true, isFirstSeason: false,
          gameConditions: { weather: 'clear', field: 'turf', crowd: 'home' },
          season: { opponents: ['wolves', 'sentinels', 'serpents'], currentGame: 0, results: [], totalScore: 0, torchCards: [], carryoverPoints: 0 },
        };
      });
    };
    el.appendChild(qpBtn);
  }

  // Version label
  var verLabel = document.createElement('div');
  verLabel.style.cssText = 'position:absolute;bottom:6px;width:100%;text-align:center;font-family:"Courier New",monospace;font-size:8px;color:#ffffff22;z-index:2;';
  verLabel.textContent = 'v' + VERSION;
  el.appendChild(verLabel);

  // ── ENTRANCE ANIMATION ──
  requestAnimationFrame(function() { requestAnimationFrame(function() {
    try {
      gsap.to(flameEl, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' });
      gsap.from(flameEl, { scale: 0.5, duration: 0.4, ease: 'back.out(2)' });
      gsap.to(title, { opacity: 1, y: 0, duration: 0.4, delay: 0.2 });
      gsap.from(title, { y: 12, duration: 0.4, delay: 0.2 });
      gsap.to(sub, { opacity: 1, duration: 0.3, delay: 0.35 });
      gsap.to(cardFan, { opacity: 1, duration: 0.4, delay: 0.5 });
      // Deal cards in with stagger
      var cards = cardFan.children;
      for (var i = 0; i < cards.length; i++) {
        gsap.from(cards[i], { y: 60, scale: 0.5, opacity: 0, duration: 0.4, delay: 0.5 + i * 0.1, ease: 'back.out(1.7)' });
      }
      gsap.to(tagline, { opacity: 1, duration: 0.3, delay: 1.0 });
      gsap.to(playBtn, { opacity: 1, y: 0, duration: 0.3, delay: 1.2 });
      gsap.from(playBtn, { y: 10, duration: 0.3, delay: 1.2 });
    } catch (e) {
      flameEl.style.opacity = '1'; title.style.opacity = '1'; sub.style.opacity = '1';
      cardFan.style.opacity = '1'; tagline.style.opacity = '1'; playBtn.style.opacity = '1';
    }
  }); });

  return el;
}
