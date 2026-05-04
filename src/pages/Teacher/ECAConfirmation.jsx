import { useEffect, useState } from "react";
import {
  getAllEcaRequests,
  updateEcaStatus,
  generateEcaCertificate,
  downloadEcaCertificate,
} from "../../utils/ecaService";
import { FiX, FiCheck, FiEye } from "react-icons/fi";

const statusClass = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  generated: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ECAConfirmation() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal,setShowModal] = useState(false);
  const [DownloadId,setDownloadId] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    const data = await getAllEcaRequests();
    setRequests(data.requests || []);
    setLoading(false);
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

  const pendingRequests = requests.filter((item) => item.status === "pending");
  const approvedRequests = requests.filter(
    (item) => item.status === "approved",
  );
  const generatedRequests = requests.filter(
    (item) => item.status === "generated",
  );
  const rejectedRequests = requests.filter(
    (item) => item.status === "rejected",
  );

  const renderRow = (item) => (
    <div
      key={item.id}
      className="rounded-3xl bg-white p-5 shadow border border-gray-100 hover:shadow-lg transition"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">
            {item.activity_title}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {item.first_name} {item.last_name} • {item.batch || "N/A"}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            {item.activity_type} • {item.organizer}
          </p>

          <span
            className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              statusClass[item.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {item.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {item.status === "generated" && (
            <span className="text-green-600 text-sm m-3 font-semibold">
              Certificate Generated
            </span>
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
  );

  const Section = ({ title, items }) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 shadow text-sm text-gray-500">
          No applications found.
        </div>
      ) : (
        <div className="space-y-3">{items.map(renderRow)}</div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl bg-white p-6 shadow border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">
            ECA Certificate Management
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Review, approve, reject, generate ECA certificates.
          </p>
        </div>

        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl bg-white p-6 shadow text-sm text-gray-500">
            Loading applications...
          </div>
        ) : (
          <>
            <Section title="Pending Applications" items={pendingRequests} />
            <Section title="Approved Applications" items={approvedRequests} />
            <Section title="Generated Certificates" items={generatedRequests} />
            <Section title="Rejected Applications" items={rejectedRequests} />
          </>
        )}

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
                      ECA Certificate Application Review
                    </p>
                  </div>

                  <button
                    onClick={closeModal}
                    className="rounded-full bg-white/20 px-3 py-1 text-xl hover:bg-white/30"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Info
                    label="Student"
                    value={`${selectedRequest.first_name} ${selectedRequest.last_name}`}
                  />
                  <Info label="Email" value={selectedRequest.email} />
                  <Info label="Roll" value={selectedRequest.roll_no || "N/A"} />
                  <Info
                    label="Registration"
                    value={selectedRequest.reg_no || "N/A"}
                  />
                  <Info label="Batch" value={selectedRequest.batch || "N/A"} />
                  <Info
                    label="Activity Type"
                    value={selectedRequest.activity_type}
                  />
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

                {selectedRequest.status === "pending" && (
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-gray-700">
                      Teacher Note
                    </span>
                    <textarea
                      className="min-h-24 rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write teacher note. Required if rejecting."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </label>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t bg-gray-50 p-5">
                {selectedRequest.status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        handleStatus(selectedRequest.id, "approved")
                      }
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        handleStatus(selectedRequest.id, "rejected")
                      }
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}

                {selectedRequest.status === "approved" && (
                  <button
                    onClick={() =>{
                        setShowModal(true);
                        setDownloadId(selectedRequest.id);
                    }}
                    //handleGenerate(selectedRequest.id)
                    className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                  >
                    Generate Certificate
                  </button>
                )}

                

                <button
                  onClick={closeModal}
                  className="rounded-xl bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                  title="Close"
                >
                 <FiX size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
        {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
                  <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
                    <p className="text-gray-600 mb-5">
                      Are you sure you want to generate this certificate?
                    </p>
        
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={async () => {
                          setShowModal(false);
                          handleGenerate(DownloadId);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg"
                      >
                        <FiCheck size={16} />
                        Yes, Confirm
                      </button>
        
                      <button
                        onClick={() => setShowModal(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
      </div>
    </div>
  );
}

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
