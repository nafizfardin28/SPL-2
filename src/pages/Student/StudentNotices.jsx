import { useState } from "react";
const notices = [
  {
    id: 1,
    title: "Midterm Examination Schedule Published",
    date: "10 Feb 2025",
    category: "Examination",
    important: true,
    details:
      "Midterm Examination Date has been published for BSSE 13,14,15,16.Routine attached below.",
  },
  {
    id: 2,
    title: "Semester Fee Payment Deadline Extended",
    date: "05 Feb 2025",
    category: "Finance",
    important: false,
    details:
      "Important update Semester Fee deadline has been extended.Please go to your payment sections for more updates",
  },
  {
    id: 3,
    title: "Class Suspension on 21st February",
    date: "02 Feb 2025",
    category: "General",
    important: true,
    details:
      "As per the decion of University Administration,Classes shall remain closed on 21st February.",
  },
];

export default function Notices() {
  const [showNotice, setShowNotice] = useState(false);
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-semibold">Notices</h1>

      {/* Notices List */}
      {notices.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          No notices available at the moment.
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-lg shadow p-5 flex justify-between items-start"
            >
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {notice.title}
                  {notice.important && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      Important
                    </span>
                  )}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {notice.category} • {notice.date}
                </p>
              </div>

              <button
                onClick={() => setShowNotice(true)}
                className="text-blue-600 text-sm hover:underline"
              >
                View
              </button>
              {showNotice && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                    <h2 className="text-xl font-semibold mb-2">
                      {notice.title}
                    </h2>

                    <p className="text-sm text-gray-500 mb-4">
                      {notice.category} • {notice.date}
                    </p>

                    <p className="text-gray-700 mb-6">
                      {notice.details}
                    </p>

                    <div className="text-right">
                      <button
                        onClick={() => setShowNotice(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
