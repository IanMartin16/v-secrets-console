// components/PostHogProvider.tsx
//
// PostHog in the Next.js App Router.
//
// Two things the default snippet gets wrong here:
//
//   1. Client-side navigations don't trigger a page load, so automatic pageview
//      capture misses every route change after the first. Pageviews are sent
//      manually on pathname change instead.
//
//   2. useSearchParams() forces the component into client rendering and breaks
//      static prerendering unless it sits inside a Suspense boundary — the same
//      build error the login page hit.

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const client = usePostHog();

  useEffect(() => {
    if (!pathname || !client) return;

    let url = window.origin + pathname;
    const query = searchParams?.toString();
    if (query) url += `?${query}`;

    client.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, client]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",

      // Handled by PageViewTracker above
      capture_pageview: false,

      // Fires when the tab closes, so bounce time is measurable
      capture_pageleave: true,

      // Records where people stop scrolling on the landing — the signal for
      // whether the hero holds attention past the fold.
      capture_heatmaps: true,

      persistence: "localStorage+cookie",
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}
