import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (session) => {
    try {
      if (!session) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch profile:", res.status);
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUser(data);
      setRole(data.role);
    } catch (err) {
      console.error("AuthContext error:", err);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // On refresh
    supabase.auth.getSession().then(({ data }) => {
      fetchProfile(data.session);
    });

    // On login / logout
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchProfile(session);
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
