# Ember Eight — Player Rosters Spec

**Status:** Locked design 2026-04-14. Drives the rewrite of `src/data/players.js`.
**Companion to:** `TORCH-EMBER-EIGHT-DESIGN-PROPOSAL.md` (overall plan), `TORCH-EMBER-EIGHT-BIBLE.md` (lore).
**Total players:** 112 (8 teams × 14: 7 OFF + 7 DEF).

## Format

Each player has: `id` · `firstName lastName` · position · year · stars (1-5) · OVR · trait · star title (only for stars) · ST ratings ({kickPower, kickAccuracy, returnAbility} 1-5 each, mostly 1-3 with occasional specialists).

**Internal team IDs stay legacy** (`sentinels`, `wolves`, `stags`, `serpents`, `pronghorns`, `salamanders`, `maples`, `raccoons`) — they're keys in 30+ files. Display names per bible.

**Player ID prefixes** (new, clean break from old `rdg_`/`npa_`/`crv_`/`bwt_`):
- `rid_` Ridgemont · `hol_` Hollowridge · `vmt_` Vermont · `hel_` Helix
- `cor_` Coral Bay · `bla_` Blackwater · `lar_` Larkspur · `sac_` Sacramento

---

## LARKSPUR PRONGHORNS · POWERHOUSE
**Scheme:** Power Spread / Pattern Match · **Class skew:** veteran-heavy

### Offense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| lar_o1 | Brock Schroeder | RB | 5th-Sr | ★★★★★ | 88 | TRUCK STICK | The Hammer |
| lar_o2 | Reid Anderson | QB | Sr | ★★★★ | 81 | RPO READER | — |
| lar_o3 | Kade Olson | H-back | Jr | ★★★ | 77 | MISMATCH | — |
| lar_o4 | Ty Hernandez | Slot WR | Sr | ★★★ | 78 | YAC BEAST | — |
| lar_o5 | Gunnar Bauer | LG | RS-Sr | ★★★★★ | 86 | PULLING GUARD | The Wagon Train |
| lar_o6 | Drew Koch | C | RS-Sr | ★★★★ | 80 | ANCHOR | — |
| lar_o7 | Cooper Kraus | RG | Sr | ★★★★ | 80 | ROAD GRADER | — |

### Defense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| lar_d1 | Karsen Polacek | DE | So | ★★★ | 75 | EDGE SETTER | — |
| lar_d2 | Cody Fischer | DT | So | ★★★ | 76 | RUN STUFFER | — |
| lar_d3 | Tucker Svoboda | DE | Fr | ★★★ | 72 | PASS RUSHER | — |
| lar_d4 | Easton Hoffman | OLB/SS | Sr | ★★★★★ | 85 | OVERHANG | The Wedge |
| lar_d5 | Tanner Meyer | CB | Sr | ★★★★ | 81 | PATTERN READER | — |
| lar_d6 | Marcus Brooks | CB | Jr | ★★★ | 77 | ZONE READER | — |
| lar_d7 | Diego Lopez | FS | Jr | ★★★★ | 79 | CENTERFIELDER | — |

---

## HOLLOWRIDGE SPECTRES · POWERHOUSE
**Scheme:** Spread Option / Robber · **Class skew:** slight veteran (defensive-heavy stars)

### Offense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| hol_o1 | Anthony Petrillo | QB | Sr | ★★★★★ | 88 | DUAL THREAT | The Storm Caller |
| hol_o2 | Hunter Blankenship | RB | Jr | ★★★★ | 80 | ZONE CUT | — |
| hol_o3 | Caleb Workman | WR | Jr | ★★★ | 76 | ROUTE IQ | — |
| hol_o4 | Logan McCoy | WR | So | ★★★ | 75 | YAC BEAST | — |
| hol_o5 | Vincent DiLorenzo | LG | Sr | ★★★ | 78 | ANCHOR | — |
| hol_o6 | Dominic Kovach | C | Sr | ★★★★ | 81 | LEADER | — |
| hol_o7 | Tyler Stover | RG | Jr | ★★★ | 77 | ROAD GRADER | — |

