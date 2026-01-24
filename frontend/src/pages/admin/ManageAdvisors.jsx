import { useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";
import BulkImportPanel from "./BulkImportPanel.jsx";

export default function ManageAdvisors() {
    const [subTab, setSubTab] = useState("single");
    const [singleForm, setSingleForm] = useState({ student_roll: "", faculty_email: "" });
    const [singleLoading, setSingleLoading] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkResult, setBulkResult] = useState(null);

    const expectedFields = ["student_roll", "faculty_email"];

    // Single Advisor Assignment
    const handleSingleSubmit = async () => {
        if (!singleForm.student_roll || !singleForm.faculty_email) {
            toast.error("Please fill all required fields");
            return;
        }

        setSingleLoading(true);
        try {
            const res = await apiFetch("/admin/assign-advisor", "POST", singleForm);
            if (res.error) throw new Error(res.error);
            toast.success(res.message || "Advisor assigned successfully!");
            setSingleForm({ student_roll: "", faculty_email: "" });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSingleLoading(false);
        }
    };

    // Bulk Advisor Assignment
    const handleBulkImport = async (data) => {
        setBulkLoading(true);
        setBulkResult(null);

        try {
            // Transform data to match expected format
            const assignments = data.map((row) => ({
                student_roll: row.student_roll || row["Student Roll"] || "",
                faculty_email: row.faculty_email || row["Faculty Email"] || "",
            }));

            const res = await apiFetch("/admin/bulk-advisors", "POST", { assignments });

            if (res.error) {
                toast.error(res.error);
                setBulkResult({ success: 0, failed: data.length, errors: [{ error: res.error }] });
            } else {
                setBulkResult(res.results || res);
                toast.success(`Processed ${res.results?.success || 0} assignments successfully!`);
            }
        } catch (err) {
            toast.error(err.message);
            setBulkResult({ success: 0, failed: data.length, errors: [{ error: err.message }] });
        } finally {
            setBulkLoading(false);
        }
    };

    const handleSingleChange = (e) => {
        setSingleForm({ ...singleForm, [e.target.name]: e.target.value });
    };

    return (
        <div className="w-full">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-fit mb-6 overflow-x-auto">
                <button
                    onClick={() => setSubTab("single")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                        subTab === "single"
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Assign Single Advisor
                </button>
                <button
                    onClick={() => setSubTab("bulk")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                        subTab === "bulk"
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Bulk Assign Advisors
                </button>
            </div>

            {/* Single Assignment Tab */}
            {subTab === "single" && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">Assign Faculty Advisor</h3>

                    <div className="space-y-4 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Student Roll Number *</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                                placeholder="e.g. 2023CSB1094"
                                name="student_roll"
                                value={singleForm.student_roll}
                                onChange={handleSingleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Faculty Email *</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                                placeholder="faculty@university.edu"
                                name="faculty_email"
                                type="email"
                                value={singleForm.faculty_email}
                                onChange={handleSingleChange}
                            />
                        </div>

                        <button
                            onClick={handleSingleSubmit}
                            disabled={singleLoading}
                            className="w-full py-3 bg-black text-white rounded-xl font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                        >
                            {singleLoading ? "Assigning..." : "Assign Advisor"}
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Assignment Tab */}
            {subTab === "bulk" && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">Bulk Assign Advisors</h3>

                    <BulkImportPanel
                        expectedFields={expectedFields}
                        onImport={handleBulkImport}
                        dataType="advisors"
                    />

                    {/* Results Display */}
                    {bulkResult && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <p className="text-xs font-medium text-green-600 mb-1">SUCCESSFUL</p>
                                    <p className="text-2xl font-bold text-green-700">{bulkResult.success || 0}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <p className="text-xs font-medium text-red-600 mb-1">FAILED</p>
                                    <p className="text-2xl font-bold text-red-700">{bulkResult.failed || 0}</p>
                                </div>
                            </div>

                            {bulkResult.errors && bulkResult.errors.length > 0 && (
                                <div className="space-y-2">
                                    <p className="font-bold text-gray-700 text-sm">Error Details:</p>
                                    <div className="bg-white border border-red-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
                                        {bulkResult.errors.map((err, i) => (
                                            <div key={i} className="text-xs text-red-600 border-b border-red-100 pb-1 last:border-0">
                                                {err.student_roll || `Row ${i + 1}`}: {err.error}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
