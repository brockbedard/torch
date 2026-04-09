# ElevenLabs SFX Prompts — TORCH Football

All sounds use the **ElevenLabs Sound Effects API** (`POST /v1/sound-generation`).
Format: WAV, 44.1kHz. Target duration listed per sound.

## Prompt Formula
**Material + Action + Environment + Quality modifier**
- Be literal and physical. Describe the real-world object and what it's doing.
- Add duration hint: "0.2 seconds", "short", "brief", "sustained".
- Add space hint when relevant: "stadium reverb", "indoor arena", "outdoor field", "dry and close".
- Avoid adjectives like "epic" or "cinematic" — describe the physical source instead.

---

## UI Sounds

### `menuTap` (3 variants) → `menu_tap_01.wav` … `03.wav`
```
Soft plastic button tap, clean click transient, minimal sustain, 0.1 seconds, dry studio recording
Rubber dome button press, light crisp tap, slightly muted, 0.1 seconds, no reverb
Muted polished surface tap, soft click, clean attack with quick decay, 0.08 seconds
```

### `click` (3 variants) → `click_01.wav` … `03.wav`
```
Clean digital UI click, very short bright tap, 0.05 seconds, dry and precise
Light fingernail tap on glass surface, crisp high frequency, minimal reverb, 0.06 seconds
Sharp single tap, plastic surface, clean transient, 0.05 seconds
```

### `chime` (4 variants) → `chime_01.wav` … `04.wav`
```
Small crystal bell struck gently, clear tone with natural decay, 0.5 seconds, pleasant and bright
Soft metal triangle ding, 440Hz resonance, warm overtones, 0.4 seconds, light room reverb
Glass bell tap, bright and pure tone, musical reward sound, 0.45 seconds, smooth decay
Small xylophone key struck softly, warm wooden resonance, 0.5 seconds, clean and melodic
```

### `scoreTick` (3 variants) → `score_tick_01.wav` … `03.wav`
```
Mechanical typewriter key press, sharp click, dry and precise, 0.07 seconds
Hard wood block tap, bright transient, counter click sound, 0.08 seconds
Plastic clicker press, crisp and decisive, score incrementing sound, 0.07 seconds
```

### `shimmer` (3 variants) → `shimmer_01.wav` … `03.wav`
```
Metallic shimmer sweep, high frequency sparkle cascade, ascending glitter sound, 0.5 seconds
Twinkling fairy shimmer, crystalline high frequency sparkle, magical reveal, 0.6 seconds
Shimmering metallic sweep, bell-like sparkles in sequence, upward pitch sweep, 0.5 seconds
```

### `ping` (2 variants) → `ping_01.wav` … `02.wav`
*Used for combo pops — played pitch-shifted per step. Needs to be a clean musical tone.*
```
Pure bell ping, clean sustained tone, 600Hz, smooth attack and decay, 0.35 seconds, no reverb
Crystal glass ping, resonant and musical, pure tone, 0.3 seconds, minimal reverb
```

### `jackpot` (1) → `jackpot_01.wav`
```
Slot machine jackpot cascade, coins falling into tray, ascending chime sequence, celebratory rush of metallic sounds, 1.2 seconds
```

### `clockTick` (1) → `clock_tick_01.wav`
```
Large mechanical clock tick, stadium scoreboard sound, sharp transient with slight room reverb, 0.15 seconds
```

---

## Card Sounds

### `cardDeal` (4 variants) → `card_deal_01.wav` … `04.wav`
```
Single playing card dealt quickly onto felt table, papery swish and light slap, 0.15 seconds
Playing card sliding across smooth surface, crisp paper sound, slight air displacement, 0.12 seconds
Playing card snapped from deck, sharp paper flutter, dry and punchy, 0.1 seconds
Card tossed onto felt surface, papery thwip, light and airy impact, 0.13 seconds
```

### `cardPlace` (4 variants) → `card_place_01.wav` … `04.wav`
```
Playing card placed firmly on table, satisfying dull thud, wood table resonance, 0.2 seconds
Card slapped down confidently on felt, muted thud, solid surface impact, 0.18 seconds
Card placed with authority, dry thud on hard surface, 0.2 seconds, minimal sustain
Single card dropped onto stack, paper and surface impact, slightly hollow, 0.15 seconds
```

### `cardFlipSlam` (1) → `card_flip_slam_01.wav`
```
Playing card slammed face-up onto hard surface, whoosh of paper then sharp thud, reveal impact, 0.4 seconds
```

### `cardFlipDramatic` (2 variants) → `card_flip_dramatic_01.wav` … `02.wav`
```
Playing card flipped dramatically, papery whoosh and decisive snap, high-stakes reveal, 0.45 seconds
Card flipped with authority, air displacement flutter then solid thud on surface, 0.4 seconds
```

