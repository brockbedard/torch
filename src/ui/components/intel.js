export function showCardIntel(card, teamId, side){
  var root = document.getElementById('root');
  var overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(4px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fi .3s ease-out both;';
  
  var modal=document.createElement('div');
  modal.style.cssText='width:100%;max-width:340px;background:var(--bg2);border:2px solid var(--cyan);border-radius:12px;padding:24px;position:relative;box-shadow:0 0 40px rgba(0,212,255,.2);';
  
  var close=document.createElement('div');
  close.style.cssText='position:absolute;top:12px;right:12px;font-size:24px;color:var(--muted);cursor:pointer;line-height:1;';
  close.textContent='\u00D7';
  close.onclick=function(){overlay.remove();};
  
  var title=document.createElement('div');
  title.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--cyan);letter-spacing:2px;margin-bottom:4px;";
  title.textContent=card.name;
  
  var type=document.createElement('div');
  type.className='px';
  type.style.cssText='font-size:6px;color:var(--muted);letter-spacing:1px;margin-bottom:16px;';
  type.textContent=card.cat.toUpperCase();
  
  var body=document.createElement('div');
  body.style.cssText='font-size:15px;color:var(--text);line-height:1.6;font-weight:600;';
  body.textContent=card.desc;
  
  var intel=document.createElement('div');
  intel.style.cssText='margin-top:20px;padding-top:16px;border-top:1px solid var(--bdr);';
  
  var intelH=document.createElement('div');
  intelH.className='px';
  intelH.style.cssText='font-size:6px;color:var(--gold);margin-bottom:10px;letter-spacing:1px;';
  intelH.textContent='STRATEGIC INTEL';
  
  var intelText=document.createElement('div');
  intelText.style.cssText='font-size:14px;color:var(--text);opacity:.8;font-style:italic;';
  
  // Logic-based intel
  var text = '';
  var isOffense = side==='offense';
  if(isOffense){
    if(card.type==='pass'){
      if(card.cat.includes('Quick') || card.cat.includes('Short')) text='Effective against heavy pressure and blitzes. Harder to pick off, but lower yardage ceiling.';
      else if(card.cat.includes('Deep') || card.cat.includes('Bomb')) text='High risk, high reward. Beats soft zone but very vulnerable to deep coverage and "Robber" looks.';
      else if(card.id.includes('pa_')) text='Play-action constraints. Punishes aggressive run-stuffing defenses by faking the dive.';
    } else {
      if(card.id==='triple_option') text='The core engine. QB reads the end. Devastates soft zones, but dies to "Spy" and "Gap Integrity".';
      else if(card.cat.includes('Inside')) text='Safe yards between the tackles. Beats speed-rushers, but struggles against "A-Gap Mug".';
      else if(card.cat.includes('Outside')) text='Attacks the perimeter. Beats slow interior defenses, but loses to "DB Blitz" and speed on the edge.';
    }
  } else {
    if(card.type==='agg'){
      if(card.cat.includes('Pressure')) text='High pressure. Creates sacks and turnovers, but leaves huge holes against quick-game passing.';
      else if(card.id==='robber' || card.id==='gap_int') text='Discipline over chaos. Counters specific concepts like deep shots or option runs.';
    } else {
      if(card.cat.includes('Zone')) text='Safe coverage. Keeps the play in front of you. Weak against "Mesh" and short, high-percentage throws.';
      else if(card.id==='spy') text='Hard counter to mobile QBs and Triple Option keepers. Sacrifice pressure for containment.';
    }
  }
  intelText.textContent=text || 'Versatile call. Use based on situational field position and down/distance.';
  
  intel.append(intelH,intelText);
  modal.append(close,title,type,body,intel);
  overlay.appendChild(modal);
  root.appendChild(overlay);
}
