export default function TeacherDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Teacher Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <p>Pending Requests</p>
          <h2 className="text-2xl font-bold">5</h2>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p>Approved</p>
          <h2 className="text-2xl font-bold">20</h2>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p>Rejected</p>
          <h2 className="text-2xl font-bold">2</h2>
        </div>
      </div>
    </div>
  );
}