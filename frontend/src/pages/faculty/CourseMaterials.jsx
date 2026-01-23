import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";
import toast from "react-hot-toast";

export default function CourseMaterials({ offering, onClose }) {
    const [materials, setMaterials] = useState([]);
    const [title, setTitle] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, [offering]);

    const fetchMaterials = async () => {
        const res = await apiFetch(`/faculty/materials?offering_id=${offering.id}`);
        if (!res.error) setMaterials(res);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await apiFetch("/faculty/materials", "POST", {
            offering_id: offering.id,
            title,
            file_url: fileUrl
        });

        setLoading(false);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Material added!");
            setTitle("");
            setFileUrl("");
            fetchMaterials();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-bold text-gray-800">Course Materials</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <div className="mb-2 text-sm text-gray-600 font-medium">
                    {offering.courses.course_code}: {offering.courses.course_name}
                </div>

                {/* Create Form */}
                <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded border">
                    <input
                        className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Title (e.g., Lecture 1 Slides)"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                    <input
                        className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="File/Link URL (e.g., Google Drive link)"
                        value={fileUrl}
                        onChange={e => setFileUrl(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Adding..." : "Add Material"}
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        * Provide a direct link to the resource
                    </p>
                </form>

                {/* List */}
                <div className="overflow-y-auto flex-1 space-y-3">
                    {materials.length === 0 && <p className="text-center text-gray-500 text-sm">No materials yet.</p>}
                    {materials.map(m => (
                        <div key={m.id} className="border p-3 rounded hover:bg-gray-50 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-gray-800">{m.title}</h4>
                                <p className="text-xs text-gray-400">
                                    {new Date(m.uploaded_at).toLocaleDateString()}
                                </p>
                            </div>
                            <a
                                href={m.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded hover:bg-indigo-200"
                            >
                                Open
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
