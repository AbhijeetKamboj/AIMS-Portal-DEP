import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";

import OfferCourse from "./OfferCourse";
import FacultyApprovals from "./FacultyApprovals";
import AdvisorApprovals from "./AdvisorApprovals";
import MyCourses from "./MyCourses";
import MeetingRequests from "./MeetingRequests";
import FacultyBulkEnroll from "./FacultyBulkEnroll";
import AvailabilityManager from "./AvailabilityManager";
import CreateCourseCatalog from "./CreateCourseCatalog";

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState("courses");
  const [subTabs, setSubTabs] = useState({
    courses: "my-courses",
    approvals: "course-approvals",
    enrollment: "bulk-enroll",
    meetings: "requests",
  });

  const tabs = [
    { id: "courses", label: "Courses" },
    { id: "approvals", label: "Approvals" },
    { id: "enrollment", label: "Enrollments" },
    { id: "meetings", label: "Meetings" },
  ];

  const setSubTab = (tab, value) => {
    setSubTabs((prev) => ({ ...prev, [tab]: value }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Faculty Dashboard</Text>
          <Text style={styles.subtitle}>
            Manage your academic and administrative duties
          </Text>
        </View>

        {/* Primary Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabs}
        >
          {tabs.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setActiveTab(t.id)}
              style={[
                styles.tab,
                activeTab === t.id && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === t.id && styles.tabTextActive,
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* CONTENT */}

        {/* COURSES */}
        {activeTab === "courses" && (
          <>
            <View style={styles.subTabs}>
              <SubTab
                label="My Courses"
                active={subTabs.courses === "my-courses"}
                onPress={() => setSubTab("courses", "my-courses")}
              />
              <SubTab
                label="Offer Course"
                active={subTabs.courses === "offer-course"}
                onPress={() => setSubTab("courses", "offer-course")}
              />
              <SubTab
                label="Add to Catalog"
                active={subTabs.courses === "create-catalog"}
                onPress={() => setSubTab("courses", "create-catalog")}
              />
            </View>

            <View style={styles.card}>
              {subTabs.courses === "my-courses" && <MyCourses />}
              {subTabs.courses === "offer-course" && <OfferCourse />}
              {subTabs.courses === "create-catalog" && (
                <CreateCourseCatalog />
              )}
            </View>
          </>
        )}

        {/* APPROVALS */}
        {activeTab === "approvals" && (
          <>
            <View style={styles.subTabs}>
              <SubTab
                label="Course Enrollments"
                active={subTabs.approvals === "course-approvals"}
                onPress={() =>
                  setSubTab("approvals", "course-approvals")
                }
              />
              <SubTab
                label="Advisor Approvals"
                active={subTabs.approvals === "advisor-approvals"}
                onPress={() =>
                  setSubTab("approvals", "advisor-approvals")
                }
              />
            </View>

            <View style={styles.card}>
              {subTabs.approvals === "course-approvals" ? (
                <FacultyApprovals />
              ) : (
                <AdvisorApprovals />
              )}
            </View>
          </>
        )}

        {/* ENROLLMENTS */}
        {activeTab === "enrollment" && (
          <>
            <View style={styles.subTabs}>
              <SubTab
                label="Bulk Enroll"
                active={subTabs.enrollment === "bulk-enroll"}
                onPress={() =>
                  setSubTab("enrollment", "bulk-enroll")
                }
              />
            </View>

            <View style={styles.card}>
              <FacultyBulkEnroll />
            </View>
          </>
        )}

        {/* MEETINGS */}
        {activeTab === "meetings" && (
          <>
            <View style={styles.subTabs}>
              <SubTab
                label="Meeting Requests"
                active={subTabs.meetings === "requests"}
                onPress={() => setSubTab("meetings", "requests")}
              />
              <SubTab
                label="Availability"
                active={subTabs.meetings === "availability"}
                onPress={() =>
                  setSubTab("meetings", "availability")
                }
              />
            </View>

            <View style={styles.card}>
              {subTabs.meetings === "requests" ? (
                <MeetingRequests />
              ) : (
                <AvailabilityManager />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- SUB TAB ---------- */
function SubTab({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.subTab, active && styles.subTabActive]}
    >
      <Text
        style={[
          styles.subTabText,
          active && styles.subTabTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 4,
  },
  tabs: {
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#000",
  },
  tabText: {
    fontWeight: "700",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#000",
  },
  subTabs: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  subTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  subTabActive: {
    backgroundColor: "#fff",
  },
  subTabText: {
    fontWeight: "700",
    color: "#6b7280",
  },
  subTabTextActive: {
    color: "#000",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
});
