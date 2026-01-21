import { supabase } from "../services/supabaseClient.js";
import { useNavigate } from "react-router-dom";

export default function Navbar({ title }) {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-blue-600 text-white">
      <h1 className="text-xl font-semibold">{title}</h1>
      <button
        onClick={logout}
        className="bg-red-500 px-4 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
