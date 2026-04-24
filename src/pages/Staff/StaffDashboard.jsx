import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuthUser } from "../../store/authstore";

const StatCard = ({ title, value, subtitle }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <h3 className="mt-2 text-3xl font-bold text-gray-900">{value}</h3>
    {subtitle ? <p className="mt-2 text-xs text-gray-500">{subtitle}</p> : null}
  </div>
);

const ActionCard = ({ title, description, to, buttonText }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
    <Link
      to={to}
      className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
    >
      {buttonText}
    </Link>
  </div>
);

const NoticeItem = ({ notice }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h4 className="text-base font-semibold text-gray-900">{notice.title}</h4>
        <p className="mt-1 text-sm text-gray-600">
          Audience: {notice.audience}
        </p>
      </div>
      <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200">
        {notice.date}
      </span>
    </div>
  </div>
);

export default function StaffDashboard() {
  const authUser = useAuthUser();

  const fullName = useMemo(() => {
    if (!authUser) return "Staff User";
    return `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim();
  }, [authUser]);

  // demo data for UI preview
  const stats = [
    {
      title: "Total Notices",
      value: "12",
      subtitle: "All notices created by you",
    },
    {
      title: "This Month",
      value: "4",
      subtitle: "Published in the current month",
    },
    {
      title: "Target Groups",
      value: "6",
      subtitle: "Different student batches reached",
    },
    {
      title: "Pending Tasks",
      value: "3",
      subtitle: "Administrative items to review",
    },
  ];

  const recentNotices = [
    {
      id: 1,
      title: "Class Suspension Notice",
      audience: "BSSE 3rd Year",
      date: "23 Apr 2026",
    },
    {
      id: 2,
      title: "Library Clearance Reminder",
      audience: "All Students",
      date: "21 Apr 2026",
    },
    {
      id: 3,
      title: "Semester Fee Deadline",
      audience: "MSSE 1st Year",
      date: "18 Apr 2026",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 px-6 py-10 text-white md:px-8">
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Welcome back, {fullName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              Manage notices, monitor your recent activity, and access your
              daily staff actions from one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/staff/staffnotices"
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Go to Notices
              </Link>
              <Link
                to="/staff/profile"
                className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                View Profile
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              subtitle={item.subtitle}
            />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Quick Actions
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Shortcuts for your most common tasks.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <ActionCard
                  title="Create Notice"
                  description="Publish a new notice for all students or selected batches."
                  to="/staff/notices"
                  buttonText="Open Notices"
                />
                <ActionCard
                  title="My Published Notices"
                  description="Review the notices you have already circulated."
                  to="/staff/notices"
                  buttonText="View Notices"
                />
                <ActionCard
                  title="Student Directory"
                  description="Browse student information and prepare targeted communication."
                  to="/staff/students"
                  buttonText="Open Directory"
                />
                <ActionCard
                  title="Profile"
                  description="Review your staff account details and access information."
                  to="/staff/profile"
                  buttonText="View Profile"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Notices
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Latest notices published by you.
                  </p>
                </div>

                <Link
                  to="/staff/notices"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  See all
                </Link>
              </div>

              <div className="mt-5 space-y-4">
                {recentNotices.map((notice) => (
                  <NoticeItem key={notice.id} notice={notice} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">Profile Summary</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Name
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {fullName}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {authUser?.email || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Role
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-800 capitalize">
                    {authUser?.role || "staff"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-800 capitalize">
                    {authUser?.status || "approved"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">Today’s Focus</h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                  Review pending student-facing announcements.
                </div>
                <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 text-sm text-purple-800">
                  Check whether any new batch-specific notice needs to be sent.
                </div>
                <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
                  Keep important administrative updates visible and clear.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}