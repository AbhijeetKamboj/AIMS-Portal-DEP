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
        <div className="w-full">
            <h3 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">Create New Course</h3>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                        <input
                            name="course_code"
                            placeholder="e.g. CS101"
                            value={form.course_code}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                        <input
                            name="course_name"
                            placeholder="e.g. Introduction to Programming"
                            value={form.course_name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                        />
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Course Structure</label>
                    <div className="grid grid-cols-5 gap-4">
                        {['l', 't', 'p', 's', 'credits'].map((field) => (
                            <div key={field}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-center">{field}</label>
                                <input
                                    name={field}
                                    type="number"
                                    value={form[field]}
                                    onChange={handleChange}
                                    className={`w-full text-center px-4 py-3 rounded-xl border border-gray-200 focus:ring-0 outline-none transition-all duration-200 ${field === 'credits' ? 'bg-black text-white font-bold border-black' : 'bg-white focus:bg-white focus:border-black'}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={submit}
                    disabled={loading}
                    className="w-full py-3 bg-black text-white rounded-xl font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                    {loading ? "Creating..." : "Create Course"}
                </button>
            </div>
        </div>
    );
}
