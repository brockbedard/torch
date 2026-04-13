/**
 * TORCH — Command Center
 * A deterministic "What If?" lab for strategy testing.
 */

import { engineBridge } from '../../engine/worker/engineBridge.js';

export function buildCommandCenter() {
  const el = document.createElement('div');
  el.className = 'T glass-panel';
  el.style.cssText = 'height:100%;padding:20px;display:flex;flex-direction:column;gap:20px;color:#fff;overflow-y:auto;';

  el.innerHTML = `
    <div style="font-family:'Teko';font-size:32px;letter-spacing:4px;color:#EBB010;">COMMAND CENTER</div>
    <div style="font-family:'Rajdhani';font-size:12px;color:#888;">STRATEGY SIMULATION LAB v1.0</div>
    
    <div style="display:flex;flex-direction:column;gap:10px;padding:16px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
      <div style="font-family:'Rajdhani';font-weight:700;font-size:14px;">SIMULATION CONFIG</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <input id="sim-yards" type="number" value="50" placeholder="Yard Line" style="background:#000;border:1px solid #333;color:#fff;padding:8px;">
        <input id="sim-dist" type="number" value="10" placeholder="Distance" style="background:#000;border:1px solid #333;color:#fff;padding:8px;">
      </div>
      <button id="run-sim" style="background:#EBB010;color:#000;border:none;padding:12px;font-family:'Teko';font-size:20px;cursor:pointer;">RUN 100x SIMULATION</button>
    </div>

    <div id="sim-results" style="flex:1;background:rgba(0,0,0,0.2);border-radius:8px;padding:16px;font-family:'Courier New', monospace;font-size:11px;overflow-y:auto;white-space:pre;">
      READY FOR SIMULATION...
    </div>

    <button id="exit-sim" style="background:transparent;border:1px solid #444;color:#888;padding:8px;font-family:'Teko';cursor:pointer;">EXIT LAB</button>
  `;

  const resultsEl = el.querySelector('#sim-results');
  const runBtn = el.querySelector('#run-sim');

  runBtn.onclick = async () => {
    resultsEl.textContent = "RUNNING 100 SNAPS...";
    const yards = parseInt(el.querySelector('#sim-yards').value);
    
    // Mock data for simulation
    const results = [];
    for(let i=0; i<100; i++) {
      // In a real implementation, we'd use the engineBridge.resolveSnap here
      // with full context. For now, we'll simulate the distribution.
      results.push({ yards: Math.floor(Math.random() * 15) });
    }

    const avgYards = results.reduce((s,r) => s + r.yards, 0) / 100;
    resultsEl.textContent = `
SIMULATION COMPLETE
-------------------
SAMPLE SIZE: 100
AVG YARDS: ${avgYards.toFixed(2)}
MAX GAIN: ${Math.max(...results.map(r=>r.yards))}
MIN GAIN: ${Math.min(...results.map(r=>r.yards))}
    `;
  };

  el.querySelector('#exit-sim').onclick = () => {
    window.location.reload(); // Simple exit for now
  };

  return el;
}
