import { useEffect, useState } from "react";
import {
  getStaffTestimonials,
  updateTestimonialStatus,
} from "../../utils/testimonialService";

const statuses = ["under_review", "verified", "generated", "rejected"];

export default function StaffTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [staffNote, setStaffNote] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadTestimonials = async () => {
    setLoading(true);

    const result = await getStaffTestimonials();

    if (!result.ok) {
      setError(result.message || "Failed to load testimonial requests.");
      setLoading(false);
      return;
    }

    setTestimonials(result.testimonials || []);
    setLoading(false);
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleUpdate = async (id) => {
    const status = selectedStatus[id];

    if (!status) {
      setError("Please select a status first.");
      return;
    }

    setError("");
    setMessage("");

    const result = await updateTestimonialStatus({
      id,
      status,
      staffNote: staffNote[id] || "",
    });

    if (!result.ok) {
      setError(result.message || "Failed to update status.");
      return;
    }

    setMessage("Status updated successfully.");
    loadTestimonials();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">
            Testimonial Requests
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Verify paid testimonial applications and update their progress.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl bg-white p-6 shadow text-sm text-gray-500">
            Loading...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 shadow text-sm text-gray-500">
            No paid testimonial requests found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white p-5 shadow border border-gray-100 flex flex-col justify-between"
              >
                {/* TOP */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {item.purpose}
                  </h2>

                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {item.details || "No details"}
                  </p>

                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p>
                      <strong>
                        {item.first_name} {item.last_name}
                      </strong>
                    </p>
                    <p>
                      {item.roll_no} | {item.batch}
                    </p>
                    <p>Status: {item.status}</p>
                    <p className="text-green-600 font-semibold">
                      Payment: {item.payment_status}
                    </p>
                  </div>
                </div>

                {/* ACTION SECTION */}
                <div className="mt-4 space-y-2">
                  <select
                    value={selectedStatus[item.id] || ""}
                    onChange={(e) =>
                      setSelectedStatus((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                  >
                    <option value="">Update status</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <textarea
                    value={staffNote[item.id] || ""}
                    onChange={(e) =>
                      setStaffNote((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border px-3 py-2 text-sm min-h-[70px]"
                    placeholder="Staff note"
                  />

                  <button
                    onClick={() => handleUpdate(item.id)}
                    className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Update
                  </button>
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
    <p className="mt-2 text-sm font-medium text-gray-800">{value || "N/A"}</p>
  </div>
);
