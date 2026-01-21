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
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Assign Faculty Advisor</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Roll Number</label>
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="2023CSB1094"
                        value={form.student_roll}
                        onChange={e => setForm({ ...form, student_roll: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Email</label>
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="faculty@iitrpr.ac.in"
                        value={form.faculty_email}
                        onChange={e => setForm({ ...form, faculty_email: e.target.value })}
                    />
                </div>
                <button
                    onClick={submit}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                    {loading ? "Assigning..." : "Assign Advisor"}
                </button>
            </div>
        </div>
    );
}
