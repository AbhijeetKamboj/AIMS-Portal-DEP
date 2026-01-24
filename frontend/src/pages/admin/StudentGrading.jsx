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
    const gradeOptions = ["A", "A-", "B", "B-", "C", "C-", "D", "F", "W"];

    return (
        <div className="w-full">
            <h3 className="text-xl font-bold mb-6 text-gray-900 tracking-tight flex items-center gap-2">
                <span>📝</span> Student Grading
            </h3>

            {/* Course Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                <div className="relative">
                    <select
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200 appearance-none cursor-pointer"
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
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Enrollment List */}
            {selectedOffering && (
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-soft">
                    <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                {selectedOffering.courses?.course_name}
                                <span className="text-xs bg-black text-white px-2 py-0.5 rounded font-bold">{selectedOffering.courses?.course_code}</span>
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">Faculty: {selectedOffering.faculty?.users?.name}</p>
                        </div>
                    </div>

                    {loading ? (
                         <div className="flex justify-center items-center h-48 bg-white">
                            <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                        </div>
                    ) : enrollments.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 font-medium italic bg-white">No enrolled students found.</div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto bg-white">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                                    <tr className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                                        <th className="px-6 py-4 text-left">Roll No</th>
                                        <th className="px-6 py-4 text-left">Name</th>
                                        <th className="px-6 py-4 text-left">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {enrollments.map((e, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-gray-600">{e.students?.roll_number}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{e.students?.user?.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide inline-block ${e.status === 'enrolled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                    e.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                    }`}>
                                                    {e.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {e.status === 'enrolled' && (
                                                    <button
                                                        onClick={() => { setGrading(e); setSelectedGrade(""); }}
                                                        className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition shadow-sm active:translate-y-0.5"
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setGrading(null)}>
                    <div className="bg-white rounded-2xl shadow-strong max-w-sm w-full p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Assign Grade</h3>
                            <button onClick={() => setGrading(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        
                        <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Student</p>
                            <p className="text-gray-900 font-bold text-lg">{grading.students?.user?.name}</p>
                            <p className="text-gray-500 font-mono text-sm">{grading.students?.roll_number}</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Select Grade</label>
                            <div className="grid grid-cols-3 gap-3">
                                {gradeOptions.map(grade => (
                                    <button
                                        key={grade}
                                        onClick={() => setSelectedGrade(grade)}
                                        className={`py-2.5 rounded-lg font-bold text-sm transition-all duration-200 border
                                            ${selectedGrade === grade
                                                ? 'bg-black text-white border-black shadow-md transform -translate-y-0.5'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
                                            }`}
                                    >
                                        {grade}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setGrading(null)}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitGrade}
                                disabled={!selectedGrade}
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-black hover:bg-gray-800 transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
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
