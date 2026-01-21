import { useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function UploadGrades() {
    const [jsonInput, setJsonInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleUpload = async () => {
        setLoading(true);
        setResult(null);
        try {
            let grades;
            try {
                grades = JSON.parse(jsonInput);
            } catch {
                throw new Error("Invalid JSON format");
            }

            if (!Array.isArray(grades)) throw new Error("Input must be an array of grade objects");

            const res = await apiFetch("/admin/upload-grades", "POST", { grades });

            if (res.error) throw new Error(res.error);

            setResult(res.results);
            if (res.results.failed === 0) {
                toast.success(`Successfully uploaded ${res.results.success} grades!`);
                setJsonInput("");
            } else {
                toast.error(`Uploaded ${res.results.success}, Failed ${res.results.failed}`);
            }

        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Upload Grades</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste JSON Data
                    <span className="text-gray-400 font-normal ml-2 text-xs">
                        [{`{ "roll_number": "...", "course_code": "...", "semester_id": 1, "grade": "A" }`}]
                    </span>
                </label>
                <textarea
                    className="w-full h-48 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder={`[\n  {\n    "roll_number": "2023CS01",\n    "course_code": "CS101",\n    "semester_id": 1,\n    "grade": "A"\n  }\n]`}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                />
            </div>

            <button
                onClick={handleUpload}
                disabled={loading || !jsonInput.trim()}
                className={`w-full py-2.5 rounded-lg text-white font-medium shadow-md transition-all 
            ${loading || !jsonInput.trim() ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"}`}
            >
                {loading ? "Uploading..." : "Upload Grades"}
            </button>

            {/* Results Summary */}
            {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700">Upload Results:</p>
                    <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-green-600">Success: {result.success}</span>
                        <span className="text-red-600">Failed: {result.failed}</span>
                    </div>
                    {result.errors.length > 0 && (
                        <div className="mt-3 max-h-32 overflow-y-auto">
                            <p className="text-xs font-semibold text-gray-500 mb-1">Errors:</p>
                            {result.errors.map((err, idx) => (
                                <div key={idx} className="text-xs text-red-500 truncate border-b border-gray-100 py-1">
                                    {err.item.roll_number} ({err.item.course_code}): {err.error}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
