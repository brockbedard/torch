export const CT_OFF_CARDS=[
  {id:'mesh',         name:'MESH',           type:'pass',cat:'Pass - Short', icon:'\u2194',  desc:'Two receivers cross in traffic at 5-7 yards. Man coverage killer.'},
  {id:'four_verts',   name:'FOUR VERTS',     type:'pass',cat:'Pass - Deep',  icon:'\u2B06',  desc:'All receivers go deep. Stretches safeties horizontally.'},
  {id:'shallow_cross',name:'SHALLOW CROSS',  type:'pass',cat:'Pass - Quick', icon:'\u27A1',  desc:'WR drags across underneath at 4 yards. Quick, reliable.'},
  {id:'y_corner',     name:'Y-CORNER',       type:'pass',cat:'Pass - Deep',  icon:'\u2196',  desc:'Slot receiver fakes in then breaks to the corner at 15 yards. Cover 2 beater.'},
  {id:'stick',        name:'STICK',          type:'pass',cat:'Pass - Quick', icon:'\uD83D\uDCCD',desc:'Quick 3-step concept. Hitch at 6 yards with a flat option.'},
  {id:'slant',        name:'SLANT',          type:'pass',cat:'Pass - Quick', icon:'\u26A1',  desc:'Quick inside break at 5 yards. Timing route.'},
  {id:'go_route',     name:'GO ROUTE',       type:'pass',cat:'Pass - Bomb',  icon:'\uD83D\uDE80',desc:'Straight vertical bomb. Home run or bust.'},
  {id:'bubble_screen',name:'BUBBLE SCREEN',  type:'pass',cat:'Pass - Screen',icon:'\uD83D\uDCA8',desc:'Quick lateral to the WR with blockers. Blitz beater.'},
  {id:'draw',         name:'DRAW',           type:'run', cat:'Run',          icon:'\uD83C\uDCCF',desc:'Fake pass, hand to RB. Only run play that makes sense in Air Raid.'},
  {id:'qb_sneak',     name:'QB SNEAK',       type:'run', cat:'Run - Short',  icon:'\uD83C\uDFC3',desc:'Short yardage push. Universal.'},
];

export const IR_OFF_CARDS=[
  {id:'triple_option',name:'TRIPLE OPTION',  type:'run', cat:'Run - Option', icon:'\uD83D\uDD25',desc:'Give, keep, or pitch. The signature play. QB reads the DE.'},
  {id:'midline',      name:'MIDLINE',        type:'run', cat:'Run - Inside', icon:'\u23EC',  desc:'QB reads the DT instead of the DE. Fullback dive inside.'},
  {id:'rocket_toss',  name:'ROCKET TOSS',    type:'run', cat:'Run - Outside',icon:'\uD83D\uDE80',desc:'Quick pitch sweep to the outside. Speed to the edge.'},
  {id:'trap',         name:'TRAP',           type:'run', cat:'Run - Inside', icon:'\uD83E\uDE9C',desc:'Offensive lineman pulls to block the unblocked defender. Deceptive.'},
  {id:'qb_keeper',    name:'QB KEEPER',      type:'run', cat:'Run - Option', icon:'\uD83C\uDFC3',desc:'QB keeps on the option read and turns upfield.'},
  {id:'power',        name:'POWER',          type:'run', cat:'Run - Power',  icon:'\uD83D\uDCAA',desc:'Lead blocker through the gap. Downhill physical.'},
  {id:'zone_read',    name:'ZONE READ',      type:'run', cat:'Run - Option', icon:'\uD83D\uDC41',desc:'Spread formation option. QB reads end, gives or keeps.'},
  {id:'qb_sneak',     name:'QB SNEAK',       type:'run', cat:'Run - Short',  icon:'\u270A',  desc:'Short yardage push. Universal.'},
  {id:'pa_post',      name:'PA POST',        type:'pass',cat:'Pass - Deep',  icon:'\uD83C\uDFAF',desc:'Fake the triple, throw deep post. The constraint play.'},
  {id:'pa_flat',      name:'PA FLAT',        type:'pass',cat:'Pass - Short', icon:'\uD83D\uDEE1',desc:'Fake the dive, dump to the flat. Safe play-action.'},
];

