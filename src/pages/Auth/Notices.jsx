import { useEffect, useState } from "react";
import {
  createNotice,
  getMyNotices,
  deleteNotice,
} from "../../utils/noticeService";
import {
  FiFileText,
  FiUsers,
  FiCalendar,
  FiEye,
  FiTrash2,
  FiPlusCircle,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";
import { useAuthUser } from "../../store/authstore";

const audienceOptions = [
  "All Students",
  "BSSE 1st Year",
  "BSSE 2nd Year",
  "BSSE 3rd Year",
  "BSSE 4th Year",
  "MSSE 1st Year",
  "MSSE 2nd Year",
];

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

export default function Notices() {
  const authUser = useAuthUser();
  const roleLabel =
    authUser?.role === "teacher"
      ? "Teacher"
      : authUser?.role === "staff"
        ? "Staff"
        : "";

  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const toggleAudience = (option) => {
    setSelectedAudiences((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option],
    );
  };

  const handleDelete = async (noticeToDelete) => {
    if (!noticeToDelete) return;

    const result = await deleteNotice(noticeToDelete.id);

    if (!result.ok) {
      setError(result.message || "Failed to delete notice.");
      return;
    }

    setSuccess("Notice deleted successfully.");
    setSelectedNotice(null);
    setShowModal(false);
    loadMyNotices(); // 🔥 IMPORTANT
  };

  const loadMyNotices = async () => {
    setFetching(true);
    const result = await getMyNotices();

    if (!result.ok) {
      setError(result.message || "Failed to load notices.");
      setFetching(false);
      return;
    }

    setNotices(result.notices || []);
    setFetching(false);
  };

  useEffect(() => {
    loadMyNotices();
  }, []);

  const handlePublish = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !body.trim() || selectedAudiences.length === 0) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const result = await createNotice({
      title: title.trim(),
      body: body.trim(),
      audiences: selectedAudiences,
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.message || "Failed to publish notice.");
      return;
    }

    setSuccess("Notice published successfully.");
    setTitle("");
    setBody("");
    setSelectedAudiences([]);
    loadMyNotices();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-white/90 p-6 shadow border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
              <FiFileText size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {roleLabel} Notices
              </h1>
              <p className="text-sm text-gray-500">
                Create and manage notices for students.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handlePublish}
          className="bg-white rounded-3xl shadow-sm border p-6 space-y-5"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FiPlusCircle />
            Create Notice
          </h2>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <FiAlertCircle />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              <FiCheckCircle />
              {success}
            </div>
          )}

          <label className="flex flex-col text-sm gap-1">
            Title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter notice title"
            />
          </label>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium flex items-center gap-2">
              <FiUsers /> Audience
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {audienceOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer hover:bg-blue-50 transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedAudiences.includes(option)}
                    onChange={() => toggleAudience(option)}
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col text-sm gap-1">
            Details
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="border rounded-xl px-3 py-2 min-h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write the full notice"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            <FiPlusCircle />
            {loading ? "Publishing..." : "Publish Notice"}
          </button>
        </form>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            My Published Notices
          </h2>

          {fetching ? (
            <div className="bg-white rounded-3xl shadow-sm border p-6 text-sm text-gray-500">
              Loading notices...
            </div>
          ) : notices.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border p-6 text-sm text-gray-500">
              No notices published yet.
            </div>
          ) : (
            notices.map((notice) => (
              <div
                key={notice.id}
                className="rounded-3xl bg-white shadow-sm border p-5 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        <FiFileText size={13} />
                        Notice
                      </span>

                      <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                        <FiCalendar size={13} />
                        {formatDate(notice.created_at)}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-gray-900">
                      {notice.title}
                    </h2>

                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-800">
                        Audience:
                      </span>{" "}
                      {(notice.audiences || []).join(", ")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedNotice(notice)}
                      className="flex items-center justify-center gap-2 h-10 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold"
                    >
                      <FiEye size={16} />
                      View
                    </button>

                    <button
                      onClick={() => {
                        setShowModal(true);
                        setNoticeToDelete(notice);
                      }}
                      className="flex items-center justify-center gap-2 h-10 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-semibold"
                    >
                      <FiTrash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {selectedNotice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
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
                      className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1">
                        <FiUsers />
                        Audience
                      </p>
                      <p className="mt-2 text-sm font-medium text-gray-800">
                        {(selectedNotice.audiences || []).join(", ")}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1">
                        <FiCalendar />
                        Published Date
                      </p>
                      <p className="mt-2 text-sm font-medium text-gray-800">
                        {formatDate(selectedNotice.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1">
                      <FiFileText />
                      Notice
                    </p>
                    <div className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700">
                      {selectedNotice.body}
                    </div>
                  </div>
                </div>

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

        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl p-6 w-80 shadow-xl text-center">
              <div className="text-red-600 flex justify-center mb-3">
                <FiAlertCircle size={30} />
              </div>

              <h2 className="text-lg font-bold mb-2">Confirm Delete</h2>

              <p className="text-gray-600 mb-5 text-sm">
                Are you sure you want to delete this notice?
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-100"
                  type="button"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleDelete(noticeToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
