import { postJson, getJson, putJson } from "../api/authService";

export const getMyPayments = () =>
  getJson("/payments/my");

export const getPaymentById = (id) =>
  getJson(`/payments/${id}`);

export const startPayment = ({ id, method, mobileNumber }) =>
  postJson(`/payments/${id}/start`, { method, mobileNumber });

export const confirmPayment = ({ id, otp, pin }) =>
  postJson(`/payments/${id}/confirm`, { otp, pin });

export const downloadReceipt = async (id) => {
  const auth = JSON.parse(localStorage.getItem("academix-auth") || "{}");

  const response = await fetch(
    `http://localhost:5000/api/payments/${id}/receipt`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    }
  );

  if (!response.ok) {
    alert("Failed to download receipt.");
    return;
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `academix-receipt-${id}.pdf`;

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};