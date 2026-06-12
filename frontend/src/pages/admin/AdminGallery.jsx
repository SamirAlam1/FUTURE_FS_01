// import { useState, useEffect, useRef } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import API from '../../utils/api';
// import LoadingSpinner from '../../components/shared/LoadingSpinner';
// import ConfirmDialog from '../../components/shared/ConfirmDialog';
// import Toast from '../../components/shared/Toast';
// import { useTheme } from '../../context/ThemeContext';

// // ═══════════════════════════════════════════════════
// // GALLERY LIST
// // ═══════════════════════════════════════════════════
// export const AdminGalleryList = () => {
//   const [albums,       setAlbums]       = useState([]);
//   const [images,       setImages]       = useState([]);
//   const [allImages,    setAllImages]    = useState([]);
//   const [activeAlbum,  setActiveAlbum]  = useState('all');
//   const [loading,      setLoading]      = useState(true);
//   const [confirmData,  setConfirmData]  = useState(null);
//   const [toast,        setToast]        = useState(null);
//   const [showAlbumForm,setShowAlbumForm]= useState(false);
//   const [albumForm,    setAlbumForm]    = useState({ name: '', description: '' });
//   const { isDark } = useTheme();
//   const navigate = useNavigate();

//   const fetchAll = () => {
//     setLoading(true);
//     Promise.all([
//       API.get('/gallery/albums'),
//       API.get('/gallery'),
//     ]).then(([a, i]) => {
//       setAlbums(a.data.data || []);
//       setImages(i.data.data || []);
//       setAllImages(i.data.data || []);
//     }).catch(() => {
//       setToast({ message: 'Failed to load gallery', type: 'error' });
//     }).finally(() => {
//       setLoading(false);
//     });
//   };

//   useEffect(() => {
//     fetchAll();
//   }, []); // eslint-disable-line

//   const handleAlbumClick = (albumId) => {
//     setActiveAlbum(albumId);
//     if (albumId === 'all') {
//       setImages(allImages);
//     } else if (albumId === 'uncategorized') {
//       setImages(allImages.filter(img => !img.album));
//     } else {
//       setImages(allImages.filter(img => img.album && (img.album._id === albumId || img.album === albumId)));
//     }
//   };

//   const handleCreateAlbum = (e) => {
//     e.preventDefault();
//     API.post('/gallery/albums', albumForm)
//       .then(() => {
//         setToast({ message: 'Album created!', type: 'success' });
//         setAlbumForm({ name: '', description: '' });
//         setShowAlbumForm(false);
//         fetchAll();
//       })
//       .catch(() => setToast({ message: 'Failed to create album', type: 'error' }));
//   };

//   const handleDelete = () => {
//     if (!confirmData) return;
//     const req = confirmData.type === 'image'
//       ? API.delete(`/gallery/${confirmData.id}`)
//       : API.delete(`/gallery/albums/${confirmData.id}`);
//     req.then(() => {
//       setToast({ message: confirmData.type === 'image' ? 'Image deleted!' : 'Album deleted!', type: 'success' });
//       if (confirmData.type === 'album') setActiveAlbum('all');
//       fetchAll();
//     }).catch(() => {
//       setToast({ message: 'Failed to delete', type: 'error' });
//     }).finally(() => {
//       setConfirmData(null);
//     });
//   };

//   const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`;

//   return (
//     <div className="animate-fade-in">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Gallery</h1>
//           <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//             {albums.length} albums • {allImages.length} images
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <button onClick={() => setShowAlbumForm(!showAlbumForm)} className="btn-secondary text-sm">
//             📁 New Album
//           </button>
//           <button onClick={() => navigate('/admin/gallery/new')} className="btn-primary text-sm">
//             + Add Image
//           </button>
//         </div>
//       </div>

