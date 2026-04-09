/**
 * TORCH — Sound Bridge
 * Maps SND.* calls to AudioManager Howler.js pools.
 * All sounds use real audio files — no oscillators.
 */

import AudioManager from './audioManager.js';

// Wrap all audio calls — errors must NEVER break gameplay
function safe(fn) { return function() { try { fn(); } catch(e) {} }; }

export const SND = {
  // Init
  init:       function() { AudioManager.init(); },

  // === UI ===
  click:      safe(function() { AudioManager.play('click', { volume: 0.3 }); }),
  select:     safe(function() { AudioManager.play('cardPlace', { volume: 0.45 }); }),
  menu:       safe(function() { AudioManager.play('menuTap', { volume: 0.3 }); }),

  // === SNAP ===
  snap:       safe(function() { AudioManager.play('snap', { volume: 0.6 }); }),

  // === CARDS ===
  cardSnap:   safe(function() { AudioManager.play('cardDeal', { volume: 0.5 }); }),
  cardDeal:   safe(function() { AudioManager.play('cardDeal', { volume: 0.5 }); }),
  cardThud:   safe(function() { AudioManager.play('cardPlace', { volume: 0.5 }); }),
  cardPick:   safe(function() { AudioManager.play('cardPlace', { volume: 0.4 }); }),
  cardLift:   safe(function() { AudioManager.play('menuTap', { volume: 0.25 }); }),
  cardDrag:   safe(function() { AudioManager.play('menuTap', { volume: 0.2 }); }),
  cardFlick:  safe(function() { AudioManager.play('cardDiscard', { volume: 0.5 }); }),
  flip:       safe(function() { AudioManager.playExact('cardFlipDramatic', { volume: 0.6 }); }),
  flipDramatic: safe(function() { AudioManager.playExact('cardFlipDramatic', { volume: 0.7 }); }),
  discard:    safe(function() { AudioManager.play('cardDiscard', { volume: 0.5 }); }),
  discardConfirm: safe(function() { AudioManager.play('cardDiscard', { volume: 0.5 }); }),
  draft:      safe(function() { AudioManager.play('cardDeal', { volume: 0.5 }); }),

  // === IMPACTS (tiered) ===
  hit:        safe(function() { AudioManager.play('hitComposite', { volume: 0.7 }); }),
  sack:       safe(function() { AudioManager.play('hitHeavy', { volume: 0.8 }); }),
  clash:      safe(function() { AudioManager.play('hitComposite', { volume: 0.7 }); }),

  // === RESULTS ===
  resultGood: safe(function() { AudioManager.playExact('resultSlam', { volume: 0.8 }); }),
  resultBad:  safe(function() { AudioManager.play('hitModerate', { volume: 0.5 }); }),
  incomp:     safe(function() { AudioManager.play('hitModerate', { volume: 0.4 }); }),

  // === CROWD REACTIONS ===
  td:         safe(function() { AudioManager.play('tdEruption', { volume: 0.85 }); }),
  turnover:   safe(function() { AudioManager.play('groan', { volume: 0.6 }); }),
  bigPlay:    safe(function() { AudioManager.play('bigPlayCrowd', { volume: 0.7 }); }),

  // === POINTS & REWARDS ===
  points:     safe(function() { AudioManager.play('scoreTick', { volume: 0.5 }); }),
  chime:      safe(function() { AudioManager.play('chime', { volume: 0.45 }); }),
  exploit:    safe(function() { AudioManager.play('jackpot', { volume: 0.5 }); }),
  shimmer:    safe(function() { AudioManager.play('shimmer', { volume: 0.4 }); }),

  // Pitch-shifted combo pop — pass step index (0,1,2...) for ascending semitones.
  // Used for Balatro-style synergy chain stings on snap reveal.
  pop: function(step) {
    try {
      var s = step || 0;
      AudioManager.play('ping', {
        pitch: Math.pow(1.05946, s),  // +1 semitone per step (12-TET)
        pitchRange: 0,
        volume: 0.45 + Math.min(s, 6) * 0.04,  // Slight volume rise w/ chain
        volRange: 0
      });
    } catch(e) {}
  },

  // === KICKS ===
  kickThud:   safe(function() { AudioManager.play('kick', { volume: 0.6 }); }),
  kickGood:   safe(function() { AudioManager.play('bigPlayCrowd', { volume: 0.6 }); }),
  kickMiss:   safe(function() { AudioManager.play('groan', { volume: 0.5 }); }),
  // Metallic clang when the kick hits the upright. Fires before the groan.
  goalPostClang: safe(function() { AudioManager.play('goalPostClang', { volume: 0.75 }); }),

  // === WHISTLES ===
  whistle:     safe(function() { AudioManager.play('whistle', { volume: 0.05 }); }),
  whistleLong: safe(function() { AudioManager.playExact('whistleLong', { volume: 0.07 }); }),
  // End-of-period authoritative whistle. Used for end of half and end of game.
  whistleEndHalf: safe(function() { AudioManager.play('whistleEndHalf', { volume: 0.5 }); }),

  // === FOOTBALL FOLEY (new) ===
  chainGang:     safe(function() { AudioManager.play('chainGang', { volume: 0.4 }); }),
  passWhoosh:    safe(function() { AudioManager.play('passWhoosh', { volume: 0.5 }); }),
  helmetImpact:  safe(function() { AudioManager.play('helmetImpact', { volume: 0.75 }); }),
  crowdOoh:      safe(function() { AudioManager.play('crowdOoh', { volume: 0.55 }); }),
  possessionSwoosh: safe(function() { AudioManager.play('possessionSwoosh', { volume: 0.55 }); }),
  coinCatch:     safe(function() { AudioManager.play('coinCatch', { volume: 0.55 }); }),

  // === AMBIENT LOOPS ===
  lockerRoomStart: safe(function() { AudioManager.startAmbient('lockerRoom', 0.35, 800); }),
  lockerRoomStop:  safe(function() { AudioManager.stopAmbient('lockerRoom', 600); }),

  // === CINEMATIC ===
  ignite:     safe(function() { AudioManager.playExact('ignite', { volume: 0.6 }); }),
  coinFlip:   safe(function() { AudioManager.playExact('coinFlip', { volume: 0.6 }); }),
  horn:       safe(function() { AudioManager.playExact('horn', { volume: 0.7 }); }),
  whooshIn:   safe(function() { AudioManager.play('whooshIn', { volume: 0.4 }); }),
  broadcastSweep: safe(function() { AudioManager.play('broadcastSweep', { volume: 0.4 }); }),
  anvilImpact: safe(function() { AudioManager.playExact('anvilImpact', { volume: 0.8 }); }),
  bassDrop:   safe(function() { AudioManager.playExact('bassDrop', { volume: 0.7 }); }),
  clockTick:  safe(function() { AudioManager.play('clockTick', { volume: 0.5 }); }),

  // === GAME OVER ===
  victory: safe(function() {
    AudioManager.playExact('victoryImpact', { volume: 0.7 });
    setTimeout(function() { try { AudioManager.play('victoryCrowd', { volume: 0.6 }); } catch(e) {} }, 300);
  }),
  defeat: safe(function() {
    AudioManager.playExact('gameOverLoss', { volume: 0.6 });
  }),

  // === CROWD (delegated) ===
  crowdStart: safe(function() { AudioManager.startCrowd(); }),
  crowdStop:  safe(function() { AudioManager.stopCrowd(); }),

  // === LEGACY (mapped to closest real sound) ===
  error:      safe(function() { AudioManager.play('menuTap', { pitch: 0.7, volume: 0.3 }); }),
};
