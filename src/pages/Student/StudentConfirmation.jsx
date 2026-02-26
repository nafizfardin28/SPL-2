import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const StudentConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-lg text-center">

        <div className="flex justify-center mb-6">
          <CheckCircleIcon className="h-20 w-20 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-600 text-lg mb-6">
          Your testimonial application has been submitted successfully.
        </p>

        <button
          onClick={() => navigate("/student/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Go to Dashboard
        </button>

      </div>
    </div>
  );
};

export default StudentConfirmation;