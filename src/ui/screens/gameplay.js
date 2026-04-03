/**
 * TORCH — Gameplay Screen v3
 * Complete rewrite. Portrait bottom-stack.
 * Fresh visual language — no reuse from prior versions.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOtherTeam, fmtClock, getOffCards, getDefCards, getDrawWeight, getSpeedMultiplier, FEATURES } from '../../state.js';
import { GameState } from '../../engine/gameState.js';
import { getOffenseRoster, getDefenseRoster, getFullRoster } from '../../data/players.js';
// playSvg removed — play cards no longer use SVG diagrams
import { TORCH_CARDS } from '../../data/torchCards.js';
import { buildMaddenPlayer, buildPlayV1, buildTorchCard, buildHomeCard, flipRevealTorchCard } from '../components/cards.js';
import { showShop } from '../components/shop.js';
// tooltip system removed — will be rebuilt in v2
import AudioStateManager from '../../engine/audioManager.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { getConditionEffects } from '../../data/gameConditions.js';
import { checkPlayCombos } from '../../data/playSequenceCombos.js';
import { generateCommentary, generateContext, resetNarrative } from '../../engine/commentary.js';
import { initPointsAnim, playPointsSequence } from '../effects/torchPointsAnim.js';
import { injectDevPanel, getForceResult, getForceConversion } from '../components/devPanel.js';
import { renderCardTray } from '../components/cardTray.js';
import { createHandState, afterSnap as handAfterSnap, canDiscard, discard as handDiscard, resetDriveDiscards, redeal as handRedeal } from '../../engine/handManager.js';
import { createSTDeck, burnPlayer, restorePlayer, aiPickST } from '../../engine/stDeck.js';
import { aiSelectPlay, aiSelectPlayer } from '../../engine/aiOpponent.js';
import { showSTSelect } from '../components/stSelect.js';
import { createFieldAnimator } from '../field/fieldAnimator.js';
import { checkCardCombo } from '../../engine/cardCombos.js';

// Team-specific TD celebration config
var TEAM_CELEBRATION = {
  sentinels: {
    colors: ['#C4A265', '#8B0000', '#fff', '#EBB010'],
    phrases: ['BOARS FOOTBALL!', "THAT'S RIDGEMONT!", 'POWER!']
  },
  wolves: {
    colors: ['#FF7EB3', '#E8548F', '#fff', '#8B2252'],
    phrases: ['RIDE THE CURRENT!', 'DOLPHINS STRIKE!', 'SPEED KILLS!']
  },
  stags: {
    colors: ['#85C1E9', '#5DADE2', '#fff', '#1B4F72'],
    phrases: ['FROM THE SHADOWS!', 'SPECTRES ATTACK!', 'ELECTRIC!']
  },
  serpents: {
    colors: ['#39FF14', '#2E0854', '#fff', '#00cc10'],
    phrases: ['DEATH BY A THOUSAND CUTS!', 'SERPENTS VENOM!', 'CALCULATED!']
  },
};

/* ═══════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════ */
const CSS = `
/* root */
.T{height:100%;display:flex;flex-direction:column;background:#0A0804;overflow:hidden;position:relative;font-family:'Barlow Condensed',sans-serif;padding-top:env(safe-area-inset-top,0px)}

/* scoreboard — jumbotron */
.T-sb{background:#080808;overflow:hidden;flex-shrink:0;z-index:60;margin-bottom:6px}
.T-sb-led{height:2px}
.T-sb-row{display:grid;grid-template-columns:1fr auto 1fr;align-items:stretch}
.T-sb-panel{padding:8px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.T-sb-panel-home{border-right:1px solid #1a1a1a}
.T-sb-panel-away{border-left:1px solid #1a1a1a}
.T-sb-name{font-family:'Oswald',sans-serif;font-weight:700;font-size:10px;letter-spacing:2px;line-height:1;white-space:nowrap}
.T-sb-score{font-family:'Teko';font-weight:900;font-size:42px;line-height:0.9;color:#fff;transition:transform 0.2s}
.T-sb-poss-dot{width:4px;height:4px;border-radius:50%;margin-top:3px}
.T-sb-center{padding:6px 14px;background:#0a0a0a;min-width:80px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.T-sb-half{font-family:'Rajdhani';font-weight:700;font-size:10px;color:#EBB010;letter-spacing:2px;line-height:1}
.T-sb-snap{font-family:'Teko';font-weight:700;font-size:18px;color:#aaa;line-height:1;margin-top:2px}
.T-sb-divider{width:40px;height:1px;background:#333;margin:4px 0}
.T-sb-down{font-family:'Oswald',sans-serif;font-weight:700;font-size:11px;color:#FF6B00;letter-spacing:1px;line-height:1}
.T-sb-ball{font-family:'Rajdhani';font-weight:600;font-size:10px;color:#888;letter-spacing:0.5px;margin-top:1px}
.T-sb-clock{font-family:'Teko';font-weight:900;font-size:28px;line-height:1}
.T-sb-clock-label{font-family:'Rajdhani';font-weight:700;font-size:9px;color:#e03050;letter-spacing:2px;opacity:0.7}
@keyframes segFlicker{0%,95%{opacity:1}96%{opacity:0.7}97%{opacity:1}98%{opacity:0.85}100%{opacity:1}}
@keyframes clockPulse{0%,100%{text-shadow:0 0 8px rgba(224,48,80,0.4);color:#e03050}50%{text-shadow:0 0 16px rgba(224,48,80,0.7),0 0 30px rgba(224,48,80,0.3);color:#ff4060}}
@keyframes urgentLed{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes urgentPulse{0%,100%{border-color:#e0305044;background:rgba(224,48,80,0.03)}50%{border-color:#e0305088;background:rgba(224,48,80,0.06)}}

/* TORCH points banner */
.T-torch-banner{flex-shrink:0;display:flex;flex-direction:column}
.T-torch-banner-border{height:2px;background:linear-gradient(90deg,#8B4A1F,#EBB010,#FFD060,#EBB010,#8B4A1F);background-size:200% 100%;animation:borderFlow 3s linear infinite}
@keyframes borderFlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.T-torch-banner-content{background:linear-gradient(180deg,#1a1208 0%,#0a0804 40%,#0a0804 60%,#1a1208 100%);padding:8px 14px;display:flex;align-items:center;justify-content:center;gap:8px;position:relative}
.T-torch-banner-flame{animation:emblemPulse 3s ease-in-out infinite}
@keyframes emblemPulse{0%,100%{filter:drop-shadow(0 0 4px rgba(255,69,17,0.3))}50%{filter:drop-shadow(0 0 10px rgba(255,69,17,0.6))}}
@keyframes T-flame-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.85}}
.T-torch-banner-label{font-family:'Teko';font-weight:700;font-size:28px;letter-spacing:6px;line-height:1;background:linear-gradient(180deg,#FFD060 0%,#EBB010 30%,#8B4A1F 60%,#EBB010 80%,#FFD060 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.T-torch-banner-sep{width:1px;height:16px;background:linear-gradient(180deg,transparent,#EBB01044,transparent)}
.T-torch-banner-pts{font-family:'Teko';font-weight:700;font-size:26px;color:#fff;line-height:1;transition:transform .3s;animation:scoreGlow 2.5s ease-in-out infinite}
@keyframes scoreGlow{0%,100%{text-shadow:0 0 6px rgba(255,255,255,0.2)}50%{text-shadow:0 0 12px rgba(255,255,255,0.5),0 0 20px rgba(255,69,17,0.2)}}

/* drive summary */
.T-drive{flex:1;overflow-y:auto;padding:12px 14px 16px;background:linear-gradient(180deg,rgba(10,8,4,0) 0%,rgba(10,8,4,0.95) 8%);font-family:'Rajdhani',sans-serif}
.T-drive-hdr{display:flex;justify-content:space-between;align-items:center;padding-bottom:6px;border-bottom:1px solid #2a2a2a}
.T-drive-hdr-l{font-family:'Teko';font-weight:700;font-size:17px;color:#FF6B00;letter-spacing:3px;text-transform:uppercase;line-height:1}
.T-drive-hdr-r{font-family:'Rajdhani';font-size:12px;font-weight:600;color:#aaa;line-height:1}
.T-drive-hdr-r span{color:#fff}
.T-drive-row{display:flex;align-items:center;gap:4px;padding:3px 0;font-size:12px;transition:opacity .3s}
.T-drive-row-dd{font-family:'Teko';font-size:11px;color:#5a5a5a;min-width:52px;flex-shrink:0}
.T-drive-row-play{font-family:'Rajdhani';font-size:12px;color:#fff;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.T-drive-row-res{font-family:'Teko';font-weight:700;font-size:14px;min-width:40px;text-align:right;flex-shrink:0}
.T-drive-stats{border-top:1px solid #2a2a2a;margin-top:10px;padding-top:8px;display:flex;gap:20px}
.T-drive-stat{font-family:'Rajdhani';font-size:13px;font-weight:600;color:#fff}
.T-drive-comm{margin-top:8px;font-family:'Rajdhani';font-size:13px;font-weight:700;color:#e8e6ff;line-height:1.3;letter-spacing:.3px}
.T-drive-comm-sub{font-family:'Rajdhani';font-size:12px;color:#C4A265;line-height:1.2;margin-top:2px}
.T-drive-idle{font-family:'Rajdhani';font-size:11px;color:#666;letter-spacing:.5px;margin-top:8px}

/* field strip — Tecmo Bowl inspired */
.T-strip{height:136px;flex-shrink:0;position:relative;background:#050a08;overflow:hidden;border-bottom:1px solid #1E1610}
.T-field-turf{display:none}
.T-yard{display:none}
.T-yard-5{display:none}
.T-yard-num{display:none}
.T-yard-num-top{display:none}
.T-yard-num-bot{display:none}
.T-los{display:none}
.T-ltg{display:none}
.T-ez{display:none}
.T-ez-l{display:none}
.T-ez-r{display:none}
.T-ez-text{display:none}
.T-midfield-logo{display:none}
.T-hash{display:none}
/* placed cards on field — centered vertically */
.T-placed{position:absolute;top:50%;transform:translateY(-50%);height:120px;z-index:8;border-radius:6px;overflow:hidden;background:radial-gradient(ellipse at 50% 25%,#141008,#0A0804);border:2px solid #00ff44;box-shadow:0 0 12px rgba(0,255,68,.2),0 3px 10px rgba(0,0,0,0.5);display:flex;flex-direction:column}
.T-placed-play{left:2%;width:26%}
.T-placed-player{left:30%;width:26%}
.T-placed-torch{left:58%;width:24%}
/* empty drop outlines — centered vertically */
.T-drop{position:absolute;top:50%;transform:translateY(-50%);height:120px;border:2px dashed rgba(255,255,255,0.4);border-radius:6px;display:flex;align-items:center;justify-content:center;z-index:7;transition:all .3s ease;opacity:1;background:rgba(0,0,0,0.3)}
.T-drop-play{left:2%;width:26%}
.T-drop-player{left:30%;width:26%}
.T-drop-torch{left:58%;width:24%;border:2px dashed rgba(255,69,17,0.5);animation:T-torch-ember 2s ease-in-out infinite}
@keyframes T-torch-ember{0%,100%{box-shadow:0 0 12px rgba(255,69,17,0.4),inset 0 0 8px rgba(255,69,17,0.1);border-color:rgba(255,69,17,0.6)}50%{box-shadow:0 0 24px rgba(235,176,16,0.55),inset 0 0 14px rgba(235,176,16,0.18);border-color:rgba(235,176,16,0.8)}}
.T-torch-brand{font-family:'Teko';font-weight:700;font-size:16px;letter-spacing:4px;text-shadow:0 0 10px rgba(255,69,17,0.6)}
.T-drop-torch.T-drop-active{animation:T-drop-pulse 1.5s ease-in-out infinite}
.T-drop-lbl{font-family:'Rajdhani';font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;text-align:center;line-height:1.4}
.T-drop-hover{border-color:#FF4511;background:rgba(255,69,17,.15);transform:translateY(-50%) scale(1.02)}
@keyframes T-drop-pulse{0%,100%{border-color:rgba(255,69,17,0.4);box-shadow:0 0 10px rgba(255,69,17,0.1)}50%{border-color:#FF4511;box-shadow:inset 0 0 15px rgba(255,69,17,.2),0 0 15px rgba(255,69,17,.4);background:rgba(255,69,17,0.05)}}
.T-drop-active{animation:T-drop-pulse 1.5s ease-in-out infinite;border-style:solid;opacity:1;z-index:10}
.T-drop-active .T-drop-lbl{color:#FF4511;font-size:11px;text-shadow:0 0 8px rgba(255,69,17,0.5)}
.T-drop-player.T-drop-active{animation:T-drop-player-pulse 1.5s ease-in-out infinite}
.T-drop-player.T-drop-active .T-drop-lbl{color:#4DA6FF;font-size:11px;text-shadow:0 0 8px rgba(77,166,255,0.5)}
@keyframes T-drop-player-pulse{0%,100%{border-color:rgba(77,166,255,0.4);box-shadow:0 0 10px rgba(77,166,255,0.1)}50%{border-color:#4DA6FF;box-shadow:inset 0 0 15px rgba(77,166,255,.2),0 0 15px rgba(77,166,255,.4);background:rgba(77,166,255,0.05)}}
.T-drop-tutorial{animation:T-drop-pulse 1.5s ease-in-out infinite !important;border:3px solid #FF4511 !important;border-style:solid !important;background:rgba(255,69,17,0.06) !important}
.T-drop-tutorial .T-drop-lbl{color:#FF4511 !important;font-size:11px !important;font-weight:700 !important;text-shadow:0 0 8px rgba(255,69,17,0.5) !important}
.T-drop-tutorial-player{animation:T-drop-player-pulse 1.5s ease-in-out infinite !important;border:3px solid #4DA6FF !important;border-style:solid !important;background:rgba(77,166,255,0.06) !important}
.T-drop-tutorial-player .T-drop-lbl{color:#4DA6FF !important;font-size:11px !important;font-weight:700 !important;text-shadow:0 0 8px rgba(77,166,255,0.5) !important}

/* cards section — hidden during play-by-play */
.T-panel{display:flex;flex-direction:column;overflow:visible;transition:background .6s,border-color .6s;flex-shrink:0;border-top:2px solid transparent;position:relative;z-index:1}
.T-panel-hidden{display:none}
/* offense + defense panels — unified warm dark */
.T-panel-off{background:#0E0A04;border-top-color:#FF6B0033}
.T-panel-off .T-inst{color:#888}
.T-panel-off .T-card{}
.T-panel-def{background:#0E0A04;border-top-color:#FF6B0033}
.T-panel-def .T-inst{color:#888}
.T-panel-def .T-card{}

/* instruction */
.T-inst{text-align:center;padding:1px 0 0;font-family:'Rajdhani';font-size:10px;color:#777;letter-spacing:1px;flex-shrink:0;text-transform:uppercase}

/* card tray — matches pregame draft card style */
.T-tray{display:flex;gap:3px;padding:4px 3px;flex-shrink:0;overflow:hidden}
.T-card{flex:1 1 0;min-width:0;height:150px;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;transition:all .15s ease;touch-action:none;position:relative;cursor:grab;opacity:.8}
.T-card:active{cursor:grabbing}
.T-card-sel{opacity:1;border-color:#00ff44 !important;box-shadow:0 0 18px rgba(0,255,68,.35),inset 0 0 12px rgba(0,255,68,.08) !important}
.T-card-gone{opacity:.3;pointer-events:none}
.T-card-hurt{opacity:.2;pointer-events:none}
/* drag ghost */
.T-drag-ghost{position:fixed;z-index:9999;pointer-events:none;opacity:.85;transform:scale(1.05);filter:drop-shadow(0 4px 12px rgba(0,0,0,.6))}

/* snap bar — uses btn-blitz style */
.T-snap{padding:6px 6px 8px;flex-shrink:0;display:flex;gap:4px;align-items:stretch;flex-direction:column;margin-bottom:2px}
@keyframes T-pulse{0%,100%{box-shadow:6px 6px 0 #997a00, 10px 10px 0 #000, 0 0 20px rgba(255,204,0,.3)}50%{box-shadow:6px 6px 0 #997a00, 10px 10px 0 #000, 0 0 40px rgba(255,204,0,.6)}}

/* 2min buttons */
.T-2btns{display:flex;gap:5px}
.T-2btn{flex:1;padding:14px;font-family:'Rajdhani';font-size:10px;cursor:pointer;text-align:center;background:none;letter-spacing:.5px;text-transform:uppercase;border:2px solid;border-radius:6px}
.T-2btn:active{transform:translate(3px,3px)}
.T-spike{color:#FF6B00;border-color:#FF6B00;box-shadow:4px 4px 0 #803500,6px 6px 0 #000}
.T-kneel{color:#554f80;border-color:#554f80;box-shadow:4px 4px 0 #2a2840,6px 6px 0 #000}

/* play-by-play terminal */
/* Commentary — broadcast booth ticker */
.T-narr{flex:1 1 auto;min-height:70px;max-height:120px;background:rgba(10,8,4,0.85);overflow-y:auto;padding:8px 12px}
.T-pbp{display:flex;flex-direction:column;gap:4px}
.T-pbp-line{font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#fff;line-height:1.3;letter-spacing:.3px}
.T-pbp-live{color:#fff}
.T-pbp-sub{font-family:'Rajdhani';font-size:14px;color:#C4A265;line-height:1.2}
.T-pbp-result{font-family:'Rajdhani';font-size:12px;letter-spacing:.5px;line-height:1;margin-top:6px;white-space:nowrap;overflow:hidden}
.T-pbp-down{font-family:'Rajdhani';font-size:10px;color:#FF6B00;margin-top:4px;letter-spacing:.5px;line-height:1;white-space:nowrap;overflow:hidden}
.T-pbp-idle{font-family:'Rajdhani',sans-serif;font-size:11px;color:#666;letter-spacing:.5px}
/* torch points fly animation */
.T-torch-fly{position:fixed;z-index:9999;font-family:'Rajdhani';font-size:12px;color:#c8a030;pointer-events:none;text-shadow:0 0 8px rgba(200,160,48,.5)}
@keyframes T-flyup{0%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(.6)}}
.T-pbp-cursor{display:inline-block;width:6px;height:12px;background:#FF6B00;margin-left:2px;animation:T-blink .6s step-end infinite}

/* celebrations */
@keyframes T-shake{0%,100%{transform:translateX(0)}10%{transform:translateX(-6px)}20%{transform:translateX(6px)}30%{transform:translateX(-4px)}40%{transform:translateX(4px)}50%{transform:translateX(-2px)}60%{transform:translateX(2px)}}
@keyframes T-td-confetti{0%{transform:translateY(0) rotate(0) translateX(0);opacity:0.9}20%{opacity:1}100%{transform:translateY(105vh) rotate(var(--rot, 720deg)) translateX(var(--drift, 0px));opacity:0}}
.T-shaking{animation:T-shake .5s ease-out}
@keyframes T-flash-green{0%{opacity:.6}100%{opacity:0}}
@keyframes T-flash-red{0%{opacity:.6}100%{opacity:0}}
.T-flash{position:absolute;inset:0;z-index:100;pointer-events:none}
@keyframes T-rain-fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(200px) rotate(720deg);opacity:0}}
.T-rain{position:absolute;font-size:16px;z-index:99;pointer-events:none;animation:T-rain-fall 2s ease-in forwards}
@keyframes T-crack-in{0%{opacity:0;transform:scale(2)}100%{opacity:1;transform:scale(1)}}
.T-crack{position:absolute;inset:0;z-index:100;pointer-events:none;display:flex;align-items:center;justify-content:center}
.T-crack-text{font-family:'Teko';font-weight:700;font-size:24px;letter-spacing:4px;animation:T-crack-in .3s ease-out;text-shadow:0 0 20px currentColor,0 2px 8px rgba(0,0,0,0.9),0 0 40px rgba(0,0,0,0.7)}
@keyframes T-impact{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(3)}}
.T-impact{position:absolute;top:50%;left:50%;width:40px;height:40px;border-radius:50%;z-index:99;pointer-events:none;transform:translate(-50%,-50%);animation:T-impact .4s ease-out forwards}
@keyframes T-blink{0%,100%{opacity:1}50%{opacity:0}}
/* card matchup display on field — helmet crash animation */
/* clash: simple 3-column layout — left cards | VS | right cards */
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

/* drive summary */
.T-drv{padding:10px 14px;text-align:center}
.T-drv-hdr{font-family:'Rajdhani';font-size:10px;letter-spacing:1px;margin-bottom:4px}
.T-drv-stat{font-family:'Rajdhani';font-size:9px;color:#554f80}

/* 2-min transformation */
/* 2-minute drill — full urgency transformation */
.T-urgent .T-strip{border-bottom-color:#e03050;box-shadow:inset 0 0 30px rgba(224,48,80,.1)}
.T-urgent .T-sb{box-shadow:0 0 20px rgba(224,48,80,0.15)}
.T-urgent .T-sb-led{background:linear-gradient(90deg,#e03050,#ff6060,#e03050,#ff6060,#e03050);background-size:200% 100%;animation:urgentLed 1.5s linear infinite}
@keyframes T-breathe{0%,100%{background-color:#0A0804}50%{background-color:#140008}}
.T-urgent .T-panel{animation:T-breathe 2s ease-in-out infinite;border-top-color:#e0305066}
.T-urgent .T-narr{border-top-color:#e0305044;background:#0a0008}
@keyframes T-urgent-border{0%,100%{border-color:#e0305044}50%{border-color:#e03050}}
.T-urgent .T-card{animation:T-urgent-border 1.5s ease-in-out infinite}
.T-urgent .T-inst{color:#e03050 !important}
@keyframes T-coin{0%{transform:rotateY(0)}100%{transform:rotateY(1080deg)}}

/* Card Clash / Reveal Animation */
@keyframes T-clash-shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(8px)}45%{transform:translateX(-5px)}60%{transform:translateX(5px)}75%{transform:translateX(-2px)}}
.T-redzone .CT-snap-btn{background:linear-gradient(180deg,#e03050 0%,#8B0020 100%)!important;box-shadow:0 4px 16px rgba(224,48,80,0.3)!important}
@keyframes T-clash-flash{0%{opacity:0.6}100%{opacity:0}}
@keyframes T-clash-yds{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.2);opacity:1}75%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}
@keyframes T-clash-spark{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--sx),var(--sy)) scale(0)}}
/* Card deal: slide in face-down then flip to face-up */
@keyframes T-deal-slide{0%{transform:translateX(100px);opacity:0}100%{transform:translateX(0);opacity:1}}
@keyframes T-deal-flip{0%{transform:rotateY(180deg)}100%{transform:rotateY(0deg)}}
.T-card-deal{perspective:600px}
.T-card-deal .T-card-back{position:absolute;inset:0;z-index:2;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px}
.T-card-deal .T-card-face{width:100%;height:100%}
@keyframes T-micro-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-2px)} 50%{transform:translateX(2px)} 75%{transform:translateX(-1px)} }
.T-2min-active { animation: T-2min-pulse 2s ease-in-out infinite; }
@keyframes T-2min-pulse { 0%,100% { box-shadow: inset 0 0 0 0 transparent; } 50% { box-shadow: inset 0 0 30px rgba(255,0,64,0.08); } }
@keyframes T-clock-critical { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
@keyframes T-snap-pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes coinGlow{0%,100%{box-shadow:0 0 20px rgba(235,176,16,0.3)}50%{box-shadow:0 0 40px rgba(235,176,16,0.5),0 0 60px rgba(255,69,17,0.2)}}
@keyframes pulseHint{0%,100%{opacity:0.5}50%{opacity:1}}
@keyframes floatCard{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.T-clash-overlay{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;pointer-events:auto}
.T-clash-dim{position:absolute;inset:0;background:#0A0804;transition:opacity 0.3s}
.T-clash-result{position:relative;z-index:3;display:flex;flex-direction:column;align-items:center;gap:6px}
.T-clash-yds{font-family:'Teko';font-weight:700;font-size:64px;line-height:1;text-shadow:0 0 24px currentColor;animation:T-clash-yds 0.6s cubic-bezier(0.22,1.3,0.36,1) both}
.T-clash-label{font-family:'Rajdhani';font-weight:700;font-size:14px;letter-spacing:1px;opacity:0.8}
.T-clash-flash{position:absolute;inset:0;z-index:4;pointer-events:none;animation:T-clash-flash 0.3s ease-out forwards}
`;

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
// Natural language yard display
function yardText(yards) {
  if (yards > 0) return 'Gain of ' + yards;
  if (yards < 0) return 'Loss of ' + Math.abs(yards);
  return 'No gain';
}
function yardTextShort(yards) {
  if (yards > 0) return '+' + yards;
  if (yards < 0) return '-' + Math.abs(yards);
  return '0';
}

/* Build a placed player card for the field strip — uses shared buildMaddenPlayer */
function mkPlayerCardEl(p, team) {
  var tier = p.ovr >= 85 ? 'gold' : p.ovr >= 75 ? 'silver' : 'bronze';
  return buildMaddenPlayer({
    name: p.name, pos: p.pos, ovr: p.ovr,
    num: p.num || '', tier: tier, badge: p.badge, isStar: p.isStar,
    ability: p.ability || '', stars: p.stars, trait: p.trait,
    teamColor: team.colors ? team.colors.primary : (team.accent || '#FF4511'),
    teamId: GS.team
  }, 80, 150);
}

/* Risk classification matching cardDraft.js */
var HIGH_RISK_IDS = ['four_verts','go_route','y_corner','zero_cov','db_blitz'];
var MED_RISK_IDS = ['mesh','slant','overload','fire_zone','a_gap_mug','edge_crash','pa_post','pa_flat','man_press','zone_drop','triple_option','zone_read'];
function getRisk(id) { return HIGH_RISK_IDS.indexOf(id)>=0?'high':MED_RISK_IDS.indexOf(id)>=0?'med':'low'; }

