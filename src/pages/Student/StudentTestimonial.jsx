import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  applyTestimonial,
  getMyTestimonials,
  downloadTestimonial,
} from "../../utils/testimonialService";

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
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow border">
          <h1 className="text-3xl font-bold text-gray-900">Testimonial</h1>
          <p className="mt-2 text-sm text-gray-500">
            Apply for your official IIT testimonial.
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

        {fetching ? (
          <div className="rounded-3xl bg-white p-6 shadow text-gray-500">
            Loading...
          </div>
        ) : !hasRequest ? (
          <form
            onSubmit={handleApply}
            className="rounded-3xl bg-white p-6 shadow border space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900">
              Apply for Testimonial
            </h2>

            <label className="flex flex-col gap-1 text-sm">
              Purpose
              <input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="rounded-xl border px-3 py-2"
                placeholder="Example: Higher study application"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Details
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="rounded-xl border px-3 py-2 min-h-28"
                placeholder="Write additional details"
              />
            </label>

            <button
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Apply for Testimonial"}
            </button>
          </form>
        ) : (
          <div className="rounded-3xl bg-white p-6 shadow border">
            <h2 className="text-xl font-bold text-gray-900">
              Your Testimonial Application
            </h2>

            <div className="mt-5 rounded-2xl bg-gray-50 border p-5">
              <h3 className="font-bold text-gray-900">
                {currentRequest.purpose}
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {currentRequest.details || "No details provided."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Status: {currentRequest.status}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    currentRequest.payment_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  Payment: {currentRequest.payment_status}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {currentRequest.payment_status !== "paid" &&
                  currentRequest.payment_id && (
                    <button
                      onClick={() => navigate("/student/payments")}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Go to Payments
                    </button>
                  )}

                {currentRequest.payment_status === "paid" &&
                  currentRequest.payment_id && (
                    <button
                      onClick={() => navigate("/student/payments")}
                      className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
                    >
                      View Payments
                    </button>
                  )}

                {currentRequest.status === "generated" && (
                  <button
                    onClick={() => downloadTestimonial(currentRequest.id)}
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Download Testimonial
                  </button>
                )}
              </div>

              {currentRequest.staff_note && (
                <p className="mt-4 text-sm text-gray-600">
                  <strong>Staff Note:</strong> {currentRequest.staff_note}
                </p>
              )}
            </div>
          </div>
        )}

        {paymentPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                Testimonial Request Created
              </h2>

              <p className="mt-3 text-sm text-gray-600">
                Your testimonial payment has been allocated. You can pay now
                from the Payments page or pay later.
              </p>

              <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-sm font-semibold text-blue-800">
                  {paymentPrompt.paymentName}
                </p>
                <p className="mt-1 text-sm text-blue-700">
                  Amount: {paymentPrompt.amount} BDT
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setPaymentPrompt(null)}
                  className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Later
                </button>

                <button
                  onClick={() => {
                    setPaymentPrompt(null);
                    navigate("/student/payments");
                  }}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Go to My Payments
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
