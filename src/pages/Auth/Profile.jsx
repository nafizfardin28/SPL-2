import { useAuthUser } from "../../store/authstore";

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </span>
    <span className="mt-1 text-sm font-medium text-gray-800">
      {value || "N/A"}
    </span>
  </div>
);

const ProfilePage = () => {
  const authUser = useAuthUser();
  console.log(authUser);
  if (!authUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl bg-white p-8 shadow-md border border-gray-100">
          <p className="text-gray-600 text-lg">No user information found.</p>
        </div>
      </div>
    );
  }

  const fullName = `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl border border-gray-100">
          <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          <div className="relative px-6 pb-8 md:px-8">
            <div className="-mt-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-white text-3xl font-bold text-blue-700 shadow-lg">
                  {authUser.firstName?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="pt-12 md:pt-4">
                  <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                    {fullName || "User Name"}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">{authUser.email}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Institute of Information Technology, <br className="md:hidden" />
                    University of Dhaka
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 capitalize">
                  {authUser.role}
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                    authUser.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {authUser.status}
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    authUser.isVerified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {authUser.is_verified ? "Verified" : "Not Verified"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          <div className="space-y-8 lg:col-span-2">

            <div className="rounded-3xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Personal Information
                </h2>
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow label="First Name" value={authUser.firstName} />
                <InfoRow label="Last Name" value={authUser.lastName} />
                <InfoRow label="Email" value={authUser.email} />
                <InfoRow label="Phone" value={authUser.phone} />
                <InfoRow label="Role" value={authUser.role} />
                <InfoRow label="Account Status" value={authUser.status} />
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Role Information
                </h2>
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
              </div>

              {authUser.role === "student" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoRow label="Batch" value={authUser.batch} />
                  <InfoRow label="Roll No" value={authUser.rollNo} />
                  <InfoRow label="Registration No" value={authUser.regNo} />
                  <InfoRow label="Department" value="Software Engineering" />
                </div>
              )}

              {authUser.role === "teacher" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoRow label="Department" value="Software Engineering" />
                  <InfoRow label="Designation" value="PHS Faculty" />
                  <InfoRow label="Institute" value="University of Dhaka" />
                  <InfoRow label="Role Type" value="Teacher" />
                </div>
              )}

              {authUser.role === "staff" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoRow label="Department" value="Software Engineering" />
                  <InfoRow label="Designation" value="PHS Staff" />
                  <InfoRow label="Institute" value="University of Dhaka" />
                  <InfoRow label="Role Type" value="Staff" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">

            <div className="rounded-3xl bg-white p-6 shadow-lg border border-gray-100">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Account Summary
              </h2>

              <div className="space-y-4">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Current Role
                  </p>
                  <p className="mt-1 text-lg font-bold text-blue-800 capitalize">
                    {authUser.role}
                  </p>
                </div>

                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                    Approval Status
                  </p>
                  <p className="mt-1 text-lg font-bold text-green-800 capitalize">
                    {authUser.status}
                  </p>
                </div>

                <div className="rounded-2xl bg-purple-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                    Verification
                  </p>
                  <p className="mt-1 text-lg font-bold text-purple-800">
                    {authUser.is_verified ? "Verified Account" : "Pending Verification"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-lg">
              <p className="text-sm text-gray-300">AcademiX Identity</p>
              <h3 className="mt-2 text-2xl font-bold">{fullName}</h3>
              <p className="mt-2 text-sm text-gray-300">{authUser.email}</p>
              <div className="mt-6 border-t border-gray-700 pt-4 text-sm text-gray-300">
                <p>Institute of Information Technology</p>
                <p>University of Dhaka</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;