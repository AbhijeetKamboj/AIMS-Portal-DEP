import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api.js";

export default function GPAView() {
    const [cgpa, setCgpa] = useState(null);
    const [semesterGPA, setSemesterGPA] = useState([]);
    const [transcript, setTranscript] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [cgpaRes, sgpaRes, transcriptRes] = await Promise.all([
                apiFetch("/student/cgpa"),
                apiFetch("/student/semester-gpa"),
                apiFetch("/student/transcript")
            ]);

            if (!cgpaRes.error) setCgpa(cgpaRes);
            if (!sgpaRes.error) setSemesterGPA(sgpaRes);
            if (!transcriptRes.error) setTranscript(transcriptRes);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Top Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* CGPA */}
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:blur-3xl transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">CGPA</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold tracking-tight">{cgpa?.cgpa ? Number(cgpa.cgpa).toFixed(2) : "N/A"}</span>
                                    <span className="text-sm text-slate-400">/10.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Credits */}
                <div className="bg-gradient-to-br from-teal-700 to-teal-800 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:blur-3xl transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-teal-200 text-xs font-semibold uppercase tracking-wider mb-2">Total Credits Completed</p>
                                <div className="text-5xl font-bold tracking-tight mb-3">{cgpa?.total_credits || 0}</div>
                                <p className="text-teal-100 text-xs leading-relaxed">Credits are finalized and reflected here when the semester is locked by the academic office</p>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 flex-shrink-0 ml-4">
                                <svg className="w-6 h-6 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Semesters Count */}
                <div className="bg-gradient-to-br from-zinc-700 to-zinc-800 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:blur-3xl transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-2">Semesters</p>
                                <div className="text-5xl font-bold tracking-tight">{transcript?.semesters?.length || 0}</div>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                                <svg className="w-6 h-6 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Semester-wise Details with Courses */}
            <div>
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">Academic Record</h3>
                    <p className="text-gray-500 text-sm mt-1">Complete semester-wise breakdown of courses and grades</p>
                </div>
                
                {!transcript?.semesters || transcript.semesters.length === 0 ? (
                    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <p className="text-gray-500 font-medium text-lg">No academic records found</p>
                        <p className="text-gray-400 text-sm mt-1">Your semester data will appear here once available</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {transcript.semesters.map((sem, idx) => (
                            <div key={idx} className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                                {/* Semester Header - Matching Current Semester Style */}
                                <div className="bg-black text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <span className="font-bold text-lg tracking-tight">{sem.semester_name}</span>
                                    <div className="flex flex-wrap gap-4 text-xs font-medium opacity-90">
                                        <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                                            <span className="opacity-60 uppercase mr-2">SGPA</span>
                                            <span className="font-bold text-base">{sem.sgpa}</span>
                                        </div>
                                        <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                                            <span className="opacity-60 uppercase mr-2">Credits</span>
                                            <span className="font-bold text-base">{sem.credits}</span>
                                        </div>
                                        <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                                            <span className="opacity-60 uppercase mr-2">CGPA</span>
                                            <span className="font-bold text-base">{sem.cgpa}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Message */}
                                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-800">
                                    <span className="font-semibold">Credits Info:</span> Credits shown are for courses you are enrolled in or pending approvals. Final credits are counted when semester is locked.
                                </div>

                                {/* Courses Table - Clean and Professional */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Type</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-24">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sem.courses.map((c, cIdx) => (
                                                <tr key={cIdx} className="hover:bg-slate-50/50 transition-colors duration-200">
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-semibold text-gray-400">{cIdx + 1}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900 text-sm">{c.code}</div>
                                                        <div className="text-xs text-gray-500 mt-1 leading-relaxed">{c.name}</div>
                                                        <div className="text-xs text-gray-400 mt-1.5 font-mono bg-gray-50 px-2 py-1 rounded w-fit">{c.ltpsc}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">{c.type || "Credit"}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg
                                                            ${c.status === 'enrolled' ? 'bg-teal-50 text-teal-700' :
                                                              c.status === 'withdrawn' ? 'bg-gray-100 text-gray-600' :
                                                              'bg-amber-50 text-amber-700'
                                                        }`}>
                                                            <span className={`w-2 h-2 rounded-full 
                                                                ${c.status === 'enrolled' ? 'bg-teal-500' :
                                                                  c.status === 'withdrawn' ? 'bg-gray-400' :
                                                                  'bg-amber-500'
                                                            }`}></span>
                                                            {c.status || "Enrolled"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {c.grade ? (
                                                            <div className="inline-block">
                                                                <div className="text-sm font-bold text-white bg-slate-700 px-3 py-1.5 rounded-lg">{c.grade}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-300 font-medium">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
