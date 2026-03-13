export const SND=(function(){
  var ctx=null;var crowdNode=null;var crowdGain=null;
  function ac(){if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx;}
  function tone(f,dur,type,vol,t0){
    try{var c=ac(),now=c.currentTime,o=c.createOscillator(),g=c.createGain();
      o.connect(g);g.connect(c.destination);o.type=type||'square';o.frequency.value=f;
      g.gain.setValueAtTime(vol||.1,now+(t0||0));
      g.gain.exponentialRampToValueAtTime(0.001,now+(t0||0)+dur);
      o.start(now+(t0||0));o.stop(now+(t0||0)+dur+.02);}catch(e){}}
  function noise(dur,vol,t0){
    try{var c=ac(),sr=c.sampleRate,buf=c.createBuffer(1,Math.floor(sr*dur),sr),data=buf.getChannelData(0);
      for(var i=0;i<data.length;i++)data[i]=Math.random()*2-1;
      var s=c.createBufferSource(),g=c.createGain();s.buffer=buf;s.connect(g);g.connect(c.destination);
      g.gain.setValueAtTime(vol||.1,c.currentTime+(t0||0));
      g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+(t0||0)+dur);
      s.start(c.currentTime+(t0||0));}catch(e){}}
  function whistle(dur, vol, t0) {
    try {
      var c = ac(), now = c.currentTime + (t0 || 0), g = c.createGain();
      g.connect(c.destination); g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(vol || 0.2, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      [2500, 2515].forEach(function(f) {
        var o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        var mod = c.createOscillator(); mod.frequency.value = 30;
        var modG = c.createGain(); modG.gain.value = 15;
        mod.connect(modG); modG.connect(o.frequency);
        o.connect(g); mod.start(now); o.start(now); o.stop(now + dur); mod.stop(now + dur);
      });
    } catch(e) {}
  }
  function grunt(vol, t0) {
    try {
      var c = ac(), now = c.currentTime + (t0 || 0), o = c.createOscillator(), g = c.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(120, now);
      o.frequency.exponentialRampToValueAtTime(60, now + 0.15);
      g.gain.setValueAtTime(vol || 0.1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      o.connect(g); g.connect(c.destination); o.start(now); o.stop(now + 0.15);
    } catch(e) {}
  }
  return{
    click:function(){tone(440,.06,'square',.08);tone(880,.04,'square',.05,.05);},
    select:function(){tone(523,.05,'triangle',.1);tone(659,.07,'triangle',.11,.06);},
    snap:function(){grunt(0.3); noise(0.1, 0.2, 0.05); tone(80, 0.2, 'sawtooth', 0.2);},
    menu:function(){[262,330,392,523].forEach(function(f,i){tone(f,.14,'square',.12,i*.1);});},
    td:function(){whistle(0.5, 0.25); whistle(0.5, 0.25, 0.6); [523,659,784,1047].forEach(function(f,i){tone(f,.2,'square',.15,i*.1 + 0.2);});},
    turnover:function(){whistle(0.8, 0.3); [330,247,196,147,110].forEach(function(f,i){tone(f,.2,'sawtooth',.18-i*.02,i*.13 + 0.1);});},
    clash:function(){grunt(0.4); noise(0.15, 0.4); tone(60, 0.2, 'sawtooth', 0.3);},
    draft:function(){tone(330,.04,'square',.1);tone(550,.05,'square',.12,.05);tone(880,.1,'square',.14,.1);},
    flip:function(){for(var i=0;i<4;i++)tone(1200+i*200,.02,'square',.04,i*.04);},
    crowdStart:function(){},
    crowdStop:function(){},
    };
    })();
