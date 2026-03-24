import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  const role = localStorage.getItem("role");

  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar
        role={role}
        isOpen={isOpen}
        closeSidebar={closeSidebar}
      />

      <div className="flex-1 flex flex-col">
        <Navbar role={role} toggleSidebar={toggleSidebar} />

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}