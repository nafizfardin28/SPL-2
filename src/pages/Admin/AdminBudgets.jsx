import { useEffect, useState } from "react";
import { FiTrash2, FiEye } from "react-icons/fi";
import {
  getAllBudgetRequests,
  updateTeacherBudgetStatus,
  updateStaffBudgetStatus,
  deleteBudgetRequest,
} from "../../utils/budgetService";

export default function AdminBudgetManagement() {
  const [requests, setRequests] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const role = localStorage.getItem("role");

  const loadRequests = async () => {
    const data = await getAllBudgetRequests();
    setRequests(data.budgets || []);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleTeacherConfirm = async (id) => {
    await updateTeacherBudgetStatus(id, "teacher_confirmed", note);
    setNote("");
    loadRequests();
  };

  const handleStaffVerify = async (id) => {
    await updateStaffBudgetStatus(id, "staff_verified", note);
    setNote("");
    loadRequests();
  };

  const handleFinal = async (id, status) => {
    await updateStaffBudgetStatus(id, status, note);
    setNote("");
    loadRequests();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const result = await deleteBudgetRequest(deleteTarget.id);

    if (!result.ok) {
      setMessage(result.message || "Failed to delete budget.");
      return;
    }

    setMessage("Budget deleted successfully.");
    setDeleteTarget(null);
    loadRequests();
  };

  const pendingBudgets = requests.filter(
    (item) =>
      item.status === "pending" ||
      item.status === "teacher_confirmed" ||
      item.status === "staff_verified",
  );

  const approvedBudgets = requests.filter((item) => item.status === "approved");
  const rejectedBudgets = requests.filter((item) => item.status === "rejected");

  const BudgetRow = ({ item }) => (
    <div className="rounded-2xl bg-white p-5 shadow border border-gray-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>

          <p className="mt-1 text-sm text-gray-600">
            {item.first_name} {item.last_name} • {item.email}
          </p>

          <p className="mt-1 text-sm text-gray-600">
            {item.category} • ৳{item.amount}
          </p>

          <span
            className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              item.status === "approved"
                ? "bg-green-100 text-green-700"
                : item.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {item.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            onClick={() => setSelectedBudget(item)}
            className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
            title="Details"
          >
            <FiEye size={10} />
          </button>

          <button
            onClick={() => setDeleteTarget(item)}
            className="flex items-center justify-center rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 transition"
            title="Delete"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const Section = ({ title, items }) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-5 text-sm text-gray-500 shadow border">
          No budgets found.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <BudgetRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl bg-white p-6 shadow border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">
            Budget Management
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Review, approve, reject, and manage student budget applications.
          </p>
        </div>

        {message && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <Section title="Pending Budgets" items={pendingBudgets} />
        <Section title="Approved Budgets" items={approvedBudgets} />
        <Section title="Rejected Budgets" items={rejectedBudgets} />

        {selectedBudget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedBudget.title}
                    </h2>
                    <p className="mt-1 text-sm text-blue-100">
                      Budget Application Details
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedBudget(null)}
                    className="rounded-full bg-white/20 px-3 py-1 text-xl hover:bg-white/30"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Info
                    label="Student"
                    value={`${selectedBudget.first_name} ${selectedBudget.last_name}`}
                  />
                  <Info label="Email" value={selectedBudget.email} />
                  <Info label="Roll No" value={selectedBudget.roll_no} />
                  <Info label="Registration No" value={selectedBudget.reg_no} />
                  <Info label="Batch" value={selectedBudget.batch} />
                  <Info label="Status" value={selectedBudget.status} />
                  <Info label="Category" value={selectedBudget.category} />
                  <Info label="Amount" value={`৳${selectedBudget.amount}`} />
                </div>

                <div className="rounded-2xl bg-gray-50 border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Purpose
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    {selectedBudget.purpose || "N/A"}
                  </p>
                </div>

                <textarea
                  className="w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write note before action"
                  rows="3"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                  {(role === "teacher" || role === "superadmin") &&
                    selectedBudget.status === "pending" && (
                      <button
                        onClick={() => handleTeacherConfirm(selectedBudget.id)}
                        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        Teacher Confirm
                      </button>
                    )}

                  {(role === "staff" || role === "superadmin") &&
                    selectedBudget.status === "teacher_confirmed" && (
                      <button
                        onClick={() => handleStaffVerify(selectedBudget.id)}
                        className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                      >
                        Staff Verify
                      </button>
                    )}

                  {role === "superadmin" &&
                    selectedBudget.status === "staff_verified" && (
                      <>
                        <button
                          onClick={() =>
                            handleFinal(selectedBudget.id, "approved")
                          }
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            handleFinal(selectedBudget.id, "rejected")
                          }
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}

                  <button
                    onClick={() => setSelectedBudget(null)}
                    className="rounded-xl bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                Confirm Delete
              </h2>

              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteTarget.title}</span>?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const Info = ({ label, value }) => (
  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className="mt-2 text-sm font-semibold text-gray-800 break-words">
      {value || "N/A"}
    </p>
  </div>
);
