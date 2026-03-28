/**
 * TORCH — Audio Manager (Howler.js)
 * Singleton. SFX pools with pitch/volume randomization.
 * Three-tier crowd ambient crossfade. Master bus compression for phone speakers.
 */

import { Howl, Howler } from 'howler';

var _initialized = false;
var _muted = localStorage.getItem('torch_muted') === 'true';
var _sfx = {};
var _crowd = {};
var _crowdIntensity = 0.3;
var _lastPlayed = {};

function loadPool(name, sources, opts) {
  _sfx[name] = sources.map(function(src) {
    return new Howl({ src: [src], preload: true, volume: (opts && opts.volume) || 0.7 });
  });
}

function pickVariant(name) {
  var pool = _sfx[name];
  if (!pool || pool.length === 0) return null;
  if (pool.length === 1) return pool[0];
  var last = _lastPlayed[name];
  var idx;
  do { idx = Math.floor(Math.random() * pool.length); } while (pool.length > 1 && idx === last);
  _lastPlayed[name] = idx;
  return pool[idx];
}

var AudioManager = {
  init: function() {
    if (_initialized) return;
    Howler.mute(_muted);

    // Master bus compression for phone speakers
    try {
      if (Howler.ctx) {
        var comp = Howler.ctx.createDynamicsCompressor();
        comp.threshold.value = -24;
        comp.ratio.value = 4;
        comp.attack.value = 0.003;
        comp.release.value = 0.25;
        comp.connect(Howler.ctx.destination);
        Howler.masterGain.disconnect();
        Howler.masterGain.connect(comp);
      }
    } catch(e) {}

    // SFX pools
    loadPool('cardDeal', ['/audio/sfx/card_deal_01.wav','/audio/sfx/card_deal_02.wav','/audio/sfx/card_deal_03.wav','/audio/sfx/card_deal_04.wav']);
    loadPool('cardPlace', ['/audio/sfx/card_place_01.wav','/audio/sfx/card_place_02.wav','/audio/sfx/card_place_03.wav','/audio/sfx/card_place_04.wav']);
    loadPool('cardFlip', ['/audio/sfx/card_flip_01.wav','/audio/sfx/card_flip_02.wav','/audio/sfx/card_flip_03.wav']);
    loadPool('cardFlipDramatic', ['/audio/sfx/card_flip_dramatic_01.wav','/audio/sfx/card_flip_dramatic_02.wav']);
    loadPool('cardDiscard', ['/audio/sfx/card_discard_01.wav','/audio/sfx/card_discard_02.wav']);
    loadPool('resultSlam', ['/audio/sfx/result_slam_01.wav']);
    loadPool('tdCelebration', ['/audio/sfx/td_celebration_01.mp3'], { volume: 0.9 });
    loadPool('gameOverWin', ['/audio/sfx/game_over_win_01.wav']);
    loadPool('gameOverLoss', ['/audio/sfx/game_over_loss_01.wav']);
    loadPool('scoreTick', ['/audio/sfx/score_tick_01.wav','/audio/sfx/score_tick_02.wav','/audio/sfx/score_tick_03.wav']);
    loadPool('menuTap', ['/audio/sfx/menu_tap_01.wav','/audio/sfx/menu_tap_02.wav','/audio/sfx/menu_tap_03.wav'], { volume: 0.5 });
    loadPool('crowdCheer', ['/audio/sfx/crowd_cheer_01.wav'], { volume: 0.8 });
    loadPool('crowdGroan', ['/audio/sfx/crowd_groan_01.wav'], { volume: 0.6 });
    loadPool('whistle', ['/audio/sfx/whistle_01.wav']);
    loadPool('kickThud', ['/audio/sfx/kick_thud_01.wav']);

    // Crowd ambient loops
    _crowd.low = new Howl({ src: ['/audio/crowd/crowd_low.wav'], html5: true, loop: true, volume: 0 });
    _crowd.mid = new Howl({ src: ['/audio/crowd/crowd_mid.wav'], html5: true, loop: true, volume: 0 });
    _crowd.high = new Howl({ src: ['/audio/crowd/crowd_high.wav'], html5: true, loop: true, volume: 0 });

    _initialized = true;
  },

  play: function(name, opts) {
    if (!_initialized) return;
    var h = pickVariant(name);
    if (!h) return;
    var pr = (opts && opts.pitchRange !== undefined) ? opts.pitchRange : 0.08;
    var rate = ((opts && opts.pitch) || 1.0) + (Math.random() * pr * 2 - pr);
    var vr = (opts && opts.volRange !== undefined) ? opts.volRange : 0.1;
    var vol = ((opts && opts.volume) || 0.7) + (Math.random() * vr * 2 - vr);
    var id = h.play();
    h.rate(Math.max(0.5, Math.min(2, rate)), id);
    h.volume(Math.max(0, Math.min(1, vol)), id);
  },

  playExact: function(name, opts) {
    if (!_initialized) return;
    var h = pickVariant(name);
    if (!h) return;
    var id = h.play();
    h.rate((opts && opts.pitch) || 1.0, id);
    h.volume((opts && opts.volume) || 0.8, id);
  },

  // ── CROWD AMBIENT ──

  startCrowd: function() {
    if (!_initialized) return;
    _crowd.low.play(); _crowd.mid.play(); _crowd.high.play();
    this.setCrowdIntensity(0.3);
  },

  stopCrowd: function(fadeDuration) {
    var fd = (fadeDuration || 0.3) * 1000;
    if (_crowd.low) _crowd.low.fade(_crowd.low.volume(), 0, fd);
    if (_crowd.mid) _crowd.mid.fade(_crowd.mid.volume(), 0, fd);
    if (_crowd.high) _crowd.high.fade(_crowd.high.volume(), 0, fd);
    // Stop after fade completes to free resources
    setTimeout(function() {
      if (_crowd.low) _crowd.low.stop();
      if (_crowd.mid) _crowd.mid.stop();
      if (_crowd.high) _crowd.high.stop();
    }, fd + 50);
  },

  setCrowdIntensity: function(intensity, fadeDuration) {
    _crowdIntensity = intensity;
    var fd = (fadeDuration || 0.5) * 1000;
    var lowVol = Math.max(0, 1 - intensity * 2) * 0.3;
    var midVol = (intensity < 0.5 ? intensity * 2 : 2 - intensity * 2) * 0.3;
    var highVol = Math.max(0, intensity * 2 - 1) * 0.3;
    if (_crowd.low) _crowd.low.fade(_crowd.low.volume(), lowVol, fd);
    if (_crowd.mid) _crowd.mid.fade(_crowd.mid.volume(), midVol, fd);
    if (_crowd.high) _crowd.high.fade(_crowd.high.volume(), highVol, fd);
  },

  crowdDip: function(duration) {
    var saved = _crowdIntensity;
    var self = this;
    this.setCrowdIntensity(0.05, 0.2);
    setTimeout(function() { self.setCrowdIntensity(saved, 0.3); }, duration || 800);
  },

  crowdSpike: function(type, returnIntensity) {
    var self = this;
    if (type === 'cheer') {
      this.playExact('crowdCheer', { volume: 0.8 });
      this.setCrowdIntensity(0.95, 0.1);
    } else {
      this.playExact('crowdGroan', { volume: 0.6 });
      this.setCrowdIntensity(0.15, 0.1);
    }
    setTimeout(function() { self.setCrowdIntensity(returnIntensity || _crowdIntensity, 1.0); }, 1500);
  },

  // ── STATE (backward compat with existing setState calls) ──

  setState: function(state) {
    if (!_initialized) return;
    var map = { menu: 0, pre_game: 0.2, normal_play: 0.4, big_moment: 0.7, two_min_drill: 0.7, touchdown: 0.8, turnover: 0.3, halftime: 0.2, game_over: 0, paused: 0.1 };
    var i = map[state];
    if (i !== undefined) {
      if (i === 0) this.stopCrowd();
      else {
        if (!_crowd.low || !_crowd.low.playing()) this.startCrowd();
        this.setCrowdIntensity(i);
      }
    }
  },

  toggleMute: function() {
    _muted = !_muted;
    Howler.mute(_muted);
    localStorage.setItem('torch_muted', String(_muted));
    return _muted;
  },

  isMuted: function() { return _muted; },
  isInitialized: function() { return _initialized; },
};

export default AudioManager;
