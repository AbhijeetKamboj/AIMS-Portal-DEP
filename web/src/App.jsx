import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyAdvisorDashboard from "./pages/FacultyAdvisorDashboard";
import CourseDetail from "./pages/CourseDetail";
import "./App.css";

function RootRedirect() {
  const { role } = useAuth();
  
  // Map roles to routes (support both old and new role names)
  const roleMap = {
    teacher: "/faculty",
    faculty: "/faculty",
    student: "/student",
    admin: "/admin",
    faculty_advisor: "/advisor",
  };
  
  const route = roleMap[role];
  if (route) {
    return <Navigate to={route} replace />;
  }
  
  return <Navigate to="/login" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/student"
                    element={
                        <ProtectedRoute role="student">
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/faculty"
                    element={
                        <ProtectedRoute role="faculty">
                            <FacultyDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teacher"
                    element={
                        <ProtectedRoute role="teacher">
                            <FacultyDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/advisor"
                    element={
                        <ProtectedRoute role="faculty_advisor">
                            <FacultyAdvisorDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/courses/:id"
                    element={
                        <ProtectedRoute>
                            <CourseDetail />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;