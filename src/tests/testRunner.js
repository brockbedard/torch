
// Mock browser globals BEFORE any imports
global.window = {
  devicePixelRatio: 1,
  location: { search: '' },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
  screen: {
    orientation: { lock: () => Promise.resolve() }
  }
};
global.localStorage = global.window.localStorage;
global.document = {
  createElement: () => ({
    style: {},
    appendChild: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    classList: { add: () => {}, remove: () => {} },
    getContext: () => ({
      scale: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createPattern: () => ({}),
      drawImage: () => {},
      clearRect: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fillText: () => {},
      rotate: () => {},
      translate: () => {},
      arc: () => {},
      fill: () => {},
      ellipse: () => {},
      strokeText: () => {},
      setTransform: () => {},
    }),
    insertBefore: () => {},
    querySelector: () => ({ 
      style: {}, 
      addEventListener: () => {}, 
      appendChild: () => {},
      getBoundingClientRect: () => ({ top: 0, left: 0, width: 100, height: 100, right: 100, bottom: 100 })
    }),
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 100, height: 100, right: 100, bottom: 100 }),
    querySelectorAll: () => [],
  }),
  body: {
    appendChild: () => {},
    querySelectorAll: () => [],
  },
  head: {
    appendChild: () => {},
  },
  querySelectorAll: () => [],
  addEventListener: () => {},
};
global.navigator = { userAgent: 'node' };
global.performance = { now: () => Date.now() };
global.Path2D = class { constructor() {} };
global.requestAnimationFrame = (fn) => setTimeout(fn, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.MutationObserver = class { observe() {} disconnect() {} };

import('./regressionTest.js');
