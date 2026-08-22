"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Check, ExternalLink } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import {
  createCheckoutSession,
  createPortalSession,
  getMe,
  getSubscription,
} from "@/lib/api";
import type { SubscriptionStatus, UserProfile } from "@/lib/types";

import styles from "@/components/AppShell.module.css";

type Plan = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  purchasable: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "For side projects and evaluation.",
    features: [
      "2 projects",
      "25 secrets",
      "2 runtime keys",
      "7-day audit retention",
      "Community support",
    ],
    purchasable: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    cadence: "per month",
    tagline: "For solo developers and small teams shipping to production.",
    features: [
      "20 projects",
      "1000 secrets",
      "50 runtime keys",
      "90-day audit retention",
      "Granular key scopes",
      "Email support",
    ],
    purchasable: true,
  },
  {
    id: "business",
    name: "Business",
    price: "$129",
    cadence: "per month",
    tagline: "For teams that need isolation, retention, and compliance evidence.",
    features: [
      "100 projects",
      "10,000 secrets",
      "200 runtime keys",
      "1-year audit retention",
      "Dynamic database credentials",
      "Priority support",
    ],
    purchasable: true,
  },
];

function BillingContent() {
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get("checkout");

  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [profile, sub] = await Promise.all([
          getMe(),
          getSubscription().catch(() => null),
        ]);
        setUser(profile);
        setSubscription(sub);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load billing details");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Provisioning happens through the Stripe webhook, not this redirect. If the
  // page loads right after checkout, the webhook may still be in flight — poll
  // briefly so the UI catches up instead of showing a stale plan.
  useEffect(() => {
    if (checkoutResult !== "success") return;

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const profile = await getMe();
        setUser(profile);
        if (profile.plan && profile.plan !== "free") {
          clearInterval(interval);
          const sub = await getSubscription().catch(() => null);
          setSubscription(sub);
        }
      } catch {
        // keep polling
      }
      if (attempts >= 6) clearInterval(interval);
    }, 2000);

    return () => clearInterval(interval);
  }, [checkoutResult]);

  async function handleUpgrade(planId: string) {
    setError("");
    setPendingPlan(planId);

    try {
      const { url } = await createCheckoutSession(planId);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setPendingPlan(null);
    }
  }

  async function handleManageBilling() {
    setError("");
    setPortalLoading(true);

    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the billing portal");
      setPortalLoading(false);
    }
  }

  const currentPlan = user?.plan ?? "free";
  const hasSubscription = subscription?.has_subscription ?? false;

  return (
    <AppShell title="Billing">
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Plan &amp; billing</p>
        <h1 className={styles.heroTitle}>Billing</h1>
        <p className={styles.heroLede}>
          Upgrade for higher limits and longer audit retention. Card details are handled
          entirely by Stripe — they never touch V-Secrets servers.
        </p>
      </section>

      {/* Post-checkout banners */}
      {checkoutResult === "success" ? (
        <div className={styles.revealBox} style={{ marginBottom: 24 }}>
          <h3 className={styles.revealTitle}>Payment received</h3>
          <p className={styles.revealWarning} style={{ marginBottom: 0 }}>
            Your subscription is being activated. This page updates automatically once
            Stripe confirms — usually a few seconds.
          </p>
        </div>
      ) : null}

      {checkoutResult === "cancelled" ? (
        <div className={styles.errorBanner}>
          Checkout was cancelled. No charge was made.
        </div>
      ) : null}

      {error ? <div className={styles.errorBanner}>{error}</div> : null}

      {/* Current plan summary */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Current plan</h2>
          {hasSubscription ? (
            <Button variant="ghost" onClick={handleManageBilling} disabled={portalLoading}>
              {portalLoading ? "Opening…" : "Manage billing"}
              <ExternalLink size={13} style={{ marginLeft: 6, verticalAlign: "-2px" }} />
            </Button>
          ) : null}
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Plan</div>
            <div className={styles.settingsValue}>
              <span className={styles.badge}>{loading ? "…" : currentPlan}</span>
            </div>
          </div>

          {hasSubscription ? (
            <>
              <div className={styles.settingsRow}>
                <div className={styles.settingsLabel}>Status</div>
                <div className={styles.settingsValue}>
                  <span className={styles.tableStatus}>
                    {subscription?.status === "active" ? (
                      <>
                        <span className={styles.tableStatusDot} />
                        active
                      </>
                    ) : (
                      <span style={{ color: "var(--danger)" }}>{subscription?.status}</span>
                    )}
                  </span>
                  {subscription?.status === "past_due" ? (
                    <div className={styles.settingsHint}>
                      Payment failed. Stripe will retry automatically — update your card in
                      the billing portal to avoid interruption.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className={styles.settingsRow}>
                <div className={styles.settingsLabel}>
                  {subscription?.cancel_at_period_end ? "Access until" : "Renews"}
                </div>
                <div className={styles.settingsValue}>
                  <span className={styles.settingsValueMono}>
                    {subscription?.current_period_end
                      ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
                      : "—"}
                  </span>
                  {subscription?.cancel_at_period_end ? (
                    <div className={styles.settingsHint}>
                      Cancellation scheduled. You keep full access until this date.
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* Plan comparison */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Plans</h2>
        </div>

        <div className={styles.actionGrid}>
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan;

            return (
              <div
                key={plan.id}
                className={styles.actionCard}
                style={{
                  cursor: "default",
                  borderColor: isCurrent ? "var(--border-gold)" : undefined,
                }}
              >
                <div>
                  <h3 className={styles.actionCardTitle} style={{ marginBottom: 4 }}>
                    {plan.name}
                    {isCurrent ? (
                      <span className={styles.badge} style={{ marginLeft: 8 }}>
                        current
                      </span>
                    ) : null}
                  </h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 28,
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {plan.price}
                    </span>
                    <span className={styles.statNote}>{plan.cadence}</span>
                  </div>
                </div>

                <p className={styles.actionCardDesc}>{plan.tagline}</p>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                  }}
                >
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        fontSize: 13,
                        color: "var(--text-muted)",
                      }}
                    >
                      <Check
                        size={13}
                        style={{
                          color: "var(--gold)",
                          flexShrink: 0,
                          marginTop: 3,
                        }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: "auto", paddingTop: 8 }}>
                  {isCurrent ? (
                    <Button variant="ghost" disabled>
                      Current plan
                    </Button>
                  ) : plan.purchasable ? (
                    <Button
                      variant="primary"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={pendingPlan !== null}
                    >
                      {pendingPlan === plan.id ? "Redirecting…" : `Upgrade to ${plan.name}`}
                    </Button>
                  ) : (
                    <Button variant="ghost" disabled>
                      Included by default
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Enterprise */}
      <section className={styles.section}>
        <div className={styles.card}>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Enterprise</div>
            <div className={styles.settingsValue}>
              Multi-region availability, customer-managed encryption keys, SSO, and
              contractual SLAs.
              <div className={styles.settingsHint}>
                <Link href="mailto:sales@vsecrets.dev" className={styles.sectionLink}>
                  Talk to us →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  );
}
