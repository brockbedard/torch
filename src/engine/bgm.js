// Background Music Manager — plays theme on menu screens, stops on gameplay
var audio = null;
var STORAGE_KEY = 'torch_music_muted';

function getAudio() {
  if (!audio) {
    audio = new Audio('/audio/torch-theme.mp3');
    audio.loop = true;
    audio.volume = 0.3;
  }
  return audio;
}

export var BGM = {
  muted: localStorage.getItem(STORAGE_KEY) === '1',

  play: function() {
    var a = getAudio();
    if (this.muted) { a.muted = true; }
    if (a.paused) {
      a.play().catch(function() {});
    }
  },

  stop: function() {
    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  },

  toggle: function() {
    this.muted = !this.muted;
    localStorage.setItem(STORAGE_KEY, this.muted ? '1' : '0');
    if (audio) { audio.muted = this.muted; }
    return this.muted;
  }
};

// Shared mute button builder for all menu screens
export function buildMuteBtn() {
  var btn = document.createElement('button');
  btn.style.cssText =
    'width:36px;height:36px;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(0,0,0,0.6);border:1px solid #ffffff22;border-radius:4px;' +
    'cursor:pointer;font-size:16px;line-height:1;padding:0;flex-shrink:0;';
  function updateIcon() {
    btn.textContent = BGM.muted ? '\uD83D\uDD07' : '\uD83D\uDD0A';
  }
  updateIcon();
  btn.onclick = function(e) {
    e.stopPropagation();
    BGM.toggle();
    updateIcon();
  };
  return btn;
}
