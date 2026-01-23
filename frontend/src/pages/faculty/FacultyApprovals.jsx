import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function FacultyApprovals() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchRequests = async () => {
        const res = await apiFetch("/faculty/requests");
        if (!res.error) setRequests(res);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (student_id, offering_id, status) => {
        setLoading(true);
        try {
            const res = await apiFetch("/faculty/approve-enrollment", "POST", { student_id, offering_id, status });
            if (res.error) throw new Error(res.error);
            toast.success(`Request ${status === 'pending_advisor' ? 'Approved' : 'Rejected'}`);
            fetchRequests();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveAll = async (offering_id) => {
        if (!confirm("Are you sure you want to approve ALL pending requests for this course?")) return;

        setLoading(true);
        try {
            const res = await apiFetch("/faculty/approve-all", "POST", { offering_id });
            if (res.error) throw new Error(res.error);
            toast.success("All pending requests approved!");
            fetchRequests();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!requests.length) return null;

    // Group by offering
    const grouped = {};
    requests.forEach(req => {
        const oid = req.offering.id;
        if (!grouped[oid]) {
            grouped[oid] = {
                courseCode: req.offering.courses.course_code,
                offeringId: oid,
                requests: []
            };
        }
        grouped[oid].requests.push(req);
    });

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Pending Enrollment Requests</h3>

            <div className="space-y-6">
                {Object.values(grouped).map((group) => (
                    <div key={group.offeringId} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-lg text-indigo-700">{group.courseCode}</h4>
                            <button
                                onClick={() => handleApproveAll(group.offeringId)}
                                disabled={loading}
                                className="px-4 py-1.5 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 transition shadow disabled:opacity-50"
                            >
                                Approve All ({group.requests.length})
                            </button>
                        </div>

                        <div className="space-y-2">
                            {group.requests.map((req, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
                                    <div>
                                        <p className="font-semibold text-sm">{req.students.roll_number} - {req.students.user?.name}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(req.students.user_id, req.offering.id, 'pending_advisor')}
                                            disabled={loading}
                                            className="px-2 py-0.5 border border-green-200 text-green-700 rounded text-xs hover:bg-green-50"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.students.user_id, req.offering.id, 'rejected')}
                                            disabled={loading}
                                            className="px-2 py-0.5 border border-red-200 text-red-700 rounded text-xs hover:bg-red-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