### `cardDiscard` (2 variants) → `card_discard_01.wav` … `02.wav`
```
Playing card flicked away dismissively, short swipe and flutter, paper resonance, 0.2 seconds
Card discarded with a wrist flick, brief whoosh and light impact, 0.18 seconds
```

---

## Football Sounds

### `snap` (2 variants) → `snap_01.wav` … `02.wav`
```
American football snapped between players, leather ball hitting open hands, sharp crack, 0.2 seconds, outdoor field
Football center snap, leather impact on palms, sharp thwack, slight hollow resonance, 0.18 seconds
```

### `throw` (1) → `throw_01.wav`
```
Spiral football thrown hard, leather ball spinning through air, soft whoosh of air, 0.4 seconds, outdoor
```

### `catch` (1) → `catch_01.wav`
```
Football caught firmly in hands, leather thwap, hands absorbing ball impact, 0.2 seconds
```

### `kick` (1) → `kick_01.wav`
```
Football kicked hard, leather cleat contact, solid resonant thud, 0.25 seconds, slight outdoor reverb
```

### `kickThud` (1) → `kick_thud_01.wav`
```
Football punted, heavy leather boot contact on ball, powerful low thud with air displacement, outdoor stadium, 0.3 seconds
```

### `whistle` (2 variants) → `whistle_01.wav`, `whistle_short_01.wav`
```
Sports referee pea whistle, short sharp blast, classic metal whistle, 0.3 seconds, slight stadium reverb
Very short referee whistle toot, quick and sharp, 0.15 seconds, dry
```

### `whistleLong` (1) → `whistle_long_01.wav`
*Used at end of half and end of game.*
```
Long sustained referee whistle blast, end-of-half signal, 1.5 seconds, loud and authoritative, college football stadium reverb
```

---

## Impact Sounds

### `hitComposite` (4 variants) → `hit_composite_01.wav` … `04.wav`
*Standard tackles. Layered leather pads + body contact.*
```
Football tackle impact, shoulder pads colliding with body, composite thud, grass field, 0.25 seconds
Player collision, padded equipment impact, flesh and gear contact, brief and punchy, 0.2 seconds
Tackle sound, body hitting turf, layered padding crack and dirt, outdoor field, 0.22 seconds
Football hit, padded equipment collision, clean impact, slight outdoor reverb, 0.2 seconds
```

### `hitHeavy` (6 variants) → `hit_heavy_01.wav` … `06.wav`
*Sacks, big hits. More bass, more impact.*
```
Massive football sack, heavyweight collision, deep bass impact, equipment crunch, stadium reverb, 0.35 seconds
Heavy tackle, quarterback hit hard, powerful collision, low frequency thud, outdoor field, 0.3 seconds
Bone-rattling hit, deep reverberant impact, football padding and flesh, substantial bass, 0.35 seconds
Crushing tackle, very heavy body impact, low thud with slight dirt kick, 0.3 seconds
Big hit, shoulder pad collision, meaty impact, heavy and authoritative, 0.32 seconds
Huge defensive tackle, multiple player pile-on, heavy layered impact, stadium atmosphere, 0.4 seconds
```

### `hitModerate` (2 variants) → `hit_moderate_01.wav` … `02.wav`
```
Moderate football tackle, clean medium hit, padding contact, 0.22 seconds, natural field acoustics
Standard player collision, body contact, brief and clean, medium intensity, 0.2 seconds
```

### `resultSlam` (1) → `result_slam_01.wav`
*The big result reveal stamp.*
```
Heavy rubber stamp slammed onto surface, verdict sound, deep authoritative thud with slight resonance, 0.3 seconds, dry room
```

---

## Cinematic Sounds

### `anvilImpact` (1) → `anvil_impact_01.wav`
```
Massive metal anvil dropped on concrete, cinematic heavy impact, deep bass thud with metallic ring that decays, 0.6 seconds
```

### `bassDrop` (2 variants) → `bass_drop_01.wav` … `02.wav`
*Hitstop sack moment (Hitstop 2.0 feature).*
```
Sub-bass cinematic drop, very deep low frequency impact, 0.5 seconds, felt in chest, sharp attack with tail
Electronic bass impact, deep sub rumble, sharp onset, cinema sound design, 0.45 seconds
```

### `victoryImpact` (2 variants) → `victory_impact_01.wav` … `02.wav`
```
Triumphant orchestral impact, brass stab with snare hit, victory sting, upward energy, 0.6 seconds
Win stinger, upward brass sweep into crash cymbal, celebratory impact, 0.55 seconds
```

### `horn` (3 variants) → `horn_01.wav` … `03.wav`
```
Stadium air horn blast, large outdoor venue, reverberant echo, 0.8 seconds, sustained tone
Deep foghorn blast, resonant and powerful, college football game horn, 0.9 seconds, outdoor reverb
Stadium game horn signal, clear medium tone, 0.7 seconds, slight arena echo
```

