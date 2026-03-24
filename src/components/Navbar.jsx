import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { logoutAuth } from "../store/authstore";

export default function Navbar({ role, toggleSidebar }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    logoutAuth();
    navigate("/login");
  };

  return (
    <>
      <div className="h-14 bg-white shadow flex items-center justify-between px-6">
        
        <div className="flex items-center gap-4">
        
          <button
            onClick={() => toggleSidebar && toggleSidebar()}   // ✅ FIX
            className="text-2xl font-bold"
          >
            ☰
          </button>

          <span className="font-semibold capitalize">
            {role} Dashboard
          </span>
        </div>

        {/* ❌ Removed empty button */}
        
        <button
          className="text-red-600 flex items-center gap-1 hover:text-red-800"
          onClick={() => setShowModal(true)}
        >
          <FiLogOut className="text-lg" />
          Logout
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                No
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}