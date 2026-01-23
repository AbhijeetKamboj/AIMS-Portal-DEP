import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function FacultyBulkEnroll() {
    const [offerings, setOfferings] = useState([]);
    const [selectedOffering, setSelectedOffering] = useState("");
    const [rollNumbersInput, setRollNumbersInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchOfferings();
    }, []);

    const fetchOfferings = async () => {
        const data = await apiFetch("/faculty/my-courses");
        if (!data.error) {
            setOfferings(data);
            if (data.length > 0) setSelectedOffering(data[0].id);
        }
    };

    const handleEnroll = async () => {
        if (!selectedOffering) {
            toast.error("Please select a course offering");
            return;
        }

        const rollNumbers = rollNumbersInput
            .split(/[\n,]+/) // Split by newline or comma
            .map(r => r.trim())
            .filter(r => r); // Remove empty strings

        if (rollNumbers.length === 0) {
            toast.error("Please enter at least one roll number");
            return;
        }

        setLoading(true);
        setResult(null);

        const res = await apiFetch("/faculty/bulk-enroll", "POST", {
            offering_id: selectedOffering,
            roll_numbers: rollNumbers
        });

        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            setResult(res.results);
            if (res.results.success > 0) {
                toast.success(`Enrolled ${res.results.success} students successfully!`);
                setRollNumbersInput("");
            }
        }
    };

    return (
        <div className="w-full">
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Course Offering</label>
                <div className="relative">
                    <select
                        value={selectedOffering}
                        onChange={(e) => setSelectedOffering(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200 appearance-none text-gray-900"
                    >
                        <option value="">-- Select Course --</option>
                        {offerings.map(o => (
                            <option key={o.id} value={o.id}>
                                {o.courses.course_code} - {o.courses.course_name} ({o.semesters.name})
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Student Roll Numbers
                    </label>
                    <span className="text-xs text-gray-400">Separated by newlines or commas</span>
                </div>
                <textarea
                    value={rollNumbersInput}
                    onChange={(e) => setRollNumbersInput(e.target.value)}
                    className="w-full p-4 h-48 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200 font-mono text-sm text-gray-800 resize-none"
                    placeholder={`2023CSB1001\n2023CSB1002\n2023CSB1003`}
                />
            </div>

            <button
                onClick={handleEnroll}
                disabled={loading || !selectedOffering}
                className={`w-full py-3 rounded-xl font-bold transition-all duration-300 transform active:scale-[0.98]
                    ${loading || !selectedOffering 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : "bg-black text-white shadow-soft hover:shadow-medium hover:-translate-y-0.5"}`}
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                    </div>
                ) : (
                    "Enroll Students"
                )}
            </button>

            {/* Results Summary */}
            {result && (
                <div className="mt-8 overflow-hidden rounded-xl border border-gray-100 shadow-soft animate-scale-in">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Enrollment Results</span>
                        <div className="flex gap-4">
                            <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                {result.success} Success
                            </span>
                            <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                {result.failed} Failed
                            </span>
                        </div>
                    </div>

                    {result.errors?.length > 0 && (
                        <div className="bg-white max-h-60 overflow-y-auto p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Roll Number</th>
                                        <th className="px-6 py-3 font-medium">Error</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {result.errors.map((err, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-3 font-mono font-medium text-gray-900">{err.roll_number}</td>
                                            <td className="px-6 py-3 text-red-500">{err.error}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {result.errors?.length === 0 && (
                         <div className="p-8 text-center bg-white">
                             <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-500 mb-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                             </div>
                             <p className="text-gray-900 font-medium">All students enrolled successfully!</p>
                         </div>
                    )}
                </div>
            )}
        </div>
    );
}
