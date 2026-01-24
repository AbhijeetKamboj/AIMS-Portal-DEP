import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";

export default function StudentProfileHeader() {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        async function load() {
            const res = await apiFetch("/student/transcript");
            if (!res.error) {
                setProfile(res);
            }
        }
        load();
    }, []);

    if (!profile) {
        return (
            <div className="card p-6 mb-6 animate-pulse">
                <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    const user = profile.student_info || {};

    return (
        <div className="card p-6 mb-6">
            <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {(user.name || "A")[0].toUpperCase()}
                    </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {user.name || "Student Name"}
                    </h2>
                    <p className="text-gray-500 text-sm mb-4">
                        {user.roll_number || "Roll Number"} • {user.department || "Department"}
                    </p>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                Email
                            </label>
                            <div className="text-sm text-gray-900">
                                {user.email || "email@example.com"}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                Degree
                            </label>
                            <div className="text-sm text-gray-900">
                                B.Tech
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                Year of Entry
                            </label>
                            <div className="text-sm text-gray-900">
                                {user.batch || "2023"}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                Status
                            </label>
                            <span className="badge badge-success">
                                Registered
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
