import { useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function CreateCourse() {
    const [form, setForm] = useState({
        course_code: "",
        course_name: "",
        credits: 0,
        l: 3, t: 0, p: 0, s: 0
    });
    const [loading, setLoading] = useState(false);

    const calculateCredits = (l, t, p, s) => {
        // Typical formula, but keeping manual override or auto-calc based on inputs
        // Assuming credits = L + T + P/2 + S/2 or similar? 
        // For now, let user input credits manually or just default.
        // Actually user requirement said LTPSC at creation.
        return +l + +t + +p + +s; // Simple sum for now? Or just let user type.
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const submit = async () => {
        setLoading(true);
        try {
            const payload = {
                ...form,
                credits: +form.credits || (+form.l + +form.t + +form.p + +form.s), // Fallback calc
                l: +form.l, t: +form.t, p: +form.p, s: +form.s
            };
            const res = await apiFetch("/courses/create", "POST", payload);
            if (res.error) throw new Error(res.error);
            toast.success("Course Created!");
            setForm({ course_code: "", course_name: "", credits: 0, l: 3, t: 0, p: 0, s: 0 });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Create New Course</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <input name="course_code" placeholder="Course Code (CS101)" value={form.course_code} onChange={handleChange} className="p-2 border rounded" />
                <input name="course_name" placeholder="Course Name" value={form.course_name} onChange={handleChange} className="p-2 border rounded" />
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
                <div>
                    <label className="text-xs text-gray-500">L</label>
                    <input name="l" type="number" value={form.l} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="text-xs text-gray-500">T</label>
                    <input name="t" type="number" value={form.t} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="text-xs text-gray-500">P</label>
                    <input name="p" type="number" value={form.p} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="text-xs text-gray-500">S</label>
                    <input name="s" type="number" value={form.s} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="text-xs text-gray-500">Credits</label>
                    <input name="credits" type="number" value={form.credits} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
            </div>

            <button onClick={submit} disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded">
                {loading ? "Creating..." : "Create Course"}
            </button>
        </div>
    );
}
