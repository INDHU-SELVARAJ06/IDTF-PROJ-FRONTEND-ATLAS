import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentLogin() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      if (data.role !== 'student') {
        setError('This portal is for Students only. Please use the Teacher login portal.');
        setLoading(false);
        return;
      }
      login({ _id: data._id, name: data.name, email: data.email, role: data.role, rollNumber: data.rollNumber }, data.token);
      navigate('/student-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page student-auth">
      <div className="auth-left" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' }}>
        <div className="auth-left-content">
          <div className="auth-brand">🎓 IDTP Student Portal</div>
          <h2>Step Into Your Future</h2>
          <p>Sign in to access your dashboard, seamlessly enroll in courses, and take quizzes.</p>
          <div className="auth-features">
            <div className="auth-feat">✅ Browse all teacher's courses easily</div>
            <div className="auth-feat">✅ Track your own progress and grades</div>
            <div className="auth-feat">✅ Test yourself with AI-rated quizzes</div>
            <div className="auth-feat">✅ Complete control to enroll/unenroll</div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Student Sign In</h1>
            <p>Ready to learn? Log in below.</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">✉️</span>
                <input name="email" type="email" placeholder="student@example.com"
                  value={form.email} onChange={onChange} required autoFocus />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input name="password" type="password" placeholder="Your password"
                  value={form.password} onChange={onChange} required />
              </div>
            </div>
            <button type="submit" className="btn-auth" disabled={loading} style={{ background: '#0ea5e9' }}>
              {loading ? <><span className="btn-spinner"/> Signing in...</> : '🎓 Sign In as Student'}
            </button>
          </form>

          <div className="auth-switch">
             <Link to="/login/teacher" style={{ color: '#0ea5e9' }}>Wait, I am a Teacher →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
