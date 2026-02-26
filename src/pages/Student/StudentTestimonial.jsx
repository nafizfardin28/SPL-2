import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentTestimonial = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: "BSSE1528",
    fullName: "Nafiz Mahmud Fardin",
    registrationNo: "2021-1528",
    batch: "2021",
    purpose: "",
    deliveryType: "",
    copies: 1,
    notes: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const amount = formData.copies * 500;

  const newApplication = {
    id: "TST-" + Date.now(),
    ...formData,
    amount,
    status: "Unpaid"
  };

  // Get existing applications
  const existingApps =
    JSON.parse(localStorage.getItem("testimonialApplications")) || [];

  // Add new application
  existingApps.push(newApplication);

  // Save back to localStorage
  localStorage.setItem(
    "testimonialApplications",
    JSON.stringify(existingApps)
  );

  navigate("/student/payments");
};

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Apply for Testimonial</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Student Info */}
          <div className="md:col-span-2">
            <h3 className="font-semibold text-lg">Student Information</h3>
            <p className="text-sm text-gray-500 mb-4">
              These details are automatically fetched from your profile.
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1">Student ID</label>
            <input disabled value={formData.studentId} className="input-style bg-gray-100" />
          </div>

          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input disabled value={formData.fullName} className="input-style bg-gray-100" />
          </div>

          <div>
            <label className="block text-sm mb-1">Registration No</label>
            <input disabled value={formData.registrationNo} className="input-style bg-gray-100" />
          </div>

          <div>
            <label className="block text-sm mb-1">Batch</label>
            <input disabled value={formData.batch} className="input-style bg-gray-100" />
          </div>

          {/* Application Details */}
          <div className="md:col-span-2 mt-4">
            <h3 className="font-semibold text-lg">Application Details</h3>
          </div>

          <div>
            <label className="block text-sm mb-1">Purpose</label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              className="input-style"
            >
              <option value="">Select Purpose</option>
              <option value="Higher Study">Higher Study</option>
              <option value="Job">Job</option>
              <option value="Scholarship">Scholarship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Delivery Type</label>
            <select
              name="deliveryType"
              value={formData.deliveryType}
              onChange={handleChange}
              required
              className="input-style"
            >
              <option value="">Select Delivery Type</option>
              <option value="Soft Copy">Soft Copy</option>
              <option value="Hard Copy">Hard Copy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Copies</label>
            <input
              type="number"
              name="copies"
              min="1"
              value={formData.copies}
              onChange={handleChange}
              className="input-style"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Additional Notes</label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="input-style"
            />
          </div>

          <div className="md:col-span-2">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
              Submit & Proceed to Payment
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default StudentTestimonial;