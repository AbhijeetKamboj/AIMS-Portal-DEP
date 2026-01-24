import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function OfferCourse() {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [offeredIds, setOfferedIds] = useState([]);

    const [form, setForm] = useState({
        course_id: "",
        semester_id: "",
        offering_dept_id: "",
        allowed_dept_ids: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        apiFetch("/courses/list").then(data => !data.error && setCourses(data));
        apiFetch("/departments/list").then(data => !data.error && setDepartments(data));
        apiFetch("/courses/semesters").then(data => !data.error && setSemesters(data));
    }, []);

    useEffect(() => {
        if (form.semester_id) {
            apiFetch(`/courses/offered-courses?semester_id=${form.semester_id}`)
                .then(data => {
                    if (Array.isArray(data)) setOfferedIds(data);
                });
        }
    }, [form.semester_id]);

    const availableCourses = courses.filter(c => !offeredIds.includes(c.id));

    const toggleDept = (id) => {
        setForm(prev => {
            const current = prev.allowed_dept_ids;
            if (current.includes(id)) {
                return { ...prev, allowed_dept_ids: current.filter(d => d !== id) };
            } else {
                return { ...prev, allowed_dept_ids: [...current, id] };
            }
        });
    };

    const submit = async () => {
        if (!form.course_id || !form.offering_dept_id || !form.semester_id) return toast.error("Select Course, Department and Semester");

        setLoading(true);
        try {
            const payload = {
                ...form,
                course_id: +form.course_id,
                semester_id: +form.semester_id,
                offering_dept_id: +form.offering_dept_id
            };
            const res = await apiFetch("/courses/offer", "POST", payload);
            if (res.error) throw new Error(res.error);
            toast.success("Course offered (Pending Approval)");
            setForm(prev => ({ ...prev, course_id: "", allowed_dept_ids: [] }));

            // Refresh filter
            if (form.semester_id) {
                apiFetch(`/courses/offered-courses?semester_id=${form.semester_id}`)
                    .then(data => {
                        if (Array.isArray(data)) setOfferedIds(data);
                    });
            }

        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">Offer New Course</h3>

            <div className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Semester Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Target Semester</label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium text-gray-900"
                                value={form.semester_id}
                                onChange={e => setForm({ ...form, semester_id: e.target.value, course_id: "" })}
                            >
                                <option value="">Select Semester...</option>
                                {semesters.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.start_date})</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Department Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Offering Department</label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium text-gray-900"
                                value={form.offering_dept_id}
                                onChange={e => setForm({ ...form, offering_dept_id: e.target.value })}
                            >
                                <option value="">Select Department...</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Selection */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Courses</label>
                    <div className="relative">
                        <select
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                            value={form.course_id}
                            onChange={e => setForm({ ...form, course_id: e.target.value })}
                            disabled={!form.semester_id}
                        >
                            <option value="">{form.semester_id ? "Select Course to Offer..." : "Please select a semester first"}</option>
                            {availableCourses.map(c => (
                                <option key={c.id} value={c.id}>{c.course_code}: {c.course_name}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    {form.semester_id && <p className="text-xs text-gray-500 px-1">Note: Showing only courses not yet active in this semester.</p>}
                </div>

                {/* Slot Selection */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Time Slot</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium text-gray-900"
                        placeholder="e.g. A, B, Mon 10-11"
                        value={form.slot || ''}
                        onChange={e => setForm({ ...form, slot: e.target.value })}
                    />
                </div>

                {/* Enrollment Restrictions */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <label className="block text-sm font-bold text-gray-700">Allowed Departments (ACL)</label>
                        <div className="flex gap-3 text-sm">
                            <button onClick={() => setForm(p => ({ ...p, allowed_dept_ids: departments.map(d => d.id) }))} className="text-gray-600 hover:text-black font-medium underline decoration-dotted cursor-pointer">Select All</button>
                            <button onClick={() => setForm(p => ({ ...p, allowed_dept_ids: [] }))} className="text-gray-600 hover:text-red-600 font-medium underline decoration-dotted cursor-pointer">Clear</button>
                        </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {departments.map(d => (
                                <label
                                    key={d.id}
                                    className={`
                                        flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200 text-sm font-bold
                                        ${form.allowed_dept_ids.includes(d.id)
                                            ? "bg-black text-white border-black shadow-md -translate-y-0.5"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.allowed_dept_ids.includes(d.id)}
                                        onChange={() => toggleDept(d.id)}
                                        className="hidden"
                                    />
                                    {d.code}
                                </label>
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">Students belonging to these departments will be allowed to enroll.</p>
                </div>

                <div className="pt-4">
                    <button
                        onClick={submit}
                        disabled={loading}
                        className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                    >
                        {loading ? "Submitting Proposal..." : "Submit Offering Proposal"}
                    </button>
                </div>

            </div>
        </div>
    );
}
