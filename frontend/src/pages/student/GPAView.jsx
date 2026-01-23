import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api.js";

export default function GPAView() {
    const [cgpa, setCgpa] = useState(null);
    const [semesterGPA, setSemesterGPA] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [cgpaRes, sgpaRes] = await Promise.all([
                apiFetch("/student/cgpa"),
                apiFetch("/student/semester-gpa")
            ]);

            if (!cgpaRes.error) setCgpa(cgpaRes);
            if (!sgpaRes.error) setSemesterGPA(sgpaRes);
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
            {/* CGPA Card */}
            <div className="bg-black text-white rounded-[2rem] p-8 shadow-strong relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700 group-hover:bg-white/10"></div>
                <div className="relative z-10">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2">Cumulative GPA</h3>
                    <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-6xl sm:text-7xl font-bold tracking-tight">{cgpa?.cgpa ? Number(cgpa.cgpa).toFixed(2) : "N/A"}</span>
                        <span className="text-xl font-medium opacity-50">/ 10.0</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        <span className="text-sm font-medium">Total Credits Earned: {cgpa?.total_credits || 0}</span>
                    </div>
                </div>
            </div>

            {/* Semester-wise GPA */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    Semester Performance
                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{semesterGPA.length} terms</span>
                </h3>
                
                {semesterGPA.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No grades recorded yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {semesterGPA.map((sem, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-gray-50 rounded-lg p-2">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-gray-900">{Number(sem.sgpa).toFixed(2)}</div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">SGPA</div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{sem.semester_name}</h4>
                                    <p className="text-sm text-gray-500 font-medium">{sem.total_credits} Credits Registered</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
