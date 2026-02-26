import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentPayment = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const storedApps =
      JSON.parse(localStorage.getItem("testimonialApplications")) || [];

    setApplications(storedApps);
  }, []);

  const handlePayment = (id) => {
    const updatedApps = applications.map((app) =>
      app.id === id ? { ...app, status: "Paid" } : app
    );

    localStorage.setItem(
      "testimonialApplications",
      JSON.stringify(updatedApps)
    );

    setApplications(updatedApps);

    navigate("/student/confirmation");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        <h2 className="text-2xl font-bold mb-6">
          Pending Payments
        </h2>

        {applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="border rounded-lg p-4 mb-4 flex justify-between items-center"
            >
              <div>
                <p><strong>ID:</strong> {app.id}</p>
                <p><strong>Purpose:</strong> {app.purpose}</p>
                <p><strong>Amount:</strong> ৳ {app.amount}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      app.status === "Paid"
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {app.status}
                  </span>
                </p>
              </div>

              {app.status === "Unpaid" && (
                <button
                  onClick={() => handlePayment(app.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Pay Now
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentPayment;