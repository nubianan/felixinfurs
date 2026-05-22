# The Juno Room

An immersive, interactive candlelit music room built for the web — where Felix Mendelssohn performed for Johann Wolfgang von Goethe. Five pieces of Mendelssohn's music are hidden as scattered sheet music pages on the floor. Hover to reveal the title; click to send the page to the piano and begin playback.

---

## Why GitHub Pages isn't loading

The most common reasons, in order:

### 1. The file must be named `index.html`
GitHub Pages only auto-serves a file called `index.html`. Rename `juno-room.html` → `index.html` before pushing.

### 2. GitHub Pages must be enabled in repository Settings
`Settings → Pages → Source → Deploy from a branch → select main → / (root) → Save`

Wait ~60 seconds after saving. GitHub sends a notification email when the site is live.

### 3. The URL is `https://yourusername.github.io/your-repo-name/` — not the raw file URL
Accessing `github.com/you/repo/blob/main/index.html` shows the source code.
The live site is at `github.io`, not `github.com`.

---

## File structure

```
your-repo/
├── index.html          ← rename from juno-room.html
├── manifest.json
├── sw.js
├── audio/              ← add your MP3s here (see Audio section below)
│   ├── violin_concerto.mp3
│   ├── hebrides.mp3
│   ├── spring_song.mp3
│   ├── spinning_song.mp3
│   └── wedding_march.mp3
├── icons/              ← create these for PWA install prompts
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon-180.png    ← Apple touch icon
└── screenshots/        ← optional, shown in PWA install UI
    ├── desktop.jpg
    └── mobile.jpg
```

---

## Two things to add to `index.html`

Open `index.html` and add these two snippets.

### 1. In `<head>` — link the manifest (enables PWA install + theme color)

```html
<link rel="manifest" href="./manifest.json">
<meta name="theme-color" content="#c8a34a">
<link rel="apple-touch-icon" href="./icons/icon-180.png">
```

### 2. Before `</body>` — register the service worker (enables offline + fast repeat loads)

```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('[Juno Room] SW registered, scope:', reg.scope))
        .catch(err => console.warn('[Juno Room] SW registration failed:', err));
    });
  }
</script>
```

---

## Adding real audio files

The app ships with a synthesized demo tone for each piece. To use actual Mendelssohn recordings, edit the `PIECES` array near the top of the `<script>` section in `index.html`:

```javascript
const PIECES = [
  { title: "Violin Concerto in E Minor…", src: "./audio/violin_concerto.mp3" },
  { title: "The Hebrides…",               src: "./audio/hebrides.mp3"        },
  { title: "Songs Without Words… Spring", src: "./audio/spring_song.mp3"     },
  { title: "Songs Without Words… Spinning",src: "./audio/spinning_song.mp3"  },
  { title: "A Midsummer Night's Dream…",  src: "./audio/wedding_march.mp3"   },
];
```

Audio requirements:
- Format: MP3 or OGG (MP3 has widest browser support)
- Bitrate: 128–192 kbps is fine; avoid lossless files (too large to cache)
- The service worker will cache each file after the first play, so repeat listens are instant and work offline

---

## Customisation reference

All positions are **percentages of the image** (0–100), set in the JavaScript constants inside `index.html`.

### Sheet music positions on the floor

Find `const LAYOUTS` and adjust `l` (left %), `t` (top %), and `rot` (rotation in degrees):

```javascript
const LAYOUTS = {
  landscape: [
    { l: 28, t: 63, rot: -22, … },   // Page 1 — Violin Concerto
    { l: 36, t: 69, rot:  13, … },   // Page 2 — Hebrides
    { l: 43, t: 74, rot:  -8, … },   // Page 3 — Spring Song
    { l: 33, t: 78, rot:  27, … },   // Page 4 — Spinning Song
    { l: 47, t: 81, rot: -17, … },   // Page 5 — Wedding March
  ],
  …
};
```

### Piano music-stand position

Find `const PIANO` and adjust where the page appears when clicked:

```javascript
const PIANO = {
  landscape: { l: 57, t: 38, w: 20, rot: -1 },
  portrait:  { l: 51, t: 35, w: 26, rot: -1 },
};
```

