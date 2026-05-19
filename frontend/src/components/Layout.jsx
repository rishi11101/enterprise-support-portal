import { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 text-zinc-400 flex flex-col shadow-2xl z-10">
        <div className="p-6 mb-4">
          <h2 className="text-2xl font-black text-white tracking-tighter">Enterprise</h2>
          <p className="text-xs text-cyan-400 font-bold tracking-widest uppercase mt-1">Support Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">

          <Link to="/" className={`block px-4 py-3 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-zinc-800 text-white font-semibold' : 'hover:bg-zinc-900 hover:text-white'}`}>
            Dashboard
          </Link>
          <Link to="/tickets" className={`block px-4 py-3 rounded-lg transition-colors ${location.pathname === '/tickets' ? 'bg-zinc-800 text-white font-semibold' : 'hover:bg-zinc-900 hover:text-white'}`}>
            All Tickets
          </Link>
          {/* User management only for admins & staffs */}
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <Link to="/users" className={`block px-4 py-3 rounded-lg transition-colors ${location.pathname === '/users' ? 'bg-zinc-800 text-white font-semibold' : 'hover:bg-zinc-900 hover:text-white'}`}>
              User Management
            </Link>
          )}

        </nav>

        {/* User Profile & Logout at the bottom */}
        <div className="p-4 border-t border-zinc-800/50 bg-zinc-950">
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

      {/* Main Area (outlet)*/}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}