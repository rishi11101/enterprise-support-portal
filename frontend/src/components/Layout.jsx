import { useContext, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (

    <div className="flex flex-col md:flex-row h-screen bg-zinc-50 font-sans">
      
      {/* Mobile Top Header*/}
      <div className="md:hidden flex items-center justify-between bg-zinc-950 p-4 text-white z-30">
        <div>
          <h2 className="text-xl font-black tracking-tighter">Enterprise</h2>
          <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">Support Portal</p>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {/* Sidebar */}
      <aside className={`${
        isMobileMenuOpen ? 'flex' : 'hidden'
      } md:flex w-full md:w-64 bg-zinc-950 text-zinc-400 flex-col shadow-2xl z-20 absolute md:relative top-18 md:top-0 h-[calc(100vh-72px)] md:h-screen`}>
        

        <div className="hidden md:block p-6 mb-4">
          <h2 className="text-2xl font-black text-white tracking-tighter">Enterprise</h2>
          <p className="text-xs text-cyan-400 font-bold tracking-widest uppercase mt-1">Support Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0 overflow-y-auto">
          <Link onClick={closeMenu} to="/" className={`block px-4 py-3 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-zinc-800 text-white font-semibold' : 'hover:bg-zinc-900 hover:text-white'}`}>
            Dashboard
          </Link>
          <Link onClick={closeMenu} to="/tickets" className={`block px-4 py-3 rounded-lg transition-colors ${location.pathname === '/tickets' ? 'bg-zinc-800 text-white font-semibold' : 'hover:bg-zinc-900 hover:text-white'}`}>
            All Tickets
          </Link>
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <Link onClick={closeMenu} to="/users" className={`block px-4 py-3 rounded-lg transition-colors ${location.pathname === '/users' ? 'bg-zinc-800 text-white font-semibold' : 'hover:bg-zinc-900 hover:text-white'}`}>
              User Management
            </Link>
          )}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-zinc-800/50 bg-zinc-950 mt-auto">
          <div className="mb-4 px-2">
            <p className="text-sm font-bold text-white">{user?.name || 'Loading...'}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email || '...'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-sm font-bold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}