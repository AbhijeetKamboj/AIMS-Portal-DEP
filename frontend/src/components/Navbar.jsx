import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../services/supabaseClient.js";

export default function Navbar({ title }) {
    const navigate = useNavigate();
    const { session } = useAuth();
    const userName = session?.user?.user_metadata?.name || "User";

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        navigate("/login");
    };

    return (
        <nav className="bg-black text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <h1 className="text-xl font-semibold">{title}</h1>
                    </div>

                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm font-medium border border-white/20"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
