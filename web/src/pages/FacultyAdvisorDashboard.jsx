import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function FacultyAdvisorDashboard() {
  const { user } = useAuth();
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("enrollments");

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data || !data.session) {
      throw new Error("No active session");
    }
    return data.session.access_token;
  };

  const fetchPendingEnrollments = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/advisor/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setPendingEnrollments([]);
        return;
      }

      const data = await res.json();
      setPendingEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      setPendingEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCourses = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/course-approvals/advisor/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setPendingCourses([]);
        return;
      }

      const data = await res.json();
      setPendingCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setPendingCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentAction = async (requestId, action, reason = "") => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/${requestId}/advisor-action`, {
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

      alert(`Enrollment request ${action === "approve" ? "approved" : "rejected"} successfully`);
      fetchPendingEnrollments();
    } catch (err) {
      setError("An error occurred");
    }
  };

  const handleCourseAction = async (approvalId, action, reason = "") => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/course-approvals/${approvalId}/advisor-action`, {
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

      alert(`Course ${action === "approve" ? "approved" : "rejected"} successfully`);
      fetchPendingCourses();
    } catch (err) {
      setError("An error occurred");
    }
  };

  const fetchAllCourses = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setAllCourses([]);
        return;
      }

      const data = await res.json();
      setAllCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setAllCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEnrollments = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollments/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setAllEnrollments([]);
        return;
      }

      const data = await res.json();
      setAllEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      setAllEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEnrollments();
    fetchPendingCourses();
    fetchAllCourses();
    fetchAllEnrollments();
  }, []);

  return (
    <Layout title="Faculty Advisor Dashboard">
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
        {["enrollments", "courses", "all-courses", "all-enrollments"].map((tab) => (
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
            {tab === "enrollments" ? "Enrollment Requests" : tab === "courses" ? "Course Approvals" : tab === "all-courses" ? "All Courses":""}
          </button>
        ))}
      </div>

      {/* Enrollment Requests Tab */}
      {activeTab === "enrollments" && (
        <div>
          <h2 style={{ marginBottom: "var(--spacing-lg)", color: "var(--text-primary)" }}>
            Pending Enrollment Requests ({pendingEnrollments.length})
          </h2>

          {loading && pendingEnrollments.length === 0 ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : pendingEnrollments.length === 0 ? (
            <Card>
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <p>No pending enrollment requests.</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              {pendingEnrollments.map((request) => (
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
                      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-sm)", fontSize: "0.9rem" }}>
                        <strong>Faculty:</strong> {request.course?.teacher?.name}
                      </p>
                      <small style={{ color: "var(--text-tertiary)" }}>
                        Approved by Faculty: {new Date(request.faculty_approval_at).toLocaleDateString()}
                      </small>
                    </div>
                    <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleEnrollmentAction(request.id, "approve")}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          const reason = prompt("Reason for rejection (optional):");
                          if (reason !== null) {
                            handleEnrollmentAction(request.id, "reject", reason);
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
      {activeTab === "courses" && (
        <div>
          <h2 style={{ marginBottom: "var(--spacing-lg)", color: "var(--text-primary)" }}>
            Pending Course Approvals ({pendingCourses.length})
          </h2>

          {loading && pendingCourses.length === 0 ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : pendingCourses.length === 0 ? (
            <Card>
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <p>No pending course approvals.</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              {pendingCourses.map((approval) => (
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
                      <div style={{ marginTop: "var(--spacing-md)" }}>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "var(--spacing-xs)" }}>
                          <strong>Faculty:</strong> {approval.course?.teacher?.name} ({approval.course?.teacher?.email})
                        </p>
                        <small style={{ color: "var(--text-tertiary)" }}>
                          Approved by Admin: {new Date(approval.admin_approval_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleCourseAction(approval.id, "approve")}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          const reason = prompt("Reason for rejection (optional):");
                          if (reason !== null) {
                            handleCourseAction(approval.id, "reject", reason);
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

      {/* All Courses Tab */}
      {activeTab === "all-courses" && (
        <div>
          <h2 style={{ marginBottom: "var(--spacing-lg)", color: "var(--text-primary)" }}>
            All Courses ({allCourses.length})
          </h2>

          {loading && allCourses.length === 0 ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : allCourses.length === 0 ? (
            <Card>
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <p>No courses found.</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              {allCourses.map((course) => (
                <Card key={course.id}>
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
                        {course.title}
                      </h3>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-sm)" }}>
                        {course.description || "No description"}
                      </p>
                      <div style={{ marginTop: "var(--spacing-md)" }}>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "var(--spacing-xs)" }}>
                          <strong>Faculty:</strong> {course.teacher?.name || "N/A"} ({course.teacher?.email || "N/A"})
                        </p>
                        <small style={{ color: "var(--text-tertiary)" }}>
                          Status: {course.status || "N/A"} | Created: {new Date(course.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.location.href = `/courses/${course.id}`}
                    >
                      View Course
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Enrollments Tab */}
      {activeTab === "all-enrollments" && (
        <div>
          <h2 style={{ marginBottom: "var(--spacing-lg)", color: "var(--text-primary)" }}>
            All Enrollments ({allEnrollments.length})
          </h2>

          {loading && allEnrollments.length === 0 ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : allEnrollments.length === 0 ? (
            <Card>
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <p>No enrollments found.</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              {allEnrollments.map((enrollment) => (
                <Card key={`${enrollment.student_id}-${enrollment.course_id}`}>
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
                        {enrollment.course?.title || "Course"}
                      </h3>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-sm)" }}>
                        <strong>Student:</strong> {enrollment.student?.name || "N/A"} ({enrollment.student?.email || "N/A"})
                      </p>
                      <small style={{ color: "var(--text-tertiary)" }}>
                        Status: {enrollment.status || "active"} | Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </small>
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
