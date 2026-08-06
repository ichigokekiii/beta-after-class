# Origin Waitlist Animation Replica

Local animation lab reverse-engineering [cursor.com/origin](https://cursor.com/origin).

**Private reference only.** Do not deploy Cursor copy publicly.

## Run

```bash
npm install
npm run capture:install   # once (Playwright Chrome)
npm run capture           # forensic frames → reference/
npm run dev               # http://localhost:3456
npm run verify            # screenshot local frames for overlay
```

Open `scripts/compare-overlay.html` in a browser (with `npm run dev` running) to fade between a reference frame and the local render at 1440×900.

## What was extracted

| Layer | Technique | Source |
|---|---|---|
| Background texture | `origin_background.webp` | Live + Wayback |
| Lens / chromatic / film leak | WebGL `OriginRippleShader` | Chunk `11hw9av10um2e.js` |
| Background lines | Canvas2D Lissajous (2:3) | Chunk `05s6claxjscec.js` |
| Crosshair | CSS 1px spans `bg-white/10` | Live DOM |
| Intro reveals | 100 / 500 / 800 ms | `use*Revealed` hooks |
| Easings | `easeGlide` / `INTRO_GLIDE` tables | Chunk `762642` |

## Layout

```
origin-replica/
  src/
    app/                  # Next.js shell
    components/
      OriginBackground.tsx
      OriginRippleShader.tsx
      OriginLoops.tsx       # Lissajous line field
      IntroSequence.tsx
      WaitlistShell.tsx
      Crosshair.tsx
    lib/
      animation-timeline.ts
      easing.ts
      render-loop.ts
  scripts/
    capture-reference.ts
    compare-overlay.html
    verify-local.ts
  reference/              # gitignored captures
  scratch/line-technique.html
  public/origin_background.webp
```

## Technique decision

`scratch/line-technique.html` compares SVG stroke-dashoffset vs Canvas Lissajous. Canvas wins because Origin draws a parametric 2:3 curve with solid then dashed stroke, expand-from-center intro, and dash overshoot timing that SVG alone cannot express.
