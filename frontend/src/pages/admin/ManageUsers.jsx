import { useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";
import BulkImportPanel from "./BulkImportPanel.jsx";

export default function ManageUsers() {
    const [subTab, setSubTab] = useState("single");
    const [userType, setUserType] = useState("student");
    const [singleForm, setSingleForm] = useState({ department: "", name: "", email: "" });
    const [singleLoading, setSingleLoading] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkResult, setBulkResult] = useState(null);

    const expectedFields = userType === "student"
        ? ["email", "name", "department", "roll_number", "batch"]
        : ["email", "name", "department", "employee_id"];

    // Single User Creation
    const handleSingleSubmit = async () => {
        if (!singleForm.name || !singleForm.email || !singleForm.department) {
            toast.error("Please fill all required fields");
            return;
        }

        setSingleLoading(true);
        const endpoint =
            userType === "student" ? "/admin/create-student" : "/admin/create-faculty";

        try {
            const res = await apiFetch(endpoint, "POST", singleForm);
            if (res.error) throw new Error(res.error);
            toast.success(`${userType === "student" ? "Student" : "Faculty"} created successfully!`);
            setSingleForm({ department: "", name: "", email: "" });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSingleLoading(false);
        }
    };

    // Bulk Import Handler
    const handleBulkImport = async (data) => {
        setBulkLoading(true);
        setBulkResult(null);

        try {
            // Transform data based on format
            const transformedUsers = data.map((row) => {
                const user = { ...row };
                // Convert role_id if present
                if (user.role_id) {
                    user.role_id = parseInt(user.role_id);
                }
                if (user.batch) {
                    user.batch = parseInt(user.batch);
                }
                return user;
            });

            const res = await apiFetch("/admin/bulk-users", "POST", { users: transformedUsers });

            if (res.error) {
                toast.error(res.error);
                setBulkResult({ success: 0, failed: data.length, errors: [{ error: res.error }] });
            } else {
                setBulkResult(res.results || res);
                toast.success(`Processed ${res.results?.success || 0} users successfully!`);
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
                    Add Single User
                </button>
                <button
                    onClick={() => setSubTab("bulk")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                        subTab === "bulk"
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Bulk Import Users
                </button>
            </div>

            {/* Single User Tab */}
            {subTab === "single" && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">Create New User</h3>

                    {/* User Type Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                        <button
                            className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all duration-200 whitespace-nowrap ${
                                userType === "student"
                                    ? "bg-white shadow-soft text-black"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                            onClick={() => setUserType("student")}
                        >
                            Student
                        </button>
                        <button
                            className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all duration-200 whitespace-nowrap ${
                                userType === "faculty"
                                    ? "bg-white shadow-soft text-black"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                            onClick={() => setUserType("faculty")}
                        >
                            Faculty
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                <input
                                    name="name"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                                    placeholder="John Doe"
                                    value={singleForm.name || ""}
                                    onChange={handleSingleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                <input
                                    name="email"
                                    type="email"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                                    placeholder="2023csb1000@iitrpr.ac.in"
                                    value={singleForm.email || ""}
                                    onChange={handleSingleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                            <input
                                name="department"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                                placeholder="e.g. CSE"
                                value={singleForm.department || ""}
                                onChange={handleSingleChange}
                            />
                        </div>

                        {userType === "student" && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                                        <input
                                            name="roll_number"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                                            placeholder="2023CSB1000"
                                            value={singleForm.roll_number || ""}
                                            onChange={handleSingleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                                        <input
                                            name="batch"
                                            type="number"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                                            placeholder="2023"
                                            value={singleForm.batch || ""}
                                            onChange={handleSingleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {userType === "faculty" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                                <input
                                    name="employee_id"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                                    placeholder="FAC001"
                                    value={singleForm.employee_id || ""}
                                    onChange={handleSingleChange}
                                />
                            </div>
                        )}

                        <button
                            onClick={handleSingleSubmit}
                            disabled={singleLoading}
                            className="w-full py-3 bg-black text-white rounded-xl font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                        >
                            {singleLoading ? "Creating..." : "Create User"}
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Import Tab */}
            {subTab === "bulk" && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">Bulk Import Users</h3>

                    <BulkImportPanel
                        expectedFields={expectedFields}
                        onImport={handleBulkImport}
                        dataType="users"
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
                                                {err.email || err.student_roll || `Row ${i + 1}`}: {err.error}
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
