import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitQuiz } from '../services/api';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate   = useNavigate();

  const [quiz,      setQuiz]      = useState(null);
  const [answers,   setAnswers]   = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [current,   setCurrent]   = useState(0);

  const fetchQuiz = useCallback(async () => {
    try {
      const { data } = await getQuiz(quizId);
      setQuiz(data);
      setAnswers(new Array(data.questions.length).fill(null));
    } catch { setError('Failed to load quiz'); }
    finally { setLoading(false); }
  }, [quizId]);

  useEffect(() => { fetchQuiz(); }, [fetchQuiz]);

  const selectAnswer = (i) => {
    const arr = [...answers]; arr[current] = i; setAnswers(arr);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) { setError('Please answer all questions first!'); return; }
    try {
      const { data } = await submitQuiz(quizId, { answers });
      setResult(data.result); setSubmitted(true);
    } catch (err) {
      const d = err.response?.data;
      if (d?.result) { setResult(d.result); setSubmitted(true); }
      else setError(d?.message || 'Submission failed');
    }
  };

  const gradeColor = (g) => ({ A:'#10b981', B:'#6366f1', C:'#f59e0b', D:'#f97316', F:'#f43f5e' }[g] || '#94a3b8');
  const progress   = quiz ? Math.round(((current + 1) / quiz.questions.length) * 100) : 0;
  const answered   = answers.filter(a => a !== null).length;

  if (loading) return <div className="page-loading"><div className="spinner-lg" /></div>;
  if (error && !quiz) return <div className="page-wrap"><div className="alert alert-error">⚠️ {error}</div></div>;

  if (submitted && result) {
    return (
      <div className="quiz-result-page">
        <div className="qr-card">
          <div className="qr-grade" style={{ color: gradeColor(result.grade) }}>{result.grade}</div>
          <h2 className="qr-title">Quiz Completed!</h2>
          <div className="qr-score">{result.score} / {result.total} correct</div>
          <div className="qr-pct" style={{ color: gradeColor(result.grade) }}>{result.percentage}%</div>

          <div className="qr-bar-wrap">
            <div className="qr-bar" style={{
              width: `${result.percentage}%`,
              background: `linear-gradient(90deg, ${gradeColor(result.grade)}, ${gradeColor(result.grade)}99)`
            }} />
          </div>

          <div className={`qr-status ${result.passed ? 'passed' : 'failed'}`}>
            {result.passed ? '🎉 Passed!' : '❌ Not Passed'}
          </div>

          <div className="qr-message">
            {result.percentage >= 90 && '🌟 Outstanding! Perfect performance.'}
            {result.percentage >= 75 && result.percentage < 90 && '👏 Great work! Strong understanding.'}
            {result.percentage >= 60 && result.percentage < 75 && '👍 Good effort! Review missed topics.'}
            {result.percentage >= 40 && result.percentage < 60 && '📘 Keep practicing! Study the materials again.'}
            {result.percentage < 40  && '⚠️ Needs improvement. Go through course materials carefully.'}
          </div>

          <div className="qr-actions">
            <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back to Course</button>
            <button className="btn btn-primary" onClick={() => navigate('/my-courses')}>My Courses →</button>
          </div>
        </div>
      </div>
    );
  }

  const q = quiz.questions[current];

  return (
    <div className="quiz-page">
      {/* Header */}
      <div className="quiz-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Exit</button>
        <h2 className="quiz-title">{quiz.title}</h2>
        <div className="quiz-counter">{answered}/{quiz.questions.length} answered</div>
      </div>

      {error && <div className="alert alert-error" style={{ maxWidth:640, margin:'0 auto 1rem' }}>⚠️ {error}</div>}

      {/* Progress */}
      <div className="quiz-progress-wrap">
        <div className="quiz-progress-track">
          <div className="quiz-progress-fill" style={{ width:`${progress}%` }} />
        </div>
        <span className="quiz-progress-label">Question {current+1} of {quiz.questions.length}</span>
      </div>

      {/* Question */}
      <div className="quiz-body">
        <div className="question-card-new">
          <div className="qcn-num">Question {current + 1}</div>
          <div className="qcn-text">{q.question}</div>
          <div className="qcn-options">
            {q.options.map((opt, i) => (
              <button key={i}
                className={`qcn-option ${answers[current] === i ? 'selected' : ''}`}
                onClick={() => selectAnswer(i)}>
                <span className="qcn-letter">{['A','B','C','D'][i]}</span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="quiz-nav">
          <button className="btn btn-ghost" onClick={() => setCurrent(c => c-1)} disabled={current === 0}>
            ← Previous
          </button>
          <div className="quiz-dots">
            {quiz.questions.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`quiz-dot ${
                answers[i] !== null ? 'answered' : current === i ? 'current' : ''
              }`}>{i+1}</button>
            ))}
          </div>
          {current < quiz.questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrent(c => c+1)}>Next →</button>
          ) : (
            <button className="btn btn-success" onClick={handleSubmit}>🚀 Submit</button>
          )}
        </div>
      </div>
    </div>
  );
}
