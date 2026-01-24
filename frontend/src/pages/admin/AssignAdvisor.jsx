import { useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function AssignAdvisor() {
    const [form, setForm] = useState({ student_roll: "", faculty_email: "" });
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!form.student_roll || !form.faculty_email) return toast.error("Fill all fields");

        setLoading(true);
        try {
            const res = await apiFetch("/admin/assign-advisor", "POST", form);
            if (res.error) throw new Error(res.error);
            toast.success(res.message);
            setForm({ student_roll: "", faculty_email: "" });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h3 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">Assign Faculty Advisor</h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student Roll Number</label>
                    <input
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                        placeholder="e.g. 2023CSB1094"
                        value={form.student_roll}
                        onChange={e => setForm({ ...form, student_roll: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Faculty Email</label>
                    <input
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                        placeholder="faculty@iitrpr.ac.in"
                        value={form.faculty_email}
                        onChange={e => setForm({ ...form, faculty_email: e.target.value })}
                    />
                </div>
                <button
                    onClick={submit}
                    disabled={loading}
                    className="w-full py-3 bg-black text-white rounded-xl font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                    {loading ? "Assigning..." : "Assign Advisor"}
                </button>
            </div>
        </div>
    );
}
