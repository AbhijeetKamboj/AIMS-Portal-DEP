import { useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function CreateUser() {
    const [type, setType] = useState("student");
    const [form, setForm] = useState({ department: "", name: "", email: "" });
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        const endpoint =
            type === "student" ? "/admin/create-student" : "/admin/create-faculty";

        try {
            const res = await apiFetch(endpoint, "POST", form);
            if (res.error) throw new Error(res.error);
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`);
            // Reset form partially
            setForm(prev => ({ ...prev, name: "", email: "", roll_number: "", employee_id: "" }));
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Create New User</h3>

            {/* User Type Toggle */}
            <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === "student" ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setType("student")}
                >
                    Student
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === "faculty" ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setType("faculty")}
                >
                    Faculty
                </button>
            </div>

            <div className="space-y-4">
                {/* Common Fields */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        name="name"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        placeholder="John Doe"
                        value={form.name || ""}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        name="email"
                        type="email"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        placeholder="john@example.com"
                        value={form.email || ""}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                        name="department"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        placeholder="e.g. CSE"
                        value={form.department || ""}
                        onChange={handleChange}
                    />
                </div>

                {/* Dynamic Fields */}
                {type === "student" ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                            <input
                                name="roll_number"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                placeholder="2023CS01"
                                value={form.roll_number || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                            <input
                                name="batch"
                                type="number"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                placeholder="2023"
                                value={form.batch || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                        <input
                            name="employee_id"
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            placeholder="EMP001"
                            value={form.employee_id || ""}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <button
                    onClick={submit}
                    disabled={loading}
                    className={`w-full py-2.5 rounded-lg text-white font-medium shadow-md transition-all 
                ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"}`}
                >
                    {loading ? "Creating..." : `Create ${type === "student" ? "Student" : "Faculty"}`}
                </button>
            </div>
        </div>
    );
}
