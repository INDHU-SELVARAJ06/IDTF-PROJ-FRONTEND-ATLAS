import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCourseMaterials, addMaterial, addMaterialForm, deleteMaterial,
  getCourseQuizzes, createQuiz, deleteQuiz,
  getCourseProgress, getAllCourses, getCourseStudents,
} from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#10b981','#f59e0b','#f43f5e','#6366f1','#22d3ee'];
const GRADE_COLORS = { A:'#10b981', B:'#6366f1', C:'#f59e0b', D:'#f97316', F:'#f43f5e' };

export default function TeacherCourseDetail() {
  const { courseId } = useParams();
  const navigate     = useNavigate();

  const [course,    setCourse]    = useState(null);
  const [materials, setMaterials] = useState([]);
  const [quizzes,   setQuizzes]   = useState([]);
  const [progress,  setProgress]  = useState([]);
  const [students,  setStudents]  = useState([]);
  const [tab,       setTab]       = useState('overview');
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  const [matForm, setMatForm] = useState({ title: '', type: 'pdf', content: '', description: '' });
  const [file, setFile] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], answer: 0 }
  ]);

  // eslint-disable-next-line
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [cRes, mRes, qRes, pRes, sRes] = await Promise.all([
        getAllCourses(),
        getCourseMaterials(courseId),
        getCourseQuizzes(courseId),
        getCourseProgress(courseId),
        getCourseStudents(courseId),
      ]);
      setCourse(cRes.data.find(c => c._id === courseId));
      setMaterials(mRes.data);
      setQuizzes(qRes.data);
      setProgress(pRes.data);
      setStudents(sRes.data);
    } catch { setError('Failed to load course data'); }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      let resultData;
      if (file) {
        const formData = new FormData();
        formData.append('courseId', courseId);
        formData.append('title', matForm.title);
        formData.append('type', matForm.type);
        formData.append('description', matForm.description);
        formData.append('file', file);
        const { data } = await addMaterialForm(formData);
        resultData = data;
      } else {
        const { data } = await addMaterial({ ...matForm, courseId });
        resultData = data;
      }
      setMaterials([resultData.material, ...materials]);
      setMatForm({ title: '', type: 'pdf', content: '', description: '' });
      setFile(null);
      setSuccess('Material added successfully!');
    } catch (err) { setError(err.response?.data?.message || 'Failed to add material'); }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await deleteMaterial(id);
      setMaterials(materials.filter(m => m._id !== id));
      setSuccess('Material deleted.');
    } catch { setError('Failed to delete material'); }
  };

  const addQuestion = () => setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: 0 }]);
  const removeQuestion = (i) => setQuestions(questions.filter((_, idx) => idx !== i));
  const updateQuestion = (i, field, val) => {
    const arr = [...questions]; arr[i][field] = val; setQuestions(arr);
  };
  const updateOption = (qi, oi, val) => {
    const arr = [...questions]; arr[qi].options[oi] = val; setQuestions(arr);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      const { data } = await createQuiz({ courseId, title: quizTitle, questions });
      setQuizzes([...quizzes, data.quiz]);
      setQuizTitle('');
      setQuestions([{ question: '', options: ['', '', '', ''], answer: 0 }]);
      setSuccess('Quiz published!');
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await deleteQuiz(id);
      setQuizzes(quizzes.filter(q => q._id !== id));
      setSuccess('Quiz deleted.');
    } catch { setError('Failed'); }
  };

  const matIcon = (type) => ({ pdf:'📄', video:'🎥', notes:'📝', link:'🔗' }[type] || '📁');
  const getLevelStyle = (level) => ({
    High:    { background:'#d1fae5', color:'#065f46' },
    Average: { background:'#fef3c7', color:'#92400e' },
    Low:     { background:'#fee2e2', color:'#991b1b' },
  }[level] || {});

  // Chart data
  const gradeData = Object.entries(
    progress.flatMap(s => s.results).reduce((acc, r) => {
      acc[r.grade] = (acc[r.grade] || 0) + 1; return acc;
    }, {})
  ).map(([grade, count]) => ({ grade, count }));

  const scoreData = progress.map(s => ({
    name: s.student.name.split(' ')[0],
    score: s.avgScore,
  }));

  const tabs = [
    { id: 'overview',   label: '📊 Overview'   },
    { id: 'students',   label: '👥 Students'   },
    { id: 'materials',  label: '📁 Materials'  },
    { id: 'quiz',       label: '📝 Quiz'       },
    { id: 'progress',   label: '🏆 Progress'   },
  ];

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="detail-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/teacher-dashboard')}>
          ← Back
        </button>
        <div className="detail-header-info">
          <h1>{course ? course.title : 'Loading...'}</h1>
          <p>Manage materials, quizzes and monitor student performance</p>
        </div>
        <div className="detail-header-badges">
          {course && (
            <>
              <span className="badge badge-blue">{course.level || 'Beginner'}</span>
              <span className="badge badge-purple">{course.category || 'General'}</span>
            </>
          )}
        </div>
      </div>

      {error   && <div className="alert alert-error"><span>⚠️</span> {error} <button onClick={() => setError('')}>✕</button></div>}
      {success && <div className="alert alert-success"><span>✅</span> {success} <button onClick={() => setSuccess('')}>✕</button></div>}

      {/* Quick stats */}
      <div className="detail-stats">
        {[
          { icon:'👥', label:'Enrolled Students', value: students.length },
          { icon:'📁', label:'Materials',          value: materials.length },
          { icon:'📝', label:'Quizzes',            value: quizzes.length },
          { icon:'📊', label:'Quiz Attempts',      value: progress.reduce((a,s)=>a+s.results.length,0) },
        ].map((s,i) => (
          <div className="detail-stat" key={i}>
            <span className="detail-stat-icon">{s.icon}</span>
            <span className="detail-stat-value">{s.value}</span>
            <span className="detail-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {tabs.map(t => (
          <button key={t.id} className={`tab-pill ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div>
          <div className="charts-row">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Student Score Distribution</h3>
                <span className="chart-badge">Bar Chart</span>
              </div>
              {scoreData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={scoreData} margin={{ top:5, right:10, left:-20, bottom:5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize:11 }} />
                    <YAxis domain={[0,100]} tick={{ fontSize:11 }} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Avg Score']} contentStyle={{ borderRadius:8, fontSize:12 }} />
                    <Bar dataKey="score" radius={[4,4,0,0]}>
                      {scoreData.map((s, i) => (
                        <Cell key={i} fill={s.score >= 75 ? '#10b981' : s.score >= 50 ? '#f59e0b' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="chart-empty">No quiz results yet</div>}
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Grade Distribution</h3>
                <span className="chart-badge">Pie Chart</span>
              </div>
              {gradeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={gradeData} cx="50%" cy="50%" outerRadius={80}
                      dataKey="count" nameKey="grade"
                      label={({ grade, count }) => `${grade}: ${count}`}>
                      {gradeData.map((d, i) => (
                        <Cell key={i} fill={GRADE_COLORS[d.grade] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="chart-empty">No quiz results yet</div>}
            </div>
          </div>

          {/* Performance Summary */}
          {progress.length > 0 && (
            <div className="perf-summary">
              <h3>Performance Summary</h3>
              <div className="perf-summary-grid">
                {[
                  { label:'High Performers',    count: progress.filter(s=>s.level==='High').length,    color:'#10b981', icon:'🌟' },
                  { label:'Average Performers', count: progress.filter(s=>s.level==='Average').length, color:'#f59e0b', icon:'📘' },
                  { label:'Need Support',       count: progress.filter(s=>s.level==='Low').length,     color:'#f43f5e', icon:'⚠️' },
                ].map((p,i) => (
                  <div className="perf-box" key={i} style={{ borderColor: p.color }}>
                    <span className="perf-box-icon">{p.icon}</span>
                    <span className="perf-box-count" style={{ color: p.color }}>{p.count}</span>
                    <span className="perf-box-label">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STUDENTS TAB */}
      {tab === 'students' && (
        <div>
          <div className="section-header">
            <h2>Enrolled Students</h2>
            <span className="section-badge">{students.length} students</span>
          </div>
          {students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No students enrolled yet</h3>
              <p>Students will appear here once they enroll in this course.</p>
            </div>
          ) : (
            <div className="students-grid">
              {students.map((e, i) => {
                const prog = progress.find(p => p.student._id === e.student._id);
                return (
                  <div className="student-card" key={e._id}>
                    <div className="sc-avatar" style={{ background: COLORS[i % COLORS.length] }}>
                      {e.student.name[0].toUpperCase()}
                    </div>
                    <div className="sc-info">
                      <div className="sc-name">{e.student.name}</div>
                      <div className="sc-email">{e.student.email}</div>
                      {e.student.rollNumber && (
                        <div className="sc-roll">🎫 {e.student.rollNumber}</div>
                      )}
                    </div>
                    <div className="sc-stats">
                      {prog ? (
                        <>
                          <div className="sc-score" style={getLevelStyle(prog.level)}>
                            {prog.avgScore}% — {prog.level}
                          </div>
                          <div className="sc-quizzes">{prog.results.length} quiz{prog.results.length !== 1 ? 'zes' : ''}</div>
                        </>
                      ) : (
                        <div className="sc-pending">No quizzes yet</div>
                      )}
                    </div>
                    <div className="sc-joined">
                      Joined {new Date(e.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MATERIALS TAB */}
      {tab === 'materials' && (
        <div>
          <div className="create-panel">
            <h2>Add Learning Material</h2>
            <form onSubmit={handleAddMaterial}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input value={matForm.title}
                    onChange={e => setMatForm({ ...matForm, title: e.target.value })}
                    placeholder="e.g. Week 1 Notes" required />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={matForm.type}
                    onChange={e => setMatForm({ ...matForm, type: e.target.value })}>
                    <option value="pdf">📄 PDF</option>
                    <option value="video">🎥 Video</option>
                    <option value="notes">📝 Notes</option>
                    <option value="link">🔗 Link</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{matForm.type === 'notes' ? 'Notes Content' : matForm.type === 'link' ? 'URL Link' : 'Upload File from PC OR Paste URL'}</label>
                {matForm.type === 'notes' ? (
                  <textarea value={matForm.content} rows={4}
                    onChange={e => setMatForm({ ...matForm, content: e.target.value })}
                    placeholder="Write your notes here..." required />
                ) : matForm.type === 'link' ? (
                  <input value={matForm.content}
                    onChange={e => setMatForm({ ...matForm, content: e.target.value })}
                    placeholder="https://example.com" required />
                ) : (
                  <div style={{display:'flex', gap:10, flexWrap:'wrap', alignItems:'center'}}>
                    <input type="file" onChange={e => setFile(e.target.files[0])} style={{background:'rgba(255,255,255,0.1)', color:'#var(--text-color)', padding:'10px', borderRadius:'8px', outline:'none'}} />
                    <span style={{fontSize:'0.9rem', color:'var(--muted)', fontWeight:'bold'}}>— OR —</span>
                    <input value={matForm.content} style={{flex:1}}
                      onChange={e => setMatForm({ ...matForm, content: e.target.value })}
                      placeholder="Paste File URL Instead..." />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <input value={matForm.description}
                  onChange={e => setMatForm({ ...matForm, description: e.target.value })}
                  placeholder="Brief description" />
              </div>
              <button type="submit" className="btn btn-primary">📤 Upload Material</button>
            </form>
          </div>

          <div className="section-header">
            <h2>Uploaded Materials</h2>
            <span className="section-badge">{materials.length} items</span>
          </div>
          {materials.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No materials yet</h3>
            </div>
          ) : materials.map(m => (
            <div className="material-row" key={m._id}>
              <div className="mat-type-badge">{matIcon(m.type)}</div>
              <div className="mat-info">
                <div className="mat-title">{m.title}</div>
                <div className="mat-type-label">{m.type.toUpperCase()}</div>
                {m.description && <div className="mat-desc">{m.description}</div>}
                {m.type === 'notes'
                  ? <div className="mat-preview">{m.content.slice(0, 100)}...</div>
                  : <a href={m.content} target="_blank" rel="noreferrer" className="mat-link">Open {m.type} ↗</a>
                }
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMaterial(m._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* QUIZ TAB */}
      {tab === 'quiz' && (
        <div>
          <div className="create-panel">
            <h2>Create New Quiz</h2>
            <form onSubmit={handleCreateQuiz}>
              <div className="form-group">
                <label>Quiz Title</label>
                <input value={quizTitle}
                  onChange={e => setQuizTitle(e.target.value)}
                  placeholder="e.g. Week 1 Assessment" required />
              </div>
              {questions.map((q, qi) => (
                <div className="question-block" key={qi}>
                  <div className="qb-header">
                    <span className="qb-num">Q{qi + 1}</span>
                    {questions.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm"
                        onClick={() => removeQuestion(qi)}>Remove</button>
                    )}
                  </div>
                  <div className="form-group">
                    <input value={q.question}
                      onChange={e => updateQuestion(qi, 'question', e.target.value)}
                      placeholder="Enter your question" required />
                  </div>
                  <div className="options-grid">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="option-item">
                        <input type="radio" name={`q${qi}`}
                          checked={q.answer === oi}
                          onChange={() => updateQuestion(qi, 'answer', oi)} />
                        <input value={opt}
                          onChange={e => updateOption(qi, oi, e.target.value)}
                          placeholder={`Option ${oi + 1}`} required />
                        {q.answer === oi && <span className="correct-tag">✅ Correct</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ display:'flex', gap:12, marginBottom:16 }}>
                <button type="button" className="btn btn-ghost" onClick={addQuestion}>
                  + Add Question
                </button>
              </div>
              <button type="submit" className="btn btn-primary">🚀 Publish Quiz</button>
            </form>
          </div>

          <div className="section-header">
            <h2>Published Quizzes</h2>
            <span className="section-badge">{quizzes.length}</span>
          </div>
          {quizzes.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📝</div><h3>No quizzes yet</h3></div>
          ) : quizzes.map(q => (
            <div className="quiz-item" key={q._id}>
              <div className="quiz-item-icon">📝</div>
              <div className="quiz-item-info">
                <div className="quiz-item-title">{q.title}</div>
                <div className="quiz-item-meta">{q.questions?.length || 0} questions</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteQuiz(q._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* PROGRESS TAB */}
      {tab === 'progress' && (
        <div>
          <div className="section-header">
            <h2>Student Progress Cards</h2>
            <span className="section-badge">{progress.length} students</span>
          </div>
          {progress.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No quiz results yet</h3>
              <p>Students need to attempt quizzes to see their progress here.</p>
            </div>
          ) : (
            <div className="progress-cards-grid">
              {progress.map((s, i) => (
                <div className="progress-card-new" key={i}>
                  <div className="pcn-header">
                    <div className="pcn-avatar" style={{ background: COLORS[i % COLORS.length] }}>
                      {s.student.name[0].toUpperCase()}
                    </div>
                    <div className="pcn-info">
                      <div className="pcn-name">{s.student.name}</div>
                      <div className="pcn-roll">{s.student.rollNumber || s.student.email}</div>
                    </div>
                    <div className="pcn-badge" style={getLevelStyle(s.level)}>
                      {s.level}
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="pcn-score-wrap">
                    <div className="pcn-score-label">
                      <span>Average Score</span>
                      <span className="pcn-score-num">{s.avgScore}%</span>
                    </div>
                    <div className="pcn-bar-bg">
                      <div className="pcn-bar-fill" style={{
                        width: `${s.avgScore}%`,
                        background: s.avgScore >= 75 ? '#10b981' : s.avgScore >= 50 ? '#f59e0b' : '#f43f5e'
                      }} />
                    </div>
                  </div>

                  {/* Mini chart */}
                  {s.results.length > 1 && (
                    <ResponsiveContainer width="100%" height={80}>
                      <LineChart data={s.results.map((r,j) => ({ q: j+1, score: r.percentage }))}>
                        <Line type="monotone" dataKey="score" stroke={COLORS[i % COLORS.length]}
                          strokeWidth={2} dot={{ r:3 }} />
                        <XAxis dataKey="q" tick={{ fontSize:9 }} />
                        <Tooltip formatter={v => [`${v}%`]} contentStyle={{ fontSize:10, borderRadius:6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  {/* Quiz results */}
                  <div className="pcn-results">
                    {s.results.map((r, j) => (
                      <div className="pcn-result-row" key={j}>
                        <span className="pcn-quiz-name">{r.quizTitle}</span>
                        <span className="pcn-quiz-score">{r.score}/{r.total}</span>
                        <span className={`pcn-grade grade-${r.grade.toLowerCase()}`}>{r.grade}</span>
                      </div>
                    ))}
                  </div>

                  {/* Recommendation */}
                  <div className={`pcn-recommend level-${s.level.toLowerCase()}`}>
                    {s.level === 'High'    && '🌟 Excellent! Provide advanced challenges'}
                    {s.level === 'Average' && '📘 Good progress. Provide practice exercises'}
                    {s.level === 'Low'     && '⚠️ Needs help. Upload simplified materials'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
