/* ─────────────────────────────────────────────────────────────
   ODISHA, IN COLOUR — SIGNATURE COLOUR REVEAL SHADER
   Custom GLSL Shader Material for Organic Pigment Bloom
   ───────────────────────────────────────────────────────────── */

import * as THREE from 'three';

export const RevealVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const RevealFragmentShader = `
  uniform sampler2D tBW;
  uniform sampler2D tCol;
  uniform float uP;      // Progress: 0.0 -> 1.0
  uniform float uT;      // Elapsed Time
  uniform float uA;      // Aspect Ratio (Height / Width)
  uniform vec2 uO;       // Origin of reveal (Dancer's heart: ~[0.54, 0.49])

  varying vec2 vUv;

  // Pseudo-random hash
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // 2D Value Noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  // Fractal Brownian Motion for authentic pigment / cloth diffusion
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec4 colTex = texture2D(tCol, vUv);
    vec3 bwTex = texture2D(tBW, vUv).rgb;

    // Correct distance calculation in poster aspect ratio space
    vec2 p = vec2(vUv.x, vUv.y * uA);
    vec2 origin = vec2(uO.x, uO.y * uA);

    // Organic edge distortion based on FBM
    float distortion = (fbm(p * 3.8 + vec2(0.0, uT * 0.06)) - 0.5) * 0.45;
    float d = distance(p, origin) + distortion;

    // Expanding reach: uP goes from 0.0 to 1.0 (covers entire diagonal)
    float maxRadius = 1.75;
    float currentRadius = uP * maxRadius;

    // Soft organic transition band
    float bandWidth = 0.28;
    float revealFactor = 1.0 - smoothstep(currentRadius - bandWidth, currentRadius, d);

    // Golden halo / radiant wave front
    float frontWave = revealFactor * (1.0 - revealFactor) * 4.0;
    float goldGlow = pow(frontWave, 1.5) * 0.95;

    // Sacred gold & saffron tones for the radiant leading edge
    vec3 haloColor = vec3(1.0, 0.76, 0.32);

    // Sparkles along the dye edge
    float sparkle = step(0.982, hash(floor(vUv * vec2(280.0, 280.0 * uA)) + floor(uT * 8.0))) * frontWave * 2.2;

    // Smooth blend from monochrome to rich colour
    vec3 blended = mix(bwTex, colTex.rgb, smoothstep(0.0, 1.0, revealFactor));

    // Add radiant halo and sacred sparkles
    blended += haloColor * goldGlow;
    blended += vec3(1.0, 0.95, 0.8) * sparkle;

    // Delicate continuous light shimmer across revealed areas
    blended *= 1.0 + 0.04 * sin((vUv.x * 2.5 + vUv.y) * 4.0 - uT * 0.8) * revealFactor;

    gl_FragColor = vec4(blended, colTex.a);

    #include <colorspace_fragment>
  }
`;

export function createRevealMaterial(tBW, tCol, aspect, origin = [0.54, 0.49]) {
  return new THREE.ShaderMaterial({
    vertexShader: RevealVertexShader,
    fragmentShader: RevealFragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
      tBW: { value: tBW },
      tCol: { value: tCol },
      uP: { value: 0.0 },
      uT: { value: 0.0 },
      uA: { value: aspect },
      uO: { value: new THREE.Vector2(...origin) }
    }
  });
}
