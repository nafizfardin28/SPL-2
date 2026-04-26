import { useEffect, useState } from "react";
import {
  createBudgetRequest,
  getMyBudgetRequests,
} from "../../utils/budgetService";

export default function BudgetRequests() {
  const [form, setForm] = useState({
    title: "",
    category: "",
    amount: "",
    purpose: "",
  });

  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [message, setMessage] = useState("");

  const loadBudgets = async () => {
    const data = await getMyBudgetRequests();
    setBudgets(data.budgets || []);
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = await createBudgetRequest(form);
    setMessage(data.message || "Budget request submitted successfully.");

    setForm({
      title: "",
      category: "",
      amount: "",
      purpose: "",
    });

    loadBudgets();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Budget Application</h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-5 mb-8 space-y-4"
      >
        <input
          className="w-full border p-2 rounded"
          placeholder="Budget Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <select
          className="w-full border p-2 rounded"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Select Category</option>
          <option value="Seminar">Seminar</option>
          <option value="Workshop">Workshop</option>
          <option value="Research">Research</option>
          <option value="Programming Contest">Programming Contest</option>
          <option value="Cultural Event">Cultural Event</option>
          <option value="Sports">Sports</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="number"
          className="w-full border p-2 rounded"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Purpose"
          rows="4"
          value={form.purpose}
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit Application
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">My Budget Applications</h2>

      <div className="space-y-3">
        {budgets.length === 0 && (
          <p className="text-gray-500">No budget applications found.</p>
        )}

        {budgets.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <h3 className="font-bold">{item.title}</h3>
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
                className="bg-blue-800 text-white px-4 py-2 rounded"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedBudget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedBudget.title}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Budget Application Details
                  </p>
                </div>

                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                  {selectedBudget.status}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <p className="text-xs text-gray-500 uppercase">Category</p>
                  <p className="font-semibold mt-1">
                    {selectedBudget.category}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border">
                  <p className="text-xs text-gray-500 uppercase">Amount</p>
                  <p className="font-semibold mt-1 text-green-700">
                    ৳{selectedBudget.amount}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border">
                  <p className="text-xs text-gray-500 uppercase">
                    Current Status
                  </p>
                  <p className="font-semibold mt-1">{selectedBudget.status}</p>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Purpose / Reason
                </h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-gray-700 leading-relaxed">
                  {selectedBudget.purpose}
                </div>
              </div>

              {/* Workflow Notes */}
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Review Notes</h3>

                <div className="space-y-3">
                  <div className="border rounded-xl p-3">
                    <p className="text-sm font-semibold text-gray-700">
                      Teacher Review
                    </p>
                    <p className="text-gray-600 mt-0">
                      {selectedBudget.teacher_note ||
                        "No teacher note added yet."}
                    </p>
                  </div>

                  <div className="border rounded-xl p-3">
                    <p className="text-sm font-semibold text-gray-700">
                      Staff Review
                    </p>
                    <p className="text-gray-600 mt-0">
                      {selectedBudget.staff_note || "No staff note added yet."}
                    </p>
                  </div>

                  {selectedBudget.admin_note && (
                    <div className="border rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-700">
                        Admin Review
                      </p>
                      <p className="text-gray-600 mt-1">
                        {selectedBudget.admin_note}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">
                  Application Progress
                </h3>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5"></div>
                    <div>
                      <p className="font-medium">Submitted by Student</p>
                      <p className="text-sm text-gray-500">
                        Application has been submitted successfully.
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
                        {selectedBudget.teacher_note
                          ? "Teacher has reviewed this application."
                          : "Waiting for teacher review."}
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
                        {selectedBudget.staff_note
                          ? "Staff has reviewed this application."
                          : "Waiting for staff review."}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div
                      className={`w-3 h-3 rounded-full mt-1.5 ${
                        selectedBudget.status === "approved"
                          ? "bg-green-500"
                          : selectedBudget.status === "rejected"
                            ? "bg-red-500"
                            : "bg-gray-300"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium">Final Decision</p>
                      <p className="text-sm text-gray-500">
                        {selectedBudget.status === "approved"
                          ? "Budget application has been approved."
                          : selectedBudget.status === "rejected"
                            ? "Budget application has been rejected."
                            : "Final decision is pending."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <button
                onClick={() => setSelectedBudget(null)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg"
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
