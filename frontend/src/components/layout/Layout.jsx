import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 ease-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onLinkClick={() => setSidebarOpen(false)} />
      </div>

      <div className="fixed inset-y-0 left-0 z-30 hidden w-[280px] lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[280px]">
        <header
          className={`sticky top-0 z-20 flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
            scrolled
              ? 'bg-white/90 backdrop-blur-lg shadow-soft border-b border-gray-100'
              : 'bg-white/60 backdrop-blur-md border-b border-transparent'
          }`}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-sm font-semibold text-white overflow-hidden shadow-soft">
              {user?.avatar && user.avatar.startsWith('/') ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
