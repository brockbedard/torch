/**
 * TORCH — Sound Bridge
 * Maps existing SND.* calls to AudioManager pools.
 * All sounds use Howler.js via audioManager.js.
 */

import AudioManager from './audioManager.js';

// Wrap all audio calls in try-catch — audio errors must NEVER break gameplay
function safe(fn) { return function() { try { fn(); } catch(e) {} }; }

export const SND = {
  // UI
  click:      safe(function() { AudioManager.play('menuTap'); }),
  select:     safe(function() { AudioManager.play('cardPlace', { volume: 0.5 }); }),
  snap:       safe(function() { AudioManager.play('cardPlace', { pitch: 0.9, volume: 0.8 }); }),
  menu:       safe(function() { AudioManager.play('menuTap'); }),

  // Gameplay results
  td:         safe(function() { AudioManager.playExact('tdCelebration', { volume: 0.9 }); }),
  turnover:   safe(function() { AudioManager.crowdSpike('groan'); }),
  clash:      safe(function() { AudioManager.playExact('resultSlam'); }),
  hit:        safe(function() { AudioManager.playExact('resultSlam', { volume: 0.6 }); }),
  sack:       safe(function() { AudioManager.playExact('resultSlam', { volume: 0.7 }); }),
  bigPlay:    safe(function() { AudioManager.crowdSpike('cheer'); }),
  whistle:    safe(function() { AudioManager.play('whistle'); }),

  // Cards
  cardSnap:   safe(function() { AudioManager.play('cardDeal'); }),
  cardDrag:   safe(function() { AudioManager.play('menuTap', { volume: 0.3 }); }),
  cardDeal:   safe(function() { AudioManager.play('cardDeal'); }),
  cardThud:   safe(function() { AudioManager.play('cardPlace'); }),
  cardFlick:  safe(function() { AudioManager.play('cardDiscard'); }),
  cardLift:   safe(function() { AudioManager.play('menuTap', { volume: 0.3 }); }),

  // Results
  resultGood: safe(function() { AudioManager.playExact('resultSlam'); }),
  resultBad:  safe(function() { AudioManager.playExact('resultSlam', { volume: 0.5 }); }),

  // Points / feedback
  points:     safe(function() { AudioManager.play('scoreTick'); }),
  chime:      safe(function() { AudioManager.play('scoreTick', { pitch: 1.15 }); }),
  error:      safe(function() { AudioManager.play('menuTap', { pitch: 0.7 }); }),
  flip:       safe(function() { AudioManager.playExact('cardFlipDramatic', { pitch: 0.8 }); }),
  draft:      safe(function() { AudioManager.play('cardDeal'); }),

  // Special teams
  kickThud:   safe(function() { AudioManager.play('kickThud'); }),
  kickGood:   safe(function() { AudioManager.crowdSpike('cheer'); }),
  kickMiss:   safe(function() { AudioManager.crowdSpike('groan'); }),
  discardConfirm: safe(function() { AudioManager.play('cardDiscard'); }),

  // Crowd (delegated to AudioManager)
  crowdStart: safe(function() { AudioManager.startCrowd(); }),
  crowdStop:  safe(function() { AudioManager.stopCrowd(); }),
};
