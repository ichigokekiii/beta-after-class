# Origin capture timing notes

- Captured: 2026-08-06 via Playwright (system Chrome) against live cursor.com/origin
- Viewport: 1440x900
- Canvas count: 2 (WebGL ripple + Canvas2D Lissajous loops)
- Body bg: rgb(20, 18, 11) / #14120b
- Theme: dark (data-origin-dark)

## Reveals (from use*Revealed hooks)

| Layer | Delay |
|---|---|
| Crosshair | 100ms |
| Background (image + shader fade) | 500ms |
| Content (logo, headline, form) | 800ms |

## Background

- Texture: `/marketing-static/origin/origin_background.webp`
- Component: `OriginRippleShader` (WebGL) with lens fringe, orb squeeze, film leak, push-in zoom
- CSS fade: `transition-opacity duration-700 ease-out`
- Overlay: `bg-black/20` (lg: `bg-black/25`)

## Lines (Canvas2D Lissajous)

```
freqX: 2, freqY: 3, radiusX: 3, radiusY: 2
segments: 1200, phase: 3π, solidFraction: 0.25
dash: [5, 7], dashSpeed: 12, lineWidth: 1
intro: drawOnMs 4400, dashDrawOnMs 4400, dashOffscreenMs 2400
      dashOvershoot 0.064, expandMs 1600, expandDelayMs 500
      centerHeightFraction 0.5
anchor: fromLeft 0.1, fromBottom 0.06
```

## Crosshair

- Vertical: `w-px h-[200vh] bg-white/10` at content left (~354px @ 1440)
- Horizontal: `h-px w-[200vw] bg-white/10` at logo top (~248px @ 1440)

## Typography (h1 @ 1440)

- Font: CursorGothic
- Size: 52px / line-height 52px / weight 400 / letter-spacing -1.3px
- Color: rgb(237, 236, 236)
