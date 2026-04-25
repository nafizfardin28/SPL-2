import { postJson, getJson, putJson } from "../api/authService";

export const applyTestimonial = ({ purpose, details }) =>
  postJson("/testimonials", { purpose, details });

export const getMyTestimonials = () =>
  getJson("/testimonials/my");

export const getStaffTestimonials = () =>
  getJson("/testimonials/staff");

export const getAdminTestimonials = () =>
  getJson("/testimonials/admin");

export const updateTestimonialStatus = ({ id, status, staffNote }) =>
  putJson(`/testimonials/${id}/status`, { status, staffNote });



export const downloadTestimonial = async (id) => {
  const auth = JSON.parse(localStorage.getItem("academix-auth") || "{}");

  const response = await fetch(
    `http://localhost:5000/api/testimonials/${id}/download`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    }
  );

  if (!response.ok) {
    alert("Failed to download testimonial.");
    return;
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `testimonial-${id}.pdf`;

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};