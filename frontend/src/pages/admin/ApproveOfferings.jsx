import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function ApproveOfferings() {
    const [offerings, setOfferings] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchOfferings = async () => {
        const res = await apiFetch("/courses/all-offerings"); // Admin endpoint
        if (!res.error) {
            setOfferings(res.filter(o => o.status === 'pending')); // Only show pending
        }
    };

    useEffect(() => {
        fetchOfferings();
    }, []);

    const handleAction = async (offering_id, status) => {
        setLoading(true);
        try {
            const res = await apiFetch("/courses/approve-offering", "POST", { offering_id, status });
            if (res.error) throw new Error(res.error);
            toast.success(`Offering ${status}`);
            fetchOfferings(); // Refresh
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!offerings.length) return null; // Hide if no pending offerings

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Pending Course Offerings</h3>

            <div className="space-y-3">
                {offerings.map(offering => (
                    <div key={offering.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                        <div>
                            <p className="font-semibold">{offering.courses.course_code}: {offering.courses.course_name}</p>
                            <p className="text-sm text-gray-600">Faculty: {offering.faculty?.users?.name} | Credits: {offering.courses.credits}</p>
                            <p className="text-xs text-gray-500">L:{offering.courses.l} T:{offering.courses.t} P:{offering.courses.p} S:{offering.courses.s}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleAction(offering.id, 'approved')} className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">Approve</button>
                            <button onClick={() => handleAction(offering.id, 'rejected')} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">Reject</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
