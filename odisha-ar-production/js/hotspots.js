/* ─────────────────────────────────────────────────────────────
   ODISHA, IN COLOUR — INTERACTIVE CULTURAL HOTSPOTS
   Curated Stories, Verified Information & Touch Interaction
   ───────────────────────────────────────────────────────────── */

import * as THREE from 'three';
import { audioManager } from './audio-manager.js';

export const CULTURAL_STORIES = {
  dancer: {
    tag: 'CLASSICAL TRADITION',
    title: 'Odissi Classical Dance & Sculptural Grace',
    body: 'Dating back over two millennia to the ancient cave temples of Odisha, Odissi is celebrated for its poetic Tribhanga (three-bend) stance, expressive mudras, and divine storytelling. The dancer is adorned in handwoven silk, intricate silver filigree jewellery (Tarakasi), and a floral Mukuta crest inspired by temple friezes.',
    url: 'https://odishatourism.gov.in/'
  },
  mandir: {
    tag: 'UNESCO WORLD HERITAGE',
    title: 'Konark Sun Temple — The 13th-Century Solar Chariot',
    body: 'Conceived as a colossal celestial chariot with 24 intricately sculpted stone wheels pulled by seven spirited horses, the Sun Temple of Konark was erected in 1250 CE by King Narasimhadeva I. Its towering stone reliefs capture cosmic time, celestial dancers, and ancient Odisha’s maritime grandeur.',
    url: 'https://odishatourism.gov.in/'
  },
  chariot: {
    tag: 'LIVING HERITAGE',
    title: 'Puri Rath Yatra — Sacred Chariots of Jagannath',
    body: 'Every summer in sacred Puri, the magnificent 45-foot wooden chariots of Lord Jagannath, Balabhadra, and Subhadra journey through millions of pilgrims. The vibrant red and yellow cloth canopies (Chandua) are hand-stitched with sacred applique craft by master artisans of Pipili.',
    url: 'https://odishatourism.gov.in/'
  },
  textile: {
    tag: 'INDIGENOUS TEXTILES',
    title: 'Sambalpuri Bandha — Sacred Ikat Weaving',
    body: 'The world-renowned Sambalpuri Ikat is a centuries-old tie-dye weaving craft from western Odisha. Weavers meticulously bind warp and weft silk yarns with traditional temple spire (Kumbha), conch, and lotus motifs before weaving them into lustrous, enduring silk tapestries.',
    url: 'https://odishatourism.gov.in/'
  },
  tribal: {
    tag: 'COMMUNITY & FOLK ART',
    title: 'Indigenous Heritage & Sahi Jata Folk Masks',
    body: 'Odisha is home to 62 indigenous tribal communities, celebrated for their sacred ecology and distinctive adornments like silver collar rings (Hansuli). Alongside them flourish vibrant folk theatre traditions, featuring hand-carved ochre and papier-mâché masks representing epic mythology.',
    url: 'https://odishatourism.gov.in/'
  }
};

// 3D Hotspot Coordinates in Three.js Poster Space (Z = +0.10)
export const HOTSPOT_LOCATIONS = [
  { id: 'dancer',  x:  0.06, y: -0.15, z: 0.12 },
  { id: 'mandir',  x:  0.02, y:  0.42, z: 0.08 },
  { id: 'chariot', x: -0.28, y:  0.18, z: 0.10 },
  { id: 'textile', x:  0.30, y: -0.02, z: 0.11 },
  { id: 'tribal',  x:  0.22, y:  0.16, z: 0.10 }
];

export class HotspotSystem {
  constructor(scene, camera, domContainer) {
    this.scene = scene;
    this.camera = camera;
    this.container = domContainer;
    this.group = new THREE.Group();
    this.hotspots = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.isVisible = false;
    this.opacity = 0;

    this.createHotspotMeshes();
    this.bindEvents();
  }

  // Generate delicate glowing lotus / mandala pin texture
  createPinTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Outer warm gold ring
    ctx.beginPath();
    ctx.arc(64, 64, 46, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(232, 96, 28, 0.4)';
    ctx.fill();

    // Inner bright circle
    ctx.beginPath();
    ctx.arc(64, 64, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#F7D560';
    ctx.shadowBlur = 18;
    ctx.fill();

    // Sacred center dot
    ctx.beginPath();
    ctx.arc(64, 64, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#A72626';
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  createHotspotMeshes() {
    const texture = this.createPinTexture();
    const geom = new THREE.PlaneGeometry(0.085, 0.085);

    HOTSPOT_LOCATIONS.forEach(loc => {
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.NormalBlending
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(loc.x, loc.y, loc.z);
      mesh.userData = { id: loc.id, baseZ: loc.z, baseY: loc.y };
      mesh.renderOrder = 10;
      this.group.add(mesh);
      this.hotspots.push(mesh);
    });
  }

  bindEvents() {
    const handleTap = (clientX, clientY) => {
      if (!this.isVisible) return;
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.hotspots);

      if (intersects.length > 0) {
        const target = intersects[0].object;
        const storyId = target.userData.id;
        audioManager.playHotspotTap();
        this.openStoryModal(storyId);
      }
    };

    window.addEventListener('click', e => handleTap(e.clientX, e.clientY));
    window.addEventListener('touchend', e => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        handleTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    });

    // Close button on story modal
    const closeBtn = document.getElementById('story-close');
    if (closeBtn) {
      closeBtn.onclick = () => this.closeStoryModal();
    }
  }

  openStoryModal(storyId) {
    const story = CULTURAL_STORIES[storyId];
    if (!story) return;

    document.getElementById('story-tag').textContent = story.tag;
    document.getElementById('story-title').textContent = story.title;
    document.getElementById('story-body').textContent = story.body;
    document.getElementById('story-link').href = story.url;

    const modal = document.getElementById('story-modal');
    modal.classList.add('open');
  }

  closeStoryModal() {
    const modal = document.getElementById('story-modal');
    modal.classList.remove('open');
  }

  show(targetOpacity = 1.0) {
    this.isVisible = true;
    this.opacity = THREE.MathUtils.lerp(this.opacity, targetOpacity, 0.08);
    this.hotspots.forEach(h => {
      h.material.opacity = this.opacity;
    });
  }

  hide() {
    this.isVisible = false;
    this.opacity = THREE.MathUtils.lerp(this.opacity, 0, 0.12);
    this.hotspots.forEach(h => {
      h.material.opacity = this.opacity;
    });
  }

  update(time) {
    if (!this.isVisible && this.opacity <= 0.01) return;

    // Gentle floating and pulsing animation on pins
    this.hotspots.forEach((h, i) => {
      const pulse = 1.0 + 0.12 * Math.sin(time * 3.5 + i * 1.4);
      h.scale.set(pulse, pulse, 1.0);
      h.position.y = h.userData.baseY + 0.005 * Math.sin(time * 2.0 + i);
    });
  }
}
