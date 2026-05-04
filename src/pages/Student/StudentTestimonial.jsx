import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  applyTestimonial,
  getMyTestimonials,
  downloadTestimonial,
} from "../../utils/testimonialService";
import { FiDownload, FiEye } from "react-icons/fi";

export default function StudentTestimonial() {
  const navigate = useNavigate();

  const [purpose, setPurpose] = useState("");
  const [details, setDetails] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [paymentPrompt, setPaymentPrompt] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTestimonials = async () => {
    setFetching(true);
    setError("");

    const result = await getMyTestimonials();

    if (!result.ok) {
      setError(result.message || "Failed to load testimonial requests.");
      setFetching(false);
      return;
    }

    setTestimonials(result.testimonials || []);
    setFetching(false);
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const hasRequest = testimonials.length > 0;
  const currentRequest = testimonials[0];

  const handleApply = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!purpose.trim()) {
      setError("Purpose is required.");
      return;
    }

    setLoading(true);

    const result = await applyTestimonial({
      purpose: purpose.trim(),
      details: details.trim(),
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.message || "Failed to apply for testimonial.");
      await loadTestimonials();
      return;
    }

    setSuccess("Testimonial request created successfully.");

    setPurpose("");
    setDetails("");

    await loadTestimonials();

    setPaymentPrompt({
      id: result.payment?.id,
      paymentName: result.payment?.paymentName || "Testimonial Application Fee",
      amount: result.payment?.amount || 500,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-white/90 p-7 shadow-sm border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Testimonial Application
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Apply, track payment, and download your official PHS
                testimonial.
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 border border-blue-100 px-5 py-3">
              <p className="text-xs text-blue-600 font-semibold uppercase">
                Current Status
              </p>
              <p className="text-sm font-bold text-blue-800">
                {currentRequest?.status || "Not Applied"}
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-700 shadow-sm">
            {success}
          </div>
        )}

        {fetching ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm border text-gray-500">
            Loading testimonial information...
          </div>
        ) : !hasRequest ? (
          <form
            onSubmit={handleApply}
            className="rounded-3xl bg-white p-7 shadow-sm border border-gray-100 space-y-5"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Apply for Testimonial
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the purpose and details of your request.
              </p>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Purpose <span className="text-red-500">*</span>
              </span>
              <input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Example: Higher study application"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Details
              </span>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write additional details about why you need this testimonial..."
              />
            </label>

            <button
              disabled={loading}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
            >
              {loading ? "Submitting..." : "Submit Testimonial Request"}
            </button>
          </form>
        ) : (
          <div className="rounded-3xl bg-white p-7 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Testimonial Application
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Track your request, payment, and download status.
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className="rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold text-blue-700">
                  {currentRequest.status}
                </span>

                <span
                  className={`rounded-full px-4 py-1.5 text-xs font-bold ${
                    currentRequest.payment_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  Payment: {currentRequest.payment_status}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 rounded-3xl bg-gray-50 border border-gray-100 p-5">
                <p className="text-xs uppercase text-gray-500 font-semibold">
                  Purpose
                </p>
                <h3 className="mt-1 text-xl font-bold text-gray-900">
                  {currentRequest.purpose}
                </h3>

                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                  {currentRequest.details || "No details provided."}
                </p>

                {currentRequest.staff_note && (
                  <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                    <p className="text-sm font-bold text-blue-800">
                      Staff Note
                    </p>
                    <p className="mt-1 text-sm text-blue-700">
                      {currentRequest.staff_note}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>

                <div className="space-y-3">
                  {currentRequest.payment_status !== "paid" &&
                    currentRequest.payment_id && (
                      <button
                        onClick={() => navigate("/student/payments")}
                        className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Go to Payments
                      </button>
                    )}

                  {currentRequest.payment_status === "paid" &&
                    currentRequest.payment_id && (
                      <button
                        onClick={() => navigate("/student/payments")}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                      >
                        <FiEye size={16} />
                        View Payment
                      </button>
                    )}

                  {currentRequest.status === "generated" && (
                    <button
                      onClick={() => downloadTestimonial(currentRequest.id)}
                      className="w-full rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <FiDownload size={16} />
                      Download Testimonial
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Prompt Modal */}
        {paymentPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <h2 className="text-xl font-bold">
                  Testimonial Request Created
                </h2>
                <p className="text-sm text-blue-100 mt-1">
                  Payment has been allocated successfully.
                </p>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600">
                  You can pay now from the Payments page or complete it later.
                </p>

                <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                  <p className="text-sm font-bold text-blue-800">
                    {paymentPrompt.paymentName}
                  </p>
                  <p className="mt-1 text-lg font-bold text-blue-700">
                    ৳{paymentPrompt.amount}
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setPaymentPrompt(null)}
                    className="rounded-2xl border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Later
                  </button>

                  <button
                    onClick={() => {
                      setPaymentPrompt(null);
                      navigate("/student/payments");
                    }}
                    className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Go to My Payments
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
