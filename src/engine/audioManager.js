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
var _ambient = {};
var _crowdIntensity = 0;          // current *actual* intensity (animated toward _crowdTarget)
var _crowdTarget = 0;             // where we're heading — single source of truth
var _crowdFadeRAF = null;         // current fade animation frame id
var _lastPlayed = {};
var _crowdStopTimer = null;
var _filter = null;
var _currentState = 'menu';
var _crowdHoldTimer = null;       // fires when a held state is allowed to fade back
var _crowdHoldUntil = 0;          // wall-clock time until which elevated state is locked
var _lastStateChange = 0;         // wall-clock time of last state change (for debounce)
var _pendingState = null;         // state queued behind a debounce window
var _pendingStateTimer = null;

// ── Tunables — adjust if the crowd feel needs work ──
var MIN_HOLD_MS = 1500;           // minimum time an elevated state must hold
var DEBOUNCE_MS = 250;            // ignore repeat setState calls faster than this
var UP_FADE_MS = 450;             // time to ramp up to target (spike)
var DOWN_FADE_MS = 2200;          // time to ramp down to target (settle)
var ELEVATED_STATES = {           // states that require MIN_HOLD_MS before fading back
  big_moment: true,
  touchdown: true,
  turnover: true,
  game_over_win: true,
};

