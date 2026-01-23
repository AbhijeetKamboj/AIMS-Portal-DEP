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
        <div className="w-full">
            <h3 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">Create New User</h3>

            {/* User Type Toggle */}
            <div className="flex mb-6 bg-gray-100 p-1 rounded-xl">
                <button
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${type === "student" ? "bg-white shadow-soft text-black" : "text-gray-500 hover:text-gray-900"}`}
                    onClick={() => setType("student")}
                >
                    Student
                </button>
                <button
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${type === "faculty" ? "bg-white shadow-soft text-black" : "text-gray-500 hover:text-gray-900"}`}
                    onClick={() => setType("faculty")}
                >
                    Faculty
                </button>
            </div>

            <div className="space-y-4">
                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                            name="name"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                            placeholder="John Doe"
                            value={form.name || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                            placeholder="john@example.com"
                            value={form.email || ""}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                        name="department"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                        placeholder="e.g. CSE"
                        value={form.department || ""}
                        onChange={handleChange}
                    />
                </div>

                {/* Dynamic Fields */}
                {type === "student" ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                            <input
                                name="roll_number"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                                placeholder="2023CS01"
                                value={form.roll_number || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                            <input
                                name="batch"
                                type="number"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                                placeholder="2023"
                                value={form.batch || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                        <input
                            name="employee_id"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                            placeholder="EMP001"
                            value={form.employee_id || ""}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <button
                    onClick={submit}
                    disabled={loading}
                    className="w-full py-3 mt-4 bg-black text-white rounded-xl font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                    {loading ? "Creating..." : `Create ${type === "student" ? "Student" : "Faculty"}`}
                </button>
            </div>
        </div>
    );
}
