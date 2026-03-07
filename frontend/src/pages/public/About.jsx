import { useTheme } from "../../context/ThemeContext";

const About = () => {
  const { isDark } = useTheme();

  const infoItems = [
    { label: "Location", value: "Ankleshwar, Gujarat, India", icon: "📍" },
    { label: "Education", value: "IT Undergraduate", icon: "🎓" },
    { label: "Experience", value: "1+ Years Learning", icon: "💼" },
    { label: "Availability", value: "Open to Work", icon: "✅" },
  ];

  return (
    <main className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ───── Heading ───── */}
        <div className="text-center mb-16">
          <h1
            className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            About Me
          </h1>
          <p
            className={`max-w-2xl mx-auto ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Full Stack WEB Developer (MERN) passionate about building scalable,
            user-friendly and high-performance web applications.
          </p>
        </div>

        {/* ───── Two Column Layout ───── */}
        <div className="flex flex-col md:flex-row items-center gap-12">

          {/* ─── Circular Profile Image ─── */}
          <div className="flex justify-center md:w-1/2">
            <div className="relative">
              
              {/* Gradient Ring (Professional Look) */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 blur-sm opacity-40"></div>

              {/* Image Container */}
              <div className="relative w-60 h-60 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img
                  src="/avatar.jpg"
                  alt="Samir Alam"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML =
                      '<div class="w-full h-full flex items-center justify-center text-7xl">👨‍💻</div>';
                  }}
                />
              </div>

            </div>
          </div>

          {/* ─── Bio Content ─── */}
          <div className="md:w-1/2 space-y-6 text-center md:text-left">
            <h2
              className={`text-2xl font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Hi, I'm <span className="text-violet-500">Samir Alam</span>
            </h2>

            <p
              className={`leading-relaxed ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              I am a Full Stack WEB Developer (MERN) and IT undergraduate who enjoys
              transforming ideas into scalable, high-performance web applications.
              I focus on writing clean, maintainable code and delivering meaningful
              digital experiences.
            </p>

            <p
              className={`leading-relaxed ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              My expertise includes React, Node.js, Express, MongoDB, and
              Tailwind CSS. I continuously explore new technologies and improve
              my problem-solving skills through real-world projects.
            </p>
          </div>
        </div>

        {/* ───── Info Grid ───── */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {infoItems.map(({ label, value, icon }) => (
            <div
              key={label}
              className={`rounded-xl p-6 text-center border transition ${
                isDark
                  ? "bg-[#16162e]/60 border-violet-500/20"
                  : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <p className="text-2xl mb-2">{icon}</p>
              <p
                className={`text-xs uppercase tracking-wide mb-1 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {label}
              </p>
              <p
                className={`font-semibold ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
};

export default About;
