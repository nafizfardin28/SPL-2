import { useEffect, useState } from "react";
import {
  getStudentSemesterFees,
  sandboxPaySemesterFee,
} from "../../utils/semesterFeeService";

export default function StudentSemesterFees() {
  const [fees, setFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("details");

  const [paymentForm, setPaymentForm] = useState({
    method: "bkash",
    mobileNumber: "",
    otp: "",
  });

  const loadFees = async () => {
    const data = await getStudentSemesterFees();
    setFees(data.fees || []);
  };

  useEffect(() => {
    loadFees();
  }, []);

  const isDeadlinePassed = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(dueDate);
    deadline.setHours(0, 0, 0, 0);

    return today > deadline;
  };

  const openPaymentModal = (fee) => {
    setSelectedFee(fee);
    setStep("details");
    setPaymentForm({
      method: "bkash",
      mobileNumber: "",
      otp: "",
    });
  };

  const closeModal = () => {
    setSelectedFee(null);
    setStep("details");
    setPaymentForm({
      method: "bkash",
      mobileNumber: "",
      otp: "",
    });
  };

  const handleNextToOtp = (e) => {
    e.preventDefault();

    if (!paymentForm.mobileNumber.trim()) {
      setMessage("Mobile number is required.");
      return;
    }

    setMessage("");
    setStep("otp");
  };

  const handlePay = async (e) => {
    e.preventDefault();

    if (!paymentForm.otp.trim()) {
      setMessage("Sandbox OTP is required.");
      return;
    }

    setStep("processing");

    try {
      const data = await sandboxPaySemesterFee({
        allocationId: selectedFee.id,
        method: paymentForm.method,
        mobileNumber: paymentForm.mobileNumber,
        otp: paymentForm.otp,
      });

      setTimeout(() => {
        setMessage(data.message || "Payment successful.");
        setStep("success");
        loadFees();
      }, 1200);
    } catch (error) {
      setMessage(error.message || "Payment failed.");
      setStep("otp");
    }
  };

  const getMethodLabel = (method) => {
    if (method === "bkash") return "bKash";
    if (method === "nagad") return "Nagad";
    if (method === "rocket") return "Rocket";
    return method;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Semester Fees</h1>

      <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700">
        SandGate Sandbox OTP: <b>123456</b>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
          {message}
        </div>
      )}

      <div className="space-y-3">
        {fees.length === 0 && (
          <p className="text-gray-500">No semester fees allocated.</p>
        )}

        {fees.map((fee) => (
          <div
            key={fee.id}
            className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{fee.title}</h3>

              <p className="text-sm text-gray-600">
                {fee.semester} | Batch: {fee.batch} | ৳{fee.amount}
              </p>

              <p className="text-sm text-gray-600">
                Deadline: {fee.due_date ? fee.due_date.slice(0, 10) : "N/A"}
              </p>

              {fee.transaction_id && (
                <p className="text-sm text-green-700">
                  Transaction: {fee.transaction_id}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-semibold ${
                  fee.payment_status === "paid"
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {fee.payment_status || "unpaid"}
              </span>

              {!fee.payment_status && !isDeadlinePassed(fee.due_date) && (
                <button
                  onClick={() => openPaymentModal(fee)}
                  className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
                >
                  Pay with SandGate
                </button>
              )}

              {!fee.payment_status && isDeadlinePassed(fee.due_date) && (
                <span className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">
                  Deadline Passed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-pink-600 text-white p-5">
              <h2 className="text-xl font-bold">SandGate Payment</h2>
              <p className="text-sm opacity-90">Secure sandbox transaction</p>
            </div>

            {step === "details" && (
              <form onSubmit={handleNextToOtp} className="p-6">
                <div className="mb-5 bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold">{selectedFee.title}</p>
                  <p className="text-sm text-gray-600">
                    {selectedFee.semester} | Batch: {selectedFee.batch}
                  </p>
                  <p className="text-2xl font-bold text-pink-600 mt-2">
                    ৳{selectedFee.amount}
                  </p>
                </div>

                <label className="block text-sm font-medium mb-1">
                  Payment Method
                </label>

                <select
                  className="w-full border p-2 rounded mb-4"
                  value={paymentForm.method}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      method: e.target.value,
                    })
                  }
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">Rocket</option>
                </select>

                <label className="block text-sm font-medium mb-1">
                  Mobile Number
                </label>

                <input
                  className="w-full border p-2 rounded mb-5"
                  placeholder="01XXXXXXXXX"
                  value={paymentForm.mobileNumber}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      mobileNumber: e.target.value,
                    })
                  }
                />

                <div className="flex gap-2">
                  <button className="flex-1 bg-pink-600 text-white py-2 rounded hover:bg-pink-700">
                    Continue
                  </button>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-500 text-white py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handlePay} className="p-6">
                <div className="text-center mb-5">
                  <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-2xl font-bold">
                    OTP
                  </div>

                  <h3 className="text-lg font-bold">Verify Payment</h3>

                  <p className="text-sm text-gray-600">
                    Enter sandbox OTP sent to {paymentForm.mobileNumber}
                  </p>

                  <p className="text-xs text-blue-600 mt-2">Test OTP: 123456</p>
                </div>

                <input
                  className="w-full border text-center text-xl tracking-widest p-3 rounded mb-5"
                  placeholder="Enter OTP"
                  value={paymentForm.otp}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      otp: e.target.value,
                    })
                  }
                />

                <div className="bg-gray-50 rounded p-3 mb-5 text-sm">
                  <p>
                    <b>Method:</b> {getMethodLabel(paymentForm.method)}
                  </p>
                  <p>
                    <b>Amount:</b> ৳{selectedFee.amount}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                    Confirm Payment
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    className="flex-1 bg-gray-500 text-white py-2 rounded"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}

            {step === "processing" && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-5 w-16 h-16 rounded-full border-4 border-gray-200 border-t-pink-600 animate-spin"></div>

                <h3 className="text-lg font-bold">Processing Payment</h3>

                <p className="text-sm text-gray-600 mt-2">
                  Please do not close this window.
                </p>
              </div>
            )}

            {step === "success" && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-3xl">
                  ✓
                </div>

                <h3 className="text-xl font-bold text-green-700">
                  Payment Successful
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  Your semester fee has been paid through SandGate sandbox.
                </p>

                <button
                  onClick={closeModal}
                  className="mt-6 bg-green-600 text-white px-5 py-2 rounded"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
