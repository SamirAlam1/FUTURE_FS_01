import { useState, useEffect } from 'react';
import API from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

const ProjectCard = ({ project, isDark }) => (
  <div className="card group hover:-translate-y-1 transition-all duration-300">
    {project.imageUrl && (
      <div className={`w-full h-44 rounded-xl overflow-hidden mb-5 ${isDark ? 'bg-[#0a0a1a]' : 'bg-gray-100'}`}>
        <img src={project.imageUrl} alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.style.display = 'none'; }} />
      </div>
    )}

    <div className="flex items-start justify-between gap-3 mb-3">
      <h3 className={`text-lg font-bold group-hover:gradient-text transition-all ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {project.title}
      </h3>
      {project.featured && <span className="badge flex-shrink-0">⭐ Featured</span>}
    </div>

    <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
      {project.description}
    </p>

    <div className="flex flex-wrap gap-2 mb-5">
      {project.techStack.map((tech) => <span key={tech} className="tag">{tech}</span>)}
    </div>

    <div className={`flex gap-3 pt-4 border-t ${isDark ? 'border-violet-500/10' : 'border-gray-100'}`}>
      {project.liveUrl && (
        <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn-primary text-sm py-2 px-4">
          🚀 Live Demo
        </a>
      )}
      {project.githubUrl && (
        <a href={project.githubUrl} target="_blank" rel="noreferrer" className="btn-secondary text-sm py-2 px-4">
          🐙 GitHub
        </a>
      )}
    </div>
  </div>
);

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    API.get('/projects').then(({ data }) => setProjects(data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const featured = projects.filter((p) => p.featured);
  const others   = projects.filter((p) => !p.featured);

  return (
    <main className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="section-title">Projects</h1>
          <p className="section-subtitle">I have Developed full-stack web application using MongoDB, Express, React, and Node.js with responsive UI, REST APIs, and secure authentication.</p>
          {/* <p className="section-subtitle">Things I've built</p> */}
        </div>

        {loading ? <LoadingSpinner size="lg" className="py-20" /> :
         projects.length === 0 ? (
          <div className={`text-center py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No projects yet.</div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="mb-12">
                <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  ⭐ Featured Projects
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {featured.map((p) => <ProjectCard key={p._id} project={p} isDark={isDark} />)}
                </div>
              </div>
            )}
            {others.length > 0 && (
              <div>
                {featured.length > 0 && (
                  <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Other Projects
                  </p>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {others.map((p) => <ProjectCard key={p._id} project={p} isDark={isDark} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Projects;
