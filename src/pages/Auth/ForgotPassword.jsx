import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../../utils/mockAuthService";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8 || newPassword.length > 15) {
      setMessage("");
      setError("Password must be between 8-15 characters.");
      return;
    }

    const res = resetPassword({ email, newPassword });
    if (!res.ok) {
      setMessage("");
      setError(res.message);
      return;
    }

    setMessage(res.message);
    setTimeout(() => navigate("/login"), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{error}</p>}
        {message && <p className="bg-green-100 text-green-700 p-2 rounded mb-3 text-sm">{message}</p>}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded" placeholder="Registered email" required />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 border rounded" placeholder="New password" required />
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">Update Password</button>
        </form>

        <p className="text-center text-sm mt-4">Back to <Link to="/login" className="text-blue-600 hover:underline">login</Link></p>
      </div>
    </div>
  );
}