import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student', rollNumber: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill all required fields'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login({ _id: data._id, name: data.name, email: data.email, role: data.role, rollNumber: data.rollNumber }, data.token);
      navigate(data.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">🎓 IDTP</div>
          <h2>Join thousands of learners and educators</h2>
          <p>Create your free account and start your digital learning journey today.</p>
          <div className="auth-features">
            <div className="auth-feat">🎓 Student — Browse & enroll in courses</div>
            <div className="auth-feat">👨‍🏫 Teacher — Create & manage courses</div>
            <div className="auth-feat">📊 Track progress with live analytics</div>
            <div className="auth-feat">🏆 Earn grades with auto-graded quizzes</div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Create Account</h1>
            <p>Fill in your details to get started</p>
          </div>

          {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

          <form onSubmit={onSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrap">
                <span className="input-icon">👤</span>
                <input name="name" type="text" placeholder="John Smith"
                  value={form.name} onChange={onChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">✉️</span>
                <input name="email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={onChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input name="password" type="password" placeholder="Min 6 chars"
                    value={form.password} onChange={onChange} required minLength={6} />
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input name="confirmPassword" type="password" placeholder="Repeat"
                    value={form.confirmPassword} onChange={onChange} required />
                </div>
              </div>
            </div>

            <div className="role-selector">
              <div
                className={`role-option ${form.role === 'student' ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, role: 'student' })}>
                <div className="role-icon">👩‍🎓</div>
                <div className="role-label">Student</div>
                <div className="role-desc">Browse & learn</div>
              </div>
              <div
                className={`role-option ${form.role === 'teacher' ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, role: 'teacher' })}>
                <div className="role-icon">👨‍🏫</div>
                <div className="role-label">Teacher</div>
                <div className="role-desc">Create & teach</div>
              </div>
            </div>

            {form.role === 'student' && (
              <div className="form-group">
                <label>Roll Number <span className="optional">(optional)</span></label>
                <div className="input-wrap">
                  <span className="input-icon">🎫</span>
                  <input name="rollNumber" type="text" placeholder="e.g. CS2024001"
                    value={form.rollNumber} onChange={onChange} />
                </div>
              </div>
            )}

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <><span className="btn-spinner"/> Creating account...</> : '🚀 Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
