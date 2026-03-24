import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "../../utils/mockAuthService";

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const res = verifyOtp({ email, otp });
    if (!res.ok) {
      setSuccess("");
      setError(res.message);
      return;
    }

    setSuccess(res.message);
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify OTP</h2>

        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{error}</p>}
        {success && <p className="bg-green-100 text-green-700 p-2 rounded mb-3 text-sm">{success}</p>}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded"
            placeholder="Registered email"
            required
          />
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 border rounded"
            placeholder="6-digit OTP"
            required
          />
          <button className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700" type="submit">
            Verify
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Back to <Link to="/login" className="text-blue-600 hover:underline">login</Link>
        </p>
      </div>
    </div>
  );
}