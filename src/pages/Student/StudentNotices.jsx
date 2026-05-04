import { useEffect, useState } from "react";
import { getStudentNotices } from "../../utils/noticeService";
import {
  FiBell,
  FiFileText,
  FiEye,
  FiCalendar,
  FiUsers,
  FiUser,
  FiX,
  FiInbox,
  FiAlertCircle,
  FiCheckCircle,
  FiMessageSquare,
} from "react-icons/fi";

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
    <div className="min-h-screen bg-[#f6f8fc] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <FiBell className="text-sm" />
                Student Notice Board
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Student Notices
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                View important notices published for your batch or all students.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-xs font-medium text-slate-500">
                Total Notices
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {notices.length}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 shadow-sm">
            <FiAlertCircle className="text-lg" />
            {error}
          </div>
        )}

        {/* Loading / Empty / Notice List */}
        {loading ? (
          <div className="rounded-[2rem] border border-white/70 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="text-sm font-medium text-slate-500">
              Loading notices...
            </p>
          </div>
        ) : notices.length === 0 ? (
          <div className="rounded-[2rem] border border-white/70 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FiInbox className="text-2xl" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              No notices available
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              You do not have any published notices right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="group rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                      <FiFileText className="text-xl" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <FiCheckCircle />
                          Published
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          <FiCalendar />
                          {formatDate(notice.created_at)}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold tracking-tight text-slate-950">
                        {notice.title}
                      </h2>

                      <div className="flex flex-col gap-2 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <FiUsers className="text-blue-600" />
                          <span>
                            <span className="font-semibold text-slate-800">
                              Audience:
                            </span>{" "}
                            {(notice.audiences || []).join(", ")}
                          </span>
                        </p>

                        <p className="flex items-center gap-2">
                          <FiUser className="text-indigo-600" />
                          <span>
                            <span className="font-semibold text-slate-800">
                              Published by:
                            </span>{" "}
                            {notice.first_name} {notice.last_name}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedNotice(notice)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30"
                  >
                    <FiEye />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 px-6 py-6 text-white">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-50">
                      <FiFileText />
                      Notice Details
                    </p>

                    <h3 className="mt-4 text-2xl font-bold tracking-tight">
                      {selectedNotice.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl transition hover:bg-white/25"
                  >
                    <FiX />
                  </button>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <FiUsers />
                      Audience
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {(selectedNotice.audiences || []).join(", ")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <FiCalendar />
                      Published Date
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {formatDate(selectedNotice.created_at)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <FiUser />
                      Published By
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {selectedNotice.first_name} {selectedNotice.last_name}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <FiMessageSquare />
                    Notice
                  </p>

                  <div className="mt-4 whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                    {selectedNotice.body}
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <FiX />
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
