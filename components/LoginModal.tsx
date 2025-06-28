import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: { _id: string; name: string; email: string; photo?: string | null }) => void;
}

export default function LoginModal({ open, onClose, onLoginSuccess }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"login" | "verify" | "reset-email" | "reset-code" | "reset-password" | "reset-success">("login");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resent, setResent] = useState(false);
  // Para reset
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetPassword2, setResetPassword2] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  if (!open) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResent(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Try again.");
        setLoading(false);
        return;
      }
      // Login exitoso (sin 2FA)
      setLoading(false);
      if (onLoginSuccess) onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError("Login failed. Try again.");
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid or expired code.");
        setVerifying(false);
        return;
      }
      // Login exitoso (user)
      setVerifying(false);
      if (onLoginSuccess) onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError("Verification failed. Try again.");
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setResent(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
      } else {
        setResent(true);
      }
    } catch {
      setError("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("login");
    setEmail("");
    setPassword("");
    setCode("");
    setError("");
    setLoading(false);
    setVerifying(false);
    setResent(false);
    onClose();
  };

  // --- RESET PASSWORD FLOW ---
  const handleResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetSuccess("");
    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || "Could not send code. Try again.");
        setResetLoading(false);
        return;
      }
      setStep("reset-code");
      setResetSuccess("A code was sent to your email.");
    } catch (err) {
      setResetError("Could not send code. Try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    // Solo pasar al siguiente paso, la verificación real es al cambiar la clave
    setStep("reset-password");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetSuccess("");
    if (resetPassword.length < 6) {
      setResetError("Password must be at least 6 characters.");
      setResetLoading(false);
      return;
    }
    if (resetPassword !== resetPassword2) {
      setResetError("Passwords do not match.");
      setResetLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/verify-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, code: resetCode, password: resetPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || "Could not reset password.");
        setResetLoading(false);
        return;
      }
      setResetSuccess("Password changed successfully! You can now log in.");
      setStep("reset-success");
    } catch (err) {
      setResetError("Could not reset password. Try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetBackToLogin = () => {
    setStep("login");
    setResetEmail("");
    setResetCode("");
    setResetPassword("");
    setResetPassword2("");
    setResetError("");
    setResetSuccess("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-600 max-w-md w-full p-8 relative animate-fadeIn">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-blue-700 text-2xl font-bold">&times;</button>
        <h2 className="text-3xl font-extrabold text-blue-700 text-center mb-6 drop-shadow-lg">
          {step === "login" || step === "verify" ? "Sign In" : step === "reset-email" ? "Reset Password" : step === "reset-code" ? "Enter Code" : step === "reset-password" ? "Set New Password" : "Password Reset"}
        </h2>
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
        {step === "reset-email" && (
          <form onSubmit={handleResetEmail} className="flex flex-col gap-5">
            <input
              type="email"
              placeholder="Email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
              autoFocus
            />
            {resetError && <div className="text-red-600 text-center">{resetError}</div>}
            {resetSuccess && <div className="text-green-600 text-center">{resetSuccess}</div>}
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-md mt-2"
            >
              {resetLoading ? "Sending..." : "Send Code"}
            </button>
            <button type="button" className="text-blue-600 hover:underline text-sm mt-2" onClick={handleResetBackToLogin}>Back to login</button>
          </form>
        )}
        {step === "reset-code" && (
          <form onSubmit={handleResetCode} className="flex flex-col gap-5">
            <div className="text-center text-gray-700 mb-2">A reset code was sent to <b>{resetEmail}</b>. Please enter it below.</div>
            <input
              type="text"
              placeholder="Reset code"
              value={resetCode}
              onChange={e => setResetCode(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-center tracking-widest text-xl font-mono"
              maxLength={6}
              required
              autoFocus
            />
            {resetError && <div className="text-red-600 text-center">{resetError}</div>}
            {resetSuccess && <div className="text-green-600 text-center">{resetSuccess}</div>}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md mt-2"
            >
              Next
            </button>
            <button type="button" className="text-blue-600 hover:underline text-sm mt-2" onClick={handleResetBackToLogin}>Back to login</button>
          </form>
        )}
        {step === "reset-password" && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
            <input
              type="password"
              placeholder="New password"
              value={resetPassword}
              onChange={e => setResetPassword(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
              autoFocus
            />
            <input
              type="password"
              placeholder="Repeat new password"
              value={resetPassword2}
              onChange={e => setResetPassword2(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
            {resetError && <div className="text-red-600 text-center">{resetError}</div>}
            {resetSuccess && <div className="text-green-600 text-center">{resetSuccess}</div>}
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-md mt-2"
            >
              {resetLoading ? "Saving..." : "Change Password"}
            </button>
            <button type="button" className="text-blue-600 hover:underline text-sm mt-2" onClick={handleResetBackToLogin}>Back to login</button>
          </form>
        )}
        {step === "reset-success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-green-600 text-center font-bold">Password changed successfully! You can now log in.</div>
            <button
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md mt-2"
              onClick={handleResetBackToLogin}
            >
              Back to login
            </button>
          </div>
        )}
        <div className="flex flex-col items-center mt-6 gap-2">
          {step === "login" && (
            <button
              className="text-blue-600 hover:underline text-sm"
              onClick={() => setStep("reset-email")}
            >
              Forgot password?
            </button>
          )}
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