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

// Crossfade loop: starts a second instance before the first ends,
// crossfading over 500ms for seamless gapless playback.
function _createCrossfadeLoop(sources) {
  var XFADE = 500; // crossfade duration in ms
  var _vol = 0;
  var _playing = false;
  var _current = null;
  var _timer = null;

  function _newHowl() {
    return new Howl({ src: sources, preload: true, volume: 0 });
  }

  function _scheduleNext(howl) {
    var dur = howl.duration() * 1000;
    if (dur <= 0) { // Duration not yet known — retry after load
      howl.once('load', function() { _scheduleNext(howl); });
      return;
    }
    var triggerAt = Math.max(100, dur - XFADE);
    _timer = setTimeout(function() {
      if (!_playing) return;
      // Start next instance, crossfade
      var next = _newHowl();
      next.volume(0);
      next.play();
      next.fade(0, _vol, XFADE);
      howl.fade(_vol, 0, XFADE);
      setTimeout(function() { howl.stop(); howl.unload(); }, XFADE + 50);
      _current = next;
      _scheduleNext(next);
    }, triggerAt);
  }

  return {
    play: function() {
      if (_playing) return;
      _playing = true;
      _current = _newHowl();
      _current.volume(_vol);
      _current.play();
      _scheduleNext(_current);
    },
    stop: function() {
      _playing = false;
      if (_timer) { clearTimeout(_timer); _timer = null; }
      if (_current) { _current.stop(); _current.unload(); _current = null; }
    },
    fade: function(from, to, dur) {
      _vol = to;
      if (_current && _playing) {
        _current.fade(from, to, dur);
      }
    },
    volume: function(v) {
      if (v !== undefined) { _vol = v; if (_current) _current.volume(v); return v; }
      return _vol;
    },
    playing: function() { return _playing; },
  };
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

    // SFX pools — UI
    loadPool('menuTap', ['/audio/sfx/menu_tap_01.wav','/audio/sfx/menu_tap_02.wav','/audio/sfx/menu_tap_03.wav'], { volume: 0.35 });
    loadPool('click', ['/audio/sfx/click_01.wav','/audio/sfx/click_02.wav','/audio/sfx/click_03.wav'], { volume: 0.3 });
    loadPool('chime', ['/audio/sfx/chime_01.wav','/audio/sfx/chime_02.wav','/audio/sfx/chime_03.wav','/audio/sfx/chime_04.wav'], { volume: 0.45 });
    loadPool('scoreTick', ['/audio/sfx/score_tick_01.wav','/audio/sfx/score_tick_02.wav','/audio/sfx/score_tick_03.wav'], { volume: 0.5 });
    loadPool('shimmer', ['/audio/sfx/shimmer_01.wav','/audio/sfx/shimmer_02.wav','/audio/sfx/shimmer_03.wav'], { volume: 0.4 });
    loadPool('ping', ['/audio/sfx/ping_01.wav','/audio/sfx/ping_02.wav'], { volume: 0.4 });
    loadPool('jackpot', ['/audio/sfx/jackpot_01.wav'], { volume: 0.5 });
    loadPool('clockTick', ['/audio/sfx/clock_tick_01.wav'], { volume: 0.5 });

    // SFX pools — Cards
    loadPool('cardDeal', ['/audio/sfx/card_deal_01.wav','/audio/sfx/card_deal_02.wav','/audio/sfx/card_deal_03.wav','/audio/sfx/card_deal_04.wav'], { volume: 0.5 });
    loadPool('cardPlace', ['/audio/sfx/card_place_01.wav','/audio/sfx/card_place_02.wav','/audio/sfx/card_place_03.wav','/audio/sfx/card_place_04.wav'], { volume: 0.5 });
    loadPool('cardFlip', ['/audio/sfx/card_flip_01.wav','/audio/sfx/card_flip_02.wav','/audio/sfx/card_flip_03.wav'], { volume: 0.5 });
    loadPool('cardFlipSlam', ['/audio/sfx/card_flip_slam_01.wav'], { volume: 0.6 });
    loadPool('cardFlipDramatic', ['/audio/sfx/card_flip_dramatic_01.wav','/audio/sfx/card_flip_dramatic_02.wav'], { volume: 0.6 });
    loadPool('cardDiscard', ['/audio/sfx/card_discard_01.wav','/audio/sfx/card_discard_02.wav'], { volume: 0.5 });

    // SFX pools — Football
    loadPool('snap', ['/audio/sfx/snap_01.wav','/audio/sfx/snap_02.wav'], { volume: 0.6 });
    loadPool('throw', ['/audio/sfx/throw_01.wav'], { volume: 0.5 });
    loadPool('catch', ['/audio/sfx/catch_01.wav'], { volume: 0.5 });
    loadPool('kick', ['/audio/sfx/kick_01.wav'], { volume: 0.6 });
    loadPool('kickThud', ['/audio/sfx/kick_thud_01.wav'], { volume: 0.6 });
    loadPool('whistle', ['/audio/sfx/whistle_01.wav','/audio/sfx/whistle_short_01.wav'], { volume: 0.5 });
    loadPool('whistleLong', ['/audio/sfx/whistle_long_01.wav'], { volume: 0.5 });

    // SFX pools — Impacts
    loadPool('hitComposite', ['/audio/sfx/hit_composite_01.wav','/audio/sfx/hit_composite_02.wav','/audio/sfx/hit_composite_03.wav','/audio/sfx/hit_composite_04.wav'], { volume: 0.7 });
    loadPool('hitHeavy', ['/audio/sfx/hit_heavy_01.wav','/audio/sfx/hit_heavy_02.wav','/audio/sfx/hit_heavy_03.wav','/audio/sfx/hit_heavy_04.wav','/audio/sfx/hit_heavy_05.wav','/audio/sfx/hit_heavy_06.wav'], { volume: 0.8 });
    loadPool('hitModerate', ['/audio/sfx/hit_moderate_01.wav','/audio/sfx/hit_moderate_02.wav'], { volume: 0.6 });
    loadPool('resultSlam', ['/audio/sfx/result_slam_01.wav'], { volume: 0.85 });

    // SFX pools — Cinematic
    loadPool('anvilImpact', ['/audio/sfx/anvil_impact_01.wav'], { volume: 0.8 });
    loadPool('bassDrop', ['/audio/sfx/bass_drop_01.wav','/audio/sfx/bass_drop_02.wav'], { volume: 0.7 });
    loadPool('victoryImpact', ['/audio/sfx/victory_impact_01.wav','/audio/sfx/victory_impact_02.wav'], { volume: 0.7 });
    loadPool('horn', ['/audio/sfx/horn_01.wav','/audio/sfx/horn_02.wav','/audio/sfx/horn_03.wav'], { volume: 0.7 });
    loadPool('whooshIn', ['/audio/sfx/whoosh_in_01.wav','/audio/sfx/whoosh_in_02.wav'], { volume: 0.4 });
    loadPool('broadcastSweep', ['/audio/sfx/broadcast_sweep_01.wav'], { volume: 0.4 });
    loadPool('paperFlip', ['/audio/sfx/paper_flip_01.wav'], { volume: 0.5 });

    // SFX pools — Special
    loadPool('ignite', ['/audio/sfx/ignite_01.wav'], { volume: 0.6 });
    loadPool('coinFlip', ['/audio/sfx/coin_flip_01.wav'], { volume: 0.6 });
    loadPool('tdCelebration', ['/audio/sfx/td_celebration_01.mp3'], { volume: 0.9 });
    loadPool('gameOverWin', ['/audio/sfx/game_over_win_01.wav'], { volume: 0.9 });
    loadPool('gameOverLoss', ['/audio/sfx/game_over_loss_01.wav'], { volume: 0.7 });

    // SFX pools — Crowd reactions (one-shots)
    loadPool('crowdCheer', ['/audio/sfx/crowd_cheer_01.wav'], { volume: 0.7 });
    loadPool('crowdGroan', ['/audio/sfx/crowd_groan_01.wav'], { volume: 0.6 });
    loadPool('tdEruption', ['/audio/crowd/td_eruption_01.wav','/audio/crowd/td_eruption_02.wav'], { volume: 0.8 });
    loadPool('bigPlayCrowd', ['/audio/crowd/big_play_01.wav','/audio/crowd/big_play_02.wav'], { volume: 0.7 });
    loadPool('groan', ['/audio/crowd/groan_01.wav','/audio/crowd/groan_02.wav'], { volume: 0.6 });
    loadPool('victoryCrowd', ['/audio/crowd/victory_crowd_01.wav'], { volume: 0.7 });

    // Crowd ambient loops — crossfade looping for seamless playback
    _crowd.low = _createCrossfadeLoop(['/audio/crowd/crowd_low.webm', '/audio/crowd/crowd_low.mp3']);
    _crowd.mid = _createCrossfadeLoop(['/audio/crowd/crowd_mid.webm', '/audio/crowd/crowd_mid.mp3']);
    _crowd.high = _createCrossfadeLoop(['/audio/crowd/crowd_high.webm', '/audio/crowd/crowd_high.mp3']);

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
