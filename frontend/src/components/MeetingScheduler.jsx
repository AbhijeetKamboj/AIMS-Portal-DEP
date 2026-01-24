import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import toast from "react-hot-toast";

export default function MeetingScheduler({ userRole }) {
    const [meetings, setMeetings] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Request Form
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [date, setDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [reason, setReason] = useState("");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchMeetings();
        if (userRole === 'student') fetchFacultyList();
    }, [userRole]);

    // Fetch available slots when faculty and date change
    useEffect(() => {
        if (selectedFaculty && date) {
            fetchAvailableSlots();
        } else {
            setAvailableSlots([]);
            setSelectedSlot("");
        }
    }, [selectedFaculty, date]);

    const fetchMeetings = async () => {
        const endpoint = userRole === 'student' ? "/student/meetings" : "/faculty/meetings";
        const res = await apiFetch(endpoint);
        if (!res.error) setMeetings(res);
    };

    const fetchFacultyList = async () => {
        const res = await apiFetch("/student/faculty-list");
        if (!res.error) setFacultyList(res || []);
    };

    const fetchAvailableSlots = async () => {
        setLoadingSlots(true);
        const res = await apiFetch(`/student/available-slots?faculty_id=${selectedFaculty}&date=${date}`);
        if (!res.error) {
            setAvailableSlots(res || []);
        } else {
            setAvailableSlots([]);
        }
        setLoadingSlots(false);
    };

    const handleRequest = async () => {
        if (!selectedFaculty || !date || !selectedSlot || !reason) {
            toast.error("Please fill all fields and select a time slot");
            return;
        }

        const res = await apiFetch("/student/meetings", "POST", {
            faculty_id: selectedFaculty,
            date,
            time: selectedSlot,
            reason,
            duration: 30
        });

        if (res.error) toast.error(res.error);
        else {
            toast.success("Meeting requested successfully");
            setShowForm(false);
            fetchMeetings();
            resetForm();
        }
    };

    const handleCancel = async (meetingId) => {
        if (!confirm("Cancel this meeting request?")) return;

        const res = await apiFetch("/student/meetings/cancel", "POST", { meeting_id: meetingId });
        if (res.error) toast.error(res.error);
        else {
            toast.success("Meeting cancelled");
            fetchMeetings();
        }
    };

    const handleRespond = async (id, status, responseText) => {
        const res = await apiFetch("/faculty/meetings/respond", "POST", {
            request_id: id,
            status,
            response: responseText
        });

        if (res.error) toast.error(res.error);
        else {
            toast.success(`Meeting ${status}`);
            fetchMeetings();
        }
    };

    const resetForm = () => {
        setDate("");
        setSelectedSlot("");
        setReason("");
        setSelectedFaculty("");
        setAvailableSlots([]);
    };

    // Get tomorrow's date as min date
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Meeting Schedule</h3>
                {userRole === 'student' && (
                    <button
                        onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 
                            ${showForm
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : "bg-black text-white shadow-soft hover:shadow-medium hover:-translate-y-0.5"}`}
                    >
                        {showForm ? "Cancel" : "Request Meeting"}
                    </button>
                )}
            </div>

            {/* Student Request Form */}
            {showForm && userRole === 'student' && (
                <div className="mb-8 p-6 bg-white rounded-2xl shadow-soft border border-gray-100 animate-slide-up">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">New Meeting Request</h4>
                    <div className="space-y-4">
                        {/* Faculty Select */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Faculty</label>
                            <select
                                value={selectedFaculty}
                                onChange={e => setSelectedFaculty(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black outline-none transition-all"
                            >
                                <option value="">-- Choose Professor --</option>
                                {facultyList.map(f => (
                                    <option key={f.user_id} value={f.user_id}>
                                        {f.users?.name} ({f.department})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                min={getMinDate()}
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black outline-none transition-all"
                            />
                        </div>

                        {/* Available Slots */}
                        {selectedFaculty && date && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                                {loadingSlots ? (
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                                        Checking availability...
                                    </div>
                                ) : availableSlots.length === 0 ? (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                                        No available slots for this date. The faculty may not have set availability for this day.
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {availableSlots.map(slot => (
                                            <button
                                                key={slot.slot_time}
                                                onClick={() => setSelectedSlot(slot.slot_time)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedSlot === slot.slot_time
                                                        ? "bg-black text-white"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                            >
                                                {slot.slot_time.slice(0, 5)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black outline-none transition-all min-h-[100px] resize-none"
                                placeholder="E.g., Discuss project, grade inquiry..."
                            />
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleRequest}
                                disabled={!selectedSlot}
                                className="px-6 py-2 bg-black text-white rounded-xl font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Meetings List */}
            <div className="grid gap-4">
                {meetings.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No meetings scheduled.</p>
                    </div>
                )}

                {meetings.map((m) => (
                    <div key={m.id} className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900 text-lg">
                                        {userRole === 'faculty' ? m.students?.user?.name || m.student_id : (m.faculty?.user?.name || "Professor")}
                                    </h4>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                                        ${m.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                            m.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                'bg-red-100 text-red-700 border border-red-200'}`}>
                                        {m.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        <span>{new Date(m.requested_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <span>{m.requested_time}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-gray-700 text-sm italic">"{m.reason}"</p>
                                </div>

                                {m.response && (
                                    <div className="mt-3 text-sm flex items-start gap-2">
                                        <span className="font-bold text-gray-900 shrink-0">Response:</span>
                                        <span className="text-gray-600">{m.response}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                                {/* Student: Cancel pending/approved meetings */}
                                {userRole === 'student' && (m.status === 'pending' || m.status === 'approved') && (
                                    <button
                                        onClick={() => handleCancel(m.id)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}

                                {/* Faculty: Approve/Reject */}
                                {userRole === 'faculty' && m.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const reason = prompt("Reason for rejection?");
                                                if (reason) handleRespond(m.id, 'rejected', reason);
                                            }}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleRespond(m.id, 'approved', "Approved.")}
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

