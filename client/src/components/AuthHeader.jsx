import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function AuthHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
      <header style={{
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
        <Link to="/" style={{ textDecoration: 'none' }}>
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            to="/"
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 100,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FFD93D'; e.currentTarget.style.background = 'rgba(255,217,61,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
          >
            Home
          </Link>
          <Link
            to="/about"
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 100,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FFD93D'; e.currentTarget.style.background = 'rgba(255,217,61,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
          >
            About
          </Link>
          <Link
            to="/contact"
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 100,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FFD93D'; e.currentTarget.style.background = 'rgba(255,217,61,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
          >
            Contact
          </Link>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
          <Link
            to="/signin"
            style={{
              color: '#FFD93D',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 100,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,217,61,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            style={{ textDecoration: 'none' }}
          >
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
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#e6c235'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFD93D'}
            >
              Get Started
            </button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 border-t border-white/10" style={{ background: '#1A1A2E' }}>
          <nav className="flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#FFD93D'; e.currentTarget.style.background = 'rgba(255,217,61,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#FFD93D'; e.currentTarget.style.background = 'rgba(255,217,61,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#FFD93D'; e.currentTarget.style.background = 'rgba(255,217,61,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
            >
              Contact
            </Link>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
            <Link
              to="/signin"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: '#FFD93D',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,217,61,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              style={{ textDecoration: 'none' }}
            >
              <button style={{
                width: '100%',
                background: '#FFD93D',
                color: '#1A1A2E',
                border: 'none',
                borderRadius: 100,
                padding: '12px 16px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#e6c235'}
                onMouseLeave={e => e.currentTarget.style.background = '#FFD93D'}
              >
                Get Started
              </button>
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
