import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function MeetingRequests() {
    const [requests, setRequests] = useState([]);
    const [processId, setProcessId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        const res = await apiFetch("/faculty/meetings");
        if (!res.error) setRequests(res);
    };

    const handleRespond = async (id, status) => {
        const responseText = prompt(status === 'approved' ? "Enter response message (optional):" : "Enter rejection reason:");
        if (status === 'rejected' && !responseText) return; // Require reason for rejection

        setProcessId(id);
        const res = await apiFetch("/faculty/meetings/respond", "POST", {
            request_id: id,
            status,
            response: responseText || ""
        });

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(`Request ${status}`);
            fetchRequests();
        }
        setProcessId(null);
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Meeting Requests</h3>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {requests.length} Requests
                </span>
            </div>

            <div className="grid gap-4">
                {requests.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium pt-2">No meeting requests found.</p>
                    </div>
                )}

                {requests.map(r => (
                    <div key={r.id} className="group bg-white rounded-xl p-5 border border-gray-100 shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                    {r.students.user.name} 
                                    <span className="text-gray-400 font-normal text-sm font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                        {r.students.roll_number}
                                    </span>
                                </h4>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        <span className="font-medium">{r.requested_date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <span className="font-medium">{r.requested_time}</span>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3">
                                    <p className="text-gray-700 text-sm italic">"{r.reason}"</p>
                                </div>
                                
                                {r.response && (
                                    <div className="text-sm flex items-start gap-2">
                                        <span className="font-bold text-gray-900 shrink-0">Response:</span>
                                        <span className="text-gray-600">{r.response}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-col items-end gap-3 shrink-0">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide inline-block
                                    ${r.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                      r.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                                      'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    {r.status}
                                </span>

                                {r.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRespond(r.id, 'rejected')}
                                            disabled={processId === r.id}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleRespond(r.id, 'approved')}
                                            disabled={processId === r.id}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
