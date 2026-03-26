/**
 * TORCH — Gameplay Screen v3
 * Complete rewrite. Portrait bottom-stack.
 * Fresh visual language — no reuse from prior versions.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOtherTeam, fmtClock, getOffCards, getDefCards, getDrawWeight } from '../../state.js';
import { BADGE_LABELS } from '../../data/badges.js';
import { GameState } from '../../engine/gameState.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { checkOffensiveBadgeCombo, checkDefensiveBadgeCombo } from '../../engine/badgeCombos.js';
import { getPlayHistoryBonus } from '../../engine/playHistory.js';
// playSvg removed — play cards no longer use SVG diagrams
import { TORCH_CARDS } from '../../data/torchCards.js';
import { buildMaddenPlayer, buildPlayV1, buildTorchCard, injectCardStyles } from '../components/cards.js';
import { showShop, renderInventory } from '../components/shop.js';
// tooltip system removed — will be rebuilt in v2
import AudioStateManager from '../../engine/audioManager.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { getConditionEffects } from '../../data/gameConditions.js';
import { checkPlayCombos } from '../../data/playSequenceCombos.js';
import { generateCommentary, generateContext } from '../../engine/commentary.js';
import { initPointsAnim, playPointsSequence, isPointsAnimPlaying } from '../effects/torchPointsAnim.js';
import { injectDevPanel, getForceResult } from '../components/devPanel.js';

/* ═══════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════ */
const CSS = `
/* root */
.T{height:100vh;display:flex;flex-direction:column;background:#0A0804;overflow:hidden;position:relative;font-family:'Barlow Condensed',sans-serif}

/* scoreboard */
.T-sb{background:#0E0A04;border-bottom:1px solid #1E1610;flex-shrink:0;z-index:60;overflow:hidden}
/* score row: 5 columns — icon | team+score | center | team+score | icon */
.T-sb-row{display:grid;grid-template-columns:44px 1fr minmax(70px,auto) 1fr 44px;align-items:center;justify-items:center;padding:6px 10px;gap:4px}
.T-sb-icon{line-height:1;text-align:center;display:flex;align-items:center;justify-content:center}
.T-sb-side{display:flex;flex-direction:column;align-items:center;padding:4px 6px;border-radius:6px;position:relative}
.T-sb-side-glow{background:radial-gradient(ellipse,rgba(255,204,0,.15) 0%,rgba(255,204,0,.04) 50%,transparent 75%);box-shadow:0 0 16px rgba(255,204,0,.12);border:1px solid rgba(255,204,0,.15)}
.T-sb-name{font-family:'Teko';font-weight:700;font-size:20px;font-style:italic;line-height:1;letter-spacing:1px;white-space:nowrap;flex-shrink:1;min-width:0}
.T-sb-score-row{position:relative;margin-top:2px;display:flex;justify-content:center}
.T-sb-pos-arrow{position:absolute;top:50%;transform:translateY(-50%);font-size:14px;color:#00ff44;line-height:1}
.T-sb-pos-arrow-l{left:-16px}
.T-sb-pos-arrow-r{right:-16px}
.T-sb-pts{font-family:'Rajdhani';font-size:28px;color:#e8e6ff;line-height:1}
.T-sb-pts-glow{text-shadow:0 0 14px rgba(255,204,0,.5)}
.T-sb-center{text-align:center;padding:0 6px;border-left:1px solid rgba(255,255,255,.06);border-right:1px solid rgba(255,255,255,.06);min-width:70px}
.T-sb-half{font-family:'Teko';font-size:11px;color:#c8a030;letter-spacing:2px;line-height:1;white-space:nowrap}
.T-sb-snap{font-family:'Teko';font-weight:700;font-size:22px;color:#e8e6ff;margin-top:2px;line-height:1;text-shadow:0 0 4px rgba(255,255,255,.2)}
.T-sb-countdown{font-family:'Teko';font-size:18px;color:#554f80;margin-top:2px;line-height:1}
.T-sb-countdown-live{font-size:24px;color:#e03050;text-shadow:0 0 10px rgba(224,48,80,.5);background:rgba(224,48,80,.1);padding:2px 8px;border-radius:4px}
/* situation bar — always one line, never wraps */
.T-sb-sit{display:flex;align-items:center;justify-content:center;padding:4px 8px;background:rgba(0,0,0,.4);border-top:1px solid rgba(255,255,255,.04);gap:6px;white-space:nowrap;overflow:hidden}
.T-sb-sit-down{font-family:'Rajdhani';font-size:10px;color:#FF6B00;letter-spacing:.5px;flex-shrink:0}
.T-sb-sit-div{width:1px;height:14px;background:rgba(255,255,255,.12);flex-shrink:0}
.T-sb-sit-ball{font-family:'Rajdhani';font-size:10px;color:#e8e6ff;opacity:.7;letter-spacing:.5px;flex-shrink:1;overflow:hidden;text-overflow:ellipsis}
.T-sb-sit-torch{font-family:'Rajdhani';font-size:12px;color:#c8a030;letter-spacing:.5px;transition:transform .08s,text-shadow .08s;flex-shrink:0}

/* TORCH points banner */
.T-torch-banner{display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 16px;background:linear-gradient(90deg,rgba(235,176,16,0.12) 0%,rgba(255,69,17,0.12) 100%);border-top:2px solid #EBB010;border-bottom:2px solid #EBB010;flex-shrink:0}
.T-torch-banner-flame{width:20px;height:20px;animation:T-flame-pulse 1.5s ease-in-out infinite}
@keyframes T-flame-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.85}}
.T-torch-banner-label{font-family:'Teko';font-weight:700;font-size:28px;color:#EBB010;letter-spacing:3px;line-height:1}
.T-torch-banner-pts{font-family:'Teko';font-weight:700;font-size:32px;color:#fff;text-shadow:0 0 12px #EBB010;line-height:1;transition:transform .3s}

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
.T-drive-stat{font-family:'Rajdhani';font-size:11px;font-weight:600;color:#fff}
.T-drive-comm{margin-top:8px;font-family:'Rajdhani';font-size:16px;font-weight:700;color:#e8e6ff;line-height:1.3;letter-spacing:.3px}
.T-drive-comm-sub{font-family:'Rajdhani';font-size:13px;color:#C4A265;line-height:1.2;margin-top:2px}
.T-drive-idle{font-family:'Rajdhani';font-size:11px;color:#444;letter-spacing:.5px;margin-top:8px}

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
.T-2btn{flex:1;padding:10px;font-family:'Rajdhani';font-size:7px;cursor:pointer;text-align:center;background:none;letter-spacing:.5px;text-transform:uppercase;border:4px solid}
.T-2btn:active{transform:translate(3px,3px)}
.T-spike{color:#FF6B00;border-color:#FF6B00;box-shadow:4px 4px 0 #803500,6px 6px 0 #000}
.T-kneel{color:#554f80;border-color:#554f80;box-shadow:4px 4px 0 #2a2840,6px 6px 0 #000}

/* play-by-play terminal */
/* Commentary — broadcast booth ticker */
.T-narr{flex:1 1 auto;min-height:70px;max-height:120px;background:rgba(10,8,4,0.85);border-top:2px solid #FF6B00;overflow-y:auto;padding:8px 12px}
.T-pbp{display:flex;flex-direction:column;gap:4px}
.T-pbp-line{font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#fff;line-height:1.3;letter-spacing:.3px}
.T-pbp-live{color:#fff}
.T-pbp-sub{font-family:'Rajdhani';font-size:13px;color:#C4A265;line-height:1.2}
.T-pbp-result{font-family:'Rajdhani';font-size:12px;letter-spacing:.5px;line-height:1;margin-top:6px;white-space:nowrap;overflow:hidden}
.T-pbp-down{font-family:'Rajdhani';font-size:10px;color:#FF6B00;margin-top:4px;letter-spacing:.5px;line-height:1;white-space:nowrap;overflow:hidden}
.T-pbp-idle{font-family:'Rajdhani',sans-serif;font-size:11px;color:#444;letter-spacing:.5px}
/* torch points fly animation */
.T-torch-fly{position:fixed;z-index:9999;font-family:'Rajdhani';font-size:12px;color:#c8a030;pointer-events:none;text-shadow:0 0 8px rgba(200,160,48,.5)}
@keyframes T-flyup{0%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(.6)}}
.T-pbp-cursor{display:inline-block;width:6px;height:12px;background:#FF6B00;margin-left:2px;animation:T-blink .6s step-end infinite}

/* celebrations */
@keyframes T-shake{0%,100%{transform:translateX(0)}10%{transform:translateX(-6px)}20%{transform:translateX(6px)}30%{transform:translateX(-4px)}40%{transform:translateX(4px)}50%{transform:translateX(-2px)}60%{transform:translateX(2px)}}
@keyframes T-td-confetti{0%{transform:translateY(0) rotate(0);opacity:0.9}20%{opacity:1}100%{transform:translateY(105vh) rotate(720deg);opacity:0}}
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

/* Card Clash / Reveal Animation */
@keyframes T-clash-slideL{0%{transform:translateX(-120%) scale(0.8)}100%{transform:translateX(0) scale(1)}}
@keyframes T-clash-slideR{0%{transform:translateX(120%) scale(0.8)}100%{transform:translateX(0) scale(1)}}
@keyframes T-clash-flip{0%{transform:rotateY(180deg)}100%{transform:rotateY(0deg)}}
@keyframes T-clash-shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(8px)}45%{transform:translateX(-5px)}60%{transform:translateX(5px)}75%{transform:translateX(-2px)}}
@keyframes T-clash-flash{0%{opacity:0.6}100%{opacity:0}}
@keyframes T-clash-yds{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.2);opacity:1}75%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}
@keyframes T-clash-spark{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--sx),var(--sy)) scale(0)}}
@keyframes T-clash-settle{0%{transform:scale(1.15)}40%{transform:scale(0.95)}100%{transform:scale(1)}}
/* Card deal: slide in face-down then flip to face-up */
@keyframes T-deal-slide{0%{transform:translateX(100px);opacity:0}100%{transform:translateX(0);opacity:1}}
@keyframes T-deal-flip{0%{transform:rotateY(180deg)}100%{transform:rotateY(0deg)}}
.T-card-deal{perspective:600px}
.T-card-deal .T-card-back{position:absolute;inset:0;z-index:2;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px}
.T-card-deal .T-card-face{width:100%;height:100%}
@keyframes T-clash-glow{0%,100%{box-shadow:0 0 8px currentColor}50%{box-shadow:0 0 20px currentColor}}
.T-clash-overlay{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:auto}
.T-clash-dim{position:absolute;inset:0;background:rgba(6,4,2,0.85);transition:opacity 0.3s}
.T-clash-cards{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:12px;perspective:800px}
.T-clash-card-wrap{border-radius:8px;overflow:hidden;transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s,box-shadow 0.3s;transform-style:preserve-3d}
.T-clash-card-off{background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.2);padding:10px 12px;text-align:center;min-width:80px}
.T-clash-card-def{background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.2);padding:10px 12px;text-align:center;min-width:80px}
.T-clash-result{position:relative;z-index:3;display:flex;flex-direction:column;align-items:center;gap:4px;margin-top:20px}
.T-clash-yds{font-family:'Teko';font-weight:700;font-size:64px;line-height:1;text-shadow:0 0 24px currentColor;animation:T-clash-yds 0.6s cubic-bezier(0.22,1.3,0.36,1) both}
.T-clash-label{font-family:'Rajdhani';font-weight:700;font-size:14px;letter-spacing:1px;opacity:0.8}
.T-clash-flash{position:absolute;inset:0;z-index:4;pointer-events:none;animation:T-clash-flash 0.3s ease-out forwards}
`;

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
function mqColor(q) { return q === 'green' ? '#3df58a' : q === 'red' ? '#e03050' : '#c8a030'; }
function typeColor(t) {
  return { SHORT:'#3df58a',QUICK:'#EBB010',DEEP:'#e03050',RUN:'#e07020',SCREEN:'#e060a0',
    OPTION:'#e07020',BLITZ:'#e03050',ZONE:'#3df58a',PRESSURE:'#EBB010',HYBRID:'#FF6B00' }[t] || '#aaa';
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
    num: p.num || '', tier: tier, badge: p.badge, isStar: p.isStar,
    ability: p.ability || '',
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
  var cat = {SHORT:'SHORT',QUICK:'QUICK',DEEP:'DEEP',RUN:'RUN',SCREEN:'SCREEN',OPTION:'OPTION',
    BLITZ:'BLITZ',ZONE:'ZONE',PRESSURE:'PRESSURE',HYBRID:'HYBRID'}[play.playType||play.cardType] || 'RUN';
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
      humanTeam: hAbbr, difficulty: GS.difficulty||'EASY', coachBadge: GS.coachBadge||'SCHEMER',
      // Human = CT slot, Opponent = IR slot
      ctOffHand: hOffPlays.slice(0,4), ctDefHand: hDefPlays.slice(0,4),
      irOffHand: cOffPlays.slice(0,4), irDefHand: cDefPlays.slice(0,4),
      ctOffRoster: hOR, ctDefRoster: hDR,
      irOffRoster: cOffRoster, irDefRoster: cDefRoster,
      initialPossession: GS.humanReceives ? hAbbr : 'IR',
    });
  }
  const gs = GS.engine;

  // ui state
  let selP = null, selPl = null, selTorch = null;
  let phase = 'play'; // play | player | torch | ready | busy
  let driveSnaps = [];
  let prev2min = gs.twoMinActive;
  var snapCount = 0; // Track snap number for teach tooltips
  var twoMinTimer = null; // Real-time clock interval for 2-minute drill

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
      // Heartbeat below 15 seconds
      if (gs.clockSeconds <= 15 && gs.clockSeconds > 0) SND.click();
      // Time expired
      if (gs.clockSeconds <= 0) {
        stop2MinClock();
        checkEnd();
      }
    }, 1000);
  }
  function stop2MinClock() {
    if (twoMinTimer) { clearInterval(twoMinTimer); twoMinTimer = null; }
  }

  // Progressive disclosure
  var isFirstGame = false; // tutorial system disabled — will be rebuilt
  var isFirstSeason = GS.isFirstSeason;

  // Game Day Conditions (v0.21)
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
    const ballLabel = ydsToEz === 50 ? '50' : ydsToEz < 50 ? 'OPP ' + ydsToEz : 'OWN ' + (100-ydsToEz);

    // TORCH points for human
    const hTorch = hAbbr === 'CT' ? s.ctTorchPts : s.irTorchPts;

    // Center: half label + snap counter + clock
    const halfName = s.twoMinActive ? '2-MINUTE DRILL' : (s.half === 1 ? 'FIRST HALF' : 'SECOND HALF');
    const halfColor = s.twoMinActive ? 'color:#e03050' : '';
    const clockText = fmtClock(Math.max(0, s.clockSeconds));
    const clockClass = s.twoMinActive ? 'T-sb-countdown T-sb-countdown-live' : 'T-sb-countdown';
    let centerHTML =
      `<div class="T-sb-half" style="${halfColor}">${halfName}</div>` +
      (s.twoMinActive ? '' : `<div class="T-sb-snap">${s.playsUsed}/20</div>`) +
      `<div class="${clockClass}">${clockText}</div>`;

    // Possession arrow
    const ctArrow = ctHasBall ? '<span class="T-sb-pos-arrow T-sb-pos-arrow-l">\u25B6</span>' : '';
    const irArrow = !ctHasBall ? '<span class="T-sb-pos-arrow T-sb-pos-arrow-r">\u25C0</span>' : '';

    // TORCH points
    const hTorchHTML = `<span class="T-sb-sit-torch">T ${hTorch}</span>`;
    const isHumanCT = hAbbr === 'CT';

    // Team badges (44px)
    var ctBadge = renderTeamBadge(GS.team, 44);
    var irBadge = renderTeamBadge(GS.opponent, 44);

    bug.innerHTML =
      `<div class="T-sb-row">` +
        `<div class="T-sb-icon">${ctBadge}</div>` +
        `<div class="T-sb-side${ctHasBall ? ' T-sb-side-glow' : ''}">` +
          `<div class="T-sb-name" style="color:${ct.accent};font-size:${ct.name.length > 8 ? 14 : ct.name.length > 5 ? 17 : 20}px${ctHasBall ? ';text-shadow:0 0 12px '+ct.accent : ''}">${ct.name}</div>` +
          `<div class="T-sb-score-row">${ctArrow}<span class="T-sb-pts${ctHasBall ? ' T-sb-pts-glow' : ''}">${s.ctScore}</span></div>` +
        `</div>` +
        `<div class="T-sb-center">${centerHTML}</div>` +
        `<div class="T-sb-side${!ctHasBall ? ' T-sb-side-glow' : ''}">` +
          `<div class="T-sb-name" style="color:${ir.accent};font-size:${ir.name.length > 8 ? 14 : ir.name.length > 5 ? 17 : 20}px${!ctHasBall ? ';text-shadow:0 0 12px '+ir.accent : ''}">${ir.name}</div>` +
          `<div class="T-sb-score-row">${irArrow}<span class="T-sb-pts${!ctHasBall ? ' T-sb-pts-glow' : ''}">${s.irScore}</span></div>` +
        `</div>` +
        `<div class="T-sb-icon">${irBadge}</div>` +
      `</div>` +
      `<div class="T-sb-sit">` +
        `<div class="T-sb-sit-down" style="font-family:'Teko';font-size:16px;font-weight:700;color:#FF6B00;letter-spacing:1px">${dn} & ${conversionMode ? 'GOAL' : distLabel(s.distance, s.yardsToEndzone)}</div>` +
        `<div class="T-sb-sit-div"></div>` +
        `<div class="T-sb-sit-ball" style="font-family:'Teko';font-size:15px;font-weight:700;color:#e8e6ff;opacity:1;letter-spacing:1px">BALL ON <span style="color:${possTeam.accent}">${ballLabel}</span></div>` +
      `</div>`;
    drawTorchBanner();
  }

  // ── TORCH POINTS BANNER ──
  const torchBanner = document.createElement('div'); torchBanner.className = 'T-torch-banner'; el.appendChild(torchBanner);
  var torchBannerPtsEl = null;
  var _torchDisplayFrozen = false;  // true while waiting for points animation
  var _torchFrozenValue = 0;
  function drawTorchBanner() {
    var hTorch = hAbbr === 'CT' ? gs.getSummary().ctTorchPts : gs.getSummary().irTorchPts;
    var displayVal = _torchDisplayFrozen ? _torchFrozenValue : hTorch;
    // If frozen or animating, just update the number — don't rebuild DOM (preserves animation elements)
    if (torchBannerPtsEl && _torchDisplayFrozen) {
      torchBannerPtsEl.textContent = displayVal;
      return;
    }
    var flameSvg = '<svg class="T-torch-banner-flame" viewBox="0 0 44 44" fill="none"><defs><linearGradient id="tbf" x1="22" y1="40" x2="22" y2="0"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="#EBB010"/></linearGradient></defs><path d="M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z" fill="url(#tbf)"/></svg>';
    var cardCount = torchInventory.length;
    var countBadge = cardCount > 0 ? '<span style="font-family:\'Rajdhani\';font-size:11px;color:#EBB010;opacity:0.7;margin-left:4px;">(' + cardCount + ')</span>' : '';
    torchBanner.innerHTML = flameSvg +
      '<div class="T-torch-banner-label">TORCH</div>' +
      '<div class="T-torch-banner-pts">' + displayVal + countBadge + '</div>';
    torchBannerPtsEl = torchBanner.querySelector('.T-torch-banner-pts');
  }
  drawTorchBanner();

  // Tap torch banner to view inventory
  torchBanner.style.cursor = 'pointer';
  torchBanner.onclick = function() {
    if (torchInventory.length === 0) return;
    var trayOv = document.createElement('div');
    trayOv.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:auto;';
    var trayBd = document.createElement('div');
    trayBd.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.5);';
    trayBd.onclick = function() { trayOv.remove(); };
    trayOv.appendChild(trayBd);
    var tray = document.createElement('div');
    tray.style.cssText = 'position:relative;z-index:1;background:#141008;border-top:2px solid #EBB010;border-radius:12px 12px 0 0;padding:14px 12px 20px;';
    var hTorch = hAbbr === 'CT' ? gs.getSummary().ctTorchPts : gs.getSummary().irTorchPts;
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
  };

  // Balatro-style TORCH points animation
  var _torchAnimating = false;
  function animateTorchBannerPts(earned) {
    if (!torchBannerPtsEl || _torchAnimating) return;
    _torchAnimating = true;
    var hTorch = hAbbr === 'CT' ? gs.getSummary().ctTorchPts : gs.getSummary().irTorchPts;
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

  // ── DRIVE SUMMARY PANEL (replaces old play-by-play booth) ──
  const driveSummaryEl = document.createElement('div'); driveSummaryEl.className = 'T-drive'; el.appendChild(driveSummaryEl);

  // Keep narr as a virtual container for backward compat — content mirrored into drive summary commentary
  const narr = document.createElement('div'); narr.className = 'T-narr'; narr.style.display = 'none';
  el.appendChild(narr);

  function setNarr(a, b) {
    driveCommLine1 = a || '';
    driveCommLine2 = b || '';
    // Also update narr for backward compat (used in play-by-play narration path)
    narr.innerHTML = '<div class="T-pbp"><div class="T-pbp-line T-pbp-live">' + a + '</div>' +
      (b ? '<div class="T-pbp-sub">' + b + '</div>' : '') + '</div>';
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
      '<div class="T-drive-hdr-r" style="font-family:\'Teko\';font-size:16px;font-weight:700"><span>' + totalPlays + '</span> plays \u00b7 <span>' + totalYds + '</span> yds \u00b7 <span>' + driveFirstDowns + '</span> 1st dn</div>' +
      '</div>';

    // Play-by-play ticker rows (newest first)
    // Drive log — show last 4 plays full, compress older ones
    if (driveSummaryLog.length > 0) {
      var logLen = driveSummaryLog.length;
      var showFull = Math.min(4, logLen); // last 4 full
      var compressed = logLen - showFull;

      // Compressed older plays on one line
      if (compressed > 0) {
        var compParts = [];
        for (var _ci = 0; _ci < compressed; _ci++) {
          var ce = driveSummaryLog[_ci];
          var cy = ce.isTD ? 'TD' : ce.isSack ? 'SK' : ce.isInt ? 'INT' : ce.isFumble ? 'FUM' : ce.isInc ? 'INC' : (ce.yards >= 0 ? '+' : '') + ce.yards;
          compParts.push(cy);
        }
        html += '<div style="font-family:\'Rajdhani\';font-size:10px;color:#555;padding:2px 0;border-bottom:1px solid #1a1a1a;">' + compParts.join(' | ') + '</div>';
      }

      // Full entries (newest first within the visible window)
      for (var _ti = logLen - 1; _ti >= compressed; _ti--) {
        var e = driveSummaryLog[_ti];
        var isNewest = _ti === logLen - 1;
        var resColor, resText;
        if (e.isUserOff || e.isUserOff === undefined) {
          resColor = e.isTD ? '#EBB010' : e.yards > 0 ? '#00ff44' : e.yards < 0 || e.isSack ? '#ff0040' : '#fff';
          resText = e.isTD ? 'TD' : e.isSack ? 'SACK' : e.isInt ? 'INT' : e.isFumble ? 'FUM' : (e.isInc || e.yards === 0) ? 'NO GAIN' : (e.yards >= 0 ? '+' : '') + e.yards;
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
        var rowBg = isNewest ? 'background:' + resColor + '0d;' : '';
        var rowStyle = isNewest
          ? 'opacity:1;border-left:3px solid #FF6B00;padding-left:6px;' + rowBg + 'animation:T-clash-yds 0.3s ease-out;'
          : 'opacity:0.5';
        var playFs = isNewest ? 'font-size:13px;font-weight:700;' : '';
        html += '<div class="T-drive-row" style="' + rowStyle + '">' +
          '<div class="T-drive-row-dd" style="color:#999;font-size:13px;font-weight:700">' + dn + ' & ' + e.dist + '</div>' +
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
    if (offPA > 0) offParts.push((offQB || 'QB') + ' ' + offPC + '/' + offPA + ', ' + offPY + 'y');
    if (offRC > 0) offParts.push((offWR || 'WR') + ' ' + offRC + 'rec ' + offRCY + 'y');
    else if (offRA > 0) offParts.push((offRB || 'RB') + ' ' + offRA + 'car ' + offRY + 'y');

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
        if (bestDef.tkl > 0) dp.push(bestDef.tkl + 'tkl');
        if (bestDef.pbu > 0) dp.push(bestDef.pbu + 'PBU');
        if (bestDef.int > 0) dp.push(bestDef.int + 'INT');
        if (bestDef.sack > 0) dp.push(bestDef.sack + 'sck');
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
      html += '<div class="T-drive-comm">' + driveCommLine1 + '</div>';
      if (driveCommLine2) html += '<div class="T-drive-comm-sub">' + driveCommLine2 + '</div>';
    } else {
      html += '<div class="T-drive-idle">Awaiting snap</div>';
    }

    driveSummaryEl.innerHTML = html;
    driveSummaryEl.scrollTop = driveSummaryEl.scrollHeight;
  }
  drawDriveSummary();

  function distLabel(dist, ydsToEz) {
    var yz = ydsToEz !== undefined ? ydsToEz : gs.getSummary().yardsToEndzone;
    if (yz <= dist) return 'GOAL';
    // Cap distance display at 10 on 1st down (safety clamp)
    var s = gs.getSummary();
    if (s.down === 1 && dist > 10) dist = Math.min(10, yz);
    return dist;
  }

  function ballSideLabel() {
    const s = gs.getSummary();
    const yds = s.yardsToEndzone;
    if (yds <= 50) return 'OPP ' + yds;
    return 'OWN ' + (100 - yds);
  }

  function showClashOnField(res) {
    SND.hit();
    var clash = document.createElement('div'); clash.className = 'T-clash';
    var isUserOnOff = (res._preSnap ? res._preSnap.possession === hAbbr : gs.possession === hAbbr);

    // Build a compact card element matching the game's card style
    function clashCard(name, sub, color, faceUp) {
      var card = document.createElement('div');
      card.style.cssText = 'flex:1;max-width:42%;border-radius:8px;overflow:hidden;border:2px solid ' + color + ';background:#0A0804;padding:8px 10px;transition:transform 0.4s;';
      if (!faceUp) {
        // Face-down card — colored back, flips after 400ms
        card.style.background = 'radial-gradient(ellipse at 50% 40%,' + color + '44,' + color + '11)';
        card.innerHTML = "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:10px;color:" + color + ";letter-spacing:1px;text-align:center;opacity:0.5;\">?</div>";
        setTimeout(function() {
          card.style.transform = 'rotateY(90deg)';
          setTimeout(function() {
            card.style.background = '#0A0804';
            card.innerHTML = "<div style=\"font-family:'Teko';font-size:16px;font-weight:700;color:#fff;line-height:1.1;\">" + name + "</div>" +
              "<div style=\"font-family:'Rajdhani';font-size:10px;font-weight:700;color:" + color + ";margin-top:2px;letter-spacing:0.5px;\">" + sub + "</div>";
            card.style.transform = 'rotateY(0)';
          }, 200);
        }, 400);
      } else {
        card.innerHTML = "<div style=\"font-family:'Teko';font-size:16px;font-weight:700;color:#fff;line-height:1.1;\">" + name + "</div>" +
          "<div style=\"font-family:'Rajdhani';font-size:10px;font-weight:700;color:" + color + ";margin-top:2px;letter-spacing:0.5px;\">" + sub + "</div>";
      }
      return card;
    }

    // User's card (always face-up) on left, AI's card (flips) on right
    var userPlayName = isUserOnOff ? res.offPlay.name : res.defPlay.name;
    var userPlaySub = isUserOnOff ? (res.offPlay.playType || '') : (res.defPlay.cardType || '');
    var userColor = hTeam.accent || '#EBB010';
    var aiPlayName = isUserOnOff ? res.defPlay.name : res.offPlay.name;
    var aiPlaySub = isUserOnOff ? (res.defPlay.cardType || '') : (res.offPlay.playType || '');
    var aiColor = oTeam.accent || '#e03050';

    var userCard = clashCard(userPlayName, userPlaySub, userColor, true);
    var vsEl = document.createElement('div');
    vsEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:16px;color:#555;display:flex;align-items:center;padding:0 6px;";
    vsEl.textContent = 'VS';
    var aiCard = clashCard(aiPlayName, aiPlaySub, aiColor, false);

    clash.style.cssText += 'display:flex;align-items:stretch;gap:0;padding:4px 8px;';
    clash.append(userCard, vsEl, aiCard);
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
        slamText('DENIED', '#FF6B00', tDuration - 400);
      }
    }
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
    renderPBPLines(buildTemplateLines(), res, onDone);

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

      // User-biased colors: green = good for user, red = bad for user
      var resColor, yardLabel;
      if (!isUserDef) {
        // User on offense
        resColor = r.isTouchdown?'#3df58a' : r.isSack||r.isInterception||r.isFumbleLost?'#e03050' : r.yards>=8?'#3df58a' : r.yards>=1?'#c8a030' : '#554f80';
        yardLabel = r.isTouchdown?'TOUCHDOWN' : r.isSack?'SACK' : r.isInterception?'INTERCEPTED' : r.isFumbleLost?'FUMBLE LOST' : r.isIncomplete?'INCOMPLETE' : (r.yards>=0?'+':'')+r.yards+' YDS';
      } else {
        // User on defense — stops are green, opponent gains are red
        if (r.isTouchdown) { resColor = '#e03050'; yardLabel = 'TOUCHDOWN'; }
        else if (r.isSack) { resColor = '#3df58a'; yardLabel = Math.abs(r.yards) > 0 ? 'SACKED! -' + Math.abs(r.yards) : 'SACKED! NO GAIN'; }
        else if (r.isInterception) { resColor = '#3df58a'; yardLabel = 'PICKED OFF!'; }
        else if (r.isFumbleLost) { resColor = '#3df58a'; yardLabel = 'FUMBLE!'; }
        else if (r.isIncomplete) { resColor = '#3df58a'; yardLabel = 'INCOMPLETE'; }
        else if (r.yards <= 0) { resColor = '#3df58a'; yardLabel = r.yards < 0 ? 'STUFFED! ' + r.yards + ' YDS' : 'STUFFED! NO GAIN'; }
        else if (r.yards <= 3) { resColor = '#c8a030'; yardLabel = 'GAINED ' + r.yards + ' YDS'; }
        else { resColor = '#e03050'; yardLabel = 'GAINED ' + r.yards + ' YDS'; }
      }
      // TORCH points for the USER's team only
      const userOnOff = (gs.possession === hAbbr) ? true : false; // was user on offense for this snap?
      // Note: possession may have flipped on turnovers, so check what it was BEFORE the snap
      // TORCH points (already computed in doSnap as res._torchSources / res._torchEarned)
      var torchEarned = res._torchEarned || 0;

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
            else if (r.yards >= 8 || r.isTouchdown) thinkLine.style.color = '#EBB010';
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
            narr.innerHTML = '<div class="T-pbp-idle">Awaiting snap<span class="T-pbp-cursor"></span></div>';
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

    // 2min check
    if (gs.twoMinActive && !prev2min) { prev2min = true; el.classList.add('T-urgent'); show2MinWarn(); start2MinClock(); }

    // Side indicator + instruction
    if (phase === 'play' || phase === 'player' || phase === 'torch') {
      var sideBar = document.createElement('div');
      var sideColor = hTeam.accent || '#FF6B00';
      sideBar.style.cssText = "text-align:center;padding:3px 0 1px;font-family:'Teko';font-weight:700;font-size:18px;letter-spacing:3px;flex-shrink:0;color:" + sideColor + ";background:linear-gradient(90deg,transparent,rgba(255,107,0,.06),transparent);";
      sideBar.textContent = hTeam.name + (isOff ? ' OFFENSE' : ' DEFENSE');
      panel.appendChild(sideBar);
    }
    const inst = document.createElement('div'); inst.className = 'T-inst';
    if (phase === 'torch') { inst.textContent = 'TORCH CARD \u2014 Play one or skip'; inst.style.color = '#EBB010'; }
    else inst.textContent = '';
    panel.appendChild(inst);

    // Card tray — show one card type at a time based on phase
    const tray = document.createElement('div'); tray.className = 'T-tray';

    if (phase === 'play') {
      plays.forEach((play, playIdx) => {
        const isSel = selPl === play;
        // Adapt game data to shared buildPlayV1 format
        var cat = {SHORT:'SHORT',QUICK:'QUICK',DEEP:'DEEP',RUN:'RUN',SCREEN:'SCREEN',OPTION:'OPTION',
          BLITZ:'BLITZ',ZONE:'ZONE',PRESSURE:'PRESSURE',HYBRID:'HYBRID'}[play.playType||play.cardType] || 'RUN';
        var isOffPlay = ['SHORT','QUICK','DEEP','RUN','SCREEN','OPTION'].indexOf(cat) >= 0;
        // Use the shared buildPlayV1 builder with type-colored design
        var playCard = buildPlayV1({
          name: play.name,
          playType: cat,
          isRun: play.isRun === true || play.type === 'run',
          desc: play.desc || play.flavor || '',
          risk: play.risk || getRisk(play.id),
          cat: cat
        }, 80, 150);
        // Wrap in T-card with card back → flip → face-up deal animation
        const c = document.createElement('div');
        c.className = 'T-card T-card-deal' + (isSel ? ' T-card-sel T-card-gone' : '');
        c.style.cssText += 'transform-style:preserve-3d;';

        // Card back (face-down) — simple colored back matching mockup
        var cardBack = document.createElement('div');
        cardBack.className = 'T-card-back';
        var cbColor = isOffPlay ? '#96CC50' : '#6AAAEE';
        var cbEdge = isOffPlay ? '#4A6A20' : '#385890';
        var cbLabel = isOffPlay ? 'OFFENSE' : 'DEFENSE';
        cardBack.style.cssText += 'background:radial-gradient(ellipse at 50% 40%,' + cbColor + ',' + cbEdge + ');border:2px solid ' + (isOffPlay ? '#7ACC00' : '#4DA6FF') + ';';
        cardBack.innerHTML = "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#000;letter-spacing:1px;opacity:0.7;\">" + cbLabel + "</div>";
        c.appendChild(cardBack);

        // Card face (hidden until flip)
        var faceWrap = document.createElement('div');
        faceWrap.className = 'T-card-face';
        playCard.style.width = '100%';
        playCard.style.height = '100%';
        faceWrap.appendChild(playCard);
        c.appendChild(faceWrap);

        // Slide in, then flip after delay
        var slideDelay = playIdx * 120; // 120ms stagger (slower)
        var flipDelay = slideDelay + 400; // flip 400ms after slide lands
        c.style.animation = 'T-deal-slide 0.5s ease-out ' + slideDelay + 'ms both';
        setTimeout(function() {
          // Flip: hide back, show face
          if (cardBack.parentNode) cardBack.style.display = 'none';
          faceWrap.style.transform = 'rotateY(0deg)';
          faceWrap.style.animation = 'T-deal-flip 0.3s ease-in-out both';
          SND.cardSnap();
        }, flipDelay);

        c.onclick = () => { if (phase==='busy') return; SND.select(); selPl = play; phase = 'player'; drawField(); drawPanel(); };
        c.onmousedown = function(e) { startDrag('play', play, c, e); };
        c.ontouchstart = function(e) { startDrag('play', play, c, e); };
        tray.appendChild(c);
      });
    } else if (phase === 'player') {
      // Compute synergy for each player with the selected play
      var bestBonus = 0;
      var synergies = players.map(function(p) {
        if (!selPl || !p.badge) return { bonus: 0, label: '' };
        // Check badge combo: if player badge matches play type, bonus
        var playType = selPl.playType || '';
        var badge = p.badge || '';
        var bonus = 0; var label = '';
        // Simple synergy: badge matches play archetype
        if (badge === 'HELMET' && (playType === 'RUN')) { bonus = 3; label = 'RUN BOOST'; }
        else if (badge === 'ROCKET' && (playType === 'DEEP')) { bonus = 5; label = 'DEEP THREAT'; }
        else if (badge === 'MAGNET' && (playType === 'SHORT' || playType === 'QUICK')) { bonus = 3; label = 'SURE HANDS'; }
        else if (badge === 'SHIELD' && !isOff) { bonus = 3; label = 'LOCKDOWN'; }
        else if (badge === 'LIGHTNING' && (playType === 'SCREEN')) { bonus = 4; label = 'SPEED MATCH'; }
        else if (p.isStar) { bonus = 2; label = 'STAR'; }
        if (bonus > bestBonus) bestBonus = bonus;
        return { bonus: bonus, label: label };
      });

      players.forEach((p, pIdx) => {
        const isSel = selP === p;
        var isHot = (isOff && offStar && p.id === offStar.id && offStarHot) ||
                    (!isOff && defStar && p.id === defStar.id && defStarHot);
        var syn = synergies[pIdx];
        var isBestPick = syn.bonus > 0 && syn.bonus === bestBonus;
        var playerCard = buildMaddenPlayer({
          name: p.name, pos: p.pos, ovr: p.ovr,
          num: p.num || '', badge: p.badge, isStar: p.isStar,
          ability: p.ability || '',
          teamColor: hTeam.colors ? hTeam.colors.primary : (hTeam.accent || '#FF4511'),
          teamId: GS.team
        }, 80, 150);
        // Wrap in T-card with card back → flip deal animation
        const c = document.createElement('div');
        c.className = 'T-card T-card-deal' + (isSel ? ' T-card-sel T-card-gone' : '') + (p.injured ? ' T-card-hurt' : '');
        c.style.cssText += 'transform-style:preserve-3d;';

        // Card back — simple colored back
        var pBack = document.createElement('div');
        pBack.className = 'T-card-back';
        var pbColor = isOff ? '#96CC50' : '#6AAAEE';
        var pbEdge = isOff ? '#4A6A20' : '#385890';
        var pbLabel = isOff ? 'OFFENSE' : 'DEFENSE';
        pBack.style.cssText += 'background:radial-gradient(ellipse at 50% 40%,' + pbColor + ',' + pbEdge + ');border:2px solid ' + (isOff ? '#7ACC00' : '#4DA6FF') + ';';
        pBack.innerHTML = "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#000;letter-spacing:1px;opacity:0.7;\">" + pbLabel + "</div>";
        c.appendChild(pBack);

        // Card face
        var pFace = document.createElement('div');
        pFace.className = 'T-card-face';
        // Star Heat Check: flame border when On Fire
        if (isHot) {
          c.style.cssText += 'border:2px solid #FF4511 !important;box-shadow:0 0 12px rgba(255,69,17,0.5),0 0 24px rgba(255,69,17,0.2) !important;';
        }
        playerCard.style.width = '100%';
        playerCard.style.height = '100%';
        pFace.appendChild(playerCard);

        // Synergy indicator overlay
        if (syn.bonus > 0) {
          var synEl = document.createElement('div');
          var synColor = isBestPick ? '#EBB010' : '#3df58a';
          synEl.style.cssText = "position:absolute;bottom:2px;left:0;right:0;text-align:center;font-family:'Teko';font-weight:700;font-size:10px;color:" + synColor + ";letter-spacing:1px;z-index:5;text-shadow:0 0 6px rgba(0,0,0,0.8);";
          synEl.textContent = '+' + syn.bonus + ' ' + syn.label;
          pFace.appendChild(synEl);
          if (isBestPick) c.style.boxShadow = '0 0 8px ' + synColor + '44';
        } else if (selPl && bestBonus > 0) {
          // Other players with no synergy — dim slightly
          var noSynEl = document.createElement('div');
          noSynEl.style.cssText = "position:absolute;bottom:2px;left:0;right:0;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:7px;color:#555;letter-spacing:1px;z-index:5;";
          noSynEl.textContent = 'NO BONUS';
          pFace.appendChild(noSynEl);
        }

        c.appendChild(pFace);

        // Slide in then flip
        var pSlideDelay = pIdx * 120;
        var pFlipDelay = pSlideDelay + 400;
        c.style.animation = 'T-deal-slide 0.5s ease-out ' + pSlideDelay + 'ms both';
        setTimeout(function() {
          if (pBack.parentNode) pBack.style.display = 'none';
          pFace.style.transform = 'rotateY(0deg)';
          pFace.style.animation = 'T-deal-flip 0.3s ease-in-out both';
          SND.cardSnap();
        }, pFlipDelay);

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
      // Show TORCH cards — max 3 cards + skip = 4 slots (same as play/player)
      // Filter torch cards: offensive cards (amplification/information) on offense, defensive cards (disruption/protection) on defense
      var offCategories = ['amplification', 'information'];
      var defCategories = ['disruption', 'protection'];
      var applicableCategories = isOff ? offCategories : defCategories;
      var preSnapCards = torchInventory.filter(function(c) { return c.type === 'pre-snap'; }).slice(0, 3);
      if (preSnapCards.length === 0) {
        phase = 'ready';
        drawField(); drawPanel();
        return;
      }
      preSnapCards.forEach(function(tc) {
        var isApplicable = applicableCategories.indexOf(tc.category) >= 0;
        var c = document.createElement('div');
        c.className = 'T-card';
        if (!isApplicable) c.style.opacity = '0.35';
        var tcEl = buildTorchCard(tc, null, 150);
        tcEl.style.width = '100%';
        tcEl.style.height = '100%';
        c.appendChild(tcEl);
        // Show "OFFENSE ONLY" / "DEFENSE ONLY" label if not applicable
        if (!isApplicable) {
          var sideLabel = document.createElement('div');
          sideLabel.style.cssText = "position:absolute;bottom:4px;left:0;right:0;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:8px;color:#ff4444;letter-spacing:1px;z-index:5;";
          sideLabel.textContent = isOff ? 'DEF ONLY' : 'OFF ONLY';
          c.appendChild(sideLabel);
        }
        if (isApplicable) {
          c.onclick = function() {
            SND.click();
            selTorch = tc.id;
            selectedPreSnap = tc;
            var idx = torchInventory.indexOf(tc);
            if (idx >= 0) torchInventory.splice(idx, 1);
            if (GS.season) GS.season.torchCards = torchInventory.slice();
            phase = 'ready';
            drawField(); drawPanel();
          };
          c.onmousedown = function(e) { startDrag('torch', tc, c, e); };
          c.ontouchstart = function(e) { startDrag('torch', tc, c, e); };
        }
        tray.appendChild(c);
      });
      // Skip button — always the 4th slot
      var skipBtn = document.createElement('div');
      skipBtn.className = 'T-card';
      skipBtn.style.cssText = 'border:2px dashed #554f8044;display:flex;align-items:center;justify-content:center;cursor:pointer;';
      skipBtn.innerHTML = "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#554f80;text-align:center;letter-spacing:1px;\">SKIP</div>";
      skipBtn.onclick = function() { SND.click(); selectedPreSnap = null; selTorch = null; phase = 'ready'; drawField(); drawPanel(); };
      tray.appendChild(skipBtn);
    }
    panel.appendChild(tray);

    // ── TEACH TOOLTIPS (first game only) ──

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
      go.style.cssText = 'background:linear-gradient(180deg,#EBB010,#FF4511);border-color:#FF4511;color:#000;font-size:16px;animation:T-pulse 1.8s ease-in-out infinite;';
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
    var offCard = isOff ? selTorch : null;
    var defCard = isOff ? null : selTorch;
    var playedPlay = selPl;

    // Torch card activation moment
    if (selectedPreSnap && selectedPreSnap.name) {
      var tcCard = selectedPreSnap;
      var tcTierCol = tcCard.tier === 'GOLD' ? '#EBB010' : tcCard.tier === 'SILVER' ? '#C0C0C0' : '#CD7F32';
      var tcOv = document.createElement('div');
      tcOv.style.cssText = 'position:fixed;inset:0;z-index:650;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,' + (tcCard.tier === 'GOLD' ? '0.6' : '0.3') + ');opacity:0;transition:opacity 0.15s;pointer-events:none;';
      tcOv.innerHTML =
        "<div style=\"font-family:'Teko';font-weight:700;font-size:24px;color:" + tcTierCol + ";letter-spacing:3px;text-shadow:0 0 16px " + tcTierCol + "60;\">" + tcCard.name + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-size:12px;color:#ccc;margin-top:4px;max-width:280px;text-align:center;\">" + tcCard.effect + "</div>";
      el.appendChild(tcOv);
      requestAnimationFrame(function() { tcOv.style.opacity = '1'; });
      setTimeout(function() { tcOv.style.opacity = '0'; setTimeout(function() { tcOv.remove(); }, 200); }, tcCard.tier === 'GOLD' ? 1200 : tcCard.tier === 'SILVER' ? 800 : 500);
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

    var preTorchPts = getTorchPoints();
    // Freeze the display counter at the pre-snap value until animation plays
    _torchFrozenValue = preTorchPts;
    _torchDisplayFrozen = true;
    const res = isOff ? gs.executeSnap(selPl, selP, null, null, offCard, defCard) : gs.executeSnap(null, null, selPl, selP, offCard, defCard);
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
    var defName = res.featuredDef ? res.featuredDef.name : '';
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
    driveSummaryLog.push({
      down: preSnap.down, dist: preSnap.distance,
      playName: espnDesc,
      yards: r.yards, isTD: r.isTouchdown, isSack: r.isSack,
      isInc: r.isIncomplete, isInt: r.isInterception, isFumble: r.isFumbleLost,
      isUserOff: isOff
    });
    if (res.gotFirstDown) driveFirstDowns++;

    var sides = gs.getCurrentSides();
    var teamId = GS.team;
    if (isOff) {
      cycleCard(playedPlay, sides.offHand, getOffCards(teamId), teamId);
    } else {
      cycleCard(playedPlay, sides.defHand, getDefCards(teamId), teamId);
    }
    selP = null; selPl = null; selTorch = null;
    drawField(); drawPanel();
    res._preSnap = preSnap;

    // Check star activation
    var wasOffHot = offStarHot, wasDefHot = defStarHot;
    checkStarActivation(res);

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

    // Tier-based timing
    var anticipationMs = tier === 1 ? 0 : tier === 2 ? 300 : 800;
    var hitstopMs = tier === 1 ? 33 : tier === 2 ? 67 : 133;
    var shakeAmt = tier === 1 ? 0 : tier === 2 ? 3 : 8;
    var dimLevel = tier === 1 ? 0.2 : tier === 2 ? 0.4 : 0.7;
    var particleCount = tier === 1 ? 8 : tier === 2 ? 30 : 80;
    var cardScale = tier === 1 ? 1.0 : tier === 2 ? 1.1 : 1.25;
    var aftermathDur = isTD ? 5000 : tier === 3 ? 3500 : tier === 2 ? 2500 : 1800;

    // User-biased result display
    var resultColor, resultText;
    if (isUserOff) {
      resultColor = isTD ? '#EBB010' : isGoodForUser ? '#3df58a' : isBadForUser ? '#e03050' : r.yards > 0 ? '#c8a030' : '#aaa';
      resultText = isTD ? 'TOUCHDOWN' : r.isSack ? 'SACK' : r.isInterception ? 'INTERCEPTED' : r.isFumbleLost ? 'FUMBLE' : r.isIncomplete ? 'INCOMPLETE' : r.isSafety ? 'SAFETY' : (r.yards >= 0 ? '+' : '') + r.yards + ' YDS';
    } else {
      // User on defense — show opponent gains as bad, stops as good
      if (isTD) { resultColor = '#e03050'; resultText = 'TOUCHDOWN'; }
      else if (r.isSack) { resultColor = '#3df58a'; resultText = Math.abs(r.yards) > 0 ? 'SACKED! -' + Math.abs(r.yards) + ' YDS' : 'SACKED!'; }
      else if (r.isInterception) { resultColor = '#3df58a'; resultText = 'PICKED OFF!'; }
      else if (r.isFumbleLost) { resultColor = '#3df58a'; resultText = 'FUMBLE!'; }
      else if (r.isIncomplete) { resultColor = '#3df58a'; resultText = 'INCOMPLETE'; }
      else if (r.isSafety) { resultColor = '#3df58a'; resultText = 'SAFETY!'; }
      else if (r.yards <= 0) { resultColor = '#3df58a'; resultText = r.yards < 0 ? 'STUFFED! ' + r.yards + ' YDS' : 'NO GAIN'; }
      else if (r.yards <= 3) { resultColor = '#c8a030'; resultText = 'GAINED ' + r.yards + ' YDS'; }
      else { resultColor = '#e03050'; resultText = 'GAINED ' + r.yards + ' YDS'; }
    }
    var flashColor = isGoodForUser ? '#3df58a' : isBadForUser ? '#e03050' : 'transparent';

    // Layer 6: update ambient mood
    updateMood(isGoodForUser, isBadForUser);

    panel.style.display = 'none';
    snapCount++;

    // Allow tap-to-skip
    var skipped = false;
    function onSkip() { skipped = true; }

    // ── OVERLAY CONTAINER ──
    var overlay = document.createElement('div');
    overlay.className = 'T-clash-overlay';
    overlay.onclick = onSkip;
    var dim = document.createElement('div');
    dim.className = 'T-clash-dim';
    dim.style.opacity = '1';
    overlay.appendChild(dim);
    document.body.appendChild(overlay);
    SND.cardSnap();

    // ── PHASE 2: BUILD (anticipation) — cards slide in face-down ──
    var cardsEl = document.createElement('div');
    cardsEl.className = 'T-clash-cards';
    var slideMs = Math.max(300, anticipationMs);

    // Offense card — user's team color if user is on offense, opponent's if not
    var offTeamColor = (prevPoss === hAbbr) ? hTeam.accent : oTeam.accent;
    var defTeamColor = (prevPoss === hAbbr) ? oTeam.accent : hTeam.accent;
    var offCard = document.createElement('div');
    offCard.className = 'T-clash-card-wrap T-clash-card-off';
    offCard.style.cssText = 'animation:T-clash-slideL ' + slideMs + 'ms cubic-bezier(0.22,1.3,0.36,1) both;transform:scale(' + cardScale + ');border-color:' + offTeamColor + '66;background:' + offTeamColor + '18;';
    offCard.innerHTML =
      "<div style=\"font-family:'Teko';font-size:18px;color:#fff;line-height:1;letter-spacing:1px\">" + res.offPlay.name + '</div>' +
      "<div style=\"font-family:'Rajdhani';font-size:10px;color:" + offTeamColor + ";margin-top:3px\">" + res.featuredOff.name + ' \u00b7 ' + res.featuredOff.pos + '</div>';

    // Defense card
    var defCard = document.createElement('div');
    defCard.className = 'T-clash-card-wrap T-clash-card-def';
    defCard.style.cssText = 'animation:T-clash-slideR ' + slideMs + 'ms cubic-bezier(0.22,1.3,0.36,1) both;transform:scale(' + cardScale + ');border-color:' + defTeamColor + '66;background:' + defTeamColor + '18;';
    defCard.innerHTML =
      "<div style=\"font-family:'Teko';font-size:18px;color:#fff;line-height:1;letter-spacing:1px\">" + res.defPlay.name + '</div>' +
      "<div style=\"font-family:'Rajdhani';font-size:10px;color:" + defTeamColor + ";margin-top:3px\">" + res.featuredDef.name + ' \u00b7 ' + res.featuredDef.pos + '</div>';

    cardsEl.appendChild(offCard);
    cardsEl.appendChild(defCard);
    overlay.appendChild(cardsEl);

    // ── PHASE 3: PEAK — hitstop + impact ──
    var peakTime = anticipationMs + slideMs;
    setTimeout(function() {
      if (skipped) { doSettle(); return; }

      // Screen shake
      if (shakeAmt > 0) {
        el.style.animation = 'T-clash-shake ' + (tier === 3 ? '0.4s' : '0.2s') + ' ease-out';
        setTimeout(function() { el.style.animation = ''; }, tier === 3 ? 450 : 250);
      }

      // White flash at collision
      if (flashColor !== 'transparent') {
        var flash = document.createElement('div');
        flash.className = 'T-clash-flash';
        flash.style.background = flashColor;
        overlay.appendChild(flash);
        setTimeout(function() { flash.remove(); }, 300);
      }

      // Particle burst
      for (var i = 0; i < particleCount; i++) {
        var spark = document.createElement('div');
        var angle = (i / particleCount) * 360 + Math.random() * 30;
        var dist = 20 + Math.random() * (tier === 3 ? 80 : 40);
        var sz = 2 + Math.random() * 3;
        spark.style.cssText = 'position:absolute;width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:' + (Math.random() > 0.5 ? '#EBB010' : '#fff') + ';z-index:5;top:50%;left:50%;--sx:' + (Math.cos(angle * Math.PI / 180) * dist) + 'px;--sy:' + (Math.sin(angle * Math.PI / 180) * dist) + 'px;animation:T-clash-spark ' + (300 + Math.random() * 400) + 'ms ease-out both;';
        overlay.appendChild(spark);
      }

      // Haptic
      if (navigator.vibrate) try { navigator.vibrate(tier === 3 ? 100 : tier === 2 ? 50 : 20); } catch(e) {}

      // Sound + audio state — biased to user perspective
      if (isTD && isUserOff) { SND.td(); AudioStateManager.setState('touchdown'); }
      else if (isTD && !isUserOff) { SND.turnover(); AudioStateManager.setState('turnover'); }
      else if (isGoodForUser && tier >= 2) { SND.bigPlay(); AudioStateManager.setState('big_moment'); }
      else if (isBadForUser) { SND.turnover(); AudioStateManager.setState('turnover'); }
      else { SND.snap(); }

      // Hitstop freeze then settle
      setTimeout(function() {
        if (skipped) { doSettle(); return; }
        // User's card glows on good result, dims on bad — always user-biased
        var userCard = isUserOff ? offCard : defCard;
        var oppCard = isUserOff ? defCard : offCard;
        if (isGoodForUser) {
          userCard.style.boxShadow = '0 0 16px #3df58a';
          userCard.style.animation = 'T-clash-glow 1s ease-in-out infinite';
          oppCard.style.opacity = '0.5';
          oppCard.style.transform = 'scale(0.9)';
        } else if (isBadForUser) {
          oppCard.style.boxShadow = '0 0 16px #e03050';
          oppCard.style.animation = 'T-clash-glow 1s ease-in-out infinite';
          userCard.style.opacity = '0.5';
          userCard.style.transform = 'scale(0.9)';
        }
        // Cards settle with overshoot
        cardsEl.style.animation = 'T-clash-settle 0.4s cubic-bezier(0.34,1.56,0.64,1) both';
        doSettle();
      }, hitstopMs);
    }, peakTime);

    // ── POST-PLAY 4-BEAT DISPLAY (Phase 6) ──
    function doSettle() {
      overlay.onclick = null;

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
      var totalDur = Math.round((level === 3 ? 5000 : level === 2 ? 3500 : 2200) * holdMultiplier);

      // ── TD CELEBRATION — separate flow for touchdowns ──
      if (isTD && isUserOff && !res._isConversion) {
        // USER SCORES — "The Moment"
        totalDur = 4500;
        var teamAccent = hTeam.accent || '#EBB010';

        // Full dark overlay behind everything
        var tdDim = document.createElement('div');
        tdDim.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.8);z-index:8;';
        overlay.appendChild(tdDim);

        // White flash
        var tdFlash = document.createElement('div');
        tdFlash.style.cssText = 'position:absolute;inset:0;background:#fff;z-index:12;opacity:0.9;transition:opacity 0.2s;';
        overlay.appendChild(tdFlash);
        setTimeout(function() { tdFlash.style.opacity = '0'; }, 150);
        setTimeout(function() { tdFlash.remove(); }, 400);

        // Haptic
        if (navigator.vibrate) try { navigator.vibrate([30, 50, 80]); } catch(e) {}

        // Team logo pulsing behind text
        var logoBg = document.createElement('div');
        logoBg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9;opacity:0.12;animation:T-flame-pulse 1.5s ease-in-out infinite;';
        logoBg.innerHTML = renderTeamBadge(GS.team, 200);
        overlay.appendChild(logoBg);

        // Result wrap — centered
        var resultWrap = document.createElement('div');
        resultWrap.className = 'T-clash-result';
        resultWrap.style.cssText = 'z-index:10;';
        resultWrap.style.opacity = '0';

        // "TOUCHDOWN" — auto-sized to fit screen width
        var tdTextEl = document.createElement('div');
        tdTextEl.style.cssText = "font-family:'Teko';font-weight:700;color:" + teamAccent + ";letter-spacing:6px;text-shadow:0 0 40px " + teamAccent + "80,0 0 80px " + teamAccent + "40;animation:T-clash-yds 0.5s cubic-bezier(0.34,1.56,0.64,1) both;white-space:nowrap;font-size:72px;";
        tdTextEl.textContent = 'TOUCHDOWN';
        resultWrap.appendChild(tdTextEl);
        overlay.appendChild(resultWrap);

        // Auto-size TOUCHDOWN text to fit container
        requestAnimationFrame(function() {
          resultWrap.style.opacity = '1'; resultWrap.style.transition = 'opacity 0.2s';
          var maxW = (overlay.offsetWidth || 375) - 40;
          var fs = 72;
          while (tdTextEl.scrollWidth > maxW && fs > 28) { fs -= 2; tdTextEl.style.fontSize = fs + 'px'; }
        });

        // Team name slides up
        setTimeout(function() {
          var teamLine = document.createElement('div');
          teamLine.style.cssText = "font-family:'Teko';font-weight:700;font-size:28px;color:" + teamAccent + ";letter-spacing:4px;text-shadow:0 0 16px " + teamAccent + "40;opacity:0;transform:translateY(10px);transition:opacity 0.3s,transform 0.3s;";
          teamLine.textContent = hTeam.name.toUpperCase() + '!';
          resultWrap.appendChild(teamLine);
          requestAnimationFrame(function() { teamLine.style.opacity = '1'; teamLine.style.transform = 'translateY(0)'; });
        }, 500);

        // Confetti — 50 particles in team colors
        setTimeout(function() {
          for (var ci = 0; ci < 50; ci++) {
            var conf = document.createElement('div');
            var confX = 5 + Math.random() * 90;
            var confSize = 3 + Math.random() * 5;
            var confDur = 1500 + Math.random() * 2000;
            var confDelay = Math.random() * 600;
            var confColor = Math.random() > 0.4 ? teamAccent : (Math.random() > 0.5 ? '#EBB010' : '#fff');
            conf.style.cssText = 'position:absolute;top:-10px;left:' + confX + '%;width:' + confSize + 'px;height:' + confSize + 'px;background:' + confColor + ';border-radius:1px;opacity:0.9;z-index:11;animation:T-td-confetti ' + confDur + 'ms ease-in ' + confDelay + 'ms both;';
            overlay.appendChild(conf);
          }
        }, 300);

        // Commentary at 800ms
        setTimeout(function() {
          var gameCtx = gs.getSummary();
          var comm = generateCommentary(res, gameCtx, hTeam.name, oTeam.name);
          setNarr(comm.line1, comm.line2 || '');
          var labelEl = document.createElement('div');
          labelEl.style.cssText = "color:#e8e6ff;opacity:0;transition:opacity 0.4s;margin-top:12px;font-family:'Rajdhani';font-size:16px;font-weight:700;line-height:1.3;text-align:center;max-width:280px;";
          labelEl.textContent = comm.line1;
          resultWrap.appendChild(labelEl);
          requestAnimationFrame(function() { labelEl.style.opacity = '1'; });
        }, 800);

        drawBug(); drawField();

      } else if (isTD && (!isUserOff || res._isConversion)) {
        // OPPONENT SCORES or CONVERSION — muted, move on fast
        totalDur = 1800;
        var resultWrap = document.createElement('div');
        resultWrap.className = 'T-clash-result';
        resultWrap.style.cssText = 'position:absolute;top:22%;left:50%;transform:translateX(-50%);width:90%;text-align:center;';
        resultWrap.style.opacity = '0';
        resultWrap.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:32px;color:#666;letter-spacing:2px;\">TOUCHDOWN</div>" +
          "<div style=\"font-family:'Rajdhani';font-size:12px;color:#444;margin-top:4px;\">" + oTeam.name + " scores.</div>";
        overlay.appendChild(resultWrap);
        requestAnimationFrame(function() { resultWrap.style.opacity = '1'; resultWrap.style.transition = 'opacity 0.25s'; });

        setTimeout(function() {
          var gameCtx = gs.getSummary();
          var comm = generateCommentary(res, gameCtx, hTeam.name, oTeam.name);
          setNarr(comm.line1, '');
        }, 400);

        drawBug(); drawField();

      } else {
        // ── NON-TD: Normal result display ──
        var resultWrap = document.createElement('div');
        resultWrap.className = 'T-clash-result';
        if (resultPos) resultWrap.style.cssText = resultPos;
        resultWrap.style.opacity = '0';
        resultWrap.innerHTML = '<div class="T-clash-yds" style="color:' + resultColor + ';font-size:' + ydsFontSize + ';' + resultGlow + resultAnim + '">' + resultText + '</div>';
        overlay.appendChild(resultWrap);
        requestAnimationFrame(function() {
          resultWrap.style.opacity = '1';
          resultWrap.style.transition = 'opacity 0.3s';
        });

        drawBug(); drawField();
      }

      // ── BEAT 2: CONTEXT (800ms-2s) — first down, down & distance, commentary (non-TD only) ──
      setTimeout(function() {
        if (isTD) return; // TD has its own commentary flow above

        // First down — big broadcast-style slide-in
        if (gotFirstDown) {
          var fdColor = isUserOff ? '#00ff44' : '#888';
          var fdText = isUserOff ? 'FIRST DOWN!' : 'First down.';
          var fdFlash = document.createElement('div');
          fdFlash.style.cssText = "font-family:'Teko';font-weight:700;font-size:" + (isUserOff ? '42px' : '24px') + ";color:" + fdColor + ";letter-spacing:4px;text-shadow:0 0 20px " + fdColor + "60;margin-top:8px;opacity:0;transform:translateX(-20px);transition:opacity 0.3s,transform 0.3s;";
          fdFlash.textContent = fdText;
          resultWrap.appendChild(fdFlash);
          requestAnimationFrame(function() { fdFlash.style.opacity = '1'; fdFlash.style.transform = 'translateX(0)'; });
          if (isUserOff) SND.chime();
        }

        // New down & distance (skip if first down flash showing)
        if (!r.isInterception && !r.isFumbleLost && !gotFirstDown) {
          var newS = gs.getSummary();
          var dnLabels = ['','1ST','2ND','3RD','4TH'];
          var dnText = (dnLabels[newS.down] || '') + ' & ' + newS.distance;
          var dnColor = newS.down >= 3 ? '#e03050' : '#EBB010';
          var dnEl = document.createElement('div');
          dnEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:20px;color:" + dnColor + ";letter-spacing:3px;margin-top:6px;opacity:0.9;";
          dnEl.textContent = dnText;
          resultWrap.appendChild(dnEl);
        }

        // Commentary
        var gameCtx = gs.getSummary();
        var comm = generateCommentary(res, gameCtx, hTeam.name, oTeam.name);
        var ctx = generateContext(gameCtx, hTeam.name, oTeam.name, res);
        setNarr(comm.line1, comm.line2 || ctx || '');

        var labelEl = document.createElement('div');
        labelEl.className = 'T-clash-label';
        labelEl.style.cssText = "color:#e8e6ff;opacity:0;transition:opacity 0.3s;margin-top:8px;font-family:'Rajdhani';font-size:15px;font-weight:700;line-height:1.3;text-align:center;max-width:280px;";
        labelEl.textContent = comm.line1;
        resultWrap.appendChild(labelEl);
        setTimeout(function() { labelEl.style.opacity = '1'; }, 100);

      }, 800);

      // ── BEAT 3: REWARD (2-3.5s) — TORCH points + combos ──
      setTimeout(function() {
        // Combo flash
        if (res._combos && res._combos.length > 0) {
          var comboEl = document.createElement('div');
          comboEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:20px;color:#EBB010;letter-spacing:2px;text-shadow:0 0 12px rgba(235,176,16,0.5);margin-top:6px;animation:T-clash-yds 0.4s ease-out both;";
          comboEl.textContent = res._combos.join(' + ');
          resultWrap.appendChild(comboEl);
        }

      }, 2000);

      // ── BEAT 4: READY (cleanup + proceed) ──
      setTimeout(function() {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.4s';
        setTimeout(function() { overlay.remove(); }, 400);

        // TORCH points — ALL increases go through the sequential flyer animation
        var finalTotal = hAbbr === 'CT' ? gs.getSummary().ctTorchPts : gs.getSummary().irTorchPts;
        var actualGain = finalTotal - _torchFrozenValue;
        if (actualGain > 0 && torchBannerPtsEl) {
          // Build sources from res._torchSources, or fall back to a single "play" source
          var srcs = (res._torchSources && res._torchSources.length > 0) ? res._torchSources : [{ key: 'play', pts: actualGain }];
          var isBigPlay = r.isTouchdown || r.isInterception || r.isFumbleLost || r.yards >= 15;
          playPointsSequence({
            counterEl: torchBannerPtsEl,
            containerEl: torchBanner,
            sources: srcs,
            startValue: _torchFrozenValue,
            shake: isBigPlay,
            onComplete: function() { _torchDisplayFrozen = false; drawTorchBanner(); },
          });
        } else {
          // No gain (0 or negative play) — just unfreeze silently
          _torchDisplayFrozen = false;
          drawTorchBanner();
        }

        var shopTrigger = null;
        if (!gs.gameOver) {
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
          } else { if(!checkEnd()) nextSnap(); }
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

  function nextSnap() {
    phase = 'play';
    selP = null; selPl = null; selTorch = null; selectedPreSnap = null;
    panel.style.display = ''; // Restore panel visibility
    // Return to normal audio state (or 2-min drill if active)
    AudioStateManager.setState(gs.twoMinActive ? 'two_min_drill' : 'normal_play');
    drawBug(); drawField(); drawPanel(); drawDriveSummary();
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
      else if (ev === 'safety') { title = 'SAFETY!'; subtitle = newPossTeam.name + ' gets the ball back!'; }
      else { title = newPossTeam.name.toUpperCase() + ' BALL!'; subtitle = 'New drive.'; }
    } else {
      if (ev === 'interception') { title = 'TURNOVER'; subtitle = otherTeam.name + ' intercepts.'; }
      else if (ev === 'fumble_lost') { title = 'TURNOVER'; subtitle = 'Fumble. ' + otherTeam.name + ' recovers.'; }
      else if (ev === 'turnover_on_downs') { title = 'TURNOVER ON DOWNS'; subtitle = 'Failed to convert.'; }
      else if (ev === 'touchdown' || ev === 'turnover_td' || ev === 'score') { title = 'NEW DRIVE'; subtitle = newPossTeam.name + ' ball.'; }
      else { title = 'CHANGE OF POSSESSION'; subtitle = newPossTeam.name + ' ball.'; }
    }

    // Next situation context
    var nextCtx = '1st & 10';
    if (s.down && s.distance) nextCtx = ['','1st','2nd','3rd','4th'][s.down] + ' & ' + s.distance;
    var fieldPos = s.yardsToEndzone ? (s.yardsToEndzone <= 50 ? 'OPP ' + s.yardsToEndzone : 'OWN ' + (100 - s.yardsToEndzone)) : '';

    // Sizes based on sentiment
    var userBadgeSize = isGoodForUser ? 90 : 50;
    var oppBadgeSize = isGoodForUser ? 50 : 60;
    var userScoreStyle = isGoodForUser ? "font-size:28px;color:#fff;" : "font-size:22px;color:#777;";
    var oppScoreStyle = isGoodForUser ? "font-size:22px;color:#777;" : "font-size:28px;color:#fff;";
    var titleColor = isGoodForUser ? newPossTeam.accent : '#888';
    var titleSize = isGoodForUser ? '28px' : '20px';
    var bgGrad = isGoodForUser
      ? 'background:radial-gradient(ellipse at 50% 40%,' + newPossTeam.colors.primary + '18 0%,transparent 70%),#0A0804;'
      : 'background:#0A0804;';

    // Build overlay — centered content, dark background
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:900;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;opacity:0;transition:opacity .3s;pointer-events:auto;cursor:pointer;' + bgGrad;

    // Score bar with team badges — both visible, side by side
    var hScore = s.ctScore, oScore = s.irScore;
    var scoreBar = document.createElement('div');
    scoreBar.style.cssText = 'display:flex;align-items:center;gap:20px;';
    scoreBar.innerHTML =
      '<div style="text-align:center;">' +
        renderTeamBadge(GS.team, isYourBall ? 80 : 56) +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:" + (isYourBall ? '28' : '22') + "px;color:" + (isYourBall ? '#fff' : '#666') + ";margin-top:4px;\">" + hScore + '</div>' +
      '</div>' +
      "<div style=\"font-family:'Teko';font-size:18px;color:#444;letter-spacing:2px;\">—</div>" +
      '<div style="text-align:center;">' +
        renderTeamBadge(GS.opponent, isYourBall ? 56 : 80) +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:" + (isYourBall ? '22' : '28') + "px;color:" + (isYourBall ? '#666' : '#fff') + ";margin-top:4px;\">" + oScore + '</div>' +
      '</div>';
    ov.appendChild(scoreBar);

    // Divider line
    var divider = document.createElement('div');
    divider.style.cssText = 'width:50%;height:1px;background:linear-gradient(90deg,transparent,' + (isGoodForUser ? newPossTeam.accent + '88' : '#44444488') + ',transparent);';
    ov.appendChild(divider);

    // Title — big and clear
    var titleEl = document.createElement('div');
    titleEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:" + titleSize + ";color:" + titleColor + ";letter-spacing:4px;text-align:center;";
    if (isGoodForUser) titleEl.style.textShadow = '0 0 20px ' + newPossTeam.accent + '40';
    titleEl.textContent = title;
    ov.appendChild(titleEl);

    // Subtitle
    var subEl = document.createElement('div');
    subEl.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:13px;color:" + (isGoodForUser ? '#ccc' : '#666') + ";letter-spacing:2px;";
    subEl.textContent = subtitle;
    ov.appendChild(subEl);

    // Next situation
    if (fieldPos) {
      var ctxEl = document.createElement('div');
      ctxEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:11px;color:#555;letter-spacing:1px;margin-top:6px;";
      ctxEl.textContent = nextCtx + ' at ' + fieldPos;
      ov.appendChild(ctxEl);
    }

    // Sound
    if (isGoodForUser) { try { SND.chime(); } catch(e) {} }
    else { try { SND.snap(); } catch(e) {} }

    // Tap to skip + auto-advance
    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      ov.style.opacity = '0';
      setTimeout(function() { if (ov.parentNode) ov.remove(); done(); }, 300);
    }
    ov.onclick = dismiss;
    el.appendChild(ov);
    requestAnimationFrame(function() { ov.style.opacity = '1'; });
    var autoTime = isGoodForUser ? 2800 : 2000;
    setTimeout(function() { if (!dismissed) dismiss(); }, autoTime);
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
      showPossCut('score', () => { showDrive(driveSnaps, team, () => { driveSnaps=[]; drivePlayHistory=[]; resetDriveSummary(); if(!checkEnd()) nextSnap(); }); });
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
          showPossCut('score', function() { showDrive(driveSnaps, team, function() { driveSnaps=[]; drivePlayHistory=[]; resetDriveSummary(); if(!checkEnd()) nextSnap(); }); });
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

    // Override result text for conversion context
    if (convResult.success) {
      fakeRes.result.description = (cm.choice === '2pt' ? '2-point' : '3-point') + ' conversion is GOOD! +' + convResult.points + '!';
    } else {
      fakeRes.result.description = (cm.choice === '2pt' ? '2-point' : '3-point') + ' conversion FAILED.';
    }
    // Mark as conversion so Beat 4 skips the TD celebration + conversion loop
    fakeRes._isConversion = true;
    fakeRes.gameEvent = 'conversion';

    drawField(); drawPanel();

    // Run through the full 3-beat snap display (clash, result, commentary)
    var prevPossConv = cm.team;
    run3BeatSnap(fakeRes, prevPossConv, false, false);
  }

  // ── 2-MIN WARNING (dramatic overlay) ──
  function show2MinWarn() {
    shakeScreen();
    flashField('rgba(224,48,80,.3)');

    // Red flash pulse on edges
    var edgePulse = document.createElement('div');
    edgePulse.style.cssText = 'position:fixed;inset:0;z-index:599;border:4px solid #e03050;opacity:0.8;pointer-events:none;animation:T-flash-green 0.6s ease-out;';
    edgePulse.style.borderColor = '#e03050';
    el.appendChild(edgePulse);
    setTimeout(function() { edgePulse.remove(); }, 600);

    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:600;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);opacity:0;transition:opacity .25s;pointer-events:auto;cursor:pointer;';
    ov.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:700;font-size:48px;color:#e03050;letter-spacing:6px;text-shadow:0 0 30px rgba(224,48,80,0.5);animation:T-clash-yds 0.4s cubic-bezier(0.34,1.56,0.64,1) both;\">2-MINUTE WARNING</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:14px;color:#888;letter-spacing:2px;margin-top:8px;\">The clock is live. Every second counts.</div>";
    ov.onclick = function() { ov.style.opacity = '0'; setTimeout(function() { ov.remove(); }, 250); };
    el.appendChild(ov);
    requestAnimationFrame(function() { ov.style.opacity = '1'; });
    setTimeout(function() { if (ov.parentNode) { ov.style.opacity = '0'; setTimeout(function() { ov.remove(); }, 250); } }, 2000);
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
    var humanWins = Math.random() < 0.5;
    var offers = rollCoinTossCards();

    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:700;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:rgba(10,8,4,0.95);opacity:0;transition:opacity .3s;pointer-events:auto;';
    el.appendChild(ov);
    requestAnimationFrame(function() { ov.style.opacity = '1'; });

    // Phase 1: Tap to flip
    var coin = document.createElement('div');
    coin.style.cssText = 'width:90px;height:90px;border-radius:50%;background:linear-gradient(135deg,#EBB010,#B8860B);display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(235,176,16,0.4);cursor:pointer;transition:transform 0.1s;';
    coin.innerHTML = renderTeamBadge(GS.team, 60);
    var label = document.createElement('div');
    label.style.cssText = "font-family:'Teko';font-weight:700;font-size:22px;color:#EBB010;letter-spacing:3px;";
    label.textContent = 'TAP TO FLIP';
    ov.appendChild(coin);
    ov.appendChild(label);

    coin.onclick = function() {
      coin.onclick = null;
      coin.style.transition = 'transform 1.5s cubic-bezier(0.22,1,0.36,1)';
      coin.style.transform = 'rotateY(1800deg)';
      label.textContent = '';
      SND.snap();

      setTimeout(function() {
        // Phase 2: Result + Choice
        ov.innerHTML = '';
        var winner = humanWins ? hTeam.name : oTeam.name;
        var resultEl = document.createElement('div');
        resultEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:28px;color:#EBB010;letter-spacing:3px;text-align:center;";
        resultEl.textContent = humanWins ? 'YOU WON THE TOSS!' : winner + ' WINS THE TOSS';
        ov.appendChild(resultEl);

        if (humanWins) {
          // Human chooses: Torch Card or Receive
          var choiceWrap = document.createElement('div');
          choiceWrap.style.cssText = 'display:flex;flex-direction:column;gap:12px;width:100%;max-width:320px;margin-top:12px;';

          var cardBtn = document.createElement('button');
          cardBtn.className = 'btn-blitz';
          cardBtn.style.cssText = "width:100%;font-size:13px;padding:14px;background:#141008;color:#EBB010;border-color:#EBB010;text-align:left;";
          cardBtn.innerHTML = "<div style=\"font-family:'Teko';font-size:18px;letter-spacing:2px;\">DRAW A TORCH CARD</div><div style=\"font-family:'Rajdhani';font-size:11px;color:#888;margin-top:2px;\">Pick 1 of 3 mystery cards \u2014 but you kick off to them</div>";
          cardBtn.onclick = function() { showFaceDownCards(ov, offers, true, onDone); };

          var recBtn = document.createElement('button');
          recBtn.className = 'btn-blitz';
          recBtn.style.cssText = "width:100%;font-size:13px;padding:14px;background:#141008;color:#00ff44;border-color:#00ff44;text-align:left;";
          recBtn.innerHTML = "<div style=\"font-family:'Teko';font-size:18px;letter-spacing:2px;\">RECEIVE THE KICK</div><div style=\"font-family:'Rajdhani';font-size:11px;color:#888;margin-top:2px;\">Start with the ball \u2014 but no free card until halftime</div>";
          recBtn.onclick = function() {
            SND.snap();
            ov.style.opacity = '0';
            setTimeout(function() { ov.remove(); onDone({ chose: 'receive' }); }, 250);
          };

          choiceWrap.appendChild(cardBtn);
          choiceWrap.appendChild(recBtn);
          ov.appendChild(choiceWrap);
        } else {
          // CPU won — AI chooses (weighted by difficulty)
          var aiTakesCard = Math.random() < ({ EASY: 0.6, MEDIUM: 0.5, HARD: 0.4 }[gs.difficulty] || 0.5);
          var aiMsg = document.createElement('div');
          aiMsg.style.cssText = "font-family:'Rajdhani';font-size:14px;color:#888;text-align:center;margin-top:8px;";
          if (aiTakesCard) {
            aiMsg.textContent = oTeam.name + ' draws a Torch Card. You receive.';
            // Give AI a card
            var aiCard = offers[Math.floor(Math.random() * offers.length)];
            gs.cpuTorchCards.push(aiCard.id);
          } else {
            aiMsg.textContent = oTeam.name + ' receives the kick. You draw a card.';
          }
          ov.appendChild(aiMsg);

          setTimeout(function() {
            if (!aiTakesCard) {
              // Human gets to pick a face-down card
              showFaceDownCards(ov, offers, false, onDone);
            } else {
              var playBtn = document.createElement('button');
              playBtn.className = 'btn-blitz';
              playBtn.style.cssText = "width:80%;max-width:300px;font-size:16px;background:linear-gradient(180deg,#EBB010,#FF4511);border-color:#FF4511;color:#000;letter-spacing:3px;margin-top:12px;";
              playBtn.textContent = 'PLAY BALL';
              playBtn.onclick = function() {
                SND.snap();
                ov.style.opacity = '0';
                setTimeout(function() { ov.remove(); onDone({ chose: 'receive' }); }, 250);
              };
              ov.appendChild(playBtn);
            }
          }, 1500);
        }
      }, 1600);
    };
  }

  // Face-down card selection (used by coin toss and halftime)
  function showFaceDownCards(ov, offers, humanKicks, onDone) {
    ov.innerHTML = '';
    var title = document.createElement('div');
    title.style.cssText = "font-family:'Teko';font-weight:700;font-size:22px;color:#EBB010;letter-spacing:3px;text-align:center;";
    title.textContent = 'TAP A CARD TO REVEAL';
    ov.appendChild(title);

    var cardRow = document.createElement('div');
    cardRow.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-top:16px;';

    offers.forEach(function(card, idx) {
      var wrap = document.createElement('div');
      wrap.style.cssText = 'width:90px;height:126px;border-radius:8px;background:radial-gradient(ellipse at 50% 35%,#1a0800,#0A0804);border:2px solid #EBB01044;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.3s;opacity:0;transform:translateY(20px);';
      wrap.innerHTML = "<div style=\"font-family:'Teko';font-size:36px;color:#EBB01044;\">?</div>";
      // Stagger deal-in
      setTimeout(function() { wrap.style.opacity = '1'; wrap.style.transform = 'translateY(0)'; }, 200 + idx * 100);

      wrap.onclick = function() {
        // Reveal this card, fade others
        cardRow.querySelectorAll('div').forEach(function(c) { c.onclick = null; });
        wrap.style.border = '2px solid #EBB010';
        wrap.style.boxShadow = '0 0 20px rgba(235,176,16,0.4)';
        wrap.style.transform = 'scale(1.05)';
        wrap.innerHTML = '';
        var revealed = buildTorchCard(card, 86, 120);
        revealed.style.width = '100%';
        revealed.style.height = '100%';
        wrap.appendChild(revealed);
        SND.snap();

        // Fade non-selected
        cardRow.querySelectorAll('div').forEach(function(c) {
          if (c !== wrap) c.style.opacity = '0.2';
        });

        // Award card to human
        if (gs.humanTorchCards.length < 3) gs.humanTorchCards.push(card.id);
        // Sync to torchInventory
        var cardObj = TORCH_CARDS.find(function(tc) { return tc.id === card.id; });
        if (cardObj) torchInventory.push(cardObj);
        if (GS.season) GS.season.torchCards = torchInventory.slice();

        setTimeout(function() {
          ov.style.opacity = '0';
          setTimeout(function() {
            ov.remove();
            onDone({ chose: humanKicks ? 'card' : 'card_cpu_receives', card: card });
          }, 250);
        }, 1200);
      };
      cardRow.appendChild(wrap);
    });
    ov.appendChild(cardRow);
  }

  // Brief kickoff result overlay
  function showKickoffResult(resultText, onDone) {
    var kov = document.createElement('div');
    kov.style.cssText = 'position:fixed;inset:0;z-index:650;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(10,8,4,0.85);opacity:0;transition:opacity 0.3s;pointer-events:auto;cursor:pointer;';
    kov.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:700;font-size:24px;color:#EBB010;letter-spacing:3px;\">KICKOFF</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:16px;color:#ccc;margin-top:6px;\">" + resultText + "</div>";
    kov.onclick = function() { kov.style.opacity = '0'; setTimeout(function() { kov.remove(); if (onDone) onDone(); }, 200); };
    el.appendChild(kov);
    requestAnimationFrame(function() { kov.style.opacity = '1'; });
    setTimeout(function() { if (kov.parentNode) { kov.style.opacity = '0'; setTimeout(function() { kov.remove(); if (onDone) onDone(); }, 200); } }, 2000);
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

  // First load: coin toss → kickoff → play
  if (!GS._coinTossDone) {
    GS._coinTossDone = true;
    drawPanel();
    showCoinToss(function(result) {
      // result.chose = 'receive' | 'card' | 'card_cpu_receives'
      // Determine who receives the opening kickoff
      var humanReceives = result.chose === 'receive' || result.chose === 'card_cpu_receives';

      // Resolve kickoff and set field position
      var kickResult = gs.constructor.resolveKickoff();
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
        phase = 'play';
        drawPanel();
      });
    });
  } else {
    drawPanel();
  }

  // ── DEV PANEL ──
  injectDevPanel(el, gs, {
    refresh: function() { drawBug(); drawField(); drawPanel(); drawDriveSummary(); },
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
    showCoinToss: function() {
      showCoinToss(function(result) {
        var humanReceives = result.chose === 'receive' || result.chose === 'card_cpu_receives';
        var kickResult = gs.constructor.resolveKickoff();
        var startYard = kickResult === -1 ? 25 : kickResult;
        gs.ballPosition = humanReceives ? startYard : 100 - startYard;
        gs.possession = humanReceives ? 'CT' : 'IR';
        gs.down = 1; gs.distance = 10;
        drawBug(); drawField(); drawPanel();
      });
    },
    showKickoff: function() {
      var kickResult = gs.constructor.resolveKickoff();
      var startYard = kickResult === -1 ? 25 : kickResult;
      var posLabel = startYard === 25 ? 'Touchback \u2014 ball on the 25' : 'Returned to the ' + startYard;
      showKickoffResult(posLabel, function() { drawBug(); drawField(); drawPanel(); });
    },
    openBooster: function() {
      triggerShop('halftime', function() { drawBug(); drawField(); drawPanel(); });
    },
  });

  return el;
}
