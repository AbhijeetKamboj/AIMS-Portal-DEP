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
        
        // Ensure URL has protocol
        let urlToSave = fileUrl.trim();
        if (urlToSave && !urlToSave.startsWith('http://') && !urlToSave.startsWith('https://')) {
            urlToSave = 'https://' + urlToSave;
        }
        
        const res = await apiFetch("/faculty/materials", "POST", {
            offering_id: offering.id,
            title,
            file_url: urlToSave
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Course Materials</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {offering.courses.course_code}: {offering.courses.course_name}
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto flex flex-col">
                    {/* Upload Form */}
                    <form onSubmit={handleSubmit} className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                                <input
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black/20 transition-all"
                                    placeholder="e.g., Lecture 1 Slides"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">File/Link URL</label>
                                <input
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black/20 transition-all"
                                    placeholder="e.g., https://drive.google.com/..."
                                    value={fileUrl}
                                    onChange={e => setFileUrl(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2">Provide a direct link to the resource</p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                            >
                                {loading ? "Adding..." : "Add Material"}
                            </button>
                        </div>
                    </form>

                    {/* List */}
                    <div className="px-8 py-6 space-y-3 flex-1">
                        {materials.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-400 font-medium">No materials yet.</p>
                            </div>
                        )}
                        {materials.map(m => (
                            <div key={m.id} className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all bg-white flex justify-between items-center">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">{m.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(m.uploaded_at).toLocaleDateString()} at {new Date(m.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <a
                                    href={m.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors ml-4 flex-shrink-0"
                                >
                                    Open
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
