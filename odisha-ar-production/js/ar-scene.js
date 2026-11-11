/* ─────────────────────────────────────────────────────────────
   ODISHA, IN COLOUR — 2.5D WEBAR SCENE & MINDAR ENGINE
   Layered Scene Hierarchy, Shaders, Particles & Lifecycles
   ───────────────────────────────────────────────────────────── */

import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { createRevealMaterial } from './reveal-shader.js';
import { AnimationController } from './animations.js';
import { HotspotSystem } from './hotspots.js';
import { audioManager } from './audio-manager.js';

// Aspect ratio of master poster (3508 / 2480 = 1.4145)
export const POSTER_ASPECT = 3508 / 2480;

// Exact PSD mathematical layer geometry
const LAYER_GEOMETRY = {
  dancer:        { w: 0.6266, h: 0.7617, x:  0.0593, y: -0.2603, z: 0.045 },
  eyelid:        { w: 0.0887, h: 0.0645, x:  0.0726, y:  0.0077, z: 0.047 },
  dancer_shadow: { w: 0.6544, h: 0.7101, x:  0.0704, y: -0.1728, z: 0.006 },
  saree_green:   { w: 0.4577, h: 0.4577, x:  0.2825, y: -0.0119, z: 0.035 },
  cloth_behind:  { w: 0.3536, h: 0.4419, x: -0.1474, y: -0.3145, z: 0.015 },
  chariot:       { w: 0.3585, h: 0.7262, x: -0.2760, y:  0.0744, z: 0.024 },
  mandir:        { w: 0.4560, h: 0.6806, x:  0.0171, y:  0.2577, z: 0.014 },
  tribal:        { w: 0.2169, h: 0.3375, x:  0.1948, y:  0.0861, z: 0.028 },
  mask:          { w: 0.4032, h: 0.4032, x: -0.2387, y: -0.3262, z: 0.040 }
};

export class ARSceneManager {
  constructor(containerId, onStateChange) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange || (() => {});
    this.mindar = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.anchor = null;

    this.layers = {};
    this.animController = null;
    this.hotspotSystem = null;
    this.revealMesh = null;
    this.dustMesh = null;

    this.isTargetFound = false;
    this.revealTriggered = false;
    this.targetFoundTime = null;

