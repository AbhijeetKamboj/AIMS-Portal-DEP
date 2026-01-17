import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-secondary)",
        }}
      >
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;

  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  return children;
}
