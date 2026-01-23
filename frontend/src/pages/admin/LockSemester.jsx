import { useState } from "react";
import { apiFetch } from "../../services/api.js";
import toast from "react-hot-toast";

export default function LockSemester() {
  const [semesterId, setSemesterId] = useState("");
  const [loading, setLoading] = useState(false);

  const lock = async () => {
    if (!semesterId) return toast.error("Enter Semester ID");
    setLoading(true);
    try {
      const res = await apiFetch("/admin/lock-semester", "POST", {
        semester_id: +semesterId
      });

      if (res.error) throw new Error(res.error);
      toast.success("Semester locked");
      setSemesterId("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">Lock Semester Grades</h3>

      <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 max-w-xl">
        <label className="block text-sm font-medium text-gray-700 mb-2">Semester ID</label>
        <div className="flex gap-4">
          <input
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all duration-200"
            placeholder="e.g. 1"
            value={semesterId}
            type="number"
            onChange={e => setSemesterId(e.target.value)}
          />
          <button
            onClick={lock}
            disabled={loading}
            className="px-8 py-3 bg-black text-white rounded-xl font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Locking..." : "Lock"}
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-500">
             Warning: Locking a semester will finalize all grades and prevent further changes.
        </p>
      </div>
    </div>
  );
}
