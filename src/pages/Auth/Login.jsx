import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAuth } from "../../store/authstore";
import { loginUser } from "../../api/authService";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDashboardPathByRole = (role) => {
    switch (role) {
      case "student":
        return "/student/dashboard";
      case "teacher":
        return "/teacher/dashboard";
      case "staff":
        return "/staff/dashboard";
      case "superadmin":
        return "/admin/dashboard";
      default:
        return "/login";
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setIsSubmitting(true);

  try {
    const res = await loginUser({ email, password });

    console.log("FULL LOGIN RESULT:", res);
    console.log("USER INSIDE RESULT:", res.user);

    if (!res.ok) {
      const message = (res.message || "").toLowerCase();

      setIsSubmitting(false);

      if (
        message.includes("verify otp") ||
        message.includes("verify your otp") ||
        message.includes("please verify otp") ||
        message.includes("please verify")
      ) {
        navigate("/verify-otp", {
          state: { email },
        });
        return;
      }

      setError(res.message || "Login failed.");
      return;
    }

    loginAuth(res.user, res.token);
    localStorage.setItem("role", res.user.role);
    setSuccess("Login successful! Redirecting...");
    setIsSubmitting(false);

    setTimeout(() => navigate(getDashboardPathByRole(res.user.role)), 700);
  } catch (error) {
    console.error(error);
    setError("Something went wrong during login.");
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Welcome To AcademiX
        </h2>
        {error && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
            {error}
          </p>
        )}
        {success && (
          <p className="bg-green-100 text-green-700 p-2 rounded mb-3 text-sm">
            {success}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded"
            placeholder="PHS Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded"
            placeholder="Password"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </p>
        <p className="text-center text-sm mt-2">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-semibold"
          >
            Register Now!
          </Link>
        </p>
      </div>
    </div>
  );
}
