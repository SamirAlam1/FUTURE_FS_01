import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

const BlogCard = ({ post, isDark }) => (
  <Link to={`/blog/${post.slug || post._id}`}
    className="card group hover:-translate-y-1 transition-all duration-300 block">
    {post.coverImage && (
      <div className={`w-full h-44 rounded-xl overflow-hidden mb-5 ${isDark ? 'bg-[#0a0a1a]' : 'bg-gray-100'}`}>
        <img src={post.coverImage} alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.style.display = 'none'; }} />
      </div>
    )}

    <div className="flex flex-wrap gap-2 mb-3">
      {post.tags?.slice(0, 3).map((tag) => <span key={tag} className="badge text-xs">{tag}</span>)}
    </div>

    <h3 className={`text-lg font-bold mb-3 leading-snug group-hover:gradient-text transition-all ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {post.title}
    </h3>

    <p className={`text-sm leading-relaxed mb-4 line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
      {post.excerpt}
    </p>

    <div className={`flex items-center justify-between pt-4 border-t text-xs font-medium ${
      isDark ? 'border-violet-500/10 text-gray-500' : 'border-violet-100 text-gray-400'
    }`}>
      <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      <span className="gradient-text">{post.readTime} min read →</span>
    </div>
  </Link>
);

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    API.get('/blogs').then(({ data }) => setPosts(data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="section-title">Blog</h1>
          <p className="section-subtitle">A space where I share my learnings, experiences, and insights from my web development journey.</p>
        </div>
        {loading ? <LoadingSpinner size="lg" className="py-20" /> :
         posts.length === 0 ? (
          <div className={`text-center py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No blog posts yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => <BlogCard key={post._id} post={post} isDark={isDark} />)}
          </div>
        )}
      </div>
    </main>
  );
};

export default Blog;
