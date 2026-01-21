import { useEffect } from "react";
import { supabase } from "../services/supabaseClient.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function RoleLoader() {
  const navigate = useNavigate();

  useEffect(() => {
    const resolveRole = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/me/role`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(`Role fetch failed: ${body.error || res.statusText}`);
        console.error("Role fetch failed", res.status, body);
        return;
      }

      const { role } = await res.json();
      if (!role) {
        toast.error("Role not found. Contact admin.");
        return;
      }

      navigate(`/${role}`);
    };

    resolveRole();
  }, [navigate]);

  return null;
}
