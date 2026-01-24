import { useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import GradeApprovals from "./GradeApprovals.jsx";
import LockSemester from "./LockSemester.jsx";
import CreateCourse from "./CreateCourse.jsx";
import ApproveOfferings from "./ApproveOfferings.jsx";
import ManageDepartments from "./ManageDepartments.jsx";
import StudentGrading from "./StudentGrading.jsx";
import CourseApprovals from "./CourseApprovals.jsx";
import ManageUsers from "./ManageUsers.jsx";
import ManageAdvisors from "./ManageAdvisors.jsx";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("users");
    const [subTabs, setSubTabs] = useState({
        users: "manage-users",
        advisors: "manage-advisors",
        curriculum: "create-course",
        grading: "grade-approvals"
    });

    const tabs = [
        { id: "users", label: "Users", icon: "👤" },
        { id: "advisors", label: "Advisors", icon: "🎓" },
        { id: "curriculum", label: "Curriculum", icon: "📚" },
        { id: "grading", label: "Grades & Exams", icon: "📊" },
    ];

    const setSubTab = (tab, sub) => {
        setSubTabs(prev => ({ ...prev, [tab]: sub }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar title="Admin Portal" />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Administration</h1>
                        <p className="text-gray-500 mt-1">Manage users, academic structures, and grading cycles.</p>
                    </div>
                </div>

                {/* Primary Tab Navigation */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        group inline-flex items-center py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-all duration-200
                                        ${activeTab === tab.id
                                            ? "border-black text-black"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }
                                    `}
                                >
                                    <span className={`mr-2 text-lg ${activeTab === tab.id ? "grayscale-0" : "grayscale opacity-70 group-hover:opacity-100 group-hover:grayscale-0 transition-all"}`}>
                                        {tab.icon}
                                    </span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content Area */}
                <div className="animate-fadeIn">

                    {/* --- USERS TAB --- */}
                    {activeTab === "users" && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 min-h-[500px]">
                                <ManageUsers />
                            </div>
                        </div>
                    )}

                    {/* --- ADVISORS TAB --- */}
                    {activeTab === "advisors" && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 min-h-[500px]">
                                <ManageAdvisors />
                            </div>
                        </div>
                    )}

                    {/* --- CURRICULUM TAB --- */}
                    {activeTab === "curriculum" && (
                        <div className="space-y-6">
                            <div className="flex p-1 bg-gray-100 rounded-xl w-fit overflow-x-auto">
                                <button
                                    onClick={() => setSubTab("curriculum", "create-course")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${subTabs.curriculum === "create-course" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Create Courses
                                </button>
                                <button
                                    onClick={() => setSubTab("curriculum", "course-approvals")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${subTabs.curriculum === "course-approvals" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Catalog Approvals
                                </button>
                                <button
                                    onClick={() => setSubTab("curriculum", "manage-departments")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${subTabs.curriculum === "manage-departments" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Departments
                                </button>
                                <button
                                    onClick={() => setSubTab("curriculum", "approve-offerings")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${subTabs.curriculum === "approve-offerings" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Offering Approvals
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 min-h-[500px]">
                                {subTabs.curriculum === "create-course" && <CreateCourse />}
                                {subTabs.curriculum === "course-approvals" && <CourseApprovals />}
                                {subTabs.curriculum === "manage-departments" && <ManageDepartments />}
                                {subTabs.curriculum === "approve-offerings" && <ApproveOfferings />}
                            </div>
                        </div>
                    )}

                    {/* --- GRADING TAB --- */}
                    {activeTab === "grading" && (
                        <div className="space-y-6">
                            <div className="flex p-1 bg-gray-100 rounded-xl w-fit overflow-x-auto">
                                <button
                                    onClick={() => setSubTab("grading", "grade-approvals")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${subTabs.grading === "grade-approvals" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Grade Approvals
                                </button>
                                <button
                                    onClick={() => setSubTab("grading", "student-grading")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${subTabs.grading === "student-grading" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Student Grading
                                </button>
                                <button
                                    onClick={() => setSubTab("grading", "lock-semester")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${subTabs.grading === "lock-semester" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Lock Semester
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 min-h-[500px]">
                                {subTabs.grading === "grade-approvals" && <GradeApprovals />}
                                {subTabs.grading === "student-grading" && <StudentGrading />}
                                {subTabs.grading === "lock-semester" && <LockSemester />}
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
