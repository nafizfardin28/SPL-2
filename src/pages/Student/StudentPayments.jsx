import { useEffect, useState } from "react";
import {
  getMyPayments,
  startPayment,
  confirmPayment,
  downloadReceipt,
} from "../../utils/paymentService";

export default function StudentPayments() {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [method, setMethod] = useState("bkash");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState("method");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPayments = async () => {
    setLoading(true);
    setError("");

    const result = await getMyPayments();

    if (!result.ok) {
      setError(result.message || "Failed to load payments.");
      setLoading(false);
      return;
    }

    setPayments(result.payments || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setMethod("bkash");
    setMobileNumber("");
    setOtp("");
    setPin("");
    setStep("method");
    setModalError("");
    setSuccess("");
  };

  const closePaymentModal = () => {
    setSelectedPayment(null);
    setModalError("");
  };

  const handleSendOtp = async () => {
    if (!selectedPayment) return;

    setModalError("");

    if (!mobileNumber.trim()) {
      setModalError("Mobile number is required.");
      return;
    }

    setProcessing(true);

    const result = await startPayment({
      id: selectedPayment.id,
      method,
      mobileNumber: mobileNumber.trim(),
    });

    setProcessing(false);

    if (!result.ok) {
      setModalError(result.message || "Failed to send OTP.");
      return;
    }

    setStep("otp");
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;

    setModalError("");

    if (!otp.trim() || !pin.trim()) {
      setModalError("OTP and PIN are required.");
      return;
    }

    setProcessing(true);

    const result = await confirmPayment({
      id: selectedPayment.id,
      otp: otp.trim(),
      pin: pin.trim(),
    });

    setProcessing(false);

    if (!result.ok) {
      setModalError(result.message || "Payment failed.");
      return;
    }

    setSuccess("Payment completed successfully.");
    closePaymentModal();
    loadPayments();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow border">
          <h1 className="text-3xl font-bold text-gray-900">My Payments</h1>
          <p className="mt-2 text-sm text-gray-500">
            View all payments assigned to you.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl bg-white p-6 shadow text-gray-500">
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 shadow text-gray-500">
            No payments assigned yet.
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-3xl bg-white p-6 shadow border border-gray-100"
              >
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center">
                  {/* Payment Info */}
                  <div className="lg:col-span-5">
                    <h2 className="text-lg font-bold text-gray-900">
                      {payment.payment_name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 capitalize">
                      Type: {payment.payment_type?.replace("_", " ")}
                    </p>

                    {payment.testimonial_purpose && (
                      <p className="mt-3 text-sm text-gray-600">
                        Related Testimonial: {payment.testimonial_purpose}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="lg:col-span-2">
                    <Info label="Amount" value={`${payment.amount} BDT`} />
                  </div>

                  {/* Status */}
                  <div className="lg:col-span-2">
                    <Info label="Status" value={payment.status} />
                  </div>

                  {/* Action */}
                  <div className="lg:col-span-3 flex lg:justify-end">
                    {payment.status !== "paid" ? (
                      <button
                        onClick={() => openPaymentModal(payment)}
                        className="w-full lg:w-auto rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Pay Now
                      </button>
                    ) : (
                      <button
                        onClick={() => downloadReceipt(payment.id)}
                        className="w-full lg:w-auto rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        Download Receipt
                      </button>
                    )}
                  </div>
                </div>

                {/* Transaction Section */}
                {payment.status === "paid" && (
                  <div className="mt-5 rounded-2xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
                    Transaction ID: {payment.transaction_id || "N/A"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 px-6 py-5 text-white">
              <h2 className="text-xl font-bold">Payment Gateway</h2>
              <p className="mt-1 text-sm text-blue-100">
                {selectedPayment.payment_name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl bg-gray-50 border p-4">
                <p className="text-sm font-semibold text-gray-800">
                  Amount: {selectedPayment.amount} BDT
                </p>
                <p className="mt-1 text-xs text-gray-500 capitalize">
                  Type: {selectedPayment.payment_type?.replace("_", " ")}
                </p>
              </div>

              {modalError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {modalError}
                </div>
              )}

              {step === "method" && (
                <>
                  <label className="flex flex-col gap-1 text-sm">
                    Payment Method
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="rounded-xl border px-3 py-2"
                    >
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    Mobile Number
                    <input
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="rounded-xl border px-3 py-2"
                      placeholder="01XXXXXXXXX"
                    />
                  </label>

                  <button
                    onClick={handleSendOtp}
                    disabled={processing}
                    className="w-full rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
                  >
                    {processing ? "Sending OTP..." : "Send OTP"}
                  </button>
                </>
              )}

              {step === "otp" && (
                <>
                  <div className="rounded-xl bg-yellow-50 border border-yellow-100 p-3 text-sm text-yellow-800">
                    Demo OTP: <strong>123456</strong> | Demo PIN:{" "}
                    <strong>1234</strong>
                  </div>

                  <label className="flex flex-col gap-1 text-sm">
                    OTP
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="rounded-xl border px-3 py-2"
                      placeholder="Enter OTP"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    PIN / Password
                    <input
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      type="password"
                      className="rounded-xl border px-3 py-2"
                      placeholder="Enter PIN"
                    />
                  </label>

                  <button
                    onClick={handleConfirmPayment}
                    disabled={processing}
                    className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing ? "Confirming..." : "Confirm Payment"}
                  </button>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
              <button
                onClick={closePaymentModal}
                className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
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

const Info = ({ label, value }) => (
  <div className="rounded-2xl bg-gray-50 border p-4">
    <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
    <p className="mt-2 text-sm font-bold text-gray-800">{value || "N/A"}</p>
  </div>
);
