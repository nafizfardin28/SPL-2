import { useEffect, useState } from "react";
import { getStudentNotices } from "../../utils/noticeService";

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

export default function StudentNotices() {
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotices = async () => {
      setLoading(true);

      const result = await getStudentNotices();

      if (!result.ok) {
        setError(result.message || "Failed to load notices.");
        setLoading(false);
        return;
      }

      setNotices(result.notices || []);
      setLoading(false);
    };

    loadNotices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-white shadow-lg border border-gray-100 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Student Notices</h1>
          <p className="mt-2 text-sm text-gray-500">
            View notices published for your batch or for all students.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {/* Loading / Empty / Notice List */}
        {loading ? (
          <div className="rounded-3xl bg-white shadow-lg border border-gray-100 p-6 text-sm text-gray-500">
            Loading notices...
          </div>
        ) : notices.length === 0 ? (
          <div className="rounded-3xl bg-white shadow-lg border border-gray-100 p-6 text-sm text-gray-500">
            No notices available for you.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="group rounded-3xl bg-white shadow-md border border-gray-100 p-5 transition hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        Notice
                      </span>
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {formatDate(notice.created_at)}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-gray-900">
                      {notice.title}
                    </h2>

                    <div className="flex flex-col gap-2 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold text-gray-800">
                          Audience:
                        </span>{" "}
                        {(notice.audiences || []).join(", ")}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-800">
                          Published by:
                        </span>{" "}
                        {notice.first_name} {notice.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="md:pt-1">
                    <button
                      onClick={() => setSelectedNotice(notice)}
                      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              {/* Modal header */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 px-6 py-5 text-white">
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

              {/* Modal body */}
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

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Published By
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-800">
                      {selectedNotice.first_name} {selectedNotice.last_name}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Notice 
                  </p>
                  <div className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700">
                    {selectedNotice.body}
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-6 py-4">
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
      </div>
    </div>
  );
}

