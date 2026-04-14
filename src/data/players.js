/**
 * TORCH — Ember Eight Player Rosters
 * 8 teams × (7 offense + 7 defense) = 112 players.
 *
 * Source of truth: docs/EMBER-EIGHT-ROSTERS.md
 *
 * Player schema:
 *   id         — team_prefix + slot (e.g. lar_o1, rid_d3)
 *   name       — last name
 *   firstName
 *   pos        — QB, RB, FB, WR, TE, slot WR, H-back, OL, DL, LB, CB, SS, FS, OLB/SS
 *   year       — Fr | RS-Fr | So | RS-So | Jr | RS-Jr | Sr | RS-Sr | 5th-Sr
 *   stars      — 1-5 (visible quality)
 *   ovr        — 65-89 (engine-facing rating)
 *   trait      — single-keyword (drives personnel synergy)
 *   isStar     — boolean (3 stars per top tier, 2 per middle, 1 per bottom)
 *   starTitle  — only when isStar=true
 *   badge      — visual icon enum (HELMET, CROSSHAIR, SPEED_LINES, FOOTBALL,
 *                GLOVE, BRICK, PADLOCK, EYE, CLEAT, CLIPBOARD)
 *   num        — jersey number (position-appropriate)
 *   ability    — short descriptive string
 *   side       — 'offense' | 'defense'
 *   team       — internal team ID (legacy: sentinels/wolves/stags/serpents/...)
 *   st         — { kickPower, kickAccuracy, returnAbility } — 1-5 each
 */


