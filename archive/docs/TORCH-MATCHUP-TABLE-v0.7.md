# TORCH — Card Matchup Table
## Football Logic Reference for v0.7

### How to Read This Table

Each matchup has a **tier** and a **yard range**:

- **O+** = Offense wins the matchup (big play: 8–20 yards)
- **N** = Neutral / contested (moderate gain: 2–6 yards)  
- **D+** = Defense wins the matchup (stuffed: -2 to 2 yards)
- **TO** = Turnover risk (interception or fumble possible, -2 to 0 yards)

Within each tier, actual yardage is randomized to create variance. A matchup being O+ doesn't guarantee 20 yards — it means the offense has a significant advantage and the result will land somewhere in the 8–20 range.

**Turnover risk (TO)** means there's a ~15-25% chance of a turnover on top of the bad yardage. Not every TO-tier play results in a turnover, but the risk is real.

---

## THE GRID

| | **Blitz** | **Corner Blitz** | **Press Man** | **Safety Blitz** | **Line Stunt** | **Cover 2** | **Cover 3** | **Cover 4** | **Spy** | **Prevent** |
|---|---|---|---|---|---|---|---|---|---|---|
| **QB Sneak** | N | N | D+ | N | D+ | O+ | O+ | N | N | O+ |
| **Draw** | D+/TO | N | O+ | D+ | D+ | O+ | N | N | N | O+ |
| **Power** | D+ | O+ | N | D+ | O+ | N | D+ | N | N | O+ |
| **Zone Read** | D+ | O+ | N | N | O+ | N | N | O+ | D+ | O+ |
| **Toss** | N | D+ | N | O+ | O+ | N | N | N | N | O+ |
| **Slant** | O+ | O+ | D+/TO | N | N | N | N | N | O+ | N |
| **Flat** | O+ | N | D+ | O+ | N | D+ | O+ | N | N | N |
| **Cross** | N | N | O+ | N | D+ | O+ | N | D+ | O+ | N |
| **Corner Rte** | O+ | D+/TO | N | O+ | N | O+ | N | D+ | N | D+ |
| **Go Route** | O+/TO | O+ | N | O+/TO | N | D+ | D+ | D+ | N | D+ |

---

## FOOTBALL LOGIC — PLAY BY PLAY

### OFFENSE: QB SNEAK
*QB takes the snap and immediately drives forward behind the center. 1-3 yards, almost never fails in short yardage.*

- **vs Blitz (N):** Blitz sends extra rushers but they're attacking gaps, not stacking the line. Sneak gets its 1-2 yards but nothing more — the chaos cuts both ways.
- **vs Corner Blitz (N):** Corner is coming off the edge, not stuffing the middle. Sneak is unaffected by edge pressure. Gets its yards.
- **vs Press Man (D+):** Defenders are tight on receivers but the DL is gap-sound. The interior is packed. Hard to push through.
- **vs Safety Blitz (N):** Safety comes downhill but from depth — arrives after the sneak has already launched. Sneak gets its yards.
- **vs Line Stunt (D+):** DL twists and games disrupt the interior push. The center can't get a clean wedge. Sneak stalls.
- **vs Cover 2 (O+):** Two safeties deep, corners in flats — the box is light. The middle of the line is soft. Sneak walks through.
- **vs Cover 3 (O+):** Only 4 in the box with LBs playing off. The interior is wide open for a QB push. Easy yards.
- **vs Cover 4 (N):** Quarters puts safeties at medium depth, LBs are reading. Box isn't loaded but it's not empty. Contested.
- **vs Spy (N):** Spy LB is watching the QB — but the sneak is so fast it launches before the spy can react. Gets its yards but nothing extra.
- **vs Prevent (O+):** Everyone is 15+ yards deep. The line of scrimmage is abandoned. Sneak gets whatever it wants.

### OFFENSE: DRAW
*QB fakes a pass dropback, then hands to the RB. Exploits aggressive pass rushers by letting them run past the play.*

