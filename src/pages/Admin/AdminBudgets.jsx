import { useEffect, useState } from "react";
import {
  getAllBudgetRequests,
  teacherConfirmBudget,
  staffVerifyBudget,
  finalBudgetStatus,
} from "../../api/budgetApi";

export default function BudgetManagement() {
  const [requests, setRequests] = useState([]);
  const [note, setNote] = useState("");

  const role = localStorage.getItem("role");

  const loadRequests = async () => {
    const data = await getAllBudgetRequests();
    setRequests(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleTeacherConfirm = async (id) => {
    await teacherConfirmBudget(id, note);
    setNote("");
    loadRequests();
  };

  const handleStaffVerify = async (id) => {
    await staffVerifyBudget(id, note);
    setNote("");
    loadRequests();
  };

  const handleFinal = async (id, status) => {
    await finalBudgetStatus(id, status, note);
    setNote("");
    loadRequests();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Budget Management</h1>

      <textarea
        className="w-full border p-2 rounded mb-5"
        placeholder="Write note before action"
        rows="3"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="space-y-4">
        {requests.map((item) => (
          <div key={item.id} className="bg-white shadow rounded-lg p-5">
            <div className="flex justify-between">
              <div>
                <h2 className="text-lg font-bold">{item.title}</h2>
                <p>
                  Student: {item.first_name} {item.last_name}
                </p>
                <p>Email: {item.email}</p>
                <p>Roll: {item.roll_no || "N/A"}</p>
                <p>Registration: {item.reg_no || "N/A"}</p>
              </div>

              <span className="font-semibold text-blue-700">{item.status}</span>
            </div>

            <div className="mt-3">
              <p>Category: {item.category}</p>
              <p>Amount: ৳{item.amount}</p>
              <p>Purpose: {item.purpose}</p>
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              {(role === "teacher" || role === "superadmin") &&
                item.status === "pending" && (
                  <button
                    onClick={() => handleTeacherConfirm(item.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Teacher Confirm
                  </button>
                )}

              {(role === "staff" || role === "superadmin") &&
                item.status === "teacher_confirmed" && (
                  <button
                    onClick={() => handleStaffVerify(item.id)}
                    className="bg-purple-600 text-white px-3 py-1 rounded"
                  >
                    Staff Verify
                  </button>
                )}

              {role === "superadmin" && item.status === "staff_verified" && (
                <>
                  <button
                    onClick={() => handleFinal(item.id, "approved")}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleFinal(item.id, "rejected")}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
