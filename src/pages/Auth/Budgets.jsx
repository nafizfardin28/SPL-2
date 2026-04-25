import { useEffect, useState } from "react";
import {
  getAllBudgetRequests,
  updateTeacherBudgetStatus,
  updateStaffBudgetStatus,
} from "../../utils/budgetService";

export default function BudgetManagement() {
  const [requests, setRequests] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const role = localStorage.getItem("role");

  const loadRequests = async () => {
    const data = await getAllBudgetRequests();
    const budgets = data.budgets || [];

    if (role === "teacher") {
      setRequests(
        budgets.filter((item) =>
          ["pending", "teacher_confirmed", "rejected"].includes(item.status),
        ),
      );
      return;
    }

    if (role === "staff") {
      setRequests(
        budgets.filter((item) =>
          [
            "teacher_confirmed",
            "staff_verified",
            "approved",
            "rejected",
          ].includes(item.status),
        ),
      );
      return;
    }

    setRequests(budgets);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const closeModal = () => {
    setSelectedBudget(null);
    setNote("");
  };

  const handleTeacherStatus = async (id, status) => {
    if (status === "rejected" && !note.trim()) {
      setMessage("Teacher note is required when rejecting.");
      return;
    }

    const data = await updateTeacherBudgetStatus(id, status, note);
    setMessage(data.message || "Budget updated.");
    closeModal();
    loadRequests();
  };

  const handleStaffStatus = async (id, status) => {
    if (status === "rejected" && !note.trim()) {
      setMessage("Staff note is required when rejecting.");
      return;
    }

    const data = await updateStaffBudgetStatus(id, status, note);
    setMessage(data.message || "Budget updated.");
    closeModal();
    loadRequests();
  };

  const activeBudgets = requests.filter((item) => {
    if (role === "teacher") return item.status === "pending";
    if (role === "staff") {
      return ["teacher_confirmed", "staff_verified"].includes(item.status);
    }
    return !["approved", "rejected"].includes(item.status);
  });

  const approvedBudgets = requests.filter((item) => item.status === "approved");
  const rejectedBudgets = requests.filter((item) => item.status === "rejected");

  const renderBudgetRow = (item) => (
    <div
      key={item.id}
      className="bg-white shadow rounded-lg p-4 flex items-center justify-between"
    >
      <div>
        <h3 className="font-bold">{item.title}</h3>
        <p className="text-sm text-gray-600">
          Student: {item.first_name} {item.last_name}
        </p>
        <p className="text-sm text-gray-600">
          {item.category} | ৳{item.amount}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-blue-700">
          {item.status}
        </span>

        <button
          onClick={() => setSelectedBudget(item)}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Budget Management</h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
          {message}
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          {role === "teacher"
            ? "Pending Budget Applications"
            : "Active Budget Applications"}
        </h2>

        <div className="space-y-3">
          {activeBudgets.length === 0 && (
            <p className="text-gray-500">
              No active budget applications found.
            </p>
          )}

          {activeBudgets.map(renderBudgetRow)}
        </div>
      </section>

      {(role === "teacher" || role === "staff") && (
        <>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Approved Budgets</h2>

            <div className="space-y-3">
              {approvedBudgets.length === 0 && (
                <p className="text-gray-500">No approved budgets found.</p>
              )}

              {approvedBudgets.map(renderBudgetRow)}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Rejected Budgets</h2>

            <div className="space-y-3">
              {rejectedBudgets.length === 0 && (
                <p className="text-gray-500">No rejected budgets found.</p>
              )}

              {rejectedBudgets.map(renderBudgetRow)}
            </div>
          </section>
        </>
      )}

      {selectedBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">{selectedBudget.title}</h2>

            <div className="space-y-1">
              <p>
                <b>Student:</b> {selectedBudget.first_name}{" "}
                {selectedBudget.last_name}
              </p>
              <p>
                <b>Email:</b> {selectedBudget.email}
              </p>
              <p>
                <b>Roll:</b> {selectedBudget.roll_no || "N/A"}
              </p>
              <p>
                <b>Registration:</b> {selectedBudget.reg_no || "N/A"}
              </p>
              <p>
                <b>Batch:</b> {selectedBudget.batch || "N/A"}
              </p>
              <p>
                <b>Category:</b> {selectedBudget.category}
              </p>
              <p>
                <b>Amount:</b> ৳{selectedBudget.amount}
              </p>
              <p>
                <b>Status:</b> {selectedBudget.status}
              </p>
              <p>
                <b>Purpose:</b> {selectedBudget.purpose}
              </p>
            </div>

            {selectedBudget.teacher_note && (
              <p className="mt-3">
                <b>Teacher Note:</b> {selectedBudget.teacher_note}
              </p>
            )}

            {selectedBudget.staff_note && (
              <p className="mt-3">
                <b>Staff Note:</b> {selectedBudget.staff_note}
              </p>
            )}

            {((role === "teacher" && selectedBudget.status === "pending") ||
              (role === "staff" &&
                ["teacher_confirmed", "staff_verified"].includes(
                  selectedBudget.status,
                ))) && (
              <textarea
                className="w-full border p-2 rounded mt-4"
                placeholder={
                  role === "teacher"
                    ? "Write teacher note. Required if rejecting."
                    : "Write staff note. Required if rejecting."
                }
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            )}

            <div className="mt-5 flex gap-2 flex-wrap">
              {role === "teacher" && selectedBudget.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      handleTeacherStatus(
                        selectedBudget.id,
                        "teacher_confirmed",
                      )
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Teacher Confirm
                  </button>

                  <button
                    onClick={() =>
                      handleTeacherStatus(selectedBudget.id, "rejected")
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Reject
                  </button>
                </>
              )}

              {role === "staff" &&
                selectedBudget.status === "teacher_confirmed" && (
                  <button
                    onClick={() =>
                      handleStaffStatus(selectedBudget.id, "staff_verified")
                    }
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                  >
                    Staff Verify
                  </button>
                )}

              {role === "staff" &&
                selectedBudget.status === "staff_verified" && (
                  <>
                    <button
                      onClick={() =>
                        handleStaffStatus(selectedBudget.id, "approved")
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        handleStaffStatus(selectedBudget.id, "rejected")
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                      Reject
                    </button>
                  </>
                )}

              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
