import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const StatCard = ({ label, value, icon, to, gradient, isDark }) => (
  <Link to={to} className={`rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 block ${
    isDark
      ? 'bg-[#16162e]/80 border-violet-500/10 hover:border-violet-500/30'
      : 'bg-white border-violet-200 hover:border-violet-400 shadow-sm hover:shadow-md'
  }`}
    style={{ boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '' }}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{value ?? '—'}</p>
      </div>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ background: gradient }}>
        {icon}
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const { user }  = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projects, skills, education, blogs, messages] = await Promise.all([
          API.get('/projects'), API.get('/skills'), API.get('/education'),
          API.get('/blogs'), API.get('/messages'),
        ]);
        setStats({
          projects:  projects.data.count,
          skills:    skills.data.count,
          education: education.data.count,
          blogs:     blogs.data.count,
          messages:  messages.data.count,
          unread:    messages.data.data.filter((m) => !m.read).length,
        });
        setRecentMessages(messages.data.data.slice(0, 5));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="py-20" />;

  const statCards = [
    { label: 'Projects',        value: stats.projects,  icon: '💼', to: '/admin/projects',  gradient: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.05))' },
    { label: 'Skills',          value: stats.skills,    icon: '🛠️', to: '/admin/skills',    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))'  },
    { label: 'Education',       value: stats.education, icon: '🎓', to: '/admin/education', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))' },
    { label: 'Blog Posts',      value: stats.blogs,     icon: '📝', to: '/admin/blogs',     gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))' },
    { label: 'Total Messages',  value: stats.messages,  icon: '✉️', to: '/admin/messages',  gradient: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))' },
    { label: 'Unread Messages', value: stats.unread,    icon: '🔔', to: '/admin/messages',  gradient: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))'   },
  ];

  return (
    <div className="animate-fade-in">

      {/* Welcome */}
      <div className="mb-8">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Welcome back, <span className="gradient-text">Samir</span> 👋
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Here's an overview of my portfolio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} isDark={isDark} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/projects/new" className="btn-primary text-sm">+ New Project</Link>
          <Link to="/admin/blogs/new"    className="btn-primary text-sm">+ New Blog Post</Link>
          <Link to="/admin/skills/new"   className="btn-secondary text-sm">+ Add Skill</Link>
          <Link to="/admin/education/new" className="btn-secondary text-sm">+ Add Education</Link>
        </div>
      </div>

      {/* Recent Messages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-base font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Recent Messages</h2>
          <Link to="/admin/messages" className="text-violet-500 text-sm hover:underline font-medium">View all →</Link>
        </div>

        {recentMessages.length === 0 ? (
          <div className={`rounded-2xl p-10 text-center border ${
            isDark ? 'bg-[#16162e]/50 border-violet-500/10 text-gray-500' : 'bg-white border-violet-200 text-gray-400'
          }`}>No messages yet</div>
        ) : (
          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <div key={msg._id} className={`rounded-2xl p-4 border flex items-start gap-4 transition-all ${
                isDark
                  ? `bg-[#16162e]/80 ${!msg.read ? 'border-violet-500/30' : 'border-violet-500/10'}`
                  : `bg-white ${!msg.read ? 'border-violet-400' : 'border-violet-200'} shadow-sm`
              }`}>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 text-sm"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                  {msg.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{msg.name}</span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{msg.email}</span>
                    {!msg.read && <span className="badge text-xs">New</span>}
                  </div>
                  <p className={`text-sm font-medium mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{msg.subject}</p>
                  <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{msg.message}</p>
                </div>

                <span className={`text-xs flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
