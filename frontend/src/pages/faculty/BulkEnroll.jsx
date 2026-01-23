import { useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function BulkEnroll({ offering, onClose }) {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSubmit = async () => {
        const rollNumbers = input
            .split(/[\n,]+/) // Split by newline or comma
            .map(s => s.trim())
            .filter(s => s); // Remove empty

        if (rollNumbers.length === 0) {
            toast.error("Please enter roll numbers");
            return;
        }

        setLoading(true);
        setResult(null);

        const res = await apiFetch("/faculty/bulk-enroll", "POST", {
            offering_id: offering.id,
            roll_numbers: rollNumbers
        });

        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            setResult(res.results);
            if (res.results.success > 0) {
                toast.success(`Enrolled ${res.results.success} students`);
                setInput("");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-bold text-gray-800">Bulk Enroll Students</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700">Course:</p>
                    <p className="text-gray-900">{offering.courses.course_code} - {offering.courses.course_name}</p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Roll Numbers (one per line or comma separated)
                    </label>
                    <textarea
                        className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={`2023CSB1094\n2023CSB1095\n...`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !input.trim()}
                    className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Enrolling..." : "Enroll Students"}
                </button>

                {/* Results */}
                {result && (
                    <div className="mt-4 p-3 bg-gray-50 rounded border text-sm">
                        <div className="flex gap-4 font-bold mb-2">
                            <span className="text-green-600">Success: {result.success}</span>
                            <span className="text-red-600">Failed: {result.failed}</span>
                        </div>
                        {result.errors.length > 0 && (
                            <div className="max-h-24 overflow-y-auto text-xs text-red-500 space-y-1">
                                {result.errors.map((e, i) => (
                                    <div key={i}>{e.roll_number}: {e.error}</div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