// Load an SFX pool. opts.preload (default true) controls whether Howler
// decodes the audio on init or on first play(). Rarely-used pools (end-game
// moments, TD celebrations) pass preload:false to avoid the first-tap
// decode hitch on older iPhones — an ~100ms delay on the first TD is fine;
// a hitch on first button tap is not.
function loadPool(name, sources, opts) {
  var preload = opts && opts.preload !== undefined ? opts.preload : true;
  _sfx[name] = sources.map(function(src) {
    return new Howl({ src: [src], preload: preload, volume: (opts && opts.volume) || 0.7 });
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

// Ambient loop wrapper. Uses Howler's native loop:true — gapless for
// WebM/Opus sources, and Web Audio mode (html5:false) handles the MP3
// fallback cleanly. The previous implementation tried to manage crossfades
// with setTimeout, but drifted under browser load and caused audible
// chopping. Name kept for call-site compatibility.
function _createCrossfadeLoop(sources) {
  var howl = new Howl({
    src: sources,
    preload: true,
    loop: true,
    volume: 0,
    html5: false
  });
  var _playing = false;
  return {
    play: function() {
      if (_playing) return;
      _playing = true;
      howl.play();
    },
    stop: function() {
      _playing = false;
      howl.stop();
    },
    fade: function(from, to, dur) {
      howl.fade(from, to, dur);
    },
    volume: function(v) {
      if (v !== undefined) { howl.volume(v); return v; }
      return howl.volume();
    },
    playing: function() { return _playing && howl.playing(); }
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
    loadPool('menuTap', ['/audio/sfx/menu_tap_01.mp3','/audio/sfx/menu_tap_02.mp3','/audio/sfx/menu_tap_03.mp3'], { volume: 0.35 });
    loadPool('click', ['/audio/sfx/click_01.mp3','/audio/sfx/click_02.mp3','/audio/sfx/click_03.mp3'], { volume: 0.3 });
    loadPool('chime', ['/audio/sfx/chime_01.mp3','/audio/sfx/chime_02.mp3','/audio/sfx/chime_03.mp3','/audio/sfx/chime_04.mp3'], { volume: 0.45 });
    loadPool('scoreTick', ['/audio/sfx/score_tick_01.mp3','/audio/sfx/score_tick_02.mp3','/audio/sfx/score_tick_03.mp3'], { volume: 0.5 });
    loadPool('shimmer', ['/audio/sfx/shimmer_01.mp3','/audio/sfx/shimmer_02.mp3','/audio/sfx/shimmer_03.mp3'], { volume: 0.4 });
    loadPool('ping', ['/audio/sfx/ping_01.mp3','/audio/sfx/ping_02.mp3'], { volume: 0.4 });
    loadPool('jackpot', ['/audio/sfx/jackpot_01.mp3'], { volume: 0.5, preload: false });
    loadPool('clockTick', ['/audio/sfx/clock_tick_01.mp3'], { volume: 0.5 });

    // SFX pools — Cards
    loadPool('cardDeal', ['/audio/sfx/card_deal_01.mp3','/audio/sfx/card_deal_02.mp3','/audio/sfx/card_deal_03.mp3','/audio/sfx/card_deal_04.mp3'], { volume: 0.5 });
    loadPool('cardPlace', ['/audio/sfx/card_place_01.mp3','/audio/sfx/card_place_02.mp3','/audio/sfx/card_place_03.mp3','/audio/sfx/card_place_04.mp3'], { volume: 0.5 });
    loadPool('cardFlipSlam', ['/audio/sfx/card_flip_slam_01.mp3'], { volume: 0.6 });
    loadPool('cardFlipDramatic', ['/audio/sfx/card_flip_dramatic_01.mp3','/audio/sfx/card_flip_dramatic_02.mp3'], { volume: 0.6 });
    loadPool('cardDiscard', ['/audio/sfx/card_discard_01.mp3','/audio/sfx/card_discard_02.mp3'], { volume: 0.5 });

    // SFX pools — Football
    loadPool('snap', ['/audio/sfx/snap_01.mp3','/audio/sfx/snap_02.mp3'], { volume: 0.6 });
    loadPool('throw', ['/audio/sfx/throw_01.mp3'], { volume: 0.5 });
    loadPool('catch', ['/audio/sfx/catch_01.mp3'], { volume: 0.5 });
    loadPool('kick', ['/audio/sfx/kick_01.mp3'], { volume: 0.6 });
    loadPool('kickThud', ['/audio/sfx/kick_thud_01.mp3'], { volume: 0.6 });
    loadPool('whistle', ['/audio/sfx/whistle_01.mp3','/audio/sfx/whistle_short_01.mp3'], { volume: 0.05 });
    loadPool('whistleLong', ['/audio/sfx/whistle_long_01.mp3'], { volume: 0.05 });
    // New football foley
    loadPool('goalPostClang', ['/audio/sfx/goal_post_clang_01.mp3','/audio/sfx/goal_post_clang_02.mp3'], { volume: 0.75 });
    loadPool('chainGang', ['/audio/sfx/chain_gang_01.mp3'], { volume: 0.4 });
    loadPool('passWhoosh', ['/audio/sfx/pass_whoosh_01.mp3','/audio/sfx/pass_whoosh_02.mp3'], { volume: 0.5 });
    loadPool('whistleEndHalf', ['/audio/sfx/whistle_end_half_01.mp3','/audio/sfx/whistle_end_half_02.mp3','/audio/sfx/whistle_end_half_03.mp3'], { volume: 0.5 });

    // SFX pools — Impacts
    loadPool('hitComposite', ['/audio/sfx/hit_composite_01.mp3','/audio/sfx/hit_composite_02.mp3','/audio/sfx/hit_composite_03.mp3','/audio/sfx/hit_composite_04.mp3'], { volume: 0.7 });
    loadPool('hitHeavy', ['/audio/sfx/hit_heavy_01.mp3','/audio/sfx/hit_heavy_02.mp3','/audio/sfx/hit_heavy_03.mp3','/audio/sfx/hit_heavy_04.mp3','/audio/sfx/hit_heavy_05.mp3','/audio/sfx/hit_heavy_06.mp3'], { volume: 0.8 });
    loadPool('hitModerate', ['/audio/sfx/hit_moderate_01.mp3','/audio/sfx/hit_moderate_02.mp3'], { volume: 0.6 });
    loadPool('helmetImpact', ['/audio/sfx/helmet_impact_01.mp3'], { volume: 0.75 });
    loadPool('resultSlam', ['/audio/sfx/result_slam_01.mp3'], { volume: 0.85 });

    // SFX pools — Cinematic
    loadPool('anvilImpact', ['/audio/sfx/anvil_impact_01.mp3'], { volume: 0.8, preload: false });
    loadPool('bassDrop', ['/audio/sfx/bass_drop_01.mp3','/audio/sfx/bass_drop_02.mp3'], { volume: 0.7 });
    loadPool('victoryImpact', ['/audio/sfx/victory_impact_01.mp3','/audio/sfx/victory_impact_02.mp3'], { volume: 0.7, preload: false });
    loadPool('horn', ['/audio/sfx/horn_01.mp3','/audio/sfx/horn_02.mp3','/audio/sfx/horn_03.mp3'], { volume: 0.7 });
    loadPool('whooshIn', ['/audio/sfx/whoosh_in_01.mp3','/audio/sfx/whoosh_in_02.mp3'], { volume: 0.4 });
    loadPool('possessionSwoosh', ['/audio/sfx/possession_swoosh_01.mp3','/audio/sfx/possession_swoosh_02.mp3'], { volume: 0.55 });
    loadPool('broadcastSweep', ['/audio/sfx/broadcast_sweep_01.mp3'], { volume: 0.4 });

    // SFX pools — Special
    loadPool('ignite', ['/audio/sfx/ignite_01.mp3'], { volume: 0.6 });
    loadPool('coinFlip', ['/audio/sfx/coin_flip_01.mp3'], { volume: 0.6 });
    loadPool('coinCatch', ['/audio/sfx/coin_catch_01.mp3','/audio/sfx/coin_catch_02.mp3'], { volume: 0.55 });
    loadPool('tdCelebration', ['/audio/sfx/td_celebration_01.mp3'], { volume: 0.9, preload: false });
    loadPool('gameOverWin', ['/audio/sfx/game_over_win_01.mp3'], { volume: 0.9, preload: false });
    loadPool('gameOverLoss', ['/audio/sfx/game_over_loss_01.mp3'], { volume: 0.7, preload: false });

    // SFX pools — Crowd reactions (one-shots)
    loadPool('crowdCheer', ['/audio/sfx/crowd_cheer_01.mp3'], { volume: 0.7 });
    loadPool('crowdGroan', ['/audio/sfx/crowd_groan_01.mp3'], { volume: 0.6 });
    loadPool('crowdOoh', ['/audio/sfx/crowd_ooh_01.mp3','/audio/sfx/crowd_ooh_02.mp3'], { volume: 0.55 });
    loadPool('tdEruption', ['/audio/crowd/Stadium_crowd_celebr_#3-1775233609710.mp3','/audio/crowd/Outdoor_American_foo_#2-1775233465681.mp3','/audio/crowd/Outdoor_American_foo_#3-1775233456755.mp3'], { volume: 0.85, preload: false });
    loadPool('bigPlayCrowd', ['/audio/crowd/big_play_01.mp3','/audio/crowd/big_play_02.mp3'], { volume: 0.7 });
    loadPool('groan', ['/audio/crowd/groan_01.mp3','/audio/crowd/groan_02.mp3'], { volume: 0.6 });
    loadPool('victoryCrowd', ['/audio/crowd/victory_crowd_01.mp3'], { volume: 0.7 });

    // Crowd ambient loops — crossfade looping for seamless playback
    _crowd.low = _createCrossfadeLoop(['/audio/crowd/crowd_low.webm', '/audio/crowd/crowd_low.mp3']);
    _crowd.mid = _createCrossfadeLoop(['/audio/crowd/crowd_mid.webm', '/audio/crowd/crowd_mid.mp3']);
    _crowd.high = _createCrossfadeLoop(['/audio/crowd/crowd_high.webm', '/audio/crowd/crowd_high.mp3']);

    // Ambient one-off loops (simple Howl loop, not crossfaded)
    _ambient.lockerRoom = new Howl({
      src: ['/audio/sfx/locker_room_loop_01.mp3'],
      preload: true,
      loop: true,
      volume: 0
    });

    _initialized = true;
    console.log('[Audio] AudioManager initialized successfully');

    // Tab visibility / Window closing safety
    window.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        Howler.mute(true);
      } else if (!_muted) {
        Howler.mute(false);
      }
    });
    window.addEventListener('pagehide', function() {
      Howler.stop();
    });

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
    if (_crowdStopTimer) { clearTimeout(_crowdStopTimer); _crowdStopTimer = null; }
    // Guard: don't restart if already playing
    if (_crowd.low && _crowd.low.playing()) return;
    _crowd.low.play(); _crowd.mid.play(); _crowd.high.play();
    // Force instant baseline application — the first setState after start will ramp
    _crowdIntensity = 0;
    this.setCrowdIntensity(0.25, 500);
  },

  stopCrowd: function(fadeDuration) {
    var fd = (fadeDuration || 0.3) * 1000;
    // Manual fade to 0 via the same RAF engine as normal intensity changes,
    // so there's no conflict with an in-flight spike.
    this._animateIntensity(0, fd);
    if (_crowdStopTimer) clearTimeout(_crowdStopTimer);
    _crowdStopTimer = setTimeout(function() {
      _crowdStopTimer = null;
      if (_crowd.low) _crowd.low.stop();
      if (_crowd.mid) _crowd.mid.stop();
      if (_crowd.high) _crowd.high.stop();
    }, fd + 50);
  },

  // ── Volume curve helpers ──
  _applyCrowdVolumes: function(intensity) {
    // 3-layer crossfade: low (0–0.5) → mid (0.25–0.75) → high (0.5–1.0)
    // Smooth triangular mix so total perceived volume stays consistent.
    var baseVol = 0.45;
    var lowVol  = Math.max(0, 1 - intensity * 2) * baseVol;
    var midVol  = (intensity < 0.5 ? intensity * 2 : 2 - intensity * 2) * baseVol;
    var highVol = Math.max(0, intensity * 2 - 1) * baseVol;
    try {
      if (_crowd.low)  _crowd.low.volume(lowVol);
      if (_crowd.mid)  _crowd.mid.volume(midVol);
      if (_crowd.high) _crowd.high.volume(highVol);
    } catch(e) {}
  },

  /**
   * Smoothly animate _crowdIntensity toward target using exponential easing.
   * Replaces the linear Howler fades that caused "choppy" amplitude steps.
   * Any in-flight fade is cancelled and replaced — single source of truth.
   */
  _animateIntensity: function(target, durationMs) {
    var self = this;
    if (_crowdFadeRAF) { cancelAnimationFrame(_crowdFadeRAF); _crowdFadeRAF = null; }
    _crowdTarget = target;
    var from = _crowdIntensity;
    var delta = target - from;
    var start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    var dur = Math.max(50, durationMs || 1000);
    // Exponential ease-out for up-fades (fast start, slow settle),
    // ease-in-out for down-fades (natural decay).
    var isUp = delta > 0;
    function tick(now) {
      var nowT = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      var t = Math.min(1, (nowT - start) / dur);
      var eased = isUp
        ? 1 - Math.pow(1 - t, 3)                          // ease-out cubic
        : (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);  // ease-in-out quad
      _crowdIntensity = from + delta * eased;
      self._applyCrowdVolumes(_crowdIntensity);
      if (t < 1) {
        _crowdFadeRAF = requestAnimationFrame(tick);
      } else {
        _crowdFadeRAF = null;
        _crowdIntensity = target;
        self._applyCrowdVolumes(target);
      }
    }
    _crowdFadeRAF = requestAnimationFrame(tick);
  },

  /**
   * Set crowd intensity target. Always routed through the single animator so
   * a new call cleanly interrupts any in-flight fade without audible jumps.
   */
  setCrowdIntensity: function(intensity, fadeDurationMs) {
    if (!_initialized) return;
    var fd = fadeDurationMs;
    if (fd === undefined) fd = (intensity > _crowdIntensity) ? UP_FADE_MS : DOWN_FADE_MS;
    // Accept both legacy seconds and new ms — if value < 10, assume seconds
    if (fd < 10) fd = fd * 1000;
    this._animateIntensity(intensity, fd);
  },

  crowdDip: function(duration) {
    if (_crowdHoldUntil > Date.now()) return; // don't interrupt elevated hold
    var saved = _crowdIntensity;
    var self = this;
    this._animateIntensity(0.05, 200);
    setTimeout(function() { self._animateIntensity(saved, 300); }, duration || 800);
  },

  crowdSpike: function(type, returnIntensity) {
    if (_crowdHoldUntil > Date.now()) return; // don't interrupt elevated hold
    var self = this;
    if (type === 'cheer') {
      this.playExact('crowdCheer', { volume: 0.8 });
      this._animateIntensity(0.95, 300);
    } else {
      this.playExact('crowdGroan', { volume: 0.6 });
      this._animateIntensity(0.15, 300);
    }
    var ret = (returnIntensity !== undefined) ? returnIntensity : _crowdTarget;
    setTimeout(function() { self._animateIntensity(ret, 1500); }, 1500);
  },

  // ── STATE ──
  // Intensity map tuned for CONTRAST — normal_play is low so spikes feel big

  setState: function(state) {
    if (!_initialized) return;

    var now = Date.now();

    // ── Min-hold guard ──
    // If we're still in an elevated state's minimum hold window, ignore
    // attempts to DOWNGRADE to a calmer state. Let the crowd finish its moment.
    if (_crowdHoldUntil > now) {
      var calmerStates = { normal_play: true, pre_game: true, menu: true };
      if (calmerStates[state]) {
        // Queue it for when the hold expires
        if (_pendingStateTimer) clearTimeout(_pendingStateTimer);
        _pendingState = state;
        var self = this;
        _pendingStateTimer = setTimeout(function() {
          _pendingStateTimer = null;
          var queued = _pendingState;
          _pendingState = null;
          if (queued) self.setState(queued);
        }, _crowdHoldUntil - now + 20);
        return;
      }
    }

    // ── Debounce rapid-fire calls ──
    // Prevents flicker when multiple systems call setState in the same tick
    // (e.g. a TD triggering both the touchdown state and an immediate settle).
    if (state === _currentState && (now - _lastStateChange) < DEBOUNCE_MS) return;
    _lastStateChange = now;
    _currentState = state;

    // Clear pending settles when a new explicit call comes in
    if (_pendingStateTimer) { clearTimeout(_pendingStateTimer); _pendingStateTimer = null; _pendingState = null; }
    if (_crowdHoldTimer) { clearTimeout(_crowdHoldTimer); _crowdHoldTimer = null; }

    // Set min-hold for elevated states so a subsequent tier-1 snap can't
    // yank the crowd back to baseline before the moment has landed.
    if (ELEVATED_STATES[state]) {
      _crowdHoldUntil = now + MIN_HOLD_MS;
    } else {
      _crowdHoldUntil = 0;
    }

    var map = {
      menu:           0.03,  // parking lot hum
      pre_game:       0.10,  // low atmospheric rumble
      normal_play:    0.28,  // sustained baseline (slightly up for consistency)
      big_moment:     0.58,  // noticeable lift from baseline
      two_min_drill:  0.48,  // sustained tension
      touchdown:      0.88,  // peak — massive contrast
      turnover:       0.18,  // deflating crowd
      halftime:       0,     // silence
      game_over:      0,     // fade out
      game_over_win:  0.72,  // victory roar
      game_over_loss: 0.08,  // deflated murmur
      paused:         0.12,
    };

    var i = map[state];
    if (i !== undefined) {
      if (i === 0) {
        this.stopCrowd(state === 'game_over' ? 2 : (state === 'halftime' ? 1.5 : 0.3));
      } else {
        if (!_crowd.low || !_crowd.low.playing()) this.startCrowd();
        // Up-fades use snappy timing, down-fades are slow/natural
        var isUp = i > _crowdIntensity;
        this.setCrowdIntensity(i, isUp ? UP_FADE_MS : DOWN_FADE_MS);
      }
    }

    // "Broadcast Booth" Low-Pass Filter Logic
    if (_filter && Howler.ctx) {
      var freq = 20000;
      if (state === 'menu') freq = 800;
      else if (state === 'pre_game') freq = 600;
      else if (state === 'halftime' || state === 'paused') freq = 1200;
      _filter.frequency.setTargetAtTime(freq, Howler.ctx.currentTime, 0.1);
    }
  },

  // ── AMBIENT (one-off looped textures, e.g. locker room at halftime) ──
  startAmbient: function(name, targetVol, fadeMs) {
    var a = _ambient[name];
    if (!a) return;
    var v = (targetVol !== undefined) ? targetVol : 0.35;
    var fd = (fadeMs !== undefined) ? fadeMs : 600;
    if (!a.playing()) { a.volume(0); a.play(); }
    a.fade(a.volume(), v, fd);
  },
  stopAmbient: function(name, fadeMs) {
    var a = _ambient[name];
    if (!a) return;
    var fd = (fadeMs !== undefined) ? fadeMs : 600;
    a.fade(a.volume(), 0, fd);
    setTimeout(function() { try { a.stop(); } catch(e) {} }, fd + 50);
  },

  // Hold an elevated state for a duration, then fade to a target state.
  // Honors MIN_HOLD_MS — the actual hold is max(holdMs, MIN_HOLD_MS).
  holdThenSettle: function(holdMs, targetState) {
    var self = this;
    var now = Date.now();
    var actualHold = Math.max(holdMs || 0, MIN_HOLD_MS);
    // Update the hold-until so any interim setState calls honor it
    _crowdHoldUntil = Math.max(_crowdHoldUntil, now + actualHold);
    if (_crowdHoldTimer) clearTimeout(_crowdHoldTimer);
    _crowdHoldTimer = setTimeout(function() {
      _crowdHoldTimer = null;
      _crowdHoldUntil = 0;
      self.setState(targetState);
    }, actualHold);
  },

  // ── DEBUG ──
  getState: function() { return _currentState; },
  getCrowdIntensity: function() { return _crowdIntensity; },
  getCrowdTarget: function() { return _crowdTarget; },
  isCrowdHeld: function() { return _crowdHoldUntil > Date.now(); },
  getHoldRemaining: function() { return Math.max(0, _crowdHoldUntil - Date.now()); },

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
