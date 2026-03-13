export function rollYards(tier){
  if(tier==='O+') return 8+Math.floor(Math.random()*13);
  if(tier==='N')  return 2+Math.floor(Math.random()*5);
  if(tier==='D+') return -2+Math.floor(Math.random()*5);
  if(tier==='TO') return -2+Math.floor(Math.random()*5);
  if(tier==='OT') return Math.random()<0.7?(8+Math.floor(Math.random()*13)):(-2+Math.floor(Math.random()*3));
  return 3;
}
export function isTurnover(tier){
  if(tier==='TO') return Math.random()<0.2;
  if(tier==='OT') return Math.random()<0.2;
  return false;
}

export function clockCost(cardId){
  var quick={slant:1,stick:1,shallow_cross:1,bubble_screen:1};
  var short={mesh:1,pa_flat:1};
  var deep={four_verts:1,y_corner:1,go_route:1,pa_post:1};
  if(quick[cardId]) return 8+Math.floor(Math.random()*5);
  if(short[cardId]) return 12+Math.floor(Math.random()*5);
  if(deep[cardId]) return 16+Math.floor(Math.random()*7);
  return 10+Math.floor(Math.random()*9);
}