export const IR_DEF_CARDS=[
  {id:'rip_liz',   name:'RIP/LIZ MATCH', type:'con',cat:'Zone Match',      icon:'\uD83E\uDDE0',desc:'Pattern-matching Cover 3. Safety rotates to strength. Stops crossers and verticals.'},
  {id:'cov4_match',name:'COVER 4 MATCH', type:'con',cat:'Zone Match',      icon:'4\uFE0F\u20E3',desc:'Quarters coverage. Four deep, pattern-match routes. Best run-stopping zone.'},
  {id:'mod',       name:'MOD COVERAGE',  type:'con',cat:'Zone Shell',      icon:'\uD83D\uDEE1',desc:'Two-high base. Both safeties deep, CBs play off-man/zone hybrid. The vanilla look.'},
  {id:'cover_6',   name:'COVER 6',       type:'con',cat:'Split-Field',     icon:'\u2194',  desc:'Cover 4 to passing strength, Cover 2 to boundary. Forces QB to read two coverages.'},
  {id:'bracket',   name:'BRACKET',       type:'con',cat:'Man/Zone Hybrid', icon:'\uD83D\uDD12',desc:'Double-team the best weapon. Inside-outside leverage. Shuts down one receiver completely.'},
  {id:'skinny',    name:'SKINNY',        type:'agg',cat:'Man/Zone Hybrid', icon:'\u2702',  desc:'Trips check. Man on the iso receiver, pattern-match the trips side. Stops overloads.'},
  {id:'meg',       name:'MEG',           type:'agg',cat:'Man Coverage',    icon:'\uD83D\uDCAA',desc:'Man Everywhere in the Gap. Press-man, everyone has an assignment. Win your matchup.'},
  {id:'gap_int',   name:'GAP INTEGRITY', type:'agg',cat:'Run Defense',     icon:'\uD83E\uDDF1',desc:'Every defender owns a gap. No freelancing. Built to stop option football and power runs.'},
  {id:'fire_zone', name:'FIRE ZONE',     type:'agg',cat:'Zone Blitz',      icon:'\uD83D\uDD25',desc:'Send 5, drop 3 into zone behind it. Calculated pressure with coverage underneath.'},
  {id:'robber',    name:'ROBBER',        type:'agg',cat:'Zone/Man Hybrid', icon:'\uD83D\uDD75',desc:'Safety reads the QB\'s eyes and jumps the route. Guess right = INT. Guess wrong = TD.'},
];

export const CT_DEF_CARDS=[
  {id:'overload',  name:'OVERLOAD BLITZ',type:'agg',cat:'Pressure',        icon:'\uD83D\uDCA5',desc:'Stack extra rushers to one side. OL can\'t sort out the numbers. Pure chaos.'},
  {id:'db_blitz',  name:'DB BLITZ',      type:'agg',cat:'Exotic Pressure', icon:'\u26A1',  desc:'Safety AND corner blitz off the edge. Zero coverage behind it. Pure aggression.'},
  {id:'zero_cov',  name:'ZERO COVER',    type:'agg',cat:'Man / Zero',      icon:'\uD83C\uDFAF',desc:'All-out man coverage, no safety help. Every defender on an island. Win or get burned.'},
  {id:'a_gap_mug', name:'A-GAP MUG',     type:'agg',cat:'Simulated Press.', icon:'\uD83D\uDC7B',desc:'Two defenders in both A-gaps. Sometimes both come. Sometimes neither. Creates hesitation.'},
  {id:'edge_crash',name:'EDGE CRASH',    type:'agg',cat:'Pressure',        icon:'\u2194',  desc:'Both edges pin ears back. Speed rush outside. Interior holds gaps. Pure pass rush.'},
  {id:'cov2_buc',  name:'COVER 2 BUC',   type:'con',cat:'Zone',            icon:'2\uFE0F\u20E3',desc:'Tampa 2 variant. Two deep, LB drops to cover the seam. The changeup to set up blitzes.'},
  {id:'man_press', name:'MAN PRESS',     type:'con',cat:'Man Coverage',    icon:'\uD83E\uDD1D',desc:'Press coverage at the line. Jam receivers to break timing. No safety help.'},
  {id:'zone_drop', name:'ZONE BLITZ DROP',type:'con',cat:'Zone Blitz',     icon:'\uD83C\uDCCF',desc:'Show blitz, drop the edge into coverage. QB throws to the flat, the dropped DE picks it off.'},
  {id:'spy',       name:'SPY',           type:'con',cat:'Assignment',      icon:'\uD83D\uDD75',desc:'One defender shadows the QB. Contains scrambles, watches for the draw.'},
  {id:'prevent',   name:'PREVENT',       type:'con',cat:'Zone - Max Depth',icon:'\uD83E\uDDF1',desc:'Everyone drops deep. Nothing over the top. Gives up 5+ yards every snap.'},
];
