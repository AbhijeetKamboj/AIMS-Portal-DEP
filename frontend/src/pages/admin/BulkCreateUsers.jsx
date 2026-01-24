import { useState } from "react";
import { apiFetch } from "../../services/api";
import { toast } from "react-hot-toast";

export default function BulkCreateUsers() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleProcess = async () => {
        setLoading(true);
        setResult(null);

        // Simple CSV Parser
        // Expected format: email, password, name, role_id, roll_number/id, department, batch
        const lines = input.trim().split("\n");
        const users = [];

        // Skip header if present (heuristic: check if role_id is number)
        // Let's assume NO header or user knows. 
        // Tip: "email,password,name,role_id,roll_number,department,batch"

        for (const line of lines) {
            const parts = line.split(",").map(p => p.trim());
            if (parts.length < 4) continue; // Skip invalid lines

            const [email, password, name, role_id, id_code, department, batch] = parts;

            users.push({
                email,
                password,
                name,
                role_id: parseInt(role_id),
                employee_id: role_id == 2 ? id_code : undefined,
                roll_number: role_id == 1 ? id_code : undefined,
                department,
                batch: batch ? parseInt(batch) : undefined
            });
        }

        if (users.length === 0) {
            toast.error("No valid users found in input");
            setLoading(false);
            return;
        }

        const res = await apiFetch("/admin/bulk-users", "POST", { users });

        if (res.error) {
            toast.error(res.error);
        } else {
            setResult(res.results);
            toast.success(`Processed ${res.results.success} users`);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold mb-2">Bulk Create Users</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Paste CSV data (no header). Format:<br />
                    <code className="bg-gray-100 p-1 rounded block mt-1">email, password, name, role_id(1=Stu/2=Fac/3=Adm), roll/emp_id, department, batch</code>
                </p>
            </div>

            <textarea
                className="w-full h-64 p-4 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-black outline-none"
                placeholder={`student@test.com, pass123, John Doe, 1, CS2401, CSE, 2024\nprof@test.com, pass123, Dr. Smith, 2, FAC01, CSE,`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />

            <div className="flex justify-between items-center">
                <button
                    onClick={handleProcess}
                    disabled={loading || !input.trim()}
                    className="bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition-all"
                >
                    {loading ? "Processing..." : "Create Users"}
                </button>
            </div>

            {result && (
                <div className="bg-gray-50 p-4 rounded-xl text-sm">
                    <p className="font-bold text-green-600">Success: {result.success}</p>
                    <p className="font-bold text-red-600">Failed: {result.failed}</p>
                    {result.errors.length > 0 && (
                        <div className="mt-2 space-y-1">
                            <p className="font-bold text-gray-700">Errors:</p>
                            {result.errors.map((e, i) => (
                                <div key={i} className="text-red-500 text-xs">
                                    {e.email}: {e.error}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
