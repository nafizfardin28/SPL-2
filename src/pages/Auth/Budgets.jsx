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
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [budgetId, setBudgetId] = useState(null);

  const role = localStorage.getItem("role");

  const loadRequests = async () => {
    const data = await getAllBudgetRequests();
    const budgets = data.budgets || [];

    if (role === "teacher") {
      setRequests(
        budgets.filter((item) =>
          [
            "pending",
            "teacher_confirmed",
            "staff_verified",
            "approved",
            "rejected",
          ].includes(item.status),
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedBudget.title}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Budget Application Review
                  </p>
                </div>

                <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-semibold">
                  {selectedBudget.status}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Student Info */}
              <div>
                <h3 className="text-lg font-bold mb-3">Student Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-50 border rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase">Name</p>
                    <p className="font-semibold">
                      {selectedBudget.first_name} {selectedBudget.last_name}
                    </p>
                  </div>

                  <div className="bg-gray-50 border rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <p className="font-semibold break-all">
                      {selectedBudget.email}
                    </p>
                  </div>

                  <div className="bg-gray-50 border rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase">Roll</p>
                    <p className="font-semibold">
                      {selectedBudget.roll_no || "N/A"}
                    </p>
                  </div>

                  <div className="bg-gray-50 border rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase">
                      Registration
                    </p>
                    <p className="font-semibold">
                      {selectedBudget.reg_no || "N/A"}
                    </p>
                  </div>

                  <div className="bg-gray-50 border rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase">Batch</p>
                    <p className="font-semibold">
                      {selectedBudget.batch || "N/A"}
                    </p>
                  </div>

                  <div className="bg-gray-50 border rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase">Status</p>
                    <p className="font-semibold text-blue-700">
                      {selectedBudget.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget Info */}
              <div>
                <h3 className="text-lg font-bold mb-3">Budget Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs text-blue-600 uppercase">Category</p>
                    <p className="font-semibold">{selectedBudget.category}</p>
                  </div>

                  <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <p className="text-xs text-green-600 uppercase">
                      Requested Amount
                    </p>
                    <p className="font-bold text-green-700 text-xl">
                      ৳{selectedBudget.amount}
                    </p>
                  </div>
                </div>

                <div className="mt-3 bg-gray-50 border rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Purpose
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedBudget.purpose}
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-bold mb-3">Review Notes</h3>

                <div className="space-y-3">
                  <div className="border rounded-xl p-4">
                    <p className="font-semibold text-gray-800">Teacher Note</p>
                    <p className="text-gray-600 mt-1">
                      {selectedBudget.teacher_note ||
                        "No teacher note added yet."}
                    </p>
                  </div>

                  <div className="border rounded-xl p-4">
                    <p className="font-semibold text-gray-800">Staff Note</p>
                    <p className="text-gray-600 mt-1">
                      {selectedBudget.staff_note || "No staff note added yet."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Note */}
              {((role === "teacher" && selectedBudget.status === "pending") ||
                (role === "staff" &&
                  ["teacher_confirmed", "staff_verified"].includes(
                    selectedBudget.status,
                  ))) && (
                <div>
                  <h3 className="text-lg font-bold mb-2">
                    {role === "teacher"
                      ? "Teacher Action Note"
                      : "Staff Action Note"}
                  </h3>

                  <textarea
                    className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      role === "teacher"
                        ? "Write teacher note. Required if rejecting."
                        : "Write staff note. Required if rejecting."
                    }
                    rows="4"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              )}

              {/* Progress */}
              <div>
                <h3 className="text-lg font-bold mb-3">Application Progress</h3>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5"></div>
                    <div>
                      <p className="font-medium">Submitted</p>
                      <p className="text-sm text-gray-500">
                        Student submitted the budget application.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div
                      className={`w-3 h-3 rounded-full mt-1.5 ${
                        [
                          "teacher_confirmed",
                          "staff_verified",
                          "approved",
                          "rejected",
                        ].includes(selectedBudget.status)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium">Teacher Review</p>
                      <p className="text-sm text-gray-500">
                        {selectedBudget.status === "pending"
                          ? "Waiting for teacher decision."
                          : selectedBudget.status === "rejected" &&
                              selectedBudget.teacher_note
                            ? "Teacher rejected this application."
                            : "Teacher reviewed this application."}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div
                      className={`w-3 h-3 rounded-full mt-1.5 ${
                        ["staff_verified", "approved", "rejected"].includes(
                          selectedBudget.status,
                        )
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium">Staff Review</p>
                      <p className="text-sm text-gray-500">
                        {selectedBudget.status === "teacher_confirmed"
                          ? "Waiting for staff verification."
                          : selectedBudget.status === "staff_verified"
                            ? "Staff verified this application."
                            : selectedBudget.status === "approved"
                              ? "Staff approved this application."
                              : selectedBudget.status === "rejected" &&
                                  selectedBudget.staff_note
                                ? "Staff rejected this application."
                                : "Not reached yet."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t px-6 py-4 flex gap-2 flex-wrap justify-end">
              {role === "teacher" && selectedBudget.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      setShowModal(true);
                      setActionType("teacher_confirmed");
                      /*handleTeacherStatus(
                        selectedBudget.id,
                        "teacher_confirmed",
                      );*/
                      setBudgetId(selectedBudget.id);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Teacher Confirm
                  </button>

                  <button
                    onClick={
                      () => {
                        setShowModal(true);
                        setActionType("rejected");
                        setBudgetId(selectedBudget.id);
                      }
                      //handleTeacherStatus(selectedBudget.id, "rejected")
                    }
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Reject
                  </button>
                </>
              )}

              {role === "staff" &&
                selectedBudget.status === "teacher_confirmed" && (
                  <button
                    onClick={
                      () => {
                        setShowModal(true);
                        setActionType("staff_verified");
                        setBudgetId(selectedBudget.id);
                      }
                      // handleStaffStatus(selectedBudget.id, "staff_verified")
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Staff Verify
                  </button>
                )}

              {role === "staff" &&
                selectedBudget.status === "staff_verified" && (
                  <>
                    <button
                      onClick={() => {
                        setShowModal(true);
                        setActionType("approved");
                        setBudgetId(selectedBudget.id);
                        //handleStaffStatus(selectedBudget.id, "approved");
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Approve
                    </button>

                    <button
                      onClick={
                        () => {
                          setShowModal(true);
                          setActionType("rejected");
                          setBudgetId(selectedBudget.id);
                        }
                        //handleStaffStatus(selectedBudget.id, "rejected")
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Reject
                    </button>
                  </>
                )}

              <button
                onClick={closeModal}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl text-center">


            <p className="text-gray-600 mb-5">
              Are you sure you want to{" "}
              <span className="font-semibold text-blue-600">
                {actionType === "approved"
                  ? "approve"
                  : actionType === "rejected"
                    ? "reject"
                    : actionType === "teacher_confirmed"
                      ? "confirm"
                      : actionType === "staff_verified"
                        ? "verify"
                        : actionType}{" "}
              </span>{" "}
              this budget?
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={async () => {
                  if (role === "teacher") {
                    await handleTeacherStatus(budgetId, actionType);
                  } else {
                    await handleStaffStatus(budgetId, actionType);
                  }

                  setShowModal(false);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Yes, Confirm
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
