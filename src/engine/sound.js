import { jsfxr } from 'jsfxr';

/**
 * TORCH — Sound System (jsfxr + Web Audio)
 * Retro synthesized sounds, zero audio files.
 */

// jsfxr parameter strings — each defines a unique sound
const SOUNDS = {
  // UI
  click:    [2,,0.1,,0.1,0.5,,,,,,,,,,,,,1,,,,,0.5],
  select:   [0,,0.05,,0.2,0.4,,0.3,,,,,,,,,,,1,,,,,0.5],
  snap:     [2,,0.15,,0.15,0.3,,0.5,,,,,,,,,,,1,,,0.1,,0.5],
  draft:    [0,,0.08,,0.3,0.5,,0.2,,,,0.3,0.5,,,,,,1,,,,,0.5],
  flip:     [0,,0.05,,0.1,0.6,,,,,,,,,,,,,1,,,,,0.5],

  // Gameplay
  snapBall: [3,,0.05,,0.05,0.15,,-0.5,,,,,,,,,,,1,,,,,0.5],
  hit:      [3,,0.1,,0.1,0.08,,0.5,,,,,,,,,,,1,,,,,0.5],
  sack:     [3,,0.15,,0.2,0.05,,0.6,,,,,,,,,0.3,-0.3,1,,,,,0.5],
  whistle:  [1,,0.3,,0.3,0.6,,,,,,0.2,0.15,,,,,,1,,,,,0.5],
  td:       [0,,0.1,,0.4,0.4,,0.1,,,0.3,0.5,0.7,,,,,,1,,,,,0.5],
  turnover: [3,,0.2,,0.2,0.1,,-0.3,,,-0.3,,,,,0.6,0.3,-0.3,1,,,,,0.5],
  bigPlay:  [0,,0.08,,0.3,0.5,,0.3,,,0.2,0.3,0.5,,,,,,1,,,,,0.5],

  // Card interactions
  cardSnap: [0,,0.03,,0.05,0.5,,0.4,,,,,,,,,,,1,,,,,0.5],
  cardDrag: [2,,0.02,,0.02,0.7,,,,,,,,,,,,,1,,,,,0.3],
  points:   [0,,0.02,,0.05,0.7,,0.3,,,,,,,,,,,1,,,,,0.3],
  error:    [3,,0.15,,0.15,0.15,0.04,,,,,,,,,,,,1,,,,,0.5],
  chime:    [0,,0.1,,0.5,0.5,,0.1,,,0.4,0.6,0.8,,,,,,1,,,,,0.5],
};

// Cache audio buffers
var cache = {};
var ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function play(name) {
  try {
    var c = getCtx();
    if (!cache[name]) {
      var url = jsfxr(SOUNDS[name] || SOUNDS.click);
      // Fetch and decode the data URL
      fetch(url).then(function(r) { return r.arrayBuffer(); }).then(function(buf) {
        c.decodeAudioData(buf, function(decoded) {
          cache[name] = decoded;
          var src = c.createBufferSource();
          src.buffer = decoded;
          src.connect(c.destination);
          src.start();
        });
      });
    } else {
      var src = c.createBufferSource();
      src.buffer = cache[name];
      src.connect(c.destination);
      src.start();
    }
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
