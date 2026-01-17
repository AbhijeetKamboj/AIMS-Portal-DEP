import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

export default function Layout({ title, children }) {
  const navigate = useNavigate();
  const { user, logout, role } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDashboardClick = () => {
    const roleMap = {
      student: "/student",
      faculty: "/faculty",
      teacher: "/faculty", // backward compatibility
      admin: "/admin",
      faculty_advisor: "/advisor",
    };
    
    if (role && roleMap[role]) {
      navigate(roleMap[role]);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)" }}>
      <header
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
          color: "white",
          padding: "var(--spacing-lg) var(--spacing-xl)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--spacing-md)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: "700",
                cursor: "pointer",
              }}
              onClick={handleDashboardClick}
            >
              🎓 Academic Portal
            </h1>
            {title && (
              <span
                style={{
                  fontSize: "1rem",
                  opacity: 0.9,
                  fontWeight: "400",
                }}
              >
                — {title}
              </span>
            )}
          </div>
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-md)",
            }}
          >
            {user && (
              <span
                style={{
                  fontSize: "0.9rem",
                  opacity: 0.9,
                }}
              >
                {user.name || user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "var(--spacing-xl)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
