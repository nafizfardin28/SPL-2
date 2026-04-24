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

export const getMyPayments = () =>
  getJson("/payments/my");

export const getPaymentById = (id) =>
  getJson(`/payments/${id}`);

export const startPayment = ({ id, method, mobileNumber }) =>
  postJson(`/payments/${id}/start`, { method, mobileNumber });

export const confirmPayment = ({ id, otp, pin }) =>
  postJson(`/payments/${id}/confirm`, { otp, pin });