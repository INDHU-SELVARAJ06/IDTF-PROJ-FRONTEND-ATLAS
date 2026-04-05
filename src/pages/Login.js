import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
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
      login({ _id: data._id, name: data.name, email: data.email, role: data.role, rollNumber: data.rollNumber }, data.token);
      navigate(data.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">🎓 IDTP</div>
          <h2>Welcome back to the future of learning</h2>
          <p>Sign in to access your personalized dashboard, courses and learning materials.</p>
          <div className="auth-features">
            <div className="auth-feat">✅ Role-based dashboards</div>
            <div className="auth-feat">✅ Quiz & assessment system</div>
            <div className="auth-feat">✅ Real-time progress tracking</div>
            <div className="auth-feat">✅ Adaptive learning recommendations</div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Sign In</h1>
            <p>Enter your credentials to continue</p>
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
                <input name="email" type="email" placeholder="you@example.com"
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
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <><span className="btn-spinner"/> Signing in...</> : '🔐 Sign In'}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account? <Link to="/register">Create one free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