- **vs Blitz (D+/TO):** This is the draw's biggest weakness. Interior blitzers flood the backfield before the handoff. The RB has nowhere to go. Fumble risk from contact in the backfield.
- **vs Corner Blitz (N):** Edge pressure doesn't affect the interior lanes. The draw works but doesn't exploit anything — the LBs still read it.
- **vs Press Man (O+):** DBs are locked on receivers, LBs are in man assignments. Nobody is watching the RB. The fake freezes coverage and the draw hits clean lanes.
- **vs Safety Blitz (D+):** Safety is already attacking downhill — reads the handoff and fills the lane. No room.
- **vs Line Stunt (D+):** DL games blow up the blocking scheme. The offensive line is trying to let rushers past, but the stunts put defenders exactly where the draw lane should be.
- **vs Cover 2 (O+):** Two safeties deep, LBs drop into zones. The middle of the field is vacated. Draw exploits soft box.
- **vs Cover 3 (N):** One deep safety, but 4 underneath defenders are close enough to read the draw. Moderate gain.
- **vs Cover 4 (N):** Safeties read run/pass from alignment. They'll see the handoff and come downhill. Contested.
- **vs Spy (N):** The spy LB is reading the QB — the fake pass may hold him for a beat, but he recovers to fill. Contested.
- **vs Prevent (O+):** DBs are 15 yards deep. Draw has acres of space before anyone can tackle.

### OFFENSE: POWER
*Downhill run with a lead blocker. Physical, gap-scheme football. Attacks one specific hole.*

- **vs Blitz (D+):** Extra rushers fill every gap. There's no crease for the power to hit. Bodies everywhere.
- **vs Corner Blitz (O+):** Corner comes off the edge — but power runs inside. The corner blitz leaves the interior undermanned. Big lane opens.
- **vs Press Man (N):** DBs on receivers, DL in their gaps. The front is gap-sound. Power gets 3-4 yards through physicality but nothing breaks open.
- **vs Safety Blitz (D+):** Safety fills the alley. The extra defender in the box overwhelms the blocking scheme. Stuffed.
- **vs Line Stunt (O+):** DL stunts take defenders out of their gaps. Power's puller leads through the vacated gap. If the stunt goes the wrong way, it's a big run.
- **vs Cover 2 (N):** Box isn't loaded, but LBs are in position. Power gets honest yards but the 2-high shell doesn't specifically help the run game.
- **vs Cover 3 (D+):** Eight-man-box defense. Cover 3 puts the SS in the box. This is what Cover 3 is built to stop. Gap-sound, physical front.
- **vs Cover 4 (N):** Quarters safeties read high-to-low — they can come up in run support. But they start deep enough that power has a window. 3-5 yards.
- **vs Spy (N):** Spy LB is in the box and gap-sound. Power gains honest yardage but the spy fills correctly.
- **vs Prevent (O+):** Prevent is built to stop deep passes, not downhill runs. Light box. Power gashes it.

### OFFENSE: ZONE READ
*QB reads the unblocked DE — keeps it or gives to the RB based on the read. Spread offense staple.*

- **vs Blitz (D+):** Blitzers crash into the backfield and blow up the mesh point before the QB can make a read. No time to decide.
- **vs Corner Blitz (O+):** Corner vacates the edge by blitzing. QB reads the unblocked DE — and the corner's side is now wide open. Keep or give, there's a lane.
- **vs Press Man (N):** DL is gap-disciplined. The unblocked end plays it correctly — squeezes the give and forces the keep into traffic. Moderate gain.
- **vs Safety Blitz (N):** Safety fills fast but the read happens before contact. QB makes the right call but yards are limited.
- **vs Line Stunt (O+):** DL stunts create confusion about who the read key is. Defenders end up in the wrong gap. Big crease opens.
- **vs Cover 2 (N):** Box isn't overloaded but LBs are in position to fill. Zone read gets its yards but doesn't break.
- **vs Cover 3 (N):** 8-man box is tough for zone read. The SS in the box adds a hat to the run fit. Moderate.
- **vs Cover 4 (O+):** Quarters safeties start deep. The box is light. Zone read has numbers at the point of attack. Big gain potential.
- **vs Spy (D+):** The spy LB is specifically watching the QB. This is exactly what the spy is designed for — takes away the keep lane and fills on the give. 
- **vs Prevent (O+):** DBs deep, nobody in the box. Zone read runs free.

### OFFENSE: TOSS
*Pitch sweep to the outside. Gets the RB to the edge with blockers in front. Needs space on the perimeter.*

