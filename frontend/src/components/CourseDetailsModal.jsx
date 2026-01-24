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
    const gradeOptions = ["A", "A-", "B", "B-", "C", "C-", "D", "F", "W"];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-strong max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{offering.courses.course_name}</h2>
                            <span className="bg-black text-white px-2.5 py-0.5 rounded text-sm font-bold shadow-sm">{offering.courses.course_code}</span>
                        </div>
                        <div className="text-sm text-gray-500 font-medium">{offering.faculty?.users?.name}</div>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Details Grid */}
                <div className="px-8 py-6 border-b border-gray-100 grid grid-cols-2 gap-8 text-sm bg-white">
                    <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Instructor</p>
                        <p className="font-bold text-gray-900">{offering.faculty?.users?.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Course Structure (L-T-P-S)</p>
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                {offering.courses.l}-{offering.courses.t}-{offering.courses.p}-{offering.courses.s}
                            </span>
                            <span className="text-gray-500 font-medium">({offering.courses.credits} Credits)</span>
                        </div>
                    </div>
                </div>

                {/* Enrollment List */}
                <div className="flex-1 overflow-hidden flex flex-col bg-white">
                    <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Enrollment List</h3>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{detailsData.length} Students</span>
                    </div>
                    
                    <div className="overflow-y-auto p-0 flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center h-48">
                                <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                            </div>
                        ) : detailsData.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 font-medium italic">No students enrolled yet.</div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase tracking-wider bg-gray-50/50 sticky top-0 backdrop-blur-sm z-10 font-bold">
                                    <tr>
                                        <th className="px-8 py-3">Roll No</th>
                                        <th className="px-8 py-3">Name</th>
                                        <th className="px-8 py-3">Status</th>
                                        {userRole === "faculty" && <th className="px-8 py-3 text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {detailsData.map((e, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-3.5 font-mono font-medium text-gray-600">{e.students.roll_number}</td>
                                            <td className="px-8 py-3.5 font-bold text-gray-900">{e.students.user.name}</td>
                                            <td className="px-8 py-3.5">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide inline-block
                                                    ${e.status === 'enrolled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                      e.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' : 
                                                      'bg-amber-50 text-amber-700 border border-amber-100'
                                                    }`}>
                                                    {e.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            {userRole === "faculty" && (
                                                <td className="px-8 py-3.5 text-right">
                                                    {e.status === 'enrolled' && (
                                                        <button
                                                            onClick={() => {
                                                                setGradingStudent(e);
                                                                setSelectedGrade("");
                                                            }}
                                                            className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-all shadow-sm active:translate-y-0.5"
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
                        )}
                    </div>
                </div>
            </div>

            {/* Grading Modal */}
            {gradingStudent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in" onClick={() => setGradingStudent(null)}>
                    <div className="bg-white rounded-2xl shadow-strong max-w-sm w-full p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Assign Grade</h3>
                            <button onClick={() => setGradingStudent(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        
                        <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Student</p>
                            <p className="text-gray-900 font-bold text-lg">{gradingStudent.students.user.name}</p>
                            <p className="text-gray-500 font-mono text-sm">{gradingStudent.students.roll_number}</p>
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
                            <button onClick={() => setGradingStudent(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">Cancel</button>
                            <button
                                onClick={handleGradeSubmit}
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
