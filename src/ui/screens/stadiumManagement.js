/**
 * TORCH — Stadium Management Screen
 * Phase 6: Million Dollar Meta-game.
 * Spend KPA on permanent passive buffs.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { Haptic } from '../../engine/haptics.js';
import { GS, setGs, getTeam } from '../../state.js';
import { STADIUM_UPGRADES, getUnlockedUpgrades, unlockUpgrade } from '../../data/stadiumUpgrades.js';

export function buildStadiumManagement() {
  const team = getTeam(GS.team);
  const unlocked = getUnlockedUpgrades();
  let currentKpa = (GS.season && GS.season.carryoverPoints) || 0;

  const el = document.createElement('div');
  el.className = 'T';
  el.style.cssText = 'height:100%;display:flex;flex-direction:column;background:var(--bg);overflow:hidden;';

  // ── HEADER ──
  const hdr = document.createElement('div');
  hdr.style.cssText = 'text-align:center;padding:30px 20px 10px;flex-shrink:0;';
  hdr.innerHTML = `
    <div style="font-family:'Teko';font-weight:700;font-size:14px;color:#555;letter-spacing:3px;">DYNASTY ASSETS</div>
    <div style="font-family:'Teko';font-weight:700;font-size:32px;color:#fff;letter-spacing:4px;text-shadow:0 0 20px rgba(255,255,255,0.2);">STADIUM UPGRADES</div>
    <div style="font-family:'Teko';font-weight:700;font-size:20px;color:#EBB010;letter-spacing:2px;margin-top:4px;" id="sm-kpa">${currentKpa} KPA AVAILABLE</div>
  `;
  el.appendChild(hdr);

  // ── UPGRADES LIST ──
  const list = document.createElement('div');
  list.style.cssText = 'flex:1;padding:10px 20px;display:flex;flex-direction:column;gap:12px;overflow-y:auto;';

  STADIUM_UPGRADES.forEach(u => {
    const isUnlocked = unlocked.includes(u.id);
    const canAfford = currentKpa >= u.cost;

    const row = document.createElement('div');
    row.className = 'glass-panel active-scale';
    row.style.cssText = `padding:16px;border-radius:12px;display:flex;gap:16px;align-items:center;opacity:${isUnlocked ? '1' : '0.8'};border-color:${isUnlocked ? '#EBB01066' : 'rgba(255,255,255,0.1)'};`;
    
    row.innerHTML = `
      <div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-size:20px;">${isUnlocked ? '✅' : '🔒'}</span>
      </div>
      <div style="flex:1;">
        <div style="font-family:'Teko';font-weight:700;font-size:18px;color:#fff;letter-spacing:1px;">${u.name.toUpperCase()}</div>
        <div style="font-family:'Rajdhani';font-size:11px;color:#888;margin-top:2px;">${u.desc}</div>
      </div>
      <div style="text-align:right;">
        ${isUnlocked ? 
          `<div style="font-family:'Teko';color:#EBB010;font-size:14px;letter-spacing:1px;">ACTIVE</div>` :
          `<div style="font-family:'Teko';color:${canAfford ? '#00ff44' : '#555'};font-size:18px;">${u.cost}</div>
           <div style="font-family:'Rajdhani';font-size:8px;color:#444;">KPA</div>`
        }
      </div>
    `;

    if (!isUnlocked && canAfford) {
      row.onclick = () => {
        if (unlockUpgrade(u.id)) {
          SND.td();
          Haptic.bigPlay();
          if (GS.season) GS.season.carryoverPoints -= u.cost;
          setGs(s => ({ ...s })); // Refresh
        }
      };
    }

    list.appendChild(row);
  });
  el.appendChild(list);

  // ── BACK BUTTON ──
  const bot = document.createElement('div');
  bot.style.cssText = 'padding:20px;flex-shrink:0;';
  const back = document.createElement('button');
  back.className = 'btn-glass-light-demo active-scale';
  back.style.cssText = 'width:100%;padding:14px;font-family:\'Teko\';font-size:18px;letter-spacing:4px;';
  back.textContent = 'RETURN TO HUB';
  back.onclick = () => {
    SND.click();
    setGs({ screen: 'home' });
  };
  bot.appendChild(back);
  el.appendChild(bot);

  return el;
}
