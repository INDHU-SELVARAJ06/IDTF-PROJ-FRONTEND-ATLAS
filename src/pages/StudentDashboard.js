import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllCourses, enrollInCourse, getMyCourses, getFullStudentProgress, getMyInbox } from '../services/api';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inbox, setInbox] = useState([]);

  useEffect(() => {
    if (user?._id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [a, b, inboxRes] = await Promise.all([
        getAllCourses(),
        getMyCourses(),
        getMyInbox().catch(() => ({ data: [] }))
      ]);

      setCourses(a.data);

      // ✅ FIXED: correct enrollment structure
      setMyCourses(b.data);
      setEnrolledIds(b.data.map(c => c.course)); // 🔥 IMPORTANT FIX

      if (inboxRes?.data) setInbox(inboxRes.data);

      try {
        const p = await getFullStudentProgress(user._id);
        setProgress(p.data);
      } catch {
        console.log('Progress not available yet');
      }

    } catch {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async id => {
    setError('');
    setSuccess('');
    try {
      await enrollInCourse(id);

      setEnrolledIds(prev => [...prev, id]);

      const enrolled = courses.find(c => c._id === id);
      if (enrolled) {
        setMyCourses(prev => [...prev, { course: enrolled }]); // ✅ FIXED STRUCTURE
      }

      setSuccess('Enrolled successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🎓 Student Dashboard</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <h2>📖 My Enrolled Courses</h2>

      {loading ? (
        <p>Loading...</p>
      ) : myCourses.length > 0 ? (
        <ul>
          {myCourses.map((c) => (
            <li key={c._id}>
              {/* ✅ FIXED: correct data access */}
              {c.course?.title} — 👨‍🏫 {c.course?.teacher?.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No enrolled courses yet</p>
      )}

      <h2>📚 Available Courses</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {courses
            .filter(c => !enrolledIds.includes(c._id)) // ✅ works now
            .map(c => (
              <li key={c._id}>
                {c.title}
                <button onClick={() => handleEnroll(c._id)} style={{ marginLeft: '10px' }}>
                  Enroll
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

























// // import React, { useState, useEffect, useCallback } from 'react';
// // import { Link, useNavigate } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';
// // import { getAllCourses, enrollInCourse, getMyCourses, getFullStudentProgress, getMyInbox } from '../services/api';
// // import {
// //   LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
// //   Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
// //   RadarChart, Radar, PolarGrid, PolarAngleAxis
// // } from 'recharts';

// // const COLORS = ['#6366f1','#22d3ee','#f59e0b','#f43f5e','#10b981'];
// // const GRADE_C = { A:'#10b981', B:'#6366f1', C:'#f59e0b', D:'#f97316', F:'#f43f5e' };

// // export default function StudentDashboard() {
// //   const { user, logout } = useAuth();
// //   const navigate = useNavigate();

// //   const [courses, setCourses] = useState([]);
// //   const [myCourses, setMyCourses] = useState([]);
// //   const [enrolledIds, setEnrolledIds] = useState([]);
// //   const [progress, setProgress] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState('');
// //   const [success, setSuccess] = useState('');
// //   const [inbox, setInbox] = useState([]);

// //   // ✅ FIXED fetchData with useCallback
// //   const fetchData = useCallback(async () => {
// //     try {
// //       const [a, b, inboxRes] = await Promise.all([
// //         getAllCourses(),
// //         getMyCourses(),
// //         getMyInbox().catch(() => ({ data: [] }))
// //       ]);

// //       setCourses(a.data);
// //       setMyCourses(b.data);
// //       setEnrolledIds(b.data.map(c => c._id));

// //       if (inboxRes?.data) setInbox(inboxRes.data);

// //       try {
// //         const p = await getFullStudentProgress(user._id);
// //         setProgress(p.data);
// //       } catch {
// //         console.log('Progress not available yet');
// //       }

// //     } catch {
// //       setError('Failed to load dashboard');
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [user]);

// //   // ✅ FIXED useEffect dependency
// //   useEffect(() => {
// //     if (user?._id) {
// //       fetchData();
// //     }
// //   }, [user, fetchData]);

// //   const handleEnroll = async id => {
// //     setError('');
// //     setSuccess('');
// //     try {
// //       await enrollInCourse(id);
// //       setEnrolledIds([...enrolledIds, id]);

// //       const enrolled = courses.find(c => c._id === id);
// //       if (enrolled) {
// //         setMyCourses([...myCourses, { ...enrolled, enrolledAt: new Date() }]);
// //       }

// //       setSuccess('Enrolled successfully!');
// //       setTimeout(() => setSuccess(''), 3000);
// //     } catch (err) {
// //       setError(err.response?.data?.message || 'Enrollment failed');
// //     }
// //   };

// //   // Chart data
// //   const timelineData = (progress?.timeline || []).slice(-8);
// //   const gradeData = Object.entries(progress?.gradeDistribution || {})
// //     .filter(([, v]) => v > 0)
// //     .map(([grade, count]) => ({ grade, count }));

// //   const courseBarData = (progress?.courseSummary || []).map(c => ({
// //     name: c.title?.slice(0, 12) || 'Course',
// //     avg: c.avg,
// //   }));

// //   const radarData = (progress?.courseSummary || []).map(c => ({
// //     subject: c.title?.slice(0, 10) || 'Course',
// //     score: c.avg,
// //   }));

// //   const avgScore = progress?.avgScore || 0;
// //   const totalQuizzes = progress?.results?.length || 0;

// //   return (
// //     <div>
// //       <h1>Student Dashboard</h1>

// //       {error && <p style={{color:'red'}}>{error}</p>}
// //       {success && <p style={{color:'green'}}>{success}</p>}

// //       <h2>Available Courses</h2>

// //       {loading ? (
// //         <p>Loading...</p>
// //       ) : (
// //         <ul>
// //           {courses.map(c => (
// //             <li key={c._id}>
// //               {c.title}
// //               {!enrolledIds.includes(c._id) && (
// //                 <button onClick={() => handleEnroll(c._id)}>Enroll</button>
// //               )}
// //             </li>
// //           ))}
// //         </ul>
// //       )}
// //     </div>
// //   );
// // }



// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { getAllCourses, enrollInCourse, getMyCourses, getFullStudentProgress, getMyInbox } from '../services/api';
// import {
//   LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
//   RadarChart, Radar, PolarGrid, PolarAngleAxis
// } from 'recharts';

// const COLORS   = ['#6366f1','#22d3ee','#f59e0b','#f43f5e','#10b981'];
// const GRADE_C  = { A:'#10b981', B:'#6366f1', C:'#f59e0b', D:'#f97316', F:'#f43f5e' };

// export default function StudentDashboard() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const [courses,     setCourses]     = useState([]);
//   const [myCourses,   setMyCourses]   = useState([]);
//   const [enrolledIds, setEnrolledIds] = useState([]);
//   const [progress,    setProgress]    = useState(null);
//   const [loading,     setLoading]     = useState(true);
//   const [error,       setError]       = useState('');
//   const [success,     setSuccess]     = useState('');
//   const [inbox,       setInbox]       = useState([]);

//   useEffect(() => {
//     if (user?._id) fetchData();
//   }, [user]);

//   // const fetchData = async () => {
//   //   try {
//   //     const [a, b, p] = await Promise.all([
//   //       getAllCourses(),
//   //       getMyCourses(),
//   //       getFullStudentProgress(user._id),
//   //     ]);
//   //     setCourses(a.data);
//   //     setMyCourses(b.data);
//   //     setEnrolledIds(b.data.map(c => c._id));
//   //     setProgress(p.data);
//   //   } catch { setError('Failed to load dashboard'); }
//   //   finally { setLoading(false); }
//   // };

//   const fetchData = async () => {
//   try {
//     const [a, b, inboxRes] = await Promise.all([
//       getAllCourses(),
//       getMyCourses(),
//       getMyInbox().catch(()=>({data:[]}))
//     ]);
//     setCourses(a.data);
//     setMyCourses(b.data);
//     setEnrolledIds(b.data.map(c => c._id));
//     if (inboxRes?.data) setInbox(inboxRes.data);

//     // Try progress separately so it doesn't crash dashboard
//     try {
//       const p = await getFullStudentProgress(user._id);
//       setProgress(p.data);
//     } catch {
//       console.log('Progress not available yet');
//     }

//   } catch { setError('Failed to load dashboard'); }
//   finally { setLoading(false); }
// };

//   const handleEnroll = async id => {
//     setError(''); setSuccess('');
//     try {
//       await enrollInCourse(id);
//       setEnrolledIds([...enrolledIds, id]);
//       const enrolled = courses.find(c => c._id === id);
//       if (enrolled) setMyCourses([...myCourses, { ...enrolled, enrolledAt: new Date() }]);
//       setSuccess('Enrolled successfully!');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) { setError(err.response?.data?.message || 'Enrollment failed'); }
//   };

//   // Chart data
//   const timelineData = (progress?.timeline || []).slice(-8);
//   const gradeData    = Object.entries(progress?.gradeDistribution || {})
//     .filter(([,v]) => v > 0)
//     .map(([grade, count]) => ({ grade, count }));
//   const courseBarData = (progress?.courseSummary || []).map(c => ({
//     name: c.title?.slice(0,12) || 'Course',
//     avg:  c.avg,
//   }));
//   const radarData = (progress?.courseSummary || []).map(c => ({
//     subject: c.title?.slice(0,10) || 'Course',
//     score:   c.avg,
//   }));

//   const avgScore    = progress?.avgScore || 0;
//   const totalQuizzes= progress?.results?.length || 0;
//   const levelLabel  = avgScore >= 75 ? 'High Performer' : avgScore >= 50 ? 'Average' : 'Beginner';
//   const levelColor  = avgScore >= 75 ? '#10b981' : avgScore >= 50 ? '#f59e0b' : '#6366f1';

//   const statCards = [
//     { icon:'📖', label:'Enrolled Courses', value: enrolledIds.length, color:'indigo' },
//     { icon:'📝', label:'Quizzes Done',      value: totalQuizzes,       color:'cyan'   },
//     { icon:'📊', label:'Avg Score',         value: `${avgScore}%`,     color:'amber'  },
//     { icon:'🎫', label:'Roll Number',       value: user?.rollNumber||'N/A', color:'emerald', small:true },
//   ];

//   return (
//     <div className="dash-layout">
//       <aside className="sidebar">
//         <div className="sb-logo">
//           <span className="sb-logo-icon">🎓</span>
//           <span className="sb-logo-text">IDTP</span>
//         </div>
//         <nav className="sb-nav">
//           <div className="sb-section-label">MAIN</div>
//           <div className="sb-item active"><span>🏠</span><span>Dashboard</span></div>
//           <Link to="/courses"    className="sb-item"><span>📚</span><span>Browse Courses</span></Link>
//           <Link to="/my-courses" className="sb-item">
//             <span>📖</span><span>My Learning</span>
//             {enrolledIds.length > 0 && <span className="sb-badge">{enrolledIds.length}</span>}
//           </Link>
//           <div className="sb-section-label">ACCOUNT</div>
//           <div className="sb-item sb-user">
//             <div className="sb-avatar">{user?.name?.[0]?.toUpperCase()}</div>
//             <div>
//               <div className="sb-user-name">{user?.name}</div>
//               <div className="sb-user-role">{user?.rollNumber||'Student'}</div>
//             </div>
//           </div>
//           <div className="sb-item sb-logout" onClick={logout}><span>🚪</span><span>Sign Out</span></div>
//         </nav>
//       </aside>

//       <main className="dash-main">
//         <div className="dash-topbar">
//           <div>
//             <h1 className="dash-title">My Dashboard</h1>
//             <p className="dash-subtitle">Welcome, <strong>{user?.name}</strong>! Keep learning 🚀</p>
//           </div>
//           <button className="btn btn-primary" onClick={() => navigate('/my-courses')}>
//             📖 My Courses →
//           </button>
//         </div>

//         {error   && <div className="alert alert-error"><span>⚠️</span>{error}<button onClick={()=>setError('')}>✕</button></div>}
//         {success && <div className="alert alert-success"><span>✅</span>{success}</div>}

//         {/* Stat Cards */}
//         <div className="stats-grid">
//           {statCards.map((s,i) => (
//             <div className={`stat-card stat-${s.color}`} key={i}>
//               <div className="stat-icon-wrap">{s.icon}</div>
//               <div className="stat-content">
//                 <div className={`stat-value ${s.small?'stat-value-sm':''}`}>
//                   {loading ? '—' : s.value}
//                 </div>
//                 <div className="stat-label">{s.label}</div>
//               </div>
//               <div className="stat-decoration"/>
//             </div>
//           ))}
//         </div>

//         {/* Bonus Point: Personal Inbox */}
//         {inbox.length > 0 && (
//           <div className="performance-banner" style={{ borderLeft: '4px solid #8b5cf6', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#fff', alignItems: 'flex-start', flexDirection: 'column' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
//               <span style={{ fontSize: '1.4rem' }}>🎁</span>
//               <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#e0e7ff' }}>Direct Personal Support</h2>
//               <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>{inbox.length} Item(s)</span>
//             </div>
//             <p style={{ color: '#a5b4fc', fontSize: '0.9rem', marginBottom: '16px' }}>Your teachers have sent you specialized support materials based on your AI learning trends!</p>
            
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
//               {inbox.map(msg => (
//                 <div key={msg._id} style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', borderLeft: '3px solid #10b981' }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
//                     <div style={{ fontWeight: 800, color: '#fff' }}>{msg.title}</div>
//                     <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>From: 👨‍🏫 {msg.teacher?.name} — {new Date(msg.createdAt).toLocaleDateString()}</div>
//                   </div>
//                   <div style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: msg.fileLink ? '12px' : '0', lineHeight: 1.5 }}>
//                     "{msg.message}"
//                   </div>
//                   {msg.fileLink && (
//                     <a href={msg.fileLink} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#10b981', color: '#fff' }}>
//                       📄 Open Sent Notes
//                     </a>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Performance Level Banner */}
//         {totalQuizzes > 0 && (
//           <div className="performance-banner" style={{borderLeft:`4px solid ${levelColor}`}}>
//             <div className="pb-left">
//               <div className="pb-level" style={{color:levelColor}}>{levelLabel}</div>
//               <div className="pb-desc">
//                 Based on {totalQuizzes} quiz attempt{totalQuizzes!==1?'s':''} with {avgScore}% average
//               </div>
//             </div>
//             <div className="pb-score-circle" style={{borderColor:levelColor,color:levelColor}}>
//               <div className="pb-score-num">{avgScore}%</div>
//               <div className="pb-score-lbl">Overall</div>
//             </div>
//           </div>
//         )}

//         {/* LEARNING PROGRESS CHARTS */}
//         {totalQuizzes > 0 && (
//           <>
//             <div className="section-header" style={{marginTop:'1.5rem'}}>
//               <h2>📈 My Learning Progress</h2>
//               <span className="section-badge">{totalQuizzes} quiz attempts</span>
//             </div>

//             <div className="charts-row">
//               {/* Score Timeline */}
//               <div className="chart-card">
//                 <div className="chart-header">
//                   <h3>Score Timeline</h3>
//                   <span className="chart-badge">Progress</span>
//                 </div>
//                 {timelineData.length > 0 ? (
//                   <ResponsiveContainer width="100%" height={200}>
//                     <LineChart data={timelineData} margin={{top:5,right:10,left:-20,bottom:5}}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
//                       <XAxis dataKey="index" tick={{fontSize:11}}
//                         label={{value:'Quiz #',position:'insideBottom',offset:-3,fontSize:10}}/>
//                       <YAxis domain={[0,100]} tick={{fontSize:11}}/>
//                       <Tooltip formatter={v=>[`${v}%`,'Score']} contentStyle={{borderRadius:8,fontSize:12}}/>
//                       <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
//                         dot={{r:4,fill:'#6366f1'}} activeDot={{r:6}}/>
//                     </LineChart>
//                   </ResponsiveContainer>
//                 ) : <div className="chart-empty">No data</div>}
//               </div>

//               {/* Grade Distribution */}
//               <div className="chart-card">
//                 <div className="chart-header">
//                   <h3>My Grades</h3>
//                   <span className="chart-badge">Distribution</span>
//                 </div>
//                 {gradeData.length > 0 ? (
//                   <ResponsiveContainer width="100%" height={200}>
//                     <PieChart>
//                       <Pie data={gradeData} cx="50%" cy="50%" outerRadius={75}
//                         dataKey="count" nameKey="grade"
//                         label={({grade,count})=>`${grade}:${count}`}>
//                         {gradeData.map((d,i) => <Cell key={i} fill={GRADE_C[d.grade]||'#94a3b8'}/>)}
//                       </Pie>
//                       <Tooltip/>
//                     </PieChart>
//                   </ResponsiveContainer>
//                 ) : <div className="chart-empty">No grades yet</div>}
//               </div>
//             </div>

//             <div className="charts-row">
//               {/* Avg per course */}
//               {courseBarData.length > 0 && (
//                 <div className="chart-card">
//                   <div className="chart-header">
//                     <h3>Score by Course</h3>
//                     <span className="chart-badge">Bar Chart</span>
//                   </div>
//                   <ResponsiveContainer width="100%" height={200}>
//                     <BarChart data={courseBarData} margin={{top:5,right:10,left:-20,bottom:5}}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
//                       <XAxis dataKey="name" tick={{fontSize:10}}/>
//                       <YAxis domain={[0,100]} tick={{fontSize:11}}/>
//                       <Tooltip formatter={v=>[`${v}%`]} contentStyle={{borderRadius:8,fontSize:12}}/>
//                       <Bar dataKey="avg" radius={[4,4,0,0]}>
//                         {courseBarData.map((d,i) => (
//                           <Cell key={i} fill={d.avg>=75?'#10b981':d.avg>=50?'#f59e0b':'#f43f5e'}/>
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}

//               {/* Radar */}
//               {radarData.length >= 3 && (
//                 <div className="chart-card">
//                   <div className="chart-header">
//                     <h3>Performance Radar</h3>
//                     <span className="chart-badge">Radar</span>
//                   </div>
//                   <ResponsiveContainer width="100%" height={200}>
//                     <RadarChart data={radarData}>
//                       <PolarGrid stroke="#e5e7eb"/>
//                       <PolarAngleAxis dataKey="subject" tick={{fontSize:10}}/>
//                       <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3}/>
//                       <Tooltip formatter={v=>[`${v}%`]}/>
//                     </RadarChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}
//             </div>
//           </>
//         )}

//         {/* My Enrolled Courses Quick View */}
//         {myCourses.length > 0 && (
//           <>
//             <div className="section-header" style={{marginTop:'1rem'}}>
//               <h2>My Enrolled Courses</h2>
//               <Link to="/my-courses" className="section-link">View all →</Link>
//             </div>
//             <div className="enrolled-quick-list">
//               {myCourses.slice(0,4).map((c,i) => (
//                 <div className="eql-card" key={c._id}
//                   onClick={() => navigate(`/course/${c._id}`)}>
//                   <div className="eql-dot" style={{background:COLORS[i%COLORS.length]}}/>
//                   <div className="eql-info">
//                     <div className="eql-title">{c.title}</div>
//                     <div className="eql-teacher">👨‍🏫 {c.teacher?.name}</div>
//                   </div>
//                   <span className="eql-arrow">→</span>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* Browse Available Courses */}
//         <div className="section-header" style={{marginTop:'1.5rem'}}>
//           <h2>Available Courses</h2>
//           <Link to="/courses" className="section-link">View all →</Link>
//         </div>

//         {loading ? (
//           <div className="loading-grid">{[1,2,3,4].map(i=><div key={i} className="skeleton-card"/>)}</div>
//         ) : (
//           <div className="course-grid">
//             {courses.filter(c=>!enrolledIds.includes(c._id)).slice(0,4).map((c,i)=>(
//               <div className="course-card-new" key={c._id}>
//                 <div className="ccn-top" style={{background:`linear-gradient(135deg,${COLORS[i%COLORS.length]}22,${COLORS[(i+1)%COLORS.length]}22)`}}>
//                   <span className="ccn-category">{c.category||'General'}</span>
//                   <span className="ccn-level">{c.level||'Beginner'}</span>
//                 </div>
//                 <div className="ccn-body">
//                   <h3 className="ccn-title">{c.title}</h3>
//                   <p className="ccn-desc">{c.description}</p>
//                   <div className="ccn-teacher">👨‍🏫 {c.teacher?.name}</div>
//                 </div>
//                 <div className="ccn-foot">
//                   <button className="btn btn-primary btn-sm" onClick={()=>handleEnroll(c._id)}>
//                     + Enroll
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
