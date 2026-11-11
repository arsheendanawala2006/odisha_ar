/* ─────────────────────────────────────────────────────────────
   ODISHA, IN COLOUR — APPLICATION CONTROLLER
   State Management, UI Transitions & Error Recovery
   ───────────────────────────────────────────────────────────── */

import { ARSceneManager } from './ar-scene.js';
import { audioManager } from './audio-manager.js';

class App {
  constructor() {
    this.arManager = null;
    this.dom = {
      landingScreen: document.getElementById('landing-screen'),
      btnStart: document.getElementById('btn-start'),
      arHud: document.getElementById('ar-hud'),
      statusBanner: document.getElementById('status-banner'),
      statusText: document.getElementById('status-text'),
      statusIcon: document.getElementById('status-icon'),
      viewfinder: document.getElementById('viewfinder-guide'),
      btnAudio: document.getElementById('btn-audio'),
      audioIcon: document.getElementById('audio-icon'),
      errNotice: document.getElementById('err-notice')
    };

    this.init();
  }

  init() {
    this.checkInAppBrowser();
    this.bindEvents();
  }

  // Detect Instagram, WhatsApp, Messenger in-app browser limitations
  checkInAppBrowser() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isInApp = /FBAN|FBAV|Instagram|WhatsApp/i.test(ua);
    if (isInApp && this.dom.errNotice) {
      this.dom.errNotice.textContent = 'For the best AR experience, tap the menu (•••) and select "Open in Safari" or "Open in Chrome".';
    }
  }

  bindEvents() {
    // Start Experience Button
    this.dom.btnStart.addEventListener('click', async () => {
      this.dom.btnStart.disabled = true;
      this.dom.errNotice.textContent = '';

      // Initialize audio on first user gesture
      audioManager.init();

      try {
        await this.startExperience();
      } catch (err) {
        console.error('AR Launch Exception:', err);
        this.dom.btnStart.disabled = false;
        this.handleLaunchError(err);
      }
    });

    // Audio Toggle in HUD
    this.dom.btnAudio.addEventListener('click', () => {
      const isUnmuted = audioManager.toggleMute();
      this.updateAudioIcon(isUnmuted);
    });
  }

  updateAudioIcon(isUnmuted) {
    if (isUnmuted) {
      // Sound ON SVG
      this.dom.audioIcon.innerHTML = `
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      `;
      this.dom.btnAudio.setAttribute('aria-label', 'Mute audio');
    } else {
      // Sound OFF SVG
      this.dom.audioIcon.innerHTML = `
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
      `;
      this.dom.btnAudio.setAttribute('aria-label', 'Unmute audio');
    }
  }

  async startExperience() {
    this.dom.btnStart.innerHTML = `
      <svg class="status-icon spin" viewBox="0 0 24 24"><path d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8zm0 16c-4.41 0-8-3.59-8-8H2c0 5.52 4.48 10 10 10v-2z" fill="currentColor"/></svg>
      <span>Connecting Camera...</span>
    `;

    this.arManager = new ARSceneManager('ar-viewport', (state, message) => {
      this.onARStateChange(state, message);
    });

    await this.arManager.initialize();
    await this.arManager.start();

    // Transition smoothly into camera HUD
    this.dom.landingScreen.classList.add('hidden');
    this.dom.arHud.classList.add('active');
  }

  onARStateChange(state, message) {
    if (this.dom.statusText) {
      this.dom.statusText.textContent = message;
    }

    switch (state) {
      case 'SEARCHING':
        this.dom.viewfinder.classList.remove('locked');
        this.dom.statusIcon.classList.add('spin');
        break;

      case 'TARGET_FOUND':
        this.dom.viewfinder.classList.add('locked');
        this.dom.statusIcon.classList.remove('spin');
        break;

      case 'TARGET_LOST':
        this.dom.viewfinder.classList.remove('locked');
        this.dom.statusIcon.classList.add('spin');
        break;

      default:
        break;
    }
  }

  handleLaunchError(e) {
    let msg = 'Could not access the camera. Please ensure camera permissions are allowed in browser settings and reload.';
    if (e && e.name === 'NotAllowedError') {
      msg = 'Camera access was blocked. Please tap the lock / settings icon in your browser address bar and enable camera permission.';
    } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      msg = 'Mobile browsers require a secure HTTPS connection for camera access.';
    }

    this.dom.errNotice.textContent = msg;
    this.dom.btnStart.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
      <span>Retry Camera Access</span>
    `;
  }
}

// Bootstrap application on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
