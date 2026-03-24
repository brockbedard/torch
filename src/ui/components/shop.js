/**
 * TORCH v0.21 — TORCH Card Shop (Bottom Sheet)
 * Opens at trigger moments. Shows 1 card (or 3 at halftime/between-game).
 * Buy deducts from TORCH points (score = wallet).
 * 3-slot inventory limit with swap mechanic.
 */

import { SND } from '../../engine/sound.js';
import { TORCH_CARDS, getRandomCard, SHOP_WEIGHTS } from '../../data/torchCards.js';
import { buildTorchCard } from './cards.js';

// ============================================================
// SHOP BOTTOM SHEET
// ============================================================

/**
 * Show the TORCH card shop.
 * @param {HTMLElement} container — element to append the shop to
 * @param {string} trigger — 'touchdown'|'turnover'|'fourthDownStop'|'starActivation'|'halftime'|'betweenGame'
 * @param {number} points — current TORCH points (score)
 * @param {Array} inventory — current card inventory (max 3 objects)
 * @param {function} onBuy — callback(card, newInventory, pointsSpent)
 * @param {function} onClose — callback() when shop closes
 */
export function showShop(container, trigger, points, inventory, onBuy, onClose) {
  var weights = SHOP_WEIGHTS[trigger] || SHOP_WEIGHTS.touchdown;
  var isMulti = trigger === 'halftime' || trigger === 'betweenGame';
  var cardCount = isMulti ? 3 : 1;

  // Generate offers
  var offers = [];
  for (var i = 0; i < cardCount; i++) {
    offers.push(getRandomCard(weights));
  }

  // Build bottom sheet overlay
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:auto;';

  // Backdrop (tap to close)
  var backdrop = document.createElement('div');
  backdrop.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.5);';
  backdrop.onclick = function() { closeShop(); };
  overlay.appendChild(backdrop);

  // Sheet
  var sheet = document.createElement('div');
  sheet.style.cssText = 'position:relative;z-index:1;background:var(--bg-surface,#141008);border-top:2px solid var(--a-gold,#FFB800);border-radius:12px 12px 0 0;padding:14px 12px 20px;transform:translateY(100%);transition:transform 0.3s cubic-bezier(0.22,1.3,0.36,1);';

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;";
  hdr.innerHTML =
    "<div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:var(--a-gold,#FFB800);letter-spacing:2px;\">TORCH CARDS</div>" +
    "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:var(--l-green,#00ff44);\">" + points + " PTS</div>";
  sheet.appendChild(hdr);

  // Inventory indicator (3 slots)
  var invRow = document.createElement('div');
  invRow.style.cssText = "display:flex;gap:4px;margin-bottom:10px;";
  for (var s = 0; s < 3; s++) {
    var slot = document.createElement('div');
    var hasCard = inventory[s];
    slot.style.cssText = "flex:1;height:4px;border-radius:2px;background:" + (hasCard ? 'var(--a-gold,#FFB800)' : '#333') + ";";
    invRow.appendChild(slot);
  }
  sheet.appendChild(invRow);

  // Card offers
  var offersRow = document.createElement('div');
  offersRow.style.cssText = 'display:flex;gap:8px;justify-content:center;';

  offers.forEach(function(card) {
    var canAfford = points >= card.cost;
    var isFull = inventory.length >= 3;

    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;max-width:110px;overflow:hidden;';

    // Card visual
    var cardEl = buildTorchCard(card, 80, 112);
    if (!canAfford) cardEl.style.opacity = '0.4';
    wrap.appendChild(cardEl);

    // Cost
    var costEl = document.createElement('div');
    costEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:11px;color:" + (canAfford ? 'var(--l-green,#00ff44)' : 'var(--p-red,#ff0040)') + ";";
    costEl.textContent = card.cost + 'P';
    wrap.appendChild(costEl);

    // Effect text — clamped to 2 lines
    var effectEl = document.createElement('div');
    effectEl.style.cssText = "font-family:'Rajdhani';font-size:7px;color:#aaa;text-align:center;line-height:1.2;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;max-height:1.8em;";
    effectEl.textContent = card.effect;
    wrap.appendChild(effectEl);

    // Buy button
    var buyBtn = document.createElement('button');
    buyBtn.className = 'btn-blitz';
    buyBtn.style.cssText = 'font-size:9px;padding:8px 12px;width:100%;position:relative;z-index:2;' +
      (canAfford ? 'background:var(--a-gold,#FFB800);color:#000;border-color:var(--torch,#FF4511);' : 'background:#333;color:#666;border-color:#333;cursor:not-allowed;');
    buyBtn.textContent = isFull && canAfford ? 'SWAP' : canAfford ? 'BUY' : "CAN'T AFFORD";
    buyBtn.disabled = !canAfford;

    if (canAfford) {
      buyBtn.onclick = function() {
        SND.snap();
        if (isFull) {
          // Show swap UI — pick which card to drop
          showSwapUI(sheet, inventory, card, points, function(newInv, spent) {
            onBuy(card, newInv, spent);
            closeShop();
          });
        } else {
          // Direct buy
          var newInv = inventory.slice();
          newInv.push(card);
          onBuy(card, newInv, card.cost);
          closeShop();
        }
      };
    }
    wrap.appendChild(buyBtn);
    offersRow.appendChild(wrap);
  });
  sheet.appendChild(offersRow);

  // Pass button
  var passBtn = document.createElement('button');
  passBtn.style.cssText = "width:100%;margin-top:10px;padding:8px;background:transparent;border:1px solid #333;border-radius:4px;color:#666;font-family:'Rajdhani';font-weight:700;font-size:10px;letter-spacing:1px;cursor:pointer;";
  passBtn.textContent = 'PASS';
  passBtn.onclick = function() { SND.click(); closeShop(); };
  sheet.appendChild(passBtn);

  overlay.appendChild(sheet);
  container.appendChild(overlay);

  // Animate in
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      sheet.style.transform = 'translateY(0)';
    });
  });

  function closeShop() {
    sheet.style.transform = 'translateY(100%)';
    setTimeout(function() {
      if (overlay.parentNode) overlay.remove();
      if (onClose) onClose();
    }, 300);
  }
}

