#!/usr/bin/env python3
"""Diff HTML signatures against jc/seth signature.png spacing."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
LOGO_H = 80
MAX_ERR = 1.5  # CSS px after logo-normalization


def screenshot(html: Path, out: Path) -> None:
    subprocess.run(
        [
            str(CHROME),
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--window-size=800,320",
            f"--screenshot={out}",
            html.resolve().as_uri(),
        ],
        check=True,
        capture_output=True,
    )


def measure_png(path: Path) -> dict:
    im = Image.open(path).convert("RGBA")
    arr = np.asarray(im)
    rgb = arr[:, :, :3].astype(np.int16)
    h, w = rgb.shape[:2]

    logo = (196, 368, 1397, 1218)
    div = (1748, 1791, 240, 1379)
    scale = LOGO_H / (logo[3] - logo[1] + 1)

    # first text x
    first = None
    for x in range(1800, w):
        col = rgb[:, x]
        n = int(
            (
                ((col[:, 0] < 20) & (col[:, 1] < 20) & (col[:, 2] < 20))
                | ((col[:, 0] > 235) & (col[:, 1] <= 165) & ((col[:, 0] - col[:, 1]) > 70))
                | (
                    (col[:, 0] >= 145)
                    & (col[:, 0] <= 170)
                    & (np.abs(col[:, 0] - col[:, 1]) <= 5)
                )
            ).sum()
        )
        if n > 40:
            first = x
            break

    def bands(kind: str):
        vals = []
        for y in range(h):
            row = rgb[y, first : first + 2500]
            r, g, b = row[:, 0], row[:, 1], row[:, 2]
            if kind == "black":
                n = int(((r < 20) & (g < 20) & (b < 20)).sum())
            elif kind == "pink":
                n = int(((r > 235) & (g >= 90) & (g <= 165) & ((r - g) > 70)).sum())
            else:
                n = int(
                    ((r >= 145) & (r <= 170) & (np.abs(r - g) <= 5) & (np.abs(g - b) <= 5)).sum()
                )
            vals.append(n)
        out = []
        y = 0
        thr = 100 if kind == "black" else 30
        while y < h:
            if vals[y] > thr:
                y0 = y
                while y < h and vals[y] > thr:
                    y += 1
                if y - y0 >= 20:
                    out.append((y0, y - 1))
            else:
                y += 1
        return out

    name = bands("black")[0]
    title = bands("pink")[0]
    gray = bands("gray")
    gray = [g for g in gray if g[0] > name[1] + 20]
    phone, email = gray[0], gray[1]
    ly0 = logo[1]

    def css(v):
        return v * scale

    return {
        "scale": scale,
        "gap_logo_div": css(div[0] - logo[2] - 1),
        "div_w": css(div[1] - div[0] + 1),
        "div_h": css(div[3] - div[2] + 1),
        "gap_div_text": css(first - div[1] - 1),
        "name_top": css(name[0] - ly0),
        "title_top": css(title[0] - ly0),
        "phone_top": css(phone[0] - ly0),
        "email_top": css(email[0] - ly0),
        "name_block": css(title[0] - name[0]),
        "title_block": css(phone[0] - title[0]),
        "phone_block": css(email[0] - phone[0]),
    }


def measure_html_shot(path: Path) -> dict:
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im)
    h, w = arr.shape[:2]
    rgb = arr.astype(np.int16)

    # content bbox
    ink = ~((rgb[:, :, 0] > 250) & (rgb[:, :, 1] > 250) & (rgb[:, :, 2] > 250))
    ys, xs = np.where(ink)
    crop = arr[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]
    rgb = crop.astype(np.int16)
    h, w = rgb.shape[:2]

    pink = (
        (rgb[:, :, 0] > 200)
        & (rgb[:, :, 1] < 190)
        & ((rgb[:, :, 0] - rgb[:, :, 1]) > 50)
        & (np.abs(rgb[:, :, 1] - rgb[:, :, 2]) < 55)
    )
    dens = pink.mean(axis=0)
    div_xs = np.where(dens > 0.35)[0]
    # rightmost thin cluster
    clusters = []
    if len(div_xs):
        start = prev = int(div_xs[0])
        for x in map(int, div_xs[1:]):
            if x - prev > 3:
                clusters.append((start, prev))
                start = x
            prev = x
        clusters.append((start, prev))
    div = None
    for a, b in clusters:
        if b - a + 1 <= 10:
            div = (a, b)
    if div is None and clusters:
        div = max(clusters, key=lambda t: dens[t[0] : t[1] + 1].mean())

    dx0, dx1 = div
    left = pink[:, : max(dx0 - 2, 1)]
    lys, lxs = np.where(left)
    logo = (int(lxs.min()), int(lys.min()), int(lxs.max()), int(lys.max()))
    scale = LOGO_H / (logo[3] - logo[1] + 1)
    # rescale so logo h == 80 conceptually: report in CSS px = raw * scale
    # Actually logo already ~80 in screenshot. Use raw pixels as CSS px if logo h ~= 80
    raw_logo_h = logo[3] - logo[1] + 1
    s = LOGO_H / raw_logo_h

    def css(v):
        return v * s

    # text bands
    def bands(kind: str):
        vals = []
        for y in range(h):
            row = rgb[y, dx1 + 3 :]
            r, g, b = row[:, 0], row[:, 1], row[:, 2]
            if kind == "black":
                n = int(((r < 40) & (g < 40) & (b < 40)).sum())
            elif kind == "pink":
                n = int(((r > 200) & (g < 190) & ((r - g) > 50)).sum())
            else:
                n = int(
                    ((r >= 120) & (r <= 190) & (np.abs(r - g) < 25) & (np.abs(g - b) < 25)).sum()
                )
            vals.append(n)
        out = []
        y = 0
        thr = 3
        while y < h:
            if vals[y] > thr:
                y0 = y
                while y < h and vals[y] > thr:
                    y += 1
                if y - y0 >= 5:
                    out.append((y0, y - 1))
            else:
                y += 1
        return out

    name = bands("black")[0]
    title = bands("pink")[0]
    gray = [g for g in bands("gray") if g[0] > name[1] + 5]
    phone, email = gray[0], gray[1]

    # first text x
    first = None
    for x in range(dx1 + 1, w):
        col = rgb[:, x]
        strong = (
            ((col[:, 0] < 40) & (col[:, 1] < 40) & (col[:, 2] < 40))
            | ((col[:, 0] > 200) & (col[:, 1] < 190) & ((col[:, 0] - col[:, 1]) > 50))
            | ((col[:, 0] >= 120) & (col[:, 0] <= 190) & (np.abs(col[:, 0] - col[:, 1]) < 25))
        )
        if int(strong.sum()) > 8:
            first = x
            break

    ly0 = logo[1]
    return {
        "gap_logo_div": css(dx0 - logo[2] - 1),
        "div_w": css(dx1 - dx0 + 1),
        "div_h": css(h),  # approx; better measure pink run
        "gap_div_text": css(first - dx1 - 1) if first is not None else None,
        "name_top": css(name[0] - ly0),
        "title_top": css(title[0] - ly0),
        "phone_top": css(phone[0] - ly0),
        "email_top": css(email[0] - ly0),
        "name_block": css(title[0] - name[0]),
        "title_block": css(phone[0] - title[0]),
        "phone_block": css(email[0] - phone[0]),
        "logo_h_raw": raw_logo_h,
    }


def compare(label: str, html_name: str, png_name: str) -> bool:
    shot = ROOT / f"_verify_{label}_shot.png"
    screenshot(ROOT / html_name, shot)
    ref = measure_png(ROOT / png_name)
    html = measure_html_shot(shot)
    print(f"\n{label}")
    print(" REF ", {k: round(ref[k], 2) for k in ("gap_logo_div", "div_w", "gap_div_text", "name_top", "name_block", "title_block", "phone_block", "title_top", "phone_top", "email_top")})
    print(" HTML", {k: round(html[k], 2) if isinstance(html[k], float) else html[k] for k in ("gap_logo_div", "div_w", "gap_div_text", "name_top", "name_block", "title_block", "phone_block", "title_top", "phone_top", "email_top")})

    keys = [
        "gap_logo_div",
        "div_w",
        "gap_div_text",
        "name_top",
        "name_block",
        "title_block",
        "phone_block",
    ]
    ok = True
    for k in keys:
        if html[k] is None:
            print(f"  FAIL {k}: missing")
            ok = False
            continue
        err = abs(html[k] - ref[k])
        status = "OK" if err <= MAX_ERR else "FAIL"
        if err > MAX_ERR:
            ok = False
        print(f"  {status} {k}: html={html[k]:.2f} ref={ref[k]:.2f} err={err:.2f}")

    # side-by-side visual at logo-normalized scale
    sc = Image.open(shot).convert("RGB")
    # crop content
    arr = np.asarray(sc)
    ink = ~((arr[:, :, 0] > 250) & (arr[:, :, 1] > 250) & (arr[:, :, 2] > 250))
    ys, xs = np.where(ink)
    sc = sc.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    ref_im = Image.open(ROOT / png_name).convert("RGB")
    # crop content from png
    rarr = np.asarray(ref_im)
    rink = ~((rarr[:, :, 0] > 248) & (rarr[:, :, 1] > 248) & (rarr[:, :, 2] > 248))
    rys, rxs = np.where(rink)
    ref_im = ref_im.crop((rxs.min(), rys.min(), rxs.max() + 1, rys.max() + 1))
    # scale ref so logo ~80 (content height 1140 -> 107)
    scale = (LOGO_H / 851)
    ref_im = ref_im.resize(
        (max(1, int(round(ref_im.size[0] * scale))), max(1, int(round(ref_im.size[1] * scale)))),
        Image.Resampling.LANCZOS,
    )
    # scale html so logo h = 80
    html_logo_h = html["logo_h_raw"]
    hs = LOGO_H / html_logo_h
    sc = sc.resize(
        (max(1, int(round(sc.size[0] * hs))), max(1, int(round(sc.size[1] * hs)))),
        Image.Resampling.LANCZOS,
    )
    H = max(sc.size[1], ref_im.size[1])
    W = max(sc.size[0], ref_im.size[0])
    a = Image.new("RGB", (W, H), "white")
    b = Image.new("RGB", (W, H), "white")
    a.paste(sc, (0, 0))
    b.paste(ref_im, (0, 0))
    diff = ImageChops.difference(a, b).point(lambda p: min(255, p * 3))
    combo = Image.new("RGB", (W * 3 + 20, H), "#ddd")
    combo.paste(a, (0, 0))
    combo.paste(b, (W + 10, 0))
    combo.paste(diff, (2 * W + 20, 0))
    combo.save(ROOT / f"_verify_{label}_compare.png")
    return ok


def main() -> int:
    if not CHROME.exists():
        print("Chrome not found", file=sys.stderr)
        return 2
    failed = 0
    for label, html, png in [
        ("jc", "jc.html", "jc signature.png"),
        ("seth", "seth.html", "seth signature.png"),
    ]:
        if not compare(label, html, png):
            failed += 1
            print(f"FAIL {label}")
        else:
            print(f"PASS {label}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
