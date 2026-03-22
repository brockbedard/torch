/**
 * TORCH — Gameplay Screen v3
 * Complete rewrite. Portrait bottom-stack.
 * Fresh visual language — no reuse from prior versions.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOtherTeam, fmtClock, getOffCards, getDefCards } from '../../state.js';
import { badgeSvg, BADGE_LABELS } from '../../data/badges.js';
import { GameState } from '../../engine/gameState.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { checkOffensiveBadgeCombo, checkDefensiveBadgeCombo } from '../../engine/badgeCombos.js';
import { getPlayHistoryBonus } from '../../engine/playHistory.js';
import { playSvg } from '../../data/playDiagrams.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { buildHomeCard, buildMaddenPlayer, buildPlayV1, buildTorchCard, injectCardStyles } from '../components/cards.js';
import { showShop, renderInventory } from '../components/shop.js';
import { showTooltip } from '../components/tooltip.js';
import { getConditionEffects } from '../../data/gameConditions.js';
import { checkPlayCombos } from '../../data/playSequenceCombos.js';

/* ═══════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════ */
const CSS = `
/* root */
.T{height:100vh;display:flex;flex-direction:column;background:#0A0804;overflow:hidden;position:relative;font-family:'Barlow Condensed',sans-serif}

/* scoreboard */
.T-sb{background:#0E0A04;border-bottom:1px solid #1E1610;flex-shrink:0;z-index:60;overflow:hidden}
/* score row: 5 columns — icon | team+score | center | team+score | icon */
.T-sb-row{display:grid;grid-template-columns:28px 1fr minmax(60px,auto) 1fr 28px;align-items:center;justify-items:center;padding:6px 8px;gap:4px}
.T-sb-icon{font-size:32px;line-height:1;text-align:center;filter:drop-shadow(0 0 8px rgba(255,255,255,.2)) saturate(1.3)}
.T-sb-side{display:flex;flex-direction:column;align-items:center;padding:6px 6px;border-radius:6px;position:relative}
.T-sb-side-glow{background:radial-gradient(ellipse,rgba(255,204,0,.2) 0%,rgba(255,204,0,.06) 50%,transparent 75%);box-shadow:0 0 20px rgba(255,204,0,.18)}
.T-sb-name{font-family:'Teko';font-size:18px;font-style:italic;line-height:1;letter-spacing:1px;white-space:nowrap}
.T-sb-score-row{position:relative;margin-top:2px;display:flex;justify-content:center}
.T-sb-pos-arrow{position:absolute;top:50%;transform:translateY(-50%);font-size:12px;color:#c8a030;line-height:1}
.T-sb-pos-arrow-l{left:-14px}
.T-sb-pos-arrow-r{right:-14px}
.T-sb-pts{font-family:'Rajdhani';font-size:28px;color:#e8e6ff;line-height:1}
.T-sb-pts-glow{text-shadow:0 0 14px rgba(255,204,0,.5)}
.T-sb-center{text-align:center;padding:0 8px;border-left:1px solid rgba(255,255,255,.06);border-right:1px solid rgba(255,255,255,.06);min-width:80px}
.T-sb-half{font-family:'Teko';font-size:17px;color:#c8a030;letter-spacing:2px;line-height:1;white-space:nowrap}
.T-sb-snap{font-family:'Rajdhani';font-size:12px;color:#e8e6ff;margin-top:3px;line-height:1;text-shadow:0 0 4px rgba(255,255,255,.2)}
.T-sb-countdown{font-family:'Rajdhani';font-size:9px;color:#554f80;margin-top:5px;line-height:1}
.T-sb-countdown-live{font-size:14px;color:#e03050;text-shadow:0 0 10px rgba(224,48,80,.5)}
/* situation bar — always one line, never wraps */
.T-sb-sit{display:flex;align-items:center;justify-content:center;padding:4px 8px;background:rgba(0,0,0,.4);border-top:1px solid rgba(255,255,255,.04);gap:6px;white-space:nowrap;overflow:hidden}
.T-sb-sit-down{font-family:'Rajdhani';font-size:10px;color:#30c0e0;letter-spacing:.5px;flex-shrink:0}
.T-sb-sit-div{width:1px;height:14px;background:rgba(255,255,255,.12);flex-shrink:0}
.T-sb-sit-ball{font-family:'Rajdhani';font-size:10px;color:#e8e6ff;opacity:.7;letter-spacing:.5px;flex-shrink:1;overflow:hidden;text-overflow:ellipsis}
.T-sb-sit-torch{font-family:'Rajdhani';font-size:12px;color:#c8a030;letter-spacing:.5px;transition:transform .08s,text-shadow .08s;flex-shrink:0}

/* field strip — Tecmo Bowl inspired */
.T-strip{height:160px;flex-shrink:0;position:relative;background:#1a6a1a;overflow:hidden;border-bottom:1px solid #1E1610}
.T-field-turf{position:absolute;inset:0;background-image:repeating-linear-gradient(0deg,rgba(0,0,0,.04) 0%,rgba(0,0,0,.04) 50%,transparent 50%,transparent 100%);background-size:100% 12px}
.T-yard{position:absolute;top:0;bottom:0;width:2px;background:rgba(255,255,255,.4)}
.T-yard-5{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.15)}
.T-yard-num{position:absolute;font-family:'Rajdhani';font-size:10px;color:rgba(255,255,255,.45);transform:translateX(-50%);letter-spacing:1px;font-weight:bold}
.T-yard-num-top{top:4px}
.T-yard-num-bot{bottom:4px}
.T-los{position:absolute;top:0;bottom:0;width:3px;z-index:5;transition:left .4s ease-out}
.T-ltg{position:absolute;top:0;bottom:0;width:2px;opacity:.6;z-index:4;transition:left .4s ease-out;border-left:2px dashed}
.T-ez{position:absolute;top:0;bottom:0;width:7%;display:flex;align-items:center;justify-content:center;overflow:hidden}
.T-ez-l{left:0;border-right:3px solid rgba(255,255,255,.3)}
.T-ez-r{right:0;border-left:3px solid rgba(255,255,255,.3)}
.T-ez-text{font-family:'Rajdhani';font-size:14px;color:rgba(255,255,255,0.6);writing-mode:vertical-lr;letter-spacing:4px}
.T-ez-l .T-ez-text{transform:rotate(180deg)}
.T-ez-r .T-ez-text{transform:rotate(0deg)}
.T-midfield-logo{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:72px;opacity:.5;z-index:1;filter:saturate(1.5) drop-shadow(0 0 8px rgba(255,255,255,.15))}
.T-hash{position:absolute;left:7%;right:7%;height:1px;background:rgba(255,255,255,.06)}
/* placed cards on field — centered vertically */
.T-placed{position:absolute;top:50%;transform:translateY(-50%);height:150px;z-index:8;border-radius:6px;overflow:hidden;background:radial-gradient(ellipse at 50% 25%,#141008,#0A0804);border:2px solid #00ff44;box-shadow:0 0 12px rgba(0,255,68,.2),0 3px 10px rgba(0,0,0,0.5);display:flex;flex-direction:column}
.T-placed-play{left:3%;width:30%}
.T-placed-player{left:35%;width:30%}
.T-placed-torch{right:3%;width:28%}
/* empty drop outlines — centered vertically */
.T-drop{position:absolute;top:50%;transform:translateY(-50%);height:150px;border:2px dashed rgba(255,255,255,0.2);border-radius:6px;display:flex;align-items:center;justify-content:center;z-index:7;transition:all .3s ease;opacity:0.8;background:rgba(0,0,0,0.2)}
.T-drop-play{left:3%;width:30%}
.T-drop-player{left:35%;width:30%}
.T-drop-torch{right:3%;width:28%}
.T-drop-lbl{font-family:'Rajdhani';font-size:8px;color:rgba(255,255,255,0.4);letter-spacing:1px;text-align:center;line-height:1.4}
.T-drop-hover{border-color:#FF4511;background:rgba(255,69,17,.15);transform:translateY(-50%) scale(1.02)}
@keyframes T-drop-pulse{0%,100%{border-color:rgba(255,69,17,0.4);box-shadow:0 0 10px rgba(255,69,17,0.1)}50%{border-color:#FF4511;box-shadow:inset 0 0 15px rgba(255,69,17,.2),0 0 15px rgba(255,69,17,.4);background:rgba(255,69,17,0.05)}}
.T-drop-active{animation:T-drop-pulse 1.5s ease-in-out infinite;border-style:solid;opacity:1;z-index:10}
.T-drop-active .T-drop-lbl{color:#FF4511;font-size:11px;text-shadow:0 0 8px rgba(255,69,17,0.5)}

/* cards section — hidden during play-by-play */
.T-panel{display:flex;flex-direction:column;overflow:hidden;transition:background .6s,border-color .6s;flex-shrink:0;border-top:2px solid transparent;position:relative;z-index:1}
.T-panel-hidden{display:none}
/* offense: warm amber energy */
.T-panel-off{background:linear-gradient(180deg,#1a1000 0%,#0A0804 60%);border-top-color:#c8a03044}
.T-panel-off .T-inst{color:#c8a030}
.T-panel-off .T-card{}
/* defense: cold blue/red danger */
.T-panel-def{background:linear-gradient(180deg,#00101a 0%,#0A0804 60%);border-top-color:#30c0e044}
.T-panel-def .T-inst{color:#30c0e0}
.T-panel-def .T-card{}

/* instruction */
.T-inst{text-align:center;padding:6px 0 2px;font-family:'Rajdhani';font-size:7px;letter-spacing:1px;flex-shrink:0;text-transform:uppercase}

/* card tray — matches pregame draft card style */
.T-tray{display:flex;gap:6px;padding:6px 6px;flex-shrink:0}
.T-card{flex:1;height:150px;border-radius:6px;overflow:visible;display:flex;flex-direction:column;transition:all .15s ease;touch-action:none;position:relative;cursor:grab;opacity:.8}
.T-card:active{cursor:grabbing}
.T-card-sel{opacity:1;border-color:#00ff44 !important;box-shadow:0 0 18px rgba(0,255,68,.35),inset 0 0 12px rgba(0,255,68,.08) !important}
.T-card-gone{opacity:.3;pointer-events:none}
.T-card-hurt{opacity:.2;pointer-events:none}
/* drag ghost */
.T-drag-ghost{position:fixed;z-index:9999;pointer-events:none;opacity:.85;transform:scale(1.05);filter:drop-shadow(0 4px 12px rgba(0,0,0,.6))}

/* snap bar — uses btn-blitz style */
.T-snap{padding:4px 6px;flex-shrink:0;display:flex;gap:4px;align-items:stretch;flex-direction:column}
@keyframes T-pulse{0%,100%{box-shadow:6px 6px 0 #997a00, 10px 10px 0 #000, 0 0 20px rgba(255,204,0,.3)}50%{box-shadow:6px 6px 0 #997a00, 10px 10px 0 #000, 0 0 40px rgba(255,204,0,.6)}}

/* 2min buttons */
.T-2btns{display:flex;gap:5px}
.T-2btn{flex:1;padding:10px;font-family:'Rajdhani';font-size:7px;cursor:pointer;text-align:center;background:none;letter-spacing:.5px;text-transform:uppercase;border:4px solid}
.T-2btn:active{transform:translate(3px,3px)}
.T-spike{color:#30c0e0;border-color:#30c0e0;box-shadow:4px 4px 0 #1a6070,6px 6px 0 #000}
.T-kneel{color:#554f80;border-color:#554f80;box-shadow:4px 4px 0 #2a2840,6px 6px 0 #000}

/* play-by-play terminal */
.T-narr{flex:0 0 auto;min-height:60px;max-height:100px;background:#0C0804;border-top:1px solid #1E1610;overflow-y:auto;padding:6px 10px}
.T-pbp{display:flex;flex-direction:column;gap:6px}
.T-pbp-line{font-family:'Rajdhani',monospace;font-size:14px;color:#6a6690;line-height:1.4;letter-spacing:.3px}
.T-pbp-live{color:#e8e6ff;text-shadow:0 0 6px rgba(232,230,255,.15)}
.T-pbp-result{font-family:'Rajdhani';font-size:12px;letter-spacing:.5px;line-height:1;margin-top:10px;white-space:nowrap;overflow:hidden}
.T-pbp-down{font-family:'Rajdhani';font-size:10px;color:#30c0e0;margin-top:6px;letter-spacing:.5px;line-height:1;white-space:nowrap;overflow:hidden}
.T-pbp-idle{font-family:'Rajdhani',monospace;font-size:11px;color:#333;letter-spacing:.5px}
/* torch points fly animation */
.T-torch-fly{position:fixed;z-index:9999;font-family:'Rajdhani';font-size:12px;color:#c8a030;pointer-events:none;text-shadow:0 0 8px rgba(200,160,48,.5)}
@keyframes T-flyup{0%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(.6)}}
.T-pbp-cursor{display:inline-block;width:6px;height:12px;background:#30c0e0;margin-left:2px;animation:T-blink .6s step-end infinite}

/* celebrations */
@keyframes T-shake{0%,100%{transform:translateX(0)}10%{transform:translateX(-6px)}20%{transform:translateX(6px)}30%{transform:translateX(-4px)}40%{transform:translateX(4px)}50%{transform:translateX(-2px)}60%{transform:translateX(2px)}}
.T-shaking{animation:T-shake .5s ease-out}
@keyframes T-flash-green{0%{opacity:.6}100%{opacity:0}}
@keyframes T-flash-red{0%{opacity:.6}100%{opacity:0}}
.T-flash{position:absolute;inset:0;z-index:100;pointer-events:none}
@keyframes T-rain-fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(200px) rotate(720deg);opacity:0}}
.T-rain{position:absolute;font-size:16px;z-index:99;pointer-events:none;animation:T-rain-fall 2s ease-in forwards}
@keyframes T-crack-in{0%{opacity:0;transform:scale(2)}100%{opacity:1;transform:scale(1)}}
.T-crack{position:absolute;inset:0;z-index:100;pointer-events:none;display:flex;align-items:center;justify-content:center}
.T-crack-text{font-family:'Rajdhani';font-size:18px;letter-spacing:2px;animation:T-crack-in .3s ease-out;text-shadow:0 0 20px currentColor}
@keyframes T-impact{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(3)}}
.T-impact{position:absolute;top:50%;left:50%;width:40px;height:40px;border-radius:50%;z-index:99;pointer-events:none;transform:translate(-50%,-50%);animation:T-impact .4s ease-out forwards}
@keyframes T-blink{0%,100%{opacity:1}50%{opacity:0}}
/* card matchup display on field — helmet crash animation */
/* clash: simple 3-column layout — left cards | VS | right cards */
.T-clash{position:absolute;inset:0;z-index:9;display:flex;align-items:center;pointer-events:none;padding:8px}
.T-clash-side{flex:1;display:flex;flex-direction:column;gap:4px}
.T-clash-card{background:var(--bg-surface);border-radius:6px;border:2px solid;overflow:hidden}
.T-clash-center{display:flex;align-items:center;justify-content:center;padding:0 6px}
.T-clash-vs{font-family:'Rajdhani';font-size:14px;color:#fff;background:rgba(200,160,48,.95);padding:8px 12px;border-radius:8px;box-shadow:0 0 24px rgba(200,160,48,.7),0 0 50px rgba(200,160,48,.3);letter-spacing:3px;line-height:1}
/* torch points big popup */
@keyframes T-torch-pop{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}100%{opacity:0;transform:translate(-50%,-50%) scale(0.8) translateY(-30px)}}
.T-torch-big{position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);z-index:9999;font-family:'Rajdhani';font-size:28px;pointer-events:none;animation:T-torch-pop 1.5s ease-out forwards;text-shadow:0 0 20px currentColor}

/* overlays */
.T-ov{position:absolute;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;pointer-events:none}
.T-ov-dark{background:rgba(6,5,15,.92)}
.T-ov-black{background:#0A0804;pointer-events:auto}
@keyframes T-fade{from{opacity:0}to{opacity:1}}
@keyframes T-pop{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
.T-ov-result .T-r-play{font-family:'Rajdhani';font-size:9px;color:#554f80;letter-spacing:1px;margin-bottom:6px}
.T-ov-result .T-r-big{font-family:'Teko';font-size:44px;letter-spacing:3px;line-height:1;animation:T-pop .3s ease-out}
.T-ov-result .T-r-sub{font-family:'Rajdhani';font-size:9px;color:#8a86b0;margin-top:10px;max-width:300px;line-height:1.5}

/* possession cut */
.T-ov-poss .T-poss-score{font-family:'Rajdhani';font-size:22px;color:#e8e6ff}
.T-ov-poss .T-poss-who{font-family:'Teko';font-size:22px;letter-spacing:3px;margin:10px 0}
.T-ov-poss .T-poss-tag{font-family:'Rajdhani';font-size:9px;color:#554f80;font-style:italic}

/* conversion */
.T-conv{display:flex;flex-direction:column;align-items:center;gap:10px;padding:16px}
.T-conv-hdr{font-family:'Teko';font-size:36px;color:#3df58a;letter-spacing:3px}
.T-conv-btn{width:100%;max-width:260px;padding:14px;font-family:'Rajdhani';font-size:7px;border-radius:8px;cursor:pointer;text-align:center;background:none;letter-spacing:.5px;line-height:1.6}

/* drive summary */
.T-drv{padding:10px 14px;text-align:center}
.T-drv-hdr{font-family:'Rajdhani';font-size:7px;letter-spacing:1px;margin-bottom:4px}
.T-drv-stat{font-family:'Rajdhani';font-size:9px;color:#554f80}

/* 2-min transformation */
/* 2-minute drill — full urgency transformation */
.T-urgent .T-strip{border-bottom-color:#e03050;box-shadow:inset 0 0 30px rgba(224,48,80,.1)}
.T-urgent .T-sb{border-bottom-color:#e03050}
.T-urgent .T-sb-sit{background:rgba(224,48,80,.08)}
@keyframes T-breathe{0%,100%{background-color:#0A0804}50%{background-color:#140008}}
.T-urgent .T-panel{animation:T-breathe 2s ease-in-out infinite;border-top-color:#e0305066}
.T-urgent .T-narr{border-top-color:#e0305044;background:#0a0008}
@keyframes T-urgent-border{0%,100%{border-color:#e0305044}50%{border-color:#e03050}}
.T-urgent .T-card{animation:T-urgent-border 1.5s ease-in-out infinite}
.T-urgent .T-inst{color:#e03050 !important}
@keyframes T-coin{0%{transform:rotateY(0)}100%{transform:rotateY(1080deg)}}

/* 3-Beat Snap Result */
@keyframes T-beat-fly-off{0%{transform:translateY(80px) scale(0.7);opacity:0}60%{opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}
@keyframes T-beat-fly-def{0%{transform:translateY(-80px) scale(0.7);opacity:0}60%{opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}
@keyframes T-beat-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-3px)}40%{transform:translateX(3px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
@keyframes T-beat-flash{0%{opacity:0.5}100%{opacity:0}}
@keyframes T-beat-yds{0%{transform:scale(0.4);opacity:0}40%{transform:scale(1.15);opacity:1}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
.T-beat-dim{position:absolute;inset:0;background:rgba(0,0,0,0.4);z-index:50;pointer-events:none;transition:opacity 0.3s}
.T-beat-cards{position:absolute;inset:0;z-index:55;display:flex;align-items:center;justify-content:center;gap:12px;pointer-events:none}
.T-beat-card{padding:8px 12px;border-radius:8px;text-align:center;min-width:90px}
.T-beat-result{position:absolute;inset:0;z-index:56;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;gap:4px}
.T-beat-yds{font-family:'Teko';font-weight:700;font-size:42px;line-height:1;text-shadow:0 0 20px currentColor;animation:T-beat-yds 0.6s cubic-bezier(0.22,1.3,0.36,1) both}
.T-beat-label{font-family:'Rajdhani';font-weight:700;font-size:14px;letter-spacing:1px;opacity:0.8}
.T-beat-flash{position:absolute;inset:0;z-index:54;pointer-events:none;animation:T-beat-flash 0.3s ease-out forwards}
`;

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
function mqColor(q) { return q === 'green' ? '#3df58a' : q === 'red' ? '#e03050' : '#c8a030'; }
function typeColor(t) {
  return { SHORT:'#3df58a',QUICK:'#30c0e0',DEEP:'#e03050',RUN:'#e07020',SCREEN:'#e060a0',
    OPTION:'#e07020',BLITZ:'#e03050',ZONE:'#30c0a0',PRESSURE:'#c8a030',HYBRID:'#9060e0' }[t] || '#8a86b0';
}

