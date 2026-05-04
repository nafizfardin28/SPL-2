import { useEffect, useState } from "react";
import { getAdminTestimonials } from "../../utils/testimonialService";
import {
  FiEye,
  FiFilter,
  FiFileText,
  FiUser,
  FiCreditCard,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiHash,
  FiMail,
  FiDollarSign,
  FiCalendar,
  FiMessageSquare,
  FiX,
} from "react-icons/fi";
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
      <div className="rounded-3xl bg-white/90 p-7 shadow-sm border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <FiFileText size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Testimonial Oversight
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor all testimonial applications and payment activity.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white/90 p-5 shadow-sm border border-gray-100">
        <label className="flex flex-col gap-2 text-sm max-w-xs">
          <span className="font-semibold text-gray-700 flex items-center gap-2">
            <FiFilter />
            Filter by Status
          </span>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl bg-white p-8 shadow-sm border text-sm text-gray-500">
          Loading testimonial requests...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 shadow-sm border text-sm text-gray-500">
          No testimonial requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <FiFileText size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-1">
                      {item.purpose}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                      <FiUser size={14} />
                      {item.first_name} {item.last_name}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    item.payment_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  <FiCreditCard size={13} />
                  {item.payment_status}
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {item.details || "No details provided."}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Info label="Batch" value={item.batch} icon={<FiHash />} />
                <Info
                  label="Status"
                  value={item.status}
                  icon={
                    item.status === "generated" ? (
                      <FiCheckCircle />
                    ) : item.status === "rejected" ? (
                      <FiXCircle />
                    ) : (
                      <FiClock />
                    )
                  }
                />
              </div>

              <button
                onClick={() => setSelectedRequest(item)}
                className="mt-5 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <FiEye />
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>

    {selectedRequest && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-start justify-between bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div>
              <h2 className="text-2xl font-bold">Testimonial Details</h2>
              <p className="mt-1 text-sm text-blue-100">
                {selectedRequest.first_name} {selectedRequest.last_name}
              </p>
            </div>

            <button
              onClick={() => setSelectedRequest(null)}
              className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
            >
              <FiX size={22} />
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="rounded-3xl bg-blue-50 border border-blue-100 p-5 mb-6">
              <p className="text-xs uppercase font-bold text-blue-600">
                Purpose
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {selectedRequest.purpose}
              </h3>

              <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                {selectedRequest.details || "No details provided."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info
                label="Student"
                value={`${selectedRequest.first_name} ${selectedRequest.last_name}`}
                icon={<FiUser />}
              />
              <Info
                label="Email"
                value={selectedRequest.email}
                icon={<FiMail />}
              />
              <Info
                label="Batch"
                value={selectedRequest.batch}
                icon={<FiHash />}
              />
              <Info
                label="Roll No"
                value={selectedRequest.roll_no}
                icon={<FiHash />}
              />
              <Info
                label="Registration No"
                value={selectedRequest.reg_no}
                icon={<FiHash />}
              />
              <Info
                label="Request Status"
                value={selectedRequest.status}
                icon={<FiClock />}
              />
              <Info
                label="Payment Status"
                value={selectedRequest.payment_status}
                icon={<FiCreditCard />}
              />
              <Info
                label="Transaction ID"
                value={selectedRequest.transaction_id}
                icon={<FiHash />}
              />
              <Info
                label="Method"
                value={selectedRequest.method}
                icon={<FiCreditCard />}
              />
              <Info
                label="Amount"
                value={`${selectedRequest.amount || 0} BDT`}
                icon={<FiDollarSign />}
              />
              <Info
                label="Paid At"
                value={selectedRequest.paid_at}
                icon={<FiCalendar />}
              />
              <Info
                label="Staff Note"
                value={selectedRequest.staff_note}
                icon={<FiMessageSquare />}
              />
            </div>
          </div>

          <div className="flex justify-end border-t bg-gray-50 p-5">
            <button
              onClick={() => setSelectedRequest(null)}
              className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)};
const Info = ({ label, value, icon }) => (
  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1">
      {icon}
      {label}
    </p>
    <p className="mt-2 text-sm font-semibold text-gray-800 break-words">
      {value || "N/A"}
    </p>
  </div>
);

