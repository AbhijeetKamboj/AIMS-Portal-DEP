import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar.jsx";
import OfferCourse from "./OfferCourse.jsx";
import FacultyApprovals from "./FacultyApprovals.jsx";
import AdvisorApprovals from "./AdvisorApprovals.jsx";
import MyCourses from "./MyCourses.jsx";
import MeetingRequests from "./MeetingRequests.jsx";
import FacultyBulkEnroll from "./FacultyBulkEnroll.jsx";
import AvailabilityManager from "./AvailabilityManager.jsx";
import CreateCourseCatalog from "./CreateCourseCatalog.jsx";

export default function FacultyDashboard() {
    const [activeTab, setActiveTab] = useState("courses");
    const [subTabs, setSubTabs] = useState({
        courses: "my-courses",
        approvals: "course-approvals",
        enrollment: "bulk-enroll",
        meetings: "requests"
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get("calendar");
        if (status) {
            setActiveTab("meetings");
            setSubTabs(prev => ({ ...prev, meetings: "availability" }));
            if (status === "connected") toast.success("Google Calendar connected!");
            else if (status === "failed") toast.error("Failed to connect Calendar");
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const tabs = [
        { id: "courses", label: "Courses", icon: "📚" },
        { id: "approvals", label: "Approvals", icon: "✅" },
        { id: "enrollment", label: "Enrollments", icon: "👥" },
        { id: "meetings", label: "Meetings", icon: "🤝" },
    ];

    const setSubTab = (tab, sub) => {
        setSubTabs(prev => ({ ...prev, [tab]: sub }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar title="Faculty Portal" />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Header with Greeting */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage your academic and administrative duties.</p>
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

                    {/* --- COURSES TAB --- */}
                    {activeTab === "courses" && (
                        <div className="space-y-6">
                            {/* Sub-Navigation Pills */}
                            <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                                <button
                                    onClick={() => setSubTab("courses", "my-courses")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTabs.courses === "my-courses" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    My Courses
                                </button>
                                <button
                                    onClick={() => setSubTab("courses", "offer-course")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTabs.courses === "offer-course" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Offer New Course
                                </button>
                                <button
                                    onClick={() => setSubTab("courses", "create-catalog")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTabs.courses === "create-catalog" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Add to Catalog
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 min-h-[500px]">
                                {subTabs.courses === "my-courses" && <MyCourses />}
                                {subTabs.courses === "offer-course" && <OfferCourse />}
                                {subTabs.courses === "create-catalog" && <CreateCourseCatalog />}
                            </div>
                        </div>
                    )}

                    {/* --- APPROVALS TAB --- */}
                    {activeTab === "approvals" && (
                        <div className="space-y-6">
                            <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                                <button
                                    onClick={() => setSubTab("approvals", "course-approvals")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTabs.approvals === "course-approvals" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Course Enrollments
                                </button>
                                <button
                                    onClick={() => setSubTab("approvals", "advisor-approvals")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTabs.approvals === "advisor-approvals" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Advisor Approvals
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 min-h-[500px]">
                                {subTabs.approvals === "course-approvals" ? <FacultyApprovals /> : <AdvisorApprovals />}
                            </div>
                        </div>
                    )}

                    {/* --- ENROLLMENT TAB --- */}
                    {activeTab === "enrollment" && (
                        <div className="space-y-6">
                            <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                                <button
                                    onClick={() => setSubTab("enrollment", "bulk-enroll")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTabs.enrollment === "bulk-enroll" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Bulk Enroll
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 min-h-[500px]">
                                <FacultyBulkEnroll />
                            </div>
                        </div>
                    )}

                    {/* --- MEETINGS TAB --- */}
                    {activeTab === "meetings" && (
                        <div className="space-y-6">
                            <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                                <button
                                    onClick={() => setSubTab("meetings", "requests")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTabs.meetings === "requests" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Meeting Requests
                                </button>
                                <button
                                    onClick={() => setSubTab("meetings", "availability")}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTabs.meetings === "availability" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Manage Availability
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 min-h-[500px]">
                                {subTabs.meetings === "requests" ? <MeetingRequests /> : <AvailabilityManager />}
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
