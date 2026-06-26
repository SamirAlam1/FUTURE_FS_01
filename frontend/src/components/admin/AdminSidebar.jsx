import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../shared/ThemeToggle';

const menuItems = [
  { to: '/admin/dashboard',       label: 'Dashboard',        icon: '📊' },
  { to: '/admin/projects',        label: 'Projects',         icon: '💼' },
  { to: '/admin/skills',          label: 'Skills',           icon: '🛠️' },
  { to: '/admin/education',       label: 'Education',        icon: '🎓' },
  { to: '/admin/certifications',  label: 'Certifications',   icon: '🏅' },
  { to: '/admin/messages',        label: 'Contact Messages', icon: '✉️' },
];

const AdminSidebar = ({ onClose }) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className={`flex flex-col h-full w-full border-r transition-colors duration-300 ${
      isDark
        ? 'bg-[#0f0f23] border-violet-500/10'
        : 'bg-white border-violet-200'
    }`}>

      {/* ── Header ───────────────────────────────── */}
      <div className={`p-5 border-b flex-shrink-0 ${isDark ? 'border-violet-500/10' : 'border-violet-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-mono font-bold gradient-text text-lg truncate">Admin Panel</h2>
            <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Theme toggle only on desktop (mobile has it in topbar) */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            {/* Close button on mobile */}
            {onClose && (
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors md:hidden ${
                  isDark
                    ? 'text-gray-500 hover:text-white hover:bg-violet-500/10'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-violet-50'
                }`}
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────── */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map(({ to, label, icon }) => {
          const isActive = pathname === to || pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ───────────────────────────────── */}
      <div className={`p-4 border-t space-y-1 flex-shrink-0 ${isDark ? 'border-violet-500/10' : 'border-violet-100'}`}>
        <Link
          to="/"
          target="_blank"
          className="sidebar-link text-sm"
          onClick={onClose}
        >
          <span>🌐</span>
          <span>View Portfolio</span>
        </Link>
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-left text-sm transition-colors ${
            isDark
              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
              : 'text-red-500 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
