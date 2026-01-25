import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";

import GradeApprovals from "./GradeApprovals";
import LockSemester from "./LockSemester";
import CreateCourse from "./CreateCourse";
import ApproveOfferings from "./ApproveOfferings";
import ManageDepartments from "./ManageDepartments";
import StudentGrading from "./StudentGrading";
import CourseApprovals from "./CourseApprovals";
import ManageUsers from "./ManageUsers";
import ManageAdvisors from "./ManageAdvisors";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [subTabs, setSubTabs] = useState({
    users: "manage-users",
    advisors: "manage-advisors",
    curriculum: "create-course",
    grading: "grade-approvals",
  });

  const tabs = [
    { id: "users", label: "Users" },
    { id: "advisors", label: "Advisors" },
    { id: "curriculum", label: "Curriculum" },
    { id: "grading", label: "Grades" },
  ];

  const setSubTab = (tab, sub) => {
    setSubTabs((prev) => ({ ...prev, [tab]: sub }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Portal</Text>
        <Text style={styles.subtitle}>
          Manage users, curriculum, and grading
        </Text>
      </View>

      {/* Main Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>
        {/* USERS */}
        {activeTab === "users" && <ManageUsers />}

        {/* ADVISORS */}
        {activeTab === "advisors" && <ManageAdvisors />}

        {/* CURRICULUM */}
        {activeTab === "curriculum" && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsRow}>
              <SubTab
                label="Create Courses"
                active={subTabs.curriculum === "create-course"}
                onPress={() => setSubTab("curriculum", "create-course")}
              />
              <SubTab
                label="Catalog Approvals"
                active={subTabs.curriculum === "course-approvals"}
                onPress={() => setSubTab("curriculum", "course-approvals")}
              />
              <SubTab
                label="Departments"
                active={subTabs.curriculum === "manage-departments"}
                onPress={() => setSubTab("curriculum", "manage-departments")}
              />
              <SubTab
                label="Offerings"
                active={subTabs.curriculum === "approve-offerings"}
                onPress={() => setSubTab("curriculum", "approve-offerings")}
              />
            </ScrollView>

            {subTabs.curriculum === "create-course" && <CreateCourse />}
            {subTabs.curriculum === "course-approvals" && <CourseApprovals />}
            {subTabs.curriculum === "manage-departments" && <ManageDepartments />}
            {subTabs.curriculum === "approve-offerings" && <ApproveOfferings />}
          </>
        )}

        {/* GRADING */}
        {activeTab === "grading" && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsRow}>
              <SubTab
                label="Grade Approvals"
                active={subTabs.grading === "grade-approvals"}
                onPress={() => setSubTab("grading", "grade-approvals")}
              />
              <SubTab
                label="Student Grading"
                active={subTabs.grading === "student-grading"}
                onPress={() => setSubTab("grading", "student-grading")}
              />
              <SubTab
                label="Lock Semester"
                active={subTabs.grading === "lock-semester"}
                onPress={() => setSubTab("grading", "lock-semester")}
              />
            </ScrollView>

            {subTabs.grading === "grade-approvals" && <GradeApprovals />}
            {subTabs.grading === "student-grading" && <StudentGrading />}
            {subTabs.grading === "lock-semester" && <LockSemester />}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ---------- SubTab Component ---------- */
function SubTab({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.subTab, active && styles.subTabActive]}
    >
      <Text style={[styles.subTabText, active && styles.subTabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  tabsRow: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  tabActive: {
    backgroundColor: "#000",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  tabTextActive: {
    color: "#FFF",
  },
  content: {
    flex: 1,
    padding: 12,
  },
  subTabsRow: {
    marginBottom: 12,
  },
  subTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
  },
  subTabActive: {
    backgroundColor: "#000",
  },
  subTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
  },
  subTabTextActive: {
    color: "#FFF",
  },
});
