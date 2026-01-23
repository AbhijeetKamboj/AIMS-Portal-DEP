import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function ApproveOfferings() {
    const [offerings, setOfferings] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const handleApproveAll = async () => {
        if (!offerings.length) return;
        setLoading(true);
        try {
            // Approve all pending offerings one by one
            for (const offering of offerings) {
                await apiFetch("/courses/approve-offering", "POST", {
                    offering_id: offering.id,
                    status: 'approved'
                });
            }
            toast.success(`Approved all ${offerings.length} offerings`);
            fetchOfferings();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!offerings.length) return (
         <div className="w-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No pending course offerings found.</p>
        </div>
    );

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Pending Course Offerings</h3>
                <button
                    onClick={handleApproveAll}
                    disabled={loading}
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Approve All ({offerings.length})
                </button>
            </div>

            <div className="space-y-4">
                {offerings.map(offering => (
                    <div key={offering.id} className="flex flex-col sm:flex-row justify-between items-center p-5 bg-white rounded-xl border border-gray-100 shadow-soft hover:shadow-medium transition-all duration-300">
                        <div className="mb-4 sm:mb-0">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-bold border border-gray-200">{offering.courses.course_code}</span>
                                <h4 className="font-bold text-gray-900 text-lg">{offering.courses.course_name}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="font-medium flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    {offering.faculty?.users?.name}
                                </span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="font-medium">{offering.courses.credits} Credits</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="font-mono text-xs bg-gray-50 px-1 rounded border border-gray-100">L:{offering.courses.l} T:{offering.courses.t} P:{offering.courses.p} S:{offering.courses.s}</span>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => handleAction(offering.id, 'rejected')}
                                disabled={loading}
                                className="flex-1 sm:flex-none px-4 py-2 bg-white text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleAction(offering.id, 'approved')}
                                disabled={loading}
                                className="flex-1 sm:flex-none px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-sm active:translate-y-0.5 disabled:opacity-50"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
