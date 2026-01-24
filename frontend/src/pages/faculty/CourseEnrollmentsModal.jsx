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
            e.students.user.email || 'N/A',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Student Enrollments</h2>
                        <p className="text-sm text-gray-600 mt-1">{offering.courses.course_code}: {offering.courses.course_name}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 py-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
                        </div>
                    ) : enrollments.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400 font-medium">No students enrolled yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm font-medium text-gray-600">Total Enrollments: <span className="font-bold text-gray-900">{enrollments.length}</span></p>
                                <button
                                    onClick={downloadCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                                >
                                    Download CSV
                                </button>
                            </div>

                            <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-4 text-left font-bold text-gray-700">Roll Number</th>
                                            <th className="px-6 py-4 text-left font-bold text-gray-700">Name</th>
                                            <th className="px-6 py-4 text-left font-bold text-gray-700">Email</th>
                                            <th className="px-6 py-4 text-left font-bold text-gray-700">Type</th>
                                            <th className="px-6 py-4 text-left font-bold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {enrollments.map((enr, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-mono font-medium text-gray-700">{enr.students.roll_number}</td>
                                                <td className="px-6 py-4 font-semibold text-gray-900">{enr.students.user.name}</td>
                                                <td className="px-6 py-4 text-gray-600">{enr.students.user.email}</td>
                                                <td className="px-6 py-4 capitalize font-medium text-gray-700">{enr.enrollment_type}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase inline-block border
                                                        ${enr.status === 'enrolled' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            (enr.status === 'pending_faculty' || enr.status === 'pending_advisor') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                                'bg-gray-100 text-gray-700 border-gray-200'}`
                                                    }>
                                                        {enr.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseEnrollmentsModal;