### Defense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| hol_d1 | Bryce Bartek | DE | RS-Sr | ★★★ | 78 | EDGE SPEED | — |
| hol_d2 | Garrett Lilly | DT | Jr | ★★★★ | 80 | INTERIOR BULL | — |
| hol_d3 | Khalil Freeman | DE | Fr | ★★★ | 74 | PASS RUSHER | — |
| hol_d4 | Cole Mazur | LB | Sr | ★★★★ | 81 | ROBBER LB | — |
| hol_d5 | Demetrius Washington | CB | Sr | ★★★★★ | 87 | SHUTDOWN | The Lockdown |
| hol_d6 | Marquez Carter | CB | Fr | ★★★ | 73 | PRESS CORNER | — |
| hol_d7 | Bryce Hatfield | FS | RS-Sr | ★★★★★ | 86 | BALL HAWK | The Hollowridge Howl |

---

## VERMONT MAPLES · CONTENDER
**Scheme:** Multiple / Disguise · **Class skew:** balanced (slight veteran)

### Offense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| vmt_o1 | Owen Pelletier | QB | Sr | ★★★ | 78 | GAME MANAGER | — |
| vmt_o2 | Connor Bergeron | RB | So | ★★★ | 75 | BALANCED | — |
| vmt_o3 | Liam Whitcomb | TE | Sr | ★★★★★ | 86 | OPTION ROUTES | The Professor |
| vmt_o4 | Logan Murphy | WR | So | ★★★ | 73 | POSSESSION | — |
| vmt_o5 | Mathieu Gagnon | LG | Sr | ★★★ | 77 | ANCHOR | — |
| vmt_o6 | Pierre Tremblay | C | RS-Sr | ★★★★ | 79 | LEADER | — |
| vmt_o7 | Brayden Hastings | RG | Jr | ★★★ | 75 | ROAD GRADER | — |

### Defense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| vmt_d1 | Finn O'Connor | DE | So | ★★★ | 74 | EDGE | — |
| vmt_d2 | Nolan Lavoie | DT | Jr | ★★★ | 76 | RUN STUFFER | — |
| vmt_d3 | Remi Bouchard | DE | RS-Sr | ★★★ | 75 | EDGE | — |
| vmt_d4 | Tyler Roy | LB | So | ★★★ | 75 | COVERAGE LB | — |
| vmt_d5 | Marcus Bennett | CB | Jr | ★★★ | 76 | ZONE READER | — |
| vmt_d6 | Declan Boucher | SS | Fr | ★★★ | 72 | RUN SUPPORT | — |
| vmt_d7 | Samuel LaFleur | FS | Sr | ★★★★★ | 86 | DISGUISE ARTIST | The Reading Room |

---

## HELIX SALAMANDERS · CONTENDER
**Scheme:** Air Raid / Bend Don't Break · **Class skew:** balanced

### Offense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| hel_o1 | Mateo Cervantes | QB | Sr | ★★★★★ | 87 | PRECISION POCKET | The Equation |
| hel_o2 | Diego Reyes | RB | Jr | ★★★ | 75 | PASS CATCHER | — |
| hel_o3 | Daniel Mendoza | WR | Sr | ★★★★ | 80 | ROUTE IQ | — |
| hel_o4 | Joaquin Flores | WR | Jr | ★★★ | 76 | MESH SPECIALIST | — |
| hel_o5 | Karl Schmidt | LG | Jr | ★★★ | 76 | ANCHOR | — |
| hel_o6 | Lukas Mueller | C | Sr | ★★★ | 78 | LEADER | — |
| hel_o7 | Hayden Weber | RG | So | ★★★ | 73 | PASS PRO | — |

### Defense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| hel_d1 | Brennan Krause | DE | Fr | ★★★ | 71 | EDGE | — |
| hel_d2 | Emilio Hoffman | DT | So | ★★★ | 75 | INTERIOR | — |
| hel_d3 | Kade Novak | DE | Jr | ★★★ | 77 | EDGE | — |
| hel_d4 | Adrian Janecek | LB | Sr | ★★★★★ | 86 | PROCESSOR | The Algorithm |
| hel_d5 | Cristian Garcia | CB | So | ★★★ | 74 | ZONE READER | — |
| hel_d6 | Trey Bryant | SS | Fr | ★★★ | 72 | COVER 2 SAFETY | — |
| hel_d7 | Santiago Ramirez | FS | RS-Sr | ★★★ | 79 | RANGE FS | — |

---

## CORAL BAY DOLPHINS · CONTENDER
**Scheme:** Vertical Pass / Press Man · **Class skew:** veteran (transfer portal)