- **vs Blitz (N):** Blitz crashes inside, but the toss goes outside. The blitz doesn't help or hurt — it's a wash. Depends on the edge defender.
- **vs Corner Blitz (D+):** Corner is blitzing from exactly where the toss is heading. The edge is crashed. Toss runs right into the pressure. Loss of yards.
- **vs Press Man (N):** DBs are on receivers. The edge is contested — it's a footrace between the RB and the contain player. 3-5 yards.
- **vs Safety Blitz (O+):** Safety comes downhill from the middle — vacates the alley the toss is heading toward. The edge is wide open.
- **vs Line Stunt (O+):** Interior DL games leave the edge unaffected. Toss gets outside while defenders are caught up in the stunt traffic. Big gain.
- **vs Cover 2 (N):** Corners are in the flats — they're in position to set the edge. The toss is contained. Short gain.
- **vs Cover 3 (N):** SS in the box can help contain the edge. Cover 3 is sound against outside runs. Moderate.
- **vs Cover 4 (N):** Quarters safeties play from depth but read run-to-pass. They can fill to the edge eventually. Contested.
- **vs Spy (N):** Spy is inside — doesn't directly affect the edge. Toss gets its yards but doesn't break away.
- **vs Prevent (O+):** Nobody is within 10 yards of the line of scrimmage. Toss sweeps the edge with no resistance.

### OFFENSE: SLANT
*Quick 1-step inside route. Ball out in under 2 seconds. Timing route — the WR breaks inside at 5 yards.*

- **vs Blitz (O+):** The ball is out before the blitz arrives. Quick slant converts before pressure can affect anything. The mathematical answer to the blitz (along with screens).
- **vs Corner Blitz (O+):** Same as blitz — the slant is too quick for edge pressure to matter. Ball is out and caught.
- **vs Press Man (D+/TO):** Press coverage at the line disrupts the WR's release and breaks up the timing. If the CB reads the slant and jumps it, it's an interception. This is the biggest risk play for the slant.
- **vs Safety Blitz (N):** Quick throw beats the safety's arrival, but the underneath defenders are in position. Short gain.
- **vs Line Stunt (N):** DL games don't affect a quick throw. But the LBs underneath read the slant. It's contested. Moderate gain.
- **vs Cover 2 (N):** Corners in the flats are close to the slant area. LBs occupy the underneath zones. Contested throw. Short gain.
- **vs Cover 3 (N):** Underneath defenders cover the middle short zones. Slant finds a window but doesn't break open. 4-6 yards.
- **vs Cover 4 (N):** Quarters is soft underneath. Slant completes but the pattern-match defenders limit YAC. Moderate.
- **vs Spy (O+):** Spy LB is watching the QB, not the receivers. That's one fewer underneath defender in the passing lanes. Slant runs into open space.
- **vs Prevent (N):** Prevent drops everyone deep — but the short zones are soft. Slant gets 5-6 yards (which is what prevent is designed to give up).

### OFFENSE: FLAT
*Quick throw to the RB or TE in the flat along the sideline. Safe, consistent, 4-6 yards.*

- **vs Blitz (O+):** The flat throw is the safety valve against pressure. Ball is out quick and the flat is vacated because everyone is rushing. Big yards after catch.
- **vs Corner Blitz (N):** The corner would normally be in the flat — but they're blitzing. However, the LB or safety may rotate to cover. It's a toss-up depending on how the rotation goes.
- **vs Press Man (D+):** In man coverage, someone follows the RB/TE to the flat. It's covered — the defender is right there.
- **vs Safety Blitz (O+):** Safety vacates the deep zone to blitz — the flat defender has no help. Quick throw, open space, YAC.
- **vs Line Stunt (N):** DL games don't affect flat routes. Underneath coverage is sound. Moderate gain.
- **vs Cover 2 (D+):** The corners in Cover 2 squat in the flats. This is literally what Cover 2 is designed to take away. Covered.
- **vs Cover 3 (O+):** Cover 3's biggest weakness is the flat. The curl-flat defender can't cover both. Flat route hits the void. 
- **vs Cover 4 (N):** Quarters has underneath defenders who can cover the flat. Not a weakness. Moderate gain.
- **vs Spy (N):** Spy doesn't specifically help or hurt the flat. Standard coverage applies. Moderate gain.
- **vs Prevent (N):** Prevent gives up short stuff but there's no YAC — DBs are closing from depth. 4-5 yards.

