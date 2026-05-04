import { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiEye,
  FiTrash2,
  FiEdit3,
  FiX,
  FiClock,
} from "react-icons/fi";

import {
  getSemesterFeeAllocations,
  getAllocationStudents,
  extendSemesterFeeDeadline,
  deleteSemesterFeeAllocation,
} from "../../utils/semesterFeeService";

export default function AdminSemesterPayments() {
  const [allocations, setAllocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState(null);

  const [extendAllocation, setExtendAllocation] = useState(null);
  const [newDueDate, setNewDueDate] = useState("");

  const [deleteAllocation, setDeleteAllocation] = useState(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const data = await getSemesterFeeAllocations();

      console.log("Admin semester allocations:", data);
      console.log("Fetched allocations:", data.allocations);

      setAllocations(data.allocations || []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load semester payments.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    const d = new Date(date);

    return d.toLocaleDateString("en-CA", {
      timeZone: "Asia/Dhaka",
    });
  };

  const isExpired = (date) => {
    if (!date) return false;

    const today = new Date();
    const dhakaToday = new Date(
      today.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }),
    );

    const deadline = new Date(
      new Date(date).toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }),
    );

    return dhakaToday > deadline;
  };

  const active = allocations.filter((a) => !isExpired(a.due_date));
  const expired = allocations.filter((a) => isExpired(a.due_date));

  const handleView = async (item) => {
    try {
      const res = await getAllocationStudents(item.id);
      setSelected(item);
      setStudents(res);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load students.");
    }
  };

  const handleDelete = async () => {
    if (!deleteAllocation) return;

    try {
      const data = await deleteSemesterFeeAllocation(deleteAllocation.id);
      setMessage(data.message || "Payment allocation deleted.");

      setAllocations((prev) =>
        prev.filter((item) => item.id !== deleteAllocation.id),
      );

      setDeleteAllocation(null);
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete payment allocation.");
    }
  };
  const handleExtend = async (e) => {
    e.preventDefault();

    try {
      const data = await extendSemesterFeeDeadline({
        allocationId: extendAllocation.id,
        dueDate: newDueDate,
      });

      setMessage(data.message || "Deadline extended successfully.");

      setExtendAllocation(null);
      setNewDueDate("");

      // 🔥 FORCE fresh reload (IMPORTANT)
      setAllocations([]); // clear old state
      await load(); // fetch new data
    } catch (err) {
      console.error(err);
      setMessage("Failed to extend deadline.");
    }
  };

  function Section({ title, items, expiredSection }) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>

          <span className="text-sm font-semibold text-gray-500 bg-white border px-3 py-1 rounded-full">
            {items.length} payment{items.length !== 1 ? "s" : ""}
          </span>
        </div>

        {items.length === 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            No payments found.
          </div>
        )}

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-sm hover:shadow-lg transition"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-lg text-gray-900">
                    {item.title}
                  </h3>

                  {expiredSection ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full">
                      <FiAlertCircle />
                      Expired
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full">
                      <FiCheckCircle />
                      Active
                    </span>
                  )}

                  {item.previous_due_date && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full">
                      <FiClock />
                      Extended
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600">
                  {item.batch} | {item.semester} | ৳{item.amount}
                </p>

                {item.previous_due_date && (
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <FiCalendar />
                    Previous Deadline: {formatDate(item.previous_due_date)}
                  </p>
                )}

                <p
                  className={`text-sm flex items-center gap-1 font-semibold ${
                    expiredSection ? "text-red-600" : "text-green-700"
                  }`}
                >
                  <FiCalendar />
                  Current Deadline: {formatDate(item.due_date)}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleView(item)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 text-sm font-semibold transition"
                >
                  <FiEye />
                  Students Who Paid
                </button>

                {!expiredSection && (
                  <>
                    <button
                      onClick={() => {
                        setExtendAllocation(item);
                        setNewDueDate(formatDate(item.due_date));
                      }}
                      className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 text-sm font-semibold transition"
                    >
                      <FiEdit3 />
                      Extend Deadline
                    </button>

                    <button
                      onClick={() => setDeleteAllocation(item)}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 text-sm font-semibold transition"
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-8">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-900">
          Semester Payments Admin
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage semester fee allocations, deadlines, and payment records.
        </p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 text-sm font-semibold flex items-center gap-2">
          <FiCheckCircle />
          {message}
        </div>
      )}

      <Section title="Active Payments" items={active} expiredSection={false} />
      <Section title="Expired Payments" items={expired} expiredSection={true} />

      {selected && students && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-2xl font-bold">{selected.title}</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {selected.batch} | {selected.semester} | ৳{selected.amount}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelected(null);
                  setStudents(null);
                }}
                className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <FiX />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-green-700 font-bold mb-3 flex items-center gap-2">
                  <FiCheckCircle />
                  Paid Students ({students.paidStudents.length})
                </h3>

                <div className="space-y-3">
                  {students.paidStudents.length === 0 && (
                    <p className="text-gray-500">No students paid yet.</p>
                  )}

                  {students.paidStudents.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-2xl bg-green-50 border border-green-100 p-4 shadow-sm"
                    >
                      <p className="font-semibold">
                        {s.first_name} {s.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Roll: {s.roll_no || "N/A"}
                      </p>
                      <p className="text-sm text-green-700 font-medium">
                        TRX: {s.transaction_id || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-red-700 font-bold mb-3 flex items-center gap-2">
                  <FiAlertCircle />
                  Unpaid Students ({students.unpaidStudents.length})
                </h3>

                <div className="space-y-3">
                  {students.unpaidStudents.length === 0 && (
                    <p className="text-gray-500">No unpaid students.</p>
                  )}

                  {students.unpaidStudents.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-2xl bg-red-50 border border-red-100 p-4 shadow-sm"
                    >
                      <p className="font-semibold">
                        {s.first_name} {s.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Roll: {s.roll_no || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelected(null);
                setStudents(null);
              }}
              className="mt-6 bg-gray-900 text-white px-5 py-2.5 rounded-2xl font-semibold hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {extendAllocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleExtend}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiEdit3 className="text-orange-600" />
                Extend Deadline
              </h2>

              <button
                type="button"
                onClick={() => {
                  setExtendAllocation(null);
                  setNewDueDate("");
                }}
                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <FiX />
              </button>
            </div>

            <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 mb-4">
              <p className="font-bold">{extendAllocation.title}</p>
              <p className="text-sm text-gray-600 mt-1">
                Current Deadline: {formatDate(extendAllocation.due_date)}
              </p>
            </div>

            <label className="text-sm font-semibold text-gray-700">
              New Deadline
            </label>
            <input
              type="date"
              className="w-full border border-gray-200 p-3 rounded-2xl mt-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              required
            />

            <div className="flex gap-2">
              <button className="flex-1 bg-orange-600 text-white px-4 py-3 rounded-2xl font-semibold hover:bg-orange-700">
                Save Deadline
              </button>

              <button
                type="button"
                onClick={() => {
                  setExtendAllocation(null);
                  setNewDueDate("");
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-2xl font-semibold hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteAllocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <FiAlertCircle />
                Confirm Delete
              </h2>

              <button
                onClick={() => setDeleteAllocation(null)}
                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <FiX />
              </button>
            </div>

            <div className="rounded-2xl bg-red-50 border border-red-100 p-4 mb-4">
              <p className="font-bold text-gray-900">
                {deleteAllocation.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Batch: {deleteAllocation.batch} | {deleteAllocation.semester}
              </p>
              <p className="text-sm text-red-600 mt-2">
                Are you sure you want to delete this running payment allocation?
              </p>
              <p className="text-sm text-red-600 mt-1">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-2xl font-semibold hover:bg-red-700"
              >
                Delete Payment
              </button>

              <button
                onClick={() => setDeleteAllocation(null)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-2xl font-semibold hover:bg-gray-200"
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
