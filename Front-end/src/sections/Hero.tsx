import { useEffect, useRef, useState } from "react";
import { DEVELOPER } from "../data/portfolio";

const WORDS = [
  "softwares",
  "digital products",
  "web experiences",
  "platforms",
  "systems",
];

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "erasing">("typing");
  const [mounted, setMounted] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // Mount reveal — use CSS class toggle instead of inline opacity
  // This survives DevTools resize without re-running the timer
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Typewriter
  useEffect(() => {
    const word = WORDS[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (displayed.length < word.length) {
        timeout = setTimeout(
          () => setDisplayed(word.slice(0, displayed.length + 1)),
          60,
        );
      } else {
        timeout = setTimeout(() => setPhase("pause"), 1800);
      }
    } else if (phase === "pause") {
      timeout = setTimeout(() => setPhase("erasing"), 400);
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
      } else {
        setWordIdx((i) => (i + 1) % WORDS.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, phase, wordIdx]);

  // Staggered reveal via CSS classes — independent of viewport resize
  const revealClass = (delay: number) =>
    `hero-reveal${mounted ? " hero-reveal-visible" : ""}` +
    (delay > 0 ? ` hero-reveal-d${delay}` : "");

  return (
    <section
      id="hero"
      className="hero-grid relative min-h-[100svh] flex flex-col justify-center pt-[60px]"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 w-full py-16 md:py-24">
        {/*
          RESPONSIVE GRID:
          - Mobile (<lg / <1024px): single column, image hidden
          - Tablet (768–1023px): single column, image hidden
          - Desktop (≥1024px): two columns [1fr 320px] with gap-12
          - Large (≥1280px): two columns [1fr 360px] with gap-20
          The right column width is capped so it never crowds the left.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-12 xl:gap-20 items-center">
          {/* Mobile / tablet photo — visible only below lg (1024px) */}
          <div className="lg:hidden flex justify-center">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                width: "min(280px, 80vw)",
                aspectRatio: "3/4",
                backgroundColor: "var(--surface-elevated)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <img
                src="/P_Image.jpg"
                alt={`${DEVELOPER.name} — Full-Stack Developer`}
                className="w-full h-full object-cover"
                style={{
                  filter: "grayscale(65%) contrast(1.08)",
                  display: "block",
                }}
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>

          {/* Left: text content */}
          <div className="flex flex-col gap-6 min-w-0">
            {/* Availability badge */}
            <div className={revealClass(0)}>
              <div
                className="inline-flex items-center gap-2.5 text-[13px] font-medium px-4 py-2 rounded-full border self-start"
                style={{
                  color: "var(--text-secondary)",
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                  boxShadow: "var(--shadow-xs)",
                }}
              >
                <span className="ping-dot">
                  <span
                    className="relative block w-2 h-2 rounded-full"
                    style={{ backgroundColor: "var(--success)" }}
                  />
                </span>
                Available for new opportunities
              </div>
            </div>

            {/* Headline */}
            <div className={revealClass(1)}>
              <h1
                className="text-display"
                style={{ color: "var(--text-primary)" }}
              >
                Building Scalable
                <br />
                <span style={{ color: "var(--accent)" }}>
                  {displayed}
                  <span className="typing-cursor" />
                </span>
                <span> end to end.</span>
              </h1>
            </div>

            {/* Sub */}
            <p
              className={`text-body-lg ${revealClass(2)}`}
              style={{ color: "var(--text-secondary)", maxWidth: "500px" }}
            >
              I'm {DEVELOPER.firstName} — a full-stack developer who builds
              fast, reliable web applications with the MERN stack. From clean
              interfaces to the systems behind them.
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-wrap items-center gap-3 ${revealClass(3)}`}
            >
              <a
                href="/Samir-Alam-Resume.pdf"
                download="Samir-Alam-Resume.pdf"
                className="btn-primary btn-beam"
              >
                <DownloadIcon />
                Download Resume
              </a>
              <button
                onClick={() => scrollTo("contact")}
                className="btn-outline"
              >
                Get in touch
                <ArrowRightIcon />
              </button>
            </div>

            {/* Socials */}
            <div
              className={`flex items-center gap-4 flex-wrap ${revealClass(4)}`}
            >
              {DEVELOPER.socials.github && (
                <a
                  href={DEVELOPER.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="icon-btn"
                >
                  <GithubIcon />
                </a>
              )}
              {DEVELOPER.socials.linkedin && (
                <a
                  href={DEVELOPER.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="icon-btn"
                >
                  <LinkedInIcon />
                </a>
              )}
              <div
                className="w-px h-4"
                style={{ backgroundColor: "var(--border)" }}
              />
              <div
                className="flex items-center gap-1.5 text-[13px]"
                style={{ color: "var(--text-muted)" }}
              >
                <MapPinIcon />
                {DEVELOPER.location}
              </div>
            </div>

            {/* Stack row */}
            <div
              className={`flex items-center gap-3 flex-wrap pt-2 ${revealClass(5)}`}
            >
              <span
                className="text-caption"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                primary stack
              </span>
              {["MongoDB", "Express", "React", "Node.js"].map((t) => (
                <span
                  key={t}
                  className="tech-badge"
                  style={{ fontSize: "12px" }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/*
            Right: photo card — RESPONSIVE FIX
            - hidden on mobile/tablet (< 1024px)
            - At exactly lg (1024px): col width = 320px, enough for the image + small badges
            - Badges use overflow-visible on the wrapper so -left/-right/-top do not clip
            - Image container uses explicit aspect-ratio so it never collapses
            - NO inline opacity/transform — uses CSS class toggle to survive resize
          */}
          <div ref={imgRef} className={`hidden lg:block ${revealClass(1)}`}>
            {/* overflow-visible so floating badges (-left-6, -right-4, -top-3) are not clipped */}
            <div className="relative" style={{ overflow: "visible" }}>
              {/* Photo — explicit min-h prevents collapse */}
              <div
                className="w-full rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: "3/4",
                  minHeight: "280px",
                  backgroundColor: "var(--surface-elevated)",
                  boxShadow: "var(--shadow-lg)",
                  position: "relative",
                }}
              >
                <img
                  // src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=760&h=1013&fit=crop&auto=format"
                  src="/P_Image.jpg"
                  alt={`${DEVELOPER.name} — Full-Stack Developer`}
                  width={760}
                  height={1013}
                  className="w-full h-full object-cover"
                  style={{
                    filter: "grayscale(65%) contrast(1.08)",
                    display: "block",
                    transition: "transform 600ms var(--ease-out)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              {/* Floating status card — bottom-left */}
              <div
                className="absolute flex flex-col gap-0.5"
                style={{
                  bottom: "-16px",
                  left: "-20px",
                  padding: "14px 18px",
                  borderRadius: "var(--radius-xl)",
                  backgroundColor: "var(--surface)",
                  boxShadow: "var(--shadow-lg)",
                  border: "1px solid var(--border)",
                  minWidth: "152px",
                  zIndex: 10,
                }}
              >
                <span
                  className="text-caption"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.06em",
                  }}
                >
                  status
                </span>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Open to roles
                </span>
              </div>

              {/* Floating stack badge — top-right */}
              <div
                className="absolute"
                style={{
                  top: "-12px",
                  right: "-14px",
                  padding: "8px 14px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--surface)",
                  boxShadow: "var(--shadow-md)",
                  border: "1px solid var(--border)",
                  zIndex: 10,
                }}
              >
                <span
                  className="text-[12px] font-semibold"
                  style={{
                    color: "var(--accent)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  MERN Stack
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{
          opacity: mounted ? 0.5 : 0,
          transition: "opacity 0.6s var(--ease-out) 800ms",
        }}
        aria-hidden="true"
      >
        <div
          className="w-px h-10 rounded-full scroll-hint"
          style={{
            background:
              "linear-gradient(to bottom, var(--text-muted), transparent)",
            animation: "scrollPulse 2s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        /* CSS-class-based staggered reveal — survives viewport resize without re-triggering timer */
        .hero-reveal {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out);
        }
        .hero-reveal.hero-reveal-visible { opacity: 1; transform: none; }
        .hero-reveal-d1 { transition-delay: 100ms; }
        .hero-reveal-d2 { transition-delay: 180ms; }
        .hero-reveal-d3 { transition-delay: 240ms; }
        .hero-reveal-d4 { transition-delay: 300ms; }
        .hero-reveal-d5 { transition-delay: 360ms; }

        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50% { opacity: 0.8; transform: scaleY(1.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-reveal { transition: none; }
          .hero-reveal.hero-reveal-visible { opacity: 1; transform: none; }
          .scroll-hint { animation: none !important; opacity: 0.4 !important; }
        }
      `}</style>
    </section>
  );
}
