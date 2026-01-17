import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function AdminDashboard() {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("approvals");

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data || !data.session) {
      throw new Error("No active session");
    }
    return data.session.access_token;
  };

  const fetchPendingApprovals = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/course-approvals/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to fetch pending approvals" }));
        const errorMsg = errorData.error || `Failed to fetch pending approvals (Status: ${res.status})`;
        console.error("Fetch error:", errorMsg, errorData);
        setError(errorMsg);
        setPendingApprovals([]);
        return;
      }

      const data = await res.json();
      console.log("Pending approvals:", data);
      setPendingApprovals(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching approvals:", err);
      setError(`An error occurred: ${err.message || "Failed to fetch approvals"}`);
      setPendingApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (approvalId, action, reason = "") => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/course-approvals/${approvalId}/admin-action`, {
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
      fetchPendingApprovals();
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
    fetchPendingApprovals();
    fetchAllCourses();
    fetchAllEnrollments();
  }, []);

  return (
    <Layout title="Admin Dashboard">
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
        {["approvals", "courses", "enrollments"].map((tab) => (
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
            {tab === "approvals" ? "Pending Approvals" : tab === "enrollments" ? "All Enrollments" : "All Courses"}
          </button>
        ))}
      </div>

      {/* Approvals Tab */}
      {activeTab === "approvals" && (
        <div>
          <h2 style={{ marginBottom: "var(--spacing-lg)", color: "var(--text-primary)" }}>
            Pending Course Approvals ({pendingApprovals.length})
          </h2>

      {loading && pendingApprovals.length === 0 ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : pendingApprovals.length === 0 ? (
        <Card>
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <p>No pending course approvals.</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          {pendingApprovals.map((approval) => (
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
                      Created: {new Date(approval.created_at).toLocaleDateString()}
                    </small>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprovalAction(approval.id, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      const reason = prompt("Reason for rejection (optional):");
                      if (reason !== null) {
                        handleApprovalAction(approval.id, "reject", reason);
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

      {/* Courses Tab */}
      {activeTab === "courses" && (
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

      {/* Enrollments Tab */}
      {activeTab === "enrollments" && (
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
