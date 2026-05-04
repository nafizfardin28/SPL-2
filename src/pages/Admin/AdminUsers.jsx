import { useEffect, useMemo, useState } from "react";
import { FiTrash2, FiEye } from "react-icons/fi";

import {
  getAdminUsers,
  approveUser,
  deleteUserById,
} from "../../api/authService";

const roleOptions = ["student", "teacher", "staff"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingRoleMap, setPendingRoleMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedActionUserId, setSelectedActionUserId] = useState(null);
  const loadUsers = async () => {
    setError("");
    const res = await getAdminUsers();

    if (!res.ok) {
      setError(res.message || "Failed to load users.");
      return;
    }

    const fetchedUsers = res.users || [];
    setUsers(fetchedUsers);

    const defaults = {};
    fetchedUsers.forEach((user) => {
      if (user.status === "pending") {
        defaults[user.id] = user.role || "student";
      }
    });
    setPendingRoleMap(defaults);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const verifiedUsers = useMemo(() => {
    return users.filter(
      (user) => Number(user.is_verified) === 1 && user.status === "pending",
    );
  }, [users]);

  const approvedUsers = useMemo(() => {
    return users.filter((user) => user.status === "approved");
  }, [users]);

  const summary = useMemo(() => {
    return {
      verified: verifiedUsers.length,
      approved: approvedUsers.length,
    };
  }, [verifiedUsers, approvedUsers]);

  const handleApprove = async (userId) => {
    setError("");
    setSuccess("");

    const role = pendingRoleMap[userId] || "student";

    const res = await approveUser({ id: userId, role });

    if (!res.ok) {
      setError(res.message || "Failed to approve user.");
      return;
    }

    setSuccess(res.message || "User approved successfully.");
    loadUsers();
  };

  const handleDelete = async (userId) => {
    setError("");
    setSuccess("");

    const res = await deleteUserById(userId);

    if (!res.ok) {
      setError(res.message || "Failed to delete user.");
      return;
    }

    setSuccess(res.message || "User deleted successfully.");
    loadUsers();
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <h1 className="text-2xl font-semibold">User & Role Management</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Verified Users</p>
          <p className="text-2xl font-bold">{summary.verified}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Approved Users</p>
          <p className="text-2xl font-bold">{summary.approved}</p>
        </div>
      </div>

      {/* VERIFIED USERS */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Verified Users</h2>
          <p className="text-sm text-gray-500">
            Users who verified OTP but are waiting for admin approval.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Assign Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {verifiedUsers.length === 0 ? (
              <tr>
                <td className="p-4 text-gray-500" colSpan="6">
                  No verified users waiting for approval.
                </td>
              </tr>
            ) : (
              verifiedUsers.map((user) => (
                <tr key={user.id} className="border-t text-sm">
                  <td className="p-3">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.phone}</td>
                  <td className="p-3">
                    <select
                      value={pendingRoleMap[user.id] || "student"}
                      onChange={(e) =>
                        setPendingRoleMap((prev) => ({
                          ...prev,
                          [user.id]: e.target.value,
                        }))
                      }
                      className="border rounded px-3 py-2"
                    >
                      {roleOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 capitalize">{user.status}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setActionType("Approve");
                          setSelectedActionUserId(user.id);
                        }}
                        className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1 rounded border hover:bg-gray-100"
                        title="Details"
                      >
                        <FiEye size={10} />
                      </button>

                      <button
                        onClick={() => {
                          setShowModal(true);
                          setActionType("Delete");
                          setSelectedActionUserId(user.id);
                        }}
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Approved Users</h2>
          <p className="text-sm text-gray-500">
            Users already approved and assigned a role.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Phone</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {approvedUsers.length === 0 ? (
              <tr>
                <td className="p-4 text-gray-500" colSpan="6">
                  No approved users found.
                </td>
              </tr>
            ) : (
              approvedUsers.map((user) => (
                <tr key={user.id} className="border-t text-sm hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800">
                    {user.first_name} {user.last_name}
                  </td>

                  <td className="p-3 text-gray-600">{user.email}</td>
                  <td className="p-3 text-gray-600">{user.phone}</td>

                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        user.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="rounded-full p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setShowModal(true);
                          setActionType("Delete");
                          setSelectedActionUserId(user.id);
                        }}
                        className="rounded-full p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                        title="Delete User"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold">User Details</h3>
                  <p className="mt-1 text-sm text-blue-100">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-full bg-white/20 px-3 py-1 text-xl hover:bg-white/30"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Info
                  label="Name"
                  value={`${selectedUser.first_name} ${selectedUser.last_name}`}
                />
                <Info label="Email" value={selectedUser.email} />
                <Info label="Phone" value={selectedUser.phone} />
                <Info label="Role" value={selectedUser.role} />
                <Info label="Status" value={selectedUser.status} />
                <Info
                  label="Verified"
                  value={Number(selectedUser.is_verified) === 1 ? "Yes" : "No"}
                />
                <Info
                  label="Registration No"
                  value={selectedUser.reg_no || "N/A"}
                />
                <Info label="Roll No" value={selectedUser.roll_no || "N/A"} />
                <Info label="Batch" value={selectedUser.batch || "N/A"} />
                <Info label="Created At" value={selectedUser.created_at} />
                <Info label="Updated At" value={selectedUser.updated_at} />
              </div>
            </div>

            <div className="flex justify-end border-t bg-gray-50 p-5">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showModal && actionType === "Approve" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Approval</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to approve this user?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setActionType("");
                  setSelectedActionUserId(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
                type="button"
              >
                No
              </button>

              <button
                onClick={() => {
                  handleApprove(selectedActionUserId);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                type="button"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {showModal && actionType === "Delete" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setActionType("");
                  setSelectedActionUserId(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
                type="button"
              >
                No
              </button>

              <button
                onClick={() => handleDelete(selectedActionUserId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                type="button"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}
const Info = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className="mt-2 break-words text-sm font-semibold text-gray-800">
      {value || "N/A"}
    </p>
  </div>
);
