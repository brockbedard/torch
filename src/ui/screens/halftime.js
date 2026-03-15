/**
 * TORCH — Halftime Screen
 * Shows 1st half summary and the Halftime Card Shop.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOtherTeam } from '../../state.js';
import { TORCH_CARDS } from '../../data/torchCards.js';

export function buildHalftime() {
  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow-y:auto;';

  var gs = GS.engine;
  var team = getTeam(gs.humanTeam);
  var opp = getOtherTeam(gs.humanTeam);
  var isHumanCT = gs.humanTeam === 'CT';

  var humanScore = isHumanCT ? gs.ctScore : gs.irScore;
  var cpuScore = isHumanCT ? gs.irScore : gs.ctScore;
  var humanPts = isHumanCT ? gs.ctTorchPts : gs.irTorchPts;

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText = 'background:rgba(0,0,0,0.7);padding:12px 14px;text-align:center;flex-shrink:0;border-bottom:2px solid var(--a-gold);';
  var hdrTitle = document.createElement('div');
  hdrTitle.style.cssText = "font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--a-gold);letter-spacing:3px;font-style:italic;transform:skewX(-10deg);text-shadow:2px 2px 0 #000, 0 0 10px var(--a-gold);";
  hdrTitle.textContent = 'HALFTIME REPORT';
  hdr.appendChild(hdrTitle);
  el.appendChild(hdr);

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;padding:20px 16px 40px;display:flex;flex-direction:column;align-items:center;gap:24px;';

  // Score Summary
  var scoreBlock = document.createElement('div');
  scoreBlock.style.cssText = 'display:flex;align-items:center;gap:20px;';
  var teamBlock = (name, score, color) => {
    var b = document.createElement('div'); b.style.textAlign = 'center';
    var n = document.createElement('div'); n.style.cssText = `font-family:'Bebas Neue';font-size:24px;color:${color};letter-spacing:2px;`;
    n.textContent = name;
    var s = document.createElement('div'); s.style.cssText = "font-family:'Press Start 2P';font-size:32px;color:#fff;text-shadow:0 0 15px rgba(255,255,255,0.3);";
    s.textContent = score;
    b.append(n, s); return b;
  };
  scoreBlock.append(teamBlock(team.name, humanScore, team.accent), teamBlock(opp.name, cpuScore, opp.accent));
  content.appendChild(scoreBlock);

  // Shop Section
  var shopBox = document.createElement('div');
  shopBox.style.cssText = 'width:100%;max-width:350px;background:var(--bg-surface);border:1px solid #333;border-radius:10px;padding:16px;';
  
  var shopHdr = document.createElement('div');
  shopHdr.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid #222;padding-bottom:8px;";
  shopHdr.innerHTML = `
    <div style="font-family:'Press Start 2P';font-size:10px;color:var(--a-gold);">LOCKER ROOM SHOP</div>
    <div style="font-family:'Press Start 2P';font-size:9px;color:var(--l-green);">${humanPts} PTS</div>
  `;
  shopBox.appendChild(shopHdr);

  // Offers
  var offersRow = document.createElement('div');
  offersRow.style.cssText = 'display:flex;gap:8px;';
  
  // Logic to get 3 random offers (weighted)
  const getOffer = () => {
    const r = Math.random();
    let tier;
    if (r < 0.50) tier = 'BRONZE';
    else if (r < 0.85) tier = 'SILVER';
    else tier = 'GOLD';
    const pool = TORCH_CARDS.filter(c => c.tier === tier);
    return pool[Math.floor(Math.random() * pool.length)];
  };
  const offers = [getOffer(), getOffer(), getOffer()];

  offers.forEach(card => {
    var cardEl = document.createElement('div');
    var canAfford = humanPts >= card.cost;
    var alreadyHas3 = gs.humanTorchCards.length >= 3;

    cardEl.style.cssText = `flex:1;background:#000;border:1px solid ${card.tier==='GOLD'?'var(--a-gold)':card.tier==='SILVER'?'#aaa':'#CD7F32'};border-radius:6px;padding:8px;text-align:center;cursor:${canAfford&&!alreadyHas3?'pointer':'not-allowed'};opacity:${canAfford&&!alreadyHas3?'1':'0.5'};transition:transform 0.1s;`;
    cardEl.innerHTML = `
      <div style="font-size:6px;color:var(--muted);">${card.tier}</div>
      <div style="font-family:'Bebas Neue';font-size:13px;color:#fff;margin:2px 0;">${card.name}</div>
      <div style="font-family:'Press Start 2P';font-size:8px;color:var(--l-green);">${card.cost}P</div>
    `;

    if (canAfford && !alreadyHas3) {
      cardEl.onclick = () => {
        SND.snap();
        gs.humanTorchCards.push(card.id);
        if (isHumanCT) gs.ctTorchPts -= card.cost;
        else gs.irTorchPts -= card.cost;
        render(); // Refresh halftime shop
      };
      cardEl.onmouseenter = () => cardEl.style.transform = 'scale(1.05)';
      cardEl.onmouseleave = () => cardEl.style.transform = 'scale(1)';
    }
    offersRow.appendChild(cardEl);
  });
  shopBox.appendChild(offersRow);
  content.appendChild(shopBox);

  // Resume Button
  var resumeBtn = document.createElement('button');
  resumeBtn.className = 'btn-blitz';
  resumeBtn.style.cssText = 'width:100%;max-width:300px;background:var(--l-green);border-color:var(--l-green);color:#000;font-size:16px;box-shadow:6px 6px 0 #006622;';
  resumeBtn.textContent = 'START SECOND HALF \u2192';
  resumeBtn.onclick = () => {
    SND.snap();
    gs.startSecondHalf();
    setGs(s => ({ ...s, screen: 'gameplay' }));
  };
  content.appendChild(resumeBtn);

  el.appendChild(content);
  return el;
}
