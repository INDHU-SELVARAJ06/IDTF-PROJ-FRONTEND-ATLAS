import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStudents } from '../services/api';

const COLORS = ['#6366f1','#22d3ee','#f59e0b','#f43f5e','#10b981','#8b5cf6','#ec4899'];

export default function AllStudents() {
  const navigate  = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('All');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await getAllStudents();
      setStudents(data);
    } catch { setError('Failed to load students'); }
    finally { setLoading(false); }
  };

  const allCourses = [...new Set(students.flatMap(s => s.enrolledCourses.map(c => c.title)))];
  const filterOptions = ['All', ...allCourses.slice(0, 6)];

  const filtered = students.filter(s => {
    const matchSearch =
      s.student.name.toLowerCase().includes(search.toLowerCase()) ||
      s.student.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.student.rollNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' ||
      s.enrolledCourses.some(c => c.title === filter);
    return matchSearch && matchFilter;
  });

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="page-top-bar">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/teacher-dashboard')}>
          ← Dashboard
        </button>
        <div>
          <h1 className="page-main-title">All Students</h1>
          <p className="page-main-sub">
            {students.length} students enrolled across your courses
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom:'1.5rem' }}>
        <div className="stat-card stat-indigo">
          <div className="stat-icon-wrap">👥</div>
          <div className="stat-content">
            <div className="stat-value">{students.length}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="stat-card stat-cyan">
          <div className="stat-icon-wrap">📚</div>
          <div className="stat-content">
            <div className="stat-value">{students.reduce((a,s)=>a+s.totalEnrollments,0)}</div>
            <div className="stat-label">Total Enrollments</div>
          </div>
        </div>
        <div className="stat-card stat-amber">
          <div className="stat-icon-wrap">🎯</div>
          <div className="stat-content">
            <div className="stat-value">
              {students.length > 0
                ? Math.round(students.reduce((a,s)=>a+s.totalEnrollments,0)/students.length)
                : 0}
            </div>
            <div className="stat-label">Avg Courses / Student</div>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="courses-toolbar" style={{ marginBottom:'1.5rem' }}>
        <div className="search-box">
          <span className="search-ico">🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name, email or roll number..."/>
          {search && <button className="search-clear" onClick={()=>setSearch('')}>✕</button>}
        </div>
        <div className="filter-chips">
          {filterOptions.map(f => (
            <button key={f} className={`chip ${filter===f?'active':''}`}
              onClick={()=>setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="courses-count">Showing {filtered.length} of {students.length} students</div>

      {loading ? (
        <div className="loading-grid">{[1,2,3,4,5,6].map(i=><div key={i} className="skeleton-card"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No students found</h3>
          <p>Try a different search term</p>
        </div>
      ) : (
        <div className="all-students-grid">
          {filtered.map((s, i) => (
            <div className="all-student-card" key={s.student._id}
              onClick={() => navigate(`/teacher/student/${s.student._id}`)}>
              {/* Avatar */}
              <div className="asc-top">
                <div className="asc-avatar" style={{ background: COLORS[i % COLORS.length] }}>
                  {s.student.name[0].toUpperCase()}
                </div>
                <div className="asc-online-dot"/>
              </div>

              {/* Info */}
              <div className="asc-body">
                <h3 className="asc-name">{s.student.name}</h3>
                <div className="asc-email">{s.student.email}</div>
                {s.student.rollNumber && (
                  <div className="asc-roll">🎫 {s.student.rollNumber}</div>
                )}
                <div className="asc-joined">
                  Joined {new Date(s.student.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Enrolled Courses */}
              <div className="asc-courses">
                <div className="asc-courses-label">
                  📚 {s.totalEnrollments} enrolled course{s.totalEnrollments!==1?'s':''}
                </div>
                <div className="asc-course-tags">
                  {s.enrolledCourses.slice(0,3).map((c,j)=>(
                    <span key={j} className="asc-course-tag">{c.title}</span>
                  ))}
                  {s.enrolledCourses.length > 3 && (
                    <span className="asc-course-tag asc-more">
                      +{s.enrolledCourses.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* View Profile Button */}
              <div className="asc-footer">
                <span className="asc-view-btn">View Full Profile →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
