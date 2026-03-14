/**
 * TORCH — Draft Progress Stepper
 * 4-step progress indicator: TEAM → PLAYERS → PLAYS → START GAME
 * Current step in gold. Completed steps have checkmark. Future steps dimmed.
 * This is NOT navigation — display only.
 */

export function buildDraftProgress(currentStep) {
  const container = document.createElement('div');
  container.style.cssText =
    'display:flex;align-items:center;padding:8px 14px;background:rgba(0,0,0,0.3);flex-shrink:0;';

  const steps = ['TEAM', 'PLAYERS', 'PLAYS', 'START GAME'];

  steps.forEach((label, i) => {
    const stepIdx = i + 1;
    const isPast = stepIdx < currentStep;
    const isCurrent = stepIdx === currentStep;

    // Step pill
    const pill = document.createElement('div');
    pill.style.cssText =
      'display:flex;align-items:center;gap:4px;' +
      'font-family:"Press Start 2P",monospace;font-size:6px;letter-spacing:.5px;' +
      'color:' + (isCurrent ? 'var(--a-gold,#ffcc00)' : isPast ? '#aaa' : '#444') + ';' +
      'transition:color 0.3s;';

    // Checkmark for completed, number for current/future
    const indicator = document.createElement('span');
    if (isPast) {
      indicator.textContent = '\u2713';
      indicator.style.cssText = 'color:#00ff88;font-size:8px;';
    } else {
      indicator.textContent = stepIdx;
      indicator.style.cssText =
        'width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;' +
        'font-size:6px;flex-shrink:0;' +
        (isCurrent
          ? 'background:var(--a-gold,#ffcc00);color:#000;box-shadow:0 0 8px rgba(255,204,0,0.4);'
          : 'background:#222;color:#555;');
    }
    pill.appendChild(indicator);

    const txt = document.createElement('span');
    txt.textContent = label;
    pill.appendChild(txt);

    container.appendChild(pill);

    // Connector line between steps (not after last)
    if (i < steps.length - 1) {
      const line = document.createElement('div');
      line.style.cssText =
        'flex:1;height:1px;margin:0 6px;' +
        'background:' + (isPast ? '#00ff8866' : '#222') + ';';
      container.appendChild(line);
    }
  });

  return container;
}
