import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function ApproveOfferings() {
    const [offerings, setOfferings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);

    const fetchOfferings = async () => {
        const res = await apiFetch("/courses/all-offerings");
        if (!res.error) {
            setOfferings(res.filter(o => o.status === 'pending'));
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
            fetchOfferings();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === offerings.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(offerings.map(o => o.id)));
        }
    };

    const handleBulkAction = async (status) => {
        if (selectedIds.size === 0) {
            toast.error("Please select at least one offering");
            return;
        }

        setBulkLoading(true);
        try {
            const offeringIds = Array.from(selectedIds);
            let successCount = 0;
            const errors = [];

            for (const offeringId of offeringIds) {
                try {
                    const res = await apiFetch("/courses/approve-offering", "POST", { 
                        offering_id: offeringId, 
                        status 
                    });

                    if (res.error) {
                        errors.push(res.error);
                    } else {
                        successCount++;
                    }
                } catch (err) {
                    errors.push(err.message);
                }
            }

            if (successCount > 0) {
                toast.success(`${successCount} offerings ${status}`);
                setOfferings(offerings.filter(o => !selectedIds.has(o.id)));
                setSelectedIds(new Set());
            }

            if (errors.length > 0) {
                toast.error(`${errors.length} offerings failed: ${errors[0]}`);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBulkLoading(false);
        }
    };

    if (!offerings.length) return (
         <div className="w-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No pending course offerings found.</p>
        </div>
    );

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold">Pending Course Offerings</h3>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                    <input
                        type="checkbox"
                        checked={selectedIds.size === offerings.length && offerings.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">Select All</span>
                </label>
            </div>

            {selectedIds.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={selectedIds.size === offerings.length}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 cursor-pointer"
                        />
                        <span className="font-semibold text-blue-900">
                            {selectedIds.size} of {offerings.length} selected
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleBulkAction('rejected')}
                            disabled={bulkLoading}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg transition-colors"
                        >
                            {bulkLoading ? "Processing..." : "Reject Selected"}
                        </button>
                        <button
                            onClick={() => handleBulkAction('approved')}
                            disabled={bulkLoading}
                            className="px-4 py-2 text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                        >
                            {bulkLoading ? "Processing..." : "Approve Selected"}
                        </button>
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            disabled={bulkLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="divide-y">
                    {offerings.map(offering => (
                        <div key={offering.id} className="p-5 hover:bg-gray-50 transition-colors flex items-start gap-4 group">
                            <input
                                type="checkbox"
                                checked={selectedIds.has(offering.id)}
                                onChange={() => toggleSelect(offering.id)}
                                className="w-4 h-4 cursor-pointer mt-1"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-xs font-bold border border-gray-200">{offering.courses.course_code}</span>
                                    <h4 className="font-medium text-gray-900">{offering.courses.course_name}</h4>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                                    <span className="font-medium flex items-center gap-1">
                                        {offering.faculty?.users?.name}
                                    </span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="font-medium">{offering.courses.credits} Credits</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="font-mono text-xs bg-gray-50 px-1 rounded border border-gray-100">L:{offering.courses.l} T:{offering.courses.t} P:{offering.courses.p} S:{offering.courses.s}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button
                                    onClick={() => handleAction(offering.id, 'rejected')}
                                    disabled={loading}
                                    className="px-3.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg transition-colors border border-red-200"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleAction(offering.id, 'approved')}
                                    disabled={loading}
                                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
