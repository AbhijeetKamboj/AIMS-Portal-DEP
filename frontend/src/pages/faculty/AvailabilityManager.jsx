import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AvailabilityManager() {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [settings, setSettings] = useState({ calendar_sync_enabled: false });

    // Form state
    const [dayOfWeek, setDayOfWeek] = useState(1); // Monday default
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [slotDuration, setSlotDuration] = useState(30);

    useEffect(() => {
        fetchSlots();
        fetchSettings();
    }, []);

    const fetchSlots = async () => {
        setLoading(true);
        const res = await apiFetch("/faculty/availability");
        if (!res.error) setSlots(res || []);
        setLoading(false);
    };

    const fetchSettings = async () => {
        const res = await apiFetch("/faculty/settings");
        if (!res.error) setSettings(res);
    };

    const initiateGoogleConnect = () => {
        // ... rest stays SAME ...
        const session = JSON.parse(localStorage.getItem("session"));
        const token = session?.access_token;

        if (!token) {
            toast.error("Authentication token not found. Please log in again.");
            return;
        }

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";
        window.location.href = `${BACKEND_URL}/auth/google?token=${token}`;
    };

    const handleAdd = async () => {
        if (startTime >= endTime) {
            toast.error("End time must be after start time");
            return;
        }

        const res = await apiFetch("/faculty/availability", "POST", {
            day_of_week: parseInt(dayOfWeek),
            start_time: startTime,
            end_time: endTime,
            slot_duration: parseInt(slotDuration)
        });

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Availability added");
            setShowForm(false);
            fetchSlots();
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Remove this availability slot?")) return;

        const res = await apiFetch(`/faculty/availability/${id}`, "DELETE");
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Slot removed");
            fetchSlots();
        }
    };

    const handleToggle = async (slot) => {
        const res = await apiFetch(`/faculty/availability/${slot.id}`, "PUT", {
            is_active: !slot.is_active
        });
        if (res.error) {
            toast.error(res.error);
        } else {
            fetchSlots();
        }
    };

    // Group slots by day
    const groupedSlots = DAYS.map((day, index) => ({
        day,
        dayNum: index,
        slots: slots.filter(s => s.day_of_week === index)
    })).filter(g => g.slots.length > 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12 text-gray-400">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Availability Schedule</h3>
                    <p className="text-sm text-gray-500 mt-1">Set your weekly availability for student meetings</p>
                    <button
                        onClick={initiateGoogleConnect}
                        disabled={settings.calendar_sync_enabled}
                        className={`mt-3 flex items-center gap-2 text-sm font-medium transition-colors border rounded-lg px-3 py-1.5 ${settings.calendar_sync_enabled
                            ? "bg-green-50 text-green-700 border-green-200 cursor-default"
                            : "bg-white text-gray-600 hover:text-black border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        {settings.calendar_sync_enabled ? (
                            <>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.8 14.2l-3.5-3.5 1.41-1.41 2.09 2.08 4.69-4.69 1.41 1.41-6.1 6.11z" />
                                </svg>
                                Google Calendar Connected
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                                </svg>
                                Connect Google Calendar
                            </>
                        )}
                    </button>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${showForm
                        ? "bg-gray-100 text-gray-600"
                        : "bg-black text-white shadow-sm hover:shadow-md"
                        }`}
                >
                    {showForm ? "Cancel" : "+ Add Slot"}
                </button>
            </div>

            {/* Add Slot Form */}
            {showForm && (
                <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-4">New Availability Slot</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                            <select
                                value={dayOfWeek}
                                onChange={e => setDayOfWeek(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-black focus:outline-none"
                            >
                                {DAYS.map((day, i) => (
                                    <option key={i} value={i}>{day}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-black focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-black focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration</label>
                            <select
                                value={slotDuration}
                                onChange={e => setSlotDuration(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-black focus:outline-none"
                            >
                                <option value={15}>15 min</option>
                                <option value={30}>30 min</option>
                                <option value={45}>45 min</option>
                                <option value={60}>60 min</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleAdd}
                            className="px-6 py-2 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition"
                        >
                            Add Availability
                        </button>
                    </div>
                </div>
            )}

            {/* Slots Display */}
            {groupedSlots.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div className="text-4xl mb-3">📅</div>
                    <h4 className="text-lg font-bold text-gray-900">No Availability Set</h4>
                    <p className="text-gray-500 mt-1">Add your available time slots so students can book meetings.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {groupedSlots.map(group => (
                        <div key={group.dayNum} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h4 className="font-bold text-gray-900">{group.day}</h4>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {group.slots.map(slot => (
                                    <div key={slot.id} className="px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${slot.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <span className="font-medium text-gray-900">
                                                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                ({slot.slot_duration} min slots)
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggle(slot)}
                                                className={`px-3 py-1 rounded text-xs font-bold transition ${slot.is_active
                                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                            >
                                                {slot.is_active ? 'Disable' : 'Enable'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(slot.id)}
                                                className="px-3 py-1 rounded text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
