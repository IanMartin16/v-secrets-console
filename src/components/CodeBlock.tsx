"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import styles from "./AppShell.module.css";

type CodeBlockProps = {
  /** Label shown in the header, e.g. "bash", "node", "python" */
  label?: string;
  code: string;
};

export function CodeBlock({ label = "bash", code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable (insecure context / old browser) — no-op
    }
  }

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeBlockHeader}>
        <span className={styles.codeBlockLabel}>{label}</span>
        <button type="button" className={styles.copyBtn} onClick={handleCopy}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className={styles.codeBlockBody}>
        <pre>{code}</pre>
      </div>
    </div>
  );
}

type TabbedCodeProps = {
  tabs: { label: string; code: string }[];
};

export function TabbedCode({ tabs }: TabbedCodeProps) {
  const [active, setActive] = useState(0);
  const current = tabs[active];

  return (
    <div>
      <div className={styles.tabs}>
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            className={`${styles.tab} ${index === active ? styles.tabActive : ""}`}
            onClick={() => setActive(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <CodeBlock label={current.label} code={current.code} />
    </div>
  );
}
