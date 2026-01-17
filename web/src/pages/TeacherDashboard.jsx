import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [myCourses, setMyCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data || !data.session) {
      throw new Error("No active session. Please log in again.");
    }
    return data.session.access_token;
  };

  const enrollStudent = async (courseId) => {
    if (!studentEmail.trim()) {
      setError("Please enter a student email");
      return;
    }

    setError("");
    setLoading(true);
    
    try {
      const token = await getToken();
      console.log("Starting enrollment process for:", studentEmail.trim());

      // 1️⃣ find student by email
      const studentSearchUrl = `${API_BASE}/students?email=${encodeURIComponent(studentEmail.trim())}`;
      console.log("Searching student at:", studentSearchUrl);
      
      const res = await fetch(studentSearchUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Student search response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Student not found" }));
        const errorMsg = errorData.error || `Failed to find student (Status: ${res.status})`;
        console.error("Student search error:", errorMsg, errorData);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const student = await res.json();
      console.log("Found student:", student);

      if (!student || !student.id) {
        setError("Student not found - invalid response");
        setLoading(false);
        return;
      }

      // 2️⃣ enroll student
      const enrollUrl = `${API_BASE}/enrollments/teacher`;
      console.log("Enrolling student at:", enrollUrl, { courseId, studentId: student.id });
      
      const enrollRes = await fetch(enrollUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          studentId: student.id,
        }),
      });

      console.log("Enrollment response status:", enrollRes.status);

      if (!enrollRes.ok) {
        const errorData = await enrollRes.json().catch(() => ({ error: "Enrollment failed" }));
        const errorMsg = errorData.error || `Enrollment failed (Status: ${enrollRes.status})`;
        console.error("Enrollment error:", errorMsg, errorData);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const successData = await enrollRes.json();
      console.log("Enrollment success:", successData);
      alert(successData.message || "Student enrolled successfully");
      setStudentEmail("");
      setSelectedCourse(null);
      setError("");
    } catch (err) {
      console.error("Enrollment error:", err);
      setError(`An error occurred: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/courses/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Failed to fetch courses");
        return;
      }

      const data = await res.json();
      setMyCourses(data);
    } catch (err) {
      setError("An error occurred while fetching courses");
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);
    const token = await getToken();

    try {
      const res = await fetch(`${API_BASE}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) {
        setError("Course creation failed");
        return;
      }

      setTitle("");
      setDescription("");
      fetchMyCourses();
    } catch (err) {
      setError("An error occurred while creating course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  return (
    <Layout title="Teacher Dashboard">
      {error && (
        <div className="message message-error" style={{ marginBottom: "var(--spacing-md)" }}>
          {error}
        </div>
      )}

      <Card>
        <h2 style={{ marginBottom: "var(--spacing-lg)", color: "var(--primary)" }}>
          Create New Course
        </h2>
        <form onSubmit={createCourse}>
          <Input
            placeholder="Course title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            required
          />

          <textarea
            placeholder="Course description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            required
            style={{
              width: "100%",
              padding: "var(--spacing-md)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--gray-300)",
              fontSize: "1rem",
              fontFamily: "inherit",
              minHeight: "100px",
              resize: "vertical",
              marginBottom: "var(--spacing-md)",
            }}
          />

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </form>
      </Card>

      <div style={{ marginTop: "var(--spacing-xl)" }}>
        <h2 style={{ marginBottom: "var(--spacing-lg)", color: "var(--text-primary)" }}>
          My Courses ({myCourses.length})
        </h2>

        {loading && myCourses.length === 0 ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : myCourses.length === 0 ? (
          <Card>
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <p>No courses yet. Create your first course above!</p>
            </div>
          </Card>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "var(--spacing-lg)",
            }}
          >
            {myCourses.map((course) => (
              <Card
                key={course.id}
                style={{
                  border: "2px solid transparent",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "var(--spacing-md)",
                  }}
                >
                  <h3 style={{ margin: 0, color: "var(--primary)", flex: 1 }}>
                    {course.title}
                  </h3>
                </div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    marginBottom: "var(--spacing-md)",
                    minHeight: "40px",
                  }}
                >
                  {course.description || "No description"}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "var(--spacing-sm)",
                    marginTop: "var(--spacing-md)",
                  }}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      navigate(`/courses/${course.id}`);
                    }}
                  >
                    View Course
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCourse(course.id);
                      setStudentEmail("");
                      setError("");
                    }}
                  >
                    Enroll Student
                  </Button>
                </div>

                {selectedCourse === course.id && (
                  <div
                    style={{
                      marginTop: "var(--spacing-md)",
                      paddingTop: "var(--spacing-md)",
                      borderTop: "1px solid var(--gray-200)",
                    }}
                  >
                    <Input
                      placeholder="Student email"
                      value={studentEmail}
                      onChange={(e) => {
                        setStudentEmail(e.target.value);
                        setError("");
                      }}
                      disabled={loading}
                      style={{ marginBottom: "var(--spacing-sm)" }}
                    />
                    <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                      <Button
                        size="sm"
                        onClick={() => {
                          enrollStudent(course.id);
                        }}
                        disabled={loading}
                      >
                        {loading ? "Enrolling..." : "Enroll"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(null);
                          setStudentEmail("");
                          setError("");
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
