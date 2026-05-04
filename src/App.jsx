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
import AdminTestimonials from "./pages/Admin/AdminTestimonials";
import AdminBudgetManagement from "./pages/Admin/AdminBudgets";
import AdminEcaCertificates from "./pages/Admin/AdminEcaCertificates";


import StaffTestimonial from "./pages/Staff/StaffTestimonial";
import StaffAllocatePayments from "./pages/Staff/StaffAllocatePayments";

import StudentSemesterFees from "./pages/Student/StudentSemesterFees";

import StudentEcaCertificate from "./pages/Student/StudentECA";
import StudentNotices from "./pages/Student/StudentNotices";
import StudentPayments from "./pages/Student/StudentPayments";
import StudentTestimonial from "./pages/Student/StudentTestimonial";

import ECAConfirmation from "./pages/Teacher/ECAConfirmation";

import MainLayout from "./layouts/MainLayout";
import AdminNotices from "./pages/Admin/AdminNotices";
import Notices from "./pages/Auth/Notices";

import StudentBudgets from "./pages/Student/StudentBudgets";
import BudgetManagement from "./pages/Auth/Budgets";
import AdminSemesterPayments from "./pages/Admin/AdminSemesterPayments";

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

          <Route path="profile" element={<Profile />} />
          <Route path="payments" element={<StudentPayments />} />{" "}
          <Route path="semester-fees" element={<StudentSemesterFees />} />
          <Route path="notices" element={<StudentNotices />} />
          <Route path="testimonial" element={<StudentTestimonial />} />
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
          <Route path="profile" element={<Profile />} />
          <Route path="staffnotices" element={<Notices />} />
          <Route path="allocate-payments" element={<StaffAllocatePayments />} />
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
          <Route path="semesterfees" element={<AdminSemesterPayments />} />
          <Route path="testimonials" element = {<AdminTestimonials />} />
          <Route path="budgets" element={<AdminBudgetManagement />} />
          <Route path="eca-certificates" element={<AdminEcaCertificates />} />
         </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
