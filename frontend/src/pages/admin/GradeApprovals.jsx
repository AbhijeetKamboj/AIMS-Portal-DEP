import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";

export default function GradeApprovals() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        fetchPendingGrades();
    }, []);

    const fetchPendingGrades = async () => {
        setLoading(true);
        const res = await apiFetch("/admin/pending-grades");
        if (!res.error) setStats(res || []);
        setLoading(false);
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleApprove = async () => {
        if (selectedIds.length === 0) return;

        const res = await apiFetch("/admin/approve-grades", "POST", { grade_ids: selectedIds });
        if (!res.error) {
            await fetchPendingGrades();
            setSelectedIds([]);
        }
    };

    // Helper to safely get nested values
    const getStudentName = (s) => s.students?.users?.name || s.students?.users?.[0]?.name || "Unknown";
    const getStudentRoll = (s) => s.students?.roll_number || "N/A";
    const getCourseCode = (s) => s.course_offerings?.courses?.course_code || "N/A";
    const getCourseName = (s) => s.course_offerings?.courses?.course_name || "";
    const getFacultyName = (s) => s.course_offerings?.faculty?.users?.name || s.course_offerings?.faculty?.users?.[0]?.name || "N/A";

    if (loading) return <div className="p-8 text-center text-gray-500">Loading pending grades...</div>;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Pending Grade Approvals</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedIds(stats.map(s => s.id))}
                        className="text-sm text-gray-600 hover:text-black font-medium underline"
                    >
                        Select All
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={selectedIds.length === 0}
                        className="bg-black text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50 hover:bg-gray-800 transition"
                    >
                        Approve Selected ({selectedIds.length})
                    </button>
                </div>
            </div>

            {stats.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
                    No pending grades found.
                </div>
            ) : (
                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                            <tr>
                                <th className="p-4 w-10"></th>
                                <th className="p-4">Student</th>
                                <th className="p-4">Course</th>
                                <th className="p-4">Faculty</th>
                                <th className="p-4">Grade</th>
                                <th className="p-4">Submitted At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map(s => (
                                <tr key={s.id} className="border-t hover:bg-gray-50">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(s.id)}
                                            onChange={() => toggleSelect(s.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{getStudentName(s)}</div>
                                        <div className="text-xs text-gray-500 font-mono">{getStudentRoll(s)}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-medium">{getCourseCode(s)}</div>
                                        <div className="text-xs text-gray-500">{getCourseName(s)}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {getFacultyName(s)}
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {s.grade}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-gray-500">
                                        {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : "N/A"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
