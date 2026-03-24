import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../utils/mockAuthService";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    regNo: "",
    rollNo: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role || !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      setError("Please fill all required fields.");
      return;
    }
    if (!formData.email.endsWith("@du.ac.bd") && !formData.email.endsWith("@iit.du.ac.bd")) {
      setError("Please use your official DU/IIT email address.");
      return;
    }

    if (formData.phone.length !== 11) {
      setError("Phone number is invalid.");
      return;
    }
   
    
    if (formData.password.length < 8 || formData.password.length > 15) {
      setError("Password must be between 8-15 characters.");
      return;
    }
    if (role === "student") {
      if (!formData.regNo || !formData.rollNo) {
        setError("Students must provide DU registration and roll number.");
        return;
      }
      if (formData.rollNo.length !== 4) {
        setError("Roll number must be exactly 4 digits.");
        return;
      }
      if (formData.regNo.length !== 10) {
        setError("Registration number must be exactly 10 digits");
        return;
      }
    }
    const response = registerUser({ ...formData, role });
    if (!response.ok) {
      setError(response.message);
      return;
    }

    navigate("/submission", {
      state: { email: response.email, otp: response.otp },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">AcademiX Registration</h2>

        <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
          {error && <div className="col-span-2 bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>}
           <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="p-3 border rounded"
            placeholder="First Name *"
          />
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="p-3 border rounded"
            placeholder="Last Name *"
          />

          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="p-3 border rounded col-span-2"
            placeholder="IIT Email (example@du.ac.bd) *"
          />

          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="p-3 border rounded col-span-2"
            placeholder="Phone Number"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-3 border rounded col-span-2"
          >
            <option value="">Select Role *</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="staff">Staff</option>
          </select>

          {role === "student" && (
            <>
              <input
                name="regNo"
                value={formData.regNo}
                onChange={handleChange}
                className="p-3 border rounded"
                placeholder="DU Registration Number *"
              />
              <input
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                className="p-3 border rounded"
                placeholder="Roll Number (4 digit) *"
              />
            </>
          )}

          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className={`p-3 border rounded col-span-2 ${
              !role ? "bg-gray-200 cursor-not-allowed" : ""
            }`}
            placeholder="Password *"
            disabled={!role}
          />

          <button
            type="submit"
            className="col-span-2 bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            Submit Information
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
