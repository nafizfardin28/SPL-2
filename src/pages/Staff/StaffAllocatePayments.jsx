import { useEffect, useState } from "react";
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
    setMessage(data.message || "Payment allocated.");

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

    setMessage(data.message || "Deadline extended.");
    setExtendAllocation(null);
    setNewDueDate("");
    loadData();
  };

  const closeStudentsModal = () => {
    setSelectedAllocation(null);
    setAllocationStudents(null);
  };

  const batchNames = Object.keys(batches);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Allocate Semester Payments</h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
          {message}
        </div>
      )}

      <form
        onSubmit={handleAllocate}
        className="bg-white shadow rounded-lg p-5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Select Batch</label>
          <select
            className="border p-2 rounded w-full"
            value={form.batch}
            onChange={(e) => setForm({ ...form, batch: e.target.value })}
          >
            <option value="">Select Batch</option>
            {batchNames.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Semester</label>
          <select
            className="border p-2 rounded w-full"
            value={form.semester}
            onChange={(e) => setForm({ ...form, semester: e.target.value })}
          >
            <option value="">Select Semester</option>
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
            <option value="3rd Semester">3rd Semester</option>
            <option value="4th Semester">4th Semester</option>
            <option value="5th Semester">5th Semester</option>
            <option value="6th Semester">6th Semester</option>
            <option value="7th Semester">7th Semester</option>
            <option value="8th Semester">8th Semester</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Payment Title
          </label>
          <input
            className="border p-2 rounded w-full"
            placeholder="Example: 6th Semester Tuition Fee"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            placeholder="Example: 5000"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Payment Deadline
          </label>
          <input
            type="date"
            className="border p-2 rounded w-full"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded mt-6">
          Allocate Payment
        </button>
      </form>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Allocated Payments</h2>

        <div className="space-y-3">
          {allocations.length === 0 && (
            <p className="text-gray-500">No payment allocations found.</p>
          )}

          {allocations.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex-1">
                <h3 className="font-bold text-lg">{item.title}</h3>

                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                  <span>
                    <b>Batch:</b> {item.batch}
                  </span>

                  <span>
                    <b>Semester:</b> {item.semester}
                  </span>

                  <span>
                    <b>Amount:</b> ৳{item.amount}
                  </span>

                  <span>
                    <b>Deadline:</b>{" "}
                    {item.due_date ? item.due_date.slice(0, 10) : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  onClick={() => {
                    setExtendAllocation(item);
                    setNewDueDate(item.due_date?.slice(0, 10));
                  }}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                  Extend Deadline
                </button>

                <button
                  onClick={() => handleViewStudents(item)}
                  className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                >
                  Students Who Paid
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Students by Batch</h2>

        <div className="space-y-6">
          {batchNames.length === 0 && (
            <p className="text-gray-500">No students found.</p>
          )}

          {batchNames.map((batch) => (
            <div key={batch} className="bg-white shadow rounded-lg p-5">
              <h3 className="text-lg font-bold mb-3">{batch}</h3>

              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Name</th>
                      <th className="border p-2 text-left">Roll</th>
                      <th className="border p-2 text-left">Reg No</th>
                      <th className="border p-2 text-left">Email</th>
                    </tr>
                  </thead>

                  <tbody>
                    {batches[batch].map((student) => (
                      <tr key={student.id}>
                        <td className="border p-2">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="border p-2">
                          {student.roll_no || "N/A"}
                        </td>
                        <td className="border p-2">
                          {student.reg_no || "N/A"}
                        </td>
                        <td className="border p-2">{student.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      {extendAllocation && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form
            onSubmit={handleExtendDeadline}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Extend Deadline</h2>

            <p className="mb-2">
              <b>{extendAllocation.title}</b>
            </p>

            <p className="text-sm text-gray-600 mb-4">
              Current Deadline:{" "}
              {extendAllocation.due_date
                ? extendAllocation.due_date.slice(0, 10)
                : "N/A"}
            </p>

            <input
              type="date"
              className="w-full border p-2 rounded mb-4"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />

            <div className="flex gap-2">
              <button className="bg-orange-600 text-white px-4 py-2 rounded">
                Save New Deadline
              </button>

              <button
                type="button"
                onClick={() => {
                  setExtendAllocation(null);
                  setNewDueDate("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedAllocation && allocationStudents && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2">
              {selectedAllocation.title}
            </h2>

            <p className="mb-4 text-gray-600">
              Batch: {selectedAllocation.batch} | {selectedAllocation.semester}{" "}
              | Amount: ৳{selectedAllocation.amount}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h3 className="font-bold mb-3 text-green-700">
                  Paid Students ({allocationStudents.paidStudents.length})
                </h3>

                <div className="space-y-2">
                  {allocationStudents.paidStudents.length === 0 && (
                    <p className="text-gray-500">No students paid yet.</p>
                  )}

                  {allocationStudents.paidStudents.map((student) => (
                    <div
                      key={student.id}
                      className="border rounded p-3 bg-green-50"
                    >
                      <p className="font-semibold">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm">Roll: {student.roll_no}</p>
                      <p className="text-sm">
                        Transaction: {student.transaction_id}
                      </p>
                      <p className="text-sm">Method: {student.method}</p>
                      <p className="text-sm">
                        Paid At: {student.paid_at || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3 text-red-700">
                  Unpaid Students ({allocationStudents.unpaidStudents.length})
                </h3>

                <div className="space-y-2">
                  {allocationStudents.unpaidStudents.length === 0 && (
                    <p className="text-gray-500">No unpaid students.</p>
                  )}

                  {allocationStudents.unpaidStudents.map((student) => (
                    <div
                      key={student.id}
                      className="border rounded p-3 bg-red-50"
                    >
                      <p className="font-semibold">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm">Roll: {student.roll_no}</p>
                      <p className="text-sm">Email: {student.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={closeStudentsModal}
              className="mt-6 bg-gray-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
