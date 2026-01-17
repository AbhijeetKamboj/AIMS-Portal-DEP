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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, spacing, borderRadius, typography } from '../styles/theme';
import API_BASE from '../config/api';

export default function StudentDashboard() {
  const navigation = useNavigation();
  const { getToken, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setError('Failed to fetch courses');
        return;
      }

      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
      setFilteredCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('An error occurred while fetching courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCourses = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollments/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setMyCourses([]);
        return;
      }

      const data = await res.json();
      setMyCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setMyCourses([]);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setMyRequests([]);
        return;
      }

      const data = await res.json();
      setMyRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setMyRequests([]);
    }
  };

  const requestEnrollment = async (courseId) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/enrollment-requests/request/${courseId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
        Alert.alert('Error', errorData.error || 'Failed to request enrollment');
        return;
      }

      Alert.alert('Success', 'Enrollment request submitted! Waiting for faculty and advisor approval.');
      fetchMyRequests();
    } catch (err) {
      Alert.alert('Error', 'An error occurred while requesting enrollment');
    }
  };

  const dropCourse = async (courseId) => {
    Alert.alert('Drop Course', 'Are you sure you want to drop this course?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Drop',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/enrollments/drop/${courseId}`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
              const errorData = await res.json().catch(() => ({ error: 'Drop failed' }));
              Alert.alert('Error', errorData.error || 'Failed to drop course');
              return;
            }

            Alert.alert('Success', 'Course dropped successfully');
            fetchMyCourses();
          } catch (err) {
            Alert.alert('Error', 'An error occurred while dropping course');
          }
        },
      },
    ]);
  };

  const withdrawCourse = async (courseId) => {
    Alert.alert('Withdraw from Course', 'Are you sure you want to withdraw from this course?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/enrollments/withdraw/${courseId}`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
              const errorData = await res.json().catch(() => ({ error: 'Withdraw failed' }));
              Alert.alert('Error', errorData.error || 'Failed to withdraw from course');
              return;
            }

            Alert.alert('Success', 'Course withdrawn successfully');
            fetchMyCourses();
          } catch (err) {
            Alert.alert('Error', 'An error occurred while withdrawing from course');
          }
        },
      },
    ]);
  };

  const getEnrollmentStatus = (courseId) => {
    const enrollment = myCourses.find((e) => e.course_id === courseId && e.status === 'active');
    if (enrollment) {
      return { type: 'enrolled', status: 'active' };
    }

    const request = myRequests.find((r) => r.course?.id === courseId);
    if (request) {
      if (request.status === 'enrolled') {
        return { type: 'enrolled', status: 'active' };
      }
      return { type: 'requested', status: request.status };
    }

    return { type: 'none' };
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const filtered = courses.filter(
      (course) =>
        course.title?.toLowerCase().includes(text.toLowerCase()) ||
        course.description?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCourses(), fetchMyCourses(), fetchMyRequests()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCourses();
    fetchMyCourses();
    fetchMyRequests();
  }, []);

  const renderCourseCard = ({ item: course }) => {
    const enrollmentStatus = getEnrollmentStatus(course.id);
    
    return (
      <Card style={styles.courseCard}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseDescription} numberOfLines={2}>
          {course.description || 'No description'}
        </Text>
        <View style={styles.courseActions}>
          <Button
            title="View Details"
            variant="primary"
            size="sm"
            onPress={() => navigation.navigate('CourseDetail', { courseId: course.id, courseTitle: course.title })}
            style={styles.actionButton}
          />
          {enrollmentStatus.type === 'none' && (
            <Button
              title="Request Enrollment"
              variant="success"
              size="sm"
              onPress={() => requestEnrollment(course.id)}
              style={styles.actionButton}
            />
          )}
        </View>
      </Card>
    );
  };

  const renderMyCourseCard = ({ item: enrollment }) => (
    <Card style={styles.courseCard}>
      <Text style={styles.courseTitle}>{enrollment.course?.title || 'Course'}</Text>
      <Text style={styles.courseDescription} numberOfLines={2}>
        {enrollment.course?.description || 'No description'}
      </Text>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Status: {enrollment.status || 'active'}</Text>
      </View>
      <View style={styles.courseActions}>
        <Button
          title="View Course"
          variant="primary"
          size="sm"
          onPress={() => navigation.navigate('CourseDetail', { courseId: enrollment.course_id, courseTitle: enrollment.course?.title })}
          style={styles.actionButton}
        />
        {enrollment.status === 'active' && (
          <>
            <Button
              title="Drop"
              variant="outline"
              size="sm"
              onPress={() => dropCourse(enrollment.course_id)}
              style={styles.actionButton}
            />
            <Button
              title="Withdraw"
              variant="outline"
              size="sm"
              onPress={() => withdrawCourse(enrollment.course_id)}
              style={styles.actionButton}
            />
          </>
        )}
      </View>
    </Card>
  );

  const renderRequestCard = ({ item: request }) => (
    <Card style={styles.courseCard}>
      <Text style={styles.courseTitle}>{request.course?.title || 'Course'}</Text>
      <Text style={styles.courseDescription} numberOfLines={2}>
        {request.course?.description || 'No description'}
      </Text>
      <View style={[styles.statusBadge, styles[`status${request.status}`]]}>
        <Text style={styles.statusText}>
          {request.status === 'pending' && '⏳ Pending Faculty Approval'}
          {request.status === 'approved_by_faculty' && '✓ Approved by Faculty - Pending Advisor'}
          {request.status === 'enrolled' && '✓ Enrolled'}
          {request.status === 'rejected' && '✗ Rejected'}
        </Text>
      </View>
    </Card>
  );

  const activeCourses = myCourses.filter((e) => e.status === 'active');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Dashboard</Text>
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
        {['courses', 'my-courses', 'requests'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'courses' ? 'Browse' : tab === 'my-courses' ? 'My Courses' : 'Requests'}
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
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search courses..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Available Courses ({filteredCourses.length})
            </Text>

            {loading && courses.length === 0 ? (
              <View style={styles.centerContent}>
                <Text style={styles.emptyText}>Loading courses...</Text>
              </View>
            ) : filteredCourses.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📖</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No courses match your search.' : 'No courses available.'}
                  </Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={filteredCourses}
                renderItem={renderCourseCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {activeTab === 'my-courses' && (
          <View>
            <Text style={styles.sectionTitle}>My Courses ({activeCourses.length})</Text>

            {activeCourses.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📚</Text>
                  <Text style={styles.emptyText}>You are not enrolled in any courses.</Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={activeCourses}
                renderItem={renderMyCourseCard}
                keyExtractor={(item) => item.course_id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {activeTab === 'requests' && (
          <View>
            <Text style={styles.sectionTitle}>My Enrollment Requests ({myRequests.length})</Text>

            {myRequests.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📋</Text>
                  <Text style={styles.emptyText}>No enrollment requests.</Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={myRequests}
                renderItem={renderRequestCard}
                keyExtractor={(item) => item.id}
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
  searchContainer: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  courseCard: {
    marginBottom: spacing.md,
  },
  courseTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  courseDescription: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  statusBadge: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.bgTertiary,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '500',
  },
  courseActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  centerContent: {
    padding: spacing.xl,
    alignItems: 'center',
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
