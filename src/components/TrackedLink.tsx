// components/TrackedLink.tsx
"use client";

import Link from "next/link";
import { usePostHog } from "posthog-js/react";

export function TrackedLink({
  href,
  event,
  properties,
  className,
  children,
}: {
  href: string;
  event: string;
  properties?: Record<string, string>;
  className?: string;
  children: React.ReactNode;
}) {
  const posthog = usePostHog();

  return (
    <Link
      href={href}
      className={className}
      onClick={() => posthog?.capture(event, properties)}
    >
      {children}
    </Link>
  );
}