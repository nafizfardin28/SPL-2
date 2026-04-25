import { useEffect, useState } from "react";
import {
  getAllEcaRequests,
  updateEcaStatus,
  generateEcaCertificate,
  downloadEcaCertificate,
} from "../../utils/ecaService";

export default function ECAConfirmation() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    const data = await getAllEcaRequests();
    setRequests(data.requests || []);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const closeModal = () => {
    setSelectedRequest(null);
    setNote("");
  };

  const handleStatus = async (id, status) => {
    if (status === "rejected" && !note.trim()) {
      setMessage("Teacher note is required when rejecting.");
      return;
    }

    const data = await updateEcaStatus(id, status, note);
    setMessage(data.message || "ECA request updated.");
    closeModal();
    loadRequests();
  };

  const handleGenerate = async (id) => {
    const data = await generateEcaCertificate(id);
    setMessage(data.message || "Certificate generated.");
    closeModal();
    loadRequests();
  };

  const handleDownload = async (id) => {
    try {
      await downloadEcaCertificate(id);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const pendingRequests = requests.filter((item) => item.status === "pending");
  const approvedRequests = requests.filter((item) => item.status === "approved");
  const generatedRequests = requests.filter((item) => item.status === "generated");
  const rejectedRequests = requests.filter((item) => item.status === "rejected");

  const renderRow = (item) => (
    <div
      key={item.id}
      className="bg-white shadow rounded-lg p-4 flex items-center justify-between"
    >
      <div>
        <h3 className="font-bold">{item.activity_title}</h3>
        <p className="text-sm text-gray-600">
          Student: {item.first_name} {item.last_name}
        </p>
        <p className="text-sm text-gray-600">
          {item.activity_type} | {item.organizer}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-blue-700">
          {item.status}
        </span>

        

        <button
          onClick={() => setSelectedRequest(item)}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">
        ECA Certificate Management
      </h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
          {message}
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Pending Applications</h2>

        <div className="space-y-3">
          {pendingRequests.length === 0 && (
            <p className="text-gray-500">No pending applications found.</p>
          )}

          {pendingRequests.map(renderRow)}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Approved Applications</h2>

        <div className="space-y-3">
          {approvedRequests.length === 0 && (
            <p className="text-gray-500">No approved applications found.</p>
          )}

          {approvedRequests.map(renderRow)}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Generated Certificates</h2>

        <div className="space-y-3">
          {generatedRequests.length === 0 && (
            <p className="text-gray-500">No generated certificates found.</p>
          )}

          {generatedRequests.map(renderRow)}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Rejected Applications</h2>

        <div className="space-y-3">
          {rejectedRequests.length === 0 && (
            <p className="text-gray-500">No rejected applications found.</p>
          )}

          {rejectedRequests.map(renderRow)}
        </div>
      </section>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">
              {selectedRequest.activity_title}
            </h2>

            <div className="space-y-1">
              <p>
                <b>Student:</b> {selectedRequest.first_name}{" "}
                {selectedRequest.last_name}
              </p>
              <p><b>Email:</b> {selectedRequest.email}</p>
              <p><b>Roll:</b> {selectedRequest.roll_no || "N/A"}</p>
              <p><b>Registration:</b> {selectedRequest.reg_no || "N/A"}</p>
              <p><b>Batch:</b> {selectedRequest.batch || "N/A"}</p>
              <p><b>Activity Type:</b> {selectedRequest.activity_type}</p>
              <p><b>Organizer:</b> {selectedRequest.organizer}</p>
              <p><b>Event Date:</b> {selectedRequest.event_date}</p>
              <p><b>Achievement:</b> {selectedRequest.achievement || "N/A"}</p>
              <p><b>Status:</b> {selectedRequest.status}</p>
              <p><b>Description:</b> {selectedRequest.description}</p>
            </div>

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

            {selectedRequest.status === "pending" && (
              <textarea
                className="w-full border p-2 rounded mt-4"
                placeholder="Write teacher note. Required if rejecting."
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            )}

            <div className="mt-5 flex gap-2 flex-wrap">
              {selectedRequest.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      handleStatus(selectedRequest.id, "approved")
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      handleStatus(selectedRequest.id, "rejected")
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Reject
                  </button>
                </>
              )}

              {selectedRequest.status === "approved" && (
                <button
                  onClick={() => handleGenerate(selectedRequest.id)}
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                  Generate Certificate
                </button>
              )}

              {selectedRequest.status === "generated" && (
                <button
                  onClick={() => handleDownload(selectedRequest.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Download Certificate
                </button>
              )}

              <button
                onClick={closeModal}
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