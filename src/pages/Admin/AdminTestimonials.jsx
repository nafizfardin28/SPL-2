import { useEffect, useState } from "react";
import { getAdminTestimonials } from "../../utils/testimonialService";

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

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
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white p-6 shadow border border-gray-100"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  {item.purpose}
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  {item.details || "No details provided."}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Info label="Student" value={`${item.first_name} ${item.last_name}`} />
                  <Info label="Email" value={item.email} />
                  <Info label="Batch" value={item.batch} />
                  <Info label="Roll No" value={item.roll_no} />
                  <Info label="Registration No" value={item.reg_no} />
                  <Info label="Request Status" value={item.status} />
                  <Info label="Payment Status" value={item.payment_status} />
                  <Info label="Transaction ID" value={item.transaction_id} />
                  <Info label="Method" value={item.method} />
                  <Info label="Amount" value={`${item.amount || 0} BDT`} />
                  <Info label="Paid At" value={item.paid_at} />
                  <Info label="Staff Note" value={item.staff_note} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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