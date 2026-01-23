import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function FacultyAnnouncements({ offering, onClose }) {
    const [announcements, setAnnouncements] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, [offering]);

    const fetchAnnouncements = async () => {
        const res = await apiFetch(`/faculty/announcements?offering_id=${offering.id}`);
        if (!res.error) setAnnouncements(res);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await apiFetch("/faculty/announcements", "POST", {
            offering_id: offering.id,
            title,
            content
        });

        setLoading(false);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Announcement posted!");
            setTitle("");
            setContent("");
            fetchAnnouncements();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-bold text-gray-800">Announcements</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <div className="mb-2 text-sm text-gray-600 font-medium">
                    {offering.courses.course_code}: {offering.courses.course_name}
                </div>

                {/* Create Form */}
                <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded border">
                    <input
                        className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none h-20"
                        placeholder="Write your announcement..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Posting..." : "Post Announcement"}
                    </button>
                </form>

                {/* List */}
                <div className="overflow-y-auto flex-1 space-y-3">
                    {announcements.length === 0 && <p className="text-center text-gray-500 text-sm">No announcements yet.</p>}
                    {announcements.map(a => (
                        <div key={a.id} className="border p-3 rounded hover:bg-gray-50">
                            <h4 className="font-bold text-gray-800">{a.title}</h4>
                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{a.content}</p>
                            <p className="text-xs text-gray-400 mt-2 text-right">
                                {new Date(a.created_at).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
