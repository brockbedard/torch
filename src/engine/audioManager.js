/**
 * TORCH — Audio Manager (Howler.js)
 * Singleton. SFX pools with pitch/volume randomization.
 * Three-tier crowd ambient crossfade. Master bus compression for phone speakers.
 * Includes "Broadcast Booth" Low-Pass Filter for anticipation states.
 */

import { Howl, Howler } from 'howler';

var _initialized = false;
var _muted = localStorage.getItem('torch_muted') === 'true';
var _sfx = {};
var _crowd = {};
var _crowdIntensity = 0;
var _lastPlayed = {};
var _crowdStopTimer = null;
var _filter = null;
var _currentState = 'menu';
var _crowdHoldTimer = null; // Timer for holding elevated crowd states

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
    console.log('[Audio] Initializing AudioManager...');
    Howler.mute(_muted);

    // Master bus processing for phone speakers
    try {
      if (Howler.ctx && Howler.ctx.state !== 'closed') {
        console.log('[Audio] AudioContext state:', Howler.ctx.state);

        // 1. "Broadcast Booth" Filter
        _filter = Howler.ctx.createBiquadFilter();
        _filter.type = 'lowpass';
        _filter.frequency.value = 20000; // Default to fully open
        _filter.Q.value = 0.7;

        // 2. Master Compressor (AAA Mobile Specs)
        var comp = Howler.ctx.createDynamicsCompressor();
        comp.threshold.value = -24;
        comp.ratio.value = 4;
        comp.attack.value = 0.003;
        comp.release.value = 0.25;

        // 3. Chain: MasterGain -> Filter -> Compressor -> Destination
        Howler.masterGain.disconnect();
        Howler.masterGain.connect(_filter);
        _filter.connect(comp);
        comp.connect(Howler.ctx.destination);

        // Unlock audio context if suspended
        if (Howler.ctx.state === 'suspended') {
          console.log('[Audio] Resuming suspended AudioContext');
          Howler.ctx.resume();
        }
      }
    } catch(e) {
      console.warn('[Audio] Failed to setup master processing chain:', e);
    }

    // SFX pools
    loadPool('cardDeal', ['/audio/sfx/card_deal_01.wav','/audio/sfx/card_deal_02.wav','/audio/sfx/card_deal_03.wav','/audio/sfx/card_deal_04.wav']);
    loadPool('cardPlace', ['/audio/sfx/card_place_01.wav','/audio/sfx/card_place_02.wav','/audio/sfx/card_place_03.wav','/audio/sfx/card_place_04.wav']);
    loadPool('cardFlip', ['/audio/sfx/card_flip_01.wav','/audio/sfx/card_flip_02.wav','/audio/sfx/card_flip_03.wav']);
    loadPool('cardFlipDramatic', ['/audio/sfx/card_flip_dramatic_01.wav','/audio/sfx/card_flip_dramatic_02.wav']);
    loadPool('cardDiscard', ['/audio/sfx/card_discard_01.wav','/audio/sfx/card_discard_02.wav']);
    loadPool('resultSlam', ['/audio/sfx/result_slam_01.wav'], { volume: 0.85 });
    loadPool('tdCelebration', ['/audio/sfx/td_celebration_01.mp3'], { volume: 0.9 });
    loadPool('gameOverWin', ['/audio/sfx/game_over_win_01.wav'], { volume: 0.9 });
    loadPool('gameOverLoss', ['/audio/sfx/game_over_loss_01.wav'], { volume: 0.9 });
    loadPool('scoreTick', ['/audio/sfx/score_tick_01.wav','/audio/sfx/score_tick_02.wav','/audio/sfx/score_tick_03.wav'], { volume: 0.55 });
    loadPool('menuTap', ['/audio/sfx/menu_tap_01.wav','/audio/sfx/menu_tap_02.wav','/audio/sfx/menu_tap_03.wav'], { volume: 0.5 });
    loadPool('crowdCheer', ['/audio/sfx/crowd_cheer_01.wav'], { volume: 0.8 });
    loadPool('crowdGroan', ['/audio/sfx/crowd_groan_01.wav'], { volume: 0.6 });
    loadPool('whistle', ['/audio/sfx/whistle_01.wav']);
    loadPool('kickThud', ['/audio/sfx/kick_thud_01.wav']);

    // Crowd ambient loops (webm/opus primary, mp3 fallback for Safari)
    _crowd.low = new Howl({ src: ['/audio/crowd/crowd_low.webm', '/audio/crowd/crowd_low.mp3'], loop: true, volume: 0 });
    _crowd.mid = new Howl({ src: ['/audio/crowd/crowd_mid.webm', '/audio/crowd/crowd_mid.mp3'], loop: true, volume: 0 });
    _crowd.high = new Howl({ src: ['/audio/crowd/crowd_high.webm', '/audio/crowd/crowd_high.mp3'], loop: true, volume: 0 });

    _initialized = true;
    console.log('[Audio] AudioManager initialized successfully');

    // Trigger a silent sound to finalize unlock
    try {
      var silent = new Howl({
        src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='],
        volume: 0
      });
      silent.play();
    } catch(e) {}
  },

  play: function(name, opts) {
    if (!_initialized) {
      console.warn('[Audio] Attempted to play sound before init:', name);
      return;
    }
    // Mobile safety: resume context on every interaction-based play
    if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume();
    try {
      var h = pickVariant(name);
      if (!h) return;
      var pr = (opts && opts.pitchRange !== undefined) ? opts.pitchRange : 0.08;
      var rate = ((opts && opts.pitch) || 1.0) + (Math.random() * pr * 2 - pr);
      var vr = (opts && opts.volRange !== undefined) ? opts.volRange : 0.1;
      var vol = ((opts && opts.volume) || 0.7) + (Math.random() * vr * 2 - vr);
      var id = h.play();
      h.rate(Math.max(0.5, Math.min(2, rate)), id);
      h.volume(Math.max(0, Math.min(1, vol)), id);
    } catch(e) {}
  },

  playExact: function(name, opts) {
    if (!_initialized) return;
    // Mobile safety: resume context on every interaction-based play
    if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume();
    try {
      var h = pickVariant(name);
      if (!h) return;
      var id = h.play();
      h.rate((opts && opts.pitch) || 1.0, id);
      h.volume((opts && opts.volume) || 0.8, id);
    } catch(e) {}
  },

  // ── CROWD AMBIENT ──

  startCrowd: function() {
    if (!_initialized) return;
    // Cancel any pending stop timer
    if (_crowdStopTimer) { clearTimeout(_crowdStopTimer); _crowdStopTimer = null; }
    // Guard: don't restart if already playing
    if (_crowd.low && _crowd.low.playing()) return;
    _crowd.low.play(); _crowd.mid.play(); _crowd.high.play();
    this.setCrowdIntensity(0.25, 0.5);
  },

  stopCrowd: function(fadeDuration) {
    var fd = (fadeDuration || 0.3) * 1000;
    if (_crowd.low) _crowd.low.fade(_crowd.low.volume(), 0, fd);
    if (_crowd.mid) _crowd.mid.fade(_crowd.mid.volume(), 0, fd);
    if (_crowd.high) _crowd.high.fade(_crowd.high.volume(), 0, fd);
    // Cancel any prior stop timer
    if (_crowdStopTimer) clearTimeout(_crowdStopTimer);
    // Stop after fade completes to free resources
    _crowdStopTimer = setTimeout(function() {
      _crowdStopTimer = null;
      if (_crowd.low) _crowd.low.stop();
      if (_crowd.mid) _crowd.mid.stop();
      if (_crowd.high) _crowd.high.stop();
    }, fd + 50);
  },

  setCrowdIntensity: function(intensity, fadeDuration) {
    _crowdIntensity = intensity;
    var fd = (fadeDuration || 0.5) * 1000;
    // Base volume multiplier for phone speaker optimization
    var baseVol = 0.45;
    var lowVol = Math.max(0, 1 - intensity * 2) * baseVol;
    var midVol = (intensity < 0.5 ? intensity * 2 : 2 - intensity * 2) * baseVol;
    var highVol = Math.max(0, intensity * 2 - 1) * baseVol;
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
      this.setCrowdIntensity(0.95, 0.3); // Fast up (300ms)
    } else {
      this.playExact('crowdGroan', { volume: 0.6 });
      this.setCrowdIntensity(0.15, 0.3); // Fast down (300ms)
    }
    setTimeout(function() { self.setCrowdIntensity(returnIntensity || _crowdIntensity, 1.5); }, 1500); // Slow settle (1.5s)
  },

  // ── STATE ──
  // Intensity map tuned for CONTRAST — normal_play is low so spikes feel big

  setState: function(state) {
    if (!_initialized) return;
    _currentState = state;

    // Cancel any pending crowd hold timer when state changes explicitly
    if (_crowdHoldTimer) { clearTimeout(_crowdHoldTimer); _crowdHoldTimer = null; }

    var map = {
      menu:           0.03,  // Barely perceptible parking lot hum
      pre_game:       0.08,  // Low rumble, clearly atmospheric
      normal_play:    0.25,  // Pulled down so spikes feel bigger by contrast
      big_moment:     0.55,  // Noticeable jump from 0.25
      two_min_drill:  0.50,  // Sustained tension
      touchdown:      0.85,  // The peak — massive contrast from 0.25
      turnover:       0.15,  // Deflating, energy drops noticeably
      halftime:       0,     // Silence
      game_over:      0,     // Fade out
      game_over_win:  0.70,  // Victory roar
      game_over_loss: 0.05,  // Deflated murmur
      paused:         0.10
    };

    // Fade speed: spike UP fast (0.5s), settle DOWN slow (1.5s)
    var upStates = ['big_moment', 'two_min_drill', 'touchdown', 'game_over_win'];
    var fadeDuration = upStates.indexOf(state) >= 0 ? 0.5 : 1.5;

    var i = map[state];
    if (i !== undefined) {
      if (i === 0) {
        this.stopCrowd(state === 'game_over' ? 2 : (state === 'halftime' ? 1.5 : 0.3));
      } else {
        if (!_crowd.low || !_crowd.low.playing()) this.startCrowd();
        this.setCrowdIntensity(i, fadeDuration);
      }
    }

    // "Broadcast Booth" Low-Pass Filter Logic
    if (_filter && Howler.ctx) {
      var freq = 20000; // Fully open
      if (state === 'menu') freq = 800;           // Distant parking lot hum
      else if (state === 'pre_game') freq = 600;   // Low rumble — clearly intentional
      else if (state === 'halftime' || state === 'paused') freq = 1200; // Muffled
      _filter.frequency.setTargetAtTime(freq, Howler.ctx.currentTime, 0.1);
    }
  },

  // Hold an elevated state for a duration, then fade to a target state
  holdThenSettle: function(holdMs, targetState) {
    var self = this;
    if (_crowdHoldTimer) clearTimeout(_crowdHoldTimer);
    _crowdHoldTimer = setTimeout(function() {
      _crowdHoldTimer = null;
      self.setState(targetState);
    }, holdMs);
  },

  // ── DEBUG ──
  getState: function() { return _currentState; },
  getCrowdIntensity: function() { return _crowdIntensity; },

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
