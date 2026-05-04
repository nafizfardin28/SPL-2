import {
  FiUsers,
  FiUserCheck,
  FiCreditCard,
  FiFileText,
  FiBell,
  FiShield,
  FiClock,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

export default function AdminDashboard() {
  const cards = [
    {
      title: "Pending Accounts",
      value: "12",
      subtitle: "Students waiting approval",
      icon: <FiUserCheck />,
      color: "blue",
      action: "Review Requests",
    },
    {
      title: "Total Users",
      value: "248",
      subtitle: "Students, teachers & staff",
      icon: <FiUsers />,
      color: "indigo",
      action: "Manage Users",
    },
    {
      title: "Running Payments",
      value: "5",
      subtitle: "Active semester fee allocations",
      icon: <FiCreditCard />,
      color: "green",
      action: "View Payments",
    },
    {
      title: "Certificate Requests",
      value: "9",
      subtitle: "ECA / official requests",
      icon: <FiFileText />,
      color: "purple",
      action: "Process Requests",
    },
  ];

  const activities = [
    {
      icon: <FiUserCheck />,
      text: "3 new student accounts need approval",
      time: "Today",
    },
    {
      icon: <FiCreditCard />,
      text: "Semester payment deadline ending soon",
      time: "2 days left",
    },
    {
      icon: <FiFileText />,
      text: "5 certificate requests are pending",
      time: "This week",
    },
  ];

  const colorMap = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    green: "bg-green-50 text-green-700 border-green-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="space-y-8">
        <div className="rounded-3xl bg-white border border-blue-100 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Superadmin Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                Manage users, payments, notices, certificates, and system access.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-green-50 border border-green-100 px-4 py-3 text-green-700 font-semibold">
              <FiShield />
              System Active
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`h-12 w-12 rounded-2xl border flex items-center justify-center text-xl ${colorMap[card.color]}`}
                >
                  {card.icon}
                </div>

                <FiArrowRight className="text-gray-300 group-hover:text-blue-600 transition" />
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-gray-500">
                  {card.title}
                </p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  {card.value}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
              </div>

              <button className="mt-5 text-sm font-bold text-blue-600 hover:text-blue-700">
                {card.action} →
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                Admin Operations
              </h2>
              <FiBell className="text-gray-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Operation
                icon={<FiUserCheck />}
                title="Approve Accounts"
                desc="Review newly registered users and assign access."
              />
              <Operation
                icon={<FiUsers />}
                title="Manage Users"
                desc="View students, teachers, staff, and account status."
              />
              <Operation
                icon={<FiCreditCard />}
                title="Semester Payments"
                desc="Track paid/unpaid students and extend deadlines."
              />
              <Operation
                icon={<FiBell />}
                title="Notice Control"
                desc="Monitor notices published to selected audiences."
              />
              <Operation
                icon={<FiFileText />}
                title="Certificates"
                desc="Review and process certificate requests."
              />
              <Operation
                icon={<FiShield />}
                title="System Access"
                desc="Maintain role-based admin control."
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Recent Alerts
            </h2>

            <div className="space-y-4">
              {activities.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    {item.icon}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {item.text}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <FiClock />
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-green-50 border border-green-100 p-4">
              <p className="flex items-center gap-2 text-green-700 font-bold">
                <FiCheckCircle />
                Backend Connected
              </p>
              <p className="text-sm text-green-600 mt-1">
                Admin modules are ready for operation.
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-orange-50 border border-orange-100 p-4">
              <p className="flex items-center gap-2 text-orange-700 font-bold">
                <FiAlertCircle />
                Reminder
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Check pending approvals regularly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Operation({ icon, title, desc }) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-gray-50 p-5 hover:bg-white hover:shadow-md transition">
      <div className="h-11 w-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-blue-700 text-xl group-hover:bg-blue-600 group-hover:text-white transition">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </div>
  );
}