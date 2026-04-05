import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TeacherLogin() {
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
      if (data.role !== 'teacher') {
        setError('This portal is for Teachers only. Please use the Student login portal.');
        setLoading(false);
        return;
      }
      login({ _id: data._id, name: data.name, email: data.email, role: data.role, rollNumber: data.rollNumber }, data.token);
      navigate('/teacher-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page teacher-auth">
      <div className="auth-left" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' }}>
        <div className="auth-left-content">
          <div className="auth-brand">🎓 IDTP Teacher Portal</div>
          <h2>Empower the Next Generation</h2>
          <p>Sign in to manage your courses, view AI-driven insights, and track student performance.</p>
          <div className="auth-features">
            <div className="auth-feat">✅ Create and publish courses instantly</div>
            <div className="auth-feat">✅ Manage AI-driven quiz evaluations</div>
            <div className="auth-feat">✅ Track student progress seamlessly</div>
            <div className="auth-feat">✅ View intelligent content suggestions</div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Teacher Sign In</h1>
            <p>Welcome back, Educator. Enter your credentials.</p>
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
                <input name="email" type="email" placeholder="teacher@example.com"
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
            <button type="submit" className="btn-auth" disabled={loading} style={{ background: '#4f46e5' }}>
              {loading ? <><span className="btn-spinner"/> Signing in...</> : '👨‍🏫 Sign In as Teacher'}
            </button>
          </form>

          <div className="auth-switch">
             <Link to="/login/student" style={{ color: '#6366f1' }}>Wait, I am a Student →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
