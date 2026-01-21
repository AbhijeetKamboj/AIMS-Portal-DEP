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
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Direct Enroll Student</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Roll Number</label>
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="2023CS01"
                        value={form.roll_number}
                        onChange={e => setForm({ ...form, roll_number: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offering ID</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded"
                        placeholder="e.g. 10"
                        value={form.offering_id}
                        onChange={e => setForm({ ...form, offering_id: e.target.value })}
                    />
                </div>
                <button onClick={submit} disabled={loading} className="w-full bg-green-600 text-white py-2 rounded">
                    {loading ? "Enrolling..." : "Enroll Student"}
                </button>
            </div>
        </div>
    );
}