function matchupQ(player, play, history, isOff) {
  if (!player || !play) return null;
  if (isOff) {
    const c = checkOffensiveBadgeCombo(player.badge, play, false, false);
    const h = getPlayHistoryBonus(history, play);
    if (c.yardBonus > 0) return 'green';
    if (h < -2) return 'red';
    return h < 0 ? 'yellow' : 'yellow';
  }
  const c = checkDefensiveBadgeCombo(player.badge, play, { playType:'RUN', id:'power' });
  return c.yardMod < 0 ? 'green' : 'yellow';
}

function breakdown(op, dp, r, fo, fd) {
  const cov = (dp.baseCoverage || '').replace(/_/g,' ').toUpperCase();
  const L = [];
  if (r.isSack) L.push(dp.sackRateBonus >= .06 ? dp.name+' brought the heat.' : 'Protection collapsed vs '+cov+'.');
  else if (r.isInterception) L.push(cov+' read the route. Picked.');
  else if (r.isIncomplete) L.push(dp.passCompMod < -.03 ? dp.name+' jammed the timing.' : 'Tight window. Couldn\'t connect.');
  else if (r.isTouchdown) L.push('Exploited '+cov+'. End zone.');
  else if (r.yards >= 10) { const cv = op.coverageMods?.[dp.baseCoverage]; L.push(cv && cv.mean >= 2 ? op.name+' eats '+cov+'.' : fo.name+' made it happen.'); }
  else if (r.yards <= 0) L.push(dp.name+' walled it off.');
  if (r.offComboPts > 0) L.push(BADGE_LABELS[fo.badge]+' combo! +'+r.offComboYards+' yds.');
  if (r.defComboPts > 0) L.push('Def combo: '+BADGE_LABELS[fd.badge]+'.');
  if (r.historyBonus > 0) L.push('Play mix bonus +'+r.historyBonus+'.');
  if (r.historyBonus < -2) L.push('Predictable. Penalty.');
  return L.length ? L.join(' ') : op.name+' vs '+dp.name+'.';
}

const TAGS = {
  touchdown:['SIX POINTS.','FIND THE HOUSE.','TOUCHDOWN.'],
  turnover_td:['PICK SIX.','SCOOP AND SCORE.','HOUSE CALL.'],
  interception:['PICKED OFF.','TURNOVER.','BALL DON\'T LIE.'],
  fumble_lost:['STRIPPED.','LOOSE BALL.','TURNOVER.'],
  turnover_on_downs:['STOPPED.','FOURTH DOWN FAILURE.','CHANGE OF POSSESSION.'],
  safety:['SAFETY.','CAUGHT IN THE END ZONE.'],
  score:['NEW DRIVE.','BALL AT THE 50.'],
};
function tag(ev) { const p = TAGS[ev] || TAGS.score; return p[Math.floor(Math.random()*p.length)]; }

const PLAY_DESC = {
  mesh:'Man killer',four_verts:'Stretch deep',shallow_cross:'Quick reliable',y_corner:'Beats Cover 2',
  stick:'Safe short',slant:'Timing route',go_route:'One-on-one deep',bubble_screen:'Fast lateral',
  draw:'Fake pass, run',qb_sneak:'Short yardage push',triple_option:'Give keep pitch',
  midline:'FB dive inside',rocket_toss:'Speed to edge',trap:'Pulling guard',qb_keeper:'QB turns corner',
  power:'Downhill physical',zone_read:'Read the end',pa_post:'Fake run, deep',pa_flat:'Fake dive, dump',
  ir_qb_sneak:'Short yardage push',
  ct_corner_blitz:'All-out pressure',ct_safety_blitz:'Extra sack heat',ct_agap_mug:'A-gap mind games',
  ct_fire_zone:'Send 5, drop 3',ct_db_blitz:'Max pressure',ct_press_man:'Jam at the line',
  ct_edge_crash:'Speed rush edges',ct_zone_blitz_drop:'Show blitz, drop',ct_overload_blitz:'Numbers to one side',
  ct_prevent:'Nothing over top',ir_robber:'Jump the route',ir_bracket:'Double best WR',
  ir_qb_spy:'Shadow the QB',ir_gap_integrity:'Every gap covered',ir_cover2_buc:'Tampa 2 seam',
  ir_mod:'Two-high vanilla',ir_press_man:'Jam at the line',ir_line_stunt:'Pressure no blitz',
  ir_cover6:'Split field cov',ir_blitz_call:'Rare IR blitz',
};

function playerImg(p, team, isOff) {
  var pre = team.abbr.toLowerCase();
  var s = isOff ? 'off' : 'def';
  var last = p.name.split(' ').pop().toLowerCase();
  return '/img/players/' + pre + '-' + s + '-' + p.pos.toLowerCase() + '-' + last + '.png';
}

function tierColor(ovr) { return ovr >= 85 ? '#c8a030' : ovr >= 75 ? '#aaa' : '#CD7F32'; }

/* Build a placed player card for the field strip — uses shared buildMaddenPlayer */
function mkPlayerCardEl(p, team) {
  var tier = p.ovr >= 85 ? 'gold' : p.ovr >= 75 ? 'silver' : 'bronze';
  return buildMaddenPlayer({
    name: p.name, pos: p.pos, ovr: p.ovr,
    num: p.num || '', tier: tier, teamColor: team.accent || '#FF4511'
  }, 80, 150);
}

/* Risk classification matching cardDraft.js */
var HIGH_RISK_IDS = ['four_verts','go_route','y_corner','zero_cov','db_blitz'];
var MED_RISK_IDS = ['mesh','slant','overload','fire_zone','a_gap_mug','edge_crash','pa_post','pa_flat','man_press','zone_drop','triple_option','zone_read'];
function getRisk(id) { return HIGH_RISK_IDS.indexOf(id)>=0?'high':MED_RISK_IDS.indexOf(id)>=0?'med':'low'; }

/* Build a placed play card for the field strip — uses shared buildPlayV1 */
function mkPlayCardEl(play) {
  var cat = {SHORT:'SHORT',QUICK:'QUICK',DEEP:'DEEP',RUN:'RUN',SCREEN:'SCREEN',OPTION:'OPTION',
    BLITZ:'BLITZ',ZONE:'ZONE',PRESSURE:'PRESSURE',HYBRID:'HYBRID'}[play.playType||play.cardType] || 'RUN';
  var isOffPlay = ['SHORT','QUICK','DEEP','RUN','SCREEN','OPTION'].indexOf(cat) >= 0;
  var catColor = isOffPlay ? '#7ACC00' : '#4DA6FF';
  var svg = playSvg(play.id, catColor);
  svg = svg.replace('viewBox="0 0 60 50"','viewBox="4 4 52 44"')
    .replace('width="60" height="50"','width="SVGW" height="SVGH" preserveAspectRatio="xMidYMid meet"')
    .replace(/stroke-width="1.5"/g,'stroke-width="2.5"').replace(/stroke-width="1"/g,'stroke-width="2"')
    .replace(/r="3.5"/g,'r="5"').replace(/r="2.5"/g,'r="4"');
  return buildPlayV1({
    name: play.name, cat: cat, catColor: catColor,
    risk: getRisk(play.id), riskColor: catColor,
    svg: svg, bg: isOffPlay ? '#0A1A06' : '#0A1420'
  }, 80, 150);
}

function resolveRoster(ids, pool) {
  if (!ids || !Array.isArray(ids)) return pool;
  if (ids.length > 0 && typeof ids[0] === 'object') return ids;
  return ids.map(id => pool.find(p => p.id === id)).filter(Boolean);
}

/* ═══════════════════════════════════════════
   BUILDER
   ═══════════════════════════════════════════ */
