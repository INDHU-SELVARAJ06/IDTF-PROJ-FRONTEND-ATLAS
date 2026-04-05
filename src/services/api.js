import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('idtp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('idtp_token');
      localStorage.removeItem('idtp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser         = (d)      => API.post('/auth/register', d);
export const loginUser            = (d)      => API.post('/auth/login', d);

// Courses
export const getAllCourses         = ()       => API.get('/courses');
export const getTeacherCourses     = ()       => API.get('/courses/teacher-courses');
export const getTeacherStats       = ()       => API.get('/courses/teacher-stats');
export const createCourse          = (d)      => API.post('/courses', d);
export const deleteCourse          = (id)     => API.delete(`/courses/${id}`);

// Enrollments
export const enrollInCourse        = (cid)    => API.post('/enrollments/enroll', { courseId: cid });
export const getMyCourses          = ()       => API.get('/enrollments/my-courses');
export const unenrollFromCourse    = (cid)    => API.delete(`/enrollments/${cid}`);
export const getCourseStudents     = (cid)    => API.get(`/enrollments/students/${cid}`);
export const getAllStudents         = ()       => API.get('/enrollments/all-students');
export const getStudentProfile     = (sid)    => API.get(`/enrollments/student-profile/${sid}`);

// Materials
export const addMaterial           = (data)   => API.post(`/materials`, data);
export const addMaterialForm       = (data)   => API.post(`/materials`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
export const getCourseMaterials    = (id)     => API.get(`/materials/course/${id}`);
export const deleteMaterial        = (id)     => API.delete(`/materials/${id}`);

// Quizzes
export const createQuiz            = (d)      => API.post('/quizzes', d);
export const getCourseQuizzes      = (cid)    => API.get(`/quizzes/course/${cid}`);
export const getQuiz               = (id)     => API.get(`/quizzes/${id}`);
export const submitQuiz            = (id, d)  => API.post(`/quizzes/${id}/submit`, d);
export const getMyQuizResult       = (id)     => API.get(`/quizzes/${id}/my-result`);
export const deleteQuiz            = (id)     => API.delete(`/quizzes/${id}`);

// Progress
export const getCourseProgress     = (cid)    => API.get(`/progress/teacher/${cid}`);
export const getMyProgress         = (cid)    => API.get(`/progress/student/${cid}`);
export const getFullStudentProgress= (sid)    => API.get(`/progress/student-full/${sid}`);

// AI / ML
export const getTeacherInsights    = ()       => API.get(`/ai/insights`);

// Inbox / Direct Support
export const sendDirectMaterial    = (data)   => API.post(`/inbox/send`, data);
export const getMyInbox            = ()       => API.get(`/inbox/my-inbox`);

export default API;
