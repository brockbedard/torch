/**
 * TORCH — Sound Bridge
 * Maps existing SND.* calls to AudioManager pools.
 * All sounds use Howler.js via audioManager.js.
 */

import AudioManager from './audioManager.js';

export const SND = {
  // UI
  click:      function() { AudioManager.play('menuTap'); },
  select:     function() { AudioManager.play('cardPlace', { volume: 0.5 }); },
  snap:       function() { AudioManager.play('cardPlace', { pitch: 0.9, volume: 0.8 }); },
  menu:       function() { AudioManager.play('menuTap'); },

  // Gameplay results
  td:         function() { AudioManager.playExact('tdCelebration', { volume: 0.9 }); },
  turnover:   function() { AudioManager.crowdSpike('groan'); },
  clash:      function() { AudioManager.playExact('resultSlam'); },
  hit:        function() { AudioManager.playExact('resultSlam', { volume: 0.6 }); },
  sack:       function() { AudioManager.playExact('resultSlam', { volume: 0.7 }); },
  bigPlay:    function() { AudioManager.crowdSpike('cheer'); },
  whistle:    function() { AudioManager.play('whistle'); },

  // Cards
  cardSnap:   function() { AudioManager.play('cardDeal'); },
  cardDrag:   function() { AudioManager.play('menuTap', { volume: 0.3 }); },
  cardDeal:   function() { AudioManager.play('cardDeal'); },
  cardThud:   function() { AudioManager.play('cardPlace'); },
  cardFlick:  function() { AudioManager.play('cardDiscard'); },
  cardLift:   function() { AudioManager.play('menuTap', { volume: 0.3 }); },

  // Results
  resultGood: function() { AudioManager.playExact('resultSlam'); },
  resultBad:  function() { AudioManager.playExact('resultSlam', { volume: 0.5 }); },

  // Points / feedback
  points:     function() { AudioManager.play('scoreTick'); },
  chime:      function() { AudioManager.play('scoreTick', { pitch: 1.15 }); },
  error:      function() { AudioManager.play('menuTap', { pitch: 0.7 }); },
  flip:       function() { AudioManager.playExact('cardFlipDramatic', { pitch: 0.8 }); },
  draft:      function() { AudioManager.play('cardDeal'); },

  // Special teams
  kickThud:   function() { AudioManager.play('kickThud'); },
  kickGood:   function() { AudioManager.crowdSpike('cheer'); },
  kickMiss:   function() { AudioManager.crowdSpike('groan'); },
  discardConfirm: function() { AudioManager.play('cardDiscard'); },

  // Crowd (delegated to AudioManager)
  crowdStart: function() { AudioManager.startCrowd(); },
  crowdStop:  function() { AudioManager.stopCrowd(); },
};
