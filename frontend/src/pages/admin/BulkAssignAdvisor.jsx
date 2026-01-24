import { useState } from "react";
import { apiFetch } from "../../services/api";
import { toast } from "react-hot-toast";

export default function BulkAssignAdvisor() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleProcess = async () => {
        setLoading(true);
        setResult(null);

        const lines = input.trim().split("\n");
        const assignments = [];

        for (const line of lines) {
            const parts = line.split(",").map(p => p.trim());
            if (parts.length < 2) continue;

            const [student_roll, faculty_email] = parts;
            assignments.push({ student_roll, faculty_email });
        }

        if (assignments.length === 0) {
            toast.error("No valid assignments found");
            setLoading(false);
            return;
        }

        const res = await apiFetch("/admin/bulk-advisors", "POST", { assignments });

        if (res.error) {
            toast.error(res.error);
        } else {
            setResult(res.results);
            toast.success(`Processed ${res.results.success} assignments`);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold mb-2">Bulk Assign Advisors</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Paste CSV data. Format: <code className="bg-gray-100 p-1 rounded">student_roll_number, faculty_email</code>
                </p>
            </div>

            <textarea
                className="w-full h-64 p-4 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-black outline-none"
                placeholder={`CS2401, prof.smith@univ.edu\nCS2402, prof.doe@univ.edu`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />

            <button
                onClick={handleProcess}
                disabled={loading || !input.trim()}
                className="bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
                {loading ? "Processing..." : "Assign Advisors"}
            </button>

            {result && (
                <div className="bg-gray-50 p-4 rounded-xl text-sm">
                    <p className="font-bold text-green-600">Success: {result.success}</p>
                    <p className="font-bold text-red-600">Failed: {result.failed}</p>
                    {result.errors.length > 0 && (
                        <div className="mt-2 text-xs text-red-500">
                            {result.errors.map((e, i) => (
                                <div key={i}>{e.student_roll} -&gt; {e.faculty_email}: {e.error}</div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
