---
title: 'Nuxt 4 + Three.js WebGPU: Ship a Next‑Gen 3D Scene with WebGL Fallback'
description: 'Build a WebGPU‑powered Three.js scene in Nuxt 4 with a clean WebGL fallback, using TypeScript and client‑only hydration.'
readtime: '8 min'
locale: 'en'
keywords: 'nuxt, nuxt 4, three.js, webgpu, webgl, typescript, vue 3, graphics, tutorials, developer, webgpu renderer'
bgImage: 'posts/article2.png'
coverImages: ['nuxt.svg', 'threejs.svg']
date: '2025-11-16'
navigation:
    description: 'Build a WebGPU Three.js scene in Nuxt 4 with a WebGL fallback and TypeScript.'
    coverImages: ['nuxt.svg', 'threejs.svg']
    bgImage: 'posts/article2.png'
    alt: 'nuxt-three-webgpu'
    date: '2025-11-16'
---

# Nuxt 4 + Three.js WebGPU: Ship a Next‑Gen 3D Scene with WebGL Fallback

![nuxt-three-webgpu](../../posts/article2.png)

Build a WebGPU‑powered Three.js scene in Nuxt 4 with a clean WebGL fallback, using TypeScript and client‑only hydration.

Tags: Nuxt 4, Three.js, WebGPU, TypeScript

Time to read: 8 min

Note: Three.js’ WebGPURenderer is available in modern Chromium‑based browsers and Safari TP when WebGPU is enabled. This tutorial detects support at runtime and falls back to WebGL seamlessly.

## Prerequisites

- Familiarity with the command line
- Node.js 18+ installed
- A modern browser (Chrome/Edge 113+, or Safari TP) for WebGPU
- Optional: Basic Three.js knowledge

## Create a Nuxt 4 app

```bash
npx nuxi init nuxt4-webgpu
cd nuxt4-webgpu
npm install
```

Run the dev server to verify:

```bash
npm run dev
```

Visit http://localhost:3000

## Install Three.js

```bash
npm i three
```

We’ll dynamically import the WebGPU renderer only on the client to keep SSR happy and bundles lean.

## Add a client‑only Three.js component

Create a client‑only component so Three.js runs only in the browser.

File: components/ThreeWebGPUScene.client.vue

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';

// Types shared by WebGL/WebGPU
type AnyRenderer = any; // keep loose to unify WebGLRenderer/WebGPURenderer APIs

const canvasEl = ref<HTMLCanvasElement | null>(null);

