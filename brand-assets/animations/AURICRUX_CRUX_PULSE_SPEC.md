# Auricrux Crux Pulse — Motion Mark Specification

**Owner:** Future Contractors of America LLC  
**Mark name:** Auricrux Crux Pulse  
**Asset file:** `brand-assets/animations/auricrux-crux-pulse.svg`  
**Purpose:** Distinctive animated brand identifier for trademark (motion mark) and product loading states.

---

## Description (for USPTO / counsel)

The mark consists of a gold radial medallion containing a six-point star outline and a central **crux** (diamond body with vertical stem and horizontal crossbar). Over a **three-second loop**:

1. The outer circle subtly expands and contracts (51px to 53px radius).
2. The core glow shifts from warm white-gold to amber and back.
3. The crux diamond scales to 106% and returns.
4. The vertical stem stroke width pulses from 7 to 8.5 units.

The animation is **non-functional ornamentation** — it identifies the Auricrux intelligence layer, not a loading progress indicator tied to system state.

---

## Export for filing

| Format | Use | How |
|--------|-----|-----|
| **MP4** (720p, 3s loop, 30fps) | USPTO motion trademark specimen | Open SVG in browser, screen-record, or use Adobe Media Encoder / ffmpeg |
| **GIF** | Marketing / app store | Convert from MP4 |
| **PNG sequence** | Backup specimen | 90 frames @ 30fps |

**ffmpeg example (after recording MP4):**
```bash
ffmpeg -i auricrux-crux-pulse.mp4 -vf "fps=30,scale=720:-1" -c:v libx264 -pix_fmt yuv420p auricrux-crux-pulse-specimen.mp4
```

---

## Web usage

Link in product (optional):
```html
<img src="/brand/animations/auricrux-crux-pulse.svg" alt="Auricrux" width="64" height="64" />
```

Always display with **AURICRUX** word mark or "Auricrux" text nearby on first use in each context (trademark notice).

---

## Do not

- Use generic spinner or stock Lottie animations as substitute (weakens distinctiveness).
- Change timing, colors, or geometry without incrementing `BRAND_MANIFEST.json` version.
- Animate the FCA hex mark with the same pulse pattern (keep marks visually distinct).

---

## Copyright

Copyright (c) 2026 Future Contractors of America LLC. All rights reserved.
