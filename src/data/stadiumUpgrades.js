/**
 * TORCH — Stadium Upgrades Data
 */

export const STADIUM_UPGRADES = [
  {
    id: 'heated_turf',
    name: 'Heated Turf',
    desc: 'Negates all weather penalties related to rain, snow, or mud.',
    cost: 500,
    icon: 'thermometer'
  },
  {
    id: 'jumbotron',
    name: 'Jumbotron Pro',
    desc: 'Boosts team Momentum gain by 15% on big plays.',
    cost: 800,
    icon: 'tv'
  },
  {
    id: 'broadcast_booth',
    name: 'Elite Broadcast Booth',
    desc: 'Unlocks rare Procedural Commentary and better replays.',
    cost: 300,
    icon: 'mic'
  },
  {
    id: 'training_facility',
    name: 'Training Facility',
    desc: 'Players earn 20% more XP per snap.',
    cost: 1000,
    icon: 'dumbbell'
  }
];

const STORAGE_KEY = 'torch_stadium_upgrades';

export function getUnlockedUpgrades() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

export function unlockUpgrade(id) {
  const unlocked = getUnlockedUpgrades();
  if (!unlocked.includes(id)) {
    unlocked.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
    return true;
  }
  return false;
}

export function hasUpgrade(id) {
  return getUnlockedUpgrades().includes(id);
}
