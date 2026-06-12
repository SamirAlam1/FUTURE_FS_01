// import { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import API from '../../utils/api';
// import LoadingSpinner from '../../components/shared/LoadingSpinner';

// // Simple Markdown-like renderer
// const renderContent = (content) => {
//   if (!content) return '';
//   return content
//     .replace(/^# (.*$)/gm, '<h1>$1</h1>')
//     .replace(/^## (.*$)/gm, '<h2>$1</h2>')
//     .replace(/^### (.*$)/gm, '<h3>$1</h3>')
//     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//     .replace(/\*(.*?)\*/g, '<em>$1</em>')
//     .replace(/`(.*?)`/g, '<code>$1</code>')
//     .replace(/^- (.*$)/gm, '<li>$1</li>')
//     .replace(/\n\n/g, '</p><p>')
//     .replace(/^(?!<[h|l|p])(.+)/gm, '<p>$1</p>');
// };

// const BlogDetail = () => {
//   const { id } = useParams();
//   const [post, setPost] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     API.get(`/blogs/${id}`)
//       .then(({ data }) => setPost(data.data))
//       .catch(() => setError('Blog post not found.'))
//       .finally(() => setLoading(false));
//   }, [id]);

//   if (loading) return <div className="min-h-screen pt-24 flex justify-center"><LoadingSpinner size="lg" /></div>;

//   if (error) return (
//     <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 text-slate-400">
//       <p>{error}</p>
//       <Link to="/blog" className="btn-outline">← Back to Blog</Link>
//     </div>
//   );

//   return (
//     <main className="min-h-screen pt-24 pb-20 px-4">
//       <div className="max-w-3xl mx-auto">
//         <Link to="/blog" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-8 text-sm">
//           ← Back to Blog
//         </Link>

//         {post.coverImage && (
//           <img src={post.coverImage} alt={post.title} className="w-full h-64 object-cover rounded-2xl mb-8" />
//         )}

//         <div className="flex flex-wrap gap-2 mb-4">
//           {post.tags?.map((tag) => <span key={tag} className="badge">{tag}</span>)}
//         </div>

//         <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>

//         <div className="flex items-center gap-4 text-slate-500 text-sm mb-10 pb-8 border-b border-slate-700/50">
//           <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
//           <span>·</span>
//           <span>{post.readTime} min read</span>
//         </div>

//         <div
//           className="prose-content"
//           dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
//         />
//       </div>
//     </main>
//   );
// };

// export default BlogDetail;
