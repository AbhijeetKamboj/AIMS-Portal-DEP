import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import API_BASE from '../config/api';

export default function CourseDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId, courseTitle } = route.params || {};
  const { getToken, role, logout } = useAuth();

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [mySubmissions, setMySubmissions] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [gradeInput, setGradeInput] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [activeTab, setActiveTab] = useState('announcements');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to fetch course details' }));
        setError(errorData.error || 'Failed to fetch course details');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setCourse(data);
      setError('');

      if (role === 'student') {
        await checkEnrollmentStatus();
      }
    } catch (err) {
      setError(`An error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const token = await getToken();

      const enrollRes = await fetch(`${API_BASE}/enrollments/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (enrollRes.ok) {
        const enrollments = await enrollRes.json();
        const enrolled = enrollments.some((e) => e.course_id === courseId && e.status === 'active');
        setIsEnrolled(enrolled);
      }

      const requestRes = await fetch(`${API_BASE}/enrollment-requests/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (requestRes.ok) {
        const requests = await requestRes.json();
        const pending = requests.some(
          (r) => r.course?.id === courseId && (r.status === 'pending' || r.status === 'approved_by_faculty' || r.status === 'enrolled')
        );
        setHasPendingRequest(pending);
      }
    } catch (err) {
      console.error('Error checking enrollment status:', err);
    }
  };

  const fetchStudents = async () => {
    setStudentsLoading(true);
    setStudentsError('');
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollments/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setStudents([]);
        setStudentsError('Failed to load enrolled students');
        return;
      }

      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setStudents([]);
      setStudentsError('An error occurred while loading enrollments');
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/announcements/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/assignments/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      setAssignments(Array.isArray(data) ? data : []);

      // Fetch submissions for each assignment
      if (role === 'faculty' || role === 'teacher') {
        data.forEach((assignment) => {
          fetchSubmissions(assignment.id);
        });
      } else if (role === 'student') {
        data.forEach((assignment) => {
          fetchMySubmission(assignment.id);
        });
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/submissions/assignment/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      setSubmissions((prev) => ({ ...prev, [assignmentId]: data }));
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const fetchMySubmission = async (assignmentId) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/submissions/my/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMySubmissions((prev) => ({ ...prev, [assignmentId]: data }));
      } else {
        setMySubmissions((prev) => ({ ...prev, [assignmentId]: null }));
      }
    } catch (err) {
      console.error('Error fetching my submission:', err);
    }
  };

  const createAnnouncement = async () => {
    if (!newMessage.trim()) {
      setError('Please enter a message');
      return;
    }

    setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          message: newMessage,
        }),
      });

      if (!res.ok) {
        setError('Failed to post announcement');
        return;
      }

      setNewMessage('');
      setShowAnnouncementModal(false);
      fetchAnnouncements();
    } catch (err) {
      setError('An error occurred while posting announcement');
    }
  };

  const createAssignment = async () => {
    if (!title.trim() || !desc.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          title,
          description: desc,
        }),
      });

      if (!res.ok) {
        setError('Failed to create assignment');
        return;
      }

      setTitle('');
      setDesc('');
      setShowAssignmentModal(false);
      fetchAssignments();
    } catch (err) {
      setError('An error occurred while creating assignment');
    } finally {
      setLoading(false);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const submitAssignment = async (assignmentId) => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const token = await getToken();

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'application/octet-stream',
        name: selectedFile.name || 'file',
      });
      formData.append('courseId', course.id);
      formData.append('assignmentId', assignmentId);

      const uploadRes = await fetch(`${API_BASE}/upload/assignment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({ error: 'Failed to upload file' }));
        setError(errorData.error || 'Failed to upload file');
        setLoading(false);
        return;
      }

      const uploadData = await uploadRes.json();
      const fileUrl = uploadData.fileUrl;

      if (!fileUrl) {
        setError('Failed to get file URL after upload');
        setLoading(false);
        return;
      }

      // Submit to backend
      const res = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignmentId,
          fileUrl,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to submit assignment' }));
        setError(errorData.error || 'Failed to submit assignment');
        setLoading(false);
        return;
      }

      Alert.alert('Success', 'Assignment submitted successfully');
      setSelectedFile(null);
      setSelectedAssignment(null);
      setError('');
      fetchMySubmission(assignmentId);
    } catch (err) {
      setError(`An error occurred: ${err.message || 'Failed to submit assignment'}`);
    } finally {
      setLoading(false);
    }
  };

  const submitGrade = async (submissionId, assignmentId) => {
    if (!gradeInput[submissionId]?.marks) {
      setError('Please enter marks');
      return;
    }

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/submissions/${submissionId}/grade`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gradeInput[submissionId]),
      });

      if (!res.ok) {
        setError('Failed to submit grade');
        return;
      }

      Alert.alert('Success', 'Graded successfully');
      fetchSubmissions(assignmentId);
      setGradeInput((prev) => {
        const newInput = { ...prev };
        delete newInput[submissionId];
        return newInput;
      });
    } catch (err) {
      setError('An error occurred while grading');
    }
  };

  const requestEnrollment = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/request/${courseId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
        setError(errorData.error || 'Failed to request enrollment');
        return;
      }

      Alert.alert('Success', 'Enrollment request submitted! Waiting for faculty and advisor approval.');
      navigation.goBack();
    } catch (err) {
      setError('An error occurred while requesting enrollment');
    }
  };

  const getDashboardRoute = () => {
    const roleMap = {
      faculty: 'FacultyDashboard',
      teacher: 'FacultyDashboard',
      student: 'StudentDashboard',
      admin: 'AdminDashboard',
      faculty_advisor: 'FacultyAdvisorDashboard',
    };
    return roleMap[role] || 'StudentDashboard';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCourse(),
      fetchStudents(),
      fetchAnnouncements(),
      fetchAssignments(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchStudents();
      fetchAnnouncements();
      fetchAssignments();
    }
  }, [courseId]);

  if (!course && !error && loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading course...</Text>
        </View>
      </View>
    );
  }

  if (!course && error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate(getDashboardRoute())}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
        </View>
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Go Back to Dashboard"
            onPress={() => navigation.navigate(getDashboardRoute())}
            style={styles.backButtonMargin}
          />
        </Card>
      </View>
    );
  }

  if (!course) return null;

  const canCreateAnnouncements = role === 'faculty' || role === 'teacher';
  const canCreateAssignments = role === 'faculty' || role === 'teacher';
  const canViewSubmissions = role === 'faculty' || role === 'teacher';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate(getDashboardRoute())}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Course Header */}
        <Card style={styles.courseHeaderCard}>
          <Text style={styles.courseTitle}>{course.title || courseTitle}</Text>
          <Text style={styles.courseDescription}>{course.description || 'No description'}</Text>
          <Text style={styles.meta}>
            <Text style={styles.bold}>Teacher:</Text> {course.teacher?.name || 'N/A'}
          </Text>
          {role === 'student' && !isEnrolled && !hasPendingRequest && (
            <Button
              title="Request Enrollment"
              variant="success"
              onPress={requestEnrollment}
              style={styles.enrollButton}
            />
          )}
          {role === 'student' && isEnrolled && (
            <Text style={styles.enrolledBadge}>✓ Enrolled</Text>
          )}
          {role === 'student' && hasPendingRequest && !isEnrolled && (
            <Text style={styles.pendingBadge}>⏳ Enrollment Request Pending</Text>
          )}
        </Card>

        {/* Enrolled Students */}
        <Card>
          <Text style={styles.sectionTitle}>Enrolled Students ({students.length})</Text>
          {studentsLoading ? (
            <View style={styles.centerContent}>
              <Text style={styles.loadingText}>Loading enrollments...</Text>
            </View>
          ) : studentsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{studentsError}</Text>
            </View>
          ) : students.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No students enrolled yet</Text>
            </View>
          ) : (
            <FlatList
              data={students}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.studentCard}>
                  <Text style={styles.studentName}>{item.name || 'N/A'}</Text>
                </View>
              )}
            />
          )}
        </Card>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['announcements', 'assignments'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <View>
            {canCreateAnnouncements && (
              <Card>
                <Text style={styles.sectionTitle}>Create Announcement</Text>
                <Input
                  placeholder="Write announcement..."
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                  numberOfLines={4}
                />
                <Button
                  title="Post Announcement"
                  onPress={createAnnouncement}
                  disabled={loading}
                />
              </Card>
            )}

            <Text style={styles.sectionTitle}>Announcements ({announcements.length})</Text>

            {announcements.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📢</Text>
                  <Text style={styles.emptyText}>No announcements yet</Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={announcements}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Card style={styles.announcementCard}>
                    <Text style={styles.announcementMessage}>{item.message}</Text>
                    <Text style={styles.caption}>
                      Posted: {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </Card>
                )}
              />
            )}
          </View>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <View>
            {canCreateAssignments && (
              <Card>
                <Text style={styles.sectionTitle}>Create Assignment</Text>
                <Input
                  placeholder="Assignment title"
                  value={title}
                  onChangeText={setTitle}
                />
                <Input
                  placeholder="Assignment description"
                  value={desc}
                  onChangeText={setDesc}
                  multiline
                  numberOfLines={4}
                />
                <Button
                  title={loading ? 'Creating...' : 'Create Assignment'}
                  onPress={createAssignment}
                  disabled={loading}
                />
              </Card>
            )}

            <Text style={styles.sectionTitle}>Assignments ({assignments.length})</Text>

            {assignments.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📝</Text>
                  <Text style={styles.emptyText}>No assignments yet</Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={assignments}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item: assignment }) => (
                  <Card style={styles.assignmentCard}>
                    <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                    <Text style={styles.assignmentDescription}>{assignment.description}</Text>
                    <Text style={styles.caption}>
                      Created: {new Date(assignment.created_at).toLocaleDateString()}
                    </Text>

                    {/* Student View: Submit Assignment */}
                    {role === 'student' && isEnrolled && (
                      <View style={styles.submitSection}>
                        {selectedAssignment === assignment.id ? (
                          <View>
                            <Button
                              title={selectedFile ? selectedFile.name : 'Pick File'}
                              variant="outline"
                              onPress={pickFile}
                              style={styles.fileButton}
                            />
                            {selectedFile && (
                              <View style={styles.submitActions}>
                                <Button
                                  title={loading ? 'Submitting...' : 'Submit'}
                                  onPress={() => submitAssignment(assignment.id)}
                                  disabled={loading}
                                  style={styles.submitButton}
                                />
                                <Button
                                  title="Cancel"
                                  variant="secondary"
                                  onPress={() => {
                                    setSelectedAssignment(null);
                                    setSelectedFile(null);
                                  }}
                                  disabled={loading}
                                  style={styles.submitButton}
                                />
                              </View>
                            )}
                          </View>
                        ) : mySubmissions[assignment.id] ? (
                          <View>
                            <Text style={styles.submittedBadge}>
                              ✓ Submitted on {new Date(mySubmissions[assignment.id].submitted_at).toLocaleDateString()}
                            </Text>
                            {mySubmissions[assignment.id].marks !== null && (
                              <Text style={styles.gradeText}>
                                Grade: {mySubmissions[assignment.id].marks} / {assignment.max_marks || 'N/A'}
                              </Text>
                            )}
                          </View>
                        ) : (
                          <Button
                            title="Submit Assignment"
                            onPress={() => setSelectedAssignment(assignment.id)}
                            style={styles.submitButton}
                          />
                        )}
                      </View>
                    )}

                    {/* Faculty View: Grade Submissions */}
                    {canViewSubmissions && submissions[assignment.id] && (
                      <View style={styles.submissionsSection}>
                        <Text style={styles.submissionsTitle}>
                          Submissions ({submissions[assignment.id]?.length || 0})
                        </Text>
                        {submissions[assignment.id].map((submission) => (
                          <View key={submission.id} style={styles.submissionCard}>
                            <Text style={styles.submissionStudent}>
                              {submission.student?.name || 'N/A'}
                            </Text>
                            <Text style={styles.caption}>
                              Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                            </Text>
                            {submission.marks !== null ? (
                              <Text style={styles.gradeText}>
                                Grade: {submission.marks} / {assignment.max_marks || 'N/A'}
                                {submission.feedback && ` - ${submission.feedback}`}
                              </Text>
                            ) : (
                              <View style={styles.gradeInputContainer}>
                                <Input
                                  placeholder="Marks"
                                  value={gradeInput[submission.id]?.marks || ''}
                                  onChangeText={(text) =>
                                    setGradeInput((prev) => ({
                                      ...prev,
                                      [submission.id]: { ...prev[submission.id], marks: text },
                                    }))
                                  }
                                  keyboardType="numeric"
                                  style={styles.gradeInput}
                                />
                                <Input
                                  placeholder="Feedback (optional)"
                                  value={gradeInput[submission.id]?.feedback || ''}
                                  onChangeText={(text) =>
                                    setGradeInput((prev) => ({
                                      ...prev,
                                      [submission.id]: { ...prev[submission.id], feedback: text },
                                    }))
                                  }
                                  multiline
                                  style={styles.gradeInput}
                                />
                                <Button
                                  title="Submit Grade"
                                  size="sm"
                                  onPress={() => submitGrade(submission.id, assignment.id)}
                                  style={styles.gradeButton}
                                />
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </Card>
                )}
              />
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  courseHeaderCard: {
    marginBottom: spacing.md,
  },
  courseTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  courseDescription: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  meta: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  bold: {
    fontWeight: '600',
  },
  enrollButton: {
    marginTop: spacing.md,
  },
  enrolledBadge: {
    color: colors.success,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  pendingBadge: {
    color: colors.warning,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  studentCard: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.md,
    margin: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  studentName: {
    ...typography.body,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.gray200,
    marginTop: spacing.lg,
  },
  tab: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  announcementCard: {
    marginBottom: spacing.md,
  },
  announcementMessage: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  assignmentCard: {
    marginBottom: spacing.lg,
  },
  assignmentTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  assignmentDescription: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  submitSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  fileButton: {
    marginBottom: spacing.sm,
  },
  submitActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  submitButton: {
    flex: 1,
  },
  submittedBadge: {
    color: colors.success,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  gradeText: {
    ...typography.body,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  submissionsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  submissionsTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  submissionCard: {
    padding: spacing.md,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  submissionStudent: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  gradeInputContainer: {
    marginTop: spacing.sm,
  },
  gradeInput: {
    marginBottom: spacing.sm,
  },
  gradeButton: {
    marginTop: spacing.xs,
  },
  caption: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
  },
  centerContent: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.4)',
  },
  errorCard: {
    margin: spacing.md,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.md,
  },
  backButtonMargin: {
    marginTop: spacing.md,
  },
});
