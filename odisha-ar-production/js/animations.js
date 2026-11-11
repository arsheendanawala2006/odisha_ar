/* ─────────────────────────────────────────────────────────────
   ODISHA, IN COLOUR — 2.5D CHARACTER & ENVIRONMENTAL ANIMATION
   Graceful Motion Rigs, Eye Blinking, Saree Wave & Parallax
   ───────────────────────────────────────────────────────────── */

import * as THREE from 'three';

export class AnimationController {
  constructor(layers, dustParticles) {
    this.layers = layers;
    this.dust = dustParticles;

    // Eye blinking timer state
    this.nextBlinkTime = 2.5;
    this.blinkDuration = 0.18; // 180 ms
    this.isBlinking = false;
    this.blinkStartTime = 0;

    // Baseline positions and rotations
    this.baseTransforms = {
      dancer: { x: layers.dancer.position.x, y: layers.dancer.position.y, z: layers.dancer.position.z },
      saree:  { x: layers.saree_green.position.x, y: layers.saree_green.position.y, z: layers.saree_green.position.z },
      mandir: { x: layers.mandir.position.x, y: layers.mandir.position.y, z: layers.mandir.position.z },
      chariot:{ x: layers.chariot.position.x, y: layers.chariot.position.y, z: layers.chariot.position.z },
      tribal: { x: layers.tribal.position.x, y: layers.tribal.position.y, z: layers.tribal.position.z },
      mask:   { x: layers.mask.position.x, y: layers.mask.position.y, z: layers.mask.position.z }
    };
  }

