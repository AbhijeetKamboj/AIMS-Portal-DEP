import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";
import { toast } from "react-hot-toast";

export default function CourseApprovals() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // We added logic in filtered endpoint to get by status
        const res = await apiFetch("/courses/list?status=pending");
        if (!res.error) setCourses(res || []);
        setLoading(false);
    };

    const handleAction = async (id, status) => { // 'approved' or 'rejected'
        const res = await apiFetch("/courses/approve-catalog", "POST", { course_id: id, status });

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(`Course ${status}`);
            setCourses(courses.filter(c => c.id !== id));
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading pending courses...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Pending Course Approvals</h3>
                <button onClick={fetchData} className="text-sm text-blue-600 hover:underline">Refresh</button>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
                    No pending courses found.
                </div>
            ) : (
                <div className="grid gap-4">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-lg">{course.course_code}</span>
                                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">{course.l}-{course.t}-{course.p}-{course.s}</span>
                                        <span className="text-sm text-gray-500">({course.credits} Credits)</span>
                                    </div>
                                    <h4 className="font-medium text-gray-900">{course.course_name}</h4>
                                    <p className="text-sm text-gray-500 mt-1">Department: {course.department}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(course.id, 'rejected')}
                                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(course.id, 'approved')}
                                        className="px-4 py-2 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-lg transition-colors shadow-sm"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
