import { useEffect, useState } from "react";
import { getAdminNotices, deleteNotice } from "../../utils/noticeService";

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const NoticeCard = ({ notice, onView, onDelete }) => {
  return (
    <div className="group rounded-3xl bg-white shadow-md border border-gray-100 p-5 transition hover:shadow-xl hover:-translate-y-0.5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Notice
            </span>
            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {formatDate(notice.created_at)}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-900">{notice.title}</h3>

          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <p>
              <span className="font-semibold text-gray-800">Audience:</span>{" "}
              {(notice.audiences || []).join(", ")}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Published by:</span>{" "}
              {notice.first_name} {notice.last_name}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Email:</span>{" "}
              {notice.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            onClick={() => onView(notice)}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            View Details
          </button>

          <button
            onClick={() => onDelete(notice)}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const NoticeSection = ({ title, notices, onView, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          {notices.length} Notice{notices.length !== 1 ? "s" : ""}
        </span>
      </div>

      {notices.length === 0 ? (
        <div className="rounded-3xl bg-white shadow-lg border border-gray-100 p-6 text-sm text-gray-500">
          No notices found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onView={onView}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdminNotices() {
  const [teacherNotices, setTeacherNotices] = useState([]);
  const [staffNotices, setStaffNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAdminNotices = async () => {
    setLoading(true);
    setError("");

    const result = await getAdminNotices();

    if (!result.ok) {
      setError(result.message || "Failed to load notices.");
      setLoading(false);
      return;
    }

    setTeacherNotices(result.teacherNotices || []);
    setStaffNotices(result.staffNotices || []);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminNotices();
  }, []);

  const handleDeleteNotice = async () => {
    if (!noticeToDelete) return;

    setDeleteLoading(true);
    setError("");
    setSuccess("");

    const result = await deleteNotice(noticeToDelete.id);

    setDeleteLoading(false);

    if (!result.ok) {
      setError(result.message || "Failed to delete notice.");
      return;
    }

    setSuccess("Notice deleted successfully.");
    setNoticeToDelete(null);
    setSelectedNotice(null);
    loadAdminNotices();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="rounded-3xl bg-white shadow-lg border border-gray-100 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Notice Oversight</h1>
          <p className="mt-2 text-sm text-gray-500">
            Monitor all circulated notices from teachers and staff.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
            {success}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="rounded-3xl bg-white shadow-lg border border-gray-100 p-6 text-sm text-gray-500">
            Loading notices...
          </div>
        ) : (
          <>
            <NoticeSection
              title="Teacher Notices"
              notices={teacherNotices}
              onView={setSelectedNotice}
              onDelete={setNoticeToDelete}
            />

            <NoticeSection
              title="Staff Notices"
              notices={staffNotices}
              onView={setSelectedNotice}
              onDelete={setNoticeToDelete}
            />
          </>
        )}

        {/* Details Modal */}
        {selectedNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                      Notice Details
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">
                      {selectedNotice.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="rounded-full bg-white/15 px-3 py-1 text-xl leading-none transition hover:bg-white/25"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Audience
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-800">
                      {(selectedNotice.audiences || []).join(", ")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Published Date
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-800">
                      {formatDate(selectedNotice.created_at)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Published By
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-800">
                      {selectedNotice.first_name} {selectedNotice.last_name}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Publisher Email
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-800">
                      {selectedNotice.email}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Notice Body
                  </p>
                  <div className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700">
                    {selectedNotice.body}
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                <button
                  onClick={() => setNoticeToDelete(selectedNotice)}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Delete Notice
                </button>

                <button
                  onClick={() => setSelectedNotice(null)}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {noticeToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900">
                Delete Notice
              </h3>
              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to delete this notice?
              </p>

              <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  {noticeToDelete.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(noticeToDelete.created_at)}
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setNoticeToDelete(null)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteNotice}
                  disabled={deleteLoading}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}