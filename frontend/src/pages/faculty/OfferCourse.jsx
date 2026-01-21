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
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Offer a Course</h3>
            <div className="space-y-4">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={form.semester_id}
                        onChange={e => setForm({ ...form, semester_id: e.target.value, course_id: "" })}
                    >
                        <option value="">-- Choose Semester First --</option>
                        {semesters.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.start_date})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={form.course_id}
                        onChange={e => setForm({ ...form, course_id: e.target.value })}
                        disabled={!form.semester_id}
                    >
                        <option value="">{form.semester_id ? "-- Choose Course --" : "Select Semester First"}</option>
                        {availableCourses.map(c => (
                            <option key={c.id} value={c.id}>{c.course_code}: {c.course_name}</option>
                        ))}
                    </select>
                    {form.semester_id && <p className="text-xs text-gray-500 mt-1">Showing only courses not yet offered this semester.</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offering Department</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={form.offering_dept_id}
                        onChange={e => setForm({ ...form, offering_dept_id: e.target.value })}
                    >
                        <option value="">-- Choose Department --</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Enrollment (ACL)</label>
                    <div className="p-3 border rounded bg-gray-50 h-32 overflow-y-auto grid grid-cols-2 gap-2">
                        {departments.map(d => (
                            <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.allowed_dept_ids.includes(d.id)}
                                    onChange={() => toggleDept(d.id)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">{d.code}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-1">
                        <button onClick={() => setForm(p => ({ ...p, allowed_dept_ids: departments.map(d => d.id) }))} className="text-xs text-indigo-600 hover:underline">Select All</button>
                        <button onClick={() => setForm(p => ({ ...p, allowed_dept_ids: [] }))} className="text-xs text-red-600 hover:underline">Clear</button>
                    </div>
                </div>

                <button onClick={submit} disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded">
                    {loading ? "Submitting..." : "Offer Course"}
                </button>
            </div>
        </div>
    );
}
