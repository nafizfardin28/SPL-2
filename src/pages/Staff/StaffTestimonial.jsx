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
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadTestimonials = async () => {
    setLoading(true);
    const result = await getStaffTestimonials();

    if (!result.ok) {
      setError(result.message || "Failed to load testimonials.");
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
    const note = staffNote[id] || "";

    if (!status) {
      setError("Select a status first.");
      return;
    }

    const result = await updateTestimonialStatus({
      id,
      status,
      staffNote: note,
    });

    if (!result.ok) {
      setError(result.message || "Update failed.");
      return;
    }

    setMessage("Updated successfully.");
    loadTestimonials();
  };

  const isFinal = (status) =>
    status === "generated" || status === "rejected";

  const active = testimonials.filter((t) => !isFinal(t.status));
  const generated = testimonials.filter((t) => t.status === "generated");
  const rejected = testimonials.filter((t) => t.status === "rejected");

  const Card = ({ item }) => {
    const final = isFinal(item.status);

    return (
      <div className="rounded-3xl bg-white p-5 shadow border border-gray-100">
        
        {/* TOP ROW */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* LEFT */}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">
              {item.purpose}
            </h2>

            <p className="text-sm text-gray-500">
              {item.first_name} {item.last_name} • {item.batch}
            </p>

            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {item.details || "No details provided."}
            </p>

            <span
              className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                item.status === "generated"
                  ? "bg-green-100 text-green-700"
                  : item.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {item.status}
            </span>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-2 lg:items-end">
            <button
              onClick={() => setSelectedRequest(item)}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100"
            >
              Details
            </button>
          </div>
        </div>

        {/* INFO STRIP */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
          <span>Roll: {item.roll_no}</span>
          <span>Payment: {item.payment_status}</span>
          <span>TXN: {item.transaction_id || "N/A"}</span>
        </div>

        {/* STAFF NOTE DISPLAY */}
        {item.staff_note && (
          <div className="mt-3 rounded-xl bg-gray-50 border px-3 py-2 text-sm text-gray-700">
            <strong>Note:</strong> {item.staff_note}
          </div>
        )}

        {/* UPDATE SECTION */}
        {!final && (
          <div className="mt-4 border-t pt-4 space-y-3">
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={selectedStatus[item.id] || ""}
                onChange={(e) =>
                  setSelectedStatus((prev) => ({
                    ...prev,
                    [item.id]: e.target.value,
                  }))
                }
                className="rounded-xl border px-3 py-2 text-sm"
              >
                <option value="">Select status</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleUpdate(item.id)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Update
              </button>
            </div>

            <textarea
              value={staffNote[item.id] || ""}
              onChange={(e) =>
                setStaffNote((prev) => ({
                  ...prev,
                  [item.id]: e.target.value,
                }))
              }
              placeholder="Write staff note..."
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
        )}

        {/* FINAL MESSAGE */}
        {final && (
          <div className="mt-4 rounded-xl bg-gray-50 border px-3 py-2 text-sm text-gray-600">
            Finalized — no further updates allowed.
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, items }) => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>

      {items.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 shadow text-sm text-gray-500">
          No items.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-6xl space-y-8">

        <div className="rounded-3xl bg-white p-6 shadow border">
          <h1 className="text-3xl font-bold">Testimonial Requests</h1>
        </div>

        {error && <div className="text-red-600">{error}</div>}
        {message && <div className="text-green-600">{message}</div>}

        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <Section title="Active Testimonials" items={active} />
            <Section title="Generated Testimonials" items={generated} />
            <Section title="Rejected Testimonials" items={rejected} />
          </>
        )}

        {/* DETAILS MODAL */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl max-w-lg w-full">
              <h2 className="text-xl font-bold">
               Purpose : {selectedRequest.purpose}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {selectedRequest.details}
              </p>

              <button
                onClick={() => setSelectedRequest(null)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}