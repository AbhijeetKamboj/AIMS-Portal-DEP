import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Fetch all approved courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Failed to fetch courses");
        return;
      }

      const data = await res.json();
      setCourses(data);
      setFilteredCourses(data);
    } catch (err) {
      setError("An error occurred while fetching courses");
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrolled courses
  const fetchMyCourses = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollments/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setMyCourses([]);
        return;
      }

      const data = await res.json();
      setMyCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Enrollment fetch error:", err);
      setMyCourses([]);
    }
  };

  // Fetch enrollment requests
  const fetchMyRequests = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/my-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setMyRequests([]);
        return;
      }

      const data = await res.json();
      setMyRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Request fetch error:", err);
      setMyRequests([]);
    }
  };

  // Request enrollment in a course
  const requestEnrollment = async (courseId) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/request/${courseId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Request failed" }));
        setError(errorData.error || "Failed to request enrollment");
        return;
      }

      alert("Enrollment request submitted! Waiting for faculty and advisor approval.");
      fetchMyRequests();
    } catch (err) {
      setError("An error occurred while requesting enrollment");
    }
  };

  // Drop a course
  const dropCourse = async (courseId) => {
    if (!confirm("Are you sure you want to drop this course?")) return;

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollments/drop/${courseId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Drop failed" }));
        setError(errorData.error || "Failed to drop course");
        return;
      }

      alert("Course dropped successfully");
      fetchMyCourses();
    } catch (err) {
      setError("An error occurred while dropping course");
    }
  };

  // Withdraw from a course
  const withdrawCourse = async (courseId) => {
    if (!confirm("Are you sure you want to withdraw from this course?")) return;

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollments/withdraw/${courseId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Withdraw failed" }));
        setError(errorData.error || "Failed to withdraw from course");
        return;
      }

      alert("Course withdrawn successfully");
      fetchMyCourses();
    } catch (err) {
      setError("An error occurred while withdrawing from course");
    }
  };

  // Search courses
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const filtered = courses.filter(
      (course) =>
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  // Check enrollment status
  const getEnrollmentStatus = (courseId) => {
    // Check if enrolled (active status)
    const enrollment = myCourses.find((e) => e.course_id === courseId && e.status === "active");
    if (enrollment) {
      return { type: "enrolled", status: "active" };
    }

    // Check if there's a pending or approved request
    const request = myRequests.find((r) => r.course?.id === courseId);
    if (request) {
      // If request is enrolled, treat as enrolled
      if (request.status === "enrolled") {
        return { type: "enrolled", status: "active" };
      }
      return { type: "requested", status: request.status };
    }

    return { type: "none" };
  };

  useEffect(() => {
    fetchCourses();
    fetchMyCourses();
    fetchMyRequests();
  }, []);

  const activeCourses = myCourses.filter((e) => e.status === "active");

  return (
    <Layout title="Student Dashboard">
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
        {["courses", "my-courses", "requests"].map((tab) => (
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
            {tab === "my-courses" ? "My Courses" : tab === "requests" ? "My Requests" : "Browse Courses"}
          </button>
        ))}
      </div>

      {/* Browse Courses Tab */}
      {activeTab === "courses" && (
        <div>
          <Card style={{ marginBottom: "var(--spacing-xl)" }}>
            <Input
              placeholder="Search courses by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </Card>

          <h2 style={{ marginBottom: "var(--spacing-lg)", color: "var(--text-primary)" }}>
            Available Courses ({filteredCourses.length})
          </h2>

          {loading && courses.length === 0 ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <Card>
              <div className="empty-state">
                <div className="empty-state-icon">📖</div>
                <p>{searchQuery ? "No courses match your search." : "No courses available at the moment."}</p>
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
              {filteredCourses.map((course) => {
                const enrollmentStatus = getEnrollmentStatus(course.id);
                return (
                  <Card
                    key={course.id}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    style={{
                      cursor: "pointer",
                      border:
                        enrollmentStatus.type === "enrolled"
                          ? "2px solid var(--success)"
                          : enrollmentStatus.type === "requested"
                          ? "2px solid var(--warning)"
                          : "2px solid transparent",
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
                      {enrollmentStatus.type === "enrolled" && (
                        <span
                          style={{
                            background: "var(--success)",
                            color: "white",
                            padding: "var(--spacing-xs) var(--spacing-sm)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          Enrolled
                        </span>
                      )}
                      {enrollmentStatus.type === "requested" && (
                        <span
                          style={{
                            background: "var(--warning)",
                            color: "white",
                            padding: "var(--spacing-xs) var(--spacing-sm)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          {enrollmentStatus.status === "pending"
                            ? "Pending"
                            : enrollmentStatus.status === "approved_by_faculty"
                            ? "Approved by Faculty"
                            : "Processing"}
                        </span>
                      )}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/courses/${course.id}`);
                        }}
                      >
                        View Details
                      </Button>
                      {enrollmentStatus.type === "none" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            requestEnrollment(course.id);
                          }}
                        >
                          Request Enrollment
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Courses Tab */}
      {activeTab === "my-courses" && (
        <div>
          <h2 style={{ marginBottom: "var(--spacing-lg)", color: "var(--text-primary)" }}>
            My Enrolled Courses ({activeCourses.length})
          </h2>

          {activeCourses.length === 0 ? (
            <Card>
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <p>You haven't enrolled in any courses yet.</p>
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
              {activeCourses.map((enrollment) => (
                <Card
                  key={enrollment.course_id}
                  style={{
                    border: "2px solid var(--success)",
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
                      {enrollment.courses?.title || "Course"}
                    </h3>
                    <span
                      style={{
                        background: "var(--success)",
                        color: "white",
                        padding: "var(--spacing-xs) var(--spacing-sm)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                      }}
                    >
                      Active
                    </span>
                  </div>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                      marginBottom: "var(--spacing-md)",
                    }}
                  >
                    {enrollment.courses?.description || "No description"}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "var(--spacing-md)",
                      paddingTop: "var(--spacing-md)",
                      borderTop: "1px solid var(--gray-200)",
                    }}
                  >
                    <small style={{ color: "var(--text-tertiary)", fontSize: "0.8rem" }}>
                      Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </small>
                    <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/courses/${enrollment.course_id}`)}
                      >
                        Open
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => dropCourse(enrollment.course_id)}
                      >
                        Drop
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => withdrawCourse(enrollment.course_id)}
                      >
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === "requests" && (
        <div>
          <h2 style={{ marginBottom: "var(--spacing-lg)", color: "var(--text-primary)" }}>
            My Enrollment Requests ({myRequests.length})
          </h2>

          {myRequests.length === 0 ? (
            <Card>
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p>No enrollment requests yet.</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              {myRequests.map((request) => (
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
                        {request.course?.description || "No description"}
                      </p>
                      <div style={{ display: "flex", gap: "var(--spacing-lg)", flexWrap: "wrap", fontSize: "0.875rem" }}>
                        <span style={{ color: "var(--text-secondary)" }}>
                          Requested: {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        {request.faculty_approval_at && (
                          <span style={{ color: "var(--success)" }}>
                            ✓ Approved by Faculty: {new Date(request.faculty_approval_at).toLocaleDateString()}
                          </span>
                        )}
                        {request.advisor_approval_at && (
                          <span style={{ color: "var(--success)" }}>
                            ✓ Approved by Advisor: {new Date(request.advisor_approval_at).toLocaleDateString()}
                          </span>
                        )}
                        {request.rejected_at && (
                          <span style={{ color: "var(--error)" }}>
                            ✗ Rejected: {new Date(request.rejected_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {request.rejection_reason && (
                        <p style={{ color: "var(--error)", fontSize: "0.875rem", marginTop: "var(--spacing-sm)" }}>
                          Reason: {request.rejection_reason}
                        </p>
                      )}
                    </div>
                    <div>
                      <span
                        style={{
                          background:
                            request.status === "enrolled"
                              ? "var(--success)"
                              : request.status === "rejected"
                              ? "var(--error)"
                              : request.status === "approved_by_faculty"
                              ? "var(--info)"
                              : "var(--warning)",
                          color: "white",
                          padding: "var(--spacing-xs) var(--spacing-md)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {request.status.replace(/_/g, " ")}
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