onMounted(async () => {
  const THREE = await import('three');
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

  // Prefer WebGPU if available, otherwise WebGL
  let renderer: AnyRenderer;
  const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;

  if (hasWebGPU) {
    try {
      const { WebGPURenderer } = await import('three/examples/jsm/renderers/WebGPURenderer.js');
      renderer = new WebGPURenderer({
        canvas: canvasEl.value!,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      // WebGPU renderer requires explicit init
      await renderer.init();
    } catch (e) {
      // Fallback to WebGL if WebGPU init fails
      renderer = new THREE.WebGLRenderer({
        canvas: canvasEl.value!,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    }
  } else {
    renderer = new THREE.WebGLRenderer({
      canvas: canvasEl.value!,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  }

  // Common renderer settings
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b1020');

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(3, 2, 5);

  const controls = new OrbitControls(camera, canvasEl.value!);
  controls.enableDamping = true;

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(5, 8, 3);
  scene.add(ambient, dir);

  // Geometry: a glossy torus knot + a floor
  const knotGeo = new THREE.TorusKnotGeometry(1, 0.35, 256, 64);
  const knotMat = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    metalness: 0.8,
    roughness: 0.3
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  knot.castShadow = false;
  knot.receiveShadow = false;
  scene.add(knot);

  const floorGeo = new THREE.PlaneGeometry(20, 20);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0f162e,
    metalness: 0.2,
    roughness: 0.9
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.5;
  scene.add(floor);

  // Subtle sky fill via a big hemisphere gradient mesh (works in WebGL/WebGPU)
  const hemiGeo = new THREE.SphereGeometry(50, 32, 16);
  const hemiMat = new THREE.MeshBasicMaterial({ color: 0x0b1020, side: THREE.BackSide });
  const hemi = new THREE.Mesh(hemiGeo, hemiMat);
  scene.add(hemi);

  const clock = new THREE.Clock();

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  // Animation loop (supported by both WebGLRenderer and WebGPURenderer)
  const loop = () => {
    const dt = clock.getDelta();
    controls.update();
    knot.rotation.x += 0.4 * dt;
    knot.rotation.y += 0.25 * dt;
    renderer.render(scene, camera);
  };

  renderer.setAnimationLoop(loop);

  onBeforeUnmount(() => {
    renderer.setAnimationLoop(null as unknown as FrameRequestCallback);
    window.removeEventListener('resize', onResize);
    controls.dispose();
    knotGeo.dispose();
    knotMat.dispose();
    floorGeo.dispose();
    floorMat.dispose();
    hemiGeo.dispose();
    hemiMat.dispose();
    renderer.dispose?.();
  });
});
</script>

<template>
  <canvas ref="canvasEl" class="webgpu-canvas" />
</template>

<style scoped>
.webgpu-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: block;
  background: #0b1020;
}
</style>
```

Notes:
- The .client.vue suffix ensures the component renders only in the browser, avoiding SSR issues.
- We check navigator.gpu to prefer WebGPU and gracefully fall back to WebGL.
- renderer.init() is required for WebGPURenderer and is a no‑op for WebGL.

## Add a page to mount the scene

File: pages/index.vue

```vue
<script setup lang="ts">
</script>

<template>
  <div>
    <ThreeWebGPUScene />
    <div class="overlay">
      <h1>Nuxt 4 + Three.js WebGPU</h1>
      <p>WebGPU when available, WebGL otherwise.</p>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  left: 24px;
  bottom: 24px;
  color: #c9d4ff;
  background: color-mix(in oklab, #0b1020 80%, transparent);
  border: 1px solid #253058;
  border-radius: 12px;
  padding: 12px 16px;
  backdrop-filter: blur(6px);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
.overlay h1 {
  font-size: 18px;
  margin: 0 0 6px;
}
.overlay p {
  margin: 0;
  opacity: 0.9;
}
</style>
```

## TypeScript tips (optional)

No extra tsconfig is required for this setup. If your linter complains about the AnyRenderer union, you can introduce a minimal type:

File: types/three-webgpu.d.ts

```ts
declare module 'three/examples/jsm/renderers/WebGPURenderer.js' {
  import { WebGLRendererParameters, ColorSpace, ToneMapping } from 'three';
  export class WebGPURenderer {
    constructor(params?: WebGLRendererParameters & { canvas?: HTMLCanvasElement });
    init(): Promise<void>;
    setSize(w: number, h: number): void;
    setPixelRatio(r: number): void;
    setAnimationLoop(cb: FrameRequestCallback | null): void;
    render(scene: any, camera: any): void;
    dispose(): void;
    outputColorSpace: ColorSpace;
    toneMapping: ToneMapping;
    toneMappingExposure: number;
  }
}
```

Then reference types in tsconfig.json:

```json
{
  "compilerOptions": {
    "types": ["@types/node"]
  }
}
```

Nuxt automatically picks up .d.ts files in the project.

## Run it

```bash
npm run dev
```

Open http://localhost:3000

- If your browser supports WebGPU, the scene uses WebGPU.
- If not, it falls back to WebGL automatically.

## Production build

```bash
npm run build
npm run preview
```

Open the preview URL and confirm the scene renders smoothly.

## Troubleshooting

- Black screen in Safari: Ensure WebGPU is enabled (Develop > Experimental Features > WebGPU) or rely on the WebGL fallback.
- Type errors on imports from examples/jsm: Add the ambient .d.ts snippet above or use any in your component.
- Performance: Reduce geometry complexity (e.g., TorusKnotGeometry segments) and cap devicePixelRatio to 2 as shown.

## What’s new here?

- WebGPU in Three.js: The WebGPURenderer has matured, enabling next‑gen graphics with better performance and modern shading models in browsers that support the WebGPU API.
- Nuxt 4 client‑only hydration: Using a .client.vue component keeps SSR fast and reliable while enabling advanced browser‑only graphics.

## Next steps

- Add post‑processing (Bloom/Tone mapping) via the Three.js NodeMaterial system for WebGPU.
- Replace fallback detection with a UI toggle to compare WebGPU vs WebGL.
- Stream HDRI environments and compressed meshes with KTX2 to improve visual quality and load times.

Enjoy shipping a next‑gen 3D experience with Nuxt 4 and Three.js!

