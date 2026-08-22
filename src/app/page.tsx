import Link from "next/link";
import type { Metadata } from "next";

import styles from "./landing.module.css";
import { TrackedLink } from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "V-Secrets — Encrypted secrets management without the setup",
  description:
    "Store API keys, database URLs and tokens with AES-256-GCM encryption, scoped runtime keys, rotation with grace periods, and a full audit trail. Running in five minutes.",
};

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* ================= Nav ================= */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.brandMark} aria-label="V-Secrets home">
          <span className={styles.brandMarkIcon} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z" />
              <circle cx="12" cy="11" r="2" />
              <path d="M12 13v3" />
            </svg>
          </span>
          <span className={styles.brandMarkName}>V-Secrets</span>
        </Link>

        <div className={styles.navLinks}>
          <a href="#how" className={styles.navLink}>How it works</a>
          <a href="#security" className={styles.navLink}>Security</a>
          <a href="#pricing" className={styles.navLink}>Pricing</a>
          <Link href="/docs" className={styles.navLink}>Docs</Link>
          <Link href="/login" className={styles.navLink}>Sign in</Link>
          <Link href="/register" className={styles.navCta}>Start free</Link>
        </div>
      </nav>

      {/* ================= Hero ================= */}
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>Developer secrets manager</div>

          <h1 className={styles.heroTitle}>
            Secrets management
            <br />
            without the <span className={styles.accent}>setup tax</span>.
          </h1>

          <p className={styles.heroLede}>
            The same encryption, scoping and audit trail you'd get from Vault or AWS —
            without the afternoon of configuration, and without the 2am troubleshooting
            when something breaks.
          </p>

          <div className={styles.heroActions}>
            <TrackedLink
              href="/register"
              event="cta_clicked"
              properties={{ location: "hero" }}
              className={styles.primaryCta}
            >
              Start free — no card
            </TrackedLink>
            <a href="#how" className={styles.secondaryCta}>
              See how it works
            </a>
          </div>
          <p className={styles.heroFootnote}>
            Free tier: 2 projects, 25 secrets, 2 runtime keys. No time limit.
          </p>
        </div>

        {/* The vault demo — the product explaining itself */}
        <div className={styles.heroVisual}>
          <div className={styles.vaultDemo}>
            <div className={styles.vaultDemoHeader}>
              <span className={styles.vaultDemoTitle}>vault · encrypt</span>
              <span className={styles.vaultDemoDots} aria-hidden="true">
                <span /><span /><span />
              </span>
            </div>
            <div className={styles.vaultDemoBody}>
              <div className={styles.vaultRow}>
                <span className={styles.vaultKey}>key</span>
                <span className={styles.vaultVal}>DATABASE_URL</span>
              </div>
              <div className={styles.vaultRow}>
                <span className={styles.vaultKey}>cipher</span>
                <span className={`${styles.vaultVal} ${styles.vaultValCipher}`}>AES-256-GCM</span>
              </div>
              <div className={styles.vaultRow}>
                <span className={styles.vaultKey}>nonce</span>
                <span className={styles.vaultVal}>7e3ac6…59fe</span>
              </div>
              <div className={styles.vaultRow}>
                <span className={styles.vaultKey}>auth_tag</span>
                <span className={styles.vaultVal}>f4bc0a…b8ee</span>
              </div>
              <div className={styles.vaultRow}>
                <span className={styles.vaultKey}>stored</span>
                <span className={`${styles.vaultVal} ${styles.vaultValMasked}`}>
                  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
                </span>
              </div>
              <div className={styles.vaultStatus}>
                <span className={styles.vaultStatusDot} aria-hidden="true" />
                <span>encrypted at rest · scoped access · fully audited</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= The contrast ================= */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <div className={styles.eyebrow}>Why this exists</div>
            <h2 className={styles.sectionTitle}>
              Enterprise tooling asks for an enterprise team
            </h2>
            <p className={styles.sectionLede}>
              Vault and AWS Secrets Manager are excellent — if you have someone whose job
              is running them. Most teams don't, and end up with credentials in a .env file
              nobody wants to talk about.
            </p>
          </div>

          <div className={styles.compareGrid}>
            <div className={styles.compareCard}>
              <div className={styles.compareLabel}>The usual path</div>
              <ul className={styles.compareList}>
                <li>Cluster setup, seal/unseal, policy language to learn</li>
                <li>IAM roles, KMS keys, regional configuration</li>
                <li>An afternoon before storing your first secret</li>
                <li>Documentation written for platform teams</li>
                <li>Incidents that need someone who knows the internals</li>
              </ul>
            </div>

            <div className={`${styles.compareCard} ${styles.compareCardGold}`}>
              <div className={styles.compareLabelGold}>V-Secrets</div>
              <ul className={`${styles.compareList} ${styles.compareListGold}`}>
                <li>Sign in with GitHub, create a project, store a secret</li>
                <li>One API key, one header, done</li>
                <li>Five minutes to production</li>
                <li>Documentation written for the person shipping the app</li>
                <li>Behaviour you can reason about at 2am</li>
              </ul>
            </div>
          </div>

          <p className={styles.compareNote}>
            Same AES-256-GCM. Same scoped access. Same audit trail. Less ceremony.
          </p>
        </div>
      </section>

      {/* ================= How it works ================= */}
      <section className={styles.section} id="how">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <div className={styles.eyebrow}>How it works</div>
            <h2 className={styles.sectionTitle}>Three steps, about five minutes</h2>
          </div>

          <div className={styles.stepGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Store a secret</h3>
              <p className={styles.stepDesc}>
                Encrypted with AES-256-GCM before it reaches the database. Plaintext never
                touches disk or logs.
              </p>
              <pre className={styles.code}>{`curl -X POST api.vsecrets.dev/projects/$ID/secrets \\
  -H "X-API-Key: $VSECRETS_KEY" \\
  -d '{"key":"DATABASE_URL","value":"postgres://…"}'`}</pre>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Issue a runtime key</h3>
              <p className={styles.stepDesc}>
                Scoped to one project, read-only or read-write, with an expiry date. Your
                service authenticates without a password.
              </p>
              <pre className={styles.code}>{`scopes:  projects:read
         secrets:read
         secrets:reveal`}</pre>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Read it at boot</h3>
              <p className={styles.stepDesc}>
                Fetch once at startup, hold it in memory. Every reveal is recorded against
                the key that requested it.
              </p>
              <pre className={styles.code}>{`const res = await fetch(revealUrl, {
  method: "POST",
  headers: { "X-API-Key": process.env.VSECRETS_KEY },
});
const { value } = await res.json();`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Capabilities ================= */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <div className={styles.eyebrow}>What you get</div>
            <h2 className={styles.sectionTitle}>Built for the incident, not the demo</h2>
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Rotation with a grace period</h3>
              <p className={styles.featureDesc}>
                Rotating issues a replacement and keeps the old key alive for 24 hours, so
                your services pick up the new value without an outage. Most tools make you
                choose between rotating and staying up.
              </p>
            </div>

            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Scopes that actually scope</h3>
              <p className={styles.featureDesc}>
                A key can list secrets without being able to decrypt them. Bind it to a
                single project so a leak in staging can't reach production.
              </p>
            </div>

            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Every reveal recorded</h3>
              <p className={styles.featureDesc}>
                Which credential, from where, whether it succeeded. When you need to answer
                "what did this key touch", the answer is already there.
              </p>
            </div>

            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Versioned secrets</h3>
              <p className={styles.featureDesc}>
                Updating creates a new version instead of overwriting. Rotations stay
                reversible.
              </p>
            </div>

            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Passwordless by default</h3>
              <p className={styles.featureDesc}>
                GitHub OAuth or an emailed sign-in link. No password to leak, phish, or
                reuse. Password sign-in stays available if you want it.
              </p>
            </div>

            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>REST API, no SDK required</h3>
              <p className={styles.featureDesc}>
                One header, standard HTTP. Works from any language, any CI system, any
                container — nothing to install.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Security transparency ================= */}
      <section className={styles.section} id="security">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <div className={styles.eyebrow}>Under the hood</div>
            <h2 className={styles.sectionTitle}>The specifics, not the adjectives</h2>
            <p className={styles.sectionLede}>
              You're being asked to hand over your AWS and Stripe credentials. Here is
              exactly what happens to them — judge for yourself rather than taking
              "bank-grade" on faith.
            </p>
          </div>

          <div className={styles.specTable}>
            <div className={styles.specRow}>
              <div className={styles.specLabel}>Encryption</div>
              <div className={styles.specValue}>
                AES-256-GCM, authenticated
                <span className={styles.specNote}>
                  Each ciphertext is bound to its project, key name and version. Moving
                  encrypted data between projects makes decryption fail rather than
                  silently succeed.
                </span>
              </div>
            </div>

            <div className={styles.specRow}>
              <div className={styles.specLabel}>Key derivation</div>
              <div className={styles.specValue}>
                HKDF-SHA256, one key per project
                <span className={styles.specNote}>
                  Projects are cryptographically isolated. Compromising one doesn't expose
                  another.
                </span>
              </div>
            </div>

            <div className={styles.specRow}>
              <div className={styles.specLabel}>Password hashing</div>
              <div className={styles.specValue}>
                Argon2id, 64 MiB memory cost
                <span className={styles.specNote}>
                  Memory-hard, so GPU and ASIC farms can't parallelise an offline attack.
                  The current OWASP recommendation.
                </span>
              </div>
            </div>

            <div className={styles.specRow}>
              <div className={styles.specLabel}>Runtime keys</div>
              <div className={styles.specValue}>
                268 bits of entropy, stored as HMAC-SHA256
                <span className={styles.specNote}>
                  The raw key exists once, at creation. A database dump contains hashes,
                  not credentials.
                </span>
              </div>
            </div>

            <div className={styles.specRow}>
              <div className={styles.specLabel}>Brute force</div>
              <div className={styles.specValue}>
                Progressive lockout, per account and per IP
                <span className={styles.specNote}>
                  Repeated failures escalate from minutes to hours. Credential stuffing
                  across many accounts trips the per-IP limit.
                </span>
              </div>
            </div>

            <div className={styles.specRow}>
              <div className={styles.specLabel}>Sessions</div>
              <div className={styles.specValue}>
                30-minute tokens, refreshed silently
                <span className={styles.specNote}>
                  A stolen token is useful for minutes, not weeks — without making you sign
                  in every half hour.
                </span>
              </div>
            </div>
          </div>

          <div className={styles.honestyNote}>
            <strong>What we don't claim.</strong> V-Secrets is not SOC 2 certified and
            decrypts server-side, which means we technically can read your values. Anyone
            telling you otherwise about a product at this stage is overselling. Zero-knowledge
            encryption — where the server mathematically cannot decrypt — is in development.
            Until it ships, this page won't pretend otherwise.
          </div>
        </div>
      </section>

      {/* ================= Pricing ================= */}
      <section className={styles.section} id="pricing">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <div className={styles.eyebrow}>Pricing</div>
            <h2 className={styles.sectionTitle}>No sales call required</h2>
            <p className={styles.sectionLede}>
              Every limit is listed. Cancel from the billing portal whenever you like.
            </p>
          </div>

          <div className={styles.pricingGrid}>
            <div className={styles.priceCard}>
              <div className={styles.priceName}>Free</div>
              <div className={styles.priceAmount}>
                $0<span className={styles.priceCadence}>forever</span>
              </div>
              <p className={styles.priceFor}>Side projects and evaluation</p>
              <ul className={styles.priceList}>
                <li>2 projects</li>
                <li>25 secrets</li>
                <li>2 runtime keys</li>
                <li>Full encryption and audit log</li>
              </ul>
              <Link href="/register" className={styles.priceCta}>
                Start free, upgrade later
              </Link>
            </div>

            <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
              <div className={styles.priceBadge}>Most teams</div>
              <div className={styles.priceName}>Pro</div>
              <div className={styles.priceAmount}>
                $29<span className={styles.priceCadence}>USD / month</span>
              </div>
              <p className={styles.priceFor}>Shipping to production</p>
              <ul className={styles.priceList}>
                <li>20 projects</li>
                <li>1,000 secrets per project</li>
                <li>50 runtime keys</li>
                <li>90-day audit retention</li>
                <li>Email support</li>
              </ul>
              <TrackedLink
                href="/register"
                event="cta_clicked"
                properties={{ location: "pricing_pro" }}
                className={styles.priceCtaGold}
              >
                Start free, upgrade later
              </TrackedLink>
            </div>

            <div className={styles.priceCard}>
              <div className={styles.priceName}>Business</div>
              <div className={styles.priceAmount}>
                $199<span className={styles.priceCadence}>USD / month</span>
              </div>
              <p className={styles.priceFor}>Teams with compliance requirements</p>
              <ul className={styles.priceList}>
                <li>100 projects</li>
                <li>10,000 secrets per project</li>
                <li>200 runtime keys</li>
                <li>1-year audit retention</li>
                <li>Priority support</li>
              </ul>
              <Link href="/register" className={styles.priceCta}>
                Start free, upgrade later
              </Link>
            </div>
          </div>

          <p className={styles.pricingNote}>
            All prices in USD. Need SSO, customer-managed keys, or a contractual SLA?{" "}
            <a href="mailto:sales@vsecrets.dev" className={styles.inlineLink}>
              Talk to us
            </a>
            .
          </p>
        </div>
      </section>

      {/* ================= Final CTA ================= */}
      <section className={styles.finalCta}>
        <div className={styles.sectionInner}>
          <h2 className={styles.finalTitle}>
            Your credentials deserve better than a .env file
          </h2>
          <p className={styles.finalLede}>
            Free tier, no card, no sales call. If it isn't running in five minutes, it isn't
            doing its job.
          </p>
          <TrackedLink
            href="/register"
            event="cta_clicked"
            properties={{ location: "footer" }}
            className={styles.primaryCta}
          >
            Create your workspace
          </TrackedLink>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.brandMarkName}>V-Secrets</span>
            <span className={styles.footerTag}>Developer secrets manager</span>
          </div>

          <div className={styles.footerLinks}>
            <a href="#how" className={styles.footerLink}>How it works</a>
            <a href="#security" className={styles.footerLink}>Security</a>
            <a href="#pricing" className={styles.footerLink}>Pricing</a>
            <Link href="/docs" className={styles.footerLink}>Docs</Link>
            <Link href="/login" className={styles.footerLink}>Sign in</Link>
            <a href="mailto:support@vsecrets.dev" className={styles.footerLink}>Contact</a>
          </div>

          <div className={styles.footerMeta}>
            v1.0 · built by{" "}
            <a href="https://evilink.dev" target="_blank" rel="noopener" className={styles.inlineLink}>
              evi_link devs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
