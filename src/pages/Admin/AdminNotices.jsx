import { useEffect, useState } from "react";
import { getAdminNotices } from "../../utils/noticeService";

const NoticeSection = ({ title, notices }) => {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>

      {notices.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-5 text-sm text-gray-500">
          No notices found.
        </div>
      ) : (
        notices.map((notice) => (
          <div key={notice.id} className="bg-white rounded-xl shadow p-5">
            <h3 className="text-base font-semibold">{notice.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {(notice.audiences || []).join(", ")} • {notice.first_name}{" "}
              {notice.last_name} • {notice.email} •{" "}
              {new Date(notice.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
              {notice.body}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default function AdminNotices() {
  const [teacherNotices, setTeacherNotices] = useState([]);
  const [staffNotices, setStaffNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAdminNotices = async () => {
      setLoading(true);

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

    loadAdminNotices();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl">
      <h1 className="text-2xl font-semibold">Notice Oversight</h1>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow p-5 text-sm text-gray-500">
          Loading notices...
        </div>
      ) : (
        <>
          <NoticeSection title="Teacher Notices" notices={teacherNotices} />
          <NoticeSection title="Staff Notices" notices={staffNotices} />
        </>
      )}
    </div>
  );
}