//       {/* Album Form */}
//       {showAlbumForm && (
//         <form onSubmit={handleCreateAlbum} className="card mb-6 flex flex-col sm:flex-row gap-4">
//           <div className="flex-1">
//             <label className={labelClass}>Album Name *</label>
//             <input value={albumForm.name}
//               onChange={e => setAlbumForm({ ...albumForm, name: e.target.value })}
//               className="input-field" placeholder="e.g. Hackathon 2024" required autoFocus />
//           </div>
//           <div className="flex-1">
//             <label className={labelClass}>Description</label>
//             <input value={albumForm.description}
//               onChange={e => setAlbumForm({ ...albumForm, description: e.target.value })}
//               className="input-field" placeholder="Optional description" />
//           </div>
//           <div className="flex items-end gap-2">
//             <button type="submit" className="btn-primary text-sm py-2.5">💾 Save</button>
//             <button type="button" onClick={() => setShowAlbumForm(false)} className="btn-secondary text-sm py-2.5">Cancel</button>
//           </div>
//         </form>
//       )}

//       {loading ? (
//         <LoadingSpinner size="lg" className="py-20" />
//       ) : (
//         <div className="flex gap-6">

//           {/* Albums Sidebar */}
//           <div className="w-44 flex-shrink-0">
//             <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//               Albums
//             </p>
//             <div className="space-y-1">
//               {/* All */}
//               <button onClick={() => handleAlbumClick('all')}
//                 className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
//                   activeAlbum === 'all' ? 'text-white' : isDark ? 'text-gray-400 hover:bg-violet-500/10' : 'text-gray-600 hover:bg-violet-50'
//                 }`}
//                 style={activeAlbum === 'all' ? { background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' } : {}}>
//                 🖼️ All Images <span className={`text-xs ml-1 ${activeAlbum === 'all' ? 'text-white/70' : 'text-gray-400'}`}>({allImages.length})</span>
//               </button>

//               {/* Uncategorized */}
//               <button onClick={() => handleAlbumClick('uncategorized')}
//                 className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
//                   activeAlbum === 'uncategorized' ? 'text-white' : isDark ? 'text-gray-400 hover:bg-violet-500/10' : 'text-gray-600 hover:bg-violet-50'
//                 }`}
//                 style={activeAlbum === 'uncategorized' ? { background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' } : {}}>
//                 📂 Uncategorized
//               </button>

//               {/* Album List */}
//               {albums.map(album => (
//                 <div key={album._id} className="group relative">
//                   <button onClick={() => handleAlbumClick(album._id)}
//                     className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all pr-8 ${
//                       activeAlbum === album._id ? 'text-white' : isDark ? 'text-gray-400 hover:bg-violet-500/10' : 'text-gray-600 hover:bg-violet-50'
//                     }`}
//                     style={activeAlbum === album._id ? { background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' } : {}}>
//                     📁 {album.name}
//                     <span className={`text-xs ml-1 ${activeAlbum === album._id ? 'text-white/70' : 'text-gray-400'}`}>
//                       ({album.imageCount || 0})
//                     </span>
//                   </button>
//                   <button
//                     onClick={() => setConfirmData({ id: album._id, type: 'album', name: album.name })}
//                     className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 text-xs p-1 transition-opacity">
//                     🗑️
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Images Grid */}
//           <div className="flex-1 min-w-0">
//             {images.length === 0 ? (
//               <div className={`card text-center py-16 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//                 <p className="text-4xl mb-3">📷</p>
//                 <p className="mb-2 text-sm">No images here.</p>
//                 <button onClick={() => navigate('/admin/gallery/new')}
//                   className="text-violet-500 hover:underline text-sm">
//                   Add first image →
//                 </button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
//                 {images.map(img => (
//                   <div key={img._id} className="card p-2 group">
//                     <div className="relative overflow-hidden rounded-lg mb-2 aspect-square">
//                       <img
//                         src={img.imageData || img.imageUrl || 'https://via.placeholder.com/200?text=No+Image'}
//                         alt={img.title}
//                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                         onError={e => { e.target.src = 'https://via.placeholder.com/200?text=Error'; }}
//                       />
//                       {img.album && (
//                         <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-white text-xs"
//                           style={{ background: 'rgba(124,58,237,0.8)' }}>
//                           {typeof img.album === 'object' ? img.album.name : '📁'}
//                         </div>
//                       )}
//                     </div>
//                     <p className={`text-xs font-semibold truncate mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                       {img.title}
//                     </p>
//                     <div className="flex gap-1.5">
//                       <button onClick={() => navigate(`/admin/gallery/edit/${img._id}`)}
//                         className="btn-secondary text-xs py-1 px-2 flex-1">Edit</button>
//                       <button onClick={() => setConfirmData({ id: img._id, type: 'image', name: img.title })}
//                         className="btn-danger text-xs py-1 px-2">🗑️</button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       <ConfirmDialog
//         isOpen={!!confirmData}
//         title={`Delete ${confirmData?.type === 'album' ? 'Album' : 'Image'}`}
//         message={confirmData?.type === 'album'
//           ? `"${confirmData?.name}" aur iske saare images delete ho jaayenge.`
//           : `"${confirmData?.name}" permanently delete ho jaayega.`}
//         onConfirm={handleDelete}
//         onCancel={() => setConfirmData(null)}
//       />
//       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
//     </div>
//   );
// };

