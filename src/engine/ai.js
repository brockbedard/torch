export function aiPickDefense(defTeamId,hand,lastPlayId){
  if(hand.length===0) return null;
  if(hand.length===1) return hand[0];
  var pool=hand.slice();
  // Iron Ridge (Saban): 60% zone, 25% adjustment, 15% aggressive
  if(defTeamId==='iron_ridge'){
    // Never call same play twice in a row
    if(lastPlayId) pool=pool.filter(function(c){return c.id!==lastPlayId;});
    if(pool.length===0) pool=hand.slice();
    var zone=['rip_liz','cov4_match','mod','cover_6'];
    var adjust=['skinny','bracket','meg'];
    var aggr=['fire_zone','robber','gap_int'];
    var r=Math.random();
    var bucket=r<0.6?zone:r<0.85?adjust:aggr;
    var avail=pool.filter(function(c){return bucket.indexOf(c.id)!==-1;});
    if(avail.length>0) return avail[Math.floor(Math.random()*avail.length)];
  }
  // Canyon Tech (Williams): 50% blitz, 30% coverage, 15% specialty, 5% random
  if(defTeamId==='canyon_tech'){
    var blitz=['overload','db_blitz','zero_cov','a_gap_mug','edge_crash'];
    var cov=['cov2_buc','man_press','zone_drop'];
    var spec=['spy','prevent'];
    var r2=Math.random();
    var bucket2=r2<0.5?blitz:r2<0.8?cov:r2<0.95?spec:null;
    if(bucket2){
      var avail2=pool.filter(function(c){return bucket2.indexOf(c.id)!==-1;});
      if(avail2.length>0) return avail2[Math.floor(Math.random()*avail2.length)];
    }
  }
  return pool[Math.floor(Math.random()*pool.length)];
}

export function aiPickOffense(offTeamId,hand,lastPlayId){
  if(hand.length===0) return null;
  if(hand.length===1) return hand[0];
  var pool=hand.slice();
  // Canyon Tech AI (Air Raid): 70% short pass, 20% deep, 10% run
  if(offTeamId==='canyon_tech'){
    var short=['mesh','slant','shallow_cross','stick','bubble_screen'];
    var deep=['four_verts','go_route','y_corner'];
    var run=['draw','qb_sneak'];
    var r=Math.random();
    var bucket=r<0.7?short:r<0.9?deep:run;
    var avail=pool.filter(function(c){return bucket.indexOf(c.id)!==-1;});
    if(avail.length>0) return avail[Math.floor(Math.random()*avail.length)];
  }
  // Iron Ridge AI (Triple Option): 70% run, 20% option/misdirection, 10% play-action
  if(offTeamId==='iron_ridge'){
    var mainRun=['triple_option','zone_read','power'];
    var optMis=['midline','qb_keeper','trap','rocket_toss'];
    var pa=['pa_post','pa_flat'];
    var r2=Math.random();
    var bucket2=r2<0.7?mainRun:r2<0.9?optMis:pa;
    var avail2=pool.filter(function(c){return bucket2.indexOf(c.id)!==-1;});
    if(avail2.length>0) return avail2[Math.floor(Math.random()*avail2.length)];
  }
  return pool[Math.floor(Math.random()*pool.length)];
}
