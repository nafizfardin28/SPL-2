import { useEffect, useState } from "react";
import {
  getStaffTestimonials,
  updateTestimonialStatus,
} from "../../utils/testimonialService";
import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiFileText,
  FiRefreshCw,
  FiUser,
  FiCreditCard,
  FiHash,
  FiXCircle,
  FiEdit3,
} from "react-icons/fi";

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

  const isFinal = (status) => status === "generated" || status === "rejected";

  const active = testimonials.filter((t) => !isFinal(t.status));
  const generated = testimonials.filter((t) => t.status === "generated");
  const rejected = testimonials.filter((t) => t.status === "rejected");

  const statusStyle = (status) => {
    if (status === "generated") return "bg-green-100 text-green-700 border-green-200";
    if (status === "rejected") return "bg-red-100 text-red-700 border-red-200";
    if (status === "verified") return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const statusIcon = (status) => {
    if (status === "generated") return <FiCheckCircle />;
    if (status === "rejected") return <FiXCircle />;
    if (status === "verified") return <FiRefreshCw />;
    return <FiClock />;
  };

  const Card = ({ item }) => {
    const final = isFinal(item.status);

    return (
      <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <FiFileText size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {item.purpose}
                </h2>

                <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                  <FiUser size={14} />
                  {item.first_name} {item.last_name} • {item.batch || "N/A"}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed line-clamp-2">
              {item.details || "No details provided."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${statusStyle(
                  item.status
                )}`}
              >
                {statusIcon(item.status)}
                {item.status}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                <FiHash size={13} />
                Roll: {item.roll_no || "N/A"}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                <FiCreditCard size={13} />
                Payment: {item.payment_status || "N/A"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedRequest(item)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <FiEye size={16} />
            Details
          </button>
        </div>

        {item.transaction_id && (
          <div className="mt-4 rounded-2xl bg-gray-50 border px-4 py-3 text-sm text-gray-600">
            <span className="font-semibold">Transaction ID:</span>{" "}
            {item.transaction_id}
          </div>
        )}

        {item.staff_note && (
          <div className="mt-4 rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-800">
            <div className="flex items-center gap-2 font-bold">
              <FiEdit3 />
              Staff Note
            </div>
            <p className="mt-1">{item.staff_note}</p>
          </div>
        )}

        {!final ? (
          <div className="mt-5 border-t pt-5 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={selectedStatus[item.id] || ""}
                onChange={(e) =>
                  setSelectedStatus((prev) => ({
                    ...prev,
                    [item.id]: e.target.value,
                  }))
                }
                className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <FiRefreshCw size={15} />
                Update Status
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
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-gray-50 border px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
            <FiCheckCircle />
            Finalized — no further updates allowed.
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, items, icon }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {icon}
          {title}
        </h2>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-600 border">
          {items.length} items
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 shadow-sm border text-sm text-gray-500 text-center">
          No items found.
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
        <div className="rounded-3xl bg-white/90 p-7 shadow-sm border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiFileText className="text-blue-600" />
                Testimonial Requests
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Review, verify, generate, or reject student testimonial applications.
              </p>
            </div>

            <button
              onClick={loadTestimonials}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm border text-gray-500">
            Loading testimonial requests...
          </div>
        ) : (
          <>
            <Section
              title="Active Testimonials"
              items={active}
              icon={<FiClock className="text-blue-600" />}
            />
            <Section
              title="Generated Testimonials"
              items={generated}
              icon={<FiDownload className="text-green-600" />}
            />
            <Section
              title="Rejected Testimonials"
              items={rejected}
              icon={<FiXCircle className="text-red-600" />}
            />
          </>
        )}

        {selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <h2 className="text-2xl font-bold">
                  {selectedRequest.purpose}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Testimonial Request Details
                </p>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-gray-50 border p-4">
                    <p className="text-xs uppercase text-gray-500">Student</p>
                    <p className="font-bold">
                      {selectedRequest.first_name} {selectedRequest.last_name}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border p-4">
                    <p className="text-xs uppercase text-gray-500">Batch</p>
                    <p className="font-bold">{selectedRequest.batch || "N/A"}</p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border p-4">
                    <p className="text-xs uppercase text-gray-500">Roll</p>
                    <p className="font-bold">{selectedRequest.roll_no || "N/A"}</p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border p-4">
                    <p className="text-xs uppercase text-gray-500">Status</p>
                    <p className="font-bold text-blue-700">
                      {selectedRequest.status}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                  <p className="text-sm font-bold text-blue-800">Details</p>
                  <p className="mt-2 text-sm text-blue-700 leading-relaxed">
                    {selectedRequest.details || "No details provided."}
                  </p>
                </div>

                {selectedRequest.staff_note && (
                  <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
                    <p className="text-sm font-bold text-indigo-800">
                      Staff Note
                    </p>
                    <p className="mt-2 text-sm text-indigo-700">
                      {selectedRequest.staff_note}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 border-t p-4 flex justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-2xl bg-gray-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}