  update(time, liftProgress, revealProgress) {
    const lift = liftProgress; // 0.0 -> 1.0 (layers rise above paper)

    // ─────────────────────────────────────────────
    // 1. ODISSI DANCER: Breathing, Tilt & Eye Blink
    // ─────────────────────────────────────────────
    if (this.layers.dancer) {
      // Gentle breathing: smooth chest cycle (period ~ 4 seconds)
      const breathCycle = Math.sin(time * 1.57); // 2pi / 4 = ~1.57
      const breathScaleY = 1.0 + 0.008 * breathCycle * lift;
      const breathScaleX = 1.0 + 0.004 * breathCycle * lift;
      const breathOffsetZ = 0.004 * breathCycle * lift;

      this.layers.dancer.scale.set(breathScaleX, breathScaleY, 1.0);
      this.layers.dancer.position.z = this.baseTransforms.dancer.z + (0.045 * lift) + breathOffsetZ;

      // Graceful Tribhanga posture micro-sway
      const swayRotZ = Math.sin(time * 0.8) * 0.008 * lift;
      const swayRotX = Math.cos(time * 0.6) * 0.006 * lift;
      this.layers.dancer.rotation.set(swayRotX, 0, swayRotZ);

      // Dancer contact shadow shifts naturally as she breathes
      if (this.layers.dancer_shadow) {
        this.layers.dancer_shadow.position.set(
          this.baseTransforms.dancer.x + 0.012 * lift,
          this.baseTransforms.dancer.y - 0.016 * lift,
          0.006
        );
        this.layers.dancer_shadow.material.opacity = (0.25 + 0.55 * lift) * revealProgress;
      }

      // Natural Eye Blinking Logic
      if (this.layers.eyelid) {
        if (!this.isBlinking && time >= this.nextBlinkTime) {
          this.isBlinking = true;
          this.blinkStartTime = time;
          // Randomize next blink between 3.2s and 5.8s
          this.nextBlinkTime = time + 3.2 + Math.random() * 2.6;
        }

        if (this.isBlinking) {
          const blinkProgress = (time - this.blinkStartTime) / this.blinkDuration;
          if (blinkProgress >= 1.0) {
            this.isBlinking = false;
            this.layers.eyelid.material.opacity = 0;
          } else {
            // Smooth bell curve for eyelid closing and opening (sin^2)
            const eyelidOpacity = Math.sin(blinkProgress * Math.PI);
            this.layers.eyelid.material.opacity = eyelidOpacity * revealProgress;
          }
        } else {
          this.layers.eyelid.material.opacity = 0;
        }

        // Keep eyelid linked to dancer's exact head breathing position
        this.layers.eyelid.position.z = this.layers.dancer.position.z + 0.002;
        this.layers.eyelid.rotation.set(swayRotX, 0, swayRotZ);
      }
    }

    // ─────────────────────────────────────────────
    // 2. SAMBALPURI SAREE & WEAVE: Flowing Pallu Wave
    // ─────────────────────────────────────────────
    if (this.layers.saree_green) {
      // Soft fabric ripple
      const clothWave = Math.sin(time * 2.2 + 0.5) * 0.007 * lift;
      const clothFlutter = Math.cos(time * 3.1) * 0.004 * lift;
      this.layers.saree_green.position.set(
        this.baseTransforms.saree.x + clothWave * 0.5,
        this.baseTransforms.saree.y + clothFlutter * 0.5,
        this.baseTransforms.saree.z + (0.032 * lift)
      );
      this.layers.saree_green.rotation.set(clothFlutter, clothWave, clothWave * 0.8);
    }

    // ─────────────────────────────────────────────
    // 3. PURI RATHA (CHARIOT): Canopy Flutter
    // ─────────────────────────────────────────────
    if (this.layers.chariot) {
      // Rhythmic subtle sway of the sacred wooden chariot and fabric trims
      const chariotSway = Math.sin(time * 1.1) * 0.006 * lift;
      this.layers.chariot.position.set(
        this.baseTransforms.chariot.x,
        this.baseTransforms.chariot.y,
        this.baseTransforms.chariot.z + (0.022 * lift)
      );
      this.layers.chariot.rotation.z = chariotSway;
    }

    // ─────────────────────────────────────────────
    // 4. KONARK TEMPLE: Parallax Depth & Stability
    // ─────────────────────────────────────────────
    if (this.layers.mandir) {
      // Sits solidly in mid-depth with subtle atmospheric breathing
      this.layers.mandir.position.z = this.baseTransforms.mandir.z + (0.012 * lift);
    }

    // ─────────────────────────────────────────────
    // 5. TRIBAL GIRL & FOLK MASK: Dimensional Tilt
    // ─────────────────────────────────────────────
    if (this.layers.tribal) {
      const tribalBreathe = Math.sin(time * 1.4 + 1.0) * 0.003 * lift;
      this.layers.tribal.position.z = this.baseTransforms.tribal.z + (0.026 * lift) + tribalBreathe;
    }

    if (this.layers.mask) {
      const maskTilt = Math.cos(time * 0.9) * 0.005 * lift;
      this.layers.mask.position.z = this.baseTransforms.mask.z + (0.038 * lift);
      this.layers.mask.rotation.set(maskTilt, -maskTilt * 0.5, 0);
    }

    // ─────────────────────────────────────────────
    // 6. ATMOSPHERIC GOLDEN SUN DUST MOTES
    // ─────────────────────────────────────────────
    if (this.dust && this.dust.geometry) {
      const positions = this.dust.geometry.attributes.position;
      const count = positions.count;
      const aspect = 3508 / 2480;

      for (let i = 0; i < count; i++) {
        // Slow upward drift
        let y = positions.getY(i) + 0.0008 * (1.0 + 0.4 * Math.sin(time * 1.5 + i));
        let x = positions.getX(i) + Math.sin(time * 0.7 + i * 0.8) * 0.0004;

        // Loop boundaries
        if (y > aspect / 2) y = -aspect / 2;
        positions.setY(i, y);
        positions.setX(i, x);
      }
      positions.needsUpdate = true;

      // Opacity glows during reveal and remains subtle during living artwork
      if (this.dust.material) {
        this.dust.material.opacity = (0.75 * Math.sin(Math.PI * revealProgress) + 0.35 * revealProgress) * lift;
      }
    }
  }
}
