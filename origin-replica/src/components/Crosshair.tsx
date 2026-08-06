"use client";

import { useCrosshairRevealed } from "@/lib/use-reveal";
import styles from "./Crosshair.module.css";

export function Crosshair() {
  const revealed = useCrosshairRevealed();

  return (
    <div
      className={`${styles.root} ${revealed ? styles.revealed : ""}`}
      aria-hidden="true"
    >
      <span className={styles.marker} />
      <span className={styles.vert} />
      <span className={styles.horiz} />
    </div>
  );
}
