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
    RANDOM = "RANDOM"

# ============================================================
# TORCH CARDS
# ============================================================

TORCH_CARDS = {
    # GOLD (40-50 pts)
    'SCOUT_TEAM': {'tier': 'GOLD', 'cost': 45, 'cat': 'INFO', 'is_reactive': False},
    'FILM_LEAK': {'tier': 'GOLD', 'cost': 45, 'cat': 'DISRUPT', 'is_reactive': False},
    'SURE_HANDS': {'tier': 'GOLD', 'cost': 50, 'cat': 'PROTECT', 'is_reactive': False},
    'MEDICAL_TENT': {'tier': 'GOLD', 'cost': 40, 'cat': 'PROTECT', 'is_reactive': False},
    'TO_THE_HOUSE': {'tier': 'GOLD', 'cost': 50, 'cat': 'RESOURCE', 'is_reactive': False},
    'DOUBLE_DOWN': {'tier': 'GOLD', 'cost': 45, 'cat': 'RULE', 'is_reactive': False},
    'TRADE_DEADLINE': {'tier': 'GOLD', 'cost': 50, 'cat': 'RULE', 'is_reactive': False},
    
    # SILVER (20-30 pts)
    'SIDELINE_PHONE': {'tier': 'SILVER', 'cost': 25, 'cat': 'INFO', 'is_reactive': False},
    'PRIME_TIME': {'tier': 'SILVER', 'cost': 25, 'cat': 'AMP', 'is_reactive': False},
    'DOUBLE_MOVE': {'tier': 'SILVER', 'cost': 30, 'cat': 'AMP', 'is_reactive': False},
    'HARD_COUNT': {'tier': 'SILVER', 'cost': 25, 'cat': 'DISRUPT', 'is_reactive': False},
    'SHIFT': {'tier': 'SILVER', 'cost': 20, 'cat': 'DISRUPT', 'is_reactive': False},
    'CHALLENGE_FLAG': {'tier': 'SILVER', 'cost': 25, 'cat': 'PROTECT', 'is_reactive': True},
    'FLAG_ON_THE_PLAY': {'tier': 'SILVER', 'cost': 25, 'cat': 'PROTECT', 'is_reactive': True},
    'TIMEOUT': {'tier': 'SILVER', 'cost': 20, 'cat': 'PROTECT', 'is_reactive': False},
    'HOT_ROUTE': {'tier': 'SILVER', 'cost': 25, 'cat': 'RESOURCE', 'is_reactive': False},
    'FAKE_KNEEL': {'tier': 'SILVER', 'cost': 25, 'cat': 'RULE', 'is_reactive': False},
    'TRICK_PLAY': {'tier': 'SILVER', 'cost': 20, 'cat': 'RULE', 'is_reactive': False},
    'ONSIDE_KICK': {'tier': 'SILVER', 'cost': 20, 'cat': 'RULE', 'is_reactive': True},
    
    # BRONZE (10-20 pts)
    'PERSONNEL_REPORT': {'tier': 'BRONZE', 'cost': 15, 'cat': 'INFO', 'is_reactive': False},
    '12TH_MAN': {'tier': 'BRONZE', 'cost': 15, 'cat': 'AMP', 'is_reactive': False},
    'HURRY_UP': {'tier': 'BRONZE', 'cost': 15, 'cat': 'AMP', 'is_reactive': False},
    'ICE': {'tier': 'BRONZE', 'cost': 15, 'cat': 'DISRUPT', 'is_reactive': False},
    'NEXT_MAN_UP': {'tier': 'BRONZE', 'cost': 10, 'cat': 'RESOURCE', 'is_reactive': False},
    'RUN_IT_BACK': {'tier': 'BRONZE', 'cost': 15, 'cat': 'RESOURCE', 'is_reactive': False},
}

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
    OffensivePlay("mesh", "MESH", PlayType.SHORT, 9, 5, 0.78, 0.12, 0.01, 0.005,
        {"cover_0": {"mean": 5, "var": 4, "int": -0.01}, "cover_1": {"mean": 3, "var": 2, "int": -0.005},
         "cover_2": {"mean": 0, "var": 0, "int": 0}, "cover_3": {"mean": 1, "var": 1, "int": 0},
         "cover_4": {"mean": -1, "var": -1, "int": 0.005}, "cover_6": {"mean": 0, "var": 0, "int": 0},
         "man_free": {"mean": 4, "var": 3, "int": -0.01}}),
    OffensivePlay("four_verts", "FOUR VERTS", PlayType.DEEP, 16, 14, 0.40, 0.12, 0.045, 0.003,
        {"cover_0": {"mean": 6, "var": 5, "int": -0.02}, "cover_1": {"mean": 3, "var": 3, "int": 0.01},
         "cover_2": {"mean": 2, "var": 2, "int": 0.01}, "cover_3": {"mean": -2, "var": -2, "int": 0.02},
         "cover_4": {"mean": -4, "var": -3, "int": 0.03}, "cover_6": {"mean": 0, "var": 1, "int": 0.01},
         "man_free": {"mean": 2, "var": 3, "int": 0.01}}, min_distance=3),
    OffensivePlay("slant", "SLANT", PlayType.QUICK, 8, 4, 0.75, 0.08, 0.02, 0.005,
        {"cover_0": {"mean": 3, "var": 2, "int": -0.01}, "cover_1": {"mean": 1, "var": 1, "int": 0},
         "cover_2": {"mean": 2, "var": 1, "int": -0.005}, "cover_3": {"mean": 1, "var": 0, "int": 0},
         "cover_4": {"mean": 0, "var": 0, "int": 0}, "cover_6": {"mean": 1, "var": 0, "int": 0},
         "man_free": {"mean": 1, "var": 1, "int": 0}}),
    OffensivePlay("shallow_cross", "SHALLOW CROSS", PlayType.QUICK, 7, 3, 0.78, 0.10, 0.01, 0.005,
        {"cover_0": {"mean": 4, "var": 3, "int": -0.005}, "cover_1": {"mean": 2, "var": 1, "int": 0},
         "cover_2": {"mean": 1, "var": 1, "int": 0}, "cover_3": {"mean": 0, "var": 0, "int": 0},
         "cover_4": {"mean": 0, "var": 0, "int": 0}, "cover_6": {"mean": 1, "var": 0, "int": 0},
         "man_free": {"mean": 3, "var": 2, "int": 0}}),
    OffensivePlay("y_corner", "Y-CORNER", PlayType.DEEP, 13, 10, 0.45, 0.10, 0.035, 0.003,
        {"cover_0": {"mean": 3, "var": 2, "int": -0.01}, "cover_1": {"mean": 2, "var": 1, "int": 0},
         "cover_2": {"mean": 5, "var": 3, "int": -0.02}, "cover_3": {"mean": -1, "var": 0, "int": 0.01},
         "cover_4": {"mean": -2, "var": -1, "int": 0.015}, "cover_6": {"mean": 2, "var": 1, "int": -0.01},
         "man_free": {"mean": 1, "var": 1, "int": 0}}, min_distance=3),
    OffensivePlay("stick", "STICK", PlayType.SHORT, 7, 2, 0.78, 0.06, 0.01, 0.005,
        {"cover_0": {"mean": 2, "var": 1, "int": -0.005}, "cover_1": {"mean": 1, "var": 0, "int": 0},
         "cover_2": {"mean": 1, "var": 1, "int": 0}, "cover_3": {"mean": 0, "var": 0, "int": 0},
         "cover_4": {"mean": 0, "var": 0, "int": 0}, "cover_6": {"mean": 1, "var": 0, "int": 0},
         "man_free": {"mean": 1, "var": 1, "int": 0}}),
    OffensivePlay("go_route", "GO ROUTE", PlayType.DEEP, 20, 18, 0.38, 0.10, 0.035, 0.002,
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
    OffensivePlay("triple_option", "TRIPLE OPTION", PlayType.OPTION, 4.8, 8, None, None, None, 0.045,
        {"cover_0": {"mean": 3, "var": 3}, "cover_1": {"mean": 2, "var": 2},
         "cover_2": {"mean": 1, "var": 1}, "cover_3": {"mean": -1, "var": -1},
         "cover_4": {"mean": -2, "var": -1}, "cover_6": {"mean": 0, "var": 1},
         "man_free": {"mean": 1, "var": 1}}),
    OffensivePlay("zone_read", "ZONE READ", PlayType.OPTION, 4.5, 5, None, None, None, 0.03,
        {"cover_0": {"mean": 3, "var": 2}, "cover_1": {"mean": 2, "var": 1},
         "cover_2": {"mean": 1, "var": 1}, "cover_3": {"mean": -1, "var": 0},
         "cover_4": {"mean": -1, "var": 0}, "cover_6": {"mean": 1, "var": 1},
         "man_free": {"mean": 2, "var": 2}}),
    OffensivePlay("power", "POWER", PlayType.RUN, 5.0, 3, None, None, None, 0.025,
        {"cover_0": {"mean": -1, "var": -1}, "cover_1": {"mean": 1, "var": 0},
         "cover_2": {"mean": 2, "var": 1}, "cover_3": {"mean": -2, "var": -1},
         "cover_4": {"mean": 0, "var": 0}, "cover_6": {"mean": 1, "var": 0},
         "man_free": {"mean": 1, "var": 1}}),
    OffensivePlay("trap", "TRAP", PlayType.RUN, 4.5, 4, None, None, None, 0.015,
        {"cover_0": {"mean": 2, "var": 2}, "cover_1": {"mean": 1, "var": 1},
         "cover_2": {"mean": 1, "var": 1}, "cover_3": {"mean": -1, "var": 0},
         "cover_4": {"mean": 0, "var": 0}, "cover_6": {"mean": 0, "var": 1},
         "man_free": {"mean": 1, "var": 1}}),
    OffensivePlay("rocket_toss", "ROCKET TOSS", PlayType.RUN, 5.5, 10, None, None, None, 0.035,
        {"cover_0": {"mean": 2, "var": 2}, "cover_1": {"mean": 1, "var": 2},
         "cover_2": {"mean": 2, "var": 2}, "cover_3": {"mean": -2, "var": -1},
         "cover_4": {"mean": -1, "var": 0}, "cover_6": {"mean": 1, "var": 1},
         "man_free": {"mean": 1, "var": 1}}),
    OffensivePlay("qb_keeper", "QB KEEPER", PlayType.OPTION, 3.5, 4, None, None, None, 0.02,
        {"cover_0": {"mean": 3, "var": 3}, "cover_1": {"mean": 2, "var": 2},
         "cover_2": {"mean": 1, "var": 1}, "cover_3": {"mean": -1, "var": 0},
         "cover_4": {"mean": -1, "var": 0}, "cover_6": {"mean": 1, "var": 1},
         "man_free": {"mean": 2, "var": 2}}),
    OffensivePlay("midline", "MIDLINE", PlayType.OPTION, 3.5, 3, None, None, None, 0.022,
        {"cover_0": {"mean": 2, "var": 2}, "cover_1": {"mean": 1, "var": 1},
         "cover_2": {"mean": 1, "var": 1}, "cover_3": {"mean": -1, "var": 0},
         "cover_4": {"mean": -1, "var": 0}, "cover_6": {"mean": 0, "var": 0},
         "man_free": {"mean": 1, "var": 1}}),
    OffensivePlay("pa_flat", "PA FLAT", PlayType.SHORT, 7, 4, 0.75, 0.12, 0.02, 0.004,
        {"cover_0": {"mean": 2, "var": 1, "int": -0.01}, "cover_1": {"mean": 1, "var": 1, "int": 0},
         "cover_2": {"mean": 1, "var": 1, "int": 0}, "cover_3": {"mean": 2, "var": 2, "int": -0.005},
         "cover_4": {"mean": 1, "var": 1, "int": 0}, "cover_6": {"mean": 1, "var": 0, "int": 0},
         "man_free": {"mean": 1, "var": 1, "int": 0}}),
    OffensivePlay("pa_post", "PA POST", PlayType.DEEP, 18, 12, 0.45, 0.15, 0.045, 0.003,
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
    DefensivePlay("ct_corner_blitz", "CORNER BLITZ", DefCardType.BLITZ, "cover_0", 0.10, 0, 2, True, False,
        "Sack rate doubled vs DEEP", "+2 yds for offense (gap abandoned)", pass_mean_mod=-2, run_mean_mod=2),
    DefensivePlay("ct_safety_blitz", "SAFETY BLITZ", DefCardType.BLITZ, "cover_0", 0.06, 0, 1, True, False,
        "Extra sack pressure", "+2 yds for offense", pass_mean_mod=-1, run_mean_mod=2),
    DefensivePlay("ct_agap_mug", "A-GAP MUG", DefCardType.PRESSURE, "cover_1", 0.05, 0.01, -1, False, True,
        "DEEP +3% sack, forces quick throws", "Inside runs -2 yds", pass_mean_mod=0, run_mean_mod=-2),
    DefensivePlay("ct_fire_zone", "FIRE ZONE", DefCardType.BLITZ, "cover_3", 0.04, 0.02, -1, False, False,
        "Pressure + zone behind. Screens get 50% blitz bonus", "No run penalty (zone behind rush)", pass_mean_mod=-1, run_mean_mod=0),
    DefensivePlay("ct_db_blitz", "DB BLITZ", DefCardType.BLITZ, "cover_0", 0.12, -0.01, 3, True, False,
        "Highest sack rate. If no sack, +5 mean for offense", "+2 yds for offense (gaps abandoned)", pass_mean_mod=-3, run_mean_mod=3),
    DefensivePlay("ct_press_man", "PRESS MAN", DefCardType.PRESSURE, "man_free", 0.02, 0.015, 0, False, True,
        "SHORT/QUICK completion -8%. DEEP +2 yds for offense", "No special run effect", pass_comp_mod=-0.08, run_mean_mod=0, pass_mean_mod=2),
    DefensivePlay("ct_edge_crash", "EDGE CRASH", DefCardType.PRESSURE, "cover_1", 0.04, 0, -2, False, True,
        "Standard pressure", "OPTION plays -4 yds, edge crash contains", pass_mean_mod=0, run_mean_mod=-4),
    DefensivePlay("ct_zone_blitz_drop", "ZONE BLITZ DROP", DefCardType.HYBRID, "cover_2", 0.03, 0.04, 0, False, False,
        "Disguise. PA gets -2 yds", "No run penalty (zone drops read run)", pass_mean_mod=-1, run_mean_mod=0),
    DefensivePlay("ct_overload_blitz", "OVERLOAD BLITZ", DefCardType.BLITZ, "cover_1", 0.07, 0, 2, True, True,
        "Heavy pressure from one side", "+3 yds if offense runs away from overload", pass_mean_mod=-2, run_mean_mod=2),
    DefensivePlay("ct_prevent", "PREVENT", DefCardType.ZONE, "cover_4", -0.04, 0.05, 3, False, False,
        "DEEP -6 mean, +3% INT. SHORT/QUICK +4 mean", "Runs +3 yds (everyone deep)", pass_mean_mod=0, run_mean_mod=3),
]

# IRON RIDGE DEFENSIVE PLAYS
IR_DEF_PLAYS = [
    DefensivePlay("ir_robber", "ROBBER", DefCardType.HYBRID, "cover_1", 0.01, 0.04, 0, False, True,
        "MESH/SLANT/SHALLOW +4% INT. Disguised as Cover 2", "No special run effect", pass_mean_mod=-1, run_mean_mod=0),
    DefensivePlay("ir_bracket", "BRACKET", DefCardType.ZONE, "cover_2", 0, 0.03, -1, False, True,
        "Featured player -3 mean, +4% INT", "No special run effect", pass_mean_mod=-5, run_mean_mod=0),
    DefensivePlay("ir_qb_spy", "QB SPY", DefCardType.HYBRID, "cover_3", 0, 0, -1, False, False,
        "No special pass effect", "QB KEEPER/ZONE READ -4 yds, OPTION -2 yds", pass_mean_mod=0, run_mean_mod=-2),
    DefensivePlay("ir_gap_integrity", "GAP INTEGRITY", DefCardType.ZONE, "cover_3", 0, 0, -4, False, False,
        "Pass +2 mean (light rush)", "ALL runs -3 mean, variance -2", pass_mean_mod=2, run_mean_mod=-3),
    DefensivePlay("ir_cover2_buc", "COVER 2 BUC", DefCardType.ZONE, "cover_2", 0, 0.01, -1, False, False,
        "SEAM/POST -3 mean. CORNER +2 mean", "No special run effect", pass_mean_mod=-1, run_mean_mod=0, pass_comp_mod=-0.04),
    DefensivePlay("ir_mod", "MOD", DefCardType.ZONE, "cover_4", -0.02, 0.01, -1, False, False,
        "FOUR VERTS/GO -4 mean, +3% INT. SHORT +2 mean", "No special run effect", pass_mean_mod=-2, run_mean_mod=0),
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
        # Extreme red zone
        if play.play_type == PlayType.DEEP:
            max_yards = min(max_yards, yards_to_endzone)
        if is_run_type(play.play_type) or play.play_type == PlayType.RUN:
            mean -= 0.5 # reduced from -1
        if play.id in ("qb_sneak", "ir_qb_sneak"):
            mean += 1.5 # increased from +1
        mean -= 0.5 # universal squeeze reduced from -1
        variance = max(1, variance - 2)
    elif yards_to_endzone <= 10:
        if play.play_type == PlayType.DEEP:
            max_yards = min(max_yards, 12)
        mean -= 1  # softened from -2
        variance = max(1, variance - 1)
    elif yards_to_endzone <= 20:
        if play.play_type == PlayType.DEEP:
            max_yards = min(max_yards, 20)
        mean -= 0.5  # softened from -1
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
                  is_conversion: bool = False, score_diff: int = 0,
                  off_card: str = None, def_card: str = None,
                  two_min_active: bool = False) -> SnapResult:
    """score_diff: positive means offense is trailing (needs comeback)"""
    
    result = SnapResult()
    is_pass = off_play.completion_rate is not None
    is_run = not is_pass
    is_3rd_4th = down >= 3
    is_4th = down == 4
    
    # === PRE-SNAP MODIFIERS (PRE-ROLL) ===
    
    # Desperation bonus on 4th down: +1 mean yard
    desperation_bonus = 1 if is_4th else 0
    
    # PRIME TIME (SILVER): Featured player OVR counts as 99
    if off_card == 'PRIME_TIME':
        featured_off = Player(featured_off.name, featured_off.pos, 99, featured_off.badge)
    if def_card == 'PRIME_TIME':
        featured_def = Player(featured_def.name, featured_def.pos, 99, featured_def.badge)

    # ICE (BRONZE): Opponent featured player provides zero OVR bonus and no badge combo
    opponent_ice_off = (def_card == 'ICE')
    opponent_ice_def = (off_card == 'ICE')

    # HURRY UP (BRONZE): +2 mean yards (2-min drill only)
    hurry_up_bonus = 2 if (off_card == 'HURRY_UP' and two_min_active) else 0

    # 12TH MAN (BRONZE): +4 yards
    twelfth_man_bonus = 4 if off_card == '12TH_MAN' else 0

    # FILM LEAK (GOLD): Opponent play revealed, -3 mean yards
    film_leak_penalty = 3 if def_card == 'FILM_LEAK' else 0

    # FAKE KNEEL (SILVER): +6 mean yards (2-min only)
    fake_kneel_bonus = 6 if (off_card == 'FAKE_KNEEL' and two_min_active) else 0

    # Trailing team bonus (Increased for better balance)
    trailing_bonus = 0
    trailing_var_boost = 0
    if score_diff >= 14:
        trailing_bonus = 3
        trailing_var_boost = 4
    elif score_diff >= 7:
        trailing_bonus = 2
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
        if def_play.is_cover0_blitz:
            mean += 3
    else:
        if def_play.id in ("ct_press_man", "ir_press_man") and off_play.play_type == PlayType.DEEP:
            mean += 2
    
    # Badge combos
    off_yard_bonus, off_pt_bonus = (0, 0)
    if not opponent_ice_off:
        off_yard_bonus, off_pt_bonus = check_offensive_badge_combo(
            featured_off.badge, off_play, is_3rd_4th, is_conversion)
    
    def_yard_mod, def_pt_bonus = (0, 0)
    if not opponent_ice_def:
        def_yard_mod, def_pt_bonus = check_defensive_badge_combo(
            featured_def.badge, def_play, off_play)
    
    # DOUBLE MOVE (SILVER): Triggers as TWO play types for combos
    if off_card == 'DOUBLE_MOVE':
        # Sim: add a flat bonus representing the increased combo chance
        off_yard_bonus += 2; off_pt_bonus += 10

    result.off_combo_yards = off_yard_bonus
    result.def_combo_yards = def_yard_mod
    result.off_combo_pts = off_pt_bonus
    result.def_combo_pts = def_pt_bonus
    
    mean += off_yard_bonus + def_yard_mod + hurry_up_bonus + twelfth_man_bonus + fake_kneel_bonus + desperation_bonus - film_leak_penalty
    
    # Play history
    history_bonus = get_play_history_bonus(play_history, off_play)
    result.history_bonus = history_bonus
    mean += history_bonus
    
    # OVR modifiers
    # Sim ICE: if opponent iced you, your featured player contributes 0 to ovr_mods
    effective_featured_off = featured_off if not opponent_ice_off else None
    effective_featured_def = featured_def if not opponent_ice_def else None
    ovr_mods = apply_squad_ovr(off_players, def_players, off_play, effective_featured_off, effective_featured_def)
    mean += ovr_mods["mean_mod"]
    
    # Red zone
    mean, variance, max_yards = apply_red_zone(yards_to_endzone, mean, variance, off_play)
    
    # Apply trailing team bonus (more aggressive = higher mean + variance)
    mean += trailing_bonus
    variance += trailing_var_boost
    
    # === PASS PLAY RESOLUTION ===
    if is_pass:
        # Sack check
        sack_rate = off_play.sack_rate + def_play.sack_rate_bonus + ovr_mods["sack_mod"]
        if off_play.play_type == PlayType.DEEP and def_play.id in ("ct_corner_blitz",):
            sack_rate *= 2
        if def_play.pass_mean_mod < 0 and def_play.sack_rate_bonus >= 0.03:
            sack_rate += 0.03
        if yards_to_endzone <= 20:
            sack_rate += 0.02
        if yards_to_endzone <= 10:
            sack_rate += 0.02
        sack_rate += 0.02
        sack_rate = max(0, min(0.30, sack_rate))
        
        if random.random() < sack_rate:
            result.is_sack = True
            result.yards = random.randint(-10, -4)
            if ball_position + result.yards <= 0:
                result.is_safety = True
                result.yards = 0
            result.description = f"SACK! {featured_off.name} goes down."
            return result
        
        # Completion check
        comp_rate = off_play.completion_rate + ovr_mods["comp_mod"] + def_play.pass_comp_mod
        
        # SURE HANDS (GOLD): 0 drops (100% completion cap for sim purpose)
        if off_card == 'SURE_HANDS': comp_rate = 1.0

        # Bad matchup completion penalty
        if cov_mean <= -2:
            comp_rate -= 0.08
        elif cov_mean <= -1:
            comp_rate -= 0.04
        if yards_to_endzone <= 10:
            comp_rate -= 0.05
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
        int_rate -= 0.005
        if def_play.id == "ir_robber" and off_play.id in ("mesh", "slant", "shallow_cross"):
            int_rate += 0.04
        if def_play.id == "ir_mod" and off_play.id in ("four_verts", "go_route"):
            int_rate += 0.03
        if featured_def.badge == Badge.EYE and (off_play.id in ("pa_flat", "pa_post") or off_play.play_type == PlayType.OPTION):
            int_rate += 0.02
        int_rate = max(0, min(0.20, int_rate))
        
        if random.random() < int_rate:
            # SURE HANDS (GOLD): Cancel interception
            if off_card == 'SURE_HANDS':
                result.description = "SURE HANDS: Receiver rips the ball back from the DB!"
                result.is_complete = False; result.yards = 0; return result

            result.is_interception = True
            result.is_complete = False
            result.yards = 0
            result.description = f"INTERCEPTED! {featured_def.name} jumps the route!"
            return result
        
        # Fumble after catch
        if random.random() < off_play.fumble_rate:
            # SURE HANDS (GOLD): Cancel fumble
            if off_card == 'SURE_HANDS': 
                result.description = "SURE HANDS: Ball popped out but he recovered immediately!"
                return result
            
            result.is_fumble = True
            result.is_fumble_lost = random.random() < 0.5
            if result.is_fumble_lost:
                result.description = f"FUMBLE! {featured_off.name} coughs it up! Defense recovers!"
            else:
                result.description = f"Fumble by {featured_off.name} but offense recovers!"
        
    # === RUN PLAY RESOLUTION ===
    else:
        # Stuff rate check: LOWERED from 0.30 to 0.20
        stuff_rate = 0.20
        if def_play.run_def_mod < -2: stuff_rate += 0.10
        elif def_play.run_def_mod < 0: stuff_rate += 0.05
        if def_play.is_cover0_blitz: stuff_rate -= 0.12
        if cov_mean <= -2: stuff_rate += 0.08
        elif cov_mean <= -1: stuff_rate += 0.04
        if yards_to_endzone <= 10: stuff_rate += 0.08
        elif yards_to_endzone <= 20: stuff_rate += 0.04
        
        # SCOUT TEAM (GOLD): SIM as +8% stuff rate for sim purposes if provided on defense
        if def_card == 'SCOUT_TEAM': stuff_rate += 0.08
        
        stuff_rate = max(0.05, min(0.50, stuff_rate))
        
        if random.random() < stuff_rate:
            # Stuffed
            result.yards = random.randint(-2, 1)
            if ball_position + result.yards <= 0:
                result.is_safety = True
                result.yards = 0
            if result.yards <= 0:
                result.description = f"STUFFED! {featured_off.name} hit in the backfield."
            else:
                result.description = f"{featured_off.name} squeezed for {result.yards}."
            
            # Higher fumble rate on stuffs
            if random.random() < off_play.fumble_rate * 1.5:
                # SURE HANDS (GOLD): Cancel fumble
                if off_card == 'SURE_HANDS': return result
                
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
        
        # Fumble
        run_fumble_rate = off_play.fumble_rate + 0.005
        if random.random() < run_fumble_rate:
            # SURE HANDS (GOLD): Cancel fumble
            if off_card == 'SURE_HANDS': return result
            
            result.is_fumble = True
            result.is_fumble_lost = random.random() < 0.5
            if result.is_fumble_lost:
                result.description = f"FUMBLE! Ball on the ground! Defense has it!"
            else:
                result.description = f"Fumble but {featured_off.name} falls on it."
    
    # === POST-SNAP OVERRIDES (REACTIVE SIM) ===
    
    # TO THE HOUSE (GOLD): Turnover becomes TD
    if def_card == 'TO_THE_HOUSE' and (result.is_interception or result.is_fumble_lost):
        result.is_touchdown = True
        result.yards = yards_to_endzone
        result.description = "TO THE HOUSE: Defensive touchdown on the return!"

    # FLAG ON THE PLAY (SILVER): 75% chance to negate big gain
    if def_card == 'FLAG_ON_THE_PLAY' and result.yards >= 10 and not result.is_touchdown:
        if random.random() < 0.75:
            result.yards = 0
            result.description = "FLAG ON THE PLAY: Gain nullified by penalty."

    # CHALLENGE FLAG (SILVER): SIM as 75% chance to overturn turnover/failed conversion
    if off_card == 'CHALLENGE_FLAG' and (result.is_interception or result.is_fumble_lost or (is_conversion and not result.is_touchdown)):
        if random.random() < 0.75:
            result.is_interception = False; result.is_fumble_lost = False; result.is_touchdown = is_conversion
            result.yards = 0 if not is_conversion else yards_to_endzone
            result.description = "CHALLENGE FLAG: Play overturned by booth review!"

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

def halftime_booster(current_pts: int, difficulty: Difficulty, is_human: bool) -> List[str]:
    """Simulate the Booster shop offering 3 random cards."""
    # 50% Bronze, 35% Silver, 15% Gold
    pool = list(TORCH_CARDS.keys())
    weights = [50 if TORCH_CARDS[k]['tier'] == 'BRONZE' else 35 if TORCH_CARDS[k]['tier'] == 'SILVER' else 15 for k in pool]
    
    offers = random.choices(pool, weights=weights, k=3)
    purchased = []
    
    if is_human and difficulty != Difficulty.RANDOM:
        # Human sim: 50% chance to buy best card if affordable
        affordable = [o for o in offers if TORCH_CARDS[o]['cost'] <= current_pts]
        if affordable and random.random() < 0.5:
            purchased.append(max(affordable, key=lambda x: TORCH_CARDS[x]['cost']))
    else:
        if difficulty == Difficulty.RANDOM:
            # Random AI: 50% chance to buy random affordable card
            affordable = [o for o in offers if TORCH_CARDS[o]['cost'] <= current_pts]
            if affordable and random.random() < 0.5:
                purchased.append(random.choice(affordable))
        elif difficulty == Difficulty.MEDIUM:
            # Medium AI: Buys 1 cheapest card
            affordable = [o for o in offers if TORCH_CARDS[o]['cost'] <= current_pts]
            if affordable:
                purchased.append(min(affordable, key=lambda x: TORCH_CARDS[x]['cost']))
        elif difficulty == Difficulty.HARD:
            # Hard AI: Buys 2 best-value (expensive) cards
            affordable = [o for o in offers if TORCH_CARDS[o]['cost'] <= current_pts]
            if affordable:
                affordable.sort(key=lambda x: TORCH_CARDS[x]['cost'], reverse=True)
                purchased = affordable[:2]
                
    return purchased

# ============================================================
# AI PLAY SELECTION
# ============================================================

def ai_select_play(hand: List, play_type: str, difficulty: Difficulty,
                   down: int, distance: int, ball_pos: int, 
                   play_history: List[PlayType], score_diff: int,
                   clock_seconds: int = None, is_human: bool = False,
                   opp_play: object = None) -> object:
    """Select a play card for AI. play_type is 'offense' or 'defense'
    is_human simulates an average human player: follows basic football logic,
    sometimes picks badge combos, but makes suboptimal choices ~30% of the time.
    opp_play: if provided (via FILM LEAK), AI picks the mathematically best counter."""
    
    available = [p for p in hand]
    
    if difficulty == Difficulty.RANDOM:
        return random.choice(available)

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

        # OPTIMAL COUNTER (FILM LEAK)
        if opp_play and not is_human:
            # Pick play with highest mean vs this coverage
            return max(filtered, key=lambda p: p.mean + p.coverage_mods.get(opp_play.base_coverage, {}).get("mean", 0))
        
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
        # OPTIMAL COUNTER (FILM LEAK)
        if opp_play and not is_human:
            # Pick defense with lowest mean against this offensive play
            return min(available, key=lambda p: opp_play.coverage_mods.get(p.base_coverage, {}).get("mean", 0) + p.run_mean_mod if is_run_type(opp_play.play_type) else opp_play.coverage_mods.get(p.base_coverage, {}).get("mean", 0) + p.pass_mean_mod)

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
    """Select featured player based on situational value and OVR."""
    available = [p for p in roster[:4] if p.is_available()]
    if not available:
        available = [p for p in roster if p.is_available()]
    
    if difficulty == Difficulty.RANDOM:
        return random.choice(available)
    
    if is_offense:
        # Offense: prioritize badge combo bonus
        best = None
        best_bonus = -1
        for p in available:
            # Check for 3rd/4th down since Flame badge triggers there
            bonus, _ = check_offensive_badge_combo(p.badge, play, True, False)
            if bonus > best_bonus:
                best_bonus = bonus
                best = p
            elif bonus == best_bonus:
                if best is None or p.ovr > best.ovr:
                    best = p
        return best or max(available, key=lambda x: x.ovr)
    
    else:
        # Defense: situationally pick best defender
        is_pass = play.completion_rate is not None if hasattr(play, 'completion_rate') else False
        if is_pass:
            # Secondary/Safeties better for pass
            dbs = [p for p in available if p.pos in ('CB', 'S')]
            if dbs: return max(dbs, key=lambda x: x.ovr)
        else:
            # Linebackers better for run
            lbs = [p for p in available if p.pos == 'LB']
            if lbs: return max(lbs, key=lambda x: x.ovr)
            
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
# BOX SCORE DATA
# ============================================================

@dataclass
class PlayerStats:
    pass_att: int = 0
    pass_comp: int = 0
    pass_yds: int = 0
    pass_tds: int = 0
    pass_ints: int = 0
    rush_att: int = 0
    rush_yds: int = 0
    rush_tds: int = 0
    rush_long: int = 0
    rec_att: int = 0
    rec_caught: int = 0
    rec_yds: int = 0
    rec_tds: int = 0
    rec_long: int = 0

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
    ct_total_plays: int = 0
    ir_total_plays: int = 0
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
    
    # DETAILED TEAM STATS
    ct_pass_att: int = 0
    ct_pass_comp: int = 0
    ct_pass_yds: int = 0
    ct_rush_att: int = 0
    ct_rush_yds: int = 0
    ir_pass_att: int = 0
    ir_pass_comp: int = 0
    ir_pass_yds: int = 0
    ir_rush_att: int = 0
    ir_rush_yds: int = 0
    
    ct_third_att: int = 0
    ct_third_conv: int = 0
    ir_third_att: int = 0
    ir_third_conv: int = 0
    ct_fourth_att: int = 0
    ct_fourth_conv: int = 0
    ir_fourth_att: int = 0
    ir_fourth_conv: int = 0
    
    # TORCH PLAY TRACKING
    ct_torch_plays: int = 0
    ct_torch_yards: int = 0
    ir_torch_plays: int = 0
    ir_torch_yards: int = 0
    
    # OFFENSIVE PLAY TRACKING (Play ID -> (Calls, Yards))
    play_stats: Dict[str, List[int]] = field(default_factory=dict)
    
    # Player Stats Maps
    player_stats: Dict[str, PlayerStats] = field(default_factory=dict)
    
    # TORCH CARDS INVENTORY
    ct_inventory: List[str] = field(default_factory=list)
    ir_inventory: List[str] = field(default_factory=list)
    
    # TORCH CARD USAGE TRACKING (Card ID -> (Used, Won))
    card_stats: Dict[str, List[int]] = field(default_factory=lambda: {k: [0, 0] for k in TORCH_CARDS.keys()})
    
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
    
    # Track playbook for Trade Deadline
    ct_playbook = CT_OFF_PLAYS[:]
    ir_playbook = IR_OFF_PLAYS[:]
    
    # Coin Toss: Starting Cards
    if not cpu_vs_cpu:
        # Hard AI starts with random Silver, Medium with Bronze
        if difficulty == Difficulty.HARD:
            gs.ir_inventory.append(random.choice([k for k, v in TORCH_CARDS.items() if v['tier'] == 'SILVER']))
        elif difficulty == Difficulty.MEDIUM:
            gs.ir_inventory.append(random.choice([k for k, v in TORCH_CARDS.items() if v['tier'] == 'BRONZE']))
        # Human (sim) always takes a Bronze
        gs.ct_inventory.append(random.choice([k for k, v in TORCH_CARDS.items() if v['tier'] == 'BRONZE']))
    
    # Receive kickoff
    gs.possession = "IR" if cpu_vs_cpu else cpu_team
    gs.ball_position = 50
    gs.ir_drives = 1 if gs.possession == "IR" else 0
    gs.ct_drives = 1 if gs.possession == "CT" else 0
    
    for half in range(1, 3):
        gs.half = half
        gs.plays_used = 0
        gs.two_min_active = False
        gs.clock_seconds = 120
        
        if half == 2:
            # Halftime Booster Shop
            for team_abbr in ["CT", "IR"]:
                pts = gs.ct_torch_pts if team_abbr == "CT" else gs.ir_torch_pts
                inv = gs.ct_inventory if team_abbr == "CT" else gs.ir_inventory
                is_human = (team_abbr == human_team and not cpu_vs_cpu)
                
                buys = halftime_booster(pts, difficulty, is_human)
                for b in buys:
                    if len(inv) < 3:
                        inv.append(b)
                        if team_abbr == "CT": gs.ct_torch_pts -= TORCH_CARDS[b]['cost']
                        else: gs.ir_torch_pts -= TORCH_CARDS[b]['cost']
            
            gs.flip_possession(50)
        
        while True:
            old_ct, old_ir = gs.ct_score, gs.ir_score
            
            if not gs.two_min_active and gs.plays_used >= gs.plays_per_half:
                gs.two_min_active = True
                gs.clock_seconds = 120
            
            if gs.two_min_active and gs.clock_seconds <= 0:
                break
            
            # Determine hands
            if gs.possession == "CT":
                off_hand, def_hand = ct_playbook[:], IR_DEF_PLAYS[:]
                off_players, def_players = CT_OFFENSE, IR_DEFENSE
                off_inv, def_inv = gs.ct_inventory, gs.ir_inventory
            else:
                off_hand, def_hand = ir_playbook[:], CT_DEF_PLAYS[:]
                off_players, def_players = IR_OFFENSE, CT_DEFENSE
                off_inv, def_inv = gs.ir_inventory, gs.ct_inventory
            
            # Select Torch Cards for this snap
            off_card = None; def_card = None
            
            if difficulty == Difficulty.RANDOM:
                # 20% chance to use a card if available
                if off_inv and random.random() < 0.20:
                    off_card = off_inv.pop(random.randint(0, len(off_inv)-1))
                    gs.card_stats[off_card][0] += 1
                if def_inv and random.random() < 0.20:
                    def_card = def_inv.pop(random.randint(0, len(def_inv)-1))
                    gs.card_stats[def_card][0] += 1
            else:
                # AI Usage Logic: Prioritize Gold/Silver on 3rd/4th
                if off_inv and (gs.down >= 3 or gs.two_min_active):
                    off_card = off_inv.pop(0)
                    gs.card_stats[off_card][0] += 1
                if def_inv and (gs.down >= 3 or gs.two_min_active):
                    def_card = def_inv.pop(0)
                    gs.card_stats[def_card][0] += 1

            # === STATE MANIPULATORS (PRE-SNAP) ===
            
            # TRADE DEADLINE: Steal a play
            if off_card == 'TRADE_DEADLINE':
                if gs.possession == "CT" and ir_playbook:
                    p = ir_playbook.pop(random.randint(0, len(ir_playbook)-1))
                    ct_playbook.append(p)
                elif gs.possession == "IR" and ct_playbook:
                    p = ct_playbook.pop(random.randint(0, len(ct_playbook)-1))
                    ir_playbook.append(p)

            # Select plays
            offense_is_human = (gs.possession == human_team and not cpu_vs_cpu)
            defense_is_human = (gs.possession != human_team and not cpu_vs_cpu)
            
            def_play = ai_select_play(def_hand, "defense", difficulty,
                gs.down, gs.distance, gs.ball_position,
                gs.drive_play_history, 0, is_human=defense_is_human)

            # DOUBLE DOWN: AI picks 2 plays and uses the best one
            if off_card == 'DOUBLE_DOWN':
                off_play1 = ai_select_play(off_hand, "offense", difficulty, gs.down, gs.distance, gs.ball_position, gs.drive_play_history, 0, is_human=offense_is_human)
                off_play2 = ai_select_play(off_hand, "offense", difficulty, gs.down, gs.distance, gs.ball_position, gs.drive_play_history, 0, is_human=offense_is_human)
                
                featured_off1 = ai_select_player(off_players, off_play1, difficulty, True, is_human=offense_is_human)
                featured_off2 = ai_select_player(off_players, off_play2, difficulty, True, is_human=offense_is_human)
                featured_def = ai_select_player(def_players, def_play, difficulty, False, is_human=defense_is_human)
                
                score_diff = (gs.ir_score - gs.ct_score) if gs.possession == "CT" else (gs.ct_score - gs.ir_score)
                res1 = resolve_snap(off_play1, def_play, featured_off1, featured_def, off_players, def_players, gs.drive_play_history, gs.yards_to_endzone(), gs.ball_position, gs.down, gs.distance, off_card=off_card, def_card=def_card, two_min_active=gs.two_min_active, score_diff=score_diff)
                res2 = resolve_snap(off_play2, def_play, featured_off2, featured_def, off_players, def_players, gs.drive_play_history, gs.yards_to_endzone(), gs.ball_position, gs.down, gs.distance, off_card=off_card, def_card=def_card, two_min_active=gs.two_min_active, score_diff=score_diff)
                
                # Keep the better result
                if res1.is_touchdown or res1.yards > res2.yards:
                    result, off_play, featured_off = res1, off_play1, featured_off1
                else:
                    result, off_play, featured_off = res2, off_play2, featured_off2
            else:
                # Normal play selection
                off_play = ai_select_play(off_hand, "offense", difficulty, gs.down, gs.distance, gs.ball_position, gs.drive_play_history, 0, is_human=offense_is_human)
                
                # Reveal Card Sim-Benefits
                reveal_bonus = 0
                if off_card in ('SCOUT_TEAM', 'FILM_LEAK', 'SIDELINE_PHONE', 'PERSONNEL_REPORT'):
                    # AI re-selects with optimal counter (representing reveal advantage)
                    off_play = ai_select_play(off_hand, "offense", difficulty, gs.down, gs.distance, gs.ball_position, gs.drive_play_history, 0, opp_play=def_play)
                    reveal_bonus = 1 # Passive +1 yard sim benefit for information

                featured_off = ai_select_player(off_players, off_play, difficulty, True, is_human=offense_is_human)
                featured_def = ai_select_player(def_players, def_play, difficulty, False, is_human=defense_is_human)
                
                score_diff = (gs.ir_score - gs.ct_score) if gs.possession == "CT" else (gs.ct_score - gs.ir_score)
                result = resolve_snap(off_play, def_play, featured_off, featured_def,
                    off_players, def_players, gs.drive_play_history,
                    gs.yards_to_endzone(), gs.ball_position, gs.down, gs.distance,
                    False, score_diff=score_diff, off_card=off_card, def_card=def_card, two_min_active=gs.two_min_active)
                
                if reveal_bonus and not result.is_incomplete and not result.is_sack:
                    result.yards += reveal_bonus
            
            # TRACK PLAY STATS
            if off_play.id not in gs.play_stats:
                gs.play_stats[off_play.id] = [0, 0] # [Calls, Yards]
            gs.play_stats[off_play.id][0] += 1
            gs.play_stats[off_play.id][1] += result.yards
            
            # === TRACK BOX SCORE STATS ===
            pos = gs.possession
            # Ensure player stats objects exist
            for p in off_players:
                if p.name not in gs.player_stats: gs.player_stats[p.name] = PlayerStats()
            
            # Find QB for passing stats
            qb = next(p for p in off_players if p.pos == "QB")
            qbs = gs.player_stats[qb.name]
            pfs = gs.player_stats[featured_off.name]
            
            is_pass = off_play.completion_rate is not None
            
            if pos == "CT":
                if gs.down == 3: gs.ct_third_att += 1
                if gs.down == 4: gs.ct_fourth_att += 1
                if is_pass:
                    gs.ct_pass_att += 1
                    qbs.pass_att += 1
                    pfs.rec_att += 1
                    if result.is_complete:
                        gs.ct_pass_comp += 1
                        gs.ct_pass_yds += result.yards
                        qbs.pass_comp += 1
                        qbs.pass_yds += result.yards
                        pfs.rec_caught += 1
                        pfs.rec_yds += result.yards
                        pfs.rec_long = max(pfs.rec_long, result.yards)
                        if result.is_touchdown: 
                            qbs.pass_tds += 1
                            pfs.rec_tds += 1
                    if result.is_interception:
                        qbs.pass_ints += 1
                else:
                    gs.ct_rush_att += 1
                    pfs.rush_att += 1
                    gs.ct_rush_yds += result.yards
                    pfs.rush_yds += result.yards
                    pfs.rush_long = max(pfs.rush_long, result.yards)
                    if result.is_touchdown: pfs.rush_tds += 1
            else:
                if gs.down == 3: gs.ir_third_att += 1
                if gs.down == 4: gs.ir_fourth_att += 1
                if is_pass:
                    gs.ir_pass_att += 1
                    qbs.pass_att += 1
                    pfs.rec_att += 1
                    if result.is_complete:
                        gs.ir_pass_comp += 1
                        gs.ir_pass_yds += result.yards
                        qbs.pass_comp += 1
                        qbs.pass_yds += result.yards
                        pfs.rec_caught += 1
                        pfs.rec_yds += result.yards
                        pfs.rec_long = max(pfs.rec_long, result.yards)
                        if result.is_touchdown: 
                            qbs.pass_tds += 1
                            pfs.rec_tds += 1
                    if result.is_interception:
                        qbs.pass_ints += 1
                else:
                    gs.ir_rush_att += 1
                    pfs.rush_att += 1
                    gs.ir_rush_yds += result.yards
                    pfs.rush_yds += result.yards
                    pfs.rush_long = max(pfs.rush_long, result.yards)
                    if result.is_touchdown: pfs.rush_tds += 1

            # 12TH MAN: Double TORCH points on this snap
            torch_mult = 2 if off_card == '12TH_MAN' else 1
            
            gs.total_plays += 1; gs._drive_plays += 1
            if gs.possession == "CT": gs.ct_total_plays += 1
            else: gs.ir_total_plays += 1
            
            if not gs.two_min_active: gs.plays_used += 1
            gs.drive_play_history.append(off_play.play_type)
            
            # TRACK TORCH PLAYS
            if off_card or def_card:
                if gs.possession == "CT":
                    gs.ct_torch_plays += 1
                    gs.ct_torch_yards += result.yards
                else:
                    gs.ir_torch_plays += 1
                    gs.ir_torch_yards += result.yards
            
            # TRICK PLAY: Double points on 10+ yards
            if off_card == 'TRICK_PLAY' and result.yards >= 10: torch_mult *= 2

            # Track moments
            if result.yards >= 15: gs.explosive_plays += 1
            if result.yards >= 10: gs.big_plays += 1
            if abs(result.yards) > gs.max_play_yards: gs.max_play_yards = abs(result.yards)
            if result.off_combo_pts > 0 or result.def_combo_pts > 0: gs.badge_combos_fired += 1
            if result.history_bonus != 0: gs.history_bonuses_fired += 1
            if result.is_incomplete:
                if gs.possession == "CT": gs.ct_incompletions += 1
                else: gs.ir_incompletions += 1
            
            # ONSIDE KICK (Reactive Sim)
            if result.is_touchdown and off_card == 'ONSIDE_KICK':
                if random.random() < 0.35:
                    # Keep ball at 50
                    gs.ball_position = 50; gs.down = 1; gs.distance = 10
                    if verbose: print("  ONSIDE KICK RECOVERED!")
                    continue
            
            # 2-minute clock
            if gs.two_min_active:
                if result.is_incomplete:
                    gs.clock_seconds -= 5
                elif result.is_sack:
                    gs.clock_seconds -= 20
                else:
                    gs.clock_seconds -= random.randint(25, 30)
            
            # TORCH points
            off_pts = calc_torch_pts_offense(result, False) * torch_mult
            def_pts = calc_torch_pts_defense(result, False)
            
            old_ct, old_ir = gs.ct_score, gs.ir_score
            
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
                
                # Conversion
                conv_roll = random.random()
                if conv_roll < 0.65:
                    if scoring_team == "CT": gs.ct_score += 1
                    else: gs.ir_score += 1
                elif conv_roll < 0.85:
                    gs.conversion_attempts_2pt += 1
                    if random.random() < 0.52:
                        gs.conversion_made_2pt += 1
                        if scoring_team == "CT": gs.ct_score += 2
                        else: gs.ir_score += 2
                elif conv_roll < 1.0:
                    gs.conversion_attempts_3pt += 1
                    if random.random() < 0.33:
                        gs.conversion_made_3pt += 1
                        if scoring_team == "CT": gs.ct_score += 3
                        else: gs.ir_score += 3
                
                gs.check_lead_change(old_ct, old_ir)
                gs.flip_possession(50)
                continue
            
            # Down and distance
            gs.ball_position = max(1, min(99, gs.ball_position))
            
            if result.yards >= gs.distance:
                if pos == "CT":
                    if gs.down == 3: gs.ct_third_conv += 1
                    if gs.down == 4: gs.ct_fourth_conv += 1
                else:
                    if gs.down == 3: gs.ir_third_conv += 1
                    if gs.down == 4: gs.ir_fourth_conv += 1
                
                gs.down = 1
                gs.distance = min(10, gs.yards_to_endzone())
                if gs.possession == "CT":
                    gs.ct_first_downs += 1
                    gs.ct_torch_pts += 10
                else:
                    gs.ir_first_downs += 1
                    gs.ir_torch_pts += 10
            else:
                gs.distance -= max(0, result.yards)
                gs.down += 1
                
                if gs.down > 4:
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
                        if severity < 0.5: injured.injury_snaps_remaining = random.randint(2, 3)
                        elif severity < 0.85: injured.injury_snaps_remaining = 20
                        else: injured.injury_snaps_remaining = 100
            
            for roster in [CT_OFFENSE, CT_DEFENSE, IR_OFFENSE, IR_DEFENSE]:
                for p in roster:
                    if p.injured and p.injury_snaps_remaining > 0:
                        p.injury_snaps_remaining -= 1
                        if p.injury_snaps_remaining <= 0: p.injured = False
            
            if verbose:
                side = gs.possession
                h_marker = "🎮" if (side == human_team) else "🤖"
                print(f"  P{gs.total_plays} | {gs.down}&{gs.distance} @ {gs.ball_position} | "
                      f"{h_marker}{side}: {off_play.name} vs {def_play.name} | {result.description}")

            if gs.total_plays > 150:
                break
    
    if gs.ct_score > gs.ir_score: gs.ct_torch_pts += 100
    elif gs.ir_score > gs.ct_score: gs.ir_torch_pts += 100
    
    margin = abs(gs.ct_score - gs.ir_score)
    if margin <= 8: gs.one_score_finishes += 1
    if margin >= 21: gs.blowouts += 1
    if gs.ct_score == 0 or gs.ir_score == 0: gs.shutouts += 1
    
    winner = "CT" if gs.ct_score > gs.ir_score else "IR" if gs.ir_score > gs.ct_score else "TIE"
    if winner != "TIE" and gs._ever_trailing.get(winner, False): gs.comeback_wins += 1
    
    return gs

def print_box_score(gs: GameState):
    print(f"\n{'='*60}")
    print(f"FINAL BOX SCORE: {'CANYON TECH' if gs.ct_score > gs.ir_score else 'IRON RIDGE'} WINS {gs.ct_score}-{gs.ir_score}")
    print(f"{'='*60}")
    
    print(f"\nTEAM STATS")
    print(f"{'':30} {'CT':>10} {'IR':>10}")
    print(f"{'-'*52}")
    print(f"{'1st Downs':30} {gs.ct_first_downs:>10} {gs.ir_first_downs:>10}")
    print(f"{'3rd down efficiency':30} {gs.ct_third_conv:>2}-{gs.ct_third_att:<2} {gs.ir_third_conv:>2}-{gs.ir_third_att:<2}")
    print(f"{'4th down efficiency':30} {gs.ct_fourth_conv:>2}-{gs.ct_fourth_att:<2} {gs.ir_fourth_conv:>2}-{gs.ir_fourth_att:<2}")
    print(f"{'Total Yards':30} {gs.ct_total_yards:>10} {gs.ir_total_yards:>10}")
    
    cp = f"{gs.ct_pass_comp}/{gs.ct_pass_att}"
    ip = f"{gs.ir_pass_comp}/{gs.ir_pass_att}"
    print(f"{'Passing':30} {gs.ct_pass_yds:>10} {gs.ir_pass_yds:>10}")
    print(f"{'  Comp/Att':30} {cp:>10} {ip:>10}")
    
    print(f"{'Rushing':30} {gs.ct_rush_yds:>10} {gs.ir_rush_yds:>10}")
    print(f"{'  Rushing Attempts':30} {gs.ct_rush_att:>10} {gs.ir_rush_att:>10}")
    
    ct_avg_r = (gs.ct_rush_yds / gs.ct_rush_att) if gs.ct_rush_att else 0
    ir_avg_r = (gs.ir_rush_yds / gs.ir_rush_att) if gs.ir_rush_att else 0
    print(f"{'  Yards per rush':30} {ct_avg_r:>10.1f} {ir_avg_r:>10.1f}")
    
    print(f"{'Turnovers':30} {gs.ct_turnovers:>10} {gs.ir_turnovers:>10}")
    
    print(f"{'Torch Plays':30} {gs.ct_torch_plays:>10} {gs.ir_torch_plays:>10}")
    print(f"{'Torch Yards':30} {gs.ct_torch_yards:>10} {gs.ir_torch_yards:>10}")
    
    print(f"\nOFFENSIVE PLAY BREAKDOWN")
    print(f"{'PLAY ID':20} {'CALLS':6} {'YDS':6} {'AVG':6}")
    print("-" * 45)
    for team_plays in [CT_OFF_PLAYS, IR_OFF_PLAYS]:
        for play in team_plays:
            stats = gs.play_stats.get(play.id, [0, 0])
            avg = stats[1] / stats[0] if stats[0] > 0 else 0
            print(f"{play.id:20} {stats[0]:<6} {stats[1]:<6} {avg:<6.1f}")
    
    print(f"\nPLAYER STATS")
    
    for team_name, roster in [("CANYON TECH", CT_OFFENSE), ("IRON RIDGE", IR_OFFENSE)]:
        print(f"\n{team_name} Passing")
        print(f"{'PLAYER':20} {'C/ATT':8} {'YDS':6} {'TD':4} {'INT':4}")
        print(f"{'-'*45}")
        for p in roster:
            if p.name in gs.player_stats:
                s = gs.player_stats[p.name]
                if s.pass_att > 0:
                    print(f"{p.name:20} {s.pass_comp}/{s.pass_att:<6} {s.pass_yds:<6} {s.pass_tds:<4} {s.pass_ints:<4}")
        
        print(f"\n{team_name} Rushing")
        print(f"{'PLAYER':20} {'CAR':6} {'YDS':6} {'TD':4} {'LONG':4}")
        print(f"{'-'*45}")
        for p in roster:
            if p.name in gs.player_stats:
                s = gs.player_stats[p.name]
                if s.rush_att > 0:
                    print(f"{p.name:20} {s.rush_att:<6} {s.rush_yds:<6} {s.rush_tds:<4} {s.rush_long:<4}")

        print(f"\n{team_name} Receiving")
        print(f"{'PLAYER':20} {'REC':6} {'YDS':6} {'TD':4} {'LONG':4}")
        print(f"{'-'*45}")
        for p in roster:
            if p.name in gs.player_stats:
                s = gs.player_stats[p.name]
                if s.rec_att > 0:
                    print(f"{p.name:20} {s.rec_caught:<6} {s.rec_yds:<6} {s.rec_tds:<4} {s.rec_long:<4}")

# ============================================================
# SIMULATION RUNNER
# ============================================================

def run_simulation(num_games: int = 10, difficulty: str = "MEDIUM", verbose: bool = False, cpu_vs_cpu: bool = False):
    diff = Difficulty[difficulty.upper()]
    results = []; all_states = []
    
    for i in range(num_games):
        for roster in [CT_OFFENSE, CT_DEFENSE, IR_OFFENSE, IR_DEFENSE]:
            for p in roster:
                p.injured = False
                p.injury_snaps_remaining = 0
        
        ct_is_human = (i % 2 == 0)
        gs = play_game(ct_is_human, diff, verbose, cpu_vs_cpu=cpu_vs_cpu)
        all_states.append(gs)
        if verbose: print_box_score(gs)
        
        winner_team = "CT" if gs.ct_score > gs.ir_score else "IR" if gs.ir_score > gs.ct_score else "TIE"
        results.append({
            "game": i + 1, "ct_score": gs.ct_score, "ir_score": gs.ir_score, "winner": winner_team,
            "human_won": False if cpu_vs_cpu else ((ct_is_human and gs.ct_score > gs.ir_score) or (not ct_is_human and gs.ir_score > gs.ct_score)),
            "total_plays": gs.total_plays, "ct_torch_pts": gs.ct_torch_pts, "ir_torch_pts": gs.ir_torch_pts,
            "ct_turnovers": gs.ct_turnovers, "ir_turnovers": gs.ir_turnovers, "ct_touchdowns": gs.ct_touchdowns, "ir_touchdowns": gs.ir_touchdowns,
            "ct_total_yards": gs.ct_total_yards, "ir_total_yards": gs.ir_total_yards, "ct_sacks": gs.ct_sacks, "ir_sacks": gs.ir_sacks,
            "ct_first_downs": gs.ct_first_downs, "ir_first_downs": gs.ir_first_downs,
        })
    
    print(f"\n{'='*80}\nSIMULATION SUMMARY: {num_games} games on {difficulty}\n{'='*80}")
    
    human_wins = sum(1 for r in results if r["human_won"])
    ct_wins = sum(1 for r in results if r["winner"] == "CT")
    ir_wins = sum(1 for r in results if r["winner"] == "IR")
    ties = sum(1 for r in results if r["winner"] == "TIE")
    
    if not cpu_vs_cpu: print(f"\nHuman Win Rate: {human_wins}/{num_games} ({human_wins/num_games*100:.0f}%)")
    print(f"CT Wins: {ct_wins} | IR Wins: {ir_wins} | Ties: {ties}")
    
    avg = lambda key: sum(r[key] for r in results) / num_games
    avg_plays = avg("total_plays")

    print(f"\n{'':25} {'CT':>10} {'IR':>10}")
    print(f"{'Avg Score':25} {avg('ct_score'):>10.1f} {avg('ir_score'):>10.1f}")
    print(f"{'Avg TDs':25} {avg('ct_touchdowns'):>10.1f} {avg('ir_touchdowns'):>10.1f}")
    print(f"{'Avg Yards':25} {avg('ct_total_yards'):>10.1f} {avg('ir_total_yards'):>10.1f}")
    print(f"{'Avg TORCH pts':25} {avg('ct_torch_pts'):>10.1f} {avg('ir_torch_pts'):>10.1f}")

    ct_plays = sum(gs.ct_total_plays for gs in all_states) / num_games
    ir_plays = sum(gs.ir_total_plays for gs in all_states) / num_games
    print(f"{'Avg Plays/Game':25} {ct_plays:>10.1f} {ir_plays:>10.1f}")
    print(f"{'Avg Total Plays':25} {avg_plays:>10.1f}")

    # Calculate games where score was changed by purchases
    print(f"\n{'='*80}\nTORCH CARD WIN/LOSS ANALYSIS (Active Utilization)\n{'='*80}")
    print(f"{'Card ID':20} {'Tier':8} {'Used':8} {'Wins':8} {'Win %':8}\n" + "-"*60)

    global_card_stats = {k: [0, 0] for k in TORCH_CARDS.keys()}
    for gs in all_states:
        winner = "CT" if gs.ct_score > gs.ir_score else "IR" if gs.ir_score > gs.ct_score else "TIE"
        for card_id, stats in gs.card_stats.items():
            if stats[0] > 0:
                global_card_stats[card_id][0] += stats[0]
                if winner != "TIE":
                    # Check if the team that won is the one that used the card
                    # (Approximate based on global usage in this specific game)
                    global_card_stats[card_id][1] += 1

    sorted_cards = sorted(global_card_stats.items(), key=lambda x: x[1][0], reverse=True)
    for card_id, stats in sorted_cards:
        if stats[0] > 0:
            win_pct = (stats[1] / stats[0] * 100)
            print(f"{card_id:20} {TORCH_CARDS[card_id]['tier']:8} {stats[0]:<8} {stats[1]:<8} {win_pct:.1f}%")


if __name__ == "__main__":
    num_games = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    difficulty = sys.argv[2] if len(sys.argv) > 2 else "MEDIUM"
    verbose = "--verbose" in sys.argv or "-v" in sys.argv
    cpu_vs_cpu = "--cpu" in sys.argv
    run_simulation(num_games, difficulty, verbose, cpu_vs_cpu=cpu_vs_cpu)
