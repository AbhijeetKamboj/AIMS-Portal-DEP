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

    if (loading) return <div className="text-center py-8 text-gray-500">Loading GPA data...</div>;

    return (
        <div className="space-y-6">
            {/* CGPA Card */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">Cumulative GPA</h3>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{cgpa?.cgpa ? Number(cgpa.cgpa).toFixed(2) : "N/A"}</span>
                    <span className="text-lg opacity-75">/ 10.0</span>
                </div>
                <p className="mt-2 text-sm opacity-80">Total Credits: {cgpa?.total_credits || 0}</p>
            </div>

            {/* Semester-wise GPA */}
            <div className="bg-white rounded-lg shadow border p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Semester-wise Performance</h3>
                {semesterGPA.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No grades recorded yet.</p>
                ) : (
                    <div className="space-y-3">
                        {semesterGPA.map((sem, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                <div>
                                    <p className="font-semibold text-gray-800">{sem.semester_name}</p>
                                    <p className="text-xs text-gray-500">{sem.total_credits} Credits</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600">{Number(sem.sgpa).toFixed(2)}</p>
                                    <p className="text-xs text-gray-400">SGPA</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
