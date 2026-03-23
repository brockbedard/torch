# Accessibility and Usability Validation: "High-Voltage" Aesthetic

## Research Overview
The "High-Voltage" aesthetic—characterized by high-contrast neon, CRT flicker, and digital scrambling—is visually striking but poses significant risks to accessibility and usability. These effects can lead to eye strain, increased cognitive load, and, in severe cases, photosensitive seizures or motion sickness.

### Key Risks
- **Eye Strain & Fatigue:** Prolonged exposure to high-contrast colors (especially blue and red) and flickering elements (CRT scanlines/flicker) causes rapid eye muscle fatigue.
- **Cognitive Load:** Digital scrambling and visual noise (glitch effects) force the brain to work harder to filter out "trash" information to find critical gameplay data.
- **Photosensitivity:** Rapid changes in luminance or high-frequency flashing (3+ times per second) can trigger seizures in players with epilepsy.
- **Vestibular Issues:** Screen shake and rapid scrambling can cause nausea and motion sickness.

---

## Technical Standards & Guidelines
- **WCAG 2.1 Success Criterion 2.3.1 (Three Flashes or Below Threshold):** Content must not flash more than three times in any one-second period.
- **Flash Intensity:** Avoid luminance changes greater than 10% for high-frequency flashes.
- **Red Flash Warning:** Saturated red-to-black/white flashes are the highest risk; these must be avoided or strictly controlled.

---

## Suggested "Safety Valve" Settings
To preserve the "High-Voltage" vibe while ensuring the game is playable for everyone, the following settings should be implemented.

### 1. Global "Photosensitivity Mode"
- **Function:** A single toggle that instantly adjusts all visual effects to safe levels.
- **Impact:** Replaces rapid flickering with slow fades, limits luminance changes, and disables extreme digital scrambling.

### 2. Granular Intensity Sliders
Allow players to fine-tune the following (0% to 100%):
- **CRT Flicker/Scanlines:** Adjust the opacity and frequency of the scanline overlay and screen pulse.
- **Digital Scrambling (Glitch):** Control the amount of visual noise, pixel-shifting, and "tearing" during gameplay and UI transitions.
- **Screen Shake:** Adjust the magnitude of camera movement during high-impact events.
- **Chromatic Aberration:** Control the intensity of the color-fringing effect, which often causes nausea.

### 3. UI Stability & Hierarchy
- **Stable UI Toggle:** Critical gameplay information (Score, Timer, Power-ups) should be exempt from glitch/scramble effects by default or via a toggle.
- **Opaque UI Backgrounds:** Provide an option for solid, high-contrast backgrounds behind text to ensure readability regardless of background noise.

### 4. Color & Motion Mitigation
- **Desaturate Red Flashes:** Option to shift red-heavy glitch effects toward the orange or purple spectrum or reduce their saturation.
- **Persistent Center Dot:** A small, static dot in the center of the screen to help players with vestibular issues maintain a fixed reference point.
- **Static Scramble Alternatives:** Replace moving scramble/glitch effects with static "corrupted" textures that convey the same narrative theme without the flickering.

---

## Conclusion
The "High-Voltage" aesthetic is viable but requires a "Safety First" implementation strategy. By providing granular controls and a robust Photosensitivity Mode, we can maintain the intended grit and energy of the game without alienating players or causing physical discomfort.
