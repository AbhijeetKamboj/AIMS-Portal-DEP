import { useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function UploadGrades() {
    const [inputMode, setInputMode] = useState("csv"); // csv or json
    const [csvInput, setCsvInput] = useState("");
    const [jsonInput, setJsonInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [preview, setPreview] = useState(null);

    const parseCSV = (csv) => {
        const lines = csv.trim().split('\n');
        if (lines.length < 2) throw new Error("CSV must have header and at least one data row");

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['roll_number', 'course_code', 'semester_id', 'grade'];

        for (const req of requiredHeaders) {
            if (!headers.includes(req)) {
                throw new Error(`Missing required column: ${req}`);
            }
        }

        const grades = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length < headers.length) continue; // Skip incomplete rows

            const obj = {};
            headers.forEach((h, idx) => {
                obj[h] = h === 'semester_id' ? parseInt(values[idx]) : values[idx];
            });
            grades.push(obj);
        }

        return grades;
    };

    const handlePreview = () => {
        try {
            let grades;
            if (inputMode === "csv") {
                grades = parseCSV(csvInput);
            } else {
                grades = JSON.parse(jsonInput);
            }

            if (!Array.isArray(grades) || grades.length === 0) {
                throw new Error("No valid grades found");
            }

            setPreview(grades);
            setResult(null);
        } catch (err) {
            toast.error(err.message);
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!preview || preview.length === 0) {
            toast.error("Please preview data first");
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const res = await apiFetch("/admin/upload-grades", "POST", { grades: preview });

            if (res.error) throw new Error(res.error);

            setResult(res.results);
            if (res.results.failed === 0) {
                toast.success(`Successfully uploaded ${res.results.success} grades!`);
                setCsvInput("");
                setJsonInput("");
                setPreview(null);
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
        <div className="w-full">
            <h3 className="text-xl font-bold mb-6 text-gray-900 tracking-tight flex items-center gap-2">
                <span>📊</span> Bulk Grade Upload
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Inputs */}
                <div className="space-y-6">
                    {/* Mode Toggle */}
                    <div className="p-1 bg-gray-100 rounded-xl inline-flex gap-1 mb-4">
                        <button
                            onClick={() => setInputMode("csv")}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${inputMode === "csv"
                                ? "bg-white text-black shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            CSV Upload
                        </button>
                        <button
                            onClick={() => setInputMode("json")}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${inputMode === "json"
                                ? "bg-white text-black shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            JSON Upload
                        </button>
                    </div>

                    {inputMode === "csv" ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Paste CSV Data
                                <span className="text-gray-400 font-normal ml-2 text-xs">
                                    roll_number, course_code, semester_id, grade
                                </span>
                            </label>
                            <div className="relative">
                                <textarea
                                    className="w-full h-64 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200 font-mono text-xs leading-relaxed"
                                    placeholder={`roll_number,course_code,semester_id,grade\n2023csb1094,CS101,1,A\n2023csb1095,CS101,1,B`}
                                    value={csvInput}
                                    onChange={(e) => setCsvInput(e.target.value)}
                                />
                                <div className="absolute top-3 right-3">
                                    <span className="text-[10px] font-bold bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-400">CSV</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Paste JSON Data
                            </label>
                            <div className="relative">
                                <textarea
                                    className="w-full h-64 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200 font-mono text-xs leading-relaxed"
                                    placeholder={`[\n  {"roll_number": "2023csb1094", "course_code": "CS101", "semester_id": 1, "grade": "A"}\n]`}
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                />
                                <div className="absolute top-3 right-3">
                                    <span className="text-[10px] font-bold bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-400">JSON</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handlePreview}
                        disabled={loading || (inputMode === "csv" ? !csvInput.trim() : !jsonInput.trim())}
                        className="w-full py-3 bg-white border border-gray-200 text-black rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Preview Data
                    </button>
                </div>

                {/* Right Column: Preview & Results */}
                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-1 min-h-[300px] flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Preview</h4>
                            {preview && (
                                <span className="bg-black text-white text-xs px-2 py-0.5 rounded font-bold">{preview.length} Records</span>
                            )}
                        </div>

                        {/* Results Summary Overlay/Section */}
                        {result && (
                            <div className="m-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-sm font-bold text-gray-900 mb-2">Upload Results</p>
                                <div className="flex gap-4 text-sm mb-3">
                                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">Success: {result.success}</span>
                                    <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">Failed: {result.failed}</span>
                                </div>
                                {result.errors?.length > 0 && (
                                    <div className="max-h-32 overflow-y-auto bg-gray-50 rounded border border-gray-100 p-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Errors</p>
                                        {result.errors.map((err, idx) => (
                                            <div key={idx} className="text-xs text-red-500 truncate py-0.5">
                                                <span className="font-mono text-gray-500">{err.item?.roll_number} ({err.item?.course_code}):</span> {err.error}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {!preview && !result ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                                <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                <p className="text-sm font-medium">No data to preview</p>
                            </div>
                        ) : preview && (
                            <div className="flex-1 overflow-y-auto max-h-[400px]">
                                <table className="w-full text-sm">
                                    <thead className="bg-white sticky top-0 shadow-sm z-10">
                                        <tr className="text-xs text-left text-gray-400 font-bold uppercase">
                                            <th className="px-4 py-3">Roll No</th>
                                            <th className="px-4 py-3">Course</th>
                                            <th className="px-4 py-3 text-center">Sem</th>
                                            <th className="px-4 py-3 text-right">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {preview.map((g, idx) => (
                                            <tr key={idx} className="bg-white hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-2 font-mono text-gray-600 font-bold">{g.roll_number}</td>
                                                <td className="px-4 py-2 text-gray-600">{g.course_code}</td>
                                                <td className="px-4 py-2 text-center text-gray-400">{g.semester_id}</td>
                                                <td className="px-4 py-2 text-right font-bold text-black">{g.grade}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={loading || !preview}
                        className="w-full py-3 bg-black text-white rounded-xl font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                        {loading ? "Uploading..." : `Upload ${preview?.length || 0} Grades`}
                    </button>
                </div>
            </div>
        </div>
    );
}
