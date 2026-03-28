import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { User, Wallet, Search, Home, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  // Get initials from name e.g. "John Doe" → "JD"
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            {/* Logo */}
            <Link to="/home" className="text-2xl font-extrabold text-primary tracking-tight">
              ⚔️ SideQuest
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex space-x-8 items-center">
              <Link to="/home" className={`flex items-center gap-1 font-medium transition ${location.pathname === '/home' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}>
                <Home size={18} /> Dashboard
              </Link>
              <Link to="/search" className={`flex items-center gap-1 font-medium transition ${location.pathname === '/search' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}>
                <Search size={18} /> Browse Quests
              </Link>
              <Link to="/tasks/mine" className={`flex items-center gap-1 font-medium transition ${location.pathname.includes('/tasks/mine') ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}>
                📋 My Tasks
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Link to="/tasks/post"
                className="hidden md:flex items-center gap-1 bg-indigo-50 text-primary px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition">
                <PlusCircle size={18} /> Post Quest
              </Link>

              <Link to="/wallet"
                className="text-slate-600 hover:text-secondary transition p-2 bg-slate-50 rounded-full border border-slate-200"
                title={`Wallet: ₹${parseFloat(user?.wallet_balance || 0).toFixed(2)}`}>
                <Wallet size={20} />
              </Link>

              {/* Avatar with initials → goes to profile */}
              <Link to="/profile"
                className="w-9 h-9 bg-indigo-100 text-primary rounded-full flex items-center justify-center font-bold text-sm border border-indigo-200 hover:bg-indigo-200 transition"
                title={user?.name}>
                {initials}
              </Link>

              {/* Logout button */}
              <button onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 transition p-2 rounded-full"
                title="Sign out">
                <LogOut size={18} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-white mb-2">⚔️ SideQuest</h2>
          <p className="text-sm mb-4">Built for students, by students.</p>
          <div className="flex justify-center gap-6 text-sm">
            {user?.role === 'admin' && (
              <Link to="/admin" className="hover:text-white transition">Admin Panel</Link>
            )}
            <span className="cursor-pointer hover:text-white transition">Terms of Service</span>
            <span className="cursor-pointer hover:text-white transition">Support</span>
          </div>
          <p className="text-xs text-slate-500 mt-6">© 2026 SideQuest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}