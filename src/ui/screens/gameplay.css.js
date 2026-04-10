export const GAMEPLAY_CSS = `
/* root */
.T{height:100%;display:flex;flex-direction:column;background:#0A0804;overflow:hidden;position:relative;font-family:'Barlow Condensed',sans-serif;padding-top:env(safe-area-inset-top,0px)}

/* scoreboard — jumbotron */
.T-sb{background:#141008;overflow:hidden;flex-shrink:0;z-index:60;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.3);transition:opacity 0.2s}
.T-sb-dim{opacity:0.7}
.T-sb-led{height:2px;position:relative;z-index:1}
.T-sb-row{display:grid;grid-template-columns:1fr auto 1fr;align-items:stretch}
.T-sb-panel{padding:8px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.T-sb-panel-home{border-right:none;box-shadow:1px 0 0 rgba(255,255,255,0.06)}
.T-sb-panel-away{border-left:none;box-shadow:-1px 0 0 rgba(255,255,255,0.06)}
.T-sb-name{font-family:'Oswald',sans-serif;font-weight:700;font-size:10px;letter-spacing:2px;line-height:1;white-space:nowrap}
.T-sb-score{font-family:'Teko';font-weight:900;font-size:42px;line-height:0.9;color:#fff;transition:transform 0.2s;animation:segFlicker 4s ease-in-out infinite}
.T-sb-poss-dot{width:4px;height:4px;border-radius:50%;margin-top:3px}
.T-sb-center{padding:6px 14px;background:#0a0a0a;min-width:80px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.T-sb-half{font-family:'Rajdhani';font-weight:700;font-size:10px;color:#EBB010;letter-spacing:2px;line-height:1;background:rgba(235,176,16,0.06);border:1px solid rgba(235,176,16,0.12);border-radius:4px;padding:2px 8px}
.T-sb-snap{font-family:'Teko';font-weight:700;font-size:18px;color:#aaa;line-height:1;margin-top:2px;animation:segFlicker 5s ease-in-out 2.3s infinite}
.T-sb-divider{display:none}
.T-sb-down{font-family:'Oswald',sans-serif;font-weight:700;font-size:11px;color:#FF6B00;letter-spacing:1px;line-height:1;margin-top:2px}
.T-sb-ball{font-family:'Rajdhani';font-weight:600;font-size:10px;color:#888;letter-spacing:0.5px;margin-top:1px}
.T-sb-clock{font-family:'Teko';font-weight:900;font-size:28px;line-height:1}
.T-sb-clock-label{font-family:'Rajdhani';font-weight:700;font-size:9px;color:#e03050;letter-spacing:2px;opacity:0.7}
@keyframes segFlicker{0%,95%{opacity:1}96%{opacity:0.7}97%{opacity:1}98%{opacity:0.85}100%{opacity:1}}
@keyframes clockPulse{0%,100%{text-shadow:0 0 8px rgba(224,48,80,0.4);color:#e03050}50%{text-shadow:0 0 16px rgba(224,48,80,0.7),0 0 30px rgba(224,48,80,0.3);color:#ff4060}}
@keyframes urgentLed{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes urgentPulse{0%,100%{border-color:#e0305044;background:rgba(224,48,80,0.03)}50%{border-color:#e0305088;background:rgba(224,48,80,0.06)}}

/* TORCH points banner */
.T-torch-banner{flex-shrink:0;display:flex;flex-direction:column;margin-bottom:12px;box-shadow:0 4px 12px rgba(78,50,23,0.3)}
.T-torch-banner-border{height:2px;background:linear-gradient(90deg,#8B4A1F,#EBB010,#FFD060,#EBB010,#8B4A1F);background-size:200% 100%;animation:borderFlow 3s linear infinite}
@keyframes borderFlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.T-torch-banner-content{background:linear-gradient(180deg,#1a1208 0%,#0a0804 40%,#0a0804 60%,#1a1208 100%);padding:8px 14px;display:flex;align-items:center;justify-content:center;gap:8px;position:relative}
.T-torch-banner-flame{animation:emblemPulse 3s ease-in-out infinite}
@keyframes emblemPulse{0%,100%{filter:drop-shadow(0 0 4px rgba(255,69,17,0.3))}50%{filter:drop-shadow(0 0 10px rgba(255,69,17,0.6))}}
@keyframes T-flame-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.85}}
.T-torch-banner-label{font-family:'Teko';font-weight:700;font-size:28px;letter-spacing:6px;line-height:1;background:linear-gradient(180deg,#FFD060 0%,#EBB010 30%,#8B4A1F 60%,#EBB010 80%,#FFD060 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.T-torch-banner-sep{width:1px;height:16px;background:linear-gradient(180deg,transparent,#EBB01044,transparent)}
.T-torch-banner-pts{font-family:'Teko';font-weight:700;font-size:28px;color:#FFE080;line-height:1;letter-spacing:0.5px;transition:transform .3s;animation:bannerHeat 2.8s ease-in-out infinite alternate;--team-accent-rgb:196,162,101;position:relative;z-index:1}
@keyframes bannerHeat{
  0%{text-shadow:0 0 2px #FFE080,0 0 4px rgba(235,176,16,0.7),0 -1px 3px rgba(255,69,17,0.55),0 -1px 5px rgba(255,34,0,0.35),0 0 8px rgba(var(--team-accent-rgb),0.3),0 1px 2px rgba(0,0,0,0.95)}
  100%{text-shadow:0 0 3px #FFE080,0 0 5px rgba(235,176,16,0.75),0 -1px 4px rgba(255,69,17,0.6),0 -2px 6px rgba(255,34,0,0.4),0 0 11px rgba(var(--team-accent-rgb),0.4),0 1px 2px rgba(0,0,0,0.95)}
}

/* drive summary */
.T-drive{flex:1;overflow-y:auto;padding:12px 14px 16px;background:linear-gradient(180deg,rgba(10,8,4,0) 0%,rgba(10,8,4,0.95) 8%);font-family:'Rajdhani',sans-serif}
.T-drive-hdr{display:flex;justify-content:space-between;align-items:center;padding-bottom:6px;border-bottom:1px solid #2a2a2a}
.T-drive-hdr-l{font-family:'Teko';font-weight:700;font-size:17px;color:#FF6B00;letter-spacing:3px;text-transform:uppercase;line-height:1}
.T-drive-hdr-r{font-family:'Rajdhani';font-size:12px;font-weight:600;color:#aaa;line-height:1}
.T-drive-hdr-r span{color:#fff}
.T-drive-row{display:flex;align-items:center;gap:4px;padding:3px 0;font-size:12px;transition:opacity .3s}
.T-drive-row-dd{font-family:'Teko';font-size:11px;color:#888;min-width:52px;flex-shrink:0}
.T-drive-row-play{font-family:'Rajdhani';font-size:12px;color:#bbb;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.T-drive-row-res{font-family:'Teko';font-weight:700;font-size:15px;min-width:40px;text-align:right;flex-shrink:0}
.T-drive-stats{border-top:1px solid #2a2a2a;margin-top:10px;padding-top:8px;display:flex;gap:20px}
.T-drive-stat{font-family:'Rajdhani';font-size:13px;font-weight:600;color:#fff}
.T-drive-comm{margin-top:8px;font-family:'Rajdhani';font-size:13px;font-weight:700;color:#e8e6ff;line-height:1.3;letter-spacing:.3px}
.T-drive-comm-sub{font-family:'Rajdhani';font-size:12px;color:#C4A265;line-height:1.2;margin-top:2px}
.T-drive-idle{font-family:'Rajdhani';font-size:11px;color:#666;letter-spacing:.5px;margin-top:8px}

/* field strip — Tecmo Bowl inspired */
.T-strip{height:136px;flex-shrink:0;position:relative;background:#050a08;overflow:hidden;border-bottom:1px solid #1E1610;box-shadow:inset 0 8px 16px rgba(0,0,0,0.4),inset 0 -8px 16px rgba(0,0,0,0.4)}
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
.T-placed{position:absolute;top:50%;transform:translateY(-50%);height:120px;z-index:8;border-radius:6px;overflow:hidden;background:radial-gradient(ellipse at 50% 25%,#141008,#0A0804);border:2px solid #00ff44;box-shadow:0 0 12px rgba(0,255,68,.2),0 3px 10px rgba(0,0,0,0.5);display:flex;flex-direction:column;animation:T-placed-pulse 2s ease-in-out infinite}
@keyframes T-placed-pulse{0%,100%{box-shadow:0 0 8px rgba(0,255,68,.15),0 3px 10px rgba(0,0,0,0.5)}50%{box-shadow:0 0 16px rgba(0,255,68,.25),0 3px 10px rgba(0,0,0,0.5)}}
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
.T-panel{display:flex;flex-direction:column;overflow:visible;transition:background .6s,border-color .6s;flex-shrink:0;border-top:1.5px solid transparent;position:relative;z-index:1}
.T-panel-hidden{display:none}
/* offense + defense panels — unified warm dark */
.T-panel-off{background:#0E0A04;border-top-color:#FF6B0033}
.T-panel-off .T-inst{color:#888}
.T-panel-off .T-card{}
.T-panel-def{background:#0E0A04;border-top-color:#FF6B0033}
.T-panel-def .T-inst{color:#888}
.T-panel-def .T-card{}

/* instruction */
.T-inst{text-align:center;padding:8px 0 12px;font-family:'Rajdhani';font-size:10px;color:#777;letter-spacing:1px;flex-shrink:0;text-transform:uppercase}

/* card tray — matches pregame draft card style */
.T-tray{display:flex;gap:8px;padding:8px;flex-shrink:0;overflow:hidden}
.T-card{flex:1 1 0;min-width:0;height:165px;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;transition:all .15s ease;touch-action:none;position:relative;cursor:grab;opacity:.8}
.T-card:active{cursor:grabbing}
.T-card-sel{opacity:1;border-color:#00ff44 !important;box-shadow:0 0 18px rgba(0,255,68,.35),inset 0 0 12px rgba(0,255,68,.08) !important}
.T-card-gone{opacity:.3;pointer-events:none}
.T-card-hurt{opacity:.2;pointer-events:none}
/* drag ghost */
.T-drag-ghost{position:fixed;z-index:9999;pointer-events:none;opacity:.85;transform:scale(1.05);filter:drop-shadow(0 4px 12px rgba(0,0,0,.6))}

/* snap bar — uses btn-blitz style */
.T-snap{padding:12px 10px 10px;flex-shrink:0;display:flex;gap:4px;align-items:stretch;flex-direction:column;margin-bottom:8px}
@keyframes T-pulse{0%,100%{box-shadow:6px 6px 0 #997a00, 10px 10px 0 #000, 0 0 20px rgba(255,204,0,.3)}50%{box-shadow:6px 6px 0 #997a00, 10px 10px 0 #000, 0 0 40px rgba(255,204,0,.6)}}

/* 2min buttons */
.T-2btns{display:flex;gap:5px}
.T-2btn{flex:1;padding:12px;font-family:'Rajdhani';font-size:10px;cursor:pointer;text-align:center;background:none;letter-spacing:.5px;text-transform:uppercase;border:2px solid;border-radius:6px}
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
@keyframes T-rot-shake{0%,100%{transform:translate(0,0) rotate(0deg)}10%{transform:translate(-9px,-2px) rotate(-1.2deg)}20%{transform:translate(8px,3px) rotate(1.4deg)}30%{transform:translate(-6px,2px) rotate(-1deg)}40%{transform:translate(7px,-3px) rotate(0.9deg)}50%{transform:translate(-4px,1px) rotate(-0.6deg)}60%{transform:translate(4px,-1px) rotate(0.5deg)}75%{transform:translate(-2px,1px) rotate(-0.2deg)}}
@keyframes T-pressure-pulse{0%{opacity:0}25%{opacity:0.45}50%{opacity:0.1}75%{opacity:0.35}100%{opacity:0}}
@keyframes T-trophy-slam{0%{opacity:0;transform:translate(-50%,-50%) scale(8) rotate(-12deg)}40%{opacity:1;transform:translate(-50%,-50%) scale(0.95) rotate(2deg)}55%{transform:translate(-50%,-50%) scale(1.05) rotate(-1deg)}70%,100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0deg)}}
@keyframes T-trophy-dust{0%{opacity:0.7;transform:translate(var(--dx,0),0) scale(0.4)}100%{opacity:0;transform:translate(var(--dx,0),-30px) scale(1.4)}}
@keyframes T-trophy-fade{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.2)}}
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
.T-clash-dim{position:absolute;inset:0;background:rgba(10,8,4,0.75);backdrop-filter:blur(8px) saturate(160%);-webkit-backdrop-filter:blur(8px) saturate(160%);transition:opacity 0.3s}
.T-clash-result{position:relative;z-index:3;display:flex;flex-direction:column;align-items:center;gap:6px}
.T-clash-yds{font-family:'Teko';font-weight:700;font-size:64px;line-height:1;text-shadow:0 0 24px currentColor;animation:T-clash-yds 0.6s cubic-bezier(0.22,1.3,0.36,1) both}
.T-clash-label{font-family:'Rajdhani';font-weight:700;font-size:14px;letter-spacing:1px;opacity:0.8}
.T-clash-flash{position:absolute;inset:0;z-index:4;pointer-events:none;animation:T-clash-flash 0.3s ease-out forwards}
`;