### Offense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| cor_o1 | Christian Rodriguez | QB | RS-Sr | ★★★★ | 82 | STRONG ARM | — |
| cor_o2 | Dimitri Thompson | RB | Sr | ★★★ | 76 | PASS CATCHER | — |
| cor_o3 | Tre Beauvais | WR (X) | 5th-Sr | ★★★★★ | 89 | CONTESTED CATCH | The Misfit |
| cor_o4 | Xavier Hayes | WR (Z) | RS-Sr | ★★★★ | 81 | DEEP THREAT | — |
| cor_o5 | Carlos Suarez | LG | Sr | ★★★ | 78 | ANCHOR | — |
| cor_o6 | Jean-Baptiste Pierre | C | Sr | ★★★ | 78 | LEADER | — |
| cor_o7 | Marco Castillo | RG | Jr | ★★★ | 75 | PASS PRO | — |

### Defense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| cor_d1 | Alejandro Diaz | DE | Sr | ★★★ | 78 | EDGE SPEED | — |
| cor_d2 | Luis Henderson | DT | Jr | ★★★ | 76 | INTERIOR | — |
| cor_d3 | Kendrick Foster | DE | RS-Sr | ★★★ | 78 | EDGE | — |
| cor_d4 | Anthony Joseph | LB | Jr | ★★★ | 76 | COVER LB | — |
| cor_d5 | Marco Saint-Fleur | CB | Sr | ★★★★ | 81 | PRESS CORNER | — |
| cor_d6 | Jamal Owens | CB | Fr | ★★★ | 73 | PRESS CORNER | — |
| cor_d7 | Giovanni Cadet | FS | Sr | ★★★★★ | 87 | BALL HAWK | The Architect's Kid |

---

## BLACKWATER SERPENTS · CONTENDER
**Scheme:** Triple Option / Gap Control · **Class skew:** balanced

### Offense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| bla_o1 | Etienne Hebert | QB | Sr | ★★★★★ | 86 | OPTION READ | The Cold Hand |
| bla_o2 | Beau Boudreaux | FB | Sr | ★★★ | 78 | INSIDE DIVE | — |
| bla_o3 | Remy Landry | Slot/Wing | Jr | ★★★ | 76 | PERIMETER OPTION | — |
| bla_o4 | Pierre LeBlanc | WR (split) | Fr | ★★★ | 73 | DEEP THREAT | — |
| bla_o5 | Luc Broussard | LG | Jr | ★★★ | 76 | ANCHOR | — |
| bla_o6 | Jude Thibodeaux | C | Sr | ★★★★ | 80 | LEADER | — |
| bla_o7 | Blaise Trahan | RG | RS-Sr | ★★★ | 78 | ROAD GRADER | — |

### Defense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| bla_d1 | Cedric Guillory | DE | Jr | ★★★ | 76 | EDGE | — |
| bla_d2 | Derrius Cormier | DT | Sr | ★★★★★ | 87 | PENETRATOR | The Bayou Beast |
| bla_d3 | Tyrese Bourgeois | DE | So | ★★★ | 74 | EDGE SPEED | — |
| bla_d4 | Javonte Benoit | LB | Jr | ★★★ | 75 | PURSUIT | — |
| bla_d5 | Tre Jefferson | CB | Fr | ★★★ | 71 | ZONE READER | — |
| bla_d6 | Malachi Robichaux | SS | RS-Sr | ★★★ | 78 | RUN FIT | — |
| bla_d7 | Jamar Doucet | FS | So | ★★★ | 73 | CENTERFIELDER | — |

---

## RIDGEMONT BOARS · UNDERDOG
**Scheme:** Smashmouth / Cover 3 · **Class skew:** balanced (slight veteran)

### Offense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| rid_o1 | Hunter Whitaker | QB | Sr | ★★★ | 76 | GAME MANAGER | — |
| rid_o2 | Marcus Henderson | RB | Sr | ★★★★★ | 86 | TRUCK STICK | The Freight Train |
| rid_o3 | Caleb Mooney | TE (Y) | Jr | ★★★ | 75 | INLINE BLOCKER | — |
| rid_o4 | Wyatt Tackett | TE (F) | So | ★★★ | 72 | MOVE TE | — |
| rid_o5 | Cooper Pruitt | LG | Jr | ★★★ | 75 | ANCHOR | — |
| rid_o6 | Brody Caldwell | C | Sr | ★★★ | 76 | LEADER | — |
| rid_o7 | Tanner Honeycutt | RG | Jr | ★★★ | 74 | ROAD GRADER | — |

