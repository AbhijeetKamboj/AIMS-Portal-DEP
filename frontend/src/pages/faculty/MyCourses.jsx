import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";
import FacultyAnnouncements from "./FacultyAnnouncements";
import CourseMaterials from "./CourseMaterials";
import BulkEnroll from "./BulkEnroll";
import CourseEnrollmentsModal from "./CourseEnrollmentsModal";
import GradeUploadModal from "./GradeUploadModal";
import CourseInfoModal from "../../components/CourseInfoModal";

export default function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeModal, setActiveModal] = useState({ type: null, offering: null });
    const [loading, setLoading] = useState(true);
    const [viewTab, setViewTab] = useState("active"); // 'active' or 'completed'

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        let filtered = courses;

        // Filter by tab
        if (viewTab === "active") {
            filtered = courses.filter(c => c.status === 'approved');
        } else {
            filtered = courses.filter(c => c.status === 'completed');
        }

        // Filter by search
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.courses.course_code.toLowerCase().includes(lower) ||
                c.courses.course_name.toLowerCase().includes(lower)
            );
        }

        setFilteredCourses(filtered);
    }, [searchQuery, courses, viewTab]);

    const fetchCourses = async () => {
        setLoading(true);
        const res = await apiFetch("/faculty/my-courses");
        if (!res.error) {
            setCourses(res);
        }
        setLoading(false);
    };

    const closeModal = () => setActiveModal({ type: null, offering: null });

    const activeCourses = courses.filter(c => c.status === 'approved');
    const completedCourses = courses.filter(c => c.status === 'completed');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-2"></div>
                <p>Loading your courses...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">My Courses</h3>
                    <div className="flex p-0.5 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => setViewTab("active")}
                            className={`px-3 py-1 text-sm font-bold rounded-md transition-all cursor-pointer ${viewTab === "active" ? "bg-white text-black shadow-sm" : "text-gray-500"}`}
                        >
                            Active ({activeCourses.length})
                        </button>
                        <button
                            onClick={() => setViewTab("completed")}
                            className={`px-3 py-1 text-sm font-bold rounded-md transition-all cursor-pointer ${viewTab === "completed" ? "bg-white text-black shadow-sm" : "text-gray-500"}`}
                        >
                            Completed ({completedCourses.length})
                        </button>
                    </div>
                </div>

                {/* Search Filter */}
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
            </div>

            <div className="space-y-4">
                {filteredCourses.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <div className="text-4xl mb-3">{viewTab === "active" ? "🎓" : "✅"}</div>
                        <h4 className="text-lg font-bold text-gray-900">No {viewTab === "active" ? "Active" : "Completed"} Courses</h4>
                        <p className="text-gray-500 max-w-sm mx-auto mt-1">
                            {searchQuery ? "Try a different search term." : viewTab === "active" ? "You are not teaching any courses this semester." : "No courses have been completed yet."}
                        </p>
                    </div>
                )}

                {filteredCourses.map(course => (
                    <div key={course.id} className={`group border rounded-xl p-6 transition-all duration-200 bg-white cursor-pointer ${course.status === 'completed' ? 'border-gray-300 bg-gray-50' : 'border-gray-200 hover:shadow-medium hover:border-gray-300'}`} onClick={() => setActiveModal({ type: 'courseInfo', offering: course })}>
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-bold text-xl text-gray-900">{course.courses.course_code}</h4>
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-bold uppercase tracking-wider ${course.status === 'completed' ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                                        {course.status === 'completed' ? 'Completed' : 'Active'}
                                    </span>
                                </div>
                                <h3 className="text-lg text-gray-700 font-medium">{course.courses.course_name}</h3>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                    <span>📅</span> {course.semesters.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveModal({ type: 'announcements', offering: course });
                                }}
                                className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-100 hover:border-gray-300 transition flex items-center justify-center gap-2 group/btn"
                            >
                                <span className="group-hover/btn:scale-110 transition-transform">📢</span> Announcements
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveModal({ type: 'materials', offering: course });
                                }}
                                className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-100 hover:border-gray-300 transition flex items-center justify-center gap-2 group/btn"
                            >
                                <span className="group-hover/btn:scale-110 transition-transform">📚</span> Materials
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveModal({ type: 'enrollments', offering: course });
                                }}
                                className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-100 hover:border-gray-300 transition flex items-center justify-center gap-2 group/btn"
                            >
                                <span className="group-hover/btn:scale-110 transition-transform">👥</span> Enrollments
                            </button>
                            {course.status === 'approved' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveModal({ type: 'grades', offering: course });
                                    }}
                                    className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-100 hover:border-gray-300 transition flex items-center justify-center gap-2 group/btn"
                                >
                                    <span className="group-hover/btn:scale-110 transition-transform">📝</span> Grades
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            {activeModal.type === 'courseInfo' && (
                <CourseInfoModal course={activeModal.offering} onClose={closeModal} />
            )}
            {activeModal.type === 'announcements' && (
                <FacultyAnnouncements offering={activeModal.offering} onClose={closeModal} />
            )}
            {activeModal.type === 'materials' && (
                <CourseMaterials offering={activeModal.offering} onClose={closeModal} />
            )}
            {activeModal.type === 'enrollments' && (
                <CourseEnrollmentsModal offering={activeModal.offering} onClose={closeModal} />
            )}
            {activeModal.type === 'grades' && (
                <GradeUploadModal offering={activeModal.offering} onClose={closeModal} />
            )}
        </div>
    );
}
