import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCourse, getTeacherCourses, deleteCourse, getTeacherStats, getAllStudents, getTeacherInsights } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#6366f1','#22d3ee','#f59e0b','#f43f5e','#10b981'];
const LEVELS = ['Beginner','Intermediate','Advanced'];

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses,   setCourses]   = useState([]);
  const [stats,     setStats]     = useState({ totalCourses:0, totalStudents:0 });
  const [students,  setStudents]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [creating,  setCreating]  = useState(false);
  const [form,      setForm]      = useState({ title:'', description:'', category:'Programming', level:'Beginner' });
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [cRes, sRes, stRes, aiRes] = await Promise.all([
        getTeacherCourses(),
        getTeacherStats(),
        getAllStudents(),
        getTeacherInsights().catch(() => ({ data: null }))
      ]);
      setCourses(cRes.data);
      setStats(sRes.data);
      setStudents(stRes.data);
      if (aiRes?.data) setAiInsights(aiRes.data);
    } catch { setError('Failed to load dashboard'); }
    finally { setLoading(false); setAiLoading(false); }
  };

  const onSubmit = async e => {
    e.preventDefault(); setCreating(true); setError(''); setSuccess('');
    try {
      const { data } = await createCourse(form);
      setCourses([data.course, ...courses]);
      setStats(s => ({ ...s, totalCourses: s.totalCourses + 1 }));
      setForm({ title:'', description:'', category:'Programming', level:'Beginner' });
      setShowForm(false);
      setSuccess('Course published successfully!');
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setCreating(false); }
  };

  const onDelete = async id => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await deleteCourse(id);
      setCourses(courses.filter(c => c._id !== id));
      setSuccess('Course deleted.');
    } catch { setError('Failed to delete'); }
  };

  const enrollmentData = courses.slice(0,6).map(c => ({
    name: c.title.length > 14 ? c.title.slice(0,14)+'...' : c.title,
    students: c.enrollmentCount || 0,
  }));

  const levelData = LEVELS.map(l => ({
    name: l, value: courses.filter(c => c.level === l).length
  })).filter(d => d.value > 0);

  const statCards = [
    { icon:'📚', label:'My Courses',     value: stats.totalCourses,  color:'indigo' },
    { icon:'👥', label:'Total Students', value: stats.totalStudents, color:'cyan'   },
    { icon:'🎓', label:'Unique Students',value: students.length,     color:'amber'  },
    { icon:'🏆', label:'Active Now',     value: courses.length,      color:'emerald'},
  ];

  return (
    <div className="dash-layout">
      <aside className="sidebar">
        <div className="sb-logo">
          <span className="sb-logo-icon">🎓</span>
          <span className="sb-logo-text">IDTP</span>
        </div>
        <nav className="sb-nav">
          <div className="sb-section-label">MAIN</div>
          <div className="sb-item active"><span>🏠</span><span>Dashboard</span></div>
          <Link to="/teacher/students" className="sb-item">
            <span>👥</span><span>All Students</span>
            {students.length > 0 && <span className="sb-badge">{students.length}</span>}
          </Link>
          <Link to="/courses" className="sb-item"><span>📚</span><span>Browse Courses</span></Link>
          <div className="sb-section-label">ACCOUNT</div>
          <div className="sb-item sb-user">
            <div className="sb-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="sb-user-name">{user?.name}</div>
              <div className="sb-user-role">Teacher</div>
            </div>
          </div>
          <div className="sb-item sb-logout" onClick={logout}><span>🚪</span><span>Sign Out</span></div>
        </nav>
      </aside>

      <main className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-title">Teacher Dashboard</h1>
            <p className="dash-subtitle">Welcome back, <strong>{user?.name}</strong> 👋</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-ghost" onClick={() => navigate('/teacher/students')}>
              👥 View All Students
            </button>
            <button className="btn-create" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ New Course'}
            </button>
          </div>
        </div>

        {error   && <div className="alert alert-error"><span>⚠️</span>{error}<button onClick={()=>setError('')}>✕</button></div>}
        {success && <div className="alert alert-success"><span>✅</span>{success}<button onClick={()=>setSuccess('')}>✕</button></div>}

        {/* Stat Cards */}
        <div className="stats-grid">
          {statCards.map((s,i) => (
            <div className={`stat-card stat-${s.color}`} key={i}
              style={{ cursor: s.label==='Unique Students'?'pointer':'default' }}
              onClick={() => s.label==='Unique Students' && navigate('/teacher/students')}>
              <div className="stat-icon-wrap">{s.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{loading ? '—' : s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
              <div className="stat-decoration"/>
            </div>
          ))}
        </div>

        {/* AI Insights Section */}
        {!aiLoading && aiInsights && aiInsights.suggestions?.length > 0 && (
          <div className="ai-insights-panel" style={{ marginTop: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: '12px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🧠</span>
              <h2 style={{ margin: 0, color: '#e0e7ff', fontSize: '1.3rem' }}>AI Curriculum Assistant</h2>
              <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>Model: Active</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {aiInsights.suggestions.map((s, idx) => (
                <div key={idx} style={{ flex: '1 1 300px', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${s.priority === 'HIGH' ? '#f43f5e' : s.priority === 'MEDIUM' ? '#f59e0b' : '#10b981'}` }}>
                  <div style={{ fontSize: '0.8rem', color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                    {s.type} • {s.priority} PRIORITY
                  </div>
                  <div style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                    {s.suggestion}
                  </div>
                </div>
              ))}
            </div>

            {aiInsights.averagePredictedNextScore > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', color: '#a5b4fc' }}>
                <strong>AI Aggregate Prediction:</strong> Based on historical trend analysis, the average next quiz score will be ~{aiInsights.averagePredictedNextScore}%.
              </div>
            )}
          </div>
        )}

        {/* Charts */}
        {courses.length > 0 && (
          <div className="charts-row">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Student Enrollment per Course</h3>
                <span className="chart-badge">Bar Chart</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={enrollmentData} margin={{top:5,right:10,left:-20,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="name" tick={{fontSize:11}}/>
                  <YAxis tick={{fontSize:11}}/>
                  <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                  <Bar dataKey="students" fill="#6366f1" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <div className="chart-header">
                <h3>Courses by Level</h3>
                <span className="chart-badge">Pie Chart</span>
              </div>
              {levelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={levelData} cx="50%" cy="50%" outerRadius={80}
                      dataKey="value" label={({name,value})=>`${name}: ${value}`}>
                      {levelData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie>
                    <Tooltip/>
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="chart-empty">No data yet</div>}
            </div>
          </div>
        )}

        {/* Create Course Form */}
        {showForm && (
          <div className="create-panel">
            <h2>📝 Publish New Course</h2>
            <form onSubmit={onSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Course Title *</label>
                  <input value={form.title}
                    onChange={e => setForm({...form, title:e.target.value})}
                    placeholder="e.g. Introduction to Python" required/>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                    {['Programming','Mathematics','Science','Language','Design','Business','Other'].map(c=>(
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={form.description}
                  onChange={e => setForm({...form, description:e.target.value})}
                  placeholder="What will students learn?" required rows={3}/>
              </div>
              <div className="form-group">
                <label>Level</label>
                <div className="level-selector">
                  {LEVELS.map(l => (
                    <button key={l} type="button"
                      className={`level-btn ${form.level===l?'active':''}`}
                      onClick={() => setForm({...form, level:l})}>{l}</button>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',gap:12}}>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Publishing...' : '🚀 Publish Course'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Students Preview */}
        {students.length > 0 && (
          <div style={{marginBottom:'2rem'}}>
            <div className="section-header">
              <h2>Recent Students</h2>
              <button className="section-link btn-link" onClick={()=>navigate('/teacher/students')}>
                View All {students.length} Students →
              </button>
            </div>
            <div className="students-preview-grid">
              {students.slice(0,4).map((s,i)=>(
                <div className="student-preview-card" key={s.student._id}
                  onClick={()=>navigate(`/teacher/student/${s.student._id}`)}>
                  <div className="spc-avatar" style={{background:COLORS[i%COLORS.length]}}>
                    {s.student.name[0].toUpperCase()}
                  </div>
                  <div className="spc-info">
                    <div className="spc-name">{s.student.name}</div>
                    <div className="spc-meta">{s.totalEnrollments} course{s.totalEnrollments!==1?'s':''}</div>
                  </div>
                  <span className="spc-arrow">→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses Grid */}
        <div className="section-header">
          <h2>Your Courses</h2>
          <span className="section-badge">{courses.length} published</span>
        </div>

        {loading ? (
          <div className="loading-grid">{[1,2,3].map(i=><div key={i} className="skeleton-card"/>)}</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No courses yet</h3>
            <p>Click "New Course" to publish your first course!</p>
            <button className="btn btn-primary" onClick={()=>setShowForm(true)}>+ Create First Course</button>
          </div>
        ) : (
          <div className="course-grid">
            {courses.map((c,i)=>(
              <div className="course-card-new" key={c._id}>
                <div className="ccn-top" style={{background:`linear-gradient(135deg,${COLORS[i%COLORS.length]}22,${COLORS[(i+1)%COLORS.length]}22)`}}>
                  <span className="ccn-category">{c.category||'General'}</span>
                  <span className="ccn-level">{c.level||'Beginner'}</span>
                </div>
                <div className="ccn-body">
                  <h3 className="ccn-title">{c.title}</h3>
                  <p className="ccn-desc">{c.description}</p>
                  <div className="ccn-stats">
                    <span className="ccn-stat">👥 {c.enrollmentCount||0} students</span>
                    <span className="ccn-stat">📅 {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="ccn-foot">
                  <button className="btn btn-primary btn-sm" onClick={()=>navigate(`/teacher/course/${c._id}`)}>
                    ⚙️ Manage
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={()=>onDelete(c._id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
