import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api.js";
import toast from "react-hot-toast";
import CourseDetailsModal from "../../components/CourseDetailsModal.jsx";

export default function Offerings() {
    const [data, setData] = useState([]);
    const [loadingId, setLoadingId] = useState(null);
    const [selectedOffering, setSelectedOffering] = useState(null);
    const [detailsOffering, setDetailsOffering] = useState(null);

    const [enrollType, setEnrollType] = useState('credit');
    const [myEnrollments, setMyEnrollments] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [offerings, enrolls] = await Promise.all([
            apiFetch("/student/offerings"),
            apiFetch("/student/my-enrollments")
        ]);

        if (!offerings.error) setData(offerings);
        if (!enrolls.error) {
            const map = {};
            enrolls.forEach(e => map[e.offering_id] = e.status);
            setMyEnrollments(map);
        }
    };

    const handleEnrollClick = (e, offering) => {
        e.stopPropagation();
        setSelectedOffering(offering);
        setEnrollType('credit');
    };

    const confirmEnroll = async () => {
        if (!selectedOffering) return;

        setLoadingId(selectedOffering.id);
        const id = selectedOffering.id;
        setSelectedOffering(null);

        const res = await apiFetch("/student/enroll", "POST", {
            offering_id: id,
            enrollment_type: enrollType
        });

        if (res.error) toast.error(res.error);
        else {
            toast.success("Enrollment requested (Pending Approval)");
            setMyEnrollments(prev => ({ ...prev, [id]: 'pending_faculty' }));
            fetchData();
        }

        setLoadingId(null);
    };

    return (
        <div className="mt-8">
            <h3 className="font-bold text-gray-700 bg-gray-100 p-2 rounded-t border-t border-x mb-0">Course Registration</h3>
            <div className="bg-white p-4 border rounded-b shadow-sm">

                <div className="space-y-3">
                    {data.map(o => {
                        const status = myEnrollments[o.id];
                        let btnLabel = "Register";
                        let btnStyle = "bg-blue-600 hover:bg-blue-700 text-white";
                        let disabled = false;

                        if (status === 'enrolled') { btnLabel = "Enrolled"; btnStyle = "bg-green-600 text-white cursor-default"; disabled = true; }
                        else if (status === 'rejected') { btnLabel = "Rejected"; btnStyle = "bg-red-500 text-white cursor-default"; disabled = true; }
                        else if (status === 'pending_faculty' || status === 'pending_advisor') { btnLabel = "Pending"; btnStyle = "bg-yellow-500 text-white cursor-default"; disabled = true; }

                        return (
                            <div
                                key={o.id}
                                onClick={() => setDetailsOffering(o)}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white border rounded hover:shadow-md transition gap-3 cursor-pointer group"
                            >
                                <div>
                                    <div className="flex items-center gap-2 group-hover:text-blue-600">
                                        <span className="font-bold text-blue-900">{o.courses.course_code}</span>
                                        <span className="text-gray-700 font-medium">{o.courses.course_name}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Faculty: {o.faculty?.users?.name} | Credits: {o.courses.credits}
                                    </p>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                                        L-T-P-S: {o.courses.l}-{o.courses.t}-{o.courses.p}-{o.courses.s}
                                    </p>
                                    {o.stats && (
                                        <div className="flex gap-3 mt-1 text-xs font-semibold text-gray-600">
                                            <span className="text-green-600">Enrolled: {o.stats.enrolled}</span>
                                            <span className="text-yellow-600">Requests: {o.stats.pending}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    disabled={disabled || loadingId === o.id}
                                    onClick={(e) => handleEnrollClick(e, o)}
                                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all z-10 ${btnStyle}`}
                                >
                                    {loadingId === o.id ? "..." : btnLabel}
                                </button>
                            </div>
                        )
                    })}
                    {!data.length && <p className="text-gray-500 text-center py-4 text-sm">No courses available for registration.</p>}
                </div>
            </div>

            {/* Registration Modal */}
            {selectedOffering && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOffering(null)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Registration</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Registering for <span className="font-semibold">{selectedOffering.courses.course_code}</span>
                        </p>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Enrollment Type</label>
                            <select
                                value={enrollType}
                                onChange={(e) => setEnrollType(e.target.value)}
                                className="w-full p-2 border rounded bg-gray-50"
                            >
                                <option value="credit">Credit</option>
                                <option value="minor">Minor</option>
                                <option value="concentration">Concentration</option>
                            </select>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setSelectedOffering(null)} className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100">Cancel</button>
                            <button onClick={confirmEnroll} className="px-3 py-1 rounded bg-blue-600 text-white">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details View Modal */}
            {detailsOffering && (
                <CourseDetailsModal
                    offering={detailsOffering}
                    onClose={() => setDetailsOffering(null)}
                    userRole="student"
                />
            )}

        </div>
    );
}