    // Animation timings
    this.delayBeforeReveal = 0.8;  // Seconds after lock before colour spreads
    this.revealDuration = 5.2;      // Seconds for full organic bloom
  }

  async initialize() {
    this.onStateChange('INITIALIZING', 'Starting camera engine...');

    this.mindar = new MindARThree({
      container: this.container,
      imageTargetSrc: './assets/targets.mind',
      uiLoading: 'no',
      uiScanning: 'no',
      uiError: 'no',
      filterMinCF: 0.0005,
      filterBeta: 45,
      missTolerance: 14,
      warmupTolerance: 5
    });

    this.renderer = this.mindar.renderer;
    this.scene = this.mindar.scene;
    this.camera = this.mindar.camera;

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.onStateChange('LOADING_TEXTURES', 'Loading high-fidelity artwork layers...');
    await this.loadSceneAssets();

    this.setupAnchorEvents();
  }

  async loadSceneAssets() {
    const loader = new THREE.TextureLoader();
    const loadTex = async (url) => {
      const tex = await loader.loadAsync(url);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      return tex;
    };

    // Load base composites and isolated layer textures in parallel
    const [
      tBase, tShadow, tBW, tCol,
      tDancer, tEyelid, tDancerShadow,
      tSaree, tClothBehind, tChariot,
      tMandir, tTribal, tMask
    ] = await Promise.all([
      loadTex('./assets/base.webp'),
      loadTex('./assets/shadow.webp'),
      loadTex('./assets/photos_bw.webp'),
      loadTex('./assets/photos_col.webp'),
      loadTex('./assets/dancer.png'),
      loadTex('./assets/dancer_eyelid_only.png'),
      loadTex('./assets/dancer_shadow.png'),
      loadTex('./assets/saree_green.png'),
      loadTex('./assets/cloth_behind.png'),
      loadTex('./assets/chariot.png'),
      loadTex('./assets/mandir.png'),
      loadTex('./assets/tribal.png'),
      loadTex('./assets/mask.png')
    ]);

    const rootRig = new THREE.Group();

    // ─────────────────────────────────────────────
    // 1. BASE POSTER PLANE (Paper texture & Orange arch)
    // ─────────────────────────────────────────────
    const basePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, POSTER_ASPECT),
      new THREE.MeshBasicMaterial({ map: tBase, depthWrite: false })
    );
    basePlane.renderOrder = 0;
    rootRig.add(basePlane);

    // ─────────────────────────────────────────────
    // 2. SOFT BACKGROUND SHADOW
    // ─────────────────────────────────────────────
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, POSTER_ASPECT),
      new THREE.MeshBasicMaterial({ map: tShadow, transparent: true, depthWrite: false, opacity: 0.4 })
    );
    shadowPlane.position.z = 0.005;
    shadowPlane.renderOrder = 1;
    rootRig.add(shadowPlane);

    // ─────────────────────────────────────────────
    // 3. PHOTOS LAYER WITH SIGNATURE REVEAL SHADER
    // ─────────────────────────────────────────────
    const revealMat = createRevealMaterial(tBW, tCol, POSTER_ASPECT, [0.54, 0.49]);
    this.revealMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, POSTER_ASPECT),
      revealMat
    );
    this.revealMesh.position.z = 0.01;
    this.revealMesh.renderOrder = 2;
    rootRig.add(this.revealMesh);

    // ─────────────────────────────────────────────
    // 4. INDEPENDENT 2.5D CHARACTER & OBJECT LAYERS
    // ─────────────────────────────────────────────
    const createLayerMesh = (tex, geom, order, transparent = true) => {
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(geom.w, geom.h),
        new THREE.MeshBasicMaterial({ map: tex, transparent, depthWrite: false })
      );
      plane.position.set(geom.x, geom.y, geom.z);
      plane.renderOrder = order;
      rootRig.add(plane);
      return plane;
    };

    this.layers.mandir = createLayerMesh(tMandir, LAYER_GEOMETRY.mandir, 4);
    this.layers.chariot = createLayerMesh(tChariot, LAYER_GEOMETRY.chariot, 5);
    this.layers.cloth_behind = createLayerMesh(tClothBehind, LAYER_GEOMETRY.cloth_behind, 5);
    this.layers.tribal = createLayerMesh(tTribal, LAYER_GEOMETRY.tribal, 6);
    this.layers.saree_green = createLayerMesh(tSaree, LAYER_GEOMETRY.saree_green, 7);
    this.layers.mask = createLayerMesh(tMask, LAYER_GEOMETRY.mask, 8);

    // Dancer Shadow & Hero Mesh
    this.layers.dancer_shadow = createLayerMesh(tDancerShadow, LAYER_GEOMETRY.dancer_shadow, 8);
    this.layers.dancer = createLayerMesh(tDancer, LAYER_GEOMETRY.dancer, 9);

    // Dancer Eyelid Mesh for Blinking
    this.layers.eyelid = createLayerMesh(tEyelid, LAYER_GEOMETRY.eyelid, 10);
    this.layers.eyelid.material.opacity = 0;

    // ─────────────────────────────────────────────
    // 5. GOLDEN SUN DUST PARTICLE SYSTEM
    // ─────────────────────────────────────────────
    this.dustMesh = this.createDustField();
    rootRig.add(this.dustMesh);

    // ─────────────────────────────────────────────
    // 6. INTERACTIVE HOTSPOTS
    // ─────────────────────────────────────────────
    this.hotspotSystem = new HotspotSystem(this.scene, this.camera, this.container);
    rootRig.add(this.hotspotSystem.group);

    // ─────────────────────────────────────────────
    // 7. ATTACH RIG TO MINDAR ANCHOR
    // ─────────────────────────────────────────────
    this.anchor = this.mindar.addAnchor(0);
    this.anchor.group.add(rootRig);

    // Initialize Animation Controller
    this.animController = new AnimationController(this.layers, this.dustMesh);
  }

  createDustField() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const rad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    rad.addColorStop(0, '#FFFFFF');
    rad.addColorStop(0.4, '#F7D560');
    rad.addColorStop(1, 'rgba(232, 96, 28, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, 64, 64);

    const dustTex = new THREE.CanvasTexture(canvas);
    const count = 75;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 0.95;
      positions[i * 3 + 1] = (Math.random() - 0.5) * POSTER_ASPECT;
      positions[i * 3 + 2] = 0.05 + Math.random() * 0.12;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      map: dustTex,
      color: 0xFFD700,
      size: 0.028,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geom, mat);
    points.renderOrder = 12;
    return points;
  }

  setupAnchorEvents() {
    this.anchor.onTargetFound = () => {
      this.isTargetFound = true;
      audioManager.playRecognitionChime();
      this.onStateChange('TARGET_FOUND', 'There it is! Watch closely...');
    };

    this.anchor.onTargetLost = () => {
      this.isTargetFound = false;
      this.onStateChange('TARGET_LOST', 'Lost the poster. Point back at it.');
    };
  }

  async start() {
    this.onStateChange('SEARCHING', 'Point your camera at the poster. Keep all of it in view.');
    await this.mindar.start();

    const clock = new THREE.Clock();
    let lift = 0;
    let reveal = 0;

    const clamp = (val, min = 0, max = 1) => Math.min(max, Math.max(min, val));
    const smoothEase = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const outBack = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

    this.renderer.setAnimationLoop(() => {
      const time = clock.getElapsedTime();

      if (this.isTargetFound) {
        if (this.targetFoundTime === null) {
          this.targetFoundTime = time;
        }

        const elapsedSinceFound = time - this.targetFoundTime;

        // Layers gently lift off the paper
        lift = outBack(clamp(elapsedSinceFound / 1.8));

        // Colour spreads smoothly after brief pause
        const revealTime = elapsedSinceFound - this.delayBeforeReveal;
        reveal = smoothEase(clamp(revealTime / this.revealDuration));

        // Trigger reveal shimmer sound once colour begins spreading
        if (revealTime > 0 && !this.revealTriggered) {
          this.revealTriggered = true;
          audioManager.playRevealShimmer();
        }

        // Show interactive hotspots once colour reveal completes
        if (reveal >= 0.85) {
          this.hotspotSystem.show(1.0);
        }
      } else {
        // When tracking lost, gently hide hotspots
        this.hotspotSystem.hide();
      }

      // Update shader uniforms
      if (this.revealMesh && this.revealMesh.material.uniforms) {
        this.revealMesh.material.uniforms.uP.value = reveal;
        this.revealMesh.material.uniforms.uT.value = time;
      }

      // Update 2.5D animation rigs
      if (this.animController) {
        this.animController.update(time, lift, reveal);
      }

      // Update hotspot floating animation
      if (this.hotspotSystem) {
        this.hotspotSystem.update(time);
      }

      this.renderer.render(this.scene, this.camera);
    });
  }
}