// ============================================================
// SWAP UI (when inventory is full)
// ============================================================
function showSwapUI(sheet, inventory, newCard, points, onSwap) {
  // Replace sheet content with swap picker
  sheet.innerHTML = '';

  var title = document.createElement('div');
  title.style.cssText = "font-family:'Teko';font-weight:700;font-size:16px;color:var(--a-gold,#FFB800);letter-spacing:2px;text-align:center;margin-bottom:8px;";
  title.textContent = 'DROP A CARD TO MAKE ROOM';
  sheet.appendChild(title);

  var row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:8px;justify-content:center;';

  inventory.forEach(function(card, idx) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;';
    var cardEl = buildTorchCard(card, 70, 98);
    wrap.appendChild(cardEl);

    var dropBtn = document.createElement('div');
    dropBtn.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:9px;color:var(--p-red,#ff0040);letter-spacing:0.5px;";
    dropBtn.textContent = 'DROP';
    wrap.appendChild(dropBtn);

    wrap.onclick = function() {
      SND.click();
      var newInv = inventory.slice();
      newInv.splice(idx, 1); // Remove dropped card
      newInv.push(newCard);  // Add new card
      onSwap(newInv, newCard.cost);
    };
    row.appendChild(wrap);
  });
  sheet.appendChild(row);

  var cancelBtn = document.createElement('button');
  cancelBtn.style.cssText = "width:100%;margin-top:10px;padding:8px;background:transparent;border:1px solid #333;border-radius:4px;color:#666;font-family:'Rajdhani';font-weight:700;font-size:10px;cursor:pointer;";
  cancelBtn.textContent = 'CANCEL';
  cancelBtn.onclick = function() {
    // Close the whole shop (parent will handle)
    if (sheet.parentNode && sheet.parentNode.parentNode) sheet.parentNode.parentNode.remove();
  };
  sheet.appendChild(cancelBtn);
}

// ============================================================
// TORCH CARD INVENTORY UI (shown in gameplay panel)
// ============================================================

/**
 * Render inventory slots as a row of small card indicators.
 * @param {Array} inventory — up to 3 card objects
 * @returns {HTMLElement}
 */
export function renderInventory(inventory) {
  var row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:4px;padding:4px 8px;justify-content:center;';

  for (var i = 0; i < 3; i++) {
    var card = inventory[i];
    var slot = document.createElement('div');
    if (card) {
      var tierCol = card.tier === 'GOLD' ? '#FFB800' : card.tier === 'SILVER' ? '#B0C4D4' : '#A0522D';
      slot.style.cssText = "width:40px;height:16px;border-radius:3px;background:#1a0800;border:1px solid " + tierCol + ";display:flex;align-items:center;justify-content:center;";
      slot.innerHTML = "<span style=\"font-family:'Rajdhani';font-size:6px;color:" + tierCol + ";letter-spacing:0.5px;white-space:nowrap;\">" + card.name + "</span>";
    } else {
      slot.style.cssText = 'width:40px;height:16px;border-radius:3px;border:1px dashed #333;';
    }
    row.appendChild(slot);
  }
  return row;
}
