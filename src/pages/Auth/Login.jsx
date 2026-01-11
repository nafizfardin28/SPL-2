import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isLoginSuccessful = true; 

    if (isLoginSuccessful) {
      setError("");
      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        navigate("/student/dashboard");
      }, 1500);
    } else {
      setSuccess("");
      setError("Invalid email or password");
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
            className="w-full p-3 border rounded"
            placeholder="IIT Email (example@iit.du.ac.bd)"
            required
          />

          <input
            type="password"
            className="w-full p-3 border rounded"
            placeholder="Password"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-4">
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
