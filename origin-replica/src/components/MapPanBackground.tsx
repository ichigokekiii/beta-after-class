"use client";

import { useEffect, useRef } from "react";
import styles from "./MapPanBackground.module.css";

const STYLE_URL = (key: string) =>
  `https://api.maptiler.com/maps/openstreetmap-dark/style.json?key=${key}`;

/** Served from /public — MapLibre 6 worker needs sibling shared.mjs */
const WORKER_URL = "/maplibre/maplibre-gl-worker.mjs";

/** Metro Manila — After Class home market */
const START: [number, number] = [121.0, 14.55];
const ZOOM = 10.2;
/** Slow wallpaper drift — applied ~20fps so tiles can keep up */
const LNG_STEP = 0.00035;
const LAT_STEP = 0.00012;
const PAN_MS = 50;

type Props = {
  className?: string;
};

export function MapPanBackground({ className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (!el || !key) return;

    let cancelled = false;
    let map: {
      remove: () => void;
      loaded: () => boolean;
      getCenter: () => { lng: number; lat: number };
      setCenter: (c: [number, number]) => void;
      once: (e: string, fn: () => void) => void;
      resize: () => void;
    } | null = null;
    let interval = 0;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      const maplibregl = await import("maplibre-gl");
      if (cancelled || !el) return;

      // Bundlers don't resolve the worker sibling; pin same-origin public URL.
      maplibregl.setWorkerUrl(WORKER_URL);

      map = new maplibregl.Map({
        container: el,
        style: STYLE_URL(key),
        center: START,
        zoom: ZOOM,
        interactive: false,
        attributionControl: false,
        fadeDuration: 0,
        pitchWithRotate: false,
        dragPan: false,
        dragRotate: false,
        scrollZoom: false,
        boxZoom: false,
        doubleClickZoom: false,
        keyboard: false,
        touchZoomRotate: false,
        touchPitch: false,
      });

      const startPan = () => {
        map?.resize();
        if (cancelled || reduced || !map || interval) return;
        interval = window.setInterval(() => {
          if (!map?.loaded()) return;
          const c = map.getCenter();
          map.setCenter([c.lng + LNG_STEP, c.lat + LAT_STEP]);
        }, PAN_MS);
      };

      // Wait until first tiles paint before drifting
      map.once("idle", startPan);
      map.once("load", () => map?.resize());
    })();

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      map?.remove();
    };
  }, []);

  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  if (!key) {
    return <div className={`${styles.map} ${styles.fallback} ${className ?? ""}`} />;
  }

  return (
    <div className={`${styles.wrap} ${className ?? ""}`} aria-hidden="true">
      <div ref={containerRef} className={styles.map} />
      <div className={styles.blur} />
    </div>
  );
}
