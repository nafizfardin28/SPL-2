import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ role, isOpen, closeSidebar }) {
  const location = useLocation();
  const normalizedRole = String(role || "").trim().toLowerCase();

  const linkClass = (path) =>
    `block p-2 rounded ${
      location.pathname === path
        ? "bg-gray-700 text-white"
        : "hover:bg-gray-700 text-white"
    }`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 transform transition-transform duration-300 z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold capitalize">
            {normalizedRole || "User"} Panel
          </h2>

          <button
            type="button"
            onClick={closeSidebar}
            className="text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <nav className="space-y-3">
          {normalizedRole === "student" && (
            <>
              <Link
                to="/student/dashboard"
                className={linkClass("/student/dashboard")}
                onClick={closeSidebar}
              >
                Dashboard
              </Link>
              <Link
                to="/student/profile"
                className={linkClass("/student/profile")}
                onClick={closeSidebar}
              >
                Profile
              </Link>
              <Link
                to="/student/semester-fees"
                className={linkClass("/student/semester-fees")}
                onClick={closeSidebar}
              >
                Semester Fees
              </Link>
              <Link
                to="/student/notices"
                className={linkClass("/student/notices")}
                onClick={closeSidebar}
              >
                Notices
              </Link>
              <Link
                to="/student/payments"
                className={linkClass("/student/payments")}
                onClick={closeSidebar}
              >
                Payments
              </Link>
              <Link
                to="/student/testimonial"
                className={linkClass("/student/testimonial")}
                onClick={closeSidebar}
              >
                Apply for Testimonial
              </Link>
              <Link
                to="/student/certificate"
                className={linkClass("/student/certificate")}
                onClick={closeSidebar}
              >
                Apply for ECA
              </Link>
              <Link
                to="/student/budgets"
                className={linkClass("/student/budgets")}
                onClick={closeSidebar}
              >
                Apply for Budget
              </Link>
            </>
          )}

          {normalizedRole === "teacher" && (
            <>
              <Link
                to="/teacher/dashboard"
                className={linkClass("/teacher/dashboard")}
                onClick={closeSidebar}
              >
                Dashboard
              </Link>
              <Link
                to="/teacher/profile"
                className={linkClass("/teacher/profile")}
                onClick={closeSidebar}
              >
                Profile
              </Link>
              <Link
                to="/teacher/notices"
                className={linkClass("/teacher/notices")}
                onClick={closeSidebar}
              >
                Notices
              </Link>
              <Link
                to="/teacher/budgetconfirmation"
                className={linkClass("/teacher/budgetconfirmation")}
                onClick={closeSidebar}
              >
                Budget Confirmation
              </Link>
              <Link
                to="/teacher/ecaconfirmation"
                className={linkClass("/teacher/ecaconfirmation")}
                onClick={closeSidebar}
              >
                ECA Confirmation
              </Link>
            </>
          )}

          {normalizedRole === "staff" && (
            <>
              <Link
                to="/staff/dashboard"
                className={linkClass("/staff/dashboard")}
                onClick={closeSidebar}
              >
                Dashboard
              </Link>
              <Link
                to="/staff/profile"
                className={linkClass("/staff/profile")}
                onClick={closeSidebar}
              >
                Profile
              </Link>
              <Link
                to="/staff/allocate-payments"
                className={linkClass("/staff/allocate-payments")}
                onClick={closeSidebar}
              >
                Allocate Payments
              </Link>
              
              <Link
                to="/staff/staffnotices"
                className={linkClass("/staff/staffnotices")}
                onClick={closeSidebar}
              >
                Notices
              </Link>
              <Link
                to="/staff/testimonial"
                className={linkClass("/staff/testimonial")}
                onClick={closeSidebar}
              >
                Testimonials
              </Link>
              <Link
                to="/staff/staffbudgets"
                className={linkClass("/staff/staffbudgets")}
                onClick={closeSidebar}
              >
                Budgets
              </Link>
            </>
          )}

          {normalizedRole === "superadmin" && (
            <>
              <Link
                to="/admin/dashboard"
                className={linkClass("/admin/dashboard")}
                onClick={closeSidebar}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/users"
                className={linkClass("/admin/users")}
                onClick={closeSidebar}
              >
                Users
              </Link>
              <Link
                to="/admin/notices"
                className={linkClass("/admin/notices")}
                onClick={closeSidebar}
              >
                Notices
              </Link>
              <Link
                to="/admin/testimonials"
                className={linkClass("/admin/testimonials")}
                onClick={closeSidebar}
              >
                Testimonials 
              </Link>
              <Link
                to="/admin/budgets"
                className={linkClass("/admin/budgets")}
                onClick={closeSidebar}
              >
                Budgets
              </Link>
            </>
          )}

          {!["student", "teacher", "staff", "superadmin"].includes(
            normalizedRole
          ) && (
            <p className="text-sm text-red-300">
              No menu found for role: {String(role)}
            </p>
          )}
        </nav>
      </aside>
    </>
  );
}