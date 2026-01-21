import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function AdvisorApprovals() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchRequests = async () => {
        const res = await apiFetch("/faculty/advisor/requests");
        if (!res.error) setRequests(res);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (student_id, offering_id, status) => {
        setLoading(true);
        try {
            const res = await apiFetch("/faculty/advisor-approve", "POST", { student_id, offering_id, status });
            if (res.error) throw new Error(res.error);
            toast.success(`Request ${status === 'enrolled' ? 'Approved' : 'Rejected'}`);
            fetchRequests();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!requests.length) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Pending Advisor Approvals</h3>
            <div className="space-y-3">
                {requests.map((req, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-100">
                        <div>
                            <p className="font-semibold">{req.students.roll_number} - {req.students.user?.name}</p>
                            <p className="text-sm text-gray-600">Course: {req.offering.courses.course_code}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleAction(req.students.user_id, req.offering.id, 'enrolled')} className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">Approve</button>
                            <button onClick={() => handleAction(req.students.user_id, req.offering.id, 'rejected')} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">Reject</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
