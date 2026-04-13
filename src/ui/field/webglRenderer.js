/**
 * TORCH — WebGL Field Renderer (Three.js)
 * Phase 5: Million Dollar Engine leap.
 * Replaces Canvas2D with a shader-driven 3D scene.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

const CFG = {
  bg: 0x050a08,
  turf: 0x0a140c,
  yardColor: 0xffffff,
  goalColor: 0xffa014,
  losColor: 0x3b82f6,
  fdColor: 0xfbbf24,
  visibleYards: 25,
};

const TURF_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const TURF_FRAGMENT_SHADER = `
  varying vec2 vUv;
  uniform vec3 color;
  uniform float time;
  uniform float ballY;
  uniform float turfWear;
  
  void main() {
    // 5-yard stripes
    float stripes = step(0.5, fract(vUv.y * 12.0)); // 120 yards / 5 = 24 segments
    vec3 finalColor = color;
    finalColor += stripes * 0.02;
    
    // Scuffing / Wear
    float wear = fract(sin(dot(vUv.xy, vec2(12.9898, 78.233))) * 43758.5453);
    if (wear < turfWear * 0.1) finalColor *= 0.8;

    // Vignette
    float vig = 1.0 - distance(vUv, vec2(0.5, 0.5)) * 0.5;
    finalColor *= vig;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function createWebGLFieldRenderer(width, height) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    console.error('[WebGL] Renderer initialization failed:', e);
    return {
      canvas: document.createElement('div'),
      render: () => {},
      resize: () => {},
      getState: () => ({ camera: { position: {} }, renderer: {}, scene: {} })
    };
  }
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CFG.bg);

  // Portrait focus: 100 units wide, units based on height aspect
  const aspect = height / (width || 1);
  const frustumSize = 100;
  const camera = new THREE.OrthographicCamera(
    -frustumSize / 2, frustumSize / 2,
    (frustumSize * aspect) / 2, (-frustumSize * aspect) / 2,
    0.1, 1000
  );
  camera.position.z = 10;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;

  // Turf (120 yards total including endzones)
  const turfGeo = new THREE.PlaneGeometry(100, 120);
  const turfMat = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(CFG.turf) },
      time: { value: 0 },
      ballY: { value: 50 },
      turfWear: { value: 0 }
    },
    vertexShader: TURF_VERTEX_SHADER,
    fragmentShader: TURF_FRAGMENT_SHADER
  });
  const turf = new THREE.Mesh(turfGeo, turfMat);
  turf.receiveShadow = true;
  scene.add(turf);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const sun = new THREE.DirectionalLight(0xffffff, 0.8);
  sun.position.set(50, 50, 50);
  sun.castShadow = true;
  scene.add(sun);

  // Markers (LOS, 1st Down)
  const markerGeo = new THREE.PlaneGeometry(100, 0.5);
  const losMat = new THREE.MeshBasicMaterial({ color: CFG.losColor, transparent: true, opacity: 0.8 });
  const losMarker = new THREE.Mesh(markerGeo, losMat);
  losMarker.position.z = 0.1;
  scene.add(losMarker);

  const fdMat = new THREE.MeshBasicMaterial({ color: CFG.fdColor, transparent: true, opacity: 0.8 });
  const fdMarker = new THREE.Mesh(markerGeo, fdMat);
  fdMarker.position.z = 0.1;
  scene.add(fdMarker);

  function render(state) {
    const ballY = state.ballY || 50;
    const losY = state.losY || ballY;
    const fdY = state.fdY || losY + 10;
    const timeOfDay = state.timeOfDay !== undefined ? state.timeOfDay : 1.0;

    // Convert yard (0-120) to 3D Y (-60 to 60)
    const yTo3D = (y) => (y - 60);

    // Update camera (centered on ball with damping in future)
    camera.position.y = yTo3D(ballY);
    
    // Update uniforms
    turfMat.uniforms.ballY.value = ballY;
    turfMat.uniforms.time.value = performance.now() / 1000;
    turfMat.uniforms.turfWear.value = state.turfWear || 0;

    // Update Lighting
    sun.intensity = 0.8 * timeOfDay;
    ambientLight.intensity = 0.4 * timeOfDay + 0.1;
    if (timeOfDay < 0.5) {
      sun.color.setHex(0xffa07a);
    } else {
      sun.color.setHex(0xffffff);
    }

    // Update markers
    losMarker.position.y = yTo3D(losY);
    fdMarker.position.y = yTo3D(fdY);
    fdMarker.visible = fdY > losY;

    renderer.render(scene, camera);
  }

  return {
    canvas: renderer.domElement,
    render: render,
    resize: (w, h) => {
      renderer.setSize(w, h);
      const newAspect = h / w;
      camera.top = (frustumSize * newAspect) / 2;
      camera.bottom = (-frustumSize * newAspect) / 2;
      camera.updateProjectionMatrix();
    },
    getState: () => ({ camera, renderer, scene })
  };
}
