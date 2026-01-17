import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myCourses, setMyCourses] = useState([]);
  const [courseApprovals, setCourseApprovals] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("courses");

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data || !data.session) {
      throw new Error("No active session");
    }
    return data.session.access_token;
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

  const fetchCourseApprovals = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/course-approvals/my-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setCourseApprovals([]);
        return;
      }

      const data = await res.json();
      setCourseApprovals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching approvals:", err);
      setCourseApprovals([]);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setPendingRequests([]);
        return;
      }

      const data = await res.json();
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setPendingRequests([]);
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
        const errorData = await res.json().catch(() => ({ error: "Course creation failed" }));
        setError(errorData.error || "Course creation failed");
        return;
      }

      const data = await res.json();
      alert(data.message || "Course created! Awaiting admin and advisor approval.");
      setTitle("");
      setDescription("");
      fetchMyCourses();
      fetchCourseApprovals();
    } catch (err) {
      setError("An error occurred while creating course");
    } finally {
      setLoading(false);
    }
  };

  const enrollStudentByEmail = async (courseId) => {
    if (!studentEmail.trim()) {
      setError("Please enter a student email");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const token = await getToken();

      // Find student by email
      const studentRes = await fetch(
        `${API_BASE}/students?email=${encodeURIComponent(studentEmail.trim())}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!studentRes.ok) {
        const errorData = await studentRes.json().catch(() => ({ error: "Student not found" }));
        setError(errorData.error || "Student not found");
        setLoading(false);
        return;
      }

      const student = await studentRes.json();

      if (!student || !student.id) {
        setError("Student not found");
        setLoading(false);
        return;
      }

      // Enroll student directly
      const enrollRes = await fetch(`${API_BASE}/enrollments/faculty/enroll`, {
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

      if (!enrollRes.ok) {
        const errorData = await enrollRes.json().catch(() => ({ error: "Enrollment failed" }));
        setError(errorData.error || "Enrollment failed");
        setLoading(false);
        return;
      }

      alert("Student enrolled successfully");
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

  const handleRequestAction = async (requestId, action, reason = "") => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/${requestId}/faculty-action`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Action failed" }));
        setError(errorData.error || "Action failed");
        return;
      }

      alert(`Request ${action === "approve" ? "approved" : "rejected"} successfully`);
      fetchPendingRequests();
    } catch (err) {
      setError("An error occurred");
    }
  };

  useEffect(() => {
    fetchMyCourses();
    fetchCourseApprovals();
    fetchPendingRequests();
  }, []);

  return (
    <Layout title="Faculty Dashboard">
      {error && (
        <div className="message message-error" style={{ marginBottom: "var(--spacing-md)" }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "var(--spacing-sm)",
          marginBottom: "var(--spacing-xl)",
          borderBottom: "2px solid var(--gray-200)",
        }}
      >
        {["courses", "requests", "approvals"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "var(--spacing-md) var(--spacing-lg)",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab ? "3px solid var(--primary)" : "3px solid transparent",
              color: activeTab === tab ? "var(--primary)" : "var(--text-secondary)",
              fontWeight: activeTab === tab ? "600" : "400",
              cursor: "pointer",
              textTransform: "capitalize",
              fontSize: "1rem",
              transition: "all var(--transition-fast)",
            }}
          >
            {tab === "requests" ? "Enrollment Requests" : tab === "approvals" ? "Course Approvals" : "My Courses"}
          </button>
        ))}
      </div>

      {/* My Courses Tab */}
      {activeTab === "courses" && (
        <div>
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
                {myCourses.map((course) => {
                  const approval = courseApprovals.find((a) => a.course?.id === course.id);
                  return (
                    <Card key={course.id}>
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
                        {approval && (
                          <span
                            style={{
                              background:
                                approval.status === "approved"
                                  ? "var(--success)"
                                  : approval.status === "rejected"
                                  ? "var(--error)"
                                  : "var(--warning)",
                              color: "white",
                              padding: "var(--spacing-xs) var(--spacing-sm)",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                            }}
                          >
                            {approval.status.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                          marginBottom: "var(--spacing-md)",
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
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          View Course
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCourse(course.id);
                            setStudentEmail("");
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
                              onClick={() => enrollStudentByEmail(course.id)}
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
                              }}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enrollment Requests Tab */}
      {activeTab === "requests" && (
        <div>
          <h2 style={{ marginBottom: "var(--spacing-lg)", color: "var(--text-primary)" }}>
            Pending Enrollment Requests ({pendingRequests.length})
          </h2>

          {pendingRequests.length === 0 ? (
            <Card>
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p>No pending enrollment requests.</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "var(--spacing-md)",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: "var(--spacing-sm)", color: "var(--primary)" }}>
                        {request.course?.title || "Course"}
                      </h3>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-sm)" }}>
                        <strong>Student:</strong> {request.student?.name} ({request.student?.email})
                      </p>
                      <small style={{ color: "var(--text-tertiary)" }}>
                        Requested: {new Date(request.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleRequestAction(request.id, "approve")}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          const reason = prompt("Reason for rejection (optional):");
                          if (reason !== null) {
                            handleRequestAction(request.id, "reject", reason);
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Course Approvals Tab */}
      {activeTab === "approvals" && (
        <div>
          <h2 style={{ marginBottom: "var(--spacing-lg)", color: "var(--text-primary)" }}>
            Course Approval Status
          </h2>

          {courseApprovals.length === 0 ? (
            <Card>
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <p>No course approvals found.</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              {courseApprovals.map((approval) => (
                <Card key={approval.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "var(--spacing-md)",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: "var(--spacing-sm)", color: "var(--primary)" }}>
                        {approval.course?.title || "Course"}
                      </h3>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-sm)" }}>
                        {approval.course?.description || "No description"}
                      </p>
                      <div style={{ display: "flex", gap: "var(--spacing-lg)", flexWrap: "wrap", fontSize: "0.875rem" }}>
                        <span style={{ color: "var(--text-secondary)" }}>
                          Created: {new Date(approval.created_at).toLocaleDateString()}
                        </span>
                        {approval.admin_approval_at && (
                          <span style={{ color: "var(--success)" }}>
                            ✓ Approved by Admin: {new Date(approval.admin_approval_at).toLocaleDateString()}
                          </span>
                        )}
                        {approval.advisor_approval_at && (
                          <span style={{ color: "var(--success)" }}>
                            ✓ Approved by Advisor: {new Date(approval.advisor_approval_at).toLocaleDateString()}
                          </span>
                        )}
                        {approval.rejected_at && (
                          <span style={{ color: "var(--error)" }}>
                            ✗ Rejected: {new Date(approval.rejected_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {approval.rejection_reason && (
                        <p style={{ color: "var(--error)", fontSize: "0.875rem", marginTop: "var(--spacing-sm)" }}>
                          Reason: {approval.rejection_reason}
                        </p>
                      )}
                    </div>
                    <div>
                      <span
                        style={{
                          background:
                            approval.status === "approved"
                              ? "var(--success)"
                              : approval.status === "rejected"
                              ? "var(--error)"
                              : "var(--warning)",
                          color: "white",
                          padding: "var(--spacing-xs) var(--spacing-md)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {approval.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
