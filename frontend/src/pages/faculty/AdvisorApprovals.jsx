import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function AdvisorApprovals() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequests, setSelectedRequests] = useState(new Set());

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch("/faculty/advisor/requests");
            if (res.error) {
                setError(res.error);
                setRequests([]);
            } else {
                setRequests(res || []);
            }
        } catch (err) {
            setError(err.message);
            setRequests([]);
        } finally {
            setLoading(false);
        }
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

    const handleApproveAll = async () => {
        setLoading(true);
        try {
            const res = await apiFetch("/faculty/advisor-approve-all", "POST", {});
            if (res.error) throw new Error(res.error);
            toast.success("All pending requests approved");
            fetchRequests();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleRequestSelection = (key) => {
        setSelectedRequests(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedRequests.size === requests.length) {
            setSelectedRequests(new Set());
        } else {
            const allKeys = new Set(requests.map((_, idx) => idx.toString()));
            setSelectedRequests(allKeys);
        }
    };

    const handleBulkApprove = async (status) => {
        if (selectedRequests.size === 0) {
            toast.error('Please select at least one request');
            return;
        }

        setLoading(true);
        try {
            const selectedArray = Array.from(selectedRequests).map(idx => requests[parseInt(idx)]);
            
            for (const req of selectedArray) {
                const res = await apiFetch("/faculty/advisor-approve", "POST", {
                    student_id: req.students.user_id,
                    offering_id: req.offering.id,
                    status: status
                });
                if (res.error) throw new Error(res.error);
            }
            
            toast.success(`${selectedArray.length} request(s) ${status === 'enrolled' ? 'approved' : 'rejected'}!`);
            setSelectedRequests(new Set());
            fetchRequests();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="text-xl font-bold text-gray-900">Pending Advisor Approvals</h3>
                </div>
                <div className="px-8 py-12 flex justify-center items-center">
                    <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="text-xl font-bold text-gray-900">Pending Advisor Approvals</h3>
                </div>
                <div className="px-8 py-6 bg-red-50 border-b border-red-100">
                    <p className="text-sm text-red-700">Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!requests.length) {
        return (
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="text-xl font-bold text-gray-900">Pending Advisor Approvals</h3>
                </div>
                <div className="px-8 py-12 text-center">
                    <p className="text-gray-500 font-medium">No pending advisor approvals.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-gray-900">Pending Advisor Approvals</h3>
                    {selectedRequests.size > 0 && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {selectedRequests.size} Selected
                        </span>
                    )}
                </div>
                <input
                    type="checkbox"
                    checked={requests.length > 0 && selectedRequests.size === requests.length}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                    title="Select all requests"
                />
            </div>

            {selectedRequests.size > 0 && (
                <div className="px-8 py-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-700">{selectedRequests.size} request(s) selected</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleBulkApprove('enrolled')}
                            disabled={loading}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                            Approve Selected
                        </button>
                        <button
                            onClick={() => handleBulkApprove('rejected')}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition disabled:opacity-50"
                        >
                            Reject Selected
                        </button>
                    </div>
                </div>
            )}

            <div className="p-8 space-y-3">
                {requests.map((req, idx) => {
                    const requestKey = idx.toString();
                    const isSelected = selectedRequests.has(requestKey);
                    
                    return (
                        <div key={idx} className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleRequestSelection(requestKey)}
                                className="w-5 h-5 rounded border-gray-300 cursor-pointer flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900">{req.students.roll_number}</p>
                                <p className="text-sm text-gray-600">{req.students.user?.name}</p>
                                <p className="text-xs text-gray-500 mt-1">Course: {req.offering.courses.course_code}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button 
                                    onClick={() => handleAction(req.students.user_id, req.offering.id, 'enrolled')} 
                                    disabled={loading}
                                    className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 transition disabled:opacity-50"
                                >
                                    Approve
                                </button>
                                <button 
                                    onClick={() => handleAction(req.students.user_id, req.offering.id, 'rejected')} 
                                    disabled={loading}
                                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
