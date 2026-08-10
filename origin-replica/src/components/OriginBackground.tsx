"use client";

import { MapPanBackground } from "@/components/MapPanBackground";
import { OriginLoops } from "@/components/OriginLoops";
import { useBackgroundRevealed } from "@/lib/use-reveal";
import styles from "./OriginBackground.module.css";

export function OriginBackground() {
  const revealed = useBackgroundRevealed();

  return (
    <>
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.solid} />
        <div
          className={`${styles.shaderWrap} ${revealed ? styles.shaderVisible : ""}`}
        >
          <MapPanBackground className={styles.mapLayer} />
        </div>
        <div className={styles.dim} />
      </div>
      <div className={styles.loops} aria-hidden="true">
        <OriginLoops className={styles.canvas} />
      </div>
      <a
        className={styles.attribution}
        href="https://www.maptiler.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        © MapTiler © OpenStreetMap
      </a>
    </>
  );
}
