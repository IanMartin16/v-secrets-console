"use client";

import { useState } from "react";
import { Copy, KeyRound } from "lucide-react";
import { Button } from "./Button";

type RuntimeKeyCreatedModalProps = {
  apiKey: string;
  onClose: () => void;
};

export function RuntimeKeyCreatedModal({
  apiKey,
  onClose,
}: RuntimeKeyCreatedModalProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Runtime key created</h2>
            <p>Copy this key now. You won’t be able to see it again.</p>
          </div>

          <button className="icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="warning-box">
          Store this runtime key in your app environment variables. Do not commit
          it to GitHub or share it in chats.
        </div>

        <div className="secret-value-box">
          <code>{apiKey}</code>
        </div>

        <div className="actions">
          <Button variant="primary" onClick={handleCopy}>
            <Copy size={16} />
            {copied ? "Copied" : "Copy runtime key"}
          </Button>

          <Button variant="ghost" onClick={onClose}>
            <KeyRound size={16} />
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}