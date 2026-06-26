import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

const CATEGORIES = ['All', 'Coursera', 'Cisco NetAcad', 'Internship', 'Workshop', 'Other'];

const categoryColors = {
  'Coursera':      { bg: 'bg-blue-500/10',    text: 'text-blue-400',    textLight: 'text-blue-600',    border: 'border-blue-500/20'    },
  'Cisco NetAcad': { bg: 'bg-cyan-500/10',     text: 'text-cyan-400',    textLight: 'text-cyan-600',    border: 'border-cyan-500/20'    },
  'Internship':    { bg: 'bg-emerald-500/10',  text: 'text-emerald-400', textLight: 'text-emerald-600', border: 'border-emerald-500/20' },
  'Workshop':      { bg: 'bg-orange-500/10',   text: 'text-orange-400',  textLight: 'text-orange-600',  border: 'border-orange-500/20'  },
  'Other':         { bg: 'bg-violet-500/10',   text: 'text-violet-400',  textLight: 'text-violet-600',  border: 'border-violet-500/20'  },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

const Certifications = () => {
  const [certs, setCerts]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeCategory, setActive] = useState('All');
  const [search, setSearch]         = useState('');
  const [preview, setPreview]       = useState(null); // image preview modal
  const { isDark } = useTheme();

  useEffect(() => {
    API.get('/certifications')
      .then(({ data }) => { setCerts(data.data); setFiltered(data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter whenever search or category changes
  useEffect(() => {
    let result = [...certs];
    if (activeCategory !== 'All') result = result.filter(c => c.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.organization.toLowerCase().includes(q) ||
        (c.skills || []).some(s => s.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [search, activeCategory, certs]);

  const featured = certs.filter(c => c.featured);

  return (
    <main className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="section-title">Certifications</h1>
              <p className="section-subtitle">
                Courses, internships, and workshops I've completed.
              </p>
            </div>
            <Link to="/education"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                isDark
                  ? 'border-violet-500/30 text-violet-300 hover:bg-violet-500/10'
                  : 'border-violet-300 text-violet-700 hover:bg-violet-50'
              }`}>
              ← Back to Education
            </Link>
          </div>
        </div>

        {/* ── Featured strip ── */}
        {featured.length > 0 && (
          <div className="mb-10">
            <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              ⭐ Featured
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map(cert => (
                <CertCard key={cert._id} cert={cert} isDark={isDark} onPreview={setPreview} featured />
              ))}
            </div>
          </div>
        )}

        {/* ── Search + Filter ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, org, or skill..."
            className="input-field sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActive(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  activeCategory === cat
                    ? isDark
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                      : 'bg-violet-100 border-violet-300 text-violet-700'
                    : isDark
                      ? 'border-violet-500/15 text-gray-400 hover:border-violet-500/30 hover:text-violet-300'
                      : 'border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : filtered.length === 0 ? (
          <div className={`text-center py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <p className="text-4xl mb-4">🏅</p>
            <p>No certifications found{search ? ' for your search' : ''}.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(cert => (
              <CertCard key={cert._id} cert={cert} isDark={isDark} onPreview={setPreview} />
            ))}
          </div>
        )}

        {/* ── Image Preview Modal ── */}
        {preview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setPreview(null)}>
            <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPreview(null)}
                className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-medium">
                ✕ Close
              </button>
              <img src={preview} alt="Certificate" className="w-full rounded-2xl shadow-2xl" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

// ── Cert Card Component ──────────────────────────────────────────────────────
const CertCard = ({ cert, isDark, onPreview, featured = false }) => {
  const c = categoryColors[cert.category] || categoryColors['Other'];

  return (
    <div className={`card flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 ${
      featured
        ? isDark
          ? 'border-violet-500/30 bg-[#16162e]'
          : 'border-violet-300'
        : ''
    }`}>

      {/* Image */}
      {cert.certificateImage && (
        <div
          className="w-full h-36 rounded-xl overflow-hidden cursor-pointer bg-gray-100 dark:bg-[#0a0a1a] flex-shrink-0"
          onClick={() => onPreview(cert.certificateImage)}>
          <img src={cert.certificateImage} alt={cert.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={e => e.target.parentElement.style.display = 'none'} />
        </div>
      )}

      {/* Category badge */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${c.bg} ${c.border} ${isDark ? c.text : c.textLight}`}>
          {cert.category}
        </span>
        {featured && <span className="text-[10px] font-bold text-amber-400">⭐ Featured</span>}
      </div>

      {/* Title + Org */}
      <div>
        <h3 className={`font-bold text-sm leading-snug mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {cert.title}
        </h3>
        <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          🏢 {cert.organization}
        </p>
      </div>

      {/* Date */}
      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        📅 {formatDate(cert.issueDate)}
        {cert.expiryDate && ` → ${formatDate(cert.expiryDate)}`}
      </p>

      {/* Description */}
      {cert.description && (
        <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {cert.description}
        </p>
      )}

      {/* Skills */}
      {cert.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {cert.skills.slice(0, 4).map(s => (
            <span key={s} className="tag text-[10px] py-0.5 px-2">{s}</span>
          ))}
          {cert.skills.length > 4 && (
            <span className="tag text-[10px] py-0.5 px-2">+{cert.skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Credential ID */}
      {cert.credentialId && (
        <p className={`text-[10px] font-mono truncate ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          ID: {cert.credentialId}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-violet-500/10">
        {cert.credentialUrl && (
          <a href={cert.credentialUrl} target="_blank" rel="noreferrer"
            className="btn-primary text-xs py-1.5 px-3 flex-1 text-center">
            View Credential ↗
          </a>
        )}
        {cert.certificateImage && (
          <button onClick={() => onPreview(cert.certificateImage)}
            className={`text-xs py-1.5 px-3 rounded-xl border font-semibold transition-all duration-200 ${
              isDark
                ? 'border-violet-500/20 text-gray-400 hover:text-violet-300 hover:border-violet-500/40'
                : 'border-violet-200 text-gray-500 hover:text-violet-600 hover:border-violet-400'
            } ${cert.credentialUrl ? '' : 'flex-1'}`}>
            Preview 🖼
          </button>
        )}
      </div>
    </div>
  );
};

export default Certifications;
