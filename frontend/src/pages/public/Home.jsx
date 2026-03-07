import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const Home = () => {
  const { isDark } = useTheme();

  return (
    <main className="min-h-screen">
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
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto animate-fade-in">
          {/* Available badge */}
          <div
            className={`mb-8 inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border ${
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
            className={`text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Hi, I'm <span className="gradient-text">Samir Alam</span>
          </h1>

          {/* Typewriter subtitle */}
          <p
            className={`text-xl md:text-2xl font-semibold mb-5 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Full Stack <span className="gradient-text">WEB Developer (MERN)</span>
          </p>

          <p
            className={`max-w-2xl mx-auto mb-10 text-lg leading-relaxed ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            I build fast, scalable & beautiful web applications with React and
            Node.js. Passionate about clean code, great UX, and continuous
            learning.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/projects"
              className="btn-primary text-center text-base px-8 py-3"
            >
              View My Projects →
            </Link>
            <Link
              to="/contact"
              className="btn-outline text-center text-base px-8 py-3"
            >
              Get In Touch
            </Link>
          </div>

          {/* Stats */}
          <div
            className={`inline-flex gap-0 rounded-2xl border overflow-hidden ${
              isDark
                ? "border-violet-500/20 bg-[#16162e]/60"
                : "border-violet-200 bg-white"
            }`}
          >
            {[
              { value: "3+", label: "Years Exp." },
              { value: "20+", label: "Projects" },
              { value: "10+", label: "Technologies" },
            ].map(({ value, label }, i, arr) => (
              <div
                key={label}
                className={`px-8 py-5 text-center ${
                  i < arr.length - 1
                    ? isDark
                      ? "border-r border-violet-500/20"
                      : "border-r border-violet-100"
                    : ""
                }`}
              >
                <div className="text-2xl font-black gradient-text">{value}</div>
                <div
                  className={`text-xs mt-1 font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
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
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <p
          className={`text-center text-xs font-bold uppercase tracking-[0.2em] mb-8 ${
            isDark ? "text-gray-600" : "text-gray-400"
          }`}
        >
          Tech I work with
        </p>
        <div className="flex flex-wrap justify-center gap-3">
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
            <span key={tech} className="tag text-sm py-2 px-4">
              {tech}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
