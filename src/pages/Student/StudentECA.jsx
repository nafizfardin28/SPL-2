import { useEffect, useState } from "react";
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
}