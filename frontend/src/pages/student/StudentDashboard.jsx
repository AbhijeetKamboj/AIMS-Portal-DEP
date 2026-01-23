import { useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import StudentProfileHeader from "./StudentProfileHeader.jsx";
import StudentAcademics from "./StudentAcademics.jsx";
import GPAView from "./GPAView.jsx";
import Offerings from "./Offerings.jsx";
import MeetingScheduler from "../../components/MeetingScheduler.jsx";
import StudentDocuments from "../../components/StudentDocuments.jsx";


export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState("academics");

    const tabs = [
        { id: "academics", label: "Academics", icon: "📚" },
        { id: "gpa", label: "GPA", icon: "📊" },
        { id: "meetings", label: "Faculty Meetings", icon: "👥" },
        { id: "documents", label: "Documents", icon: "📄" },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar title="AIMS Student Portal" />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                <StudentProfileHeader />

                {/* Modern Tab Navigation */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-1" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200
                                        ${activeTab === tab.id
                                            ? "bg-white text-black border-t-2 border-x border-black -mb-px"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="card p-6 min-h-[500px] animate-fadeIn">
                    {activeTab === "academics" && (
                        <div className="space-y-8">
                            <StudentAcademics />
                            <div className="border-t pt-8">
                                <Offerings />
                            </div>
                        </div>
                    )}

                    {activeTab === "gpa" && (
                        <div>
                            <GPAView />
                        </div>
                    )}

                    {activeTab === "meetings" && (
                        <div>
                            <MeetingScheduler userRole="student" />
                        </div>
                    )}

                    {activeTab === "documents" && (
                        <div>
                            <StudentDocuments />
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
