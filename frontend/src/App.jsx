import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import FacultyDashboard from "./pages/faculty/FacultyDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import FacultyBulkEnroll from "./pages/faculty/FacultyBulkEnroll.jsx";
import MeetingScheduler from "./components/MeetingScheduler.jsx";
import RoleLoader from "./pages/RoleLoader.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={<Login />} />
                <Route path="/loading" element={<RoleLoader />} />


                <Route path="/student" element={
                    <ProtectedRoute allow={["student"]}>
                        <StudentDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/faculty" element={
                    <ProtectedRoute allow={["faculty"]}>
                        <FacultyDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/faculty/bulk-enroll" element={
                    <ProtectedRoute allow={["faculty"]}>
                        <FacultyBulkEnroll />
                    </ProtectedRoute>
                } />
                <Route path="/faculty/meetings" element={
                    <ProtectedRoute allow={["faculty"]}>
                        <div className="p-8"><MeetingScheduler userRole="faculty" /></div>
                    </ProtectedRoute>
                } />

                <Route path="/admin" element={
                    <ProtectedRoute allow={["admin"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

            </Routes>
        </BrowserRouter>
    );
}
