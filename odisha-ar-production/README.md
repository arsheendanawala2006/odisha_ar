# ODISHA, IN COLOUR — IMMERSIVE WEBAR EXPERIENCE

A cinematic, interactive 2.5D Augmented Reality experience celebrating the living cultural heritage of Odisha. Built with MindAR.js, Three.js, WebGL Shaders, and Web Audio API.

---

## 📁 Project Directory Structure

```
odisha-in-colour/
├── index.html               ← Master WebAR application
├── qr.html                  ← High-res print-ready QR generator
├── README.md                ← Technical documentation & setup guide
├── css/
│   └── styles.css           ← Odisha brand identity UI & frosted glass styling
├── js/
│   ├── app.js               ← Application bootstrap & state management
│   ├── ar-scene.js          ← 2.5D layered scene & MindAR tracking engine
│   ├── reveal-shader.js     ← Custom GLSL organic pigment bloom shader
│   ├── animations.js        ← Character & environmental motion rigs (Dancer, Saree, Temple, Chariot)
│   ├── hotspots.js          ← Interactive cultural storytelling cards
│   └── audio-manager.js     ← Procedural Web Audio ambient soundscape
└── assets/
    ├── targets.mind         ← MindAR compiled image tracking binary
    ├── target-BW.jpg        ← Black-and-white print tracking reference
    ├── brand_bg.jpg         ← Authentic Pattachitra tapestry background
    ├── base.webp            ← Architectural poster frame & paper texture
    ├── photos_bw.webp       ← Grayscale photograph base
    ├── photos_col.webp      ← Master full-colour photograph source of truth
    ├── shadow.webp          ← Soft background contact shadow
    ├── dancer.png           ← Isolated Odissi classical dancer (Hero)
    ├── dancer_eyelid_only.png← Isolated eyelid sprite for natural blinking
    ├── dancer_shadow.png    ← Contact drop shadow cast by the dancer
    ├── mandir.png           ← Isolated Konark Sun Temple
    ├── chariot.png          ← Isolated Puri Rath Yatra chariot
    ├── saree_green.png      ← Isolated flowing Sambalpuri fabric
    ├── tribal.png           ← Isolated indigenous tribal girl
    └── mask.png             ← Isolated folk theatre mask (Mukha)
```

---

## 🚀 Local Testing Guide

Mobile cameras require HTTPS or `localhost` to grant camera permissions.

### Option 1: Python HTTP Server (Mac / Windows / Linux)
Open Terminal or Command Prompt in this folder:
```bash
cd path/to/odisha-in-colour
python3 -m http.server 8080
```
Open **`http://localhost:8080`** in your browser.

### Option 2: Live Server (VS Code)
If using VS Code, right-click `index.html` and select **"Open with Live Server"**.

---

## 🌐 Instant Free Hosting & Deployment (HTTPS)

### Option A: Netlify Drop (Fastest — 30 seconds)
1. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)** in your desktop browser.
2. Drag and drop the **`odisha-in-colour`** folder into the upload box.
3. Netlify will generate a permanent live HTTPS link (e.g., `https://odisha-in-colour.netlify.app`).

### Option B: GitHub Pages
1. Create a new public repository on GitHub named `odisha-ar`.
2. Push or upload all files from `odisha-in-colour/` directly to the `main` branch.
3. In repository **Settings → Pages**, set the source to `Deploy from branch: main / (root)`.
4. Your live link will be `https://YOUR-USERNAME.github.io/odisha-ar/`.

---

## 📱 Generating & Testing the Final Print QR Code

1. Deploy the project to your live HTTPS URL (e.g. Netlify).
2. Open **`YOUR-LIVE-URL/qr.html`** in your browser.
3. The page automatically generates a print-ready $1200 \times 1200\text{ px}$ QR code pointing to your live URL with high error correction and a clean white quiet zone margin.
4. Click **"Download Print QR (PNG)"**.
5. Place the QR code in the margin of your printed poster alongside the instruction:  
   **"SCAN. LOOK CLOSER. DISCOVER ODISHA."**
