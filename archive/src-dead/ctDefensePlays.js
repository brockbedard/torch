/**
 * TORCH — Canyon Tech Defensive Plays (Send Everybody)
 * 10 plays, blitz-heavy. Values from torch_sim.py.
 */

export const CT_DEF_PLAYS = [
  {
    id: 'ct_corner_blitz', name: 'CORNER BLITZ', cardType: 'BLITZ',
    baseCoverage: 'cover_0', sackRateBonus: 0.10, intRateBonus: 0, runDefMod: 2,
    isCover0Blitz: true, isManCoverage: false,
    passEffect: 'Sack rate doubled vs DEEP',
    runEffect: '+2 yds for offense (gap abandoned)',
    passMeanMod: -2, runMeanMod: 2, passCompMod: 0,
  },
  {
    id: 'ct_safety_blitz', name: 'SAFETY BLITZ', cardType: 'BLITZ',
    baseCoverage: 'cover_0', sackRateBonus: 0.06, intRateBonus: 0, runDefMod: 1,
    isCover0Blitz: true, isManCoverage: false,
    passEffect: 'Extra sack pressure',
    runEffect: '+2 yds for offense',
    passMeanMod: -1, runMeanMod: 2, passCompMod: 0,
  },
  {
    id: 'ct_agap_mug', name: 'A-GAP MUG', cardType: 'PRESSURE',
    baseCoverage: 'cover_1', sackRateBonus: 0.05, intRateBonus: 0.01, runDefMod: -1,
    isCover0Blitz: false, isManCoverage: true,
    passEffect: 'DEEP +3% sack, forces quick throws',
    runEffect: 'Inside runs -2 yds',
    passMeanMod: 0, runMeanMod: -2, passCompMod: 0,
  },
  {
    id: 'ct_fire_zone', name: 'FIRE ZONE', cardType: 'BLITZ',
    baseCoverage: 'cover_3', sackRateBonus: 0.04, intRateBonus: 0.02, runDefMod: -1,
    isCover0Blitz: false, isManCoverage: false,
    passEffect: 'Pressure + zone behind. Screens get 50% blitz bonus',
    runEffect: 'No run penalty (zone behind rush)',
    passMeanMod: -1, runMeanMod: 0, passCompMod: 0,
  },
  {
    id: 'ct_db_blitz', name: 'DB BLITZ', cardType: 'BLITZ',
    baseCoverage: 'cover_0', sackRateBonus: 0.12, intRateBonus: -0.01, runDefMod: 3,
    isCover0Blitz: true, isManCoverage: false,
    passEffect: 'Highest sack rate. If no sack, +5 mean for offense',
    runEffect: '+2 yds for offense (gaps abandoned)',
    passMeanMod: -3, runMeanMod: 3, passCompMod: 0,
  },
  {
    id: 'ct_press_man', name: 'PRESS MAN', cardType: 'PRESSURE',
    baseCoverage: 'man_free', sackRateBonus: 0.02, intRateBonus: 0.015, runDefMod: 0,
    isCover0Blitz: false, isManCoverage: true,
    passEffect: 'SHORT/QUICK completion -8%. DEEP +2 yds for offense',
    runEffect: 'No special run effect',
    passMeanMod: 2, runMeanMod: 0, passCompMod: -0.08,
  },
  {
    id: 'ct_edge_crash', name: 'EDGE CRASH', cardType: 'PRESSURE',
    baseCoverage: 'cover_1', sackRateBonus: 0.04, intRateBonus: 0, runDefMod: -2,
    isCover0Blitz: false, isManCoverage: true,
    passEffect: 'Standard pressure',
    runEffect: 'OPTION plays -4 yds, edge crash contains',
    passMeanMod: 0, runMeanMod: -4, passCompMod: 0,
  },
  {
    id: 'ct_zone_blitz_drop', name: 'ZONE BLITZ DROP', cardType: 'HYBRID',
    baseCoverage: 'cover_2', sackRateBonus: 0.03, intRateBonus: 0.04, runDefMod: 0,
    isCover0Blitz: false, isManCoverage: false,
    passEffect: 'Disguise. PA gets -2 yds',
    runEffect: 'No run penalty (zone drops read run)',
    passMeanMod: -1, runMeanMod: 0, passCompMod: 0,
  },
  {
    id: 'ct_overload_blitz', name: 'OVERLOAD BLITZ', cardType: 'BLITZ',
    baseCoverage: 'cover_1', sackRateBonus: 0.07, intRateBonus: 0, runDefMod: 2,
    isCover0Blitz: true, isManCoverage: true,
    passEffect: 'Heavy pressure from one side',
    runEffect: '+3 yds if offense runs away from overload',
    passMeanMod: -2, runMeanMod: 2, passCompMod: 0,
  },
  {
    id: 'ct_prevent', name: 'PREVENT', cardType: 'ZONE',
    baseCoverage: 'cover_4', sackRateBonus: -0.04, intRateBonus: 0.05, runDefMod: 3,
    isCover0Blitz: false, isManCoverage: false,
    passEffect: 'DEEP -6 mean, +3% INT. SHORT/QUICK +4 mean',
    runEffect: 'Runs +3 yds (everyone deep)',
    passMeanMod: 0, runMeanMod: 3, passCompMod: 0,
  },
];
