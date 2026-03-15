/**
 * TORCH — Coin Toss Screen
 * Winner picks from 3 random Bronze/Silver Torch Cards OR receives at 50.
 * Loser takes whatever winner didn't pick.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOtherTeam, fmtClock } from '../../state.js';
import { TORCH_CARDS } from '../../data/torchCards.js';

function getRandomCards(count) {
  // Weighted: Bronze/Silver only, no Gold
  var pool = TORCH_CARDS.filter(function(c) { return c.tier !== 'GOLD'; });
  var shuffled = pool.slice().sort(function() { return Math.random() - 0.5; });
  return shuffled.slice(0, count);
}

export function buildCoinToss() {
  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);';

  var team = getTeam(GS.team);
  var opp = getOtherTeam(GS.team);

  // Inject animations
  var styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes coinSpin { 0% { transform:rotateY(0deg); } 100% { transform:rotateY(1080deg); } }' +
    '@keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }' +
    '@keyframes pulseGold { 0%,100% { box-shadow:0 0 20px rgba(255,204,0,0.3); } 50% { box-shadow:0 0 40px rgba(255,204,0,0.6); } }' +
    '@keyframes cardStolen { 0% { transform:scale(1); opacity:1; } 100% { transform:translateY(-100px) scale(0.5); opacity:0; } }';
  el.appendChild(styleEl);

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText =
    'background:rgba(0,0,0,0.5);padding:10px 14px;display:flex;justify-content:center;' +
    'align-items:center;flex-shrink:0;border-bottom:2px solid var(--f-purple);';
  var hdrTitle = document.createElement('div');
  hdrTitle.style.cssText =
    "font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--a-gold);" +
    "letter-spacing:3px;font-style:italic;transform:skewX(-10deg);" +
    "text-shadow:2px 2px 0 #000, 0 0 10px var(--a-gold);";
  hdrTitle.textContent = '6. COIN TOSS';
  hdr.appendChild(hdrTitle);
  el.appendChild(hdr);

  // Content
  var content = document.createElement('div');
  content.style.cssText =
    'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'padding:30px 20px;text-align:center;gap:20px;';

  // Phase 1: Coin flip animation
  var coinPhase = document.createElement('div');
  coinPhase.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:16px;';

  var coin = document.createElement('div');
  coin.style.cssText =
    'width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg, #FFD700, #B8860B);' +
    'display:flex;align-items:center;justify-content:center;font-size:36px;' +
    'box-shadow:0 0 30px rgba(255,204,0,0.4);animation:coinSpin 1.5s ease-out forwards;';
  coin.textContent = '\uD83C\uDFC8';

  var flipText = document.createElement('div');
  flipText.style.cssText =
    "font-family:'Bebas Neue',sans-serif;font-size:24px;color:#fff;letter-spacing:2px;";
  flipText.textContent = 'FLIPPING...';

  coinPhase.append(coin, flipText);
  content.appendChild(coinPhase);

  // Determine winner (human wins 50/50)
  var humanWins = Math.random() < 0.5;
  var winnerName = humanWins ? team.name : opp.name;

  // After animation, show result
  setTimeout(function() {
    flipText.textContent = winnerName + ' WINS THE TOSS!';
    flipText.style.color = 'var(--a-gold)';

    // Phase 2: Choice
    var choicePhase = document.createElement('div');
    choicePhase.style.cssText =
      'display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;max-width:350px;' +
      'animation:fadeSlideUp 0.4s ease-out forwards;';

    if (humanWins) {
      // Human chooses: pick a Torch Card OR receive at 50
      var choiceLabel = document.createElement('div');
      choiceLabel.style.cssText =
        "font-family:'Press Start 2P',monospace;font-size:9px;color:var(--muted);" +
        "letter-spacing:1px;margin-bottom:4px;";
      choiceLabel.textContent = 'CHOOSE YOUR REWARD';
      choicePhase.appendChild(choiceLabel);

      // Torch Card options
      var cards = getRandomCards(3);
      var cardRow = document.createElement('div');
      cardRow.style.cssText = 'display:flex;gap:8px;width:100%;';

      cards.forEach(function(card) {
        var cardEl = document.createElement('div');
        cardEl.style.cssText =
          'flex:1;background:var(--bg-surface);border:2px solid ' +
          (card.tier === 'SILVER' ? '#aaa' : '#CD7F32') +
          ';border-radius:6px;padding:10px 8px;cursor:pointer;text-align:center;' +
          'transition:all 0.15s ease;';

        var tierEl = document.createElement('div');
        tierEl.style.cssText =
          "font-family:'Courier New',monospace;font-size:7px;font-weight:bold;" +
          "color:" + (card.tier === 'SILVER' ? '#aaa' : '#CD7F32') + ";" +
          "letter-spacing:1px;margin-bottom:4px;";
        tierEl.textContent = card.tier;

        var nameEl = document.createElement('div');
        nameEl.style.cssText =
          "font-family:'Bebas Neue',sans-serif;font-size:14px;color:#fff;line-height:1.1;margin-bottom:4px;";
        nameEl.textContent = card.name;

        var descEl = document.createElement('div');
        descEl.style.cssText =
          "font-family:'Courier New',monospace;font-size:7px;color:var(--muted);line-height:1.3;";
        descEl.textContent = card.effect;

        cardEl.append(tierEl, nameEl, descEl);

        cardEl.onmouseenter = function() { cardEl.style.borderColor = '#00ff88'; cardEl.style.boxShadow = '0 0 15px rgba(0,255,136,0.3)'; };
        cardEl.onmouseleave = function() { cardEl.style.borderColor = card.tier === 'SILVER' ? '#aaa' : '#CD7F32'; cardEl.style.boxShadow = 'none'; };

        cardEl.onclick = function() {
          SND.snap();
          cardEl.style.transition = 'all 0.5s cubic-bezier(.34,1.56,.64,1)';
          cardEl.style.transform = 'scale(1.2) translateY(-20px)';
          cardEl.style.boxShadow = '0 0 50px var(--a-gold)';
          cardEl.style.zIndex = '100';
          setTimeout(() => startGame([card]), 600);
        };

        cardRow.appendChild(cardEl);
      });

      choicePhase.appendChild(cardRow);

      // OR divider
      var orDiv = document.createElement('div');
      orDiv.style.cssText =
        "font-family:'Press Start 2P',monospace;font-size:8px;color:var(--muted);letter-spacing:2px;";
      orDiv.textContent = '- OR -';
      choicePhase.appendChild(orDiv);

      // Receive at 50
      var receiveBtn = document.createElement('button');
      receiveBtn.className = 'btn-blitz';
      receiveBtn.style.cssText =
        'width:100%;font-size:12px;background:var(--a-gold);border-color:var(--f-purple);' +
        'color:#000;box-shadow:6px 6px 0 var(--f-purple), 10px 10px 0 #000;animation:pulseGold 2s infinite;';
      receiveBtn.textContent = 'RECEIVE AT THE 50';
      receiveBtn.onclick = function() {
        SND.snap();
        startGame([], true);
      };
      choicePhase.appendChild(receiveBtn);
    } else {
      // CPU won — CPU picks a random card, human gets the ball
      var cpuCard = getRandomCards(1)[0];
      
      var cpuChoiceWrap = document.createElement('div');
      cpuChoiceWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;';
      
      var cardPreview = document.createElement('div');
      cardPreview.style.cssText = 'width:120px;background:var(--bg-surface);border:2px solid var(--p-red);border-radius:6px;padding:12px;text-align:center;position:relative;animation:cardStolen 1.5s ease-in-out forwards;';
      cardPreview.innerHTML = `<div style="font-size:8px;color:var(--p-red);margin-bottom:4px;">${cpuCard.tier}</div><div style="font-size:14px;font-family:'Bebas Neue';color:#fff;">${cpuCard.name}</div>`;
      cpuChoiceWrap.appendChild(cardPreview);

      var cpuMsg = document.createElement('div');
      cpuMsg.style.cssText =
        "font-family:'Barlow Condensed',sans-serif;font-size:16px;color:var(--muted);line-height:1.5;opacity:0;transition:opacity 0.5s;";
      cpuMsg.textContent = opp.name + ' takes a ' + cpuCard.tier + ' Torch Card. You receive at the 50.';
      cpuChoiceWrap.appendChild(cpuMsg);
      
      setTimeout(() => cpuMsg.style.opacity = '1', 800);

      var continueBtn = document.createElement('button');
      continueBtn.className = 'btn-blitz';
      continueBtn.style.cssText =
        'width:100%;font-size:14px;margin-top:8px;background:var(--a-gold);' +
        'border-color:var(--f-purple);color:#000;box-shadow:6px 6px 0 var(--f-purple), 10px 10px 0 #000;animation:pulseGold 2s infinite;opacity:0;transition:opacity 0.5s;';
      continueBtn.textContent = 'PLAY BALL';
      continueBtn.onclick = function() {
        SND.snap();
        startGame([], true);
      };
      cpuChoiceWrap.appendChild(continueBtn);
      setTimeout(() => continueBtn.style.opacity = '1', 1500);

      choicePhase.appendChild(cpuChoiceWrap);
    }

    content.appendChild(choicePhase);
  }, 1800);

  el.appendChild(content);

  function startGame(humanTorchCards, humanReceives) {
    setGs(function(s) {
      return Object.assign({}, s, {
        screen: 'gameplay',
        humanTorchCards: humanTorchCards || [],
        humanReceives: !!humanReceives,
      });
    });
  }

  return el;
}
