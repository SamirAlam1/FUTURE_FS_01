import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { DEVELOPER } from "../data/portfolio";

const NAV_LINKS = [
  { label: "Home", id: "hero" },
  { label: "About", id: "about" },
  // { label: "Experience", id: "experience" },
  { label: "Education", id: "education" },
  { label: "Skills", id: "skills" },
  // { label: "Certifications", id: "certifications" },
  { label: "Projects", id: "projects" },
  { label: "Contact", id: "contact" },
];
const NAV_IDS = NAV_LINKS.map((l) => l.id);
const INITIALS = DEVELOPER.name
  .split(" ")
  .map((w) => w[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="8" x2="21" y2="8" />
          <line x1="3" y1="16" x2="21" y2="16" />
        </>
      )}
    </svg>
  );
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const activeId = useScrollSpy(NAV_IDS);
  const navRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Sliding pill
  useEffect(() => {
    if (!isHome) {
      setPillStyle((s) => ({ ...s, opacity: 0 }));
      return;
    }
    const idx = NAV_IDS.indexOf(activeId);
    const el = linkRefs.current[idx];
    if (!el || !navRef.current) {
      setPillStyle((s) => ({ ...s, opacity: 0 }));
      return;
    }
    const navRect = navRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setPillStyle({
      left: elRect.left - navRect.left,
      width: elRect.width,
      opacity: 1,
    });
  }, [activeId, isHome]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    if (!isHome) return;
    e.preventDefault();
    scrollTo(id);
  };

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        // style={{
        //   backgroundColor: scrolled ? 'var(--surface-overlay)' : 'transparent',
        //   backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
        //   WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
        //   borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        //   boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
        // }}
        style={{
          // backgroundColor: "var(--surface-overlay)",
          backgroundColor:
            "color-mix(in srgb, var(--surface-overlay) 88%, transparent)",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          borderBottom: "1px solid var(--border)",
          borderTop: "none",
          boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 h-[60px] flex items-center gap-3">
          {/* Logo — shrink-0 so it never gets squeezed */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 group"
            aria-label="Home"
          >
            <div
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold tracking-wide select-none shrink-0"
              style={{
                backgroundColor: "var(--text-primary)",
                color: "var(--bg)",
                transition:
                  "transform 200ms var(--ease-spring), box-shadow 200ms var(--ease-out)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {INITIALS}
            </div>
            <span
              className="text-[14px] font-semibold tracking-tight hidden sm:block"
              style={{ color: "var(--text-primary)" }}
            >
              {DEVELOPER.name}
            </span>
          </Link>

          {/*
            Desktop nav: flex-1 with min-w-0 allows it to shrink.
            overflow-x-auto prevents container overflow at 768-900px.
            At very tight widths (md), some links will scroll horizontally within nav.
            At lg+ there is enough space for all 8 links.
          */}
          <nav
            ref={navRef}
            className="hidden md:flex items-center justify-center relative flex-1 min-w-0 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            aria-label="Main navigation"
          >
            <div
              className="nav-pill-indicator pointer-events-none"
              style={{
                left: pillStyle.left,
                width: pillStyle.width,
                opacity: pillStyle.opacity,
              }}
            />
            {NAV_LINKS.map((link, idx) => {
              const isActive = isHome && activeId === link.id;
              return (
                <a
                  key={link.id}
                  ref={(el) => {
                    linkRefs.current[idx] = el;
                  }}
                  href={`#${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className="relative px-2.5 lg:px-3 py-2 text-[12px] lg:text-[13px] font-medium whitespace-nowrap shrink-0"
                  style={{
                    color: isActive
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                    transition: "color 200ms var(--ease-out)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.color = "var(--text-muted)";
                  }}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right controls — shrink-0 so they never get squeezed */}
          <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
            <button
              onClick={toggleTheme}
              className="icon-btn"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "contact")}
              className="btn-primary btn-beam hidden lg:inline-flex"
              style={{ padding: "8px 18px", fontSize: "13px" }}
            >
              Let's talk
            </a>
            <button
              className="icon-btn md:hidden border-0"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className="fixed inset-0 z-40 md:hidden"
        style={{
          backgroundColor: "var(--bg)",
          opacity: mobileOpen ? 1 : 0,
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition:
            "opacity 250ms var(--ease-out), transform 300ms var(--ease-out)",
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
        aria-hidden={!mobileOpen}
      >
        <div className="pt-[72px] px-6 pb-8 flex flex-col h-full overflow-y-auto">
          <nav aria-label="Mobile navigation">
            {NAV_LINKS.map((link, i) => {
              const isActive = activeId === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className="flex items-center justify-between py-4 border-b"
                  style={{
                    color: isActive ? "var(--accent)" : "var(--text-primary)",
                    borderColor: "var(--border-subtle)",
                    fontSize: "16px",
                    fontWeight: isActive ? "600" : "400",
                    transition: "color 150ms var(--ease-out)",
                    transitionDelay: mobileOpen ? `${i * 25}ms` : "0ms",
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                  )}
                </a>
              );
            })}
          </nav>
          <div className="pt-8">
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "contact")}
              className="btn-primary w-full justify-center"
            >
              Let's talk
            </a>
          </div>
        </div>
      </div>

      {/* Hide scrollbar inside nav */}
      <style>{`.hidden.md\\:flex nav::-webkit-scrollbar { display: none; }`}</style>
    </>
  );
}
