/**
 * TORCH — Premium Helmet SVG Layers
 * High-fidelity vector paths for shell, hardware, and lighting.
 */

export const HELMET_PATHS = {
  // Main shell silhouette
  shell: 'M214.67 410.6c-14.73-1.18-28.57-6.54-42.64-11.99-25.84-10-52.68-20.39-81.81 4.8-5.1 4.41-12.82 3.85-17.24-1.25l-.81-1.04c-12.22-16.33-23.15-33.53-32.57-51.2-9.54-17.9-17.53-36.25-23.76-54.66-2.2-6.51-4.16-12.94-5.88-19.27C-5.5 218.91-3.09 163.75 18.1 117.61 39.44 71.12 79.58 34.13 139.37 13.89c5.45-1.85 11.01-3.55 16.65-5.08 52.22-14.14 109.49-11.57 157.51 9.95 43.22 19.37 78.9 53.94 96.85 105.29 2.02 5.82-.61 12.14-5.94 14.88-40.41 22.46-66.27 38.89-82.33 53.19l2.36 7.35v.05c6.51 20.34 13.65 42.65 22.23 63.66 16.25-6.42 32-13.62 47.07-21.33 18.65-9.55 36.55-20.02 53.33-30.86 5.1-3.27 11.89-1.79 15.16 3.31.39.6.72 1.24.97 1.88l47.89 111.61c2.04 4.79.41 10.22-3.63 13.16-14.42 11.8-29.24 20-44.13 24.67-15.62 4.89-31.33 5.92-46.8 3.12-19.86-3.58-36.19-14.08-49.89-28.82-20.42 6.63-40.86 11.65-59.62 14.43-4.39 10.72-11.18 20.58-19.66 28.96-13.84 13.67-32.34 23.48-52.39 26.55a88.224 88.224 0 0 1-20.33.74z',
  
  // Recessed ear hole
  earHole: 'M209.48 291.17c15.25 0 27.6 12.36 27.6 27.6 0 15.25-12.35 27.6-27.6 27.6-15.24 0-27.6-12.35-27.6-27.6 0-15.24 12.36-27.6 27.6-27.6z',
  
  // Center stripe ridge
  stripe: 'M195 25h22v130h-22z',

  // Facemask bars (simplified high-end representation)
  mask: [
    'M375 232h95v12h-95z',
    'M375 260h85v12h-85z',
    'M380 288h70v10h-70z'
  ],

  // Glossy specular highlight (The "ESPN" shine)
  gloss: 'M130 30c80-20 160 10 200 80s20 150-40 200c-30 25-70 40-110 45-20 2-40 0-60-5 40-5 80-25 110-55 50-50 60-120 30-180s-80-90-130-85z',

  // Core shadow for volume
  shadow: 'M50 300c30 50 80 80 140 90 60 10 120 0 170-30-40 40-100 60-160 55-60-5-110-35-150-115z'
};

/**
 * Displacement filter for wrapping logos.
 * Uses a radial gradient as a 'map' where the R/G channels 
 * determine X/Y shift.
 */
export const LOGO_WARP_FILTER = `
<filter id="logoWarp" x="-20%" y="-20%" width="140%" height="140%">
  <!-- Create a displacement map based on a spherical gradient -->
  <feImage result="map" xlink:href="data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%27512%27%20height%3D%27512%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cdefs%3E%3CradialGradient%20id%3D%27g%27%20cx%3D%2750%25%27%20cy%3D%2750%25%27%20r%3D%2750%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%23808000%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23000000%27/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect%20width%3D%27512%27%20height%3D%27512%27%20fill%3D%27url%28%23g%29%27/%3E%3C/svg%3E"/>
  <feDisplacementMap in="SourceGraphic" in2="map" scale="40" xChannelSelector="R" yChannelSelector="G" />
</filter>
`;
