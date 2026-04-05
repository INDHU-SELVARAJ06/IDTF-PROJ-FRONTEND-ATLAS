import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar              from './components/Navbar';
import Home                from './pages/Home';
import Login               from './pages/Login'; // keeping as fallback or removing later
import TeacherLogin        from './pages/TeacherLogin';
import StudentLogin        from './pages/StudentLogin';
import Register            from './pages/Register';
import TeacherDashboard    from './pages/TeacherDashboard';
import AllStudents         from './pages/AllStudents';
import StudentProfileView  from './pages/StudentProfileView';
import TeacherCourseDetail from './pages/TeacherCourseDetail';
import StudentDashboard    from './pages/StudentDashboard';
import Courses             from './pages/Courses';
import MyCourses           from './pages/MyCourses';
import CourseDetail        from './pages/CourseDetail';
import QuizPage            from './pages/QuizPage';

const Private = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading"><div className="spinner-lg"/></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading"><div className="spinner-lg"/></div>;
  if (!user)              return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/"     replace />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Navigate to="/login/student" replace />} />
        <Route path="/login/teacher" element={<TeacherLogin />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses"  element={<Private><Courses /></Private>} />

        {/* Teacher Routes */}
        <Route path="/teacher-dashboard"
          element={<RoleRoute role="teacher"><TeacherDashboard /></RoleRoute>} />
        <Route path="/teacher/students"
          element={<RoleRoute role="teacher"><AllStudents /></RoleRoute>} />
        <Route path="/teacher/student/:studentId"
          element={<RoleRoute role="teacher"><StudentProfileView /></RoleRoute>} />
        <Route path="/teacher/course/:courseId"
          element={<RoleRoute role="teacher"><TeacherCourseDetail /></RoleRoute>} />

        {/* Student Routes */}
        <Route path="/student-dashboard"
          element={<RoleRoute role="student"><StudentDashboard /></RoleRoute>} />
        <Route path="/my-courses"
          element={<RoleRoute role="student"><MyCourses /></RoleRoute>} />
        <Route path="/course/:courseId"
          element={<RoleRoute role="student"><CourseDetail /></RoleRoute>} />
        <Route path="/quiz/:quizId"
          element={<RoleRoute role="student"><QuizPage /></RoleRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router><AppRoutes /></Router>
    </AuthProvider>
  );
}
