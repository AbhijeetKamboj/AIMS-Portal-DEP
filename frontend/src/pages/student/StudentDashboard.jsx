import { useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import StudentProfileHeader from "./StudentProfileHeader.jsx";
import StudentAcademics from "./StudentAcademics.jsx";
import Offerings from "./Offerings.jsx";
import GPAView from "./GPAView.jsx";

export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState("academics");

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar title="AIMS Student Portal" />

            <main className="max-w-7xl mx-auto py-6 px-4">

                <StudentProfileHeader />

                {/* Tabs */}
                <div className="flex gap-2 mb-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("academics")}
                        className={`px-4 py-2 text-sm font-bold border-t border-x rounded-t transition-colors ${activeTab === "academics"
                            ? "bg-white border-b-white text-blue-600 -mb-px z-10"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                    >
                        Academics
                    </button>
                    <button
                        onClick={() => setActiveTab("gpa")}
                        className={`px-4 py-2 text-sm font-bold border-t border-x rounded-t transition-colors ${activeTab === "gpa"
                            ? "bg-white border-b-white text-blue-600 -mb-px z-10"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                    >
                        GPA
                    </button>
                    <button
                        onClick={() => setActiveTab("documents")}
                        className={`px-4 py-2 text-sm font-bold border-t border-x rounded-t transition-colors ${activeTab === "documents"
                            ? "bg-white border-b-white text-blue-600 -mb-px z-10"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                    >
                        Documents
                    </button>
                </div>

                <div className="bg-white p-4 border rounded-b shadow-sm min-h-[500px]">
                    {activeTab === "academics" && (
                        <div className="space-y-8 animate-fadeIn">
                            <StudentAcademics />
                            <Offerings />
                        </div>
                    )}

                    {activeTab === "gpa" && (
                        <div className="animate-fadeIn">
                            <GPAView />
                        </div>
                    )}

                    {activeTab === "documents" && (
                        <div className="p-8 text-center text-gray-500">
                            <p>No documents available.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