### `whooshIn` (2 variants) → `whoosh_in_01.wav` … `02.wav`
*UI elements entering, card tray appearing.*
```
Fast whoosh in, object arriving quickly from right, air displacement, 0.2 seconds, dry
Quick soft swipe in, gentle wind swoosh, directional movement arriving, 0.18 seconds
```

### `broadcastSweep` (1) → `broadcast_sweep_01.wav`
*Screen transitions, broadcast TV feel.*
```
Television broadcast transition sweep, professional news swipe sound, cinematic left-to-right whoosh, 0.4 seconds
```

---

## Special / Cinematic

### `ignite` (1) → `ignite_01.wav`
*Torch card activation, TORCH brand moment.*
```
Flame igniting suddenly, gas fire burst, whoosh of air then sustained crackle, torch lighting, 0.6 seconds
```

### `coinFlip` (1) → `coin_flip_01.wav`
*Pregame coin toss.*
```
Metal coin spun into air, spinning ring resonance, lands with a clear clink on hard surface, 0.9 seconds, clean dry acoustics
```

### `gameOverLoss` (1) → `game_over_loss_01.wav`
```
Defeat musical sting, low descending tones, somber brass fall, understated sadness, not comedic, 0.8 seconds
```

---

## Crowd One-Shots

### `crowdCheer` (1) → `crowd_cheer_01.wav`
```
College football stadium crowd erupting in cheer, 30,000 fans, organic rising reaction, 1.5 seconds, outdoor stadium reverb
```

### `crowdGroan` (1) → `crowd_groan_01.wav`
```
Stadium crowd groaning in collective disappointment, 30,000 fans, deflating exhale and moan, 1.5 seconds, outdoor reverb
```

### `bigPlayCrowd` (2 variants) → `big_play_01.wav` … `02.wav`
```
Stadium crowd reacting to a big play, rising excitement wave, 30,000 fans building, 2 seconds, outdoor
Large college football crowd big play reaction, swell of cheering from rising anticipation, 1.8 seconds, outdoor stadium
```

### `groan` (2 variants) → `groan_01.wav` … `02.wav`
*Turnover reaction — opponent scores or forces turnover.*
```
Large stadium crowd groaning, turnover disappointment, collective deflated reaction, 1.5 seconds, outdoor reverb
Stadium groan, collective crowd disappointment falling sharply, 1.5 seconds, college football outdoor
```

### `victoryCrowd` (1) → `victory_crowd_01.wav`
```
Stadium crowd celebrating final victory, sustained loud cheering, 30,000 fans, 3 seconds, triumphant outdoor reverb
```

---

## Crowd Ambient Loops (most important)

These need to be **seamless loops**. Request the longest duration ElevenLabs offers.
All three tiers crossfade in the AudioManager — they must have consistent tonal character.

### `crowd_low` → `crowd_low.mp3` + `crowd_low.webm`
*Normal play baseline — quiet, anticipatory. This plays most of the game.*
```
College football stadium ambient crowd murmur, 30,000 people in anticipation, low constant rumble and distant chatter, outdoor stadium, seamless loop, minimal variation
```

### `crowd_mid` → `crowd_mid.mp3` + `crowd_mid.webm`
*Big moment / 2-minute drill — noticeable energy increase.*
```
College football stadium crowd at moderate excitement, mix of cheering and murmur, rising energy, outdoor stadium atmosphere, seamless loop, sustained
```

### `crowd_high` → `crowd_high.mp3` + `crowd_high.webm`
*Touchdown / peak intensity — the contrast that makes TDs feel huge.*
```
College football stadium crowd at peak intensity, 30,000 fans roaring loudly, sustained loud cheering, outdoor stadium, seamless loop, no musical content, pure crowd noise
```

---

## Generation Notes

- **Pool size:** Generate 2–4 variants per pool (slight pitch/tone differences for natural rotation)
- **Duration:** ElevenLabs SFX max is ~22 seconds. Loops need to be trimmed and looped in a DAW or via ffmpeg
- **Format:** Download as MP3, convert to WebM with: `ffmpeg -i input.mp3 -c:a libopus output.webm`
- **Naming:** Match exactly what's in `audioManager.js` loadPool calls (e.g. `hit_composite_01.wav`)
- **Output path:** `/public/audio/sfx/` for SFX, `/public/audio/crowd/` for crowd

## Making Seamless Loops (crowd)
```bash
# Trim silence off ends, then crossfade loop with ffmpeg
ffmpeg -i crowd_low_raw.mp3 -af "afade=t=out:st=28:d=2,aloop=loop=-1:size=2147483647" -t 30 crowd_low.mp3
# Or use Audacity: Effect > Crossfade Loops
```
