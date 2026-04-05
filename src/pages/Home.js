import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '👨‍🏫', title: 'Smart Teaching',    desc: 'Create courses, upload materials, build quizzes — all in one place.' },
  { icon: '📊', title: 'Live Analytics',    desc: 'Track every student\'s performance with real-time charts and grades.' },
  { icon: '🧠', title: 'Intelligent App', desc: 'AI-assisted recommendations and quiz scoring based on machine learning.' },
  { icon: '🔐', title: 'Secure Platform',   desc: 'JWT authentication with role-based access control.' },
  { icon: '📱', title: 'Any Device',        desc: 'Responsive design works perfectly on desktop, tablet and mobile.' },
  { icon: '⚡', title: 'Real-time Updates', desc: 'Instant feedback on quiz results and enrollment status.' },
];

const stats = [
  { num: '10+', label: 'Courses Available' },
  { num: '100%', label: 'Free Platform' },
  { num: 'A-F', label: 'Grade System' },
  { num: '24/7', label: 'Access Anytime' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-orb orb1" />
        <div className="hero-bg-orb orb2" />
        <div className="hero-bg-orb orb3" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            Intelligent Digital Teaching Platform
          </div>
          <h1 className="hero-title">
            Learn Smarter.<br />
            <span className="hero-gradient">Teach Better.</span>
          </h1>
          <p className="hero-subtitle">
            A powerful full-stack LMS connecting teachers and students. 
            Upload materials, create quizzes, track progress — all in one beautiful platform.
          </p>
          <div className="hero-cta">
            {!user ? (
              <>
                <Link to="/register" className="cta-primary">🚀 Start for Free</Link>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link to="/login/student" className="cta-secondary">Student Login</Link>
                  <Link to="/login/teacher" className="cta-secondary">Teacher Login</Link>
                </div>
              </>
            ) : (
              <>
                <button className="cta-primary"
                  onClick={() => navigate(user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard')}>
                  Go to Dashboard →
                </button>
                <Link to="/courses" className="cta-secondary">Browse Courses</Link>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="hero-stats">
            {stats.map((s, i) => (
              <div className="hero-stat" key={i}>
                <div className="hero-stat-num">{s.num}</div>
                <div className="hero-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-label">WHY IDTP?</div>
        <h2 className="section-title">Everything you need to teach & learn</h2>
        <p className="section-sub">Built with modern technology for the modern classroom</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="section-label">HOW IT WORKS</div>
        <h2 className="section-title">Simple 3-step process</h2>
        <div className="steps-row">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3>Register & Choose Role</h3>
            <p>Sign up as a Teacher or Student and get instant access to your dashboard.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3>Create or Enroll</h3>
            <p>Teachers create courses and upload materials. Students browse and enroll.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3>Learn & Grow</h3>
            <p>Students attempt quizzes and get grades. Teachers view analytics and adapt.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-box">
          <h2>Ready to transform learning?</h2>
          <p>Join IDTP today and experience the future of digital education.</p>
          <div className="hero-cta">
            <Link to="/register" className="cta-primary">Create Free Account</Link>
            <Link to="/courses"  className="cta-secondary">Browse Courses →</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-brand">🎓 IDTP</div>
        <p>Intelligent Digital Teaching Platform — Built with MERN Stack</p>
        <p style={{color:'var(--muted)', fontSize:'0.78rem', marginTop:4}}>React • Node.js • Express • MongoDB</p>
      </footer>
    </div>
  );
}
