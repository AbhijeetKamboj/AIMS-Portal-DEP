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
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Manage Departments</h3>

            <div className="flex gap-2 mb-6">
                <input
                    className="flex-1 p-2 border rounded"
                    placeholder="Department Name (e.g. Chemical Engg)"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />
                <input
                    className="w-32 p-2 border rounded"
                    placeholder="Code (CHE)"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
                <button
                    onClick={create}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700"
                >
                    Add
                </button>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-2">Code</th>
                            <th className="p-2">Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map(d => (
                            <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-2 font-mono font-bold text-gray-600">{d.code}</td>
                                <td className="p-2">{d.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