// // ═══════════════════════════════════════════════════
// // ADD / EDIT FORM
// // ═══════════════════════════════════════════════════
// export const AdminGalleryForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { isDark } = useTheme();
//   const isEdit = Boolean(id);
//   const fileRef = useRef();

//   const [form,       setForm]       = useState({ title: '', imageUrl: '', caption: '', album: '', order: 0 });
//   const [file,       setFile]       = useState(null);
//   const [preview,    setPreview]    = useState('');
//   const [albums,     setAlbums]     = useState([]);
//   const [loading,    setLoading]    = useState(false);
//   const [fetching,   setFetching]   = useState(isEdit);
//   const [toast,      setToast]      = useState(null);
//   const [uploadMode, setUploadMode] = useState('url');

//   useEffect(() => {
//     API.get('/gallery/albums')
//       .then(({ data }) => setAlbums(data.data || []))
//       .catch(() => {});

//     if (!isEdit) return;
//     API.get('/gallery')
//       .then(({ data }) => {
//         const img = (data.data || []).find(i => i._id === id);
//         if (img) {
//           setForm({
//             title:    img.title    || '',
//             imageUrl: img.imageUrl || '',
//             caption:  img.caption  || '',
//             album:    img.album?._id || img.album || '',
//             order:    img.order    || 0,
//           });
//           if (img.imageData)     { setPreview(img.imageData); setUploadMode('file'); }
//           else if (img.imageUrl) { setPreview(img.imageUrl);  setUploadMode('url');  }
//         }
//       })
//       .catch(() => setToast({ message: 'Failed to load', type: 'error' }))
//       .finally(() => setFetching(false));
//   }, [id]);

//   const handleFileChange = (e) => {
//     const f = e.target.files[0];
//     if (!f) return;
//     setFile(f);
//     const reader = new FileReader();
//     reader.onload = ev => setPreview(ev.target.result);
//     reader.readAsDataURL(f);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     const f = e.dataTransfer.files[0];
//     if (f && f.type.startsWith('image/')) {
//       setFile(f);
//       const reader = new FileReader();
//       reader.onload = ev => setPreview(ev.target.result);
//       reader.readAsDataURL(f);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);
//     const formData = new FormData();
//     formData.append('title',   form.title);
//     formData.append('caption', form.caption);
//     formData.append('order',   form.order);
//     if (form.album) formData.append('album', form.album);
//     if (uploadMode === 'url') {
//       formData.append('imageUrl', form.imageUrl);
//     } else if (file) {
//       formData.append('image', file);
//     }
//     const config = { headers: { 'Content-Type': 'multipart/form-data' } };
//     const req = isEdit
//       ? API.put(`/gallery/${id}`, formData, config)
//       : API.post('/gallery', formData, config);
//     req.then(() => {
//       setToast({ message: isEdit ? 'Updated!' : 'Image added!', type: 'success' });
//       setTimeout(() => navigate('/admin/gallery'), 1000);
//     }).catch(err => {
//       setToast({ message: err.response?.data?.message || 'Failed to save', type: 'error' });
//     }).finally(() => setLoading(false));
//   };

//   if (fetching) return <LoadingSpinner size="lg" className="py-20" />;

//   const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`;

