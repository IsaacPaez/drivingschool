"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, AuthUser } from "@/components/AuthContext";

export default function SignInPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Aquí deberías llamar a tu endpoint de login personalizado
    // Simulación de éxito
    setTimeout(() => {
      setLoading(false);
      // Simula usuario recibido del backend
      const fakeUser: AuthUser = {
        _id: "1234567890",
        name: "Dayro Moreno",
        email: email,
        type: 'instructor'
      };
      setUser(fakeUser);
      if (fakeUser.type === 'instructor') {
        router.replace("/myschedule");
      } else {
        router.replace("/");
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-600 max-w-md w-full p-8 relative animate-fadeIn">
        <h2 className="text-3xl font-extrabold text-blue-700 text-center mb-6 drop-shadow-lg">Sign In</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            autoFocus
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 w-full focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {error && <div className="text-red-600 text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-md mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="flex flex-col items-center mt-6 gap-2">
          <button
            className="text-blue-600 hover:underline text-sm"
            onClick={() => alert('Password recovery coming soon!')}
          >
            Forgot password?
          </button>
          <button
            className="text-green-600 hover:underline text-sm font-semibold"
            onClick={() => router.replace("/register-profile")}
          >
            Don't have an account? Register
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
      `}</style>
    </div>
  );
}
