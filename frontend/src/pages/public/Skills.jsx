import { useState, useEffect } from 'react';
import API from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

const categoryColors = {
  Frontend: { dark: 'border-violet-500/30 bg-violet-500/5',  light: 'border-violet-200 bg-violet-50/50',  dot: '#7c3aed' },
  Backend:  { dark: 'border-cyan-500/30   bg-cyan-500/5',    light: 'border-cyan-200   bg-cyan-50/50',    dot: '#06b6d4' },
  Database: { dark: 'border-emerald-500/30 bg-emerald-500/5',light: 'border-emerald-200 bg-emerald-50/50',dot: '#10b981' },
  DevOps:   { dark: 'border-orange-500/30 bg-orange-500/5',  light: 'border-orange-200 bg-orange-50/50',  dot: '#f97316' },
  Tools:    { dark: 'border-pink-500/30   bg-pink-500/5',    light: 'border-pink-200   bg-pink-50/50',    dot: '#ec4899' },
  Other:    { dark: 'border-gray-500/30   bg-gray-500/5',    light: 'border-gray-200   bg-gray-50',       dot: '#6b7280' },
};

const SkillBar = ({ skill, isDark }) => (
  <div className="group">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">{skill.icon}</span>
        <span className={`font-semibold text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{skill.name}</span>
      </div>
      <span className="text-xs font-bold gradient-text">{skill.level}%</span>
    </div>
    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${skill.level}%`, background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }}
      />
    </div>
  </div>
);

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    API.get('/skills').then(({ data }) => setSkills(data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const grouped = skills.reduce((acc, s) => { (acc[s.category] = acc[s.category] || []).push(s); return acc; }, {});

  return (
    <main className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="section-title">Skills</h1>
          <p className="section-subtitle">A showcase of the technologies and tools that I use to build modern, scalable, and user-friendly web-applications.</p>
        </div>

        {loading ? <LoadingSpinner size="lg" className="py-20" /> :
         Object.keys(grouped).length === 0 ? (
          <div className={`text-center py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No skills added yet.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(grouped).map(([category, categorySkills], i) => {
              const colors = categoryColors[category] || categoryColors.Other;
              return (
                <div
                  key={category}
                  className={`card border animate-slide-up ${isDark ? colors.dark : colors.light}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.1)' }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: colors.dot }} />
                    <h2 className={`text-base font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{category}</h2>
                    <span className={`ml-auto text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {categorySkills.length} skills
                    </span>
                  </div>
                  <div className="space-y-5">
                    {categorySkills.map((skill) => <SkillBar key={skill._id} skill={skill} isDark={isDark} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Skills;
