"use client";

import { useState } from "react";
import { Copy, EyeOff } from "lucide-react";
import { Button } from "./Button";

type SecretRevealModalProps = {
  secretKey: string;
  value: string;
  onClose: () => void;
};

export function SecretRevealModal({
  secretKey,
  value,
  onClose,
}: SecretRevealModalProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
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
            <h2>Secret revealed</h2>
            <p>{secretKey}</p>
          </div>

          <button className="icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="warning-box">
          This value is sensitive. Copy it only if you need it and avoid storing
          it in chats, screenshots or repositories.
        </div>

        <div className="secret-value-box">
          <code>{value}</code>
        </div>

        <div className="actions">
          <Button variant="primary" onClick={handleCopy}>
            <Copy size={16} />
            {copied ? "Copied" : "Copy value"}
          </Button>

          <Button variant="ghost" onClick={onClose}>
            <EyeOff size={16} />
            Hide
          </Button>
        </div>
      </div>
    </div>
  );
}