//   return (
//     <div className="animate-fade-in max-w-2xl">
//       <div className="flex items-center gap-4 mb-8">
//         <button onClick={() => navigate('/admin/gallery')}
//           className={`p-2 rounded-xl border transition-colors ${
//             isDark ? 'border-violet-500/20 text-gray-400 hover:text-white hover:bg-violet-500/10'
//                    : 'border-violet-200 text-gray-500 hover:text-gray-900 hover:bg-violet-50'
//           }`}>←</button>
//         <div>
//           <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
//             {isEdit ? 'Edit Image' : 'Add Image'}
//           </h1>
//           <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//             URL paste karo ya file upload karo
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="card space-y-5">

//         {/* Title */}
//         <div>
//           <label className={labelClass}>Title *</label>
//           <input value={form.title}
//             onChange={e => setForm({ ...form, title: e.target.value })}
//             className="input-field" placeholder="e.g. Hackathon 2024" required />
//         </div>

//         {/* Toggle */}
//         <div>
//           <label className={labelClass}>Image Source</label>
//           <div className={`flex gap-1 p-1 rounded-xl mb-3 w-fit ${isDark ? 'bg-[#0a0a1a]' : 'bg-gray-100'}`}>
//             {[{ key: 'url', label: '🔗 URL' }, { key: 'file', label: '📁 Upload' }].map(({ key, label }) => (
//               <button key={key} type="button" onClick={() => setUploadMode(key)}
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                   uploadMode === key ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'
//                 }`}
//                 style={uploadMode === key ? { background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' } : {}}>
//                 {label}
//               </button>
//             ))}
//           </div>

//           {/* URL */}
//           {uploadMode === 'url' && (
//             <input value={form.imageUrl}
//               onChange={e => { setForm({ ...form, imageUrl: e.target.value }); setPreview(e.target.value); }}
//               className="input-field" placeholder="https://... (optional)" />
//           )}

//           {/* File */}
//           {uploadMode === 'file' && (
//             <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
//               onClick={() => fileRef.current.click()}
//               className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
//                 isDark ? 'border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/5'
//                        : 'border-violet-300 hover:border-violet-500 hover:bg-violet-50'
//               }`}>
//               <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
//               {file ? (
//                 <div>
//                   <p className="text-2xl mb-1">✅</p>
//                   <p className={`font-medium text-sm ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>{file.name}</p>
//                   <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Click to change</p>
//                 </div>
//               ) : (
//                 <div>
//                   <p className="text-4xl mb-2">📸</p>
//                   <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Click ya Drag & Drop</p>
//                   <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>JPG, PNG, WebP — Max 5MB</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Preview */}
//           {preview && (
//             <div className={`mt-3 rounded-xl overflow-hidden h-48 border ${isDark ? 'border-violet-500/20' : 'border-violet-200'}`}>
//               <img src={preview} alt="Preview" className="w-full h-full object-cover"
//                 onError={e => { e.target.src = 'https://via.placeholder.com/400?text=Invalid+URL'; }} />
//             </div>
//           )}
//         </div>

//         {/* Caption */}
//         <div>
//           <label className={labelClass}>Caption</label>
//           <input value={form.caption}
//             onChange={e => setForm({ ...form, caption: e.target.value })}
//             className="input-field" placeholder="Short description..." />
//         </div>

//         {/* Album */}
//         <div>
//           <label className={labelClass}>Album</label>
//           <select value={form.album}
//             onChange={e => setForm({ ...form, album: e.target.value })}
//             className="input-field">
//             <option value="">-- No Album (Uncategorized) --</option>
//             {albums.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
//           </select>
//         </div>

//         {/* Order */}
//         <div>
//           <label className={labelClass}>
//             Order
//             <span className={`ml-2 text-xs font-normal ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
//               (0 = pehle, 1 = doosra, 2 = teesra...)
//             </span>
//           </label>
//           <input type="number" value={form.order}
//             onChange={e => setForm({ ...form, order: e.target.value })}
//             className="input-field w-28" min="0" />
//         </div>

//         {/* Buttons */}
//         <div className="flex gap-3 pt-2">
//           <button type="submit" className="btn-primary" disabled={loading}>
//             {loading ? '⏳ Saving...' : isEdit ? '💾 Update' : '➕ Add Image'}
//           </button>
//           <button type="button" onClick={() => navigate('/admin/gallery')} className="btn-secondary">
//             Cancel
//           </button>
//         </div>
//       </form>

//       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
//     </div>
//   );
// };
