import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseMaterials, getCourseQuizzes, getMyProgress, getAllCourses } from '../services/api';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate     = useNavigate();

  const [course,    setCourse]    = useState(null);
  const [materials, setMaterials] = useState([]);
  const [quizzes,   setQuizzes]   = useState([]);
  const [progress,  setProgress]  = useState({ results: [], avgScore: 0 });
  const [tab,       setTab]       = useState('materials');
  const [error,     setError]     = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [cRes, mRes, qRes, pRes] = await Promise.all([
        getAllCourses(),
        getCourseMaterials(courseId),
        getCourseQuizzes(courseId),
        getMyProgress(courseId),
      ]);
      setCourse(cRes.data.find(c => c._id === courseId));
      setMaterials(mRes.data);
      setQuizzes(qRes.data);
      setProgress(pRes.data);
    } catch { setError('Failed to load course'); }
  }, [courseId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const matIcon = (type) => ({ pdf:'📄', video:'🎥', notes:'📝', link:'🔗' }[type] || '📁');

  const radarData = progress.results.map((r, i) => ({
    subject: r.quizTitle?.slice(0, 10) || `Quiz ${i+1}`,
    score: r.percentage,
  }));

  const tabs = [
    { id:'materials', label:'📁 Materials' },
    { id:'quizzes',   label:'📝 Quizzes'   },
    { id:'results',   label:'📊 My Results'},
  ];

  return (
    <div className="page-wrap">
      <div className="detail-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-courses')}>← Back</button>
        <div className="detail-header-info">
          <h1>{course?.title || 'Course'}</h1>
          <p>👨‍🏫 {course?.teacher?.name} · {course?.category} · {course?.level}</p>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Progress summary banner */}
      {progress.results.length > 0 && (
        <div className="progress-banner">
          <div className="pb-item">
            <div className="pb-num">{progress.results.length}</div>
            <div className="pb-lbl">Quizzes Done</div>
          </div>
          <div className="pb-item">
            <div className="pb-num">{progress.avgScore}%</div>
            <div className="pb-lbl">Avg Score</div>
          </div>
          <div className="pb-item">
            <div className="pb-num">{materials.length}</div>
            <div className="pb-lbl">Materials</div>
          </div>
          <div className="pb-chart">
            <ResponsiveContainer width="100%" height={80}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.3)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize:9, fill:'#fff' }} />
                <Radar dataKey="score" stroke="#fff" fill="#fff" fillOpacity={0.3} />
                <Tooltip contentStyle={{ fontSize:11, borderRadius:8 }} formatter={v=>[`${v}%`]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="tabs-bar">
        {tabs.map(t => (
          <button key={t.id} className={`tab-pill ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Materials */}
      {tab === 'materials' && (
        materials.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No materials yet</h3>
            <p>Your teacher will upload materials soon.</p>
          </div>
        ) : (
          <div className="materials-list">
            {materials.map(m => (
              <div className="material-row" key={m._id}>
                <div className="mat-type-badge">{matIcon(m.type)}</div>
                <div className="mat-info">
                  <div className="mat-title">{m.title}</div>
                  <div className="mat-type-label">{m.type.toUpperCase()}</div>
                  {m.description && <div className="mat-desc">{m.description}</div>}
                  {m.type === 'notes'
                    ? <div className="mat-notes-full">{m.content}</div>
                    : <a href={m.content} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ marginTop:8, display:'inline-flex' }}>
                        Open {m.type} ↗
                      </a>
                  }
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Quizzes */}
      {tab === 'quizzes' && (
        quizzes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No quizzes yet</h3>
            <p>Your teacher will add quizzes soon.</p>
          </div>
        ) : (
          <div>
            {quizzes.map(q => {
              const done = progress.results.find(r => r.quizTitle === q.title);
              return (
                <div className="quiz-item" key={q._id}>
                  <div className="quiz-item-icon">📝</div>
                  <div className="quiz-item-info">
                    <div className="quiz-item-title">{q.title}</div>
                    <div className="quiz-item-meta">{q.questions?.length || 0} questions</div>
                  </div>
                  {done ? (
                    <div style={{ textAlign:'right' }}>
                      <span className={`pcn-grade grade-${done.grade?.toLowerCase()}`}>{done.grade}</span>
                      <div style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:2 }}>{done.percentage}%</div>
                    </div>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/quiz/${q._id}`)}>
                      ▶ Start
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* My Results */}
      {tab === 'results' && (
        progress.results.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No results yet</h3>
            <p>Attempt quizzes to see your scores here.</p>
          </div>
        ) : (
          <div>
            <div className="stats-grid" style={{ marginBottom:'1.5rem' }}>
              <div className="stat-card stat-indigo">
                <div className="stat-icon-wrap">📊</div>
                <div className="stat-content">
                  <div className="stat-value">{progress.avgScore}%</div>
                  <div className="stat-label">Average Score</div>
                </div>
              </div>
              <div className="stat-card stat-cyan">
                <div className="stat-icon-wrap">✅</div>
                <div className="stat-content">
                  <div className="stat-value">{progress.results.length}</div>
                  <div className="stat-label">Quizzes Done</div>
                </div>
              </div>
            </div>
            {progress.results.map((r, i) => (
              <div className="result-row" key={i}>
                <div className="rr-quiz">{r.quizTitle}</div>
                <div className="rr-score">{r.score}/{r.total}</div>
                <div className="rr-pct">{r.percentage}%</div>
                <div className={`pcn-grade grade-${r.grade?.toLowerCase()}`}>{r.grade}</div>
                <div className="rr-date">{new Date(r.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
