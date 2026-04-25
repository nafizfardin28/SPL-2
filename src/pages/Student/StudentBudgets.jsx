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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{selectedBudget.title}</h2>

            <p>
              <b>Category:</b> {selectedBudget.category}
            </p>
            <p>
              <b>Amount:</b> ৳{selectedBudget.amount}
            </p>
            <p>
              <b>Status:</b> {selectedBudget.status}
            </p>
            <p className="mt-2">
              <b>Purpose:</b> {selectedBudget.purpose}
            </p>

            {selectedBudget.teacher_note && (
              <p className="mt-2">
                <b>Teacher Note:</b> {selectedBudget.teacher_note}
              </p>
            )}

            {selectedBudget.staff_note && (
              <p className="mt-2">
                <b>Staff Note:</b> {selectedBudget.staff_note}
              </p>
            )}

            {selectedBudget.admin_note && (
              <p className="mt-2">
                <b>Admin Note:</b> {selectedBudget.admin_note}
              </p>
            )}

            <button
              onClick={() => setSelectedBudget(null)}
              className="mt-5 bg-red-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
