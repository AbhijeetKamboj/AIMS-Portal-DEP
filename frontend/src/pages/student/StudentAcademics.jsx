import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";

export default function StudentAcademics() {
    const [data, setData] = useState({ enrollments: [], stats: {} });

    useEffect(() => {
        // Ideally use 'transcript' endpoint. 
        // I'll assume it returns { student_info: {}, semesters: [ { semester: "2023-I", courses: [...] } ] }

        apiFetch("/student/transcript").then(res => {
            if (!res.error) setData(res);
        });
    }, []);

    const semesters = data.semesters || [];

    return (
        <div className="bg-white border rounded shadow-sm text-sm">
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold border-b border-red-100">
                NOTE: Some of the grades shown here may be pending approval by the senate. The records confirmed by the academic section will take precedence.
            </div>

            {semesters.map((sem, idx) => (
                <div key={idx} className="mb-6">
                    <div className="bg-gray-800 text-white px-3 py-2 text-xs font-bold uppercase flex justify-between">
                        <span>Academic session: {sem.semester_name}</span>
                        <span>SGPA: {sem.sgpa} | Credits registered: {sem.credits} | Earned: {sem.earned} | CGPA: {sem.cgpa}</span>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-xs text-gray-600 font-bold border-b">
                                <th className="p-2 border-r">S#</th>
                                <th className="p-2 border-r w-1/3">Course</th>
                                <th className="p-2 border-r">Enrol.</th>
                                <th className="p-2 border-r">Enrol. status</th>
                                <th className="p-2 border-r">Course cat.</th>
                                <th className="p-2 border-r">Grade</th>
                                <th className="p-2">Attd.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sem.courses.map((c, cIdx) => (
                                <tr key={cIdx} className="border-b even:bg-gray-50 hover:bg-yellow-50 text-xs text-gray-800">
                                    <td className="p-2 border-r">{cIdx + 1}</td>
                                    <td className="p-2 border-r font-medium">
                                        {c.code} - {c.name} ({c.ltpsc})
                                    </td>
                                    <td className="p-2 border-r">{c.type || "Credit"}</td>
                                    <td className="p-2 border-r">{c.status || "Enrolled"}</td>
                                    <td className="p-2 border-r">{c.category || "GR"}</td>
                                    <td className="p-2 border-r font-bold">{c.grade || "-"}</td>
                                    <td className="p-2 text-blue-600 underline cursor-pointer">0%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}

            {!semesters.length && (
                <div className="p-6 text-center text-gray-500 italic">No academic records found.</div>
            )}
        </div>
    );
}
