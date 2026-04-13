/**
 * TORCH — Coach Progression System
 * Phase 8: Manager RPG logic.
 * Unlocks permanent scheme badges via skill tree.
 */

const STORAGE_KEY = 'torch_coach_progression';

export const COACH_SKILLS = [
  { id: 'clock_manager', name: 'Clock Manager', desc: 'Reduce clock run-off by 2s on all plays.', cost: 1 },
  { id: 'aggressive_caller', name: 'Aggressive Caller', desc: '+5% yardage on all pass plays.', cost: 1 },
  { id: 'iron_curtain', name: 'Iron Curtain', desc: '+5% sack rate bonus.', cost: 2 },
  { id: 'talent_scout', name: 'Talent Scout', desc: '+10% chance to draw Silver/Gold cards.', cost: 2 }
];

export function getCoachProgression() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { level: 1, xp: 0, skillPoints: 0, unlocked: [] };
  } catch(e) { return { level: 1, xp: 0, skillPoints: 0, unlocked: [] }; }
}

export function earnCoachXP(amount) {
  const data = getCoachProgression();
  data.xp += amount;
  const newLevel = Math.floor(data.xp / 500) + 1;
  if (newLevel > data.level) {
    data.skillPoints += (newLevel - data.level);
    data.level = newLevel;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function unlockCoachSkill(skillId) {
  const data = getCoachProgression();
  const skill = COACH_SKILLS.find(s => s.id === skillId);
  if (skill && data.skillPoints >= skill.cost && !data.unlocked.includes(skillId)) {
    data.skillPoints -= skill.cost;
    data.unlocked.push(skillId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  }
  return false;
}