`l` = left edge %, `t` = top %, `w` = width %, `rot` = tilt degrees.

### Candle light zones

Find `const LZLS` (landscape) and `const LZPT` (portrait). Each zone has:
- `l`, `t` — position (%)
- `w`, `h` — size (% of overlay)
- `grad` — the radial gradient (adjust `peak` opacity, focal point `fx`/`fy`)
- `anim` — which flicker animation (`fk1`, `fk2`, or `fk3`)

### Wax drip positions

Find `const DRLS` / `const DRPT`. Each entry's `l` and `t` must sit exactly at the base of a candle stick in the image. Adjust in small increments (0.5%) while viewing the live site.

---

## Deployment options

| Host | Steps | HTTPS | Custom domain | Cost |
|------|-------|-------|---------------|------|
| **GitHub Pages** | Push to repo, enable in Settings | ✅ auto | ✅ free | Free |
| **Netlify** | Drag-and-drop the folder at netlify.com | ✅ auto | ✅ free | Free |
| **Vercel** | `vercel` CLI or import GitHub repo | ✅ auto | ✅ free | Free |
| **Cloudflare Pages** | Import GitHub repo | ✅ auto | ✅ free | Free |

Service workers require HTTPS — all of the above provide it automatically.

### Netlify (fastest path — no configuration needed)
1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag your entire project folder into the browser window
3. Live in under 30 seconds at a `*.netlify.app` URL

---

## PWA icons (required for install prompt)

Create square images and save as PNG:

| File | Size | Used by |
|------|------|---------|
| `icons/icon-192.png` | 192 × 192 px | Android home screen, Chrome install prompt |
| `icons/icon-512.png` | 512 × 512 px | Android splash screen |
| `icons/icon-180.png` | 180 × 180 px | Apple iPhone/iPad home screen |

Suggested design: a single lit candle or a treble clef on a black or deep brown background with amber/gold tones (`#c8a34a`).

Free tools: [Canva](https://canva.com), [GIMP](https://gimp.org), or generate from an image at [maskable.app](https://maskable.app).

---

## Browser support

| Feature | Chrome | Safari (iOS) | Firefox | Samsung Internet |
|---------|--------|--------------|---------|-----------------|
| Core experience | ✅ 90+ | ✅ 15.4+ | ✅ 90+ | ✅ 14+ |
| Service worker | ✅ | ✅ | ✅ | ✅ |
| PWA install | ✅ | ✅ (Add to Home) | ⚠️ limited | ✅ |
| Web Audio API | ✅ | ✅ | ✅ | ✅ |

**Note for Safari/iOS:** Audio requires a user gesture (tap) before it can start. The existing click-to-play architecture handles this correctly — the synthesised intro pad will fire on the first tap anywhere on the loading screen.

---

## Service worker cache management

The SW uses three named caches:

| Cache | Contents | Strategy |
|-------|----------|----------|
| `juno-room-v1-shell` | `index.html` | Cache-first |
| `juno-room-v1-audio` | MP3 files | Cache-first (skips range requests) |
| `juno-room-v1-fonts` | Google Fonts | Network-first, cache fallback |

To force a full refresh after updating `index.html`, increment the version string at the top of `sw.js`:

```javascript
const VERSION = 'juno-room-v2';   // ← bump this
```

To clear the audio cache from the app (e.g., after swapping audio files), call from the browser console:
```javascript
navigator.serviceWorker.controller.postMessage('CLEAR_AUDIO_CACHE');
```

---

## Local development

Browsers block service workers on `file://` URLs. Use a local server instead:

```bash
# Python (built in)
python3 -m http.server 8080

# Node
npx serve .

# VS Code
# Install the "Live Server" extension, right-click index.html → Open with Live Server
```

Then open `http://localhost:8080` in your browser.

---

## License & credits

Room imagery generated with AI (ChatGPT/DALL·E, May 2026).  
Music by Felix Mendelssohn Bartholdy (public domain).  
Web experience built with vanilla HTML, CSS, and Web Audio API — no frameworks, no build step.
