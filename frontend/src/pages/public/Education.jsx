import { useState, useEffect } from 'react';
import API from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

const Education = () => {
  const [educations, setEducations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    API.get('/education').then(({ data }) => setEducations(data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="section-title">Education</h1>
          <p className="section-subtitle">A summary of my education, certifications, and consistent efforts toward learning and professional development.</p>
        </div>

        {loading ? <LoadingSpinner size="lg" className="py-20" /> :
         educations.length === 0 ? (
          <div className={`text-center py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No education entries yet.</div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-4 bottom-4 w-0.5 hidden md:block"
              style={{ background: 'linear-gradient(to bottom, #7c3aed, #06b6d4)' }} />

            <div className="space-y-8">
              {educations.map((edu, i) => (
                <div key={edu._id} className="relative flex gap-8 animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
                  {/* Timeline dot */}
                  <div className="hidden md:flex w-16 flex-shrink-0 items-start justify-center pt-7">
                    <div className="w-5 h-5 rounded-full z-10 border-4 border-[#0a0a1a] flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 0 12px rgba(124,58,237,0.5)' }} />
                  </div>

                  <div className="card flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{edu.degree}</h3>
                        <p className="gradient-text font-semibold">{edu.fieldOfStudy}</p>
                      </div>
                      <span className="badge">{edu.startYear} — {edu.endYear || 'Present'}</span>
                    </div>

                    <p className={`font-medium flex items-center gap-2 mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      🏛️ {edu.institution}
                    </p>
                    {edu.board && (
                      <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>📋 {edu.board}</p>
                    )}
                    {edu.grade && (
                      <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>📊 {edu.grade}</p>
                    )}
                    {edu.description && (
                      <p className={`text-sm leading-relaxed pt-3 mt-3 border-t ${
                        isDark ? 'text-gray-400 border-violet-500/10' : 'text-gray-500 border-violet-100'
                      }`}>
                        {edu.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Education;