### OFFENSE: CROSS
*WR runs across the entire width of the field at 10-12 yards. Beats man coverage by creating traffic. Takes time to develop.*

- **vs Blitz (N):** The cross takes time to develop — the blitz is coming fast. QB might have time to throw it, might not. If he gets it off, the cross is open. If not, sack. High variance.
- **vs Corner Blitz (N):** Edge pressure gives moderate time for the cross to develop. The throw is contested — LBs are reading underneath.
- **vs Press Man (O+):** The cross is the man-coverage killer. The WR runs through traffic and picks, the DB gets caught in the wash. Clean throw to an open receiver.
- **vs Safety Blitz (N):** No deep safety help, but the cross is in the intermediate zone. The throw is available but the window is tight.
- **vs Line Stunt (D+):** DL twists disrupt the pocket and affect QB timing. The cross needs a clean pocket to deliver. Stunts collapse it.
- **vs Cover 2 (O+):** Cover 2 is soft in the deep middle. The cross runs right through the hole between the two safeties. Open window.
- **vs Cover 3 (N):** Underneath defenders in Cover 3 sit in the crossing route's path. The middle of the field is congested. Contested.
- **vs Cover 4 (D+):** Quarters pattern-matches the cross. Defenders pass off and pick up the route cleanly. No window.
- **vs Spy (O+):** Spy LB is watching the QB, not the crossing route. That's one fewer underneath defender — the cross runs through open space.
- **vs Prevent (N):** Prevent drops everyone back but the cross is at 10-12 yards — in the void underneath the deep coverage. Completes for moderate gain.

### OFFENSE: CORNER ROUTE
*WR runs up the sideline then breaks to the corner of the end zone at 15 yards. Deep out — high reward, requires arm strength.*

- **vs Blitz (O+):** If the QB has time (and against an all-out blitz, he needs to throw hot), the blitz vacates coverage and the corner route is wide open. But this requires a quick read.
- **vs Corner Blitz (D+/TO):** The corner blitz comes from exactly where this route is going. The CB isn't there to cover — but the blitzing corner is flying toward the throwing lane. Likely a tipped ball or INT.
- **vs Press Man (N):** Press disrupts the release but the WR can work free at 15 yards. The throw is contested — it's a 50/50 ball. 
- **vs Safety Blitz (O+):** No safety help over the top. The corner route goes to the deep sideline — zero support there. Wide open.
- **vs Line Stunt (N):** DL games affect timing slightly but the corner route can still be delivered. Contested but makeable.
- **vs Cover 2 (O+):** Corner route is Cover 2's nemesis. It goes directly over the flat-sitting CB and under the deep safety. The hole in Cover 2 is the deep sideline, and this route attacks it directly.
- **vs Cover 3 (N):** The deep third CB is in position over the top. The corner route is contested — the CB has depth to break on it. 
- **vs Cover 4 (D+):** Quarters has a CB and safety both with responsibility in the deep quarter where the corner route goes. Double coverage effectively. Stuffed.
- **vs Spy (N):** Spy doesn't help deep coverage. Standard matchup — depends on the CB.
- **vs Prevent (D+):** Prevent has 4+ defenders deep. The corner route is exactly what prevent is built to stop. Covered.

### OFFENSE: GO ROUTE
*WR runs straight down the field as fast as possible. Home run ball — 30+ yards if it connects. Biggest risk/reward play.*

