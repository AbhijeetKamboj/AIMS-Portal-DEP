import { useState } from "react";
import { apiFetch } from "../../services/api.js";
import toast from "react-hot-toast";

export default function LockSemester() {
  const [semesterId, setSemesterId] = useState("");

  const lock = async () => {
    const res = await apiFetch("/admin/lock-semester", "POST", {
      semester_id: +semesterId
    });

    if (res.error) toast.error(res.error);
    else toast.success("Semester locked");
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Lock Semester Grades</h3>

      <input
        className="w-full mb-3 p-2 border"
        placeholder="Semester ID"
        onChange={e => setSemesterId(e.target.value)}
      />

      <button
        onClick={lock}
        className="w-full bg-red-600 text-white py-2 rounded"
      >
        Lock
      </button>
    </div>
  );
}
