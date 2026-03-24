import { Link } from "react-router-dom";

export default function Sidebar({ role, isOpen, closeSidebar }) {
  console.log("ROLE:", role);
  return (

    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 transform transition-transform duration-300 z-50
      ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <h2 className="text-xl font-bold mb-6 capitalize">
        {role} Panel
      </h2>

      <nav className="space-y-3">

        {/* ================= STUDENT ================= */}
        {role === "student" && (
          <>
            <Link
              to="/student/dashboard"
              className="block hover:bg-gray-700 p-2 rounded"
              onClick={closeSidebar}
            >
              Dashboard
            </Link>

            <Link
              to="/student/profile"
              className="block hover:bg-gray-700 p-2 rounded"
              onClick={closeSidebar}
            >
              Profile
            </Link>

            <Link
              to="/student/notices"
              className="block hover:bg-gray-700 p-2 rounded"
              onClick={closeSidebar}
            >
              Notices
            </Link>

            <Link
              to="/student/payments"
              className="block hover:bg-gray-700 p-2 rounded"
              onClick={closeSidebar}
            >
              Payments
            </Link>

            <Link
              to="/student/testimonial"
              className="block hover:bg-gray-700 p-2 rounded"
              onClick={closeSidebar}
            >
              Apply for Testimonial
            </Link>

            <Link
              to="/student/certificate"
              className="block hover:bg-gray-700 p-2 rounded"
              onClick={closeSidebar}
            >
              Apply for ECA
            </Link>
          </>
        )}

        {/* ================= TEACHER ================= */}
        {role === "teacher" && (
          <>
            <Link
              to="/teacher/dashboard"
              className="block hover:bg-gray-700 p-2 rounded"
              onClick={closeSidebar}
            >
              Dashboard
            </Link>

            <Link
              to="/teacher/testimonials"
              className="block hover:bg-gray-700 p-2 rounded"
              onClick={closeSidebar}
            >
              Review Testimonials
            </Link>

            <Link
              to="/teacher/notices"
              className="block hover:bg-gray-700 p-2 rounded"
              onClick={closeSidebar}
            >
              Notices
            </Link>

            <Link
              to="/teacher/profile"
              className="block hover:bg-gray-700 p-2 rounded"
              onClick={closeSidebar}
            >
              Profile
            </Link>
          </>
        )}


      </nav>
    </div>
  );
}