- **vs Blitz (O+/TO):** Blitz sends everyone — zero safety help. If the QB gets the throw off, it's a touchdown. If the blitz arrives first, it's a sack or strip. The quintessential boom-or-bust matchup.
- **vs Corner Blitz (O+):** Corner vacates to blitz, leaving the deep sideline exposed. Go route burns the vacated coverage. Big play.
- **vs Press Man (N):** It's a footrace. Press CB jams at the line — if the WR wins the release, he's gone. If the CB stays with him, the ball is contested deep. 50/50.
- **vs Safety Blitz (O+/TO):** No safety deep. The go route is a touchdown if completed. But the blitz is coming — if the QB doesn't get it off in time, it's a sack. And if the throw is off, the CB underneath can pick it.
- **vs Line Stunt (N):** Interior pressure affects timing but the go route has 3+ seconds to develop. The throw is makeable but the window is tight. Contested deep.
- **vs Cover 2 (D+):** Two safeties split deep. The go route runs right into a safety's zone. Deep sideline is covered. Underthrow = interception.
- **vs Cover 3 (D+):** Deep third CB runs with the go route. Safety provides over-the-top help. No chance unless the WR has elite speed. Likely INT risk.
- **vs Cover 4 (D+):** Four deep defenders. The go route is running into a wall of coverage. The worst matchup for a vertical shot. Likely defended.
- **vs Spy (N):** Spy doesn't affect deep coverage directly. It's a standard deep matchup — depends on the CB and safety.
- **vs Prevent (D+):** Prevent literally exists to stop the go route. 4+ defenders deep. No chance.

---

## DESIGN NOTES

### Balance Check
Every offensive card has at least 2-3 favorable matchups and 2-3 unfavorable ones. No card is universally good or bad. Every defensive card has at least 2-3 plays it stops and 2-3 it's vulnerable to.

### The Draft Creates the Strategy
Since players pick 5 from 10, they're making a prediction about what the AI will call. Heavy run draft = vulnerable to blitzes. All short passes = gives up the deep shot. The draft is the game plan; the matchups reward good predictions.

### Variance Keeps It Interesting
Even favorable matchups (O+) aren't guaranteed big plays. An O+ might yield 8 yards or 20 yards. This prevents the game from feeling deterministic while still rewarding correct reads.

### Summary of Offensive Card Strengths
| Card | Best Against | Worst Against | Character |
|---|---|---|---|
| QB Sneak | Soft coverage (Cover 2/3/Prevent) | Interior DL games (Stunt, Press) | Safe short yardage |
| Draw | Pass-focused D (Cover 2, Press Man, Prevent) | Blitz, Safety Blitz, Stunts | Deceptive, punishes pass rush |
| Power | Edge blitz (Corner), Stunts, Prevent | Blitz, Safety Blitz, Cover 3 | Physical downhill |
| Zone Read | Light box (Cover 4, Prevent), Stunts | Blitz, Spy | Read-based, spread |
| Toss | Inside pressure (Safety Blitz, Stunt, Prevent) | Corner Blitz | Outside speed |
| Slant | Any blitz, Spy | Press Man (INT risk) | Quick timing |
| Flat | Blitz, Safety Blitz, Cover 3 | Press Man, Cover 2 | Safety valve |
| Cross | Man coverage (Press), Cover 2, Spy | Line Stunt, Cover 4 | Traffic runner |
| Corner Rte | Cover 2, Blitz, Safety Blitz | Corner Blitz (INT), Cover 4, Prevent | Deep sideline |
| Go Route | All blitzes (if QB gets throw off) | All deep zones (Cover 2/3/4/Prevent) | Home run or bust |

### Summary of Defensive Card Strengths  
| Card | Stops | Vulnerable To | Character |
|---|---|---|---|
| Blitz | Draw, Power, Zone Read | Slant, Flat, Corner Rte, Go (if thrown) | All-out pressure |
| Corner Blitz | Toss, Corner Rte | Power, Zone Read, Slant, Go Route | Edge crash |
| Press Man | Slant (INT), Flat, Draw | Cross, Draw, Cover-beaters | Physical at the line |
| Safety Blitz | Draw, Power | Flat, Toss, Corner Rte, Go Route | Downhill safety |
| Line Stunt | Draw, Cross, QB Sneak | Power, Zone Read, Toss | Interior games |
| Cover 2 | Flat, Go Route, Corner-ish | Corner Rte, Cross, QB Sneak | Two deep safeties |
| Cover 3 | Power, Go Route | Flat (its big weakness), QB Sneak | Three deep, 8-man box |
| Cover 4 | Cross, Corner Rte, Go Route | Zone Read, QB Sneak | Four across, pattern match |
| Spy | Zone Read, QB scramble | Slant, Cross | Watches the QB |
| Prevent | Go Route, Corner Rte, deep passes | Every run play, Slant, Flat | Maximum depth |
