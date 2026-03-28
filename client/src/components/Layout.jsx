import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Wallet, Search, Home, PlusCircle, Settings } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Global Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Link to="/home" className="text-2xl font-extrabold text-primary tracking-tight">
                ⚔️ SideQuest
              </Link>
            </div>

            {/* Desktop Navigation Links */}
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

            {/* Right Side Buttons (Post, Wallet, Profile) */}
            <div className="flex items-center gap-4">
              <Link to="/tasks/post" className="hidden md:flex items-center gap-1 bg-indigo-50 text-primary px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition">
                <PlusCircle size={18} /> Post Quest
              </Link>
              <Link to="/wallet" className="text-slate-600 hover:text-secondary transition p-2 bg-slate-50 rounded-full border border-slate-200" title="Wallet">
                <Wallet size={20} />
              </Link>
              <Link to="/profile" className="text-slate-600 hover:text-primary transition p-2 bg-slate-50 rounded-full border border-slate-200" title="Profile">
                <User size={20} />
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Page Content (This is where Home, Search, etc. will appear) */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-white tracking-tight mb-2">⚔️ SideQuest</h2>
          <p className="text-sm mb-4">Built for students, by students. The ultimate campus marketplace.</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/admin" className="hover:text-white transition">Admin Panel</Link>
            <span className="cursor-pointer hover:text-white transition">Terms of Service</span>
            <span className="cursor-pointer hover:text-white transition">Support</span>
          </div>
          <p className="text-xs text-slate-500 mt-6">© 2026 SideQuest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}