import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllCourses, enrollInCourse, getMyCourses } from '../services/api';

const COLORS = ['#6366f1','#22d3ee','#f59e0b','#f43f5e','#10b981'];

export default function Courses() {
  const { user } = useAuth();
  const [courses,     setCourses]     = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('All');
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const r = await getAllCourses(); setCourses(r.data);
      if (user?.role === 'student') {
        const m = await getMyCourses(); setEnrolledIds(m.data.map(c => c._id));
      }
    } catch { setError('Failed to load courses'); }
    finally { setLoading(false); }
  };

  const handleEnroll = async id => {
    setError(''); setSuccess('');
    try {
      await enrollInCourse(id); setEnrolledIds([...enrolledIds, id]);
      setSuccess('Enrolled successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to enroll'); }
  };

  const categories = ['All', ...new Set(courses.map(c => c.category || 'General'))];

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || (c.category || 'General') === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="page-wrap">
      <div className="page-hero">
        <h1>📚 Browse Courses</h1>
        <p>{courses.length} courses available on IDTP</p>
      </div>

      {error   && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* Search + Filter */}
      <div className="courses-toolbar">
        <div className="search-box">
          <span className="search-ico">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..." />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="filter-chips">
          {categories.map(cat => (
            <button key={cat} className={`chip ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="courses-count">
        Showing {filtered.length} of {courses.length} courses
      </div>

      {loading ? (
        <div className="loading-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No courses found</h3>
          <p>Try a different search term or category.</p>
          <button className="btn btn-primary" onClick={() => { setSearch(''); setFilter('All'); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="course-grid">
          {filtered.map((c, i) => (
            <div className="course-card-new" key={c._id}>
              <div className="ccn-top" style={{ background:`linear-gradient(135deg, ${COLORS[i%COLORS.length]}22, ${COLORS[(i+1)%COLORS.length]}22)` }}>
                <span className="ccn-category">{c.category || 'General'}</span>
                <span className="ccn-level">{c.level || 'Beginner'}</span>
              </div>
              <div className="ccn-body">
                <h3 className="ccn-title">{c.title}</h3>
                <p className="ccn-desc">{c.description}</p>
                <div className="ccn-teacher">👨‍🏫 {c.teacher?.name}</div>
                <div className="ccn-stats">
                  <span className="ccn-stat">👥 {c.enrollmentCount || 0} enrolled</span>
                </div>
              </div>
              <div className="ccn-foot">
                {user?.role === 'student' ? (
                  enrolledIds.includes(c._id) ? (
                    <span className="enrolled-badge">✅ Enrolled</span>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(c._id)}>
                      + Enroll
                    </button>
                  )
                ) : (
                  <span className="ccn-stat">📚 Course</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
