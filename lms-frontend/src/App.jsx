import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import CourseDetail from './pages/CourseDetail';
import QuizPage from './pages/QuizPage';
import InstructorDashboard from './pages/InstructorDashboard';
import InstructorLeaderboard from './pages/InstructorLeaderboard';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard'} replace />;
  }

  return children;
}

function RootRedirect() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard'} replace />;
}

// Wrapper to map route parameters to QuizPage props
function QuizPageWrapper() {
  const { quizId } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return <QuizPage quizId={quizId} userId={user.id} userName={user.name} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Student Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/course/:id" element={
          <ProtectedRoute allowedRoles={['student']}>
            <CourseDetail />
          </ProtectedRoute>
        } />

        <Route path="/quiz/:quizId" element={
          <ProtectedRoute allowedRoles={['student']}>
            <QuizPageWrapper />
          </ProtectedRoute>
        } />

        {/* Instructor Routes */}
        <Route path="/instructor/dashboard" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/instructor/leaderboard/:quizId" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorLeaderboard />
          </ProtectedRoute>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