export function buildGameplay() {
  // v0.21: Map new team IDs to engine CT/IR slots.
  // Human always maps to CT slot, opponent to IR slot.
  const hAbbr = 'CT';
  const hTeam = getTeam(GS.team);
  const oppId = GS.opponent || getOtherTeam(GS.team).id;
  const oTeam = getTeam(oppId);

  // engine
  if (!GS.engine) {
    // Human plays + roster
    var hOffPlays = getOffCards(GS.team);
    var hDefPlays = getDefCards(GS.team);
    var hOffRoster = getOffenseRoster(GS.team);
    var hDefRoster = getDefenseRoster(GS.team);
    // CPU plays + roster
    var cOffPlays = getOffCards(oppId);
    var cDefPlays = getDefCards(oppId);
    var cOffRoster = getOffenseRoster(oppId);
    var cDefRoster = getDefenseRoster(oppId);
    // Resolve rosters from IDs if needed
    var hOR = resolveRoster(GS.offRoster, hOffRoster);
    var hDR = resolveRoster(GS.defRoster, hDefRoster);
    GS.engine = new GameState({
      humanTeam: hAbbr, difficulty: GS.difficulty||'EASY', coachBadge: GS.coachBadge||'SCHEMER',
      // Human = CT slot, Opponent = IR slot
      ctOffHand: hOffPlays.slice(0,5), ctDefHand: hDefPlays.slice(0,5),
      irOffHand: cOffPlays.slice(0,5), irDefHand: cDefPlays.slice(0,5),
      ctOffRoster: hOR, ctDefRoster: hDR,
      irOffRoster: cOffRoster, irDefRoster: cDefRoster,
    });
  }
  const gs = GS.engine;

  // ui state
  let selP = null, selPl = null, selTorch = null;
  let phase = 'play'; // play | player | torch | ready | busy
  let driveSnaps = [];
  let prev2min = gs.twoMinActive;
  var snapCount = 0; // Track snap number for teach tooltips

  // Progressive disclosure
  var isFirstGame = GS.isFirstSeason && (!GS.season || GS.season.currentGame === 0);
  var isFirstSeason = GS.isFirstSeason;

  // Game Day Conditions (v0.21)
  var condEffects = getConditionEffects(GS.gameConditions || { weather: 'clear', field: 'turf', crowd: 'home' });

  // Play Sequence Combos — track play history per drive
  var drivePlayHistory = []; // {cat, playId} entries for current drive

  // TORCH card inventory (v0.21 — 3 slots, persisted in season)
  var torchInventory = (GS.season && GS.season.torchCards) ? GS.season.torchCards.slice() : [];
  var selectedPreSnap = null; // card object selected for current snap

  // Star Heat Check (v0.21)
  var offRoster = getOffenseRoster(GS.team);
  var defRoster = getDefenseRoster(GS.team);
  var offStar = offRoster.find(function(p) { return p.isStar; });
  var defStar = defRoster.find(function(p) { return p.isStar; });
  var offStarHot = false;
  var defStarHot = false;

  function checkStarActivation(res) {
    // Heat Check hidden on first game
    if (isFirstGame) return;
    var r = res.result;
    var isOff = res._preSnap && res._preSnap.possession === hAbbr;
    if (isOff && offStar && res.featuredOff && res.featuredOff.id === offStar.id) {
      if (!offStarHot && (r.yards >= 10 || (r.comboFired))) {
        offStarHot = true;
        // +4 OVR boost applied visually (engine OVR stays — we fake it via combo bonus)
      }
    }
    if (!isOff && defStar && res.featuredDef && res.featuredDef.id === defStar.id) {
      if (!defStarHot && (r.isSack || r.isInterception || r.isFumbleLost)) {
        defStarHot = true;
      }
    }
    // Deactivation
    if (isOff && offStarHot && (r.isSack || r.isInterception || r.isFumbleLost)) {
      offStarHot = false;
    }
    if (!isOff && defStarHot && r.isTouchdown) {
      defStarHot = false;
    }
  }

  function getTorchPoints() {
    return hAbbr === 'CT' ? gs.ctTorchPts : gs.irTorchPts;
  }

  function spendTorchPoints(amount) {
    if (hAbbr === 'CT') gs.ctTorchPts -= amount;
    else gs.irTorchPts -= amount;
  }

  // Trigger shop after a big moment
  function triggerShop(trigger, callback) {
    var pts = getTorchPoints();
    showShop(el, trigger, pts, torchInventory, function(card, newInv, spent) {
      torchInventory = newInv;
      spendTorchPoints(spent);
      // Persist to season state
      if (GS.season) GS.season.torchCards = torchInventory.slice();
      drawBug();
      if (callback) callback();
    }, function() {
      if (callback) callback();
    });
  }

  // dom
  const el = document.createElement('div');
  el.className = 'T';
  const sty = document.createElement('style'); sty.textContent = CSS; el.appendChild(sty);

  // ── SCOREBOARD ──
  const bug = document.createElement('div'); bug.className = 'T-sb'; el.appendChild(bug);
  function drawBug() {
    const s = gs.getSummary();
    const ct = hTeam, ir = oTeam;
    var dn;
    if (conversionMode) {
      dn = conversionMode.choice === '2pt' ? '2PT CNV' : '3PT CNV';
    } else {
      dn = ['','1ST','2ND','3RD','4TH'][s.down]||'';
    }
    const ctHasBall = s.possession === 'CT';
    const possTeam = ctHasBall ? ct : ir;
    const defTeam = ctHasBall ? ir : ct;

    // Ball label
    const ydsToEz = s.yardsToEndzone;
    const ballLabel = ydsToEz <= 50 ? defTeam.abbr + ' ' + ydsToEz : possTeam.abbr + ' ' + (100-ydsToEz);

    // TORCH points for human
    const hTorch = hAbbr === 'CT' ? s.ctTorchPts : s.irTorchPts;

    // Center: half label + snap counter + clock (clock always visible, goes live at 2-min)
    const halfName = s.twoMinActive ? '2-MINUTE DRILL' : (s.half === 1 ? 'FIRST HALF' : 'SECOND HALF');
    const halfColor = s.twoMinActive ? 'color:#e03050' : '';
    const clockText = fmtClock(Math.max(0, s.clockSeconds));
    const clockClass = s.twoMinActive ? 'T-sb-countdown T-sb-countdown-live' : 'T-sb-countdown';
    let centerHTML =
      `<div class="T-sb-half" style="${halfColor}">${halfName}</div>` +
      (s.twoMinActive ? '' : `<div class="T-sb-snap">${s.playsUsed}/20</div>`) +
      `<div class="${clockClass}">${clockText}</div>`;

    // Possession arrow: offset to the side, pointing toward the score
    const ctArrow = ctHasBall ? '<span class="T-sb-pos-arrow T-sb-pos-arrow-l">\u25B6</span>' : '';
    const irArrow = !ctHasBall ? '<span class="T-sb-pos-arrow T-sb-pos-arrow-r">\u25C0</span>' : '';

    // TORCH points — human team side
    const hTorchHTML = `<span class="T-sb-sit-torch">T ${hTorch}</span>`;
    const isHumanCT = hAbbr === 'CT';

    bug.innerHTML =
      `<div class="T-sb-row">` +
        `<div class="T-sb-icon">${ct.icon}</div>` +
        `<div class="T-sb-side${ctHasBall ? ' T-sb-side-glow' : ''}">` +
          `<div class="T-sb-name" style="color:${ct.accent}${ctHasBall ? ';text-shadow:0 0 12px '+ct.accent : ''}">${ct.name}</div>` +
          `<div class="T-sb-score-row">${ctArrow}<span class="T-sb-pts${ctHasBall ? ' T-sb-pts-glow' : ''}">${s.ctScore}</span></div>` +
        `</div>` +
        `<div class="T-sb-center">${centerHTML}</div>` +
        `<div class="T-sb-side${!ctHasBall ? ' T-sb-side-glow' : ''}">` +
          `<div class="T-sb-name" style="color:${ir.accent}${!ctHasBall ? ';text-shadow:0 0 12px '+ir.accent : ''}">${ir.name}</div>` +
          `<div class="T-sb-score-row">${irArrow}<span class="T-sb-pts${!ctHasBall ? ' T-sb-pts-glow' : ''}">${s.irScore}</span></div>` +
        `</div>` +
        `<div class="T-sb-icon">${ir.icon}</div>` +
      `</div>` +
      `<div class="T-sb-sit">` +
        (isHumanCT ? hTorchHTML + '<div class="T-sb-sit-div"></div>' : '') +
        `<div class="T-sb-sit-down">${dn} & ${conversionMode ? 'GOAL' : distLabel(s.distance, s.yardsToEndzone)}</div>` +
        `<div class="T-sb-sit-div"></div>` +
        `<div class="T-sb-sit-ball">BALL ON <span style="color:${possTeam.accent}">${ballLabel}</span></div>` +
        (!isHumanCT ? '<div class="T-sb-sit-div"></div>' + hTorchHTML : '') +
      `</div>`;
  }

  // ── FIELD STRIP ──
  const strip = document.createElement('div'); strip.className = 'T-strip'; el.appendChild(strip);
  function drawField() {
    const s = gs.getSummary();
    const isOff = gs.possession === hAbbr;
    const ct = hTeam, ir = oTeam;
    const homeTeam = getTeam(GS.team);
    const lp = 7 + s.ballPosition * .86;
    const td = s.possession==='CT' ? s.ballPosition+s.distance : s.ballPosition-s.distance;
    const tp = 7 + Math.max(0,Math.min(100,td)) * .86;
    const pc = s.possession==='CT' ? ct.accent : ir.accent;
    // Turf texture
    let h = '<div class="T-field-turf"></div>';
    // Both endzones customized for home team
    var homeColor = homeTeam.color || '#FF4511';
    var homeMascot = hTeam.mascot || hTeam.name;
    h += '<div class="T-ez T-ez-l" style="background:' + homeColor + '"><span class="T-ez-text">' + homeMascot + '</span></div>';
    h += '<div class="T-ez T-ez-r" style="background:' + homeColor + '"><span class="T-ez-text">' + homeMascot + '</span></div>';
    // Home team logo at midfield (large, featured)
    h += '<div class="T-midfield-logo">' + homeTeam.icon + '</div>';
    // Yard lines with numbers at top AND bottom
    var yardNums = {10:'10',20:'20',30:'30',40:'40',50:'50',60:'40',70:'30',80:'20',90:'10'};
    for (let i=5;i<=95;i+=5) {
      var xp = 7+i*.86;
      if (i%10===0) {
        h += '<div class="T-yard" style="left:'+xp+'%"></div>';
        h += '<div class="T-yard-num T-yard-num-top" style="left:'+xp+'%">'+(yardNums[i]||'')+'</div>';
        h += '<div class="T-yard-num T-yard-num-bot" style="left:'+xp+'%">'+(yardNums[i]||'')+'</div>';
      } else {
        h += '<div class="T-yard-5" style="left:'+xp+'%"></div>';
      }
    }
    // Hash marks
    h += '<div class="T-hash" style="top:30%"></div><div class="T-hash" style="top:70%"></div>';
    // LOS and LTG
    h += `<div class="T-los" style="left:${lp}%;background:${pc};box-shadow:0 0 10px ${pc}"></div>`;
    h += `<div class="T-ltg" style="left:${tp}%;border-color:#c8a030"></div>`;

    // Drop zones — empty outlines for unfilled, actual card for filled
    const playLbl = phase === 'play' ? 'DRAG<br><br>PLAY<br><br>HERE' : 'PLAY';
    if (selPl) {
      h += '<div class="T-placed T-placed-play" id="T-placed-play-slot"></div>';
    } else {
      h += '<div class="T-drop T-drop-play' + (phase==='play'?' T-drop-active':'') + '" data-drop="play"><span class="T-drop-lbl">' + playLbl + '</span></div>';
    }

    const playerLbl = phase === 'player' ? 'DRAG<br><br>PLAYER<br><br>HERE' : 'PLAYER';
    if (selP) {
      h += '<div class="T-placed T-placed-player" id="T-placed-player-slot"></div>';
    } else {
      h += '<div class="T-drop T-drop-player' + (phase==='player'?' T-drop-active':'') + '" data-drop="player"><span class="T-drop-lbl">' + playerLbl + '</span></div>';
    }

    if (selTorch) {
      h += '<div class="T-placed T-placed-torch" id="T-placed-torch-slot"></div>';
    } else {
      const hasTorchCards = torchInventory.length > 0;
      const torchLbl = hasTorchCards ? (phase === 'torch' ? 'DRAG<br><br>TORCH<br><br>HERE' : 'TORCH') : 'NO<br><br>TORCH<br><br>CARD';
      h += '<div class="T-drop T-drop-torch' + (phase==='torch'?' T-drop-active':'') + '" data-drop="torch"><span class="T-drop-lbl">' + torchLbl + '</span></div>';
    }

    strip.innerHTML = h;

    // Append actual shared-builder DOM cards into placed slots
    if (selPl) {
      var playSlot = strip.querySelector('#T-placed-play-slot');
      if (playSlot) {
        var playEl = mkPlayCardEl(selPl);
        playEl.style.width = '100%';
        playEl.style.height = '100%';
        playSlot.appendChild(playEl);
      }
    }
    if (selP) {
      var playerSlot = strip.querySelector('#T-placed-player-slot');
      if (playerSlot) {
        var playerEl = mkPlayerCardEl(selP, hTeam);
        playerEl.style.width = '100%';
        playerEl.style.height = '100%';
        playerSlot.appendChild(playerEl);
      }
    }
    if (selTorch) {
      var torchSlot = strip.querySelector('#T-placed-torch-slot');
      if (torchSlot) {
        var tc = TORCH_CARDS.find(function(c) { return c.id === selTorch; });
        if (tc) {
          var torchEl = buildTorchCard(tc, 80, 150);
          torchEl.style.width = '100%';
          torchEl.style.height = '100%';
          torchSlot.appendChild(torchEl);
        }
      }
    }
  }

  // ── PANEL ──
  const panel = document.createElement('div'); panel.className = 'T-panel'; el.appendChild(panel);

  // ── PLAY-BY-PLAY BOOTH (bottom third) ──
  const narr = document.createElement('div'); narr.className = 'T-narr';
  narr.innerHTML = '<div class="T-pbp-idle">...<span class="T-pbp-cursor"></span></div>';
  el.appendChild(narr);

  function setNarr(a, b) {
    narr.innerHTML = '<div class="T-pbp" style="padding:8px 14px"><div class="T-pbp-line T-pbp-live">' + a + '</div>' +
      (b ? '<div class="T-pbp-line" style="color:#554f80;font-size:11px">' + b + '</div>' : '') + '</div>';
    narr.scrollTop = narr.scrollHeight;
  }

  function distLabel(dist, ydsToEz) {
    return (ydsToEz !== undefined ? ydsToEz : gs.getSummary().yardsToEndzone) <= dist ? 'GOAL' : dist;
  }

  function ballSideLabel() {
    const s = gs.getSummary();
    const yds = s.yardsToEndzone;
    const possT = s.possession === 'CT' ? hTeam : oTeam;
    const defT = s.possession === 'CT' ? oTeam : hTeam;
    if (yds <= 50) return defT.abbr + ' ' + yds;
    return possT.abbr + ' ' + (100 - yds);
  }

  function showClashOnField(res) {
    SND.hit();
    var clash = document.createElement('div'); clash.className = 'T-clash';
    var offColor = '#c8a030';
    var defColor = '#e03050';
    var hasTorch = res.offCard || res.defCard;
    var torchCard = null;
    if (hasTorch) {
      var tcId = res.offCard || res.defCard;
      torchCard = TORCH_CARDS.find(function(c) { return c.id === tcId; });
    }

    // Build compact clash cards that fit the field strip
    function clashCard(name, sub, color) {
      return '<div class="T-clash-card" style="border-color:' + color + '">' +
        "<div style=\"padding:8px 10px 6px\">" +
          "<div style=\"font-family:'Teko';font-size:18px;color:#fff;line-height:1\">" + name + "</div>" +
          "<div style=\"font-family:'Rajdhani';font-size:11px;font-weight:bold;color:" + color + ";margin-top:3px;letter-spacing:.5px\">" + sub + "</div>" +
        "</div></div>";
    }

    // Left: offense cards
    var left = document.createElement('div');
    left.className = 'T-clash-side';
    left.innerHTML =
      clashCard(res.offPlay.name, res.offPlay.playType || res.offPlay.cardType, offColor) +
      clashCard(res.featuredOff.name, res.featuredOff.pos + ' \u00b7 OVR ' + res.featuredOff.ovr, offColor);

    // Center: VS (flex child between left and right — guaranteed centered)
    var center = document.createElement('div');
    center.className = 'T-clash-center';
    if (torchCard) {
      var clashTierCol = torchCard.tier === 'GOLD' ? '#FFB800' : torchCard.tier === 'SILVER' ? '#B0C4D4' : '#A0522D';
      center.innerHTML =
        "<div style=\"background:radial-gradient(ellipse at 50% 35%,#1a0800,#0A0804);border:3px solid " + clashTierCol + ";border-radius:6px;padding:6px 10px;box-shadow:0 0 16px rgba(255,69,17,.3)\">" +
          "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:5px;color:" + clashTierCol + ";text-align:center;letter-spacing:1px;opacity:0.7\">" + torchCard.tier + "</div>" +
          "<div style=\"font-family:'Teko';font-weight:700;font-size:13px;color:#fff;line-height:1;text-align:center\">" + torchCard.name + "</div>" +
        "</div>";
    } else {
      center.innerHTML = '<div class="T-clash-vs">VS</div>';
    }

    // Right: defense cards
    var right = document.createElement('div');
    right.className = 'T-clash-side';
    right.innerHTML =
      clashCard(res.defPlay.name, res.defPlay.cardType || 'DEF', defColor) +
      clashCard(res.featuredDef.name, res.featuredDef.pos + ' \u00b7 OVR ' + res.featuredDef.ovr, defColor);

    clash.append(left, center, right);
    strip.appendChild(clash);
  }


  /** Animate torch points flying from commentary to scoreboard, then roll up the total */
  function animateTorchFly(sourceEl, pts) {
    if (!sourceEl) return;
    var srcRect = sourceEl.getBoundingClientRect();
    // Find the torch counter in the scoreboard
    var torchTarget = bug.querySelector('.T-sb-sit-torch');
    if (!torchTarget) return;
    var tgtRect = torchTarget.getBoundingClientRect();

    // Create flying element
    var fly = document.createElement('div');
    fly.className = 'T-torch-fly';
    var isNeg = pts < 0;
    var absPts = Math.abs(pts);
    fly.textContent = 'T ' + (isNeg ? '' : '+') + pts;
    fly.style.left = srcRect.left + 'px';
    fly.style.top = srcRect.top + 'px';
    if (isNeg) fly.style.color = '#e03050';
    document.body.appendChild(fly);

    // Animate to target position
    fly.style.transition = 'all 0.6s cubic-bezier(0.2, 0.8, 0.3, 1)';
    requestAnimationFrame(function() {
      fly.style.left = tgtRect.left + 'px';
      fly.style.top = tgtRect.top + 'px';
      fly.style.opacity = '0.6';
      fly.style.transform = 'scale(0.7)';
    });

    // After fly arrives, roll the number up or down
    setTimeout(function() {
      fly.remove();
      var oldTotal = parseInt(torchTarget.textContent.replace(/[^\-\d]/g, '')) || 0;
      var newTotal = oldTotal + pts;
      var current = oldTotal;
      var step = Math.max(1, Math.ceil(absPts / 15)) * (isNeg ? -1 : 1);
      var rollInterval = setInterval(function() {
        current += step;
        var done = isNeg ? (current <= newTotal) : (current >= newTotal);
        if (done) {
          current = newTotal;
          clearInterval(rollInterval);
          SND.chime();
        } else {
          SND.points();
        }
        torchTarget.innerHTML = 'T ' + current;
        var pulseColor = isNeg ? '#e03050' : '#c8a030';
        torchTarget.style.transform = 'scale(1.15)';
        torchTarget.style.textShadow = '0 0 8px ' + pulseColor;
        torchTarget.style.color = pulseColor;
        setTimeout(function() {
          torchTarget.style.transform = 'scale(1)';
          torchTarget.style.textShadow = '';
          torchTarget.style.color = '#c8a030';
        }, 80);
      }, 60);
    }, 650);
  }

  /** Screen shake */
  function shakeScreen(frames = 4) {
    el.classList.add('T-shaking');
    el.style.animationDuration = (frames * 0.1) + 's';
    setTimeout(function() { el.classList.remove('T-shaking'); }, frames * 100);
  }

  /** Color flash overlay on the field */
  function flashField(color, duration = 600) {
    var flash = document.createElement('div');
    flash.className = 'T-flash';
    flash.style.background = color;
    flash.style.animation = 'T-flash-red ' + (duration/1000) + 's ease-out forwards';
    if (color.indexOf('green') >= 0 || color.indexOf('3df') >= 0 || color.indexOf('cyan') >= 0 || color.indexOf('c0e0') >= 0) {
      flash.style.animation = 'T-flash-green ' + (duration/1000) + 's ease-out forwards';
    }
    strip.appendChild(flash);
    setTimeout(function() { flash.remove(); }, duration);
  }

  /** Impact burst on the field */
  function impactBurst(color) {
    var imp = document.createElement('div');
    imp.className = 'T-impact';
    imp.style.background = color;
    imp.style.boxShadow = '0 0 30px ' + color;
    strip.appendChild(imp);
    setTimeout(function() { imp.remove(); }, 400);
  }

  /** Footballs raining from top of screen */
  function rainFootballs(amount = 12) {
    for (var i = 0; i < amount; i++) {
      var fb = document.createElement('div');
      fb.className = 'T-rain';
      fb.textContent = 'T';
      fb.style.left = (5 + Math.random() * 90) + '%';
      fb.style.top = '-20px';
      fb.style.animationDelay = (Math.random() * 1.5) + 's';
      fb.style.animationDuration = (1.5 + Math.random() * 1) + 's';
      fb.style.fontSize = (12 + Math.floor(Math.random() * 14)) + 'px';
      el.appendChild(fb);
      (function(f) { setTimeout(function() { f.remove(); }, 3500); })(fb);
    }
  }

  /** Big text slam on field */
  function slamText(text, color, duration = 1200) {
    var crack = document.createElement('div');
    crack.className = 'T-crack';
    crack.innerHTML = '<div class="T-crack-text" style="color:' + color + '">' + text + '</div>';
    strip.appendChild(crack);
    setTimeout(function() {
      crack.style.transition = 'opacity .4s';
      crack.style.opacity = '0';
      setTimeout(function() { crack.remove(); }, 400);
    }, duration);
  }

  /** 5-Tier Celebration System */
  function triggerCelebration(tier, r, isDef) {
    if (tier === 1) return;
    
    if (tier === 2) {
      SND.hit();
      flashField(isDef ? 'rgba(48,192,224,0.4)' : 'rgba(61,245,138,0.4)', 400);
      return;
    }

    if (tier === 3) {
      SND.bigPlay();
      shakeScreen(4);
      flashField(isDef ? 'rgba(224,48,80,0.3)' : 'rgba(200,160,48,0.3)', 600);
      impactBurst(isDef ? 'rgba(224,48,80,0.4)' : 'rgba(200,160,48,0.4)');
      return;
    }

    if (tier >= 4) {
      var tDuration = tier === 5 ? 4500 : 3000;
      
      if (tier === 5) {
        var bgFade = document.createElement('div');
        bgFade.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:90;transition:opacity 0.5s;pointer-events:none;';
        el.appendChild(bgFade);
        setTimeout(function() { bgFade.style.opacity = '0'; setTimeout(function() { bgFade.remove(); }, 500); }, tDuration - 1000);
      }

      if (r.isTouchdown) {
        SND.td();
        shakeScreen(6);
        var tColor = isDef ? '#e03050' : '#3df58a';
        flashField(tColor + '88', 800);
        setTimeout(function() { flashField(tColor + '88', 800); }, 400);
        rainFootballs(tier === 5 ? 24 : 16);
        slamText('TOUCHDOWN', tColor, tDuration - 400);
      } else if (r.isInterception) {
        SND.turnover();
        shakeScreen(6);
        flashField('rgba(224,48,80,0.6)', 800);
        impactBurst('rgba(224,48,80,0.8)');
        slamText('INTERCEPTED', '#e03050', tDuration - 400);
      } else if (r.isFumbleLost) {
        SND.turnover();
        shakeScreen(5);
        flashField('rgba(224,96,32,0.6)', 800);
        slamText('FUMBLE', '#e06020', tDuration - 400);
      } else if (r.isSack) {
        SND.sack();
        shakeScreen(8);
        flashField('rgba(224,48,80,0.5)', 600);
        impactBurst('rgba(255,255,255,0.6)');
        slamText('SACKED', '#e03050', tDuration - 400);
      } else { 
        SND.turnover();
        shakeScreen(6);
        flashField('rgba(48,192,224,0.6)', 800);
        slamText('DENIED', '#30c0e0', tDuration - 400);
      }
    }
  }

  /** AI commentary — 4s timeout, returns lines array or null */
  async function fetchAICommentary(res) {
    var r = res.result;
    var pre = res._preSnap || gs.getSummary(); // use pre-snap for situation
    var s = gs.getSummary(); // post-snap for results
    var sides = gs.getCurrentSides();
    var oNames = sides.offPlayers.slice(0,4).map(function(p){return p.name+' '+p.pos+' '+p.ovr;}).join(', ');
    var dNames = sides.defPlayers.slice(0,4).map(function(p){return p.name+' '+p.pos+' '+p.ovr;}).join(', ');
    var possName = pre.possession === 'CT' ? hTeam.name : oTeam.name;
    var defName = pre.possession === 'CT' ? oTeam.name : hTeam.name;
    var isBig = r.isTouchdown || r.isInterception || r.isFumbleLost || r.isSack || r.yards >= 15;
    var lineCount = isBig ? '7-9' : '5-6';

    var distStr = pre.yardsToEndzone <= pre.distance ? 'goal' : pre.distance;
    var prompt = 'You are a legendary college football radio play-by-play announcer. Call this play LIVE. Be CREATIVE — never repeat the same phrasing twice in a game. Vary sentence structure, word choice, and energy.\n\n' +
      'RULES: Write ' + lineCount + ' lines. One sentence each. Build tension from snap to result.\n' +
      '- QB throws/hands off. Skill players catch/run. Defenders tackle.\n' +
      '- Reference players by LAST NAME. Both featured players must appear.\n' +
      '- VARY your language: use different verbs, sentence openers, rhythms each play.\n' +
      '- Routine plays: professional, quick, matter-of-fact. Big plays: CAPS, excitement.\n' +
      '- Include one post-play analysis line. Reference the play call or coverage scheme.\n' +
      '- DO NOT start every call the same way. Mix up: start with the situation, the defense, the crowd, the stakes.\n\n' +
      'SITUATION: ' + possName + ' ' + pre.ctScore + '-' + pre.irScore + ' ' + defName + '\n' +
      pre.down + (pre.down===1?'st':pre.down===2?'nd':pre.down===3?'rd':'th') + ' and ' + distStr + ' at the ' + ballSideLabel() + '\n' +
      'H' + pre.half + ' Snap ' + pre.playsUsed + '/20' + (pre.playsUsed >= 18 ? ' LATE' : '') +
      (pre.yardsToEndzone <= 20 ? ' RED ZONE' : '') + (pre.down >= 3 ? ' MUST CONVERT' : '') + '\n\n' +
      'OFF: ' + oNames + '\nDEF: ' + dNames + '\n' +
      'Featured: ' + res.featuredOff.name + ' (' + res.featuredOff.pos + ') vs ' + res.featuredDef.name + ' (' + res.featuredDef.pos + ')\n' +
      'Play: ' + res.offPlay.name + ' vs ' + res.defPlay.name + '\n' +
      'Result: ' + r.description + ' (' + r.yards + ' yds)' +
      (r.isTouchdown?' TD':'') + (r.isSack?' SACK':'') + (r.isInterception?' INT':'') + (r.isFumbleLost?' FUMBLE':'') + (r.isIncomplete?' INC':'') +
      (r.offComboPts > 0 ? ' Badge combo +' + r.offComboYards + 'yds' : '') + '\n';

    try {
      var ac = new AbortController();
      var to = setTimeout(function() { ac.abort(); }, 4000);
      var resp = await fetch('/api/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ac.signal,
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 350,
          system: 'College football radio PBP announcer. One sentence per line. ' + lineCount + ' lines. CAPS for big moments. Players by last name.',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      clearTimeout(to);
      if (!resp.ok) return null;
      var data = await resp.json();
      var text = data.content && data.content[0] && data.content[0].text;
      if (!text) return null;
      var lines = text.split('\n').filter(function(l) { return l.trim().length > 0; }).slice(0, 12);
      return lines.length >= 3 ? lines : null;
    } catch (e) { return null; }
  }

  function runPlayByPlay(res, onDone) {
    const r = res.result;
    const off = res.featuredOff;
    const def = res.featuredDef;
    const op = res.offPlay;
    const dp = res.defPlay;
    const isPass = op.completionRate !== null;

    // All 4 starters on each side — featured players always mentioned but don't always take the action
    const sides = gs.getCurrentSides();
    const oStarters = sides.offPlayers.slice(0, 4);
    const dStarters = sides.defPlayers.slice(0, 4);
    const qb = oStarters.find(function(p) { return p.pos === 'QB'; }) || oStarters[0];
    // Other offensive skill players (not QB, not featured)
    const otherOff = oStarters.filter(function(p) { return p !== qb && p !== off; });
    const randOff = otherOff.length > 0 ? otherOff[Math.floor(Math.random() * otherOff.length)] : off;
    // Other defenders (not featured)
    const otherDef = dStarters.filter(function(p) { return p !== def; });
    const randDef = otherDef.length > 0 ? otherDef[Math.floor(Math.random() * otherDef.length)] : def;
    // The receiver/runner might be featured or might be another starter
    const receiver = (off.pos === 'QB') ? randOff : off;
    const runner = (off.pos === 'QB') ? randOff : off;
    // The tackler might be featured defender or another defensive starter
    const tackler = Math.random() < 0.6 ? def : randDef;

    showClashOnField(res);

    // Try AI commentary, fall back to templates
    fetchAICommentary(res).then(function(aiLines) {
      renderPBPLines(aiLines || buildTemplateLines(), res, onDone);
    }).catch(function() {
      renderPBPLines(buildTemplateLines(), res, onDone);
    });

    function buildTemplateLines() {
    // Use pre-snap state for situation lines, post-snap for result/context
    const pre = res._preSnap || gs.getSummary();
    const s = gs.getSummary(); // post-snap for context lines
    const possTeamName = pre.possession === 'CT' ? hTeam.name : oTeam.name;
    const defTeamName = pre.possession === 'CT' ? oTeam.name : hTeam.name;
    // Context line — only on significant football moments, not every play
    function contextLine() {
      // Always on scores
      if (r.isTouchdown) {
        var newScore = s.possession === 'CT' ? (s.ctScore) + ' to ' + s.irScore : s.ctScore + ' to ' + (s.irScore);
        return possTeamName + ' scores! It\'s ' + newScore;
      }
      // Always on turnovers
      if (r.isInterception) return 'Turnover! ' + defTeamName + ' takes over';
      if (r.isFumbleLost) return 'Turnover! ' + defTeamName + ' recovers';
      // Facing 4th down — only when the engine has actually moved to 4th down
      if (s.down === 4) return 'Fourth down — they have to go for it';
      // Otherwise only occasionally — significant game situations
      if (s.playsUsed === 20) return 'That\'s play 20 — two-minute warning is next';
      if (s.yardsToEndzone <= 5 && r.yards >= 1) return 'Knocking on the door — inside the five';
      return '';
    }
    // Synonym rotation — pick randomly from arrays for variety
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    var distStr2 = pre.yardsToEndzone <= pre.distance ? 'goal' : pre.distance;
    var downStr2 = ['','First','Second','Third','Fourth'][pre.down] + ' and ' + distStr2;

    const lines = [];
    if (isPass) {
      // Line 1: vary the opener (4 structures from research)
      var openers = [
        op.name + ' is the call — ' + qb.name + ' in the shotgun, ' + off.name + ' split wide',
        downStr2 + ', ' + qb.name + ' under center with ' + off.name + ' key to the play',
        qb.name + ' lines up in the shotgun, ' + op.name + ' dialed up, ' + off.name + ' in the formation',
        possTeamName + ' comes to the line — ' + op.name + ' from the gun, ' + off.name + ' flanked out wide',
      ];
      lines.push(pick(openers));
      // Line 2: defense (vary structure)
      var defSetups = [
        def.name + ' showing ' + dp.name + ' — reading the backfield from ' + def.pos,
        dp.name + ' defense, ' + def.name + ' at ' + def.pos + ', eyes locked on ' + qb.name,
        defTeamName + ' in ' + dp.name + ', ' + def.name + ' creeping up to the line',
        def.name + ' in coverage, ' + dp.name + ' look — daring them to throw',
      ];
      lines.push(pick(defSetups));
      // Line 3: snap (vary the drop back)
      var drops = [
        qb.name + ' takes the snap, drops back, looking...',
        'Snap to ' + qb.name + ', he retreats into the pocket, surveys the field...',
        qb.name + ' catches the snap and settles into the pocket...',
        'Ball is snapped — ' + qb.name + ' with a quick three-step drop...',
      ];
      lines.push(pick(drops));
      if (r.isSack) {
        lines.push(pick(['PRESSURE off the edge!','The rush is coming!','Here comes the blitz!']) + ' ' + off.name + ' can\'t pick it up!');
        lines.push(tackler.name + pick([' is coming FREE!',' gets through untouched!',' beats the blocker!']));
        lines.push(pick(['SACKED!','BROUGHT DOWN!','BURIED!']) + ' ' + tackler.name + ' ' + pick(['levels','buries','drops','plants']) + ' ' + qb.name + '!');
        lines.push(pick(['That '+dp.name+' blitz was perfectly designed','The protection completely collapsed',''+qb.name+' held it too long and paid the price']));
      } else if (r.isIncomplete) {
        lines.push(qb.name + pick([' fires toward ',' throws for ',' targets ']) + receiver.name + pick([' on the sideline',' over the middle',' in the flat']));
        lines.push(pick(['Broken up!','Batted away!','No catch!']) + ' ' + tackler.name + pick([' was stride for stride',' smothered the route',' got a hand in there']));
      } else if (r.isInterception) {
        lines.push(qb.name + pick([' loads up, throws...',' lets it fly...',' fires downfield...']));
        lines.push(pick(['OH!','NO!','WAIT!']) + ' ' + def.name + pick([' jumps the route!',' reads it all the way!',' undercuts the receiver!']));
        lines.push('PICKED OFF! ' + def.name + pick([' saw it from the snap!',' was sitting on that the entire time!',' takes it away!']));
        lines.push(pick(['What a terrible decision by '+qb.name,'That ball was telegraphed',''+def.name+' baited him into that throw']));
        lines.push(pick(['Huge momentum shift right there','That turnover could change everything',''+defTeamName+' gets the ball back']));
      } else if (r.isTouchdown) {
        lines.push(qb.name + pick([' sees ',' spots ',' finds ']) + receiver.name + pick([' breaking free...',' wide open...',' streaking downfield...']));
        lines.push(pick(['He lets it fly!','Throws!','Launches it!']));
        if (s.yardsToEndzone > 20) lines.push(receiver.name + ' at the thirty, the twenty, the TEN...');
        lines.push(receiver.name + pick([' CATCHES IT!',' HAULS IT IN!',' BRINGS IT DOWN!']) + ' TOUCHDOWN!');
        lines.push(tackler.name + pick([' was a step too late',' couldn\'t close in time',' got turned around']) + pick([' — what a throw!',' — perfect ball!','!']));
        lines.push(possTeamName + pick([' finds the end zone!',' puts six on the board!',' scores!']));
      } else if (r.yards >= 15) {
        lines.push(qb.name + pick([' steps up and launches it!',' fires deep!',' airs it out!']));
        lines.push(receiver.name + pick([' goes up and GETS IT!',' hauls it in!',' HIGH-POINTS it!']));
        lines.push(r.yards + pick([' yards! What a play!',' yards on the bomb!',' yards! '+tackler.name+' got burned!']));
      } else if (r.yards >= 8) {
        lines.push(qb.name + pick([' finds ',' hits ',' delivers to ']) + receiver.name + pick([' over the middle',' on the crossing route',' in the seam']) + ', fires!');
        lines.push(pick(['Complete for '+r.yards+'!','Caught! '+r.yards+' yard pickup!','Good throw, '+r.yards+' yards!']) + ' ' + tackler.name + pick([' makes the stop',' brings him down',' cleans it up']));
      } else if (r.yards >= 1) {
        lines.push(qb.name + pick([' dumps it off',' checks down',' flips it']) + ' to ' + receiver.name + pick([' in the flat',' underneath',' for a short gain']));
        lines.push(pick(['Gain of '+r.yards+'.',''+r.yards+' yards, nothing more.','Caught for '+r.yards+'.']) + ' ' + tackler.name + pick([' wraps him up',' makes the tackle',' is right there']));
      } else {
        lines.push(qb.name + pick([' looks for '+receiver.name+' — nothing there',' can\'t find anyone open',' is under pressure, throws it away']));
        lines.push(def.name + pick([' had it blanketed',' took everything away',' locked it down']) + '. ' + pick(['Throwaway','Incomplete','No gain on the play']));
      }
    } else {
      var isOption = op.playType === 'OPTION';
      var isSneakPlay = op.id === 'qb_sneak' || op.id === 'ir_qb_sneak';
      var ballCarrier = isSneakPlay ? qb : runner;
      // Line 1: varied run opener
      lines.push(pick([
        op.name + ' — ' + qb.name + ' under center, ' + ballCarrier.name + ' in the backfield',
        downStr2 + ', ' + possTeamName + ' in heavy personnel, ' + ballCarrier.name + ' the featured back',
        qb.name + ' lines up under center, ' + op.name + ' called for ' + ballCarrier.name,
        possTeamName + ' comes out in ' + op.name + ' — ' + off.name + ' key to the blocking',
      ]));
      // Line 2: defense
      lines.push(pick([
        dp.name + ' — ' + def.name + ' reading the backfield from ' + def.pos,
        def.name + ' at ' + def.pos + ', ' + dp.name + ' — watching the mesh point',
        defTeamName + ' in ' + dp.name + ', ' + def.name + ' stacking the box',
        def.name + ' shows ' + dp.name + ' — keying on the run',
      ]));
      // Line 3: handoff
      if (isOption) {
        lines.push(qb.name + pick([' takes the snap, reads the end...',' gets the snap, eyes the DE...']) + pick([' gives it to ',' feeds ']) + runner.name + '!');
      } else if (isSneakPlay) {
        lines.push(qb.name + pick([' takes the snap and pushes forward...',' sneaks it behind the center...',' dives ahead...']));
      } else {
        lines.push(pick([qb.name+' hands it off to '+ballCarrier.name+'...', 'Straight handoff to '+ballCarrier.name+'...', qb.name+' gives it to '+ballCarrier.name+' up the gut...']));
      }
      if (r.isFumbleLost) {
        lines.push(ballCarrier.name + pick([' takes the hit...',' absorbs contact...',' lowers his shoulder...']));
        lines.push(pick(['THE BALL IS OUT!','HE LOST IT!','IT\'S ON THE GROUND!']));
        lines.push(def.name + pick([' pounces on it!',' comes up with it!',' recovers!']) + ' FUMBLE!');
        lines.push(pick(['Devastating turnover','What a play by the defense',''+ballCarrier.name+' just couldn\'t hold on']));
      } else if (r.isTouchdown) {
        lines.push(ballCarrier.name + pick([' hits the hole!',' breaks through!',' finds a crease!']));
        if (s.yardsToEndzone > 10) {
          lines.push(pick(['Daylight!','He\'s got room!','Into the second level!']) + ' To the twenty, the ten...');
          lines.push(pick(['NOBODY\'S CATCHING HIM!','HE\'S GONE!','SEE YOU LATER!']));
        } else {
          lines.push(pick(['Breaks a tackle!','Sheds the defender!','Powers through!']));
        }
        lines.push('TOUCHDOWN! ' + ballCarrier.name + '!');
        lines.push(possTeamName + pick([' finds the end zone!',' punches it in!',' scores!']));
      } else if (r.yards >= 15) {
        lines.push(ballCarrier.name + pick([' bounces it outside!',' bursts through!',' hits the afterburners!']));
        lines.push(pick(['He\'s in the open field!','Room to run!','Daylight ahead!']));
        lines.push(r.yards + ' yards! ' + tackler.name + pick([' finally drags him down!',' brings him down!',' makes the tackle!']));
      } else if (r.yards >= 8) {
        lines.push(ballCarrier.name + pick([' finds a crease',' hits the hole hard',' sheds a tackler']));
        lines.push(pick(['Good run, '+r.yards+'.','Solid carry for '+r.yards+'.',''+r.yards+' yard pickup.']) + ' ' + tackler.name + pick([' brings him down',' makes the stop',' wraps him up']));
      } else if (r.yards >= 1) {
        lines.push(ballCarrier.name + pick([' pushes ahead',' falls forward',' grinds out a few']));
        lines.push(pick(['Gain of '+r.yards+'.',''+r.yards+' yards.','Short gain.']) + ' ' + tackler.name + pick([' cleans it up',' makes the tackle',' is right there']));
      } else {
        lines.push(def.name + pick([' shoots the gap!',' reads it perfectly!',' is all over it!']));
        lines.push(pick(['STUFFED!','STOPPED!','NO GAIN!']) + ' ' + tackler.name + pick([' had it read',' blew it up',' met him at the line']));
      }
    }

    var ctx = contextLine();
    if (ctx) lines.push(ctx);
    return lines;
    } // end buildTemplateLines

    function renderPBPLines(lines, res, onDone) {
      const r = res.result;
      const pre = res._preSnap || gs.getSummary();
      const s2 = gs.getSummary();
      const isUserDef = (pre.possession !== hAbbr);
      const isGoAhead = (s2.ctScore > s2.irScore && pre.ctScore <= pre.irScore) || (s2.irScore > s2.ctScore && pre.irScore <= pre.ctScore);
      const isClutch = pre.twoMinActive || isGoAhead || (s2.ctScore === s2.irScore);

      let tier = 1;
      if ((r.isTouchdown || r.isInterception || r.isFumbleLost) && isClutch) tier = 5;
      else if (r.isTouchdown || r.isInterception || r.isFumbleLost || (s2.down === 4 && r.yards < s2.distance) || (r.isSack && s2.down >= 3)) tier = 4;
      else if (r.yards >= 13 || (r.isSack && r.yards <= -5)) tier = 3;
      else if (res.gotFirstDown || (r.yards >= 7 && r.yards <= 12)) tier = 2;

      const resColor = r.isTouchdown?'#3df58a' : r.isSack||r.isInterception||r.isFumbleLost?'#e03050' : r.yards>=8?'#3df58a' : r.yards>=1?'#c8a030' : '#554f80';
      const yardLabel = r.isTouchdown?'TOUCHDOWN' : r.isSack?'SACK' : r.isInterception?'INTERCEPTED' : r.isFumbleLost?'FUMBLE LOST' : r.isIncomplete?'INCOMPLETE' : (r.yards>=0?'+':'')+r.yards+' YDS';
      // TORCH points for the USER's team only
      const userOnOff = (gs.possession === hAbbr) ? true : false; // was user on offense for this snap?
      // Note: possession may have flipped on turnovers, so check what it was BEFORE the snap
      var userTorchBase = 0;
      if (userOnOff) {
        // User was on offense — earn offensive points
        if (r.isSack) userTorchBase = -10;
        else if (r.isIncomplete) userTorchBase = -5;
        else if (r.isInterception || r.isFumbleLost) userTorchBase = -25;
        else if (r.yards >= 8) userTorchBase = 30;
        else if (r.yards >= 4) userTorchBase = 10;
        else if (r.yards <= 0) userTorchBase = -10;
        if (r.isTouchdown) userTorchBase += 50;
        if (res.gotFirstDown) userTorchBase += 10;
        userTorchBase += Math.floor(r.offComboPts || 0);
      } else {
        // User was on defense — earn defensive points
        if (r.isSack) userTorchBase = 25;
        else if (r.isInterception || r.isFumbleLost) userTorchBase = 40;
        else if (r.yards <= 0) userTorchBase = 20;
        else if (r.yards <= 3) userTorchBase = 10;
        else if (r.yards >= 15) userTorchBase = -15;
        else if (r.yards >= 8) userTorchBase = -5;
        if (r.isTouchdown) userTorchBase -= 30;
        if (res.gotFirstDown) userTorchBase -= 10;
        if (r.isSafety) userTorchBase += 30;
        userTorchBase += Math.floor(r.defComboPts || 0);
      }
      const torchEarned = userTorchBase;

      narr.innerHTML = '';
      const pbp = document.createElement('div'); pbp.className = 'T-pbp';
      narr.appendChild(pbp);
      let idx = 0;
      const cursor = document.createElement('span'); cursor.className = 'T-pbp-cursor';

      function showNext() {
        if (idx < lines.length) {
          if (cursor.parentNode) cursor.remove();
          pbp.querySelectorAll('.T-pbp-live').forEach(function(el) { 
            el.classList.remove('T-pbp-live');
            el.style.opacity = '0.4';
          });
          const thinkLine = document.createElement('div');
          thinkLine.className = 'T-pbp-line T-pbp-live';
          thinkLine.textContent = lines[idx];
          thinkLine.style.opacity = '1';
          thinkLine.style.color = '#e8e6ff';
          
          if (idx >= 2 && idx < lines.length - 1) {
            if (r.isSack || r.isInterception || r.isFumbleLost) thinkLine.style.color = '#F03030';
            else if (r.yards >= 8 || r.isTouchdown) thinkLine.style.color = '#FFB800';
          }
          if (idx === lines.length - 1 && lines.length > 3) {
            if (r.isTouchdown || r.isInterception || r.isFumbleLost) thinkLine.style.color = r.isTouchdown ? '#4DA6FF' : '#F03030';
          }
          
          thinkLine.appendChild(cursor);
          pbp.appendChild(thinkLine);
          narr.scrollTop = narr.scrollHeight;
          
          var delay = 700;
          if (idx === lines.length - 1) delay = 2500;
          else if (idx >= 2 && idx < lines.length - 2) delay = 1100;
          else if (idx === lines.length - 2) delay = 1800;

          idx++;
          setTimeout(showNext, delay);
        } else {
          if (cursor.parentNode) cursor.remove();
          pbp.querySelectorAll('.T-pbp-live').forEach(function(el) { 
            el.classList.remove('T-pbp-live');
            el.style.opacity = '0.4';
          });
          
          triggerCelebration(tier, r, isUserDef);
          // Result: yards + torch (torch flies to scoreboard)
          const rl = document.createElement('div');
          rl.className = 'T-pbp-result';
          let parts = '<span style="color:' + resColor + '">' + yardLabel + '</span>';
          if (torchEarned !== 0) {
            var tColor = torchEarned > 0 ? '#c8a030' : '#e03050';
            var tSign = torchEarned > 0 ? '+' : '';
            parts += '<span class="T-torch-src" style="color:' + tColor + ';margin-left:10px">T ' + tSign + torchEarned + '</span>';
          }
          rl.innerHTML = parts;
          pbp.appendChild(rl);
          // Big torch popup + fly to scoreboard
          if (torchEarned !== 0) {
            // Big overlay popup
            var bigPop = document.createElement('div');
            bigPop.className = 'T-torch-big';
            bigPop.style.color = torchEarned > 0 ? '#c8a030' : '#e03050';
            bigPop.textContent = 'T ' + (torchEarned > 0 ? '+' : '') + torchEarned;
            document.body.appendChild(bigPop);
            setTimeout(function() { bigPop.remove(); }, 1500);
            // Fly to scoreboard
            setTimeout(function() { animateTorchFly(rl.querySelector('.T-torch-src'), torchEarned); }, 400);
          }
          // TORCH points explanation (user's team only)
          if (torchEarned !== 0) {
            var reasons = [];
            if (userOnOff) {
              // User on offense
              if (r.isTouchdown) reasons.push('Touchdown +50');
              else if (r.isSack) reasons.push('Sacked -10');
              else if (r.isInterception || r.isFumbleLost) reasons.push('Turnover -25');
              else if (r.isIncomplete) reasons.push('Incompletion -5');
              else if (r.yards >= 8) reasons.push('Big gain +30');
              else if (r.yards >= 4) reasons.push('Solid gain +10');
              else if (r.yards <= 0) reasons.push('No gain -10');
              if (r.offComboPts > 0) reasons.push('Badge combo +' + Math.floor(r.offComboPts));
              if (res.gotFirstDown) reasons.push('First down +10');
            } else {
              // User on defense
              if (r.isSack) reasons.push('Sack +25');
              else if (r.isInterception || r.isFumbleLost) reasons.push('Forced turnover +40');
              else if (r.yards <= 0) reasons.push('Stop for no gain +20');
              else if (r.yards <= 3) reasons.push('Short gain +10');
              else if (r.yards >= 15) reasons.push('Explosive allowed -15');
              else if (r.yards >= 8) reasons.push('Big gain allowed -5');
              if (r.isTouchdown) reasons.push('TD allowed -30');
              if (r.isSafety) reasons.push('Safety +30');
              if (r.defComboPts > 0) reasons.push('Badge combo +' + Math.floor(r.defComboPts));
              if (res.gotFirstDown) reasons.push('First down allowed -10');
            }
            if (r.historyBonus > 0) reasons.push('Play mix bonus');
            if (r.historyBonus < -2) reasons.push('Predictable calls');
            var torchExpl = document.createElement('div');
            torchExpl.style.cssText = "font-family:'Rajdhani';font-size:9px;color:#8a86b0;margin-top:4px;line-height:1.4";
            torchExpl.textContent = reasons.join(' \u00b7 ');
            pbp.appendChild(torchExpl);
          }
          // Down & distance
          const s2 = gs.getSummary();
          const dn2 = ['','1ST','2ND','3RD','4TH'][s2.down]||'';
          const dd = document.createElement('div');
          dd.className = 'T-pbp-down';
          if (r.isTouchdown) {
            dd.textContent = 'TOUCHDOWN \u2014 CONVERSION ATTEMPT';
          } else if (r.isInterception || r.isFumbleLost) {
            dd.textContent = 'TURNOVER \u2014 BALL ON ' + ballSideLabel();
          } else {
            dd.textContent = dn2 + ' & ' + distLabel(s2.distance, s2.yardsToEndzone) + ' \u2014 BALL ON ' + ballSideLabel();
          }
          pbp.appendChild(dd);
          // NEXT PLAY button (btn-blitz style)
          var nextBtn = document.createElement('button');
          nextBtn.className = 'btn-blitz';
          nextBtn.style.cssText = 'background:var(--cyan);border-color:var(--cyan);color:#000;font-size:14px;margin-top:10px;box-shadow:6px 6px 0 #006a77, 10px 10px 0 #000;';
          nextBtn.textContent = 'NEXT PLAY \u2192';
          nextBtn.onclick = function() {
            SND.click();
            nextBtn.remove();
            narr.innerHTML = '<div class="T-pbp-idle">...<span class="T-pbp-cursor"></span></div>';
            var clashEl = strip.querySelector('.T-clash');
            if (clashEl) clashEl.remove();
            onDone();
          };
          pbp.appendChild(nextBtn);
          // Extra padding so button isn't clipped by box-shadow
          var spacer = document.createElement('div');
          spacer.style.height = '20px';
          pbp.appendChild(spacer);
          // Scroll after paint to ensure button is visible
          requestAnimationFrame(function() {
            narr.scrollTop = narr.scrollHeight;
          });
        }
      }
      showNext();
    }
  }

  // ── DRAG HANDLING ──
  let dragItem = null; // { type:'player'|'play', data: obj, ghost: el }

  function startDrag(type, data, sourceEl, e) {
    if (phase === 'busy') return;
    var touch = e.touches ? e.touches[0] : e;
    var rect = sourceEl.getBoundingClientRect();
    var ghost = sourceEl.cloneNode(true);
    ghost.className = 'T-drag-ghost';
    ghost.style.width = rect.width + 'px';
    ghost.style.left = (touch.clientX - rect.width/2) + 'px';
    ghost.style.top = (touch.clientY - rect.height/2) + 'px';
    document.body.appendChild(ghost);
    dragItem = { type: type, data: data, ghost: ghost };
    sourceEl.style.opacity = '0.3';
    dragItem._source = sourceEl;
  }

  function moveDrag(e) {
    if (!dragItem) return;
    e.preventDefault();
    var touch = e.touches ? e.touches[0] : e;
    dragItem.ghost.style.left = (touch.clientX - dragItem.ghost.offsetWidth/2) + 'px';
    dragItem.ghost.style.top = (touch.clientY - dragItem.ghost.offsetHeight/2) + 'px';
    // Highlight matching drop zone
    var drops = strip.querySelectorAll('.T-drop');
    drops.forEach(function(dz) {
      var r = dz.getBoundingClientRect();
      var over = touch.clientX >= r.left && touch.clientX <= r.right && touch.clientY >= r.top && touch.clientY <= r.bottom;
      dz.classList.toggle('T-drop-hover', over && dz.dataset.drop === dragItem.type);
    });
  }

  function endDrag(e) {
    if (!dragItem) return;
    var touch = e.changedTouches ? e.changedTouches[0] : e;
    dragItem.ghost.remove();
    if (dragItem._source) dragItem._source.style.opacity = '';
    // Check if dropped on matching zone
    var drops = strip.querySelectorAll('.T-drop');
    drops.forEach(function(dz) {
      dz.classList.remove('T-drop-hover');
      var r = dz.getBoundingClientRect();
      var hit = touch.clientX >= r.left && touch.clientX <= r.right && touch.clientY >= r.top && touch.clientY <= r.bottom;
      if (hit && dz.dataset.drop === dragItem.type) {
        SND.cardSnap();
        if (dragItem.type === 'play') { selPl = dragItem.data; phase = 'player'; }
        else if (dragItem.type === 'player') { selP = dragItem.data; phase = torchInventory.filter(function(c){return c.type==='pre-snap';}).length > 0 ? 'torch' : 'ready'; }
        else if (dragItem.type === 'torch') {
          selectedPreSnap = dragItem.data;
          var tidx = torchInventory.indexOf(dragItem.data);
          if (tidx >= 0) torchInventory.splice(tidx, 1);
          if (GS.season) GS.season.torchCards = torchInventory.slice();
          phase = 'ready';
        }
        drawField();
        drawPanel();
      }
    });
    dragItem = null;
  }

  document.addEventListener('mousemove', moveDrag);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', moveDrag, { passive: false });
  document.addEventListener('touchend', endDrag);

  // ── RENDER PANEL ──
  function drawPanel() {
    panel.innerHTML = '';
    const isOff = gs.possession === hAbbr;
    const sides = gs.getCurrentSides();
    const players = isOff ? sides.offPlayers.slice(0,4) : sides.defPlayers.slice(0,4);
    var plays = isOff ? sides.offHand : sides.defHand;
    // Safety: ensure hand has cards (refill from full pool if empty/short)
    if (!plays || plays.length < 3) {
      var fullPool = isOff ? getOffCards(GS.team) : getDefCards(GS.team);
      plays = fullPool.slice(0, 5);
      if (isOff) sides.offHand = plays; else sides.defHand = plays;
    }
    // Hide panel during play-by-play so commentary sits directly under field
    if (phase === 'busy') { panel.className = 'T-panel T-panel-hidden'; return; }
    panel.className = 'T-panel ' + (isOff ? 'T-panel-off' : 'T-panel-def');

    // 2min check
    if (gs.twoMinActive && !prev2min) { prev2min = true; el.classList.add('T-urgent'); show2MinWarn(); }

    // Side indicator + instruction
    if (phase === 'play' || phase === 'player' || phase === 'torch') {
      var sideBar = document.createElement('div');
      sideBar.style.cssText = "text-align:center;padding:3px 0;font-family:'Teko';font-size:16px;letter-spacing:3px;flex-shrink:0;" +
        (isOff ? 'color:#c8a030;background:linear-gradient(90deg,transparent,rgba(200,160,48,.08),transparent)' : 'color:#30c0e0;background:linear-gradient(90deg,transparent,rgba(48,192,224,.08),transparent)');
      sideBar.textContent = isOff ? 'YOUR OFFENSE' : 'YOUR DEFENSE';
      panel.appendChild(sideBar);
    }
    const inst = document.createElement('div'); inst.className = 'T-inst';
    if (phase === 'play') inst.textContent = isOff ? 'Drag a play onto the field' : 'Drag a scheme onto the field';
    else if (phase === 'player') inst.textContent = 'Drag a player onto the field';
    else if (phase === 'torch') { inst.textContent = 'TORCH CARD \u2014 Play one or skip'; inst.style.color = '#FFB800'; }
    else inst.textContent = '';
    panel.appendChild(inst);

    // Card tray — show one card type at a time based on phase
    const tray = document.createElement('div'); tray.className = 'T-tray';

    if (phase === 'play') {
      plays.forEach(play => {
        const isSel = selPl === play;
        // Adapt game data to shared buildPlayV1 format
        var cat = {SHORT:'SHORT',QUICK:'QUICK',DEEP:'DEEP',RUN:'RUN',SCREEN:'SCREEN',OPTION:'OPTION',
          BLITZ:'BLITZ',ZONE:'ZONE',PRESSURE:'PRESSURE',HYBRID:'HYBRID'}[play.playType||play.cardType] || 'RUN';
        var isOffPlay = ['SHORT','QUICK','DEEP','RUN','SCREEN','OPTION'].indexOf(cat) >= 0;
        var catColor = isOffPlay ? '#7ACC00' : '#4DA6FF';
        // Build SVG for play diagram
        var svg = playSvg(play.id, catColor);
        svg = svg.replace('viewBox="0 0 60 50"','viewBox="4 4 52 44"')
          .replace('width="60" height="50"','width="SVGW" height="SVGH" preserveAspectRatio="xMidYMid meet"')
          .replace(/stroke-width="1.5"/g,'stroke-width="2.5"').replace(/stroke-width="1"/g,'stroke-width="2"')
          .replace(/r="3.5"/g,'r="5"').replace(/r="2.5"/g,'r="4"');
        // Use the actual shared buildPlayV1 builder
        var playCard = buildPlayV1({
          name: play.name, cat: cat, catColor: catColor,
          risk: getRisk(play.id), riskColor: catColor,
          svg: svg, bg: isOffPlay ? '#0A1A06' : '#0A1420'
        }, 80, 150);
        // Wrap in T-card for flex sizing and drag
        const c = document.createElement('div');
        c.className = 'T-card' + (isSel ? ' T-card-sel T-card-gone' : '');
        playCard.style.width = '100%';
        playCard.style.height = '100%';
        c.appendChild(playCard);
        c.onclick = () => { if (phase==='busy') return; SND.select(); selPl = play; phase = 'player'; drawField(); drawPanel(); };
        c.onmousedown = function(e) { startDrag('play', play, c, e); };
        c.ontouchstart = function(e) { startDrag('play', play, c, e); };
        tray.appendChild(c);
      });
    } else if (phase === 'player') {
      players.forEach(p => {
        const isSel = selP === p;
        var isHot = (isOff && offStar && p.id === offStar.id && offStarHot) ||
                    (!isOff && defStar && p.id === defStar.id && defStarHot);
        // Use the actual shared buildMaddenPlayer builder
        var playerCard = buildMaddenPlayer({
          name: p.name, pos: p.pos, ovr: p.ovr,
          num: p.num || '', badge: p.badge, isStar: p.isStar,
          teamColor: hTeam.colors ? hTeam.colors.primary : (hTeam.accent || '#FF4511')
        }, 80, 150);
        // Wrap in T-card for flex sizing and drag
        const c = document.createElement('div');
        c.className = 'T-card' + (isSel ? ' T-card-sel T-card-gone' : '') + (p.injured ? ' T-card-hurt' : '');
        // Star Heat Check: flame border when On Fire
        if (isHot) {
          c.style.cssText += 'border:2px solid #FF4511 !important;box-shadow:0 0 12px rgba(255,69,17,0.5),0 0 24px rgba(255,69,17,0.2) !important;animation:T-urgent-border 1s ease-in-out infinite !important;';
        }
        playerCard.style.width = '100%';
        playerCard.style.height = '100%';
        c.appendChild(playerCard);
        c.onclick = () => {
          if (p.injured || phase==='busy') return; SND.select(); selP = p;
          phase = torchInventory.filter(function(c){return c.type==='pre-snap';}).length > 0 ? 'torch' : 'ready';
          drawField(); drawPanel();
        };
        c.onmousedown = function(e) { if (!p.injured) startDrag('player', p, c, e); };
        c.ontouchstart = function(e) { if (!p.injured) startDrag('player', p, c, e); };
        tray.appendChild(c);
      });
    } else if (phase === 'torch') {
      // Show TORCH cards from inventory (v0.21 — max 3 slots)
      var preSnapCards = torchInventory.filter(function(c) { return c.type === 'pre-snap'; });
      if (preSnapCards.length === 0) {
        // No pre-snap cards — skip torch phase
        phase = 'ready';
        drawField(); drawPanel();
        return;
      }
      preSnapCards.forEach(function(tc, i) {
        var c = buildTorchCard(tc);
        c.className += ' T-card';
        c.style.flex = '1';
        c.style.height = '150px';
        c.style.cursor = 'grab';
        c.style.touchAction = 'none';
        c.onclick = function() {
          SND.click();
          selectedPreSnap = tc;
          // Remove from inventory (single-use)
          var idx = torchInventory.indexOf(tc);
          if (idx >= 0) torchInventory.splice(idx, 1);
          if (GS.season) GS.season.torchCards = torchInventory.slice();
          phase = 'ready';
          drawField(); drawPanel();
        };
        tray.appendChild(c);
      });
      // Skip button
      var skipBtn = document.createElement('div');
      skipBtn.className = 'T-card';
      skipBtn.style.cssText = 'border:2px dashed #554f8044;display:flex;align-items:center;justify-content:center;cursor:pointer;';
      skipBtn.innerHTML = "<div style=\"font-family:'Rajdhani';font-size:7px;color:#554f80;text-align:center\">SKIP<br>TORCH</div>";
      skipBtn.onclick = function() { SND.click(); selectedPreSnap = null; phase = 'ready'; drawField(); drawPanel(); };
      tray.appendChild(skipBtn);
    }
    panel.appendChild(tray);

    // ── TEACH TOOLTIPS (first game only) ──
    if (isFirstGame && snapCount === 0) {
      if (phase === 'play') {
        showTooltip(el, 'first_play', 'Tap a play card to call it.', { delay: 600 });
      } else if (phase === 'player') {
        showTooltip(el, 'first_player', 'Now pick who runs it.', { delay: 400 });
      } else if (phase === 'ready') {
        showTooltip(el, 'first_snap', 'Hit SNAP!', { delay: 400 });
      }
    }

    // Snap bar — only appears when both cards placed
    if (phase === 'ready') {
      const sz = document.createElement('div'); sz.className = 'T-snap';

      if (gs.twoMinActive && isOff) {
        const btns = document.createElement('div'); btns.className = 'T-2btns';
        const spk = document.createElement('button'); spk.className = 'T-2btn T-spike'; spk.textContent = 'SPIKE';
        spk.onclick = () => { SND.click(); gs.spike(); selP=null;selPl=null;phase='play'; drawBug();drawField(); setNarr('Ball spiked.',fmtClock(Math.max(0,gs.clockSeconds))+' left'); if(!checkEnd()) drawPanel(); };
        btns.appendChild(spk);
        const hS = hAbbr==='CT'?gs.ctScore:gs.irScore, cS = hAbbr==='CT'?gs.irScore:gs.ctScore;
        if (hS > cS) {
          const kn = document.createElement('button'); kn.className = 'T-2btn T-kneel'; kn.textContent = 'KNEEL';
          kn.onclick = () => { SND.click(); gs.kneel(); selP=null;selPl=null;phase='play'; drawBug();drawField(); setNarr('QB kneels.',fmtClock(Math.max(0,gs.clockSeconds))+' left'); if(!checkEnd()) drawPanel(); };
          btns.appendChild(kn);
        }
        sz.appendChild(btns);
      }

      const go = document.createElement('button');
      go.className = 'btn-blitz';
      go.style.cssText = 'background:var(--a-gold);border-color:var(--a-gold);color:#000;font-size:16px;animation:T-pulse 1.8s ease-in-out infinite;';
      go.textContent = conversionMode ? 'ATTEMPT' : 'SNAP';
      go.onclick = conversionMode ? () => { SND.snap(); doConversionSnap(); } : () => { SND.snap(); doSnap(); };
      sz.appendChild(go);
      panel.appendChild(sz);
    }
  }

  // ── SNAP ──
  function doSnap() {
    phase = 'busy';
    const isOff = gs.possession === hAbbr;
    const prevPoss = gs.possession;
    const preSnap = gs.getSummary();
    const offCard = isOff ? selTorch : null;
    const defCard = isOff ? null : selTorch;
    var playedPlay = selPl;
    const res = isOff ? gs.executeSnap(selPl, selP, null, null, offCard, defCard) : gs.executeSnap(null, null, selPl, selP, offCard, defCard);

    // Apply Game Day Condition modifiers to result
    if (res && res.result) {
      var r = res.result;
      if (condEffects.completionMod && r.isIncomplete === false && !r.isSack) {
        // Rain: increased chance of incompletion (already resolved, so we adjust yards down)
      }
      // Run mean modifier (snow, grass, mud)
      var runMod = (condEffects.runMeanMod || 0) + (condEffects.allMeanMod || 0);
      var passMod = condEffects.allMeanMod || 0;
      if (r.yards !== undefined && !r.isTouchdown && !r.isSack && !r.isInterception) {
        var isRun = playedPlay && (playedPlay.type === 'run' || playedPlay.completionRate === undefined || playedPlay.completionRate === 1);
        r.yards += isRun ? runMod : passMod;
        if (r.yards < 0 && !r.isSack) r.yards = 0;
      }
      // Wind: cap deep passes
      if (condEffects.deepCapYards && r.yards > condEffects.deepCapYards) {
        var isDeep = playedPlay && (playedPlay.playType === 'DEEP' || (playedPlay.cat && playedPlay.cat.indexOf('DEEP') >= 0));
        if (isDeep) r.yards = condEffects.deepCapYards;
      }
    }

    // Check play sequence combos
    var playCat = playedPlay ? (playedPlay.cat || playedPlay.playType || 'RUN') : 'RUN';
    var lastDefCat = res.defPlay ? (res.defPlay.cat || res.defPlay.cardType || '') : '';
    var firedCombos = checkPlayCombos(drivePlayHistory, playCat, lastDefCat, playedPlay ? playedPlay.id : null);
    drivePlayHistory.push({ cat: playCat, playId: playedPlay ? playedPlay.id : null });

    // Apply combo yard bonuses
    var comboBonus = 0;
    var comboNames = [];
    if (firedCombos.length > 0 && res && res.result) {
      firedCombos.forEach(function(combo) {
        comboBonus += combo.yardBonus;
        comboNames.push(combo.name);
      });
      res.result.yards += comboBonus;
      res._combos = comboNames;
    }

    driveSnaps.push(res);
    var sides = gs.getCurrentSides();
    var teamId = GS.team;
    if (isOff) {
      cycleCard(playedPlay, sides.offHand, getOffCards(teamId));
    } else {
      cycleCard(playedPlay, sides.defHand, getDefCards(teamId));
    }
    selP = null; selPl = null; selTorch = null;
    drawField(); drawPanel();
    res._preSnap = preSnap;

    // Check star activation
    var wasOffHot = offStarHot, wasDefHot = defStarHot;
    checkStarActivation(res);

    run3BeatSnap(res, prevPoss, wasOffHot, wasDefHot);
  }

  // ── 3-BEAT SNAP RESULT (Amendment 2 Section 7) ──
  function run3BeatSnap(res, prevPoss, wasOffHot, wasDefHot) {
    var r = res.result;
    var isGood = r.yards >= 4 || r.isTouchdown;
    var isBad = r.isSack || r.isInterception || r.isFumbleLost || r.isSafety;
    var isExplosive = r.yards >= 15;
    var isTD = r.isTouchdown;

    // Juice level
    var shakeIntensity = isTD ? 5 : isExplosive ? 4 : isBad ? 4 : (isGood ? 2 : 0);
    var flashColor = isTD ? '#FFB800' : isGood ? '#3df58a' : isBad ? '#e03050' : 'transparent';
    var resultColor = isTD ? '#FFB800' : isGood ? '#3df58a' : isBad ? '#e03050' : '#c8a030';
    var resultText = isTD ? 'TOUCHDOWN' : r.isSack ? 'SACK' : r.isInterception ? 'INTERCEPTED' : r.isFumbleLost ? 'FUMBLE' : r.isIncomplete ? 'INCOMPLETE' : r.isSafety ? 'SAFETY' : (r.yards >= 0 ? '+' : '') + r.yards + ' YDS';

    // Force-hide panel during animation
    panel.style.display = 'none';

    // ════════════════════════════════════════════
    // BEAT 1: ANTICIPATION (1200ms)
    // Cards fly toward center SLOWLY. Dim over 400ms. Hold 500ms silence.
    // ════════════════════════════════════════════
    var dim = document.createElement('div');
    dim.className = 'T-beat-dim';
    dim.style.opacity = '0';
    dim.style.transition = 'opacity 0.4s';
    el.appendChild(dim);
    requestAnimationFrame(function() { dim.style.opacity = '1'; });

    var cards = document.createElement('div');
    cards.className = 'T-beat-cards';
    // Slow fly-in: 700ms ease-out (was 400ms)
    cards.innerHTML =
      '<div class="T-beat-card" style="background:rgba(200,160,48,0.15);border:2px solid #c8a03088;animation:T-beat-fly-off 0.7s ease-out both;padding:12px 16px;">' +
        "<div style=\"font-family:'Teko';font-size:20px;color:#fff;line-height:1;letter-spacing:1px\">" + res.offPlay.name + '</div>' +
        "<div style=\"font-family:'Rajdhani';font-size:11px;color:#c8a030;margin-top:4px\">" + res.featuredOff.name + ' \u00b7 ' + res.featuredOff.pos + '</div></div>' +
      '<div class="T-beat-card" style="background:rgba(224,48,80,0.15);border:2px solid #e0305088;animation:T-beat-fly-def 0.7s ease-out both;padding:12px 16px;">' +
        "<div style=\"font-family:'Teko';font-size:20px;color:#fff;line-height:1;letter-spacing:1px\">" + res.defPlay.name + '</div>' +
        "<div style=\"font-family:'Rajdhani';font-size:11px;color:#e03050;margin-top:4px\">" + res.featuredDef.name + ' \u00b7 ' + res.featuredDef.pos + '</div></div>';
    el.appendChild(cards);

    // Low tension sound at start
    SND.cardSnap();

    // ════════════════════════════════════════════
    // BEAT 2: IMPACT / HITSTOP (starts at 1200ms, lasts 1200ms)
    // Cards freeze visible for 800ms. Player reads matchup.
    // Then: shake + flash + 300ms silence + result sound.
    // ════════════════════════════════════════════
    setTimeout(function() {
      // Hitstop: cards are already visible and readable from beat 1.
      // They stay put for 800ms. Nothing moves. Player reads the matchup.

      // After 800ms of frozen display: impact effects
      setTimeout(function() {
        // Screen shake
        if (shakeIntensity > 0) {
          el.style.animation = 'T-beat-shake 0.2s ease-out';
          setTimeout(function() { el.style.animation = ''; }, 250);
        }

        // Color flash (holds longer for TDs)
        if (flashColor !== 'transparent') {
          var flash = document.createElement('div');
          flash.className = 'T-beat-flash';
          flash.style.background = flashColor;
          flash.style.animationDuration = isTD ? '0.5s' : '0.3s';
          el.appendChild(flash);
          setTimeout(function() { flash.remove(); }, isTD ? 500 : 300);
        }

        // Haptic
        if (navigator.vibrate && shakeIntensity > 0) try { navigator.vibrate(shakeIntensity > 3 ? 100 : 40); } catch(e) {}

        // 300ms silence, then result sound
        setTimeout(function() {
          if (isTD) SND.td();
          else if (isBad) SND.turnover();
          else if (isExplosive) SND.bigPlay();
          else SND.snap();
        }, 300);
      }, 800); // 800ms hitstop freeze
    }, 1200); // Beat 2 starts at 1200ms

    // ════════════════════════════════════════════
    // BEAT 3: AFTERMATH (starts at 2400ms)
    // Result text scales in over 400ms, stays 2+ seconds.
    // Commentary appears 800ms AFTER result text.
    // TDs: 5000ms. Big plays: 3500ms. Routine: 2000ms.
    // ════════════════════════════════════════════
    var beat3Start = 2400;
    var aftermathDur = isTD ? 5000 : (isExplosive || isBad) ? 3500 : 2000;
    snapCount++;

    setTimeout(function() {
      // Remove anticipation cards
      cards.remove();

      // Result text — scales in over 400ms
      var resultEl = document.createElement('div');
      resultEl.className = 'T-beat-result';
      resultEl.style.opacity = '0';
      // Combo flash text (if any combos fired)
      var comboHTML = '';
      if (res._combos && res._combos.length > 0) {
        comboHTML = '<div style="font-family:\'Teko\';font-weight:700;font-size:18px;color:#FFB800;letter-spacing:2px;margin-top:6px;text-shadow:0 0 12px rgba(255,184,0,0.5);animation:T-beat-yds 0.4s ease-out 0.3s both;opacity:0">' + res._combos.join(' + ') + '</div>';
      }
      resultEl.innerHTML =
        '<div class="T-beat-yds" style="color:' + resultColor + ';font-size:' + (isTD ? '52px' : '42px') + '">' + resultText + '</div>' +
        comboHTML +
        '<div class="T-beat-label" style="color:' + resultColor + ';opacity:0;transition:opacity 0.3s">' + res.offPlay.name + ' vs ' + res.defPlay.name + '</div>';
      el.appendChild(resultEl);

      // Scale in the result
      requestAnimationFrame(function() {
        resultEl.style.opacity = '1';
        resultEl.style.transition = 'opacity 0.4s';
      });

      // Matchup label fades in 400ms after result
      setTimeout(function() {
        var label = resultEl.querySelector('.T-beat-label');
        if (label) label.style.opacity = '1';
      }, 400);

      // Update board state
      drawBug();
      drawField();

      // Commentary appears 800ms AFTER result text (not simultaneously)
      setTimeout(function() {
        var bd = breakdown(res.offPlay, res.defPlay, r, res.featuredOff, res.featuredDef);
        setNarr(r.description, bd);

        // Teach tooltips for first game
        if (isFirstGame) {
          if (r.comboFired && snapCount <= 4) {
            showTooltip(el, 'first_combo', 'Match the right player with the right play for bonus yards!', { delay: 800 });
          }
          if (isTD) {
            showTooltip(el, 'first_td', 'TORCH points are your score \u2014 and your wallet.', { delay: 1500 });
          }
        }
      }, 800);

      // Dim fades out slowly
      dim.style.opacity = '0';
      setTimeout(function() { dim.remove(); }, 500);

      // Clear result and proceed after full aftermath duration
      setTimeout(function() {
        resultEl.style.opacity = '0';
        resultEl.style.transition = 'opacity 0.4s';
        setTimeout(function() { resultEl.remove(); }, 400);

        // Shop trigger check
        var shopTrigger = null;
        if (!gs.gameOver) {
          var isHumanPoss = prevPoss === hAbbr;
          if (res.gameEvent === 'touchdown' && isHumanPoss) shopTrigger = 'touchdown';
          else if ((r.isInterception || r.isFumbleLost) && !isHumanPoss) shopTrigger = 'turnover';
          else if (res.gameEvent === 'turnover_on_downs' && !isHumanPoss) shopTrigger = 'fourthDownStop';
          else if ((!wasOffHot && offStarHot) || (!wasDefHot && defStarHot)) shopTrigger = 'starActivation';
        }

        function afterShop() {
          if (res.gameEvent === 'touchdown') { showConv(res.scoringTeam); return; }
          if (posChanged(res.gameEvent, prevPoss)) {
            showPossCut(res.gameEvent, function() { showDrive(driveSnaps, prevPoss, function() { driveSnaps=[]; drivePlayHistory=[]; if(!checkEnd()) nextSnap(); }); });
          } else { if(!checkEnd()) nextSnap(); }
        }

        if (shopTrigger) {
          if (isFirstGame) {
            showTooltip(el, 'first_shop', 'Spend points on TORCH cards for an edge. Buy it or pass!', { delay: 200 });
          }
          triggerShop(shopTrigger, afterShop);
        } else {
          afterShop();
        }
      }, aftermathDur);
    }, beat3Start);
  }

  /** Cycle a played card — return it to deck, draw a replacement */
  function cycleCard(playedCard, hand, fullPool) {
    if (!playedCard || !hand || !fullPool) return;
    var idx = hand.indexOf(playedCard);
    if (idx === -1) return;
    // Cards NOT in hand
    var available = fullPool.filter(function(c) { return hand.indexOf(c) === -1; });
    if (available.length > 0) {
      var replacement = available[Math.floor(Math.random() * available.length)];
      hand[idx] = replacement;
    }
  }

  function nextSnap() {
    phase = 'play';
    selP = null; selPl = null; selTorch = null; selectedPreSnap = null;
    panel.style.display = ''; // Restore panel visibility
    drawBug(); drawField(); drawPanel();
    // Human always picks cards — on offense they pick offPlay+player,
    // on defense they pick defPlay+player. doSnap() passes them in the right slots.
    // No auto-CPU here — the human taps SNAP every time.
  }

  // ── RESULT OVERLAY ──
  function showResult(res, done) {
    const r = res.result;
    const col = r.isTouchdown?'#3df58a' : r.isSack||r.isInterception||r.isFumbleLost?'#e03050' : r.yards>=8?'#3df58a' : r.yards>=1?'#c8a030' : '#554f80';
    const txt = r.isTouchdown?'TOUCHDOWN' : r.isSack?'SACK' : r.isInterception?'INTERCEPTED' : r.isFumbleLost?'FUMBLE' : r.isIncomplete?'INCOMPLETE' : r.isSafety?'SAFETY' : (r.yards>=0?'+':'')+r.yards+' YDS';
    const bd = breakdown(res.offPlay, res.defPlay, r, res.featuredOff, res.featuredDef);
    setNarr(r.description, bd);

    const ov = document.createElement('div'); ov.className = 'T-ov T-ov-dark T-ov-result';
    ov.style.cssText = 'opacity:0;transition:opacity .25s';
    ov.innerHTML =
      `<div class="T-r-play">${res.offPlay.name} vs ${res.defPlay.name}</div>`+
      `<div class="T-r-big" style="color:${col}">${txt}</div>`+
      `<div class="T-r-sub">${bd}</div>`;
    el.appendChild(ov);
    requestAnimationFrame(() => ov.style.opacity='1');
    setTimeout(() => { ov.style.opacity='0'; setTimeout(() => { ov.remove(); done(); }, 250); }, 2400);
  }

  // ── POSSESSION CUT ──
  function posChanged(ev, prev) {
    if (ev && ['interception','fumble_lost','turnover_on_downs','safety','turnover_td'].includes(ev)) return true;
    return gs.possession !== prev;
  }

  function showPossCut(ev, done) {
    const s = gs.getSummary();
    const nt = s.possession==='CT' ? hTeam : oTeam;
    const ov = document.createElement('div'); ov.className = 'T-ov T-ov-black T-ov-poss';
    ov.style.cssText = 'opacity:0;transition:opacity .25s';
    ov.innerHTML =
      `<div class="T-poss-score">${s.ctScore} \u2013 ${s.irScore}</div>`+
      `<div class="T-poss-who" style="color:${nt.accent}">${nt.name} BALL</div>`+
      `<div class="T-poss-tag">${tag(ev)}</div>`;
    el.appendChild(ov);
    requestAnimationFrame(() => ov.style.opacity='1');
    setTimeout(() => { ov.style.opacity='0'; setTimeout(() => { ov.remove(); done(); }, 250); }, 2000);
  }

  // ── DRIVE SUMMARY ──
  function showDrive(log, poss, done) {
    if (log.length < 2) { done(); return; }
    const yds = log.reduce((s,r) => s + (r.result.yards||0), 0);
    const td = log.some(r => r.result.isTouchdown);
    const to = log.some(r => r.result.isInterception || r.result.isFumbleLost);
    const dt = poss==='CT' ? hTeam : oTeam;

    panel.innerHTML = '';
    const d = document.createElement('div'); d.className = 'T-drv';
    d.style.cssText = 'opacity:0;transition:opacity .3s';
    d.innerHTML =
      `<div class="T-drv-hdr" style="color:${dt.accent}">${dt.abbr} DRIVE \u2014 ${log.length} PLAYS, ${yds} YDS</div>`+
      (td ? '<div class="T-drv-stat" style="color:#3df58a">TOUCHDOWN</div>' : '')+
      (to ? '<div class="T-drv-stat" style="color:#e03050">TURNOVER</div>' : '')+
      (!td && !to ? '<div class="T-drv-stat">Drive over.</div>' : '');
    panel.appendChild(d);
    requestAnimationFrame(() => d.style.opacity='1');
    setTimeout(done, 1800);
  }

  // ── CONVERSION ──
  var conversionMode = null; // null or {choice:'2pt'|'3pt', team:'CT'|'IR'}

  function showConv(team) {
    panel.style.display = ''; // Restore panel for conversion UI
    const isH = team === hAbbr;
    if (!isH) {
      gs.handleConversion('xp'); drawBug();
      setNarr('Extra point is good.', '+1 point');
      showPossCut('score', () => { showDrive(driveSnaps, team, () => { driveSnaps=[]; drivePlayHistory=[]; if(!checkEnd()) nextSnap(); }); });
      return;
    }
    // Show conversion choice in the panel
    panel.className = 'T-panel T-panel-off';
    panel.innerHTML = '';
    var inst = document.createElement('div'); inst.className = 'T-inst';
    inst.style.color = '#3df58a';
    inst.textContent = 'TOUCHDOWN! CHOOSE CONVERSION';
    panel.appendChild(inst);

    var w = document.createElement('div');
    w.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:8px;';

    [{id:'xp',lbl:'EXTRA POINT',sub:'+1 (automatic)',col:'#3df58a'},
     {id:'2pt',lbl:'2-POINT CONVERSION',sub:'+2 from the 5 yard line',col:'#c8a030'},
     {id:'3pt',lbl:'3-POINT CONVERSION',sub:'+3 from the 10 yard line',col:'#e03050'}].forEach(function(c) {
      var b = document.createElement('button');
      b.className = 'btn-blitz';
      b.style.cssText = 'background:transparent;color:' + c.col + ';border-color:' + c.col + ';font-size:11px;box-shadow:4px 4px 0 ' + c.col + '44, 6px 6px 0 #000;';
      b.innerHTML = c.lbl + '<br><span style="font-size:7px;color:#554f80">' + c.sub + '</span>';
      b.onclick = function() {
        SND.snap();
        if (c.id === 'xp') {
          gs.handleConversion('xp'); drawBug();
          setNarr('Extra point is GOOD!', '+1 point');
          showPossCut('score', function() { showDrive(driveSnaps, team, function() { driveSnaps=[]; drivePlayHistory=[]; if(!checkEnd()) nextSnap(); }); });
        } else {
          // Enter card selection for 2pt/3pt conversion
          conversionMode = { choice: c.id, team: team };
          setNarr(c.lbl + ' attempt', 'Select your play, player, and snap');
          phase = 'play';
          drawField(); drawPanel();
        }
      };
      w.appendChild(b);
    });
    panel.appendChild(w);
  }

  function doConversionSnap() {
    phase = 'busy';
    var cm = conversionMode;
    var offPlay = selPl;
    var featuredOff = selP;
    var convResult = gs.handleConversion(cm.choice, offPlay, featuredOff);
    conversionMode = null;
    selP = null; selPl = null; selTorch = null;

    // Build a fake result object for the play-by-play system
    var fakeRes = {
      offPlay: offPlay || { name: 'CONVERSION', playType: 'SHORT', completionRate: 0.5, coverageMods: {} },
      defPlay: { name: 'GOAL LINE', cardType: 'ZONE', baseCoverage: 'cover_1' },
      featuredOff: featuredOff || { name: 'QB', pos: 'QB', ovr: 78, badge: '' },
      featuredDef: { name: 'Defense', pos: 'LB', ovr: 78, badge: '' },
      result: {
        yards: convResult.success ? (cm.choice === '2pt' ? 5 : 10) : 0,
        isTouchdown: convResult.success,
        isIncomplete: !convResult.success && offPlay && offPlay.completionRate !== null,
        isSack: false, isInterception: false, isFumbleLost: false, isSafety: false,
        offComboPts: 0, defComboPts: 0, historyBonus: 0,
        description: convResult.success ? cm.choice.toUpperCase() + ' conversion is GOOD!' : cm.choice.toUpperCase() + ' conversion FAILED'
      },
      gotFirstDown: false,
      _preSnap: {
        down: 1, distance: cm.choice === '2pt' ? 5 : 10,
        yardsToEndzone: cm.choice === '2pt' ? 5 : 10,
        possession: cm.team, half: gs.half, playsUsed: gs.playsUsed,
        ctScore: cm.team === 'CT' ? gs.ctScore - (convResult.success ? convResult.points : 0) : gs.ctScore,
        irScore: cm.team === 'IR' ? gs.irScore - (convResult.success ? convResult.points : 0) : gs.irScore,
      }
    };

    // Get actual defender from opponent roster
    var defSides = gs.getCurrentSides();
    if (defSides.defPlayers && defSides.defPlayers.length > 0) {
      fakeRes.featuredDef = defSides.defPlayers[Math.floor(Math.random() * Math.min(4, defSides.defPlayers.length))];
    }

    drawField(); drawPanel();

    // Show clash and run play-by-play like a normal snap
    showClashOnField(fakeRes);
    runPlayByPlay(fakeRes, function() {
      drawBug(); drawField();
      showPossCut('score', function() { showDrive(driveSnaps, cm.team, function() { driveSnaps=[]; drivePlayHistory=[]; if(!checkEnd()) nextSnap(); }); });
    });
  }

  // ── 2-MIN WARNING (dramatic overlay) ──
  function show2MinWarn() {
    shakeScreen();
    flashField('rgba(224,48,80,.3)');
    const ov = document.createElement('div'); ov.className = 'T-ov T-ov-black T-ov-poss';
    ov.style.cssText = 'opacity:0;transition:opacity .25s';
    ov.innerHTML =
      '<div class="T-poss-score" style="color:#e03050;font-size:28px">2:00</div>'+
      '<div class="T-poss-who" style="color:#e03050;font-size:24px;letter-spacing:4px">2-MINUTE WARNING</div>'+
      "<div class=\"T-poss-tag\" style=\"color:#e03050;opacity:.7\">The clock is live. SPIKE and KNEEL available.</div>"+
      "<div style=\"font-family:'Rajdhani';font-size:9px;color:#554f80;margin-top:8px\">Every second counts from here.</div>";
    el.appendChild(ov);
    requestAnimationFrame(() => ov.style.opacity='1');
    setTimeout(() => { ov.style.opacity='0'; setTimeout(() => ov.remove(), 250); }, 2500);
  }

  // ── COIN TOSS OVERLAY ──
  function showCoinToss(onDone) {
    var pool = TORCH_CARDS.filter(function(c) { return c.tier !== 'GOLD'; });
    var shuffled = pool.slice().sort(function() { return Math.random() - 0.5; });
    var offers = shuffled.slice(0, 3);
    var humanWins = Math.random() < 0.5;

    var ov = document.createElement('div');
    ov.className = 'T-ov T-ov-black';
    ov.style.cssText += 'pointer-events:auto;flex-direction:column;gap:14px;padding:20px;opacity:0;transition:opacity .3s;';

    // Coin animation
    ov.innerHTML =
      "<div style='width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#FFB800,#B8860B);display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 0 25px rgba(255,204,0,.4);animation:T-coin 1.5s ease-out forwards'>T</div>" +
      "<div style=\"font-family:'Teko';font-size:24px;color:#fff;letter-spacing:2px\">COIN TOSS...</div>";

    el.appendChild(ov);
    requestAnimationFrame(function() { ov.style.opacity = '1'; });

    setTimeout(function() {
      var winner = humanWins ? hTeam.name : oTeam.name;
      ov.innerHTML = '';

      // Result
      var resultDiv = document.createElement('div');
      resultDiv.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;max-width:340px;';
      resultDiv.innerHTML =
        "<div style=\"font-family:'Teko';font-size:26px;color:var(--a-gold);letter-spacing:2px\">" + winner + " WINS THE TOSS</div>";

      if (humanWins) {
        resultDiv.insertAdjacentHTML('beforeend', "<div style=\"font-family:'Rajdhani';font-size:7px;color:var(--muted);letter-spacing:1px\">CHOOSE YOUR REWARD</div>");

        var cardRow = document.createElement('div');
        cardRow.style.cssText = 'display:flex;gap:6px;width:100%;';
        offers.forEach(function(card) {
          var ce = document.createElement('div');
          var tierCol = card.tier === 'SILVER' ? '#aaa' : '#CD7F32';
          ce.style.cssText = 'flex:1;background:var(--bg-surface);border:2px solid ' + tierCol + ';border-radius:6px;padding:10px 6px;cursor:pointer;text-align:center;transition:all .15s;';
          ce.innerHTML =
            "<div style=\"font-family:'Rajdhani';font-size:7px;font-weight:bold;color:" + tierCol + ";letter-spacing:1px;margin-bottom:3px\">" + card.tier + "</div>" +
            "<div style=\"font-family:'Teko';font-size:14px;color:#fff;line-height:1.1;margin-bottom:3px\">" + card.name + "</div>" +
            "<div style=\"font-family:'Rajdhani';font-size:7px;color:var(--muted);line-height:1.3\">" + card.effect + "</div>";
          ce.onclick = function() {
            SND.snap();
            ce.style.transform = 'scale(1.1)';
            ce.style.boxShadow = '0 0 30px var(--a-gold)';
            setTimeout(function() { ov.style.opacity = '0'; setTimeout(function() { ov.remove(); onDone([card]); }, 250); }, 400);
          };
          cardRow.appendChild(ce);
        });
        resultDiv.appendChild(cardRow);

        resultDiv.insertAdjacentHTML('beforeend', "<div style=\"font-family:'Rajdhani';font-size:7px;color:var(--muted);letter-spacing:2px\">\u2014 OR \u2014</div>");

        var recBtn = document.createElement('button');
        recBtn.className = 'btn-blitz';
        recBtn.style.cssText = 'width:100%;font-size:11px;background:var(--a-gold);border-color:var(--a-gold);color:#000;';
        recBtn.textContent = 'RECEIVE AT THE 50';
        recBtn.onclick = function() { SND.snap(); ov.style.opacity = '0'; setTimeout(function() { ov.remove(); onDone([], true); }, 250); };
        resultDiv.appendChild(recBtn);
      } else {
        var cpuCard = offers[0];
        resultDiv.innerHTML +=
          "<div style=\"font-family:'Barlow Condensed';font-size:14px;color:var(--muted);line-height:1.4;text-align:center\">" +
            oTeam.name + " takes a " + cpuCard.tier + " Torch Card.<br>You receive at the 50." +
          "</div>";
        var playBtn = document.createElement('button');
        playBtn.className = 'btn-blitz';
        playBtn.style.cssText = 'width:100%;font-size:14px;background:var(--a-gold);border-color:var(--a-gold);color:#000;margin-top:8px;';
        playBtn.textContent = 'PLAY BALL';
        playBtn.onclick = function() { SND.snap(); ov.style.opacity = '0'; setTimeout(function() { ov.remove(); onDone([], true); }, 250); };
        resultDiv.appendChild(playBtn);
      }

      ov.appendChild(resultDiv);
    }, 1800);
  }

  // ── RULES OVERLAY ──
  function showRules(onDone) {
    var ov = document.createElement('div');
    ov.className = 'T-ov T-ov-dark';
    ov.style.cssText += 'pointer-events:auto;flex-direction:column;gap:12px;padding:24px;opacity:0;transition:opacity .3s;cursor:pointer;';
    ov.innerHTML =
      "<div style=\"font-family:'Teko';font-size:30px;color:var(--a-gold);letter-spacing:3px\">HOW TO PLAY</div>" +
      "<div style=\"font-family:'Barlow Condensed';font-size:16px;color:#ccc;line-height:1.6;text-align:center;max-width:300px\">" +
        "20 snaps per half<br>" +
        "2-minute warning after snap 20<br>" +
        "Real countdown clock<br>" +
        "Both teams go for it on 4th down<br>" +
      "</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:7px;color:var(--muted);letter-spacing:1px;margin-top:8px\">TAP TO START</div>";
    el.appendChild(ov);
    requestAnimationFrame(function() { ov.style.opacity = '1'; });
    ov.onclick = function() { SND.click(); ov.style.opacity = '0'; setTimeout(function() { ov.remove(); onDone(); }, 250); };
  }

  // ── TRANSITIONS ──
  function checkEnd() {
    if (gs.gameOver) { setTimeout(() => setGs(s => ({...s, screen:'end_game', finalEngine:gs, humanAbbr:hAbbr})), 1200); return true; }
    if (gs.needsHalftime) { setTimeout(() => setGs(s => ({...s, screen:'halftime'})), 1200); return true; }
    return false;
  }

  // ── INIT ──
  drawBug(); drawField();
  if (gs.twoMinActive) { prev2min = true; el.classList.add('T-urgent'); }

  // First load: coin toss overlay → rules overlay → then enable play
  if (!GS._coinTossDone) {
    GS._coinTossDone = true;
    // Show empty panel behind overlay
    drawPanel();
    showCoinToss(function(torchCards, humanReceives) {
      // v0.21: Coin toss cards no longer awarded (shop-based economy)
      // Old: torchCards.forEach(c => gs.humanTorchCards.push(c.id));
      showRules(function() {
        phase = 'play';
        drawPanel();
      });
    });
  } else {
    drawPanel();
  }

  return el;
}