/* Build a placed play card for the field strip — uses shared buildPlayV1 */
function mkPlayCardEl(play) {
  var cat = {SHORT:'SHORT',DEEP:'DEEP',RUN:'RUN',SCREEN:'SCREEN',OPTION:'OPTION',
    BLITZ:'BLITZ',ZONE:'ZONE',TRAP:'TRAP'}[play.playType||play.cardType] || 'RUN';
  return buildPlayV1({
    name: play.name,
    playType: cat,
    isRun: play.isRun === true || play.type === 'run',
    desc: play.desc || play.flavor || '',
    risk: play.risk || getRisk(play.id),
    cat: cat
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
  AudioStateManager.setState('normal_play');
  initPointsAnim();
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
      humanTeam: hAbbr, difficulty: GS.difficulty||'MEDIUM', coachBadge: GS.coachBadge||'SCHEMER',
      // Human = CT slot, Opponent = IR slot
      ctOffHand: hOffPlays.slice(0,4), ctDefHand: hDefPlays.slice(0,4),
      irOffHand: cOffPlays.slice(0,4), irDefHand: cDefPlays.slice(0,4),
      ctOffRoster: hOR, ctDefRoster: hDR,
      irOffRoster: cOffRoster, irDefRoster: cDefRoster,
      initialPossession: GS.humanReceives ? hAbbr : 'IR',
      ctTeamId: GS.team, irTeamId: oppId,
    });
    GS.engine.momentumEnabled = FEATURES.momentumSystem;
    // Seed TORCH points from previous game
    var carry = GS.season && GS.season.carryoverPoints ? GS.season.carryoverPoints : 0;
    if (carry > 0) GS.engine.ctTorchPts = carry;
    // Restore mid-game snapshot if resuming
    var snap = GS._engineSnapshot;
    if (snap) {
      GS.engine.ctScore = snap.ctScore || 0;
      GS.engine.irScore = snap.irScore || 0;
      GS.engine.possession = snap.possession || GS.engine.possession;
      GS.engine.ballPosition = snap.ballPosition !== undefined ? snap.ballPosition : GS.engine.ballPosition;
      GS.engine.down = snap.down || 1;
      GS.engine.distance = snap.distance || 10;
      GS.engine.half = snap.half || 1;
      GS.engine.playsUsed = snap.playsUsed || 0;
      GS.engine.totalPlays = snap.totalPlays || 0;
      GS.engine.twoMinActive = snap.twoMinActive || false;
      GS.engine.clockSeconds = snap.clockSeconds !== undefined ? snap.clockSeconds : 120;
      GS.engine.ctTorchPts = snap.ctTorchPts || 0;
      GS.engine.irTorchPts = snap.irTorchPts || 0;
      GS.engine.offHeatMap = snap.offHeatMap || {};
      GS.engine.defHeatMap = snap.defHeatMap || {};
      GS.engine.momentum = snap.momentum !== undefined ? snap.momentum : 50;
      GS._engineSnapshot = null; // Clear after applying
    }
    // Reset narrative tracking for this new game
    resetNarrative();
  }
  const gs = GS.engine;

  // Special teams burn decks
  var _humanFullRoster = getFullRoster(GS.team);
  var _cpuFullRoster = getFullRoster(GS.opponent || 'wolves');
  var _humanSTDeck = createSTDeck(_humanFullRoster);
  var _cpuSTDeck = createSTDeck(_cpuFullRoster);

  // Track new drive state for card deal animation
  var _isNewDrive = true; // first draw is always a new drive

  // Hand management state — initialized per side on first drawPanel
  var _offHandState = null;
  var _defHandState = null;
  function getHandState() {
    var isOff = gs.possession === hAbbr;
    if (isOff) {
      if (!_offHandState) {
        _offHandState = createHandState(getOffCards(GS.team), getOffenseRoster(GS.team));
      }
      return _offHandState;
    } else {
      if (!_defHandState) {
        _defHandState = createHandState(getDefCards(GS.team), getDefenseRoster(GS.team));
      }
      return _defHandState;
    }
  }

  // ui state
  let selP = null, selPl = null, selTorch = null;
  let phase = 'play'; // play | torch | ready | busy
  let driveSnaps = [];
  let prev2min = gs.twoMinActive;
  var _scoutActive = false; // Scout Report card effect
  var _lastPlayFlashed = false; // true after LAST PLAY flash fires, reset each half
  var _pbpVisible = false; // Play-by-play toggle state
  var snapCount = 0; // Track snap number for teach tooltips
  var _onboardingDone = true; // Onboarding disabled — will revisit
  var _tutorialStep = 0;
  var _torchTutorialShown = true; // Onboarding disabled — will revisit
  var twoMinTimer = null; // Real-time clock interval for 2-minute drill
  var _fourthDownDecided = false; // true after player clicks GO FOR IT (hides the bar)
  var _driveHeat = 0; // 0-120 momentum bar
  var _driveCardsUsed = []; // torch card IDs used this drive
  var _activeDriveCombo = null; // combo triggered this snap, applied post-executeSnap

  // ── LAYER 6: Ambient mood — subtle brightness/vignette based on user momentum ──
  var _moodHistory = []; // last 4 plays: +1 good, -1 bad, 0 neutral
  var _moodVignette = null;
  function updateMood(isGoodForUser, isBadForUser) {
    _moodHistory.push(isGoodForUser ? 1 : isBadForUser ? -1 : 0);
    if (_moodHistory.length > 4) _moodHistory.shift();
    var sum = _moodHistory.reduce(function(a, b) { return a + b; }, 0);
    var momentum = sum / _moodHistory.length; // -1.0 to 1.0
    var brightness = 1.0 + momentum * 0.06; // 0.94 to 1.06 — subtle
    var vignette = momentum < 0 ? Math.abs(momentum) * 0.12 : 0;
    strip.style.filter = 'brightness(' + brightness.toFixed(3) + ')';
    if (!_moodVignette) {
      _moodVignette = document.createElement('div');
      _moodVignette.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:50;transition:opacity 0.8s;';
      _moodVignette.style.background = 'radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.4) 100%)';
      el.appendChild(_moodVignette);
    }
    _moodVignette.style.opacity = vignette.toFixed(3);
  }

  function updateDriveHeat(r, gameEvent) {
    if (gameEvent === 'interception' || gameEvent === 'fumble' || gameEvent === 'turnover_on_downs') {
      _driveHeat = 0; return;
    }
    if (r.isInterception || r.isFumbleLost) { _driveHeat = 0; return; }
    var delta = 0;
    if (r.isTouchdown) { _driveHeat = 100; return; }
    if (r.yards >= 15) delta = 20;
    else if (r.yards >= 8) delta = 12;
    else if (r.yards >= 4) delta = 8;
    else if (r.yards >= 1) delta = 4;
    else if (r.yards === 0) delta = -5;
    else delta = -10;
    if (r.isIncomplete) delta = -8;
    if (r.isSack) delta = -12;
    delta += 3;
    _driveHeat = Math.max(0, Math.min(120, _driveHeat + delta));
  }

  var _driveHeatFill = null; // cached fill element — avoid repeated getElementById calls
  function drawDriveHeat() {
    if (!_driveHeatFill) {
      var bar = document.getElementById('T-drive-heat');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'T-drive-heat';
        bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;height:3px;z-index:2;pointer-events:none;background:transparent;';
        bar.innerHTML = '<div id="T-drive-heat-fill" style="height:100%;width:0%;transition:width 0.5s ease-out,background 0.3s;border-radius:0 2px 2px 0;"></div>';
        document.body.appendChild(bar);
      }
      _driveHeatFill = document.getElementById('T-drive-heat-fill');
    }
    var fill = _driveHeatFill;
    if (!fill) return;
    var pct = (_driveHeat / 120) * 100;
    fill.style.width = pct + '%';
    var color;
    if (_driveHeat < 25) color = '#4488ff';
    else if (_driveHeat < 50) color = '#c8a030';
    else if (_driveHeat < 80) color = '#ff8811';
    else color = '#e03050';
    fill.style.background = color;
    if (_driveHeat >= 90) {
      fill.style.boxShadow = '0 0 8px ' + color + ', 0 -2px 12px ' + color + '80';
    } else {
      fill.style.boxShadow = 'none';
    }
  }

  // Start/stop the real-time 2-minute clock
  function start2MinClock() {
    if (twoMinTimer) return;
    AudioStateManager.setState('two_min_drill');
    twoMinTimer = setInterval(function() {
      if (!gs.twoMinActive || gs.gameOver || phase === 'busy') return;
      // Only tick when user is on offense (they control the clock)
      // When user is on defense, opponent controls clock — auto-tick between snaps only
      var userOnOff = gs.possession === hAbbr;
      if (!userOnOff && phase !== 'busy') return; // Don't tick on defense during card selection
      gs.clockSeconds = Math.max(0, gs.clockSeconds - 1);
      drawBug();
      // Heartbeat below 15 seconds + haptic pulse
      if (gs.clockSeconds <= 15 && gs.clockSeconds > 0) {
        SND.click();
        try { if (navigator.vibrate) navigator.vibrate(gs.clockSeconds <= 5 ? [50, 50, 50] : [40]); } catch(e) {}
      }
      // Time expired — end the half (but not during a PAT)
      if (gs.clockSeconds <= 0) {
        stop2MinClock();
        gs._checkHalfEnd(); // Always check — PAT happens via handleConversion which checks after
        if (!conversionMode) {
          checkEnd();
        }
      }
    }, 1000);
  }
  function stop2MinClock() {
    if (twoMinTimer) { clearInterval(twoMinTimer); twoMinTimer = null; }
  }

  // Progressive disclosure
  var isFirstGame = false; // tutorial system disabled — will be rebuilt

  // Game Day Conditions (v0.21)
  var weatherId = (GS.gameConditions && GS.gameConditions.weather) || 'clear';
  var condEffects = getConditionEffects(GS.gameConditions || { weather: 'clear', field: 'turf', crowd: 'home' });

  // Play Sequence Combos — track play history per drive
  var drivePlayHistory = []; // {cat, playId} entries for current drive

  // Drive summary tracking (play-by-play ticker resets per drive)
  var driveSummaryLog = []; // [{down, dist, playName, yards, isTD, isSack, isInc, isInt, isFumble}]
  var driveFirstDowns = 0;
  var driveCommLine1 = '', driveCommLine2 = '';

  // Game-wide stat accumulators (persist across drives)
  // Human offense stats
  var hOffPassAtt = 0, hOffPassComp = 0, hOffPassYds = 0;
  var hOffRushAtt = 0, hOffRushYds = 0;
  var hOffRecYds = 0, hOffRec = 0;
  var hOffQBName = '', hOffRBName = '', hOffWRName = '';
  // Human defense stats (tracking human's defensive players)
  var hDefStats = {}; // { name: { pos, tkl, pbu, int, sack } }
  // CPU offense stats
  var cOffPassAtt = 0, cOffPassComp = 0, cOffPassYds = 0;
  var cOffRushAtt = 0, cOffRushYds = 0;
  var cOffRecYds = 0, cOffRec = 0;
  var cOffQBName = '', cOffRBName = '', cOffWRName = '';
  // CPU defense stats (tracking CPU's defensive players)
  var cDefStats = {}; // { name: { pos, tkl, pbu, int, sack } }
  // Per-player game stats for card display (keyed by player id)
  var _playerGameStats = {}; // { id: { yds, rec, recYds, rushAtt, rushYds, passAtt, passComp, passYds, tkl, pbu, int, sack, td } }
  var _hotStreak = 0; // consecutive positive plays (user offense)
  // Timer registry — all setTimeout calls tracked for cleanup on screen exit
  var _timers = [];
  function _setTimeout(fn, delay) { var id = setTimeout(fn, delay); _timers.push(id); return id; }
  // CPU roster for QB lookup
  var cpuOffRoster = getOffenseRoster(oppId);

  function resetDriveSummary() {
    driveSummaryLog = [];
    driveFirstDowns = 0;
    driveCommLine1 = ''; driveCommLine2 = '';
    // Game-wide stats are NOT reset here
  }

  // TORCH card inventory (v0.21 — 3 slots, persisted in season)
  var torchInventory = (GS.season && GS.season.torchCards) ? GS.season.torchCards.slice() : [];
  var selectedPreSnap = null; // card object selected for current snap

  // Consume a torch card from both UI and engine inventories
  function consumeTorchCard(cardId) {
    var idx = torchInventory.findIndex(function(c) { return c.id === cardId; });
    if (idx >= 0) torchInventory.splice(idx, 1);
    if (GS.season) GS.season.torchCards = torchInventory.slice();
    var eIdx = gs ? gs.humanTorchCards.indexOf(cardId) : -1;
    if (eIdx >= 0) gs.humanTorchCards.splice(eIdx, 1);
  }

  // Helper: resolve kickoff with HOUSE_CALL auto-consumption
  function _resolveKickoff(humanReceives) {
    var opts = {};
    if (humanReceives) {
      var hcIdx = torchInventory.findIndex(function(c) { return c.id === 'house_call'; });
      if (hcIdx >= 0) { opts.houseCall = true; consumeTorchCard('house_call'); torchCardToast('HOUSE CALL', 'Guaranteed 50+ yard return'); }
    }
    return gs.constructor.resolveKickoff(null, opts);
  }

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

  // Tutorial system disabled — will be rebuilt as v2 onboarding

  // dom
  const el = document.createElement('div');
  el.className = 'T';
  const sty = document.createElement('style'); sty.textContent = CSS; el.appendChild(sty);


  // ── SCOREBOARD ──
  const bug = document.createElement('div'); bug.className = 'T-sb'; bug.style.cursor = 'pointer'; el.appendChild(bug);
  // Tap scorebug to show stats sheet
  bug.addEventListener('click', function() {
    if (phase === 'busy') return;
    import('../components/statsSheet.js').then(function(mod) {
      // Compute TDs, sacks, INTs from tracked stats
      var _hTDs = 0, _hSacks = 0, _hInts = 0;
      var _cTDs = 0, _cSacks = 0, _cInts = 0;
      Object.keys(hDefStats).forEach(function(k) { var d = hDefStats[k]; _hSacks += d.sack; _hInts += d.int; });
      Object.keys(cDefStats).forEach(function(k) { var d = cDefStats[k]; _cSacks += d.sack; _cInts += d.int; });
      var s = gs.getSummary();
      mod.showStatsSheet(el, {
        humanTeam: hTeam, oppTeam: oTeam,
        humanScore: hAbbr === 'CT' ? s.ctScore : s.irScore,
        oppScore: hAbbr === 'CT' ? s.irScore : s.ctScore,
        half: gs.half, playsUsed: gs.playsUsed,
        hPassAtt: hOffPassAtt, hPassComp: hOffPassComp, hPassYds: hOffPassYds,
        hRushAtt: hOffRushAtt, hRushYds: hOffRushYds,
        hSacks: _hSacks, hInts: _hInts,
        hTorch: hAbbr === 'CT' ? s.ctTorchPts : s.irTorchPts,
        cPassAtt: cOffPassAtt, cPassComp: cOffPassComp, cPassYds: cOffPassYds,
        cRushAtt: cOffRushAtt, cRushYds: cOffRushYds,
        cSacks: _cSacks, cInts: _cInts,
        cTorch: hAbbr === 'CT' ? s.irTorchPts : s.ctTorchPts,
      });
    });
  });
  // ── PLAY-BY-PLAY TICKER ──
  var ticker = document.createElement('div');
  ticker.style.cssText = "position:relative;height:0;overflow:hidden;background:transparent;border:none;flex-shrink:0;display:none;";
  var tickerInner = document.createElement('div');
  tickerInner.style.cssText = "position:absolute;white-space:nowrap;font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:0.5px;line-height:18px;padding-left:100%;";
  ticker.appendChild(tickerInner);
  el.appendChild(ticker);

  var _tickerMessages = [];
  var _tickerAnim = null;

  function pushTicker(text, color) {
    _tickerMessages.push({ text: text, color: color || '#888' });
    updateTicker();
  }

  // Brief toast for auto-consumed torch cards (ST cards, kickoff cards)
  function torchCardToast(cardName, effectText) {
    var toast = document.createElement('div');
    toast.style.cssText = "position:fixed;top:10%;left:50%;transform:translateX(-50%);z-index:660;padding:8px 16px;border-radius:6px;background:rgba(14,10,4,0.92);border:1px solid #EBB01066;text-align:center;pointer-events:none;opacity:0;";
    toast.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:#EBB010;letter-spacing:2px;\">" + cardName + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:10px;color:#aaa;margin-top:2px;\">" + effectText + "</div>";
    el.appendChild(toast);
    try {
      gsap.to(toast, { opacity: 1, duration: 0.15 });
      gsap.to(toast, { opacity: 0, duration: 0.3, delay: 1.2, onComplete: function() { if (toast.parentNode) toast.remove(); } });
    } catch(e) { toast.style.opacity = '1'; setTimeout(function() { if (toast.parentNode) toast.remove(); }, 1500); }
  }

  function updateTicker() {
    if (_tickerMessages.length === 0) return;
    var recent = _tickerMessages.slice(-5);
    var html = recent.map(function(m) {
      return '<span style="color:' + m.color + ';">' + m.text + '</span>';
    }).join(' <span style="color:#333;">|</span> ');
    tickerInner.innerHTML = html;

    if (_tickerAnim) { try { _tickerAnim.kill(); } catch(e) {} }
    var width = tickerInner.scrollWidth + ticker.offsetWidth;
    tickerInner.style.paddingLeft = ticker.offsetWidth + 'px';
    try {
      _tickerAnim = gsap.fromTo(tickerInner,
        { x: 0 },
        { x: -width, duration: Math.max(8, width / 40), ease: 'none', repeat: -1 }
      );
    } catch(e) {}
  }

  // Win probability model
  // Scorebug cached elements — built once by initBug(), updated by drawBug()
  var _bugEls = {};
  var _prevDown = 0;
  var _prevDist = 0;
  var _prevBallPos = -1;
  var _wasInRedZone = false;
  var _prevHScore = -1;
  var _prevCScore = -1;
  function initBug() {
    const ct = hTeam, ir = oTeam;

    // ── Top LED bar ──
    const ledTop = document.createElement('div'); ledTop.className = 'T-sb-led';
    bug.appendChild(ledTop);

    // ── Score row (3-column grid) ──
    const row = document.createElement('div'); row.className = 'T-sb-row';

    // Home panel (left)
    const ctPanel = document.createElement('div'); ctPanel.className = 'T-sb-panel T-sb-panel-home';
    const ctNameEl = document.createElement('div'); ctNameEl.className = 'T-sb-name';
    ctNameEl.style.color = ct.accent;
    ctNameEl.textContent = ct.name.toUpperCase();
    const ctScoreEl = document.createElement('div'); ctScoreEl.className = 'T-sb-score';
    const ctDotEl = document.createElement('div'); ctDotEl.className = 'T-sb-poss-dot';
    ctPanel.appendChild(ctNameEl);
    ctPanel.appendChild(ctScoreEl);
    ctPanel.appendChild(ctDotEl);
    row.appendChild(ctPanel);

    // Center panel
    const center = document.createElement('div'); center.className = 'T-sb-center';
    const halfEl = document.createElement('div'); halfEl.className = 'T-sb-half';
    const snapEl = document.createElement('div'); snapEl.className = 'T-sb-snap';
    const clockEl = document.createElement('div'); clockEl.className = 'T-sb-clock';
    const clockLabel = document.createElement('div'); clockLabel.className = 'T-sb-clock-label';
    clockLabel.textContent = '2-MIN DRILL';
    const dividerEl = document.createElement('div'); dividerEl.className = 'T-sb-divider';
    const downEl = document.createElement('div'); downEl.className = 'T-sb-down';
    const ballEl = document.createElement('div'); ballEl.className = 'T-sb-ball';
    center.appendChild(halfEl);
    center.appendChild(snapEl);
    center.appendChild(clockEl);
    center.appendChild(clockLabel);
    center.appendChild(dividerEl);
    center.appendChild(downEl);
    center.appendChild(ballEl);
    row.appendChild(center);

    // Away panel (right)
    const irPanel = document.createElement('div'); irPanel.className = 'T-sb-panel T-sb-panel-away';
    const irNameEl = document.createElement('div'); irNameEl.className = 'T-sb-name';
    irNameEl.style.color = ir.accent;
    irNameEl.textContent = ir.name.toUpperCase();
    const irScoreEl = document.createElement('div'); irScoreEl.className = 'T-sb-score';
    const irDotEl = document.createElement('div'); irDotEl.className = 'T-sb-poss-dot';
    irPanel.appendChild(irNameEl);
    irPanel.appendChild(irScoreEl);
    irPanel.appendChild(irDotEl);
    row.appendChild(irPanel);

    bug.appendChild(row);

    // ── Bottom LED bar ──
    const ledBot = document.createElement('div'); ledBot.className = 'T-sb-led';
    bug.appendChild(ledBot);

    // Play clock bar (shows plays remaining in half)
    var playClockBar = document.createElement('div');
    playClockBar.style.cssText = 'position:relative;height:1px;background:#0a0a0a;margin:1px 8px 0;border-radius:2px;overflow:hidden;';
    var playClockFill = document.createElement('div');
    playClockFill.style.cssText = 'height:100%;border-radius:2px;transition:width 0.4s ease-out;background:#EBB010;';
    playClockBar.appendChild(playClockFill);
    bug.appendChild(playClockBar);

    // Cache every mutable element reference
    _bugEls = {
      ledTop, ledBot,
      ctPanel, ctNameEl, ctScoreEl, ctDotEl,
      irPanel, irNameEl, irScoreEl, irDotEl,
      halfEl, snapEl, clockEl, clockLabel, dividerEl, downEl, ballEl,
      playClockFill,
    };
  }

  function drawBug() {
    if (!_bugEls.ctScoreEl) initBug();
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

    // ── LED bars (dynamic team color gradient) ──
    var ledGrad = 'linear-gradient(90deg, ' + ct.accent + ', #EBB010, ' + ir.accent + ')';
    _bugEls.ledTop.style.background = ledGrad;
    _bugEls.ledBot.style.background = ledGrad;

    // ── Scores ──
    _bugEls.ctScoreEl.textContent = s.ctScore;
    _bugEls.irScoreEl.textContent = s.irScore;

    // Score flash on change
    var hScore = s.ctScore;
    var cScore = s.irScore;
    if (hScore !== _prevHScore && _prevHScore >= 0) {
      try { gsap.fromTo(_bugEls.ctScoreEl, { scale: 1.3, color: '#00ff44' }, { scale: 1, color: '#fff', duration: 0.4, ease: 'back.out(1.5)' }); } catch(e) {}
    }
    if (cScore !== _prevCScore && _prevCScore >= 0) {
      try { gsap.fromTo(_bugEls.irScoreEl, { scale: 1.3, color: '#ff0040' }, { scale: 1, color: '#fff', duration: 0.4, ease: 'back.out(1.5)' }); } catch(e) {}
    }
    _prevHScore = hScore;
    _prevCScore = cScore;

    // ── Possession dot ──
    if (ctHasBall) {
      _bugEls.ctDotEl.style.background = '#00ff44';
      _bugEls.ctDotEl.style.boxShadow = '0 0 4px #00ff44';
      _bugEls.irDotEl.style.background = 'transparent';
      _bugEls.irDotEl.style.boxShadow = 'none';
    } else {
      _bugEls.irDotEl.style.background = '#00ff44';
      _bugEls.irDotEl.style.boxShadow = '0 0 4px #00ff44';
      _bugEls.ctDotEl.style.background = 'transparent';
      _bugEls.ctDotEl.style.boxShadow = 'none';
    }

    // ── Panel tint (possessing team gets subtle background) ──
    var ctColor = ct.accent;
    var irColor = ir.accent;
    if (ctHasBall) {
      _bugEls.ctPanel.style.background = 'linear-gradient(180deg,' + ctColor + '18,' + ctColor + '08)';
      _bugEls.ctScoreEl.style.textShadow = '0 0 12px ' + ctColor + '60';
      _bugEls.ctNameEl.style.textShadow = '0 0 8px ' + ctColor + '40';
      _bugEls.ctNameEl.style.opacity = '1';
      _bugEls.irPanel.style.background = 'transparent';
      _bugEls.irScoreEl.style.textShadow = '';
      _bugEls.irNameEl.style.textShadow = '';
      _bugEls.irNameEl.style.opacity = '0.6';
    } else {
      _bugEls.irPanel.style.background = 'linear-gradient(180deg,' + irColor + '18,' + irColor + '08)';
      _bugEls.irScoreEl.style.textShadow = '0 0 12px ' + irColor + '60';
      _bugEls.irNameEl.style.textShadow = '0 0 8px ' + irColor + '40';
      _bugEls.irNameEl.style.opacity = '1';
      _bugEls.ctPanel.style.background = 'transparent';
      _bugEls.ctScoreEl.style.textShadow = '';
      _bugEls.ctNameEl.style.textShadow = '';
      _bugEls.ctNameEl.style.opacity = '0.6';
    }

    // ── Center panel: normal vs 2-min mode ──
    if (s.twoMinActive) {
      // 2-min mode: show clock + label, hide half/snap
      _bugEls.halfEl.style.display = 'none';
      _bugEls.snapEl.style.display = 'none';
      _bugEls.clockEl.style.display = '';
      _bugEls.clockLabel.style.display = '';
      _bugEls.clockEl.textContent = fmtClock(Math.max(0, s.clockSeconds));
      var clockColor = s.clockSeconds > 60 ? '#e03050' : s.clockSeconds > 30 ? '#EBB010' : '#ff0040';
      _bugEls.clockEl.style.color = clockColor;
      if (s.clockSeconds <= 10 && s.clockSeconds > 0) {
        _bugEls.clockEl.style.animation = 'clockPulse 0.5s ease-in-out infinite';
      } else if (s.clockSeconds <= 30) {
        _bugEls.clockEl.style.animation = 'clockPulse 1s ease-in-out infinite';
      } else {
        _bugEls.clockEl.style.animation = '';
      }
    } else {
      // Normal mode: show half/snap, hide clock
      _bugEls.halfEl.style.display = '';
      _bugEls.snapEl.style.display = '';
      _bugEls.clockEl.style.display = 'none';
      _bugEls.clockLabel.style.display = 'none';
      _bugEls.halfEl.textContent = s.half === 1 ? 'FIRST HALF' : 'SECOND HALF';
      _bugEls.snapEl.textContent = s.playsUsed + '/' + (gs.playsPerHalf || 20);
    }

    // ── Down & distance ──
    const distStr = conversionMode ? 'GOAL' : distLabel(s.distance, s.yardsToEndzone);
    var newDown = s.down;
    var newDist = s.distance;
    var downChanged = newDown !== _prevDown || newDist !== _prevDist;
    _bugEls.downEl.textContent = dn + ' & ' + distStr;
    _bugEls.downEl.style.color = s.twoMinActive ? '#e03050' : '#FF6B00';
    if (downChanged && _prevDown > 0) {
      if (newDown === 1 && _prevDown > 1) {
        // Fresh set of downs — bigger animation + gold flash
        try {
          gsap.killTweensOf(_bugEls.downEl);
          gsap.fromTo(_bugEls.downEl,
            { x: 20, opacity: 0, scale: 1.25 },
            { x: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }
          );
          _bugEls.downEl.style.color = '#EBB010';
          _setTimeout(function() { _bugEls.downEl.style.color = s.twoMinActive ? '#e03050' : '#FF6B00'; }, 600);
        } catch(e) {}
      } else {
        // Normal down change — slide in from right with scale pop
        try {
          gsap.killTweensOf(_bugEls.downEl);
          gsap.fromTo(_bugEls.downEl,
            { x: 15, opacity: 0, scale: 1.15 },
            { x: 0, opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.5)' }
          );
        } catch(e) {}
      }
    }
    _prevDown = newDown;
    _prevDist = newDist;

    // ── Ball position ──
    const ydsToEz = s.yardsToEndzone;
    const ballPos = ydsToEz === 50 ? '50' : ydsToEz < 50 ? 'OPP ' + ydsToEz : 'OWN ' + (100 - ydsToEz);
    var ballPosChanged = ballPos !== _prevBallPos;
    _bugEls.ballEl.textContent = 'BALL ON ' + ballPos;
    if (ballPosChanged && _prevBallPos !== -1) {
      try {
        gsap.killTweensOf(_bugEls.ballEl);
        gsap.fromTo(_bugEls.ballEl,
          { y: 5, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }
        );
      } catch(e) {}
    }
    _prevBallPos = ballPos;

    // Red zone label
    if (gs.possession === hAbbr && s.yardsToEndzone <= 20) {
      _bugEls.ballEl.style.color = '#ff0040';
      _bugEls.ballEl.style.textShadow = '0 0 8px rgba(255,0,64,0.4)';
    } else {
      _bugEls.ballEl.style.color = '#666';
      _bugEls.ballEl.style.textShadow = '';
    }

    // Play clock bar update
    if (_bugEls.playClockFill) {
      if (s.twoMinActive) {
        // 2-minute drill: show time remaining as percentage
        var timePct = Math.max(0, Math.min(100, (s.clockSeconds / 120) * 100));
        _bugEls.playClockFill.style.width = timePct + '%';
        _bugEls.playClockFill.style.background = s.clockSeconds <= 30 ? '#ff0040' : s.clockSeconds <= 60 ? '#EBB010' : '#00ff44';
      } else {
        // Regular play: show plays remaining (20 per half)
        var playsLeft = Math.max(0, 20 - s.playsUsed);
        var playPct = (playsLeft / 20) * 100;
        _bugEls.playClockFill.style.width = playPct + '%';
        _bugEls.playClockFill.style.background = playsLeft <= 5 ? '#ff0040' : playsLeft <= 10 ? '#EBB010' : '#555';
      }
    }

    drawTorchBanner();

    // Dim non-active UI during tutorial
    var _isTut = _tutorialStep > 0 && snapCount === 0;
    bug.style.opacity = _isTut ? '0.2' : '';
    bug.style.pointerEvents = _isTut ? 'none' : '';
    torchBanner.style.opacity = _isTut ? '0.2' : '';
    torchBanner.style.pointerEvents = _isTut ? 'none' : '';
    stripWrap.style.opacity = _isTut ? '0.3' : '';

    // One-time tooltip: play counter (after 3rd snap — give them time to settle in)
    if (!_playCounterTipShown && s.playsUsed >= 3 && !_isTut && !s.twoMinActive) {
      _playCounterTipShown = true;
      showBugTooltip(_bugEls.snapEl, s.playsUsed + ' of ' + (gs.playsPerHalf || 20) + ' plays used this half. Then the 2-minute drill begins.', 'torch_tip_playcounter');
    }

    // One-time hint: scorebug is tappable for stats (after 5th snap)
    if (!_statsTipShown && s.playsUsed >= 5 && !_isTut && !s.twoMinActive) {
      _statsTipShown = true;
      localStorage.setItem('torch_tip_stats', '1');
      var statHint = document.createElement('div');
      statHint.style.cssText = "text-align:center;padding:2px;font-family:'Rajdhani';font-weight:700;font-size:9px;color:#555;letter-spacing:1px;cursor:pointer;";
      statHint.textContent = 'TAP SCOREBOARD FOR GAME STATS';
      statHint.onclick = function() { bug.click(); };
      bug.appendChild(statHint);
      _setTimeout(function() {
        if (statHint.parentNode) {
          try { gsap.to(statHint, { opacity: 0, duration: 0.3, onComplete: function() { statHint.remove(); } }); }
          catch(e) { statHint.remove(); }
        }
      }, 6000);
    }

    // One-time tooltip: 2-minute drill (first time it activates)
    if (!_2minTipShown && s.twoMinActive) {
      _2minTipShown = true;
      showBugTooltip(_bugEls.clockEl, '2-MINUTE DRILL! Clock runs on completions and runs. Incompletes and spikes stop it.', 'torch_tip_2min');
    }
  }
  var _playCounterTipShown = true; // Onboarding disabled — will revisit
  var _2minTipShown = true;
  var _statsTipShown = true;

  function showBugTooltip(anchor, text, storageKey) {
    if (!anchor) return;
    if (storageKey) localStorage.setItem(storageKey, '1');
    var tip = document.createElement('div');
    tip.style.cssText = "position:absolute;left:50%;transform:translateX(-50%);top:100%;margin-top:4px;z-index:100;padding:8px 12px;background:rgba(10,8,4,0.95);border:1px solid #EBB01044;border-radius:6px;max-width:260px;text-align:center;pointer-events:auto;";
    tip.innerHTML =
      "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:12px;color:#ccc;line-height:1.3;\">" + text + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#EBB010;letter-spacing:1px;margin-top:4px;cursor:pointer;\">GOT IT</div>";
    tip.onclick = function(e) {
      e.stopPropagation();
      try { gsap.to(tip, { opacity: 0, y: -4, duration: 0.2, onComplete: function() { tip.remove(); } }); }
      catch(err) { tip.remove(); }
    };
    var parent = anchor.parentNode;
    if (parent) { parent.style.position = 'relative'; parent.appendChild(tip); }
    _setTimeout(function() {
      if (tip.parentNode) {
        try { gsap.to(tip, { opacity: 0, y: -4, duration: 0.2, onComplete: function() { tip.remove(); } }); }
        catch(err) { tip.remove(); }
      }
    }, 8000);
  }

  // ── TORCH POINTS BANNER (built once, updated in place) ──
  const torchBanner = document.createElement('div'); torchBanner.className = 'T-torch-banner'; el.appendChild(torchBanner);
  var _torchDisplayFrozen = false;
  var _torchFrozenValue = 0;
  var _prevCardCount = -1;
  // Build once
  var _tbFlameSvg = '<svg class="T-torch-banner-flame" viewBox="0 0 44 56" width="20" height="26" fill="#FF4511"><path d="M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z"/></svg>';
  torchBanner.innerHTML =
    '<div class="T-torch-banner-border"></div>' +
    '<div class="T-torch-banner-content">' +
      '<div style="position:absolute;inset:0;opacity:0.03;pointer-events:none;background:repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(255,255,255,0.5) 2px,rgba(255,255,255,0.5) 3px);"></div>' +
      _tbFlameSvg +
      '<div class="T-torch-banner-label">TORCH</div>' +
      '<div class="T-torch-banner-sep"></div>' +
      '<div class="T-torch-banner-pts">0</div>' +
      _tbFlameSvg +
      '<span id="torch-cards-btn" style="display:none;position:absolute;right:12px;top:50%;transform:translateY(-50%);font-family:\'Teko\';font-weight:700;font-size:11px;letter-spacing:1px;padding:3px 8px;border-radius:4px;border:1px solid ' + hTeam.accent + '88;background:rgba(255,69,17,0.06);color:' + hTeam.accent + ';cursor:pointer;text-shadow:0 0 6px ' + hTeam.accent + '40;box-shadow:0 0 8px ' + hTeam.accent + '20;"></span>' +
    '</div>' +
    '<div class="T-torch-banner-border"></div>';
  var torchBannerPtsEl = torchBanner.querySelector('.T-torch-banner-pts');
  var _torchCardsBtn = torchBanner.querySelector('#torch-cards-btn');

  function drawTorchBanner() {
    var _s = gs.getSummary();
    var hTorch = hAbbr === 'CT' ? _s.ctTorchPts : _s.irTorchPts;
    var displayVal = _torchDisplayFrozen ? _torchFrozenValue : hTorch;
    // Update points text only
    if (torchBannerPtsEl) torchBannerPtsEl.textContent = displayVal;
    // Update cards button only when count changes
    var cardCount = torchInventory.length;
    if (cardCount !== _prevCardCount) {
      _prevCardCount = cardCount;
      if (cardCount > 0) {
        _torchCardsBtn.textContent = cardCount + ' CARD' + (cardCount > 1 ? 'S' : '');
        _torchCardsBtn.style.display = '';
      } else {
        _torchCardsBtn.style.display = 'none';
      }
    }
  }
  drawTorchBanner();

  // CARDS button on torch banner opens inventory
  torchBanner.addEventListener('click', function(e) {
    if (!e.target.id || e.target.id !== 'torch-cards-btn') return;
    if (torchInventory.length === 0) return;
    var trayOv = document.createElement('div');
    trayOv.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:auto;';
    var trayBd = document.createElement('div');
    trayBd.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.5);';
    trayBd.onclick = function() { trayOv.remove(); };
    trayOv.appendChild(trayBd);
    var tray = document.createElement('div');
    tray.style.cssText = 'position:relative;z-index:1;background:#141008;border-top:2px solid #EBB010;border-radius:12px 12px 0 0;padding:14px 12px 20px;';
    var _s = gs.getSummary();
    var hTorch = hAbbr === 'CT' ? _s.ctTorchPts : _s.irTorchPts;
    tray.innerHTML = "<div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;\"><div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#EBB010;letter-spacing:2px;\">YOUR TORCH CARDS</div><div style=\"font-family:'Rajdhani';font-weight:700;font-size:13px;color:#00ff44;\">" + hTorch + " PTS</div></div>";
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:10px;justify-content:center;';
    torchInventory.forEach(function(tc) {
      var ce = buildTorchCard(tc, 100, 140);
      row.appendChild(ce);
    });
    tray.appendChild(row);
    trayOv.appendChild(tray);
    el.appendChild(trayOv);
  });

  // Balatro-style TORCH points animation
  var _torchAnimating = false;
  function animateTorchBannerPts(earned) {
    if (!torchBannerPtsEl || _torchAnimating) return;
    _torchAnimating = true;
    var _s = gs.getSummary();
    var hTorch = hAbbr === 'CT' ? _s.ctTorchPts : _s.irTorchPts;
    var startVal = hTorch - earned;
    var endVal = hTorch;

    // Scale up + glow pulse
    torchBannerPtsEl.style.transform = 'scale(1.2)';
    torchBannerPtsEl.style.textShadow = '0 0 20px #EBB010, 0 0 40px rgba(235,176,16,0.5)';
    torchBanner.style.boxShadow = '0 0 16px rgba(235,176,16,0.3)';

    // Count up from old to new over 500ms
    var duration = 500;
    var start = performance.now();
    function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      var val = Math.round(startVal + (endVal - startVal) * t);
      torchBannerPtsEl.textContent = val;
      if (t < 1) { requestAnimationFrame(tick); }
      else {
        // Settle back
        torchBannerPtsEl.style.transform = 'scale(1)';
        torchBannerPtsEl.style.textShadow = '0 0 12px #EBB010';
        torchBanner.style.boxShadow = '';
        _torchAnimating = false;
      }
    }
    requestAnimationFrame(tick);
  }

  // ── FIELD STRIP (Canvas + Card Overlay) ──
  var stripWrap = document.createElement('div');
  stripWrap.style.cssText = 'position:relative;flex-shrink:0;';
  const strip = document.createElement('div'); strip.className = 'T-strip';
  stripWrap.appendChild(strip);

  // Gutter-based LOS + FD indicator system (right 17% of strip)
  var _gutterBg = document.createElement('div');
  _gutterBg.style.cssText = 'position:absolute;top:0;bottom:0;left:83%;right:0;background:rgba(0,0,0,0.2);border-left:1px solid rgba(255,255,255,0.03);z-index:1;pointer-events:none;';
  // 5 evenly-spaced yard lines in the gutter
  for (var _gi = 1; _gi <= 5; _gi++) {
    var _yl = document.createElement('div');
    _yl.style.cssText = 'position:absolute;left:4px;right:0;height:1px;background:rgba(255,255,255,0.05);top:' + (_gi * (100/6)) + '%;';
    _gutterBg.appendChild(_yl);
  }
  stripWrap.appendChild(_gutterBg);
  var _losLine = document.createElement('div');
  _losLine.style.cssText = 'position:absolute;left:83%;right:0;height:2.5px;z-index:12;pointer-events:none;';
  stripWrap.appendChild(_losLine);
  var _fdLine = document.createElement('div');
  _fdLine.style.cssText = 'position:absolute;left:83%;right:0;height:2.5px;z-index:12;pointer-events:none;';
  stripWrap.appendChild(_fdLine);
  var _zoneFill = document.createElement('div');
  _zoneFill.style.cssText = 'position:absolute;left:83%;right:0;z-index:11;pointer-events:none;display:none;';
  stripWrap.appendChild(_zoneFill);
  var _pillWrap = document.createElement('div');
  _pillWrap.style.cssText = 'position:absolute;top:0;bottom:0;right:3px;z-index:13;pointer-events:none;';
  stripWrap.appendChild(_pillWrap);

  // Canvas field renderer — layered behind card drop zones
  var _fieldAnimator = null;
  var _fieldCanvas = null;
  function initFieldCanvas() {
    if (_fieldAnimator) return;
    var w = strip.offsetWidth || 375;
    var h = strip.offsetHeight || 160;
    if (w < 50 || h < 50) return; // Not mounted yet
    _fieldAnimator = createFieldAnimator(w, h);
    _fieldCanvas = _fieldAnimator.canvas;
    _fieldCanvas.style.cssText = 'position:absolute;inset:0;z-index:0;width:100%;height:100%;border-radius:inherit;';
    strip.insertBefore(_fieldCanvas, strip.firstChild);
  }
  // Weather particle effects removed — field stays clean
  // Weather ambient audio (Web Audio API — no files needed)
  var _weatherAudioCtx = null;
  var _weatherNodes = [];
  function startWeatherAudio(wId) {
    if (wId === 'clear' || wId === 'heat') return;
    try {
      _weatherAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      // Resume for iOS (AudioContext created outside user gesture)
      if (_weatherAudioCtx.state === 'suspended') _weatherAudioCtx.resume();
      var gain = _weatherAudioCtx.createGain();
      gain.gain.value = 0.03;
      gain.connect(_weatherAudioCtx.destination);
      if (wId === 'rain') {
        var bufferSize = 2 * _weatherAudioCtx.sampleRate;
        var buffer = _weatherAudioCtx.createBuffer(1, bufferSize, _weatherAudioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        var noise = _weatherAudioCtx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        var filter = _weatherAudioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 4000;
        noise.connect(filter);
        filter.connect(gain);
        noise.start();
        _weatherNodes.push(noise);
        gain.gain.value = 0.015;
      } else if (wId === 'wind') {
        var osc = _weatherAudioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 120;
        var lfo = _weatherAudioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.3;
        var lfoGain = _weatherAudioCtx.createGain();
        lfoGain.gain.value = 40;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(gain);
        osc.start();
        lfo.start();
        _weatherNodes.push(osc, lfo);
        gain.gain.value = 0.02;
      } else if (wId === 'snow') {
        var bufSize = 2 * _weatherAudioCtx.sampleRate;
        var buf = _weatherAudioCtx.createBuffer(1, bufSize, _weatherAudioCtx.sampleRate);
        var d = buf.getChannelData(0);
        for (var j = 0; j < bufSize; j++) d[j] = Math.random() * 2 - 1;
        var src = _weatherAudioCtx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        var lpf = _weatherAudioCtx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.value = 800;
        src.connect(lpf);
        lpf.connect(gain);
        src.start();
        _weatherNodes.push(src);
        gain.gain.value = 0.01;
      }
    } catch(e) { /* Web Audio not supported — silent fallback */ }
  }
  function stopWeatherAudio() {
    _weatherNodes.forEach(function(n) { try { n.stop(); } catch(e) {} });
    _weatherNodes = [];
    if (_weatherAudioCtx) { try { _weatherAudioCtx.close(); } catch(e) {} _weatherAudioCtx = null; }
  }
  if (FEATURES.weatherAudio) startWeatherAudio(weatherId);
  el.appendChild(stripWrap);
  function drawField() {
    const s = gs.getSummary();
    const isOff = gs.possession === hAbbr;
    const ct = hTeam, ir = oTeam;
    const homeTeam = getTeam(GS.team);
    const lp = 7 + s.ballPosition * .86;
    const td = s.possession==='CT' ? s.ballPosition+s.distance : s.ballPosition-s.distance;
    const tp = 7 + Math.max(0,Math.min(100,td)) * .86;
    const pc = s.possession==='CT' ? ct.accent : ir.accent;

    // Canvas field render (behind DOM overlay)
    initFieldCanvas();
    if (_fieldAnimator) {
      var ballYard = s.ballPosition + 10; // 0-100 → 10-110 (matches canvas yard line scale)
      var firstDownYard = ballYard + (isOff ? s.distance : -s.distance);
      var offTeamId = isOff ? GS.team : (GS.opponent || 'wolves');
      var defTeamId = isOff ? (GS.opponent || 'wolves') : GS.team;
      var formation = 'shotgun_deuce';
      if (selPl && _fieldAnimator.PLAY_FORMATION_MAP) {
        formation = _fieldAnimator.pickFormation
          ? _fieldAnimator.pickFormation(selPl.playType || 'SHORT', offTeamId)
          : (_fieldAnimator.PLAY_FORMATION_MAP[selPl.playType] || 'shotgun_deuce');
      }
      _fieldAnimator.render({
        ballYard: Math.max(10, Math.min(110, ballYard)),
        losYard: null,
        firstDownYard: null,
        formation: formation,
        offTeam: offTeamId,
        defTeam: defTeamId,
        skipDots: true,
        skipLOS: true,
      });
    }

    // Ball position indicator bar
    var ydsToEz = gs.yardsToEndzone();
    var ballPct = 7 + s.ballPosition * 0.86; // same math as lp
    // Position LOS and FD lines to match canvas yard lines exactly.
    // Lines are children of stripWrap. Canvas is child of strip which is child of stripWrap.
    // We need pixel offset from stripWrap's top edge to where the yard line appears on screen.
    // Position LOS + FD lines to match canvas yard lines.
    // Canvas uses ballYard = ballPosition * 1.1 + 5 to map 0-100 → 5-115.
    // Canvas yard numbers: "20" is at absolute yard 30 (nyd-10 display).
    // For DOM overlay we use the same ballYard and same viewport math.
    var _byrd = s.ballPosition + 10; // same transform as canvas render call
    var _visYards = 25;
    var _cntr = Math.max(_visYards / 2, Math.min(120 - _visYards / 2, _byrd));
    var _topYard = _cntr - _visYards / 2;
    var _h = strip.clientHeight || 136;
    var _ypx = _h / _visYards;

    // LOS + FD lines — gutter only (right 17%)
    var _losPx = ((_byrd - _topYard) * _ypx) - 1;
    var _fdYard = _byrd + (isOff ? s.distance : -s.distance);
    var _fdPx = ((_fdYard - _topYard) * _ypx) - 1;
    var _fdVisible = _fdPx >= -3 && _fdPx <= _h + 3;
    var _gap = Math.abs(_fdPx - _losPx);
    var _mode = _gap < 8 ? 'merged' : _gap < 18 ? 'stacked' : 'separated';

    // Color rules
    var _isRedZone = ydsToEz <= 20 && gs.possession === hAbbr;
    var _losColor = _isRedZone ? '#ff0040' : '#4DA6FF';
    var _fdColor = (ydsToEz <= 10) ? '#ff0040' : '#EBB010';
    var _yardDisplay = ydsToEz <= 5 ? 'GL' : ydsToEz === 50 ? '50' : ydsToEz <= 50 ? ydsToEz : (100 - ydsToEz);
    var _fdText = ydsToEz <= 10 ? 'TD' : '1ST';

    // LOS line
    _losLine.style.top = _losPx + 'px';
    _losLine.style.background = _losColor;
    _losLine.style.boxShadow = '0 0 10px ' + _losColor + '66';

    // FD line
    if (_fdVisible && _mode !== 'merged') {
      _fdLine.style.top = _fdPx + 'px';
      _fdLine.style.background = _fdColor;
      _fdLine.style.boxShadow = '0 0 8px ' + _fdColor + '55';
      _fdLine.style.display = '';
    } else {
      _fdLine.style.display = 'none';
    }

    // Zone fill between lines
    if (_fdVisible && _mode !== 'merged') {
      var _zTop = Math.min(_losPx, _fdPx);
      var _zBot = Math.max(_losPx, _fdPx);
      _zoneFill.style.top = _zTop + 'px';
      _zoneFill.style.height = (_zBot - _zTop) + 'px';
      _zoneFill.style.background = _fdColor + '0a';
      _zoneFill.style.display = '';
    } else {
      _zoneFill.style.display = 'none';
    }

    // Pill labels
    var _losPillColor = _losColor;
    var _losPillTextColor = '#fff';
    var _fdPillColor = _fdColor;
    var _fdPillTextColor = _fdColor === '#ff0040' ? '#fff' : '#000';
    var _pillStyle = "font-family:'Oswald';font-weight:700;font-size:{FS}px;letter-spacing:0.5px;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.5);padding:1px {PD}px;line-height:1.2;";

    if (_mode === 'separated' && _fdVisible) {
      // Individual pills above each line
      _pillWrap.innerHTML =
        '<div style="position:absolute;right:0;top:' + _losPx + 'px;transform:translateY(calc(-100% - 3px));' + _pillStyle.replace('{FS}','9').replace('{PD}','6') + 'color:' + _losPillTextColor + ';background:' + _losPillColor + ';border-radius:3px;">' + _yardDisplay + '</div>' +
        '<div style="position:absolute;right:0;top:' + _fdPx + 'px;transform:translateY(calc(-100% - 3px));' + _pillStyle.replace('{FS}','9').replace('{PD}','6') + 'color:' + _fdPillTextColor + ';background:' + _fdPillColor + ';border-radius:3px;">' + _fdText + '</div>';
    } else if (_mode === 'stacked' && _fdVisible) {
      // Stacked pills between the two lines
      var _mid = (_losPx + _fdPx) / 2;
      _pillWrap.innerHTML =
        '<div style="position:absolute;right:0;top:' + _mid + 'px;transform:translateY(-50%);display:flex;flex-direction:column;">' +
          '<div style="' + _pillStyle.replace('{FS}','8').replace('{PD}','4') + 'color:' + _losPillTextColor + ';background:' + _losPillColor + ';border-radius:3px 3px 0 0;">' + _yardDisplay + '</div>' +
          '<div style="' + _pillStyle.replace('{FS}','8').replace('{PD}','4') + 'color:' + _fdPillTextColor + ';background:' + _fdPillColor + ';border-radius:0 0 3px 3px;">' + _fdText + '</div>' +
        '</div>';
    } else {
      // Merged — stacked pills at LOS
      _pillWrap.innerHTML =
        '<div style="position:absolute;right:0;top:' + _losPx + 'px;transform:translateY(-50%);display:flex;flex-direction:column;">' +
          '<div style="' + _pillStyle.replace('{FS}','8').replace('{PD}','4') + 'color:' + _losPillTextColor + ';background:' + _losPillColor + ';border-radius:3px 3px 0 0;">' + _yardDisplay + '</div>' +
          (_fdVisible ? '<div style="' + _pillStyle.replace('{FS}','8').replace('{PD}','4') + 'color:' + _fdPillTextColor + ';background:' + _fdPillColor + ';border-radius:0 0 3px 3px;">' + _fdText + '</div>' : '') +
        '</div>';
    }

    // Red zone tint + glow
    var isInRedZone = _isRedZone;
    if (isInRedZone) {
      stripWrap.style.boxShadow = 'inset 0 0 20px rgba(255,0,64,0.05)';
      strip.style.background = 'rgba(255,0,64,0.03)';
      // Red zone: SNAP button shifts to red gradient
      el.classList.add('T-redzone');
    } else {
      stripWrap.style.boxShadow = '';
      strip.style.background = '';
      el.classList.remove('T-redzone');
    }

    // Subtle possession tint on field strip border
    stripWrap.style.borderBottom = '2px solid ' + (isOff ? hTeam.accent + '44' : oTeam.accent + '44');
    if (isInRedZone && !_wasInRedZone) {
      _wasInRedZone = true;
      var rzFlash = document.createElement('div');
      rzFlash.style.cssText = "position:fixed;top:35%;left:50%;transform:translateX(-50%);z-index:650;font-family:'Teko';font-weight:700;font-size:28px;color:#ff0040;letter-spacing:4px;text-shadow:0 0 20px rgba(255,0,64,0.6);pointer-events:none;opacity:0;";
      rzFlash.textContent = 'RED ZONE';
      el.appendChild(rzFlash);
      try {
        gsap.to(rzFlash, { opacity: 1, duration: 0.3, ease: 'back.out(1.5)' });
        gsap.to(rzFlash, { opacity: 0, y: -20, duration: 0.4, delay: 1.2, onComplete: function() { rzFlash.remove(); } });
      } catch(e) { setTimeout(function() { rzFlash.remove(); }, 2000); }
    } else if (!isInRedZone) {
      _wasInRedZone = false;
    }

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
    // During tutorial: show instructional text + flash on the active slot
    var isTut = _tutorialStep > 0 && snapCount === 0;
    var isTutPlay = _tutorialStep === 1 && snapCount === 0;
    var isTutPlayer = _tutorialStep === 2 && snapCount === 0;
    var isTutSnap = _tutorialStep === 3 && snapCount === 0;
    const playLbl = 'TAP<br><br>PLAY<br><br>CARD';
    if (selPl) {
      h += '<div class="T-placed T-placed-play" id="T-placed-play-slot"></div>';
    } else {
      var playDimStyle = (isTut && !isTutPlay) ? 'opacity:0.15;pointer-events:none;' : '';
      var playDropClass = 'T-drop T-drop-play T-drop-active' + (isTutPlay ? ' T-drop-tutorial' : '');
      h += '<div class="' + playDropClass + '" data-drop="play" style="' + playDimStyle + '"><span class="T-drop-lbl">' + playLbl + '</span></div>';
    }

    const playerLbl = 'TAP<br><br>PLAYER<br><br>CARD';
    if (selP) {
      h += '<div class="T-placed T-placed-player" id="T-placed-player-slot"></div>';
    } else {
      var playerDimStyle = (isTut && !isTutPlayer) ? 'opacity:0.15;pointer-events:none;' : '';
      var playerDropClass = 'T-drop T-drop-player T-drop-active' + (isTutPlayer ? ' T-drop-tutorial-player' : '');
      h += '<div class="' + playerDropClass + '" data-drop="player" style="' + playerDimStyle + '"><span class="T-drop-lbl">' + playerLbl + '</span></div>';
    }

    if (selTorch) {
      h += '<div class="T-placed T-placed-torch" id="T-placed-torch-slot"></div>';
    } else {
      const hasTorchCards = torchInventory.length > 0;
      var _flameSvg = '<svg viewBox="0 0 44 44" width="16" height="18" fill="none" style="display:block;margin:0 auto 2px;animation:T-flame-pulse 2s ease-in-out infinite;filter:drop-shadow(0 0 4px ' + hTeam.accent + ')"><defs><linearGradient id="tf' + hTeam.accent.replace('#','') + '" x1="22" y1="40" x2="22" y2="0"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="' + hTeam.accent + '"/></linearGradient></defs><path d="M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z" fill="url(#tf' + hTeam.accent.replace('#','') + ')"/></svg>';
      const torchLbl = hasTorchCards
        ? (phase === 'torch' ? 'TAP<br><br>TORCH<br><br>CARD' : _flameSvg + '<span class="T-torch-brand" style="color:' + hTeam.accent + '">TORCH</span>')
        : _flameSvg + '<span class="T-torch-brand" style="color:' + hTeam.accent + '">TORCH</span>';
      var torchDimStyle = (isTut && !isTutSnap) ? 'opacity:0.15;pointer-events:none;' : '';
      h += '<div class="T-drop T-drop-torch' + (phase==='torch'?' T-drop-active':'') + '" data-drop="torch" style="' + torchDimStyle + '"><span class="T-drop-lbl">' + torchLbl + '</span></div>';
    }

    strip.innerHTML = h;

    // Re-insert canvas field behind everything (strip.innerHTML destroys it)
    if (_fieldCanvas && _fieldCanvas.parentNode !== strip) {
      strip.insertBefore(_fieldCanvas, strip.firstChild);
    }
    // Re-insert ball position indicator (also destroyed by innerHTML)
    // LOS/FD lines are on stripWrap, not strip — no re-insert needed

    // Append actual shared-builder DOM cards into placed slots with lock-in animation
    // Each placed slot is tappable to deselect the card
    if (selPl) {
      var playSlot = strip.querySelector('#T-placed-play-slot');
      if (playSlot) {
        if (_tutorialStep > 0 && snapCount === 0) {
          playSlot.style.opacity = '0.3';
          playSlot.style.pointerEvents = 'none';
        } else {
          playSlot.style.cursor = 'pointer';
          playSlot.onclick = function() {
            SND.select();
            try { gsap.to(playSlot, { y: -30, opacity: 0, scale: 0.85, duration: 0.2, ease: 'power2.in', onComplete: function() {
              selPl = null; phase = 'play'; drawField(); drawPanel();
            }}); } catch(e) { selPl = null; phase = 'play'; drawField(); drawPanel(); }
          };
        }
        var playEl = mkPlayCardEl(selPl);
        playEl.style.width = '100%';
        playEl.style.height = '100%';
        playSlot.appendChild(playEl);
        try {
          gsap.from(playSlot, { y: 40, scale: 0.8, opacity: 0, duration: 0.35, ease: 'power2.out' });
          _setTimeout(function() { SND.cardThud(); }, 300);
        } catch(e) {}
      }
    }
    if (selP) {
      var playerSlot = strip.querySelector('#T-placed-player-slot');
      if (playerSlot) {
        if (_tutorialStep > 0 && snapCount === 0) {
          playerSlot.style.opacity = '0.3';
          playerSlot.style.pointerEvents = 'none';
        } else {
          playerSlot.style.cursor = 'pointer';
          playerSlot.onclick = function() {
            SND.select();
            try { gsap.to(playerSlot, { y: -30, opacity: 0, scale: 0.85, duration: 0.2, ease: 'power2.in', onComplete: function() {
              selP = null; phase = 'play'; drawField(); drawPanel();
            }}); } catch(e) { selP = null; phase = 'play'; drawField(); drawPanel(); }
          };
        }
        var playerEl = mkPlayerCardEl(selP, hTeam);
        playerEl.style.width = '100%';
        playerEl.style.height = '100%';
        playerSlot.appendChild(playerEl);
        // Add player game stats to placed card
        var _pStats = selP.id ? _playerGameStats[selP.id] : null;
        if (_pStats) {
          // Compact stat format for field card
          var _d = '<span style="opacity:0.55">', _e = '</span>';
          var _parts = [];
          if (_pStats.passComp || _pStats.passAtt) _parts.push((_pStats.passComp||0)+'/'+(_pStats.passAtt||0)+' '+(_pStats.passYds||0)+' '+_d+'YD'+_e);
          else if (_pStats.rec) _parts.push((_pStats.recYds||0)+' '+_d+'YD'+_e);
          else if (_pStats.rushAtt) _parts.push(_pStats.rushAtt+' '+_d+'CAR'+_e+' '+(_pStats.rushYds||0)+' '+_d+'YD'+_e);
          var _counts = [];
          if (_pStats.td) _counts.push(_pStats.td+' '+_d+'TD'+_e);
          if (_pStats.rec) _counts.push(_pStats.rec+' '+_d+'REC'+_e);
          if (_pStats.tkl) _counts.push(_pStats.tkl+' '+_d+'TKL'+_e);
          if (_pStats.sack) _counts.push(_pStats.sack+' '+_d+'SCK'+_e);
          if (_pStats.int) _counts.push(_pStats.int+' '+_d+'INT'+_e);
          if (_pStats.pbu) _counts.push(_pStats.pbu+' '+_d+'PBU'+_e);
          _parts = _parts.concat(_counts.slice(0, 2));
          if (_parts.length > 0) {
            var _statsBarEl = playerEl.querySelector('.player-stats-bar');
            if (_statsBarEl) {
              _statsBarEl.innerHTML = "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:10px;color:#fff;text-align:center;letter-spacing:0.3px;white-space:nowrap;line-height:1;\">" + _parts.join(' ') + "</div>";
            }
          }
        }
        try {
          gsap.from(playerSlot, { y: 40, scale: 0.8, opacity: 0, duration: 0.35, ease: 'power2.out' });
          _setTimeout(function() { SND.cardThud(); }, 300);
        } catch(e) {}
      }
    }
    if (selTorch) {
      var torchSlot = strip.querySelector('#T-placed-torch-slot');
      if (torchSlot) {
        torchSlot.style.cursor = 'pointer';
        torchSlot.onclick = function() {
          SND.select();
          try { gsap.to(torchSlot, { y: -30, opacity: 0, scale: 0.85, duration: 0.2, ease: 'power2.in', onComplete: function() {
            var tcObj = TORCH_CARDS.find(function(c) { return c.id === selTorch; });
            if (selectedPreSnap || tcObj) { torchInventory.push(selectedPreSnap || tcObj); if (GS.season) GS.season.torchCards = torchInventory.slice(); }
            selTorch = null; selectedPreSnap = null;
            phase = (selPl && selP) ? 'torch' : 'play';
            drawField(); drawPanel();
          }}); } catch(e) {
            var tcObj = TORCH_CARDS.find(function(c) { return c.id === selTorch; });
            if (selectedPreSnap || tcObj) { torchInventory.push(selectedPreSnap || tcObj); if (GS.season) GS.season.torchCards = torchInventory.slice(); }
            selTorch = null; selectedPreSnap = null; phase = (selPl && selP) ? 'torch' : 'play'; drawField(); drawPanel();
          }
        };
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

  // ── DRIVE SUMMARY PANEL (replaces old play-by-play booth) ──
  const driveSummaryEl = document.createElement('div'); driveSummaryEl.className = 'T-drive'; driveSummaryEl.style.display = 'none'; el.appendChild(driveSummaryEl);

  // Keep narr as a virtual container for backward compat — content mirrored into drive summary commentary
  const narr = document.createElement('div'); narr.className = 'T-narr'; narr.style.display = 'none';
  el.appendChild(narr);

  function setNarr(a, b, opts) {
    driveCommLine1 = a || '';
    driveCommLine2 = b || '';
    opts = opts || {};
    var bc = opts.biasColor || '#EBB010';

    var html = '<div class="T-narr" style="border-left:3px solid ' + bc + ';background:linear-gradient(90deg,' + bc + '08,transparent 30%);border-radius:0 6px 6px 0;padding:10px 12px;margin:4px 0;">';
    html += '<div style="font-family:\'Rajdhani\';font-weight:700;font-size:14px;color:#fff;line-height:1.3;">' + (a || '') + '</div>';
    if (b) html += '<div style="font-family:\'Rajdhani\';font-weight:600;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.25;margin-top:3px;">' + b + '</div>';
    // Badge row
    if (opts.yards !== undefined || opts.event) {
      html += '<div style="display:flex;align-items:center;gap:6px;margin-top:6px;">';
      if (opts.yards !== undefined) {
        var yBg = opts.yards > 0 ? '#00ff44' : opts.yards < 0 ? '#ff0040' : '#888';
        var yTxt = opts.yards > 0 ? '#000' : '#fff';
        var yLabel = opts.yards > 0 ? '+' + opts.yards + ' YDS' : opts.yards < 0 ? opts.yards + ' YDS' : 'NO GAIN';
        html += '<div style="font-family:\'Oswald\';font-weight:700;font-size:8px;padding:1px 5px;border-radius:3px;letter-spacing:0.5px;color:' + yTxt + ';background:' + yBg + ';">' + yLabel + '</div>';
      }
      if (opts.event) {
        html += '<div style="font-family:\'Rajdhani\';font-weight:700;font-size:9px;color:' + bc + ';letter-spacing:1px;">' + opts.event + '</div>';
      }
      if (opts.playName || opts.playerName) {
        var attr = [opts.playName, opts.playerName].filter(Boolean).join(' \u2192 ');
        html += '<div style="margin-left:auto;font-family:\'Rajdhani\';font-size:9px;color:#444;">' + attr + '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    narr.innerHTML = html;
    drawDriveSummary();
  }

  function drawDriveSummary() {
    var totalYds = 0, totalPlays = driveSummaryLog.length;
    driveSummaryLog.forEach(function(e) { totalYds += e.yards; });

    // Drive header — team-branded
    var possTeamObj = gs.possession === 'CT' ? hTeam : oTeam;
    var driveColor = possTeamObj.accent || '#FF6B00';
    var html = '<div class="T-drive-hdr">' +
      '<div class="T-drive-hdr-l" style="color:' + driveColor + '">' + possTeamObj.name + ' DRIVE</div>' +
      '<div class="T-drive-hdr-r" style="font-family:\'Teko\';font-size:16px;font-weight:700"><span style="color:' + driveColor + '">' + totalPlays + '</span> plays \u00b7 <span style="color:' + driveColor + '">' + totalYds + '</span> yds \u00b7 <span style="color:' + driveColor + '">' + driveFirstDowns + '</span> 1st dn</div>' +
      '</div>';

    // Play-by-play ticker rows (newest first)
    // Drive log — show last 4 plays full, compress older ones
    if (driveSummaryLog.length > 0) {
      var logLen = driveSummaryLog.length;

      // All entries (newest first)
      for (var _ti = logLen - 1; _ti >= 0; _ti--) {
        var e = driveSummaryLog[_ti];
        var isNewest = _ti === logLen - 1;
        var resColor, resText;
        if (e.isUserOff || e.isUserOff === undefined) {
          resColor = e.isTD ? '#EBB010' : e.yards > 0 ? '#00ff44' : e.yards < 0 || e.isSack ? '#ff0040' : '#fff';
          resText = e.isTD ? 'TD' : e.isSack ? 'SACK' : e.isInt ? 'INT' : e.isFumble ? 'FUM' : (e.isInc || e.yards === 0) ? 'NO GAIN' : (e.yards > 0 ? e.yards + ' YDS' : 'LOSS ' + Math.abs(e.yards));
        } else {
          if (e.isTD) { resColor = '#ff0040'; resText = 'TD'; }
          else if (e.isSack) { resColor = '#00ff44'; resText = 'SACK'; }
          else if (e.isInt) { resColor = '#00ff44'; resText = 'INT'; }
          else if (e.isFumble) { resColor = '#00ff44'; resText = 'FUM'; }
          else if (e.isInc || e.yards === 0) { resColor = '#00ff44'; resText = 'NO GAIN'; }
          else if (e.yards < 0) { resColor = '#00ff44'; resText = e.yards + ''; }
          else if (e.yards <= 3) { resColor = '#fff'; resText = '+' + e.yards; }
          else { resColor = '#ff0040'; resText = '+' + e.yards; }
        }
        var dn = ['','1st','2nd','3rd','4th'][e.down] || '';
        // Newest play highlighted with color tint + bigger text
        var drivePossColor = (gs.possession === 'CT' ? hTeam : oTeam).accent;
        var rowBg = isNewest ? 'background:' + resColor + '0d;' : '';
        var rowStyle = isNewest
          ? 'opacity:1;border-left:3px solid ' + drivePossColor + ';padding-left:6px;' + rowBg + 'animation:T-clash-yds 0.3s ease-out;'
          : 'opacity:0.5';
        var playFs = isNewest ? 'font-size:13px;font-weight:700;' : '';
        html += '<div class="T-drive-row" style="' + rowStyle + '">' +
          '<div class="T-drive-row-dd" style="color:' + drivePossColor + ';font-size:13px;font-weight:700">' + dn + ' & ' + (e.ydsToEz !== undefined && e.ydsToEz <= 10 ? 'GL' : e.dist) + '</div>' +
          '<div class="T-drive-row-play" style="' + playFs + '">' + e.playName + '</div>' +
          '<div class="T-drive-row-res" style="color:' + resColor + '">' + resText + '</div>' +
          '</div>';
      }
    }

    // Stat lines — show possessing team's OFF stats + defending team's DEF stats
    var isHumanBall = gs.possession === hAbbr;
    var offPA = isHumanBall ? hOffPassAtt : cOffPassAtt;
    var offPC = isHumanBall ? hOffPassComp : cOffPassComp;
    var offPY = isHumanBall ? hOffPassYds : cOffPassYds;
    var offRA = isHumanBall ? hOffRushAtt : cOffRushAtt;
    var offRY = isHumanBall ? hOffRushYds : cOffRushYds;
    var offRC = isHumanBall ? hOffRec : cOffRec;
    var offRCY = isHumanBall ? hOffRecYds : cOffRecYds;
    var offQB = isHumanBall ? hOffQBName : cOffQBName;
    var offRB = isHumanBall ? hOffRBName : cOffRBName;
    var offWR = isHumanBall ? hOffWRName : cOffWRName;
    var curDefStats = isHumanBall ? cDefStats : hDefStats;
    var offStatColor = (isHumanBall ? hTeam : oTeam).accent || '#FF6B00';
    var defStatColor = (isHumanBall ? oTeam : hTeam).accent || '#FF6B00';
    // Compact single-line stat bar: OFF stats (team color) | DEF stat (team color)
    var offParts = [];
    if (offPA > 0) offParts.push((offQB || 'QB') + ' ' + offPC + '/' + offPA + ', ' + offPY + ' YD');
    if (offRC > 0) offParts.push((offWR || 'WR') + ' ' + offRC + ' REC ' + offRCY + ' YD');
    else if (offRA > 0) offParts.push((offRB || 'RB') + ' ' + offRA + ' CAR ' + offRY + ' YD');

    var defPart = '';
    var bestDef = null, bestDefName = '';
    var defKeys = Object.keys(curDefStats);
    if (defKeys.length > 0) {
      var bestScore = -1;
      defKeys.forEach(function(name) {
        var d = curDefStats[name];
        var score = d.tkl + d.pbu * 2 + d.int * 5 + d.sack * 3;
        if (score > bestScore) { bestScore = score; bestDef = d; bestDefName = name; }
      });
      if (bestDef && bestScore > 0) {
        var dp = [];
        if (bestDef.tkl > 0) dp.push(bestDef.tkl + ' TKL');
        if (bestDef.pbu > 0) dp.push(bestDef.pbu + ' PBU');
        if (bestDef.int > 0) dp.push(bestDef.int + ' INT');
        if (bestDef.sack > 0) dp.push(bestDef.sack + ' SCK');
        defPart = bestDefName + ' ' + dp.join(' ');
      }
    }

    if (offParts.length > 0 || defPart) {
      var offTeamLabel = (isHumanBall ? hTeam : oTeam).name;
      var defTeamLabel = (isHumanBall ? oTeam : hTeam).name;
      html += '<div class="T-drive-stats" style="font-family:\'Rajdhani\';font-size:11px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;gap:6px;flex-wrap:nowrap">';
      if (offParts.length > 0) {
        html += '<span style="color:' + offStatColor + '">' + offParts.join(' · ') + '</span>';
      }
      if (offParts.length > 0 && defPart) {
        html += '<span style="color:#333">|</span>';
      }
      if (defPart) {
        html += '<span style="color:' + defStatColor + '">' + defPart + '</span>';
      }
      html += '</div>';
    }

    // Commentary text
    if (driveCommLine1) {
      html += '<div class="T-drive-comm"><span style="color:' + driveColor + ';">Last Play: </span>' + driveCommLine1 + '</div>';
      // Show yards + next down & distance instead of commentary sub-line
      if (driveSummaryLog.length > 0) {
        var _lastEntry = driveSummaryLog[driveSummaryLog.length - 1];
        var _ydsText = _lastEntry.isTD ? 'TOUCHDOWN' : _lastEntry.isSack ? 'SACK' : _lastEntry.isInt ? 'INTERCEPTION' : _lastEntry.isFumble ? 'FUMBLE' : _lastEntry.isInc ? 'NO GAIN' : (_lastEntry.yards > 0 ? '+' + _lastEntry.yards + ' yards' : _lastEntry.yards < 0 ? _lastEntry.yards + ' yards' : 'No gain');
        var _nextS = gs.getSummary();
        var _dnLabels = ['','1st','2nd','3rd','4th'];
        var _nextDn = fmtDownDist(_nextS.down, _nextS.distance, _nextS.yardsToEndzone);
        var _ydsColor = _lastEntry.isTD || _lastEntry.yards > 0 ? '#00ff44' : _lastEntry.yards < 0 || _lastEntry.isSack ? '#ff0040' : '#888';
        html += '<div class="T-drive-comm-sub"><span style="color:' + _ydsColor + ';">' + _ydsText + '</span> <span style="color:#666;">\u2014</span> <span style="color:' + driveColor + ';">' + _nextDn + '</span></div>';
      }
    } else {
      html += '<div class="T-drive-idle">Awaiting snap</div>';
    }

    driveSummaryEl.innerHTML = html;
    driveSummaryEl.scrollTop = driveSummaryEl.scrollHeight;
  }
  drawDriveSummary();

  function distLabel(dist, ydsToEz) {
    var yz = ydsToEz !== undefined ? ydsToEz : gs.getSummary().yardsToEndzone;
    if (yz <= 10) return 'GOAL';
    var s = gs.getSummary();
    if (s.down === 1 && dist > 10) dist = Math.min(10, yz);
    return dist;
  }
  // Format down & distance string with GL support
  function fmtDownDist(down, dist, ydsToEz) {
    var dnLabels = ['','1st','2nd','3rd','4th'];
    var dn = dnLabels[down] || '';
    var d = (ydsToEz !== undefined && ydsToEz <= 10) ? 'GL' : dist;
    return dn + ' & ' + d;
  }

  function ballSideLabel() {
    const s = gs.getSummary();
    const yds = s.yardsToEndzone;
    if (yds <= 50) return 'OPP ' + yds;
    return 'OWN ' + (100 - yds);
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
    if (isNeg) fly.style.color = '#ff0040';
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
    _setTimeout(function() {
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
        var pulseColor = isNeg ? '#ff0040' : '#c8a030';
        torchTarget.style.transform = 'scale(1.15)';
        torchTarget.style.textShadow = '0 0 8px ' + pulseColor;
        torchTarget.style.color = pulseColor;
        _setTimeout(function() {
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
    _setTimeout(function() { el.classList.remove('T-shaking'); }, frames * 100);
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
    _setTimeout(function() { flash.remove(); }, duration);
  }

  /** Impact burst on the field */
  function impactBurst(color) {
    var imp = document.createElement('div');
    imp.className = 'T-impact';
    imp.style.background = color;
    imp.style.boxShadow = '0 0 30px ' + color;
    strip.appendChild(imp);
    _setTimeout(function() { imp.remove(); }, 400);
  }

  /** Flame badge CONTINUE button — shared across overlays */
  function _flameBadgeContinue(text, onTap) {
    var FLAME = 'M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z';
    var btn = document.createElement('button');
    btn.style.cssText = "width:80%;max-width:300px;padding:0;border:none;border-radius:6px;background:linear-gradient(180deg,#EBB010,#FF4511);display:flex;align-items:stretch;overflow:hidden;cursor:pointer;box-shadow:0 4px 16px rgba(255,69,17,0.3),0 0 20px rgba(235,176,16,0.15);margin-top:16px;";
    btn.innerHTML =
      '<div style="background:rgba(0,0,0,0.2);padding:10px 12px;display:flex;align-items:center;justify-content:center;border-right:1px solid rgba(0,0,0,0.15);">' +
        "<svg viewBox='0 0 44 56' width='14' height='18' fill='#fff'><path d='" + FLAME + "'/></svg>" +
      '</div>' +
      "<div style=\"flex:1;padding:12px;font-family:'Teko';font-weight:700;font-size:18px;color:#fff;letter-spacing:4px;text-align:center;text-shadow:0 2px 4px rgba(0,0,0,0.3);line-height:1;\">" + (text || 'CONTINUE') + '</div>';
    btn.onclick = function(e) { e.stopPropagation(); if (onTap) onTap(); };
    return btn;
  }

  /** Show AI torch card usage announcement */
  function showAITorchCardUsed(cardName) {
    var _atcOv = document.createElement('div');
    _atcOv.style.cssText = "position:fixed;top:15%;left:50%;transform:translateX(-50%);z-index:660;text-align:center;pointer-events:none;opacity:0;";
    _atcOv.innerHTML =
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#ff0040;letter-spacing:2px;margin-bottom:2px;\">OPPONENT USED</div>" +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:20px;color:#ff0040;letter-spacing:3px;text-shadow:0 0 12px rgba(255,0,64,0.5);\">" + (cardName || '').toUpperCase() + "</div>";
    el.appendChild(_atcOv);
    try {
      gsap.to(_atcOv, { opacity: 1, duration: 0.2 });
      gsap.to(_atcOv, { opacity: 0, y: -10, duration: 0.3, delay: 1.5, onComplete: function() { _atcOv.remove(); } });
    } catch(e) { setTimeout(function() { _atcOv.remove(); }, 2000); }
    if (navigator.vibrate) try { navigator.vibrate([30, 20, 50]); } catch(e) {}
  }

  /** Stat milestone toast */
  function _checkMilestone(playerId) {
    var s = _playerGameStats[playerId];
    if (!s) return;
    var roster = getOffenseRoster(GS.team).concat(getDefenseRoster(GS.team));
    var player = roster.find(function(p) { return p.id === playerId; });
    if (!player) return;
    var name = player.firstName || player.name.split(' ')[0];
    var milestone = null;
    if (s.rushYds && s.rushYds >= 100 && !s._rush100) { s._rush100 = true; milestone = name + ': 100 RUSHING YARDS'; }
    else if (s.passYds && s.passYds >= 200 && !s._pass200) { s._pass200 = true; milestone = name + ': 200 PASSING YARDS'; }
    else if (s.recYds && s.recYds >= 100 && !s._rec100) { s._rec100 = true; milestone = name + ': 100 RECEIVING YARDS'; }
    else if (s.td && s.td >= 2 && !s._td2) { s._td2 = true; milestone = name + ': 2 TOUCHDOWNS'; }
    else if (s.td && s.td >= 3 && !s._td3) { s._td3 = true; milestone = name + ': 3 TOUCHDOWNS'; }
    if (milestone) {
      var _msToast = document.createElement('div');
      _msToast.style.cssText = "position:fixed;bottom:18%;left:50%;transform:translateX(-50%);z-index:660;padding:6px 14px;background:rgba(10,8,4,0.9);border:1px solid #EBB01044;border-radius:6px;pointer-events:none;opacity:0;white-space:nowrap;";
      _msToast.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:2px;text-align:center;\">" + milestone + "</div>";
      el.appendChild(_msToast);
      try {
        gsap.to(_msToast, { opacity: 1, y: -5, duration: 0.3, ease: 'back.out(1.5)' });
        gsap.to(_msToast, { opacity: 0, y: -15, duration: 0.4, delay: 2.0, onComplete: function() { _msToast.remove(); } });
        SND.chime();
      } catch(e) { setTimeout(function() { _msToast.remove(); }, 2500); }
    }
  }


  /** Stacked flex column result on field strip */
  function showFieldResult(heroText, heroColor, opts) {
    opts = opts || {};
    var container = document.createElement('div');
    container.style.cssText = 'position:absolute;inset:0;z-index:15;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;gap:4px;';

    // Hero text
    var hero = document.createElement('div');
    if (opts.chromeGradient) {
      hero.style.cssText = "font-family:'Teko';font-weight:900;font-size:" + (opts.heroSize || 56) + "px;letter-spacing:3px;line-height:1;background:" + opts.chromeGradient + ";-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 24px " + heroColor + "99) drop-shadow(0 6px 12px rgba(0,0,0,0.9));opacity:0;transform:scale(0.3);";
    } else {
      hero.style.cssText = "font-family:'Teko';font-weight:900;font-size:" + (opts.heroSize || 56) + "px;color:" + heroColor + ";letter-spacing:3px;line-height:1;text-shadow:0 0 20px " + heroColor + "60,0 2px 6px rgba(0,0,0,0.8);opacity:0;transform:scale(0.3);";
    }
    hero.textContent = heroText;
    container.appendChild(hero);

    // Context label
    if (opts.contextText) {
      var ctx = document.createElement('div');
      ctx.style.cssText = "font-family:'Oswald';font-weight:700;font-size:12px;color:" + (opts.contextColor || heroColor) + ";letter-spacing:3px;text-shadow:0 2px 4px rgba(0,0,0,0.8);opacity:0;transform:translateY(8px);";
      ctx.textContent = opts.contextText;
      container.appendChild(ctx);
    }

    // Divider
    if (opts.showDivider) {
      var div = document.createElement('div');
      div.style.cssText = "width:60px;height:1px;background:linear-gradient(90deg,transparent," + heroColor + "44,transparent);transform:scaleX(0);margin:4px 0;";
      container.appendChild(div);
    }

    // Commentary
    if (opts.commentary) {
      var comm = document.createElement('div');
      comm.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:12px;color:rgba(255,255,255,0.6);text-shadow:0 2px 4px rgba(0,0,0,0.8);max-width:280px;text-align:center;opacity:0;transform:translateY(6px);";
      comm.textContent = opts.commentary;
      container.appendChild(comm);
    }

    // TORCH points
    if (opts.torchPts && opts.torchPts > 0) {
      var pts = document.createElement('div');
      pts.style.cssText = "display:flex;align-items:center;gap:4px;opacity:0;transform:translateY(10px) scale(0.8);";
      pts.innerHTML = "<svg viewBox='0 0 44 56' width='14' height='18' fill='#EBB010'><path d='M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z'/></svg>" +
        "<span style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#EBB010;text-shadow:0 0 8px rgba(235,176,16,0.4);letter-spacing:1px;\">+" + opts.torchPts + "</span>";
      container.appendChild(pts);
    }

    // Down update
    if (opts.downText) {
      var dn = document.createElement('div');
      dn.style.cssText = "font-family:'Teko';font-weight:700;font-size:16px;color:" + (opts.downColor || '#FF6B00') + ";letter-spacing:2px;opacity:0;transform:translateY(6px);margin-top:2px;";
      dn.textContent = opts.downText;
      container.appendChild(dn);
    }

    strip.appendChild(container);

    // GSAP stagger animation
    try {
      var children = container.children;
      var delays = [0, 0.15, 0.25, 0.35, 0.5, 0.6];
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var d = delays[i] || (0.6 + i * 0.1);
        if (i === 0) { // Hero — scale bounce
          gsap.to(child, { opacity: 1, scale: 1, duration: 0.25, delay: d, ease: 'back.out(2.5)' });
        } else if (child.style.transform.indexOf('scaleX') >= 0) { // Divider
          gsap.to(child, { scaleX: 1, duration: 0.3, delay: d, ease: 'power2.out' });
        } else { // Everything else — slide up
          gsap.to(child, { opacity: 1, y: 0, scale: 1, duration: 0.2, delay: d, ease: 'power2.out' });
        }
      }
    } catch(e) {
      // Fallback: show everything immediately
      for (var j = 0; j < container.children.length; j++) {
        container.children[j].style.opacity = '1';
        container.children[j].style.transform = 'none';
      }
    }

    // Effects
    if (opts.effects) {
      if (opts.effects.flash) flashField(opts.effects.flash);
      if (opts.effects.shake) shakeScreen(opts.effects.shakeAmt || 4);
      if (opts.effects.burst) impactBurst(opts.effects.burst);
    }

    // Cleanup
    var dur = opts.duration || 1800;
    _setTimeout(function() {
      try {
        gsap.to(container, { opacity: 0, duration: 0.4, onComplete: function() { container.remove(); } });
      } catch(e) { container.remove(); }
    }, dur);

    return container;
  }

  /** 5-Tier Celebration System — effects only (flash, shake, burst, sound, bg fade) */
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
        _setTimeout(function() { bgFade.style.opacity = '0'; setTimeout(function() { bgFade.remove(); }, 500); }, tDuration - 1000);
      }

      if (r.isTouchdown) {
        SND.td();
        shakeScreen(6);
        var tColor = isDef ? '#ff0040' : '#00ff44';
        flashField(tColor + '88', 800);
        _setTimeout(function() { flashField(tColor + '88', 800); }, 400);
      } else if (r.isInterception) {
        var intGood = isDef;
        SND.turnover();
        shakeScreen(intGood ? 8 : 5);
        flashField(intGood ? 'rgba(0,255,68,0.5)' : 'rgba(224,48,80,0.6)', 800);
        impactBurst(intGood ? 'rgba(0,255,68,0.6)' : 'rgba(224,48,80,0.8)');
      } else if (r.isFumbleLost) {
        var fumGood = isDef;
        SND.turnover();
        shakeScreen(fumGood ? 7 : 4);
        flashField(fumGood ? 'rgba(0,255,68,0.5)' : 'rgba(224,96,32,0.6)', 800);
        if (fumGood) impactBurst('rgba(0,255,68,0.6)');
      } else if (r.isSack) {
        SND.sack();
        shakeScreen(8);
        flashField('rgba(224,48,80,0.5)', 600);
        impactBurst('rgba(255,255,255,0.6)');
      } else {
        SND.turnover();
        shakeScreen(6);
        flashField('rgba(48,192,224,0.6)', 800);
      }
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
        if (dragItem.type === 'play') { selPl = dragItem.data; phase = (selPl && selP) ? (torchInventory.length > 0 ? 'torch' : 'ready') : (selPl ? 'player' : 'play'); }
        else if (dragItem.type === 'player') { selP = dragItem.data; phase = (selPl && selP) ? (torchInventory.length > 0 ? 'torch' : 'ready') : 'play'; }
        else if (dragItem.type === 'torch') {
          selTorch = dragItem.data.id || dragItem.data;
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

  // ── SITUATIONAL HINT ──
  function getSituationalHint(gs) {
    var s = gs.getSummary();
    var isOff = gs.possession === hAbbr;
    if (!isOff) {
      if (s.yardsToEndzone <= 10) return { text: 'RED ZONE DEFENSE', color: '#ff0040' };
      if (s.down >= 3 && s.distance >= 8) return { text: 'PASSING SITUATION \u2014 BRING PRESSURE', color: '#4DA6FF' };
      if (s.down >= 3 && s.distance <= 3) return { text: 'SHORT YARDAGE \u2014 STACK THE BOX', color: '#EBB010' };
      return null;
    }
    if (s.yardsToEndzone <= 5) return { text: 'GOAL LINE \u2014 POWER RUNS OR QUICK PASSES', color: '#00ff44' };
    if (s.yardsToEndzone <= 20) return { text: 'RED ZONE \u2014 HIGH PERCENTAGE PLAYS', color: '#EBB010' };
    if (s.down === 1) return null;
    if (s.down === 2 && s.distance <= 4) return { text: 'SHORT YARDAGE \u2014 RUNS ARE STRONG', color: '#00ff44' };
    if (s.down === 3 && s.distance <= 3) return { text: '3RD & SHORT \u2014 RUN OR QUICK PASS', color: '#EBB010' };
    if (s.down === 3 && s.distance >= 8) return { text: '3RD & LONG \u2014 NEED A BIG PLAY', color: '#ff0040' };
    if (s.down === 4) return { text: '4TH DOWN \u2014 HIGH STAKES', color: '#ff0040' };
    return null;
  }

  // ── RENDER PANEL ──
  function drawPanel() {
    panel.innerHTML = '';
    const isOff = gs.possession === hAbbr;
    const sides = gs.getCurrentSides();
    // Filter out OL/DL — only show skill position players, then take 4
    var allPlayers = isOff ? sides.offPlayers : sides.defPlayers;
    var skillPlayers = allPlayers.filter(function(p) { return p.pos !== 'OL' && p.pos !== 'DL'; });
    var players = skillPlayers.length >= 4 ? skillPlayers.slice(0, 4) : allPlayers.slice(0, 4);
    var plays = isOff ? sides.offHand : sides.defHand;
    // Safety: ensure hand has cards (refill from full pool if empty/short)
    if (!plays || plays.length < 3) {
      var fullPool = isOff ? getOffCards(GS.team) : getDefCards(GS.team);
      plays = fullPool.slice(0, 4);
      if (isOff) sides.offHand = plays; else sides.defHand = plays;
    }
    // Hide panel during play-by-play so commentary sits directly under field
    if (phase === 'busy') { panel.className = 'T-panel T-panel-hidden'; return; }
    panel.className = 'T-panel ' + (isOff ? 'T-panel-off' : 'T-panel-def');

    // Panel header — side-of-ball branded
    var panelHdr = document.createElement('div');
    var _sideColor = isOff ? '#00ff44' : '#4DA6FF';
    var _sideLabel = isOff ? 'YOUR OFFENSE' : 'YOUR DEFENSE';
    var _phasePill = '';
    if (phase === 'play') _phasePill = "<span style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#EBB010;letter-spacing:1px;padding:2px 6px;border-radius:3px;border:1px solid #EBB01033;\">SELECT PLAY</span>";
    else if (phase === 'player') _phasePill = "<span style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#4DA6FF;letter-spacing:1px;padding:2px 6px;border-radius:3px;border:1px solid #4DA6FF33;\">SELECT PLAYER</span>";
    else if (phase === 'torch') _phasePill = "<span style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#FF4511;letter-spacing:1px;padding:2px 6px;border-radius:3px;border:1px solid #FF451133;\">TORCH CARD</span>";
    else if (selPl && selP) _phasePill = "<span style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#00ff44;letter-spacing:1px;padding:2px 6px;border-radius:3px;border:1px solid #00ff4444;background:#00ff4410;\">READY</span>";
    panelHdr.style.cssText = 'display:flex;align-items:center;padding:8px 12px;background:linear-gradient(90deg,' + _sideColor + '08,transparent 40%);border-top:2px solid ' + _sideColor + '44;border-bottom:1px solid #1a1a1a;flex-shrink:0;';
    panelHdr.innerHTML =
      '<div style="width:12px;height:2px;background:' + _sideColor + ';border-radius:1px;margin-right:8px;"></div>' +
      "<div style=\"font-family:'Oswald';font-weight:700;font-size:12px;color:" + _sideColor + ";letter-spacing:3px;flex:1;\">" + _sideLabel + '</div>' +
      _phasePill;
    panel.appendChild(panelHdr);

    // 2min check + close game crowd
    if (gs.twoMinActive && !prev2min) { prev2min = true; _lastPlayFlashed = true; el.classList.add('T-urgent'); el.classList.add('T-2min-active'); show2MinWarn(); start2MinClock(); }
    if (gs.twoMinActive && Math.abs(gs.ctScore - gs.irScore) <= 7) {
      try { AudioStateManager.setCrowdIntensity(0.85, 0.5); } catch(e) {}
    }

    // LAST PLAY flash — fires once when playsUsed hits 19 (last regular play before 2-min drill)
    if (gs.playsUsed === 19 && !gs.twoMinActive && !_lastPlayFlashed && phase === 'play') {
      _lastPlayFlashed = true;
      var lpFlash = document.createElement('div');
      lpFlash.style.cssText = "position:fixed;top:30%;left:50%;transform:translateX(-50%);z-index:650;font-family:'Teko';font-weight:700;font-size:24px;color:#ff0040;letter-spacing:4px;text-shadow:0 0 16px rgba(255,0,64,0.5);pointer-events:none;opacity:0;";
      lpFlash.textContent = 'LAST PLAY';
      el.appendChild(lpFlash);
      try {
        gsap.to(lpFlash, { opacity: 1, duration: 0.3, ease: 'back.out(1.5)' });
        gsap.to(lpFlash, { opacity: 0, y: -15, duration: 0.4, delay: 1.2, onComplete: function() { lpFlash.remove(); } });
      } catch(e) { setTimeout(function() { lpFlash.remove(); }, 2000); }
    }

    // 4th down decision bar — appears ABOVE cards so player sees it first
    var is4thPastMid = gs.down === 4 && isOff && gs.canSpecialTeams() && !conversionMode && !_fourthDownDecided;
    if (is4thPastMid && phase === 'play') {
      var fourthBar = document.createElement('div');
      var ydsToEz = gs.yardsToEndzone();
      fourthBar.style.cssText = "display:flex;flex-direction:column;gap:6px;padding:10px 12px;flex-shrink:0;border-top:2px solid #e0305044;animation:urgentPulse 2s ease-in-out infinite;";

      // Header
      var fourthHdr = document.createElement('div');
      fourthHdr.style.cssText = 'text-align:center;margin-bottom:4px;';
      fourthHdr.innerHTML =
        "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:#e03050;letter-spacing:3px;\">4TH DOWN DECISION</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:10px;color:#888;margin-top:2px;\">4th & " + (ydsToEz <= 10 ? 'Goal' : gs.distance) + " at " + (ydsToEz <= 50 ? 'OPP ' + ydsToEz : 'OWN ' + (100 - ydsToEz)) + "</div>";
      fourthBar.appendChild(fourthHdr);

      var goForIt = document.createElement('button');
      goForIt.style.cssText = "width:100%;padding:14px;border-radius:6px;border:none;cursor:pointer;margin-bottom:2px;background:linear-gradient(180deg," + hTeam.accent + "," + hTeam.accent + "88);box-shadow:0 4px 12px " + hTeam.accent + "33;font-family:'Teko';font-weight:700;font-size:22px;color:#fff;letter-spacing:4px;text-shadow:0 2px 4px rgba(0,0,0,0.3);";
      goForIt.textContent = 'GO FOR IT';
      goForIt.onclick = function() {
        SND.click();
        _fourthDownDecided = true;  // flag to hide the bar on redraw
        drawPanel();
      };

      var puntBtn = document.createElement('button');
      var stRow = document.createElement('div');
      stRow.style.cssText = 'display:flex;gap:6px;';
      puntBtn.style.cssText = "flex:1;padding:10px;border-radius:6px;text-align:center;cursor:pointer;border:1.5px solid #4DA6FF44;background:linear-gradient(180deg,#4DA6FF08,transparent);font-family:'Teko';font-weight:700;font-size:16px;color:#4DA6FF;letter-spacing:2px;";
      puntBtn.textContent = 'PUNT';
      puntBtn.onclick = function() {
        SND.snap();
        phase = 'busy';
        showSTSelect(el, {
          title: 'PUNT',
          subtitle: '4TH & ' + gs.distance,
          stType: 'punt',
          deck: _humanSTDeck,
          primaryRating: 'kickPower',
          primaryLabel: 'PWR',
          team: hTeam,
          onCancel: function() { phase = 'play'; drawPanel(); },
          onSelect: function(punter) {
            SND.kickThud();
            // Check for ST torch cards: COFFIN CORNER, FAIR CATCH GHOST
            var puntOpts = {};
            var ccIdx = torchInventory.findIndex(function(c) { return c.id === 'coffin_corner'; });
            if (ccIdx >= 0) { puntOpts.coffinCorner = true; consumeTorchCard('coffin_corner'); torchCardToast('COFFIN CORNER', 'Punt guaranteed inside the 10'); }
            var fcIdx = torchInventory.findIndex(function(c) { return c.id === 'fair_catch_ghost'; });
            if (fcIdx >= 0) { puntOpts.fairCatchGhost = true; consumeTorchCard('fair_catch_ghost'); torchCardToast('FAIR CATCH GHOST', 'Forced fair catch'); }
            var puntResult = gs.punt(punter, puntOpts);
            burnPlayer(_humanSTDeck, punter, 'punter', puntResult.gross + '-yard punt');
            driveSummaryLog.push({ down: 4, dist: gs.distance, playName: puntResult.label, yards: 0, isUserOff: true });
            pushTicker('PUNT — ' + puntResult.label, '#4DA6FF');
            showSpecialTeamsResult(puntResult.label, '#4DA6FF', function() {
              driveSnaps = []; drivePlayHistory = []; resetDriveSummary();
              showPossCut('punt', function() { if (!checkEnd()) nextSnap(); });
            });
          }
        });
      };

      var fgBtn = document.createElement('button');
      var _hasCannonLeg = torchInventory.some(function(c) { return c.id === 'cannon_leg'; });
      var _hasRinger = torchInventory.some(function(c) { return c.id === 'ringer'; });
      if (gs.canAttemptFG(_hasCannonLeg)) {
        var fgDist = ydsToEz + 17;
        fgBtn.style.cssText = "flex:1;padding:10px;border-radius:6px;text-align:center;cursor:pointer;border:1.5px solid #EBB01044;background:linear-gradient(180deg,#EBB01008,transparent);font-family:'Teko';font-weight:700;font-size:16px;color:#EBB010;letter-spacing:2px;";
        fgBtn.textContent = 'FG (' + fgDist + 'yd)' + (_hasCannonLeg ? ' +10' : '');
        fgBtn.onclick = function() {
          SND.snap();
          phase = 'busy';
          // RINGER: use highest-star player regardless of deck
          if (_hasRinger) {
            var ringerIdx = torchInventory.findIndex(function(c) { return c.id === 'ringer'; });
            if (ringerIdx >= 0) { consumeTorchCard('ringer'); }
            var allPlayers = (isOff ? getOffenseRoster(GS.team) : getDefenseRoster(GS.team)).concat(isOff ? getDefenseRoster(GS.team) : getOffenseRoster(GS.team));
            var bestKicker = allPlayers.slice().sort(function(a, b) { return ((b.st && b.st.kickAccuracy) || 0) - ((a.st && a.st.kickAccuracy) || 0); })[0];
            if (bestKicker) {
              SND.kickThud();
              var fgResult = gs.attemptFieldGoal(bestKicker);
              if (fgResult.made) SND.kickGood(); else SND.kickMiss();
              burnPlayer(_humanSTDeck, bestKicker, 'kicker', 'RINGER ' + (fgResult.made ? 'Made ' : 'Missed ') + fgResult.distance + '-yard FG');
              driveSummaryLog.push({ down: 4, dist: gs.distance, playName: fgResult.label, yards: 0, isUserOff: true });
              var fgColor = fgResult.made ? '#00ff44' : '#ff0040';
              pushTicker('RINGER! FG ' + fgResult.distance + ' yds — ' + (fgResult.made ? 'GOOD' : 'NO GOOD'), fgColor);
              showSpecialTeamsResult('RINGER! ' + fgResult.label, fgColor, function() {
                driveSnaps = []; drivePlayHistory = []; resetDriveSummary();
                showPossCut(fgResult.made ? 'score' : 'missed_fg', function() { if (!checkEnd()) nextSnap(); });
              });
              return;
            }
          }
          // Show ST kicker selection
          showSTSelect(el, {
            title: 'FIELD GOAL ATTEMPT',
            subtitle: fgDist + '-YARD KICK',
            stType: 'fg',
            deck: _humanSTDeck,
            primaryRating: 'kickAccuracy',
            secondaryRating: 'kickPower',
            primaryLabel: 'ACC',
            secondaryLabel: 'PWR',
            team: hTeam,
            onCancel: function() { phase = 'play'; drawPanel(); },
            onSelect: function(kicker) {
              SND.kickThud();
              // CANNON LEG: consume card if in inventory
              var clIdx = torchInventory.findIndex(function(c) { return c.id === 'cannon_leg'; });
              if (clIdx >= 0) { consumeTorchCard('cannon_leg'); torchCardToast('CANNON LEG', 'FG range extended +10 yards'); }
              var fgResult = gs.attemptFieldGoal(kicker);
              if (fgResult.made) SND.kickGood(); else SND.kickMiss();
              var fgContext = (fgResult.made ? 'Made ' : 'Missed ') + fgResult.distance + '-yard FG';
              burnPlayer(_humanSTDeck, kicker, 'kicker', fgContext);
              driveSummaryLog.push({ down: 4, dist: gs.distance, playName: fgResult.label, yards: 0, isUserOff: true });
              var fgColor = fgResult.made ? '#00ff44' : '#ff0040';
              pushTicker('FG ' + fgResult.distance + ' yds — ' + (fgResult.made ? 'GOOD' : 'NO GOOD'), fgColor);
              showSpecialTeamsResult(fgResult.label, fgColor, function() {
                driveSnaps = []; drivePlayHistory = []; resetDriveSummary();
                showPossCut(fgResult.made ? 'score' : 'missed_fg', function() { if (!checkEnd()) nextSnap(); });
              });
            }
          });
        };
      } else {
        fgBtn.style.cssText = "flex:1;padding:10px;border-radius:6px;text-align:center;border:1.5px solid #1a1a1a;background:transparent;font-family:'Teko';font-weight:700;font-size:14px;color:#333;letter-spacing:1px;cursor:not-allowed;";
        fgBtn.textContent = 'OUT OF RANGE';
        fgBtn.disabled = true;
      }

      fourthBar.appendChild(goForIt);
      stRow.appendChild(puntBtn);
      stRow.appendChild(fgBtn);
      fourthBar.appendChild(stRow);
      panel.appendChild(fourthBar);
    }

    // ── 8-CARD TRAY (new component) ──
    var hs = getHandState();
    var preSnapCards = torchInventory.filter(function(c) { return c.type === 'pre-snap'; }).slice(0, 3);
    // hand = both sides, special_teams = auto-consumed only (never playable in snap phase)
    var offCats = ['amplification', 'information', 'hand'];
    var defCats = ['disruption', 'protection', 'hand'];
    var applicableCats = isOff ? offCats : defCats;
    var hasPlayableTorch = preSnapCards.some(function(c) { return c.category !== 'special_teams' && applicableCats.indexOf(c.category) >= 0; });
    var hS = hAbbr === 'CT' ? gs.ctScore : gs.irScore;
    var cS = hAbbr === 'CT' ? gs.irScore : gs.ctScore;

    // SCOUT REPORT: show all 7 players instead of just 4
    var trayPlayers = hs.playerHand;
    if (_scoutActive && isOff) {
      var fullRoster = getOffenseRoster(GS.team);
      trayPlayers = fullRoster.filter(function(p) { return !p.injured; });
    }

    var hint = FEATURES.smartHighlights ? getSituationalHint(gs) : null;
    if (hint && phase === 'play' && !selPl) {
      var hintEl = document.createElement('div');
      hintEl.style.cssText = "text-align:center;padding:3px 8px;font-family:'Rajdhani';font-weight:700;font-size:10px;color:" + hint.color + ";letter-spacing:1px;opacity:0.5;";
      hintEl.textContent = hint.text;
      panel.appendChild(hintEl);
    }

    var trayEl = renderCardTray({
      plays: hs.playHand,
      players: trayPlayers,
      selectedPlay: selPl,
      selectedPlayer: selP,
      isOffense: isOff,
      team: hTeam,
      teamId: GS.team,
      canDiscardPlays: canDiscard(hs, 'play'),
      canDiscardPlayers: canDiscard(hs, 'player'),
      torchCards: torchInventory.slice(0, 3),
      phase: phase,
      isConversion: !!conversionMode,
      is2Min: gs.twoMinActive,
      clockSeconds: gs.clockSeconds,
      offStar: offStar,
      offStarHot: offStarHot,
      defStar: defStar,
      defStarHot: defStarHot,
      momentumMap: isOff ? gs.offMomentumMap : gs.defMomentumMap,
      heatMap: isOff ? gs.offHeatMap : gs.defHeatMap,
      snapCount: snapCount,
      tutorialStep: _tutorialStep,
      selectedTorchCard: selectedPreSnap,
      down: gs.down,
      distance: gs.distance,
      yardsToEndzone: gs.yardsToEndzone(),
      playerGameStats: _playerGameStats,
      isNewDrive: _isNewDrive,
      onTogglePBP: function() {
        _pbpVisible = !_pbpVisible;
        driveSummaryEl.style.display = _pbpVisible ? '' : 'none';
      },
      onSelectPlay: function(play) {
        if (phase === 'busy') return;
        selPl = selPl === play ? null : play; // toggle
        if (_tutorialStep === 1) { _tutorialStep = 2; if (panel._tutOverlay) { panel._tutOverlay.remove(); panel._tutOverlay = null; } }
        // If both selected, show torch phase only if player has cards
        if (selPl && selP) {
          phase = torchInventory.length > 0 ? 'torch' : 'ready';
        } else if (selPl && !selP) {
          phase = 'player';
        } else {
          phase = 'play';
        }
        drawField(); drawPanel();
      },
      onSelectPlayer: function(p) {
        if (phase === 'busy') return;
        selP = selP === p ? null : p; // toggle
        if (_tutorialStep === 2) { _tutorialStep = 3; if (panel._tutOverlay) { panel._tutOverlay.remove(); panel._tutOverlay = null; } }
        if (selPl && selP) {
          phase = torchInventory.length > 0 ? 'torch' : 'ready';
        } else {
          phase = 'play';
        }
        drawField(); drawPanel();
      },
      onSnap: function() {
        if (conversionMode) { doConversionSnap(); } else { doSnap(); }
      },
      onDiscardPlays: function(marked) {
        handDiscard(hs, 'play', marked);
        selPl = null; phase = 'play';
        drawField(); drawPanel();
      },
      onDiscardPlayers: function(marked) {
        handDiscard(hs, 'player', marked);
        selP = null; phase = 'play';
        drawField(); drawPanel();
      },
      onTorchCard: function(tc) {
        if (selTorch === tc.id) {
          // Deselect — return card to inventory
          torchInventory.push(selectedPreSnap || tc);
          if (GS.season) GS.season.torchCards = torchInventory.slice();
          selTorch = null;
          selectedPreSnap = null;
          phase = (selPl && selP) ? 'torch' : 'play';
          drawField(); drawPanel();
          return;
        }
        selTorch = tc.id;
        selectedPreSnap = tc;
        var idx = torchInventory.indexOf(tc);
        if (idx >= 0) torchInventory.splice(idx, 1);
        if (GS.season) GS.season.torchCards = torchInventory.slice();
        phase = 'ready';

        // PERSONNEL_REPORT / PRE_SNAP_READ: reveal opponent's featured player
        if (tc.id === 'personnel_report' || tc.id === 'pre_snap_read') {
          var oppSides = gs.getCurrentSides();
          var oppPlay = isOff
            ? aiSelectPlay(oppSides.defHand, 'defense', gs.difficulty, { down: gs.down, distance: gs.distance, ballPos: gs.ballPosition })
            : aiSelectPlay(oppSides.offHand, 'offense', gs.difficulty, { down: gs.down, distance: gs.distance, ballPos: gs.ballPosition, teamId: oppId });
          var oppFeatured = isOff
            ? aiSelectPlayer(oppSides.defPlayers, oppPlay, gs.difficulty, false, gs.defHeatMap)
            : aiSelectPlayer(oppSides.offPlayers, oppPlay, gs.difficulty, true, gs.offHeatMap);
          if (oppFeatured) {
            var revealOv = document.createElement('div');
            revealOv.style.cssText = "position:fixed;inset:0;z-index:660;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);pointer-events:auto;opacity:0;";
            var starStr = '';
            for (var si = 0; si < (oppFeatured.stars || 3); si++) starStr += '\u2605';
            revealOv.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:3px;margin-bottom:6px;\">OPPONENT'S FEATURED PLAYER</div>" +
              "<div style=\"font-family:'Teko';font-weight:700;font-size:32px;color:#fff;letter-spacing:2px;\">" + (oppFeatured.name || 'Unknown') + "</div>" +
              "<div style=\"font-family:'Rajdhani';font-size:14px;color:#aaa;margin-top:4px;\">" + (oppFeatured.pos || '') + ' ' + starStr + "</div>" +
              "<div style=\"font-family:'Rajdhani';font-size:12px;color:#888;margin-top:2px;\">" + (oppFeatured.trait || '') + "</div>";
            el.appendChild(revealOv);
            try { gsap.to(revealOv, { opacity: 1, duration: 0.2 }); } catch(e) { revealOv.style.opacity = '1'; }
            _setTimeout(function() { try { gsap.to(revealOv, { opacity: 0, duration: 0.3, onComplete: function() { if (revealOv.parentNode) revealOv.remove(); } }); } catch(e) { if (revealOv.parentNode) revealOv.remove(); } }, 2000);
            _setTimeout(function() { if (revealOv.parentNode) revealOv.remove(); }, 2500);
          }
        }

        drawField(); drawPanel();
      },
      onSkipTorch: function() {
        selectedPreSnap = null; selTorch = null;
        phase = 'ready';
        drawField(); drawPanel();
      },
      onSpike: function() {
        SND.whistle();
        var spikeResult = gs.spike();
        stop2MinClock();
        driveSummaryLog.push({ down: gs.down - 1, dist: gs.distance, playName: 'SPIKE — clock stopped', yards: 0, isUserOff: true });
        selP = null; selPl = null; phase = 'play';
        drawBug(); drawField(); drawDriveSummary();
        // Brief splash like any other play
        showFieldResult('SPIKE', '#EBB010', { heroSize: 44, contextText: 'CLOCK STOPPED', contextColor: '#EBB010', duration: 1000 });
        setNarr('Ball spiked. Clock stopped.', fmtClock(Math.max(0, gs.clockSeconds)) + ' left');
        if (!checkEnd()) drawPanel();
      },
      onKneel: hS > cS ? function() {
        SND.click();
        gs.kneel();
        driveSummaryLog.push({ down: gs.down - 1, dist: gs.distance, playName: 'KNEEL — clock running', yards: 0, isUserOff: true });
        selP = null; selPl = null; phase = 'play';
        drawBug(); drawField(); drawDriveSummary();
        showFieldResult('KNEEL', '#888', { heroSize: 40, contextText: 'CLOCK RUNNING', contextColor: '#666', duration: 800 });
        setNarr('QB kneels.', fmtClock(Math.max(0, gs.clockSeconds)) + ' left');
        if (!checkEnd()) drawPanel();
      } : null,
    });
    panel.appendChild(trayEl);
    _isNewDrive = false; // consume the flag after rendering

    // Torch card tutorial — disabled, will revisit
    if (false) {
      _torchTutorialShown = true;
      // Show informational overlay — tap to dismiss
      var torchTutOv = document.createElement('div');
      torchTutOv.style.cssText = 'position:fixed;inset:0;z-index:900;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(10,8,4,0.92);opacity:0;transition:opacity .3s;pointer-events:auto;';
      var _flameTutSvg = '<svg viewBox="0 0 44 44" width="40" height="46" fill="none" style="animation:T-flame-pulse 2s ease-in-out infinite;filter:drop-shadow(0 0 12px ' + hTeam.accent + ')"><defs><linearGradient id="tft" x1="22" y1="40" x2="22" y2="0"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="' + hTeam.accent + '"/></linearGradient></defs><path d="M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z" fill="url(#tft)"/></svg>';
      var _hasReactiveOnly2 = torchInventory.every(function(c) { return c.type === 'reactive'; });
      var _tutDesc2 = _hasReactiveOnly2
        ? 'Reactive cards activate automatically when triggered. Look for the prompt during play!'
        : 'When you have a playable card, tap it to power up your play before you snap.';
      torchTutOv.innerHTML =
        _flameTutSvg +
        "<div style=\"font-family:'Teko';font-weight:700;font-size:28px;color:" + hTeam.accent + ";letter-spacing:4px;text-shadow:0 0 20px " + hTeam.accent + "40;\">TORCH CARD EARNED!</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:14px;color:#999;letter-spacing:2px;text-align:center;max-width:280px;line-height:1.4;\">" + _tutDesc2 + "</div>" +
        "<button class='btn-blitz' style='margin-top:20px;font-size:16px;padding:14px 40px;background:#141008;color:" + hTeam.accent + ";border-color:" + hTeam.accent + ";letter-spacing:3px;'>GOT IT</button>";
      torchTutOv.querySelector('button').onclick = function() {
        torchTutOv.style.opacity = '0';
        _setTimeout(function() { torchTutOv.remove(); }, 300);
      };
      el.appendChild(torchTutOv);
      requestAnimationFrame(function() { torchTutOv.style.opacity = '1'; });
    }

    if (_tutorialStep > 0 && snapCount === 0) {
      var tutEl = document.createElement('div');
      var tutText, tutSub, tutColor;
      if (_tutorialStep === 1) {
        tutText = 'PICK A PLAY';
        tutSub = 'Each card is a different offensive or defensive call';
        tutColor = '#FF4511';
      } else if (_tutorialStep === 2) {
        tutText = 'PICK A PLAYER';
        tutSub = 'Match player traits to your play for the biggest boost';
        tutColor = '#4DA6FF';
      } else if (phase === 'torch') {
        tutText = 'PLAY A TORCH CARD';
        tutSub = 'Tap a card to power up, or SKIP to snap';
        tutColor = '#EBB010';
      } else {
        tutText = 'TAP SNAP!';
        tutSub = 'Run the play and see what happens!';
        tutColor = '#00ff44';
      }
      tutEl.style.cssText = "text-align:center;padding:10px 12px;margin:0 8px;background:rgba(10,8,4,0.85);border:1px solid " + tutColor + "44;border-radius:8px;";
      tutEl.innerHTML =
        "<div style=\"font-family:'Teko';font-weight:700;font-size:24px;color:" + tutColor + ";letter-spacing:3px;text-shadow:0 0 16px " + tutColor + "60;animation:T-snap-pulse 1.2s ease-in-out infinite;\">" + tutText + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:14px;color:" + tutColor + "aa;margin-top:6px;line-height:1.3;letter-spacing:1px;\">" + tutSub + "</div>";
      panel.insertBefore(tutEl, panel.firstChild);
    }
  }

  // ── SNAP ──
  function doSnap() {
    if (phase === 'busy') return; // Prevent re-entrant snaps
    _tutorialStep = 0;
    if (!_onboardingDone) { _onboardingDone = true; localStorage.setItem('torch_onboarding_done', '1'); }
    phase = 'busy';
    // Restart real-time clock if it was stopped (spike/incomplete/out of bounds)
    if (gs.twoMinActive && !twoMinTimer) start2MinClock();

    var isOff = gs.possession === hAbbr;

    // AI 4th down decisions are handled in nextSnap() before cards are shown

    var prevPoss = gs.possession;
    const preSnap = gs.getSummary();
    var offCard = isOff ? selTorch : null;
    var defCard = isOff ? null : selTorch;
    var playedPlay = selPl;
    var playedPlayer = selP;

    // Torch card activation fanfare — tier-scaled (Bronze→Silver→Gold escalation)
    if (selectedPreSnap && selectedPreSnap.name) {
      var tcCard = selectedPreSnap;
      var tcTier = tcCard.tier;
      var tcTierCol = tcTier === 'GOLD' ? '#EBB010' : tcTier === 'SILVER' ? '#C0C0C0' : '#CD7F32';
      var tcGlowSize = tcTier === 'GOLD' ? 60 : tcTier === 'SILVER' ? 40 : 20;
      var tcCardSize = tcTier === 'GOLD' ? [120, 168] : tcTier === 'SILVER' ? [110, 154] : [100, 140];
      var tcOv = document.createElement('div');
      tcOv.style.cssText = 'position:fixed;inset:0;z-index:650;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;opacity:0;';
      // Tier-scaled backdrop darkness
      var tcBg = document.createElement('div');
      tcBg.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,' + (tcTier === 'GOLD' ? '0.8' : tcTier === 'SILVER' ? '0.7' : '0.5') + ');';
      tcOv.appendChild(tcBg);
      var tcVisual = buildTorchCard(tcCard, tcCardSize[0], tcCardSize[1]);
      tcVisual.style.cssText += ';position:relative;z-index:1;box-shadow:0 0 ' + tcGlowSize + 'px ' + tcTierCol + '66;';
      tcOv.appendChild(tcVisual);
      // Name + effect below card
      var tcInfo = document.createElement('div');
      tcInfo.style.cssText = 'position:relative;z-index:1;text-align:center;';
      tcInfo.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:" + (tcTier === 'GOLD' ? '26' : '20') + "px;color:" + tcTierCol + ";letter-spacing:3px;margin-top:10px;text-shadow:0 0 " + (tcGlowSize / 2) + "px " + tcTierCol + "60;\">" + tcCard.name + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-size:11px;color:#ccc;margin-top:4px;max-width:260px;\">" + tcCard.effect + "</div>";
      tcOv.appendChild(tcInfo);
      el.appendChild(tcOv);
      try {
        // Tier-scaled animation
        if (tcTier === 'GOLD') {
          gsap.to(tcOv, { opacity: 1, duration: 0.2 });
          gsap.from(tcVisual, { scale: 0.3, rotation: -10, duration: 0.5, ease: 'back.out(2.5)' });
          gsap.from(tcVisual, { y: -30, duration: 0.5, ease: 'back.out(2.5)' });
          // Gold shimmer pulse
          gsap.to(tcVisual, { boxShadow: '0 0 80px ' + tcTierCol + 'aa, 0 0 120px ' + tcTierCol + '44', duration: 0.3, delay: 0.4, yoyo: true, repeat: 1 });
          SND.flip();
          if (navigator.vibrate) try { navigator.vibrate([30, 50, 80]); } catch(e) {}
        } else if (tcTier === 'SILVER') {
          gsap.to(tcOv, { opacity: 1, duration: 0.15 });
          gsap.from(tcVisual, { scale: 0.4, rotation: -6, duration: 0.4, ease: 'back.out(2)' });
          gsap.to(tcVisual, { boxShadow: '0 0 50px ' + tcTierCol + '88', duration: 0.2, delay: 0.3, yoyo: true, repeat: 1 });
          SND.cardSnap();
          if (navigator.vibrate) try { navigator.vibrate([20, 30]); } catch(e) {}
        } else {
          gsap.to(tcOv, { opacity: 1, duration: 0.12 });
          gsap.from(tcVisual, { scale: 0.5, rotation: -3, duration: 0.3, ease: 'back.out(1.7)' });
          SND.cardSnap();
        }
      } catch(e) {}
      var tcDur = tcTier === 'GOLD' ? 1800 : tcTier === 'SILVER' ? 1200 : 800;
      _setTimeout(function() { try { gsap.to(tcOv, { opacity: 0, duration: 0.25, onComplete: function() { if (tcOv.parentNode) tcOv.remove(); } }); } catch(e) { if (tcOv.parentNode) tcOv.remove(); } }, tcDur);
      _setTimeout(function() { if (tcOv.parentNode) tcOv.remove(); }, tcDur + 500);
    }

    // Pre-snap TORCH card effects
    if (offCard === 'hard_count' || defCard === 'hard_count') {
      // Force opponent to discard their play and get a random replacement
      var sides = gs.getCurrentSides();
      if (isOff) {
        // Human offense used hard count → CPU defense gets random replacement
        var defHand = sides.defHand;
        if (defHand.length > 0) {
          var ri = Math.floor(Math.random() * defHand.length);
          var pool = getDefCards(GS.team === gs.humanTeam ? gs.cpuTeam : GS.team);
          var avail = pool.filter(function(c) { return defHand.indexOf(c) === -1; });
          if (avail.length > 0) defHand[ri] = avail[Math.floor(Math.random() * avail.length)];
        }
      }
    }

    // FRESH LEGS: grant an extra discard this drive
    var selTorchId = offCard || defCard;
    if (selTorchId === 'fresh_legs') {
      var hs = getHandState();
      if (hs) {
        hs.maxPlayDiscards++;
        hs.maxPlayerDiscards++;
        torchCardToast('FRESH LEGS', 'Extra discard granted!');
        try { navigator.vibrate(30); } catch(e) {}
        SND.cardDeal();
      }
    }

    // GAME PLAN: reset featured player's heat to zero
    if (selTorchId === 'game_plan' && selP) {
      var heatMap = isOff ? gs.offHeatMap : gs.defHeatMap;
      if (heatMap && selP.id) heatMap[selP.id] = 0;
    }

    // SCOUT REPORT: see all 7 players instead of 4
    if (selTorchId === 'scout_report') {
      _scoutActive = true;
      torchCardToast('SCOUT REPORT', 'Full roster revealed!');
      try { navigator.vibrate(15); } catch(e) {}
    }

    // TIMEOUT: add 30 seconds to 2-minute drill clock
    if (selTorchId === 'timeout') {
      if (gs.twoMinActive) {
        gs.clockSeconds = Math.min(120, (gs.clockSeconds || 0) + 30);
      } else {
        // 2-min drill not active — refund the card, it does nothing here
        var tcRefund = TORCH_CARDS.find(function(c) { return c.id === 'timeout'; });
        if (tcRefund) { torchInventory.push(tcRefund); if (GS.season) GS.season.torchCards = torchInventory.slice(); }
        selTorch = null; selectedPreSnap = null;
      }
    }

    // IRON MAN: restore the most recently burned player to ST deck
    if (selTorchId === 'iron_man') {
      if (_humanSTDeck.burned.length > 0) {
        var lastBurned = _humanSTDeck.burned[_humanSTDeck.burned.length - 1].player;
        restorePlayer(_humanSTDeck, lastBurned);
      } else {
        // No burned players — refund the card, it does nothing here
        var tcIronMan = TORCH_CARDS.find(function(c) { return c.id === 'iron_man'; });
        if (tcIronMan) { torchInventory.push(tcIronMan); if (GS.season) GS.season.torchCards = torchInventory.slice(); }
        selTorch = null; selectedPreSnap = null;
      }
    }

    // Torch card combo check
    if (selTorchId) {
      if (FEATURES.cardCombos) {
        var combo = checkCardCombo(_driveCardsUsed, selTorchId);
        if (combo) {
          // Store combo for post-snap bonus application
          _activeDriveCombo = combo;
        }
      }
      _driveCardsUsed.push(selTorchId);
    }

    var preTorchPts = getTorchPoints();
    // Freeze the display counter at the pre-snap value until animation plays
    _torchFrozenValue = preTorchPts;
    _torchDisplayFrozen = true;
    // Dev: check for forced result before executing snap
    var _devForce = getForceResult();
    var _devForceResult = null;
    if (_devForce) {
      _devForceResult = function(result, ydsToEz) {
        result.isTouchdown = false; result.isInterception = false; result.isFumble = false; result.isFumbleLost = false;
        result.isSack = false; result.isIncomplete = false; result.isComplete = false;
        if (_devForce === 'td') {
          result.isTouchdown = true; result.isComplete = true; result.yards = ydsToEz;
          result.description = 'DEV: Forced TOUCHDOWN!';
        } else if (_devForce === 'exploit') {
          result.isComplete = true; result.yards = Math.max(15, Math.min(30, ydsToEz - 1));
          result.description = 'DEV: Forced EXPLOIT — big gain!';
        } else if (_devForce === 'covered') {
          result.isIncomplete = true; result.yards = 0;
          result.description = 'DEV: Forced COVERED — no gain.';
        } else if (_devForce === 'turnover') {
          result.isInterception = true; result.yards = 0;
          result.description = 'DEV: Forced TURNOVER!';
        }
      };
    }
    const res = isOff
      ? gs.executeSnap(selPl, selP, null, null, offCard, defCard, _devForceResult)
      : gs.executeSnap(null, null, selPl, selP, offCard, defCard, _devForceResult);

    if (res) res._torchUsedThisSnap = !!(offCard || defCard);
    _scoutActive = false; // Reset card effect after snap

    // Apply combo bonus
    if (_activeDriveCombo && res && res.result) {
      res.result.yards += _activeDriveCombo.bonus.yards || 0;
      if (_activeDriveCombo.bonus.torchMultiplier) {
        res.result.torchMultiplier = (res.result.torchMultiplier || 1) * _activeDriveCombo.bonus.torchMultiplier;
      }
      // Show combo notification (pointer-events:none overlay)
      var comboOv = document.createElement('div');
      comboOv.style.cssText = "position:fixed;top:8%;left:50%;transform:translateX(-50%);z-index:660;font-family:'Teko';font-weight:700;font-size:18px;color:#00ff44;letter-spacing:3px;text-shadow:0 0 16px rgba(0,255,68,0.6);pointer-events:none;opacity:0;white-space:nowrap;";
      comboOv.textContent = _activeDriveCombo.name + '!';
      el.appendChild(comboOv);
      try {
        gsap.to(comboOv, { opacity: 1, y: -5, duration: 0.3, ease: 'back.out(1.5)' });
        gsap.to(comboOv, { opacity: 0, y: -20, duration: 0.4, delay: 1.5 });
        SND.bigPlay();
      } catch(e) {}
      _setTimeout(function() { if (comboOv.parentNode) comboOv.remove(); }, 2500);
      _activeDriveCombo = null;
    }

    var postTorchPts = getTorchPoints();
    var torchEarned = postTorchPts - preTorchPts;
    // 12TH MAN doubles TORCH points
    if (res && res.result && res.result.torchMultiplier && res.result.torchMultiplier > 1) {
      var bonus = torchEarned * (res.result.torchMultiplier - 1);
      if (gs.possession === 'CT') gs.ctTorchPts += bonus;
      else gs.irTorchPts += bonus;
      torchEarned *= res.result.torchMultiplier;
    }
    if (res) res._torchEarned = torchEarned;

    // Build TORCH sources for sequential animation
    // Simple approach: use the actual diff. If points went up, animate it.
    if (res && torchEarned > 0) {
      var _r = res.result;
      var _sources = [];
      var _comboPts = Math.max(0, Math.floor(isOff ? (_r.offComboPts || 0) : (_r.defComboPts || 0)));
      var _bonusPts = 0;
      if (isOff) {
        if (_r.isTouchdown) _bonusPts += 50;
        if (res.gotFirstDown) _bonusPts += 10;
      } else {
        if (_r.isSafety) _bonusPts += 30;
      }
      // Clamp combo+bonus so they don't exceed the total
      if (_comboPts + _bonusPts > torchEarned) {
        _bonusPts = Math.max(0, torchEarned - _comboPts);
        if (_comboPts > torchEarned) { _comboPts = torchEarned; _bonusPts = 0; }
      }
      var _playPts = torchEarned - _comboPts - _bonusPts;
      if (_playPts > 0) _sources.push({ key: 'play', pts: _playPts });
      if (_comboPts > 0) _sources.push({ key: 'combo', pts: _comboPts });
      if (_bonusPts > 0) _sources.push({ key: 'bonus', pts: _bonusPts });
      // Guaranteed: at least one source if torchEarned > 0
      if (_sources.length === 0) _sources.push({ key: 'play', pts: torchEarned });
      res._torchSources = _sources;
    } else if (res) {
      res._torchSources = [];
    }

    // Apply Game Day Condition modifiers to result (weather, field, crowd)
    if (res && res.result) {
      var r = res.result;
      var isRun = playedPlay && (playedPlay.isRun === true || playedPlay.type === 'run');

      // Rain: completionMod turns completed passes into incompletions
      if (condEffects.completionMod && !isRun && r.isComplete && !r.isSack && !r.isInterception) {
        if (Math.random() < Math.abs(condEffects.completionMod)) {
          r.isComplete = false; r.isIncomplete = true;
          r.yards = 0;
          r.description = 'Ball slips in the rain — incomplete!';
        }
      }
      // Rain/Snow: fumble rate increase on completed plays
      if (condEffects.fumbleRateMod && !r.isIncomplete && !r.isSack && !r.isInterception && !r.isFumbleLost) {
        if (Math.random() < condEffects.fumbleRateMod) {
          r.isFumble = true; r.isFumbleLost = Math.random() < 0.5;
          if (r.isFumbleLost) r.description = 'Wet ball! FUMBLE — defense recovers!';
        }
      }
      // Run/pass mean modifiers (snow, grass, mud)
      var runMod = (condEffects.runMeanMod || 0) + (condEffects.allMeanMod || 0);
      var passMod = condEffects.allMeanMod || 0;
      if (r.yards !== undefined && !r.isTouchdown && !r.isSack && !r.isInterception && !r.isFumbleLost) {
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

    // Track drive summary
    var r = res.result;
    var defName = res.featuredDef ? res.featuredDef.name : 'the defense';
    var isPassPlay = r.playType === 'pass';

    // Resolve QB and receiver/rusher names properly
    var currentOffRoster = isOff ? offRoster : cpuOffRoster;
    var teamQB = currentOffRoster.find(function(p) { return p.pos === 'QB'; });
    var qbName = teamQB ? teamQB.name : '';
    var featuredPos = res.featuredOff ? res.featuredOff.pos : '';
    var featuredName = res.featuredOff ? res.featuredOff.name : '';
    // On pass plays: receiver = featuredOff if not a QB, otherwise pick a WR from roster
    var receiverName = featuredName;
    if (isPassPlay && featuredPos === 'QB') {
      var wr = currentOffRoster.find(function(p) { return p.pos === 'WR' || p.pos === 'TE' || p.pos === 'SLOT'; });
      receiverName = wr ? wr.name : featuredName;
    }
    // On run plays: ball carrier = featuredOff
    var rusherName = featuredName;

    // Attach resolved names to res so commentary.js uses consistent names
    res._receiverName = receiverName;
    res._rusherName = rusherName;

    // ESPN-style play description with player names
    var espnDesc = '?';
    if (r.isTouchdown) espnDesc = r.yards + '-yd TD ' + (isPassPlay ? 'Pass to ' + receiverName : 'Run by ' + rusherName);
    else if (r.isInterception) espnDesc = 'INTERCEPTION by ' + defName;
    else if (r.isFumbleLost) espnDesc = 'FUMBLE \u2014 recovered by ' + defName;
    else if (r.isSack) espnDesc = 'SACK by ' + defName + (Math.abs(r.yards) > 0 ? ', loss of ' + Math.abs(r.yards) : '');
    else if (r.isIncomplete) {
      var incVariants = [
        'Incomplete \u2014 broken up by ' + defName,
        'Incomplete \u2014 overthrown, intended for ' + receiverName,
        'Incomplete \u2014 dropped by ' + receiverName,
        'Incomplete \u2014 ' + receiverName + ' couldn\'t hang on',
      ];
      espnDesc = incVariants[Math.floor(Math.random() * incVariants.length)];
    }
    else if (isPassPlay) {
      if (r.yards > 0) espnDesc = 'Pass to ' + receiverName + ', gain of ' + r.yards + (defName ? ', tackled by ' + defName : '');
      else if (r.yards < 0) espnDesc = 'Pass to ' + receiverName + ', loss of ' + Math.abs(r.yards) + (defName ? ', tackled by ' + defName : '');
      else espnDesc = 'Pass to ' + receiverName + ', no gain' + (defName ? ', tackled by ' + defName : '');
    }
    else {
      if (r.yards > 0) espnDesc = rusherName + ' runs for a gain of ' + r.yards + (defName ? ', tackled by ' + defName : '');
      else if (r.yards < 0) espnDesc = rusherName + ' runs for a loss of ' + Math.abs(r.yards) + (defName ? ', tackled by ' + defName : '');
      else espnDesc = rusherName + ' runs, no gain' + (defName ? ', tackled by ' + defName : '');
    }
    // Track game-wide stats for BOTH teams
    if (isOff) {
      // Human on offense → track human OFF stats + CPU DEF stats
      if (isPassPlay) {
        hOffPassAtt++;
        if (qbName && !hOffQBName) hOffQBName = qbName;
        if (r.isComplete) {
          hOffPassComp++; hOffPassYds += r.yards;
          if (!hOffWRName) hOffWRName = receiverName;
          hOffRec++; hOffRecYds += r.yards;
        }
      } else if (!r.isSack && res.featuredOff) {
        hOffRushAtt++; hOffRushYds += r.yards;
        if (!hOffRBName) hOffRBName = rusherName;
      }
      // CPU defensive player stats
      if (defName) {
        if (!cDefStats[defName]) cDefStats[defName] = { pos: res.featuredDef ? res.featuredDef.pos : '', tkl: 0, pbu: 0, int: 0, sack: 0 };
        var cds = cDefStats[defName];
        if (r.isSack) cds.sack++;
        else if (r.isInterception) cds.int++;
        else if (r.isIncomplete) cds.pbu++;
        else if (!r.isTouchdown) cds.tkl++;
      }
    } else {
      // Human on defense → track CPU OFF stats + human DEF stats
      if (isPassPlay) {
        cOffPassAtt++;
        if (qbName && !cOffQBName) cOffQBName = qbName;
        if (r.isComplete) {
          cOffPassComp++; cOffPassYds += r.yards;
          if (!cOffWRName) cOffWRName = receiverName;
          cOffRec++; cOffRecYds += r.yards;
        }
      } else if (!r.isSack && res.featuredOff) {
        cOffRushAtt++; cOffRushYds += r.yards;
        if (!cOffRBName) cOffRBName = rusherName;
      }
      // Human defensive player stats
      if (defName) {
        if (!hDefStats[defName]) hDefStats[defName] = { pos: res.featuredDef ? res.featuredDef.pos : '', tkl: 0, pbu: 0, int: 0, sack: 0 };
        var hds = hDefStats[defName];
        if (r.isSack) hds.sack++;
        else if (r.isInterception) hds.int++;
        else if (r.isIncomplete) hds.pbu++;
        else if (!r.isTouchdown) hds.tkl++;
      }
    }
    // Per-player stat accumulation for card display
    function _addStat(pid, key, val) {
      if (!pid) return;
      if (!_playerGameStats[pid]) _playerGameStats[pid] = {};
      _playerGameStats[pid][key] = (_playerGameStats[pid][key] || 0) + (val || 1);
    }
    var _offId = res.featuredOff ? res.featuredOff.id : null;
    var _defId = res.featuredDef ? res.featuredDef.id : null;

    if (isPassPlay) {
      if (_offId && res.featuredOff.pos === 'QB') { _addStat(_offId, 'passAtt'); if (r.isComplete) { _addStat(_offId, 'passComp'); _addStat(_offId, 'passYds', r.yards); } }
      if (_offId && res.featuredOff.pos !== 'QB' && r.isComplete) { _addStat(_offId, 'rec'); _addStat(_offId, 'recYds', r.yards); }
    } else if (!r.isSack) {
      if (_offId) { _addStat(_offId, 'rushAtt'); _addStat(_offId, 'rushYds', r.yards); }
    }
    if (r.isTouchdown && _offId) _addStat(_offId, 'td');
    if (r.isSack && _defId) _addStat(_defId, 'sack');
    if (r.isInterception && _defId) _addStat(_defId, 'int');
    if (r.isIncomplete && _defId) _addStat(_defId, 'pbu');
    if (!r.isTouchdown && !r.isSack && !r.isInterception && !r.isIncomplete && _defId) _addStat(_defId, 'tkl');

    // Stat milestone checks (only for user's team)
    if (isOff && _offId) _checkMilestone(_offId);
    if (!isOff && _defId) _checkMilestone(_defId);

    driveSummaryLog.push({
      down: preSnap.down, dist: preSnap.distance, ydsToEz: preSnap.yardsToEndzone,
      playName: espnDesc,
      yards: r.yards, isTD: r.isTouchdown, isSack: r.isSack,
      isInc: r.isIncomplete, isInt: r.isInterception, isFumble: r.isFumbleLost,
      isUserOff: isOff
    });
    var _tickerColor = r.isTouchdown ? '#EBB010' : (r.isInterception || r.isFumbleLost) ? '#ff0040' : r.yards >= 10 ? '#00ff44' : '#888';
    pushTicker(espnDesc || ('Play: ' + r.yards + ' yards'), _tickerColor);
    // Show TORCH points earned in ticker
    if (res._torchEarned && res._torchEarned > 0) {
      var _ptBreakdown = '+' + res._torchEarned + ' TORCH';
      if (r.isTouchdown) _ptBreakdown = 'BASE ' + Math.max(0, res._torchEarned - 50) + ' + TD BONUS = +' + res._torchEarned + ' TORCH';
      pushTicker(_ptBreakdown, '#EBB010');
    }
    if (res.gotFirstDown) driveFirstDowns++;

    // Replace used cards in hand manager
    var _snapHs = getHandState();
    handAfterSnap(_snapHs, selPl, selP);
    // Also cycle in engine hand for backward compat
    var sides = gs.getCurrentSides();
    var teamId = GS.team;
    if (isOff) {
      cycleCard(playedPlay, sides.offHand, getOffCards(teamId), teamId);
    } else {
      cycleCard(playedPlay, sides.defHand, getDefCards(teamId), teamId);
    }
    // Don't clear selP/selPl yet — keep placed cards visible on field during post-play
    selTorch = null;
    // Don't redraw field or panel — cards stay placed during result animation
    phase = 'busy';
    panel.className = 'T-panel T-panel-hidden';
    driveSummaryEl.style.display = ''; // Show PBP during snap result
    res._preSnap = preSnap;

    // Check star activation
    var wasOffHot = offStarHot, wasDefHot = defStarHot;
    checkStarActivation(res);

    // Stop real-time clock on clock-stopping plays (incomplete, spike already handled, turnovers)
    if (gs.twoMinActive && res.result && (res.result.isIncomplete || res.result.isInterception || res.result.isFumbleLost || res.result.isTouchdown)) {
      stop2MinClock();
    }

    run3BeatSnap(res, prevPoss, wasOffHot, wasDefHot);
  }

  // ── 4-PHASE CARD CLASH / REVEAL (v0.22 Phase 5) ──
  function run3BeatSnap(res, prevPoss, wasOffHot, wasDefHot) {
    var r = res.result;
    var isTD = r.isTouchdown;
    var isExplosive = r.yards >= 15;
    var isUserOff = prevPoss === hAbbr;

    // User-biased sentiment: green = good for user, red = bad for user
    var isGoodForUser, isBadForUser;
    if (isUserOff) {
      isGoodForUser = (r.yards >= 4 || isTD) && !r.isInterception && !r.isFumbleLost;
      isBadForUser = r.isSack || r.isInterception || r.isFumbleLost || r.isSafety || r.yards < 0;
    } else {
      // User on defense — flip: stops are good, opponent gains are bad
      isGoodForUser = r.isSack || r.isInterception || r.isFumbleLost || r.isSafety || r.yards <= 0 || r.isIncomplete;
      isBadForUser = (r.yards >= 4 || isTD) && !r.isInterception && !r.isFumbleLost;
    }
    // Legacy aliases for tier/card glow logic
    var isGood = isGoodForUser;
    var isBad = isBadForUser;

    // Determine drama tier (1=routine, 2=important, 3=game-changing)
    var tier = 1;
    var s = gs.getSummary();
    if (isTD || r.isInterception || r.isFumbleLost) tier = 3;
    else if (r.isSack || isExplosive || s.down >= 3 || s.yardsToEndzone <= 20) tier = 2;
    if (s.half === 2 && Math.abs(s.ctScore - s.irScore) <= 7 && tier < 3) tier = Math.min(3, tier + 1);

    // Drive heat momentum bar
    if (FEATURES.driveHeat) updateDriveHeat(r, res.gameEvent);
    drawDriveHeat();

    // Canvas field play animation
    if (_fieldAnimator) {
      var _s = gs.getSummary();
      var _ballYard = _s.ballPosition * 1.1 + 5;
      var _offTeamId = isUserOff ? GS.team : (GS.opponent || 'wolves');
      var _defTeamId = isUserOff ? (GS.opponent || 'wolves') : GS.team;
      var _formation = 'shotgun_deuce';
      if (res.offPlay && _fieldAnimator.pickFormation) {
        _formation = _fieldAnimator.pickFormation(res.offPlay.playType || 'SHORT', _offTeamId);
      }
      var _animType = isTD ? 'touchdown' : r.isSack ? 'sack' : r.isInterception ? 'interception' : r.isIncomplete ? 'incomplete' : (res.offPlay && res.offPlay.isRun) ? 'run' : 'complete';
      try {
        _fieldAnimator.playSequence(_animType, r.yards, {
          ballYard: Math.max(10, Math.min(110, _ballYard)),
          losYard: Math.max(10, Math.min(110, _ballYard)),
          firstDownYard: Math.max(10, Math.min(110, _ballYard + _s.distance)),
          formation: _formation,
          playType: res.offPlay ? res.offPlay.playType : 'SHORT',
          defScheme: res.defPlay ? res.defPlay.cardType : 'ZONE',
          offTeam: _offTeamId,
          defTeam: _defTeamId,
          skipDots: true,
          skipLOS: true,
        });
      } catch(e) { /* Field animation is non-critical */ }
    }

    // Tier-based timing
    var anticipationMs = tier === 1 ? 0 : tier === 2 ? 300 : 800;
    var hitstopMs = tier === 1 ? 33 : tier === 2 ? 67 : 133;
    var shakeAmt = tier === 1 ? 1 : tier === 2 ? 2 : 5;
    var dimLevel = tier === 1 ? 0.2 : tier === 2 ? 0.4 : 0.7;
    var particleCount = tier === 1 ? 0 : tier === 2 ? 15 : 35;
    var cardScale = tier === 1 ? 1.0 : tier === 2 ? 1.1 : 1.25;
    var aftermathDur = isTD ? 5000 : tier === 3 ? 3500 : tier === 2 ? 2500 : 1800;
    var _speedMult = getSpeedMultiplier();
    anticipationMs = Math.round(anticipationMs * _speedMult);
    hitstopMs = Math.round(hitstopMs * _speedMult);
    aftermathDur = Math.round(aftermathDur * _speedMult);

    // User-biased result display
    var resultColor, resultText;
    if (res._isConversion) {
      resultColor = r.isComplete ? '#00ff44' : '#ff0040';
      resultText = r.isComplete ? 'GOOD!' : 'NO GOOD';
    } else if (isUserOff) {
      resultColor = isTD ? '#EBB010' : isGoodForUser ? '#00ff44' : isBadForUser ? '#ff0040' : r.yards > 0 ? '#c8a030' : '#aaa';
      resultText = isTD ? 'TOUCHDOWN' : r.isSack ? 'SACK' : r.isInterception ? 'INTERCEPTED' : r.isFumbleLost ? 'FUMBLE' : r.isIncomplete ? 'INCOMPLETE' : r.isSafety ? 'SAFETY' : r.yards === 0 ? 'NO GAIN' : yardTextShort(r.yards);
    } else {
      // User on defense — show opponent gains as bad, stops as good
      if (isTD) { resultColor = '#ff0040'; resultText = 'TOUCHDOWN'; }
      else if (r.isSack) { resultColor = '#00ff44'; resultText = 'SACKED!'; }
      else if (r.isInterception) { resultColor = '#00ff44'; resultText = 'PICKED OFF!'; }
      else if (r.isFumbleLost) { resultColor = '#00ff44'; resultText = 'FUMBLE!'; }
      else if (r.isIncomplete) { resultColor = '#00ff44'; resultText = 'INCOMPLETE'; }
      else if (r.isSafety) { resultColor = '#00ff44'; resultText = 'SAFETY!'; }
      else if (r.yards <= 0) { resultColor = '#00ff44'; resultText = 'STUFFED!'; }
      else if (r.yards <= 3) { resultColor = '#c8a030'; resultText = '+' + r.yards; }
      else { resultColor = '#ff0040'; resultText = '+' + r.yards; }
    }
    var flashColor = isGoodForUser ? '#00ff44' : isBadForUser ? '#ff0040' : 'transparent';

    // Layer 6: update ambient mood
    updateMood(isGoodForUser, isBadForUser);

    panel.style.display = 'none';
    snapCount++;

    // Allow tap-to-skip
    var skipped = false;
    var _settled = false; // guard: doSettle fires at most once
    function onSkip() { skipped = true; }

    // ── OVERLAY CONTAINER ──
    var overlay = document.createElement('div');
    overlay.className = 'T-clash-overlay';
    overlay.onclick = onSkip;
    var dim = document.createElement('div');
    dim.className = 'T-clash-dim';
    dim.style.opacity = '1';
    overlay.appendChild(dim);
    el.appendChild(overlay);

    // ── PHASE 1: COMMIT (0.2s) — screen dims, snap sound ──
    SND.cardSnap();

    // ── PHASE 2: BLACKOUT (tier-scaled tension) — field animates underneath ──
    var blackoutMs = Math.round((tier === 1 ? 200 : tier === 2 ? 400 : 700) * _speedMult);
    var blackout = document.createElement('div');
    blackout.style.cssText = 'position:absolute;inset:0;background:#000;z-index:1;opacity:0;transition:opacity ' + (blackoutMs * 0.4) + 'ms;';
    overlay.appendChild(blackout);
    requestAnimationFrame(function() { blackout.style.opacity = tier === 1 ? '0.6' : tier === 2 ? '0.8' : '0.95'; });

    _setTimeout(function() {
      if (skipped) { doSettle(); return; }

      // ── PHASE 3: RESULT SLAM — result text slams in, screen shake, particles ──
      blackout.style.opacity = '0';

      // Torch card activation flash — brief orange glow when a torch card was used
      if (res._torchUsedThisSnap) {
        var _tcFlash = document.createElement('div');
        _tcFlash.style.cssText = 'position:absolute;inset:0;background:rgba(235,176,16,0.15);z-index:2;pointer-events:none;';
        overlay.appendChild(_tcFlash);
        try { gsap.to(_tcFlash, { opacity: 0, duration: 0.4, delay: 0.15, onComplete: function() { _tcFlash.remove(); } }); } catch(e) { _tcFlash.remove(); }
      }

      // Hit-stop: brief frozen moment before impact (tier 2+)
      if (tier >= 2) {
        dim.style.opacity = tier === 3 ? '0.85' : '0.7';
        _setTimeout(function() { dim.style.opacity = '0.5'; }, tier === 3 ? 150 : 80);
      }

      // Screen shake
      if (shakeAmt > 0) {
        var shakeAnim = tier === 1 ? 'T-micro-shake 0.15s ease-out' : 'T-clash-shake ' + (tier === 3 ? '0.4s' : '0.2s') + ' ease-out';
        el.style.animation = shakeAnim;
        _setTimeout(function() { el.style.animation = ''; }, tier === 1 ? 180 : tier === 3 ? 450 : 250);
      }

      // Flash
      if (flashColor !== 'transparent') {
        var flash = document.createElement('div');
        flash.className = 'T-clash-flash';
        flash.style.background = flashColor;
        overlay.appendChild(flash);
        _setTimeout(function() { flash.remove(); }, 300);
      }

      // Particles
      for (var i = 0; i < particleCount; i++) {
        var spark = document.createElement('div');
        var angle = (i / particleCount) * 360 + Math.random() * 30;
        var dist = 20 + Math.random() * (tier === 3 ? 80 : 40);
        var sz = 2 + Math.random() * 3;
        spark.style.cssText = 'position:absolute;width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:' + (Math.random() > 0.5 ? '#EBB010' : '#fff') + ';z-index:5;top:50%;left:50%;--sx:' + (Math.cos(angle * Math.PI / 180) * dist) + 'px;--sy:' + (Math.sin(angle * Math.PI / 180) * dist) + 'px;animation:T-clash-spark ' + (300 + Math.random() * 400) + 'ms ease-out both;';
        overlay.appendChild(spark);
      }

      // Haptic
      if (navigator.vibrate) try { navigator.vibrate(tier === 3 ? 100 : tier === 2 ? 50 : 12); } catch(e) {}

      // Sack brutality — extra shake + red vignette when user QB gets sacked
      if (r.isSack && isUserOff) {
        // Harder shake (override tier)
        try {
          el.style.animation = 'T-clash-shake 0.5s ease-out';
          _setTimeout(function() { el.style.animation = ''; }, 550);
        } catch(e) {}
        // Red vignette flash
        var sackVig = document.createElement('div');
        sackVig.style.cssText = 'position:absolute;inset:0;z-index:4;pointer-events:none;background:radial-gradient(ellipse at center,transparent 30%,rgba(255,0,64,0.25) 100%);opacity:0;';
        overlay.appendChild(sackVig);
        try {
          gsap.to(sackVig, { opacity: 1, duration: 0.15 });
          gsap.to(sackVig, { opacity: 0, duration: 0.6, delay: 0.3, onComplete: function() { sackVig.remove(); } });
        } catch(e) {}
        // Heavy haptic
        if (navigator.vibrate) try { navigator.vibrate([60, 30, 80]); } catch(e) {}
      }
      // Turnover gut punch — screen recoils
      if ((r.isInterception || r.isFumbleLost) && isUserOff) {
        try {
          gsap.to(el, { scaleY: 0.97, duration: 0.04 });
          gsap.to(el, { scaleY: 1, duration: 0.15, delay: 0.04, ease: 'elastic.out(1, 0.5)' });
        } catch(e) {}
        if (navigator.vibrate) try { navigator.vibrate([40, 20, 60]); } catch(e) {}
      }

      // Sound — crowd spikes on big plays, holds, then settles
      var _settleState = gs.twoMinActive ? 'two_min_drill' : 'normal_play';
      if (isTD && isUserOff) { SND.td(); AudioStateManager.setState('touchdown'); AudioStateManager.holdThenSettle(4000, _settleState); }
      else if (isTD && !isUserOff) { SND.turnover(); AudioStateManager.setState('turnover'); AudioStateManager.holdThenSettle(3000, _settleState); }
      else if (isGoodForUser && tier >= 2) { SND.bigPlay(); AudioStateManager.setState('big_moment'); AudioStateManager.holdThenSettle(2000, _settleState); }
      else if (isBadForUser) { SND.turnover(); AudioStateManager.setState('turnover'); AudioStateManager.holdThenSettle(3000, _settleState); }
      else if (r.isIncomplete) { SND.incomp(); }
      else { tier === 1 && r.yards > 0 ? SND.hit() : SND.snap(); }

      // ── PHASE 4: SETTLE — proceed to result display ──
      var settleDelay = tier === 1 ? 100 : tier === 2 ? 300 : 500;
      _setTimeout(function() {
        if (skipped) { doSettle(); return; }
        doSettle();
      }, settleDelay);
    }, blackoutMs); // result slam after blackout

    // ── POST-PLAY 4-BEAT DISPLAY (Phase 6) ──
    function doSettle() {
      if (_settled) return; _settled = true;
      overlay.onclick = null;
      // Ensure dim is at a consistent level for the result display
      dim.style.opacity = '0.5';

      // ── LAYER 4: Visual weight — size based on user sentiment, not raw yards ──
      var level = tier;
      var gotFirstDown = res.gotFirstDown;
      // Scale font based on sentiment AND text length so it fits the overlay
      var textLen = resultText.length;
      var ydsFontSize, resultGlow, resultAnim, resultPos;
      if (isGoodForUser) {
        // Big, centered, glowing — but scale down for long text
        var goodBase = level === 3 ? 72 : level === 2 ? 56 : 48;
        if (textLen > 12) goodBase = Math.min(goodBase, 40);
        else if (textLen > 8) goodBase = Math.min(goodBase, 48);
        ydsFontSize = goodBase + 'px';
        resultGlow = 'text-shadow:0 0 20px ' + resultColor + '60,0 0 40px ' + resultColor + '30;';
        resultAnim = 'animation:T-clash-yds 0.4s cubic-bezier(0.34,1.56,0.64,1) both;';
        resultPos = '';
      } else if (isBadForUser) {
        // Smaller, top area, muted — acknowledge and move on
        var badBase = level === 3 ? 40 : 32;
        if (textLen > 12) badBase = Math.min(badBase, 28);
        ydsFontSize = badBase + 'px';
        resultGlow = '';
        resultAnim = 'animation:T-clash-yds 0.25s ease-out both;';
        resultPos = 'position:absolute;top:20%;left:50%;transform:translateX(-50%);width:90%;text-align:center;';
      } else {
        ydsFontSize = textLen > 10 ? '36px' : '44px';
        resultGlow = '';
        resultAnim = 'animation:T-clash-yds 0.3s ease-out both;';
        resultPos = '';
      }

      // ── LAYER 5: Timing — good lingers, bad moves on fast ──
      var holdMultiplier = isGoodForUser ? 1.5 : isBadForUser ? 0.9 : 1.0;
      var totalDur = Math.round((level === 3 ? 6000 : level === 2 ? 4500 : 3200) * holdMultiplier * getSpeedMultiplier());

      // Enforce minimum display times per result type
      if (r.isIncomplete && totalDur > 1500) totalDur = 1500;
      if (r.yards === 0 && !r.isSack && !r.isIncomplete && totalDur > 1800) totalDur = 1800;

      // Detect game-winning/go-ahead score
      var preSnapScore = res._preSnap;
      var wasTrailing = false;
      var wasLead = false;
      if (preSnapScore && isUserOff) {
        var userScorePre = preSnapScore.ctScore;
        var oppScorePre = preSnapScore.irScore;
        wasTrailing = userScorePre <= oppScorePre;
        var userScoreNow = gs.ctScore;
        var oppScoreNow = gs.irScore;
        wasLead = userScoreNow > oppScoreNow;
      }
      var isGoAhead = wasTrailing && wasLead;
      var isClutch = isGoAhead && (gs.half === 2 || gs.twoMinActive);

      // ── TD CELEBRATION — separate flow for touchdowns ──
      if (isTD && isUserOff && !res._isConversion) {
        // USER SCORES — 4-beat cinematic
        totalDur = 5500;
        var teamAccent = hTeam.accent || '#EBB010';

        // ── Beat 1: Impact (0-0.3s) ──
        var tdDim = document.createElement('div');
        tdDim.style.cssText = 'position:absolute;inset:0;background:#0A0804;opacity:0.75;z-index:8;';
        overlay.appendChild(tdDim);

        var tdFlash = document.createElement('div');
        tdFlash.style.cssText = 'position:absolute;inset:0;background:rgba(0,255,68,0.35);z-index:12;pointer-events:none;';
        overlay.appendChild(tdFlash);
        try { gsap.to(tdFlash, { opacity: 0, duration: 0.3, onComplete: function() { tdFlash.remove(); } }); } catch(e) { tdFlash.remove(); }

        shakeScreen(7);

        var accentTop = document.createElement('div');
        accentTop.style.cssText = 'position:absolute;top:0;left:0;right:0;height:4px;background:' + teamAccent + ';z-index:13;opacity:0;';
        var accentBot = document.createElement('div');
        accentBot.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:4px;background:' + teamAccent + ';z-index:13;opacity:0;';
        overlay.appendChild(accentTop); overlay.appendChild(accentBot);
        try { gsap.to([accentTop, accentBot], { opacity: 1, duration: 0.15 }); } catch(e) { accentTop.style.opacity='1'; accentBot.style.opacity='1'; }

        // Radial particle ring burst (Rocket League style)
        for (var _pi = 0; _pi < 40; _pi++) {
          var _part = document.createElement('div');
          var _angle = (_pi / 40) * 360;
          var _dist = 120 + Math.random() * 80;
          var _pSz = 2 + Math.random() * 3;
          var _pColor = [teamAccent, '#00ff44', '#EBB010', '#fff', '#FF4511'][_pi % 5];
          _part.style.cssText = 'position:absolute;top:50%;left:50%;width:' + _pSz + 'px;height:' + _pSz + 'px;border-radius:50%;background:' + _pColor + ';z-index:14;pointer-events:none;opacity:0;';
          overlay.appendChild(_part);
          try {
            gsap.to(_part, {
              x: Math.cos(_angle * Math.PI / 180) * _dist,
              y: Math.sin(_angle * Math.PI / 180) * _dist,
              opacity: 1, duration: 0.15, delay: 0.1
            });
            gsap.to(_part, {
              opacity: 0, scale: 0, duration: 0.4, delay: 0.3,
              onComplete: function() { if (_part.parentNode) _part.remove(); }
            });
          } catch(e) { _part.remove(); }
        }

        // Haptic
        if (navigator.vibrate) try { navigator.vibrate([30, 50, 80]); } catch(e) {}

        // ── Beat 2: Reveal (0.3-0.9s) ──
        var resultWrap = document.createElement('div');
        resultWrap.className = 'T-clash-result';
        resultWrap.style.cssText = 'z-index:10;gap:6px;';
        overlay.appendChild(resultWrap);

        // Team name
        var teamNameEl = document.createElement('div');
        teamNameEl.style.cssText = "font-family:'Oswald';font-weight:700;font-size:18px;color:" + teamAccent + ";letter-spacing:6px;text-shadow:0 0 16px " + teamAccent + "66;opacity:0;transform:translateY(8px);";
        teamNameEl.textContent = hTeam.name.toUpperCase();
        resultWrap.appendChild(teamNameEl);
        try { gsap.to(teamNameEl, { opacity: 1, y: 0, duration: 0.2, delay: 0.3, ease: 'power2.out' }); } catch(e) { teamNameEl.style.opacity='1'; }

        // "TOUCHDOWN" — chrome green gradient
        var tdTextEl = document.createElement('div');
        tdTextEl.style.cssText = "font-family:'Teko';font-weight:900;font-size:56px;letter-spacing:3px;line-height:1;background:linear-gradient(180deg,#fff 0%,#00ff44 30%,#fff 50%,#00ff44 70%,#fff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 24px rgba(0,255,68,0.6)) drop-shadow(0 0 48px rgba(0,255,68,0.3)) drop-shadow(0 6px 12px rgba(0,0,0,0.9));opacity:0;transform:scale(0.3);white-space:nowrap;";
        tdTextEl.textContent = 'TOUCHDOWN';
        resultWrap.appendChild(tdTextEl);
        try { gsap.to(tdTextEl, { opacity: 1, scale: 1, duration: 0.25, delay: 0.35, ease: 'back.out(2.5)' }); } catch(e) { tdTextEl.style.opacity='1'; tdTextEl.style.transform='scale(1)'; }

        // Auto-size to fit
        requestAnimationFrame(function() {
          var maxW = (overlay.offsetWidth || 375) - 40;
          var fs = 56;
          while (tdTextEl.scrollWidth > maxW && fs > 28) { fs -= 2; tdTextEl.style.fontSize = fs + 'px'; }
        });

        // Second green flash on text slam
        _setTimeout(function() {
          var flash2 = document.createElement('div');
          flash2.style.cssText = 'position:absolute;inset:0;background:rgba(0,255,68,0.2);z-index:12;pointer-events:none;';
          overlay.appendChild(flash2);
          try { gsap.to(flash2, { opacity: 0, duration: 0.2, onComplete: function() { flash2.remove(); } }); } catch(e) { flash2.remove(); }
        }, 350);

        // Radial glow expanding behind
        var glow = document.createElement('div');
        glow.style.cssText = 'position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:radial-gradient(circle,rgba(0,255,68,0.15),transparent 70%);z-index:9;transform:translate(-50%,-50%);pointer-events:none;';
        overlay.appendChild(glow);
        try { gsap.to(glow, { width: 700, height: 700, duration: 0.8, delay: 0.3, ease: 'power2.out' }); } catch(e) {}

        // ── Beat 3: Context (0.9-1.5s) ──
        _setTimeout(function() {
          if (!overlay.parentNode) return;
          // Gradient divider
          var divider = document.createElement('div');
          divider.style.cssText = "width:60px;height:1px;background:linear-gradient(90deg,transparent,rgba(0,255,68,0.27),transparent);transform:scaleX(0);margin:4px 0;";
          resultWrap.appendChild(divider);
          try { gsap.to(divider, { scaleX: 1, duration: 0.3, ease: 'power2.out' }); } catch(e) { divider.style.transform='scaleX(1)'; }

          // Commentary
          var gameCtx = gs.getSummary();
          gameCtx.preSnapPossession = prevPoss;
          var comm = generateCommentary(res, gameCtx, hTeam.name, oTeam.name);
          setNarr(comm.line1, comm.line2 || '');

          var commEl = document.createElement('div');
          commEl.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:12px;color:rgba(255,255,255,0.6);text-shadow:0 2px 4px rgba(0,0,0,0.8);max-width:280px;text-align:center;opacity:0;transform:translateY(6px);";
          commEl.textContent = comm.line1;
          resultWrap.appendChild(commEl);
          try { gsap.to(commEl, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }); } catch(e) { commEl.style.opacity='1'; }

          // Score update
          var hS = hAbbr === 'CT' ? gs.ctScore : gs.irScore;
          var oS = hAbbr === 'CT' ? gs.irScore : gs.ctScore;
          var scoreEl = document.createElement('div');
          scoreEl.style.cssText = "display:flex;align-items:baseline;gap:8px;margin-top:6px;opacity:0;";
          scoreEl.innerHTML =
            "<span style=\"font-family:'Teko';font-weight:900;font-size:28px;color:#fff;text-shadow:0 0 12px " + teamAccent + "66;\">" + hTeam.name + " " + hS + "</span>" +
            "<span style=\"font-family:'Rajdhani';font-weight:600;font-size:14px;color:#555;\">\u2014</span>" +
            "<span style=\"font-family:'Teko';font-weight:700;font-size:20px;color:rgba(255,255,255,0.4);\">" + oS + " " + oTeam.name + "</span>";
          resultWrap.appendChild(scoreEl);
          try { gsap.to(scoreEl, { opacity: 1, duration: 0.3, delay: 0.15, ease: 'power2.out' }); } catch(e) { scoreEl.style.opacity='1'; }
        }, 900);

        // Team phrase
        var celeb = TEAM_CELEBRATION[GS.team] || TEAM_CELEBRATION.sentinels;
        _setTimeout(function() {
          if (!overlay.parentNode) return;
          var phraseEl = document.createElement('div');
          phraseEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:14px;color:" + teamAccent + ";letter-spacing:2px;opacity:0;text-shadow:0 0 12px " + teamAccent + "40;";
          phraseEl.textContent = celeb.phrases[Math.floor(Math.random() * celeb.phrases.length)];
          resultWrap.appendChild(phraseEl);
          try { gsap.to(phraseEl, { opacity: 1, duration: 0.3 }); } catch(e) { phraseEl.style.opacity = '1'; }
        }, 1000);

        // ── Beat 4: Reward (1.5-2.5s) — TORCH cascade ──
        var cascadeWrap = document.createElement('div');
        cascadeWrap.style.cssText = 'position:absolute;bottom:22%;left:50%;transform:translateX(-50%);z-index:11;text-align:center;pointer-events:none;';
        overlay.appendChild(cascadeWrap);

        var cascadeItems = [{ label: 'TD', pts: 6, delay: 1500 }];
        var bonusPts = Math.max(0, (res._torchEarned || 0) - 6);
        if (bonusPts > 0) cascadeItems.push({ label: 'BONUS', pts: bonusPts, delay: 1900 });

        cascadeItems.forEach(function(item) {
          _setTimeout(function() {
            var line = document.createElement('div');
            line.style.cssText = "display:flex;align-items:center;gap:4px;justify-content:center;opacity:0;transform:translateY(10px) scale(0.8);";
            line.innerHTML = "<svg viewBox='0 0 44 56' width='14' height='18' fill='#EBB010'><path d='M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z'/></svg>" +
              "<span style=\"font-family:'Teko';font-weight:700;font-size:20px;color:#EBB010;letter-spacing:3px;text-shadow:0 0 8px rgba(235,176,16,0.4);\">" + item.label + " +" + item.pts + "</span>";
            cascadeWrap.appendChild(line);
            try { gsap.to(line, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.5)' }); } catch(e) { line.style.opacity='1'; line.style.transform='none'; }
            try { SND.chime(); } catch(e) {}
          }, item.delay);
        });

        // Confetti — 3 waves of 12 particles
        function spawnTdConfetti(ov, tAccent, count, delay) {
          var colors = ['#00ff44', '#EBB010', '#FF4511', '#fff', tAccent];
          _setTimeout(function() {
            if (!ov.parentNode) return;
            for (var i = 0; i < count; i++) {
              var c = document.createElement('div');
              var x = 5 + Math.random() * 90;
              var sz = 3 + Math.random() * 5;
              var dur = 1800 + Math.random() * 1500;
              var drift = (Math.random() - 0.5) * 80;
              var rot = 360 + Math.random() * 1080;
              var col = colors[i % colors.length];
              c.style.cssText = 'position:absolute;top:-10px;left:' + x + '%;width:' + sz + 'px;height:' + sz + 'px;background:' + col + ';border-radius:1px;opacity:0.9;z-index:11;--drift:' + drift + 'px;--rot:' + rot + 'deg;animation:T-td-confetti ' + dur + 'ms ease-in both;';
              ov.appendChild(c);
              c.addEventListener('animationend', function() { if (c.parentNode) c.remove(); }, { once: true });
            }
          }, delay);
        }
        spawnTdConfetti(overlay, teamAccent, 12, 200);
        spawnTdConfetti(overlay, teamAccent, 12, 800);
        spawnTdConfetti(overlay, teamAccent, 12, 1400);

        // ── CLUTCH CELEBRATION — go-ahead score in 2nd half or 2-minute drill ──
        if (isClutch) {
          totalDur = 6000;

          _setTimeout(function() {
            var clutchEl = document.createElement('div');
            clutchEl.style.cssText = "position:absolute;top:12%;left:50%;transform:translateX(-50%);z-index:13;font-family:'Teko';font-weight:700;font-size:20px;letter-spacing:4px;opacity:0;white-space:nowrap;pointer-events:none;" +
              "color:#00ff44;text-shadow:0 0 20px rgba(0,255,68,0.6);";
            var _clutchText = gs.twoMinActive ? 'CLUTCH DRIVE!' : 'GO-AHEAD SCORE!';
            if (preSnapScore) {
              var _trailingBy = oppScorePre - userScorePre;
              if (_trailingBy >= 14 && isGoAhead) _clutchText = 'COMEBACK!';
            }
            clutchEl.textContent = _clutchText;
            overlay.appendChild(clutchEl);
            try {
              gsap.to(clutchEl, { opacity: 1, y: -5, duration: 0.4, ease: 'back.out(1.5)' });
              gsap.to(clutchEl, { opacity: 0, duration: 0.3, delay: 2.5 });
            } catch(e) { clutchEl.style.opacity = '1'; }
          }, 1000);

          // Extra confetti burst (30 more green particles)
          _setTimeout(function() {
            for (var ci2 = 0; ci2 < 30; ci2++) {
              (function() {
                var conf2 = document.createElement('div');
                var cx2 = 10 + Math.random() * 80;
                var cs2 = 3 + Math.random() * 5;
                conf2.style.cssText = 'position:absolute;top:-10px;left:' + cx2 + '%;width:' + cs2 + 'px;height:' + cs2 + 'px;background:#00ff44;border-radius:1px;z-index:11;pointer-events:none;--drift:' + ((Math.random()-0.5)*60) + 'px;--rot:' + (360+Math.random()*1080) + 'deg;';
                overlay.appendChild(conf2);
                try {
                  gsap.to(conf2, { y: window.innerHeight + 20, rotation: 720, duration: 2 + Math.random() * 2, ease: 'power1.in', delay: Math.random() * 0.5, onComplete: function() { if (conf2.parentNode) conf2.remove(); } });
                } catch(e) {}
              })();
            }
          }, 1200);

          if (navigator.vibrate) try { navigator.vibrate([40, 60, 80, 60, 120]); } catch(e) {}
        }

        // First-ever TD explainer (one-time, teaches economy)
        var _firstTdExplained = localStorage.getItem('torch_first_td_done');
        if (!_firstTdExplained) {
          localStorage.setItem('torch_first_td_done', '1');
          _setTimeout(function() {
            if (!overlay.parentNode) return;
            var explainer = document.createElement('div');
            explainer.style.cssText = "position:absolute;bottom:12%;left:50%;transform:translateX(-50%);z-index:14;text-align:center;max-width:300px;padding:12px 16px;background:rgba(0,0,0,0.85);border:1px solid #EBB01044;border-radius:8px;opacity:0;pointer-events:none;";
            explainer.innerHTML =
              "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:#EBB010;letter-spacing:2px;\">YOUR SCORE IS YOUR WALLET</div>" +
              "<div style=\"font-family:'Rajdhani';font-size:11px;color:#ccc;margin-top:4px;line-height:1.3;\">TORCH points are earned every play. Spend them on powerful single-use cards in the TORCH Store.</div>" +
              "<div style=\"font-family:'Rajdhani';font-size:9px;color:#888;margin-top:6px;\">The store opens after big plays</div>";
            overlay.appendChild(explainer);
            try {
              gsap.to(explainer, { opacity: 1, duration: 0.3 });
              gsap.to(explainer, { opacity: 0, duration: 0.3, delay: 3.5, onComplete: function() { explainer.remove(); } });
            } catch(e) { explainer.style.opacity = '1'; setTimeout(function() { explainer.remove(); }, 4000); }
          }, 3000);
        }

        drawBug(); drawField();

      } else if (isTD && !isUserOff && !res._isConversion) {
        // OPPONENT SCORES — muted, top-positioned
        totalDur = 2800;
        var oppTdWrap = document.createElement('div');
        oppTdWrap.className = 'T-clash-result';
        oppTdWrap.style.cssText = 'position:absolute;top:22%;left:50%;transform:translateX(-50%);width:90%;text-align:center;';
        oppTdWrap.style.opacity = '0';
        oppTdWrap.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:32px;color:" + oTeam.accent + ";letter-spacing:2px;opacity:0.7;\">TOUCHDOWN</div>" +
          "<div style=\"font-family:'Rajdhani';font-size:12px;color:" + oTeam.accent + ";opacity:0.5;margin-top:4px;\">" + oTeam.name + " scores.</div>";
        overlay.appendChild(oppTdWrap);
        requestAnimationFrame(function() { oppTdWrap.style.opacity = '1'; oppTdWrap.style.transition = 'opacity 0.25s'; });

        _setTimeout(function() {
          var gameCtx = gs.getSummary();
          gameCtx.preSnapPossession = prevPoss;
          var comm = generateCommentary(res, gameCtx, hTeam.name, oTeam.name);
          setNarr(comm.line1, '');
        }, 400);

        drawBug(); drawField();

      } else if (res._isConversion) {
        // ── CONVERSION RESULT ──
        var convIsGood = r.isComplete || r.isTouchdown;
        var _convPreSnap = res._preSnap || {};
        var convIs3pt = _convPreSnap.distance === 10 || _convPreSnap.yardsToEndzone === 10;
        var convLabel = convIs3pt ? '3-POINT' : '2-POINT';
        var convPts = convIs3pt ? 3 : 2;

        if (convIsGood) {
          totalDur = 3500;
          // GOOD! — chrome green gradient
          var convWrap = document.createElement('div');
          convWrap.className = 'T-clash-result';
          convWrap.style.cssText = 'z-index:10;gap:6px;';
          overlay.appendChild(convWrap);

          var convTypeEl = document.createElement('div');
          convTypeEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:3px;opacity:0;transform:translateY(8px);";
          convTypeEl.textContent = convLabel + ' CONVERSION';
          convWrap.appendChild(convTypeEl);
          try { gsap.to(convTypeEl, { opacity: 1, y: 0, duration: 0.2, delay: 0.1 }); } catch(e) { convTypeEl.style.opacity='1'; }

          var convHero = document.createElement('div');
          convHero.style.cssText = "font-family:'Teko';font-weight:900;font-size:56px;letter-spacing:3px;line-height:1;background:linear-gradient(180deg,#fff 0%,#00ff44 30%,#fff 50%,#00ff44 70%,#fff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 24px rgba(0,255,68,0.6)) drop-shadow(0 6px 12px rgba(0,0,0,0.9));opacity:0;transform:scale(0.3);";
          convHero.textContent = 'GOOD!';
          convWrap.appendChild(convHero);
          try { gsap.to(convHero, { opacity: 1, scale: 1, duration: 0.25, delay: 0.15, ease: 'back.out(2.5)' }); } catch(e) { convHero.style.opacity='1'; convHero.style.transform='scale(1)'; }

          var convPtsEl = document.createElement('div');
          convPtsEl.style.cssText = "display:flex;align-items:center;gap:4px;opacity:0;transform:translateY(10px) scale(0.8);margin-top:4px;";
          convPtsEl.innerHTML = "<svg viewBox='0 0 44 56' width='14' height='18' fill='#EBB010'><path d='M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z'/></svg>" +
            "<span style=\"font-family:'Teko';font-weight:700;font-size:22px;color:#EBB010;text-shadow:0 0 8px rgba(235,176,16,0.4);letter-spacing:1px;\">+" + convPts + "</span>";
          convWrap.appendChild(convPtsEl);
          try { gsap.to(convPtsEl, { opacity: 1, y: 0, scale: 1, duration: 0.3, delay: 0.4, ease: 'back.out(1.5)' }); } catch(e) { convPtsEl.style.opacity='1'; convPtsEl.style.transform='none'; }

          flashField('rgba(0,255,68,0.3)', 400);
          shakeScreen(3);

          // Confetti — 1 wave of 12
          var convColors = ['#00ff44', '#EBB010', '#FF4511', '#fff'];
          _setTimeout(function() {
            if (!overlay.parentNode) return;
            for (var ci = 0; ci < 12; ci++) {
              var c = document.createElement('div');
              var x = 5 + Math.random() * 90;
              var sz = 3 + Math.random() * 5;
              var dur = 1800 + Math.random() * 1500;
              var drift = (Math.random() - 0.5) * 80;
              var rot = 360 + Math.random() * 1080;
              c.style.cssText = 'position:absolute;top:-10px;left:' + x + '%;width:' + sz + 'px;height:' + sz + 'px;background:' + convColors[ci % convColors.length] + ';border-radius:1px;opacity:0.9;z-index:11;--drift:' + drift + 'px;--rot:' + rot + 'deg;animation:T-td-confetti ' + dur + 'ms ease-in both;';
              overlay.appendChild(c);
              c.addEventListener('animationend', function() { if (c.parentNode) c.remove(); }, { once: true });
            }
          }, 200);

          var resultWrap = convWrap;
        } else {
          totalDur = 2200;
          // NO GOOD
          var convWrap2 = document.createElement('div');
          convWrap2.className = 'T-clash-result';
          convWrap2.style.cssText = 'z-index:10;gap:6px;';
          overlay.appendChild(convWrap2);

          var convTypeEl2 = document.createElement('div');
          convTypeEl2.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:3px;opacity:0;transform:translateY(8px);";
          convTypeEl2.textContent = convLabel + ' CONVERSION';
          convWrap2.appendChild(convTypeEl2);
          try { gsap.to(convTypeEl2, { opacity: 1, y: 0, duration: 0.2, delay: 0.1 }); } catch(e) { convTypeEl2.style.opacity='1'; }

          var convHero2 = document.createElement('div');
          convHero2.style.cssText = "font-family:'Teko';font-weight:900;font-size:56px;color:#ff0040;letter-spacing:3px;line-height:1;text-shadow:0 0 20px rgba(255,0,64,0.4),0 2px 6px rgba(0,0,0,0.8);opacity:0;transform:scale(0.3);";
          convHero2.textContent = 'NO GOOD';
          convWrap2.appendChild(convHero2);
          try { gsap.to(convHero2, { opacity: 1, scale: 1, duration: 0.25, delay: 0.15, ease: 'back.out(2.5)' }); } catch(e) { convHero2.style.opacity='1'; convHero2.style.transform='scale(1)'; }

          flashField('rgba(255,0,64,0.3)', 400);

          var resultWrap = convWrap2;
        }

        _setTimeout(function() {
          var gameCtx = gs.getSummary();
          gameCtx.preSnapPossession = prevPoss;
          var comm = generateCommentary(res, gameCtx, hTeam.name, oTeam.name);
          setNarr(comm.line1, '');
        }, 400);

        drawBug(); drawField();

      } else {
        // ── NON-TD: Normal result display ──
        // Single flex column container — all elements flow vertically, no absolute overlap

        var nonTdWrap = document.createElement('div');
        nonTdWrap.style.cssText = 'position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;max-width:90%;';

        // Hero text
        var heroEl = document.createElement('div');
        heroEl.style.cssText = "font-family:'Teko';font-weight:900;font-size:" + ydsFontSize + ";color:" + resultColor + ";letter-spacing:3px;line-height:1;text-shadow:0 0 20px " + resultColor + "60,0 2px 6px rgba(0,0,0,0.8);opacity:0;transform:scale(0.3);text-align:center;";
        heroEl.textContent = resultText;
        nonTdWrap.appendChild(heroEl);

        // Safety gets chrome red gradient like TD gets chrome green
        if (r.isSafety) {
          heroEl.style.background = 'linear-gradient(180deg,#fff 0%,#ff0040 30%,#fff 50%,#ff0040 70%,#fff 100%)';
          heroEl.style.webkitBackgroundClip = 'text';
          heroEl.style.webkitTextFillColor = 'transparent';
          heroEl.style.backgroundClip = 'text';
          heroEl.style.filter = 'drop-shadow(0 0 16px rgba(255,0,64,0.5))';
        }

        // Context label (below hero)
        var ctxLabel = document.createElement('div');
        ctxLabel.style.cssText = "font-family:'Oswald';font-weight:700;font-size:12px;letter-spacing:3px;text-shadow:0 2px 4px rgba(0,0,0,0.8);opacity:0;transform:translateY(8px);";
        if (r.isSack) {
          // Hero: "SACK" or "SACKED!" — context adds the yardage detail
          ctxLabel.textContent = r.yards !== 0 ? 'LOSS OF ' + Math.abs(r.yards) : '';
          ctxLabel.style.color = resultColor;
        } else if (r.isSafety) {
          ctxLabel.textContent = '+2 POINTS';
          ctxLabel.style.color = '#ff0040';
        } else if (r.isInterception || r.isFumbleLost) {
          // Hero: "INTERCEPTED"/"PICKED OFF!"/"FUMBLE!" — turnover sub below handles the rest
          ctxLabel.textContent = '';
        } else if (r.isIncomplete) {
          // Hero: "INCOMPLETE" — implies no gain, no need to say it
          ctxLabel.textContent = '';
        } else if (r.yards === 0 && !isUserOff) {
          // Hero: "STUFFED!" on defense — no context needed (same word)
          ctxLabel.textContent = '';
        } else if (r.yards === 0) {
          // Hero: "NO GAIN" on offense — add "STUFFED" for flavor
          ctxLabel.textContent = 'STUFFED';
          ctxLabel.style.color = '#FF6B00';
        } else if (r.yards > 0 && gotFirstDown) {
          ctxLabel.textContent = 'FIRST DOWN';
          ctxLabel.style.color = '#EBB010';
        } else {
          // Hero already shows "+X" or "-X" — no context needed
          ctxLabel.textContent = '';
        }
        if (ctxLabel.textContent) nonTdWrap.appendChild(ctxLabel);

        // Gradient divider after hero+context
        var divider = document.createElement('div');
        divider.style.cssText = "width:60px;height:1px;background:linear-gradient(90deg,transparent," + resultColor + "44,transparent);margin:6px 0;transform:scaleX(0);";
        nonTdWrap.appendChild(divider);

        // Turnover sub-label (inside the flow, not absolute)
        if ((r.isInterception || r.isFumbleLost) && !res._isConversion) {
          var turnoverSub = document.createElement('div');
          var isUserTurnover = isUserOff;
          turnoverSub.style.cssText = "font-family:'Teko';font-weight:700;font-size:18px;letter-spacing:3px;text-shadow:0 0 12px " + (isUserTurnover ? 'rgba(255,0,64,0.4)' : 'rgba(0,255,68,0.4)') + ";opacity:0;transform:translateY(6px);margin-top:4px;";
          turnoverSub.style.color = isUserTurnover ? '#ff0040' : '#00ff44';
          turnoverSub.textContent = isUserTurnover ? 'Possession lost.' : 'YOUR BALL!';
          nonTdWrap.appendChild(turnoverSub);
        }

        // Radial glow for big plays (tier >= 2)
        if (tier >= 2 && !r.isIncomplete) {
          var glow = document.createElement('div');
          glow.style.cssText = 'position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:radial-gradient(circle,' + resultColor + '20,transparent 70%);z-index:0;transform:translate(-50%,-50%);pointer-events:none;';
          overlay.appendChild(glow);
          try { gsap.to(glow, { width: 400, height: 400, duration: 0.6, ease: 'power2.out' }); } catch(e) {}
        }

        overlay.appendChild(nonTdWrap);
        var resultWrap = nonTdWrap;

        // GSAP stagger — sequential delays
        try {
          gsap.to(heroEl, { opacity: 1, scale: 1, duration: 0.25, delay: 0, ease: 'back.out(2.5)' });
          var _d2 = 0.15;
          if (ctxLabel.textContent) { gsap.to(ctxLabel, { opacity: 1, y: 0, duration: 0.2, delay: _d2, ease: 'power2.out' }); _d2 += 0.15; }
          gsap.to(divider, { scaleX: 1, duration: 0.3, delay: _d2, ease: 'power2.out' }); _d2 += 0.1;
          if (turnoverSub) { gsap.to(turnoverSub, { opacity: 1, y: 0, duration: 0.25, delay: _d2, ease: 'back.out(1.5)' }); }
        } catch(e) {
          heroEl.style.opacity = '1'; heroEl.style.transform = 'scale(1)';
          if (ctxLabel.textContent) { ctxLabel.style.opacity = '1'; ctxLabel.style.transform = 'none'; }
          divider.style.transform = 'scaleX(1)';
          if (turnoverSub) { turnoverSub.style.opacity = '1'; turnoverSub.style.transform = 'none'; }
        }

        // Turnover vignette (this is a background effect, absolute is fine)
        if ((r.isInterception || r.isFumbleLost) && !res._isConversion) {
          var turnoverColor = isUserTurnover ? '#ff0040' : '#00ff44';
          var vignetteEl = document.createElement('div');
          vignetteEl.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;' +
            'background:radial-gradient(ellipse at center, transparent 40%, ' + turnoverColor + '20 100%);opacity:0;';
          overlay.appendChild(vignetteEl);
          try { gsap.to(vignetteEl, { opacity: 1, duration: 0.3 }); } catch(e) { vignetteEl.style.opacity = '1'; }
        }

        drawBug(); drawField();
      }

      // ── GAME OVER — dramatic freeze for close games ──
      if (gs.gameOver && !res._isConversion) {
        var _margin = Math.abs(gs.ctScore - gs.irScore);
        // Close game (within 7 pts): extend hold for drama
        if (_margin <= 7) totalDur = Math.max(totalDur, 6000);
        var goEl = document.createElement('div');
        goEl.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-15deg);z-index:3;font-family:'Teko';font-weight:700;font-size:64px;color:rgba(255,255,255,0.04);letter-spacing:8px;pointer-events:none;white-space:nowrap;";
        goEl.textContent = 'GAME OVER';
        overlay.appendChild(goEl);
      }

      // First down gold bar slide-in
      if (res.gotFirstDown && !isTD && !r.isInterception && !r.isFumbleLost) {
        var _fdBar = document.createElement('div');
        _fdBar.style.cssText = 'position:absolute;top:48%;left:0;width:100%;height:3px;background:linear-gradient(90deg,#EBB010,#EBB01000);z-index:14;pointer-events:none;transform:translateX(-100%);';
        overlay.appendChild(_fdBar);
        try {
          gsap.to(_fdBar, { x: '0%', duration: 0.4, ease: 'power2.out', delay: 0.05 });
          gsap.to(_fdBar, { opacity: 0, duration: 0.3, delay: 0.8, onComplete: function() { _fdBar.remove(); } });
        } catch(e) { _fdBar.remove(); }
      }

      // First down chain chime — escalates with consecutive first downs in a drive
      if (res.gotFirstDown && !isTD && !r.isInterception && !r.isFumbleLost && isUserOff) {
        var _fdCount = driveFirstDowns || 1;
        try { SND.chime(); } catch(e) {}
        flashField('rgba(0,255,68,0.2)', 300);
        if (navigator.vibrate) try { navigator.vibrate([20, 10, 20]); } catch(e) {}
        // 3rd+ first down: gold flash
        if (_fdCount >= 3) flashField('rgba(235,176,16,0.15)', 400);
        // 5th+ first down: mini confetti burst
        if (_fdCount >= 5) {
          var _fdCols = ['#00ff44', '#EBB010', '#fff'];
          for (var _fi = 0; _fi < 8; _fi++) {
            var _fc = document.createElement('div');
            _fc.style.cssText = 'position:absolute;top:-10px;left:' + (20 + Math.random() * 60) + '%;width:' + (2 + Math.random() * 3) + 'px;height:' + (2 + Math.random() * 3) + 'px;background:' + _fdCols[_fi % 3] + ';border-radius:1px;opacity:0.9;z-index:11;pointer-events:none;';
            overlay.appendChild(_fc);
            try { gsap.to(_fc, { y: 200, rotation: 360 + Math.random() * 720, opacity: 0, duration: 1.5 + Math.random(), ease: 'power1.in', delay: Math.random() * 0.3, onComplete: function() { if (_fc.parentNode) _fc.remove(); } }); } catch(e) { _fc.remove(); }
          }
        }
      }

      // Hot streak tracking
      if (isUserOff && !res._isConversion) {
        if (isGoodForUser) { _hotStreak++; } else if (isBadForUser) { _hotStreak = 0; }
        // "ON FIRE" toast at 5-streak
        if (_hotStreak === 5) {
          var _fireToast = document.createElement('div');
          _fireToast.style.cssText = "position:fixed;top:12%;left:50%;transform:translateX(-50%);z-index:660;font-family:'Teko';font-weight:700;font-size:18px;color:#EBB010;letter-spacing:4px;text-shadow:0 0 16px rgba(235,176,16,0.6);pointer-events:none;opacity:0;";
          _fireToast.textContent = 'ON FIRE';
          el.appendChild(_fireToast);
          try {
            gsap.to(_fireToast, { opacity: 1, y: -5, duration: 0.3, ease: 'back.out(1.5)' });
            gsap.to(_fireToast, { opacity: 0, y: -15, duration: 0.4, delay: 1.5, onComplete: function() { _fireToast.remove(); } });
          } catch(e) { setTimeout(function() { _fireToast.remove(); }, 2000); }
        }
      }

      // ── BEAT 2: CONTEXT (800ms-2s) — first down, down & distance, commentary (non-TD only) ──
      _setTimeout(function() {
        if (isTD) return; // TD has its own commentary flow above
        if (!overlay.parentNode) return; // screen exited

        // New down & distance (skip if first down flash showing or conversion)
        if (!r.isInterception && !r.isFumbleLost && !gotFirstDown && !res._isConversion) {
          var newS = gs.getSummary();
          var dnLabels = ['','1ST','2ND','3RD','4TH'];
          var dnText = (dnLabels[newS.down] || '') + ' & ' + (newS.yardsToEndzone <= 10 ? 'GOAL' : newS.distance);
          var dnPossTeam = newS.possession === 'CT' ? hTeam : oTeam;
          var dnColor = dnPossTeam.accent;
          var dnEl = document.createElement('div');
          dnEl.style.cssText = "font-family:'Oswald';font-weight:700;font-size:10px;color:" + dnColor + ";letter-spacing:2px;margin-top:6px;opacity:0;transform:translateY(6px);";
          dnEl.textContent = dnText;
          resultWrap.appendChild(dnEl);
          try { gsap.to(dnEl, { opacity: 1, y: 0, duration: 0.2, delay: 0.1, ease: 'power2.out' }); } catch(e) { dnEl.style.opacity = '1'; }
        }

        // Commentary
        var commLine1, commLine2;
        if (res._isConversion) {
          commLine1 = r.description;
          commLine2 = '';
        } else {
          var gameCtx = gs.getSummary();
          gameCtx.preSnapPossession = prevPoss;
          var comm = generateCommentary(res, gameCtx, hTeam.name, oTeam.name);
          var ctx = generateContext(gameCtx, hTeam.name, oTeam.name, res);
          commLine1 = comm.line1;
          commLine2 = comm.line2 || ctx || '';
        }
        setNarr(commLine1, commLine2);

        // Commentary text on the result overlay (not just narr)
        if (commLine1 && !res._isConversion) {
          var commEl = document.createElement('div');
          commEl.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:11px;color:rgba(255,255,255,0.6);text-shadow:0 2px 4px rgba(0,0,0,0.8);max-width:260px;text-align:center;margin-top:4px;opacity:0;transform:translateY(6px);";
          commEl.textContent = commLine1;
          resultWrap.appendChild(commEl);
          try { gsap.to(commEl, { opacity: 1, y: 0, duration: 0.25, delay: 0.15, ease: 'power2.out' }); } catch(e) { commEl.style.opacity = '1'; }
        }

        // TORCH points on the result overlay
        if (res._torchEarned && res._torchEarned > 0 && !res._isConversion) {
          var FLAME = 'M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z';
          var tpEl = document.createElement('div');
          tpEl.style.cssText = "display:flex;align-items:center;gap:4px;justify-content:center;margin-top:6px;opacity:0;transform:translateY(10px) scale(0.8);";
          tpEl.innerHTML = "<svg viewBox='0 0 44 56' width='12' height='16' fill='#EBB010'><path d='" + FLAME + "'/></svg><span style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#EBB010;text-shadow:0 0 8px rgba(235,176,16,0.4);letter-spacing:1px;\">+" + res._torchEarned + "</span>";
          resultWrap.appendChild(tpEl);
          try { gsap.to(tpEl, { opacity: 1, y: 0, scale: 1, duration: 0.3, delay: 0.3, ease: 'back.out(1.5)' }); } catch(e) { tpEl.style.opacity = '1'; tpEl.style.transform = 'none'; }
        }

        // TORCH points earned — color-coded breakdown below commentary
        if (res._torchSources && res._torchSources.length > 0) {
          var srcColors = { play: '#F1F5F9', combo: '#FF6B2B', bonus: '#22D3EE' };
          var srcLabels = { play: 'PLAY', combo: 'COMBO', bonus: 'BONUS' };
          var ptDiv = document.createElement('div');
          ptDiv.style.cssText = "display:flex;align-items:center;justify-content:center;gap:6px;margin-top:8px;flex-wrap:wrap;";
          var parts = [];
          res._torchSources.forEach(function(src, si) {
            var col = srcColors[src.key] || '#F1F5F9';
            parts.push("<span style=\"font-family:'Teko';font-weight:700;font-size:15px;color:" + col + ";letter-spacing:1px;text-shadow:0 0 8px " + col + "44;\">+" + src.pts + " " + (srcLabels[src.key] || src.key.toUpperCase()) + "</span>");
          });
          // Join with + separators then show total
          ptDiv.innerHTML = parts.join("<span style=\"color:#555;font-family:'Teko';font-size:13px;\"> + </span>") +
            "<span style=\"font-family:'Teko';font-weight:700;font-size:15px;color:#EBB010;letter-spacing:1px;margin-left:4px;\">= +" + res._torchEarned + " TORCH</span>";
          narr.appendChild(ptDiv);
        } else if (res._torchEarned && res._torchEarned > 0) {
          var ptSimple = document.createElement('div');
          ptSimple.style.cssText = "font-family:'Teko';font-weight:700;font-size:15px;color:#EBB010;letter-spacing:2px;text-shadow:0 0 12px rgba(235,176,16,0.5);margin-top:8px;text-align:center;";
          ptSimple.textContent = '+' + res._torchEarned + ' TORCH';
          narr.appendChild(ptSimple);
        }

        // Play description line (ESPN style)
        if (espnDesc && espnDesc !== '?') {
          var descEl = document.createElement('div');
          descEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:12px;color:#888;letter-spacing:0.5px;margin-top:6px;max-width:320px;text-align:center;line-height:1.3;opacity:0;";
          descEl.textContent = espnDesc;
          resultWrap.appendChild(descEl);
          try { gsap.to(descEl, { opacity: 1, duration: 0.3, delay: 0.2 }); } catch(e) { descEl.style.opacity = '1'; }
        }

        var labelEl = document.createElement('div');
        labelEl.className = 'T-clash-label';
        labelEl.style.cssText = "color:#e8e6ff;opacity:0;transition:opacity 0.3s;margin-top:8px;font-family:'Rajdhani';font-size:15px;font-weight:700;line-height:1.3;text-align:center;max-width:280px;";
        labelEl.textContent = commLine1;
        resultWrap.appendChild(labelEl);
        _setTimeout(function() { labelEl.style.opacity = '1'; }, 100);

        // Matchup reveal — show both featured players
        if (res.featuredOff && res.featuredDef && !res._isConversion) {
          var matchEl = document.createElement('div');
          matchEl.style.cssText = "display:flex;justify-content:center;gap:16px;margin-top:10px;opacity:0;transition:opacity 0.3s;";
          var offColor = isUserOff ? hTeam.accent : oTeam.accent;
          var defColor = isUserOff ? oTeam.accent : hTeam.accent;
          matchEl.innerHTML =
            "<div style='text-align:center;'><div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:" + offColor + ";letter-spacing:1px;\">" + res.featuredOff.pos + "</div><div style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:#fff;\">" + res.featuredOff.name + "</div></div>" +
            "<div style=\"font-family:'Teko';font-size:14px;color:#555;align-self:center;\">vs</div>" +
            "<div style='text-align:center;'><div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:" + defColor + ";letter-spacing:1px;\">" + res.featuredDef.pos + "</div><div style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:#fff;\">" + res.featuredDef.name + "</div></div>";
          resultWrap.appendChild(matchEl);
          _setTimeout(function() { matchEl.style.opacity = '1'; }, 200);
        }

      }, 800);

      // ── BEAT 3: REWARD (2-3.5s) — TORCH points + combos ──
      _setTimeout(function() {
        if (!overlay.parentNode) return; // screen exited
        // Combo flash
        if (res._combos && res._combos.length > 0) {
          var comboEl = document.createElement('div');
          comboEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:20px;color:#EBB010;letter-spacing:2px;text-shadow:0 0 12px rgba(235,176,16,0.5);margin-top:6px;animation:T-clash-yds 0.4s ease-out both;";
          comboEl.textContent = res._combos.join(' + ');
          resultWrap.appendChild(comboEl);
        }

      }, 2000);

      // ── BEAT 4: READY (cleanup + proceed) ──
      _setTimeout(function() {
        // Clean up overlay (may already be removed if screen exited)
        if (overlay.parentNode) {
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity 0.4s';
          _setTimeout(function() { if (overlay.parentNode) overlay.remove(); }, 400);
        }

        // TORCH points — ALL increases go through the sequential flyer animation
        var finalTotal = hAbbr === 'CT' ? gs.getSummary().ctTorchPts : gs.getSummary().irTorchPts;
        var actualGain = finalTotal - _torchFrozenValue;
        if (actualGain > 0 && torchBannerPtsEl) {
          var srcs = [{ key: 'play', pts: actualGain }];
          var isBigPlay = r.isTouchdown || r.isInterception || r.isFumbleLost || r.yards >= 15;
          playPointsSequence({
            counterEl: torchBannerPtsEl,
            containerEl: torchBanner,
            sources: srcs,
            startValue: _torchFrozenValue,
            shake: isBigPlay,
            hideSourceLabel: true,
            onComplete: function() { _torchDisplayFrozen = false; drawTorchBanner(); },
          });
        } else {
          _torchDisplayFrozen = false;
          drawTorchBanner();
        }

        // ── REACTIVE TORCH CARD CHECK ──
        // After seeing result, OFFER reactive cards with player choice (not auto-fire)
        var isHumanOff = prevPoss === hAbbr;

        // Check if any reactive cards can trigger
        var reactiveCard = null;
        var reactiveIdx = -1;
        if (isHumanOff && !res._isConversion) {
          // SURE HANDS: on turnover
          if ((r.isInterception || r.isFumbleLost)) {
            reactiveIdx = torchInventory.findIndex(function(c) { return c.id === 'sure_hands'; });
            if (reactiveIdx >= 0) reactiveCard = { id: 'sure_hands', idx: reactiveIdx, label: 'SURE HANDS', desc: 'Cancel the turnover? Your drive continues.', cost: 'FREE (already purchased)', color: '#EBB010' };
          }
          // CHALLENGE FLAG: on negative yards (sack, loss)
          if (!reactiveCard && r.yards < 0 && !r.isTouchdown) {
            reactiveIdx = torchInventory.findIndex(function(c) { return c.id === 'challenge_flag'; });
            if (reactiveIdx >= 0) reactiveCard = { id: 'challenge_flag', idx: reactiveIdx, label: 'CHALLENGE FLAG', desc: 'Challenge the play? 50% chance of a better outcome.', cost: 'FREE (already purchased)', color: '#C0C0C0' };
          }
        }

        // Show reactive card decision prompt
        if (reactiveCard) {
          var _reactiveOv = document.createElement('div');
          _reactiveOv.style.cssText = 'position:fixed;inset:0;z-index:750;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);';
          var _reactiveCard = document.createElement('div');
          _reactiveCard.style.cssText = "background:#141008;border:2px solid " + reactiveCard.color + ";border-radius:12px;padding:20px;max-width:300px;text-align:center;box-shadow:0 0 30px " + reactiveCard.color + "44;";
          _reactiveCard.innerHTML =
            "<div style=\"font-family:'Teko';font-weight:700;font-size:22px;color:" + reactiveCard.color + ";letter-spacing:3px;\">" + reactiveCard.label + "</div>" +
            "<div style=\"font-family:'Rajdhani';font-size:12px;color:#ccc;margin:8px 0 16px;line-height:1.4;\">" + reactiveCard.desc + "</div>" +
            "<div style='display:flex;gap:10px;justify-content:center;'>" +
              "<button id='reactive-yes' style=\"flex:1;padding:12px;border-radius:6px;border:2px solid " + reactiveCard.color + ";background:" + reactiveCard.color + ";color:#000;font-family:'Teko';font-weight:700;font-size:16px;letter-spacing:2px;cursor:pointer;\">USE IT</button>" +
              "<button id='reactive-no' style=\"flex:1;padding:12px;border-radius:6px;border:1px solid #333;background:transparent;color:#666;font-family:'Teko';font-weight:700;font-size:16px;letter-spacing:2px;cursor:pointer;\">SAVE IT</button>" +
            "</div>";
          _reactiveOv.appendChild(_reactiveCard);
          el.appendChild(_reactiveOv);
          try { SND.cardSnap(); } catch(e) {}

          var _reactiveResolved = false;
          function resolveReactive(useIt) {
            if (_reactiveResolved) return;
            _reactiveResolved = true;
            _reactiveOv.remove();

            if (useIt) {
              // Consume the card from both UI and engine inventories
              torchInventory.splice(reactiveCard.idx, 1);
              if (GS.season) GS.season.torchCards = torchInventory.slice();
              var _engineIdx = gs.humanTorchCards.indexOf(reactiveCard.id);
              if (_engineIdx >= 0) gs.humanTorchCards.splice(_engineIdx, 1);

              if (reactiveCard.id === 'sure_hands') {
                // Cancel the turnover
                r.isInterception = false; r.isFumble = false; r.isFumbleLost = false;
                r.yards = Math.max(0, r.yards);
                r.description = 'SURE HANDS! Turnover cancelled — drive continues!';
                if (gs.possession !== prevPoss) {
                  gs.flipPossession(res._preSnap ? res._preSnap.ballPosition : gs.ballPosition);
                }
                res.gameEvent = null;
                setNarr('SURE HANDS!', 'Turnover cancelled — your drive continues.');
              } else if (reactiveCard.id === 'challenge_flag') {
                // 50% reroll
                if (Math.random() < 0.5) {
                  r.yards = Math.max(0, Math.abs(r.yards));
                  r.isSack = false;
                  r.description = 'CHALLENGE FLAG! Play overturned — gain of ' + r.yards + '!';
                  setNarr('CHALLENGE FLAG!', 'Overturned! Gain of ' + r.yards + ' yards.');
                } else {
                  r.description = 'CHALLENGE FLAG! Review stands. Original call confirmed.';
                  setNarr('CHALLENGE FLAG!', 'Review stands. Original call confirmed.');
                }
              }
            }
            // Continue to shop/next play flow
            continueAfterReactive();
          }

          _reactiveOv.querySelector('#reactive-yes').onclick = function() { resolveReactive(true); };
          _reactiveOv.querySelector('#reactive-no').onclick = function() { resolveReactive(false); };
          // Safety timeout (8s)
          _setTimeout(function() { if (!_reactiveResolved) resolveReactive(false); }, 8000);

          // Wrap the rest of the post-play flow in a continuation
          function continueAfterReactive() {
            var shopTrigger = null;
            if (!gs.gameOver && !res._isConversion) {
              var isHumanPoss = prevPoss === hAbbr;
              if (res.gameEvent === 'touchdown' && isHumanPoss) shopTrigger = 'touchdown';
              else if ((r.isInterception || r.isFumbleLost) && !isHumanPoss) shopTrigger = 'turnover';
              else if (res.gameEvent === 'turnover_on_downs' && !isHumanPoss) shopTrigger = 'fourthDownStop';
              else if ((!wasOffHot && offStarHot) || (!wasDefHot && defStarHot)) shopTrigger = 'starActivation';
            }
            if (shopTrigger) { triggerShop(shopTrigger, afterShop); }
            else { afterShop(); }
          }
          return; // Exit — continuation handles the rest
        }

        var shopTrigger = null;
        if (!gs.gameOver && !res._isConversion) {
          var isHumanPoss = prevPoss === hAbbr;
          if (res.gameEvent === 'touchdown' && isHumanPoss) shopTrigger = 'touchdown';
          else if ((r.isInterception || r.isFumbleLost) && !isHumanPoss) shopTrigger = 'turnover';
          else if (res.gameEvent === 'turnover_on_downs' && !isHumanPoss) shopTrigger = 'fourthDownStop';
          else if ((!wasOffHot && offStarHot) || (!wasDefHot && defStarHot)) shopTrigger = 'starActivation';
        }
        function afterShop() {
          if (res.gameEvent === 'touchdown' && !res._isConversion) { showConv(res.scoringTeam); return; }
          if (res._isConversion) {
            // After conversion, go straight to possession change
            showPossCut('score', function() { showDrive(driveSnaps, prevPoss, function() { driveSnaps=[]; drivePlayHistory=[]; resetDriveSummary(); if(!checkEnd()) nextSnap(); }); });
            return;
          }
          if (posChanged(res.gameEvent, prevPoss)) {
            showPossCut(res.gameEvent, function() { showDrive(driveSnaps, prevPoss, function() { driveSnaps=[]; drivePlayHistory=[]; resetDriveSummary(); if(!checkEnd()) nextSnap(); }); });
          } else {
            if (!checkEnd()) {
              // Post-play view: cards stay placed on field, add NEXT PLAY button
              driveSummaryEl.style.display = ''; // Always show PBP during post-play
              drawBug(); drawDriveSummary();
              panel.style.display = 'none';

              // Hide the torch drop zone on the field (not relevant post-play)
              var _torchDrop = strip.querySelector('.T-drop-torch');
              if (_torchDrop) _torchDrop.style.display = 'none';

              // NEXT PLAY button below everything (remove any existing one first)
              var _existingNext = el.querySelector('#T-next-play-wrap');
              if (_existingNext) _existingNext.remove();
              var tapNextWrap = document.createElement('div');
              tapNextWrap.id = 'T-next-play-wrap';
              tapNextWrap.style.cssText = 'padding:12px 16px;flex-shrink:0;';
              var tapNextBtn = document.createElement('button');
              tapNextBtn.className = 'btn-blitz';
              tapNextBtn.style.cssText = "width:100%;font-size:16px;padding:14px;background:#141008;color:#EBB010;border-color:#EBB010;letter-spacing:3px;animation:T-snap-pulse 1.2s ease-in-out infinite;";
              tapNextBtn.textContent = 'NEXT PLAY';
              var tapDismissed = false;
              tapNextBtn.onclick = function() {
                if (tapDismissed) return;
                tapDismissed = true;
                // Animate placed cards off the field
                var placedCards = strip.querySelectorAll('.T-placed');
                try {
                  gsap.to(placedCards, { y: -40, opacity: 0, scale: 0.8, duration: 0.25, stagger: 0.05, ease: 'power2.in', onComplete: function() {
                    selP = null; selPl = null;
                    tapNextWrap.remove();
                    nextSnap();
                  }});
                } catch(e) {
                  selP = null; selPl = null;
                  tapNextWrap.remove();
                  nextSnap();
                }
              };
              tapNextWrap.appendChild(tapNextBtn);
              el.appendChild(tapNextWrap);
            }
          }
        }
        if (shopTrigger) {
          triggerShop(shopTrigger, afterShop);
        } else { afterShop(); }
      }, totalDur);
    }
  }

  /** Cycle a played card — return it to deck, draw a replacement */
  function cycleCard(playedCard, hand, fullPool, teamId) {
    if (!playedCard || !hand || !fullPool) return;
    var idx = hand.indexOf(playedCard);
    if (idx === -1) return;
    // Cards NOT in hand — weighted by team scheme identity
    var available = fullPool.filter(function(c) { return hand.indexOf(c) === -1; });
    if (available.length > 0) {
      var weights = available.map(function(c) { return getDrawWeight(teamId, c.playType); });
      var total = weights.reduce(function(a, b) { return a + b; }, 0);
      var r = Math.random() * total;
      var replacement = available[available.length - 1];
      for (var i = 0; i < available.length; i++) {
        r -= weights[i];
        if (r <= 0) { replacement = available[i]; break; }
      }
      hand[idx] = replacement;
    }
  }

  var _lastPossession = gs.possession;
  function nextSnap() {
    // Card replacement already happened in doSnap post-processing
    // On possession change, redeal the hand for the new drive
    if (gs.possession !== _lastPossession) {
      _lastPossession = gs.possession;
      _isNewDrive = true;
      _hotStreak = 0; // Reset hot streak on possession change
      var newHs = getHandState();
      handRedeal(newHs);
      resetDriveDiscards(newHs);
      _driveHeat = 0; drawDriveHeat();
      _driveCardsUsed = [];
    }
    phase = 'play';
    selP = null; selPl = null; selTorch = null; selectedPreSnap = null;
    _fourthDownDecided = false;
    panel.style.display = '';
    // Hide PBP unless user toggled it on
    if (!_pbpVisible) driveSummaryEl.style.display = 'none';
    // Don't force-reset crowd here — holdThenSettle handles it after big plays.
    // Only set state if we're not in an elevated hold (the hold timer will settle naturally).
    // For 2-min drill, always ensure it's set since it's a persistent state.
    if (gs.twoMinActive) AudioStateManager.setState('two_min_drill');

    // AI 4th down decision — resolve BEFORE showing cards to the player
    var isUserDef = gs.possession !== hAbbr;
    if (isUserDef && gs.down === 4) {
      var aiDec = gs.ai4thDownDecision();
      if (aiDec === 'punt') {
        phase = 'busy';
        // Three-and-out celebration (3 or fewer opponent plays → punt)
        if (driveSnaps.length <= 3) {
          var _3aoEl = document.createElement('div');
          _3aoEl.style.cssText = "position:fixed;top:30%;left:50%;transform:translateX(-50%);z-index:660;font-family:'Teko';font-weight:700;font-size:24px;color:#4DA6FF;letter-spacing:4px;text-shadow:0 0 20px rgba(77,166,255,0.5);pointer-events:none;opacity:0;white-space:nowrap;";
          _3aoEl.textContent = 'THREE AND OUT';
          el.appendChild(_3aoEl);
          try {
            gsap.to(_3aoEl, { opacity: 1, y: -5, duration: 0.3, ease: 'back.out(1.5)' });
            gsap.to(_3aoEl, { opacity: 0, y: -20, duration: 0.4, delay: 1.5, onComplete: function() { _3aoEl.remove(); } });
            SND.bigPlay();
          } catch(e) { setTimeout(function() { _3aoEl.remove(); }, 2000); }
          if (navigator.vibrate) try { navigator.vibrate([20, 10, 30]); } catch(e) {}
        }
        // BLOCKED KICK: auto-consume from inventory if available
        var _bkPuntIdx = torchInventory.findIndex(function(c) { return c.id === 'blocked_kick'; });
        var _bkPuntOpts = {};
        if (_bkPuntIdx >= 0) { _bkPuntOpts.blockedKick = true; consumeTorchCard('blocked_kick'); torchCardToast('BLOCKED KICK', 'Chance to block the punt'); }
        // AI punt announcement overlay
        var puntOv = document.createElement('div');
        puntOv.style.cssText = 'position:fixed;inset:0;z-index:650;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(10,8,4,0.92);opacity:0;transition:opacity 0.3s;pointer-events:auto;';
        var _pBarT = document.createElement('div');
        _pBarT.style.cssText = 'position:absolute;top:0;left:0;right:0;height:3px;background:' + (oTeam.accent || '#4DA6FF') + ';';
        var _pBarB = document.createElement('div');
        _pBarB.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:3px;background:' + (oTeam.accent || '#4DA6FF') + ';';
        puntOv.appendChild(_pBarT); puntOv.appendChild(_pBarB);
        puntOv.innerHTML += '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 35%,' + (oTeam.colors ? oTeam.colors.primary : oTeam.accent) + '15,transparent 60%);pointer-events:none;"></div>';
        var _pLabel = document.createElement('div');
        _pLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:3px;z-index:1;";
        _pLabel.textContent = '4TH DOWN';
        puntOv.appendChild(_pLabel);
        var _pTitle = document.createElement('div');
        _pTitle.style.cssText = "font-family:'Oswald';font-weight:700;font-size:22px;color:" + (oTeam.accent || '#4DA6FF') + ";letter-spacing:4px;text-shadow:0 0 16px " + (oTeam.accent || '#4DA6FF') + "40;z-index:1;";
        _pTitle.textContent = oTeam.name.toUpperCase() + ' PUNT';
        puntOv.appendChild(_pTitle);
        var _pBtn = _flameBadgeContinue('CONTINUE', function() {
          puntOv.style.opacity = '0';
          _setTimeout(function() {
            if (puntOv.parentNode) puntOv.remove();
            var aiPunter = aiPickST(_cpuSTDeck, 'kickPower', gs.difficulty);
            if (aiPunter) burnPlayer(_cpuSTDeck, aiPunter, 'punter', 'AI punt');
            var puntResult = gs.punt(aiPunter, _bkPuntOpts);
            var puntColor = puntResult.blocked ? '#00ff44' : '#4DA6FF';
            showSpecialTeamsResult(puntResult.label, puntColor, function() {
              driveSnaps = []; drivePlayHistory = []; resetDriveSummary();
              showPossCut('punt', function() { if (!checkEnd()) nextSnap(); });
            });
          }, 250);
        });
        puntOv.appendChild(_pBtn);
        el.appendChild(puntOv);
        requestAnimationFrame(function() { puntOv.style.opacity = '1'; });
        return;
      }
      if (aiDec === 'field_goal') {
        phase = 'busy';
        var fgDist3 = gs.yardsToEndzone() + 17;
        // ICE THE KICKER + BLOCKED KICK: auto-consume from inventory
        var _aiFgOpts = {};
        var _iceIdx = torchInventory.findIndex(function(c) { return c.id === 'ice_the_kicker'; });
        if (_iceIdx >= 0) { _aiFgOpts.iceTheKicker = true; consumeTorchCard('ice_the_kicker'); torchCardToast('ICE THE KICKER', 'Kicker accuracy reduced'); }
        var _bkFgIdx = torchInventory.findIndex(function(c) { return c.id === 'blocked_kick'; });
        if (_bkFgIdx >= 0) { _aiFgOpts.blockedKick = true; consumeTorchCard('blocked_kick'); torchCardToast('BLOCKED KICK', 'Chance to block the kick'); }
        var _iceLabel = _aiFgOpts.iceTheKicker ? 'ICE THE KICKER! ' : '';
        // AI FG announcement overlay
        var fgOv = document.createElement('div');
        fgOv.style.cssText = 'position:fixed;inset:0;z-index:650;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(10,8,4,0.92);opacity:0;transition:opacity 0.3s;pointer-events:auto;';
        var _fBarT = document.createElement('div');
        _fBarT.style.cssText = 'position:absolute;top:0;left:0;right:0;height:3px;background:#EBB010;';
        var _fBarB = document.createElement('div');
        _fBarB.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:3px;background:#EBB010;';
        fgOv.appendChild(_fBarT); fgOv.appendChild(_fBarB);
        fgOv.innerHTML += '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 35%,' + (oTeam.colors ? oTeam.colors.primary : oTeam.accent) + '15,transparent 60%);pointer-events:none;"></div>';
        var _fLabel = document.createElement('div');
        _fLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:3px;z-index:1;";
        _fLabel.textContent = '4TH DOWN';
        fgOv.appendChild(_fLabel);
        var _fTitle = document.createElement('div');
        _fTitle.style.cssText = "font-family:'Oswald';font-weight:700;font-size:22px;color:#EBB010;letter-spacing:4px;text-shadow:0 0 16px #EBB01040;z-index:1;";
        _fTitle.textContent = _iceLabel + fgDist3 + '-YARD FIELD GOAL';
        fgOv.appendChild(_fTitle);
        var _fBtn = _flameBadgeContinue('CONTINUE', function() {
          fgOv.style.opacity = '0';
          _setTimeout(function() {
            if (fgOv.parentNode) fgOv.remove();
            var aiKicker = aiPickST(_cpuSTDeck, 'kickAccuracy', gs.difficulty);
            if (aiKicker) burnPlayer(_cpuSTDeck, aiKicker, 'kicker', 'AI FG');
            SND.kickThud();
            var fgResult = gs.attemptFieldGoal(aiKicker, _aiFgOpts);
            var fgColor = fgResult.made ? '#ff0040' : '#00ff44';
            var fgLabel = fgResult.blocked ? 'BLOCKED!' : (fgResult.made ? 'IT\'S GOOD! +3' : 'NO GOOD!');
            showSpecialTeamsResult(fgLabel, fgColor, function() {
              driveSnaps = []; drivePlayHistory = []; resetDriveSummary();
              showPossCut(fgResult.made ? 'score' : 'missed_fg', function() { if (!checkEnd()) nextSnap(); });
            });
          }, 250);
        });
        fgOv.appendChild(_fBtn);
        el.appendChild(fgOv);
        requestAnimationFrame(function() { fgOv.style.opacity = '1'; });
        return;
      }
      if (aiDec === 'go_for_it') {
        // Brief flash then proceed to normal card selection
        var goFlash = document.createElement('div');
        goFlash.style.cssText = "position:fixed;top:30%;left:0;right:0;z-index:650;font-family:'Teko';font-weight:700;font-size:24px;color:#e03050;letter-spacing:3px;text-shadow:0 0 16px rgba(224,48,80,0.4);pointer-events:none;opacity:0;transition:opacity 0.3s;text-align:center;white-space:nowrap;";
        goFlash.textContent = oTeam.name + ' GO FOR IT!';
        el.appendChild(goFlash);
        requestAnimationFrame(function() { goFlash.style.opacity = '1'; });
        _setTimeout(function() { goFlash.style.opacity = '0'; setTimeout(function() { goFlash.remove(); }, 200); }, 1200);
      }
    }

    drawBug(); drawField(); drawPanel(); drawDriveSummary();
    // Human always picks cards — on offense they pick offPlay+player,
    // on defense they pick defPlay+player. doSnap() passes them in the right slots.
    // No auto-CPU here — the human taps SNAP every time.
  }

  // ── POSSESSION CUT ──
  function posChanged(ev, prev) {
    if (ev && ['interception','fumble_lost','turnover_on_downs','safety','turnover_td','punt','missed_fg'].includes(ev)) return true;
    return gs.possession !== prev;
  }

  function showPossCut(ev, done) {
    driveCommLine1 = ''; driveCommLine2 = '';
    drawDriveSummary();
    narr.innerHTML = '<div class="T-pbp-idle">Awaiting snap<span class="T-pbp-cursor"></span></div>';
    var s = gs.getSummary();
    var newPossTeam = s.possession === 'CT' ? hTeam : oTeam;
    var newPossId = s.possession === 'CT' ? GS.team : GS.opponent;
    var otherTeam = s.possession === 'CT' ? oTeam : hTeam;
    var otherId = s.possession === 'CT' ? GS.opponent : GS.team;
    var isYourBall = s.possession === hAbbr;

    // Determine if this is good or bad for the user
    var isGoodForUser = false;
    if (ev === 'interception' || ev === 'fumble_lost' || ev === 'turnover_on_downs' || ev === 'safety') {
      isGoodForUser = isYourBall; // user forced the turnover and now has the ball
    } else if (ev === 'touchdown' || ev === 'turnover_td' || ev === 'score') {
      isGoodForUser = !isYourBall; // user just scored, now opponent gets ball (user had a good drive)
    }

    // Title and subtitle based on user perspective
    var title, subtitle;
    if (isGoodForUser) {
      if (ev === 'interception') { title = 'PICKED OFF!'; subtitle = newPossTeam.name + ' ball!'; }
      else if (ev === 'fumble_lost') { title = 'FUMBLE RECOVERY!'; subtitle = newPossTeam.name + ' ball!'; }
      else if (ev === 'turnover_on_downs') { title = 'DEFENSE HOLDS!'; subtitle = 'Stopped on 4th down.'; }
      else if (ev === 'punt') { title = newPossTeam.name.toUpperCase() + ' BALL!'; subtitle = 'After the punt.'; }
      else if (ev === 'missed_fg') { title = 'NO GOOD!'; subtitle = 'Missed field goal. ' + newPossTeam.name + ' ball!'; }
      else if (ev === 'safety') { title = 'SAFETY!'; subtitle = newPossTeam.name + ' gets the ball back!'; }
      else { title = newPossTeam.name.toUpperCase() + ' BALL!'; subtitle = 'New drive.'; }
    } else {
      if (ev === 'interception') { title = 'TURNOVER'; subtitle = otherTeam.name + ' intercepts.'; }
      else if (ev === 'fumble_lost') { title = 'TURNOVER'; subtitle = 'Fumble. ' + otherTeam.name + ' recovers.'; }
      else if (ev === 'turnover_on_downs') { title = 'TURNOVER ON DOWNS'; subtitle = 'Failed to convert.'; }
      else if (ev === 'punt') { title = 'PUNT'; subtitle = newPossTeam.name + ' ball.'; }
      else if (ev === 'missed_fg') { title = 'MISSED FIELD GOAL'; subtitle = newPossTeam.name + ' ball.'; }
      else if (ev === 'touchdown' || ev === 'turnover_td' || ev === 'score') { title = 'NEW DRIVE'; subtitle = newPossTeam.name + ' ball.'; }
      else { title = 'CHANGE OF POSSESSION'; subtitle = newPossTeam.name + ' ball.'; }
    }

    // Next situation context
    var nextCtx = '1st & 10';
    if (s.down && s.distance) nextCtx = fmtDownDist(s.down, s.distance, s.yardsToEndzone);
    var fieldPos = s.yardsToEndzone ? (s.yardsToEndzone <= 50 ? 'OPP ' + s.yardsToEndzone : 'OWN ' + (100 - s.yardsToEndzone)) : '';

    // Build overlay
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:900;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;opacity:0;transition:opacity .3s;pointer-events:auto;background:rgba(10,8,4,0.9);';

    // Team color accent bars top and bottom
    var barTop = document.createElement('div');
    barTop.style.cssText = 'position:absolute;top:0;left:0;right:0;height:3px;background:' + newPossTeam.accent + ';z-index:2;';
    var barBot = document.createElement('div');
    barBot.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:3px;background:' + newPossTeam.accent + ';z-index:2;';
    ov.appendChild(barTop); ov.appendChild(barBot);

    // Background radial glow
    var bgGlow = document.createElement('div');
    bgGlow.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 35%,' + (newPossTeam.colors ? newPossTeam.colors.primary : newPossTeam.accent) + '18 0%,transparent 60%);pointer-events:none;';
    ov.appendChild(bgGlow);

    // Event label (small)
    var evLabel = document.createElement('div');
    evLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:3px;z-index:1;opacity:0;transform:translateY(8px);";
    var evText = 'CHANGE OF POSSESSION';
    if (ev === 'interception' || ev === 'fumble_lost') evText = 'TURNOVER';
    else if (ev === 'turnover_on_downs') evText = 'TURNOVER ON DOWNS';
    else if (ev === 'punt') evText = 'PUNT';
    else if (ev === 'score' || ev === 'touchdown') evText = 'NEW DRIVE';
    else if (ev === 'missed_fg') evText = 'MISSED FIELD GOAL';
    evLabel.textContent = evText;
    ov.appendChild(evLabel);

    // Score display
    var hS = hAbbr === 'CT' ? s.ctScore : s.irScore;
    var oS = hAbbr === 'CT' ? s.irScore : s.ctScore;
    var scoreEl = document.createElement('div');
    scoreEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:22px;color:#666;letter-spacing:2px;z-index:1;opacity:0;";
    scoreEl.textContent = hS + ' \u2014 ' + oS;
    ov.appendChild(scoreEl);

    // Team name — big hero
    var teamNameEl = document.createElement('div');
    teamNameEl.style.cssText = "font-family:'Oswald';font-weight:700;font-size:26px;color:" + newPossTeam.accent + ";letter-spacing:5px;text-shadow:0 0 20px " + newPossTeam.accent + "50;z-index:1;opacity:0;transform:scale(0.3);";
    teamNameEl.textContent = newPossTeam.name.toUpperCase() + ' BALL';
    ov.appendChild(teamNameEl);

    // Field position
    if (fieldPos) {
      var posEl = document.createElement('div');
      posEl.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:13px;color:rgba(255,255,255,0.5);z-index:1;opacity:0;transform:translateY(6px);";
      posEl.textContent = 'Ball at the ' + fieldPos.replace('OWN ', '').replace('OPP ', '');
      ov.appendChild(posEl);
    }

    // Continue button
    var contBtn = document.createElement('button');
    contBtn.className = 'btn-blitz';
    contBtn.style.cssText = "font-size:16px;padding:14px 40px;background:#141008;color:#EBB010;border-color:#EBB010;letter-spacing:3px;margin-top:16px;z-index:1;opacity:0;transform:translateY(10px);";
    contBtn.textContent = 'CONTINUE';
    ov.appendChild(contBtn);

    // Sound
    if (isGoodForUser) { try { SND.chime(); } catch(e) {} }
    else { try { SND.snap(); } catch(e) {} }

    // Animate in
    var dismissed = false;
    function dismiss() { if (dismissed) return; dismissed = true; ov.style.opacity = '0'; setTimeout(function() { if (ov.parentNode) ov.remove(); done(); }, 300); }
    contBtn.onclick = function(e) { e.stopPropagation(); dismiss(); };
    ov.onclick = dismiss;
    el.appendChild(ov);
    requestAnimationFrame(function() {
      ov.style.opacity = '1';
      try {
        gsap.to(evLabel, { opacity: 1, y: 0, duration: 0.2, delay: 0.1 });
        gsap.to(scoreEl, { opacity: 1, duration: 0.2, delay: 0.2 });
        gsap.to(teamNameEl, { opacity: 1, scale: 1, duration: 0.25, delay: 0.25, ease: 'back.out(2.5)' });
        if (fieldPos) gsap.to(posEl, { opacity: 1, y: 0, duration: 0.2, delay: 0.4 });
        gsap.to(contBtn, { opacity: 1, y: 0, duration: 0.2, delay: 0.5 });
      } catch(e) { evLabel.style.opacity='1';scoreEl.style.opacity='1';teamNameEl.style.opacity='1';teamNameEl.style.transform='scale(1)';contBtn.style.opacity='1'; }
    });

    // Push ticker
    pushTicker(newPossTeam.name.toUpperCase() + ' BALL \u2014 ' + nextCtx + (fieldPos ? ' at ' + fieldPos : ''), newPossTeam.accent);
  }

  // ── DRIVE SUMMARY ──
  function showDrive(log, poss, done) {
    if (log.length < 2) { done(); return; }
    var yds = log.reduce(function(s,r) { return s + (r.result ? r.result.yards || 0 : r.yards || 0); }, 0);
    var td = log.some(function(r) { return r.result ? r.result.isTouchdown : r.isTD; });
    var to = log.some(function(r) { return r.result ? (r.result.isInterception || r.result.isFumbleLost) : (r.isInt || r.isFumble); });
    var dt = poss === 'CT' ? hTeam : oTeam;

    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:650;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(10,8,4,0.9);opacity:0;transition:opacity 0.3s;pointer-events:auto;cursor:pointer;';

    var label = document.createElement('div');
    label.style.cssText = "font-family:'Oswald';font-weight:700;font-size:12px;color:#FF6B00;letter-spacing:3px;";
    label.textContent = 'DRIVE SUMMARY';
    ov.appendChild(label);

    var statsEl = document.createElement('div');
    statsEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:14px;color:#ccc;letter-spacing:1px;";
    statsEl.textContent = log.length + ' PLAYS \u00b7 ' + Math.abs(yds) + ' YARDS';
    ov.appendChild(statsEl);

    var resultLabel = document.createElement('div');
    var resColor = td ? '#00ff44' : to ? '#ff0040' : '#888';
    var resText = td ? 'TOUCHDOWN' : to ? 'TURNOVER' : 'DRIVE OVER';
    resultLabel.style.cssText = "font-family:'Teko';font-weight:700;font-size:20px;color:" + resColor + ";letter-spacing:2px;";
    resultLabel.textContent = resText;
    ov.appendChild(resultLabel);

    ov.onclick = function() { ov.style.opacity = '0'; setTimeout(function() { if (ov.parentNode) ov.remove(); done(); }, 300); };
    el.appendChild(ov);
    requestAnimationFrame(function() { ov.style.opacity = '1'; });
    _setTimeout(function() { if (ov.parentNode) { ov.style.opacity = '0'; setTimeout(function() { if (ov.parentNode) ov.remove(); done(); }, 300); } }, 2000);
  }

  // ── CONVERSION ──
  var conversionMode = null; // null or {choice:'2pt'|'3pt', team:'CT'|'IR'}

  function showConv(team) {
    panel.style.display = ''; // Restore panel for conversion UI
    const isH = team === hAbbr;
    if (!isH) {
      gs.handleConversion('xp'); drawBug();
      setNarr('Extra point is good.', '+1 point');
      showPossCut('score', () => { showDrive(driveSnaps, team, () => { driveSnaps=[]; drivePlayHistory=[]; resetDriveSummary(); if(!checkEnd()) nextSnap(); }); });
      return;
    }
    // Show conversion choice in the panel
    panel.className = 'T-panel T-panel-off';
    panel.innerHTML = '';
    var scoringTeamObj = team === hAbbr ? hTeam : oTeam;
    var scAccent = scoringTeamObj.accent || '#EBB010';

    // TD header
    var inst = document.createElement('div');
    inst.style.cssText = "text-align:center;padding:12px 0 8px;background:radial-gradient(ellipse at 50% 100%," + scAccent + "08,transparent 70%);";
    inst.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:900;font-size:24px;color:" + scAccent + ";letter-spacing:4px;text-shadow:0 0 16px " + scAccent + "40;\">TOUCHDOWN!</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:11px;color:#888;letter-spacing:3px;margin-top:2px;\">CHOOSE CONVERSION</div>";
    panel.appendChild(inst);

    // Three conversion cards
    var w = document.createElement('div');
    w.style.cssText = 'display:flex;gap:6px;padding:8px 10px 14px;';

    var convOptions = [
      { id: 'xp', pts: '+1', label: 'EXTRA POINT', desc: 'Automatic', risk: 'SAFE', color: '#00ff44' },
      { id: '2pt', pts: '+2', label: '2-POINT', desc: 'From the 5 yd line', risk: 'BALANCED', color: '#EBB010' },
      { id: '3pt', pts: '+3', label: '3-POINT', desc: 'From the 10 yd line', risk: 'RISKY', color: '#e03050' },
    ];

    convOptions.forEach(function(c) {
      var card = document.createElement('div');
      card.style.cssText = "flex:1;border-radius:6px;padding:12px 6px;text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;border:1.5px solid " + c.color + "44;background:linear-gradient(170deg," + c.color + "10,#0a0804 60%);";
      card.innerHTML =
        "<div style=\"font-family:'Teko';font-weight:700;font-size:28px;color:" + c.color + ";line-height:0.85;\">" + c.pts + "</div>" +
        "<div style=\"font-family:'Oswald';font-weight:700;font-size:9px;color:" + c.color + ";letter-spacing:1px;\">" + c.label + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-size:9px;color:#555;margin-top:2px;\">" + c.desc + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:8px;color:" + c.color + ";letter-spacing:1px;padding:2px 6px;border:1px solid " + c.color + "33;border-radius:3px;margin-top:4px;\">" + c.risk + "</div>";

      card.onclick = function() {
        SND.snap();
        if (c.id === 'xp') {
          gs.handleConversion('xp'); drawBug();
          setNarr('Extra point is GOOD!', '+1 point');
          showPossCut('score', function() { showDrive(driveSnaps, team, function() { driveSnaps=[]; drivePlayHistory=[]; resetDriveSummary(); if(!checkEnd()) nextSnap(); }); });
        } else {
          conversionMode = { choice: c.id, team: team };
          var convYards = c.id === '2pt' ? 5 : 10;
          gs.ballPosition = gs.possession === 'CT' ? (100 - convYards) : convYards;
          gs.down = 1;
          gs.distance = convYards;
          setNarr(c.label + ' attempt', 'Select your play, player, and snap');
          phase = 'play';
          drawBug(); drawField(); drawPanel();
        }
      };
      w.appendChild(card);
    });
    panel.appendChild(w);
  }

  function doConversionSnap() {
    phase = 'busy';
    var cm = conversionMode;
    var offPlay = selPl;
    var featuredOff = selP;
    var scoringTeam = gs.possession; // capture before handleConversion flips it
    var convResult = gs.handleConversion(cm.choice, offPlay, featuredOff);
    // Dev: force conversion outcome
    var _devConv = getForceConversion();
    if (_devConv) {
      var pts = cm.choice === '2pt' ? 2 : 3;
      if (_devConv === 'good' && !convResult.success) {
        convResult.success = true; convResult.points = pts;
        if (scoringTeam === 'CT') gs.ctScore += pts; else gs.irScore += pts;
      } else if (_devConv === 'fail' && convResult.success) {
        convResult.success = false; convResult.points = 0;
        if (scoringTeam === 'CT') gs.ctScore -= pts; else gs.irScore -= pts;
      }
    }
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
        isTouchdown: false,
        isComplete: convResult.success,
        isIncomplete: !convResult.success,
        isSack: false, isInterception: false, isFumbleLost: false, isSafety: false,
        offComboPts: 0, defComboPts: 0, historyBonus: 0,
        description: convResult.success ? cm.choice.toUpperCase() + ' conversion is GOOD!' : cm.choice.toUpperCase() + ' conversion FAILED'
      },
      gotFirstDown: false,
      playType: 'pass',
      _torchEarned: 0,
      _torchSources: [],
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

    // Conversion-specific commentary — route through engine for variety
    var convLabel = cm.choice === '2pt' ? '2-point' : '3-point';
    var offName = fakeRes.featuredOff.name || 'QB';
    var defName = fakeRes.featuredDef.name || 'Defense';
    var isRun = offPlay && (offPlay.isRun || offPlay.type === 'run');
    var convGameState = { down: 1, distance: cm.choice === '2pt' ? 5 : 10, yardsToEndzone: cm.choice === '2pt' ? 5 : 10, half: gs.half, ctScore: gs.ctScore, irScore: gs.irScore, possession: cm.team, playsUsed: gs.playsUsed, twoMinActive: gs.twoMinActive };
    var convComm = generateCommentary(fakeRes, convGameState, hTeam.name, oTeam.name);
    if (convResult.success) {
      fakeRes.result.description = (convComm && convComm.line1) ? convComm.line1 + ' ' + convLabel + ' GOOD!'
        : isRun ? offName + ' punches it in! ' + convLabel + ' conversion is GOOD!'
        : offName + ' fires to the end zone — CAUGHT! ' + convLabel + ' conversion GOOD!';
    } else {
      fakeRes.result.description = (convComm && convComm.line1) ? convComm.line1 + ' ' + convLabel + ' no good.'
        : isRun ? offName + ' is stopped at the line. ' + convLabel + ' conversion fails.'
        : defName + ' breaks it up! ' + convLabel + ' conversion NO GOOD.';
    }
    // Mark as conversion so Beat 4 skips the TD celebration + conversion loop
    fakeRes._isConversion = true;
    fakeRes.gameEvent = 'conversion';

    drawField(); drawPanel();

    // Run through the full 3-beat snap display (clash, result, commentary)
    var prevPossConv = cm.team;
    run3BeatSnap(fakeRes, prevPossConv, false, false);
    // Safety: reset phase if still busy after max animation time
    _setTimeout(function() { if (phase === 'busy') { phase = 'play'; drawBug(); drawField(); drawPanel(); } }, 8000);
  }

  // ── 2-MIN WARNING (dramatic overlay) ──
  function show2MinWarn() {
    SND.whistle();
    shakeScreen(4);
    flashField('rgba(224,48,80,.3)');

    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:600;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:rgba(10,8,4,0.92);opacity:0;transition:opacity .25s;pointer-events:auto;cursor:pointer;';

    // Red accent bars
    var barT = document.createElement('div');
    barT.style.cssText = 'position:absolute;top:0;left:0;right:0;height:3px;background:#e03050;';
    var barB = document.createElement('div');
    barB.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:3px;background:#e03050;';
    ov.appendChild(barT); ov.appendChild(barB);

    // "2-MINUTE"
    var hero = document.createElement('div');
    hero.style.cssText = "font-family:'Teko';font-weight:900;font-size:52px;color:#e03050;letter-spacing:4px;text-shadow:0 0 30px rgba(224,48,80,0.5);opacity:0;transform:scale(0.3);";
    hero.textContent = '2-MINUTE';
    ov.appendChild(hero);

    // "WARNING"
    var sub = document.createElement('div');
    sub.style.cssText = "font-family:'Teko';font-weight:700;font-size:28px;color:#e03050;letter-spacing:6px;opacity:0;transform:translateY(8px);";
    sub.textContent = 'WARNING';
    ov.appendChild(sub);

    // Description
    var desc = document.createElement('div');
    desc.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:12px;color:#888;letter-spacing:2px;margin-top:8px;opacity:0;";
    desc.textContent = 'Clock stops at 2:00';
    ov.appendChild(desc);

    ov.onclick = function() { ov.style.opacity = '0'; setTimeout(function() { if (ov.parentNode) ov.remove(); }, 250); };
    el.appendChild(ov);
    requestAnimationFrame(function() {
      ov.style.opacity = '1';
      try {
        gsap.to(hero, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2.5)' });
        gsap.to(sub, { opacity: 0.8, y: 0, duration: 0.2, delay: 0.15 });
        gsap.to(desc, { opacity: 1, duration: 0.2, delay: 0.3 });
      } catch(e) { hero.style.opacity='1';hero.style.transform='scale(1)'; sub.style.opacity='0.8'; desc.style.opacity='1'; }
    });
    _setTimeout(function() { if (ov.parentNode) { ov.style.opacity = '0'; setTimeout(function() { if (ov.parentNode) ov.remove(); }, 250); } }, 2500);
  }

  // ── COIN TOSS OVERLAY ──
  // Generate 3 face-down torch card offers (55% Bronze, 35% Silver, 10% Gold)
  function rollCoinTossCards() {
    var cards = [];
    for (var i = 0; i < 3; i++) {
      var r = Math.random();
      var tier = r < 0.55 ? 'BRONZE' : r < 0.90 ? 'SILVER' : 'GOLD';
      var pool = TORCH_CARDS.filter(function(c) { return c.tier === tier; });
      cards.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return cards;
  }

  function showCoinToss(onDone) {
    _driveHeat = 0;
    var humanWins = Math.random() < 0.5;
    var offers = rollCoinTossCards();

    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:700;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:rgba(10,8,4,0.95);opacity:0;transition:opacity .3s;pointer-events:auto;';
    el.appendChild(ov);
    requestAnimationFrame(function() { ov.style.opacity = '1'; });

    // Phase 1: Tap to flip — 3D coin with team logos on each side
    var tossTitle = document.createElement('div');
    tossTitle.style.cssText = "font-family:'Teko';font-weight:900;font-size:28px;letter-spacing:4px;margin-bottom:16px;background:linear-gradient(180deg,#FFD060,#EBB010,#8B4A1F,#EBB010);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 12px rgba(235,176,16,0.5)) drop-shadow(0 6px 12px rgba(0,0,0,0.9));";
    tossTitle.textContent = 'COIN TOSS';
    ov.appendChild(tossTitle);

    var coin = document.createElement('div');
    coin.style.cssText = 'width:110px;height:110px;perspective:400px;cursor:pointer;';
    var coinInner = document.createElement('div');
    coinInner.style.cssText = 'width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform 1.5s cubic-bezier(0.22,1,0.36,1);';
    // Front: user's team
    var coinFront = document.createElement('div');
    coinFront.style.cssText = 'position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,#EBB010,#B8860B);display:flex;align-items:center;justify-content:center;backface-visibility:hidden;animation:coinGlow 3s ease-in-out infinite;';
    coinFront.innerHTML = renderTeamBadge(GS.team, 70);
    // Back: opponent's team
    var coinBack = document.createElement('div');
    coinBack.style.cssText = 'position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,#B8860B,#EBB010);display:flex;align-items:center;justify-content:center;backface-visibility:hidden;transform:rotateY(180deg);animation:coinGlow 3s ease-in-out infinite;';
    coinBack.innerHTML = renderTeamBadge(GS.opponent, 70);
    coinInner.appendChild(coinFront);
    coinInner.appendChild(coinBack);
    coin.appendChild(coinInner);
    var coinEdge = document.createElement('div');
    coinEdge.style.cssText = 'position:absolute;inset:-3px;border-radius:50%;border:1px solid rgba(255,215,0,0.15);pointer-events:none;';
    coin.appendChild(coinEdge);
    var label = document.createElement('div');
    label.style.cssText = "font-family:'Teko';font-weight:700;font-size:22px;color:#EBB010;letter-spacing:3px;margin-top:8px;animation:pulseHint 1.5s ease-in-out infinite;";
    label.textContent = 'TAP TO FLIP';
    ov.appendChild(coin);
    ov.appendChild(label);

    coin.onclick = function() {
      coin.onclick = null;
      // Land on winner's side: even rotations = front (human), odd half = back (opponent)
      var rotations = humanWins ? 1800 : 1980; // 1800 = 5 full turns (front), 1980 = 5.5 turns (back)
      coinInner.style.transform = 'rotateY(' + rotations + 'deg)';
      label.textContent = '';
      SND.flip();

      _setTimeout(function() {
        // Phase 2: Result + Choice
        ov.innerHTML = '';
        ov.style.background = '#0A0804';
        var winner = humanWins ? hTeam.name : oTeam.name;
        var winnerColor = humanWins ? hTeam.accent : oTeam.accent;
        var winnerTeam = humanWins ? hTeam : oTeam;

        // Background glow
        var tossGlow = document.createElement('div');
        tossGlow.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 35%,' + winnerTeam.colors.primary + '15 0%,transparent 60%);pointer-events:none;';
        ov.appendChild(tossGlow);

        var resultEl = document.createElement('div');
        resultEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:30px;color:" + winnerColor + ";letter-spacing:4px;text-align:center;text-shadow:0 0 20px " + winnerColor + "40;z-index:1;";
        resultEl.textContent = humanWins ? 'YOU WON THE TOSS!' : winner + ' WIN THE TOSS';
        ov.appendChild(resultEl);

        if (humanWins) {
          // Human chooses: Torch Card or Receive
          var FLAME = 'M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z';
          var choiceWrap = document.createElement('div');
          choiceWrap.style.cssText = 'display:flex;flex-direction:column;gap:14px;width:100%;max-width:320px;margin-top:20px;z-index:1;padding:0 16px;';

          var cardOpt = document.createElement('div');
          cardOpt.style.cssText = 'width:100%;border-radius:8px;padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;border:1.5px solid #EBB01044;background:linear-gradient(135deg,#FF451108,#EBB01008,transparent);';
          cardOpt.innerHTML =
            '<div style="width:44px;height:44px;border-radius:8px;background:linear-gradient(135deg,#FF451115,#EBB01015);border:1px solid #EBB01033;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
              "<svg viewBox='0 0 44 56' width='20' height='26' fill='#EBB010'><path d='" + FLAME + "'/></svg>" +
            '</div>' +
            '<div style="flex:1;">' +
              "<div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#EBB010;letter-spacing:2px;\">FREE TORCH CARD</div>" +
              "<div style=\"font-family:'Rajdhani';font-size:11px;color:#888;\">Pick 1 of 3 mystery cards \u2014 but you kick off</div>" +
            '</div>';
          cardOpt.onclick = function() { showFaceDownCards(ov, offers, true, onDone); };

          var recvOpt = document.createElement('div');
          recvOpt.style.cssText = 'width:100%;border-radius:8px;padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;border:1.5px solid #00ff4444;background:linear-gradient(135deg,#00ff4408,transparent);';
          recvOpt.innerHTML =
            '<div style="width:44px;height:44px;border-radius:8px;background:#00ff4408;border:1px solid #00ff4433;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
              '<svg viewBox="0 0 24 24" width="20" height="20" fill="#00ff44"><ellipse cx="12" cy="12" rx="10" ry="7" transform="rotate(-45 12 12)" stroke="#00ff44" stroke-width="1.5" fill="none"/><line x1="8" y1="8" x2="16" y2="16" stroke="#00ff44" stroke-width="1" opacity="0.5"/><line x1="10" y1="10" x2="14" y2="14" stroke="#00ff44" stroke-width="0.8" opacity="0.3"/></svg>' +
            '</div>' +
            '<div style="flex:1;">' +
              "<div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#00ff44;letter-spacing:2px;\">RECEIVE THE KICK</div>" +
              "<div style=\"font-family:'Rajdhani';font-size:11px;color:#888;\">Start with the ball \u2014 no free card until halftime</div>" +
            '</div>';
          recvOpt.onclick = function() {
            SND.snap();
            ov.style.opacity = '0';
            _setTimeout(function() { ov.remove(); onDone({ chose: 'receive' }); }, 250);
          };

          choiceWrap.appendChild(cardOpt);
          choiceWrap.appendChild(recvOpt);
          ov.appendChild(choiceWrap);
        } else {
          // CPU won — AI chooses
          var aiTakesCard = Math.random() < ({ EASY: 0.6, MEDIUM: 0.5, HARD: 0.4 }[gs.difficulty] || 0.5);

          // Opponent badge
          var badgeWrap = document.createElement('div');
          badgeWrap.style.cssText = 'margin-top:20px;z-index:1;';
          badgeWrap.innerHTML = renderTeamBadge(GS.opponent, 64);
          ov.appendChild(badgeWrap);

          // What they chose
          var aiMsg = document.createElement('div');
          aiMsg.style.cssText = "font-family:'Teko';font-weight:700;font-size:18px;color:" + oTeam.accent + ";text-align:center;letter-spacing:2px;margin-top:10px;z-index:1;";
          aiMsg.textContent = aiTakesCard ? 'THEY TAKE A TORCH CARD' : 'THEY CHOOSE TO RECEIVE';
          ov.appendChild(aiMsg);

          // Divider
          var div = document.createElement('div');
          div.style.cssText = 'width:60px;height:2px;background:linear-gradient(90deg,transparent,' + oTeam.accent + '66,transparent);margin:14px 0;border-radius:1px;z-index:1;';
          ov.appendChild(div);

          // What you get — flame icon for card, football for receive
          var youIcon = aiTakesCard
            ? ''
            : "<svg viewBox='0 0 44 44' width='28' height='30' fill='none' style='margin-bottom:4px;'><defs><linearGradient id='yg1' x1='22' y1='40' x2='22' y2='0'><stop offset='0%' stop-color='#FF4511'/><stop offset='100%' stop-color='#EBB010'/></linearGradient></defs><path d='M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z' fill='url(#yg1)'/></svg>";
          var youGetMsg = document.createElement('div');
          youGetMsg.style.cssText = "text-align:center;z-index:1;";
          youGetMsg.innerHTML = youIcon +
            "<div style=\"font-family:'Teko';font-weight:700;font-size:24px;color:#EBB010;letter-spacing:3px;text-shadow:0 0 16px rgba(235,176,16,0.3);\">" + (aiTakesCard ? 'YOU RECEIVE THE KICK' : 'YOU DRAW A FREE TORCH CARD') + "</div>";
          ov.appendChild(youGetMsg);

          var contBtn = _flameBadgeContinue('CONTINUE', function() {
            contBtn.onclick = null;
            if (!aiTakesCard) {
              showFaceDownCards(ov, offers, false, onDone);
            } else {
              showAICardPick(ov, offers, onDone);
            }
          });
          contBtn.style.zIndex = '1';
          ov.appendChild(contBtn);
        }
      }, 1600);
    };
  }

  // Face-down card selection (used by coin toss and halftime)
  function showFaceDownCards(ov, offers, humanKicks, onDone) {
    ov.innerHTML = '';
    ov.style.cssText += 'background:radial-gradient(ellipse at 50% 30%,rgba(235,176,16,0.06) 0%,transparent 60%),rgba(10,8,4,0.95);';

    var title = document.createElement('div');
    title.style.cssText = "font-family:'Teko';font-weight:700;font-size:28px;color:#EBB010;letter-spacing:5px;text-align:center;text-shadow:0 0 20px rgba(235,176,16,0.4);";
    title.textContent = 'FREE TORCH CARD';
    ov.appendChild(title);

    var subtitle = document.createElement('div');
    subtitle.style.cssText = "font-family:'Rajdhani';font-size:13px;font-weight:600;color:#888;text-align:center;margin-top:6px;max-width:260px;line-height:1.4;letter-spacing:1px;";
    subtitle.textContent = 'Pick one. Single-use power-ups that boost your plays.';
    ov.appendChild(subtitle);

    var tapHint = document.createElement('div');
    tapHint.style.cssText = "font-family:'Rajdhani';font-size:11px;font-weight:700;color:#EBB01088;text-align:center;margin-top:12px;letter-spacing:2px;";
    tapHint.textContent = 'TAP A CARD TO REVEAL';
    ov.appendChild(tapHint);

    var cardRow = document.createElement('div');
    cardRow.style.cssText = 'display:flex;gap:14px;justify-content:center;margin-top:16px;';

    var cardWraps = [];
    offers.forEach(function(card, idx) {
      var wrap = document.createElement('div');
      wrap.style.cssText = 'cursor:pointer;opacity:0;transform:translateY(30px);transition:opacity 0.3s,transform 0.3s;animation:floatCard 3s ease-in-out infinite;animation-delay:' + (idx * 0.4) + 's;';
      var backCard = buildHomeCard('torch', 95, 133);
      wrap.appendChild(backCard);
      wrap._card = card;
      wrap._idx = idx;

      // Stagger entrance
      _setTimeout(function() { wrap.style.opacity = '1'; wrap.style.transform = 'translateY(0)'; }, 400 + idx * 150);

      wrap.onclick = function() {
        // Disable all cards
        cardWraps.forEach(function(w) { w.onclick = null; w.style.cursor = 'default'; });
        tapHint.style.display = 'none';

        // Dim non-selected
        cardWraps.forEach(function(w) {
          if (w !== wrap) {
            try { gsap.to(w, { opacity: 0.15, scale: 0.9, duration: 0.3 }); } catch(e) { w.style.opacity = '0.15'; }
          }
        });

        // Flip the selected card: center on screen → scaleX squeeze → swap content → expand
        var isDramatic = card.tier === 'GOLD';
        var flipDur = isDramatic ? 0.18 : 0.12;
        try {
          // Calculate delta to center the card on screen
          var cardRect = wrap.getBoundingClientRect();
          var centerX = window.innerWidth / 2 - cardRect.left - cardRect.width / 2;
          var centerY = window.innerHeight * 0.4 - cardRect.top - cardRect.height / 2;

          var tl = gsap.timeline();
          // Move to center + scale up
          tl.to(wrap, { x: centerX, y: centerY, scale: 1.15, duration: 0.35, ease: 'power2.out' });
          // Then flip
          tl.to(wrap, { scaleX: 0, duration: flipDur, ease: 'power2.in' });
          tl.call(function() {
            wrap.innerHTML = '';
            wrap.style.background = 'transparent';
            var revealed = buildTorchCard(card, 100, 140);
            wrap.appendChild(revealed);
            if (isDramatic) { try { SND.flip(); } catch(e) {} }
            else { try { SND.cardSnap(); } catch(e) {} }
          });
          tl.to(wrap, { scaleX: 1, duration: flipDur, ease: 'power2.out' });
          tl.to(wrap, { scale: 1.1, duration: 0.15, ease: 'back.out(2)' });
          if (isDramatic) {
            tl.fromTo(wrap, { boxShadow: '0 0 0 rgba(235,176,16,0)' }, { boxShadow: '0 0 30px rgba(235,176,16,0.6)', duration: 0.2, yoyo: true, repeat: 1 }, '-=0.15');
          }
        } catch(e) {
          wrap.innerHTML = '';
          wrap.appendChild(buildTorchCard(card, 100, 140));
        }

        // Show card name + effect below
        _setTimeout(function() {
          var tierColors = { GOLD: '#EBB010', SILVER: '#C0C0C0', BRONZE: '#B87333' };
          var tierCol = tierColors[card.tier] || '#EBB010';
          var info = document.createElement('div');
          info.style.cssText = 'text-align:center;margin-top:16px;opacity:0;transform:translateY(10px);transition:opacity 0.4s,transform 0.4s;';
          info.innerHTML =
            "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:10px;color:" + tierCol + ";letter-spacing:2px;\">" + card.tier + "</div>" +
            "<div style=\"font-family:'Teko';font-weight:700;font-size:22px;color:#fff;letter-spacing:2px;margin-top:2px;\">" + card.name + "</div>" +
            "<div style=\"font-family:'Rajdhani';font-size:13px;color:#ccc;margin-top:4px;max-width:260px;line-height:1.4;\">" + card.effect + "</div>";
          ov.appendChild(info);
          requestAnimationFrame(function() { info.style.opacity = '1'; info.style.transform = 'translateY(0)'; });
        }, 700);

        // Award card
        if (gs.humanTorchCards.length < 3) gs.humanTorchCards.push(card.id);
        var cardObj = TORCH_CARDS.find(function(tc) { return tc.id === card.id; });
        if (cardObj) torchInventory.push(cardObj);
        if (GS.season) GS.season.torchCards = torchInventory.slice();

        // Continue button
        var dismissFn = function() {
          ov.style.opacity = '0';
          _setTimeout(function() {
            ov.remove();
            onDone({ chose: humanKicks ? 'card' : 'card_cpu_receives', card: card });
          }, 250);
        };
        var continueBtn = _flameBadgeContinue('CONTINUE', dismissFn);
        continueBtn.style.opacity = '0';
        continueBtn.style.transition = 'opacity 0.3s';
        ov.appendChild(continueBtn);
        _setTimeout(function() { continueBtn.style.opacity = '1'; }, 1500);
      };
      cardRow.appendChild(wrap);
      cardWraps.push(wrap);
    });
    ov.appendChild(cardRow);
  }

  // AI picks a face-down card — shows card backs, auto-selects one, flips to reveal
  function showAICardPick(ov, offers, onDone) {
    ov.innerHTML = '';
    ov.onclick = null;
    ov.style.cssText = 'position:fixed;inset:0;z-index:700;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:#0A0804;pointer-events:auto;';

    var pickIdx = Math.floor(Math.random() * offers.length);
    var pickedCard = offers[pickIdx];

    var badge = document.createElement('div');
    badge.innerHTML = renderTeamBadge(GS.opponent, 48);
    ov.appendChild(badge);

    var title = document.createElement('div');
    title.style.cssText = "font-family:'Teko';font-weight:700;font-size:22px;color:" + oTeam.accent + ";letter-spacing:3px;text-align:center;";
    title.textContent = oTeam.name + ' ARE CHOOSING...';
    ov.appendChild(title);

    // 3 proper card backs
    var cardRow = document.createElement('div');
    cardRow.style.cssText = 'display:flex;gap:14px;justify-content:center;margin-top:16px;';
    var aiWraps = [];
    offers.forEach(function(card, idx) {
      var w = document.createElement('div');
      w.appendChild(buildHomeCard('torch', 95, 133));
      cardRow.appendChild(w);
      aiWraps.push(w);
    });
    ov.appendChild(cardRow);

    // After 1.5s: fade non-selected, flip selected
    _setTimeout(function() {
      if (!ov.parentNode) return;

      // Dim non-selected
      aiWraps.forEach(function(w, i) {
        if (i !== pickIdx) {
          try { gsap.to(w, { opacity: 0.15, duration: 0.3 }); } catch(e) { w.style.opacity = '0.15'; }
        }
      });

      // Flip selected with scaleX
      var picked = aiWraps[pickIdx];
      try {
        var tl = gsap.timeline();
        tl.to(picked, { y: -6, scale: 1.05, duration: 0.15, ease: 'power2.out' });
        tl.to(picked, { scaleX: 0, duration: 0.12, ease: 'power2.in' });
        tl.call(function() {
          picked.innerHTML = '';
          picked.appendChild(buildTorchCard(pickedCard, 100, 140));
          try { SND.cardSnap(); } catch(e) {}
          title.textContent = oTeam.name + ' DREW:';
        });
        tl.to(picked, { scaleX: 1, duration: 0.12, ease: 'power2.out' });
        tl.to(picked, { y: 0, scale: 1, duration: 0.2, ease: 'back.out(2)' });
      } catch(e) {
        picked.innerHTML = '';
        picked.appendChild(buildTorchCard(pickedCard, 100, 140));
        title.textContent = oTeam.name + ' DREW:';
      }

      // Always show card info + CONTINUE button after flip (independent of GSAP)
      gs.cpuTorchCards.push(pickedCard.id);

      _setTimeout(function() {
        if (!ov.parentNode) return;
        var info = document.createElement('div');
        info.style.cssText = 'text-align:center;margin-top:8px;max-width:260px;';
        info.innerHTML =
          "<div style=\"font-family:'Teko';font-weight:700;font-size:20px;color:#fff;letter-spacing:2px;\">" + pickedCard.name + "</div>" +
          "<div style=\"font-family:'Rajdhani';font-size:11px;color:#888;margin-top:4px;line-height:1.3;\">" + pickedCard.effect + "</div>";
        ov.appendChild(info);

        var btn = _flameBadgeContinue('CONTINUE', function() {
          btn.onclick = null;
          ov.style.transition = 'opacity 0.25s';
          ov.style.opacity = '0';
          _setTimeout(function() { if (ov.parentNode) ov.remove(); onDone({ chose: 'receive' }); }, 250);
        });
        ov.appendChild(btn);
      }, 800); // 800ms = enough time for flip animation to complete
    }, 1500);
  }

  // Special teams result overlay (punt, FG, kickoff)
  function showSpecialTeamsResult(text, color, onDone) {
    var stOv = document.createElement('div');
    var _stFired = false;
    function _stDone() { if (_stFired) return; _stFired = true; if (stOv.parentNode) stOv.remove(); if (onDone) onDone(); }
    stOv.style.cssText = 'position:fixed;inset:0;z-index:650;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(10,8,4,0.92);opacity:0;transition:opacity 0.3s;pointer-events:auto;';

    // Title label
    var label = document.createElement('div');
    label.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:3px;text-transform:uppercase;opacity:0;transform:translateY(8px);";
    label.textContent = text.indexOf('PUNT') >= 0 ? 'PUNT' : text.indexOf('FG') >= 0 || text.indexOf('FIELD GOAL') >= 0 || text.indexOf('GOOD') >= 0 || text.indexOf('NO GOOD') >= 0 || text.indexOf('MISSED') >= 0 ? 'FIELD GOAL' : 'SPECIAL TEAMS';
    stOv.appendChild(label);

    // Result text
    var resultEl = document.createElement('div');
    resultEl.style.cssText = "font-family:'Teko';font-weight:900;font-size:48px;color:" + color + ";letter-spacing:4px;text-align:center;max-width:320px;text-shadow:0 0 20px " + color + "40,0 2px 6px rgba(0,0,0,0.8);opacity:0;transform:scale(0.3);";
    resultEl.textContent = text;
    stOv.appendChild(resultEl);

    // Gradient divider
    var divider = document.createElement('div');
    divider.style.cssText = "width:60px;height:1px;background:linear-gradient(90deg,transparent," + color + "44,transparent);transform:scaleX(0);margin:4px 0;";
    stOv.appendChild(divider);

    // Continue button
    var contBtn = _flameBadgeContinue('CONTINUE', function() { stOv.style.opacity = '0'; setTimeout(_stDone, 200); });
    contBtn.style.opacity = '0';
    contBtn.style.transform = 'translateY(10px)';
    stOv.appendChild(contBtn);

    stOv.onclick = function() { stOv.style.opacity = '0'; setTimeout(_stDone, 200); };
    el.appendChild(stOv);
    requestAnimationFrame(function() {
      stOv.style.opacity = '1';
      try {
        gsap.to(label, { opacity: 1, y: 0, duration: 0.2, delay: 0.1 });
        gsap.to(resultEl, { opacity: 1, scale: 1, duration: 0.25, delay: 0.15, ease: 'back.out(2.5)' });
        gsap.to(divider, { scaleX: 1, duration: 0.3, delay: 0.3, ease: 'power2.out' });
        gsap.to(contBtn, { opacity: 1, y: 0, duration: 0.2, delay: 0.4 });
      } catch(e) { label.style.opacity='1'; resultEl.style.opacity='1'; resultEl.style.transform='scale(1)'; divider.style.transform='scaleX(1)'; contBtn.style.opacity='1'; }
    });
  }

  // Brief kickoff result overlay
  function showKickoffResult(resultText, onDone) {
    var recTeam = gs.possession === hAbbr ? hTeam : oTeam;
    var recColor = recTeam.accent || '#EBB010';
    var kov = document.createElement('div');
    var _kovFired = false;
    function _kovDone() { if (_kovFired) return; _kovFired = true; if (kov.parentNode) kov.remove(); if (onDone) onDone(); }
    kov.style.cssText = 'position:fixed;inset:0;z-index:650;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(10,8,4,0.85);opacity:0;transition:opacity 0.3s;pointer-events:auto;';

    // Background radial glow
    var bgGlow = document.createElement('div');
    bgGlow.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 35%,' + (recTeam.colors ? recTeam.colors.primary : recColor) + '15 0%,transparent 60%);pointer-events:none;';
    kov.appendChild(bgGlow);

    // "KICKOFF" label
    var label = document.createElement('div');
    label.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#666;letter-spacing:3px;z-index:1;opacity:0;transform:translateY(8px);";
    label.textContent = 'KICKOFF';
    kov.appendChild(label);

    // Team name
    var teamEl = document.createElement('div');
    teamEl.style.cssText = "font-family:'Oswald';font-weight:700;font-size:22px;color:" + recColor + ";letter-spacing:4px;text-shadow:0 0 16px " + recColor + "40;z-index:1;opacity:0;transform:scale(0.3);";
    teamEl.textContent = recTeam.name.toUpperCase() + ' RECEIVE';
    kov.appendChild(teamEl);

    // Result text
    var resEl = document.createElement('div');
    resEl.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:13px;color:#ccc;z-index:1;opacity:0;transform:translateY(6px);";
    resEl.textContent = resultText;
    kov.appendChild(resEl);

    // Continue button
    var contBtn = _flameBadgeContinue('CONTINUE', function() { kov.style.opacity = '0'; setTimeout(_kovDone, 200); });
    contBtn.style.zIndex = '1';
    contBtn.style.opacity = '0';
    contBtn.style.transform = 'translateY(10px)';
    kov.appendChild(contBtn);

    kov.onclick = function() { kov.style.opacity = '0'; setTimeout(_kovDone, 200); };
    el.appendChild(kov);
    requestAnimationFrame(function() {
      kov.style.opacity = '1';
      try {
        gsap.to(label, { opacity: 1, y: 0, duration: 0.2, delay: 0.1 });
        gsap.to(teamEl, { opacity: 1, scale: 1, duration: 0.25, delay: 0.2, ease: 'back.out(2.5)' });
        gsap.to(resEl, { opacity: 1, y: 0, duration: 0.2, delay: 0.35 });
        gsap.to(contBtn, { opacity: 1, y: 0, duration: 0.2, delay: 0.45 });
      } catch(e) { label.style.opacity='1';teamEl.style.opacity='1';teamEl.style.transform='scale(1)';resEl.style.opacity='1';contBtn.style.opacity='1'; }
    });
  }

  // ── TRANSITIONS ──
  function showHalfEnd(isGameEnd, onDone) {
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:700;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(10,8,4,0);pointer-events:auto;';
    el.appendChild(ov);

    try { gsap.to(ov, { backgroundColor: 'rgba(10,8,4,0.92)', duration: 0.4 }); } catch(e) { ov.style.background = 'rgba(10,8,4,0.92)'; }

    // Gold accent bars
    var barT = document.createElement('div');
    barT.style.cssText = 'position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#8B4A1F,#EBB010,#FFD060,#EBB010,#8B4A1F);z-index:2;opacity:0;';
    var barB = document.createElement('div');
    barB.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#8B4A1F,#EBB010,#FFD060,#EBB010,#8B4A1F);z-index:2;opacity:0;';
    ov.appendChild(barT); ov.appendChild(barB);

    var label = isGameEnd ? 'FINAL' : 'HALFTIME';

    // Determine chrome gradient — game end uses result color, halftime uses gold
    var hScoreCheck = hAbbr === 'CT' ? gs.ctScore : gs.irScore;
    var cScoreCheck = hAbbr === 'CT' ? gs.irScore : gs.ctScore;
    var heroSize = isGameEnd ? 48 : 40;
    var chromeGrad, chromeShadow;
    if (isGameEnd && hScoreCheck > cScoreCheck) {
      chromeGrad = 'linear-gradient(180deg,#66FF88,#00ff44,#008822,#00ff44)';
      chromeShadow = 'rgba(0,255,68,0.5)';
    } else if (isGameEnd && hScoreCheck < cScoreCheck) {
      chromeGrad = 'linear-gradient(180deg,#FF6680,#ff0040,#880022,#ff0040)';
      chromeShadow = 'rgba(255,0,64,0.5)';
    } else {
      chromeGrad = 'linear-gradient(180deg,#FFD060,#EBB010,#8B4A1F,#EBB010)';
      chromeShadow = 'rgba(235,176,16,0.5)';
    }

    // Hero text with metallic chrome
    var textEl = document.createElement('div');
    textEl.style.cssText = "font-family:'Teko';font-weight:900;font-size:" + heroSize + "px;letter-spacing:4px;line-height:1;background:" + chromeGrad + ";-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 12px " + chromeShadow + ") drop-shadow(0 6px 12px rgba(0,0,0,0.9));opacity:0;transform:scale(0.3);z-index:1;";
    textEl.textContent = label;
    ov.appendChild(textEl);

    // Score: "BOARS 21 · SERPENTS 14"
    var hScore = hAbbr === 'CT' ? gs.ctScore : gs.irScore;
    var cScore = hAbbr === 'CT' ? gs.irScore : gs.ctScore;
    var scoreEl = document.createElement('div');
    scoreEl.style.cssText = "font-family:'Oswald';font-weight:700;font-size:16px;color:rgba(255,255,255,0.7);letter-spacing:3px;z-index:1;opacity:0;margin-top:4px;";
    scoreEl.textContent = hTeam.name.toUpperCase() + ' ' + hScore + ' \u00b7 ' + oTeam.name.toUpperCase() + ' ' + cScore;
    ov.appendChild(scoreEl);

    var contBtn = document.createElement('button');
    contBtn.className = 'btn-blitz';
    contBtn.style.cssText = "font-size:16px;padding:14px 40px;background:#141008;color:#EBB010;border-color:#EBB010;letter-spacing:3px;margin-top:20px;opacity:0;z-index:1;transform:translateY(10px);";
    contBtn.textContent = 'CONTINUE';
    ov.appendChild(contBtn);

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      try { gsap.to(ov, { opacity: 0, duration: 0.3, onComplete: function() { ov.remove(); onDone(); } }); }
      catch(e) { ov.remove(); onDone(); }
    }
    contBtn.onclick = function(e) { e.stopPropagation(); dismiss(); };
    ov.onclick = dismiss;

    try {
      gsap.to([barT, barB], { opacity: 1, duration: 0.3, delay: 0.2 });
      gsap.to(textEl, { opacity: 1, scale: 1, duration: 0.3, delay: 0.3, ease: 'back.out(2.5)' });
      gsap.to(scoreEl, { opacity: 1, duration: 0.25, delay: 0.5 });
      gsap.to(contBtn, { opacity: 1, y: 0, duration: 0.25, delay: 0.7 });
    } catch(e) { textEl.style.opacity = '1'; textEl.style.transform = 'scale(1)'; scoreEl.style.opacity = '1'; contBtn.style.opacity = '1'; barT.style.opacity = '1'; barB.style.opacity = '1'; }
  }

  function checkEnd() {
    if (gs.gameOver) {
      SND.whistle();
      AudioStateManager.stopCrowd(2);
      showHalfEnd(true, function() { setGs(s => ({...s, screen:'end_game', finalEngine:gs, humanAbbr:hAbbr})); });
      return true;
    }
    if (gs.needsHalftime) {
      SND.whistle();
      showHalfEnd(false, function() { setGs(s => ({...s, screen:'halftime'})); });
      return true;
    }
    return false;
  }

  // ── INIT ──
  drawBug(); drawField();
  if (gs.twoMinActive) { prev2min = true; el.classList.add('T-urgent'); el.classList.add('T-2min-active'); }

  // First load: coin toss → kickoff → play
  if (!GS._coinTossDone) {
    GS._coinTossDone = true;
    panel.style.display = 'none'; // Hide card tray until after kickoff
    showCoinToss(function(result) {
      // result.chose = 'receive' | 'card' | 'card_cpu_receives'
      // Determine who receives the opening kickoff
      // 'receive' = human chose to receive. 'card' = human drew card, kicks off (CPU receives).
      // 'card_cpu_receives' = CPU won toss and chose to receive, human got card (CPU receives).
      var humanReceives = result.chose === 'receive';

      // Resolve kickoff and set field position (HOUSE_CALL auto-consumed if human receives)
      var kickResult = _resolveKickoff(humanReceives);
      var startYard = kickResult === -1 ? 25 : kickResult; // return TD = rare, treat as touchback for simplicity
      if (humanReceives) {
        gs.possession = 'CT';
        gs.ballPosition = startYard; // CT at own yard line
      } else {
        gs.possession = 'IR';
        gs.ballPosition = 100 - startYard; // IR at own yard line (from CT perspective)
      }
      gs.down = 1;
      gs.distance = 10;

      var posLabel = startYard === 25 ? 'Touchback \u2014 ball on the 25' : 'Returned to the ' + startYard;
      showKickoffResult(posLabel, function() {
        drawBug(); drawField();
        // Torch tutorial — disabled, will revisit
        if (false) {
          _torchTutorialShown = true;
          var torchTutOv = document.createElement('div');
          torchTutOv.style.cssText = 'position:fixed;inset:0;z-index:900;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(10,8,4,0.92);opacity:0;transition:opacity .3s;pointer-events:auto;';
          var _ftSvg = '<svg viewBox="0 0 44 44" width="40" height="46" fill="none" style="animation:T-flame-pulse 2s ease-in-out infinite;filter:drop-shadow(0 0 12px ' + hTeam.accent + ')"><defs><linearGradient id="tft2" x1="22" y1="40" x2="22" y2="0"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="' + hTeam.accent + '"/></linearGradient></defs><path d="M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z" fill="url(#tft2)"/></svg>';
          var _hasReactiveOnly = torchInventory.every(function(c) { return c.type === 'reactive'; });
          var _tutDesc = _hasReactiveOnly
            ? 'Reactive cards activate automatically when triggered. Look for the prompt during play!'
            : 'When you have a playable card, tap it to power up your play before you snap.';
          torchTutOv.innerHTML =
            _ftSvg +
            "<div style=\"font-family:'Teko';font-weight:700;font-size:28px;color:" + hTeam.accent + ";letter-spacing:4px;text-shadow:0 0 20px " + hTeam.accent + "40;\">TORCH CARD EARNED!</div>" +
            "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:14px;color:#999;letter-spacing:2px;text-align:center;max-width:280px;line-height:1.4;\">" + _tutDesc + "</div>" +
            "<button class='btn-blitz' style='margin-top:20px;font-size:16px;padding:14px 40px;background:#141008;color:" + hTeam.accent + ";border-color:" + hTeam.accent + ";letter-spacing:3px;'>GOT IT</button>";
          torchTutOv.querySelector('button').onclick = function() {
            torchTutOv.style.opacity = '0';
            _setTimeout(function() {
              torchTutOv.remove();
              phase = 'play';
              panel.style.display = '';
              drawPanel();
            }, 300);
          };
          el.appendChild(torchTutOv);
          requestAnimationFrame(function() { torchTutOv.style.opacity = '1'; });
        } else {
          phase = 'play';
          panel.style.display = '';
          drawPanel();
        }
      });
    });
  } else if (gs.half === 2 && GS._halftimeCardDone === false) {
    // Halftime card pick: kicking team gets a face-down card
    GS._halftimeCardDone = true;
    var humanKicks2nd = !GS.humanReceives;
    if (humanKicks2nd) {
      // Human kicks off — show face-down card pick, then kickoff
      var offers = rollCoinTossCards();
      var ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:700;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.92);opacity:0;transition:opacity 0.3s;';
      el.appendChild(ov);
      requestAnimationFrame(function() { ov.style.opacity = '1'; });
      showFaceDownCards(ov, offers, true, function() {
        resolveHalftimeKickoff();
      });
    } else {
      // CPU kicks off — AI auto-picks a card, then kickoff
      var offers = rollCoinTossCards();
      var ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:700;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.92);opacity:0;transition:opacity 0.3s;';
      el.appendChild(ov);
      requestAnimationFrame(function() { ov.style.opacity = '1'; });
      showAICardPick(ov, offers, function() {
        resolveHalftimeKickoff();
      });
    }
  } else {
    drawPanel();
  }

  function resolveHalftimeKickoff() {
    // Reset half-scoped state for second half
    _lastPlayFlashed = false;
    prev2min = false;
    var kickResult = _resolveKickoff(GS.humanReceives);
    var startYard = kickResult === -1 ? 25 : kickResult;
    if (GS.humanReceives) {
      gs.possession = 'CT';
      gs.ballPosition = startYard;
    } else {
      gs.possession = 'IR';
      gs.ballPosition = 100 - startYard;
    }
    gs.down = 1; gs.distance = 10;
    var posLabel = startYard === 25 ? 'Touchback \u2014 ball on the 25' : 'Returned to the ' + startYard;
    showKickoffResult(posLabel, function() {
      drawBug(); drawField();
      phase = 'play';
      drawPanel();
    });
  }

  // ── DEV PANEL ──
  injectDevPanel(el, gs, {
    refresh: function() { drawBug(); drawField(); drawPanel(); drawDriveSummary(); },
    redealHand: function() {
      var hs = getHandState();
      handRedeal(hs);
      selP = null; selPl = null; phase = 'play';
      drawBug(); drawField(); drawPanel();
    },
    resetDiscards: function() {
      var hs = getHandState();
      resetDriveDiscards(hs);
      drawPanel();
    },
    showSTInfo: function() {
      var avail = _humanSTDeck.available.length;
      var burned = _humanSTDeck.burned.length;
      var info = 'ST Deck: ' + avail + ' available, ' + burned + ' burned\n';
      _humanSTDeck.burned.forEach(function(b) { info += '  ' + b.player.pos + ' ' + b.player.name + ' — ' + b.context + '\n'; });
      alert(info);
    },
    burnSTPlayers: function() {
      var count = Math.min(10, _humanSTDeck.available.length);
      for (var i = 0; i < count; i++) {
        var p = _humanSTDeck.available[0];
        burnPlayer(_humanSTDeck, p, 'test', 'Dev burn');
      }
      alert('Burned ' + count + '. ' + _humanSTDeck.available.length + ' remaining.');
    },
    setTorchInventory: function(inv) { torchInventory = inv; if (GS.season) GS.season.torchCards = inv.slice(); },
    applyState: function(s) {
      if (s.down) gs.down = s.down;
      if (s.distance) gs.distance = s.distance;
      if (s.ballPosition) gs.ballPosition = s.ballPosition;
      if (s.ctScore !== undefined) gs.ctScore = s.ctScore;
      if (s.irScore !== undefined) gs.irScore = s.irScore;
      drawBug(); drawField(); drawPanel(); drawDriveSummary();
    },
    showPossCut: function(ev) {
      showPossCut(ev, function() { nextSnap(); });
    },
    flipPossession: function() {
      gs.flipPossession(gs.ballPosition);
      drawBug(); drawField(); drawPanel(); drawDriveSummary();
    },
    reset4thDown: function() { _fourthDownDecided = false; },
    showCoinToss: function() {
      showCoinToss(function(result) {
        // 'receive' = human chose to receive. 'card' = human drew card, kicks off (CPU receives).
      // 'card_cpu_receives' = CPU won toss and chose to receive, human got card (CPU receives).
      var humanReceives = result.chose === 'receive';
        var kickResult = _resolveKickoff(humanReceives);
        var startYard = kickResult === -1 ? 25 : kickResult;
        gs.ballPosition = humanReceives ? startYard : 100 - startYard;
        gs.possession = humanReceives ? 'CT' : 'IR';
        gs.down = 1; gs.distance = 10;
        drawBug(); drawField(); drawPanel();
      });
    },
    showKickoff: function() {
      var kickResult = _resolveKickoff(gs.possession !== hAbbr);
      var startYard = kickResult === -1 ? 25 : kickResult;
      var posLabel = startYard === 25 ? 'Touchback \u2014 ball on the 25' : 'Returned to the ' + startYard;
      showKickoffResult(posLabel, function() { drawBug(); drawField(); drawPanel(); });
    },
    openBooster: function() {
      triggerShop('halftime', function() { drawBug(); drawField(); drawPanel(); });
    },
    advanceSeason: function() {
      setGs(function(s) {
        var cur = (s && s.season && s.season.currentGame != null) ? s.season.currentGame : 0;
        return Object.assign({}, s, {
          season: Object.assign({}, (s && s.season) || {}, { currentGame: Math.min(cur + 1, 2) }),
        });
      });
    },
    maxMomentumP1: function() {
      var firstId = gs.ctOffRoster && gs.ctOffRoster[0] ? (gs.ctOffRoster[0].id || gs.ctOffRoster[0]) : null;
      if (firstId) { gs.offMomentumMap = gs.offMomentumMap || {}; gs.offMomentumMap[firstId] = 5; }
      drawBug(); drawField(); drawPanel();
    },
    maxHeatP1: function() {
      var firstId = gs.ctOffRoster && gs.ctOffRoster[0] ? (gs.ctOffRoster[0].id || gs.ctOffRoster[0]) : null;
      if (firstId) { gs.offHeatMap = gs.offHeatMap || {}; gs.offHeatMap[firstId] = 5; }
      drawBug(); drawField(); drawPanel();
    },
    resetAllHeat: function() {
      gs.offHeatMap = {};
      gs.defHeatMap = {};
      drawBug(); drawField(); drawPanel();
    },
  });

  // ── CLEANUP: remove document listeners + kill timers on screen exit ──
  var _cleanup = function() {
    if (_driveHeatFill && _driveHeatFill.parentNode) { _driveHeatFill.parentNode.remove(); _driveHeatFill = null; }
    document.removeEventListener('mousemove', moveDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', moveDrag);
    document.removeEventListener('touchend', endDrag);
    if (twoMinTimer) { clearInterval(twoMinTimer); twoMinTimer = null; }
    if (_tickerAnim) { try { _tickerAnim.kill(); } catch(e) {} _tickerAnim = null; }
    _timers.forEach(clearTimeout); _timers.length = 0;
    // Remove any lingering clash overlays (they used to be on document.body)
    document.querySelectorAll('.T-clash-overlay').forEach(function(ov) { ov.remove(); });
    try { gsap.killTweensOf(el.querySelectorAll('*')); } catch(e) {}
    stopWeatherAudio();
  };
  // Expose cleanup so the router can call it directly before swapping screens
  el._cleanup = _cleanup;

  // Attach cleanup to a MutationObserver that fires when el is removed from DOM
  var _cleanupObs = new MutationObserver(function(mutations) {
    for (var m = 0; m < mutations.length; m++) {
      for (var n = 0; n < mutations[m].removedNodes.length; n++) {
        if (mutations[m].removedNodes[n] === el || mutations[m].removedNodes[n].contains(el)) {
          _cleanup();
          _cleanupObs.disconnect();
          return;
        }
      }
    }
  });
  if (el.parentNode) _cleanupObs.observe(el.parentNode, { childList: true });
  else {
    // Fallback: observe document.body once el is added
    var _attachObs = new MutationObserver(function() {
      if (el.parentNode) { _cleanupObs.observe(el.parentNode, { childList: true }); _attachObs.disconnect(); }
    });
    _attachObs.observe(document.body, { childList: true, subtree: true });
  }

  return el;
}
