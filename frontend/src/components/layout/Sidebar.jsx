import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  PenTool,
  Calendar,
  CheckSquare,
  Image,
  Sparkles,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Écrire', icon: PenTool, to: '/journal/write' },
  { label: 'Planning', icon: Calendar, to: '/journal/planning' },
  { label: 'Routine', icon: CheckSquare, to: '/journal/routine' },
  { label: 'Humeurs', icon: Sparkles, to: '/journal/moods' },
  { label: 'Galerie', icon: Image, to: '/journal/gallery' },
  { label: 'Paramètres', icon: Settings, to: '/settings' },
];

export default function Sidebar({ onLinkClick }) {
  const { user, logout } = useAuth();

  const handleClick = () => {
    if (onLinkClick) onLinkClick();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <span className="font-display text-2xl font-bold tracking-tight text-rose-600">
          Intimia
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ label, icon: Icon, to }, index) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleClick}
            style={{ animationDelay: `${index * 50}ms` }}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
               transition-all duration-200 animate-fade-in-up
               ${
                 isActive
                   ? 'bg-rose-50 text-rose-600 shadow-soft border border-rose-100'
                   : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
               }`
            }
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-sm font-semibold text-white overflow-hidden shadow-soft">
            {user?.avatar && user.avatar.startsWith('/') ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user?.name || 'Utilisateur'}
            </p>
            <p className="truncate text-xs text-gray-400">
              {user?.email || ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl p-2 text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
            title="Déconnexion"
            aria-label="Se déconnecter"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
