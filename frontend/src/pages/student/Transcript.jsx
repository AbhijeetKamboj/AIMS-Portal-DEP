import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api.js";

export default function Transcript() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch("/student/transcript").then(setData);
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Transcript</h3>
      {data.map((r, i) => (
        <div key={i} className="text-sm border-b py-1">
          {r.semester} | {r.course_code} | {r.grade}
        </div>
      ))}
    </div>
  );
}
