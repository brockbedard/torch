import { sfxr } from 'jsfxr';

/**
 * TORCH — Sound System (jsfxr)
 * Retro synthesized sounds, zero audio files.
 */

const SOUNDS = {
  click:    [2,,0.1,,0.1,0.5,,,,,,,,,,,,,1,,,,,0.5],
  select:   [0,,0.05,,0.2,0.4,,0.3,,,,,,,,,,,1,,,,,0.5],
  snap:     [2,,0.15,,0.15,0.3,,0.5,,,,,,,,,,,1,,,0.1,,0.5],
  draft:    [0,,0.08,,0.3,0.5,,0.2,,,,0.3,0.5,,,,,,1,,,,,0.5],
  flip:     [0,,0.05,,0.1,0.6,,,,,,,,,,,,,1,,,,,0.5],
  snapBall: [3,,0.05,,0.05,0.15,,-0.5,,,,,,,,,,,1,,,,,0.5],
  hit:      [3,,0.1,,0.1,0.08,,0.5,,,,,,,,,,,1,,,,,0.5],
  sack:     [3,,0.15,,0.2,0.05,,0.6,,,,,,,,,0.3,-0.3,1,,,,,0.5],
  whistle:  [1,,0.3,,0.3,0.6,,,,,,0.2,0.15,,,,,,1,,,,,0.5],
  td:       [0,,0.1,,0.4,0.4,,0.1,,,0.3,0.5,0.7,,,,,,1,,,,,0.5],
  turnover: [3,,0.2,,0.2,0.1,,-0.3,,,-0.3,,,,,0.6,0.3,-0.3,1,,,,,0.5],
  bigPlay:  [0,,0.08,,0.3,0.5,,0.3,,,0.2,0.3,0.5,,,,,,1,,,,,0.5],
  cardSnap: [0,,0.03,,0.05,0.5,,0.4,,,,,,,,,,,1,,,,,0.5],
  cardDrag: [2,,0.02,,0.02,0.7,,,,,,,,,,,,,1,,,,,0.3],
  points:   [0,,0.02,,0.05,0.7,,0.3,,,,,,,,,,,1,,,,,0.3],
  error:    [3,,0.15,,0.15,0.15,0.04,,,,,,,,,,,,1,,,,,0.5],
  chime:    [0,,0.1,,0.5,0.5,,0.1,,,0.4,0.6,0.8,,,,,,1,,,,,0.5],
};

function play(name) {
  try {
    var params = SOUNDS[name] || SOUNDS.click;
    var audio = sfxr.toAudio(params);
    audio.volume = 0.5;
    audio.play().catch(function() {});
  } catch (e) {}
}

export const SND = {
  click:      function() { play('click'); },
  select:     function() { play('select'); },
  snap:       function() { play('snapBall'); },
  menu:       function() { play('click'); },
  td:         function() { play('td'); },
  turnover:   function() { play('turnover'); },
  clash:      function() { play('hit'); },
  draft:      function() { play('draft'); },
  flip:       function() { play('flip'); },
  hit:        function() { play('hit'); },
  sack:       function() { play('sack'); },
  whistle:    function() { play('whistle'); },
  bigPlay:    function() { play('bigPlay'); },
  cardSnap:   function() { play('cardSnap'); },
  cardDrag:   function() { play('cardDrag'); },
  points:     function() { play('points'); },
  error:      function() { play('error'); },
  chime:      function() { play('chime'); },
  crowdStart: function() {},
  crowdStop:  function() {},
};
