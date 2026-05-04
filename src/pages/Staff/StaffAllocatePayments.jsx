import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiEdit3,
  FiEye,
  FiFileText,
  FiUsers,
  FiX,
  FiAlertCircle,
  FiHash,
} from "react-icons/fi";

import {
  getStudentsByBatch,
  createSemesterFeeAllocation,
  getSemesterFeeAllocations,
  getAllocationStudents,
  extendSemesterFeeDeadline,
} from "../../utils/semesterFeeService";

export default function StaffAllocatePayments() {
  const [batches, setBatches] = useState({});
  const [allocations, setAllocations] = useState([]);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [allocationStudents, setAllocationStudents] = useState(null);

  const [extendAllocation, setExtendAllocation] = useState(null);
  const [newDueDate, setNewDueDate] = useState("");

  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    batch: "",
    semester: "",
    title: "",
    amount: "",
    dueDate: "",
  });

  const [pendingChange, setPendingChange] = useState(null);
  const [changingId, setChangingId] = useState(null);

  const batchOptions = [
    "BSSE 1st Year",
    "BSSE 2nd Year",
    "BSSE 3rd Year",
    "BSSE 4th Year",
    "MSSE 1st Year",
    "MSSE 2nd Year",
  ];

  const semesterOptions = [
    "1st Semester",
    "2nd Semester",
    "3rd Semester",
    "4th Semester",
    "5th Semester",
    "6th Semester",
    "7th Semester",
    "8th Semester",
  ];

  const getToken = () => {
    const auth = JSON.parse(localStorage.getItem("academix-auth") || "{}");
    return auth.token;
  };

  const loadData = async () => {
    const studentData = await getStudentsByBatch();
    const allocationData = await getSemesterFeeAllocations();

    setBatches(studentData.batches || {});
    setAllocations(allocationData.allocations || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();

    const data = await createSemesterFeeAllocation(form);
    setMessage(data.message || "Payment allocated successfully.");

    setForm({
      batch: "",
      semester: "",
      title: "",
      amount: "",
      dueDate: "",
    });

    loadData();
  };

  const handleViewStudents = async (allocation) => {
    const data = await getAllocationStudents(allocation.id);
    setSelectedAllocation(allocation);
    setAllocationStudents(data);
  };

  const handleExtendDeadline = async (e) => {
    e.preventDefault();

    const data = await extendSemesterFeeDeadline({
      allocationId: extendAllocation.id,
      dueDate: newDueDate,
    });

    setMessage(data.message || "Deadline extended successfully.");
    setExtendAllocation(null);
    setNewDueDate("");
    loadData();
  };

  const handleConfirmBatchChange = async (studentId, newBatch) => {
    if (!newBatch) return;

    setChangingId(studentId);

    try {
      const res = await fetch(
        `http://localhost:5000/api/semester-fees/students/${studentId}/change-batch`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ batch: newBatch }),
        }
      );

      const data = await res.json();

      setMessage(data.message || "Batch updated successfully.");
      setPendingChange(null);
      loadData();
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    } finally {
      setChangingId(null);
    }
  };

  const batchNames = Object.keys(batches);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">
                Staff Panel
              </p>
              <h1 className="mt-1 text-2xl font-bold md:text-3xl">
                Allocate Semester Payments
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-blue-100">
                Create semester fee allocations, view students by batch, and
                update student batches from one place.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
              <FiUsers className="text-2xl" />
              <div>
                <p className="text-xs text-blue-100">Total Batches</p>
                <p className="text-xl font-bold">{batchNames.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 shadow-sm">
            <div className="flex items-center gap-2">
              <FiCheckCircle />
              <span className="text-sm font-medium">{message}</span>
            </div>
            <button
              onClick={() => setMessage("")}
              className="rounded-full p-1 hover:bg-green-100"
            >
              <FiX />
            </button>
          </div>
        )}

        {/* Allocate Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <FiCreditCard />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Create New Fee Allocation
              </h2>
              <p className="text-sm text-slate-500">
                Select batch, semester, amount and deadline.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAllocate}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Batch
              </label>
              <select
                value={form.batch}
                onChange={(e) => setForm({ ...form, batch: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              >
                <option value="">Select Batch</option>
                {batchOptions.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Semester
              </label>
              <select
                value={form.semester}
                onChange={(e) =>
                  setForm({ ...form, semester: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              >
                <option value="">Select Semester</option>
                {semesterOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Fee Title
              </label>
              <input
                placeholder="Example: 6th Semester Fee"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Amount
              </label>
              <div className="relative">
                <FiHash className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="number"
                  placeholder="5000"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-10 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Due Date
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div className="flex items-end">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700">
                <FiCheckCircle />
                Allocate Payment
              </button>
            </div>
          </form>
        </div>

        {/* Students by Batch */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Students by Batch
            </h2>
            <p className="text-sm text-slate-500">
              Change student batch without browser confirmation popup.
            </p>
          </div>

          {batchNames.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <FiAlertCircle className="mx-auto mb-3 text-3xl text-slate-400" />
              <p className="font-semibold text-slate-700">
                No students found
              </p>
              <p className="text-sm text-slate-500">
                Students will appear here after they are loaded.
              </p>
            </div>
          )}

          {batchNames.map((batch) => (
            <div
              key={batch}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{batch}</h3>
                  <p className="text-sm text-slate-500">
                    {batches[batch]?.length || 0} students
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  <FiUsers />
                  Active Batch
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Student</th>
                      <th className="px-5 py-4">Roll</th>
                      <th className="px-5 py-4">Email</th>
                      <th className="px-5 py-4">Change Batch</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {batches[batch].map((student) => (
                      <tr
                        key={student.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                              {student.first_name?.charAt(0)}
                              {student.last_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {student.first_name} {student.last_name}
                              </p>
                              <p className="text-xs text-slate-500">
                                Current: {student.batch || batch}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-slate-100 px-3 py-1 font-medium text-slate-700">
                            {student.roll_no || "N/A"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {student.email}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-2">
                            <select
                              value={
                                pendingChange?.studentId === student.id
                                  ? pendingChange.newBatch
                                  : ""
                              }
                              disabled={changingId === student.id}
                              onChange={(e) =>
                                setPendingChange({
                                  studentId: student.id,
                                  newBatch: e.target.value,
                                })
                              }
                              className="max-w-xs rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                            >
                              <option value="">Select new batch</option>
                              {batchOptions
                                .filter((b) => b !== student.batch)
                                .map((b) => (
                                  <option key={b}>{b}</option>
                                ))}
                            </select>

                            {pendingChange?.studentId === student.id && (
                              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                <p className="mb-3 flex items-center gap-2 text-xs font-medium text-amber-700">
                                  <FiAlertCircle />
                                  Move this student to{" "}
                                  <span className="font-bold">
                                    {pendingChange.newBatch}
                                  </span>
                                  ?
                                </p>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleConfirmBatchChange(
                                        student.id,
                                        pendingChange.newBatch
                                      )
                                    }
                                    disabled={changingId === student.id}
                                    className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
                                  >
                                    {changingId === student.id
                                      ? "Saving..."
                                      : "Confirm Change"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setPendingChange(null)}
                                    className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-100"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}