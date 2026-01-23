import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api.js";
import toast from "react-hot-toast";
import CourseDetailsModal from "../../components/CourseDetailsModal.jsx";

export default function Offerings() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState(null);
    const [selectedOffering, setSelectedOffering] = useState(null);
    const [detailsOffering, setDetailsOffering] = useState(null);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // all, enrolled, pending, available

    const [enrollType, setEnrollType] = useState('credit');
    const [myEnrollments, setMyEnrollments] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let res = data;

        // Search Filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            res = res.filter(o =>
                o.faculty?.users?.name?.toLowerCase().includes(q) ||
                o.courses?.course_code?.toLowerCase().includes(q) ||
                o.courses?.course_name?.toLowerCase().includes(q)
            );
        }

        // Status Filter
        if (statusFilter !== "all") {
            res = res.filter(o => {
                const status = myEnrollments[o.id];
                if (statusFilter === "enrolled") return status === "enrolled";
                if (statusFilter === "pending") return status === "pending_faculty" || status === "pending_advisor";
                if (statusFilter === "available") return !status;
                return true;
            });
        }

        setFilteredData(res);
    }, [searchQuery, statusFilter, data, myEnrollments]);

    const fetchData = async () => {
        setLoading(true);
        const [offerings, enrolls] = await Promise.all([
            apiFetch("/student/offerings"),
            apiFetch("/student/my-enrollments")
        ]);

        if (!offerings.error) {
            setData(offerings);
        }
        if (!enrolls.error) {
            const map = {};
            enrolls.forEach(e => map[e.offering_id] = e.status);
            setMyEnrollments(map);
        }
        setLoading(false);
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
            // We don't necessarily need to re-fetch immediately if we optimistically update status
        }

        setLoadingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Course Registration</h3>
                    <p className="text-gray-500 text-sm mt-1">Browse and register for courses this semester.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                     {/* Status Filter */}
                     <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-black focus:ring-0 outline-none text-sm font-medium"
                    >
                        <option value="all">All Courses</option>
                        <option value="available">Available to Register</option>
                        <option value="pending">Pending Requests</option>
                        <option value="enrolled">Enrolled</option>
                    </select>

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search code, name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all shadow-sm text-sm"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    // Skeleton Loaders
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm animate-pulse">
                            <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
                            <div className="h-8 bg-gray-100 rounded w-1/2 mb-4"></div>
                            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                        </div>
                    ))
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="text-4xl mb-3">🔍</div>
                        <h4 className="text-lg font-bold text-gray-900">No courses found</h4>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    filteredData.map(o => {
                        const status = myEnrollments[o.id];
                        let statusBadge = null;
                        let actionBtn = null;

                        if (status === 'enrolled') {
                             statusBadge = <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase rounded-full tracking-wide">Enrolled</span>;
                             actionBtn = (
                                 <button disabled className="px-6 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-sm font-bold opacity-75 cursor-default">
                                     Registered
                                 </button>
                             );
                        } else if (status === 'pending_faculty' || status === 'pending_advisor') {
                            statusBadge = <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase rounded-full tracking-wide">Pending Approval</span>;
                            actionBtn = (
                                <button disabled className="px-6 py-2.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-sm font-bold opacity-75 cursor-default">
                                    Request Sent
                                </button>
                            );
                        } else if (status === 'rejected') {
                             statusBadge = <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold uppercase rounded-full tracking-wide">Rejected</span>;
                             actionBtn = (
                                <button disabled className="px-6 py-2.5 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm font-bold opacity-75 cursor-default">
                                    Not Allowed
                                </button>
                            );
                        } else {
                            actionBtn = (
                                <button
                                    onClick={(e) => handleEnrollClick(e, o)}
                                    disabled={loadingId === o.id}
                                    className="px-6 py-2.5 bg-black text-white hover:bg-gray-800 rounded-xl text-sm font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 min-w-[120px]"
                                >
                                    {loadingId === o.id ? "..." : "Register"}
                                </button>
                            );
                        }

                        return (
                            <div
                                key={o.id}
                                onClick={() => setDetailsOffering(o)}
                                className="group bg-white rounded-xl p-6 border border-gray-100 shadow-soft hover:shadow-medium hover:border-gray-200 transition-all duration-200 cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="bg-gray-100 text-gray-900 border border-gray-200 px-2 py-1 rounded text-xs font-mono font-bold">
                                                {o.courses.course_code}
                                            </span>
                                            <h4 className="text-xl font-bold text-gray-900 group-hover:text-black transition-colors">{o.courses.course_name}</h4>
                                            {statusBadge && <div className="ml-2">{statusBadge}</div>}
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {o.faculty?.users?.name?.[0] || "?"}
                                                </div>
                                                <span className="font-medium">{o.faculty?.users?.name}</span>
                                            </div>
                                            <span className="text-gray-300">|</span>
                                            <span className="font-mono text-xs bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                Credits: <b>{o.courses.credits}</b>
                                            </span>
                                             <span className="text-gray-300">|</span>
                                            <span className="font-mono text-xs bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                L-T-P-S: <b>{o.courses.l}-{o.courses.t}-{o.courses.p}-{o.courses.s}</b>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0 mt-4 md:mt-0">
                                        {actionBtn}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Optimized Registration Modal */}
            {selectedOffering && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={() => setSelectedOffering(null)}>
                    <div className="bg-white rounded-2xl shadow-strong max-w-md w-full p-6 animate-scaleIn" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Confirm Registration</h3>
                            <button onClick={() => setSelectedOffering(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">You are registering for:</p>
                            <p className="text-lg font-bold text-gray-900">{selectedOffering.courses.course_code}: {selectedOffering.courses.course_name}</p>
                        </div>
                        
                        <div className="space-y-3 mb-8">
                            <label className="text-sm font-bold text-gray-900 block">Select Enrollment Type</label>
                            
                            <div className="grid grid-cols-3 gap-3">
                                {['credit', 'minor', 'concentration'].map((type) => (
                                    <label key={type} className={`
                                        cursor-pointer relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 text-center
                                        ${enrollType === type 
                                            ? 'border-black bg-black text-white shadow-soft transform scale-[1.02]' 
                                            : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'}
                                    `}>
                                        <input 
                                            type="radio" 
                                            name="enrollType" 
                                            value={type} 
                                            checked={enrollType === type} 
                                            onChange={(e) => setEnrollType(e.target.value)}
                                            className="hidden" 
                                        />
                                        <span className="capitalize font-bold text-sm">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                        <button 
                            onClick={confirmEnroll} 
                            className="w-full py-4 rounded-xl font-bold text-white bg-black hover:bg-gray-900 hover:scale-[1.01] transition-all shadow-medium"
                        >
                            Confirm Registration
                        </button>
                    </div>
                </div>
            )}

            {/* Reuse Course Details Modal */}
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
