import { CheckCircleIcon } from "@heroicons/react/24/solid"; // Install heroicons: npm install @heroicons/react
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Submission() {
  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-lg text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircleIcon className="h-20 w-20 text-green-500" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h1>

        {/* Message */}
        <p className="text-gray-600 text-lg mb-3">
          Your information has been submitted. Please verify your OTP first, then wait for Super Admin approval.
        </p>

        {email && <p className="text-sm text-gray-700 mb-2"><strong>Email:</strong> {email}</p>}
        {otp && <p className="text-sm text-amber-700 mb-6"><strong>Demo OTP:</strong> {otp}</p>}

        <div className="flex flex-col gap-3">
          <Link to="/verify-otp" state={{ email }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-300">Verify OTP</Link>
          <Link to="/login" className="text-blue-700 hover:underline">Go to Login</Link>
        </div>
      </div>
    </div>
  );
}
