import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);
  const at = (p) => location.pathname === p ? 'active' : '';

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  const dashPath = user?.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-logo">
          <span>🎓</span>
        </div>
        <div className="brand-text">
          <span className="brand-name">IDTP</span>
          <span className="brand-tagline">Digital Teaching Platform</span>
        </div>
      </Link>

      <div className="nav-spacer" />

      <ul className="nav-links">
        <li><Link to="/"        className={`nav-link ${at('/')}`}>Home</Link></li>
        <li><Link to="/courses" className={`nav-link ${at('/courses')}`}>Courses</Link></li>
        {user && (
          <li><Link to={dashPath} className={`nav-link ${at(dashPath)}`}>Dashboard</Link></li>
        )}
        {user?.role === 'student' && (
          <li><Link to="/my-courses" className={`nav-link ${at('/my-courses')}`}>My Learning</Link></li>
        )}
      </ul>

      <div className="nav-actions">
        {!user ? (
          <>
            <Link to="/login"    className="nav-btn-ghost">Sign In</Link>
            <Link to="/register" className="nav-btn-solid">Get Started</Link>
          </>
        ) : (
          <div className="nav-user-menu">
            <button className="nav-avatar-btn" onClick={() => setOpen(!open)}>
              <div className="nav-avatar">{initials}</div>
              <div className="nav-user-info">
                <span className="nav-user-name">{user.name}</span>
                <span className="nav-user-role">{user.role}</span>
              </div>
              <span className="nav-chevron">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
              <div className="nav-dropdown">
                <div className="nav-dd-header">
                  <div className="nav-dd-avatar">{initials}</div>
                  <div>
                    <div className="nav-dd-name">{user.name}</div>
                    <div className="nav-dd-email">{user.email}</div>
                  </div>
                </div>
                <div className="nav-dd-divider" />
                <Link to={dashPath} className="nav-dd-item" onClick={() => setOpen(false)}>
                  🏠 Dashboard
                </Link>
                {user.role === 'student' && (
                  <Link to="/my-courses" className="nav-dd-item" onClick={() => setOpen(false)}>
                    📖 My Courses
                  </Link>
                )}
                <div className="nav-dd-divider" />
                <button className="nav-dd-logout" onClick={handleLogout}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