// ════════════════════════════════════════════════════════════════════════════
// LARKSPUR PRONGHORNS — Power Spread (top tier, veteran-heavy)
// ════════════════════════════════════════════════════════════════════════════
export const PRONGHORNS_OFFENSE = [
  { id:'lar_o1', name:'Schroeder', firstName:'Brock', pos:'RB', year:'5th-Sr', stars:5, ovr:88, trait:'TRUCK STICK', isStar:true, starTitle:'The Hammer', badge:'HELMET', num:28, ability:'Breaks arm tackles, finishes runs forward', side:'offense', team:'pronghorns', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
  { id:'lar_o2', name:'Anderson', firstName:'Reid', pos:'QB', year:'Sr', stars:4, ovr:81, trait:'RPO READER', isStar:false, badge:'CROSSHAIR', num:14, ability:'Reads the conflict defender pre-snap', side:'offense', team:'pronghorns', st:{kickPower:2,kickAccuracy:3,returnAbility:1} },
  { id:'lar_o3', name:'Olson', firstName:'Kade', pos:'H-back', year:'Jr', stars:3, ovr:77, trait:'MISMATCH', isStar:false, badge:'GLOVE', num:45, ability:'Wins the seam vs LB coverage', side:'offense', team:'pronghorns', st:{kickPower:3,kickAccuracy:2,returnAbility:2} },
  { id:'lar_o4', name:'Hernandez', firstName:'Ty', pos:'WR', year:'Sr', stars:3, ovr:78, trait:'YAC BEAST', isStar:false, badge:'SPEED_LINES', num:5, ability:'Explosive after the catch', side:'offense', team:'pronghorns', st:{kickPower:1,kickAccuracy:1,returnAbility:4} },
  { id:'lar_o5', name:'Bauer', firstName:'Gunnar', pos:'OL', year:'RS-Sr', stars:5, ovr:86, trait:'PULLING GUARD', isStar:true, starTitle:'The Wagon Train', badge:'BRICK', num:66, ability:'Pulls and leads the play to the gap', side:'offense', team:'pronghorns', st:{kickPower:5,kickAccuracy:2,returnAbility:1} },
  { id:'lar_o6', name:'Koch', firstName:'Drew', pos:'OL', year:'RS-Sr', stars:4, ovr:80, trait:'ANCHOR', isStar:false, badge:'BRICK', num:62, ability:'Holds the point, snaps it clean', side:'offense', team:'pronghorns', st:{kickPower:4,kickAccuracy:3,returnAbility:1} },
  { id:'lar_o7', name:'Kraus', firstName:'Cooper', pos:'OL', year:'Sr', stars:4, ovr:80, trait:'ROAD GRADER', isStar:false, badge:'BRICK', num:71, ability:'Drives D-linemen off the ball', side:'offense', team:'pronghorns', st:{kickPower:4,kickAccuracy:2,returnAbility:1} },
];
export const PRONGHORNS_DEFENSE = [
  { id:'lar_d1', name:'Polacek', firstName:'Karsen', pos:'DL', year:'So', stars:3, ovr:75, trait:'EDGE SETTER', isStar:false, badge:'BRICK', num:92, ability:'Sets the edge vs the option', side:'defense', team:'pronghorns', st:{kickPower:2,kickAccuracy:1,returnAbility:1} },
  { id:'lar_d2', name:'Fischer', firstName:'Cody', pos:'DL', year:'So', stars:3, ovr:76, trait:'RUN STUFFER', isStar:false, badge:'BRICK', num:98, ability:'Plugs the A-gap', side:'defense', team:'pronghorns', st:{kickPower:4,kickAccuracy:1,returnAbility:1} },
  { id:'lar_d3', name:'Svoboda', firstName:'Tucker', pos:'DL', year:'Fr', stars:3, ovr:72, trait:'PASS RUSHER', isStar:false, badge:'SPEED_LINES', num:56, ability:'Quick first step off the snap', side:'defense', team:'pronghorns', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'lar_d4', name:'Hoffman', firstName:'Easton', pos:'OLB/SS', year:'Sr', stars:5, ovr:85, trait:'OVERHANG', isStar:true, starTitle:'The Wedge', badge:'EYE', num:11, ability:'Hybrid overhang — covers TEs and fits the run', side:'defense', team:'pronghorns', st:{kickPower:1,kickAccuracy:2,returnAbility:3} },
  { id:'lar_d5', name:'Meyer', firstName:'Tanner', pos:'CB', year:'Sr', stars:4, ovr:81, trait:'PATTERN READER', isStar:false, badge:'PADLOCK', num:2, ability:'Reads route distribution and matches', side:'defense', team:'pronghorns', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
  { id:'lar_d6', name:'Brooks', firstName:'Marcus', pos:'CB', year:'Jr', stars:3, ovr:77, trait:'ZONE READER', isStar:false, badge:'EYE', num:21, ability:'Reads the QB eyes in zone', side:'defense', team:'pronghorns', st:{kickPower:1,kickAccuracy:1,returnAbility:2} },
  { id:'lar_d7', name:'Lopez', firstName:'Diego', pos:'FS', year:'Jr', stars:4, ovr:79, trait:'CENTERFIELDER', isStar:false, badge:'EYE', num:33, ability:'Plays the deep middle', side:'defense', team:'pronghorns', st:{kickPower:1,kickAccuracy:2,returnAbility:3} },
];


// ════════════════════════════════════════════════════════════════════════════
// HOLLOWRIDGE SPECTRES — Spread Option (top tier, defensive-heavy stars)
// ════════════════════════════════════════════════════════════════════════════
export const SPECTRES_OFFENSE = [
  { id:'hol_o1', name:'Petrillo', firstName:'Anthony', pos:'QB', year:'Sr', stars:5, ovr:88, trait:'DUAL THREAT', isStar:true, starTitle:'The Storm Caller', badge:'CLEAT', num:7, ability:'Reads the DE — gives or keeps and runs', side:'offense', team:'stags', st:{kickPower:2,kickAccuracy:3,returnAbility:4} },
  { id:'hol_o2', name:'Blankenship', firstName:'Hunter', pos:'RB', year:'Jr', stars:4, ovr:80, trait:'ZONE CUT', isStar:false, badge:'CLEAT', num:32, ability:'Reads the playside DT and cuts', side:'offense', team:'stags', st:{kickPower:1,kickAccuracy:1,returnAbility:4} },
  { id:'hol_o3', name:'Workman', firstName:'Caleb', pos:'WR', year:'Jr', stars:3, ovr:76, trait:'ROUTE IQ', isStar:false, badge:'FOOTBALL', num:9, ability:'Crisp routes get him open', side:'offense', team:'stags', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
  { id:'hol_o4', name:'McCoy', firstName:'Logan', pos:'WR', year:'So', stars:3, ovr:75, trait:'YAC BEAST', isStar:false, badge:'SPEED_LINES', num:88, ability:'Explosive after the catch', side:'offense', team:'stags', st:{kickPower:1,kickAccuracy:1,returnAbility:4} },
  { id:'hol_o5', name:'DiLorenzo', firstName:'Vincent', pos:'OL', year:'Sr', stars:3, ovr:78, trait:'ANCHOR', isStar:false, badge:'BRICK', num:74, ability:'Holds the point of attack', side:'offense', team:'stags', st:{kickPower:4,kickAccuracy:2,returnAbility:1} },
  { id:'hol_o6', name:'Kovach', firstName:'Dominic', pos:'OL', year:'Sr', stars:4, ovr:81, trait:'LEADER', isStar:false, badge:'CLIPBOARD', num:65, ability:'Sets the protections, leads the line', side:'offense', team:'stags', st:{kickPower:3,kickAccuracy:3,returnAbility:1} },
  { id:'hol_o7', name:'Stover', firstName:'Tyler', pos:'OL', year:'Jr', stars:3, ovr:77, trait:'ROAD GRADER', isStar:false, badge:'BRICK', num:79, ability:'Drives D-linemen off the ball', side:'offense', team:'stags', st:{kickPower:4,kickAccuracy:2,returnAbility:1} },
];
export const SPECTRES_DEFENSE = [
  { id:'hol_d1', name:'Bartek', firstName:'Bryce', pos:'DL', year:'RS-Sr', stars:3, ovr:78, trait:'EDGE SPEED', isStar:false, badge:'SPEED_LINES', num:99, ability:'Speed off the edge', side:'defense', team:'stags', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'hol_d2', name:'Lilly', firstName:'Garrett', pos:'DL', year:'Jr', stars:4, ovr:80, trait:'INTERIOR BULL', isStar:false, badge:'BRICK', num:94, ability:'Bull-rushes the interior', side:'defense', team:'stags', st:{kickPower:4,kickAccuracy:1,returnAbility:1} },
  { id:'hol_d3', name:'Freeman', firstName:'Khalil', pos:'DL', year:'Fr', stars:3, ovr:74, trait:'PASS RUSHER', isStar:false, badge:'SPEED_LINES', num:58, ability:'Quick first step', side:'defense', team:'stags', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'hol_d4', name:'Mazur', firstName:'Cole', pos:'LB', year:'Sr', stars:4, ovr:81, trait:'ROBBER LB', isStar:false, badge:'EYE', num:44, ability:'Robs the QB eyes underneath', side:'defense', team:'stags', st:{kickPower:2,kickAccuracy:1,returnAbility:1} },
  { id:'hol_d5', name:'Washington', firstName:'Demetrius', pos:'CB', year:'Sr', stars:5, ovr:87, trait:'SHUTDOWN', isStar:true, starTitle:'The Lockdown', badge:'PADLOCK', num:4, ability:'Lockdown press man — never beaten deep', side:'defense', team:'stags', st:{kickPower:1,kickAccuracy:1,returnAbility:4} },
  { id:'hol_d6', name:'Carter', firstName:'Marquez', pos:'CB', year:'Fr', stars:3, ovr:73, trait:'PRESS CORNER', isStar:false, badge:'PADLOCK', num:25, ability:'Physical at the line', side:'defense', team:'stags', st:{kickPower:1,kickAccuracy:1,returnAbility:2} },
  { id:'hol_d7', name:'Hatfield', firstName:'Bryce', pos:'FS', year:'RS-Sr', stars:5, ovr:86, trait:'BALL HAWK', isStar:true, starTitle:'The Hollowridge Howl', badge:'EYE', num:20, ability:'Reads the QB and jumps the route', side:'defense', team:'stags', st:{kickPower:1,kickAccuracy:2,returnAbility:3} },
];


// ════════════════════════════════════════════════════════════════════════════
// VERMONT MAPLES — Multiple (middle tier, balanced/intellectual)
// ════════════════════════════════════════════════════════════════════════════
export const MAPLES_OFFENSE = [
  { id:'vmt_o1', name:'Pelletier', firstName:'Owen', pos:'QB', year:'Sr', stars:3, ovr:78, trait:'GAME MANAGER', isStar:false, badge:'CLIPBOARD', num:16, ability:'Doesn\'t turn it over — knows the playbook cold', side:'offense', team:'maples', st:{kickPower:2,kickAccuracy:3,returnAbility:1} },
  { id:'vmt_o2', name:'Bergeron', firstName:'Connor', pos:'RB', year:'So', stars:3, ovr:75, trait:'BALANCED', isStar:false, badge:'CLEAT', num:30, ability:'Catches and runs equally', side:'offense', team:'maples', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
  { id:'vmt_o3', name:'Whitcomb', firstName:'Liam', pos:'TE', year:'Sr', stars:5, ovr:86, trait:'OPTION ROUTES', isStar:true, starTitle:'The Professor', badge:'GLOVE', num:87, ability:'Reads the coverage and breaks accordingly', side:'offense', team:'maples', st:{kickPower:3,kickAccuracy:1,returnAbility:1} },
  { id:'vmt_o4', name:'Murphy', firstName:'Logan', pos:'WR', year:'So', stars:3, ovr:73, trait:'POSSESSION', isStar:false, badge:'GLOVE', num:18, ability:'Reliable hands on third down', side:'offense', team:'maples', st:{kickPower:1,kickAccuracy:1,returnAbility:2} },
  { id:'vmt_o5', name:'Gagnon', firstName:'Mathieu', pos:'OL', year:'Sr', stars:3, ovr:77, trait:'ANCHOR', isStar:false, badge:'BRICK', num:67, ability:'Holds the point of attack', side:'offense', team:'maples', st:{kickPower:4,kickAccuracy:2,returnAbility:1} },
  { id:'vmt_o6', name:'Tremblay', firstName:'Pierre', pos:'OL', year:'RS-Sr', stars:4, ovr:79, trait:'LEADER', isStar:false, badge:'CLIPBOARD', num:50, ability:'Sets protections, runs the line', side:'offense', team:'maples', st:{kickPower:3,kickAccuracy:3,returnAbility:1} },
  { id:'vmt_o7', name:'Hastings', firstName:'Brayden', pos:'OL', year:'Jr', stars:3, ovr:75, trait:'ROAD GRADER', isStar:false, badge:'BRICK', num:76, ability:'Drives D-linemen off the ball', side:'offense', team:'maples', st:{kickPower:4,kickAccuracy:2,returnAbility:1} },
];
export const MAPLES_DEFENSE = [
  { id:'vmt_d1', name:'O\'Connor', firstName:'Finn', pos:'DL', year:'So', stars:3, ovr:74, trait:'EDGE', isStar:false, badge:'SPEED_LINES', num:91, ability:'Sets the edge', side:'defense', team:'maples', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'vmt_d2', name:'Lavoie', firstName:'Nolan', pos:'DL', year:'Jr', stars:3, ovr:76, trait:'RUN STUFFER', isStar:false, badge:'BRICK', num:97, ability:'Plugs the A-gap', side:'defense', team:'maples', st:{kickPower:4,kickAccuracy:1,returnAbility:1} },
  { id:'vmt_d3', name:'Bouchard', firstName:'Remi', pos:'DL', year:'RS-Sr', stars:3, ovr:75, trait:'EDGE', isStar:false, badge:'SPEED_LINES', num:54, ability:'Sets the edge', side:'defense', team:'maples', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'vmt_d4', name:'Roy', firstName:'Tyler', pos:'LB', year:'So', stars:3, ovr:75, trait:'COVERAGE LB', isStar:false, badge:'EYE', num:43, ability:'Covers backs and tight ends', side:'defense', team:'maples', st:{kickPower:2,kickAccuracy:1,returnAbility:1} },
  { id:'vmt_d5', name:'Bennett', firstName:'Marcus', pos:'CB', year:'Jr', stars:3, ovr:76, trait:'ZONE READER', isStar:false, badge:'EYE', num:6, ability:'Reads the QB eyes in zone', side:'defense', team:'maples', st:{kickPower:1,kickAccuracy:1,returnAbility:2} },
  { id:'vmt_d6', name:'Boucher', firstName:'Declan', pos:'SS', year:'Fr', stars:3, ovr:72, trait:'RUN SUPPORT', isStar:false, badge:'HELMET', num:29, ability:'Comes downhill to fit the run', side:'defense', team:'maples', st:{kickPower:1,kickAccuracy:1,returnAbility:2} },
  { id:'vmt_d7', name:'LaFleur', firstName:'Samuel', pos:'FS', year:'Sr', stars:5, ovr:86, trait:'DISGUISE ARTIST', isStar:true, starTitle:'The Reading Room', badge:'EYE', num:19, ability:'Disguises pre-snap, rotates late', side:'defense', team:'maples', st:{kickPower:1,kickAccuracy:2,returnAbility:3} },
];


// ════════════════════════════════════════════════════════════════════════════
// HELIX SALAMANDERS — Air Raid (middle tier, balanced/analytical)
// ════════════════════════════════════════════════════════════════════════════
export const SALAMANDERS_OFFENSE = [
  { id:'hel_o1', name:'Cervantes', firstName:'Mateo', pos:'QB', year:'Sr', stars:5, ovr:87, trait:'PRECISION POCKET', isStar:true, starTitle:'The Equation', badge:'CROSSHAIR', num:10, ability:'Surgical from the pocket — never misses the open guy', side:'offense', team:'salamanders', st:{kickPower:2,kickAccuracy:4,returnAbility:1} },
  { id:'hel_o2', name:'Reyes', firstName:'Diego', pos:'RB', year:'Jr', stars:3, ovr:75, trait:'PASS CATCHER', isStar:false, badge:'CLEAT', num:23, ability:'Catches out of the backfield', side:'offense', team:'salamanders', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
  { id:'hel_o3', name:'Mendoza', firstName:'Daniel', pos:'WR', year:'Sr', stars:4, ovr:80, trait:'ROUTE IQ', isStar:false, badge:'FOOTBALL', num:11, ability:'Reads coverage and breaks open', side:'offense', team:'salamanders', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
  { id:'hel_o4', name:'Flores', firstName:'Joaquin', pos:'WR', year:'Jr', stars:3, ovr:76, trait:'MESH SPECIALIST', isStar:false, badge:'GLOVE', num:4, ability:'Times the rub on mesh — gets clean every time', side:'offense', team:'salamanders', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
  { id:'hel_o5', name:'Schmidt', firstName:'Karl', pos:'OL', year:'Jr', stars:3, ovr:76, trait:'ANCHOR', isStar:false, badge:'BRICK', num:69, ability:'Holds the pocket', side:'offense', team:'salamanders', st:{kickPower:4,kickAccuracy:2,returnAbility:1} },
  { id:'hel_o6', name:'Mueller', firstName:'Lukas', pos:'OL', year:'Sr', stars:3, ovr:78, trait:'LEADER', isStar:false, badge:'CLIPBOARD', num:54, ability:'Sets protection IDs', side:'offense', team:'salamanders', st:{kickPower:3,kickAccuracy:3,returnAbility:1} },
  { id:'hel_o7', name:'Weber', firstName:'Hayden', pos:'OL', year:'So', stars:3, ovr:73, trait:'PASS PRO', isStar:false, badge:'BRICK', num:77, ability:'Sound in pass protection', side:'offense', team:'salamanders', st:{kickPower:3,kickAccuracy:2,returnAbility:1} },
];
export const SALAMANDERS_DEFENSE = [
  { id:'hel_d1', name:'Krause', firstName:'Brennan', pos:'DL', year:'Fr', stars:3, ovr:71, trait:'EDGE', isStar:false, badge:'SPEED_LINES', num:95, ability:'Sets the edge', side:'defense', team:'salamanders', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'hel_d2', name:'Hoffman', firstName:'Emilio', pos:'DL', year:'So', stars:3, ovr:75, trait:'INTERIOR', isStar:false, badge:'BRICK', num:93, ability:'Plugs the interior', side:'defense', team:'salamanders', st:{kickPower:4,kickAccuracy:1,returnAbility:1} },
  { id:'hel_d3', name:'Novak', firstName:'Kade', pos:'DL', year:'Jr', stars:3, ovr:77, trait:'EDGE', isStar:false, badge:'SPEED_LINES', num:59, ability:'Sets the edge', side:'defense', team:'salamanders', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'hel_d4', name:'Janecek', firstName:'Adrian', pos:'LB', year:'Sr', stars:5, ovr:86, trait:'PROCESSOR', isStar:true, starTitle:'The Algorithm', badge:'EYE', num:50, ability:'Diagnoses pre-snap and triggers correctly', side:'defense', team:'salamanders', st:{kickPower:2,kickAccuracy:1,returnAbility:1} },
  { id:'hel_d5', name:'Garcia', firstName:'Cristian', pos:'CB', year:'So', stars:3, ovr:74, trait:'ZONE READER', isStar:false, badge:'EYE', num:1, ability:'Reads the QB eyes in zone', side:'defense', team:'salamanders', st:{kickPower:1,kickAccuracy:1,returnAbility:2} },
  { id:'hel_d6', name:'Bryant', firstName:'Trey', pos:'SS', year:'Fr', stars:3, ovr:72, trait:'COVER 2 SAFETY', isStar:false, badge:'EYE', num:22, ability:'Plays the half-field over the top', side:'defense', team:'salamanders', st:{kickPower:1,kickAccuracy:1,returnAbility:2} },
  { id:'hel_d7', name:'Ramirez', firstName:'Santiago', pos:'FS', year:'RS-Sr', stars:3, ovr:79, trait:'RANGE FS', isStar:false, badge:'EYE', num:15, ability:'Plays sideline-to-sideline at depth', side:'defense', team:'salamanders', st:{kickPower:1,kickAccuracy:2,returnAbility:3} },
];


// ════════════════════════════════════════════════════════════════════════════
// CORAL BAY DOLPHINS — Vertical Pass (middle tier, transfer-portal veteran)
// ════════════════════════════════════════════════════════════════════════════
export const WOLVES_OFFENSE = [
  { id:'cor_o1', name:'Rodriguez', firstName:'Christian', pos:'QB', year:'RS-Sr', stars:4, ovr:82, trait:'STRONG ARM', isStar:false, badge:'CROSSHAIR', num:8, ability:'Drives the deep ball with arm strength', side:'offense', team:'wolves', st:{kickPower:3,kickAccuracy:3,returnAbility:1} },
  { id:'cor_o2', name:'Thompson', firstName:'Dimitri', pos:'RB', year:'Sr', stars:3, ovr:76, trait:'PASS CATCHER', isStar:false, badge:'CLEAT', num:26, ability:'Catches out of the backfield on third down', side:'offense', team:'wolves', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
  { id:'cor_o3', name:'Beauvais', firstName:'Tre', pos:'WR', year:'5th-Sr', stars:5, ovr:89, trait:'CONTESTED CATCH', isStar:true, starTitle:'The Misfit', badge:'GLOVE', num:3, ability:'Wins jump balls 1-on-1 vs press man', side:'offense', team:'wolves', st:{kickPower:1,kickAccuracy:1,returnAbility:4} },
  { id:'cor_o4', name:'Hayes', firstName:'Xavier', pos:'WR', year:'RS-Sr', stars:4, ovr:81, trait:'DEEP THREAT', isStar:false, badge:'SPEED_LINES', num:13, ability:'Burns single-high coverage deep', side:'offense', team:'wolves', st:{kickPower:1,kickAccuracy:1,returnAbility:5} },
  { id:'cor_o5', name:'Suarez', firstName:'Carlos', pos:'OL', year:'Sr', stars:3, ovr:78, trait:'ANCHOR', isStar:false, badge:'BRICK', num:75, ability:'Anchors the pocket', side:'offense', team:'wolves', st:{kickPower:4,kickAccuracy:2,returnAbility:1} },
  { id:'cor_o6', name:'Pierre', firstName:'Jean-Baptiste', pos:'OL', year:'Sr', stars:3, ovr:78, trait:'LEADER', isStar:false, badge:'CLIPBOARD', num:58, ability:'Sets protections, snaps clean', side:'offense', team:'wolves', st:{kickPower:3,kickAccuracy:3,returnAbility:1} },
  { id:'cor_o7', name:'Castillo', firstName:'Marco', pos:'OL', year:'Jr', stars:3, ovr:75, trait:'PASS PRO', isStar:false, badge:'BRICK', num:72, ability:'Sound in pass protection', side:'offense', team:'wolves', st:{kickPower:3,kickAccuracy:2,returnAbility:1} },
];
export const WOLVES_DEFENSE = [
  { id:'cor_d1', name:'Diaz', firstName:'Alejandro', pos:'DL', year:'Sr', stars:3, ovr:78, trait:'EDGE SPEED', isStar:false, badge:'SPEED_LINES', num:96, ability:'Speed off the edge', side:'defense', team:'wolves', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'cor_d2', name:'Henderson', firstName:'Luis', pos:'DL', year:'Jr', stars:3, ovr:76, trait:'INTERIOR', isStar:false, badge:'BRICK', num:92, ability:'Plugs the interior', side:'defense', team:'wolves', st:{kickPower:4,kickAccuracy:1,returnAbility:1} },
  { id:'cor_d3', name:'Foster', firstName:'Kendrick', pos:'DL', year:'RS-Sr', stars:3, ovr:78, trait:'EDGE', isStar:false, badge:'SPEED_LINES', num:51, ability:'Sets the edge', side:'defense', team:'wolves', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'cor_d4', name:'Joseph', firstName:'Anthony', pos:'LB', year:'Jr', stars:3, ovr:76, trait:'COVER LB', isStar:false, badge:'EYE', num:41, ability:'Locks up RBs and TEs in man', side:'defense', team:'wolves', st:{kickPower:2,kickAccuracy:1,returnAbility:1} },
  { id:'cor_d5', name:'Saint-Fleur', firstName:'Marco', pos:'CB', year:'Sr', stars:4, ovr:81, trait:'PRESS CORNER', isStar:false, badge:'PADLOCK', num:24, ability:'Physical at the line', side:'defense', team:'wolves', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
  { id:'cor_d6', name:'Owens', firstName:'Jamal', pos:'CB', year:'Fr', stars:3, ovr:73, trait:'PRESS CORNER', isStar:false, badge:'PADLOCK', num:34, ability:'Aggressive press technique', side:'defense', team:'wolves', st:{kickPower:1,kickAccuracy:1,returnAbility:2} },
  { id:'cor_d7', name:'Cadet', firstName:'Giovanni', pos:'FS', year:'Sr', stars:5, ovr:87, trait:'BALL HAWK', isStar:true, starTitle:'The Architect\'s Kid', badge:'EYE', num:7, ability:'Reads the QB and jumps the route', side:'defense', team:'wolves', st:{kickPower:1,kickAccuracy:2,returnAbility:3} },
];


// ════════════════════════════════════════════════════════════════════════════
// BLACKWATER SERPENTS — Triple Option (middle tier, balanced)
// ════════════════════════════════════════════════════════════════════════════
export const SERPENTS_OFFENSE = [
  { id:'bla_o1', name:'Hebert', firstName:'Etienne', pos:'QB', year:'Sr', stars:5, ovr:86, trait:'OPTION READ', isStar:true, starTitle:'The Cold Hand', badge:'EYE', num:5, ability:'Reads the keys cold — gives, keeps, or pitches', side:'offense', team:'serpents', st:{kickPower:2,kickAccuracy:3,returnAbility:3} },
  { id:'bla_o2', name:'Boudreaux', firstName:'Beau', pos:'FB', year:'Sr', stars:3, ovr:78, trait:'INSIDE DIVE', isStar:false, badge:'HELMET', num:34, ability:'Hits the dive hole hard, downhill', side:'offense', team:'serpents', st:{kickPower:2,kickAccuracy:1,returnAbility:2} },
  { id:'bla_o3', name:'Landry', firstName:'Remy', pos:'WR', year:'Jr', stars:3, ovr:76, trait:'PERIMETER OPTION', isStar:false, badge:'CLEAT', num:2, ability:'Takes the pitch and reads the perimeter', side:'offense', team:'serpents', st:{kickPower:1,kickAccuracy:1,returnAbility:4} },
  { id:'bla_o4', name:'LeBlanc', firstName:'Pierre', pos:'WR', year:'Fr', stars:3, ovr:73, trait:'DEEP THREAT', isStar:false, badge:'SPEED_LINES', num:84, ability:'Burns single-high on the PA shot', side:'offense', team:'serpents', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
  { id:'bla_o5', name:'Broussard', firstName:'Luc', pos:'OL', year:'Jr', stars:3, ovr:76, trait:'ANCHOR', isStar:false, badge:'BRICK', num:63, ability:'Holds the point of attack', side:'offense', team:'serpents', st:{kickPower:4,kickAccuracy:2,returnAbility:1} },
  { id:'bla_o6', name:'Thibodeaux', firstName:'Jude', pos:'OL', year:'Sr', stars:4, ovr:80, trait:'LEADER', isStar:false, badge:'CLIPBOARD', num:55, ability:'Calls the line — runs the option from the snap', side:'offense', team:'serpents', st:{kickPower:3,kickAccuracy:3,returnAbility:1} },
  { id:'bla_o7', name:'Trahan', firstName:'Blaise', pos:'OL', year:'RS-Sr', stars:3, ovr:78, trait:'ROAD GRADER', isStar:false, badge:'BRICK', num:78, ability:'Drives D-linemen off the ball', side:'offense', team:'serpents', st:{kickPower:4,kickAccuracy:2,returnAbility:1} },
];
export const SERPENTS_DEFENSE = [
  { id:'bla_d1', name:'Guillory', firstName:'Cedric', pos:'DL', year:'Jr', stars:3, ovr:76, trait:'EDGE', isStar:false, badge:'SPEED_LINES', num:90, ability:'Sets the edge', side:'defense', team:'serpents', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'bla_d2', name:'Cormier', firstName:'Derrius', pos:'DL', year:'Sr', stars:5, ovr:87, trait:'PENETRATOR', isStar:true, starTitle:'The Bayou Beast', badge:'BRICK', num:99, ability:'3-tech penetrator — wrecks plays in the backfield', side:'defense', team:'serpents', st:{kickPower:5,kickAccuracy:1,returnAbility:1} },
  { id:'bla_d3', name:'Bourgeois', firstName:'Tyrese', pos:'DL', year:'So', stars:3, ovr:74, trait:'EDGE SPEED', isStar:false, badge:'SPEED_LINES', num:57, ability:'Speed off the edge', side:'defense', team:'serpents', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'bla_d4', name:'Benoit', firstName:'Javonte', pos:'LB', year:'Jr', stars:3, ovr:75, trait:'PURSUIT', isStar:false, badge:'CLEAT', num:42, ability:'Sideline-to-sideline pursuit', side:'defense', team:'serpents', st:{kickPower:2,kickAccuracy:1,returnAbility:1} },
  { id:'bla_d5', name:'Jefferson', firstName:'Tre', pos:'CB', year:'Fr', stars:3, ovr:71, trait:'ZONE READER', isStar:false, badge:'EYE', num:6, ability:'Reads the QB eyes in zone', side:'defense', team:'serpents', st:{kickPower:1,kickAccuracy:1,returnAbility:2} },
  { id:'bla_d6', name:'Robichaux', firstName:'Malachi', pos:'SS', year:'RS-Sr', stars:3, ovr:78, trait:'RUN FIT', isStar:false, badge:'HELMET', num:38, ability:'Comes downhill to fit the run', side:'defense', team:'serpents', st:{kickPower:1,kickAccuracy:1,returnAbility:2} },
  { id:'bla_d7', name:'Doucet', firstName:'Jamar', pos:'FS', year:'So', stars:3, ovr:73, trait:'CENTERFIELDER', isStar:false, badge:'EYE', num:25, ability:'Plays the deep middle', side:'defense', team:'serpents', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
];


// ════════════════════════════════════════════════════════════════════════════
// RIDGEMONT BOARS — Smashmouth (bottom tier, factory grinders)
// ════════════════════════════════════════════════════════════════════════════
export const SENTINELS_OFFENSE = [
  { id:'rid_o1', name:'Whitaker', firstName:'Hunter', pos:'QB', year:'Sr', stars:3, ovr:76, trait:'GAME MANAGER', isStar:false, badge:'CLIPBOARD', num:12, ability:'Doesn\'t turn it over — handles the play action fake', side:'offense', team:'sentinels', st:{kickPower:2,kickAccuracy:3,returnAbility:1} },
  { id:'rid_o2', name:'Henderson', firstName:'Marcus', pos:'RB', year:'Sr', stars:5, ovr:86, trait:'TRUCK STICK', isStar:true, starTitle:'The Freight Train', badge:'HELMET', num:34, ability:'Breaks arm tackles, finishes runs', side:'offense', team:'sentinels', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
  { id:'rid_o3', name:'Mooney', firstName:'Caleb', pos:'TE', year:'Jr', stars:3, ovr:75, trait:'INLINE BLOCKER', isStar:false, badge:'BRICK', num:82, ability:'Seals the edge for the run game', side:'offense', team:'sentinels', st:{kickPower:3,kickAccuracy:1,returnAbility:1} },
  { id:'rid_o4', name:'Tackett', firstName:'Wyatt', pos:'TE', year:'So', stars:3, ovr:72, trait:'MOVE TE', isStar:false, badge:'GLOVE', num:87, ability:'Motions and runs the seam off PA', side:'offense', team:'sentinels', st:{kickPower:2,kickAccuracy:1,returnAbility:2} },
  { id:'rid_o5', name:'Pruitt', firstName:'Cooper', pos:'OL', year:'Jr', stars:3, ovr:75, trait:'ANCHOR', isStar:false, badge:'BRICK', num:65, ability:'Holds the point of attack', side:'offense', team:'sentinels', st:{kickPower:4,kickAccuracy:2,returnAbility:1} },
  { id:'rid_o6', name:'Caldwell', firstName:'Brody', pos:'OL', year:'Sr', stars:3, ovr:76, trait:'LEADER', isStar:false, badge:'CLIPBOARD', num:50, ability:'Sets the protections', side:'offense', team:'sentinels', st:{kickPower:3,kickAccuracy:3,returnAbility:1} },
  { id:'rid_o7', name:'Honeycutt', firstName:'Tanner', pos:'OL', year:'Jr', stars:3, ovr:74, trait:'ROAD GRADER', isStar:false, badge:'BRICK', num:72, ability:'Drives D-linemen off the ball', side:'offense', team:'sentinels', st:{kickPower:4,kickAccuracy:2,returnAbility:1} },
];
export const SENTINELS_DEFENSE = [
  { id:'rid_d1', name:'Shivers', firstName:'Levi', pos:'DL', year:'RS-Sr', stars:3, ovr:75, trait:'EDGE', isStar:false, badge:'SPEED_LINES', num:92, ability:'Sets the edge', side:'defense', team:'sentinels', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'rid_d2', name:'Easley', firstName:'Dalton', pos:'DL', year:'Jr', stars:3, ovr:73, trait:'RUN STUFFER', isStar:false, badge:'BRICK', num:95, ability:'Plugs the A-gap', side:'defense', team:'sentinels', st:{kickPower:4,kickAccuracy:1,returnAbility:1} },
  { id:'rid_d3', name:'Campbell', firstName:'Tucker', pos:'DL', year:'Fr', stars:2, ovr:68, trait:'EDGE', isStar:false, badge:'SPEED_LINES', num:57, ability:'Backup edge — still developing', side:'defense', team:'sentinels', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'rid_d4', name:'Walker', firstName:'Jaxon', pos:'LB', year:'Sr', stars:3, ovr:75, trait:'RUN STUFFER', isStar:false, badge:'HELMET', num:44, ability:'Plugs every gap', side:'defense', team:'sentinels', st:{kickPower:2,kickAccuracy:1,returnAbility:1} },
  { id:'rid_d5', name:'Williams', firstName:'Bryson', pos:'CB', year:'Fr', stars:2, ovr:65, trait:'ZONE', isStar:false, badge:'EYE', num:25, ability:'Plays soft zone — still learning press', side:'defense', team:'sentinels', st:{kickPower:1,kickAccuracy:1,returnAbility:2} },
  { id:'rid_d6', name:'McDonald', firstName:'Cody', pos:'SS', year:'RS-Sr', stars:3, ovr:73, trait:'RUN SUPPORT', isStar:false, badge:'HELMET', num:30, ability:'Comes downhill to fit the run', side:'defense', team:'sentinels', st:{kickPower:1,kickAccuracy:1,returnAbility:2} },
  { id:'rid_d7', name:'Hayes', firstName:'DeMarcus', pos:'FS', year:'So', stars:2, ovr:67, trait:'CENTERFIELDER', isStar:false, badge:'EYE', num:21, ability:'Plays the deep middle — still developing range', side:'defense', team:'sentinels', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
];


// ════════════════════════════════════════════════════════════════════════════
// SACRAMENTO RACCOONS — Veer & Shoot (bottom tier, YOUNG program)
// ════════════════════════════════════════════════════════════════════════════
export const RACCOONS_OFFENSE = [
  { id:'sac_o1', name:'Garcia', firstName:'Daniel', pos:'QB', year:'Jr', stars:3, ovr:76, trait:'QUICK PROCESS', isStar:false, badge:'CROSSHAIR', num:10, ability:'Quick processor — gets the ball out fast', side:'offense', team:'raccoons', st:{kickPower:2,kickAccuracy:3,returnAbility:2} },
  { id:'sac_o2', name:'Lopez', firstName:'Anthony', pos:'RB', year:'So', stars:3, ovr:73, trait:'ZONE', isStar:false, badge:'CLEAT', num:27, ability:'Zone-runs with patience', side:'offense', team:'raccoons', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
  { id:'sac_o3', name:'Hernandez', firstName:'Jamal', pos:'WR', year:'Sr', stars:3, ovr:78, trait:'DEEP THREAT', isStar:false, badge:'SPEED_LINES', num:19, ability:'Burns single-high on the deep ball', side:'offense', team:'raccoons', st:{kickPower:1,kickAccuracy:1,returnAbility:4} },
  { id:'sac_o4', name:'Nguyen', firstName:'Tre', pos:'WR', year:'Sr', stars:5, ovr:86, trait:'YAC BEAST', isStar:true, starTitle:'The Sideline', badge:'SPEED_LINES', num:1, ability:'Catches and breaks tackles for the YAC', side:'offense', team:'raccoons', st:{kickPower:1,kickAccuracy:1,returnAbility:5} },
  { id:'sac_o5', name:'Tran', firstName:'Khang', pos:'OL', year:'Fr', stars:3, ovr:70, trait:'ANCHOR', isStar:false, badge:'BRICK', num:68, ability:'Holds the pocket for a snap or two', side:'offense', team:'raccoons', st:{kickPower:3,kickAccuracy:2,returnAbility:1} },
  { id:'sac_o6', name:'Singh', firstName:'David', pos:'OL', year:'So', stars:3, ovr:73, trait:'LEADER', isStar:false, badge:'CLIPBOARD', num:54, ability:'Sets the protections', side:'offense', team:'raccoons', st:{kickPower:3,kickAccuracy:3,returnAbility:1} },
  { id:'sac_o7', name:'Yang', firstName:'Jacob', pos:'OL', year:'Fr', stars:3, ovr:70, trait:'PASS PRO', isStar:false, badge:'BRICK', num:75, ability:'Sound in pass protection — learning the run', side:'offense', team:'raccoons', st:{kickPower:3,kickAccuracy:2,returnAbility:1} },
];
export const RACCOONS_DEFENSE = [
  { id:'sac_d1', name:'Pham', firstName:'Sergio', pos:'DL', year:'Jr', stars:3, ovr:75, trait:'EDGE', isStar:false, badge:'SPEED_LINES', num:91, ability:'Sets the edge', side:'defense', team:'raccoons', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'sac_d2', name:'Vang', firstName:'Tou', pos:'DL', year:'So', stars:3, ovr:72, trait:'INTERIOR', isStar:false, badge:'BRICK', num:99, ability:'Plugs the interior', side:'defense', team:'raccoons', st:{kickPower:4,kickAccuracy:1,returnAbility:1} },
  { id:'sac_d3', name:'Le', firstName:'Marcus', pos:'DL', year:'Fr', stars:3, ovr:70, trait:'EDGE SPEED', isStar:false, badge:'SPEED_LINES', num:56, ability:'Speed off the edge — still developing', side:'defense', team:'raccoons', st:{kickPower:1,kickAccuracy:1,returnAbility:1} },
  { id:'sac_d4', name:'Xiong', firstName:'Andres', pos:'LB', year:'Jr', stars:3, ovr:75, trait:'ZONE-DROP', isStar:false, badge:'EYE', num:45, ability:'Drops to short zone, reads the QB', side:'defense', team:'raccoons', st:{kickPower:2,kickAccuracy:1,returnAbility:1} },
  { id:'sac_d5', name:'Mitchell', firstName:'Kai', pos:'CB', year:'Fr', stars:3, ovr:70, trait:'BOUNDARY', isStar:false, badge:'PADLOCK', num:6, ability:'Boundary corner — physical at the LOS', side:'defense', team:'raccoons', st:{kickPower:1,kickAccuracy:1,returnAbility:3} },
  { id:'sac_d6', name:'Thao', firstName:'Pao', pos:'SS', year:'So', stars:3, ovr:71, trait:'COVER 2 SAFETY', isStar:false, badge:'EYE', num:32, ability:'Plays the half-field over the top', side:'defense', team:'raccoons', st:{kickPower:1,kickAccuracy:1,returnAbility:2} },
  { id:'sac_d7', name:'Yang', firstName:'Minh', pos:'FS', year:'Fr', stars:3, ovr:71, trait:'RANGE FS', isStar:false, badge:'EYE', num:23, ability:'Plays sideline-to-sideline at depth', side:'defense', team:'raccoons', st:{kickPower:1,kickAccuracy:2,returnAbility:3} },
];


// ════════════════════════════════════════════════════════════════════════════
// LOOKUP HELPERS
// ════════════════════════════════════════════════════════════════════════════
var _rosters = {
  pronghorns:  { offense: PRONGHORNS_OFFENSE,  defense: PRONGHORNS_DEFENSE },
  stags:       { offense: SPECTRES_OFFENSE,    defense: SPECTRES_DEFENSE },
  maples:      { offense: MAPLES_OFFENSE,      defense: MAPLES_DEFENSE },
  salamanders: { offense: SALAMANDERS_OFFENSE, defense: SALAMANDERS_DEFENSE },
  wolves:      { offense: WOLVES_OFFENSE,      defense: WOLVES_DEFENSE },
  serpents:    { offense: SERPENTS_OFFENSE,    defense: SERPENTS_DEFENSE },
  sentinels:   { offense: SENTINELS_OFFENSE,   defense: SENTINELS_DEFENSE },
  raccoons:    { offense: RACCOONS_OFFENSE,    defense: RACCOONS_DEFENSE },
};

export function getOffenseRoster(teamId) {
  return _rosters[teamId] ? _rosters[teamId].offense : [];
}

export function getDefenseRoster(teamId) {
  return _rosters[teamId] ? _rosters[teamId].defense : [];
}

export function getFullRoster(teamId) {
  return [...getOffenseRoster(teamId), ...getDefenseRoster(teamId)];
}

export function getStarters(roster) {
  return roster.slice(0, 4);
}

export function getBench(roster) {
  return roster.slice(4);
}

/** Get all star players (isStar=true) for a team. */
export function getStars(teamId) {
  return getFullRoster(teamId).filter(p => p.isStar);
}
