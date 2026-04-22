import { useEffect, useState } from "react";
import { createNotice, getMyNotices } from "../../utils/noticeService";

const audienceOptions = [
  "All Students",
  "BSSE 1st Year",
  "BSSE 2nd Year",
  "BSSE 3rd Year",
  "BSSE 4th Year",
];

export default function StaffNotices() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const toggleAudience = (option) => {
    setSelectedAudiences((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
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
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-semibold">Staff Notices</h1>

      <form
        onSubmit={handlePublish}
        className="bg-white rounded-xl shadow p-5 space-y-4"
      >
        <h2 className="text-lg font-medium">Create Notice</h2>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </div>
        )}

        <label className="flex flex-col text-sm gap-1">
          Title
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="border rounded px-3 py-2"
            placeholder="Enter notice title"
          />
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Audience</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {audienceOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 border rounded px-3 py-2 cursor-pointer"
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
            className="border rounded px-3 py-2 min-h-28"
            placeholder="Write the full notice"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish Notice"}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">My Published Notices</h2>

        {fetching ? (
          <div className="bg-white rounded-xl shadow p-5 text-sm text-gray-500">
            Loading notices...
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-5 text-sm text-gray-500">
            No notices published yet.
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-xl shadow p-5">
              <h3 className="text-base font-semibold">{notice.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {(notice.audiences || []).join(", ")} •{" "}
                {new Date(notice.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
                {notice.body}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}