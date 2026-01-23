import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient.js";
import { getMyRole } from "../services/api.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingButton from "../components/LoadingButton.jsx";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState("password"); // 'password' or 'otp'
    const [otpSent, setOtpSent] = useState(false);
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

    // Password Login
    const loginWithPassword = async () => {
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

        await handlePostLogin();
    };

    // Send OTP to email
    const sendOtp = async () => {
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false // Only allow existing users
            }
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        toast.success("OTP sent to your email!");
        setOtpSent(true);
        setLoading(false);
    };

    // Verify OTP
    const verifyOtp = async () => {
        if (!otp || otp.length < 6) {
            toast.error("Please enter the 6-digit OTP");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: "email"
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        await handlePostLogin();
    };

    // Common post-login handler
    const handlePostLogin = async () => {
        toast.success("Login successful");

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

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            if (loginMethod === "password") {
                loginWithPassword();
            } else if (otpSent) {
                verifyOtp();
            } else {
                sendOtp();
            }
        }
    };

    const switchMethod = (method) => {
        setLoginMethod(method);
        setOtpSent(false);
        setOtp("");
        setPassword("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-purple/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6 animate-slideUp">
                {/* Logo/Title Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-gradient">AIMS</h1>
                    <p className="text-gray-600 text-sm">Academic Information Management System</p>
                </div>

                {/* Login Card */}
                <div className="card p-8 shadow-strong">
                    <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>

                    {/* Login Method Toggle */}
                    <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                        <button
                            onClick={() => switchMethod("password")}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${loginMethod === "password"
                                    ? "bg-white text-black shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Password
                        </button>
                        <button
                            onClick={() => switchMethod("otp")}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${loginMethod === "otp"
                                    ? "bg-white text-black shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Email OTP
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Email - Always shown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                                autoComplete="email"
                                disabled={loginMethod === "otp" && otpSent}
                            />
                        </div>

                        {/* Password Method */}
                        {loginMethod === "password" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    autoComplete="current-password"
                                />
                            </div>
                        )}

                        {/* OTP Method */}
                        {loginMethod === "otp" && otpSent && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Enter OTP
                                </label>
                                <input
                                    type="text"
                                    className="input text-center text-2xl tracking-widest font-mono"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    onKeyPress={handleKeyPress}
                                    maxLength={6}
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Check your email for a 6-digit code
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {loginMethod === "password" && (
                            <LoadingButton loading={loading} onClick={loginWithPassword} className="w-full mt-6">
                                Sign In
                            </LoadingButton>
                        )}

                        {loginMethod === "otp" && !otpSent && (
                            <LoadingButton loading={loading} onClick={sendOtp} className="w-full mt-6">
                                Send OTP
                            </LoadingButton>
                        )}

                        {loginMethod === "otp" && otpSent && (
                            <div className="space-y-3 mt-6">
                                <LoadingButton loading={loading} onClick={verifyOtp} className="w-full">
                                    Verify & Sign In
                                </LoadingButton>
                                <button
                                    onClick={() => setOtpSent(false)}
                                    className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium"
                                >
                                    ← Change email
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Secure login powered by Supabase
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>© 2026 Academic Portal. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

