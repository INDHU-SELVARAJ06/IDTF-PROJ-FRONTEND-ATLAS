import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyCourses, unenrollFromCourse } from '../services/api';

const COLORS = ['#6366f1','#22d3ee','#f59e0b','#f43f5e','#10b981'];

export default function MyCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try { const { data } = await getMyCourses(); setCourses(data); }
    catch { setError('Failed to load your courses'); }
    finally { setLoading(false); }
  };

  const handleUnenroll = async id => {
    if (!window.confirm('Unenroll from this course?')) return;
    try {
      await unenrollFromCourse(id);
      setCourses(courses.filter(c => c._id !== id));
      setSuccess('Unenrolled successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to unenroll'); }
  };

  return (
    <div className="page-wrap">
      <div className="page-hero">
        <h1>📖 My Learning</h1>
        <p>Welcome back, {user?.name}! You are enrolled in {courses.length} course{courses.length !== 1 ? 's' : ''}.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom:'2rem' }}>
        <div className="stat-card stat-indigo">
          <div className="stat-icon-wrap">📖</div>
          <div className="stat-content">
            <div className="stat-value">{courses.length}</div>
            <div className="stat-label">Enrolled Courses</div>
          </div>
        </div>
        <div className="stat-card stat-cyan">
          <div className="stat-icon-wrap">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{user?.rollNumber || 'N/A'}</div>
            <div className="stat-label">Roll Number</div>
          </div>
        </div>
      </div>

      {error   && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {loading ? (
        <div className="loading-grid">
          {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No enrolled courses yet</h3>
          <p>Browse and enroll in courses to start learning!</p>
          <button className="btn btn-primary" onClick={() => navigate('/courses')}>
            Browse Courses →
          </button>
        </div>
      ) : (
        <div className="my-courses-list">
          {courses.map((c, i) => (
            <div className="my-course-card" key={c._id}>
              <div className="mcc-accent" style={{ background: COLORS[i % COLORS.length] }} />
              <div className="mcc-body">
                <div className="mcc-top">
                  <div>
                    <h3 className="mcc-title">{c.title}</h3>
                    <div className="mcc-teacher">👨‍🏫 {c.teacher?.name}</div>
                  </div>
                  <div className="mcc-badges">
                    <span className="badge badge-blue">{c.level || 'Beginner'}</span>
                    <span className="badge badge-purple">{c.category || 'General'}</span>
                    <span className="enrolled-badge">✅ Enrolled</span>
                  </div>
                </div>
                <p className="mcc-desc">{c.description}</p>
                <div className="mcc-meta">
                  <span>📅 Enrolled: {new Date(c.enrolledAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mcc-actions">
                <button className="btn btn-primary"
                  onClick={() => navigate(`/course/${c._id}`)}>
                  📖 Open Course
                </button>
                <button className="btn btn-danger btn-sm"
                  onClick={() => handleUnenroll(c._id)}>
                  Unenroll
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
