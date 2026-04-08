import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusCircle, LogOut, Wallet, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL;

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  // FIX: real unread notification count instead of hardcoded dot
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    const fetchUnread = () => {
      fetch(`${API}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setUnreadCount(data.count || 0);
        })
        .catch(() => {});
    };
    const fetchUnreadMessages = () => {
      fetch(`${API}/api/messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setUnreadMsgCount(data.count || 0);
        })
        .catch(() => {});
    };
    fetchUnread();
    fetchUnreadMessages();
    // Poll every 30 seconds
    const interval = setInterval(() => { fetchUnread(); fetchUnreadMessages(); }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const isActive = (path) => {
    // FIX: /tasks/mine must be exact so /tasks/post and /tasks/123 don't highlight it
    if (path === '/tasks/mine') return location.pathname === '/tasks/mine';
    if (path === '/home') return location.pathname === '/home';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { to: '/home',       label: 'Home',      icon: <Home size={15} /> },
    { to: '/search',     label: 'Browse',    icon: <Search size={15} /> },
    { to: '/tasks/mine', label: 'My Tasks',  icon: null },
    { to: '/messages',   label: 'Messages',  icon: null, hasUnread: unreadMsgCount > 0 },
  ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');`}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── NAVBAR ─────────────────────────────────────────────────── */}
        <nav style={{
          background: '#1A1A2E',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 68,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          {/* Logo */}
          <Link to="/home" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: '#FFD93D',
              letterSpacing: -0.5,
            }}>
              SideQuest<span style={{ color: '#fff' }}>.</span>
            </span>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {navLinks.map(({ to, label, icon, hasUnread }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none', position: 'relative' }}>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  color: isActive(to) ? '#FFD93D' : 'rgba(255,255,255,0.6)',
                  background: isActive(to) ? 'rgba(255,217,61,0.12)' : 'transparent',
                  padding: '6px 14px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                  {icon}
                  {label}
                </span>
                {/* Unread indicator for Messages */}
                {hasUnread && (
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#FF6B35',
                    position: 'absolute', top: 4, right: 4,
                    border: '1.5px solid #1A1A2E',
                  }} />
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Post Quest CTA */}
            <Link to="/tasks/post" style={{ textDecoration: 'none' }}>
              <button style={{
                background: '#FFD93D',
                color: '#1A1A2E',
                border: 'none',
                borderRadius: 100,
                padding: '7px 16px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#e6c235'}
                onMouseLeave={e => e.currentTarget.style.background = '#FFD93D'}
              >
                <PlusCircle size={14} /> Post Quest
              </button>
            </Link>

            {/* Wallet */}
            <Link
              to="/wallet"
              title={`Wallet: ₹${parseFloat(user?.wallet_balance || 0).toFixed(2)}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.65)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              >
                <Wallet size={15} />
              </div>
            </Link>

            {/* Notifications */}
            <Link to="/notifications" style={{ textDecoration: 'none', position: 'relative' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.65)',
                cursor: 'pointer',
                transition: 'background 0.15s',
                position: 'relative',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              >
                <Bell size={15} />
                {/* FIX: only show dot when there are real unread notifications */}
                {unreadCount > 0 && (
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#FF6B35',
                    position: 'absolute', top: 6, right: 6,
                    border: '1.5px solid #1A1A2E',
                  }} />
                )}
              </div>
            </Link>

            {/* Avatar */}
            <Link to="/profile" title={user?.name} style={{ textDecoration: 'none' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: '#FFD93D',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800, fontSize: 12,
                color: '#1A1A2E',
                cursor: 'pointer',
                border: '2px solid rgba(255,217,61,0.35)',
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {initials}
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.12)'; e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.borderColor = 'rgba(255,80,80,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </nav>

        {/* ── PAGE CONTENT ────────────────────────────────────────────── */}
        <main style={{ flexGrow: 1, background: '#F7F6F2' }}>
          <Outlet />
        </main>

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
        <footer style={{
          background: '#1A1A2E',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '36px 24px',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800, fontSize: 20,
              color: '#FFD93D', marginBottom: 6,
            }}>
              SideQuest<span style={{ color: '#fff' }}>.</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
              Built for students, by students.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
              {user?.role === 'admin' && (
                <Link to="/admin" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >Admin Panel</Link>
              )}
              <span style={{ cursor: 'pointer' }}>Terms of Service</span>
              <span style={{ cursor: 'pointer' }}>Support</span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>© 2026 SideQuest. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </>
  );
}