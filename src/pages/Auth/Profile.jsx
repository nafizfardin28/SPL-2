import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiBook,
  FiHash,
} from "react-icons/fi";
import { useAuthUser } from "../../store/authstore";

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-gray-100 transition">
    <div className="text-gray-500">{icon}</div>

    <div>
      <p className="text-xs text-gray-500 font-semibold">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value || "N/A"}</p>
    </div>
  </div>
);

const ProfilePage = () => {
  const authUser = useAuthUser();

  if (!authUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl bg-white p-8 shadow-md border">
          <p className="text-gray-600 text-lg">No user information found.</p>
        </div>
      </div>
    );
  }

  const fullName =
    `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600" />

          <div className="px-6 pb-6 -mt-14 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 bg-white border-4 border-white rounded-2xl flex items-center justify-center text-3xl font-bold text-blue-700 shadow-lg">
                {authUser.firstName?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                <p className="text-gray-500 text-sm">{authUser.email}</p>
              </div>
            </div>

            {/* STATUS BADGES */}
            <div className="flex gap-2 flex-wrap">
              <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                <FiShield />
                {authUser.role}
              </span>

              <span
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  authUser.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {authUser.status === "approved" ? (
                  <FiCheckCircle />
                ) : (
                  <FiAlertCircle />
                )}
                {authUser.status}
              </span>

              <span
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  authUser.is_verified
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {authUser.is_verified ? <FiCheckCircle /> : <FiAlertCircle />}
                {authUser.is_verified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* PERSONAL INFO */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <FiUser /> Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  icon={<FiUser />}
                  label="First Name"
                  value={authUser.firstName}
                />
                <InfoRow
                  icon={<FiUser />}
                  label="Last Name"
                  value={authUser.lastName}
                />
                <InfoRow
                  icon={<FiMail />}
                  label="Email"
                  value={authUser.email}
                />
                <InfoRow
                  icon={<FiPhone />}
                  label="Phone"
                  value={authUser.phone}
                />
                <InfoRow
                  icon={<FiShield />}
                  label="Role"
                  value={authUser.role}
                />
                <InfoRow
                  icon={<FiCheckCircle />}
                  label="Status"
                  value={authUser.status}
                />
              </div>
            </div>

            {/* ROLE INFO */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <FiBook /> Role Information
              </h2>

              {authUser.role === "student" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow
                    icon={<FiBook />}
                    label="Batch"
                    value={authUser.batch}
                  />
                  <InfoRow
                    icon={<FiHash />}
                    label="Roll No"
                    value={authUser.rollNo}
                  />
                  <InfoRow
                    icon={<FiHash />}
                    label="Reg No"
                    value={authUser.regNo}
                  />
                  <InfoRow
                    icon={<FiBook />}
                    label="Department"
                    value="Software Engineering"
                  />
                </div>
              )}

              {authUser.role === "teacher" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow
                    icon={<FiBook />}
                    label="Department"
                    value="Software Engineering"
                  />
                  <InfoRow
                    icon={<FiUser />}
                    label="Designation"
                    value="PHS Faculty"
                  />
                  <InfoRow label="Institute" value="University of Dhaka" />
                  <InfoRow label="Role Type" value="Teacher" />
                </div>
              )}

              {authUser.role === "staff" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow
                    icon={<FiBook />}
                    label="Department"
                    value="Software Engineering"
                  />
                  <InfoRow
                    icon={<FiUser />}
                    label="Designation"
                    value="PHS Staff"
                  />
                  <InfoRow label="Institute" value="University of Dhaka" />
                  <InfoRow label="Role Type" value="Staff" />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* SUMMARY */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border">
              <h2 className="text-xl font-bold mb-4">Account Summary</h2>

              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-xs text-blue-600">Role</p>
                  <p className="font-bold text-blue-800 capitalize">
                    {authUser.role}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-xs text-green-600">Status</p>
                  <p className="font-bold text-green-800 capitalize">
                    {authUser.status}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-xs text-purple-600">Verification</p>
                  <p className="font-bold text-purple-800">
                    {authUser.is_verified ? "Verified" : "Pending"}
                  </p>
                </div>
              </div>
            </div>

            {/* ID CARD */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-6 shadow-lg">
              <p className="text-gray-300 text-sm">AcademiX ID</p>
              <h3 className="text-2xl font-bold mt-2">{fullName}</h3>
              <p className="text-gray-300 text-sm mt-2">{authUser.email}</p>

              <div className="mt-5 border-t border-gray-700 pt-3 text-sm text-gray-300">
                IIT, University of Dhaka
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
