import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";
import { toast } from "react-hot-toast";

export default function CourseApprovals() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const res = await apiFetch("/courses/list?status=pending");
        if (!res.error) setCourses(res || []);
        setLoading(false);
    };

    const handleAction = async (id, status) => {
        const res = await apiFetch("/courses/approve-catalog", "POST", { course_id: id, status });

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(`Course ${status}`);
            setCourses(courses.filter(c => c.id !== id));
        }
    };

    const toggleSelect = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === courses.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(courses.map(c => c.id)));
        }
    };

    const handleBulkAction = async (status) => {
        if (selectedIds.size === 0) {
            toast.error("Please select at least one course");
            return;
        }

        setBulkLoading(true);
        try {
            const courseIds = Array.from(selectedIds);
            let successCount = 0;
            const errors = [];

            // Process each course individually
            for (const courseId of courseIds) {
                try {
                    const res = await apiFetch("/courses/approve-catalog", "POST", { 
                        course_id: courseId, 
                        status 
                    });

                    if (res.error) {
                        errors.push(res.error);
                    } else {
                        successCount++;
                    }
                } catch (err) {
                    errors.push(err.message);
                }
            }

            if (successCount > 0) {
                toast.success(`${successCount} courses ${status}`);
                setCourses(courses.filter(c => !selectedIds.has(c.id)));
                setSelectedIds(new Set());
            }

            if (errors.length > 0) {
                toast.error(`${errors.length} courses failed: ${errors[0]}`);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBulkLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading pending courses...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold">Pending Course Approvals</h3>
                {courses.length > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                        <input
                            type="checkbox"
                            checked={selectedIds.size === courses.length && courses.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700">Select All</span>
                    </label>
                )}
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
                    No pending courses found.
                </div>
            ) : (
                <>
                    {selectedIds.size > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === courses.length}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <span className="font-semibold text-blue-900">
                                    {selectedIds.size} of {courses.length} selected
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleBulkAction('rejected')}
                                    disabled={bulkLoading}
                                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg transition-colors"
                                >
                                    {bulkLoading ? "Processing..." : "Reject Selected"}
                                </button>
                                <button
                                    onClick={() => handleBulkAction('approved')}
                                    disabled={bulkLoading}
                                    className="px-4 py-2 text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                                >
                                    {bulkLoading ? "Processing..." : "Approve Selected"}
                                </button>
                                <button
                                    onClick={() => setSelectedIds(new Set())}
                                    disabled={bulkLoading}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="divide-y">
                            {courses.map(course => (
                                <div key={course.id} className="p-5 hover:bg-gray-50 transition-colors flex items-start gap-4 group">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(course.id)}
                                        onChange={() => toggleSelect(course.id)}
                                        className="w-4 h-4 cursor-pointer mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="font-bold text-base text-gray-900">{course.course_code}</span>
                                            <span className="px-2.5 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700 font-mono">{course.l}-{course.t}-{course.p}-{course.s}</span>
                                            <span className="text-sm text-gray-600">({course.credits} Credits)</span>
                                        </div>
                                        <h4 className="font-medium text-gray-900 mb-1">{course.course_name}</h4>
                                        <p className="text-sm text-gray-500">Department: {course.department}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 opacity-100 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleAction(course.id, 'rejected')}
                                            className="px-3.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(course.id, 'approved')}
                                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-black hover:bg-gray-800 rounded-lg transition-colors shadow-sm"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
