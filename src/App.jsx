import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Submission from "./pages/Auth/Submission";
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentNotices from "./pages/Student/StudentNotices";
import StudentPayment from "./pages/Student/StudentPayment";
import StudentProfile from "./pages/Student/StudentProfile";
import StudentTestimonial from "./pages/Student/StudentTestimonial"
import StudentConfirmation from "./pages/Student/StudentConfirmation";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/submission" element={<Submission />} />

        <Route path="/student" element={<StudentLayout />}>
          <Route path="profile" element={<StudentProfile />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="payments" element={<StudentPayment />} />
          <Route path="notices" element={<StudentNotices />} />
          <Route path="testimonial" element={<StudentTestimonial />} />
          <Route path="confirmation" element={<StudentConfirmation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
