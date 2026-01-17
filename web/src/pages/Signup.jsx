import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const user = data.user;

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          name: form.name,
          role: form.role,
        },
      ]);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
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
          maxWidth: "450px",
          width: "100%",
          padding: "var(--spacing-2xl)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "var(--spacing-xl)" }}>
          <h1 style={{ color: "var(--primary)", marginBottom: "var(--spacing-sm)" }}>
            🎓 Create Account
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Join the Academic Portal community
          </p>
        </div>

        <form onSubmit={handleSignup}>
          {error && (
            <div className="message message-error" style={{ marginBottom: "var(--spacing-md)" }}>
              {error}
            </div>
          )}

          <Input
            name="name"
            label="Full Name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <Input
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Create a password (min. 6 characters)"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <Input
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <div style={{ marginBottom: "var(--spacing-md)" }}>
            <label
              style={{
                display: "block",
                marginBottom: "var(--spacing-xs)",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "var(--text-primary)",
              }}
            >
              I am a
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={loading}
              style={{
                width: "100%",
                padding: "var(--spacing-md)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--gray-300)",
                fontSize: "1rem",
                fontFamily: "inherit",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="faculty_advisor">Faculty Advisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            style={{ marginTop: "var(--spacing-md)" }}
          >
            {loading ? "Creating account..." : "Create Account"}
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
            Already have an account?{" "}
            <a
              href="/login"
              style={{
                color: "var(--primary)",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Sign in here
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
