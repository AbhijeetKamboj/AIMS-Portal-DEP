import { useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function DirectEnroll() {
    const [form, setForm] = useState({ roll_number: "", offering_id: "" });
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        try {
            const res = await apiFetch("/faculty/direct-enroll", "POST", { ...form, offering_id: +form.offering_id });
            if (res.error) throw new Error(res.error);
            toast.success("Student Enrolled Successfully");
            setForm({ roll_number: "", offering_id: "" });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h3 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">Direct Enroll Student</h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student Roll Number</label>
                    <input
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                        placeholder="e.g. 2023CS01"
                        value={form.roll_number}
                        onChange={e => setForm({ ...form, roll_number: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Offering ID</label>
                    <input
                        type="number"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                        placeholder="e.g. 10"
                        value={form.offering_id}
                        onChange={e => setForm({ ...form, offering_id: e.target.value })}
                    />
                </div>
                <button 
                    onClick={submit} 
                    disabled={loading} 
                    className="w-full py-3 bg-black text-white rounded-xl font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Enrolling...</span>
                        </div>
                    ) : (
                        "Enroll Student"
                    )}
                </button>
            </div>
        </div>
    );
}
