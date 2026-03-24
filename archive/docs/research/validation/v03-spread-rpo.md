# Validation Report: Crestview Stags -- Spread RPO Offense

*Research Date: 2026-03-22*
*Validator: Claude (web research)*

---

## 1. Formation and Personnel

### What does a modern college RPO offense look like?

**Formation:** Shotgun is the primary alignment, with pistol as a secondary look. The QB is 4-5 yards behind center in shotgun (or 3-4 in pistol), with one running back beside or slightly behind him. The vast majority of RPO plays are run from the gun because the QB needs clear sightlines to read the key defender while managing the mesh point with the RB.

**Personnel groupings:**
- **10 personnel** (1 RB, 0 TE, 4 WR) -- the purest spread RPO look. This is what Baylor under Art Briles and early Chip Kelly Oregon used. Forces the defense to spread thin across the field.
- **11 personnel** (1 RB, 1 TE, 3 WR) -- the most common modern RPO personnel. Lincoln Riley's Oklahoma used this heavily. The TE gives you a sixth blocker for the run game while still having three receiving threats. The TE can also be the RPO target on stick/flat routes.
- **20 personnel** (2 RB, 0 TE, 3 WR) -- less common but used in split-back RPO sets (Riley's Oklahoma occasionally). Two backs give you more run-game versatility but reduce receiving options.

**TORCH validation:** The archetype doc says "Shotgun, 3-4 wide, run-pass option on nearly every play." This is accurate. A modern spread RPO offense primarily operates out of 10 or 11 personnel in shotgun alignment with 3-4 receivers. The Stags roster (1 QB, 1 RB, 2 WR, 3 OL in 7v7 format) correctly maps to 10/11 personnel spread concepts. **CONFIRMED.**

---

## 2. How RPOs Actually Work Mechanically

### Pre-Snap RPOs

On pre-snap RPOs, the quarterback's decision is made *before the snap*. The QB surveys the defensive alignment -- counting box defenders versus receivers on the perimeter -- and decides run or pass based on numbers.

- **Example:** In a trips formation (3 WR to one side), if only 2 defenders cover the 3 receivers, the QB will throw (numbers advantage in the passing game). If 4 defenders are shading trips, the box is light -- hand off the run.
- **Key point:** On pre-snap RPOs, the QB does NOT ride the mesh point. If the decision is already made, he either pulls immediately and throws or gives immediately. No fake needed.
- **Common pre-snap RPOs:** Bubble screen RPO, smoke screen RPO. These are essentially "alert" plays -- if the QB sees the numbers, he throws immediately; if not, he gives the handoff.

### Post-Snap RPOs ("Ride and Decide")

Post-snap RPOs are the classic RPO mechanic. The QB takes the snap, meshes with the RB (the "ride the wave" motion), and reads a single key defender -- typically the MIKE linebacker, the WILL linebacker, or a defensive end.

**The decision tree:**
1. **Snap:** QB receives the ball, begins the mesh with the RB (ball extended into the RB's belly).
2. **Read the key defender:** Usually the 2nd-level defender (LB) or the backside DE.
   - If the key defender **steps toward the line / fills a run gap** --> the pass lane opens behind him. QB pulls the ball from the mesh and throws to the receiver in the vacated area.
   - If the key defender **drops into coverage / stays flat-footed** --> the run lane is open. QB gives the ball to the RB for inside zone.
   - On some designs (read RPOs), if the first two options are covered, the QB has a third option: **keep and run** through the vacated gap.
3. **Execute:** The whole read happens in 1-2 seconds. The offensive line is blocking run the entire time -- this is critical because it keeps defensive linemen in their run-fit mode and prevents them from converting to pass rush.

**The mesh point is the key.** The mesh buys time. If the QB doesn't ride the mesh, the defensive linemen will immediately convert to pass rush while the OL is in run-blocking mode, creating a disaster. The mesh freezes the DL in run fits for an extra 1-2 seconds.

**Which defender is being read?**
- **First level (pre-snap):** Box count. Are there enough defenders in the box to stop the run?
- **Second level (post-snap, most common):** MIKE or WILL linebacker. This is the "conflict player" -- the defender responsible for both run support and underneath pass coverage. The RPO forces him to choose, and he will be wrong.
- **Third level (glance RPOs):** Safety. If the safety rotates down, the deep shot is available. If the safety stays deep, the intermediate window opens or the run is good.

**TORCH validation:** The archetype doc says "The QB reads a single defender (usually the MIKE or a DE) and decides in real time whether to hand off the inside zone run, pull and throw a quick pass to the flat/slant, or keep and run." This is textbook accurate. The emphasis on "a single defender" is correct -- RPOs are not full-field reads. The QB has one key and reacts to it. **CONFIRMED.**

---

## 3. Key RPO Concepts (Real Football Terms)

### Bubble RPO
- **Run component:** Inside zone.
- **Pass component:** Bubble screen to a slot receiver.
- **Read:** If the flat defender (OLB or apex player) steps up toward the LOS to play the run, throw the bubble behind him. If he stays in coverage, give the inside zone.
- **This is the most basic and most common RPO.** It is often the Day 1 install for any RPO offense.

### Stick RPO
- **Run component:** Inside zone or power.
- **Pass component:** Stick route (5-yard hitch by the TE or slot) with a flat route underneath.
- **Read:** Read the MIKE or WILL. If the LB fills the run, the stick is open behind him. If the LB drops, give the run.
- **This is the most popular "second-level" post-snap RPO** in modern college football.

### Glance RPO
- **Run component:** Inside zone.
- **Pass component:** Glance route (quick inside-breaking slant, 1-3 steps).
- **Read:** Third-level read (safety). The QB reads the safety's movement. If the safety comes down into the box, the glance behind him or a deeper window opens. This is more aggressive than bubble or stick because the throw goes further downfield.
- **Key distinction:** The glance RPO can also let the QB stay in the pocket and scramble rather than run from the mesh, providing a more traditional passing play feel.

### Peek RPO
- **Run component:** Power, counter, or pin-and-pull.
- **Pass component:** Quick peek route over the middle (often a slant or skinny post).
- **Read:** Second-level LB. If the LB comes downhill to fill his gap against the power/counter run, the QB peeks the throw behind him.
- **Key distinction:** Peek RPOs are paired with gap-scheme runs (power/counter) rather than zone runs. This is a more physical RPO concept.

### Power Read / Inverted Veer
- **Not technically an RPO** (no pass option built in), but a closely related spread option concept that lives in the same offensive ecosystem.
- **Mechanic:** The QB reads the backside DE. The RB runs to one side, and if the DE crashes to take the RB, the QB keeps and runs to the opposite side. If the DE stays, the QB gives.
- **Inverted veer** flips the traditional zone read: the RB takes the inside path while the QB takes the outside/sweep path (or vice versa). Often run with a pulling guard for a lead blocker.
- **Why it matters for RPO offenses:** The power read / inverted veer is the "constraint play" that punishes defenses for overcommitting to stop the RPO pass. It forces the defense to also account for the QB as a runner.

### Alert RPO
- **The simplest form.** A pre-snap check where the QB identifies a numbers advantage to one side and throws a quick screen (bubble, smoke, or now screen) before the defense can react.
- **Many coaches do not consider this a true RPO** because there is no post-snap read element. It predates the RPO revolution -- it is essentially a pre-snap audible to a screen.

### Zone Read (Foundation)
- **The base run concept** underneath most RPOs. Inside zone or outside zone blocking with a read of the backside DE. The read element is what separates it from a traditional zone run.
- Inside zone is the most common pairing because the blocking scheme is simple and creates natural mesh-point timing.

### Pop Pass RPO
- **Run component:** Inside zone.
- **Pass component:** A deeper throw -- often a post, seam, or go route to an outside receiver.
- **Read:** Safety. This is the "big play" RPO -- if the safety bites on the run action, the deep shot is open. High reward, higher risk.
- **This is the RPO that produces 40+ yard explosive plays.**

**TORCH validation:** The archetype doc mentions "inside zone run, pull and throw a quick pass to the flat/slant." This is correct but understates the variety. A full spread RPO offense has bubble, stick, glance, peek, pop pass, and alert concepts in its toolbox. The doc also mentions "bubble_screen" in the scheme tags, which is accurate. **CONFIRMED with note that the playbook should reflect multiple RPO concepts, not just bubble/slant.**

---

## 4. How Tempo Factors In

### Is "tempo-driven" accurate for RPO offenses?

**Yes, absolutely.** Tempo and RPO are natural partners. Here is why:

1. **Defensive substitution denial.** No-huddle tempo prevents the defense from matching personnel. If the offense is in 10 personnel running at tempo, the defense might be stuck with base personnel (2 LBs, 3 DL) against 4 receivers. This creates automatic numbers advantages for the RPO read.

2. **Pre-snap alignment stress.** Against tempo, defenses frequently line up incorrectly -- wrong gaps, wrong leverages, wrong depths. The RPO QB exploits these misalignments instantly. As research shows: "Against tempo, defenses can have trouble lining up correctly to formations which can give the offense a numbers advantage in the RPO game."

3. **Communication breakdown.** The defense cannot huddle, check calls, or make adjustments when the offense is snapping the ball every 15-20 seconds. RPOs are simple for the offense (the QB reads one defender) but complex for the defense (every player must be in the right spot). Tempo tilts this equation further.

4. **Practice efficiency.** Chip Kelly's Oregon pioneered this: without huddling, practice reps increase dramatically. Players execute the same 8-12 plays hundreds more times per week than a huddle team. The RPO reads become instinctive rather than cognitive.

**Chip Kelly's Oregon ran three tempo settings:**
- **Red light:** Slow, QB looks to sideline for play call.
- **Yellow light:** Medium, QB calls the play with audible freedom.
- **Green light:** Fastest possible, snap as soon as the ball is set.

Between 2010-2012, Oregon averaged 76 plays per game, 530 yards per game, and 47.5 points per game using this system.

**Art Briles' Baylor** took it further -- receivers split as wide as possible (sometimes on the sideline itself) and ran at "hyper-tempo." In his last five years at Baylor, the Bears finished top 5 in the country in scoring every single season.

**TORCH validation:** The archetype doc says the Stags are "tempo-driven" with the motto "Strike First, Strike Fast" and describes an offense that "scores in under 2 minutes." The tempo characterization is completely accurate for a spread RPO identity. **CONFIRMED.**

---

## 5. The Run Game Within RPO

### How central is the run threat?

**The run game IS the RPO.** Without a credible run threat, the RPO becomes just a passing play, and defenses stop respecting the handoff. The entire system breaks down.

**Primary run concepts in RPO offenses:**

1. **Inside Zone** -- The #1 run scheme in spread RPO football. Simple blocking rules (covered/uncovered), creates natural combo blocks to the second level, and the mesh-point timing works perfectly with RPO reads. Inside zone is the foundation that everything else is built on.

2. **Outside Zone** -- Stretch play that attacks the edge. Less common as an RPO base but used to change the run-game angle and set up cutback lanes.

3. **Power** -- Gap scheme with a pulling guard. Used in "peek" RPOs. Baylor and modern programs proved you can run power from spread sets ("smashmouth spread"). The pulling guard creates a lead blocker and a more physical run-game identity.

4. **Counter** -- Another gap scheme. The fake one way, run the other misdirection pairs naturally with RPO reads because it creates additional conflict for the defense.

5. **QB Draw** -- The constraint play. If the defense is sitting on the RPO read (LB not moving, DE squeezing), the QB keeps on a delayed draw. This is the "third option" that punishes disciplined defenses.

6. **Zone Read / QB Keep** -- The QB reads the backside DE and either gives inside zone or keeps and runs. This is not technically an RPO (no pass option) but is a foundational spread run concept that every RPO offense uses.

7. **Power Read / Inverted Veer** -- The QB and RB exchange gap responsibilities based on the DE's reaction. A physical constraint play.

**The QB as a runner is essential.** If the QB is a dual-threat, the defense must account for a "seventh gap" -- the QB run lane. This is why spread RPO offenses recruit dual-threat QBs almost exclusively. A pocket-only QB can run RPOs (Baker Mayfield did), but the system reaches its ceiling with a QB who can run (Kyler Murray, Jalen Hurts, Lamar Jackson).

**TORCH validation:** The archetype doc describes inside zone as the base run, with the QB as a weapon. The roster includes a dual-threat QB (Micah Strand, FLAME badge) and a patient inside zone RB (Jalen Sayers, CLEAT badge). The scheme tags include `inside_zone` and `dual_threat`. This is all correct. The only note: the archetype doc could also mention power/counter as secondary run concepts, as modern RPO offenses are not purely zone-based. **CONFIRMED.**

---

## 6. Historical and Current Programs

### The RPO Lineage

| Program | Coach | Era | Key Features |
|---------|-------|-----|--------------|
| **Oregon** | Chip Kelly | 2009-2012 | Pioneered tempo + packaged plays. Three tempo settings. Zone read + constraint RPOs. Averaged 47.5 PPG. |
| **Baylor** | Art Briles | 2010-2015 | "Hyper-tempo." Extra-wide receiver splits. Smashmouth spread -- power run game from spread sets with RPOs. Top 5 scoring nationally for 5 straight years. |
| **Oklahoma** | Lincoln Riley | 2017-2021 | Three consecutive Heisman QBs (Mayfield, Murray, Hurts). Air Raid foundation with RPO integration. Tailored system to each QB's strengths -- more dropback for Mayfield, more run/RPO for Murray. |
| **Ohio State** | Ryan Day | 2019-present | RPO-heavy spread with elite athletes. Inside zone + RPO with vertical shots. Justin Fields and CJ Stroud operated the system differently (Fields more run-heavy RPO, Stroud more pass-heavy). |
| **Alabama** | Steve Sarkisian (OC) | 2019-2020 | Integrated RPO into Alabama's traditional pro-style, creating a hybrid that Tua Tagovailoa and Mac Jones ran effectively. |
| **Indiana** | Curt Cignetti / Mike Shanahan (OC) | 2024 | Cinderella 11-1 season built on RPO scheme. Balanced 2x2 and 3x1 spread formations with pre-snap and post-snap RPO reads. Made the College Football Playoff. |
| **Army/Navy (contrast)** | Jeff Monken / Brian Newberry | Ongoing | Service academies run the flexbone triple option, which is the *ancestor* of the RPO in terms of read-based decision-making, but uses under-center formations and option pitches rather than shotgun pass reads. |

### Key Takeaway
The RPO revolution is not a single system -- it is a **concept layer** that has been added to many different offensive philosophies. Chip Kelly's Oregon was zone-read-first with RPO tags. Briles' Baylor was tempo-first with RPO reads. Riley's Oklahoma was Air Raid with RPO integration. The common thread: spread formation, shotgun/pistol alignment, inside zone as the base run, and a post-snap read that puts one defender in conflict.

**TORCH validation:** The archetype doc cites Lincoln Riley's Oklahoma and early Chip Kelly Oregon as inspirations. Both are excellent choices. Baylor under Briles would also be a valid reference. **CONFIRMED.**

---

## 7. What Actually Counters RPO?

### The archetype doc says "zone discipline." Is this correct?

**Yes, but it needs elaboration.** Here are the specific defensive strategies that counter spread RPO:

### 1. Gap-Sound Zone Defense (Primary Counter)
This is what the archetype doc calls "zone discipline," and it is the #1 RPO killer. The defense plays a zone scheme (typically Cover 3 or Cover 4) where every defender has a gap assignment AND a coverage zone. The key: **linebackers do not react to the run fake.** They read their keys, stay disciplined in their gaps, and do not bite on the mesh point.

Why it works: The entire RPO mechanic depends on putting a single defender in conflict (run vs. pass). If that defender stays disciplined and does not commit to either, the QB has no clear read, and the play stalls. The Timber Wolves' zone read defense in TORCH is specifically designed to do this.

### 2. Scrape Exchange (Specific Technique)
The scrape exchange switches gap responsibilities between the DE and the LB:
- The **DE crashes down** to take the RB's inside zone lane (B gap).
- The **LB scrapes over the top** to contain the QB (C gap).

This defeats the zone read and many RPO reads because the QB sees the DE crashing (which should mean "keep the ball") but runs into the LB who scraped into the keep lane. It gives the defense a way to account for both the give and the keep without putting a single defender in conflict.

### 3. Man Coverage (Situational Counter)
Playing man-to-man eliminates the RPO pass conflict because defenders are attached to receivers, not zones. The LB/safety responsible for the TE or slot is in man coverage on that player regardless of whether it is run or pass -- so the QB's read of "did the LB vacate?" is irrelevant.

**However:** Man coverage has its own vulnerabilities. It is susceptible to pick/rub routes, and the man defenders can get washed by blocks when the play is a run. Advanced RPO teams also have specific RPO concepts designed to beat man coverage (rub-route RPOs, crossing route RPOs).

### 4. Bracket Coverage (Cover 4 / Quarters)
A hybrid man-zone scheme that brings second-level and third-level defenders into the run game based on the offensive formation. Corners and safeties read the release of receivers to determine run or pass, rather than relying on a single LB to be right.

### 5. QB Spy
When the QB is a dual-threat runner, defenses assign one defender (usually a LB or safety) to shadow the QB. The spy does not fill a gap or drop into coverage -- he mirrors the QB. If the QB keeps, the spy tackles him. If the QB throws, the spy is in position to break on the ball.

This is a **constraint counter** -- it does not stop the RPO read itself but removes the "keep and run" third option.

### 6. Aggressive Pass Rush with Disciplined Ends
If the DL can generate pressure while the DEs maintain contain (do not crash inside), the RPO timing is disrupted. The mesh point depends on the OL being in run-block mode for 1-2 seconds. If the DL converts to pass rush immediately, the QB has no time for the read.

### 7. "Cut" Corner Technique
The cornerback reads the QB's initial steps. If the corner reads run, he abandons his coverage responsibility and dives into the run game as an additional tackler. This is risky (if the QB pulls and throws, the WR is uncovered) but can be devastating against run-heavy RPO teams.

**TORCH validation:** The archetype doc says the Wolves defense (zone read / scrape exchange) is STRONG vs. Stags offense (Spread RPO), and the reason given is "zone reads the RPO, doesn't bite." This is exactly correct. The Wolves defense description includes:
- Gap-sound zone defense (Cover 3)
- LBs who "read mesh points" and "fill the correct gap every time"
- Scrape exchange (Travis McBride "scrapes over the top on zone read")
- "Nobody freelances"

This is a textbook RPO counter. **CONFIRMED -- the matchup is accurate.**

The doc also says the Stags offense is STRONG vs. Serpents defense (pattern match), because "RPO attacks before disguise resolves." This is also accurate: pattern-matching coverage requires 1-2 seconds for defenders to sort out their assignments, and the RPO attacks within that window. The zone-blocking run game also stresses LBs who are trying to pattern-match receivers rather than fitting run gaps. **CONFIRMED.**

---

## 8. Stags Offensive Play Cards (10 Plays)

These plays represent the Crestview Stags' Spread RPO identity -- a tempo-driven, dual-threat offense where the run game is real, the pass game punishes overcommitment, and the QB is a weapon.

### Play 1
```
Name: Inside Zone
Category: RUN
Risk: LOW
Flavor: Bread and butter
```
*Real concept: Inside zone is the foundational run play of every spread RPO offense. The RB reads the combo blocks and finds the crease. This is the play that makes everything else work -- if the defense cannot stop inside zone, the RPO read is irrelevant.*

### Play 2
```
Name: Bubble Screen RPO
Category: RPO
Risk: LOW
Flavor: Numbers don't lie
```
*Real concept: Inside zone blocking with a bubble screen tagged to the slot receiver. QB reads the apex defender (flat LB or walked-out safety). If the apex steps up for run support, the bubble is thrown to the slot with blockers in front. If the apex stays wide, the RB gets the ball on inside zone. The most fundamental RPO in football.*

### Play 3
```
Name: Stick RPO
Category: RPO
Risk: MED
Flavor: Pick your poison
```
*Real concept: Inside zone with a stick route (5-yard hitch) by the slot or TE and a flat route underneath. QB reads the MIKE or WILL LB post-snap. LB fills the run? Throw the stick behind him. LB drops? Give inside zone. This is a "second-level" RPO -- more advanced than bubble but still a quick, safe throw.*

### Play 4
```
Name: QB Power Read
Category: OPTION
Risk: MED
Flavor: Your move, end man
```
*Real concept: Power read / inverted veer. The RB and QB exchange responsibilities based on the DE's reaction. If the DE squeezes inside to take the RB, the QB keeps and runs outside with a pulling guard as a lead blocker. If the DE stays wide, the RB hits the inside lane. The QB-as-runner constraint play.*

### Play 5
```
Name: Pop Pass
Category: RPO
Risk: HIGH
Flavor: Eyes on the safety
```
*Real concept: Inside zone run action with a deep shot -- post, seam, or go route -- tagged on top. QB reads the safety. If the safety bites on the run fake and comes down, the deep receiver is one-on-one. If the safety stays deep, the QB gives inside zone. This is the explosive-play RPO, the one that produces 40+ yard touchdowns.*

### Play 6
```
Name: Jet Sweep
Category: RUN
Risk: MED
Flavor: Get to the edge
```
*Real concept: Pre-snap motion by the slot WR across the formation, taking a handoff from the QB on a sweep to the perimeter. Attacks the edge and forces the defense to account for horizontal speed. Also sets up jet sweep fakes into play-action or RPO reads.*

### Play 7
```
Name: QB Draw
Category: QB RUN
Risk: MED
Flavor: Kept it himself
```
*Real concept: The constraint play that punishes disciplined defenses. When LBs stay home in their gaps and do not bite on RPO reads, the QB fakes the mesh, pauses, and then runs through the vacated area. Works best when the defense is playing zone discipline (i.e., exactly what the Wolves would do).*

### Play 8
```
Name: Glance Slant RPO
Category: RPO
Risk: MED
Flavor: Blink and it's gone
```
*Real concept: Inside zone run with a quick glance/slant route by an inside receiver. QB reads the third level (safety). This is more aggressive than bubble or stick because the throw goes over the middle, but the quick timing (1-2 steps) keeps it safe. A staple of tempo-driven RPO offenses.*

### Play 9
```
Name: Swing Pass
Category: SCREEN
Risk: LOW
Flavor: Catch and go
```
*Real concept: Quick swing or flare pass to the RB in the flat. Can function as a pre-snap RPO alert (QB sees numbers to the RB's side) or as a standalone quick pass. Gets the ball to the RB in space with blockers in front. A tempo play -- snap, throw, gain 5 yards, huddle up, repeat.*

### Play 10
```
Name: Zone Read Keep
Category: QB RUN
Risk: HIGH
Flavor: He's loose!
```
*Real concept: The classic zone read -- inside zone blocking with the QB reading the backside DE. If the DE crashes to chase the RB, the QB keeps and runs. If the DE stays, the QB gives. When the QB is an elite runner (like Micah Strand), this is a game-breaking play. High risk because the QB takes hits, but high reward with potential for explosive gains.*

---

### Play Distribution Summary

| Category | Count | Risk Distribution |
|----------|-------|-------------------|
| RPO | 4 | 1 LOW, 2 MED, 1 HIGH |
| RUN | 2 | 1 LOW, 1 MED |
| QB RUN | 2 | 1 MED, 1 HIGH |
| OPTION | 1 | 1 MED |
| SCREEN | 1 | 1 LOW |
| **Total** | **10** | **3 LOW, 5 MED, 2 HIGH** |

**Risk balance:** 3 LOW / 5 MED / 2 HIGH. This reflects the Stags' identity -- they are not reckless, but they play on the edge. Most plays have a medium-risk profile because RPO inherently involves a read that can go wrong, but the base concepts (inside zone, bubble screen, stick) are safe. The high-risk plays (pop pass, zone read keep) are the game-breakers that produce the 52-48 scores the archetype doc describes.

**Run/Pass balance:** 5 plays have a run component as primary (Inside Zone, QB Power Read, Jet Sweep, QB Draw, Zone Read Keep). 4 plays are RPO (can go either way). 1 play is a pure pass (Swing Pass). This is accurate for a spread RPO offense -- the run game is real and central, not window dressing.

**QB as a weapon:** 2 plays specifically feature the QB as a runner (QB Draw, Zone Read Keep), and all 4 RPOs give the QB the option to run if neither the give nor the throw is available. Micah Strand touches the ball on every play and is a running threat on 6 of 10.

---

## Overall Validation Summary

| Element | Status | Notes |
|---------|--------|-------|
| Formation (shotgun, spread) | CONFIRMED | Accurate to real-world RPO offenses |
| Personnel (10/11, 1 RB, 2-4 WR) | CONFIRMED | Stags roster correctly reflects spread personnel |
| RPO mechanic (read one defender) | CONFIRMED | Post-snap LB/DE read is textbook |
| Tempo integration | CONFIRMED | "Strike First, Strike Fast" fits the tempo-RPO marriage |
| Inside zone as base run | CONFIRMED | Correctly identified as the foundational concept |
| Dual-threat QB as weapon | CONFIRMED | Micah Strand's design matches real RPO QBs (Murray, Hurts, Fields) |
| Real-world inspirations | CONFIRMED | Lincoln Riley Oklahoma and Chip Kelly Oregon are excellent references |
| Counter matchup (zone discipline) | CONFIRMED | Wolves defense is a textbook RPO counter |
| Strong matchup (vs pattern match) | CONFIRMED | RPO attacks before disguise resolves -- accurate |
| Scheme tags | CONFIRMED | `spread`, `rpo`, `inside_zone`, `bubble_screen`, `tempo`, `dual_threat` are all valid |

**No significant inaccuracies found.** The Stags' Spread RPO offense is well-researched and faithfully represents the modern college RPO system. The only enhancement suggestion: consider adding `power_read` or `zone_read` to the scheme tags to reflect the QB run game dimension.

---

## Sources

- [Pre and Post-Snap RPO - AFCA](https://www.afca.com/pre-and-post-snap-rpo/)
- [The Quintessential Guide to RPO Plays - Football Play Card](https://footballplaycard.com/blog/the-quintessential-guide-to-run-pass-option-plays/)
- [Understanding the RPO in Football - Football Advantage](https://footballadvantage.com/rpo-football/)
- [X's & O's: RPO Simplified - AFCA Insider](https://insider.afca.com/xs-os-run-pass-options-rpo-simplified/)
- [Run-Pass Option - Wikipedia](https://en.wikipedia.org/wiki/Run-pass_option)
- [Pairing the Peek RPO with Power, Counter and Pin and Pull Runs - X&O Labs](https://www.xandolabs.com/the-lab/offense/personnel/20-personnel-concepts/pairing-the-peek-rpo-with-power-counter-and-pin-and-pull-runs/)
- [Quarterback Outside Zone/Bubble RPO - X&O Labs](https://www.xandolabs.com/the-lab/offense/personnel/10-00-personnel-concepts/quarterback-outside-zone-bubble-rpo/)
- [Football Fundamentals: RPO Pass Concepts Behind the LOS](http://breakdownsports.blogspot.com/2018/08/football-fundamentals-rpo-pass-concepts-bubble-tunnel-smoke-now-flare-swing.html)
- [Chip Kelly Offense 101: Packaged Plays - Niners Nation](https://www.ninersnation.com/2016/2/19/11037174/chip-kelly-offense-101-constraint-rpos-packaged-plays-screens)
- [Oregon Spread Offense: No-Huddle - FishDuck](https://fishduck.com/the-oregon-football-repository-by-fishduck-com/the-oregon-football-analysis-library-by-fishduck-com/oregon-spread-offense/the-chip-kelly-mark-helfrich-and-scott-frost-oregon-spread-offense/oregon-spread-offense-no-huddle-under-chip-kelly-mark-helfrich-and-scott-frost/)
- [The New Old School (Chip Kelly) - Grantland](https://grantland.com/features/the-success-chip-kelly-oregon-ducks-offense-more-familiar-seems/)
- [How Lincoln Riley Developed Murray, Mayfield, Hurts - ESPN](https://www.espn.com/nfl/story/_/id/34689587/how-lincoln-riley-helped-develop-kyler-murray-baker-mayfield-jalen-hurts-nfl-starters)
- [The Architect (Art Briles) - Grantland](https://grantland.com/features/chris-brown-how-art-briles-potent-offense-made-baylor-national-title-contender/)
- [The System is the Star (Baylor Offense) - Sports Illustrated](https://www.si.com/college/2016/10/18/system-star-baylors-offense-spreading-around-college-football)
- [Defending the RPO: Scrape-Exchange, Bracket Coverage, Cut Corners](https://in-thinair.com/2015/06/05/defending-the-rpo-the-scrape-exchange-bracket-coverage-and-cut-corners/)
- [RPO: How to Defend the Run-Pass Option - USA Football](https://blogs.usafootball.com/blog/4162/rpo-how-to-defend-the-run-pass-option)
- [Indiana Hoosiers RPO Offensive Scheme Deep Dive - Hoosier Tailgate](https://hoosiertailgate.com/the-hoosiers-rpo-offensive-scheme-a-deep-dive-into-its-effectiveness)
- [Zone Read Has Stood the Test of Time - PFF](https://www.pff.com/news/nfl-college-football-offenses-adapt-zone-read-has-stood-test-of-time)
- [One Simple RPO for Inside Zone Read - Spread Offense Football](https://spreadoffensefootball.com/one-simple-rpo-for-inside-zone-read/)
- [No Huddle Tempos, Procedures, Peeks and Tricks - Smart Football](https://www.smartfootball.com/game-management/no-huddle-tempos-procedures-peeks-and-tricks)
- [How to Create Pre-Snap Advantages Using Tempo - USA Football](https://blogs.usafootball.com/blog/6606/how-to-create-pre-snap-advantages-using-tempo)
- [Implementing Clemson's RPO Package - X&O Labs](https://www.xandolabs.com/the-lab/offense/rpos/post-snap-manipulations/implementing-clemsons-qb-designed-runs-and-rpo-package-case-3-clemsons-rpo-run-pass-option-package/)
