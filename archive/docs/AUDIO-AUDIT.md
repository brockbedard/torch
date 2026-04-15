# Audio Audit — 2026-03-27

## Status
- **howler:** v2.2.4 installed
- **jsfxr:** fully removed (no imports, no dependency)
- **sound.js:** all 27 SND methods are noop functions (silenced)
- **audioManager.js:** exists with crowd ambient states but uses wrong file paths (expects .ogg, actual files are .wav)
- **Audio files:** 32 SFX in public/audio/sfx/, 3 crowd loops in public/audio/crowd/, music/ empty
- **SND.* calls:** 51+ calls across 12 files, all mapping to noop
- **AudioStateManager:** imported in 6 screen files for ambient state management

## What Needs to Change
1. Rewrite audioManager.js with SFX pools + correct crowd file paths
2. Rewrite sound.js to delegate to audioManager (play SFX via pools with pitch/vol randomization)
3. Wire crowd ambient start/stop/intensity to game state changes
4. All existing SND.* calls stay — just make them call real sounds
