/**
 * TORCH — Coach Profile Screen
 * Phase 8: Skill Tree UI.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { GS, setGs } from '../../state.js';
import { COACH_SKILLS, getCoachProgression, unlockCoachSkill } from '../../engine/coachProgression.js';

export function buildCoachProfile() {
  const data = getCoachProgression();

  const el = document.createElement('div');
  el.className = 'T glass-panel';
  el.style.cssText = 'height:100%;padding:20px;display:flex;flex-direction:column;gap:20px;color:#fff;overflow-y:auto;';

  el.innerHTML = `
    <div style="text-align:center;">
      <div style="font-family:'Teko';font-size:32px;letter-spacing:4px;color:#EBB010;">COACH PROFILE</div>
      <div style="font-family:'Rajdhani';font-weight:700;font-size:12px;color:#555;margin-top:4px;">LEVEL ${data.level} MANAGER</div>
    </div>

    <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:16px;border:1px solid rgba(255,255,255,0.06);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span style="font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:2px;">SCHEME SKILL POINTS</span>
        <span style="font-family:'Teko';font-size:24px;color:#00ff44;">${data.skillPoints}</span>
      </div>
      <div style="width:100%;height:4px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;">
        <div style="height:100%;width:${(data.xp % 500) / 5}%;background:#00ff44;"></div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px;" id="skill-list"></div>

    <button id="exit-profile" class="btn-glass-light-demo active-scale" style="margin-top:auto;width:100%;padding:14px;font-family:'Teko';font-size:18px;letter-spacing:4px;">BACK TO HUB</button>
  `;

  const list = el.querySelector('#skill-list');
  COACH_SKILLS.forEach(s => {
    const isUnlocked = data.unlocked.includes(s.id);
    const canAfford = data.skillPoints >= s.cost;

    const row = document.createElement('div');
    row.className = 'glass-panel active-scale';
    row.style.cssText = `padding:16px;border-radius:12px;display:flex;gap:16px;align-items:center;opacity:${isUnlocked ? '1' : (canAfford ? '0.9' : '0.5')};border-color:${isUnlocked ? '#00ff4466' : 'rgba(255,255,255,0.1)'};cursor:${isUnlocked ? 'default' : (canAfford ? 'pointer' : 'not-allowed')};`;
    
    row.innerHTML = `
      <div style="flex:1;">
        <div style="font-family:'Teko';font-weight:700;font-size:18px;color:#fff;">${s.name.toUpperCase()}</div>
        <div style="font-family:'Rajdhani';font-size:11px;color:#888;margin-top:2px;">${s.desc}</div>
      </div>
      <div style="text-align:right;">
        ${isUnlocked ? '<span style="color:#00ff44;font-family:\'Teko\';font-size:14px;">UNLOCKED</span>' : `<span style="font-family:\'Teko\';font-size:18px;color:#EBB010;">${s.cost} PTS</span>`}
      </div>
    `;

    if (!isUnlocked && canAfford) {
      row.onclick = () => {
        if (unlockCoachSkill(s.id)) {
          SND.select();
          setGs(s => ({ ...s })); // Refresh
        }
      };
    }
    list.appendChild(row);
  });

  el.querySelector('#exit-profile').onclick = () => {
    SND.click();
    setGs({ screen: 'home' });
  };

  return el;
}
