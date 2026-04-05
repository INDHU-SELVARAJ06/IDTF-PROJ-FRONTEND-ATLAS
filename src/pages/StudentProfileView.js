import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentProfile, getFullStudentProgress, sendDirectMaterial } from '../services/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend
} from 'recharts';

const COLORS   = ['#6366f1','#22d3ee','#f59e0b','#f43f5e','#10b981'];
const GRADE_C  = { A:'#10b981', B:'#6366f1', C:'#f59e0b', D:'#f97316', F:'#f43f5e' };

export default function StudentProfileView() {
  const { studentId } = useParams();
  const navigate      = useNavigate();

  const [profile,  setProfile]  = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [tab,      setTab]      = useState('overview');

  const [directForm, setDirectForm] = useState({ title: '', message: '', fileLink: '' });
  const [sending,    setSending]    = useState(false);
  const [sendSuccess,setSendSuccess] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [pRes, prRes] = await Promise.all([
        getStudentProfile(studentId),
        getFullStudentProgress(studentId),
      ]);
      setProfile(pRes.data);
      setProgress(prRes.data);
    } catch { setError('Failed to load student profile'); }
    finally { setLoading(false); }
  }, [studentId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSendDirect = async (e) => {
    e.preventDefault();
    setSending(true); setSendSuccess(''); setError('');
    try {
      await sendDirectMaterial({ studentId, ...directForm });
      setSendSuccess('Bonus Support Material sent to this student successfully!');
      setDirectForm({ title: '', message: '', fileLink: '' });
    } catch (err) { setError(err.response?.data?.message || 'Failed to send directly'); }
    finally { setSending(false); }
  };

  if (loading) return <div className="page-loading"><div className="spinner-lg"/></div>;
  if (error)   return <div className="page-wrap"><div className="alert alert-error">⚠️ {error}</div></div>;

  const s = profile.student;

  // Radar data: scores per course
  const radarData = profile.courseProgress.map(cp => ({
    subject: cp.course?.title?.slice(0,12) || 'Course',
    score:   cp.avgScore,
  }));

  // Grade pie data
  const gradeData = Object.entries(profile.gradeDistribution)
    .filter(([,v]) => v > 0)
    .map(([grade, count]) => ({ grade, count }));

  // Timeline line chart
  const timelineData = (progress?.timeline || []).slice(-10);

  // Course bar chart
  const courseBarData = profile.courseProgress.map(cp => ({
    name: cp.course?.title?.slice(0,14) || 'Course',
    avg:  cp.avgScore,
    quizzes: cp.quizzesTaken,
  }));

  const levelColor = (avg) =>
    avg >= 75 ? { bg:'#d1fae5', color:'#065f46', label:'High Performer' }
    : avg >= 50 ? { bg:'#fef3c7', color:'#92400e', label:'Average'  }
    : { bg:'#fee2e2', color:'#991b1b', label:'Needs Support' };

  const lc = levelColor(profile.avgScore);

  const tabs = [
    { id:'overview',  label:'📊 Overview'  },
    { id:'courses',   label:'📚 Courses'   },
    { id:'quizzes',   label:'📝 Quizzes'   },
    { id:'charts',    label:'📈 Analytics' },
  ];

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="page-top-bar">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/teacher/students')}>
          ← All Students
        </button>
        <div>
          <h1 className="page-main-title">Student Profile</h1>
          <p className="page-main-sub">Complete learning overview — as seen from student's perspective</p>
        </div>
      </div>

      {/* Student Hero Card */}
      <div className="student-hero-card">
        <div className="shc-left">
          <div className="shc-avatar">
            {s.name[0].toUpperCase()}
          </div>
          <div className="shc-info">
            <h2 className="shc-name">{s.name}</h2>
            <div className="shc-email">✉️ {s.email}</div>
            {s.rollNumber && <div className="shc-roll">🎫 Roll No: {s.rollNumber}</div>}
            <div className="shc-joined">📅 Joined: {new Date(s.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <div className="shc-stats">
          <div className="shc-stat">
            <div className="shc-stat-num">{profile.enrollments}</div>
            <div className="shc-stat-lbl">Courses</div>
          </div>
          <div className="shc-stat">
            <div className="shc-stat-num">{profile.quizResults}</div>
            <div className="shc-stat-lbl">Quizzes Done</div>
          </div>
          <div className="shc-stat">
            <div className="shc-stat-num">{profile.avgScore}%</div>
            <div className="shc-stat-lbl">Avg Score</div>
          </div>
        </div>
        <div className="shc-level" style={{ background: lc.bg, color: lc.color }}>
          <div className="shc-level-label">Performance Level</div>
          <div className="shc-level-value">{lc.label}</div>
          <div className="shc-recommendation">
            {profile.avgScore >= 75 && '🌟 Provide advanced challenges and enrichment materials'}
            {profile.avgScore >= 50 && profile.avgScore < 75 && '📘 Assign practice exercises and revision materials'}
            {profile.avgScore < 50  && '⚠️ Upload simplified notes and provide extra support'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {tabs.map(t => (
          <button key={t.id} className={`tab-pill ${tab===t.id?'active':''}`}
            onClick={()=>setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div>
          {/* Bonus Point: Direct Sender */}
          <div className="create-panel" style={{ marginTop: 0, marginBottom: '24px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.5rem' }}>🎁</span>
              <h2 style={{ margin: 0, color: '#e0e7ff', fontSize: '1.2rem' }}>Bonus Point: Targeted Personal Support</h2>
              <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>Direct-to-Student Inbox</span>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#a5b4fc', marginBottom: '16px' }}>
              Provide explicit private support directly to {s.name}'s dedicated inbox without showing it to the rest of the course. Send simplified notes, remedial tasks, or handwritten scans!
            </p>
            {sendSuccess && <div className="alert alert-success" style={{color:'#10b981', background:'rgba(16,185,129,0.1)', border:'1px solid #10b981'}}>{sendSuccess}</div>}
            
            <form onSubmit={handleSendDirect}>
              <div className="form-row">
                <div className="form-group">
                  <label style={{color:'#cbd5e1'}}>Material Title *</label>
                  <input style={{background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)'}} value={directForm.title} onChange={e=>setDirectForm({...directForm, title:e.target.value})} placeholder="e.g. Simplified AI Notes Chapter 1" required />
                </div>
                <div className="form-group">
                  <label style={{color:'#cbd5e1'}}>Direct File Link (Ex: Handwritten Scan PDF URL)</label>
                  <input style={{background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)'}} value={directForm.fileLink} onChange={e=>setDirectForm({...directForm, fileLink:e.target.value})} placeholder="https://..." />
                </div>
              </div>
              <div className="form-group" style={{marginTop:'12px', marginBottom:'16px'}}>
                <label style={{color:'#cbd5e1'}}>Custom Message *</label>
                <textarea style={{background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)'}} rows={2} value={directForm.message} onChange={e=>setDirectForm({...directForm, message:e.target.value})} placeholder="Hey Freya, I noticed your DSA scores dropping. Help yourself to these simplified handwritten notes!" required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={sending} style={{background:'#6366f1', border:'none'}}>
                {sending ? 'Sending Protocol Active...' : '🚀 Push Directly to Student Dashboard'}
              </button>
            </form>
          </div>

          <div className="charts-row">
            {/* Score Timeline */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Score Timeline</h3>
                <span className="chart-badge">Line Chart</span>
              </div>
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={timelineData} margin={{top:5,right:10,left:-20,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis dataKey="index" tick={{fontSize:11}} label={{value:'Quiz #',position:'insideBottom',offset:-3,fontSize:11}}/>
                    <YAxis domain={[0,100]} tick={{fontSize:11}}/>
                    <Tooltip formatter={v=>[`${v}%`,'Score']} contentStyle={{borderRadius:8,fontSize:12}}/>
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
                      dot={{r:4,fill:'#6366f1'}} activeDot={{r:6}}/>
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="chart-empty">No quiz attempts yet</div>}
            </div>

            {/* Grade Distribution */}
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
                      label={({grade,count})=>`${grade}: ${count}`}>
                      {gradeData.map((d,i) => <Cell key={i} fill={GRADE_C[d.grade]||'#94a3b8'}/>)}
                    </Pie>
                    <Tooltip/>
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="chart-empty">No quiz results yet</div>}
            </div>
          </div>

          {/* Recent Results */}
          {profile.recentResults.length > 0 && (
            <div className="create-panel" style={{marginTop:0}}>
              <h2>Recent Quiz Results</h2>
              {profile.recentResults.map((r,i) => (
                <div className="result-row" key={i}>
                  <div className="rr-quiz">{r.quiz?.title || 'Quiz'}</div>
                  <div className="rr-course" style={{fontSize:'0.78rem',color:'var(--muted)'}}>
                    {r.course?.title}
                  </div>
                  <div className="rr-score">{r.score}/{r.total}</div>
                  <div className="rr-pct">{r.percentage}%</div>
                  <div className={`pcn-grade grade-${r.grade?.toLowerCase()}`}>{r.grade}</div>
                  <div className="rr-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COURSES TAB */}
      {tab === 'courses' && (
        <div>
          {profile.courseProgress.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>Not enrolled in any courses</h3>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {profile.courseProgress.map((cp,i) => {
                const lev = levelColor(cp.avgScore);
                return (
                  <div className="student-course-progress-card" key={i}>
                    <div className="scpc-header">
                      <div className="scpc-course-info">
                        <div className="scpc-course-num" style={{background:COLORS[i%COLORS.length]}}>
                          {i+1}
                        </div>
                        <div>
                          <div className="scpc-course-title">{cp.course?.title}</div>
                          <div className="scpc-course-cat">{cp.course?.category} · {cp.course?.level}</div>
                        </div>
                      </div>
                      <div className="scpc-stats">
                        <span className="scpc-stat">{cp.quizzesTaken} quizzes</span>
                        <span className="scpc-badge" style={{background:lev.bg,color:lev.color}}>
                          {cp.avgScore}% — {lev.label}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{margin:'10px 0'}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',color:'var(--muted)',marginBottom:5}}>
                        <span>Average Score</span><span>{cp.avgScore}%</span>
                      </div>
                      <div className="pcn-bar-bg">
                        <div className="pcn-bar-fill" style={{
                          width:`${cp.avgScore}%`,
                          background: cp.avgScore>=75?'#10b981':cp.avgScore>=50?'#f59e0b':'#f43f5e'
                        }}/>
                      </div>
                    </div>

                    {/* Quiz results */}
                    {cp.results.length > 0 && (
                      <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:8}}>
                        {cp.results.map((r,j) => (
                          <div className="pcn-result-row" key={j}>
                            <span className="pcn-quiz-name">{r.quizTitle}</span>
                            <span className="pcn-quiz-score">{r.score}/{r.total}</span>
                            <span>{r.percentage}%</span>
                            <span className={`pcn-grade grade-${r.grade?.toLowerCase()}`}>{r.grade}</span>
                            <span style={{fontSize:'0.74rem',color:'var(--muted2)',marginLeft:'auto'}}>
                              {new Date(r.date).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{marginTop:10,padding:'8px 12px',borderRadius:8,fontSize:'0.82rem',fontWeight:500,
                      background: lev.bg, color: lev.color}}>
                      {cp.avgScore>=75 && '🌟 Excellent in this course — suggest advanced topics'}
                      {cp.avgScore>=50 && cp.avgScore<75 && '📘 Good progress — provide more practice exercises'}
                      {cp.avgScore<50  && '⚠️ Struggling — upload simplified explanations for this course'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* QUIZZES TAB */}
      {tab === 'quizzes' && (
        <div>
          {profile.recentResults.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No quiz attempts yet</h3>
            </div>
          ) : (
            <>
              <div className="stats-grid" style={{marginBottom:'1.5rem'}}>
                {Object.entries(profile.gradeDistribution).map(([grade,count]) => (
                  count > 0 && (
                    <div key={grade} className="stat-card" style={{borderTop:`3px solid ${GRADE_C[grade]}`}}>
                      <div className="stat-icon-wrap" style={{background:`${GRADE_C[grade]}22`,fontSize:'1.2rem'}}>
                        {grade}
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{count}</div>
                        <div className="stat-label">Grade {grade}</div>
                      </div>
                    </div>
                  )
                ))}
              </div>
              {profile.recentResults.map((r,i) => (
                <div className="result-row" key={i} style={{marginBottom:8}}>
                  <div className="rr-quiz" style={{flex:2}}>{r.quiz?.title}</div>
                  <div style={{fontSize:'0.78rem',color:'var(--muted)',flex:1}}>{r.course?.title}</div>
                  <div className="rr-score">{r.score}/{r.total}</div>
                  <div className="rr-pct">{r.percentage}%</div>
                  <div className={`pcn-grade grade-${r.grade?.toLowerCase()}`}>{r.grade}</div>
                  <div className="rr-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {tab === 'charts' && (
        <div>
          <div className="charts-row">
            {/* Score per course bar */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Average Score by Course</h3>
                <span className="chart-badge">Bar Chart</span>
              </div>
              {courseBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={courseBarData} margin={{top:5,right:10,left:-20,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis dataKey="name" tick={{fontSize:10}}/>
                    <YAxis domain={[0,100]} tick={{fontSize:11}}/>
                    <Tooltip formatter={v=>[`${v}%`]} contentStyle={{borderRadius:8,fontSize:12}}/>
                    <Bar dataKey="avg" radius={[4,4,0,0]}>
                      {courseBarData.map((d,i) => (
                        <Cell key={i} fill={d.avg>=75?'#10b981':d.avg>=50?'#f59e0b':'#f43f5e'}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="chart-empty">No data yet</div>}
            </div>

            {/* Radar chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Performance Radar</h3>
                <span className="chart-badge">Radar</span>
              </div>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb"/>
                    <PolarAngleAxis dataKey="subject" tick={{fontSize:10}}/>
                    <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35}/>
                    <Tooltip formatter={v=>[`${v}%`]}/>
                  </RadarChart>
                </ResponsiveContainer>
              ) : <div className="chart-empty">No data yet</div>}
            </div>
          </div>

          {/* Full timeline */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Full Score Timeline</h3>
              <span className="chart-badge">All Attempts</span>
            </div>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timelineData} margin={{top:5,right:20,left:-10,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="date" tick={{fontSize:10}}/>
                  <YAxis domain={[0,100]} tick={{fontSize:11}}/>
                  <Tooltip
                    contentStyle={{borderRadius:8,fontSize:12}}
                    formatter={(v,n,p) => [`${v}% — ${p.payload.quiz}`, 'Score']}/>
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
                    dot={{r:5,fill:'#6366f1'}} activeDot={{r:7}}/>
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="chart-empty">No quiz history yet</div>}
          </div>
        </div>
      )}
    </div>
  );
}
