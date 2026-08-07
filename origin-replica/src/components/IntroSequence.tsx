"use client";

import { Crosshair } from "@/components/Crosshair";
import { WaitlistShell } from "@/components/WaitlistShell";
import { INTRO_GLIDE, toCssLinear } from "@/lib/easing";
import { useContentRevealed } from "@/lib/use-reveal";
import styles from "./IntroSequence.module.css";

const INTRO_EASE = toCssLinear(INTRO_GLIDE);
const BRAND_LOGO_SRC = "/after-class-logo.svg";

export function IntroSequence() {
  const revealed = useContentRevealed();

  return (
    <div className={styles.grid}>
      <div className={styles.column}>
        <span aria-hidden="true" className={styles.anchor}>
          <Crosshair />
        </span>

        <div
          data-revealed={revealed ? "true" : undefined}
          className={`${styles.content} ${revealed ? styles.revealed : ""}`}
          style={{ ["--intro-ease" as string]: INTRO_EASE }}
        >
          <div className={styles.brand}>
            <a href="/join" aria-label="After Class home" className={styles.mark}>
              <img
                src={BRAND_LOGO_SRC}
                alt=""
                className={styles.brandLogo}
                decoding="async"
              />
            </a>
          </div>

          <div className={styles.copy}>
            <h1 className={styles.headline}>The first move is showing up.</h1>
            <p className={styles.subcopy}>
              Online dating gets stuck in text before anyone ever meets.
              <br />
              After Class was built to get you out of it.
            </p>
          </div>

          <WaitlistShell />
        </div>
      </div>
    </div>
  );
}
