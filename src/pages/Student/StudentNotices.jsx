import { useEffect, useState } from "react";
import { getStudentNotices } from "../../utils/noticeService";

export default function StudentNotices() {
  const [notices, setNotices] = useState([]);
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
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-semibold">Student Notices</h1>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow p-5 text-sm text-gray-500">
          Loading notices...
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-5 text-sm text-gray-500">
          No notices available for you.
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-xl shadow p-5">
              <h3 className="text-base font-semibold">{notice.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {(notice.audiences || []).join(", ")} • {notice.first_name}{" "}
                {notice.last_name} •{" "}
                {new Date(notice.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
                {notice.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}