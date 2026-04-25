import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import ForgotPassword from "./pages/Auth/ForgotPassword";
import Login from "./pages/Auth/Login";
import OtpVerification from "./pages/Auth/OtpVerification";
import Register from "./pages/Auth/Register";
import Submission from "./pages/Auth/Submission";
import Profile from "./pages/Auth/Profile";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";

import StaffDashboard from "./pages/Staff/StaffDashboard";
import StaffTestimonial from "./pages/Staff/StaffTestimonial";

import StudentConfirmation from "./pages/Student/StudentConfirmation";
import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentEcaCertificate from "./pages/Student/StudentECA";
import StudentNotices from "./pages/Student/StudentNotices";
import StudentPayments from "./pages/Student/StudentPayments";
import StudentTestimonial from "./pages/Student/StudentTestimonial";

import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import ECAConfirmation from "./pages/Teacher/ECAConfirmation";

import MainLayout from "./layouts/MainLayout";
import AdminNotices from "./pages/Admin/AdminNotices";
import Notices from "./pages/Auth/Notices";
import AdminTestimonials from "./pages/Admin/AdminTestimonials";
import StudentBudgets from "./pages/Student/StudentBudgets";
import BudgetManagement from "./pages/Auth/Budgets";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/submission" element={<Submission />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="payments" element={<StudentPayments />} />{" "}
          <Route path="notices" element={<StudentNotices />} />
          <Route path="testimonial" element={<StudentTestimonial />} />
          <Route path="confirmation" element={<StudentConfirmation />} />
          <Route path="certificate" element={<StudentEcaCertificate />} />
          <Route path="budgets" element={<StudentBudgets />} />
        </Route>

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="budgetconfirmation" element={<BudgetManagement />} />
          <Route path="ecaconfirmation" element={<ECAConfirmation />} />
          <Route path="notices" element={<Notices />} />

        </Route>

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="staffnotices" element={<Notices />} />
          <Route path="testimonial" element={<StaffTestimonial />} />
          <Route path="staffbudgets" element={<BudgetManagement />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="notices" element={<AdminNotices />} />
          <Route path="testimonials" element = {<AdminTestimonials />} />
         </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
