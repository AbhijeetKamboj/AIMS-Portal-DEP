import { useEffect, useState } from "react";
import { apiFetch } from "../services/api.js";
import toast from "react-hot-toast";

export default function CourseDetailsModal({ offering, onClose, userRole }) {
    const [detailsData, setDetailsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gradingStudent, setGradingStudent] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState("");

    useEffect(() => {
        fetchEnrollments();
    }, [offering]);

    const fetchEnrollments = async () => {
        setLoading(true);
        const res = await apiFetch(`/courses/enrollments?offering_id=${offering.id}`);
        if (!res.error) setDetailsData(res);
        setLoading(false);
    };

    const handleGradeSubmit = async () => {
        if (!selectedGrade || !gradingStudent) return;

        const res = await apiFetch("/faculty/submit-grade", "POST", {
            student_id: gradingStudent.students.user_id,
            offering_id: offering.id,
            grade: selectedGrade,
            attempt: 1
        });

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Grade submitted successfully");
            setGradingStudent(null);
            setSelectedGrade("");
            fetchEnrollments(); // Refresh
        }
    };

    // Must match grade_scale table in database
    const gradeOptions = ["A", "A-", "B+", "B-", "C", "C-", "D", "F", "W"];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{offering.courses.course_name}</h2>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm font-bold">{offering.courses.course_code}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                        <p className="text-gray-500">Instructor</p>
                        <p className="font-medium">{offering.faculty?.users?.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Credits</p>
                        <p className="font-medium">{offering.courses.credits} (L-T-P-S: {offering.courses.l}-{offering.courses.t}-{offering.courses.p}-{offering.courses.s})</p>
                    </div>
                </div>

                <h3 className="font-bold text-gray-800 border-b pb-2 mb-3">Enrollment List</h3>
                {loading ? (
                    <p className="text-gray-500 text-center py-4">Loading...</p>
                ) : detailsData.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No students enrolled yet.</p>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Roll No</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Status</th>
                                    {userRole === "faculty" && <th className="px-4 py-2">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {detailsData.map((e, i) => (
                                    <tr key={i} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 font-mono">{e.students.roll_number}</td>
                                        <td className="px-4 py-2">{e.students.user.name}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-0.5 rounded text-xs capitalize ${e.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                                                e.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {e.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        {userRole === "faculty" && (
                                            <td className="px-4 py-2">
                                                {e.status === 'enrolled' && (
                                                    <button
                                                        onClick={() => {
                                                            setGradingStudent(e);
                                                            setSelectedGrade("");
                                                        }}
                                                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                                                    >
                                                        Grade
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Grading Modal */}
            {gradingStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60]" onClick={() => setGradingStudent(null)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Assign Grade</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Student: <span className="font-semibold">{gradingStudent.students.user.name}</span> ({gradingStudent.students.roll_number})
                        </p>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Grade</label>
                            <div className="grid grid-cols-3 gap-2">
                                {gradeOptions.map(grade => (
                                    <button
                                        key={grade}
                                        onClick={() => setSelectedGrade(grade)}
                                        className={`p-2 border rounded font-bold transition ${selectedGrade === grade
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                                            }`}
                                    >
                                        {grade}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setGradingStudent(null)} className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100">Cancel</button>
                            <button
                                onClick={handleGradeSubmit}
                                disabled={!selectedGrade}
                                className="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Grade
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
