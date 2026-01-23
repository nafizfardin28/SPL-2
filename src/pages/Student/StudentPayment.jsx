import { useState } from "react";

export default function Payments() {
  const [dueAmount, setDueAmount] = useState(12000);
  const [status, setStatus] = useState("Pending");
  const [history, setHistory] = useState([
    {
      date: "12 Jan 2025",
      semester: "1st Semester",
      amount: 12000,
      status: "Paid",
    },
    {
      date: "15 Aug 2024",
      semester: "2nd Semester",
      amount: 12000,
      status: "Paid",
    },
  ]);

  const handlePayNow = () => {
    // simulate payment
    setStatus("Paid");
    setDueAmount(0);

    setHistory([
      {
        date: "20 Feb 2025",
        semester: "Spring 2025",
        amount: 12000,
        status: "Paid",
      },
      ...history,
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-semibold">Payments</h1>

      {/* Current Semester */}
      <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Spring 2025</h2>
          <p className="text-gray-500">Semester Fee</p>
        </div>

        <div className="text-right">
          <p className="text-xl font-bold text-red-600">৳ {dueAmount}</p>
          <span
            className={`text-sm px-3 py-1 rounded-full ${
              status === "Paid"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {status}
          </span>
          {status === "Pending" && (
            <div className="text-right">
              <button
                onClick={handlePayNow}
                className="my-2  px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Pay Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pay Button */}

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Payment History</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Date</th>
              <th>Semester</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Pay Slip</th>
            </tr>
          </thead>

          <tbody>
            {history.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{item.date}</td>
                <td>{item.semester}</td>
                <td>৳ {item.amount}</td>
                <td className="text-green-600 font-medium">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
