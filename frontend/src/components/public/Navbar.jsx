import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '../shared/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

const navLinks = [
  { to: '/',          label: 'Home',      icon: '🏠' },
  { to: '/about',     label: 'About',     icon: '👤' },
  { to: '/education', label: 'Education', icon: '🎓' },
  { to: '/skills',    label: 'Skills',    icon: '🛠️' },
  { to: '/projects',  label: 'Projects',  icon: '💼' },
  { to: '/blog',      label: 'Blog',      icon: '📝' },
  { to: '/gallery',   label: 'Gallery',   icon: '🖼️' },
  { to: '/contact',   label: 'Contact',   icon: '✉️' },
];

const Navbar = () => {
  const [isOpen,   setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isDark } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* ── Top Navbar ───────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-[#0a0a1a]/95 backdrop-blur-xl border-b border-violet-500/10 shadow-lg'
            : 'bg-white/95 backdrop-blur-xl border-b border-violet-200 shadow-md'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* ── PORTFOLIO Brand Logo ── */}
            <Link to="/" className="select-none">
              <span
                className="text-base md:text-lg font-black tracking-widest uppercase"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, #a78bfa, #38bdf8, #34d399)"
                    : "linear-gradient(135deg, #7c3aed, #0ea5e9, #10b981)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: isDark
                    ? "drop-shadow(0 0 10px rgba(167,139,250,0.4))"
                    : "drop-shadow(0 1px 3px rgba(124,58,237,0.25))",
                  letterSpacing: "0.18em",
                }}
              >
                ✦ PORTFOLIO
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === to
                      ? 'gradient-text bg-violet-500/10'
                      : isDark
                        ? 'text-gray-400 hover:text-violet-300 hover:bg-violet-500/10'
                        : 'text-gray-600 hover:text-violet-700 hover:bg-violet-50'
                  }`}>
                  {label}
                </Link>
              ))}
              <ThemeToggle className="ml-3" />
            </div>

            {/* Mobile: Theme + Hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button onClick={() => setIsOpen(true)} aria-label="Open menu"
                className={`p-2 rounded-xl transition-colors ${
                  isDark ? 'text-gray-400 hover:text-violet-300 hover:bg-violet-500/10' : 'text-gray-600 hover:text-violet-700 hover:bg-violet-50'
                }`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Backdrop ──────────────────────── */}
      <div onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
      />

      {/* ── Left Drawer ──────────────────────────── */}
      <div className={`fixed top-0 left-0 z-50 h-full w-72 md:hidden transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
        style={{
          background: isDark ? 'linear-gradient(160deg, #0f0f23 0%, #16162e 100%)' : 'linear-gradient(160deg, #ffffff 0%, #f5f3ff 100%)',
          boxShadow: isOpen ? '8px 0 40px rgba(124,58,237,0.2)' : 'none',
          borderRight: isDark ? '1px solid rgba(124,58,237,0.15)' : '1px solid rgba(124,58,237,0.2)',
        }}>

        {/* Drawer Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${
          isDark ? 'border-violet-500/10' : 'border-violet-100'
        }`}>
          <span
            className="font-black tracking-widest uppercase text-sm"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #a78bfa, #38bdf8, #34d399)"
                : "linear-gradient(135deg, #7c3aed, #0ea5e9, #10b981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.18em",
            }}
          >
            ✦ PORTFOLIO
          </span>
          <button onClick={() => setIsOpen(false)} aria-label="Close menu"
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'text-gray-400 hover:text-white hover:bg-violet-500/10' : 'text-gray-500 hover:text-gray-900 hover:bg-violet-50'
            }`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map(({ to, label, icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                location.pathname === to
                  ? isDark
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                    : 'bg-violet-100 text-violet-700 border border-violet-300'
                  : isDark
                    ? 'text-gray-400 hover:text-violet-300 hover:bg-violet-500/10'
                    : 'text-gray-600 hover:text-violet-700 hover:bg-violet-50'
              }`}>
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
              {location.pathname === to && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />}
            </Link>
          ))}
        </nav>

        {/* Drawer Footer */}
        <div className={`px-4 py-5 border-t space-y-1 ${isDark ? 'border-violet-500/10' : 'border-violet-100'}`}>
          <a href="https://github.com/sa0409716" target="_blank" rel="noreferrer"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-sm ${
              isDark ? 'text-gray-500 hover:text-violet-300 hover:bg-violet-500/10' : 'text-gray-400 hover:text-violet-700 hover:bg-violet-50'
            }`}>
            🐙 <span>GitHub</span>
          </a>
          <Link to="/admin/login"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-sm ${
              isDark ? 'text-gray-700 hover:text-gray-500 hover:bg-gray-800' : 'text-gray-300 hover:text-gray-400 hover:bg-gray-50'
            }`}>
            🔐 <span>Admin</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
