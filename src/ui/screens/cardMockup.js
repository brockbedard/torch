/**
 * TORCH — Card Design Mockup Page
 * Temporary page to preview card designs before integrating into game screens.
 * Shows: card backs, player cards (draft + gameplay sizes), play cards, torch cards.
 */

import { VERSION, VERSION_NAME } from '../../state.js';

export function buildCardMockup() {
  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:#0A0804;padding:20px 14px 60px;overflow-y:auto;';

  // === HEADER ===
  var hdr = document.createElement('div');
  hdr.style.cssText = "font-family:'Teko',sans-serif;font-weight:700;font-size:28px;color:var(--a-gold);letter-spacing:3px;text-align:center;margin-bottom:20px;text-shadow:2px 2px 0 rgba(0,0,0,0.9);";
  hdr.textContent = 'CARD DESIGN MOCKUPS';
  el.appendChild(hdr);

  // Helper: section title
  function secTitle(text) {
    var t = document.createElement('div');
    t.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:700;font-size:14px;color:var(--a-gold);letter-spacing:2px;margin:24px 0 12px;border-bottom:1px solid #1E1610;padding-bottom:4px;";
    t.textContent = text;
    return t;
  }

  // Helper: card row
  function cardRow() {
    var r = document.createElement('div');
    r.style.cssText = 'display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end;justify-content:center;';
    return r;
  }

  // Helper: label
  function label(text) {
    var l = document.createElement('div');
    l.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:600;font-size:9px;color:#aaa;letter-spacing:1px;text-align:center;margin-top:4px;";
    l.textContent = text;
    return l;
  }

  // ============================================================
  // SECTION 1: CARD BACKS
  // ============================================================
  el.appendChild(secTitle('CARD BACKS — Universal (all card types)'));
  var backRow = cardRow();

  // Flame SVG for card back (rotationally symmetric)
  var backFlameSvg = '<svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">'
    + '<defs><linearGradient id="bkFlame" x1="30" y1="60" x2="30" y2="20" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="#FFB800"/></linearGradient></defs>'
    // Subtle crosshatch texture
    + '<pattern id="bkHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
    + '<line x1="0" y1="0" x2="0" y2="6" stroke="#1A1408" stroke-width="0.5"/></pattern>'
    + '<rect width="60" height="80" fill="url(#bkHatch)"/>'
    // Top flame (pointing up)
    + '<path d="M30 14C30 14 22 24 21 30C20 36 24 40 27 42C27 42 25 37 27 32C28 29 29 27 30 24C31 27 32 29 33 32C35 37 33 42 33 42C36 40 40 36 39 30C38 24 30 14 30 14Z" fill="url(#bkFlame)" opacity="0.9"/>'
    // Bottom flame (rotated 180)
    + '<path d="M30 66C30 66 38 56 39 50C40 44 36 40 33 38C33 38 35 43 33 48C32 51 31 53 30 56C29 53 28 51 27 48C25 43 27 38 27 38C24 40 20 44 21 50C22 56 30 66 30 66Z" fill="url(#bkFlame)" opacity="0.9"/>'
    // Center divider dot
    + '<circle cx="30" cy="40" r="2" fill="#FFB800" opacity="0.4"/>'
    + '</svg>';

  // Card back sizes
  var backSizes = [
    { w: 100, h: 140, lbl: 'Home (100x140)' },
    { w: 110, h: 154, lbl: 'Draft (110x154)' },
    { w: 80, h: 110, lbl: 'Gameplay (80x110)' },
  ];

  backSizes.forEach(function(sz) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'text-align:center;';
    var card = document.createElement('div');
    card.style.cssText = 'width:' + sz.w + 'px;height:' + sz.h + 'px;border-radius:8px;border:2px solid #FFB800;background:#0A0804;overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.5);';
    card.innerHTML = backFlameSvg;
    wrap.appendChild(card);
    wrap.appendChild(label(sz.lbl));
    backRow.appendChild(wrap);
  });
  el.appendChild(backRow);

  // ============================================================
  // SECTION 2: PLAYER CARDS
  // ============================================================
  el.appendChild(secTitle('PLAYER CARDS — Draft Size (110x154)'));
  var playerRow = cardRow();

  var players = [
    { name: 'COLT AVERY', pos: 'QB', ovr: 78, badge: 'ARM', tier: 'silver', teamColor: '#FF4511' },
    { name: 'QUEZ SAMPSON', pos: 'WR', ovr: 80, badge: 'SPD', tier: 'gold', teamColor: '#FF4511' },
    { name: 'MACK TORRES', pos: 'FB', ovr: 82, badge: 'BRK', tier: 'gold', teamColor: '#CC1A1A' },
    { name: 'BO KENDRICK', pos: 'QB', ovr: 80, badge: 'IQ', tier: 'gold', teamColor: '#CC1A1A' },
  ];

  var tierColors = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFB800' };

  players.forEach(function(p) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'text-align:center;';
    var tc = tierColors[p.tier];
    var card = document.createElement('div');
    card.style.cssText = 'width:110px;height:154px;border-radius:8px;border:2px solid ' + tc + '44;background:radial-gradient(ellipse at 50% 30%,#141008,#0A0804);overflow:hidden;position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.5);';

    // Top bar: POS | badge | OVR
    var topBar = document.createElement('div');
    topBar.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;padding:6px 8px 0;position:relative;z-index:2;';
    topBar.innerHTML = "<div style=\"font-family:'Rajdhani',sans-serif;font-weight:700;font-size:11px;color:#ff0040;letter-spacing:2px;\">" + p.pos + "</div>"
      + "<div style=\"width:14px;height:14px;border-radius:50%;background:" + tc + "22;border:1px solid " + tc + "44;display:flex;align-items:center;justify-content:center;font-size:7px;color:" + tc + ";\">" + p.badge.charAt(0) + "</div>"
      + "<div style=\"font-family:'Rajdhani',sans-serif;font-weight:700;font-size:24px;color:" + tc + ";line-height:1;text-shadow:0 0 8px " + tc + "66;\">" + p.ovr + "</div>";
    card.appendChild(topBar);

    // Art zone (placeholder — gradient silhouette)
    var artZone = document.createElement('div');
    artZone.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;padding:8px;';
    artZone.innerHTML = '<div style="width:60px;height:80px;border-radius:50% 50% 0 0;background:linear-gradient(180deg,' + p.teamColor + '33,transparent);opacity:0.4;"></div>';
    card.appendChild(artZone);

    // Bottom gradient overlay
    var bottomGrad = document.createElement('div');
    bottomGrad.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:40%;background:linear-gradient(transparent,#0A0804);z-index:1;';
    card.appendChild(bottomGrad);

    // Name bar
    var nameBar = document.createElement('div');
    nameBar.style.cssText = "position:absolute;bottom:0;left:0;right:0;padding:4px 8px;z-index:2;border-bottom:2px solid " + p.teamColor + ";";
    nameBar.innerHTML = "<div style=\"font-family:'Teko',sans-serif;font-weight:700;font-size:13px;color:#fff;line-height:1;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\">" + p.name + "</div>";
    card.appendChild(nameBar);

    wrap.appendChild(card);
    wrap.appendChild(label(p.name));
    playerRow.appendChild(wrap);
  });
  el.appendChild(playerRow);

  // Compact player cards
  el.appendChild(secTitle('PLAYER CARDS — Gameplay Size (80x110)'));
  var compactRow = cardRow();
  players.forEach(function(p) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'text-align:center;';
    var tc = tierColors[p.tier];
    var card = document.createElement('div');
    card.style.cssText = 'width:80px;height:110px;border-radius:6px;border:2px solid ' + tc + '44;background:radial-gradient(ellipse at 50% 30%,#141008,#0A0804);overflow:hidden;position:relative;box-shadow:0 3px 10px rgba(0,0,0,0.5);';

    // Compact top bar
    var topBar = document.createElement('div');
    topBar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 6px 0;z-index:2;position:relative;';
    topBar.innerHTML = "<div style=\"font-family:'Rajdhani',sans-serif;font-weight:700;font-size:9px;color:#ff0040;letter-spacing:1px;\">" + p.pos + "</div>"
      + "<div style=\"font-family:'Rajdhani',sans-serif;font-weight:700;font-size:18px;color:" + tc + ";line-height:1;\">" + p.ovr + "</div>";
    card.appendChild(topBar);

    // Art placeholder
    var artZone = document.createElement('div');
    artZone.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;';
    artZone.innerHTML = '<div style="width:40px;height:50px;border-radius:50% 50% 0 0;background:linear-gradient(180deg,' + p.teamColor + '33,transparent);opacity:0.3;"></div>';
    card.appendChild(artZone);

    // Bottom gradient + name
    var bottomGrad = document.createElement('div');
    bottomGrad.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:35%;background:linear-gradient(transparent,#0A0804);z-index:1;';
    card.appendChild(bottomGrad);
    var nameBar = document.createElement('div');
    nameBar.style.cssText = "position:absolute;bottom:0;left:0;right:0;padding:3px 5px;z-index:2;border-bottom:2px solid " + p.teamColor + ";";
    nameBar.innerHTML = "<div style=\"font-family:'Teko',sans-serif;font-weight:700;font-size:10px;color:#fff;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\">" + p.name.split(' ').pop() + "</div>";
    card.appendChild(nameBar);

    wrap.appendChild(card);
    wrap.appendChild(label(p.pos + ' ' + p.ovr));
    compactRow.appendChild(wrap);
  });
  el.appendChild(compactRow);

  // ============================================================
  // SECTION 3: PLAY CARDS
  // ============================================================
  el.appendChild(secTitle('PLAY CARDS — Offense (80x120)'));
  var offPlayRow = cardRow();

  var offPlays = [
    { name: 'HAIL MARY', cat: 'DEEP', catColor: '#ff0040', risk: 'high', desc: 'Go deep' },
    { name: 'MESH', cat: 'SHORT', catColor: '#00ff44', risk: 'low', desc: 'Man killer' },
    { name: 'BUBBLE SCREEN', cat: 'SCREEN', catColor: '#ff66aa', risk: 'med', desc: 'Quick lateral' },
    { name: 'DRAW', cat: 'RUN', catColor: '#ff8800', risk: 'med', desc: 'Play-action run' },
  ];

  var riskIcons = { high: '\u26A1', med: '\u25C6', low: '\u25CF' };
  var riskColors = { high: '#ff0040', med: '#ff8800', low: '#00ff44' };

  offPlays.forEach(function(p) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'text-align:center;';
    var card = document.createElement('div');
    card.style.cssText = 'width:80px;height:120px;border-radius:6px;border:2px solid ' + p.catColor + '33;background:radial-gradient(ellipse at 50% 40%,#0A1A06,#0A0804);overflow:hidden;position:relative;box-shadow:0 3px 10px rgba(0,0,0,0.5);';

    // Top stripe
    var stripe = document.createElement('div');
    stripe.style.cssText = 'height:3px;background:' + p.catColor + ';';
    card.appendChild(stripe);

    // Header: name + cat pill
    var header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:3px 5px 0;';
    header.innerHTML = "<div style=\"font-family:'Teko',sans-serif;font-weight:700;font-size:11px;color:#fff;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;margin-right:3px;\">" + p.name + "</div>"
      + "<div style=\"font-family:'Rajdhani',sans-serif;font-weight:700;font-size:6px;color:" + p.catColor + ";letter-spacing:0.5px;white-space:nowrap;\">" + p.cat + "</div>";
    card.appendChild(header);

    // Diagram area (placeholder — route lines)
    var diagram = document.createElement('div');
    diagram.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;padding:4px;';
    diagram.innerHTML = '<svg viewBox="0 0 50 40" width="60" height="48" fill="none">'
      + '<circle cx="25" cy="35" r="3" fill="#FFB800" opacity="0.8"/>'
      + '<circle cx="12" cy="32" r="2" fill="#FFB800" opacity="0.6"/>'
      + '<circle cx="38" cy="32" r="2" fill="#FFB800" opacity="0.6"/>'
      + '<path d="M12 32L8 18" stroke="#FFB800" stroke-width="1.2" opacity="0.7"/>'
      + '<path d="M38 32L42 15" stroke="#FFB800" stroke-width="1.2" opacity="0.7"/>'
      + '<path d="M25 35L25 20" stroke="#FFB800" stroke-width="1" stroke-dasharray="2 1.5" opacity="0.5"/>'
      + '<polygon points="8,17 9.5,19 6.5,19" fill="#FFB800" opacity="0.6"/>'
      + '<polygon points="42,14 43.5,16 40.5,16" fill="#FFB800" opacity="0.6"/>'
      + '</svg>';
    card.appendChild(diagram);

    // Footer: desc + risk icon
    var footer = document.createElement('div');
    footer.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:2px 5px 4px;';
    footer.innerHTML = "<div style=\"font-family:'Rajdhani',sans-serif;font-weight:500;font-size:8px;color:#aaa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\">" + p.desc + "</div>"
      + "<div style=\"font-size:8px;color:" + riskColors[p.risk] + ";\">" + riskIcons[p.risk] + "</div>";
    card.appendChild(footer);

    wrap.appendChild(card);
    wrap.appendChild(label(p.cat));
    offPlayRow.appendChild(wrap);
  });
  el.appendChild(offPlayRow);

  // Defense play cards
  el.appendChild(secTitle('PLAY CARDS — Defense (80x120)'));
  var defPlayRow = cardRow();

  var defPlays = [
    { name: 'COVER 0 BLITZ', cat: 'BLITZ', catColor: '#ff0040', risk: 'high', desc: 'All out rush' },
    { name: 'COVER 3 SKY', cat: 'ZONE', catColor: '#4DA6FF', risk: 'low', desc: 'Deep thirds' },
    { name: 'A-GAP MUG', cat: 'PRESSURE', catColor: '#FFB800', risk: 'med', desc: 'Interior pressure' },
    { name: 'MAN PRESS', cat: 'BLITZ', catColor: '#ff0040', risk: 'med', desc: 'Tight coverage' },
  ];

  defPlays.forEach(function(p) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'text-align:center;';
    var card = document.createElement('div');
    card.style.cssText = 'width:80px;height:120px;border-radius:6px;border:2px solid ' + p.catColor + '33;background:radial-gradient(ellipse at 50% 40%,#0A1420,#0A0804);overflow:hidden;position:relative;box-shadow:0 3px 10px rgba(0,0,0,0.5);';

    var stripe = document.createElement('div');
    stripe.style.cssText = 'height:3px;background:' + p.catColor + ';';
    card.appendChild(stripe);

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:3px 5px 0;';
    header.innerHTML = "<div style=\"font-family:'Teko',sans-serif;font-weight:700;font-size:11px;color:#fff;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;margin-right:3px;\">" + p.name + "</div>"
      + "<div style=\"font-family:'Rajdhani',sans-serif;font-weight:700;font-size:6px;color:" + p.catColor + ";letter-spacing:0.5px;white-space:nowrap;\">" + p.cat + "</div>";
    card.appendChild(header);

    // Defense diagram (zone arcs)
    var diagram = document.createElement('div');
    diagram.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;padding:4px;';
    diagram.innerHTML = '<svg viewBox="0 0 50 40" width="60" height="48" fill="none">'
      + '<circle cx="15" cy="10" r="2" fill="#4DA6FF" opacity="0.7"/>'
      + '<circle cx="35" cy="10" r="2" fill="#4DA6FF" opacity="0.7"/>'
      + '<circle cx="25" cy="15" r="2" fill="#4DA6FF" opacity="0.7"/>'
      + '<path d="M8 8Q25 28 42 8" stroke="#4DA6FF" stroke-width="1" stroke-dasharray="2 1.5" fill="none" opacity="0.5"/>'
      + '<circle cx="25" cy="34" r="2.5" fill="#4DA6FF" opacity="0.6"/>'
      + '<path d="M25 34L20 38" stroke="#4DA6FF" stroke-width="0.8" opacity="0.4"/>'
      + '<path d="M25 34L30 38" stroke="#4DA6FF" stroke-width="0.8" opacity="0.4"/>'
      + '</svg>';
    card.appendChild(diagram);

    var footer = document.createElement('div');
    footer.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:2px 5px 4px;';
    footer.innerHTML = "<div style=\"font-family:'Rajdhani',sans-serif;font-weight:500;font-size:8px;color:#aaa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\">" + p.desc + "</div>"
      + "<div style=\"font-size:8px;color:" + riskColors[p.risk] + ";\">" + riskIcons[p.risk] + "</div>";
    card.appendChild(footer);

    wrap.appendChild(card);
    wrap.appendChild(label(p.cat));
    defPlayRow.appendChild(wrap);
  });
  el.appendChild(defPlayRow);

  // ============================================================
  // SECTION 4: TORCH CARDS
  // ============================================================
  el.appendChild(secTitle('TORCH CARDS — Special/Wild'));
  var torchRow = cardRow();

  var torchCards = [
    { name: 'CHALLENGE FLAG', tier: 'GOLD', effect: 'Challenge a play call' },
    { name: 'MOMENTUM SHIFT', tier: 'SILVER', effect: '+3 yards next play' },
    { name: 'AUDIBLE', tier: 'BRONZE', effect: 'Change your play' },
  ];

  var torchTierBorders = { GOLD: '#FFB800', SILVER: '#C0C0C0', BRONZE: '#CD7F32' };

  torchCards.forEach(function(tc) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'text-align:center;';
    var bc = torchTierBorders[tc.tier];
    var card = document.createElement('div');
    card.style.cssText = 'width:90px;height:126px;border-radius:7px;border:2px solid ' + bc + ';background:radial-gradient(ellipse at 50% 35%,#1a0800,#0A0804);overflow:hidden;position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.5),0 0 12px rgba(255,69,17,0.15);';

    // Top: tier label
    var tierLabel = document.createElement('div');
    tierLabel.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:700;font-size:7px;color:" + bc + ";letter-spacing:1.5px;text-align:center;padding:4px 0 0;opacity:0.7;";
    tierLabel.textContent = tc.tier;
    card.appendChild(tierLabel);

    // Center: flame icon
    var flameArea = document.createElement('div');
    flameArea.style.cssText = 'display:flex;align-items:center;justify-content:center;height:54px;';
    flameArea.innerHTML = '<svg viewBox="-4 -4 52 60" fill="none" width="40" height="46">'
      + '<defs><linearGradient id="tcGrad" x1="22" y1="50" x2="22" y2="0"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="#FFB800"/></linearGradient></defs>'
      + '<path d="M22 0C22 0 6 16 4 28C2 40 12 48 18 52C18 52 13 42 18 30C20 24 21 19 22 13C23 19 24 24 26 30C31 42 26 52 26 52C32 48 42 40 40 28C38 16 22 0 22 0Z" fill="url(#tcGrad)" stroke="#FF4511" stroke-width="0.8"/>'
      + '</svg>';
    card.appendChild(flameArea);

    // Name
    var nameLine = document.createElement('div');
    nameLine.style.cssText = "font-family:'Teko',sans-serif;font-weight:700;font-size:12px;color:#fff;text-align:center;line-height:1;letter-spacing:1px;padding:0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
    nameLine.textContent = tc.name;
    card.appendChild(nameLine);

    // Effect
    var effectLine = document.createElement('div');
    effectLine.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:500;font-size:8px;color:#aaa;text-align:center;padding:2px 6px 0;line-height:1.2;";
    effectLine.textContent = tc.effect;
    card.appendChild(effectLine);

    // Bottom accent
    var accent = document.createElement('div');
    accent.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:3px;background:' + bc + ';opacity:0.6;';
    card.appendChild(accent);

    wrap.appendChild(card);
    wrap.appendChild(label(tc.tier));
    torchRow.appendChild(wrap);
  });
  el.appendChild(torchRow);

  // ============================================================
  // SECTION 5: CARD FLIP DEMO
  // ============================================================
  el.appendChild(secTitle('CARD FLIP — Tap to flip'));
  var flipRow = cardRow();

  var flipCard = document.createElement('div');
  flipCard.style.cssText = 'width:100px;height:140px;perspective:900px;cursor:pointer;';
  var flipInner = document.createElement('div');
  flipInner.style.cssText = 'width:100%;height:100%;position:relative;transition:transform 0.6s cubic-bezier(0.4,0,0.2,1);transform-style:preserve-3d;';

  // Front face (a player card)
  var flipFront = document.createElement('div');
  flipFront.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;border-radius:8px;border:2px solid #FFB80044;background:radial-gradient(ellipse at 50% 30%,#141008,#0A0804);overflow:hidden;display:flex;flex-direction:column;';
  flipFront.innerHTML = "<div style=\"padding:6px 8px;display:flex;justify-content:space-between;\">"
    + "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:11px;color:#ff0040;\">QB</div>"
    + "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:22px;color:#FFB800;line-height:1;\">78</div></div>"
    + "<div style=\"flex:1;display:flex;align-items:center;justify-content:center;\"><div style='width:50px;height:60px;border-radius:50% 50% 0 0;background:linear-gradient(180deg,#FF451133,transparent);opacity:0.4;'></div></div>"
    + "<div style=\"position:absolute;bottom:0;left:0;right:0;height:35%;background:linear-gradient(transparent,#0A0804);\"></div>"
    + "<div style=\"position:absolute;bottom:0;left:0;right:0;padding:4px 8px;border-bottom:2px solid #FF4511;z-index:2;\">"
    + "<div style=\"font-family:'Teko';font-weight:700;font-size:12px;color:#fff;\">COLT AVERY</div></div>";
  flipInner.appendChild(flipFront);

  // Back face
  var flipBack = document.createElement('div');
  flipBack.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);border-radius:8px;border:2px solid #FFB800;background:#0A0804;overflow:hidden;display:flex;align-items:center;justify-content:center;';
  flipBack.innerHTML = backFlameSvg;
  flipInner.appendChild(flipBack);

  var isFlipped = false;
  flipCard.onclick = function() {
    isFlipped = !isFlipped;
    flipInner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
  };
  flipCard.appendChild(flipInner);

  var flipWrap = document.createElement('div');
  flipWrap.style.cssText = 'text-align:center;';
  flipWrap.appendChild(flipCard);
  flipWrap.appendChild(label('TAP TO FLIP'));
  flipRow.appendChild(flipWrap);
  el.appendChild(flipRow);

  // Build label
  var buildLabel = document.createElement('div');
  buildLabel.style.cssText = "position:fixed;bottom:8px;left:0;right:0;text-align:center;font-family:'Rajdhani',sans-serif;font-size:10px;color:#ffffff33;letter-spacing:1px;z-index:100;";
  buildLabel.textContent = 'CARD MOCKUPS \u00b7 v' + VERSION;
  el.appendChild(buildLabel);

  return el;
}
