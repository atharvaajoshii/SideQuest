import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Users, Briefcase, AlertTriangle, TrendingUp, Megaphone, Settings, BarChart2, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/admin', label: 'Dashboard', icon: <BarChart2 size={18} /> },
    { to: '/admin/users', label: 'Manage Users', icon: <Users size={18} /> },
    { to: '/admin/tasks', label: 'Manage Tasks', icon: <Briefcase size={18} /> },
    { to: '/admin/reports', label: 'Review Reports', icon: <AlertTriangle size={18} /> },
    { to: '/admin/announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
    { to: '/admin/profile', label: 'My Profile', icon: <User size={18} /> },
    { to: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 fixed h-full overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => navigate('/home')}
            className="text-slate-400 hover:text-white transition"
            title="Back to Home"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-extrabold text-primary">Admin Panel</h2>
        </div>
        <nav className="space-y-2">
          {navLinks.map(({ to, label, icon }) => (
            <Link key={to} to={to}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive(to)
                  ? 'bg-primary text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
                {icon}
                {label}
              </div>
            </Link>
          ))}
        </nav>

        {/* Logout at bottom */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition"
          >
            <ArrowLeft size={18} className="rotate-180" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grow ml-64 p-8">
        <Outlet />
      </div>
    </div>
  );
}
