"use client";

import { IntroSequence } from "@/components/IntroSequence";
import { OriginBackground } from "@/components/OriginBackground";
import styles from "../page.module.css";

export default function JoinPage() {
  return (
    <main id="main" className={styles.main}>
      <OriginBackground />
      <IntroSequence />
    </main>
  );
}
