import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import API from '../../utils/api';

const LEETCODE_USERNAME = 'samir_alam';
const CV_URL = '/Resume.pdf';

const Gallery = () => {
  const { isDark } = useTheme();
  const [albums,      setAlbums]      = useState([]);
  const [images,      setImages]      = useState([]);
  const [activeAlbum, setActiveAlbum] = useState('all');
  const [loading,     setLoading]     = useState(true);
  const [lightbox,    setLightbox]    = useState(null);
  const [cvOpen,      setCvOpen]      = useState(false);

  useEffect(() => {
    Promise.all([
      API.get('/gallery/albums'),
      API.get('/gallery'),
    ]).then(([albumRes, imgRes]) => {
      setAlbums(albumRes.data.data);
      setImages(imgRes.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAlbumFilter = async (albumId) => {
    setActiveAlbum(albumId);
    try {
      const url = albumId === 'all' ? '/gallery' : `/gallery?album=${albumId}`;
      const { data } = await API.get(url);
      setImages(data.data);
    } catch {}
  };

  const displayImages = activeAlbum === 'uncategorized'
    ? images.filter(img => !img.album)
    : images;

  return (
    <main className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center animate-fade-in">
          <h1 className="section-title">Gallery</h1>
          <p className="section-subtitle">Profiles, CV & My Photos</p>
        </div>

        {/* ── Action Buttons ──────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">

          {/* LeetCode Button */}
          <a href={`https://leetcode.com/${LEETCODE_USERNAME}`} target="_blank" rel="noreferrer"
            className="group relative overflow-hidden flex items-center gap-4 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 8px 30px rgba(245,158,11,0.35)' }}>
            {/* Shimmer */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-yellow-300 animate-ping opacity-50" />
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/20">🧩</div>
            </div>
            <div>
              <div className="text-xs font-normal opacity-80 mb-0.5">Visit my profile</div>
              <div className="text-lg font-black">LeetCode</div>
              <div className="text-xs font-normal opacity-70">@{LEETCODE_USERNAME}</div>
            </div>
            <svg className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>

          {/* CV Button */}
          <button onClick={() => setCvOpen(true)}
            className="group relative overflow-hidden flex items-center gap-4 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 8px 30px rgba(124,58,237,0.35)' }}>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-violet-300 animate-ping opacity-50" />
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/20">📄</div>
            </div>
            <div>
              <div className="text-xs font-normal opacity-80 mb-0.5">View & Download</div>
              <div className="text-lg font-black">My CV / Resume</div>
              <div className="text-xs font-normal opacity-70">Full Stack MERN Developer</div>
            </div>
            <svg className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* ── CV Modal ─────────────────────────────── */}
        {cvOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}>
            <div className={`relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col ${
              isDark ? 'bg-[#0f0f23] border border-violet-500/20' : 'bg-white'
            }`} style={{ maxHeight: '92vh' }}>

              {/* Modal Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${
                isDark ? 'border-violet-500/10' : 'border-gray-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>📄</div>
                  <div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Samir Alam — Resume</h3>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Full Stack MERN Developer</p>
                  </div>
                </div>
                <button onClick={() => setCvOpen(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'text-gray-400 hover:text-white hover:bg-violet-500/10' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* PDF Iframe */}
              <div className="flex-1 overflow-hidden" style={{ minHeight: '60vh' }}>
                <iframe src={CV_URL} title="Resume" className="w-full h-full" style={{ border: 'none', minHeight: '60vh' }} />
              </div>

              {/* Modal Footer */}
              <div className={`px-6 py-4 border-t flex items-center justify-between flex-shrink-0 ${
                isDark ? 'border-violet-500/10' : 'border-gray-100'
              }`}>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  PDF is not visible? Download Here 👉
                </p>
                <a href={CV_URL} download="Samir_Alam_Resume.pdf"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CV
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── Photos Section ───────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(#7c3aed, #06b6d4)' }} />
            <h2 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              📸 Photo Gallery
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className={`aspect-square rounded-2xl animate-pulse ${isDark ? 'bg-violet-500/10' : 'bg-violet-100'}`} />
              ))}
            </div>
          ) : (
            <>
              {/* Album Filter Tabs */}
              {albums.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {[{ _id: 'all', name: 'All Photos' }, { _id: 'uncategorized', name: 'Uncategorized' }, ...albums].map(a => (
                    <button key={a._id} onClick={() => handleAlbumFilter(a._id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        activeAlbum === a._id
                          ? 'text-white'
                          : isDark ? 'text-gray-400 hover:text-violet-300 hover:bg-violet-500/10 border border-violet-500/10'
                                   : 'text-gray-500 hover:text-violet-700 hover:bg-violet-50 border border-violet-200'
                      }`}
                      style={activeAlbum === a._id ? { background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' } : {}}>
                      {a._id === 'all' ? '🖼️' : a._id === 'uncategorized' ? '📂' : '📁'} {a.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Images Grid */}
              {displayImages.length === 0 ? (
                <div className={`card text-center py-16 ${isDark ? 'border-violet-500/10' : 'border-violet-200'}`}>
                  <p className="text-5xl mb-4">📷</p>
                  <p className={`font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No Photos Yet</p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Admin Panel → Gallery → Add Image se photos add karo
                  </p>
                </div>
              ) : (
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                  {displayImages.map(img => (
                    <div key={img._id} onClick={() => setLightbox(img)}
                      className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-2xl">
                      <img
                        src={img.imageData || img.imageUrl}
                        alt={img.title}
                        className="w-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={e => { e.target.src = 'https://via.placeholder.com/400?text=Image'; }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-300 rounded-2xl flex items-end p-4">
                        <div className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <p className="text-white font-bold text-sm">{img.title}</p>
                          {img.caption && <p className="text-white/70 text-xs mt-0.5">{img.caption}</p>}
                          {img.album && <p className="text-white/50 text-xs mt-0.5">📁 {img.album.name}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(10px)' }}
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img src={lightbox.imageData || lightbox.imageUrl} alt={lightbox.title}
              className="w-full rounded-2xl shadow-2xl max-h-[80vh] object-contain" />
            <p className="text-white text-center mt-4 font-bold text-lg">{lightbox.title}</p>
            {lightbox.caption && <p className="text-white/60 text-center text-sm mt-1">{lightbox.caption}</p>}
            <button onClick={() => setLightbox(null)}
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white text-xl flex items-center justify-center transition-colors">
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Gallery;
