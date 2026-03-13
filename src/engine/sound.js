export const SND=(function(){
  var ctx=null;
  function ac(){if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx;}
  function tap(){
    try{
      var c=ac(),now=c.currentTime;
      var o=c.createOscillator(),g=c.createGain();
      o.type='sine';o.frequency.setValueAtTime(880,now);
      o.frequency.exponentialRampToValueAtTime(1200,now+0.06);
      g.gain.setValueAtTime(0.12,now);
      g.gain.exponentialRampToValueAtTime(0.001,now+0.1);
      o.connect(g);g.connect(c.destination);
      o.start(now);o.stop(now+0.12);
    }catch(e){}
  }
  return{
    click:tap,
    select:tap,
    snap:tap,
    menu:tap,
    td:tap,
    turnover:tap,
    clash:tap,
    draft:tap,
    flip:tap,
    crowdStart:function(){},
    crowdStop:function(){},
  };
})();
