#!/usr/bin/env python3
"""
TORCH Football Simulation Engine v0.1
Implements all game systems from the spec for balance testing.
Run: python3 torch_sim.py [num_games] [difficulty]
"""

import random
import math
import json
import sys
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Tuple
from enum import Enum

# ============================================================
# ENUMS AND TYPES
# ============================================================

class PlayType(Enum):
    SHORT = "SHORT"
    QUICK = "QUICK"
    DEEP = "DEEP"
    RUN = "RUN"
    SCREEN = "SCREEN"
    OPTION = "OPTION"

class DefCardType(Enum):
    BLITZ = "BLITZ"
    PRESSURE = "PRESSURE"
    ZONE = "ZONE"
    HYBRID = "HYBRID"

class Badge(Enum):
    FOOTBALL = "FOOTBALL"
    CLEAT = "CLEAT"
    HELMET = "HELMET"
    CLIPBOARD = "CLIPBOARD"
    GLOVE = "GLOVE"
    SPEED_LINES = "SPEED_LINES"
    CROSSHAIR = "CROSSHAIR"
    BOLT = "BOLT"
    PADLOCK = "PADLOCK"
    BRICK = "BRICK"
    FLAME = "FLAME"
    EYE = "EYE"

class Difficulty(Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"

# ============================================================
# DATA CLASSES
# ============================================================

@dataclass
class Player:
    name: str
    pos: str
    ovr: int
    badge: Badge
    injured: bool = False
    injury_snaps_remaining: int = 0
    
    def is_available(self):
        return not self.injured

@dataclass
class OffensivePlay:
    id: str
    name: str
    play_type: PlayType
    mean: float
    variance: float
    completion_rate: Optional[float]  # None for run plays
    sack_rate: Optional[float]  # None for run plays
    int_rate: Optional[float]  # None for run plays
    fumble_rate: float
    coverage_mods: Dict[str, Dict[str, float]]
    # Situational filters for AI
    min_distance: int = 0  # minimum yards to gain for AI to consider
    max_distance: int = 99  # maximum yards to gain for AI to consider
    never_inside_own: int = 0  # never call inside own X yard line

@dataclass
class DefensivePlay:
    id: str
    name: str
    card_type: DefCardType
    base_coverage: str
    sack_rate_bonus: float
    int_rate_bonus: float
    run_def_mod: float
    is_cover0_blitz: bool  # True = gets +3 penalty vs runs
    is_man_coverage: bool  # True = PADLOCK triggers
    pass_effect: str
    run_effect: str
    pass_mean_mod: float = 0
    run_mean_mod: float = 0
    pass_comp_mod: float = 0
    # AI situational weight
    ai_weights: Dict[str, float] = field(default_factory=lambda: {"default": 0.1})

@dataclass 
class TorchCard:
    id: str
    name: str
    tier: str  # GOLD, SILVER, BRONZE
    cost: int
    is_reactive: bool
    
# ============================================================
# GAME DATA
# ============================================================

# CANYON TECH OFFENSIVE PLAYS
CT_OFF_PLAYS = [
    OffensivePlay("mesh", "MESH", PlayType.SHORT, 9, 5, 0.78, 0.06, 0.015, 0.005,
        {"cover_0": {"mean": 5, "var": 4, "int": -0.01}, "cover_1": {"mean": 3, "var": 2, "int": -0.005},
         "cover_2": {"mean": 0, "var": 0, "int": 0}, "cover_3": {"mean": 1, "var": 1, "int": 0},
         "cover_4": {"mean": -1, "var": -1, "int": 0.005}, "cover_6": {"mean": 0, "var": 0, "int": 0},
         "man_free": {"mean": 4, "var": 3, "int": -0.01}}),
    OffensivePlay("four_verts", "FOUR VERTS", PlayType.DEEP, 15, 14, 0.43, 0.09, 0.055, 0.003,
        {"cover_0": {"mean": 6, "var": 5, "int": -0.02}, "cover_1": {"mean": 3, "var": 3, "int": 0.01},
         "cover_2": {"mean": 2, "var": 2, "int": 0.01}, "cover_3": {"mean": -2, "var": -2, "int": 0.02},
         "cover_4": {"mean": -4, "var": -3, "int": 0.03}, "cover_6": {"mean": 0, "var": 1, "int": 0.01},
         "man_free": {"mean": 2, "var": 3, "int": 0.01}}, min_distance=3),
    OffensivePlay("slant", "SLANT", PlayType.QUICK, 8, 4, 0.75, 0.04, 0.02, 0.005,
        {"cover_0": {"mean": 3, "var": 2, "int": -0.01}, "cover_1": {"mean": 1, "var": 1, "int": 0},
         "cover_2": {"mean": 2, "var": 1, "int": -0.005}, "cover_3": {"mean": 1, "var": 0, "int": 0},
         "cover_4": {"mean": 0, "var": 0, "int": 0}, "cover_6": {"mean": 1, "var": 0, "int": 0},
         "man_free": {"mean": 1, "var": 1, "int": 0}}),
    OffensivePlay("shallow_cross", "SHALLOW CROSS", PlayType.QUICK, 7, 3, 0.80, 0.04, 0.01, 0.005,
        {"cover_0": {"mean": 4, "var": 3, "int": -0.005}, "cover_1": {"mean": 2, "var": 1, "int": 0},
         "cover_2": {"mean": 1, "var": 1, "int": 0}, "cover_3": {"mean": 0, "var": 0, "int": 0},
         "cover_4": {"mean": 0, "var": 0, "int": 0}, "cover_6": {"mean": 1, "var": 0, "int": 0},
         "man_free": {"mean": 3, "var": 2, "int": 0}}),
    OffensivePlay("y_corner", "Y-CORNER", PlayType.DEEP, 15, 10, 0.47, 0.08, 0.04, 0.003,
        {"cover_0": {"mean": 3, "var": 2, "int": -0.01}, "cover_1": {"mean": 2, "var": 1, "int": 0},
         "cover_2": {"mean": 5, "var": 3, "int": -0.02}, "cover_3": {"mean": -1, "var": 0, "int": 0.01},
         "cover_4": {"mean": -2, "var": -1, "int": 0.015}, "cover_6": {"mean": 2, "var": 1, "int": -0.01},
         "man_free": {"mean": 1, "var": 1, "int": 0}}, min_distance=3),
    OffensivePlay("stick", "STICK", PlayType.SHORT, 6, 2, 0.83, 0.03, 0.01, 0.005,
        {"cover_0": {"mean": 2, "var": 1, "int": -0.005}, "cover_1": {"mean": 1, "var": 0, "int": 0},
         "cover_2": {"mean": 1, "var": 1, "int": 0}, "cover_3": {"mean": 0, "var": 0, "int": 0},
         "cover_4": {"mean": 0, "var": 0, "int": 0}, "cover_6": {"mean": 1, "var": 0, "int": 0},
         "man_free": {"mean": 1, "var": 1, "int": 0}}),
    OffensivePlay("go_route", "GO ROUTE", PlayType.DEEP, 18, 18, 0.38, 0.10, 0.06, 0.002,
        {"cover_0": {"mean": 8, "var": 5, "int": -0.03}, "cover_1": {"mean": 2, "var": 2, "int": 0.01},
         "cover_2": {"mean": 1, "var": 2, "int": 0.01}, "cover_3": {"mean": -3, "var": -2, "int": 0.03},
         "cover_4": {"mean": -4, "var": -3, "int": 0.04}, "cover_6": {"mean": 1, "var": 1, "int": 0.01},
         "man_free": {"mean": -2, "var": -2, "int": 0.03}}, min_distance=5),
    OffensivePlay("bubble_screen", "BUBBLE SCREEN", PlayType.SCREEN, 6, 5, 0.90, 0.01, 0.003, 0.008,
        {"cover_0": {"mean": 6, "var": 5, "int": 0}, "cover_1": {"mean": 1, "var": 1, "int": 0},
         "cover_2": {"mean": -1, "var": -1, "int": 0}, "cover_3": {"mean": 1, "var": 2, "int": 0},
         "cover_4": {"mean": 0, "var": 0, "int": 0}, "cover_6": {"mean": 0, "var": 1, "int": 0},
         "man_free": {"mean": -1, "var": 0, "int": 0}}, never_inside_own=5),
    OffensivePlay("draw", "DRAW", PlayType.RUN, 5, 4, None, None, None, 0.018,
        {"cover_0": {"mean": 3, "var": 2}, "cover_1": {"mean": 1, "var": 1},
         "cover_2": {"mean": 2, "var": 1}, "cover_3": {"mean": -1, "var": 0},
         "cover_4": {"mean": 0, "var": 0}, "cover_6": {"mean": 1, "var": 0},
         "man_free": {"mean": 1, "var": 1}}),
    OffensivePlay("qb_sneak", "QB SNEAK", PlayType.RUN, 2, 1.5, None, None, None, 0.01,
        {"cover_0": {"mean": 1, "var": 1}, "cover_1": {"mean": 0, "var": 0},
         "cover_2": {"mean": 0, "var": 0}, "cover_3": {"mean": 0, "var": 0},
         "cover_4": {"mean": 0, "var": 0}, "cover_6": {"mean": 0, "var": 0},
         "man_free": {"mean": 0, "var": 0}}, max_distance=2),
]

# IRON RIDGE OFFENSIVE PLAYS
IR_OFF_PLAYS = [
    OffensivePlay("triple_option", "TRIPLE OPTION", PlayType.OPTION, 4, 5, None, None, None, 0.025,
        {"cover_0": {"mean": 3, "var": 3}, "cover_1": {"mean": 2, "var": 2},
         "cover_2": {"mean": 1, "var": 1}, "cover_3": {"mean": -1, "var": -1},
         "cover_4": {"mean": -2, "var": -1}, "cover_6": {"mean": 0, "var": 1},
         "man_free": {"mean": 1, "var": 1}}),
    OffensivePlay("zone_read", "ZONE READ", PlayType.OPTION, 4, 4, None, None, None, 0.02,
        {"cover_0": {"mean": 3, "var": 2}, "cover_1": {"mean": 2, "var": 1},
         "cover_2": {"mean": 1, "var": 1}, "cover_3": {"mean": -1, "var": 0},
         "cover_4": {"mean": -1, "var": 0}, "cover_6": {"mean": 1, "var": 1},
         "man_free": {"mean": 2, "var": 2}}),
    OffensivePlay("power", "POWER", PlayType.RUN, 4, 3, None, None, None, 0.015,
        {"cover_0": {"mean": -1, "var": -1}, "cover_1": {"mean": 1, "var": 0},
         "cover_2": {"mean": 2, "var": 1}, "cover_3": {"mean": -2, "var": -1},
         "cover_4": {"mean": 0, "var": 0}, "cover_6": {"mean": 1, "var": 0},
         "man_free": {"mean": 1, "var": 1}}),
    OffensivePlay("trap", "TRAP", PlayType.RUN, 4, 4, None, None, None, 0.015,
        {"cover_0": {"mean": 2, "var": 2}, "cover_1": {"mean": 1, "var": 1},
         "cover_2": {"mean": 1, "var": 1}, "cover_3": {"mean": -1, "var": 0},
         "cover_4": {"mean": 0, "var": 0}, "cover_6": {"mean": 0, "var": 1},
         "man_free": {"mean": 1, "var": 1}}),
    OffensivePlay("rocket_toss", "ROCKET TOSS", PlayType.RUN, 4, 7, None, None, None, 0.02,
        {"cover_0": {"mean": 2, "var": 2}, "cover_1": {"mean": 1, "var": 2},
         "cover_2": {"mean": 2, "var": 2}, "cover_3": {"mean": -2, "var": -1},
         "cover_4": {"mean": -1, "var": 0}, "cover_6": {"mean": 1, "var": 1},
         "man_free": {"mean": 1, "var": 1}}),
    OffensivePlay("qb_keeper", "QB KEEPER", PlayType.OPTION, 4, 4, None, None, None, 0.02,
        {"cover_0": {"mean": 3, "var": 3}, "cover_1": {"mean": 2, "var": 2},
         "cover_2": {"mean": 1, "var": 1}, "cover_3": {"mean": -1, "var": 0},
         "cover_4": {"mean": -1, "var": 0}, "cover_6": {"mean": 1, "var": 1},
         "man_free": {"mean": 2, "var": 2}}),
    OffensivePlay("midline", "MIDLINE", PlayType.OPTION, 4, 3, None, None, None, 0.022,
        {"cover_0": {"mean": 2, "var": 2}, "cover_1": {"mean": 1, "var": 1},
         "cover_2": {"mean": 1, "var": 1}, "cover_3": {"mean": -1, "var": 0},
         "cover_4": {"mean": -1, "var": 0}, "cover_6": {"mean": 0, "var": 0},
         "man_free": {"mean": 1, "var": 1}}),
    OffensivePlay("pa_flat", "PA FLAT", PlayType.SHORT, 7, 4, 0.71, 0.08, 0.02, 0.004,
        {"cover_0": {"mean": 2, "var": 1, "int": -0.01}, "cover_1": {"mean": 1, "var": 1, "int": 0},
         "cover_2": {"mean": 1, "var": 1, "int": 0}, "cover_3": {"mean": 2, "var": 2, "int": -0.005},
         "cover_4": {"mean": 1, "var": 1, "int": 0}, "cover_6": {"mean": 1, "var": 0, "int": 0},
         "man_free": {"mean": 1, "var": 1, "int": 0}}),
    OffensivePlay("pa_post", "PA POST", PlayType.DEEP, 16, 12, 0.40, 0.10, 0.045, 0.003,
        {"cover_0": {"mean": 4, "var": 3, "int": -0.02}, "cover_1": {"mean": 3, "var": 2, "int": 0},
         "cover_2": {"mean": 3, "var": 2, "int": -0.01}, "cover_3": {"mean": 1, "var": 1, "int": 0.01},
         "cover_4": {"mean": -2, "var": -1, "int": 0.02}, "cover_6": {"mean": 2, "var": 1, "int": 0},
         "man_free": {"mean": 1, "var": 1, "int": 0}}, min_distance=5),
    OffensivePlay("ir_qb_sneak", "QB SNEAK", PlayType.RUN, 2, 1.5, None, None, None, 0.01,
        {"cover_0": {"mean": 1, "var": 1}, "cover_1": {"mean": 0, "var": 0},
         "cover_2": {"mean": 0, "var": 0}, "cover_3": {"mean": 0, "var": 0},
         "cover_4": {"mean": 0, "var": 0}, "cover_6": {"mean": 0, "var": 0},
         "man_free": {"mean": 0, "var": 0}}, max_distance=2),
]

# CANYON TECH DEFENSIVE PLAYS
CT_DEF_PLAYS = [
    DefensivePlay("ct_corner_blitz", "CORNER BLITZ", DefCardType.BLITZ, "cover_0", 0.08, 0, 2, True, False,
        "Sack rate doubled vs DEEP", "+3 yds for offense (gap abandoned)", pass_mean_mod=-2, run_mean_mod=3),
    DefensivePlay("ct_safety_blitz", "SAFETY BLITZ", DefCardType.BLITZ, "cover_0", 0.06, 0, 1, True, False,
        "Extra sack pressure", "+3 yds for offense, but -3 vs RUN fills gap", pass_mean_mod=-1, run_mean_mod=3),
    DefensivePlay("ct_agap_mug", "A-GAP MUG", DefCardType.PRESSURE, "cover_1", 0.05, 0.01, -1, False, True,
        "DEEP +3% sack, forces quick throws", "Inside runs -2 yds", pass_mean_mod=0, run_mean_mod=-2),
    DefensivePlay("ct_fire_zone", "FIRE ZONE", DefCardType.BLITZ, "cover_3", 0.04, 0.01, -1, False, False,
        "Pressure + zone behind. Screens get 50% blitz bonus", "No run penalty (zone behind rush)", pass_mean_mod=-1, run_mean_mod=0),
    DefensivePlay("ct_db_blitz", "DB BLITZ", DefCardType.BLITZ, "cover_0", 0.10, -0.01, 2, True, False,
        "Highest sack rate. If no sack, +5 mean for offense", "+3 yds for offense (gaps abandoned)", pass_mean_mod=-3, run_mean_mod=3),
    DefensivePlay("ct_press_man", "PRESS MAN", DefCardType.PRESSURE, "man_free", 0.02, 0.015, 0, False, True,
        "SHORT/QUICK completion -8%. DEEP +2 yds for offense", "No special run effect", pass_comp_mod=-0.08, run_mean_mod=0, pass_mean_mod=2),
    DefensivePlay("ct_edge_crash", "EDGE CRASH", DefCardType.PRESSURE, "cover_1", 0.04, 0, -2, False, True,
        "Standard pressure", "OPTION plays -3 yds, edge crash contains", pass_mean_mod=0, run_mean_mod=-3),
    DefensivePlay("ct_zone_blitz_drop", "ZONE BLITZ DROP", DefCardType.HYBRID, "cover_2", 0.03, 0.02, 0, False, False,
        "Disguise. PA gets -2 yds", "No run penalty (zone drops read run)", pass_mean_mod=-1, run_mean_mod=0),
    DefensivePlay("ct_overload_blitz", "OVERLOAD BLITZ", DefCardType.BLITZ, "cover_1", 0.07, 0, 1, True, True,
        "Heavy pressure from one side", "+3 yds if offense runs away from overload", pass_mean_mod=-2, run_mean_mod=1),
    DefensivePlay("ct_prevent", "PREVENT", DefCardType.ZONE, "cover_4", -0.04, -0.01, 3, False, False,
        "DEEP -6 mean, +3% INT. SHORT/QUICK +4 mean", "Runs +3 yds (everyone deep)", pass_mean_mod=0, run_mean_mod=3),
]

# IRON RIDGE DEFENSIVE PLAYS
IR_DEF_PLAYS = [
    DefensivePlay("ir_robber", "ROBBER", DefCardType.HYBRID, "cover_1", 0.01, 0.04, 0, False, True,
        "MESH/SLANT/SHALLOW +4% INT. Disguised as Cover 2", "No special run effect", pass_mean_mod=0, run_mean_mod=0),
    DefensivePlay("ir_bracket", "BRACKET", DefCardType.ZONE, "cover_2", 0, 0.02, -1, False, True,
        "Featured player -3 mean, +3% INT", "No special run effect", pass_mean_mod=-3, run_mean_mod=0),
    DefensivePlay("ir_qb_spy", "QB SPY", DefCardType.HYBRID, "cover_3", 0, 0, -1, False, False,
        "No special pass effect", "QB KEEPER/ZONE READ -4 yds, OPTION -2 yds", pass_mean_mod=0, run_mean_mod=-2),
    DefensivePlay("ir_gap_integrity", "GAP INTEGRITY", DefCardType.ZONE, "cover_3", 0, 0, -4, False, False,
        "Pass +2 mean (light rush)", "ALL runs -3 mean, variance -2", pass_mean_mod=2, run_mean_mod=-3),
    DefensivePlay("ir_cover2_buc", "COVER 2 BUC", DefCardType.ZONE, "cover_2", 0, 0.01, -1, False, False,
        "SEAM/POST -3 mean. CORNER +2 mean", "No special run effect", pass_mean_mod=0, run_mean_mod=0),
    DefensivePlay("ir_mod", "MOD", DefCardType.ZONE, "cover_4", -0.02, 0.01, -1, False, False,
        "FOUR VERTS/GO -4 mean, +3% INT. SHORT +2 mean", "No special run effect", pass_mean_mod=0, run_mean_mod=0),
    DefensivePlay("ir_press_man", "PRESS MAN", DefCardType.PRESSURE, "man_free", 0.02, 0.015, 0, False, True,
        "SHORT/QUICK completion -8%. DEEP +2 yds for offense", "No special run effect", pass_comp_mod=-0.08, run_mean_mod=0, pass_mean_mod=2),
    DefensivePlay("ir_line_stunt", "LINE STUNT", DefCardType.PRESSURE, "cover_3", 0.05, 0, 0, False, False,
        "Pressure without blitzing. Screens unaffected", "DRAW -2 yds (stunt disrupts lanes)", pass_mean_mod=-1, run_mean_mod=-1),
    DefensivePlay("ir_cover6", "COVER 6", DefCardType.HYBRID, "cover_6", 0, 0.01, -1, False, False,
        "Split field. DEEP -3 field side, CORNER +3 boundary", "No special run effect", pass_mean_mod=-1, run_mean_mod=0),
    DefensivePlay("ir_blitz_call", "BLITZ CALL", DefCardType.BLITZ, "cover_0", 0.06, 0, 1, True, False,
        "Rare IR blitz. +2% sack disguise bonus", "+3 yds for offense, +50% worse vs screens", pass_mean_mod=-2, run_mean_mod=3),
]

# PLAYERS
CT_OFFENSE = [
    Player("Avery", "QB", 78, Badge.FOOTBALL),
    Player("Sampson", "WR", 80, Badge.SPEED_LINES),
    Player("Vasquez", "SLOT", 82, Badge.FLAME),
    Player("Walsh", "RB", 72, Badge.BRICK),
    # Bench
    Player("Meyers", "QB", 74, Badge.BOLT),
    Player("Liu", "WR", 76, Badge.CROSSHAIR),
]

CT_DEFENSE = [
    Player("Crews", "CB", 82, Badge.PADLOCK),
    Player("Knox", "S", 80, Badge.HELMET),
    Player("Wilder", "LB", 78, Badge.SPEED_LINES),
    Player("Orozco", "S", 72, Badge.EYE),
    # Bench
    Player("Moon", "LB", 74, Badge.CLEAT),
    Player("Bishop", "CB", 76, Badge.GLOVE),
]

IR_OFFENSE = [
    Player("Kendrick", "QB", 80, Badge.CLIPBOARD),
    Player("Torres", "FB", 82, Badge.BRICK),
    Player("Sims", "RB", 78, Badge.CLEAT),
    Player("Buckley", "TE", 74, Badge.GLOVE),
    # Bench
    Player("Larkin", "QB", 74, Badge.FLAME),
    Player("Owens", "RB", 76, Badge.HELMET),
]

IR_DEFENSE = [
    Player("Lawson", "LB", 80, Badge.EYE),
    Player("Gill", "CB", 82, Badge.PADLOCK),
    Player("Barrett", "LB", 76, Badge.HELMET),
    Player("Slade", "S", 78, Badge.CLIPBOARD),
    # Bench
    Player("Kemp", "CB", 74, Badge.CROSSHAIR),
    Player("Ware", "S", 72, Badge.SPEED_LINES),
]

# ============================================================
# BADGE COMBO LOGIC
# ============================================================

def is_run_type(play_type: PlayType) -> bool:
    """OPTION counts as RUN for badge purposes"""
    return play_type in (PlayType.RUN, PlayType.OPTION)

def check_offensive_badge_combo(badge: Badge, play: OffensivePlay, is_3rd_4th: bool, is_conversion: bool) -> Tuple[float, float]:
    """Returns (yard_bonus, point_bonus). TIGHT triggers, BIG bonuses.
    Each badge fires on 1-2 specific play types max."""
    pt = play.play_type
    yard_bonus = 0
    point_bonus = 0
    
    if badge == Badge.FOOTBALL:
        # QB arm: ONLY deep passes
        if pt == PlayType.DEEP:
            yard_bonus, point_bonus = 3, 20
    elif badge == Badge.CLEAT:
        # Speed: ONLY screens and rocket toss
        if pt == PlayType.SCREEN:
            yard_bonus, point_bonus = 3, 15
        elif play.id in ("rocket_toss", "zone_read"):
            yard_bonus, point_bonus = 2, 15
    elif badge == Badge.HELMET:
        # Tough: ONLY power runs (not option, not draw)
        if pt == PlayType.RUN and play.id not in ("draw",):
            yard_bonus, point_bonus = 3, 15
    elif badge == Badge.CLIPBOARD:
        # IQ: ONLY play-action and option
        if play.id in ("pa_flat", "pa_post"):
            yard_bonus, point_bonus = 3, 15
        elif pt == PlayType.OPTION:
            yard_bonus, point_bonus = 2, 15
    elif badge == Badge.GLOVE:
        # Hands: ONLY short passes
        if pt == PlayType.SHORT:
            yard_bonus, point_bonus = 3, 15
    elif badge == Badge.SPEED_LINES:
        # Explosive: ONLY deep passes
        if pt == PlayType.DEEP:
            yard_bonus, point_bonus = 4, 20
    elif badge == Badge.CROSSHAIR:
        # Precision: ONLY quick passes
        if pt == PlayType.QUICK:
            yard_bonus, point_bonus = 3, 15
    elif badge == Badge.BOLT:
        # Agility: ONLY screens
        if pt == PlayType.SCREEN:
            yard_bonus, point_bonus = 3, 15
    elif badge == Badge.BRICK:
        # Immovable: ONLY power runs and QB sneaks
        if pt == PlayType.RUN and play.id in ("power", "trap", "qb_sneak", "ir_qb_sneak"):
            yard_bonus, point_bonus = 3, 15
    elif badge == Badge.FLAME:
        # Clutch: 3rd, 4th, conversions only
        if is_3rd_4th or is_conversion:
            yard_bonus, point_bonus = 3, 20
    return yard_bonus, point_bonus

def check_defensive_badge_combo(badge: Badge, def_play: DefensivePlay, off_play: OffensivePlay) -> Tuple[float, float]:
    """Returns (yard_penalty_to_offense, point_bonus_for_defense).
    TIGHT: Narrower conditions. BIG: Bigger effect."""
    yard_mod = 0
    point_bonus = 0
    off_pt = off_play.play_type
    
    if badge == Badge.PADLOCK:
        # Lockdown: ONLY man coverage cards
        if def_play.is_man_coverage:
            yard_mod, point_bonus = -3, 15
    elif badge == Badge.HELMET:
        # Tough: ONLY vs run + run-stopping card
        if is_run_type(off_pt) and def_play.run_def_mod < -1:
            yard_mod, point_bonus = -2, 15
    elif badge == Badge.EYE:
        # Vision: ONLY on robber/cover6
        if def_play.id in ("ir_robber", "ir_cover6"):
            yard_mod, point_bonus = -2, 15
    elif badge == Badge.SPEED_LINES:
        # Explosive: ONLY on blitz cards
        if def_play.card_type == DefCardType.BLITZ:
            yard_mod, point_bonus = -2, 15
    elif badge == Badge.BRICK:
        # Immovable: ONLY vs run + strong run D card
        if is_run_type(off_pt) and def_play.run_def_mod <= -2:
            yard_mod, point_bonus = -3, 15
    elif badge == Badge.CLIPBOARD:
        # IQ: ONLY on spy/disguise schemes
        if def_play.id in ("ir_qb_spy", "ct_zone_blitz_drop", "ct_fire_zone"):
            yard_mod, point_bonus = -2, 15
    
    return yard_mod, point_bonus

# ============================================================
# PLAY HISTORY
# ============================================================

def get_play_history_bonus(history: List[PlayType], current_play: OffensivePlay) -> float:
    """Calculate bonus from play tendency. Bonuses STACK."""
    if len(history) == 0:
        return 0
    
    bonus = 0
    current_is_run = is_run_type(current_play.play_type) or current_play.play_type == PlayType.RUN
    current_is_pass = current_play.play_type in (PlayType.SHORT, PlayType.QUICK, PlayType.DEEP, PlayType.SCREEN)
    current_is_pa = current_play.id in ("pa_flat", "pa_post")
    
    # Count consecutive run/pass
    consec_runs = 0
    consec_passes = 0
    for pt in reversed(history):
        if is_run_type(pt):
            if consec_passes > 0:
                break
            consec_runs += 1
        else:
            if consec_runs > 0:
                break
            consec_passes += 1
    
    # Pass → Run bonuses
    if current_is_run and consec_passes >= 3:
        bonus += 3
    elif current_is_run and consec_passes == 2:
        bonus += 1
    
    # Run → Pass bonuses
    if current_is_pass and consec_runs >= 3:
        bonus += 2
    elif current_is_pass and consec_runs == 2:
        bonus += 1
    
    # PA specific bonus (stacks with generic)
    if current_is_pa and consec_runs >= 2:
        bonus += 4
    
    # Repeat play penalty
    if len(history) >= 1 and history[-1] == current_play.play_type:
        if len(history) >= 2 and history[-2] == current_play.play_type:
            bonus -= 5  # 3x in a row
        else:
            bonus -= 2  # 2x in a row
    
    return bonus

# ============================================================
# RED ZONE
# ============================================================

def apply_red_zone(yards_to_endzone: int, mean: float, variance: float, play: OffensivePlay) -> Tuple[float, float, float]:
    """Returns (adjusted_mean, adjusted_variance, max_yards).
    Red zone is a CRUCIBLE — harder to score, more drama."""
    max_yards = yards_to_endzone
    
    if yards_to_endzone <= 5:
        # Extreme red zone — brutal
        if play.play_type == PlayType.DEEP:
            max_yards = min(max_yards, yards_to_endzone)
        if is_run_type(play.play_type) or play.play_type == PlayType.RUN:
            mean -= 3  # was -2
        if play.id in ("qb_sneak", "ir_qb_sneak"):
            mean += 1
        mean -= 1  # universal red zone squeeze
        variance = max(1, variance - 2)
    elif yards_to_endzone <= 10:
        if play.play_type == PlayType.DEEP:
            max_yards = min(max_yards, 12)
        mean -= 2  # was -1
        variance = max(1, variance - 1)
    elif yards_to_endzone <= 20:
        if play.play_type == PlayType.DEEP:
            max_yards = min(max_yards, 20)
        mean -= 1  # was 0
        variance = max(1, variance - 1)
    
    return mean, variance, max_yards

# ============================================================
# OVR SYSTEM
# ============================================================

def ovr_mod(ovr: int, baseline: int = 75) -> float:
    return (ovr - baseline) / 5.0

def apply_squad_ovr(off_players: List[Player], def_players: List[Player], 
                     off_play: OffensivePlay, featured_off: Player, featured_def: Player) -> Dict:
    """Calculate passive OVR effects"""
    mods = {"comp_mod": 0, "sack_mod": 0, "mean_mod": 0, "int_mod": 0}
    
    # Find QB
    qb = next((p for p in off_players if p.pos == "QB" and p.is_available()), None)
    if qb:
        qb_mod = ovr_mod(qb.ovr)
        if off_play.completion_rate is not None:  # pass play
            mods["comp_mod"] += qb_mod * 0.02  # +2% per 5 OVR above 75
            mods["sack_mod"] -= qb_mod * 0.01  # -1% sack per 5 OVR above 75
    
    # Featured player OVR on yards
    if featured_off:
        mods["mean_mod"] += ovr_mod(featured_off.ovr) * 0.5
    
    # Defensive OVR
    # Best CB affects completion
    best_cb = max([p for p in def_players if p.pos == "CB" and p.is_available()], key=lambda p: p.ovr, default=None)
    if best_cb and off_play.completion_rate is not None:
        mods["comp_mod"] -= ovr_mod(best_cb.ovr) * 0.01
    
    # LB affects run defense
    best_lb = max([p for p in def_players if p.pos == "LB" and p.is_available()], key=lambda p: p.ovr, default=None)
    if best_lb and is_run_type(off_play.play_type):
        mods["mean_mod"] -= ovr_mod(best_lb.ovr) * 0.5
    
    # Safety affects deep INT
    best_s = max([p for p in def_players if p.pos == "S" and p.is_available()], key=lambda p: p.ovr, default=None)
    if best_s and off_play.play_type == PlayType.DEEP:
        mods["int_mod"] += ovr_mod(best_s.ovr) * 0.005
    
    return mods

# ============================================================
# RESOLVE SNAP
# ============================================================

@dataclass
class SnapResult:
    yards: int = 0
    is_complete: bool = False
    is_incomplete: bool = False
    is_sack: bool = False
    is_interception: bool = False
    is_fumble: bool = False
    is_fumble_lost: bool = False
    is_touchdown: bool = False
    is_safety: bool = False
    off_combo_yards: float = 0
    def_combo_yards: float = 0
    off_combo_pts: float = 0
    def_combo_pts: float = 0
    history_bonus: float = 0
    description: str = ""
    off_torch_pts: int = 0
    def_torch_pts: int = 0

def resolve_snap(off_play: OffensivePlay, def_play: DefensivePlay,
                  featured_off: Player, featured_def: Player,
                  off_players: List[Player], def_players: List[Player],
                  play_history: List[PlayType], yards_to_endzone: int,
                  ball_position: int, down: int, distance: int,
                  is_conversion: bool = False, score_diff: int = 0) -> SnapResult:
    """score_diff: positive means offense is trailing (needs comeback)"""
    
    result = SnapResult()
    is_pass = off_play.completion_rate is not None
    is_run = not is_pass
    is_3rd_4th = down >= 3
    
    # FIX 1: TRAILING TEAM AGGRESSION
    # When you're behind, you take bigger risks -> higher variance + slight mean boost
    # This creates natural lead changes without rubber-banding
    trailing_bonus = 0
    trailing_var_boost = 0
    if score_diff >= 14:
        trailing_bonus = 2    # Down 2+ scores: desperate mode
        trailing_var_boost = 3
    elif score_diff >= 7:
        trailing_bonus = 1    # Down 1 score: aggressive
        trailing_var_boost = 2
    
    # Get coverage modifiers
    cov = off_play.coverage_mods.get(def_play.base_coverage, {})
    cov_mean = cov.get("mean", 0)
    cov_var = cov.get("var", 0)
    cov_int = cov.get("int", 0)
    
    mean = off_play.mean + cov_mean
    variance = max(1, off_play.variance + cov_var)
    
    # Defensive card effects
    if is_run:
        mean += def_play.run_mean_mod
        # Cover 0 blitz vs run penalty
        if def_play.is_cover0_blitz:
            mean += 3
    else:
        # Press man deep bonus for offense
        if def_play.id in ("ct_press_man", "ir_press_man") and off_play.play_type == PlayType.DEEP:
            mean += 2
    
    # Badge combos
    off_yard_bonus, off_pt_bonus = check_offensive_badge_combo(
        featured_off.badge, off_play, is_3rd_4th, is_conversion)
    def_yard_mod, def_pt_bonus = check_defensive_badge_combo(
        featured_def.badge, def_play, off_play)
    
    result.off_combo_yards = off_yard_bonus
    result.def_combo_yards = def_yard_mod
    result.off_combo_pts = off_pt_bonus
    result.def_combo_pts = def_pt_bonus
    
    mean += off_yard_bonus + def_yard_mod
    
    # Play history
    history_bonus = get_play_history_bonus(play_history, off_play)
    result.history_bonus = history_bonus
    mean += history_bonus
    
    # OVR modifiers
    ovr_mods = apply_squad_ovr(off_players, def_players, off_play, featured_off, featured_def)
    mean += ovr_mods["mean_mod"]
    
    # Red zone
    mean, variance, max_yards = apply_red_zone(yards_to_endzone, mean, variance, off_play)
    
    # FIX 1: Apply trailing team bonus (more aggressive = higher mean + variance)
    mean += trailing_bonus
    variance += trailing_var_boost
    
    # === PASS PLAY RESOLUTION ===
    if is_pass:
        # FIX 5: Sack check — higher base rates + coverage sack mechanic
        sack_rate = off_play.sack_rate + def_play.sack_rate_bonus + ovr_mods["sack_mod"]
        # Deep passes vs certain blitzes: doubled
        if off_play.play_type == PlayType.DEEP and def_play.id in ("ct_corner_blitz",):
            sack_rate *= 2
        # FIX 3+5: COVERAGE SACK — good coverage + any pressure = sack even without blitzing
        # If defense has good coverage (negative pass_mean_mod) and some sack rate, boost it
        if def_play.pass_mean_mod < 0 and def_play.sack_rate_bonus >= 0.03:
            sack_rate += 0.03  # Coverage holds long enough for rush to get home
        # FIX 5: Red zone sack bump (less room to escape)
        if yards_to_endzone <= 20:
            sack_rate += 0.02
        if yards_to_endzone <= 10:
            sack_rate += 0.02
        # FIX 5: Global sack rate bump — sacks are high-dopamine moments
        sack_rate += 0.02
        sack_rate = max(0, min(0.30, sack_rate))
        
        if random.random() < sack_rate:
            result.is_sack = True
            result.yards = random.randint(-10, -4)
            # Safety check
            if ball_position + result.yards <= 0:
                result.is_safety = True
                result.yards = 0  # safety, no field position change
            result.description = f"SACK! {featured_off.name} goes down."
            return result
        
        # Completion check
        comp_rate = off_play.completion_rate + ovr_mods["comp_mod"] + def_play.pass_comp_mod
        # FIX 3: Bad matchup completion penalty — strong coverage counters make passes harder
        # This creates three-and-outs when offense picks wrong vs defense
        if cov_mean <= -2:
            comp_rate -= 0.08  # Strong counter: -8% completion
        elif cov_mean <= -1:
            comp_rate -= 0.04  # Moderate counter: -4% completion
        # FIX 3: Red zone completion squeeze
        if yards_to_endzone <= 10:
            comp_rate -= 0.05  # Tighter windows in the red zone
        comp_rate = max(0.15, min(0.95, comp_rate))
        
        if random.random() > comp_rate:
            result.is_incomplete = True
            result.yards = 0
            result.description = f"Incomplete. {featured_off.name}'s target can't come up with it."
            return result
        
        # Complete — roll yards
        result.is_complete = True
        raw_yards = random.gauss(mean, variance * 0.5)
        result.yards = max(-5, min(int(round(raw_yards)), max_yards))
        
        # INT check
        int_rate = off_play.int_rate + cov_int + def_play.int_rate_bonus + ovr_mods["int_mod"]
        # Global INT reduction: passes generate too many turnovers vs runs
        int_rate -= 0.005
        # Special defensive effects on INT
        if def_play.id == "ir_robber" and off_play.id in ("mesh", "slant", "shallow_cross"):
            int_rate += 0.04
        if def_play.id == "ir_mod" and off_play.id in ("four_verts", "go_route"):
            int_rate += 0.03
        # EYE badge INT bonus
        if featured_def.badge == Badge.EYE and (off_play.id in ("pa_flat", "pa_post") or off_play.play_type == PlayType.OPTION):
            int_rate += 0.02
        
        int_rate = max(0, min(0.20, int_rate))
        
        if random.random() < int_rate:
            result.is_interception = True
            result.is_complete = False
            result.yards = 0
            result.description = f"INTERCEPTED! {featured_def.name} jumps the route!"
            return result
        
        # Fumble after catch
        if random.random() < off_play.fumble_rate:
            result.is_fumble = True
            result.is_fumble_lost = random.random() < 0.5
            if result.is_fumble_lost:
                result.description = f"FUMBLE! {featured_off.name} coughs it up! Defense recovers!"
            else:
                result.description = f"Fumble by {featured_off.name} but offense recovers!"
        
    # === RUN PLAY RESOLUTION ===
    else:
        # Stuff rate: chance the run is blown up for 0 or negative yards
        stuff_rate = 0.30
        # Good run defense increases stuff rate
        if def_play.run_def_mod < -2:
            stuff_rate += 0.10
        elif def_play.run_def_mod < 0:
            stuff_rate += 0.05
        # Cover 0 blitz = fewer stuffs (gaps abandoned)
        if def_play.is_cover0_blitz:
            stuff_rate -= 0.12
        # FIX 3: Bad matchup stuff boost (strong coverage counter = more stuffs)
        if cov_mean <= -2:
            stuff_rate += 0.08
        elif cov_mean <= -1:
            stuff_rate += 0.04
        # FIX 4: Red zone stuff boost — harder to punch it in
        if yards_to_endzone <= 10:
            stuff_rate += 0.08
        elif yards_to_endzone <= 20:
            stuff_rate += 0.04
        stuff_rate = max(0.05, min(0.50, stuff_rate))
        
        if random.random() < stuff_rate:
            # Stuffed: -2 to +1 yards
            result.yards = random.randint(-2, 1)
            if ball_position + result.yards <= 0:
                result.is_safety = True
                result.yards = 0
            if result.yards <= 0:
                result.description = f"STUFFED! {featured_off.name} hit in the backfield."
            else:
                result.description = f"{featured_off.name} squeezed for {result.yards}."
            # Still check fumble on stuffs
            if random.random() < off_play.fumble_rate * 1.5:  # Higher fumble rate on stuffs
                result.is_fumble = True
                result.is_fumble_lost = random.random() < 0.5
                if result.is_fumble_lost:
                    result.description = f"STUFFED AND STRIPPED! {featured_off.name} loses it!"
            return result
        
        raw_yards = random.gauss(mean, variance * 0.5)
        result.yards = max(-5, min(int(round(raw_yards)), max_yards))
        
        # Safety check
        if ball_position + result.yards <= 0:
            result.is_safety = True
            result.yards = 0
        
        # Fumble (runs fumble slightly more than catches to balance turnover differential)
        run_fumble_rate = off_play.fumble_rate + 0.005
        if random.random() < run_fumble_rate:
            result.is_fumble = True
            result.is_fumble_lost = random.random() < 0.5
            if result.is_fumble_lost:
                result.description = f"FUMBLE! Ball on the ground! Defense has it!"
            else:
                result.description = f"Fumble but {featured_off.name} falls on it."
    
    # TD check
    if result.yards >= yards_to_endzone and not result.is_fumble_lost and not result.is_interception:
        result.is_touchdown = True
        result.yards = yards_to_endzone
        result.description = f"TOUCHDOWN! {featured_off.name} finds the end zone!"
    elif not result.description:
        if result.yards >= 15:
            result.description = f"EXPLOSIVE! {featured_off.name} breaks free for {result.yards}!"
        elif result.yards >= 8:
            result.description = f"Big gain! {featured_off.name} picks up {result.yards}."
        elif result.yards >= 1:
            result.description = f"{featured_off.name} gains {result.yards}."
        elif result.yards == 0:
            result.description = f"Stuffed! {featured_off.name} goes nowhere."
        else:
            result.description = f"Loss of {abs(result.yards)}! {featured_off.name} tackled in the backfield."
    
    return result

# ============================================================
# TORCH POINTS
# ============================================================

def calc_torch_pts_offense(result: SnapResult, got_first_down: bool) -> int:
    pts = 0
    if result.is_sack:
        pts -= 10
    elif result.is_incomplete:
        pts -= 5
    elif result.is_interception or result.is_fumble_lost:
        pts -= 25
    elif result.yards >= 15:
        pts += 30
    elif result.yards >= 8:
        pts += 30
    elif result.yards >= 4:
        pts += 10
    elif result.yards >= 1:
        pts += 0
    else:
        pts -= 10
    
    if got_first_down:
        pts += 10
    if result.is_touchdown:
        pts += 50
    
    pts += int(result.off_combo_pts)
    return pts

def calc_torch_pts_defense(result: SnapResult, allowed_first_down: bool) -> int:
    pts = 0
    if result.is_sack:
        pts += 25
    elif result.is_interception or result.is_fumble_lost:
        pts += 40
    elif result.yards <= 0:
        pts += 20
    elif result.yards <= 3:
        pts += 10
    elif result.yards <= 7:
        pts += 0
    elif result.yards <= 14:
        pts -= 5
    else:
        pts -= 15
    
    if allowed_first_down:
        pts -= 10
    if result.is_touchdown:
        pts -= 30
    if result.is_safety:
        pts += 30
    
    pts += int(result.def_combo_pts)
    return pts

# ============================================================
# AI PLAY SELECTION
# ============================================================

def ai_select_play(hand: List, play_type: str, difficulty: Difficulty,
                   down: int, distance: int, ball_pos: int, 
                   play_history: List[PlayType], score_diff: int,
                   clock_seconds: int = None, is_human: bool = False) -> object:
    """Select a play card for AI. play_type is 'offense' or 'defense'
    is_human simulates an average human player: follows basic football logic,
    sometimes picks badge combos, but makes suboptimal choices ~30% of the time."""
    
    available = [p for p in hand]
    
    if play_type == "offense":
        # Filter by situation — ALL levels including human use basic filters
        filtered = []
        for p in available:
            if p.id in ("qb_sneak", "ir_qb_sneak") and distance > 2:
                continue
            if p.play_type == PlayType.DEEP and distance <= 2 and down >= 3:
                continue
            if p.never_inside_own and ball_pos <= p.never_inside_own:
                continue
            filtered.append(p)
        
        if not filtered:
            filtered = available
        
        if is_human:
            # Average human: 70% makes a reasonable pick, 30% picks randomly
            if random.random() < 0.30:
                return random.choice(filtered)
            # Reasonable: weights by situation but not perfectly
            weights = []
            for p in filtered:
                w = 1.0
                if is_run_type(p.play_type) and distance <= 3:
                    w *= 1.8
                if p.play_type == PlayType.DEEP and distance >= 8:
                    w *= 1.5
                if p.id in ("pa_flat", "pa_post"):
                    recent_runs = sum(1 for pt in play_history[-3:] if is_run_type(pt))
                    if recent_runs >= 2:
                        w *= 2.0  # Human notices they've been running
                # Human has favorite plays they lean on
                if p.play_type in (PlayType.SHORT, PlayType.QUICK):
                    w *= 1.2  # Humans love safe short passes
                weights.append(w)
            total = sum(weights)
            weights = [w/total for w in weights]
            return random.choices(filtered, weights=weights, k=1)[0]
        
        if difficulty == Difficulty.EASY:
            return random.choice(filtered)
        
        # Medium/Hard: weight by situation
        weights = []
        for p in filtered:
            w = 1.0
            if is_run_type(p.play_type) and distance <= 3:
                w *= 2.0
            if p.play_type == PlayType.DEEP and distance >= 8:
                w *= 1.5
            if p.id in ("pa_flat", "pa_post"):
                recent_runs = sum(1 for pt in play_history[-3:] if is_run_type(pt))
                if recent_runs >= 2:
                    w *= 2.5
            if p.play_type == PlayType.SCREEN and down >= 3 and distance >= 8:
                w *= 0.5
            weights.append(w)
        
        total = sum(weights)
        weights = [w/total for w in weights]
        return random.choices(filtered, weights=weights, k=1)[0]
    
    else:  # defense
        if is_human:
            # Average human on defense: 70% reasonable, 30% random
            if random.random() < 0.30:
                return random.choice(available)
            weights = []
            for p in available:
                w = 1.0
                if distance <= 3 and p.run_def_mod < -1:
                    w *= 1.8
                if distance >= 8 and p.card_type == DefCardType.BLITZ:
                    w *= 1.5
                weights.append(w)
            total = sum(weights)
            weights = [w/total for w in weights]
            return random.choices(available, weights=weights, k=1)[0]
        
        if difficulty == Difficulty.EASY:
            return random.choice(available)
        
        weights = []
        for p in available:
            w = 1.0
            if distance <= 3 and p.run_def_mod < -1:
                w *= 2.0
            if distance >= 8 and p.card_type == DefCardType.BLITZ:
                w *= 1.5
            if down >= 3 and distance >= 5:
                w *= 1.0 + (0.5 if p.sack_rate_bonus > 0.03 else 0)
            weights.append(w)
        
        total = sum(weights)
        weights = [w/total for w in weights]
        return random.choices(available, weights=weights, k=1)[0]

def ai_select_player(roster: List[Player], play, difficulty: Difficulty, is_offense: bool, is_human: bool = False) -> Player:
    """Select featured player"""
    available = [p for p in roster[:4] if p.is_available()]
    if not available:
        available = [p for p in roster if p.is_available()]
    
    if is_human:
        # Average human: 50% tries to badge match, 50% picks favorite/highest OVR
        if random.random() < 0.50:
            return max(available, key=lambda p: p.ovr)  # Picks best player regardless
        # Try badge match
        if is_offense:
            best = None
            best_bonus = -1
            for p in available:
                bonus, _ = check_offensive_badge_combo(p.badge, play, False, False)
                if bonus > best_bonus:
                    best_bonus = bonus
                    best = p
            return best or random.choice(available)
        else:
            return max(available, key=lambda p: p.ovr)
    
    if difficulty == Difficulty.EASY:
        return random.choice(available)
    
    if difficulty == Difficulty.MEDIUM and random.random() < 0.4:
        return random.choice(available)
    
    if is_offense:
        best = None
        best_bonus = -1
        for p in available:
            bonus, _ = check_offensive_badge_combo(p.badge, play, False, False)
            if bonus > best_bonus:
                best_bonus = bonus
                best = p
        return best or random.choice(available)
    else:
        return max(available, key=lambda p: p.ovr)

# ============================================================
# TURNOVER RETURNS
# ============================================================

def calc_return_yards(featured_def: Player) -> int:
    base = random.randint(0, 15)
    ovr_bonus = max(0, (featured_def.ovr - 75) // 5)
    badge_bonus = 0
    if featured_def.badge in (Badge.SPEED_LINES, Badge.CLEAT):
        badge_bonus = random.randint(5, 10)
    elif featured_def.badge in (Badge.HELMET, Badge.BRICK):
        badge_bonus = random.randint(0, 3)
    else:
        badge_bonus = random.randint(1, 5)
    return base + ovr_bonus + badge_bonus

# ============================================================
# GAME ENGINE
# ============================================================

@dataclass
class GameState:
    # Score
    ct_score: int = 0
    ir_score: int = 0
    # Ball
    possession: str = "IR"
    ball_position: int = 50
    down: int = 1
    distance: int = 10
    # Halves
    half: int = 1
    plays_used: int = 0
    plays_per_half: int = 20
    two_min_active: bool = False
    clock_seconds: int = 120
    # History
    drive_play_history: List[PlayType] = field(default_factory=list)
    total_plays: int = 0
    # TORCH points
    ct_torch_pts: int = 0
    ir_torch_pts: int = 0
    # Stats
    ct_turnovers: int = 0
    ir_turnovers: int = 0
    ct_touchdowns: int = 0
    ir_touchdowns: int = 0
    ct_total_yards: int = 0
    ir_total_yards: int = 0
    ct_sacks: int = 0
    ir_sacks: int = 0
    ct_first_downs: int = 0
    ir_first_downs: int = 0
    ct_drives: int = 0
    ir_drives: int = 0
    ct_incompletions: int = 0
    ir_incompletions: int = 0
    ct_stuffs: int = 0
    ir_stuffs: int = 0
    
    # MOMENT TRACKING
    explosive_plays: int = 0  # 15+ yards
    big_plays: int = 0  # 10+ yards
    lead_changes: int = 0
    ties_broken: int = 0
    fourth_down_attempts: int = 0
    fourth_down_conversions: int = 0
    two_min_scores: int = 0
    comeback_wins: int = 0  # winner was trailing at some point
    one_score_finishes: int = 0  # final margin <= 8
    blowouts: int = 0  # final margin >= 21
    sack_count: int = 0
    turnover_tds: int = 0
    three_and_outs: int = 0
    long_drives: int = 0  # 6+ play scoring drives
    badge_combos_fired: int = 0
    history_bonuses_fired: int = 0
    red_zone_trips: int = 0
    red_zone_tds: int = 0
    shutouts: int = 0
    safeties: int = 0
    max_play_yards: int = 0
    conversion_attempts_2pt: int = 0
    conversion_made_2pt: int = 0
    conversion_attempts_3pt: int = 0
    conversion_made_3pt: int = 0
    
    # Internal tracking
    _score_log: List = field(default_factory=list)  # [(play_num, ct_score, ir_score)]
    _ever_trailing: Dict = field(default_factory=lambda: {"CT": False, "IR": False})
    _drive_plays: int = 0
    _in_red_zone: bool = False

    def yards_to_endzone(self):
        if self.possession == "CT":
            return 100 - self.ball_position
        else:
            return self.ball_position
    
    def flip_possession(self, new_ball_pos: int):
        self.possession = "IR" if self.possession == "CT" else "CT"
        self.ball_position = new_ball_pos
        self.down = 1
        self.distance = 10
        self.drive_play_history = []
        self._drive_plays = 0
        self._in_red_zone = False
        if self.possession == "CT":
            self.ct_drives += 1
        else:
            self.ir_drives += 1
    
    def advance_ball(self, yards: int):
        if self.possession == "CT":
            self.ball_position += yards
            self.ct_total_yards += yards
        else:
            self.ball_position -= yards
            self.ir_total_yards += yards
    
    def check_lead_change(self, old_ct, old_ir):
        """Track lead changes and ties broken"""
        old_leader = "CT" if old_ct > old_ir else "IR" if old_ir > old_ct else "TIE"
        new_leader = "CT" if self.ct_score > self.ir_score else "IR" if self.ir_score > self.ct_score else "TIE"
        if old_leader != new_leader:
            if old_leader == "TIE":
                self.ties_broken += 1
            elif new_leader != "TIE":
                self.lead_changes += 1
        # Track if either team was ever trailing
        if self.ct_score < self.ir_score:
            self._ever_trailing["CT"] = True
        if self.ir_score < self.ct_score:
            self._ever_trailing["IR"] = True
        self._score_log.append((self.total_plays, self.ct_score, self.ir_score))

def play_game(ct_is_human: bool, difficulty: Difficulty, verbose: bool = False, cpu_vs_cpu: bool = False) -> GameState:
    gs = GameState()
    
    human_team = "CT" if ct_is_human else "IR"
    cpu_team = "IR" if ct_is_human else "CT"
    
    ct_off_hand = CT_OFF_PLAYS[:5]
    ct_def_hand = CT_DEF_PLAYS[:5]
    ir_off_hand = IR_OFF_PLAYS[:5]
    ir_def_hand = IR_DEF_PLAYS[:5]
    
    # CPU vs CPU: IR receives first half
    if cpu_vs_cpu:
        gs.possession = "IR"
    else:
        gs.possession = cpu_team
    gs.ball_position = 50
    gs.ir_drives = 1 if gs.possession == "IR" else 0
    gs.ct_drives = 1 if gs.possession == "CT" else 0
    
    for half in range(1, 3):
        gs.half = half
        gs.plays_used = 0
        gs.two_min_active = False
        gs.clock_seconds = 120
        
        if half == 2:
            gs.flip_possession(50)
        
        while True:
            if not gs.two_min_active and gs.plays_used >= gs.plays_per_half:
                gs.two_min_active = True
                gs.clock_seconds = 120
            
            if gs.two_min_active and gs.clock_seconds <= 0:
                break
            
            # Determine offense/defense hands and rosters
            if gs.possession == "CT":
                off_hand, def_hand = ct_off_hand, ir_def_hand
                off_players, def_players = CT_OFFENSE, IR_DEFENSE
            else:
                off_hand, def_hand = ir_off_hand, ct_def_hand
                off_players, def_players = IR_OFFENSE, CT_DEFENSE
            
            # Is the current side human or CPU?
            if cpu_vs_cpu:
                offense_is_human = False
                defense_is_human = False
            else:
                offense_is_human = (gs.possession == human_team)
                defense_is_human = (gs.possession != human_team)
            
            # Select plays
            off_play = ai_select_play(off_hand, "offense", difficulty,
                gs.down, gs.distance, gs.ball_position, 
                gs.drive_play_history, 0, is_human=offense_is_human)
            def_play = ai_select_play(def_hand, "defense", difficulty,
                gs.down, gs.distance, gs.ball_position,
                gs.drive_play_history, 0, is_human=defense_is_human)
            
            featured_off = ai_select_player(off_players, off_play, difficulty, True, is_human=offense_is_human)
            featured_def = ai_select_player(def_players, def_play, difficulty, False, is_human=defense_is_human)
            
            # Track red zone entry
            yds_to_ez = gs.yards_to_endzone()
            if yds_to_ez <= 20 and not gs._in_red_zone:
                gs._in_red_zone = True
                gs.red_zone_trips += 1
            
            # Track 4th down
            is_4th = gs.down == 4
            if is_4th:
                gs.fourth_down_attempts += 1
            
            # FIX 1: Calculate score differential from offense's perspective
            # Positive = offense is trailing (needs comeback)
            if gs.possession == "CT":
                score_diff = gs.ir_score - gs.ct_score
            else:
                score_diff = gs.ct_score - gs.ir_score
            
            # Resolve
            old_ct, old_ir = gs.ct_score, gs.ir_score
            result = resolve_snap(off_play, def_play, featured_off, featured_def,
                off_players, def_players, gs.drive_play_history,
                gs.yards_to_endzone(), gs.ball_position, gs.down, gs.distance,
                False, score_diff=score_diff)
            
            # FIX 6: Easy difficulty human bonus — "home field advantage"
            # On Easy, human's plays get a small yard boost, CPU's plays get penalized
            # Skip in CPU vs CPU mode
            if difficulty == Difficulty.EASY and not cpu_vs_cpu:
                if offense_is_human and not result.is_sack and not result.is_incomplete and not result.is_interception and not result.is_fumble_lost:
                    result.yards = min(result.yards + 2, gs.yards_to_endzone())  # +2 yard bonus
                elif not offense_is_human and not result.is_sack and not result.is_incomplete:
                    result.yards = max(result.yards - 1, -5)  # CPU gets -1 penalty
            
            gs.total_plays += 1
            gs._drive_plays += 1
            if not gs.two_min_active:
                gs.plays_used += 1
            
            gs.drive_play_history.append(off_play.play_type)
            
            # Track moments
            if result.yards >= 15:
                gs.explosive_plays += 1
            if result.yards >= 10:
                gs.big_plays += 1
            if abs(result.yards) > gs.max_play_yards:
                gs.max_play_yards = abs(result.yards)
            if result.off_combo_pts > 0 or result.def_combo_pts > 0:
                gs.badge_combos_fired += 1
            if result.history_bonus != 0:
                gs.history_bonuses_fired += 1
            if result.is_incomplete:
                if gs.possession == "CT":
                    gs.ct_incompletions += 1
                else:
                    gs.ir_incompletions += 1
            
            if verbose:
                side = gs.possession
                extras = []
                if result.off_combo_pts > 0:
                    extras.append(f"OFF COMBO +{result.off_combo_yards:.0f}y +{result.off_combo_pts:.0f}pts")
                if result.def_combo_pts > 0:
                    extras.append(f"DEF COMBO {result.def_combo_yards:.0f}y +{result.def_combo_pts:.0f}pts")
                if result.history_bonus != 0:
                    extras.append(f"HISTORY {'+' if result.history_bonus > 0 else ''}{result.history_bonus:.0f}")
                extra_str = f" | {'  '.join(extras)}" if extras else ""
                h_marker = "🎮" if (side == human_team) else "🤖"
                print(f"  P{gs.total_plays} | {gs.down}&{gs.distance} @ {gs.ball_position} | "
                      f"{h_marker}{side}: {off_play.name} + {featured_off.name} vs {def_play.name} + {featured_def.name} | "
                      f"{result.description}{extra_str}")
            
            # 2-minute clock
            if gs.two_min_active:
                if result.is_incomplete:
                    gs.clock_seconds -= 5
                elif result.is_sack:
                    gs.clock_seconds -= 20
                else:
                    gs.clock_seconds -= random.randint(25, 30)
            
            # TORCH points
            off_pts = calc_torch_pts_offense(result, False)
            def_pts = calc_torch_pts_defense(result, False)
            
            # === HANDLE RESULT ===
            
            if result.is_safety:
                gs.safeties += 1
                if gs.possession == "CT":
                    gs.ir_score += 2
                else:
                    gs.ct_score += 2
                gs.check_lead_change(old_ct, old_ir)
                gs.flip_possession(50)
                continue
            
            if result.is_interception:
                return_yds = calc_return_yards(featured_def)
                if gs.possession == "CT":
                    gs.ct_turnovers += 1
                    new_pos = gs.ball_position - return_yds  # Don't clamp yet
                    if new_pos <= 0:
                        gs.ir_score += 7
                        gs.ir_touchdowns += 1
                        gs.turnover_tds += 1
                        gs.check_lead_change(old_ct, old_ir)
                        gs.flip_possession(50)
                        continue
                    gs.flip_possession(max(1, min(99, new_pos)))
                else:
                    gs.ir_turnovers += 1
                    new_pos = gs.ball_position + return_yds  # Don't clamp yet
                    if new_pos >= 100:
                        gs.ct_score += 7
                        gs.ct_touchdowns += 1
                        gs.turnover_tds += 1
                        gs.check_lead_change(old_ct, old_ir)
                        gs.flip_possession(50)
                        continue
                    gs.flip_possession(max(1, min(99, new_pos)))
                continue
            
            if result.is_fumble_lost:
                if gs.possession == "CT":
                    gs.ct_turnovers += 1
                    fumble_spot = gs.ball_position + int(result.yards * random.uniform(0.3, 0.8))
                    return_yds = calc_return_yards(featured_def)
                    new_pos = fumble_spot - return_yds  # Don't clamp yet
                    if new_pos <= 0:
                        gs.ir_score += 7
                        gs.ir_touchdowns += 1
                        gs.turnover_tds += 1
                        gs.check_lead_change(old_ct, old_ir)
                        gs.flip_possession(50)
                        continue
                    gs.flip_possession(max(1, min(99, new_pos)))
                else:
                    gs.ir_turnovers += 1
                    fumble_spot = gs.ball_position - int(result.yards * random.uniform(0.3, 0.8))
                    return_yds = calc_return_yards(featured_def)
                    new_pos = fumble_spot + return_yds  # Don't clamp yet
                    if new_pos >= 100:
                        gs.ct_score += 7
                        gs.ct_touchdowns += 1
                        gs.turnover_tds += 1
                        gs.check_lead_change(old_ct, old_ir)
                        gs.flip_possession(50)
                        continue
                    gs.flip_possession(max(1, min(99, new_pos)))
                continue
            
            if result.is_sack:
                gs.sack_count += 1
                if gs.possession == "CT":
                    gs.ir_sacks += 1
                else:
                    gs.ct_sacks += 1
            
            # Check if stuffed run
            if not result.is_sack and not result.is_incomplete and result.yards <= 1 and not (off_play.completion_rate is not None):
                if gs.possession == "CT":
                    gs.ct_stuffs += 1
                else:
                    gs.ir_stuffs += 1
            
            gs.advance_ball(result.yards)
            
            # Touchdown
            if result.is_touchdown:
                scoring_team = gs.possession
                if scoring_team == "CT":
                    gs.ct_score += 6
                    gs.ct_touchdowns += 1
                    gs.ct_torch_pts += off_pts
                else:
                    gs.ir_score += 6
                    gs.ir_touchdowns += 1
                    gs.ir_torch_pts += off_pts
                
                if gs.two_min_active:
                    gs.two_min_scores += 1
                if gs._in_red_zone:
                    gs.red_zone_tds += 1
                if gs._drive_plays >= 6:
                    gs.long_drives += 1
                if is_4th:
                    gs.fourth_down_conversions += 1
                
                # Conversion
                conv_roll = random.random()
                if conv_roll < 0.65:
                    # XP
                    if scoring_team == "CT":
                        gs.ct_score += 1
                    else:
                        gs.ir_score += 1
                elif conv_roll < 0.85:
                    # 2-pt attempt
                    gs.conversion_attempts_2pt += 1
                    if random.random() < 0.52:
                        gs.conversion_made_2pt += 1
                        if scoring_team == "CT":
                            gs.ct_score += 2
                        else:
                            gs.ir_score += 2
                elif conv_roll < 1.0:
                    # 3-pt attempt
                    gs.conversion_attempts_3pt += 1
                    if random.random() < 0.33:
                        gs.conversion_made_3pt += 1
                        if scoring_team == "CT":
                            gs.ct_score += 3
                        else:
                            gs.ir_score += 3
                
                gs.check_lead_change(old_ct, old_ir)
                gs.flip_possession(50)
                continue
            
            # Down and distance
            gs.ball_position = max(1, min(99, gs.ball_position))
            
            if result.yards >= gs.distance:
                gs.down = 1
                gs.distance = min(10, gs.yards_to_endzone())
                if gs.possession == "CT":
                    gs.ct_first_downs += 1
                    gs.ct_torch_pts += 10
                else:
                    gs.ir_first_downs += 1
                    gs.ir_torch_pts += 10
                if is_4th:
                    gs.fourth_down_conversions += 1
            else:
                gs.distance -= max(0, result.yards)
                gs.down += 1
                
                if gs.down > 4:
                    # "Three and out" = failed to get a first down in first set of downs
                    # Since we always go for it on 4th, that's 4 plays with no first down
                    if gs._drive_plays <= 4:
                        gs.three_and_outs += 1
                    gs.flip_possession(gs.ball_position)
                    continue
            
            # TORCH pts
            if gs.possession == "CT":
                gs.ct_torch_pts += off_pts
            else:
                gs.ir_torch_pts += off_pts
            
            # Injury check
            if abs(result.yards) >= 10 or result.is_sack:
                if random.random() < 0.03:
                    injured = featured_off if random.random() < 0.5 else featured_def
                    if not injured.injured:
                        injured.injured = True
                        severity = random.random()
                        if severity < 0.5:
                            injured.injury_snaps_remaining = random.randint(2, 3)
                        elif severity < 0.85:
                            injured.injury_snaps_remaining = 20
                        else:
                            injured.injury_snaps_remaining = 100
            
            for roster in [CT_OFFENSE, CT_DEFENSE, IR_OFFENSE, IR_DEFENSE]:
                for p in roster:
                    if p.injured and p.injury_snaps_remaining > 0:
                        p.injury_snaps_remaining -= 1
                        if p.injury_snaps_remaining <= 0:
                            p.injured = False
            
            if gs.total_plays > 120:
                break
    
    # Win bonus
    if gs.ct_score > gs.ir_score:
        gs.ct_torch_pts += 100
    elif gs.ir_score > gs.ct_score:
        gs.ir_torch_pts += 100
    
    # Post-game moment analysis
    margin = abs(gs.ct_score - gs.ir_score)
    if margin <= 8:
        gs.one_score_finishes += 1
    if margin >= 21:
        gs.blowouts += 1
    if gs.ct_score == 0 or gs.ir_score == 0:
        gs.shutouts += 1
    
    winner = "CT" if gs.ct_score > gs.ir_score else "IR" if gs.ir_score > gs.ct_score else "TIE"
    if winner != "TIE" and gs._ever_trailing.get(winner, False):
        gs.comeback_wins += 1
    
    return gs

# ============================================================
# SIMULATION RUNNER
# ============================================================

def run_simulation(num_games: int = 10, difficulty: str = "MEDIUM", verbose: bool = False, cpu_vs_cpu: bool = False):
    diff = Difficulty[difficulty.upper()]
    
    results = []
    all_states = []
    for i in range(num_games):
        for roster in [CT_OFFENSE, CT_DEFENSE, IR_OFFENSE, IR_DEFENSE]:
            for p in roster:
                p.injured = False
                p.injury_snaps_remaining = 0
        
        ct_is_human = (i % 2 == 0)
        
        if verbose:
            if cpu_vs_cpu:
                print(f"\n{'='*60}")
                print(f"GAME {i+1} | CPU CT vs CPU IR | Difficulty: {difficulty}")
                print(f"{'='*60}")
            else:
                human = "CT" if ct_is_human else "IR"
                print(f"\n{'='*60}")
                print(f"GAME {i+1} | You: {human} | CPU: {'IR' if ct_is_human else 'CT'} | Difficulty: {difficulty}")
                print(f"{'='*60}")
        
        gs = play_game(ct_is_human, diff, verbose, cpu_vs_cpu=cpu_vs_cpu)
        all_states.append(gs)
        
        results.append({
            "game": i + 1,
            "human_team": "CPU" if cpu_vs_cpu else ("CT" if ct_is_human else "IR"),
            "ct_score": gs.ct_score,
            "ir_score": gs.ir_score,
            "winner": "CT" if gs.ct_score > gs.ir_score else "IR" if gs.ir_score > gs.ct_score else "TIE",
            "human_won": False if cpu_vs_cpu else ((ct_is_human and gs.ct_score > gs.ir_score) or (not ct_is_human and gs.ir_score > gs.ct_score)),
            "total_plays": gs.total_plays,
            "ct_torch_pts": gs.ct_torch_pts,
            "ir_torch_pts": gs.ir_torch_pts,
            "ct_turnovers": gs.ct_turnovers,
            "ir_turnovers": gs.ir_turnovers,
            "ct_touchdowns": gs.ct_touchdowns,
            "ir_touchdowns": gs.ir_touchdowns,
            "ct_total_yards": gs.ct_total_yards,
            "ir_total_yards": gs.ir_total_yards,
            "ct_sacks": gs.ct_sacks,
            "ir_sacks": gs.ir_sacks,
            "ct_first_downs": gs.ct_first_downs,
            "ir_first_downs": gs.ir_first_downs,
        })
        
        if verbose:
            print(f"\nFINAL: CT {gs.ct_score} - IR {gs.ir_score} | "
                  f"Plays: {gs.total_plays} | "
                  f"CT TORCH: {gs.ct_torch_pts} | IR TORCH: {gs.ir_torch_pts}")
    
    # =========================================
    # SUMMARY
    # =========================================
    print(f"\n{'='*80}")
    mode = "CPU vs CPU" if cpu_vs_cpu else "Human vs CPU"
    print(f"SIMULATION SUMMARY: {num_games} games on {difficulty} ({mode})")
    print(f"{'='*80}")
    
    human_wins = sum(1 for r in results if r["human_won"])
    ties = sum(1 for r in results if r["winner"] == "TIE")
    ct_wins = sum(1 for r in results if r["winner"] == "CT")
    ir_wins = sum(1 for r in results if r["winner"] == "IR")
    
    if not cpu_vs_cpu:
        print(f"\nHuman Win Rate: {human_wins}/{num_games} ({human_wins/num_games*100:.0f}%)")
    print(f"CT Wins: {ct_wins} | IR Wins: {ir_wins} | Ties: {ties}")
    
    avg = lambda key: sum(r[key] for r in results) / num_games
    avg_plays = avg("total_plays")
    
    print(f"\n{'':25} {'CT':>10} {'IR':>10}")
    print(f"{'Avg Score':25} {avg('ct_score'):>10.1f} {avg('ir_score'):>10.1f}")
    print(f"{'Avg TDs':25} {avg('ct_touchdowns'):>10.1f} {avg('ir_touchdowns'):>10.1f}")
    print(f"{'Avg Yards':25} {avg('ct_total_yards'):>10.1f} {avg('ir_total_yards'):>10.1f}")
    print(f"{'Avg First Downs':25} {avg('ct_first_downs'):>10.1f} {avg('ir_first_downs'):>10.1f}")
    print(f"{'Avg Turnovers':25} {avg('ct_turnovers'):>10.1f} {avg('ir_turnovers'):>10.1f}")
    print(f"{'Avg Sacks':25} {avg('ct_sacks'):>10.1f} {avg('ir_sacks'):>10.1f}")
    print(f"{'Avg TORCH pts':25} {avg('ct_torch_pts'):>10.1f} {avg('ir_torch_pts'):>10.1f}")
    print(f"{'Avg Total Plays':25} {avg_plays:>10.1f}")
    
    all_scores = [r["ct_score"] for r in results] + [r["ir_score"] for r in results]
    print(f"\nScore Range: {min(all_scores)}-{max(all_scores)}")
    print(f"Avg Combined Score: {(avg('ct_score') + avg('ir_score')):.1f}")
    
    # =========================================
    # MOMENT ANALYSIS
    # =========================================
    print(f"\n{'='*80}")
    print(f"MOMENT ANALYSIS (per game averages)")
    print(f"{'='*80}")
    
    n = num_games
    avg_s = lambda attr: sum(getattr(gs, attr) for gs in all_states) / n
    tot_s = lambda attr: sum(getattr(gs, attr) for gs in all_states)
    
    print(f"\n--- BIG PLAYS ---")
    print(f"  Explosive plays (15+ yds):   {avg_s('explosive_plays'):.1f}/game  (target: 4-8)")
    print(f"  Big plays (10+ yds):         {avg_s('big_plays'):.1f}/game  (target: 8-14)")
    print(f"  Longest play avg:            {avg_s('max_play_yards'):.0f} yds")
    print(f"  Sacks:                       {avg_s('sack_count'):.1f}/game  (target: 2-5)")
    
    print(f"\n--- DRAMA & TENSION ---")
    print(f"  Lead changes:                {avg_s('lead_changes'):.1f}/game  (target: 1-3)")
    print(f"  Ties broken:                 {avg_s('ties_broken'):.1f}/game")
    pct_one_score = sum(1 for gs in all_states if gs.one_score_finishes > 0) / n * 100
    pct_blowout = sum(1 for gs in all_states if gs.blowouts > 0) / n * 100
    pct_comeback = sum(1 for gs in all_states if gs.comeback_wins > 0) / n * 100
    pct_shutout = sum(1 for gs in all_states if gs.shutouts > 0) / n * 100
    print(f"  One-score finishes (≤8):     {pct_one_score:.0f}%     (target: 40-60%)")
    print(f"  Blowouts (21+ margin):       {pct_blowout:.0f}%     (target: 5-15%)")
    print(f"  Comeback wins:               {pct_comeback:.0f}%     (target: 20-40%)")
    print(f"  Shutouts:                    {pct_shutout:.0f}%     (target: 5-15%)")
    print(f"  2-minute drill scores:       {avg_s('two_min_scores'):.1f}/game  (target: 0.3-0.8)")
    
    print(f"\n--- STRATEGIC DEPTH ---")
    print(f"  Badge combos fired:          {avg_s('badge_combos_fired'):.1f}/game  (target: 15-25)")
    print(f"  History bonuses fired:       {avg_s('history_bonuses_fired'):.1f}/game  (target: 8-15)")
    print(f"  4th down attempts:           {avg_s('fourth_down_attempts'):.1f}/game")
    conv_att = tot_s('fourth_down_attempts')
    conv_made = tot_s('fourth_down_conversions')
    pct_4th = conv_made / conv_att * 100 if conv_att > 0 else 0
    print(f"  4th down conversion rate:    {pct_4th:.0f}%     (target: 35-50%)")
    print(f"  Three and outs:              {avg_s('three_and_outs'):.1f}/game  (target: 1-3)")
    print(f"  Long scoring drives (6+):    {avg_s('long_drives'):.1f}/game  (target: 1-3)")
    
    print(f"\n--- RED ZONE ---")
    rz_trips = tot_s('red_zone_trips')
    rz_tds = tot_s('red_zone_tds')
    rz_pct = rz_tds / rz_trips * 100 if rz_trips > 0 else 0
    print(f"  Red zone trips:              {avg_s('red_zone_trips'):.1f}/game")
    print(f"  Red zone TD rate:            {rz_pct:.0f}%     (target: 55-65%)")
    
    print(f"\n--- CONVERSIONS ---")
    att_2 = tot_s('conversion_attempts_2pt')
    made_2 = tot_s('conversion_made_2pt')
    att_3 = tot_s('conversion_attempts_3pt')
    made_3 = tot_s('conversion_made_3pt')
    pct_2 = made_2/att_2*100 if att_2 > 0 else 0
    pct_3 = made_3/att_3*100 if att_3 > 0 else 0
    print(f"  2-pt attempts: {att_2}, made: {made_2} ({pct_2:.0f}%)")
    print(f"  3-pt attempts: {att_3}, made: {made_3} ({pct_3:.0f}%)")
    print(f"  Safeties:                    {tot_s('safeties')} total ({avg_s('safeties'):.2f}/game)")
    print(f"  Turnover TDs:                {tot_s('turnover_tds')} total ({avg_s('turnover_tds'):.2f}/game)")
    
    print(f"\n--- FAILURE MECHANICS ---")
    ct_inc = sum(gs.ct_incompletions for gs in all_states)
    ir_inc = sum(gs.ir_incompletions for gs in all_states)
    ct_stuff = sum(gs.ct_stuffs for gs in all_states)
    ir_stuff = sum(gs.ir_stuffs for gs in all_states)
    print(f"  CT incompletions total:      {ct_inc} ({ct_inc/n:.1f}/game)")
    print(f"  IR incompletions total:      {ir_inc} ({ir_inc/n:.1f}/game)")
    print(f"  CT stuffed runs total:       {ct_stuff} ({ct_stuff/n:.1f}/game)")
    print(f"  IR stuffed runs total:       {ir_stuff} ({ir_stuff/n:.1f}/game)")
    
    # =========================================
    # BENCHMARKS
    # =========================================
    print(f"\n{'='*80}")
    print(f"BENCHMARK COMPARISON")
    print(f"{'='*80}")
    print(f"""
  TORCH targets vs comparable games:
  
  | Metric                  | TORCH Now | Balatro    | Slay Spire | NFL Avg  | Target   |
  |-------------------------|-----------|------------|------------|----------|----------|
  | Big moments / game      | {avg_s('explosive_plays') + avg_s('lead_changes') + avg_s('sack_count') + tot_s('turnover_tds')/n:.1f}       | ~8-12/run  | ~5-8/run   | ~12/game | 8-15     |
  | "I almost lost" rate    | {pct_one_score:.0f}%       | ~60%       | ~40%       | ~30%     | 40-60%   |
  | Comeback rate           | {pct_comeback:.0f}%       | ~25%       | ~20%       | ~25%     | 20-40%   |
  | Blowout rate            | {pct_blowout:.0f}%       | ~10%       | ~15%       | ~15%     | 5-15%    |
  | Avg game length (plays) | {avg_plays:.0f}        | ~15 min    | ~30 min    | ~130     | 45-55    |
  | Strategy matters?       | badge+hist | joker+deck | relic+card | scheme   | YES      |""")
    
    # =========================================
    # GAME BY GAME
    # =========================================
    print(f"\nGAME-BY-GAME (first 20):")
    print(f"{'#':>3} {'Human':>6} {'CT':>5} {'IR':>5} {'Win':>4} {'Plays':>6} {'Explo':>6} {'LeadΔ':>6} {'1-scr':>6}")
    for r, gs in zip(results[:20], all_states[:20]):
        w = "✓" if r["human_won"] else "✗" if r["winner"] != "TIE" else "T"
        one = "Y" if gs.one_score_finishes > 0 else "N"
        print(f"{r['game']:>3} {r['human_team']:>6} {r['ct_score']:>5} {r['ir_score']:>5} {w:>4} "
              f"{r['total_plays']:>6} {gs.explosive_plays:>6} {gs.lead_changes:>6} {one:>6}")
    
    return results

# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    num_games = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    difficulty = sys.argv[2] if len(sys.argv) > 2 else "MEDIUM"
    verbose = "--verbose" in sys.argv or "-v" in sys.argv
    cpu_vs_cpu = "--cpu" in sys.argv
    
    run_simulation(num_games, difficulty, verbose, cpu_vs_cpu=cpu_vs_cpu)
