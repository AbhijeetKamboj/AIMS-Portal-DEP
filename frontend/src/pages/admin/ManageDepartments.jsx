import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function ManageDepartments() {
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState({ name: "", code: "" });
    const [loading, setLoading] = useState(false);

    const fetchDepts = async () => {
        const res = await apiFetch("/departments/list");
        if (!res.error) setDepartments(res);
    };

    useEffect(() => {
        fetchDepts();
    }, []);

    const create = async () => {
        if (!form.name || !form.code) return toast.error("Fill all fields");
        setLoading(true);
        try {
            const res = await apiFetch("/departments/create", "POST", form);
            if (res.error) throw new Error(res.error);
            toast.success("Department Added");
            setForm({ name: "", code: "" });
            fetchDepts();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h3 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">Manage Departments</h3>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <input
                    className="flex-[2] px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                    placeholder="Department Name (e.g. Chemical Engg)"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />
                <input
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200"
                    placeholder="Code (e.g. CHE)"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
                <button
                    onClick={create}
                    disabled={loading}
                    className="px-8 py-3 bg-black text-white rounded-xl font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                    {loading ? "Adding..." : "Add"}
                </button>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-soft">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Code</th>
                            <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Department Name</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                        {departments.map(d => (
                            <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-black border-r border-gray-50 w-32">{d.code}</td>
                                <td className="px-6 py-4 font-medium text-gray-700">{d.name}</td>
                            </tr>
                        ))}
                        {departments.length === 0 && (
                            <tr>
                                <td colSpan="2" className="px-6 py-8 text-center text-gray-400 italic">No departments found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
