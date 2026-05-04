import { useEffect, useMemo, useState } from "react";
import {
  getAdminEcaRequests,
  updateAdminEcaStatus,
  adminGenerateEcaCertificate,
  deleteAdminEcaRequest,
  downloadEcaCertificate,
} from "../../utils/ecaService";
import { FiDownload, FiEye, FiTrash2, FiSave } from "react-icons/fi";

const statusClass = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  generated: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminEcaCertificates() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setError("");

    const result = await getAdminEcaRequests();

    if (!result.ok) {
      setError(result.message || "Failed to load ECA requests.");
      setLoading(false);
      return;
    }

    setRequests(result.requests || []);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    let data = [...requests];

    if (filter !== "all") {
      data = data.filter((item) => item.status === filter);
    }

    if (search.trim()) {
      const keyword = search.toLowerCase();

      data = data.filter((item) => {
        const text = `
          ${item.first_name || ""}
          ${item.last_name || ""}
          ${item.email || ""}
          ${item.roll_no || ""}
          ${item.reg_no || ""}
          ${item.activity_title || ""}
          ${item.activity_type || ""}
          ${item.certificate_id || ""}
        `.toLowerCase();

        return text.includes(keyword);
      });
    }

    data.sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }

      if (sort === "status") {
        return String(a.status).localeCompare(String(b.status));
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });

    return data;
  }, [requests, filter, search, sort]);

  const openDetails = (item) => {
    setSelectedRequest(item);
    setSelectedStatus(item.status);
    setError("");
    setMessage("");
  };

  const closeDetails = () => {
    setSelectedRequest(null);
    setSelectedStatus("");
  };

  const handleOverrideStatus = async () => {
    if (!selectedRequest) return;

    if (selectedRequest.status === "generated") {
      setError("Generated certificates cannot be changed.");
      return;
    }

    const result = await updateAdminEcaStatus({
      id: selectedRequest.id,
      status: selectedStatus,
    });

    if (!result.ok) {
      setError(result.message || "Failed to update status.");
      return;
    }

    setMessage("Status updated successfully.");
    closeDetails();
    loadRequests();
  };

  const handleGenerate = async (id) => {
    const result = await adminGenerateEcaCertificate(id);

    if (!result.ok) {
      setError(result.message || "Failed to generate certificate.");
      return;
    }

    setMessage("Certificate generated successfully.");
    closeDetails();
    loadRequests();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const result = await deleteAdminEcaRequest(deleteTarget.id);

    if (!result.ok) {
      setError(result.message || "Failed to delete request.");
      return;
    }

    setMessage("ECA request deleted successfully.");
    setDeleteTarget(null);
    loadRequests();
  };

  const handleDownload = async (id) => {
    try {
      await downloadEcaCertificate(id);
    } catch (error) {
      setError(error.message || "Failed to download certificate.");
    }
  };

  const canDelete = (item) => ["pending", "rejected"].includes(item.status);
  const canGenerate = (item) => item.status === "approved";
  const canDownload = (item) => item.status === "generated";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">
            ECA Certificate Oversight
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage all ECA certificate requests with search, filter, generation,
            download, and safe delete.
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

        <div className="rounded-3xl bg-white p-5 shadow border border-gray-100">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm"
              placeholder="Search student, email, roll, certificate..."
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="generated">Generated</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-6 shadow text-sm text-gray-500">
            Loading ECA requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 shadow text-sm text-gray-500">
            No ECA requests found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white p-5 shadow border border-gray-100"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">
                      {item.activity_title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.first_name} {item.last_name} • {item.email}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {item.activity_type} • {item.organizer}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusClass[item.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>

                      {item.certificate_id && (
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                          {item.certificate_id}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button
                      onClick={() => openDetails(item)}
                      className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
                      title="Details"
                    >
                    <FiEye size={15} />
                    </button>

                    {canGenerate(item) && (
                      <button
                        onClick={() => handleGenerate(item.id)}
                        className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                      >
                        Generate
                      </button>
                    )}

                    {canDownload(item) && (
                      <button
                        onClick={() => handleDownload(item.id)}
                        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        title="Download"
                      >
                      <FiDownload size={15} />
                      </button>
                    )}

                    {canDelete(item) && (
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                       <FiTrash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedRequest.activity_title}
                    </h2>
                    <p className="mt-1 text-sm text-blue-100">
                      Super Admin ECA Review
                    </p>
                  </div>

                  <button
                    onClick={closeDetails}
                    className="rounded-full bg-white/20 px-3 py-1 text-xl hover:bg-white/30"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
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

                <TextBlock
                  label="Description"
                  value={selectedRequest.description}
                />
                <TextBlock
                  label="Teacher Note"
                  value={selectedRequest.teacher_note}
                />

                {selectedRequest.status !== "generated" && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                    <h3 className="font-bold text-gray-900">
                      Super Admin Override
                    </h3>

                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    <button
                      onClick={handleOverrideStatus}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      title="Change Status"
                    >
                    <FiSave size={15} />
                    </button>
                  </div>
                )}

                {selectedRequest.status === "generated" && (
                  <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
                    This certificate has already been generated and cannot be
                    deleted or reverted.
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t bg-gray-50 p-5">
                {canGenerate(selectedRequest) && (
                  <button
                    onClick={() => handleGenerate(selectedRequest.id)}
                    className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                  >
                    Generate Certificate
                  </button>
                )}

                {canDownload(selectedRequest) && (
                  <button
                    onClick={() => handleDownload(selectedRequest.id)}
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Download Certificate
                  </button>
                )}

                <button
                  onClick={closeDetails}
                  className="rounded-xl bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                Confirm Delete
              </h2>

              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteTarget.activity_title} 
                </span>
                ?
              </p>

              <p className="mt-2 text-xs text-red-600">
                Only pending or rejected requests can be deleted.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                <FiTrash2 size={13} />
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

const TextBlock = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className="mt-2 text-sm text-gray-700">{value || "N/A"}</p>
  </div>
);
