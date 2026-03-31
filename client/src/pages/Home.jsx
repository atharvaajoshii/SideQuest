import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle, Search, FileText, Zap,
  CreditCard, TrendingUp, Star,
} from 'lucide-react';

const ACCENT_COLORS = ['#FF6B35', '#6C5CE7', '#00C897', '#FF6EB4', '#FD79A8', '#A29BFE'];

const CATEGORIES = ['All', 'Design', 'Development', 'Writing', 'Video', 'Tutoring', 'Other'];

const getCategorySkills = (category) => {
  const map = {
    'Design': ['Figma', 'UI/UX'],
    'Development': ['Node.js', 'React'],
    'Writing': ['Content', 'SEO'],
    'Video': ['Premiere', 'Editing'],
  };
  return map[category] || ['General', 'Task'];
};

// ─── HELPERS ────────────────────────────────────────────────────────────────

function Avatar({ initials, bg = '#6C5CE7', size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 800,
      fontFamily: "'Syne', sans-serif", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:  { label: 'In Progress', bg: 'rgba(0,200,151,0.12)',  color: '#008a66' },
    review:  { label: 'In Review',   bg: 'rgba(255,107,53,0.12)', color: '#c95520' },
    pending: { label: 'Pending',     bg: 'rgba(108,92,231,0.12)', color: '#5a4bc4' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 100, flexShrink: 0,
    }}>
      {s.label}
    </span>
  );
}

