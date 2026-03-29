import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle, Search, FileText, Zap,
  CreditCard, TrendingUp, Star,
} from 'lucide-react';

// ─── MOCK DATA (replace with real API calls) ────────────────────────────────

const MOCK_USER = {
  name: 'Arjun',
  initials: 'AK',
  balance: 1340,
  earned: 4820,
  completed: 17,
};

const MOCK_TASKS = [
  {
    id: 1,
    title: 'Design a landing page for our student startup',
    description: 'Need a clean, modern landing page in Figma. Include hero, features, pricing, and CTA sections. Brand assets provided.',
    budget: 1200,
    deadline: '3 days',
    applicants: 4,
    skills: ['Figma', 'UI/UX'],
    poster: { name: 'Riya S.', initials: 'RS', postedAt: '2h ago' },
    accent: '#FF6B35',
  },
  {
    id: 2,
    title: 'Build a REST API for a notes app (Node + Express)',
    description: 'Need CRUD endpoints for notes with JWT auth. PostgreSQL DB. Clean code with comments. Should take 1–2 days max.',
    budget: 800,
    deadline: '2 days',
    applicants: 7,
    skills: ['Node.js', 'PostgreSQL'],
    poster: { name: 'Mihail K.', initials: 'MK', postedAt: '5h ago' },
    accent: '#6C5CE7',
  },
  {
    id: 3,
    title: 'Write 5 blog posts on productivity for students',
    description: 'SEO-friendly articles, 800–1000 words each. Topics provided. Looking for clear, engaging writing with good grammar.',
    budget: 600,
    deadline: '5 days',
    applicants: 2,
    skills: ['Writing', 'SEO'],
    poster: { name: 'Ananya P.', initials: 'AP', postedAt: '1d ago' },
    accent: '#00C897',
  },
  {
    id: 4,
    title: 'Edit a 10-min YouTube video with captions & B-roll',
    description: 'Footage provided (raw MP4). Need color grading, captions, transitions, and background music. Premiere or DaVinci ok.',
    budget: 950,
    deadline: '4 days',
    applicants: 1,
    skills: ['Video Edit', 'Premiere'],
    poster: { name: 'Vihaan T.', initials: 'VT', postedAt: '3h ago' },
    accent: '#FF6EB4',
  },
];

const MOCK_ORDERS = [
  { id: 1, title: 'Logo design for Hackathon',  role: 'freelancer', status: 'active',  progress: 60, dueIn: '2d',  amount: 700 },
  { id: 2, title: 'Python data scraper script', role: 'client',     status: 'review',  progress: 90, dueIn: null,  amount: 500 },
  { id: 3, title: 'Resume review & formatting', role: 'freelancer', status: 'pending', progress: 10, dueIn: '5d',  amount: 300 },
];

const FILTERS = ['All', 'Design', 'Dev', 'Writing', 'Video', 'Research', 'Marketing'];

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
  const navigate = useNavigate();

  // TODO: Replace MOCK_USER with → const { user } = useAuth()  from AuthContext
  const user = MOCK_USER;

  const filteredTasks = MOCK_TASKS.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
    // TODO: add → && (activeFilter === 'All' || task.category === activeFilter)
  );

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
              Good morning, {user.name}
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
              { label: 'Total Earned',    value: `₹${user.earned.toLocaleString('en-IN')}`, change: '+₹640 this week', icon: <TrendingUp size={14} /> },
              { label: 'Tasks Completed', value: user.completed,                             change: '3 this month',   icon: <Star size={14} /> },
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
              {FILTERS.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  fontSize: 13, fontWeight: 500, padding: '6px 16px', borderRadius: 100, cursor: 'pointer',
                  border: '1px solid', transition: 'all 0.15s',
                  borderColor: activeFilter === f ? '#1A1A2E' : '#E8E6E0',
                  background:  activeFilter === f ? '#1A1A2E' : '#fff',
                  color:       activeFilter === f ? '#FFD93D' : '#6B6B85',
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
              <Link to="/search" style={{ textDecoration: 'none' }}>
                <button style={{ fontSize: 13, fontWeight: 500, color: '#6C5CE7', padding: '5px 12px', borderRadius: 100, background: 'rgba(108,92,231,0.08)', border: 'none', cursor: 'pointer' }}>
                  See all →
                </button>
              </Link>
            </div>

            {/* TODO: replace MOCK_TASKS with GET /api/tasks?recommended=true */}
            {filteredTasks.map(task => (
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
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: task.accent }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#1A1A2E', lineHeight: 1.3 }}>{task.title}</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#1A1A2E', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 400, color: '#6B6B85' }}>₹</span>{task.budget.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#6B6B85', lineHeight: 1.5 }}>{task.description}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {task.skills.map(s => (
                    <span key={s} style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100, background: 'rgba(108,92,231,0.09)', color: '#5a4bc4' }}>{s}</span>
                  ))}
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100, background: 'rgba(255,107,53,0.09)', color: '#c95520' }}>⏱ {task.deadline}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100, background: 'rgba(0,200,151,0.09)', color: '#008a66' }}>🙋 {task.applicants} applicants</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #F0EEE8' }}>
                  <a href={`/freelancer/${task.poster.id || 1}`} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#6B6B85', textDecoration: 'none' }} className="hover:text-primary transition">
                    <Avatar initials={task.poster.initials} bg={task.accent} size={22} />
                    <span className="hover:underline">Posted by {task.poster.name}</span> · {task.poster.postedAt}
                  </a>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/tasks/${task.id}`); }}
                    style={{ background: '#1A1A2E', color: '#fff', border: 'none', borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
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
                {/* TODO: swap user.balance → parseFloat(user?.wallet_balance || 0) from AuthContext */}
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: '#FFD93D' }}>
                  ₹{user.balance.toLocaleString('en-IN')}
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
                  <button style={{ fontSize: 11, fontWeight: 500, color: '#6C5CE7', padding: '3px 10px', borderRadius: 100, background: 'rgba(108,92,231,0.08)', border: 'none', cursor: 'pointer' }}>
                    View all
                  </button>
                </Link>
              </div>
              {/* TODO: replace MOCK_ORDERS with GET /api/orders?status=active */}
              {MOCK_ORDERS.map(order => (
                <Link key={order.id} to={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{ background: '#fff', border: '1px solid #E8E6E0', borderRadius: 14, padding: '14px 16px', marginBottom: 10, cursor: 'pointer', transition: 'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E6E0'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: '#1A1A2E', lineHeight: 1.3 }}>{order.title}</div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div style={{ fontSize: 11, color: '#6B6B85', marginBottom: 2 }}>
                      {order.role === 'freelancer' ? "You're the freelancer" : 'You posted this task'}
                    </div>
                    <ProgressBar
                      value={order.progress}
                      color={order.status === 'review' ? '#FF6B35' : order.status === 'pending' ? '#6C5CE7' : '#00C897'}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B6B85' }}>
                      <span>{order.status === 'review' ? 'Awaiting approval' : `${order.progress}% done`}</span>
                      <span>{order.dueIn ? `Due in ${order.dueIn}` : `₹${order.amount}`}</span>
                    </div>
                  </div>
                </Link>
              ))}
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
                  <div style={{ fontSize: 12, color: '#6B6B85', lineHeight: 1.5 }}>Browse 40+ new tasks posted by student teams needing help this week.</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}