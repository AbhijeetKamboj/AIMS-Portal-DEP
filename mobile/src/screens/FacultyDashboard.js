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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import API_BASE from '../config/api';

export default function FacultyDashboard() {
  const navigation = useNavigation();
  const { getToken, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  const [myCourses, setMyCourses] = useState([]);
  const [courseApprovals, setCourseApprovals] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/courses/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setError('Failed to fetch courses');
        return;
      }

      const data = await res.json();
      setMyCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('An error occurred while fetching courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseApprovals = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/course-approvals/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setCourseApprovals([]);
        return;
      }

      const data = await res.json();
      setCourseApprovals(Array.isArray(data) ? data : []);
    } catch (err) {
      setCourseApprovals([]);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setPendingRequests([]);
        return;
      }

      const data = await res.json();
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setPendingRequests([]);
    }
  };

  const createCourse = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Course creation failed' }));
        setError(errorData.error || 'Course creation failed');
        return;
      }

      const data = await res.json();
      Alert.alert('Success', data.message || 'Course created! Awaiting admin and advisor approval.');
      setTitle('');
      setDescription('');
      setShowCreateModal(false);
      fetchMyCourses();
      fetchCourseApprovals();
    } catch (err) {
      setError('An error occurred while creating course');
    } finally {
      setLoading(false);
    }
  };

  const enrollStudentByEmail = async (courseId) => {
    if (!studentEmail.trim()) {
      Alert.alert('Error', 'Please enter a student email');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = await getToken();

      const studentRes = await fetch(
        `${API_BASE}/students?email=${encodeURIComponent(studentEmail.trim())}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!studentRes.ok) {
        const errorData = await studentRes.json().catch(() => ({ error: 'Student not found' }));
        Alert.alert('Error', errorData.error || 'Student not found');
        setLoading(false);
        return;
      }

      const student = await studentRes.json();

      if (!student || !student.id) {
        Alert.alert('Error', 'Student not found');
        setLoading(false);
        return;
      }

      const enrollRes = await fetch(`${API_BASE}/enrollments/faculty/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, studentId: student.id }),
      });

      if (!enrollRes.ok) {
        const errorData = await enrollRes.json().catch(() => ({ error: 'Enrollment failed' }));
        Alert.alert('Error', errorData.error || 'Enrollment failed');
        setLoading(false);
        return;
      }

      Alert.alert('Success', 'Student enrolled successfully');
      setStudentEmail('');
      setSelectedCourse(null);
    } catch (err) {
      Alert.alert('Error', `An error occurred: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action, reason = '') => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/${requestId}/faculty-action`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Action failed' }));
        Alert.alert('Error', errorData.error || 'Action failed');
        return;
      }

      Alert.alert('Success', `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchPendingRequests();
    } catch (err) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMyCourses(), fetchCourseApprovals(), fetchPendingRequests()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchMyCourses();
    fetchCourseApprovals();
    fetchPendingRequests();
  }, []);

  const getApprovalStatus = (courseId) => {
    const approval = courseApprovals.find((a) => a.course?.id === courseId);
    return approval;
  };

  const renderCourseCard = ({ item: course }) => {
    const approval = getApprovalStatus(course.id);

    return (
      <Card style={styles.courseCard}>
        <View style={styles.courseHeader}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          {approval && (
            <View style={[styles.statusBadge, styles[`status${approval.status}`]]}>
              <Text style={styles.statusText}>{approval.status.replace(/_/g, ' ')}</Text>
            </View>
          )}
        </View>
        <Text style={styles.courseDescription} numberOfLines={2}>
          {course.description || 'No description'}
        </Text>
        <View style={styles.courseActions}>
          <Button
            title="View Course"
            variant="primary"
            size="sm"
            onPress={() => navigation.navigate('CourseDetail', { courseId: course.id, courseTitle: course.title })}
            style={styles.actionButton}
          />
          <Button
            title="Enroll Student"
            variant="outline"
            size="sm"
            onPress={() => setSelectedCourse(course.id)}
            style={styles.actionButton}
          />
        </View>

        {selectedCourse === course.id && (
          <View style={styles.enrollContainer}>
            <Input
              placeholder="Student email"
              value={studentEmail}
              onChangeText={(text) => {
                setStudentEmail(text);
                setError('');
              }}
              disabled={loading}
              style={styles.enrollInput}
            />
            <View style={styles.enrollActions}>
              <Button
                title={loading ? 'Enrolling...' : 'Enroll'}
                size="sm"
                onPress={() => enrollStudentByEmail(course.id)}
                disabled={loading}
                style={styles.actionButton}
              />
              <Button
                title="Cancel"
                variant="secondary"
                size="sm"
                onPress={() => {
                  setSelectedCourse(null);
                  setStudentEmail('');
                }}
                disabled={loading}
                style={styles.actionButton}
              />
            </View>
          </View>
        )}
      </Card>
    );
  };

  const renderRequestCard = ({ item: request }) => (
    <Card style={styles.courseCard}>
      <Text style={styles.courseTitle}>{request.course?.title || 'Course'}</Text>
      <Text style={styles.courseDescription}>
        <Text style={styles.bold}>Student:</Text> {request.student?.name} ({request.student?.email})
      </Text>
      <Text style={styles.caption}>
        Requested: {new Date(request.created_at).toLocaleDateString()}
      </Text>
      <View style={styles.courseActions}>
        <Button
          title="Approve"
          variant="success"
          size="sm"
          onPress={() => handleRequestAction(request.id, 'approve')}
          style={styles.actionButton}
        />
        <Button
          title="Reject"
          variant="danger"
          size="sm"
          onPress={() => {
            Alert.prompt(
              'Reject Request',
              'Reason for rejection (optional):',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reject',
                  style: 'destructive',
                  onPress: (reason) => handleRequestAction(request.id, 'reject', reason || ''),
                },
              ],
              'plain-text'
            );
          }}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  const renderApprovalCard = ({ item: approval }) => (
    <Card style={styles.courseCard}>
      <Text style={styles.courseTitle}>{approval.course?.title || 'Course'}</Text>
      <Text style={styles.courseDescription} numberOfLines={2}>
        {approval.course?.description || 'No description'}
      </Text>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>
          Status: {approval.status.replace(/_/g, ' ')}
        </Text>
      </View>
      <Text style={styles.caption}>
        Created: {new Date(approval.created_at).toLocaleDateString()}
      </Text>
      {approval.admin_approval_at && (
        <Text style={styles.caption}>
          ✓ Approved by Admin: {new Date(approval.admin_approval_at).toLocaleDateString()}
        </Text>
      )}
      {approval.advisor_approval_at && (
        <Text style={styles.caption}>
          ✓ Approved by Advisor: {new Date(approval.advisor_approval_at).toLocaleDateString()}
        </Text>
      )}
      {approval.rejected_at && (
        <Text style={[styles.caption, { color: colors.error }]}>
          ✗ Rejected: {new Date(approval.rejected_at).toLocaleDateString()}
        </Text>
      )}
      {approval.rejection_reason && (
        <Text style={[styles.caption, { color: colors.error }]}>
          Reason: {approval.rejection_reason}
        </Text>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Faculty Dashboard</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.tabs}>
        {['courses', 'requests', 'approvals'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'courses' ? 'My Courses' : tab === 'requests' ? 'Requests' : 'Approvals'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'courses' && (
          <View>
            <Card style={styles.createCard}>
              <Text style={styles.sectionTitle}>Create New Course</Text>
              <Button
                title="+ Create Course"
                onPress={() => setShowCreateModal(true)}
                variant="primary"
                fullWidth
              />
            </Card>

            <Text style={styles.sectionTitle}>My Courses ({myCourses.length})</Text>

            {loading && myCourses.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Loading courses...</Text>
                </View>
              </Card>
            ) : myCourses.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📚</Text>
                  <Text style={styles.emptyText}>No courses yet. Create your first course!</Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={myCourses}
                renderItem={renderCourseCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {activeTab === 'requests' && (
          <View>
            <Text style={styles.sectionTitle}>
              Pending Enrollment Requests ({pendingRequests.length})
            </Text>

            {pendingRequests.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📋</Text>
                  <Text style={styles.emptyText}>No pending enrollment requests.</Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={pendingRequests}
                renderItem={renderRequestCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {activeTab === 'approvals' && (
          <View>
            <Text style={styles.sectionTitle}>Course Approval Status</Text>

            {courseApprovals.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📝</Text>
                  <Text style={styles.emptyText}>No course approvals found.</Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={courseApprovals}
                renderItem={renderApprovalCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Course</Text>
            <Input
              label="Course Title"
              placeholder="Enter course title"
              value={title}
              onChangeText={setTitle}
              disabled={loading}
            />
            <Input
              label="Description"
              placeholder="Enter course description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              disabled={loading}
            />
            <View style={styles.modalActions}>
              <Button
                title={loading ? 'Creating...' : 'Create Course'}
                onPress={createCourse}
                disabled={loading}
                fullWidth
                style={styles.modalButton}
              />
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setShowCreateModal(false);
                  setTitle('');
                  setDescription('');
                  setError('');
                }}
                disabled={loading}
                fullWidth
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
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
  headerTitle: {
    ...typography.h2,
    color: colors.white,
  },
  logoutButton: {
    padding: spacing.sm,
  },
  logoutText: {
    color: colors.white,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.gray200,
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
  content: {
    flex: 1,
    padding: spacing.md,
  },
  createCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  courseCard: {
    marginBottom: spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  courseTitle: {
    ...typography.h3,
    flex: 1,
  },
  courseDescription: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.bgTertiary,
  },
  statuspending_admin: {
    backgroundColor: colors.warning + '40',
  },
  statuspending_advisor: {
    backgroundColor: colors.warning + '40',
  },
  statusapproved: {
    backgroundColor: colors.success + '40',
  },
  statusrejected: {
    backgroundColor: colors.error + '40',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  caption: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  bold: {
    fontWeight: '600',
  },
  courseActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
  enrollContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  enrollInput: {
    marginBottom: spacing.sm,
  },
  enrollActions: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  errorContainer: {
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.4)',
  },
  errorText: {
    color: colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
  },
  modalActions: {
    marginTop: spacing.md,
  },
  modalButton: {
    marginBottom: spacing.sm,
  },
});
