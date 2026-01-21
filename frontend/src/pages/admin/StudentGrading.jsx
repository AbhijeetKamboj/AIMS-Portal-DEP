import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function StudentGrading() {
    const [offerings, setOfferings] = useState([]);
    const [selectedOffering, setSelectedOffering] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [grading, setGrading] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState("");

    useEffect(() => {
        // Fetch all approved offerings
        apiFetch("/courses/offerings").then(data => {
            if (!data.error) setOfferings(data);
        });
    }, []);

    const loadEnrollments = async (offering) => {
        setSelectedOffering(offering);
        setLoading(true);
        const res = await apiFetch(`/courses/enrollments?offering_id=${offering.id}`);
        if (!res.error) setEnrollments(res);
        setLoading(false);
    };

    const submitGrade = async () => {
        if (!grading || !selectedGrade) return;

        const res = await apiFetch("/admin/submit-grade", "POST", {
            student_id: grading.students.user_id,
            offering_id: selectedOffering.id,
            grade: selectedGrade
        });

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Grade submitted!");
            setGrading(null);
            setSelectedGrade("");
            loadEnrollments(selectedOffering);
        }
    };

    // Must match grade_scale table in database
    const gradeOptions = ["A", "A-", "B+", "B-", "C", "C-", "D", "F", "W"];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <span>📝</span> Student Grading
            </h3>

            {/* Course Selection */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                <select
                    className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                        const off = offerings.find(o => o.id === +e.target.value);
                        if (off) loadEnrollments(off);
                    }}
                    value={selectedOffering?.id || ""}
                >
                    <option value="">-- Select a Course --</option>
                    {offerings.map(o => (
                        <option key={o.id} value={o.id}>
                            {o.courses?.course_code} - {o.courses?.course_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Enrollment List */}
            {selectedOffering && (
                <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3">
                        <h4 className="font-bold">{selectedOffering.courses?.course_code}: {selectedOffering.courses?.course_name}</h4>
                        <p className="text-sm opacity-90">Faculty: {selectedOffering.faculty?.users?.name}</p>
                    </div>

                    {loading ? (
                        <p className="p-4 text-gray-500 text-center">Loading students...</p>
                    ) : enrollments.length === 0 ? (
                        <p className="p-4 text-gray-500 text-center italic">No enrolled students found.</p>
                    ) : (
                        <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr className="text-xs text-gray-500 uppercase">
                                        <th className="px-4 py-2 text-left">Roll No</th>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrollments.map((e, i) => (
                                        <tr key={i} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 font-mono text-gray-700">{e.students?.roll_number}</td>
                                            <td className="px-4 py-2">{e.students?.user?.name}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-0.5 rounded text-xs capitalize ${e.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                                                    e.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {e.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {e.status === 'enrolled' && (
                                                    <button
                                                        onClick={() => { setGrading(e); setSelectedGrade(""); }}
                                                        className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 transition"
                                                    >
                                                        Grade
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Grading Modal */}
            {grading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setGrading(null)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">Assign Grade</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {selectedOffering?.courses?.course_code} - {grading.students?.user?.name} ({grading.students?.roll_number})
                        </p>

                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {gradeOptions.map(grade => (
                                <button
                                    key={grade}
                                    onClick={() => setSelectedGrade(grade)}
                                    className={`p-3 rounded-lg font-bold text-lg transition-all ${selectedGrade === grade
                                        ? 'bg-indigo-600 text-white scale-105 shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {grade}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setGrading(null)}
                                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitGrade}
                                disabled={!selectedGrade}
                                className="flex-1 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
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
