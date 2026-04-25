import { useEffect, useState } from "react";
import { getAdminTestimonials } from "../../utils/testimonialService";

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const result = await getAdminTestimonials();

      if (!result.ok) {
        setError(result.message || "Failed to load testimonials.");
        setLoading(false);
        return;
      }

      setTestimonials(result.testimonials || []);
      setLoading(false);
    };

    load();
  }, []);

  const filtered =
    filter === "all"
      ? testimonials
      : testimonials.filter((item) => item.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">
            Testimonial Oversight
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Monitor all testimonial applications and payment activity.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow border border-gray-100">
          <label className="flex flex-col gap-1 text-sm max-w-xs">
            Filter by Status
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border px-3 py-2"
            >
              <option value="all">All</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="verified">Verified</option>
              <option value="generated">Generated</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl bg-white p-6 shadow text-sm text-gray-500">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 shadow text-sm text-gray-500">
            No testimonial requests found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white p-5 shadow border border-gray-100 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-1">
                      {item.purpose}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.first_name} {item.last_name}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.payment_status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.payment_status}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {item.details || "No details provided."}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Info label="Batch" value={item.batch} />
                  <Info label="Status" value={item.status} />
                </div>

                <button
                  onClick={() => setSelectedRequest(item)}
                  className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b p-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Testimonial Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedRequest.first_name} {selectedRequest.last_name}
                </p>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-full bg-gray-100 px-3 py-1 text-xl text-gray-600 hover:bg-gray-200"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedRequest.purpose}
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {selectedRequest.details || "No details provided."}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Info
                  label="Student"
                  value={`${selectedRequest.first_name} ${selectedRequest.last_name}`}
                />
                <Info label="Email" value={selectedRequest.email} />
                <Info label="Batch" value={selectedRequest.batch} />
                <Info label="Roll No" value={selectedRequest.roll_no} />
                <Info label="Registration No" value={selectedRequest.reg_no} />
                <Info label="Request Status" value={selectedRequest.status} />
                <Info
                  label="Payment Status"
                  value={selectedRequest.payment_status}
                />
                <Info
                  label="Transaction ID"
                  value={selectedRequest.transaction_id}
                />
                <Info label="Method" value={selectedRequest.method} />
                <Info
                  label="Amount"
                  value={`${selectedRequest.amount || 0} BDT`}
                />
                <Info label="Paid At" value={selectedRequest.paid_at} />
                <Info label="Staff Note" value={selectedRequest.staff_note} />
              </div>
            </div>

            <div className="flex justify-end border-t bg-gray-50 p-5">
              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
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

const Info = ({ label, value }) => (
  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className="mt-2 text-sm font-medium text-gray-800 break-words">
      {value || "N/A"}
    </p>
  </div>
);
