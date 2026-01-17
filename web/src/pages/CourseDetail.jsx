import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function CourseDetail() {
    const { id } = useParams();
  const navigate = useNavigate();
    const { user, role } = useAuth();

    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState({}); // { assignmentId: [submissions] }
  const [gradeInput, setGradeInput] = useState({}); // { submissionId: { marks, feedback } }
  const [mySubmissions, setMySubmissions] = useState({}); // { assignmentId: submission }
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("announcements");
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");

    const getToken = async () => {
        const { data } = await supabase.auth.getSession();
    if (!data || !data.session) {
      throw new Error("No active session");
    }
        return data.session.access_token;
    };

    const fetchCourse = async () => {
    setLoading(true);
    try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/courses/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to fetch course details" }));
        const errorMsg = errorData.error || `Failed to fetch course details (Status: ${res.status})`;
        console.error("Course fetch error:", errorMsg, errorData);
        setError(errorMsg);
        setLoading(false);
        return;
      }

        const data = await res.json();
      console.log("Course data:", data);
        setCourse(data);
      setError("");
      
      // Check enrollment status if student
      if (role === "student") {
        await checkEnrollmentStatus();
      }
    } catch (err) {
      console.error("Error fetching course:", err);
      setError(`An error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
    };
    
    const checkEnrollmentStatus = async () => {
      try {
        const token = await getToken();
        
        // Check if enrolled
        const enrollRes = await fetch(`${API_BASE}/enrollments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (enrollRes.ok) {
          const enrollments = await enrollRes.json();
          const enrolled = enrollments.some((e) => e.course_id === id && e.status === "active");
          setIsEnrolled(enrolled);
        }
        
        // Check if has pending request
        const requestRes = await fetch(`${API_BASE}/enrollment-requests/my-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (requestRes.ok) {
          const requests = await requestRes.json();
          const pending = requests.some(
            (r) => r.course?.id === id && (r.status === "pending" || r.status === "approved_by_faculty" || r.status === "enrolled")
          );
          setHasPendingRequest(pending);
        }
      } catch (err) {
        console.error("Error checking enrollment status:", err);
      }
    };

    const fetchStudents = async () => {
    // Show enrollments to all stakeholders
    setStudentsLoading(true);
    setStudentsError("");
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollments/course/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch students:", res.status);
        setStudents([]);
        setStudentsError("Failed to load enrolled students");
        setStudentsLoading(false);
        return;
      }

      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
      setStudentsLoading(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudents([]);
      setStudentsError("An error occurred while loading enrollments");
      setStudentsLoading(false);
    }
  };

    const fetchAnnouncements = async () => {
    try {
        const token = await getToken();
      const res = await fetch(`${API_BASE}/announcements/course/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
      });

      if (!res.ok) return;

        const data = await res.json();
        setAnnouncements(data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
    };

    const fetchAssignments = async () => {
    try {
        const token = await getToken();
      const res = await fetch(`${API_BASE}/assignments/course/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

        const data = await res.json();
        setAssignments(data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
    };

    const fetchSubmissions = async (assignmentId) => {
    try {
        const token = await getToken();
        const res = await fetch(
            `${API_BASE}/submissions/assignment/${assignmentId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

      if (!res.ok) return;

        const data = await res.json();
      setSubmissions((prev) => ({ ...prev, [assignmentId]: data }));
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
    };

    const fetchMySubmission = async (assignmentId) => {
    try {
        const token = await getToken();
        const res = await fetch(
            `${API_BASE}/submissions/my/${assignmentId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (res.ok) {
            const data = await res.json();
        setMySubmissions((prev) => ({ ...prev, [assignmentId]: data }));
      } else {
        setMySubmissions((prev) => ({ ...prev, [assignmentId]: null }));
      }
    } catch (err) {
      console.error("Error fetching my submission:", err);
    }
  };

  const submitGrade = async (submissionId, assignmentId) => {
    if (!gradeInput[submissionId]?.marks) {
      setError("Please enter marks");
      return;
    }

    try {
        const token = await getToken();
      const res = await fetch(
            `${API_BASE}/submissions/${submissionId}/grade`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(gradeInput[submissionId]),
            }
        );

      if (!res.ok) {
        setError("Failed to submit grade");
        return;
      }

        alert("Graded successfully");
      fetchSubmissions(assignmentId);
      setGradeInput((prev) => {
        const newInput = { ...prev };
        delete newInput[submissionId];
        return newInput;
      });
    } catch (err) {
      setError("An error occurred while grading");
    }
    };

    const createAnnouncement = async () => {
    if (!newMessage.trim()) {
      setError("Please enter a message");
      return;
    }

    setError("");
    try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/announcements`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                courseId: id,
                message: newMessage,
            }),
        });

        if (!res.ok) {
        setError("Failed to post announcement");
            return;
        }

        setNewMessage("");
        fetchAnnouncements();
    } catch (err) {
      setError("An error occurred while posting announcement");
    }
  };

  const createAssignment = async () => {
    if (!title.trim() || !desc.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);
    try {
                            const token = await getToken();
      const res = await fetch(`${API_BASE}/assignments`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    courseId: id,
                                    title,
                                    description: desc,
                                }),
                            });

      if (!res.ok) {
        setError("Failed to create assignment");
        return;
      }

      setTitle("");
      setDesc("");
                            fetchAssignments();
    } catch (err) {
      setError("An error occurred while creating assignment");
    } finally {
      setLoading(false);
    }
  };

  const submitAssignment = async (assignmentId) => {
                            if (!selectedFile) {
      setError("Please select a file first");
                                return;
                            }

    setError("");
    setLoading(true);
    try {
                            const token = await getToken();

      // Step 1: Upload file through backend (bypasses RLS)
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("courseId", course.id);
      formData.append("assignmentId", assignmentId);

      const uploadRes = await fetch(`${API_BASE}/upload/assignment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({ error: "Failed to upload file" }));
        const errorMsg = errorData.error || `File upload failed (Status: ${uploadRes.status})`;
        console.error("Upload error:", errorMsg, errorData);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const uploadData = await uploadRes.json();
      const fileUrl = uploadData.fileUrl;

      if (!fileUrl) {
        setError("Failed to get file URL after upload");
        setLoading(false);
        return;
      }

      // Step 2: Submit to backend
      const res = await fetch(`${API_BASE}/submissions`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
          assignmentId,
                                    fileUrl,
                                }),
                            });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to submit assignment" }));
        const errorMsg = errorData.error || `Submission failed (Status: ${res.status})`;
        console.error("Submission error:", errorMsg, errorData);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const result = await res.json();
      alert("Assignment submitted successfully");
      setSelectedFile(null);
      setSelectedAssignment(null);
      setError("");
      fetchMySubmission(assignmentId);
    } catch (err) {
      console.error("Error submitting assignment:", err);
      setError(`An error occurred: ${err.message || "Failed to submit assignment"}`);
    } finally {
      setLoading(false);
    }
  };

  const requestEnrollment = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/request/${id}`, {
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
      navigate("/student");
    } catch (err) {
      setError("An error occurred while requesting enrollment");
    }
  };

  useEffect(() => {
    fetchCourse();
    fetchStudents();
    fetchAnnouncements();
    fetchAssignments();
  }, [id]);

  if (!course && !error) {
    return (
      <Layout>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  if (!course && error) {
    return (
      <Layout>
        <Card>
          <div className="message message-error">
            {error}
          </div>
          <Button onClick={() => {
            const roleMap = {
              faculty: "/faculty",
              teacher: "/faculty",
              student: "/student",
              admin: "/admin",
              faculty_advisor: "/advisor",
            };
            navigate(roleMap[role] || "/student");
          }}>
            Go Back to Dashboard
          </Button>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title={course.title}>
      {error && (
        <div className="message message-error" style={{ marginBottom: "var(--spacing-md)" }}>
          {error}
        </div>
      )}

      {/* Course Header */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--spacing-md)" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: "var(--spacing-sm)", color: "var(--primary)" }}>
              {course.title}
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-md)" }}>
              {course.description}
            </p>
            <div style={{ display: "flex", gap: "var(--spacing-lg)", flexWrap: "wrap" }}>
              <div>
                <strong style={{ color: "var(--text-secondary)" }}>Teacher:</strong>{" "}
                <span style={{ color: "var(--text-primary)" }}>
                  {course.teacher?.name || "N/A"}
                </span>
              </div>
            </div>
          </div>
          {role === "student" && !isEnrolled && !hasPendingRequest && (
            <Button onClick={requestEnrollment} variant="success">
              Request Enrollment
            </Button>
          )}
          {role === "student" && isEnrolled && (
            <span style={{ color: "var(--success)", fontWeight: "600" }}>✓ Enrolled</span>
          )}
          {role === "student" && hasPendingRequest && !isEnrolled && (
            <span style={{ color: "var(--warning)", fontWeight: "600" }}>⏳ Enrollment Request Pending</span>
          )}
        </div>
      </Card>

      {/* Enrolled Students - Visible to all stakeholders */}
      <Card>
        <h3 style={{ marginBottom: "var(--spacing-md)", color: "var(--primary)" }}>
          Enrolled Students ({students.length})
        </h3>
        
        {/* Loading State */}
        {studentsLoading && (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            padding: "var(--spacing-xl)",
            color: "var(--text-secondary)"
          }}>
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <span style={{ marginLeft: "var(--spacing-md)" }}>Loading enrollments...</span>
          </div>
        )}
        
        {/* Error State */}
        {!studentsLoading && studentsError && (
          <div style={{
            padding: "var(--spacing-md)",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
            color: "var(--error)",
            textAlign: "center"
          }}>
            {studentsError}
          </div>
        )}
        
        {/* Empty State */}
        {!studentsLoading && !studentsError && students.length === 0 && (
          <div style={{
            padding: "var(--spacing-xl)",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
            textAlign: "center",
            color: "var(--text-secondary)"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "var(--spacing-sm)" }}>👥</div>
            <p>No students enrolled yet</p>
          </div>
        )}
        
        {/* Students List */}
        {!studentsLoading && !studentsError && students.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "var(--spacing-md)",
            }}
          >
            {students.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: "var(--spacing-md)",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--gray-200)",
                }}
              >
                <strong>{s.name}</strong>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "var(--spacing-sm)",
          marginTop: "var(--spacing-xl)",
          borderBottom: "2px solid var(--gray-200)",
        }}
      >
        {["announcements", "assignments"].map((tab) => (
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
            {tab}
                    </button>
        ))}
      </div>

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div style={{ marginTop: "var(--spacing-xl)" }}>
                {(role === "faculty" || role === "teacher") && (
            <Card>
              <h3 style={{ marginBottom: "var(--spacing-md)", color: "var(--primary)" }}>
                Create Announcement
              </h3>
              <textarea
                placeholder="Write announcement..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
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
              <Button onClick={createAnnouncement}>Post Announcement</Button>
            </Card>
          )}

          <h3 style={{ marginTop: "var(--spacing-xl)", marginBottom: "var(--spacing-lg)" }}>
            Announcements ({announcements.length})
          </h3>

          {announcements.length === 0 ? (
            <Card>
              <div className="empty-state">
                <div className="empty-state-icon">📢</div>
                <p>No announcements yet.</p>
              </div>
            </Card>
          ) : (
            announcements.map((a) => (
              <Card key={a.id} style={{ marginBottom: "var(--spacing-md)" }}>
                <p style={{ marginBottom: "var(--spacing-sm)", fontSize: "1rem" }}>
                  {a.message}
                </p>
                <small style={{ color: "var(--text-tertiary)" }}>
                  {new Date(a.created_at).toLocaleString()}
                </small>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === "assignments" && (
        <div style={{ marginTop: "var(--spacing-xl)" }}>
                {(role === "faculty" || role === "teacher") && (
            <Card>
              <h3 style={{ marginBottom: "var(--spacing-md)", color: "var(--primary)" }}>
                Create Assignment
              </h3>
              <Input
                placeholder="Assignment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
              <textarea
                placeholder="Assignment description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                disabled={loading}
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
              <Button onClick={createAssignment} disabled={loading} fullWidth>
                {loading ? "Creating..." : "Create Assignment"}
              </Button>
            </Card>
          )}

          <h3 style={{ marginTop: "var(--spacing-xl)", marginBottom: "var(--spacing-lg)" }}>
            Assignments ({assignments.length})
          </h3>

          {assignments.length === 0 ? (
            <Card>
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <p>No assignments yet.</p>
              </div>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card key={assignment.id} style={{ marginBottom: "var(--spacing-lg)" }}>
                <div style={{ marginBottom: "var(--spacing-md)" }}>
                  <h4 style={{ marginBottom: "var(--spacing-sm)", color: "var(--primary)" }}>
                    {assignment.title}
                  </h4>
                  <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-md)" }}>
                    {assignment.description}
                  </p>
                </div>

                    {/* STUDENT VIEW */}
                    {role === "student" && (
                                <div>
                    {selectedAssignment === assignment.id ? (
                      <div
                        style={{
                          padding: "var(--spacing-md)",
                          background: "var(--bg-secondary)",
                          borderRadius: "var(--radius-md)",
                          marginTop: "var(--spacing-md)",
                        }}
                      >
                        <input
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                          style={{ marginBottom: "var(--spacing-md)" }}
                        />
                        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                          <Button
                            onClick={() => submitAssignment(assignment.id)}
                            disabled={loading || !selectedFile}
                            size="sm"
                          >
                            {loading ? "Submitting..." : "Submit"}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setSelectedAssignment(null);
                              setSelectedFile(null);
                            }}
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                                </div>
                    ) : (
                      <div>
                        {mySubmissions[assignment.id] ? (
                          <div
                            style={{
                              padding: "var(--spacing-md)",
                              background: "var(--bg-secondary)",
                              borderRadius: "var(--radius-md)",
                              marginTop: "var(--spacing-md)",
                            }}
                          >
                            <p>
                              <strong>Status:</strong>{" "}
                              <span style={{ color: "var(--success)" }}>Submitted</span>
                            </p>
                            <p>
                              <strong>Marks:</strong>{" "}
                              {mySubmissions[assignment.id].marks ?? "Not graded yet"}
                            </p>
                            {mySubmissions[assignment.id].feedback && (
                              <p>
                                <strong>Feedback:</strong> {mySubmissions[assignment.id].feedback}
                              </p>
                            )}
                            <a
                              href={mySubmissions[assignment.id].file_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: "var(--primary)",
                                textDecoration: "underline",
                              }}
                            >
                              View Submitted File
                            </a>
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedAssignment(assignment.id);
                              fetchMySubmission(assignment.id);
                            }}
                            size="sm"
                          >
                            Submit Assignment
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                    )}

                    {/* TEACHER VIEW */}
                    {(role === "faculty" || role === "teacher") && (
                  <div>
                    <Button
                      onClick={() => {
                        fetchSubmissions(assignment.id);
                        setSelectedAssignment(
                          selectedAssignment === assignment.id ? null : assignment.id
                        );
                      }}
                      variant="outline"
                      size="sm"
                      style={{ marginTop: "var(--spacing-md)" }}
                    >
                      {selectedAssignment === assignment.id
                        ? "Hide Submissions"
                        : `View Submissions (${submissions[assignment.id]?.length || 0})`}
                    </Button>

                    {selectedAssignment === assignment.id &&
                      submissions[assignment.id] &&
                      submissions[assignment.id].length > 0 && (
                        <div style={{ marginTop: "var(--spacing-md)" }}>
                          {submissions[assignment.id].map((submission) => (
                            <Card
                              key={submission.id}
                              style={{
                                marginTop: "var(--spacing-md)",
                                background: "var(--bg-secondary)",
                              }}
                            >
                              <p>
                                <strong>Student:</strong> {submission.student?.name}
                              </p>
                              <a
                                href={submission.file_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color: "var(--primary)",
                                  textDecoration: "underline",
                                  display: "inline-block",
                                  marginBottom: "var(--spacing-md)",
                                }}
                              >
                                View Submission File
                              </a>
                              <div style={{ marginTop: "var(--spacing-md)" }}>
                                <Input
                                        type="number"
                                        placeholder="Marks"
                                  value={gradeInput[submission.id]?.marks || ""}
                                        onChange={(e) =>
                                            setGradeInput({
                                                ...gradeInput,
                                      [submission.id]: {
                                        ...gradeInput[submission.id],
                                                    marks: e.target.value,
                                                },
                                            })
                                        }
                                  style={{ marginBottom: "var(--spacing-sm)" }}
                                    />
                                    <textarea
                                        placeholder="Feedback"
                                  value={gradeInput[submission.id]?.feedback || ""}
                                        onChange={(e) =>
                                            setGradeInput({
                                                ...gradeInput,
                                      [submission.id]: {
                                        ...gradeInput[submission.id],
                                                    feedback: e.target.value,
                                                },
                                            })
                                        }
                                  style={{
                                    width: "100%",
                                    padding: "var(--spacing-md)",
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid var(--gray-300)",
                                    fontSize: "1rem",
                                    fontFamily: "inherit",
                                    minHeight: "80px",
                                    resize: "vertical",
                                    marginBottom: "var(--spacing-md)",
                                  }}
                                />
                                <Button
                                  onClick={() => submitGrade(submission.id, assignment.id)}
                                  size="sm"
                                >
                                        Submit Grade
                                </Button>
                                </div>
                            </Card>
                          ))}
                        </div>
                      )}

                    {selectedAssignment === assignment.id &&
                      (!submissions[assignment.id] ||
                        submissions[assignment.id].length === 0) && (
                        <div
                          style={{
                            marginTop: "var(--spacing-md)",
                            padding: "var(--spacing-md)",
                            background: "var(--bg-secondary)",
                            borderRadius: "var(--radius-md)",
                            textAlign: "center",
                            color: "var(--text-secondary)",
                          }}
                        >
                          No submissions yet
                        </div>
                    )}
                </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </Layout>
    );
}
