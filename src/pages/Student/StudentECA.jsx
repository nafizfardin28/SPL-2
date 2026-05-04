import { useEffect, useState } from "react";
import {
  createEcaRequest,
  getMyEcaRequests,
  downloadEcaCertificate,
} from "../../utils/ecaService";
import { FiDownload, FiEye, FiX } from "react-icons/fi";

const initialForm = {
  activityTitle: "",
  activityType: "",
  organizer: "",
  eventDate: "",
  achievement: "",
  description: "",
};

const statusClass = {
  pending: "bg-yellow-100 text-yellow-700",
  under_review: "bg-blue-100 text-blue-700",
  verified: "bg-purple-100 text-purple-700",
  generated: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function StudentEcaCertificate() {
  const [form, setForm] = useState(initialForm);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    setError("");

    const data = await getMyEcaRequests();

    if (!data.ok && data.message) {
      setError(data.message || "Failed to load ECA applications.");
      setLoading(false);
      return;
    }

    setRequests(data.requests || []);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (
      !form.activityTitle.trim() ||
      !form.activityType ||
      !form.organizer.trim() ||
      !form.eventDate ||
      !form.description.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);

    const data = await createEcaRequest(form);

    setSubmitting(false);

    if (!data.ok && data.message) {
      setError(data.message || "Failed to submit ECA request.");
      return;
    }

    setMessage(data.message || "ECA request submitted successfully.");
    setForm(initialForm);
    loadRequests();
  };

  const handleDownload = async (id) => {
    try {
      await downloadEcaCertificate(id);
    } catch (error) {
      setError(error.message || "Failed to download certificate.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl bg-white p-6 shadow border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">
            ECA Certificate Application
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Apply for extra-curricular activity certificates and track your
            application status.
          </p>
        </div>

        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow border border-gray-100 space-y-5"
        >
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              New ECA Application
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Required fields must be completed before submission.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Activity Title"
              value={form.activityTitle}
              onChange={(value) => updateField("activityTitle", value)}
              placeholder="Example: Intra IIT Programming Contest"
            />

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-gray-700">Activity Type</span>
              <select
                className="rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.activityType}
                onChange={(e) => updateField("activityType", e.target.value)}
              >
                <option value="">Select Activity Type</option>
                <option value="Programming Contest">Programming Contest</option>
                <option value="Research Activity">Research Activity</option>
                <option value="Seminar">Seminar</option>
                <option value="Workshop">Workshop</option>
                <option value="Sports">Sports</option>
                <option value="Cultural Activity">Cultural Activity</option>
                <option value="Club Activity">Club Activity</option>
                <option value="Volunteer Work">Volunteer Work</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <Input
              label="Organizer"
              value={form.organizer}
              onChange={(value) => updateField("organizer", value)}
              placeholder="Organizer name"
            />

            <Input
              label="Event Date"
              type="date"
              value={form.eventDate}
              onChange={(value) => updateField("eventDate", value)}
            />

            <Input
              label="Achievement / Position"
              value={form.achievement}
              onChange={(value) => updateField("achievement", value)}
              placeholder="Optional"
            />
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-gray-700">Description</span>
            <textarea
              className="min-h-28 rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your participation or achievement"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </label>

          <button
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit ECA Application"}
          </button>
        </form>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              My ECA Applications
            </h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {requests.length}
            </span>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-6 shadow text-sm text-gray-500">
              Loading applications...
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 shadow text-sm text-gray-500">
              No ECA applications found.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white p-5 shadow border border-gray-100"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {item.activity_title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.activity_type} • {item.organizer}
                      </p>

                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {item.description || "No description provided."}
                      </p>

                      <span
                        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          statusClass[item.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {item.status === "generated" && (
                        <button
                          onClick={() => handleDownload(item.id)}
                          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                          title="Download"
                        >
                          <FiDownload size={15} />
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedRequest(item)}
                        className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
                        title="Details"
                      >
                        <FiEye size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedRequest.activity_title}
                    </h2>
                    <p className="mt-1 text-sm text-blue-100">
                      ECA Certificate Application Details
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="rounded-full bg-white/20 px-3 py-1 text-xl hover:bg-white/30"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Info label="Type" value={selectedRequest.activity_type} />
                  <Info label="Organizer" value={selectedRequest.organizer} />
                  <Info label="Event Date" value={selectedRequest.event_date} />
                  <Info
                    label="Achievement"
                    value={selectedRequest.achievement || "N/A"}
                  />
                  <Info label="Status" value={selectedRequest.status} />
                  <Info
                    label="Certificate ID"
                    value={selectedRequest.certificate_id || "N/A"}
                  />
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Description
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    {selectedRequest.description || "N/A"}
                  </p>
                </div>

                {selectedRequest.teacher_note && (
                  <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">
                      Teacher Note
                    </p>
                    <p className="mt-2 text-sm text-yellow-800">
                      {selectedRequest.teacher_note}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t bg-gray-50 p-5">
                {selectedRequest.status === "generated" && (
                  <button
                    onClick={() => handleDownload(selectedRequest.id)}
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    title="Download Testimonial"
                  >
                    <FiDownload size={15} />
                  </button>
                )}

                <button
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-full p-2 text-red-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <FiX size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="font-semibold text-gray-700">{label}</span>
    <input
      type={type}
      className="rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);

const Info = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className="mt-2 break-words text-sm font-semibold text-gray-800">
      {value || "N/A"}
    </p>
  </div>
);
/*import { useEffect, useState } from "react";
import {
  createEcaRequest,
  getMyEcaRequests,
  downloadEcaCertificate,
} from "../../utils/ecaService";

export default function StudentEcaCertificate() {
  const [form, setForm] = useState({
    activityTitle: "",
    activityType: "",
    organizer: "",
    eventDate: "",
    achievement: "",
    description: "",
  });

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    const data = await getMyEcaRequests();
    setRequests(data.requests || []);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = await createEcaRequest(form);
    setMessage(data.message || "ECA request submitted.");

    setForm({
      activityTitle: "",
      activityType: "",
      organizer: "",
      eventDate: "",
      achievement: "",
      description: "",
    });

    loadRequests();
  };

  const handleDownload = async (id) => {
    try {
      await downloadEcaCertificate(id);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">ECA Certificate Application</h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-5 mb-8 space-y-4"
      >
        <input
          className="w-full border p-2 rounded"
          placeholder="Activity Title"
          value={form.activityTitle}
          onChange={(e) =>
            setForm({ ...form, activityTitle: e.target.value })
          }
        />

        <select
          className="w-full border p-2 rounded"
          value={form.activityType}
          onChange={(e) =>
            setForm({ ...form, activityType: e.target.value })
          }
        >
          <option value="">Select Activity Type</option>
          <option value="Programming Contest">Programming Contest</option>
          <option value="Research Activity">Research Activity</option>
          <option value="Seminar">Seminar</option>
          <option value="Workshop">Workshop</option>
          <option value="Sports">Sports</option>
          <option value="Cultural Activity">Cultural Activity</option>
          <option value="Club Activity">Club Activity</option>
          <option value="Volunteer Work">Volunteer Work</option>
          <option value="Other">Other</option>
        </select>

        <input
          className="w-full border p-2 rounded"
          placeholder="Organizer"
          value={form.organizer}
          onChange={(e) => setForm({ ...form, organizer: e.target.value })}
        />

        <input
          type="date"
          className="w-full border p-2 rounded"
          value={form.eventDate}
          onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Achievement / Position"
          value={form.achievement}
          onChange={(e) => setForm({ ...form, achievement: e.target.value })}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          rows="4"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit ECA Application
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">My ECA Applications</h2>

      <div className="space-y-3">
        {requests.length === 0 && (
          <p className="text-gray-500">No ECA applications found.</p>
        )}

        {requests.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold">{item.activity_title}</h3>
              <p className="text-sm text-gray-600">
                {item.activity_type} | {item.organizer}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-blue-700">
                {item.status}
              </span>

              {item.status === "generated" && (
                <button
                  onClick={() => handleDownload(item.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Download
                </button>
              )}

              <button
                onClick={() => setSelectedRequest(item)}
                className="bg-gray-800 text-white px-4 py-2 rounded"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">
              {selectedRequest.activity_title}
            </h2>

            <p><b>Type:</b> {selectedRequest.activity_type}</p>
            <p><b>Organizer:</b> {selectedRequest.organizer}</p>
            <p><b>Event Date:</b> {selectedRequest.event_date}</p>
            <p><b>Achievement:</b> {selectedRequest.achievement || "N/A"}</p>
            <p><b>Status:</b> {selectedRequest.status}</p>
            <p><b>Description:</b> {selectedRequest.description}</p>

            {selectedRequest.teacher_note && (
              <p className="mt-3">
                <b>Teacher Note:</b> {selectedRequest.teacher_note}
              </p>
            )}

            {selectedRequest.certificate_id && (
              <p className="mt-3">
                <b>Certificate ID:</b> {selectedRequest.certificate_id}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              {selectedRequest.status === "generated" && (
                <button
                  onClick={() => handleDownload(selectedRequest.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Download Certificate
                </button>
              )}

              <button
                onClick={() => setSelectedRequest(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}*/