/* ─────────────────────────────────────────────────────────────
   ODISHA, IN COLOUR — WEB AUDIO PROCEDURAL SOUND DESIGN
   Authentic Indian Classical Atmosphere & Haptic Feedback
   ───────────────────────────────────────────────────────────── */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.isInitialized = false;
    this.droneGain = null;
    this.masterGain = null;
    this.oscillators = [];
  }

  // Initialize Web Audio on user gesture (Start Experience button)
  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.65, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext initialization deferred or unavailable:', e);
    }
  }

  // Toggle Mute / Unmute
  toggleMute() {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    const targetGain = this.isMuted ? 0 : 0.65;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }

    if (!this.isMuted && this.oscillators.length === 0) {
      this.startAmbientDrone();
    }

    return !this.isMuted;
  }

  // Traditional Tanpura / Shruti Box Ambient Drone (Sa-Pa resonance: 108Hz & 162Hz)
  startAmbientDrone() {
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.18, now + 3.0);

      // Lowpass filter to create a warm, sacred woody acoustic texture
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);

      this.droneGain.connect(filter);
      filter.connect(this.masterGain);

      // Fundamental (Sa = 108Hz)
      const oscSa = this.ctx.createOscillator();
      oscSa.type = 'sine';
      oscSa.frequency.setValueAtTime(108, now);

      // Fifth (Pa = 162Hz)
      const oscPa = this.ctx.createOscillator();
      oscPa.type = 'sine';
      oscPa.frequency.setValueAtTime(162, now);

      // Upper Octave (Sa2 = 216Hz) with gentle detune for natural chorus
      const oscSa2 = this.ctx.createOscillator();
      oscSa2.type = 'triangle';
      oscSa2.frequency.setValueAtTime(216.4, now);

      const subGain = this.ctx.createGain();
      subGain.gain.value = 0.4;
      oscSa2.connect(subGain);
      subGain.connect(this.droneGain);

      oscSa.connect(this.droneGain);
      oscPa.connect(this.droneGain);

      oscSa.start(now);
      oscPa.start(now);
      oscSa2.start(now);

      this.oscillators.push(oscSa, oscPa, oscSa2);
    } catch (e) {
      console.warn('Drone synthesis notice:', e);
    }
  }

  // Temple Bell (Ghanta) Chime on Poster Recognition
  playRecognitionChime() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const chimeGain = this.ctx.createGain();
      chimeGain.connect(this.masterGain);

      // Bell harmonics stack (Authentic temple bell overtones)
      const harmonics = [540, 810, 1080, 1620, 2430];
      const amplitudes = [0.25, 0.15, 0.10, 0.05, 0.02];

      chimeGain.gain.setValueAtTime(0.3, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      harmonics.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const hGain = this.ctx.createGain();
        hGain.gain.setValueAtTime(amplitudes[i], now);

        osc.connect(hGain);
        hGain.connect(chimeGain);

        osc.start(now);
        osc.stop(now + 2.8);
      });
    } catch (e) {
      console.warn('Chime audio notice:', e);
    }
  }

  // Harmonic Shimmer Wave during Colour Bloom (Bansuri scale cascade)
  playRevealShimmer() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [432, 486, 540, 648, 720, 864, 972]; // Raga Mohanam / Bhupali scale

      notes.forEach((freq, i) => {
        const delay = now + (i * 0.42);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, delay);

        gain.gain.setValueAtTime(0.0001, delay);
        gain.gain.linearRampToValueAtTime(0.12, delay + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, delay + 1.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(delay);
        osc.stop(delay + 1.5);
      });
    } catch (e) {
      console.warn('Shimmer audio notice:', e);
    }
  }

  // Delicate Tap Chime on Hotspot Click
  playHotspotTap() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(1080, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Tap audio notice:', e);
    }
  }
}

export const audioManager = new AudioManager();
