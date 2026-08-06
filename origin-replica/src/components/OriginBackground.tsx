"use client";

import { OriginLoops } from "@/components/OriginLoops";
import { OriginRippleShader } from "@/components/OriginRippleShader";
import { HERO_BACKGROUND_SRC } from "@/lib/animation-timeline";
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
          <img
            src={HERO_BACKGROUND_SRC}
            alt=""
            aria-hidden="true"
            className={styles.fallbackImg}
            decoding="async"
          />
          <OriginRippleShader className={styles.canvas} />
        </div>
        <div className={styles.dim} />
      </div>
      <div className={styles.loops} aria-hidden="true">
        <OriginLoops className={styles.canvas} />
      </div>
    </>
  );
}
