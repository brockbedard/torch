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
};
