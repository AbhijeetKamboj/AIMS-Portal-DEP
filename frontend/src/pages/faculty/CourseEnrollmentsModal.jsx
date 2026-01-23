import React, { useState, useEffect } from 'react';
import { apiFetch } from "../../services/api";

const CourseEnrollmentsModal = ({ offering, onClose }) => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (offering) {
            fetchEnrollments();
        }
    }, [offering]);

    const fetchEnrollments = async () => {
        setLoading(true);
        const res = await apiFetch(`/courses/enrollments?offering_id=${offering.id}`);
        if (!res.error) {
            setEnrollments(res);
        }
        setLoading(false);
    };

    const downloadCSV = () => {
        if (!enrollments.length) return;

        const headers = ["Roll Number", "Name", "Email", "Status", "Type"];
        const rows = enrollments.map(e => [
            e.students.roll_number,
            e.students.user.name,
            e.students.user.email || 'N/A', // Assuming email is in user
            e.status,
            e.enrollment_type
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${offering.courses.course_code}_enrollments.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Enrollments</h2>
                        <p className="text-sm text-gray-500">{offering.courses.course_code}: {offering.courses.course_name}</p>
                    </div>
                    <button onClick={onClose} className="text-2xl text-gray-400 hover:text-red-500 transition">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center p-8"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div></div>
                    ) : enrollments.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No students enrolled yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={downloadCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition"
                                >
                                    <span>📥</span> Download CSV
                                </button>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="py-3 px-2">Roll Number</th>
                                        <th className="py-3 px-2">Name</th>
                                        <th className="py-3 px-2">Email</th>
                                        <th className="py-3 px-2">Type</th>
                                        <th className="py-3 px-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {enrollments.map((enr, i) => (
                                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-2 font-mono font-medium">{enr.students.roll_number}</td>
                                            <td className="py-3 px-2 font-medium text-gray-900">{enr.students.user.name}</td>
                                            <td className="py-3 px-2 text-gray-500">{enr.students.user.email}</td>
                                            <td className="py-3 px-2 capitalize">{enr.enrollment_type}</td>
                                            <td className="py-3 px-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase
                                                    ${enr.status === 'enrolled' ? 'bg-green-100 text-green-700' :
                                                        enr.status === 'pending_faculty' || enr.status === 'pending_advisor' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-600'}`
                                                }>
                                                    {enr.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseEnrollmentsModal;