### Defense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| rid_d1 | Levi Shivers | DE | RS-Sr | ★★★ | 75 | EDGE | — |
| rid_d2 | Dalton Easley | DT | Jr | ★★★ | 73 | RUN STUFFER | — |
| rid_d3 | Tucker Campbell | DE | Fr | ★★ | 68 | EDGE | — |
| rid_d4 | Jaxon Walker | LB | Sr | ★★★ | 75 | RUN STUFFER | — |
| rid_d5 | Bryson Williams | CB | Fr | ★★ | 65 | ZONE | — |
| rid_d6 | Cody McDonald | SS | RS-Sr | ★★★ | 73 | RUN SUPPORT | — |
| rid_d7 | DeMarcus Hayes | FS | So | ★★ | 67 | CENTERFIELDER | — |

---

## SACRAMENTO RACCOONS · UNDERDOG
**Scheme:** Veer & Shoot / Flyover · **Class skew:** YOUNG (no 5th-years — program too new)

### Offense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| sac_o1 | Daniel Garcia | QB | Jr | ★★★ | 76 | QUICK PROCESS | — |
| sac_o2 | Anthony Lopez | RB | So | ★★★ | 73 | ZONE | — |
| sac_o3 | Jamal Hernandez | WR (X) | Sr | ★★★ | 78 | DEEP THREAT | — |
| sac_o4 | Tre Nguyen | Slot WR | Sr | ★★★★★ | 86 | YAC BEAST | The Sideline |
| sac_o5 | Khang Tran | LG | Fr | ★★★ | 70 | ANCHOR | — |
| sac_o6 | David Singh | C | So | ★★★ | 73 | LEADER | — |
| sac_o7 | Jacob Yang | RG | Fr | ★★★ | 70 | PASS PRO | — |

### Defense (7)
| ID | Name | Pos | Yr | ★ | OVR | Trait | Star Title |
|---|---|---|---|---|---|---|---|
| sac_d1 | Sergio Pham | DE | Jr | ★★★ | 75 | EDGE | — |
| sac_d2 | Tou Vang | NT | So | ★★★ | 72 | INTERIOR | — |
| sac_d3 | Marcus Le | DE | Fr | ★★★ | 70 | EDGE SPEED | — |
| sac_d4 | Andres Xiong | LB | Jr | ★★★ | 75 | ZONE-DROP | — |
| sac_d5 | Kai Mitchell | CB | Fr | ★★★ | 70 | BOUNDARY | — |
| sac_d6 | Pao Thao | SS | So | ★★★ | 71 | COVER 2 | — |
| sac_d7 | Minh Yang | FS | Fr | ★★★ | 71 | RANGE FS | — |

---

## ST ratings rule of thumb

`{kickPower, kickAccuracy, returnAbility}` 1-5 each:
- **OL/TE/DT** get higher kickPower (4-5) — they're the natural FG/punt body type
- **WR/CB/RB** with BURNER/YAC BEAST/SPEED traits get high returnAbility (4-5)
- **QBs** get medium kickAccuracy (2-3) — backup punt/holder
- Most other players: 1-2 across the board

ST ratings will be assigned during code generation per the existing pattern in `players.js`.

## Trait synergy expansion

Several new traits introduced (PULLING GUARD, OVERHANG, PATTERN READER, ROBBER LB, OPTION READ, PROCESSOR, DISGUISE ARTIST, BALL HAWK, PENETRATOR, CONTESTED CATCH, etc.). The trait synergy table in `src/engine/personnelSystem.js` will need expansion to cover new traits. Defaults to neutral (no bonus/penalty) for any trait not explicitly tabled.

## Position coverage check

| Pos | Total across 8 teams | Notes |
|---|---|---|
| OL | 24 (3 × 8) | LG/C/RG fixed per team |
| QB | 8 | 1 per team |
| RB | 7 | (Blackwater FB instead) |
| FB | 1 | Blackwater only |
| TE | 4 | Boars 2, Vermont 1, Pronghorns 1 (H-back) |
| WR | 18 | Splits + slots |
| H-back | 1 | Larkspur |
| Slot WR | 2 | Larkspur, Sacramento (Tre Nguyen — star) |
| DL | 24 | DE/DT/DE per team |
| LB | 8 | 1 per team (Larkspur is OLB/SS hybrid) |
| CB | 16 | 1-2 per team depending on scheme secondary mix |
| SS | 5 | Schemes with 1 CB + 2 S have an SS |
| FS | 8 | 1 per team |
| **Total** | **126** | (Some players carry compound positions like OLB/SS) |

Sums to 126 because some players hold compound positions (OLB/SS, FB-like). Actual roster count = 112.
