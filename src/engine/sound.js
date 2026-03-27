import { sfxr } from 'jsfxr';

/**
 * TORCH — Sound System (jsfxr presets)
 * Retro synthesized sounds, zero audio files.
 */

// Pre-generate sounds from presets, then play them
var cache = {};

function genSound(preset) {
  var sound = sfxr.generate(preset);
  return sound;
}

function play(preset) {
  try {
    if (!cache[preset]) cache[preset] = genSound(preset);
    sfxr.play(cache[preset]);
  } catch (e) {
    // Fallback: try generating fresh
    try { sfxr.play(sfxr.generate(preset)); } catch (e2) {}
  }
}

// Map game events to jsfxr presets
export const SND = {
  click:      function() { play('click'); },
  select:     function() { play('blipSelect'); },
  snap:       function() { play('hitHurt'); },
  menu:       function() { play('click'); },
  td:         function() { play('powerUp'); },
  turnover:   function() { play('explosion'); },
  clash:      function() { play('hitHurt'); },
  draft:      function() { play('blipSelect'); },
  flip:       function() { play('click'); },
  hit:        function() { play('hitHurt'); },
  sack:       function() { play('explosion'); },
  whistle:    function() { play('tone'); },
  bigPlay:    function() { play('powerUp'); },
  cardSnap:   function() { play('pickupCoin'); },
  cardDrag:   function() { play('click'); },
  points:     function() { play('blipSelect'); },
  error:      function() { play('hitHurt'); },
  chime:      function() { play('pickupCoin'); },
  crowdStart: function() {},
  crowdStop:  function() {},

  // Card interaction sounds (jsfxr placeholders — replace with Pixabay samples later)
  cardDeal:     function() { play('pickupCoin'); },   // card dealt from deck — short snap
  cardThud:     function() { play('hitHurt'); },      // card landing on field — satisfying thud
  cardFlick:    function() { play('click'); },        // card discarded — light swoosh
  cardLift:     function() { play('click'); },        // card touched/lifted — subtle tap
  resultGood:   function() { play('powerUp'); },      // good result — impact hit
  resultBad:    function() { play('explosion'); },    // bad result — muted thud
  kickThud:     function() { play('hitHurt'); },      // foot hitting ball on FG/punt
  kickGood:     function() { play('powerUp'); },      // FG made — cheer
  kickMiss:     function() { play('explosion'); },    // FG missed — groan
  discardConfirm: function() { play('click'); },      // discard button pressed
};
