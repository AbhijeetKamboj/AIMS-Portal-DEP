import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient.js";
import { getMyRole } from "../services/api.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingButton from "../components/LoadingButton.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔥 AUTO-REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;

      const res = await getMyRole();
      if (res?.role === "student") navigate("/student");
      else if (res?.role === "faculty") navigate("/faculty");
      else if (res?.role === "admin") navigate("/admin");
    };

    redirectIfLoggedIn();
  }, [navigate]);

  const login = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Login successful");
    // navigate("/loading");

    const res = await getMyRole();

    if (!res?.role) {
      toast.error("Role not found. Contact admin.");
      setLoading(false);
      return;
    }

    if (res.role === "student") navigate("/student");
    else if (res.role === "faculty") navigate("/faculty");
    else navigate("/admin");

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Academic Portal</h2>

        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 p-2 border rounded"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        <LoadingButton loading={loading} onClick={login}>
          Login
        </LoadingButton>
      </div>
    </div>
  );
}
