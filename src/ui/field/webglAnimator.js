/**
 * TORCH — WebGL Field Animator
 * Phase 5: Million Dollar Engine leap.
 * Wraps createWebGLFieldRenderer with high-performance animations and camera logic.
 */

import { createWebGLFieldRenderer } from './webglRenderer.js';
import { gsap } from 'gsap';

// Formation and mapping data (synced with fieldRenderer.js)
const PLAY_FORMATION_MAP = {
  DEEP:   'empty',
  SHORT:  'shotgun_deuce',
  QUICK:  'bunch',
  SCREEN: 'trips',
  RUN:    'iform_pistol',
};

const TEAM_FORMATION_POOLS = {
  sentinels: {
    RUN:    [['iform_pistol',55],['twins',30],['shotgun_deuce',15]],
    SHORT:  [['twins',35],['iform_pistol',35],['shotgun_deuce',25],['trips',5]],
    DEEP:   [['twins',35],['iform_pistol',25],['shotgun_deuce',25],['trips',15]],
    QUICK:  [['shotgun_deuce',40],['twins',35],['iform_pistol',15],['trips',10]],
    SCREEN: [['twins',40],['shotgun_deuce',30],['iform_pistol',20],['trips',10]],
  },
  wolves: {
    RUN:    [['shotgun_deuce',40],['iform_pistol',30],['trips',20],['twins',10]],
    SHORT:  [['shotgun_deuce',35],['trips',30],['twins',20],['iform_pistol',15]],
    DEEP:   [['trips',35],['shotgun_deuce',30],['empty',20],['twins',15]],
    QUICK:  [['shotgun_deuce',35],['trips',30],['twins',25],['empty',10]],
    SCREEN: [['trips',35],['shotgun_deuce',35],['twins',20],['empty',10]],
  },
  stags: {
    RUN:    [['shotgun_deuce',40],['trips',30],['twins',20],['iform_pistol',10]],
    SHORT:  [['trips',35],['shotgun_deuce',30],['empty',20],['bunch',15]],
    DEEP:   [['empty',30],['trips',30],['shotgun_deuce',25],['bunch',15]],
    QUICK:  [['trips',35],['shotgun_deuce',30],['empty',20],['bunch',15]],
    SCREEN: [['shotgun_deuce',35],['trips',35],['empty',20],['bunch',10]],
  },
  serpents: {
    RUN:    [['twins',30],['iform_pistol',25],['shotgun_deuce',25],['bunch',20]],
    SHORT:  [['bunch',25],['twins',25],['shotgun_deuce',20],['trips',20],['iform_pistol',10]],
    DEEP:   [['twins',25],['trips',25],['empty',20],['shotgun_deuce',20],['bunch',10]],
    QUICK:  [['bunch',30],['twins',25],['shotgun_deuce',25],['trips',20]],
    SCREEN: [['twins',30],['bunch',25],['shotgun_deuce',25],['trips',20]],
  },
};

function pickFormation(playType, teamId) {
  var pools = TEAM_FORMATION_POOLS[teamId];
  if (!pools) return 'shotgun_deuce';
  var pool = pools[playType];
  if (!pool) return 'shotgun_deuce';
  var total = pool.reduce((s, p) => s + p[1], 0);
  var r = Math.random() * total;
  for (var j = 0; j < pool.length; j++) {
    r -= pool[j][1];
    if (r <= 0) return pool[j][0];
  }
  return pool[pool.length - 1][0];
}

export function createWebGLFieldAnimator(width, height) {
  const renderer = createWebGLFieldRenderer(width, height);
  
  let _lastState = null;

  function render(state) {
    _lastState = state;
    // Map animator properties to renderer uniforms
    renderer.render({
      ballY: state.ballYard || 50,
      losY: state.losYard || state.ballYard || 50,
      fdY: state.firstDownYard || (state.losYard ? state.losYard + 10 : 60),
      ...state
    });
  }

  function scrollTo(fromYard, toYard, duration = 0.8) {
    const proxy = { y: fromYard };
    gsap.to(proxy, {
      y: toYard,
      duration: duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        render({ ..._lastState, ballYard: proxy.y, losYard: proxy.y });
      }
    });
  }

  async function animatePlay(snapResult, state) {
    _lastState = state;
    
    // Phase 6: Cinematic Replay Trigger (Tier 3 only)
    const dramaTier = getDramaTier(snapResult, state);
    if (dramaTier >= 3) {
      return await runCinematicReplay(snapResult, state);
    } else {
      render(state);
    }
  }

  function getDramaTier(res, s) {
    const r = res.result;
    if (r.isTouchdown || r.isInterception || r.isFumbleLost) return 3;
    if (r.isSack || r.yards >= 15) return 2;
    return 1;
  }

  async function runCinematicReplay(res, state) {
    const r = res.result;
    const rendererState = renderer.getState();
    const camera = rendererState.camera;
    const sceneRenderer = rendererState.renderer;
    const scene = rendererState.scene;
    
    // 1. Slow down time
    gsap.globalTimeline.timeScale(0.4);

    // 2. Camera Sweep
    const startY = camera.position.y;
    const targetY = (r.yards > 0) ? startY + (r.yards * 0.5) : startY;
    
    return new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.globalTimeline.timeScale(1.0);
          // Reset camera
          gsap.to(camera.position, { z: 10, duration: 0.5 });
          gsap.to(camera, { zoom: 1, duration: 0.5, onUpdate: () => camera.updateProjectionMatrix() });
          resolve();
        }
      });

      // Sweep camera down and forward
      tl.to(camera.position, {
        y: targetY,
        z: 5, // Lower angle
        duration: 2.0,
        ease: 'power1.inOut',
        onUpdate: () => renderer.render(state)
      });

      // Zoom in on the catch/impact point
      tl.to(camera, {
        zoom: 1.5,
        duration: 1.0,
        ease: 'sine.inOut',
        onUpdate: () => {
          camera.updateProjectionMatrix();
          renderer.render(state);
        }
      }, 0.5);
    });
  }

  function triggerShake(intensity, duration = 0.3) {}

  return {
    canvas: renderer.canvas,
    render: render,
    scrollTo: scrollTo,
    animatePlay: animatePlay,
    triggerShake: triggerShake,
    resize: renderer.resize,
    FORMATIONS: {}, 
    PLAY_FORMATION_MAP: PLAY_FORMATION_MAP,
    pickFormation: pickFormation
  };
}
