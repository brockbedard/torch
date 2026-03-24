/**
 * TORCH v0.22 — Audio State Manager
 * 3-layer audio system: ambient (crowd loops), intensity (one-shots), UI (jsfxr).
 * 10 audio states with crossfade transitions via Howler.js.
 *
 * Audio files expected in public/audio/:
 *   crowd-idle.ogg, crowd-tense.ogg, crowd-building.ogg,
 *   crowd-roar.ogg, crowd-groan.ogg
 *
 * Falls back gracefully if files are missing — no crashes, just silence.
 */

import { Howl, Howler } from 'howler';

// ============================================================
// STATE CONFIGURATIONS
// ============================================================
var STATE_CONFIGS = {
  menu:          { ambient: null, volume: 0 },
  pre_game:      { ambient: 'crowd-building', volume: 0.4 },
  normal_play:   { ambient: 'crowd-idle', volume: 0.3 },
  big_moment:    { ambient: 'crowd-tense', volume: 0.5 },
  two_min_drill: { ambient: 'crowd-building', volume: 0.6 },
  touchdown:     { ambient: 'crowd-roar', volume: 0.8 },
  turnover:      { ambient: 'crowd-groan', volume: 0.4 },
  halftime:      { ambient: null, volume: 0 },
  game_over:     { ambient: 'crowd-roar', volume: 0.6 },
  paused:        { ambient: null, volume: 0 },
};

// ============================================================
// AUDIO STATE MANAGER
// ============================================================
var AudioStateManager = {
  _currentState: 'menu',
  _loops: {},        // Howl instances for crowd loops
  _activeLoop: null, // Currently playing loop ID
  _activeHowl: null, // Currently playing Howl instance
  _muted: false,
  _initialized: false,
  _sfx: null,        // One-shot SFX sprite

  /**
   * Initialize audio system. Call on first user interaction.
   */
  init: function() {
    if (this._initialized) return;
    this._initialized = true;

    // Restore mute state
    this._muted = localStorage.getItem('torch_muted') === '1';
    Howler.mute(this._muted);

    // Auto-mute on page hidden
    var self = this;
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        Howler.mute(true);
      } else {
        Howler.mute(self._muted);
      }
    });

    // Preload crowd loops (lazy — only load when first needed)
    this._preloadLoops();
  },

  /**
   * Preload ambient crowd loops.
   */
  _preloadLoops: function() {
    var loopNames = ['crowd-idle', 'crowd-tense', 'crowd-building', 'crowd-roar', 'crowd-groan'];
    var self = this;
    loopNames.forEach(function(name) {
      try {
        self._loops[name] = new Howl({
          src: ['/audio/' + name + '.ogg', '/audio/' + name + '.mp3'],
          loop: true,
          volume: 0,
          preload: false, // Lazy load
          onloaderror: function() {
            // File not found — graceful fallback, no crash
            self._loops[name] = null;
          }
        });
      } catch(e) {
        self._loops[name] = null;
      }
    });
  },

  /**
   * Transition to a new audio state with crossfade.
   * @param {string} state — one of the STATE_CONFIGS keys
   */
  setState: function(state) {
    if (!this._initialized) this.init();
    if (state === this._currentState) return;
    this._currentState = state;

    var config = STATE_CONFIGS[state];
    if (!config) return;

    var targetAmbient = config.ambient;
    var targetVolume = config.volume;
    var fadeDuration = 1000; // 1s crossfade

    // Fade out current ambient
    if (this._activeHowl && this._activeLoop !== targetAmbient) {
      var oldHowl = this._activeHowl;
      oldHowl.fade(oldHowl.volume(), 0, fadeDuration);
      setTimeout(function() { oldHowl.stop(); }, fadeDuration);
      this._activeHowl = null;
      this._activeLoop = null;
    }

    // Fade in new ambient
    if (targetAmbient && this._loops[targetAmbient]) {
      var newHowl = this._loops[targetAmbient];
      if (!newHowl._loaded && !newHowl._loading) {
        // Trigger lazy load
        newHowl.load();
        newHowl._loading = true;
        newHowl.once('load', function() {
          newHowl._loaded = true;
          newHowl._loading = false;
          newHowl.volume(0);
          newHowl.play();
          newHowl.fade(0, targetVolume, fadeDuration);
        });
      } else if (newHowl._loaded) {
        if (!newHowl.playing()) {
          newHowl.volume(0);
          newHowl.play();
        }
        newHowl.fade(newHowl.volume(), targetVolume, fadeDuration);
      }
      this._activeHowl = newHowl;
      this._activeLoop = targetAmbient;
    }
  },

  /**
   * Play a one-shot sound effect.
   * @param {string} name — SFX name
   */
  playSFX: function(name) {
    if (!this._initialized) this.init();
    // For now, one-shots use jsfxr (existing SND system).
    // When real SFX sprite is available, play from Howl sprite here.
  },

  /**
   * Toggle mute.
   * @returns {boolean} new mute state
   */
  toggleMute: function() {
    this._muted = !this._muted;
    Howler.mute(this._muted);
    localStorage.setItem('torch_muted', this._muted ? '1' : '0');
    return this._muted;
  },

  /**
   * Get current mute state.
   */
  isMuted: function() {
    return this._muted;
  },

  /**
   * Get current state name.
   */
  getState: function() {
    return this._currentState;
  },

  /**
   * Stop all audio immediately.
   */
  stopAll: function() {
    Howler.stop();
    this._activeHowl = null;
    this._activeLoop = null;
    this._currentState = 'menu';
  },
};

export default AudioStateManager;
