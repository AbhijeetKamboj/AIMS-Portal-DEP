import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { role } = useAuth();

  useEffect(() => {
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
  }, [role, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        padding: "var(--spacing-xl)",
      }}
    >
      <Card
        style={{
          maxWidth: "400px",
          width: "100%",
          padding: "var(--spacing-2xl)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "var(--spacing-xl)" }}>
          <h1 style={{ color: "var(--primary)", marginBottom: "var(--spacing-sm)" }}>
            🎓 Welcome Back
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Sign in to your Academic Portal account
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div className="message message-error" style={{ marginBottom: "var(--spacing-md)" }}>
              {error}
            </div>
          )}

          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            style={{ marginTop: "var(--spacing-md)" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div
          style={{
            marginTop: "var(--spacing-xl)",
            textAlign: "center",
            paddingTop: "var(--spacing-lg)",
            borderTop: "1px solid var(--gray-200)",
          }}
        >
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Don't have an account?{" "}
            <a
              href="/signup"
              style={{
                color: "var(--primary)",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Sign up here
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
