import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  sendOtp,
  verifyOtp,
  resetPassword,
  verifyUser,
} from "../../api/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (
      !email.endsWith("@du.ac.bd") &&
      !email.endsWith("@PHS.du.ac.bd") &&
      !email.endsWith("@it.du.ac.bd")
    ) {
      setError("Must be an official DU/PHS email address.");
      return;
    }

    setLoading(true);

    const res1 = await verifyUser({ email });
    if (!res1.ok) {
      setLoading(false);
      setError(res1.message);
      return;
    }

    const res2 = await sendOtp({ email, purpose: "forgot_password" });
    setLoading(false);

    if (!res2.ok) {
      setError(res2.message);
      return;
    }

    setMessage(res2.message || "OTP sent successfully.");
    setStep("otp");
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const res = await verifyOtp({ email, otp, purpose: "forgot_password" });
    setLoading(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    setMessage(res.message || "OTP verified successfully.");
    setStep("password");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await resetPassword({ email, newPassword });
    setLoading(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    setMessage(res.message || "Password reset successful.");

    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>

        {error && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
            {error}
          </p>
        )}

        {message && (
          <p className="bg-green-100 text-green-700 p-2 rounded mb-3 text-sm">
            {message}
          </p>
        )}

        {step === "email" && (
          <form className="space-y-4" onSubmit={handleSendOtp}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded"
              placeholder="Official DU/PHS email"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full p-3 border rounded bg-gray-100"
            />
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border rounded"
              placeholder="Enter OTP"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === "password" && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border rounded"
              placeholder="New Password"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded"
              placeholder="Confirm New Password"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-4">
          Back to{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            login
          </Link>
        </p>
      </div>
    </div>
  );
}
