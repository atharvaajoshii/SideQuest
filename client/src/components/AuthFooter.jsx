import { Link } from 'react-router-dom';

export default function AuthFooter() {
  return (
    <footer style={{
      background: '#1A1A2E',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '36px 24px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 20,
          color: '#FFD93D',
          marginBottom: 6,
        }}>
          SideQuest<span style={{ color: '#fff' }}>.</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
          Built for students, by students.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
          <Link to="/about" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >About</Link>
          <Link to="/contact" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >Contact</Link>
          <Link to="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >Terms of Service</Link>
          <Link to="/support" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >Support</Link>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>© 2026 SideQuest. All rights reserved.</p>
      </div>
    </footer>
  );
}