function ProgressBar({ value, color = '#00C897' }) {
  return (
    <div style={{ background: '#F0EEF8', borderRadius: 100, height: 5, margin: '8px 0 6px', overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', borderRadius: 100, background: color, transition: 'width 0.5s' }} />
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery]   = useState('');
  const [userStats, setUserStats] = useState({ earned: 0, completed: 0 });
  const [recommendedTasks, setRecommendedTasks] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const navigate = useNavigate();
  const { user, token, API } = useAuth();

  // Fetch recommended tasks
  useEffect(() => {
    if (user && token) {
      fetch(`${API}/api/tasks/feed/recommended`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setRecommendedTasks(data))
        .catch(() => setRecommendedTasks([]));

      // Fetch active orders (tasks I'm working on)
      fetch(`${API}/api/tasks/my-work`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setActiveOrders(data))
        .catch(() => setActiveOrders([]));
    }
  }, [user, token, API]);

  // Fetch user stats from database
  useEffect(() => {
    if (user && token) {
      setUserStats({
        earned: parseFloat(user.wallet_balance || 0),
        completed: 0
      });
    }
  }, [user, token]);

  // Filter tasks by search and category
  const filteredTasks = recommendedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilter === 'All' || task.category === activeFilter;
    return matchesSearch && matchesCategory;
  });

  // Get user initials from real user data
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div style={{ background: '#F7F6F2', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 60px' }}>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <div style={{
          background: '#1A1A2E', borderRadius: 20, padding: '36px 40px',
          marginBottom: 28, position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        }}>
          {[
            { w: 260, h: 260, bg: '#6C5CE7', top: -60,  right: 80,  opacity: 0.35 },
            { w: 180, h: 180, bg: '#FF6B35', bottom: -60, right: 20, opacity: 0.35 },
            { w: 140, h: 140, bg: '#FFD93D', top: 20,   right: 260, opacity: 0.12 },
          ].map((b, i) => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%',
              width: b.w, height: b.h, background: b.bg,
              top: b.top, bottom: b.bottom, right: b.right,
              filter: 'blur(60px)', opacity: b.opacity, pointerEvents: 'none',
            }} />
          ))}

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#FFD93D',
              textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 20, height: 2, background: '#FFD93D', borderRadius: 2 }} />
              Good morning, {user?.name || 'User'}
            </div>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 34, lineHeight: 1.15, color: '#fff',
              marginBottom: 12, letterSpacing: -1,
            }}>
              Your <span style={{ color: '#FFD93D' }}>side hustle</span>
              <br />dashboard awaits.
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', maxWidth: 380, lineHeight: 1.6, marginBottom: 24 }}>
              Find tasks, earn stipends, and build your freelance rep — all without leaving campus.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/tasks/post" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: '#FFD93D', color: '#1A1A2E', border: 'none', borderRadius: 100,
                  padding: '11px 22px', fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  <PlusCircle size={16} /> Post a Task
                </button>
              </Link>
              <Link to="/search" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100,
                  padding: '11px 22px', fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500, fontSize: 14, cursor: 'pointer',
                }}>
                  Browse Tasks →
                </button>
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 2, flexShrink: 0 }}>
            {[
              { label: 'Total Earned',    value: `₹${userStats.earned.toLocaleString('en-IN')}`, change: '+ earnings', icon: <TrendingUp size={14} /> },
              { label: 'Tasks Completed', value: userStats.completed,                            change: 'tasks done', icon: <Star size={14} /> },
            ].map(({ label, value, change, icon }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: '14px 20px', minWidth: 170,
              }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                  {label}
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: '#fff', lineHeight: 1 }}>
                  {value}
                </div>
                <div style={{ fontSize: 11, color: '#00C897', fontWeight: 500, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {icon} ↑ {change}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN GRID ─────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: TASK FEED ───────────────────────────────────────── */}
          <div>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6B6B85', pointerEvents: 'none' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks — design, coding, writing..."
                style={{
                  width: '100%', background: '#fff', border: '1px solid #E8E6E0',
                  borderRadius: 100, padding: '10px 16px 10px 40px',
                  fontSize: 14, color: '#1A1A2E', outline: 'none', fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {CATEGORIES.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 100, cursor: 'pointer',
                  border: '1px solid', transition: 'all 0.15s',
                  borderColor: activeFilter === f ? '#1A1A2E' : '#D1D5DB',
                  background:  activeFilter === f ? '#1A1A2E' : '#fff',
                  color:       activeFilter === f ? '#FFD93D' : '#374151',
                }}>
                  {f}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B35', flexShrink: 0 }} />
                Recommended for You
              </div>
              <Link
                to={`/search${searchQuery ? `?search=${encodeURIComponent(searchQuery)}&category=${activeFilter !== 'All' ? activeFilter : ''}` : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <button style={{ fontSize: 13, fontWeight: 600, color: '#5B21B6', padding: '5px 12px', borderRadius: 100, background: '#DDD6FE', border: 'none', cursor: 'pointer' }}>
                  See all →
                </button>
              </Link>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No tasks found. Check back later!</p>
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  style={{
                    background: '#fff', border: '1px solid #E8E6E0', borderRadius: 16,
                    padding: '18px 20px', marginBottom: 12, cursor: 'pointer',
                    transition: 'all 0.18s', position: 'relative', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column', gap: 10,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)'; e.currentTarget.style.borderColor = '#ccc'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E8E6E0'; }}
                >
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: ACCENT_COLORS[index % ACCENT_COLORS.length] }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#1A1A2E', lineHeight: 1.3 }}>{task.title}</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#1A1A2E', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 400, color: '#6B6B85' }}>₹</span>{task.price}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>{task.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {getCategorySkills(task.category).map(s => (
                      <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#DDD6FE', color: '#5B21B6' }}>{s}</span>
                    ))}
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#FED7AA', color: '#C2410C' }}>📁 {task.category || 'General'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#4B5563', fontWeight: 500 }}>
                      <Avatar initials={task.poster_name?.charAt(0) || '?'} bg={ACCENT_COLORS[index % ACCENT_COLORS.length]} size={22} />
                      <span>Posted by {task.poster_name || 'Anonymous'}</span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/tasks/${task.id}`); }}
                      style={{ background: '#1A1A2E', color: '#fff', border: 'none', borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Wallet strip */}
            <div style={{
              background: '#1A1A2E', borderRadius: 16, padding: '18px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500, marginBottom: 4 }}>Wallet Balance</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: '#FFD93D' }}>
                  ₹{parseFloat(user?.wallet_balance || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <Link to="/wallet" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'rgba(255,217,61,0.15)', color: '#FFD93D',
                  border: '1px solid rgba(255,217,61,0.25)', borderRadius: 100,
                  padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>
                  Withdraw →
                </button>
              </Link>
            </div>

            {/* Announcement — TODO: GET /api/announcements?active=true */}
            <div style={{ background: '#fff', border: '1px solid #E8E6E0', borderRadius: 18, padding: 18 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A2E', marginBottom: 12 }}>Announcement</div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(108,92,231,0.07), rgba(255,110,180,0.05))',
                border: '1px solid rgba(108,92,231,0.15)', borderRadius: 14, padding: '14px 16px',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(108,92,231,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📣</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A2E', marginBottom: 4 }}>Hackathon Season is here!</div>
                  <div style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.5 }}>Browse 40+ new tasks posted by student teams needing help this week.</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: '#fff', border: '1px solid #E8E6E0', borderRadius: 18, padding: 18 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A2E', marginBottom: 14 }}>Quick Actions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Post Task', sub: 'Hire someone', icon: <FileText size={16} />, iconBg: 'rgba(255,107,53,0.1)',   iconColor: '#FF6B35', to: '/tasks/post' },
                  { label: 'Browse',    sub: 'Find work',   icon: <Search size={16} />,   iconBg: 'rgba(108,92,231,0.1)',   iconColor: '#6C5CE7', to: '/search'     },
                  { label: 'Messages',  sub: '2 unread',    icon: <Zap size={16} />,       iconBg: 'rgba(0,200,151,0.1)',    iconColor: '#00C897', to: '/messages'   },
                  { label: 'Profile',   sub: 'Edit info',   icon: <CreditCard size={16} />,iconBg: 'rgba(255,217,61,0.15)', iconColor: '#b89a00', to: '/profile'    },
                ].map(({ label, sub, icon, iconBg, iconColor, to }) => (
                  <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                    <div
                      style={{ background: '#fff', border: '1px solid #E8E6E0', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: 6 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#bbb'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E6E0'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: '#1A1A2E' }}>{label}</div>
                      <div style={{ fontSize: 11, color: '#6B6B85' }}>{sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Active Orders */}
            <div style={{ background: '#fff', border: '1px solid #E8E6E0', borderRadius: 18, padding: 18 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A2E', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C897' }} />
                  Active Orders
                </span>
                <Link to="/orders" style={{ textDecoration: 'none' }}>
                  <button style={{ fontSize: 11, fontWeight: 600, color: '#5B21B6', padding: '3px 10px', borderRadius: 100, background: '#DDD6FE', border: 'none', cursor: 'pointer' }}>
                    View all
                  </button>
                </Link>
              </div>
              {activeOrders.length === 0 ? (
                <p style={{ fontSize: 12, color: '#6B6B85', textAlign: 'center', padding: '20px 0' }}>
                  No active orders yet.
                </p>
              ) : (
                activeOrders.map(order => (
                  <Link
                    key={order.order_id || order.id}
                    to={`/orders/${order.order_id || order.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #E8E6E0',
                        borderRadius: 14,
                        padding: '14px 16px',
                        marginBottom: 10,
                        cursor: 'pointer',
                        transition: 'all 0.18s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#ccc';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#E8E6E0';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>{order.title}</div>
                        <StatusBadge status={order.order_status || order.status} />
                      </div>

                      <div style={{ fontSize: 11 }}>
                        Working for {order.client_name || 'Client'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>₹{order.agreed_price || order.price}</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}