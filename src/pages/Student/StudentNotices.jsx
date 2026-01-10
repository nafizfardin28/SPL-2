const notices = [
  {
    id: 1,
    title: "Midterm Examination Schedule Published",
    date: "10 Feb 2025",
    category: "Examination",
    important: true,
  },
  {
    id: 2,
    title: "Semester Fee Payment Deadline Extended",
    date: "05 Feb 2025",
    category: "Finance",
    important: false,
  },
  {
    id: 3,
    title: "Class Suspension on 21st February",
    date: "02 Feb 2025",
    category: "General",
    important: true,
  },
];

export default function Notices() {
  const handleClick = () => {

  }
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Title */}
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

              <button onClick={handleClick}
              className="text-blue-600 text-sm hover:underline">
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
