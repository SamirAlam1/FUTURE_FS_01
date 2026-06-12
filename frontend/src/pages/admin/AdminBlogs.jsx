// import { useState, useEffect } from 'react';
// import { Link, useNavigate, useParams } from 'react-router-dom';
// import API from '../../utils/api';
// import LoadingSpinner from '../../components/shared/LoadingSpinner';
// import ConfirmDialog from '../../components/shared/ConfirmDialog';
// import Toast from '../../components/shared/Toast';
// import { useTheme } from '../../context/ThemeContext';

// export const AdminBlogList = () => {
//   const [posts, setPosts]         = useState([]);
//   const [loading, setLoading]     = useState(true);
//   const [toast, setToast]         = useState(null);
//   const [confirmId, setConfirmId] = useState(null);
//   const { isDark } = useTheme();

//   const fetchPosts = () => {
//     setLoading(true);
//     API.get('/blogs').then(({ data }) => setPosts(data.data))
//       .catch(() => setToast({ message: 'Failed to load posts', type: 'error' }))
//       .finally(() => setLoading(false));
//   };
//   useEffect(fetchPosts, []);

//   const handleDelete = async () => {
//     try {
//       await API.delete(`/blogs/${confirmId}`);
//       setToast({ message: 'Post deleted!', type: 'success' });
//       fetchPosts();
//     } catch { setToast({ message: 'Failed to delete', type: 'error' }); }
//     finally  { setConfirmId(null); }
//   };

//   const togglePublish = async (post) => {
//     try {
//       await API.put(`/blogs/${post._id}`, { ...post, published: !post.published });
//       setToast({ message: `Post ${!post.published ? 'published' : 'unpublished'}!`, type: 'success' });
//       fetchPosts();
//     } catch { setToast({ message: 'Failed to update', type: 'error' }); }
//   };

//   return (
//     <div className="animate-fade-in">
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Blog Posts</h1>
//           <p className={`mt-1 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{posts.length} total</p>
//         </div>
//         <Link to="/admin/blogs/new" className="btn-primary">+ New Post</Link>
//       </div>

//       {loading ? <LoadingSpinner size="lg" className="py-20" /> :
//        posts.length === 0 ? (
//         <div className={`card text-center py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//           <p className="text-4xl mb-4">📝</p>
//           No posts yet. <Link to="/admin/blogs/new" className="text-violet-500 hover:underline">Write one!</Link>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {posts.map((post) => (
//             <div key={post._id} className="card flex items-start gap-4">
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-2 flex-wrap mb-1">
//                   <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{post.title}</h3>
//                   <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
//                     post.published
//                       ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
//                       : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
//                   }`}>
//                     {post.published ? '✅ Published' : '📝 Draft'}
//                   </span>
//                 </div>
//                 <p className={`text-sm truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{post.excerpt}</p>
//                 <div className="flex flex-wrap gap-1 mt-2">
//                   {post.tags?.slice(0, 3).map((t) => <span key={t} className="tag text-xs">{t}</span>)}
//                 </div>
//               </div>
//               <div className="flex gap-2 flex-shrink-0">
//                 <button onClick={() => togglePublish(post)}
//                   className={`text-xs py-1.5 px-3 rounded-lg border font-medium transition-colors ${
//                     post.published
//                       ? isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-100'
//                       : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
//                   }`}>
//                   {post.published ? 'Unpublish' : 'Publish'}
//                 </button>
//                 <Link to={`/admin/blogs/edit/${post._id}`} className="btn-secondary text-sm py-1.5 px-3">Edit</Link>
//                 <button onClick={() => setConfirmId(post._id)} className="btn-danger text-sm py-1.5 px-3">Delete</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <ConfirmDialog isOpen={!!confirmId} title="Delete Post" message="Are you sure? This cannot be undone."
//         onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
//       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
//     </div>
//   );
// };

// export const AdminBlogForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { isDark } = useTheme();
//   const isEdit = Boolean(id);

//   const [form, setForm]         = useState({ title: '', excerpt: '', content: '', tags: '', coverImage: '', published: false, readTime: 5 });
//   const [loading, setLoading]   = useState(false);
//   const [fetching, setFetching] = useState(isEdit);
//   const [toast, setToast]       = useState(null);

//   useEffect(() => {
//     if (!isEdit) return;
//     API.get(`/blogs/${id}`).then(({ data }) => {
//       const p = data.data;
//       setForm({ ...p, tags: p.tags.join(', ') });
//     }).catch(() => setToast({ message: 'Failed to load', type: 'error' }))
//       .finally(() => setFetching(false));
//   }, [id]);

//   const handleSubmit = async (e) => {
//     e.preventDefault(); setLoading(true);
//     const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
//     try {
//       if (isEdit) { await API.put(`/blogs/${id}`, payload); setToast({ message: 'Post updated!', type: 'success' }); }
//       else        { await API.post('/blogs', payload);       setToast({ message: 'Post created!', type: 'success' }); }
//       setTimeout(() => navigate('/admin/blogs'), 1000);
//     } catch (err) { setToast({ message: err.response?.data?.message || 'Failed', type: 'error' }); }
//     finally { setLoading(false); }
//   };

//   if (fetching) return <LoadingSpinner size="lg" className="py-20" />;
//   const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`;

//   return (
//     <div className="animate-fade-in max-w-3xl">
//       <div className="flex items-center gap-4 mb-8">
//         <button onClick={() => navigate('/admin/blogs')}
//           className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-violet-500/20 text-gray-400 hover:text-white hover:bg-violet-500/10' : 'border-violet-200 text-gray-500 hover:text-gray-900 hover:bg-violet-50'}`}>←</button>
//         <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{isEdit ? 'Edit Post' : 'New Blog Post'}</h1>
//       </div>

//       <form onSubmit={handleSubmit} className="card space-y-5">
//         <div>
//           <label className={labelClass}>Title *</label>
//           <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Post title" required />
//         </div>
//         <div>
//           <label className={labelClass}>Excerpt *</label>
//           <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="input-field min-h-[80px] resize-y" placeholder="Short summary..." required />
//         </div>
//         <div>
//           <label className={labelClass}>Content (Markdown) *</label>
//           <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field min-h-[200px] resize-y font-mono text-sm" placeholder="# Heading&#10;&#10;Write your content here..." required />
//         </div>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <label className={labelClass}>Tags (comma separated)</label>
//             <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="React, JavaScript, Tutorial" />
//           </div>
//           <div>
//             <label className={labelClass}>Read Time (minutes)</label>
//             <input type="number" value={form.readTime} onChange={(e) => setForm({ ...form, readTime: Number(e.target.value) })} className="input-field" min="1" />
//           </div>
//         </div>
//         <div>
//           <label className={labelClass}>Cover Image URL</label>
//           <input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className="input-field" placeholder="https://..." />
//         </div>
//         <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border transition-colors ${
//           isDark ? 'border-violet-500/10 hover:border-violet-500/30' : 'border-violet-200 hover:border-violet-400'
//         }`}>
//           <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 accent-violet-500" />
//           <div>
//             <p className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Publish Post</p>
//             <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Make visible on public blog page</p>
//           </div>
//         </label>
//         <div className="flex gap-3 pt-2">
//           <button type="submit" className="btn-primary" disabled={loading}>{loading ? '⏳ Saving...' : '💾 Save Post'}</button>
//           <button type="button" onClick={() => navigate('/admin/blogs')} className="btn-secondary">Cancel</button>
//         </div>
//       </form>
//       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
//     </div>
//   );
// };
