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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import API_BASE from '../config/api';

export default function FacultyAdvisorDashboard() {
  const navigation = useNavigation();
  const { getToken, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('enrollments');
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingEnrollments = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/advisor/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setPendingEnrollments([]);
        return;
      }

      const data = await res.json();
      setPendingEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setPendingCourses([]);
        return;
      }

      const data = await res.json();
      setPendingCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setPendingCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentAction = async (requestId, action, reason = '') => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/${requestId}/advisor-action`, {
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

      Alert.alert('Success', `Enrollment request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchPendingEnrollments();
    } catch (err) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const handleCourseAction = async (approvalId, action, reason = '') => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/course-approvals/${approvalId}/advisor-action`, {
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

      Alert.alert('Success', `Course ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchPendingCourses();
    } catch (err) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const fetchAllCourses = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setAllCourses([]);
        return;
      }

      const data = await res.json();
      setAllCourses(Array.isArray(data) ? data : []);
    } catch (err) {
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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setAllEnrollments([]);
        return;
      }

      const data = await res.json();
      setAllEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      setAllEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPendingEnrollments(),
      fetchPendingCourses(),
      fetchAllCourses(),
      fetchAllEnrollments(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPendingEnrollments();
    fetchPendingCourses();
    fetchAllCourses();
    fetchAllEnrollments();
  }, []);

  const renderEnrollmentCard = ({ item: request }) => (
    <Card style={styles.card}>
      <Text style={styles.title}>{request.course?.title || 'Course'}</Text>
      <Text style={styles.description}>
        <Text style={styles.bold}>Student:</Text> {request.student?.name || 'N/A'} ({request.student?.email || 'N/A'})
      </Text>
      <Text style={styles.caption}>
        Requested: {new Date(request.created_at).toLocaleDateString()}
      </Text>
      <View style={styles.actions}>
        <Button
          title="Approve"
          variant="success"
          size="sm"
          onPress={() => handleEnrollmentAction(request.id, 'approve')}
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
                  onPress: (reason) => handleEnrollmentAction(request.id, 'reject', reason || ''),
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

  const renderCourseCard = ({ item: approval }) => (
    <Card style={styles.card}>
      <Text style={styles.title}>{approval.course?.title || 'Course'}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {approval.course?.description || 'No description'}
      </Text>
      <Text style={styles.meta}>
        <Text style={styles.bold}>Faculty:</Text> {approval.course?.teacher?.name || 'N/A'} ({approval.course?.teacher?.email || 'N/A'})
      </Text>
      <Text style={styles.caption}>
        Created: {new Date(approval.created_at).toLocaleDateString()}
      </Text>
      <View style={styles.actions}>
        <Button
          title="Approve"
          variant="success"
          size="sm"
          onPress={() => handleCourseAction(approval.id, 'approve')}
          style={styles.actionButton}
        />
        <Button
          title="Reject"
          variant="danger"
          size="sm"
          onPress={() => {
            Alert.prompt(
              'Reject Course',
              'Reason for rejection (optional):',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reject',
                  style: 'destructive',
                  onPress: (reason) => handleCourseAction(approval.id, 'reject', reason || ''),
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

  const renderAllCourseCard = ({ item: course }) => (
    <Card style={styles.card}>
      <Text style={styles.title}>{course.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {course.description || 'No description'}
      </Text>
      <Text style={styles.meta}>
        <Text style={styles.bold}>Faculty:</Text> {course.teacher?.name || 'N/A'} ({course.teacher?.email || 'N/A'})
      </Text>
      <Text style={styles.caption}>
        Status: {course.status || 'N/A'} | Created: {new Date(course.created_at).toLocaleDateString()}
      </Text>
      <View style={styles.actions}>
        <Button
          title="View Course"
          variant="primary"
          size="sm"
          onPress={() => navigation.navigate('CourseDetail', { courseId: course.id, courseTitle: course.title })}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  const renderEnrollmentListItem = ({ item: enrollment }) => (
    <Card style={styles.card}>
      <Text style={styles.title}>{enrollment.course?.title || 'Course'}</Text>
      <Text style={styles.meta}>
        <Text style={styles.bold}>Student:</Text> {enrollment.student?.name || 'N/A'} ({enrollment.student?.email || 'N/A'})
      </Text>
      <Text style={styles.caption}>
        Status: {enrollment.status || 'active'} | Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
      </Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Faculty Advisor Dashboard</Text>
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
        {['enrollments', 'courses', 'all-courses', 'all-enrollments'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'enrollments' ? 'Enrollments' : tab === 'courses' ? 'Courses' : tab === 'all-courses' ? 'All Courses' : 'All Enrollments'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'enrollments' && (
          <View>
            <Text style={styles.sectionTitle}>
              Pending Enrollment Requests ({pendingEnrollments.length})
            </Text>

            {loading && pendingEnrollments.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Loading requests...</Text>
                </View>
              </Card>
            ) : pendingEnrollments.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>✅</Text>
                  <Text style={styles.emptyText}>No pending enrollment requests.</Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={pendingEnrollments}
                renderItem={renderEnrollmentCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {activeTab === 'courses' && (
          <View>
            <Text style={styles.sectionTitle}>
              Pending Course Approvals ({pendingCourses.length})
            </Text>

            {loading && pendingCourses.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Loading approvals...</Text>
                </View>
              </Card>
            ) : pendingCourses.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>✅</Text>
                  <Text style={styles.emptyText}>No pending course approvals.</Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={pendingCourses}
                renderItem={renderCourseCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {activeTab === 'all-courses' && (
          <View>
            <Text style={styles.sectionTitle}>All Courses ({allCourses.length})</Text>

            {loading && allCourses.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Loading courses...</Text>
                </View>
              </Card>
            ) : allCourses.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📚</Text>
                  <Text style={styles.emptyText}>No courses found.</Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={allCourses}
                renderItem={renderAllCourseCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {activeTab === 'all-enrollments' && (
          <View>
            <Text style={styles.sectionTitle}>All Enrollments ({allEnrollments.length})</Text>

            {loading && allEnrollments.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Loading enrollments...</Text>
                </View>
              </Card>
            ) : allEnrollments.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>👥</Text>
                  <Text style={styles.emptyText}>No enrollments found.</Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={allEnrollments}
                renderItem={renderEnrollmentListItem}
                keyExtractor={(item) => `${item.student_id}-${item.course_id}`}
                scrollEnabled={false}
              />
            )}
          </View>
        )}
      </ScrollView>
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
    padding: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.caption,
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
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  meta: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  bold: {
    fontWeight: '600',
  },
  caption: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
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
});
