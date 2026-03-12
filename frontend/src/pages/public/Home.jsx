import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useEffect, useState } from "react";

const Home = () => {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownloadCV = () => {
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "Samir_Alam_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen">
      {/* ── Top Left Portfolio Brand ─────────────────── */}
      {/* <div className="fixed top-0 left-0 z-50 p-4 md:p-5">
        <span
          className="text-base md:text-xl font-black tracking-widest uppercase select-none"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #a78bfa, #38bdf8, #34d399)"
              : "linear-gradient(135deg, #7c3aed, #0ea5e9, #10b981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: isDark
              ? "drop-shadow(0 0 12px rgba(167,139,250,0.5))"
              : "drop-shadow(0 2px 4px rgba(124,58,237,0.3))",
            letterSpacing: "0.18em",
          }}
        >
          ✦ PORTFOLIO
        </span>
      </div> */}

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse-slow"
            style={{
              background:
                "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse-slow"
            style={{
              background:
                "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)",
              animationDelay: "1.5s",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* ── Main Content — pt-24 on mobile so PORTFOLIO brand never overlaps ── */}
        <div
          className="relative z-10 text-center max-w-4xl mx-auto w-full pt-24 sm:pt-28 md:pt-32 pb-16"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          {/* Available badge */}
          <div
            className={`mb-6 md:mb-8 inline-flex items-center gap-2 px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-semibold border ${
              isDark
                ? "bg-violet-500/10 border-violet-500/30 text-violet-300"
                : "bg-violet-50 border-violet-300 text-violet-700"
            }`}
          >
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Available for work
          </div>

          {/* Heading */}
          <h1
            className={`text-4xl sm:text-5xl md:text-7xl font-black mb-4 md:mb-6 leading-[1.1] tracking-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Hi, I'm{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Samir Alam
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-lg md:text-2xl font-semibold mb-4 md:mb-5 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Full Stack{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              WEB Developer (MERN)
            </span>
          </p>

          {/* Description */}
          <p
            className={`max-w-2xl mx-auto mb-8 md:mb-10 text-base md:text-lg leading-relaxed px-2 ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            I build fast, scalable & beautiful web applications with React and
            Node.js. Passionate about clean code, great UX, and continuous
            learning.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-4">
            <Link
              to="/projects"
              className="btn-primary text-center text-sm md:text-base px-6 md:px-8 py-3"
            >
              View My Projects →
            </Link>
            <Link
              to="/contact"
              className="btn-outline text-center text-sm md:text-base px-6 md:px-8 py-3"
            >
              Get In Touch
            </Link>
          </div>

          {/* ── Download CV Button ── */}
          <div className="flex justify-center mb-12 md:mb-16">
            <button
              onClick={handleDownloadCV}
              className={`group relative inline-flex items-center gap-3 px-6 md:px-8 py-3 rounded-full text-sm md:text-base font-bold overflow-hidden transition-all duration-300 ${
                isDark
                  ? "text-white border border-violet-500/40 hover:border-violet-400"
                  : "text-violet-700 border border-violet-300 hover:border-violet-500"
              }`}
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.10))"
                  : "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.06))",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(6,182,212,0.20))",
                }}
              />
              <span className="relative z-10 flex items-center gap-2 md:gap-3">
                <span
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-y-0.5 transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                    />
                  </svg>
                </span>
                <span>Download CV</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isDark
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  PDF
                </span>
              </span>
            </button>
          </div>

          {/* Stats */}
          <div
            className={`inline-flex gap-0 rounded-2xl border overflow-hidden ${
              isDark
                ? "border-violet-500/20 bg-[#16162e]/60"
                : "border-violet-200 bg-white shadow-sm"
            }`}
          >
            {[
              { value: "3+", label: "Years Exp." },
              { value: "20+", label: "Projects" },
              { value: "10+", label: "Technologies" },
            ].map(({ value, label }, i, arr) => (
              <div
                key={label}
                className={`px-5 md:px-8 py-4 md:py-5 text-center ${
                  i < arr.length - 1
                    ? isDark
                      ? "border-r border-violet-500/20"
                      : "border-r border-violet-100"
                    : ""
                }`}
              >
                <div
                  className="text-xl md:text-2xl font-black"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {value}
                </div>
                <div
                  className={`text-xs mt-1 font-medium ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div
            className={`w-6 h-10 rounded-full border-2 flex items-start justify-center p-1.5 ${
              isDark ? "border-violet-500/30" : "border-violet-300"
            }`}
          >
            <div
              className="w-1.5 h-2.5 rounded-full animate-pulse"
              style={{ background: "linear-gradient(#7c3aed, #06b6d4)" }}
            />
          </div>
        </div>
      </section>

      {/* ── Tech Stack ──────────────────────────── */}
      <section className="py-16 md:py-20 px-4 max-w-6xl mx-auto">
        <p
          className={`text-center text-xs font-bold uppercase tracking-[0.2em] mb-8 ${
            isDark ? "text-gray-600" : "text-gray-400"
          }`}
        >
          Tech I work with
        </p>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {[
            "React",
            "Node.js",
            "MongoDB",
            "Express",
            "TypeScript",
            "Tailwind CSS",
            "JWT",
            "REST APIs",
            "Git",
          ].map((tech) => (
            <span
              key={tech}
              className="tag text-xs md:text-sm py-2 px-3 md:px-4"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
