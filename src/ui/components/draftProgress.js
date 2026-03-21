/**
 * TORCH — Draft Progress Stepper
 * 4-step progress indicator: TEAM → PLAYERS → PLAYS → START GAME
 * Current step in gold. Completed steps have checkmark. Future steps dimmed.
 * This is NOT navigation — display only.
 */

export function buildDraftProgress(currentStep) {
  // Inject animations if not already present
  if (!document.getElementById('draft-progress-style')) {
    const style = document.createElement('style');
    style.id = 'draft-progress-style';
    style.textContent = `
      @keyframes step-pulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 8px rgba(187,0,255,0.4); }
        50% { transform: scale(1.2); box-shadow: 0 0 15px rgba(187,0,255,0.8); }
      }
      @keyframes check-glow {
        0%, 100% { filter: brightness(1); transform: scale(1); }
        50% { filter: brightness(1.5); transform: scale(1.2); }
      }
      @keyframes line-flow {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
    `;
    document.head.appendChild(style);
  }

  const container = document.createElement('div');
  container.style.cssText =
    'display:flex;align-items:center;padding:8px 14px;background:rgba(0,0,0,0.3);flex-shrink:0;';

  const steps = ['TEAM', 'ROSTER', 'PLAYS', 'PLAY'];

  steps.forEach((label, i) => {
    const stepIdx = i + 1;
    const isPast = stepIdx < currentStep;
    const isCurrent = stepIdx === currentStep;

    // Step pill
    const pill = document.createElement('div');
    pill.style.cssText =
      'display:flex;align-items:center;gap:4px;' +
      'font-family:"Rajdhani",monospace;font-size:8px;letter-spacing:.5px;' +
      'color:' + (isCurrent ? '#bb00ff' : isPast ? '#aaa' : '#444') + ';' +
      'transition:color 0.3s;';

    // Checkmark for completed, number for current/future
    const indicator = document.createElement('span');
    indicator.style.cssText = 'width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;';
    
    if (isPast) {
      indicator.textContent = '\u2713';
      indicator.style.cssText += 'color:#00ff88;font-weight:bold;text-shadow:0 0 8px rgba(0,255,136,0.8);animation:check-glow 2s infinite;background:rgba(0,255,136,0.1);border:1px solid #00ff88;';
    } else {
      indicator.textContent = stepIdx;
      indicator.style.fontSize = '7px';
      indicator.style.cssText += (isCurrent
          ? 'background:#bb00ff;color:#fff;box-shadow:0 0 12px rgba(187,0,255,0.6);animation:step-pulse 1.5s infinite ease-in-out;'
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
      const isLinePast = (i + 1) < currentStep;
      const isLineActive = (i + 1) === currentStep - 1;

      line.style.cssText =
        'flex:1;height:2px;margin:0 6px;position:relative;overflow:hidden;' +
        'background:' + (isLinePast ? (isLineActive ? 'rgba(0,255,136,0.2)' : '#00ff88') : '#222') + ';';
      
      if (isLineActive) {
        const flow = document.createElement('div');
        flow.style.cssText = 'position:absolute;inset:0;background:linear-gradient(90deg,transparent,#00ff88,transparent);width:50%;animation:line-flow 1.5s infinite linear;';
        line.appendChild(flow);
      }
      container.appendChild(line);
    }
  });

  return container;
}
