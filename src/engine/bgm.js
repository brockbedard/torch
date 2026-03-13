// Background Music Manager — plays theme on menu screens, stops on gameplay
var audio = null;
var STORAGE_KEY = 'torch_music_muted';
var started = false;

function getAudio() {
  if (!audio) {
    audio = new Audio('/audio/torch-theme.mp3');
    audio.loop = true;
    audio.volume = 0.3;
  }
  return audio;
}

// Browsers block autoplay until a user gesture — attach a one-time listener
function ensureStartOnInteraction() {
  if (started) return;
  function handler() {
    started = true;
    document.removeEventListener('click', handler, true);
    document.removeEventListener('touchstart', handler, true);
    if (!BGM.muted) {
      var a = getAudio();
      if (a.paused) a.play().catch(function() {});
    }
  }
  document.addEventListener('click', handler, true);
  document.addEventListener('touchstart', handler, true);
}

export var BGM = {
  muted: localStorage.getItem(STORAGE_KEY) === '1',

  play: function() {
    var a = getAudio();
    a.muted = this.muted;
    if (started && !this.muted && a.paused) {
      a.play().catch(function() {});
    }
    ensureStartOnInteraction();
  },

  stop: function() {
    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
    started = false;
  },

  toggle: function() {
    this.muted = !this.muted;
    localStorage.setItem(STORAGE_KEY, this.muted ? '1' : '0');
    var a = getAudio();
    a.muted = this.muted;
    if (!this.muted && a.paused && started) {
      a.play().catch(function() {});
    }
    return this.muted;
  }
};

// Shared mute button builder for all menu screens
export function buildMuteBtn() {
  var btn = document.createElement('button');
  function updateStyle() {
    var m = BGM.muted;
    btn.style.cssText =
      'width:36px;height:36px;display:flex;align-items:center;justify-content:center;' +
      'font-family:"Courier New",monospace;font-size:11px;font-weight:bold;letter-spacing:1px;' +
      'cursor:pointer;padding:0;flex-shrink:0;border-radius:4px;transition:all 0.15s ease;' +
      (m
        ? 'background:transparent;border:2px solid #ff004066;color:#ff0040;text-shadow:0 0 6px #ff004066;'
        : 'background:transparent;border:2px solid #00ff8866;color:#00ff88;text-shadow:0 0 6px #00ff8866;');
    btn.textContent = m ? 'OFF' : 'SND';
  }
  updateStyle();
  btn.onclick = function(e) {
    e.stopPropagation();
    BGM.toggle();
    updateStyle();
  };
  return btn;
}
