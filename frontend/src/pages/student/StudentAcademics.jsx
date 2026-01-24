import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";
import CourseInfoModal from "../../components/CourseInfoModal";

export default function StudentAcademics() {
    const [data, setData] = useState({ enrollments: [], stats: {} });
    const [droppingId, setDroppingId] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await apiFetch("/student/transcript");
        if (!res.error) setData(res);
    };

    const handleDrop = async (enrollmentId, courseName) => {
        if (!confirm(`Are you sure you want to drop "${courseName}"? This action cannot be undone.`)) {
            return;
        }

        setDroppingId(enrollmentId);
        const res = await apiFetch("/student/drop-course", "POST", { enrollment_id: enrollmentId });

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Successfully withdrawn from course");
            fetchData();
        }
        setDroppingId(null);
    };

    const semesters = data.semesters || [];
    
    // Get only the current/latest semester (first one in the list as it's usually sorted)
    const currentSemester = semesters.length > 0 ? semesters[0] : null;

    return (
        <div className="space-y-8">
            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800">
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div className="text-sm">
                    <p className="font-bold mb-1">Important Note</p>
                    <p>Some of the grades shown here may be pending approval by the senate. The records confirmed by the academic section will take precedence. Check the GPA section to view all semesters.</p>
                </div>
            </div>

            {currentSemester ? (
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden animate-slide-up">
                    <div className="bg-black text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <span className="font-bold text-lg tracking-tight">{currentSemester.semester_name}</span>
                        <div className="flex flex-wrap gap-4 text-xs font-medium opacity-90">
                            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                                <span className="opacity-60 uppercase mr-2">SGPA</span>
                                <span className="font-bold text-base">{currentSemester.sgpa}</span>
                            </div>
                            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                                <span className="opacity-60 uppercase mr-2">Credits</span>
                                <span className="font-bold text-base">{currentSemester.registered_credits}</span>
                            </div>
                            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                                <span className="opacity-60 uppercase mr-2">CGPA</span>
                                <span className="font-bold text-base">{currentSemester.cgpa}</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider font-bold">
                                    <th className="px-6 py-4 w-12 text-center">#</th>
                                    <th className="px-6 py-4">Course</th>
                                    <th className="px-6 py-4 w-24">Type</th>
                                    <th className="px-6 py-4 w-32">Status</th>
                                    <th className="px-6 py-4 w-24 text-center">Grade</th>
                                    <th className="px-6 py-4 w-24 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {currentSemester.courses.map((c, cIdx) => (
                                    <tr key={cIdx} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelectedCourse(c)}>
                                        <td className="px-6 py-4 text-center text-gray-400 font-mono text-xs">{cIdx + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{c.code}</div>
                                            <div className="text-sm text-gray-500">{c.name}</div>
                                            <div className="text-xs text-gray-400 mt-1 font-mono">{c.ltpsc}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            {c.type || "Credit"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5
                                                ${c.status === 'enrolled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                  c.status === 'withdrawn' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                                                  'bg-amber-50 text-amber-700 border border-amber-100'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full 
                                                    ${c.status === 'enrolled' ? 'bg-emerald-500' :
                                                      c.status === 'withdrawn' ? 'bg-gray-400' :
                                                      'bg-amber-500'
                                                }`}></span>
                                                {c.status || "Enrolled"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {c.grade ? (
                                                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-200">{c.grade}</span>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            {c.status === 'enrolled' && !c.grade && (
                                                <button
                                                    onClick={() => handleDrop(c.enrollment_id, `${c.code} - ${c.name}`)}
                                                    disabled={droppingId === c.enrollment_id}
                                                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                                >
                                                    {droppingId === c.enrollment_id ? "..." : "Drop"}
                                                </button>
                                            )}
                                            {c.status === 'withdrawn' && (
                                                <span className="text-xs text-gray-400 font-medium italic">Withdrawn</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">No current semester courses found. Check the GPA section to view all semesters.</p>
                </div>
            )}

            {selectedCourse && (
                <CourseInfoModal
                    course={selectedCourse}
                    onClose={() => setSelectedCourse(null)}
                />
            )}
        </div>
    );
}
